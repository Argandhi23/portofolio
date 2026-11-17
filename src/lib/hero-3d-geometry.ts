import * as THREE from 'three';
import { clamp, smoothstep } from '@/lib/scroll-math';

/**
 * Pure Three.js 3D Sculpted Bust Geometry, Pose Kinematics & Studio Shaders.
 *
 * - Zero React dependencies: runs cleanly in Vitest (Node) and browser WebGL.
 * - Preserves the Folioblox obsidian + crimson-burgundy studio lighting aesthetic
 *   while giving true 3D perspective, self-occlusion, hair curl layering, and
 *   exact camera-projected right-eye targeting for HeroEyePortal.
 */

export const HERO_CAMERA_CONFIG = {
  fov: 34,
  position: [0, 0.14, 4.35] as const,
  target: [0, 0.08, 0] as const,
} as const;

export const HEAD_PIVOT_OFFSET = [0, 0.36, -0.02] as const;

/** Anatomical right eye (viewer's left when facing camera) in head-local coordinates */
export const RIGHT_EYE_LOCAL_POS = [-0.106, 0.052, 0.274] as const;
/** Anatomical left eye (viewer's right when facing camera) in head-local coordinates */
export const LEFT_EYE_LOCAL_POS = [0.106, 0.052, 0.274] as const;

export interface Bust3DPose {
  turn: number;
  headT: number;
  hairT: number;
  torsoT: number;
  eyesGlow: number;
  headTotalYaw: number;
  torsoYaw: number;
  headLocalYaw: number;
  headPitch: number;
  headRoll: number;
  torsoX: number;
  torsoY: number;
  torsoZ: number;
  bustScale: number;
  pointerWeight: number;
}

/**
 * Computes coordinated overlapping-action 3D pose kinematics across the turn:
 * - turn = 0.0 -> -83 deg side profile (facing viewer's left)
 * - turn = 0.5 -> 3/4 view with subtle natural chin dip & bank
 * - turn = 1.0 -> 0 deg squared front view locked to camera
 */
export function compute3DBustPose(rawTurn: number): Bust3DPose {
  const turn = clamp(rawTurn, 0, 1);
  const headT = smoothstep(0.0, 0.94, turn);
  const hairT = smoothstep(0.04, 0.98, turn);
  const torsoT = smoothstep(0.08, 1.0, turn);
  const eyesGlow = smoothstep(0.28, 0.96, turn);

  const headTotalYaw = -Math.PI * 0.46 * (1 - headT);
  const torsoYaw = -Math.PI * 0.31 * (1 - torsoT);
  const headLocalYaw = headTotalYaw - torsoYaw;

  const arc = Math.sin(headT * Math.PI);
  const headPitch = -0.052 * arc + 0.012 * headT;
  const headRoll = -0.032 * arc;

  const torsoX = -0.055 * (1 - torsoT);
  const torsoY = -0.025 * (1 - torsoT);
  const torsoZ = -0.08 * (1 - torsoT) + 0.04 * torsoT;
  const bustScale = 1 + headT * 0.035;
  const pointerWeight = 1 - smoothstep(0.74, 0.95, turn);

  return {
    turn,
    headT,
    hairT,
    torsoT,
    eyesGlow,
    headTotalYaw,
    torsoYaw,
    headLocalYaw,
    headPitch,
    headRoll,
    torsoX,
    torsoY,
    torsoZ,
    bustScale,
    pointerWeight,
  };
}

/**
 * Computes exact normalized canvas UV coordinates (u in [0..1] left->right, v in [0..1] top->bottom)
 * of the anatomical right eye using the real PerspectiveCamera and bust transform hierarchy.
 */
export function computeRightEyeAnchorUV(
  aspect = 800 / 740,
  rawTurn = 1
): { u: number; v: number } {
  const safeAspect = Math.max(0.25, aspect);
  const pose = compute3DBustPose(rawTurn);

  const camera = new THREE.PerspectiveCamera(
    HERO_CAMERA_CONFIG.fov,
    safeAspect,
    0.1,
    100
  );
  camera.position.set(...HERO_CAMERA_CONFIG.position);
  camera.lookAt(...HERO_CAMERA_CONFIG.target);
  camera.updateMatrixWorld();

  const torsoMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(pose.torsoX, pose.torsoY, pose.torsoZ),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, pose.torsoYaw, 0)),
    new THREE.Vector3(pose.bustScale, pose.bustScale, pose.bustScale)
  );

  const headMatrix = new THREE.Matrix4().compose(
    new THREE.Vector3(...HEAD_PIVOT_OFFSET),
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(pose.headPitch, pose.headLocalYaw, pose.headRoll, 'YXZ')
    ),
    new THREE.Vector3(1, 1, 1)
  );

  const worldPos = new THREE.Vector3(...RIGHT_EYE_LOCAL_POS)
    .applyMatrix4(headMatrix)
    .applyMatrix4(torsoMatrix);

  const ndc = worldPos.project(camera);
  return {
    u: Number(clamp(ndc.x * 0.5 + 0.5, 0.05, 0.95).toFixed(4)),
    v: Number(clamp(-ndc.y * 0.5 + 0.5, 0.05, 0.95).toFixed(4)),
  };
}

