import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  buildBrowArcGeometry,
  buildEyeLensGeometry,
  buildSculptedCoatGeometry,
  buildSculptedEarGeometry,
  buildSculptedHairAssets,
  buildSculptedHeadGeometry,
  BUST_FRAGMENT_SHADER,
  BUST_VERTEX_SHADER,
  compute3DBustPose,
  computeRightEyeAnchorUV,
  EYE_FRAGMENT_SHADER,
  EYE_HALO_FRAGMENT_SHADER,
  HeroBustRigController,
} from '@/lib/hero-3d-geometry';

function assertFiniteGeometry(geo: THREE.BufferGeometry) {
  const pos = geo.getAttribute('position');
  const norm = geo.getAttribute('normal');
  expect(pos).toBeDefined();
  expect(norm).toBeDefined();
  expect(pos.count).toBeGreaterThan(10);
  expect(norm.count).toBe(pos.count);

  for (let i = 0; i < pos.count; i++) {
    expect(Number.isFinite(pos.getX(i))).toBe(true);
    expect(Number.isFinite(pos.getY(i))).toBe(true);
    expect(Number.isFinite(pos.getZ(i))).toBe(true);
    expect(Number.isFinite(norm.getX(i))).toBe(true);
    expect(Number.isFinite(norm.getY(i))).toBe(true);
    expect(Number.isFinite(norm.getZ(i))).toBe(true);
  }
}

describe('hero 3D sculpted bust geometry & kinematics', () => {
  it('computes overlapping-action 3D head/torso kinematics across turn [0..1]', () => {
    const side = compute3DBustPose(0);
    expect(side.turn).toBe(0);
    expect(side.headTotalYaw).toBeLessThan(-1.3);
    expect(side.torsoYaw).toBeLessThan(-0.8);
    expect(side.eyesGlow).toBe(0);
    expect(side.pointerWeight).toBe(1);

    const mid = compute3DBustPose(0.5);
    expect(mid.headT).toBeGreaterThan(mid.hairT);
    expect(mid.hairT).toBeGreaterThan(mid.torsoT);
    expect(mid.headPitch).toBeLessThan(0);
    expect(mid.headRoll).toBeLessThan(0);

    const front = compute3DBustPose(1);
    expect(front.headTotalYaw).toBeCloseTo(0, 6);
    expect(front.torsoYaw).toBeCloseTo(0, 6);
    expect(front.headLocalYaw).toBeCloseTo(0, 6);
    expect(front.eyesGlow).toBe(1);
    expect(front.pointerWeight).toBe(0);

    // Clamps out-of-range inputs safely
    expect(compute3DBustPose(-2).turn).toBe(0);
    expect(compute3DBustPose(4).turn).toBe(1);
  });

  it('projects the anatomical right eye (viewer left) cleanly for desktop and mobile aspects', () => {
    const desktopUV = computeRightEyeAnchorUV(800 / 740, 1);
    expect(desktopUV.u).toBeGreaterThan(0.38);
    expect(desktopUV.u).toBeLessThan(0.49);
    expect(desktopUV.v).toBeGreaterThan(0.30);
    expect(desktopUV.v).toBeLessThan(0.46);

    const mobileUV = computeRightEyeAnchorUV(390 / 675, 1);
    expect(mobileUV.u).toBeGreaterThan(0.35);
    expect(mobileUV.u).toBeLessThan(0.48);
    expect(mobileUV.v).toBeGreaterThan(0.30);
    expect(mobileUV.v).toBeLessThan(0.46);
  });

  it('builds finite, stitched sculpted geometries for head, ears, coat, hair, eyes, and brows', () => {
    const head = buildSculptedHeadGeometry();
    assertFiniteGeometry(head);
    head.computeBoundingBox();
    expect(head.boundingBox!.max.z).toBeGreaterThan(0.38);
    expect(head.boundingBox!.min.z).toBeLessThan(-0.34);

    const earL = buildSculptedEarGeometry(1);
    const earR = buildSculptedEarGeometry(-1);
    assertFiniteGeometry(earL);
    assertFiniteGeometry(earR);

    const coat = buildSculptedCoatGeometry();
    assertFiniteGeometry(coat);
    coat.computeBoundingBox();
    expect(coat.boundingBox!.max.x).toBeGreaterThan(0.6);
    expect(coat.boundingBox!.min.x).toBeLessThan(-0.6);

    const hair = buildSculptedHairAssets();
    assertFiniteGeometry(hair.cap);
    expect(hair.strands.length).toBeGreaterThanOrEqual(15);
    for (const strand of hair.strands) {
      assertFiniteGeometry(strand);
    }

    const eye = buildEyeLensGeometry();
    assertFiniteGeometry(eye);
    const browL = buildBrowArcGeometry(1);
    const browR = buildBrowArcGeometry(-1);
    assertFiniteGeometry(browL);
    assertFiniteGeometry(browR);

    head.dispose();
    earL.dispose();
    earR.dispose();
    coat.dispose();
    hair.cap.dispose();
    hair.strands.forEach((s) => s.dispose());
    eye.dispose();
    browL.dispose();
    browR.dispose();
  });

  it('guards all GLSL pow() calls against zero/negative bases for ANGLE compatibility', () => {
    expect(BUST_VERTEX_SHADER).toContain('gl_Position');
    expect(BUST_FRAGMENT_SHADER).toContain('uHeadTurn');
    expect(BUST_FRAGMENT_SHADER).toContain('uPointer');
    expect(EYE_FRAGMENT_SHADER).toContain('uEyesGlow');
    const powMatches = [
      ...BUST_FRAGMENT_SHADER.matchAll(/pow\(([^,]+),/g),
      ...EYE_FRAGMENT_SHADER.matchAll(/pow\(([^,]+),/g),
      ...EYE_HALO_FRAGMENT_SHADER.matchAll(/pow\(([^,]+),/g),
    ];
    expect(powMatches.length).toBeGreaterThan(0);
    for (const match of powMatches) {
      expect(match[1]).toContain('max(');
    }
  });

  it('constructs, updates poses, and disposes HeroBustRigController cleanly without leaks', () => {
    const controller = new HeroBustRigController();
    expect(controller.root.children.length).toBe(1);
    const sidePose = controller.applyPose(0, 0, 0.25, -0.1);
    expect(sidePose.turn).toBe(0);
    const frontPose = controller.applyPose(1, 1, 0, 0);
    expect(frontPose.eyesGlow).toBe(1);
    controller.dispose();
    expect(controller.root.children.length).toBe(0);
  });
});
