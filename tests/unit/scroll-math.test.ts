import { describe, expect, it } from 'vitest';
import {
  clamp,
  computeCardPerspectiveState,
  computeEyePortalState,
  computeHeroExitProgress,
  computeSectionOverlapState,
  computeViewportTraverseProgress,
  computeWindowedScrollProgress,
  computeWordHighlightOpacity,
  damp,
  easeOutCubic,
  interpolateHexColor,
  lerp,
  smoothstep,
} from '@/lib/scroll-math';
import {
  computeRigPoseMetrics,
  evaluatePath,
  FRAGMENT_SHADER_SOURCE,
  HEAD_RIM_PATH,
  projectWorldPointToCanvasUV,
  RIGHT_EYE_WORLD_AT_FRONT,
  VERTEX_SHADER_SOURCE,
} from '@/lib/hero-3d-bust';

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

  it('computes 3D card perspective state across entry, center focus, and top exit', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);

    // Entering at bottom (rectTop = 980 in 1000px viewport)
    const entering = computeCardPerspectiveState(980, 420, 1000, 1);
    expect(entering.rotateX).toBeGreaterThan(8);
    expect(entering.scale).toBeLessThan(0.93);
    expect(entering.translateY).toBeGreaterThan(35);

    // Centered in viewport (rectTop = 300 in 1000px viewport)
    const centered = computeCardPerspectiveState(300, 420, 1000, 1);
    expect(centered.rotateX).toBe(0);
    expect(centered.scale).toBe(1);
    expect(centered.translateY).toBe(0);
    expect(centered.opacity).toBe(1);

    // Exiting past top (rectTop = -300 in 1000px viewport)
    const exiting = computeCardPerspectiveState(-300, 420, 1000, 1);
    expect(exiting.rotateX).toBeLessThan(0);
    expect(exiting.scale).toBeLessThan(1);
    expect(exiting.translateY).toBeGreaterThan(0);
  });

  it('interpolates hex colors and computes section curtain overlap metrics', () => {
    expect(interpolateHexColor('#000000', '#ffffff', 0)).toBe('rgb(0, 0, 0)');
    expect(interpolateHexColor('#000000', '#ffffff', 1)).toBe(
      'rgb(255, 255, 255)'
    );

    const uncovered = computeSectionOverlapState(0, 1200, 1000);
    expect(uncovered.coverProgress).toBe(0);
    expect(uncovered.scale).toBe(1);

    const covered = computeSectionOverlapState(-1100, 1200, 1000);
    expect(covered.coverProgress).toBe(1);
    expect(covered.scale).toBeLessThan(0.94);
    expect(covered.translateY).toBeGreaterThan(100);
  });

  it('computes GlyphPortal eye-zoom camera physics, roll bank, and portal reveal state', () => {
    expect(smoothstep(0, 1, 0)).toBe(0);
    expect(smoothstep(0, 1, 0.5)).toBe(0.5);
    expect(smoothstep(0, 1, 1)).toBe(1);

    const target = { x: 580, y: 310, radius: 2.4 };

    // Opening frame (p = 0): side profile, eyes unlit, scale = 1
    const start = computeEyePortalState(0, 1440, 900, target);
    expect(start.headTurnProgress).toBe(0);
    expect(start.eyesGlowProgress).toBe(0);
    expect(start.scale).toBeCloseTo(1, 4);
    expect(start.focusX).toBeCloseTo(720, 2);
    expect(start.focusY).toBeCloseTo(450, 2);
    expect(start.roll).toBe(0);
    expect(start.irisRadius).toBeCloseTo(2.4, 2);
    expect(start.frontOpacity).toBe(1);
    expect(start.irisOpacity).toBe(0);
    expect(start.portalComplete).toBe(false);
    expect(start.revealOpacity).toBe(0);

    // Phase 1 completion (p = 0.33): head turned forward & sharp white eyes glowing, camera at gentle 1.06x push
    const turned = computeEyePortalState(0.33, 1440, 900, target);
    expect(turned.headTurnProgress).toBe(1);
    expect(turned.eyesGlowProgress).toBe(1);
    expect(turned.frontOpacity).toBe(0);
    expect(turned.scale).toBeCloseTo(1.06, 2);
    expect(turned.irisRadius).toBeCloseTo(2.4, 2);

    // Mid-flight zoom into the anatomical right eye (p = 0.595 -> t = 0.5)
    const mid = computeEyePortalState(0.595, 1440, 900, target);
    expect(mid.scale).toBeGreaterThan(3);
    expect(mid.roll).toBeLessThan(-3);
    expect(mid.irisOpacity).toBe(1);
    expect(mid.portalComplete).toBe(false);

    // Portal fills viewport (p = 0.86 -> t = 1)
    const filled = computeEyePortalState(0.86, 1440, 900, target);
    expect(filled.portalComplete).toBe(true);
    expect(filled.focusX).toBeCloseTo(target.x, 3);
    expect(filled.focusY).toBeCloseTo(target.y, 3);
    expect(filled.scale * filled.irisRadius).toBeGreaterThan(
      Math.hypot(1440, 900) / 2
    );

    // Full Section 2 reveal (p = 1)
    const end = computeEyePortalState(1, 1440, 900, target);
    expect(end.portalComplete).toBe(true);
    expect(end.revealOpacity).toBe(1);

    // Reverse scroll-back verification (p: 1 -> 0.33 -> 0) restores 100% of Hero state
    const reverseMid = computeEyePortalState(0.33, 1440, 900, target);
    expect(reverseMid.headTurnProgress).toBe(1);
    expect(reverseMid.eyesGlowProgress).toBe(1);
    const reverseRestored = computeEyePortalState(0, 1440, 900, target);
    expect(reverseRestored.headTurnProgress).toBe(0);
    expect(reverseRestored.eyesGlowProgress).toBe(0);
    expect(reverseRestored.frontOpacity).toBe(1);
    expect(reverseRestored.scale).toBe(1);
    expect(reverseRestored.roll).toBe(0);
  });

  it('projects 3D anatomical right eye world coordinates accurately into 2D canvas UV space', () => {
    const uv = projectWorldPointToCanvasUV(RIGHT_EYE_WORLD_AT_FRONT, 800 / 740);
    // Right eye (viewer's left) is slightly left of horizontal center (0.40..0.49) and upper-mid vertically (0.30..0.46)
    expect(uv.u).toBeGreaterThan(0.4);
    expect(uv.u).toBeLessThan(0.49);
    expect(uv.v).toBeGreaterThan(0.3);
    expect(uv.v).toBeLessThan(0.46);

    // Center point on camera axis projects to u = 0.5
    const centerUv = projectWorldPointToCanvasUV({ x: 0, y: -0.08, z: 0 }, 800 / 740);
    expect(centerUv.u).toBeCloseTo(0.5, 3);

    expect(VERTEX_SHADER_SOURCE).toContain('gl_Position');
    expect(FRAGMENT_SHADER_SOURCE).toContain('uHeadTurn');
    expect(FRAGMENT_SHADER_SOURCE).toContain('uEyesGlow');

    // Verify 3-pose SVG Bezier morph topology & overlapping action across 0.0 -> 0.5 -> 1.0
    const pose0 = computeRigPoseMetrics(0);
    const poseMid = computeRigPoseMetrics(0.5);
    const poseFront = computeRigPoseMetrics(1);

    expect(pose0.farEyeCx).toBeLessThan(pose0.nearEyeCx);
    expect(poseMid.farEyeCx).toBeLessThan(poseMid.nearEyeCx);
    expect(poseFront.farEyeCx).toBe(374);
    expect(poseFront.nearEyeCx).toBe(426);
    expect(poseMid.headT).toBeGreaterThanOrEqual(poseMid.hairT);
    expect(poseMid.hairT).toBeGreaterThanOrEqual(poseMid.torsoT);

    const pathSide = evaluatePath(HEAD_RIM_PATH, 0);
    const pathMid = evaluatePath(HEAD_RIM_PATH, 0.5);
    const pathFront = evaluatePath(HEAD_RIM_PATH, 1);
    expect(pathSide).toContain('M 382 162');
    expect(pathMid).toContain('M 392.0 162.0');
    expect(pathFront).toContain('M 400 162');
  });
});
