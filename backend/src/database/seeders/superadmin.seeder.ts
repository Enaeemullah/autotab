import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { IsNull } from 'typeorm';
import { AppDataSource, initDataSource } from '../data-source';
import { env } from '../../config/environment';
import { User } from '../entities/user.entity';

const SUPERADMIN_CONFIG = {
  email: 'superadmin@autotab.com',
  password: 'superadmin123',
  firstName: 'Super',
  lastName: 'Admin',
  phone: '+15550000000'
} as const;

async function seedSuperAdmin() {
  console.log('\n📊 Database Configuration:');
  console.log(`   Host: ${env.POSTGRES_HOST}`);
  console.log(`   Port: ${env.POSTGRES_PORT}`);
  console.log(`   Database: ${env.POSTGRES_DATABASE}`);
  console.log(`   User: ${env.POSTGRES_USER}`);
  console.log('   All data will be stored in the database specified above.\n');

  const dataSource = await initDataSource();
  const userRepo = dataSource.getRepository(User);

  let superAdmin = await userRepo.findOne({
    where: { email: SUPERADMIN_CONFIG.email, tenantId: IsNull() }
  });

  const passwordHash = await bcrypt.hash(SUPERADMIN_CONFIG.password, 12);

  if (!superAdmin) {
    // Create superadmin user without tenant (null tenantId)
    superAdmin = userRepo.create({
      tenantId: null,
      branchId: null,
      email: SUPERADMIN_CONFIG.email,
      passwordHash,
      firstName: SUPERADMIN_CONFIG.firstName,
      lastName: SUPERADMIN_CONFIG.lastName,
      phone: SUPERADMIN_CONFIG.phone ?? null,
      status: 'active',
      roles: [], // Superadmin has special handling in auth
      syncState: 'synced'
    });
    console.log('✅ Created superadmin user');
  } else {
    superAdmin.passwordHash = passwordHash;
    superAdmin.firstName = SUPERADMIN_CONFIG.firstName;
    superAdmin.lastName = SUPERADMIN_CONFIG.lastName;
    superAdmin.phone = SUPERADMIN_CONFIG.phone ?? null;
    superAdmin.status = 'active';
    superAdmin.tenantId = null;
    superAdmin.branchId = null;
    console.log('✅ Updated superadmin user');
  }

  await userRepo.save(superAdmin);

  console.log('\n🎉 Superadmin seeder completed successfully!');
  console.log('\n📋 Superadmin credentials:');
  console.log('   Email:    ' + SUPERADMIN_CONFIG.email);
  console.log('   Password: ' + SUPERADMIN_CONFIG.password);
  console.log('\n⚠️  Note: Superadmin login requires special handling in auth service.');
  console.log('   Superadmin can manage all tenants and organizations.\n');
}

seedSuperAdmin()
  .then(() => {
    console.log('✅ Seeder finished successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to seed superadmin', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

