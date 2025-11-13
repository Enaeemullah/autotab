import { useQuery } from '@tanstack/react-query';
import { fetchDashboard, fetchSalesReport, fetchUserPerformance } from '../../api/services/reports';
import { TrendChart } from '../../components/dashboard/TrendChart';
import { PerformanceTable } from '../../components/dashboard/PerformanceTable';

export function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard
  });

  const { data: salesTrend } = useQuery({
    queryKey: ['sales', 'daily'],
    queryFn: () => fetchSalesReport('daily')
  });

  const { data: userPerformance } = useQuery({
    queryKey: ['userPerformance'],
    queryFn: fetchUserPerformance
  });

  if (isLoading) {
    return <p className="text-slate-300">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Sales (30d)" value={`$${metrics?.totalSales?.toFixed(2) ?? '0.00'}`} />
        <StatCard title="Tax Collected" value={`$${metrics?.totalTax?.toFixed(2) ?? '0.00'}`} />
        <StatCard title="Inventory Value" value={`$${metrics?.inventoryValue?.toFixed(2) ?? '0.00'}`} />
        <StatCard title="Stock Alerts" value={metrics?.stockAlerts?.length ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-2">
          <h2 className="mb-4 text-lg font-medium text-slate-100">Sales Trend</h2>
          <TrendChart data={salesTrend ?? []} />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-4 text-lg font-medium text-slate-100">Top Performers</h2>
          <PerformanceTable data={userPerformance ?? []} />
        </div>
      </div>

      <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-4">
        <h2 className="mb-2 text-lg font-medium text-amber-200">Stock Alerts</h2>
        <p className="text-sm text-amber-100">
          {metrics?.stockAlerts?.length
            ? `${metrics.stockAlerts.length} items are at or below their reorder points.`
            : 'All items are above reorder points.'}
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}
