import { cn } from '@/lib/cn';

interface PillProps {
  children: React.ReactNode;
  variant?: 'default' | 'intel' | 'amd' | 'nvidia';
  className?: string;
}

const VARIANT_CLASSES: Record<NonNullable<PillProps['variant']>, string> = {
  default: 'border-hairline bg-panel text-ink-muted',
  intel: 'border-cblue/40 bg-cblue/10 text-cblue-bright',
  amd: 'border-cred/40 bg-cred/10 text-cred',
  nvidia: 'border-lime/40 bg-lime/10 text-lime-bright',
};

export function Pill({ children, variant = 'default', className }: PillProps) {
  return (
    <span
      className={cn(
        'rounded-pill tracking-label inline-flex items-center border px-3 py-1 text-[11px] font-semibold uppercase',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
