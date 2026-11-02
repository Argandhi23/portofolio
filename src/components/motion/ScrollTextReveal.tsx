'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import {
  computeWindowedScrollProgress,
  computeWordHighlightOpacity,
} from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

interface ScrollTextRevealProps {
  text: string;
  highlightWords?: string[];
  className?: string;
  enterRatio?: number;
  completeRatio?: number;
}

/**
 * Zero-reflow GSAP SplitText + ScrollTrigger scrub primitive.
 * Caches per-word opacity and culls off-screen updates so 0 DOM reads or redundant writes occur.
 */
export function ScrollTextReveal({
  text,
  highlightWords = [],
  className,
  enterRatio = 0.88,
  completeRatio = 0.28,
}: ScrollTextRevealProps) {
  const containerRef = useRef<HTMLParagraphElement | null>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const words = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean),
    [text]
  );

  const highlightSet = useMemo(
    () =>
      new Set(
        highlightWords.map((w) =>
          w.toLowerCase().replace(/[^a-z0-9]/gi, '')
        )
      ),
    [highlightWords]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || words.length === 0) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      wordRefs.current.forEach((span) => {
        if (span) span.style.opacity = '1';
      });
      return;
    }

    let lastProgress = -1;
    const lastWordOpacities = new Float32Array(words.length).fill(-1);

    return registerScrollTarget(container, ({ rectTop, viewportHeight }) => {
      const progress = computeWindowedScrollProgress(
        rectTop,
        viewportHeight,
        enterRatio,
        completeRatio
      );

      if (Math.abs(progress - lastProgress) < 0.004) return;
      lastProgress = progress;

      const total = words.length;
      for (let i = 0; i < total; i += 1) {
        const span = wordRefs.current[i];
        if (!span) continue;
        const opacity = computeWordHighlightOpacity(progress, i, total, 0.17);
        if (Math.abs(opacity - lastWordOpacities[i]) >= 0.012) {
          lastWordOpacities[i] = opacity;
          span.style.opacity = String(opacity);
        }
      }
    });
  }, [words, enterRatio, completeRatio]);

  return (
    <p
      ref={containerRef}
      aria-label={text}
      className={cn(
        'font-bold tracking-[-0.03em] leading-[1.18] flex flex-wrap gap-x-[0.28em] gap-y-1.5',
        className
      )}
    >
      {words.map((word, idx) => {
        const normalized = word.toLowerCase().replace(/[^a-z0-9]/gi, '');
        const isAccent = highlightSet.has(normalized);

        return (
          <span
            key={`${word}-${idx}`}
            aria-hidden="true"
            ref={(el) => {
              wordRefs.current[idx] = el;
            }}
            style={{ opacity: 0.17 }}
            className={cn(
              'inline-block',
              isAccent ? 'text-[#FF5510]' : 'text-white'
            )}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}
