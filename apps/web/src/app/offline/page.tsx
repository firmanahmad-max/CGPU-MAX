export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="bg-lime font-display text-lime-ink flex h-[46px] w-[46px] items-center justify-center rounded-[13px] text-[20px] font-extrabold">
        C
      </div>
      <h1 className="font-display text-ink-hi mt-5 text-[22px] font-bold tracking-tight">
        You&apos;re offline
      </h1>
      <p className="text-ink-muted mt-2 text-[13px] leading-relaxed">
        CGPU-MAX needs a connection to load live parts, prices, and benchmarks. Reconnect and try
        again — pages you&apos;ve already opened stay available.
      </p>
    </main>
  );
}
