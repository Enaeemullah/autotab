import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource, initDataSource } from '../data-source';
import { Tenant } from '../entities/tenant.entity';
import { Branch } from '../entities/branch.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import {
  DEFAULT_PERMISSIONS,
  ROLE_NAME_MAP,
  ROLE_PERMISSION_MAP,
  RoleSlug
} from '../../modules/tenancy/tenancy.constants';

type TestUserSeed = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: RoleSlug;
};

const TEST_TENANT = {
  name: 'Demo Retail Co.',
  code: 'demo-retail',
  contactEmail: 'owner@demo-retail.test',
  contactPhone: '+15550000000'
} as const;

const TEST_BRANCH = {
  name: 'Demo HQ',
  code: 'demo-hq',
  address: '123 Market Street',
  timezone: 'UTC'
} as const;

const TEST_USERS: TestUserSeed[] = [
  {
    email: 'admin@demo-retail.test',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    phone: '+15550000001'
  },
  {
    email: 'manager@demo-retail.test',
    password: 'Manager123!',
    firstName: 'Store',
    lastName: 'Manager',
    role: 'manager',
    phone: '+15550000002'
  },
  {
    email: 'cashier@demo-retail.test',
    password: 'Cashier123!',
    firstName: 'Point',
    lastName: 'Cashier',
    role: 'cashier',
    phone: '+15550000003'
  }
];

async function seedTestUsers() {
  const dataSource = await initDataSource();
  const tenantRepo = dataSource.getRepository(Tenant);
  const branchRepo = dataSource.getRepository(Branch);
  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);

  let tenant = await tenantRepo.findOne({ where: { code: TEST_TENANT.code } });
  if (!tenant) {
    tenant = tenantRepo.create({
      name: TEST_TENANT.name,
      code: TEST_TENANT.code,
      contactEmail: TEST_TENANT.contactEmail,
      contactPhone: TEST_TENANT.contactPhone,
      config: {},
      isActive: true
    });
  } else {
    tenant.name = TEST_TENANT.name;
    tenant.contactEmail = TEST_TENANT.contactEmail;
    tenant.contactPhone = TEST_TENANT.contactPhone;
    tenant.isActive = true;
  }
  tenant = await tenantRepo.save(tenant);

  let branch = await branchRepo.findOne({
    where: { tenantId: tenant.id, code: TEST_BRANCH.code }
  });
  if (!branch) {
    branch = branchRepo.create({
      tenantId: tenant.id,
      branchId: null,
      name: TEST_BRANCH.name,
      code: TEST_BRANCH.code,
      address: TEST_BRANCH.address,
      timezone: TEST_BRANCH.timezone,
      isPrimary: true,
      isActive: true,
      syncState: 'synced'
    });
  } else {
    branch.name = TEST_BRANCH.name;
    branch.address = TEST_BRANCH.address;
    branch.timezone = TEST_BRANCH.timezone;
    branch.branchId = null;
    branch.isPrimary = true;
    branch.isActive = true;
    branch.syncState = 'synced';
  }
  branch = await branchRepo.save(branch);

  const permissionsByKey = new Map<string, Permission>();
  for (const definition of DEFAULT_PERMISSIONS) {
    const key = `${definition.resource}:${definition.action}`;
    let permission = await permissionRepo.findOne({
      where: { tenantId: tenant.id, name: key }
    });
    if (!permission) {
      permission = permissionRepo.create({
        tenantId: tenant.id,
        branchId: null,
        name: key,
        resource: definition.resource,
        action: definition.action,
        description: null,
        syncState: 'synced'
      });
    } else {
      permission.resource = definition.resource;
      permission.action = definition.action;
      permission.branchId = null;
      permission.syncState = 'synced';
    }
    permission = await permissionRepo.save(permission);
    permissionsByKey.set(key, permission);
  }

  const rolesBySlug: Partial<Record<RoleSlug, Role>> = {};
  for (const [slug, rolePermissions] of Object.entries(ROLE_PERMISSION_MAP) as Array<
    [RoleSlug, typeof DEFAULT_PERMISSIONS]
  >) {
    let role = await roleRepo.findOne({
      where: { tenantId: tenant.id, slug },
      relations: ['permissions']
    });
    if (!role) {
      role = roleRepo.create({
        tenantId: tenant.id,
        branchId: null,
        name: ROLE_NAME_MAP[slug],
        slug,
        isSystem: true,
        description: null,
        syncState: 'synced',
        permissions: []
      });
    } else {
      role.name = ROLE_NAME_MAP[slug];
      role.isSystem = true;
      role.description = null;
      role.syncState = 'synced';
    }

    role.permissions = rolePermissions.map((permissionDef) => {
      const permission =
        permissionsByKey.get(`${permissionDef.resource}:${permissionDef.action}`);
      if (!permission) {
        throw new Error(`Permission ${permissionDef.resource}:${permissionDef.action} missing`);
      }
      return permission;
    });

    role = await roleRepo.save(role);
    rolesBySlug[slug] = role;
  }

  for (const userSeed of TEST_USERS) {
    const role = rolesBySlug[userSeed.role];
    if (!role) {
      throw new Error(`Role ${userSeed.role} was not seeded`);
    }

    let user = await userRepo.findOne({
      where: { email: userSeed.email },
      relations: ['roles']
    });
    const passwordHash = await bcrypt.hash(userSeed.password, 12);

    if (!user) {
      user = userRepo.create({
        tenantId: tenant.id,
        branchId: branch.id,
        email: userSeed.email,
        passwordHash,
        firstName: userSeed.firstName,
        lastName: userSeed.lastName,
        phone: userSeed.phone ?? null,
        status: 'active',
        roles: [role],
        branch,
        syncState: 'synced'
      });
    } else {
      user.tenantId = tenant.id;
      user.branchId = branch.id;
      user.branch = branch;
      user.firstName = userSeed.firstName;
      user.lastName = userSeed.lastName;
      user.passwordHash = passwordHash;
      user.phone = userSeed.phone ?? null;
      user.status = 'active';
      user.roles = [role];
      user.syncState = 'synced';
    }

    await userRepo.save(user);
  }
}

seedTestUsers()
  .then(() => {
    console.log('✅ Seeded demo tenant, roles, and users for testing.');
  })
  .catch((error) => {
    console.error('❌ Failed to seed demo data', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
