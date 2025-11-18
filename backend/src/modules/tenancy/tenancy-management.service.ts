import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../database/data-source';
import { Tenant } from '../../database/entities/tenant.entity';
import { Branch } from '../../database/entities/branch.entity';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { User } from '../../database/entities/user.entity';
import { buildPaginated, toPagination, PaginationOptions } from '../common/pagination';
import {
  CreateTenantInput,
  UpdateTenantInput,
  CreateTenantAdminInput
} from './tenancy-management.schemas';
import {
  DEFAULT_PERMISSIONS,
  ROLE_NAME_MAP,
  ROLE_PERMISSION_MAP
} from './tenancy.constants';

export class TenancyManagementService {
  private tenantRepository = AppDataSource.getRepository(Tenant);
  private branchRepository = AppDataSource.getRepository(Branch);
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);
  private permissionRepository = AppDataSource.getRepository(Permission);

  async listTenants(options: PaginationOptions = {}, search?: string) {
    const pagination = toPagination(options);
    const query = this.tenantRepository
      .createQueryBuilder('tenant')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('tenant.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(tenant.name ILIKE :search OR tenant.code ILIKE :search OR tenant.contactEmail ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query.getManyAndCount();
    return buildPaginated(data, total, pagination);
  }

  async getTenant(id: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['branches']
    });
    if (!tenant) {
      throw Object.assign(new Error('Tenant not found'), { status: 404 });
    }
    return tenant;
  }

  async getTenantDetails(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw Object.assign(new Error('Tenant not found'), { status: 404 });
    }

    // Get all users for this tenant
    const users = await this.userRepository.find({
      where: { tenantId: id },
      relations: ['roles', 'roles.permissions', 'branch'],
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'status', 'lastLoginAt', 'createdAt']
    });

    // Get all roles for this tenant
    const roles = await this.roleRepository.find({
      where: { tenantId: id },
      relations: ['permissions'],
      order: { name: 'ASC' }
    });

    // Get all permissions for this tenant
    const permissions = await this.permissionRepository.find({
      where: { tenantId: id },
      order: { resource: 'ASC', action: 'ASC' }
    });

    return {
      tenant,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        roles: user.roles?.map((role) => ({
          id: role.id,
          name: role.name,
          slug: role.slug
        })) || [],
        branch: user.branch ? {
          id: user.branch.id,
          name: user.branch.name,
          code: user.branch.code
        } : null
      })),
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        slug: role.slug,
        isSystem: role.isSystem,
        permissions: role.permissions?.map((perm) => ({
          id: perm.id,
          name: perm.name,
          resource: perm.resource,
          action: perm.action
        })) || []
      })),
      permissions: permissions.map((perm) => ({
        id: perm.id,
        name: perm.name,
        resource: perm.resource,
        action: perm.action
      }))
    };
  }

  async createTenant(payload: CreateTenantInput) {
    // Check if tenant code already exists
    const existing = await this.tenantRepository.findOne({ where: { code: payload.code } });
    if (existing) {
      throw Object.assign(new Error('Tenant code already exists'), { status: 400 });
    }

    return AppDataSource.transaction(async (manager) => {
      const tenantRepo = manager.getRepository(Tenant);
      const branchRepo = manager.getRepository(Branch);
      const permissionRepo = manager.getRepository(Permission);
      const roleRepo = manager.getRepository(Role);

      // Create tenant with features in config
      const tenant = tenantRepo.create({
        name: payload.name,
        code: payload.code,
        contactEmail: payload.contactEmail ?? null,
        contactPhone: payload.contactPhone ?? null,
        config: {
          features: payload.features || []
        },
        isActive: true
      });
      await tenantRepo.save(tenant);

      // Create default branch
      const branch = branchRepo.create({
        tenantId: tenant.id,
        branchId: null,
        name: `${payload.name} HQ`,
        code: `${payload.code}-hq`,
        address: null,
        timezone: 'UTC',
        isPrimary: true,
        isActive: true,
        syncState: 'pending'
      });
      await branchRepo.save(branch);

      // Create permissions
      const permissions = [];
      for (const permission of DEFAULT_PERMISSIONS) {
        const entity = permissionRepo.create({
          tenantId: tenant.id,
          branchId: null,
          name: `${permission.resource}:${permission.action}`,
          resource: permission.resource,
          action: permission.action,
          syncState: 'pending'
        });
        permissions.push(await permissionRepo.save(entity));
      }

      // Create roles
      const roles: Record<string, Role> = {};
      for (const [roleKey, perms] of Object.entries(ROLE_PERMISSION_MAP)) {
        const role = roleRepo.create({
          tenantId: tenant.id,
          branchId: null,
          name: ROLE_NAME_MAP[roleKey as keyof typeof ROLE_NAME_MAP],
          slug: roleKey,
          isSystem: true,
          syncState: 'pending'
        });
        role.permissions = permissions.filter((permission) =>
          perms.some(
            (perm) =>
              perm.resource === permission.resource && perm.action === permission.action
          )
        );
        roles[roleKey] = await roleRepo.save(role);
      }

      // Create admin user if provided
      if (payload.adminUser) {
        const userRepo = manager.getRepository(User);
        const existingUser = await userRepo.findOne({
          where: { email: payload.adminUser.email, tenantId: tenant.id }
        });
        if (existingUser) {
          throw Object.assign(new Error('User with this email already exists'), { status: 400 });
        }

        const passwordHash = await bcrypt.hash(payload.adminUser.password, 12);
        const adminUser = userRepo.create({
          tenantId: tenant.id,
          branchId: branch.id,
          email: payload.adminUser.email,
          passwordHash,
          firstName: payload.adminUser.firstName,
          lastName: payload.adminUser.lastName,
          phone: payload.adminUser.phone ?? null,
          status: 'active',
          roles: [roles.admin],
          syncState: 'pending'
        });
        await userRepo.save(adminUser);
      }

      return tenant;
    });
  }

  async updateTenant(id: string, payload: UpdateTenantInput) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw Object.assign(new Error('Tenant not found'), { status: 404 });
    }

    if (payload.code && payload.code !== tenant.code) {
      const existing = await this.tenantRepository.findOne({ where: { code: payload.code } });
      if (existing) {
        throw Object.assign(new Error('Tenant code already exists'), { status: 400 });
      }
      tenant.code = payload.code;
    }

    if (payload.name) tenant.name = payload.name;
    if (payload.contactEmail !== undefined) tenant.contactEmail = payload.contactEmail;
    if (payload.contactPhone !== undefined) tenant.contactPhone = payload.contactPhone;
    if (payload.features !== undefined) {
      tenant.config = { ...tenant.config, features: payload.features };
    }

    return this.tenantRepository.save(tenant);
  }

  async deleteTenant(id: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw Object.assign(new Error('Tenant not found'), { status: 404 });
    }
    await this.tenantRepository.remove(tenant);
    return { id };
  }

  async createTenantAdmin(tenantId: string, payload: CreateTenantAdminInput) {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw Object.assign(new Error('Tenant not found'), { status: 404 });
    }

    const branch = await this.branchRepository.findOne({
      where: { tenantId, isPrimary: true }
    });
    if (!branch) {
      throw Object.assign(new Error('Primary branch not found'), { status: 404 });
    }

    const adminRole = await this.roleRepository.findOne({
      where: { tenantId, slug: 'admin' }
    });
    if (!adminRole) {
      throw Object.assign(new Error('Admin role not found'), { status: 404 });
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: payload.email, tenantId }
    });
    if (existingUser) {
      throw Object.assign(new Error('User already exists'), { status: 400 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const user = this.userRepository.create({
      tenantId,
      branchId: branch.id,
      email: payload.email,
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone ?? null,
      status: 'active',
      roles: [adminRole],
      syncState: 'pending'
    });

    return this.userRepository.save(user);
  }

  async getAvailableFeatures() {
    // Return list of available features that can be allocated to tenants
    return [
      'pos',
      'inventory',
      'reports',
      'multi-branch',
      'offline-mode',
      'advanced-analytics',
      'api-access',
      'custom-reports',
      'integrations',
      'white-label'
    ];
  }
}

