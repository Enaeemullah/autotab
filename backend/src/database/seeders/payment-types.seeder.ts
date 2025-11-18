import 'reflect-metadata';
import { AppDataSource, initDataSource } from '../data-source';
import { env } from '../../config/environment';
import { PaymentType } from '../entities/payment-type.entity';
import { Tenant } from '../entities/tenant.entity';

const DEFAULT_PAYMENT_TYPES = [
  {
    name: 'Cash',
    code: 'cash',
    description: 'Cash payment',
    icon: 'cash',
    requiresReference: false,
    markTransactionAsPaid: true,
    sortOrder: 1
  },
  {
    name: 'Credit Card',
    code: 'card',
    description: 'Credit or debit card payment',
    icon: 'credit-card',
    requiresReference: true,
    markTransactionAsPaid: true,
    sortOrder: 2
  },
  {
    name: 'Mobile Wallet',
    code: 'wallet',
    description: 'Mobile wallet payment (e.g., PayPal, Apple Pay)',
    icon: 'wallet',
    requiresReference: true,
    markTransactionAsPaid: true,
    sortOrder: 3
  },
  {
    name: 'Bank Transfer',
    code: 'bank_transfer',
    description: 'Bank transfer or wire transfer',
    icon: 'bank',
    requiresReference: true,
    markTransactionAsPaid: false, // Partial payment allowed
    sortOrder: 4
  },
  {
    name: 'Check',
    code: 'check',
    description: 'Check payment',
    icon: 'check',
    requiresReference: true,
    markTransactionAsPaid: false, // Partial payment allowed
    sortOrder: 5
  }
] as const;

async function seedPaymentTypes() {
  console.log('\n📊 Database Configuration:');
  console.log(`   Host: ${env.POSTGRES_HOST}`);
  console.log(`   Port: ${env.POSTGRES_PORT}`);
  console.log(`   Database: ${env.POSTGRES_DATABASE}`);
  console.log(`   User: ${env.POSTGRES_USER}`);
  console.log('   All data will be stored in the database specified above.\n');

  const dataSource = await initDataSource();
  const paymentTypeRepo = dataSource.getRepository(PaymentType);
  const tenantRepo = dataSource.getRepository(Tenant);

  // Get all tenants
  const tenants = await tenantRepo.find();

  if (tenants.length === 0) {
    console.log('⚠️  No tenants found. Please run admin seeder first.');
    return;
  }

  for (const tenant of tenants) {
    console.log(`\n📦 Seeding payment types for tenant: ${tenant.name} (${tenant.code})`);

    for (const paymentTypeData of DEFAULT_PAYMENT_TYPES) {
      let paymentType = await paymentTypeRepo.findOne({
        where: { code: paymentTypeData.code, tenantId: tenant.id }
      });

      if (!paymentType) {
        paymentType = paymentTypeRepo.create({
          tenantId: tenant.id,
          branchId: null,
          name: paymentTypeData.name,
          code: paymentTypeData.code,
          description: paymentTypeData.description,
          icon: paymentTypeData.icon,
          isActive: true,
          requiresReference: paymentTypeData.requiresReference,
          markTransactionAsPaid: paymentTypeData.markTransactionAsPaid,
          sortOrder: paymentTypeData.sortOrder,
          syncState: 'synced'
        });
        await paymentTypeRepo.save(paymentType);
        console.log(`   ✅ Created payment type: ${paymentTypeData.name}`);
      } else {
        console.log(`   ⏭️  Payment type already exists: ${paymentTypeData.name}`);
      }
    }
  }

  console.log('\n🎉 Payment types seeder completed successfully!\n');
}

seedPaymentTypes()
  .then(() => {
    console.log('✅ Seeder finished successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to seed payment types', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

