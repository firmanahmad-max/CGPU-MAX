'use client';

import { useEffect, useRef, useState } from 'react';

// Firman's photo with a graceful fallback to the initial "F" on a gradient —
// drop `avatar.jpg` into apps/web/public/ and it shows automatically.
export function AboutAvatar() {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The <img> can 404 before React hydration attaches onError, so re-check the
  // load state on mount: a completed image with zero natural width is broken.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div
        aria-hidden
        className="from-lime to-cblue text-ground font-display flex h-[68px] w-[68px] flex-shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br text-[28px] font-extrabold"
      >
        F
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src="/avatar.jpg"
      alt="Firman Ahmad"
      width={68}
      height={68}
      onError={() => setFailed(true)}
      className="border-hairline h-[68px] w-[68px] flex-shrink-0 rounded-[18px] border object-cover"
    />
  );
}
