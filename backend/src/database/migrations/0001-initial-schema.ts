import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema0001 implements MigrationInterface {
  name = 'InitialSchema0001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(150) NOT NULL,
        code varchar(50) UNIQUE NOT NULL,
        contact_email varchar(150),
        contact_phone varchar(50),
        is_active boolean DEFAULT true,
        config jsonb DEFAULT '{}'::jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid,
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        name varchar(150) NOT NULL,
        code varchar(50) NOT NULL,
        address varchar(255),
        timezone varchar(100) DEFAULT 'UTC',
        is_primary boolean DEFAULT false,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid,
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        is_system boolean DEFAULT false,
        description varchar(255),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid,
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        name varchar(150) NOT NULL,
        action varchar(150) NOT NULL,
        resource varchar(150) NOT NULL,
        description varchar(255),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
        permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        email varchar(150) UNIQUE NOT NULL,
        password_hash varchar(255) NOT NULL,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        status varchar(32) DEFAULT 'active',
        last_login_at timestamptz,
        phone varchar(50),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid,
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        name varchar(150) NOT NULL,
        slug varchar(150),
        description varchar(255),
        parent_id uuid REFERENCES categories(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid,
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        name varchar(150) NOT NULL,
        contact_name varchar(150),
        email varchar(150),
        phone varchar(100),
        address varchar(255),
        tax_number varchar(100),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stock_locations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        name varchar(150) NOT NULL,
        description varchar(255),
        is_default boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS products (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        sku varchar(100) UNIQUE NOT NULL,
        barcode varchar(100) UNIQUE,
        name varchar(255) NOT NULL,
        description text,
        cost_price numeric(15,4) DEFAULT 0,
        sale_price numeric(15,4) DEFAULT 0,
        tax_rate numeric(8,4) DEFAULT 0,
        current_stock numeric(15,4) DEFAULT 0,
        reorder_point numeric(15,4) DEFAULT 0,
        is_variant_parent boolean DEFAULT false,
        is_batch_tracked boolean DEFAULT false,
        expiry_tracking boolean DEFAULT false,
        unit varchar(50) DEFAULT 'unit',
        image_url varchar(255),
        category_id uuid REFERENCES categories(id),
        supplier_id uuid REFERENCES suppliers(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        parent_id uuid REFERENCES products(id) ON DELETE CASCADE,
        name varchar(150) NOT NULL,
        sku varchar(100) UNIQUE NOT NULL,
        barcode varchar(100) UNIQUE,
        attributes jsonb DEFAULT '{}'::jsonb,
        cost_price numeric(15,4) DEFAULT 0,
        sale_price numeric(15,4) DEFAULT 0,
        current_stock numeric(15,4) DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_batches (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        product_id uuid REFERENCES products(id),
        batch_code varchar(100) NOT NULL,
        manufactured_at date,
        expires_at date,
        quantity numeric(15,4) DEFAULT 0,
        remaining_quantity numeric(15,4) DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        product_id uuid REFERENCES products(id),
        variant_id uuid REFERENCES product_variants(id),
        batch_id uuid REFERENCES product_batches(id),
        source_location_id uuid REFERENCES stock_locations(id),
        target_location_id uuid REFERENCES stock_locations(id),
        movement_type varchar(50) NOT NULL,
        quantity numeric(15,4) NOT NULL,
        unit_cost numeric(15,4) DEFAULT 0,
        reference varchar(150),
        notes text,
        performed_by_id uuid REFERENCES users(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        sequence_number bigint NOT NULL,
        invoice_number varchar(50) UNIQUE NOT NULL,
        status varchar(20) DEFAULT 'completed',
        sale_date timestamptz NOT NULL,
        cashier_id uuid REFERENCES users(id),
        customer_name varchar(150),
        customer_phone varchar(100),
        subtotal numeric(15,4) DEFAULT 0,
        tax_total numeric(15,4) DEFAULT 0,
        discount_total numeric(15,4) DEFAULT 0,
        grand_total numeric(15,4) DEFAULT 0,
        paid_total numeric(15,4) DEFAULT 0,
        balance numeric(15,4) DEFAULT 0,
        notes text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
        product_id uuid REFERENCES products(id),
        variant_id uuid REFERENCES product_variants(id),
        batch_id uuid REFERENCES product_batches(id),
        quantity numeric(15,4) NOT NULL,
        unit_price numeric(15,4) NOT NULL,
        discount_rate numeric(8,4) DEFAULT 0,
        discount_amount numeric(15,4) DEFAULT 0,
        tax_rate numeric(8,4) DEFAULT 0,
        tax_amount numeric(15,4) DEFAULT 0,
        line_total numeric(15,4) NOT NULL,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sale_payments (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
        method varchar(50) NOT NULL,
        amount numeric(15,4) NOT NULL,
        received_at timestamptz NOT NULL,
        reference varchar(150),
        meta jsonb DEFAULT '{}'::jsonb,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        key varchar(150) NOT NULL,
        value jsonb NOT NULL,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1,
        UNIQUE (tenant_id, branch_id, key)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        actor_id uuid REFERENCES users(id),
        action varchar(150) NOT NULL,
        resource varchar(150) NOT NULL,
        resource_id uuid,
        metadata jsonb DEFAULT '{}'::jsonb,
        ip_address varchar(45),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id),
        sync_version bigint DEFAULT 0,
        sync_state varchar(32) DEFAULT 'pending',
        origin varchar(32) DEFAULT 'local',
        entity_name varchar(150) NOT NULL,
        entity_id uuid NOT NULL,
        direction varchar(20) NOT NULL,
        status varchar(20) NOT NULL,
        last_synced_at timestamptz,
        payload jsonb DEFAULT '{}'::jsonb,
        error_message text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        record_version integer DEFAULT 1
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_sequence ON sales(tenant_id, branch_id, sequence_number)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_sync_logs_entity ON sync_logs(tenant_id, entity_name, status)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS sync_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
    await queryRunner.query(`DROP TABLE IF EXISTS settings`);
    await queryRunner.query(`DROP TABLE IF EXISTS sale_payments`);
    await queryRunner.query(`DROP TABLE IF EXISTS sale_items`);
    await queryRunner.query(`DROP TABLE IF EXISTS sales`);
    await queryRunner.query(`DROP TABLE IF EXISTS inventory_movements`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_batches`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_variants`);
    await queryRunner.query(`DROP TABLE IF EXISTS products`);
    await queryRunner.query(`DROP TABLE IF EXISTS stock_locations`);
    await queryRunner.query(`DROP TABLE IF EXISTS suppliers`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS branches`);
    await queryRunner.query(`DROP TABLE IF EXISTS tenants`);
  }
}
