import { describe, expect, it } from 'vitest';
import {
  clamp,
  computeHeroExitProgress,
  computeViewportTraverseProgress,
  computeWindowedScrollProgress,
  computeWordHighlightOpacity,
  damp,
  lerp,
} from '@/lib/scroll-math';

describe('scroll-math motion engine primitives', () => {
  it('clamps values strictly within [min, max]', () => {
    expect(clamp(-10, 0, 1)).toBe(0);
    expect(clamp(0.45, 0, 1)).toBe(0.45);
    expect(clamp(5, 0, 1)).toBe(1);
  });

  it('interpolates linearly and applies frame-rate independent damping', () => {
    expect(lerp(0, 100, 0.25)).toBe(25);
    const step60hz = damp(0, 100, 8, 1 / 60);
    const twoSteps120hz = damp(damp(0, 100, 8, 1 / 120), 100, 8, 1 / 120);
    expect(step60hz).toBeGreaterThan(0);
    expect(Math.abs(step60hz - twoSteps120hz)).toBeLessThan(0.05);
  });

  it('computes viewport traverse progress cleanly around center 0.5', () => {
    // Viewport 1000px, element height 200px: center aligned when rectTop = 400
    expect(computeViewportTraverseProgress(1000, 200, 1000)).toBe(0);
    expect(computeViewportTraverseProgress(400, 200, 1000)).toBeCloseTo(0.5, 4);
    expect(computeViewportTraverseProgress(-200, 200, 1000)).toBe(1);
  });

  it('computes windowed scroll progress between enter and complete ratios', () => {
    expect(computeWindowedScrollProgress(950, 1000, 0.9, 0.3)).toBe(0);
    expect(computeWindowedScrollProgress(600, 1000, 0.9, 0.3)).toBeCloseTo(0.5, 4);
    expect(computeWindowedScrollProgress(250, 1000, 0.9, 0.3)).toBe(1);
  });

  it('computes hero exit progress from top of document', () => {
    expect(computeHeroExitProgress(0, 700)).toBe(0);
    expect(computeHeroExitProgress(-350, 700)).toBeCloseTo(0.5, 4);
    expect(computeHeroExitProgress(-800, 700)).toBe(1);
  });

  it('illuminates words progressively from minOpacity to 1', () => {
    expect(computeWordHighlightOpacity(0, 0, 10, 0.16)).toBe(0.16);
    expect(computeWordHighlightOpacity(1, 9, 10, 0.16)).toBe(1);
    const firstWordMid = computeWordHighlightOpacity(0.35, 0, 10, 0.16);
    const lastWordMid = computeWordHighlightOpacity(0.35, 9, 10, 0.16);
    expect(firstWordMid).toBeGreaterThan(lastWordMid);
  });
});
