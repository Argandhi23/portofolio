'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlyphDefinition {
  ch: string;
  delayMs: number;
  durationMs: number;
  paths: readonly string[];
}

/**
 * Clean, zero-seam Plus Jakarta Sans ExtraBold vector contours for "Argandhi."
 * Each contour uses `pathLength={1}` so CSS `stroke-dashoffset` traces every letter
 * smoothly from 0% to 100% on the compositor thread with zero font-loading delay (FOUT).
 */
const ARGANDHI_GLYPHS: readonly GlyphDefinition[] = [
  {
    ch: 'A',
    delayMs: 120,
    durationMs: 1380,
    paths: [
      'M1.32 124.56 L31.56 35.16 L56.28 35.16 L86.52 124.56 L66.24 124.56 L60.24 106.32 L27.48 106.32 L21.48 124.56 Z',
      'M32.64 90.12 L43.86 55.78 L55.08 90.12 Z',
    ],
  },
  {
    ch: 'r',
    delayMs: 260,
    durationMs: 1380,
    paths: [
      'M90.24 124.56 L90.24 59.04 L107.04 59.04 L107.04 68.4 Q109.2 63.5 112.98 61.26 Q117.96 58.32 124.8 58.32 L128.64 58.32 L128.64 73.92 L123 73.92 Q116.4 73.92 112.32 77.94 Q108.24 81.96 108.24 89.28 L108.24 124.56 Z',
    ],
  },
  {
    ch: 'g',
    delayMs: 400,
    durationMs: 1380,
    paths: [
      'M164.52 150.96 Q156.96 150.96 150.48 148.44 Q144 145.92 139.38 141.42 Q134.76 136.92 132.72 130.8 L149.4 124.92 Q150.72 129.48 154.8 132.12 Q158.88 134.76 164.52 134.76 Q168.96 134.76 172.2 133.14 Q175.44 131.52 177.18 128.4 Q178.92 125.28 178.92 121.08 L178.92 115.4 Q176.6 117.2 173.76 118.62 Q168.48 121.32 161.4 121.32 Q152.28 121.32 145.08 117.18 Q137.88 113.04 133.8 105.78 Q129.72 98.52 129.72 89.28 Q129.72 80.04 133.8 72.9 Q137.88 65.76 144.96 61.68 Q152.04 57.6 161.04 57.6 Q168.12 57.6 173.4 60.42 Q177.5 62.6 180.12 65.8 L180.12 59.04 L196.92 59.04 L196.92 121.08 Q196.92 129.72 192.72 136.5 Q188.52 143.28 181.26 147.12 Q174 150.96 164.52 150.96 Z',
      'M163.92 105 Q168.48 105 171.84 103.08 Q175.2 101.16 177.06 97.68 Q178.92 94.2 178.92 89.52 Q178.92 84.84 177 81.3 Q175.08 77.76 171.72 75.78 Q168.36 73.8 163.92 73.8 Q159.36 73.8 155.82 75.78 Q152.28 77.76 150.3 81.3 Q148.32 84.84 148.32 89.52 Q148.32 94.08 150.3 97.56 Q152.28 101.04 155.82 103.02 Q159.36 105 163.92 105 Z',
    ],
  },
  {
    ch: 'a',
    delayMs: 540,
    durationMs: 1380,
    paths: [
      'M226.2 126 Q219.12 126 213.96 123.72 Q208.8 121.44 206.04 117.18 Q203.28 112.92 203.28 107.04 Q203.28 101.52 205.8 97.26 Q208.32 93 213.54 90.12 Q218.76 87.24 226.56 86.04 L244.68 83.12 L244.68 81.36 Q244.68 77.64 241.74 75.12 Q238.8 72.6 233.76 72.6 Q228.96 72.6 225.3 75.24 Q221.64 77.88 219.96 82.2 L205.56 75.36 Q207.48 69.84 211.68 65.88 Q215.88 61.92 221.76 59.76 Q227.64 57.6 234.6 57.6 Q242.88 57.6 249.24 60.6 Q255.6 63.6 259.14 68.94 Q262.68 74.28 262.68 81.36 L262.68 124.56 L245.88 124.56 L245.88 118.4 Q244.8 119.5 243.6 120.42 Q240.12 123.24 235.8 124.62 Q231.48 126 226.2 126 Z',
      'M244.68 96.34 L229.8 99 Q225.96 99.72 223.92 101.46 Q221.88 103.2 221.88 106.44 Q221.88 109.44 224.16 111.12 Q226.44 112.8 229.8 112.8 Q234.24 112.8 237.6 110.88 Q240.96 108.96 242.82 105.66 Q244.68 102.36 244.68 98.4 Z',
    ],
  },
  {
    ch: 'n',
    delayMs: 680,
    durationMs: 1380,
    paths: [
      'M271.68 124.56 L271.68 59.04 L288.48 59.04 L288.48 66.8 Q290.8 62.6 294.9 60.42 Q300 57.6 306.84 57.6 Q314.28 57.6 319.86 60.72 Q325.44 63.84 328.56 69.42 Q331.68 75 331.68 82.44 L331.68 124.56 L313.68 124.56 L313.68 86.28 Q313.68 82.44 312.18 79.68 Q310.68 76.92 307.98 75.36 Q305.28 73.8 301.68 73.8 Q298.2 73.8 295.44 75.36 Q292.68 76.92 291.18 79.68 Q289.68 82.44 289.68 86.28 L289.68 124.56 Z',
    ],
  },
  {
    ch: 'd',
    delayMs: 820,
    durationMs: 1380,
    paths: [
      'M370.2 126 Q360.6 126 353.04 121.44 Q345.48 116.88 341.1 109.08 Q336.72 101.28 336.72 91.8 Q336.72 82.2 341.16 74.46 Q345.6 66.72 353.16 62.16 Q360.72 57.6 370.08 57.6 Q377.28 57.6 382.86 60.3 Q386.5 62.1 388.92 64.6 L388.92 33.72 L406.92 33.72 L406.92 124.56 L390.12 124.56 L390.12 118.4 Q387.2 121.6 382.68 123.54 Q376.92 126 370.2 126 Z',
      'M372.36 109.8 Q377.28 109.8 381 107.52 Q384.72 105.24 386.82 101.16 Q388.92 97.08 388.92 91.8 Q388.92 86.52 386.82 82.44 Q384.72 78.36 381 76.08 Q377.28 73.8 372.36 73.8 Q367.44 73.8 363.54 76.14 Q359.64 78.48 357.48 82.5 Q355.32 86.52 355.32 91.8 Q355.32 97.08 357.48 101.16 Q359.64 105.24 363.54 107.52 Q367.44 109.8 372.36 109.8 Z',
    ],
  },
  {
    ch: 'h',
    delayMs: 960,
    durationMs: 1380,
    paths: [
      'M415.92 124.56 L415.92 33.72 L433.92 33.72 L433.92 64.5 Q436.1 62 439.14 60.42 Q444.24 57.6 451.08 57.6 Q458.52 57.6 464.1 60.72 Q469.68 63.84 472.8 69.42 Q475.92 75 475.92 82.44 L475.92 124.56 L457.92 124.56 L457.92 86.28 Q457.92 82.44 456.42 79.68 Q454.92 76.92 452.22 75.36 Q449.52 73.8 445.92 73.8 Q442.44 73.8 439.68 75.36 Q436.92 76.92 435.42 79.68 Q433.92 82.44 433.92 86.28 L433.92 124.56 Z',
    ],
  },
  {
    ch: 'i',
    delayMs: 1100,
    durationMs: 1380,
    paths: [
      'M483.6 124.56 L483.6 59.04 L501.6 59.04 L501.6 124.56 Z',
      'M483.6 53.16 L483.6 35.16 L501.6 35.16 L501.6 53.16 Z',
    ],
  },
  {
    ch: '.',
    delayMs: 1950,
    durationMs: 580,
    paths: ['M512.5 124.56 L512.5 106.56 L530.5 106.56 L530.5 124.56 Z'],
  },
];

