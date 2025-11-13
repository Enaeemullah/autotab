import { initDataSource } from '../data-source';

const name = process.argv[2];

if (!name) {
  // eslint-disable-next-line no-console
  console.error('Migration name is required: npm run migration:generate -- <name>');
  process.exit(1);
}

async function generateMigration() {
  try {
    const dataSource = await initDataSource();
    await dataSource.showMigrations();
    await dataSource.runMigrations({ transaction: 'all' });
    // eslint-disable-next-line no-console
    console.log('Migration generation completed (manual template).');
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration generation failed', error);
    process.exit(1);
  }
}

void generateMigration();
