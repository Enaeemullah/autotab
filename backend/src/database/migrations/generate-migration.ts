import fs from 'node:fs/promises';
import path from 'node:path';

const RAW_NAME = process.argv[2];

if (!RAW_NAME) {
  // eslint-disable-next-line no-console
  console.error('A migration name is required.\nUsage: npm run migration:generate -- <name>');
  process.exit(1);
}

const MIGRATIONS_DIR = __dirname;

function makeSlug(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function toPascalCase(value: string): string {
  return value
    .trim()
    .split(/[^a-zA-Z0-9]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join('');
}

function timestamp(): string {
  const now = new Date();
  const pad = (num: number) => num.toString().padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

async function generateMigration() {
  const safeSlug = makeSlug(RAW_NAME);

  if (!safeSlug) {
    // eslint-disable-next-line no-console
    console.error('Migration name must include at least one alphanumeric character.');
    process.exit(1);
  }

  const stamp = timestamp();
  const className = `${toPascalCase(RAW_NAME)}${stamp}`;
  const fileName = `${stamp}-${safeSlug}.ts`;
  const filePath = path.join(MIGRATIONS_DIR, fileName);

  const template = `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${className} implements MigrationInterface {
  name = '${className}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // TODO: implement migration
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: revert migration
  }
}
`;

  try {
    await fs.mkdir(MIGRATIONS_DIR, { recursive: true });
    await fs.writeFile(filePath, template, { flag: 'wx' });
    // eslint-disable-next-line no-console
    console.log(`Created migration template at ${path.relative(process.cwd(), filePath)}`);
    process.exit(0);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      // eslint-disable-next-line no-console
      console.error(`A migration file named ${fileName} already exists.`);
    } else {
      // eslint-disable-next-line no-console
      console.error('Failed to create migration file', error);
    }
    process.exit(1);
  }
}

void generateMigration();