type PreloaderPhase = 'drawing' | 'lifting' | 'skipping' | 'done';

const CURTAIN_LIFT_START_MS = 3300;
const TOTAL_FINISH_MS = 4220;
const SKIP_FINISH_MS = 540;

/**
 * IntroPreloader — Zero-bloat SVG Stroke-Draw & Curtain Slide-Up Reveal ("Argandhi.")
 * - Pure solid black (#000000) curtain with full brand-orange (#9E1B32) vector outline.
 * - Mounted in PublicLayout so it plays on initial entry / hard refresh (F5),
 *   never replays across client-side SPA route transitions, and unmounts completely after exit.
 */
export function IntroPreloader() {
  const [phase, setPhase] = useState<PreloaderPhase>('drawing');

  const triggerFastSkip = useCallback(() => {
    setPhase((prev) => (prev === 'drawing' ? 'skipping' : prev));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReduced) {
      const immediateTimer = window.setTimeout(() => setPhase('done'), 0);
      return () => window.clearTimeout(immediateTimer);
    }

    const liftTimer = window.setTimeout(() => {
      setPhase((prev) => (prev === 'drawing' ? 'lifting' : prev));
    }, CURTAIN_LIFT_START_MS);

    const finishTimer = window.setTimeout(() => {
      setPhase('done');
    }, TOTAL_FINISH_MS);

    return () => {
      window.clearTimeout(liftTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  // Unmount cleanly after fast-skip curtain exit completes
  useEffect(() => {
    if (phase !== 'skipping') return;
    const skipTimer = window.setTimeout(() => {
      setPhase('done');
    }, SKIP_FINISH_MS);
    return () => window.clearTimeout(skipTimer);
  }, [phase]);

  // Prevent scroll drift during the 1.86s stroke-drawing phase without hiding scrollbar (zero layout shift)
  useEffect(() => {
    if (phase !== 'drawing') return;

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerFastSkip();
        return;
      }
      if (
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'PageDown' ||
        e.key === 'PageUp'
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, triggerFastSkip]);

  if (phase === 'done') {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      data-testid="intro-preloader"
      onClick={triggerFastSkip}
      onAnimationEnd={(e) => {
        if (
          e.target === e.currentTarget &&
          e.animationName === 'introCurtainLift'
        ) {
          setPhase('done');
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        minHeight: '100vh',
        zIndex: 100,
        backgroundColor: '#000000',
      }}
      className={cn(
        'intro-preloader',
        phase === 'lifting' && 'intro-preloader--lifting',
        phase === 'skipping' && 'intro-preloader--skip'
      )}
    >
      <div className="intro-stage">
        <svg
          viewBox="-12 20 556 142"
          className="w-[min(82vw,680px)] h-auto overflow-visible"
          focusable="false"
        >
          {ARGANDHI_GLYPHS.map((glyph, glyphIdx) => {
            const style = {
              '--glyph-delay': `${glyph.delayMs}ms`,
              '--glyph-duration': `${glyph.durationMs}ms`,
            } as React.CSSProperties;

            return (
              <g key={`${glyph.ch}-${glyphIdx}`}>
                {glyph.paths.map((d, contourIdx) => (
                  <path
                    key={contourIdx}
                    d={d}
                    pathLength={1}
                    fill="none"
                    stroke="#9E1B32"
                    strokeWidth={1.95}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={1.04}
                    strokeDashoffset={1.04}
                    style={style}
                    className="intro-stroke-path"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
