'use client';

import { useEffect, useRef } from 'react';
import {
  CHEEK_LEFT_RELIEF_PATH,
  CHEEK_RIGHT_RELIEF_PATH,
  CHIN_SHADOW_PATH,
  COAT_BODY_PATH,
  COAT_LEFT_RIM_PATH,
  COAT_RIGHT_RIM_PATH,
  COAT_SEAM_PATH,
  computeRigPoseMetrics,
  evaluatePath,
  FACE_LEFT_RIM_PATH,
  FACE_RIGHT_RIM_PATH,
  FAR_BROW_PATH,
  FAR_HUNTER_EYE_PATH,
  HAIR_BACK_CURLS_PATH,
  HAIR_CROWN_MASS_PATH,
  HAIR_CROWN_RIM_PATH,
  HAIR_FRINGE_PATH,
  HEAD_CORE_PATH,
  LAPEL_LEFT_PATH,
  LAPEL_RIGHT_PATH,
  LEFT_SIDE_EAR_PATH,
  MOUTH_RELIEF_PATH,
  NEAR_BROW_PATH,
  NEAR_EYELID_IDLE_PATH,
  NEAR_HUNTER_EYE_PATH,
  NECK_LEFT_RIM_PATH,
  NECK_PILLAR_PATH,
  NOSE_RELIEF_PATH,
  RIGHT_EAR_HELIX_PATH,
  RIGHT_SIDE_EAR_PATH,
} from '@/lib/hero-3d-bust';

const INITIAL_HEAD_CORE = evaluatePath(HEAD_CORE_PATH, 0);
const INITIAL_FACE_LEFT_RIM = evaluatePath(FACE_LEFT_RIM_PATH, 0);
const INITIAL_FACE_RIGHT_RIM = evaluatePath(FACE_RIGHT_RIM_PATH, 0);
const INITIAL_NOSE_RELIEF = evaluatePath(NOSE_RELIEF_PATH, 0);
const INITIAL_MOUTH_RELIEF = evaluatePath(MOUTH_RELIEF_PATH, 0);
const INITIAL_CHIN_SHADOW = evaluatePath(CHIN_SHADOW_PATH, 0);
const INITIAL_CHEEK_RIGHT = evaluatePath(CHEEK_RIGHT_RELIEF_PATH, 0);
const INITIAL_CHEEK_LEFT = evaluatePath(CHEEK_LEFT_RELIEF_PATH, 0);
const INITIAL_RIGHT_EAR = evaluatePath(RIGHT_SIDE_EAR_PATH, 0);
const INITIAL_RIGHT_EAR_HELIX = evaluatePath(RIGHT_EAR_HELIX_PATH, 0);
const INITIAL_LEFT_EAR = evaluatePath(LEFT_SIDE_EAR_PATH, 0);
const INITIAL_HAIR_BACK = evaluatePath(HAIR_BACK_CURLS_PATH, 0);
const INITIAL_HAIR_CROWN = evaluatePath(HAIR_CROWN_MASS_PATH, 0);
const INITIAL_HAIR_CROWN_RIM = evaluatePath(HAIR_CROWN_RIM_PATH, 0);
const INITIAL_HAIR_FRINGE = evaluatePath(HAIR_FRINGE_PATH, 0);
const INITIAL_NECK = evaluatePath(NECK_PILLAR_PATH, 0);
const INITIAL_NECK_RIM = evaluatePath(NECK_LEFT_RIM_PATH, 0);
const INITIAL_COAT_BODY = evaluatePath(COAT_BODY_PATH, 0);
const INITIAL_COAT_LEFT_RIM = evaluatePath(COAT_LEFT_RIM_PATH, 0);
const INITIAL_COAT_RIGHT_RIM = evaluatePath(COAT_RIGHT_RIM_PATH, 0);
const INITIAL_LAPEL_LEFT = evaluatePath(LAPEL_LEFT_PATH, 0);
const INITIAL_LAPEL_RIGHT = evaluatePath(LAPEL_RIGHT_PATH, 0);
const INITIAL_COAT_SEAM = evaluatePath(COAT_SEAM_PATH, 0);
const INITIAL_NEAR_BROW = evaluatePath(NEAR_BROW_PATH, 0);
const INITIAL_NEAR_EYELID = evaluatePath(NEAR_EYELID_IDLE_PATH, 0);
const INITIAL_NEAR_HUNTER = evaluatePath(NEAR_HUNTER_EYE_PATH, 0);
const INITIAL_FAR_BROW = evaluatePath(FAR_BROW_PATH, 0);
const INITIAL_FAR_HUNTER = evaluatePath(FAR_HUNTER_EYE_PATH, 0);

