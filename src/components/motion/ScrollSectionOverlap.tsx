'use client';

import React, { useEffect, useRef } from 'react';
import {
  computeSectionOverlapState,
  computeWindowedScrollProgress,
  easeOutCubic,
  interpolateHexColor,
} from '@/lib/scroll-math';
import { registerScrollTarget } from '@/components/motion/scroll-coordinator';
import { cn } from '@/lib/utils';

interface ScrollSectionOverlapProps {
  children: React.ReactNode;
  id?: string;
  zIndex?: number;
  overlapPrevious?: boolean;
  recedeOnExit?: boolean;
  /**
   * 'cream': Morphs background from #0A0809 (Dark) -> #F5F0EB (Warm Editorial Cream) on scroll.
   * 'none': Keeps static background.
   */
  colorMorph?: 'cream' | 'none';
  className?: string;
  innerClassName?: string;
}

/**
 * Awwwards-Style Architectural Section Wrapper:
 * 1. Rises as a heavy rounded slab over the previous section (`overlapPrevious`).
 * 2. Smoothly morphs background, surface, and foreground colors on scroll (`colorMorph="cream"`).
 * 3. Pins, scales down (`0.932`), and darkens under a veil as the next section slides up over it (`recedeOnExit`).
 */
export function ScrollSectionOverlap({
  children,
  id,
  zIndex = 20,
  overlapPrevious = true,
  recedeOnExit = true,
  colorMorph = 'none',
  className,
  innerClassName,
}: ScrollSectionOverlapProps) {
  const outerRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    const veil = veilRef.current;
    if (!outer || !stage) return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      if (colorMorph === 'cream') {
        outer.style.backgroundColor = '#F5F0EB';
        outer.style.setProperty('--sec-fg', '#0D0D0D');
        outer.style.setProperty('--sec-muted', '#57504A');
        outer.style.setProperty('--sec-card-bg', '#FFFFFF');
        outer.style.setProperty('--sec-card-border', 'rgba(13, 13, 13, 0.1)');
        outer.style.setProperty('--sec-divider', 'rgba(13, 13, 13, 0.12)');
      }
      return;
    }

    let lastCover = -1;
    let lastMorph = -1;

    return registerScrollTarget(
      outer,
      ({ rectTop, height, viewportHeight }) => {
        // 1. Scroll-Scrubbed Color Morphing (Dark Obsidian -> Warm Editorial Cream)
        if (colorMorph === 'cream') {
          const rawMorph = computeWindowedScrollProgress(
            rectTop,
            viewportHeight,
            0.84,
            0.28
          );
          const morph = easeOutCubic(rawMorph);

          const isMorphBoundary =
            (morph === 0 && lastMorph !== 0) ||
            (morph === 1 && lastMorph !== 1);

          if (isMorphBoundary || Math.abs(morph - lastMorph) >= 0.004) {
            lastMorph = morph;
            const bg = interpolateHexColor('#0A0809', '#F5F0EB', morph);
            const fg = interpolateHexColor('#FFFFFF', '#0D0D0D', morph);
            const muted = interpolateHexColor('#9E9A97', '#57504A', morph);
            const cardBg = interpolateHexColor('#141213', '#FFFFFF', morph);
            const borderAlpha = (0.08 + morph * 0.04).toFixed(3);
            const borderRgb = morph > 0.5 ? '13, 13, 13' : '255, 255, 255';

            outer.style.backgroundColor = bg;
            outer.style.setProperty('--sec-fg', fg);
            outer.style.setProperty('--sec-muted', muted);
            outer.style.setProperty('--sec-card-bg', cardBg);
            outer.style.setProperty(
              '--sec-card-border',
              `rgba(${borderRgb}, ${borderAlpha})`
            );
            outer.style.setProperty(
              '--sec-divider',
              `rgba(${borderRgb}, ${(0.08 + morph * 0.05).toFixed(3)})`
            );
            outer.style.setProperty('--sec-morph', morph.toFixed(3));
          }
        }

        // 2. Receding Curtain Overlap as the NEXT section slides up over this one
        if (recedeOnExit) {
          const overlap = computeSectionOverlapState(
            rectTop,
            height,
            viewportHeight
          );
          const isCoverBoundary =
            (overlap.coverProgress === 0 && lastCover !== 0) ||
            (overlap.coverProgress === 1 && lastCover !== 1);

          if (
            isCoverBoundary ||
            Math.abs(overlap.coverProgress - lastCover) >= 0.002
          ) {
            lastCover = overlap.coverProgress;

            if (overlap.coverProgress <= 0.001) {
              stage.style.transform = 'none';
              if (veil) veil.style.opacity = '0';
            } else {
              stage.style.transform = `perspective(1400px) translate3d(0, ${overlap.translateY}px, 0) scale(${overlap.scale})`;
              if (veil) {
                veil.style.opacity = String(overlap.veilOpacity);
              }
            }
          }
        }
      }
    );
  }, [colorMorph, recedeOnExit]);

  return (
    <section
      ref={outerRef}
      id={id}
      style={{ zIndex }}
      className={cn(
        'relative transition-shadow',
        overlapPrevious &&
          '-mt-10 sm:-mt-14 rounded-t-[38px] sm:rounded-t-[52px] shadow-[0_-36px_90px_rgba(0,0,0,0.88)] border-t border-white/[0.08]',
        colorMorph === 'cream' ? 'bg-[#0A0809]' : 'bg-[#080808]',
        className
      )}
    >
      <div
        ref={stageRef}
        className={cn('relative origin-bottom', innerClassName)}
      >
        {children}
      </div>

      {/* Depth shadow veil when covered by the next section */}
      {recedeOnExit && (
        <div
          ref={veilRef}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 z-40 bg-[#050102] opacity-0',
            overlapPrevious && 'rounded-t-[38px] sm:rounded-t-[52px]'
          )}
        />
      )}
    </section>
  );
}