function gaussian2D(
  dx: number,
  dy: number,
  rx: number,
  ry: number
): number {
  const nx = dx / rx;
  const ny = dy / ry;
  return Math.exp(-(nx * nx + ny * ny));
}

/**
 * Stitches vertex normals along the u=0 / u=uSegs back-of-head/back-of-coat seam
 * so procedural cylindrical/lathed meshes have zero visible seam line.
 */
function stitchSeamNormals(
  geometry: THREE.BufferGeometry,
  uSegs: number,
  vSegs: number
): void {
  geometry.computeVertexNormals();
  const norm = geometry.getAttribute('normal');
  if (!norm) return;

  const stride = uSegs + 1;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();

  for (let iv = 0; iv <= vSegs; iv++) {
    const idx0 = iv * stride;
    const idx1 = iv * stride + uSegs;
    a.fromBufferAttribute(norm, idx0);
    b.fromBufferAttribute(norm, idx1);
    a.add(b);
    if (a.lengthSq() > 1e-8) {
      a.normalize();
      norm.setXYZ(idx0, a.x, a.y, a.z);
      norm.setXYZ(idx1, a.x, a.y, a.z);
    }
  }
  norm.needsUpdate = true;
}

/**
 * Continuous high-resolution parametric sculpted male head + neck BufferGeometry.
 * Local origin (0, 0, 0) sits near the center of the head/jaw pivot.
 */
