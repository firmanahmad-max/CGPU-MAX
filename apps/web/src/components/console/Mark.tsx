// Manufacturer wordmark chip — colored per brand (NVIDIA lime, AMD red,
// INTEL blue). Replaces the old emoji/pill brand markers per the Console spec.
export function Mark({ mfr, className = '' }: { mfr: string; className?: string }) {
  const m = mfr.toUpperCase();
  const color =
    m === 'AMD'
      ? 'text-cred border-cred/35'
      : m === 'INTEL'
        ? 'text-cblue border-cblue/35'
        : 'text-lime border-lime/35';
  return <span className={`mark ${color} ${className}`}>{m}</span>;
}
