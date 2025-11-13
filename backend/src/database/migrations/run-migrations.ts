import { initDataSource } from '../data-source';

async function runMigrations() {
  try {
    const dataSource = await initDataSource();
    await dataSource.runMigrations();
    // eslint-disable-next-line no-console
    console.log('Migrations executed successfully');
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration execution failed', error);
    process.exit(1);
  }
}

void runMigrations();