export function buildSculptedHeadGeometry(
  radialSegments = 72,
  heightSegments = 64
): THREE.BufferGeometry {
  const uSegs = Math.max(32, radialSegments);
  const vSegs = Math.max(32, heightSegments);

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs; // 0 = crown apex, 1 = neck base
    // Map v to vertical profile y in [+0.45 .. -0.78]
    const y = 0.45 - v * 1.23;

    // Base vertical silhouette radii (rx = width, rzFront = front depth, rzBack = back skull depth)
    let rx: number;
    let rzFront: number;
    let rzBack: number;

    if (y >= 0.08) {
      // Cranium & forehead dome
      const domeT = clamp((y - 0.08) / 0.37, 0, 1);
      const domeCurve = Math.sqrt(Math.max(0.0001, 1 - domeT * domeT * 0.96));
      rx = 0.285 * domeCurve + 0.015 * (1 - domeT);
      rzFront = 0.315 * domeCurve;
      rzBack = 0.385 * domeCurve;
    } else if (y >= -0.31) {
      // Cheekbone -> gonial jaw -> tapered chin
      const faceT = clamp((0.08 - y) / 0.39, 0, 1);
      rx = 0.285 - 0.062 * Math.pow(faceT, 1.35);
      rzFront = 0.315 - 0.025 * faceT;
      rzBack = 0.385 - 0.145 * Math.pow(faceT, 1.45);
    } else {
      // Under-jaw tuck into cylindrical neck
      const neckT = clamp((-0.31 - y) / 0.47, 0, 1);
      const tuck = smoothstep(0.0, 0.26, neckT);
      const flare = smoothstep(0.55, 1.0, neckT);
      rx = 0.223 * (1 - tuck) + (0.148 + flare * 0.025) * tuck;
      rzFront = 0.29 * (1 - tuck) + (0.145 + flare * 0.015) * tuck;
      rzBack = 0.24 * (1 - tuck) + (0.165 + flare * 0.02) * tuck;
    }

    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs;
      // Concentrate mesh resolution along the frontal facial plane (theta = 0)
      const signed = (u - 0.5) * 2;
      const absS = Math.abs(signed);
      const theta =
        Math.sign(signed) * Math.PI * (0.68 * Math.pow(absS, 1.35) + 0.32 * absS);

      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const frontMask = Math.max(0, cosT);
      const backMask = Math.max(0, -cosT);

      let x = sinT * rx;
      let z = cosT >= 0 ? cosT * rzFront : cosT * rzBack;

      // Subtle cranial vault fullness & temple narrowing
      const templeDip =
        smoothstep(0.04, 0.22, y) *
        (1 - smoothstep(0.24, 0.38, y)) *
        gaussian2D(Math.abs(sinT) - 0.85, y - 0.14, 0.22, 0.12);
      x *= 1 - templeDip * 0.065;

      // Smooth continuous under-jaw taper (zero hard y-cutoff so neck triangles never invert!)
      const jawRegion =
        smoothstep(-0.08, -0.22, y) * (1 - smoothstep(-0.33, -0.49, y));
      if (jawRegion > 0.0001) {
        const jawCurveY = -0.18 - 0.11 * Math.pow(frontMask, 1.3);
        const belowJaw = smoothstep(jawCurveY + 0.03, jawCurveY - 0.08, y);
        const chinGuard = 1 - gaussian2D(x, y + 0.285, 0.11, 0.075) * 0.76;
        const tuckScale =
          1 -
          jawRegion *
            belowJaw *
            (0.18 * frontMask + 0.1 * (1 - backMask)) *
            chinGuard;
        x *= tuckScale;
        z -= jawRegion * belowJaw * 0.034 * frontMask * chinGuard;
      }

      // Frontal facial anatomy deformations (only on forward face hemisphere)
      if (cosT > -0.15) {
        const az = Math.abs(theta);

        // 1. Superciliary Brow Ridge & Nasion Transition
        const brow =
          gaussian2D(az, y - 0.118, 0.72, 0.052) *
          (0.022 + 0.008 * gaussian2D(Math.abs(x) - 0.102, y - 0.118, 0.06, 0.032));
        const nasionDip = gaussian2D(x, y - 0.072, 0.045, 0.028) * -0.012;

        // 2. Sculpted Orbital Eye Sockets (deep moody rim shadows)
        const leftSocket = gaussian2D(x - 0.106, y - 0.05, 0.068, 0.048);
        const rightSocket = gaussian2D(x + 0.106, y - 0.05, 0.068, 0.048);
        const sockets = -0.042 * (leftSocket + rightSocket);

        // 3. Classic Masculine Nose Bridge, Smooth Rounded Tip & Alar Wings
        const bridgeT = clamp((0.072 - y) / 0.115, 0, 1);
        const bridgeArch =
          y >= -0.095 && y <= 0.095
            ? gaussian2D(x, 0, 0.036 + bridgeT * 0.011, 1) *
              (0.012 + 0.062 * smoothstep(0.0, 1.0, bridgeT)) *
              smoothstep(-0.096, -0.042, y) *
              (1 - smoothstep(0.058, 0.095, y))
            : 0;
        const noseTip = gaussian2D(x, y + 0.038, 0.034, 0.026) * 0.022;
        const alarLeft = gaussian2D(x - 0.038, y + 0.056, 0.022, 0.018) * 0.016;
        const alarRight = gaussian2D(x + 0.038, y + 0.056, 0.022, 0.018) * 0.016;

        // 4. Zygomatic Cheekbones & Sub-Malar Hollow
        const cheekLeft = gaussian2D(x - 0.192, y + 0.01, 0.075, 0.062) * 0.024;
        const cheekRight = gaussian2D(x + 0.192, y + 0.01, 0.075, 0.062) * 0.024;
        const hollowLeft = gaussian2D(x - 0.168, y + 0.12, 0.068, 0.06) * -0.016;
        const hollowRight = gaussian2D(x + 0.168, y + 0.12, 0.068, 0.06) * -0.016;

        // 5. Lips, Lip Crease & Strong Masculine Chin
        const muzzle = gaussian2D(x, y + 0.172, 0.098, 0.07) * 0.02;
        const upperLip = gaussian2D(x, y + 0.138, 0.062, 0.018) * 0.022;
        const lipCrease = gaussian2D(x, y + 0.163, 0.06, 0.011) * -0.015;
        const lowerLip = gaussian2D(x, y + 0.186, 0.054, 0.02) * 0.02;
        const mentolabialDip = gaussian2D(x, y + 0.224, 0.062, 0.022) * -0.014;
        const chinApex = gaussian2D(x, y + 0.282, 0.078, 0.048) * 0.044;

        // 6. Gonial Jaw Ridge Accent
        const gonialLeft = gaussian2D(x - 0.205, y + 0.192, 0.058, 0.06) * 0.016;
        const gonialRight = gaussian2D(x + 0.205, y + 0.192, 0.058, 0.06) * 0.016;

        const disp =
          brow +
          nasionDip +
          sockets +
          bridgeArch +
          noseTip +
          alarLeft +
          alarRight +
          cheekLeft +
          cheekRight +
          hollowLeft +
          hollowRight +
          muzzle +
          upperLip +
          lipCrease +
          lowerLip +
          mentolabialDip +
          chinApex +
          gonialLeft +
          gonialRight;

        // Push primarily along forward + radial surface direction
        const radialLen = Math.hypot(sinT, cosT) || 1;
        x += (sinT / radialLen) * disp * 0.28;
        z += Math.max(0.22, cosT) * disp;
      }

      // Sternocleidomastoid V-muscles on front/side of neck
      if (y < -0.35) {
        const neckProgress = clamp((-0.35 - y) / 0.43, 0, 1);
        const scmX = 0.115 - neckProgress * 0.075;
        const scmLeft = gaussian2D(x - scmX, 0, 0.036, 1) * 0.014;
        const scmRight = gaussian2D(x + scmX, 0, 0.036, 1) * 0.014;
        const scmFade = smoothstep(0.0, 0.2, neckProgress) * (1 - smoothstep(0.75, 1.0, neckProgress));
        const bump = (scmLeft + scmRight) * scmFade * Math.max(0, cosT + 0.35);
        x += sinT * bump;
        z += cosT * bump;
      }

      // Close exact poles cleanly
      if (iv === 0) {
        x = 0;
        z = -0.025;
      }

      positions.push(x, y, z);
      uvs.push(u, 1 - v);
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * (uSegs + 1) + iu;
      const b = a + 1;
      const c = (iv + 1) * (uSegs + 1) + iu;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  stitchSeamNormals(geometry, uSegs, vSegs);
  return geometry;
}

/**
 * Sculpted anatomical outer ear mesh (slightly cupped helix & lobe).
 */
