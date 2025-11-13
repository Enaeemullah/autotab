interface TrendPoint {
  bucket: string;
  totalSales: number;
}

interface TrendChartProps {
  data: TrendPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data.length) {
    return <p className="text-sm text-slate-400">No sales data available.</p>;
  }
  const max = Math.max(...data.map((point) => point.totalSales));
  const normalized = data.map((point, idx) => ({
    x: (idx / Math.max(data.length - 1, 1)) * 100,
    y: max ? 100 - (point.totalSales / max) * 100 : 0,
    label: new Date(point.bucket).toLocaleDateString(),
    value: point.totalSales
  }));

  const path = normalized
    .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="h-64 w-full rounded-lg bg-slate-950/40 p-2">
      <path d={`${path} L 100,100 L 0,100 Z`} fill="rgba(37,99,235,0.2)" />
      <path d={path} stroke="#2563eb" strokeWidth={2} fill="none" />
      {normalized.map((point) => (
        <circle key={point.x} cx={point.x} cy={point.y} r={1.5} fill="#2563eb" />
      ))}
    </svg>
  );
}
