import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../database/data-source';
import { Tenant } from '../../database/entities/tenant.entity';
import { Branch } from '../../database/entities/branch.entity';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { User } from '../../database/entities/user.entity';
import { registerTenantSchema } from './tenancy.schemas';

const DEFAULT_PERMISSIONS = [
  { resource: 'users', action: 'read' },
  { resource: 'users', action: 'create' },
  { resource: 'users', action: 'update' },
  { resource: 'users', action: 'delete' },
  { resource: 'roles', action: 'read' },
  { resource: 'roles', action: 'create' },
  { resource: 'roles', action: 'update' },
  { resource: 'roles', action: 'delete' },
  { resource: 'products', action: 'read' },
  { resource: 'products', action: 'create' },
  { resource: 'products', action: 'update' },
  { resource: 'products', action: 'delete' },
  { resource: 'suppliers', action: 'read' },
  { resource: 'suppliers', action: 'create' },
  { resource: 'inventory', action: 'read' },
  { resource: 'inventory', action: 'create' },
  { resource: 'sales', action: 'read' },
  { resource: 'sales', action: 'create' },
  { resource: 'reports', action: 'read' },
  { resource: 'settings', action: 'read' },
  { resource: 'settings', action: 'update' },
  { resource: 'sync', action: 'read' },
  { resource: 'sync', action: 'write' }
];

const ROLE_PERMISSION_MAP: Record<string, Array<{ resource: string; action: string }>> = {
  admin: DEFAULT_PERMISSIONS,
  manager: DEFAULT_PERMISSIONS.filter(
    (permission) =>
      !['users:delete', 'roles:delete', 'settings:update', 'sync:write'].includes(
        `${permission.resource}:${permission.action}`
      )
  ),
  cashier: [
    { resource: 'sales', action: 'read' },
    { resource: 'sales', action: 'create' },
    { resource: 'products', action: 'read' },
    { resource: 'inventory', action: 'read' },
    { resource: 'reports', action: 'read' }
  ]
};

export class TenancyService {
  async register(payload: unknown) {
    const parsed = registerTenantSchema.parse(payload);
    return AppDataSource.transaction(async (manager) => {
      const tenantRepo = manager.getRepository(Tenant);
      const branchRepo = manager.getRepository(Branch);
      const permissionRepo = manager.getRepository(Permission);
      const roleRepo = manager.getRepository(Role);
      const userRepo = manager.getRepository(User);

      const tenant = tenantRepo.create({
        name: parsed.tenant.name,
        code: parsed.tenant.code,
        contactEmail: parsed.tenant.contactEmail ?? null,
        contactPhone: parsed.tenant.contactPhone ?? null,
        config: {},
        isActive: true
      });
      await tenantRepo.save(tenant);

      const branch = branchRepo.create({
        tenantId: tenant.id,
        branchId: null,
        name: parsed.branch.name,
        code: parsed.branch.code,
        address: parsed.branch.address ?? null,
        timezone: parsed.branch.timezone,
        isPrimary: true,
        isActive: true,
        syncState: 'pending'
      });
      await branchRepo.save(branch);

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

      const roles: Record<string, Role> = {};
      for (const [roleKey, perms] of Object.entries(ROLE_PERMISSION_MAP)) {
        const role = roleRepo.create({
          tenantId: tenant.id,
          branchId: null,
          name: roleKey === 'admin' ? 'Administrator' : roleKey === 'manager' ? 'Manager' : 'Cashier',
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

      const passwordHash = await bcrypt.hash(parsed.adminUser.password, 12);
      const adminUser = userRepo.create({
        tenantId: tenant.id,
        branchId: branch.id,
        email: parsed.adminUser.email,
        passwordHash,
        firstName: parsed.adminUser.firstName,
        lastName: parsed.adminUser.lastName,
        phone: parsed.adminUser.phone ?? null,
        status: 'active',
        roles: [roles.admin],
        syncState: 'pending'
      });
      await userRepo.save(adminUser);

      return {
        tenant: { id: tenant.id, name: tenant.name, code: tenant.code },
        branch: { id: branch.id, name: branch.name, code: branch.code },
        adminUser: { id: adminUser.id, email: adminUser.email }
      };
    });
  }

  async listBranches(tenantId: string) {
    return AppDataSource.getRepository(Branch).find({
      where: { tenantId },
      order: { name: 'ASC' }
    });
  }
}