export function buildSculptedEarGeometry(side: -1 | 1): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.078, 22, 18);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Tall thin ear silhouette
    y *= 1.48;
    z *= 0.85;
    x *= 0.34;

    // Slight concha cup indentation on outer face
    const rCenter = Math.hypot(y * 0.72, z + 0.01);
    const cup = Math.exp(-(rCenter * rCenter) / 0.0022);
    x -= side * cup * 0.015;

    // Sweep top ear slightly backward
    z -= y * 0.16;

    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Tailored broad masculine high-collar overcoat & draped shoulders BufferGeometry.
 * Local origin sits at bust center (0, 0, 0), spanning y = -0.06 down to y = -1.60.
 */
export function buildSculptedCoatGeometry(
  radialSegments = 64,
  heightSegments = 36
): THREE.BufferGeometry {
  const uSegs = Math.max(32, radialSegments);
  const vSegs = Math.max(24, heightSegments);

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= vSegs; iv++) {
    const v = iv / vSegs;
    const y = -0.08 - v * 1.52; // -0.08 (tucked snugly around neck base) -> -1.60 (lower torso)

    // Smooth shoulder & torso envelope
    const collarT = smoothstep(0.0, 0.2, v);
    const shoulderPeak = smoothstep(0.1, 0.34, v);
    const chestT = smoothstep(0.34, 1.0, v);

    const rx =
      0.142 * (1 - collarT) +
      0.74 * collarT * Math.pow(shoulderPeak, 0.65) +
      0.15 * (1 - shoulderPeak) * collarT -
      0.08 * chestT;

    const rz =
      0.142 * (1 - collarT) +
      0.34 * collarT * (0.72 + 0.28 * shoulderPeak) -
      0.04 * chestT;

    for (let iu = 0; iu <= uSegs; iu++) {
      const u = iu / uSegs;
      const theta = (u - 0.5) * 2 * Math.PI;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      let px = sinT * rx;
      let py = y;
      let pz = cosT * rz;

      // Subtle sculpted mock-collar sweep & chest V-contour (zero protruding collar horns!)
      const collarFade = smoothstep(0.0, 0.07, v) * (1 - smoothstep(0.07, 0.36, v));
      const frontOpen = smoothstep(-0.1, 0.9, cosT);
      const centerV = Math.exp(-(theta * theta) / 0.28);
      py -= frontOpen * (0.35 + 0.65 * centerV) * collarFade * 0.095;
      pz -= frontOpen * centerV * collarFade * 0.02;

      // Crisp embedded tailored V-lapel folds along chest (zero spiky collar horns!)
      if (v > 0.06 && v < 0.48 && cosT > 0.1) {
        const lapelT = clamp((v - 0.08) / 0.36, 0, 1);
        const lapelTheta = (1 - lapelT) * 0.44 + 0.06;
        const lapelFold =
          Math.exp(-Math.pow((Math.abs(theta) - lapelTheta) / 0.095, 2)) *
          Math.sin(lapelT * Math.PI) *
          cosT;
        pz += lapelFold * 0.028;
        px += Math.sign(theta) * lapelFold * 0.01;
      }

      // Broad tailored shoulder slope (shoulders drop gently toward arms)
      const outerShoulder = Math.pow(Math.abs(sinT), 2.2);
      py -= outerShoulder * smoothstep(0.06, 0.28, v) * 0.12;

      // Subtle chest seam & tailored lapel crease
      if (cosT > 0.25) {
        const chestFullness =
          Math.exp(-Math.pow((v - 0.42) / 0.22, 2)) *
          Math.exp(-Math.pow((Math.abs(sinT) - 0.35) / 0.3, 2));
        pz += chestFullness * 0.038;
        const centerSeam =
          smoothstep(0.32, 0.5, v) * Math.exp(-(theta * theta) / 0.008);
        pz -= centerSeam * 0.018;
      }

      positions.push(px, py, pz);
      uvs.push(u, 1 - v);
    }
  }

  for (let iv = 0; iv < vSegs; iv++) {
    for (let iu = 0; iu < uSegs; iu++) {
      const a = iv * (uSegs + 1) + iu;
      const b = a + 1;
      const c = (iv + 1) * (uSegs + 1) + iu;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  stitchSeamNormals(geometry, uSegs, vSegs);
  return geometry;
}

/**
 * Custom tapered 3D tube mesh along a CatmullRomCurve3 spline.
 * Creates sharp, natural sculpted curls and lapels with zero blunt cylinder caps.
 */
export function buildTaperedTubeGeometry(
  curve: THREE.CatmullRomCurve3,
  tubularSegments = 24,
  radialSegments = 10,
  radiusStart = 0.04,
  radiusMid = 0.075,
  radiusEnd = 0.012
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  const B = new THREE.Vector3();

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    curve.getPointAt(t, P);
    N.copy(frames.normals[i]);
    B.copy(frames.binormals[i]);

    // Smooth asymmetric profile tapering sharply to ends
    const envelope = Math.sin(t * Math.PI);
    const baseBlend = radiusStart * (1 - t) + radiusEnd * t;
    const radius = baseBlend * (1 - envelope * 0.72) + radiusMid * Math.pow(envelope, 0.72);

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sinV = Math.sin(v);
      const cosV = -Math.cos(v);

      // Slightly flattened ribbon cross-section for organic hair flow
      const rx = radius * 1.15;
      const ry = radius * 0.85;

      const vx = P.x + (cosV * N.x * rx + sinV * B.x * ry);
      const vy = P.y + (cosV * N.y * rx + sinV * B.y * ry);
      const vz = P.z + (cosV * N.z * rx + sinV * B.z * ry);

      positions.push(vx, vy, vz);
      uvs.push(t, j / radialSegments);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = (i + 1) * (radialSegments + 1) + j;
      const c = (i + 1) * (radialSegments + 1) + (j + 1);
      const d = i * (radialSegments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  stitchSeamNormals(geometry, radialSegments, tubularSegments);
  return geometry;
}

export interface HairAssets {
  cap: THREE.BufferGeometry;
  strands: THREE.BufferGeometry[];
}

/**
 * Builds the sculpted wavy hair crown cap + layered 3D tapered curl locks
 * (back curls, crown waves, sideburn framing, and signature curtain/comma bangs
 * placed safely above the eyes so the glowing eye portal remains unobstructed).
 */
export function buildSculptedHairAssets(): HairAssets {
  // 1. Sculpted Hair Crown Cap (hugs skull cleanly with multi-scale curly waves)
  const cap = new THREE.SphereGeometry(0.326, 64, 48);
  const pos = cap.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Offset slightly back & up for natural masculine crown silhouette
    y = y * 0.94 + 0.125;
    z = z * 1.10 - 0.052;
    x *= 0.90;

    // Trim / tuck front lower hemisphere cleanly behind forehead hairline
    if (z > 0.0 && y < 0.24) {
      const cut = smoothstep(0.24, 0.0, y) * smoothstep(0.0, 0.16, z);
      z -= cut * 0.24;
      x *= 1 - cut * 0.16;
    }

    // Multi-frequency organic wavy/curly surface ridges
    const wave =
      Math.sin(x * 20 + y * 13) * 0.015 +
      Math.cos(z * 18 - y * 14) * 0.014 +
      Math.sin((x + z) * 28) * 0.007;
    const crownMask = smoothstep(-0.1, 0.3, y);
    const radial = Math.hypot(x, z) || 1;
    x += (x / radial) * wave * crownMask;
    y += wave * 0.6 * crownMask;
    z += (z / radial) * wave * crownMask;

    pos.setXYZ(i, x, y, z);
  }
  cap.computeVertexNormals();

  // 2. Fine, Layered Tapered 3D Curl Strands & Forehead Curtain Bangs (nestled tightly to scalp!)
  const strandSpecs: Array<{
    pts: Array<[number, number, number]>;
    r0: number;
    rMid: number;
    r1: number;
  }> = [
    // Crown wave ridges (tight, balanced silhouette from both profile and front view)
    {
      pts: [
        [-0.03, 0.38, 0.14],
        [-0.07, 0.425, -0.02],
        [-0.10, 0.38, -0.22],
        [-0.08, 0.20, -0.35],
      ],
      r0: 0.014,
      rMid: 0.034,
      r1: 0.01,
    },
    {
      pts: [
        [0.04, 0.38, 0.14],
        [0.08, 0.43, -0.03],
        [0.11, 0.37, -0.23],
        [0.09, 0.18, -0.36],
      ],
      r0: 0.014,
      rMid: 0.035,
      r1: 0.01,
    },
    {
      pts: [
        [0.0, 0.40, 0.05],
        [0.01, 0.435, -0.12],
        [-0.01, 0.34, -0.31],
        [0.0, 0.10, -0.38],
      ],
      r0: 0.016,
      rMid: 0.036,
      r1: 0.012,
    },
    // Back-of-skull & nape curl curls hugging occipital bone
    {
      pts: [
        [-0.14, 0.33, -0.14],
        [-0.19, 0.24, -0.31],
        [-0.16, 0.04, -0.38],
        [-0.12, -0.14, -0.31],
      ],
      r0: 0.016,
      rMid: 0.042,
      r1: 0.01,
    },
    {
      pts: [
        [0.14, 0.33, -0.14],
        [0.19, 0.24, -0.31],
        [0.16, 0.04, -0.38],
        [0.12, -0.14, -0.31],
      ],
      r0: 0.016,
      rMid: 0.042,
      r1: 0.01,
    },
    {
      pts: [
        [-0.06, 0.28, -0.27],
        [-0.09, 0.11, -0.38],
        [-0.05, -0.07, -0.35],
        [-0.07, -0.20, -0.25],
      ],
      r0: 0.018,
      rMid: 0.04,
      r1: 0.01,
    },
    {
      pts: [
        [0.06, 0.28, -0.27],
        [0.09, 0.11, -0.38],
        [0.05, -0.07, -0.35],
        [0.07, -0.20, -0.25],
      ],
      r0: 0.018,
      rMid: 0.04,
      r1: 0.01,
    },
    // Side crown waves
    {
      pts: [
        [-0.14, 0.35, 0.10],
        [-0.24, 0.33, -0.04],
        [-0.27, 0.18, -0.20],
        [-0.23, 0.01, -0.27],
      ],
      r0: 0.014,
      rMid: 0.038,
      r1: 0.01,
    },
    {
      pts: [
        [0.14, 0.35, 0.10],
        [0.24, 0.33, -0.04],
        [0.27, 0.18, -0.20],
        [0.23, 0.01, -0.27],
      ],
      r0: 0.014,
      rMid: 0.038,
      r1: 0.01,
    },
    // Temple / sideburn framing wisps
    {
      pts: [
        [-0.19, 0.30, 0.14],
        [-0.27, 0.19, 0.07],
        [-0.27, 0.05, 0.03],
        [-0.24, -0.06, 0.02],
      ],
      r0: 0.012,
      rMid: 0.028,
      r1: 0.006,
    },
    {
      pts: [
        [0.19, 0.30, 0.14],
        [0.27, 0.19, 0.07],
        [0.27, 0.05, 0.03],
        [0.24, -0.06, 0.02],
      ],
      r0: 0.012,
      rMid: 0.028,
      r1: 0.006,
    },
    // Delicate Forehead Curtain / Comma Bangs (hugging forehead smoothly above brows)
    {
      pts: [
        [-0.02, 0.36, 0.18],
        [-0.09, 0.28, 0.275],
        [-0.15, 0.19, 0.29],
        [-0.19, 0.12, 0.245],
      ],
      r0: 0.014,
      rMid: 0.03,
      r1: 0.005,
    },
    {
      pts: [
        [0.02, 0.36, 0.18],
        [0.09, 0.28, 0.275],
        [0.15, 0.19, 0.29],
        [0.19, 0.12, 0.245],
      ],
      r0: 0.014,
      rMid: 0.03,
      r1: 0.005,
    },
    {
      pts: [
        [-0.035, 0.34, 0.20],
        [-0.048, 0.24, 0.298],
        [-0.032, 0.165, 0.305],
        [-0.075, 0.132, 0.288],
      ],
      r0: 0.01,
      rMid: 0.024,
      r1: 0.004,
    },
    {
      pts: [
        [0.035, 0.34, 0.20],
        [0.055, 0.24, 0.298],
        [0.04, 0.17, 0.305],
        [0.082, 0.134, 0.285],
      ],
      r0: 0.01,
      rMid: 0.024,
      r1: 0.004,
    },
    {
      pts: [
        [-0.12, 0.32, 0.19],
        [-0.21, 0.21, 0.22],
        [-0.24, 0.11, 0.165],
        [-0.22, 0.02, 0.115],
      ],
      r0: 0.012,
      rMid: 0.026,
      r1: 0.005,
    },
    {
      pts: [
        [0.12, 0.32, 0.19],
        [0.21, 0.21, 0.22],
        [0.24, 0.11, 0.165],
        [0.22, 0.02, 0.115],
      ],
      r0: 0.012,
      rMid: 0.026,
      r1: 0.005,
    },
  ];

  const strands = strandSpecs.map((spec) =>
    buildTaperedTubeGeometry(
      new THREE.CatmullRomCurve3(spec.pts.map((p) => new THREE.Vector3(...p))),
      22,
      10,
      spec.r0,
      spec.rMid,
      spec.r1
    )
  );

  return { cap, strands };
}

/**
 * Sleek curved almond hunter-eye lens sitting cleanly in the orbital socket.
 */
export function buildEyeLensGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.034, 22, 16);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) * 1.15;
    const y = pos.getY(i) * 0.4;
    const z = pos.getZ(i) * 0.42;
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Sharp sculpted 3D brow ridge arc above each eye socket.
 */
