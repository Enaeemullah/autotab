import { In } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { buildPaginated, toPagination, PaginationOptions } from '../common/pagination';
import { CreateRoleInput, UpdateRoleInput } from './role.schemas';

export class RoleService {
  private roleRepository = AppDataSource.getRepository(Role);
  private permissionRepository = AppDataSource.getRepository(Permission);

  async list(tenantId: string, options: PaginationOptions = {}, search?: string) {
    const pagination = toPagination(options);
    const query = this.roleRepository
      .createQueryBuilder('role')
      .where('role.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('role.permissions', 'permissions')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('role.createdAt', 'DESC');

    if (search) {
      query.andWhere('(role.name ILIKE :search OR role.slug ILIKE :search)', {
        search: `%${search}%`
      });
    }

    const [data, total] = await query.getManyAndCount();
    return buildPaginated(data, total, pagination);
  }

  async listPermissions(tenantId: string) {
    return this.permissionRepository.find({ where: { tenantId } });
  }

  async create(tenantId: string, payload: CreateRoleInput) {
    const permissions = payload.permissionIds?.length
      ? await this.permissionRepository.find({
          where: { id: In(payload.permissionIds), tenantId }
        })
      : [];

    const role = this.roleRepository.create({
      tenantId,
      branchId: null,
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      permissions,
      syncState: 'pending'
    });

    return this.roleRepository.save(role);
  }

  async update(tenantId: string, id: string, payload: UpdateRoleInput) {
    const role = await this.roleRepository.findOne({
      where: { id, tenantId },
      relations: ['permissions']
    });
    if (!role) {
      throw Object.assign(new Error('Role not found'), { status: 404 });
    }

    if (payload.name) role.name = payload.name;
    if (payload.slug) role.slug = payload.slug;
    if (payload.description !== undefined) role.description = payload.description ?? null;
    if (payload.permissionIds) {
      role.permissions =
        payload.permissionIds.length > 0
          ? await this.permissionRepository.find({
              where: { id: In(payload.permissionIds), tenantId }
            })
          : [];
    }
    role.syncState = 'pending';

    return this.roleRepository.save(role);
  }

  async remove(tenantId: string, id: string) {
    const role = await this.roleRepository.findOne({ where: { id, tenantId } });
    if (!role) {
      throw Object.assign(new Error('Role not found'), { status: 404 });
    }
    await this.roleRepository.remove(role);
    return { id };
  }
}
