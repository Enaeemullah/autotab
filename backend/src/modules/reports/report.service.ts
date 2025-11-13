import dayjs from 'dayjs';
import { AppDataSource } from '../../database/data-source';

export class ReportService {
  async salesSummary(tenantId: string, branchId: string | null, period: 'daily' | 'weekly' | 'monthly') {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const intervalMap = {
        daily: "DATE_TRUNC('day', sale_date)",
        weekly: "DATE_TRUNC('week', sale_date)",
        monthly: "DATE_TRUNC('month', sale_date)"
      } as const;
      const interval = intervalMap[period];
      const condition = branchId ? 'AND branch_id = $2' : '';
      const params = branchId ? [tenantId, branchId] : [tenantId];

      const results = await queryRunner.query(
        `
          SELECT ${interval} as bucket,
                 SUM(grand_total::numeric) as total_sales,
                 SUM(tax_total::numeric) as total_tax,
                 SUM(discount_total::numeric) as total_discount,
                 COUNT(*) as transactions
          FROM sales
          WHERE tenant_id = $1 ${condition}
          GROUP BY bucket
          ORDER BY bucket DESC
          LIMIT 30
        `,
        params
      );

      return results.map((row: any) => ({
        bucket: dayjs(row.bucket).toISOString(),
        totalSales: Number(row.total_sales),
        totalTax: Number(row.total_tax),
        totalDiscount: Number(row.total_discount),
        transactions: Number(row.transactions)
      }));
    } finally {
      await queryRunner.release();
    }
  }

  async inventoryValuation(tenantId: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const results = await queryRunner.query(
        `
          SELECT category_id,
                 SUM((sale_price::numeric - cost_price::numeric) * current_stock::numeric) as potential_profit,
                 SUM(cost_price::numeric * current_stock::numeric) as inventory_cost,
                 SUM(sale_price::numeric * current_stock::numeric) as inventory_value
          FROM products
          WHERE tenant_id = $1
          GROUP BY category_id
        `,
        [tenantId]
      );

      return results.map((row: any) => ({
        categoryId: row.category_id,
        inventoryCost: Number(row.inventory_cost),
        inventoryValue: Number(row.inventory_value),
        potentialProfit: Number(row.potential_profit)
      }));
    } finally {
      await queryRunner.release();
    }
  }

  async taxSummary(tenantId: string, branchId: string | null) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const condition = branchId ? 'AND branch_id = $2' : '';
      const params = branchId ? [tenantId, branchId] : [tenantId];

      const result = await queryRunner.query(
        `
          SELECT SUM(tax_total::numeric) as tax_collected,
                 SUM(subtotal::numeric) as taxable_sales,
                 SUM(discount_total::numeric) as discounts
          FROM sales
          WHERE tenant_id = $1 ${condition}
        `,
        params
      );

      const row = result[0] ?? {};
      return {
        taxCollected: Number(row.tax_collected ?? 0),
        taxableSales: Number(row.taxable_sales ?? 0),
        discounts: Number(row.discounts ?? 0)
      };
    } finally {
      await queryRunner.release();
    }
  }

  async userPerformance(tenantId: string, branchId: string | null) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const condition = branchId ? 'AND sales.branch_id = $2' : '';
      const params = branchId ? [tenantId, branchId] : [tenantId];

      const results = await queryRunner.query(
        `
          SELECT users.id,
                 users.first_name,
                 users.last_name,
                 COUNT(sales.id) as sales_count,
                 SUM(sales.grand_total::numeric) as total_sales,
                 SUM(sales.tax_total::numeric) as total_tax
          FROM sales
          INNER JOIN users ON users.id = sales.cashier_id
          WHERE sales.tenant_id = $1 ${condition}
          GROUP BY users.id, users.first_name, users.last_name
          ORDER BY total_sales DESC
        `,
        params
      );

      return results.map((row: any) => ({
        userId: row.id,
        name: `${row.first_name} ${row.last_name}`,
        salesCount: Number(row.sales_count ?? 0),
        totalSales: Number(row.total_sales ?? 0),
        totalTax: Number(row.total_tax ?? 0)
      }));
    } finally {
      await queryRunner.release();
    }
  }

  async dashboard(tenantId: string, branchId: string | null) {
    const [sales, tax, inventory] = await Promise.all([
      this.salesSummary(tenantId, branchId, 'daily'),
      this.taxSummary(tenantId, branchId),
      this.inventoryValuation(tenantId)
    ]);

    const totalSales = sales.reduce((sum, item) => sum + item.totalSales, 0);
    const totalTax = sales.reduce((sum, item) => sum + item.totalTax, 0);
    const inventoryValue = inventory.reduce((sum, item) => sum + item.inventoryValue, 0);
    const stockAlerts = await this.stockAlerts(tenantId);

    return {
      totalSales,
      totalTax,
      inventoryValue,
      stockAlerts,
      salesTrend: sales
    };
  }

  async stockAlerts(tenantId: string) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      const results = await queryRunner.query(
        `
          SELECT id, name, sku, current_stock, reorder_point
          FROM products
          WHERE tenant_id = $1
            AND current_stock::numeric <= reorder_point::numeric
          ORDER BY current_stock::numeric ASC
          LIMIT 20
        `,
        [tenantId]
      );
      return results.map((row: any) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        currentStock: Number(row.current_stock ?? 0),
        reorderPoint: Number(row.reorder_point ?? 0)
      }));
    } finally {
      await queryRunner.release();
    }
  }
}