export function buildBrowArcGeometry(side: -1 | 1): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.04, 0.095, 0.304),
    new THREE.Vector3(side * 0.102, 0.106, 0.296),
    new THREE.Vector3(side * 0.164, 0.094, 0.262),
  ]);
  return buildTaperedTubeGeometry(curve, 14, 8, 0.006, 0.0095, 0.0035);
}

/**
 * Studio Obsidian + Directional Crimson Fresnel Rim-Light Shader.
 * Note: Uses `max(..., 0.0001)` guards on all `pow()` calls to avoid NaN on ANGLE/Windows GPUs.
 */
export const BUST_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const BUST_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uShadowColor;
  uniform vec3 uKeyRimColor;
  uniform vec3 uKickerRimColor;
  uniform vec3 uDiffuseTint;
  uniform vec2 uPointer;
  uniform float uHeadTurn;
  uniform float uRimBoost;
  uniform float uBottomFade;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float ndotv = clamp(dot(N, V), 0.0, 1.0);

    // Directional studio key light shifting subtly with cursor
    vec3 keyDir = normalize(vec3(-0.78 + uPointer.x * 0.28, 0.42 + uPointer.y * 0.20, 0.50));
    vec3 kickerDir = normalize(vec3(0.84 - uPointer.x * 0.18, 0.22, 0.30));
    vec3 crownDir = normalize(vec3(-0.15, 0.94, 0.18));

    float keyDiff = clamp(dot(N, keyDir) * 0.5 + 0.5, 0.0, 1.0);
    float fresnel = pow(max(1.0 - ndotv, 0.0001), 2.55);
    float tightFresnel = pow(max(1.0 - ndotv, 0.0001), 4.1);

    float keyRim = fresnel * smoothstep(-0.18, 0.85, dot(N, keyDir));
    float kickerMask = 0.28 + 0.72 * uHeadTurn;
    float kickerRim = fresnel * smoothstep(-0.1, 0.88, dot(N, kickerDir)) * kickerMask;
    float crownRim = tightFresnel * smoothstep(0.15, 0.92, dot(N, crownDir)) * 0.65;

    // Subtle soft sculptural mid-tone along brow, nose bridge, cheekbones & front planes
    float studioForm = pow(max(keyDiff, 0.0001), 2.1) * 0.32;
    float frontSculpt = smoothstep(0.15, 0.95, max(N.z, 0.0)) * (0.08 + 0.12 * uHeadTurn);
    vec3 color = mix(uShadowColor, uBaseColor, keyDiff);
    color += uDiffuseTint * (studioForm + frontSculpt);
    color += uKeyRimColor * keyRim * (1.05 * uRimBoost);
    color += uKickerRimColor * kickerRim * (0.76 * uRimBoost);
    color += uKeyRimColor * crownRim * (0.55 * uRimBoost);

    // Seamless studio bottom vignette blending coat into #120206 hero floor
    float alpha = 1.0;
    if (uBottomFade > 0.5) {
      float floorFade = smoothstep(-1.38, -0.78, vWorldPos.y);
      color = mix(vec3(0.055, 0.008, 0.02), color, floorFade);
      alpha = smoothstep(-1.42, -1.04, vWorldPos.y);
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export const EYE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uEyesGlow;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float center = pow(max(clamp(dot(N, V), 0.0, 1.0), 0.0001), 0.65);

    vec3 idleCol = mix(vec3(0.08, 0.02, 0.035), vec3(0.84, 0.24, 0.38), center * 0.72);
    vec3 glowCol = mix(vec3(0.96, 0.84, 0.88), vec3(1.0, 0.99, 0.97), center);

    vec3 finalCol = mix(idleCol, glowCol, uEyesGlow);
    float alpha = mix(0.68, 1.0, uEyesGlow);
    gl_FragColor = vec4(finalCol, alpha);
  }
