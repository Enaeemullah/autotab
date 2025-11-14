import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dayjs, { ManipulateType } from 'dayjs';
import { Role } from '../../database/entities/role.entity';
import { AppDataSource } from '../../database/data-source';
import { Tenant } from '../../database/entities/tenant.entity';
import { User } from '../../database/entities/user.entity';
import { env } from '../../config/environment';
import { LoginInput } from './auth.schemas';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

type ExpiryUnitShorthand = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y';

const JWT_EXPIRY_REGEX = /^(\d+)(ms|s|m|h|d|w|y)$/i;
const EXPIRY_UNIT_MAP: Record<ExpiryUnitShorthand, ManipulateType> = {
  ms: 'millisecond',
  s: 'second',
  m: 'minute',
  h: 'hour',
  d: 'day',
  w: 'week',
  y: 'year'
};

function resolveExpiry(value: string): { amount: number; unit: ManipulateType } {
  const trimmed = value.trim();
  const match = JWT_EXPIRY_REGEX.exec(trimmed);

  if (match) {
    const [, amount, shorthandUnit] = match;
    const unit = EXPIRY_UNIT_MAP[shorthandUnit.toLowerCase() as ExpiryUnitShorthand];
    return { amount: Number(amount), unit };
  }

  const numericValue = Number(trimmed);
  if (!Number.isNaN(numericValue) && numericValue >= 0) {
    return { amount: numericValue, unit: 'second' };
  }

  throw new Error(
    `Invalid JWT expiry format: "${value}". Use formats like "15m", "7d", or provide the total seconds.`
  );
}

function calculateExpiryTimestamp(expiry: string): number {
  const { amount, unit } = resolveExpiry(expiry);
  return dayjs().add(amount, unit).unix();
}

export class AuthService {
  private tenantRepository = AppDataSource.getRepository(Tenant);
  private userRepository = AppDataSource.getRepository(User);

  async validateCredentials(input: LoginInput) {
    const tenant = await this.tenantRepository.findOne({ where: { code: input.tenantCode } });
    if (!tenant) {
      throw Object.assign(new Error('Tenant not found'), { status: 404 });
    }
    const user = await this.userRepository.findOne({
      where: { email: input.email, tenantId: tenant.id },
      relations: ['roles', 'roles.permissions']
    });
    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }
    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }
    return { tenant, user };
  }

  generateTokens(payload: {
    user: User;
    tenantId: string;
    branchId?: string | null;
    roles: Role[];
  }): AuthTokens {
    const roles = payload.roles.map((role) => role.slug);
    const permissions = payload.roles
      .flatMap((role) => role.permissions?.map((perm) => `${perm.resource}:${perm.action}`) ?? [])
      .filter((value, index, array) => array.indexOf(value) === index);

    const jwtPayload = {
      sub: payload.user.id,
      tenantId: payload.tenantId,
      branchId: payload.branchId,
      roles,
      permissions
    };

    const accessToken = jwt.sign(jwtPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY });
    const refreshToken = jwt.sign(jwtPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRY
    });

    const expiresIn = calculateExpiryTimestamp(env.JWT_EXPIRY);
    const refreshExpiresIn = calculateExpiryTimestamp(env.JWT_REFRESH_EXPIRY);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresIn
    };
  }

  async login(input: LoginInput) {
    const { tenant, user } = await this.validateCredentials(input);
    const branchId = input.branchId ?? user.branchId ?? null;
    const roles = user.roles ?? [];
    const tokens = this.generateTokens({ user, tenantId: tenant.id, branchId, roles });

    await this.userRepository.update(user.id, { lastLoginAt: new Date(), syncState: 'pending' });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: roles.map((role) => role.slug),
        permissions: roles
          .flatMap((role) => role.permissions?.map((perm) => `${perm.resource}:${perm.action}`) ?? [])
          .filter((value, index, array) => array.indexOf(value) === index)
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        code: tenant.code
      },
      branchId,
      tokens
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        sub: string;
        tenantId: string;
        branchId?: string | null;
      };
      const user = await this.userRepository.findOne({
        where: { id: payload.sub, tenantId: payload.tenantId },
        relations: ['roles', 'roles.permissions']
      });
      if (!user) {
        throw Object.assign(new Error('User not found'), { status: 404 });
      }
      const tokens = this.generateTokens({
        user,
        tenantId: payload.tenantId,
        branchId: payload.branchId,
        roles: user.roles ?? []
      });
      return {
        tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      };
    } catch (error) {
      throw Object.assign(new Error('Invalid refresh token'), { status: 401, details: error });
    }
  }
}
