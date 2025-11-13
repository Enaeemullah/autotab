import bcrypt from 'bcryptjs';
import { In } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { buildPaginated, toPagination, PaginationOptions } from '../common/pagination';
import { CreateUserInput, UpdateUserInput } from './user.schemas';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);

  async list(tenantId: string, options: PaginationOptions = {}, search?: string) {
    const pagination = toPagination(options);
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('user.roles', 'roles')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query.getManyAndCount();
    return buildPaginated(data, total, pagination);
  }

  async create(tenantId: string, payload: CreateUserInput) {
    const hash = await bcrypt.hash(payload.password, 12);
    const roles = payload.roleIds?.length
      ? await this.roleRepository.find({
          where: { id: In(payload.roleIds), tenantId }
        })
      : [];

    const user = this.userRepository.create({
      tenantId,
      branchId: payload.branchId ?? null,
      email: payload.email,
      passwordHash: hash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      roles,
      syncState: 'pending'
    });

    return this.userRepository.save(user);
  }

  async update(tenantId: string, id: string, payload: UpdateUserInput) {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['roles']
    });
    if (!user) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    if (payload.password) {
      user.passwordHash = await bcrypt.hash(payload.password, 12);
    }
    if (payload.firstName) user.firstName = payload.firstName;
    if (payload.lastName) user.lastName = payload.lastName;
    if (payload.email) user.email = payload.email;
    if (payload.branchId !== undefined) user.branchId = payload.branchId;

    if (payload.roleIds) {
      user.roles =
        payload.roleIds.length > 0
          ? await this.roleRepository.find({
              where: { id: In(payload.roleIds), tenantId }
            })
          : [];
    }

    user.syncState = 'pending';

    return this.userRepository.save(user);
  }

  async remove(tenantId: string, id: string) {
    const user = await this.userRepository.findOne({ where: { id, tenantId } });
    if (!user) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }
    await this.userRepository.remove(user);
    return { id };
  }
}