`;

export const EYE_HALO_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const EYE_HALO_FRAGMENT_SHADER = /* glsl */ `
  uniform float uEyesGlow;
  varying vec2 vUv;

  void main() {
    float dist = length(vUv - vec2(0.5)) * 2.0;
    float core = smoothstep(0.55, 0.0, dist);
    float outer = pow(max(1.0 - clamp(dist, 0.0, 1.0), 0.0001), 2.4);
    vec3 col = mix(vec3(0.88, 0.30, 0.44), vec3(1.0, 0.96, 0.94), core);
    float alpha = (outer * 0.62 + core * 0.45) * uEyesGlow;
    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * Pure Three.js scene controller for the sculpted 3D bust hierarchy, shaders, and cleanup.
 * Isolates imperative GPU buffer/uniform mutations from React render/hook immutability checks.
 */
export class HeroBustRigController {
  public readonly root = new THREE.Group();
  private readonly torsoGroup = new THREE.Group();
  private readonly headGroup = new THREE.Group();
  private readonly bustMaterials: THREE.ShaderMaterial[] = [];
  private readonly eyeMaterial: THREE.ShaderMaterial;
  private readonly haloMaterial: THREE.ShaderMaterial;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];

  constructor() {
    const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      this.geometries.push(g);
      return g;
    };
    const trackMat = <T extends THREE.Material>(m: T): T => {
      this.materials.push(m);
      return m;
    };

    const skinMat = trackMat(
      new THREE.ShaderMaterial({
        vertexShader: BUST_VERTEX_SHADER,
        fragmentShader: BUST_FRAGMENT_SHADER,
        uniforms: {
          uBaseColor: { value: new THREE.Color('#1B0409') },
          uShadowColor: { value: new THREE.Color('#090103') },
          uKeyRimColor: { value: new THREE.Color('#F0688A') },
          uKickerRimColor: { value: new THREE.Color('#A81E38') },
          uDiffuseTint: { value: new THREE.Color('#680E22') },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uHeadTurn: { value: 0 },
          uRimBoost: { value: 1.12 },
          uBottomFade: { value: 0.0 },
        },
      })
    );

    const hairMat = trackMat(
      new THREE.ShaderMaterial({
        vertexShader: BUST_VERTEX_SHADER,
        fragmentShader: BUST_FRAGMENT_SHADER,
        uniforms: {
          uBaseColor: { value: new THREE.Color('#140207') },
          uShadowColor: { value: new THREE.Color('#070102') },
          uKeyRimColor: { value: new THREE.Color('#D6335C') },
          uKickerRimColor: { value: new THREE.Color('#88132A') },
          uDiffuseTint: { value: new THREE.Color('#3D0712') },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uHeadTurn: { value: 0 },
          uRimBoost: { value: 1.0 },
          uBottomFade: { value: 0.0 },
        },
      })
    );

    const coatMat = trackMat(
      new THREE.ShaderMaterial({
        vertexShader: BUST_VERTEX_SHADER,
        fragmentShader: BUST_FRAGMENT_SHADER,
        transparent: true,
        uniforms: {
          uBaseColor: { value: new THREE.Color('#160308') },
          uShadowColor: { value: new THREE.Color('#070102') },
          uKeyRimColor: { value: new THREE.Color('#C42448') },
          uKickerRimColor: { value: new THREE.Color('#88132A') },
          uDiffuseTint: { value: new THREE.Color('#420815') },
          uPointer: { value: new THREE.Vector2(0, 0) },
          uHeadTurn: { value: 0 },
          uRimBoost: { value: 1.02 },
          uBottomFade: { value: 1.0 },
        },
      })
    );

    this.bustMaterials = [skinMat, hairMat, coatMat];

    this.eyeMaterial = trackMat(
      new THREE.ShaderMaterial({
        vertexShader: BUST_VERTEX_SHADER,
        fragmentShader: EYE_FRAGMENT_SHADER,
        transparent: true,
        uniforms: { uEyesGlow: { value: 0 } },
      })
    );

    this.haloMaterial = trackMat(
      new THREE.ShaderMaterial({
        vertexShader: EYE_HALO_VERTEX_SHADER,
        fragmentShader: EYE_HALO_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uEyesGlow: { value: 0 } },
      })
    );

    const coatMesh = new THREE.Mesh(
      trackGeo(buildSculptedCoatGeometry()),
      coatMat
    );
    this.torsoGroup.add(coatMesh);

    this.headGroup.position.set(...HEAD_PIVOT_OFFSET);
    const headMesh = new THREE.Mesh(
      trackGeo(buildSculptedHeadGeometry()),
      skinMat
    );
    this.headGroup.add(headMesh);

    const leftEar = new THREE.Mesh(
      trackGeo(buildSculptedEarGeometry(1)),
      skinMat
    );
    leftEar.position.set(0.28, 0.015, -0.025);
    leftEar.rotation.set(0.06, 0.22, -0.08);

    const rightEar = new THREE.Mesh(
      trackGeo(buildSculptedEarGeometry(-1)),
      skinMat
    );
    rightEar.position.set(-0.28, 0.015, -0.025);
    rightEar.rotation.set(0.06, -0.22, 0.08);
    this.headGroup.add(leftEar, rightEar);

    const hairAssets = buildSculptedHairAssets();
    this.headGroup.add(new THREE.Mesh(trackGeo(hairAssets.cap), hairMat));
    for (const strandGeo of hairAssets.strands) {
      this.headGroup.add(new THREE.Mesh(trackGeo(strandGeo), hairMat));
    }

    const eyeLensGeo = trackGeo(buildEyeLensGeometry());
    const rightEye = new THREE.Mesh(eyeLensGeo, this.eyeMaterial);
    rightEye.position.set(...RIGHT_EYE_LOCAL_POS);
    rightEye.rotation.set(0.04, -0.14, -0.04);

    const leftEye = new THREE.Mesh(eyeLensGeo, this.eyeMaterial);
    leftEye.position.set(...LEFT_EYE_LOCAL_POS);
    leftEye.rotation.set(0.04, 0.14, 0.04);

    const rightBrow = new THREE.Mesh(
      trackGeo(buildBrowArcGeometry(-1)),
      hairMat
    );
    const leftBrow = new THREE.Mesh(
      trackGeo(buildBrowArcGeometry(1)),
      hairMat
    );

    const haloGeo = trackGeo(new THREE.PlaneGeometry(0.18, 0.14));
    const rightHalo = new THREE.Mesh(haloGeo, this.haloMaterial);
    rightHalo.position.set(
      RIGHT_EYE_LOCAL_POS[0],
      RIGHT_EYE_LOCAL_POS[1],
      RIGHT_EYE_LOCAL_POS[2] + 0.022
    );
    const leftHalo = new THREE.Mesh(haloGeo, this.haloMaterial);
    leftHalo.position.set(
      LEFT_EYE_LOCAL_POS[0],
      LEFT_EYE_LOCAL_POS[1],
      LEFT_EYE_LOCAL_POS[2] + 0.022
    );

    this.headGroup.add(
      rightEye,
      leftEye,
      rightBrow,
      leftBrow,
      rightHalo,
      leftHalo
    );
    this.torsoGroup.add(this.headGroup);
    this.root.add(this.torsoGroup);
  }

  public applyPose(
    rawTurn: number,
    rawEyesGlow: number,
    pointerX: number,
    pointerY: number
  ): Bust3DPose {
    const pose = compute3DBustPose(rawTurn);
    const glow = clamp(Math.max(rawEyesGlow, pose.eyesGlow), 0, 1);

    this.torsoGroup.position.set(pose.torsoX, pose.torsoY, pose.torsoZ);
    this.torsoGroup.rotation.set(
      pointerY * 0.025,
      pose.torsoYaw + pointerX * 0.045,
      0
    );
    this.torsoGroup.scale.setScalar(pose.bustScale);

    this.headGroup.rotation.set(
      pose.headPitch + pointerY * 0.055,
      pose.headLocalYaw + pointerX * 0.085,
      pose.headRoll,
      'YXZ'
    );

    for (const mat of this.bustMaterials) {
      mat.uniforms.uHeadTurn.value = pose.headT;
      mat.uniforms.uPointer.value.set(pointerX, pointerY);
    }
    this.eyeMaterial.uniforms.uEyesGlow.value = glow;
    this.haloMaterial.uniforms.uEyesGlow.value = glow;

    return pose;
  }

  public dispose(): void {
    this.root.clear();
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
  }
}
