interface PerformanceRow {
  userId: string;
  name: string;
  salesCount: number;
  totalSales: number;
  totalTax: number;
}

export function PerformanceTable({ data }: { data: PerformanceRow[] }) {
  if (!data.length) {
    return <p className="text-sm text-slate-400">No performance data yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-950/60">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              User
            </th>
            <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sales
            </th>
            <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
              Revenue
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row) => (
            <tr key={row.userId} className="bg-slate-900/60">
              <td className="px-4 py-3 text-sm text-slate-200">{row.name}</td>
              <td className="px-4 py-3 text-right text-sm text-slate-200">{row.salesCount}</td>
              <td className="px-4 py-3 text-right text-sm text-slate-200">
                ${row.totalSales.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
