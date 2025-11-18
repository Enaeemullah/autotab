import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource, initDataSource } from '../data-source';
import { env } from '../../config/environment';
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

const ADMIN_CONFIG = {
  tenant: {
    name: 'Demo Retail Co.',
    code: 'demo-retail',
    contactEmail: 'admin@demo-retail.test',
    contactPhone: '+15550000000'
  },
  branch: {
    name: 'Demo HQ',
    code: 'demo-hq',
    address: '123 Market Street',
    timezone: 'UTC'
  },
  admin: {
    email: 'admin@demo-retail.test',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+15550000001'
  }
} as const;

async function seedAdmin() {
  console.log('\n📊 Database Configuration:');
  console.log(`   Host: ${env.POSTGRES_HOST}`);
  console.log(`   Port: ${env.POSTGRES_PORT}`);
  console.log(`   Database: ${env.POSTGRES_DATABASE}`);
  console.log(`   User: ${env.POSTGRES_USER}`);
  console.log('   All data will be stored in the database specified above.\n');

  const dataSource = await initDataSource();
  const tenantRepo = dataSource.getRepository(Tenant);
  const branchRepo = dataSource.getRepository(Branch);
  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);

  // Create or update tenant
  let tenant = await tenantRepo.findOne({ where: { code: ADMIN_CONFIG.tenant.code } });
  if (!tenant) {
    tenant = tenantRepo.create({
      name: ADMIN_CONFIG.tenant.name,
      code: ADMIN_CONFIG.tenant.code,
      contactEmail: ADMIN_CONFIG.tenant.contactEmail,
      contactPhone: ADMIN_CONFIG.tenant.contactPhone,
      config: {},
      isActive: true
    });
    console.log('✅ Created tenant:', tenant.code);
  } else {
    tenant.name = ADMIN_CONFIG.tenant.name;
    tenant.contactEmail = ADMIN_CONFIG.tenant.contactEmail;
    tenant.contactPhone = ADMIN_CONFIG.tenant.contactPhone;
    tenant.isActive = true;
    console.log('✅ Updated tenant:', tenant.code);
  }
  tenant = await tenantRepo.save(tenant);

  // Create or update branch
  let branch = await branchRepo.findOne({
    where: { tenantId: tenant.id, code: ADMIN_CONFIG.branch.code }
  });
  if (!branch) {
    branch = branchRepo.create({
      tenantId: tenant.id,
      branchId: null,
      name: ADMIN_CONFIG.branch.name,
      code: ADMIN_CONFIG.branch.code,
      address: ADMIN_CONFIG.branch.address,
      timezone: ADMIN_CONFIG.branch.timezone,
      isPrimary: true,
      isActive: true,
      syncState: 'synced'
    });
    console.log('✅ Created branch:', branch.code);
  } else {
    branch.name = ADMIN_CONFIG.branch.name;
    branch.address = ADMIN_CONFIG.branch.address;
    branch.timezone = ADMIN_CONFIG.branch.timezone;
    branch.branchId = null;
    branch.isPrimary = true;
    branch.isActive = true;
    branch.syncState = 'synced';
    console.log('✅ Updated branch:', branch.code);
  }
  branch = await branchRepo.save(branch);

  // Create or update permissions
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
  console.log(`✅ Created/updated ${permissionsByKey.size} permissions`);

  // Create or update admin role
  const adminRolePermissions = ROLE_PERMISSION_MAP.admin;
  let adminRole = await roleRepo.findOne({
    where: { tenantId: tenant.id, slug: 'admin' },
    relations: ['permissions']
  });
  if (!adminRole) {
    adminRole = roleRepo.create({
      tenantId: tenant.id,
      branchId: null,
      name: ROLE_NAME_MAP.admin,
      slug: 'admin',
      isSystem: true,
      description: null,
      syncState: 'synced',
      permissions: []
    });
  } else {
    adminRole.name = ROLE_NAME_MAP.admin;
    adminRole.isSystem = true;
    adminRole.description = null;
    adminRole.syncState = 'synced';
  }

  adminRole.permissions = adminRolePermissions.map((permissionDef) => {
    const permission = permissionsByKey.get(`${permissionDef.resource}:${permissionDef.action}`);
    if (!permission) {
      throw new Error(`Permission ${permissionDef.resource}:${permissionDef.action} missing`);
    }
    return permission;
  });

  adminRole = await roleRepo.save(adminRole);
  console.log('✅ Created/updated admin role with', adminRole.permissions.length, 'permissions');

  // Create or update admin user
  let adminUser = await userRepo.findOne({
    where: { email: ADMIN_CONFIG.admin.email },
    relations: ['roles']
  });
  const passwordHash = await bcrypt.hash(ADMIN_CONFIG.admin.password, 12);

  if (!adminUser) {
    adminUser = userRepo.create({
      tenantId: tenant.id,
      branchId: branch.id,
      email: ADMIN_CONFIG.admin.email,
      passwordHash,
      firstName: ADMIN_CONFIG.admin.firstName,
      lastName: ADMIN_CONFIG.admin.lastName,
      phone: ADMIN_CONFIG.admin.phone ?? null,
      status: 'active',
      roles: [adminRole],
      branch,
      syncState: 'synced'
    });
    console.log('✅ Created admin user');
  } else {
    adminUser.tenantId = tenant.id;
    adminUser.branchId = branch.id;
    adminUser.branch = branch;
    adminUser.firstName = ADMIN_CONFIG.admin.firstName;
    adminUser.lastName = ADMIN_CONFIG.admin.lastName;
    adminUser.passwordHash = passwordHash;
    adminUser.phone = ADMIN_CONFIG.admin.phone ?? null;
    adminUser.status = 'active';
    adminUser.roles = [adminRole];
    adminUser.syncState = 'synced';
    console.log('✅ Updated admin user');
  }

  await userRepo.save(adminUser);

  console.log('\n🎉 Admin seeder completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Tenant Code: ' + ADMIN_CONFIG.tenant.code);
  console.log('   Email:       ' + ADMIN_CONFIG.admin.email);
  console.log('   Password:    ' + ADMIN_CONFIG.admin.password);
  console.log('\n');
}

seedAdmin()
  .then(() => {
    console.log('✅ Seeder finished successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to seed admin user', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

