import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSalesReport, fetchInventoryReport, fetchUserPerformance, fetchDashboard } from '../../api/services/reports';

type Period = 'daily' | 'weekly' | 'monthly';

export function ReportsPage() {
  const [period, setPeriod] = useState<Period>('daily');

  const { data: sales } = useQuery({
    queryKey: ['reports', 'sales', period],
    queryFn: () => fetchSalesReport(period)
  });

  const { data: inventory } = useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: fetchInventoryReport
  });

  const { data: performance } = useQuery({
    queryKey: ['reports', 'performance'],
    queryFn: fetchUserPerformance
  });

  const { data: kpis } = useQuery({
    queryKey: ['reports', 'kpi'],
    queryFn: fetchDashboard
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Reports</h1>
          <p className="text-sm text-slate-400">
            Analyze sales performance, inventory, and team productivity.
          </p>
        </div>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((value) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-md px-3 py-2 text-sm transition ${
                period === value
                  ? 'bg-primary text-white'
                  : 'border border-slate-700 text-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-lg font-semibold text-slate-100">Sales Summary</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {sales?.map((row: any) => (
              <li
                key={row.bucket}
                className="flex justify-between rounded-md bg-slate-950/40 px-3 py-2 text-xs"
              >
                <span>{new Date(row.bucket).toLocaleDateString()}</span>
                <span>${Number(row.totalSales ?? 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-lg font-semibold text-slate-100">Inventory Valuation</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {inventory?.map((row: any) => (
              <li
                key={row.categoryId}
                className="flex flex-col rounded-md bg-slate-950/40 px-3 py-2"
              >
                <span className="text-xs text-slate-400">Category ID: {row.categoryId ?? '—'}</span>
                <span className="font-semibold">
                  Value: ${Number(row.inventoryValue ?? 0).toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">
                  Cost: ${Number(row.inventoryCost ?? 0).toFixed(2)} | Potential Profit: $
                  {Number(row.potentialProfit ?? 0).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="text-lg font-semibold text-slate-100">Team Performance</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            {performance?.map((row: any) => (
              <li
                key={row.userId}
                className="flex items-center justify-between rounded-md bg-slate-950/40 px-3 py-2"
              >
                <div>
                  <p className="font-semibold">{row.name}</p>
                  <p className="text-xs text-slate-400">{row.salesCount} sales</p>
                </div>
                <p className="text-sm font-semibold text-primary">
                  ${Number(row.totalSales ?? 0).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Key Metrics</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4 text-sm text-slate-200">
          <MetricCard label="Total Sales (30d)" value={`$${kpis?.totalSales?.toFixed(2) ?? '0.00'}`} />
          <MetricCard label="Tax Collected" value={`$${kpis?.totalTax?.toFixed(2) ?? '0.00'}`} />
          <MetricCard label="Inventory Value" value={`$${kpis?.inventoryValue?.toFixed(2) ?? '0.00'}`} />
          <MetricCard label="Stock Alerts" value={kpis?.stockAlerts?.length ?? 0} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-100">{value}</p>
    </div>
  );
}
