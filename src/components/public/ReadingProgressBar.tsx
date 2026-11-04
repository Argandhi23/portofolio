'use client';

import { useEffect, useRef } from 'react';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';

/**
 * Zero-reflow GPU-composited top reading progress indicator for Case Study articles.
 * Uses cached `maxScroll` from ScrollCoordinator (0 `scrollHeight` reads during scrolling).
 */
export function ReadingProgressBar() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const bar = barRef.current;
    if (!host || !bar) return;

    let lastProgress = -1;

    return registerScrollTarget(host, ({ scrollY, maxScroll }) => {
      const progress =
        maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;

      if (Math.abs(progress - lastProgress) < 0.001) return;
      lastProgress = progress;

      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    });
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="fixed top-0 inset-x-0 z-50 h-[2.5px] bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        style={{ transform: 'scaleX(0)' }}
        className="h-full w-full origin-left bg-gradient-to-r from-[#9E1B32] via-[#D6335C] to-[#9E1B32]"
      />
    </div>
  );
}
