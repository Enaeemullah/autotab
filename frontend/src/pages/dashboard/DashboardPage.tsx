import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  fetchMonthlySales,
  fetchTopProducts,
  fetchHourlySales,
  fetchTopCustomers,
  fetchTopProductGroups,
  fetchPeriodicSales,
  type MonthlySalesData,
  type TopProduct,
  type HourlySalesData,
  type TopCustomer,
  type TopProductGroup
} from '../../api/services/reports';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

export function DashboardPage() {
  const auth = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const isSuperAdmin = auth.user?.roles?.includes('superadmin') || auth.user?.permissions?.includes('*');

  // Redirect superadmin to tenants page
  useEffect(() => {
    if (isSuperAdmin) {
      navigate('/tenants', { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  if (isSuperAdmin) {
    return null; // Prevent rendering while redirecting
  }

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [periodStartDate, setPeriodStartDate] = useState(dayjs().startOf('day').toISOString());
  const [periodEndDate, setPeriodEndDate] = useState(dayjs().endOf('day').toISOString());

  const { data: monthlySales, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthlySales', selectedYear],
    queryFn: () => fetchMonthlySales(selectedYear),
    enabled: !isSuperAdmin,
    retry: false
  });

  const { data: topProducts, isLoading: topProductsLoading } = useQuery({
    queryKey: ['topProducts', periodStartDate, periodEndDate],
    queryFn: () => fetchTopProducts(periodStartDate, periodEndDate),
    enabled: !isSuperAdmin,
    retry: false
  });

  const { data: hourlySales, isLoading: hourlyLoading } = useQuery({
    queryKey: ['hourlySales', periodStartDate, periodEndDate],
    queryFn: () => fetchHourlySales(periodStartDate, periodEndDate),
    enabled: !isSuperAdmin,
    retry: false
  });

  const { data: topCustomers, isLoading: topCustomersLoading } = useQuery({
    queryKey: ['topCustomers', periodStartDate, periodEndDate],
    queryFn: () => fetchTopCustomers(periodStartDate, periodEndDate),
    enabled: !isSuperAdmin,
    retry: false
  });

  const { data: topProductGroups, isLoading: topGroupsLoading } = useQuery({
    queryKey: ['topProductGroups', periodStartDate, periodEndDate],
    queryFn: () => fetchTopProductGroups(periodStartDate, periodEndDate),
    enabled: !isSuperAdmin,
    retry: false
  });

  const { data: periodicSales, isLoading: periodicLoading } = useQuery({
    queryKey: ['periodicSales', periodStartDate, periodEndDate],
    queryFn: () => fetchPeriodicSales(periodStartDate, periodEndDate),
    enabled: !isSuperAdmin,
    retry: false
  });

  // Calculate total sales and top performing month
  const totalSales = monthlySales?.reduce((sum, item) => sum + item.totalSales, 0) || 0;
  const topMonth = monthlySales?.reduce((max, item) =>
    item.totalSales > max.totalSales ? item : max
  ) || null;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  // Get max value for chart scaling
  const maxSales = monthlySales?.reduce((max, item) => Math.max(max, item.totalSales), 0) || 1;
  const chartHeight = 200;
  const chartMax = Math.ceil(maxSales / 100000) * 100000 || 100000;

  return (
    <div className="space-y-6">
      {/* Monthly Sales Section */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">
            Monthly Sales - {selectedYear}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="rounded-md p-1 text-slate-400 hover:text-slate-200"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-sm text-slate-300">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="rounded-md p-1 text-slate-400 hover:text-slate-200"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-slate-400">Sales data grouped by month</p>
        </div>
        {monthlyLoading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">Loading chart...</div>
        ) : (
          <div className="relative">
            <div className="mb-2 flex items-end justify-between" style={{ height: `${chartHeight}px` }}>
              {/* Y-axis labels */}
              <div className="flex h-full flex-col justify-between pr-4 text-xs text-slate-400">
                {[7, 6, 5, 4, 3, 2, 1, 0].map((i) => (
                  <span key={i}>{formatNumber((chartMax / 7) * i)}</span>
                ))}
              </div>
              {/* Chart bars */}
              <div className="flex flex-1 items-end justify-between gap-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthData = monthlySales?.find((m) => m.monthNumber === i + 1);
                  const sales = monthData?.totalSales || 0;
                  const height = (sales / chartMax) * chartHeight;
                  const monthNames = [
                    'JAN',
                    'FEB',
                    'MAR',
                    'APR',
                    'MAY',
                    'JUN',
                    'JUL',
                    'AUG',
                    'SEP',
                    'OCT',
                    'NOV',
                    'DEC'
                  ];
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center">
                      <div
                        className="w-full rounded-t transition hover:opacity-80"
                        style={{
                          height: `${Math.max(height, 2)}px`,
                          backgroundColor: sales > 0 ? '#3b82f6' : '#475569',
                          minHeight: '2px'
                        }}
                        title={`${monthNames[i]}: ${formatCurrency(sales)}`}
                      />
                      <span className="mt-2 text-xs text-slate-400">{monthNames[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">Month</div>
          </div>
        )}
      </div>

      {/* Total Sales Widget */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="mb-2 text-sm font-medium text-slate-400">Total Sales</h3>
          <p className="text-4xl font-bold text-slate-100">{formatCurrency(totalSales)}</p>
          {topMonth && (
            <div className="mt-4 text-sm text-slate-300">
              <p className="text-slate-400">Top performing month: {topMonth.month}</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(topMonth.totalSales)}
              </p>
            </div>
          )}
        </div>

        {/* Periodic Reports Section */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Periodic Reports</h3>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dayjs(periodStartDate).format('YYYY-MM-DD')}
                onChange={(e) => setPeriodStartDate(dayjs(e.target.value).startOf('day').toISOString())}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 focus:border-primary focus:outline-none"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={dayjs(periodEndDate).format('YYYY-MM-DD')}
                onChange={(e) => setPeriodEndDate(dayjs(e.target.value).endOf('day').toISOString())}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Products */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-300">Top Products</h4>
              {topProductsLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : topProducts && topProducts.length > 0 ? (
                <div className="space-y-2">
                  {topProducts.map((product, idx) => (
                    <div key={product.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">#{idx + 1}</span>
                        <span className="text-slate-200">{product.name}</span>
                      </div>
                      <span className="font-semibold text-primary">
                        {formatCurrency(product.totalSales)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No data to display</p>
              )}
            </div>

            {/* Hourly Sales */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-300">Hourly Sales</h4>
              {hourlyLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : hourlySales && hourlySales.length > 0 ? (
                <div className="space-y-1">
                  {hourlySales.slice(0, 5).map((item) => (
                    <div key={item.hour} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{item.hour}:00</span>
                      <span className="text-slate-200">{formatCurrency(item.totalSales)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No data to display</p>
              )}
            </div>

            {/* Total Sales Amount */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-300">Total Sales (Amount)</h4>
              {periodicLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : (
                <p className="text-3xl font-bold text-slate-100">
                  {formatCurrency(periodicSales?.totalSales || 0)}
                </p>
              )}
            </div>

            {/* Top Product Groups */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-300">Top Product Groups</h4>
              <p className="mb-2 text-xs text-slate-500">
                Top selling product groups in selected period
              </p>
              {topGroupsLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : topProductGroups && topProductGroups.length > 0 ? (
                <div className="space-y-2">
                  {topProductGroups.map((group, idx) => (
                    <div key={group.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">#{idx + 1}</span>
                        <span className="text-slate-200">{group.name}</span>
                      </div>
                      <span className="font-semibold text-primary">
                        {formatCurrency(group.totalSales)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No data to display</p>
              )}
            </div>

            {/* Top Customers */}
            <div className="md:col-span-2 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-300">Top Customers</h4>
              <p className="mb-2 text-xs text-slate-500">
                Lead customers in selected period (top 5)
              </p>
              {topCustomersLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : topCustomers && topCustomers.length > 0 ? (
                <div className="space-y-2">
                  {topCustomers.map((customer, idx) => (
                    <div key={customer.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">#{idx + 1}</span>
                        <div>
                          <p className="text-slate-200">{customer.name}</p>
                          {customer.email && (
                            <p className="text-xs text-slate-500">{customer.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatCurrency(customer.totalSpent)}
                        </p>
                        <p className="text-xs text-slate-500">{customer.purchaseCount} purchases</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No data to display</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
