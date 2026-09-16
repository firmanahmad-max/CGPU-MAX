export type Severity = 'optimal' | 'minor' | 'moderate' | 'significant' | 'severe';

interface BottleneckGaugeProps {
  percentage: number;
  severity: Severity;
  label?: string;
}

// Console severity → arc color (oklch, used directly as an SVG stroke).
export const severityColor = (s: Severity): string =>
  s === 'optimal' || s === 'minor'
    ? 'oklch(0.78 0.17 152)'
    : s === 'moderate'
      ? 'oklch(0.80 0.15 75)'
      : s === 'significant'
        ? 'oklch(0.72 0.17 55)'
        : 'oklch(0.65 0.19 25)';

// Semicircle gauge with a needle, matching the Console reference (1a).
export function BottleneckGauge({ percentage, severity, label }: BottleneckGaugeProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const color = severityColor(severity);
  // Arc spans 180°; the reference uses a ~52% ceiling for a full sweep so
  // real-world bottlenecks read boldly. dash length ≈ π·100.
  const frac = clamped / 52;
  const dash = 314.16;
  const offset = (dash * (1 - Math.min(1, frac))).toFixed(1);
  const angle = Math.PI - Math.min(1, frac) * Math.PI;
  const needleX = (125 + 100 * Math.cos(angle)).toFixed(1);
  const needleY = (138 - 100 * Math.sin(angle)).toFixed(1);

  return (
    <div className="relative h-[170px] w-[250px]">
      <svg viewBox="0 0 250 150" className="block h-[150px] w-[250px]">
        <path
          d="M25 138 A100 100 0 0 1 225 138"
          fill="none"
          stroke="rgba(255,255,255,.08)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M25 138 A100 100 0 0 1 225 138"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={dash}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .55s cubic-bezier(.2,.7,.2,1), stroke .3s' }}
        />
        <circle cx={needleX} cy={needleY} r="7" fill="#fff" />
        <circle cx={needleX} cy={needleY} r="3" fill={color} />
      </svg>
      <div className="absolute left-0 right-0 top-[56px] text-center">
        <p
          className="m-0 font-mono text-[44px] font-bold leading-none tracking-tight"
          style={{ color }}
        >
          {clamped.toFixed(1)}
        </p>
        <p className="text-ink-faint mt-[6px] text-[10px] font-semibold uppercase tracking-[0.16em]">
          {label ?? severity}
        </p>
      </div>
    </div>
  );
}
