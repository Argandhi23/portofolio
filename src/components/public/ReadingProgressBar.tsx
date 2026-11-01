'use client';

import { useEffect, useRef } from 'react';

/**
 * GPU-composited top reading progress indicator for Case Study articles.
 * Uses transform: scaleX() via requestAnimationFrame (zero React re-renders).
 */
export function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let rafId: number | null = null;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;

      bar.style.transform = `scaleX(${progress.toFixed(4)})`;
      rafId = null;
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 z-50 h-[2.5px] bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        style={{ transform: 'scaleX(0)' }}
        className="h-full w-full origin-left bg-gradient-to-r from-[#FF5510] via-[#FF7A3D] to-[#FF5510] shadow-[0_0_12px_rgba(255,85,16,0.7)] will-change-transform"
      />
    </div>
  );
}
