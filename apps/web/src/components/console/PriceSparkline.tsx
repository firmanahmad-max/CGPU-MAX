// 90-day price trend as an inline SVG sparkline (Console reference style):
// lime line over a faint lime area fill. Pure/server — takes USD points.
export function PriceSparkline({
  points,
  width = 280,
  height = 56,
  className,
}: {
  points: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return null;

  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const span = hi - lo || 1;
  const pad = 3;
  const stepX = (width - pad * 2) / (points.length - 1);

  const coords = points.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - lo) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = coords.join(' ');
  const area = `${pad},${height} ${line} ${(width - pad).toFixed(1)},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ display: 'block', width: '100%', height }}
      role="img"
      aria-label="90-day price trend"
    >
      <polyline points={area} fill="oklch(0.78 0.17 152 / 0.12)" stroke="none" />
      <polyline
        points={line}
        fill="none"
        stroke="oklch(0.78 0.17 152)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
