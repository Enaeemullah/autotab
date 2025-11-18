import { useMemo, type ComponentType, type SVGProps } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
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

  const statCards = useMemo(
    () => [
      {
        title: 'Total Sales (30d)',
        value: metrics?.totalSales ? `$${metrics.totalSales.toFixed(2)}` : '$0.00',
        subtitle: 'Rolling 30-day revenue',
        icon: BanknotesIcon
      },
      {
        title: 'Tax Collected',
        value: metrics?.totalTax ? `$${metrics.totalTax.toFixed(2)}` : '$0.00',
        subtitle: 'Filed & unfiled remittances',
        icon: ShieldCheckIcon
      },
      {
        title: 'Inventory Value',
        value: metrics?.inventoryValue ? `$${metrics.inventoryValue.toFixed(2)}` : '$0.00',
        subtitle: 'On-hand sellable stock',
        icon: ArrowTrendingUpIcon
      },
      {
        title: 'Stock Alerts',
        value: String(metrics?.stockAlerts?.length ?? 0),
        subtitle: 'Items below reorder point',
        icon: ExclamationTriangleIcon
      }
    ],
    [metrics]
  );

  if (isLoading) {
    return (
      <div className="glass-panel flex items-center justify-center p-10 text-sm text-slate-400">
        Loading executive overview…
      </div>
    );
  }

  const alerts = metrics?.stockAlerts ?? [];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="pill w-fit">Executive overview</p>
        <div>
          <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Track revenue, tax exposure, and inventory health across your branches.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Revenue run-rate</p>
              <h2 className="text-xl font-semibold text-white">Sales trend</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Last 30 days
              </span>
            </div>
          </div>
          <TrendChart data={salesTrend ?? []} />
        </div>
        <div className="glass-panel p-6">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Team performance</p>
            <h2 className="text-xl font-semibold text-white">Top performers</h2>
          </div>
          <PerformanceTable data={userPerformance ?? []} />
        </div>
      </section>

      <section className="glass-panel border border-amber-500/30 bg-amber-500/5 p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-200">
            <ExclamationTriangleIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Inventory watchlist</p>
            <h2 className="text-lg font-semibold text-white">
              {alerts.length ? `${alerts.length} stock alerts` : 'Inventory steady'}
            </h2>
          </div>
        </div>
        {alerts.length ? (
          <ul className="space-y-3 text-sm text-amber-100">
            {alerts.slice(0, 4).map((alert: any, index: number) => (
              <li
                key={alert.id ?? alert.productId ?? alert.sku ?? index}
                className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-white">
                    {alert.name ?? alert.productName ?? alert.product?.name ?? 'Low stock item'}
                  </p>
                  <p className="text-xs text-amber-100/80">{alert.sku ?? alert.product?.sku ?? '—'}</p>
                </div>
                <div className="text-right text-xs">
                  <p>On hand: {alert.currentStock ?? alert.stock ?? alert.onHand ?? '0'}</p>
                  <p>Reorder: {alert.reorderPoint ?? alert.reorder_point ?? '—'}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-amber-100/80">
            All items are currently above their reorder thresholds. Great job staying ahead!
          </p>
        )}
      </section>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function StatCard({ title, value, subtitle, icon: Icon }: StatCardProps) {
  return (
    <div className="glass-panel flex h-full flex-col justify-between p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{title}</p>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-slate-200">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div>
        <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}
