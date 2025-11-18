import { initDataSource } from '../data-source';
import { env } from '../../config/environment';

async function runMigrations() {
  try {
    // eslint-disable-next-line no-console
    console.log('\n📊 Database Configuration:');
    // eslint-disable-next-line no-console
    console.log(`   Host: ${env.POSTGRES_HOST}`);
    // eslint-disable-next-line no-console
    console.log(`   Port: ${env.POSTGRES_PORT}`);
    // eslint-disable-next-line no-console
    console.log(`   Database: ${env.POSTGRES_DATABASE}`);
    // eslint-disable-next-line no-console
    console.log(`   User: ${env.POSTGRES_USER}`);
    // eslint-disable-next-line no-console
    console.log('   Migrations will be applied to the database specified above.\n');

    const dataSource = await initDataSource();
    await dataSource.runMigrations();
    // eslint-disable-next-line no-console
    console.log('✅ Migrations executed successfully');
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Migration execution failed', error);
    process.exit(1);
  }
}

void runMigrations();