export function HeroSilhouette() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rigVersionRef = useRef('v5-sculpted-3pose');

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const portalSection = svg.closest<HTMLElement>('[data-gp-motion]');
    if (!portalSection) return;

    const backlight = svg.querySelector<SVGCircleElement>(
      '[data-rig-backlight]'
    );
    const bodyGroup = svg.querySelector<SVGGElement>('[data-character-body]');
    const headGroup = svg.querySelector<SVGGElement>('[data-rig-head-group]');
    const headCore = svg.querySelector<SVGPathElement>('[data-rig-head-core]');
    const faceLeftRim = svg.querySelector<SVGPathElement>(
      '[data-rig-face-left-rim]'
    );
    const faceRightRim = svg.querySelector<SVGPathElement>(
      '[data-rig-face-right-rim]'
    );
    const noseRelief = svg.querySelector<SVGPathElement>(
      '[data-rig-nose-relief]'
    );
    const mouthRelief = svg.querySelector<SVGPathElement>(
      '[data-rig-mouth-relief]'
    );
    const chinShadow = svg.querySelector<SVGPathElement>(
      '[data-rig-chin-shadow]'
    );
    const cheekRight = svg.querySelector<SVGPathElement>(
      '[data-rig-cheek-right]'
    );
    const cheekLeft = svg.querySelector<SVGPathElement>(
      '[data-rig-cheek-left]'
    );
    const rightEar = svg.querySelector<SVGPathElement>('[data-rig-right-ear]');
    const rightEarHelix = svg.querySelector<SVGPathElement>(
      '[data-rig-right-ear-helix]'
    );
    const leftEar = svg.querySelector<SVGPathElement>('[data-rig-left-ear]');
    const hairBack = svg.querySelector<SVGPathElement>('[data-rig-hair-back]');
    const hairCrown = svg.querySelector<SVGPathElement>(
      '[data-rig-hair-crown]'
    );
    const hairCrownRim = svg.querySelector<SVGPathElement>(
      '[data-rig-hair-crown-rim]'
    );
    const hairFringe = svg.querySelector<SVGPathElement>(
      '[data-rig-hair-fringe]'
    );
    const neckPillar = svg.querySelector<SVGPathElement>('[data-rig-neck]');
    const neckRim = svg.querySelector<SVGPathElement>('[data-rig-neck-rim]');
    const coatBody = svg.querySelector<SVGPathElement>('[data-rig-coat-body]');
    const coatLeftRim = svg.querySelector<SVGPathElement>(
      '[data-rig-coat-left-rim]'
    );
    const coatRightRim = svg.querySelector<SVGPathElement>(
      '[data-rig-coat-right-rim]'
    );
    const lapelLeft = svg.querySelector<SVGPathElement>(
      '[data-rig-lapel-left]'
    );
    const lapelRight = svg.querySelector<SVGPathElement>(
      '[data-rig-lapel-right]'
    );
    const coatSeam = svg.querySelector<SVGPathElement>('[data-rig-coat-seam]');
    const nearAura = svg.querySelector<SVGCircleElement>(
      '[data-rig-near-aura]'
    );
    const nearCatch = svg.querySelector<SVGCircleElement>(
      '[data-rig-near-catch]'
    );
    const nearBrow = svg.querySelector<SVGPathElement>('[data-rig-near-brow]');
    const nearEyelid = svg.querySelector<SVGPathElement>(
      '[data-rig-near-eyelid]'
    );
    const nearHunter = svg.querySelector<SVGPathElement>(
      '[data-rig-near-hunter]'
    );
    const farEyeGroup = svg.querySelector<SVGGElement>('[data-rig-far-group]');
    const farAura = svg.querySelector<SVGCircleElement>('[data-rig-far-aura]');
    const farBrow = svg.querySelector<SVGPathElement>('[data-rig-far-brow]');
    const farHunter = svg.querySelector<SVGPathElement>(
      '[data-rig-far-hunter]'
    );

    let lastTurn = -1;

    const applyPose = (rawTurn: number) => {
      if (Math.abs(rawTurn - lastTurn) < 0.0004) return;
      lastTurn = rawTurn;

      const pose = computeRigPoseMetrics(rawTurn);

      // Native SVG attributes prevent Chromium GPU sub-layer clipping/eviction on zoom
      backlight?.setAttribute('cx', (368 + pose.turn * 32).toFixed(2));
      bodyGroup?.setAttribute(
        'transform',
        `translate(${((1 - pose.turn) * -18).toFixed(2)} ${((1 - pose.turn) * 6).toFixed(2)})`
      );
      headGroup?.setAttribute('transform', `translate(0 ${pose.arcNodY})`);

      // 1. Head Core & Directional Studio Rim Contours (No fake cut-out line on back of jaw!)
      headCore?.setAttribute('d', evaluatePath(HEAD_CORE_PATH, pose.headT));
      faceLeftRim?.setAttribute(
        'd',
        evaluatePath(FACE_LEFT_RIM_PATH, pose.headT)
      );
      faceRightRim?.setAttribute(
        'd',
        evaluatePath(FACE_RIGHT_RIM_PATH, pose.headT)
      );
      if (faceRightRim) {
        faceRightRim.style.opacity = String(pose.rightJawRimOpacity);
      }

      // 2. Sculpted 3D Nose, Mouth, Chin & Cheekbones across all 3 poses
      noseRelief?.setAttribute('d', evaluatePath(NOSE_RELIEF_PATH, pose.headT));
      if (noseRelief) {
        noseRelief.style.opacity = String(pose.noseReliefOpacity);
      }
      mouthRelief?.setAttribute(
        'd',
        evaluatePath(MOUTH_RELIEF_PATH, pose.headT)
      );
      if (mouthRelief) {
        mouthRelief.style.opacity = String(pose.mouthReliefOpacity);
      }
      chinShadow?.setAttribute('d', evaluatePath(CHIN_SHADOW_PATH, pose.headT));
      if (chinShadow) {
        chinShadow.style.opacity = String(pose.mouthReliefOpacity);
      }
      cheekRight?.setAttribute(
        'd',
        evaluatePath(CHEEK_RIGHT_RELIEF_PATH, pose.headT)
      );
      if (cheekRight) {
        cheekRight.style.opacity = String(
          Number((0.25 + pose.frontReliefOpacity * 0.35).toFixed(3))
        );
      }
      cheekLeft?.setAttribute(
        'd',
        evaluatePath(CHEEK_LEFT_RELIEF_PATH, pose.headT)
      );
      if (cheekLeft) {
        cheekLeft.style.opacity = String(
          Number((pose.frontReliefOpacity * 0.55).toFixed(3))
        );
      }

      // 3. Anatomical Ears
      rightEar?.setAttribute(
        'd',
        evaluatePath(RIGHT_SIDE_EAR_PATH, pose.headT)
      );
      rightEarHelix?.setAttribute(
        'd',
        evaluatePath(RIGHT_EAR_HELIX_PATH, pose.headT)
      );
      leftEar?.setAttribute('d', evaluatePath(LEFT_SIDE_EAR_PATH, pose.headT));
      if (leftEar) {
        leftEar.style.opacity = String(pose.leftEarOpacity);
      }

      // 4. Proportional Wavy/Curly Hair Layers & Morphing Crown Rim Highlight
      hairBack?.setAttribute(
        'd',
        evaluatePath(HAIR_BACK_CURLS_PATH, pose.hairT)
      );
      hairCrown?.setAttribute(
        'd',
        evaluatePath(HAIR_CROWN_MASS_PATH, pose.hairT)
      );
      hairCrownRim?.setAttribute(
        'd',
        evaluatePath(HAIR_CROWN_RIM_PATH, pose.hairT)
      );
      hairFringe?.setAttribute('d', evaluatePath(HAIR_FRINGE_PATH, pose.hairT));

      // 5. Cylindrical Neck, Collar & Tailored Coat
      neckPillar?.setAttribute(
        'd',
        evaluatePath(NECK_PILLAR_PATH, pose.torsoT)
      );
      neckRim?.setAttribute('d', evaluatePath(NECK_LEFT_RIM_PATH, pose.torsoT));
      coatBody?.setAttribute('d', evaluatePath(COAT_BODY_PATH, pose.torsoT));
      coatLeftRim?.setAttribute(
        'd',
        evaluatePath(COAT_LEFT_RIM_PATH, pose.torsoT)
      );
      coatRightRim?.setAttribute(
        'd',
        evaluatePath(COAT_RIGHT_RIM_PATH, pose.torsoT)
      );
      lapelLeft?.setAttribute('d', evaluatePath(LAPEL_LEFT_PATH, pose.torsoT));
      lapelRight?.setAttribute(
        'd',
        evaluatePath(LAPEL_RIGHT_PATH, pose.torsoT)
      );
      coatSeam?.setAttribute('d', evaluatePath(COAT_SEAM_PATH, pose.torsoT));

      // 6. Near Eye (Anatomical Left Eye at Front x=426)
      nearAura?.setAttribute('cx', String(pose.nearEyeCx));
      nearCatch?.setAttribute('cx', String(pose.nearEyeCx));
      nearBrow?.setAttribute('d', evaluatePath(NEAR_BROW_PATH, pose.headT));
      nearEyelid?.setAttribute(
        'd',
        evaluatePath(NEAR_EYELID_IDLE_PATH, pose.headT)
      );
      nearHunter?.setAttribute(
        'd',
        evaluatePath(NEAR_HUNTER_EYE_PATH, pose.headT)
      );

      // 7. Far Eye (Anatomical Right Eye -> Target of Eye Dive at x=374, y=215.5)
      if (farEyeGroup) {
        farEyeGroup.style.opacity = String(pose.farEyeVisibility);
      }
      farAura?.setAttribute('cx', String(pose.farEyeCx));
      farBrow?.setAttribute('d', evaluatePath(FAR_BROW_PATH, pose.headT));
      farHunter?.setAttribute(
        'd',
        evaluatePath(FAR_HUNTER_EYE_PATH, pose.headT)
      );
    };

    const syncFromSection = () => {
      const raw = portalSection.style.getPropertyValue('--gp-head-turn');
      const val = raw ? Number.parseFloat(raw) || 0 : 0;
      applyPose(val);
    };

    svg.dataset.rigVersion = rigVersionRef.current;
    syncFromSection();

    portalSection.addEventListener('hero-head-turn', syncFromSection);
    const observer = new MutationObserver(syncFromSection);
    observer.observe(portalSection, {
      attributes: true,
      attributeFilter: ['style', 'data-gp-progress'],
    });

    return () => {
      portalSection.removeEventListener('hero-head-turn', syncFromSection);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="absolute inset-0 flex justify-center items-end pointer-events-none z-[2] overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative w-full max-w-[540px] sm:max-w-[680px] lg:max-w-[800px] h-[80%] sm:h-[86%] lg:h-[90%] flex items-end justify-center">
        <svg
          key="hero-silhouette-v5"
          ref={svgRef}
          viewBox="0 -60 800 740"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <radialGradient id="headBacklight" cx="48%" cy="42%" r="50%">
              <stop offset="0%" stopColor="#D6335C" stopOpacity="0.88" />
              <stop offset="38%" stopColor="#9E1B32" stopOpacity="0.5" />
              <stop offset="72%" stopColor="#4A0916" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#1F0409" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="faceRimLight" x1="0%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#E85A7C" />
              <stop offset="45%" stopColor="#C42448" />
              <stop offset="85%" stopColor="#6E0F23" />
              <stop offset="100%" stopColor="#26040B" />
            </linearGradient>

            <linearGradient id="rightJawGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#88132A" />
              <stop offset="55%" stopColor="#C42448" />
              <stop offset="100%" stopColor="#6E0F23" />
            </linearGradient>

            <linearGradient id="coatGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#24040B" />
              <stop offset="40%" stopColor="#120206" />
              <stop offset="100%" stopColor="#070103" />
            </linearGradient>

            <radialGradient id="eyeWhiteAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="36%" stopColor="#F5F0EB" stopOpacity="0.52" />
              <stop offset="70%" stopColor="#E04D70" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#9E1B32" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Studio Backlight Aura */}
          <circle
            data-rig-backlight
            cx="368"
            cy="275"
            r="295"
            fill="url(#headBacklight)"
          />

          {/* ============================================================================
              MASTER CHARACTER BODY SHIFT (Steps +18px rightward & rises -6px into center frame)
          ============================================================================= */}
          <g data-character-body transform="translate(-18 6)">
            {/* ==============================================================
                1. 3D MORPHING TORSO, CYLINDRICAL NECK & TAILORED COAT LAPELS
            =============================================================== */}
            <g>
              {/* Sculpted Cylindrical Neck Pillar */}
              <path data-rig-neck d={INITIAL_NECK} fill="#110205" />
              {/* Warm Rim Highlight on Left Neck Sternocleidomastoid Edge */}
              <path
                data-rig-neck-rim
                d={INITIAL_NECK_RIM}
                fill="none"
                stroke="#88132A"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.72"
              />

              {/* Broad Masculine Coat Body */}
              <path
                data-rig-coat-body
                d={INITIAL_COAT_BODY}
                fill="url(#coatGrad)"
              />

              {/* Left & Right Outer Shoulder Rim Highlights */}
              <path
                data-rig-coat-left-rim
                d={INITIAL_COAT_LEFT_RIM}
                fill="none"
                stroke="#B81D3D"
                strokeWidth="2.5"
                opacity="0.82"
              />
              <path
                data-rig-coat-right-rim
                d={INITIAL_COAT_RIGHT_RIM}
                fill="none"
                stroke="#9E1B32"
                strokeWidth="2.4"
                opacity="0.68"
              />

              {/* Tailored Left & Right Collar Lapels & Coat Center Seam */}
              <path
                data-rig-lapel-left
                d={INITIAL_LAPEL_LEFT}
                fill="#1D0309"
                stroke="#6E0F23"
                strokeWidth="1.4"
              />
              <path
                data-rig-lapel-right
                d={INITIAL_LAPEL_RIGHT}
                fill="#190308"
                stroke="#520A18"
                strokeWidth="1.4"
              />
              <path
                data-rig-coat-seam
                d={INITIAL_COAT_SEAM}
                fill="none"
                stroke="#4A0916"
                strokeWidth="2"
                opacity="0.75"
              />
            </g>

            {/* ==============================================================
                2. 3D ROTATING HEAD, HAIR CURLS, FACE & HUNTER EYES
            =============================================================== */}
            <g data-rig-head-group>
              {/* A. Back-of-Skull Volumetric Hair Curls */}
              <path
                data-rig-hair-back
                d={INITIAL_HAIR_BACK}
                fill="#130206"
                stroke="#6E0F23"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              {/* B. Crown Curly Hair Volume & Natural Morphing Crown Rim */}
              <g>
                <path
                  data-rig-hair-crown
                  d={INITIAL_HAIR_CROWN}
                  fill="#120206"
                />
                <path
                  data-rig-hair-crown-rim
                  d={INITIAL_HAIR_CROWN_RIM}
                  fill="none"
                  stroke="#9E1B32"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.82"
                />
              </g>

              {/* C. Left Ear (Emerges as head turns toward front) */}
              <path
                data-rig-left-ear
                d={INITIAL_LEFT_EAR}
                fill="#1D0309"
                stroke="#7D1128"
                strokeWidth="1.3"
                style={{ opacity: 0 }}
              />

              {/* D. Solid Obsidian Head & Face Core */}
              <path
                data-rig-head-core
                d={INITIAL_HEAD_CORE}
                fill="#110205"
              />

              {/* E. Directional Studio Rim Contours (Left/Front Key Rim + Right Gonial Jaw Rim) */}
              <path
                data-rig-face-left-rim
                d={INITIAL_FACE_LEFT_RIM}
                fill="none"
                stroke="url(#faceRimLight)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                data-rig-face-right-rim
                d={INITIAL_FACE_RIGHT_RIM}
                fill="none"
                stroke="url(#rightJawGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                style={{ opacity: 0.12 }}
              />

              {/* F. Right Ear (Subtle Obsidian Fill + Outer Helix Rim so it blends naturally into the head) */}
              <path
                data-rig-right-ear
                d={INITIAL_RIGHT_EAR}
                fill="#160207"
              />
              <path
                data-rig-right-ear-helix
                d={INITIAL_RIGHT_EAR_HELIX}
                fill="none"
                stroke="#7D1128"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* G. 3-Pose Morphing Cheekbones, Mouth & Chin Relief (Active in Side, 3/4, and Front!) */}
              <path
                data-rig-cheek-right
                d={INITIAL_CHEEK_RIGHT}
                fill="#520A18"
                style={{ opacity: 0.25 }}
              />
              <path
                data-rig-cheek-left
                d={INITIAL_CHEEK_LEFT}
                fill="#520A18"
                style={{ opacity: 0 }}
              />
              <path
                data-rig-mouth-relief
                d={INITIAL_MOUTH_RELIEF}
                fill="none"
                stroke="#6E0F23"
                strokeWidth="1.8"
                strokeLinecap="round"
                style={{ opacity: 0.35 }}
              />
              <path
                data-rig-chin-shadow
                d={INITIAL_CHIN_SHADOW}
                fill="none"
                stroke="#4A0916"
                strokeWidth="1.4"
                strokeLinecap="round"
                style={{ opacity: 0.35 }}
              />

              {/* H. Far-Side Eye (Anatomical Right Eye / Viewer's Left -> Target of Eye Dive at 374, 215.5) */}
              <g data-rig-far-group style={{ opacity: 0 }}>
                <circle
                  data-rig-far-aura
                  cx="374"
                  cy="215.5"
                  r="24"
                  fill="url(#eyeWhiteAura)"
                  style={{ opacity: 'var(--gp-eyes-glow, 0)' }}
                />
                <path
                  data-rig-far-brow
                  d={INITIAL_FAR_BROW}
                  fill="none"
                  stroke="#E04D70"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  data-rig-far-hunter
                  d={INITIAL_FAR_HUNTER}
                  fill="#FFFFFF"
                  stroke="#F5F0EB"
                  strokeWidth="0.8"
                  style={{
                    opacity: 'calc(0.28 + var(--gp-eyes-glow, 0) * 0.72)',
                  }}
                />
              </g>

              {/* I. Internal 3D Nose Bridge & Tip Contour */}
              <path
                data-rig-nose-relief
                d={INITIAL_NOSE_RELIEF}
                fill="none"
                stroke="url(#faceRimLight)"
                strokeWidth="2.1"
                strokeLinecap="round"
                style={{ opacity: 0 }}
              />

              {/* J. Near-Side Eye (Anatomical Left Eye / Viewer's Right at 426, 215.5) */}
              <g>
                <circle
                  data-rig-near-aura
                  cx="344"
                  cy="215.5"
                  r="24"
                  fill="url(#eyeWhiteAura)"
                  style={{ opacity: 'var(--gp-eyes-glow, 0)' }}
                />
                <path
                  data-rig-near-brow
                  d={INITIAL_NEAR_BROW}
                  fill="none"
                  stroke="#E04D70"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  opacity="0.92"
                />
                <g style={{ opacity: 'calc(1 - var(--gp-eyes-glow, 0))' }}>
                  <path
                    data-rig-near-eyelid
                    d={INITIAL_NEAR_EYELID}
                    fill="none"
                    stroke="#D6335C"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle
                    data-rig-near-catch
                    cx="344"
                    cy="215.5"
                    r="1.7"
                    fill="#F5F0EB"
                    opacity="0.78"
                  />
                </g>
                <path
                  data-rig-near-hunter
                  d={INITIAL_NEAR_HUNTER}
                  fill="#FFFFFF"
                  stroke="#F5F0EB"
                  strokeWidth="0.8"
                  style={{
                    opacity: 'calc(0.22 + var(--gp-eyes-glow, 0) * 0.78)',
                  }}
                />
              </g>

              {/* K. Signature Forehead Comma / Curtain Fringe */}
              <path
                data-rig-hair-fringe
                d={INITIAL_HAIR_FRINGE}
                fill="#120206"
              />
            </g>
          </g>

          {/* Static Measured Target Anchor at Final Front-Facing Anatomical Right Eye (cx=374, cy=215.5) */}
          <circle
            data-eye-portal-anchor
            cx="374"
            cy="215.5"
            r="2.4"
            fill="#F5F0EB"
            opacity="0"
          />
        </svg>
      </div>
    </div>
  );
}
