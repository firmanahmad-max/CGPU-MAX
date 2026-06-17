import { cn } from '@/lib/cn';

interface PillProps {
  children: React.ReactNode;
  variant?: 'default' | 'intel' | 'amd' | 'nvidia';
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<PillProps['variant']>, string> = {
  default: 'border-white/15 bg-white/5 text-slate-200',
  intel: 'border-accent-blue/40 bg-accent-blue/10 text-blue-300',
  amd: 'border-accent-coral/40 bg-accent-coral/10 text-orange-300',
  nvidia: 'border-accent-purple/40 bg-accent-purple/10 text-purple-300',
};

export function Pill({ children, variant = 'default', className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill border px-3 py-1 text-xs font-medium uppercase tracking-label',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
