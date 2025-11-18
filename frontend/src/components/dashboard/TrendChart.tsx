interface TrendPoint {
  bucket: string;
  totalSales: number;
}

interface TrendChartProps {
  data: TrendPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (!data.length) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400">
        No sales data available.
      </p>
    );
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

  const firstLabel = normalized[0]?.label;
  const lastLabel = normalized[normalized.length - 1]?.label;

  return (
    <div className="relative h-72 w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible rounded-3xl border border-white/5 bg-gradient-to-b from-slate-950/60 to-slate-950/20 p-4 text-slate-400"
        role="img"
        aria-label="Sales trend chart"
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </linearGradient>
          <linearGradient id="trendStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((value) => (
          <line
            key={value}
            x1="0"
            x2="100"
            y1={value}
            y2={value}
            stroke="rgba(148, 163, 184, 0.08)"
            strokeWidth="0.5"
          />
        ))}
        <path d={`${path} L 100,100 L 0,100 Z`} fill="url(#trendGradient)" />
        <path
          d={path}
          stroke="url(#trendStroke)"
          strokeWidth={2}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {normalized.map((point) => (
          <g key={`${point.x}-${point.y}`}>
            <circle cx={point.x} cy={point.y} r={1.5} fill="#38bdf8" />
          </g>
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-6 text-[10px] uppercase tracking-widest text-slate-500">
        <span>{firstLabel}</span>
        <span>{lastLabel}</span>
      </div>
    </div>
  );
}
