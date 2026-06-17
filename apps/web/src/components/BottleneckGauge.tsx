import { cn } from '@/lib/cn';

interface BottleneckGaugeProps {
  percentage: number;
  severity: 'optimal' | 'minor' | 'moderate' | 'significant' | 'severe';
  label?: string;
}

const SEVERITY_COLOR: Record<BottleneckGaugeProps['severity'], string> = {
  optimal: 'stroke-state-success',
  minor: 'stroke-state-success',
  moderate: 'stroke-state-warning',
  significant: 'stroke-state-warning',
  severe: 'stroke-state-danger',
};

const SEVERITY_TEXT: Record<BottleneckGaugeProps['severity'], string> = {
  optimal: 'text-state-success',
  minor: 'text-state-success',
  moderate: 'text-state-warning',
  significant: 'text-state-warning',
  severe: 'text-state-danger',
};

export function BottleneckGauge({ percentage, severity, label }: BottleneckGaugeProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = 70;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn('transition-all duration-500', SEVERITY_COLOR[severity])}
        />
      </svg>
      <div className="-mt-[120px] mb-[40px] text-center">
        <p className={cn('font-display text-4xl font-semibold', SEVERITY_TEXT[severity])}>
          {clamped.toFixed(1)}%
        </p>
        <p className="label mt-1">{severity}</p>
      </div>
      {label && <p className="tracking-label mt-2 text-xs uppercase text-slate-400">{label}</p>}
    </div>
  );
}
