interface PerformanceRow {
  userId: string;
  name: string;
  salesCount: number;
  totalSales: number;
  totalTax: number;
}

export function PerformanceTable({ data }: { data: PerformanceRow[] }) {
  if (!data.length) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
        No performance data yet.
      </p>
    );
  }

  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  });

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/5 bg-white/5">
      <table className="min-w-full text-sm text-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.3em] text-slate-400">
            <th className="px-6 py-4 font-medium">Contributor</th>
            <th className="px-6 py-4 text-right font-medium">Sales</th>
            <th className="px-6 py-4 text-right font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const averageTicket = row.salesCount ? row.totalSales / row.salesCount : 0;
            return (
              <tr
                key={row.userId}
                className="border-t border-white/5 bg-white/[0.02] transition hover:bg-white/10"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-xs font-semibold text-slate-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{row.name}</p>
                      <p className="text-xs text-slate-400">
                        Avg. ticket {currency.format(averageTicket)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {row.salesCount} sales
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-white">
                  {currency.format(row.totalSales)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
