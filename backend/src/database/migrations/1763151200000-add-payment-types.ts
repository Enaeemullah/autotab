import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentTypes1763151200000 implements MigrationInterface {
  name = 'AddPaymentTypes1763151200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payment_types (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid,
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        name varchar(100) NOT NULL,
        code varchar(50) NOT NULL,
        description text,
        icon varchar(50),
        is_active boolean DEFAULT true,
        requires_reference boolean DEFAULT false,
        mark_transaction_as_paid boolean DEFAULT true,
        sort_order integer DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1,
        UNIQUE(tenant_id, code)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_types_tenant_id ON payment_types(tenant_id)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_types_active ON payment_types(tenant_id, is_active) WHERE is_active = true
    `);

    // Add payment_type_id to sale_payments table
    await queryRunner.query(`
      ALTER TABLE sale_payments 
      ADD COLUMN IF NOT EXISTS payment_type_id uuid REFERENCES payment_types(id) ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sale_payments_payment_type_id ON sale_payments(payment_type_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sale_payments_payment_type_id`);
    await queryRunner.query(`ALTER TABLE sale_payments DROP COLUMN IF EXISTS payment_type_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payment_types_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payment_types_tenant_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS payment_types`);
  }
}

