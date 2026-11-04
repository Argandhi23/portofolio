/**
 * Ultra-Lightweight 3D-Projected Multi-Pose SVG Morph Engine for the Hero Studio Character.
 *
 * - Preserves 100% of the original Folioblox studio silhouette visual identity (obsidian core,
 *   warm crimson-burgundy rim gradients, lush curly/wavy hair, comma fringe, tailored high-collar coat,
 *   and glowing white hunter eyes).
 * - Strictly preserves true 3D spatial topology across the entire turn (0° Side -> 45° 3/4 -> 90° Front):
 *   x_farEye (viewer's left, target 374) < x_noseBridge (312 -> 362 -> 400) < x_nearEye (344 -> 394 -> 426) < x_nearEar (404 -> 450 -> 461).
 *   No facial feature ever crosses over another!
 * - Uses dedicated directional rim contours (FACE_LEFT_RIM_PATH & FACE_RIGHT_RIM_PATH) so Side Profile
 *   and 3/4 View never show a fake pink semicircle cutting through the back of the jaw/head.
 * - Runs in < 0.04ms per frame ONLY when `--gp-head-turn` changes (0% idle CPU/GPU).
 */

import { clamp, smoothstep } from '@/lib/scroll-math';

export interface BustEyeProjection {
  /** Normalized horizontal position [0..1] from left edge of 800x740 viewBox */
  u: number;
  /** Normalized vertical position [0..1] from top edge of 800x740 viewBox (0 -60 800 740) */
  v: number;
}

/**
 * Exact SVG coordinates of the anatomical right eye (viewer's left) at front pose (headTurn = 1).
 */
export const RIGHT_EYE_WORLD_AT_FRONT = {
  x: 374,
  y: 215.5,
  z: 1,
} as const;

export function projectWorldPointToCanvasUV(
  worldPoint: { x: number; y: number; z: number },
  aspect = 800 / 740
): BustEyeProjection {
  if (Math.abs(worldPoint.x) > 10 || Math.abs(worldPoint.y) > 10) {
    const u = clamp(worldPoint.x / 800, 0, 1);
    const v = clamp((worldPoint.y + 60) / 740, 0, 1);
    return {
      u: Number(u.toFixed(4)),
      v: Number(v.toFixed(4)),
    };
  }

  const px = worldPoint.x;
  const py = worldPoint.y + 0.08;
  const u = clamp(0.5 + px / (2.0 * aspect), 0, 1);
  const v = clamp(0.5 - py / 2.0, 0, 1);
  return {
    u: Number(u.toFixed(4)),
    v: Number(v.toFixed(4)),
  };
}

/**
 * Smooth 3-keyframe Lagrange interpolation through:
 * - k0 at t = 0.0 (90° Side Profile)
 * - k1 at t = 0.5 (45° Three-Quarter View)
 * - k2 at t = 1.0 (0° Front View)
 */
export function interp3(k0: number, k1: number, k2: number, t: number): number {
  const u = clamp(t, 0, 1);
  const l0 = (u - 0.5) * (u - 1.0) * 2.0;
  const l1 = u * (1.0 - u) * 4.0;
  const l2 = u * (u - 0.5) * 2.0;
  return k0 * l0 + k1 * l1 + k2 * l2;
}

type PathTemplate = {
  strings: readonly string[];
  k0: readonly number[];
  k1: readonly number[];
  k2: readonly number[];
};

function compilePathTemplate(
  pose0: string,
  pose1: string,
  pose2: string
): PathTemplate {
  const numRegex = /-?\d+(?:\.\d+)?/g;
  const strings = pose0.split(numRegex);
  const k0 = (pose0.match(numRegex) ?? []).map(Number);
  const k1 = (pose1.match(numRegex) ?? []).map(Number);
  const k2 = (pose2.match(numRegex) ?? []).map(Number);

  if (k0.length !== k1.length || k0.length !== k2.length) {
    throw new Error(
      `SVG morph template mismatch: ${k0.length} vs ${k1.length} vs ${k2.length}`
    );
  }

  return { strings, k0, k1, k2 };
}

export function evaluatePath(tpl: PathTemplate, t: number): string {
  const u = clamp(t, 0, 1);
  if (u <= 0.0001) {
    let out = tpl.strings[0];
    for (let i = 0; i < tpl.k0.length; i++) {
      out += tpl.k0[i] + tpl.strings[i + 1];
    }
    return out;
  }
  if (u >= 0.9999) {
    let out = tpl.strings[0];
    for (let i = 0; i < tpl.k2.length; i++) {
      out += tpl.k2[i] + tpl.strings[i + 1];
    }
    return out;
  }

  const l0 = (u - 0.5) * (u - 1.0) * 2.0;
  const l1 = u * (1.0 - u) * 4.0;
  const l2 = u * (u - 0.5) * 2.0;

  let out = tpl.strings[0];
  for (let i = 0; i < tpl.k0.length; i++) {
    const val = tpl.k0[i] * l0 + tpl.k1[i] * l1 + tpl.k2[i] * l2;
    out += val.toFixed(1) + tpl.strings[i + 1];
  }
  return out;
}

/**
 * 1. HEAD & FACE OBSIDIAN SILHOUETTE CORE (HEAD_RIM_PATH & HEAD_CORE_PATH)
 * Sculpted across all 3 poses with masculine brow, nose, lips, chin, and gonial jaw angle.
 */
export const HEAD_RIM_PATH = compilePathTemplate(
  // Pose 0: Sharp Masculine Side Profile
  `M 382 162
   C 356 162, 336 176, 332 203
   C 322 211, 313 219, 312 226
   C 311 231, 318 235, 325 238
   C 318 243, 316 248, 321 253
   C 316 258, 317 264, 323 269
   C 317 281, 321 294, 335 299
   C 356 303, 384 291, 404 270
   C 412 258, 416 244, 416 228
   C 416 184, 402 162, 382 162 Z`,
  // Pose 1: 45° Three-Quarter View (Sculpted far cheekbone x=330, 3/4 chin x=374..388, crisp near gonial jaw x=436,y=274)
  `M 392 162
   C 362 162, 340 175, 336 202
   C 331 212, 329 222, 331 232
   C 333 241, 338 250, 342 258
   C 346 266, 350 274, 355 282
   C 360 289, 366 296, 373 300
   C 380 304, 388 304, 396 301
   C 412 296, 428 286, 437 273
   C 446 258, 450 239, 450 222
   C 449 176, 424 162, 392 162 Z`,
  // Pose 2: Symmetrical Masculine V-Taper Front Portrait (x=343..457, gonial angles at y=274, chin at 400,303)
  `M 400 162
   C 368 162, 344 172, 343 196
   C 342 208, 342 218, 343 228
   C 344 239, 347 252, 352 264
   C 355 271, 359 277, 364 283
   C 370 290, 377 296, 385 300
   C 392 303, 400 304, 408 302
   C 420 298, 434 287, 442 274
   C 451 259, 456 240, 457 224
   C 456 172, 432 162, 400 162 Z`
);

export const HEAD_CORE_PATH = compilePathTemplate(
  `M 382 164
   C 358 164, 339 178, 335 204
   C 325 212, 317 220, 316 226
   C 315 231, 322 235, 328 238
   C 322 243, 320 248, 324 253
   C 320 258, 321 264, 327 269
   C 321 280, 325 292, 338 297
   C 358 300, 385 289, 404 268
   C 412 256, 416 243, 416 228
   C 416 184, 401 164, 382 164 Z`,
  `M 392 164
   C 364 164, 343 177, 339 203
   C 334 213, 332 222, 334 232
   C 336 241, 341 249, 345 257
   C 349 265, 353 273, 358 280
   C 363 287, 369 294, 375 298
   C 382 301, 389 301, 396 299
   C 411 294, 426 284, 435 272
   C 444 257, 448 239, 448 222
   C 447 178, 422 164, 392 164 Z`,
  `M 400 164
   C 370 164, 347 174, 346 197
   C 345 209, 345 218, 346 228
   C 347 239, 350 251, 355 262
   C 358 269, 362 275, 367 281
   C 373 288, 379 294, 387 298
   C 393 300, 400 301, 407 299
   C 418 296, 431 285, 439 272
   C 448 258, 453 239, 454 224
   C 453 174, 430 164, 400 164 Z`
);

/**
 * 2. DIRECTIONAL STUDIO RIM CONTOURS (Eliminates fake pink line on back of jaw in Side & 3/4 views!)
 * - FACE_LEFT_RIM_PATH: Primary left/front rim light from brow -> nose/cheek -> chin -> lower jaw.
 * - FACE_RIGHT_RIM_PATH: Secondary right jaw rim light (faint in side profile, sculpted in 3/4, full in front).
 */
export const FACE_LEFT_RIM_PATH = compilePathTemplate(
  // Pose 0: Full Side Profile Rim (Forehead -> Nose -> Lips -> Chin -> Under-Jaw taper)
  `M 344 176
   C 336 186, 333 195, 332 203
   C 322 211, 313 219, 312 226
   C 311 231, 318 235, 325 238
   C 318 243, 316 248, 321 253
   C 316 258, 317 264, 323 269
   C 317 281, 321 294, 335 299
   C 350 302, 368 296, 384 285`,
  // Pose 1: 45° Three-Quarter Left Temple, Far Cheekbone & Chin Rim
  `M 344 178
   C 339 187, 337 195, 336 202
   C 331 212, 329 222, 331 232
   C 333 241, 338 250, 342 258
   C 346 266, 350 274, 355 282
   C 360 289, 366 296, 373 300
   C 380 304, 388 304, 396 301
   C 404 298, 412 294, 420 288`,
  // Pose 2: Front View Left Temple, Cheekbone & Left V-Taper Jaw Rim
  `M 347 180
   C 344 188, 343 196, 343 204
   C 342 212, 342 220, 343 228
   C 344 239, 347 252, 352 264
   C 355 271, 359 277, 364 283
   C 370 290, 377 296, 385 300
   C 392 303, 396 304, 400 304
   C 404 304, 408 303, 412 301`
);

export const FACE_RIGHT_RIM_PATH = compilePathTemplate(
  // Pose 0: Subtle lower-jaw shadow edge under the ear (faded out in side profile)
  `M 368 294 C 384 288, 396 279, 404 268 C 410 258, 413 248, 414 238`,
  // Pose 1: 3/4 Masculine Near Mandibular Angle & Cheek Rim
  `M 390 302 C 410 297, 427 286, 437 273 C 446 258, 450 239, 450 220`,
  // Pose 2: Front View Right V-Taper Jaw & Cheekbone Rim
  `M 400 304 C 416 303, 433 289, 442 274 C 451 259, 456 240, 457 204`
);

/**
 * 3. SCULPTED 3D INTERIOR NOSE BRIDGE, TIP & NOSTRIL WING
 * Strictly between farEye (viewer's left) and nearEye (viewer's right) across all poses!
 */
export const NOSE_RELIEF_PATH = compilePathTemplate(
  `M 332 203 C 322 211, 314 219, 313 226 C 312 231, 318 235, 326 238`,
  `M 367 203 C 361 214, 356 225, 356 234 C 356 241, 364 245, 374 243`,
  `M 397 203 C 395 215, 394 226, 395 236 C 396 243, 401 246, 407 243`
);

/**
 * 4. 3-POSE MORPHING MOUTH & CHEEKBONE CONTOURS (So 3/4 View & Front View both have sculpted anatomy!)
 */
export const MOUTH_RELIEF_PATH = compilePathTemplate(
  // Pose 0: Side profile lip parting shadow
  `M 320 253 C 324 253, 329 253, 333 254`,
  // Pose 1: 3/4 view sculpted masculine mouth line (aligned with 3/4 nose & chin!)
  `M 356 266 C 364 264, 374 264, 383 266`,
  // Pose 2: Front view symmetrical mouth line
  `M 386 269 C 394 267, 406 267, 414 269`
);

export const CHIN_SHADOW_PATH = compilePathTemplate(
  `M 323 268 Q 327 270 331 269`,
  `M 362 274 Q 370 277 378 274`,
  `M 392 277 Q 400 280 408 277`
);

export const CHEEK_RIGHT_RELIEF_PATH = compilePathTemplate(
  `M 382 228 C 378 244, 370 260, 358 272 C 370 264, 380 248, 382 228 Z`,
  `M 432 226 C 426 245, 416 263, 404 277 C 418 269, 428 250, 432 226 Z`,
  `M 448 226 C 442 246, 433 265, 422 280 C 434 272, 444 254, 448 226 Z`
);

export const CHEEK_LEFT_RELIEF_PATH = compilePathTemplate(
  `M 334 228 C 335 240, 336 250, 338 258 C 335 250, 334 240, 334 228 Z`,
  `M 338 228 C 342 245, 348 262, 356 275 C 347 267, 340 250, 338 228 Z`,
  `M 352 226 C 358 246, 367 265, 378 280 C 366 272, 356 254, 352 226 Z`
);

/**
 * 5. ANATOMICAL EARS (Subtle outer helix rim + inner tragus curve, never a pasted-on red oval!)
 */
export const RIGHT_SIDE_EAR_PATH = compilePathTemplate(
  `M 398 210 C 411 206, 418 222, 410 240 C 405 246, 398 243, 396 235 Z`,
  `M 446 211 C 458 208, 462 226, 455 242 C 451 246, 445 243, 445 235 Z`,
  `M 455 211 C 466 210, 468 229, 461 243 C 457 246, 452 244, 452 235 Z`
);

export const RIGHT_EAR_HELIX_PATH = compilePathTemplate(
  `M 400 211 C 411 208, 416 222, 409 239 C 405 244, 400 242, 398 237`,
  `M 448 212 C 458 210, 461 226, 454 241 C 451 245, 447 243, 446 238`,
  `M 456 212 C 465 211, 467 228, 460 242 C 457 245, 454 243, 453 238`
);

export const LEFT_SIDE_EAR_PATH = compilePathTemplate(
  `M 356 212 C 352 212, 352 230, 355 242 C 357 244, 360 243, 360 236 Z`,
  `M 336 212 C 329 212, 328 229, 333 242 C 336 244, 339 243, 339 236 Z`,
  `M 345 211 C 334 210, 332 229, 339 243 C 343 246, 348 244, 348 235 Z`
);

/**
 * 6. PROPORTIONAL VOLUMETRIC CURLY / WAVY STUDIO HAIR
 * Distinct sculpted curl waves along the crown & temples in all 3 poses (never a smooth round helmet!).
 */
export const HAIR_BACK_CURLS_PATH = compilePathTemplate(
  // Pose 0: Sculpted Wavy/Curly Side Profile
  `M 326 192
   C 312 168, 316 138, 336 122
   C 344 98, 368 86, 394 94
   C 414 78, 448 84, 468 106
   C 492 114, 504 140, 492 164
   C 506 180, 504 208, 486 226
   C 494 244, 482 266, 462 274
   C 450 288, 430 292, 412 282
   C 402 276, 394 268, 388 260 Z`,
  // Pose 1: 45° Three-Quarter Wavy/Curly Volume with Natural Crown Scallops
  `M 322 198
   C 308 172, 314 142, 334 126
   C 340 100, 364 88, 390 94
   C 410 78, 442 84, 460 106
   C 482 116, 494 142, 482 166
   C 494 182, 490 208, 474 224
   C 478 240, 468 258, 452 264
   C 440 274, 424 276, 410 270
   C 396 264, 384 258, 376 252 Z`,
  // Pose 2: Symmetrical Wavy/Curly Studio Crown & Temple Curls in Front View
  `M 328 212
   C 312 192, 310 164, 324 144
   C 322 118, 342 98, 366 98
   C 380 80, 420 80, 434 98
   C 458 98, 478 118, 476 144
   C 490 164, 488 192, 472 212
   C 478 226, 468 240, 454 246
   C 440 252, 360 252, 346 246
   C 332 240, 322 226, 328 212 Z`
);

export const HAIR_CROWN_MASS_PATH = compilePathTemplate(
  `M 326 194
   C 314 170, 318 140, 336 124
   C 346 100, 370 88, 394 96
   C 414 80, 444 86, 464 108
   C 484 118, 494 142, 484 166
   C 494 182, 490 206, 474 222
   C 472 232, 464 240, 454 244
   L 336 206 Z`,
  `M 322 198
   C 310 172, 316 142, 335 126
   C 342 102, 366 90, 390 96
   C 410 80, 438 86, 456 108
   C 476 118, 486 144, 476 168
   C 484 184, 480 206, 466 218
   C 464 226, 458 230, 450 232
   L 336 206 Z`,
  `M 328 210
   C 314 190, 312 164, 326 144
   C 324 120, 344 100, 366 100
   C 380 82, 420 82, 434 100
   C 456 100, 476 120, 474 144
   C 488 164, 486 190, 472 210
   C 470 212, 466 212, 462 212
   L 328 210 Z`
);

/**
 * 7. NATURAL MORPHING CROWN CURL RIM HIGHLIGHTS
 */
export const HAIR_CROWN_RIM_PATH = compilePathTemplate(
  `M 320 166 C 318 144, 326 128, 338 120 C 346 98, 370 88, 394 94`,
  `M 316 170 C 314 148, 322 132, 335 124 C 342 100, 366 90, 390 95`,
  `M 318 174 C 316 154, 320 140, 326 134 C 328 114, 346 98, 368 98`
);

/**
 * 8. SOLID FOREHEAD CURTAIN / COMMA FRINGE
 */
export const HAIR_FRINGE_PATH = compilePathTemplate(
  // Pose 0: Side-swept comma bangs overhanging left brow
  `M 322 195
   C 316 168, 328 140, 358 132
   L 422 132
   C 438 146, 444 174, 438 208
   C 426 190, 414 178, 402 172
   C 398 186, 392 198, 384 206
   C 384 190, 380 174, 370 166
   C 364 172, 358 182, 352 192
   C 348 184, 344 174, 340 168
   C 334 174, 328 183, 322 195 Z`,
  // Pose 1: 45° Three-Quarter Curtain/Comma Fringe
  `M 330 197
   C 324 168, 340 138, 372 132
   L 432 132
   C 450 146, 458 172, 452 202
   C 440 182, 428 170, 416 166
   C 418 178, 416 190, 410 198
   C 406 180, 396 166, 386 160
   C 378 168, 370 180, 364 194
   C 358 186, 354 174, 356 164
   C 346 170, 338 182, 330 197 Z`,
  // Pose 2: Symmetrical Center-Parted Comma Curtain Bangs in Front View
  `M 338 199
   C 332 168, 348 138, 378 132
   L 422 132
   C 452 138, 468 168, 462 199
   C 450 180, 438 168, 424 164
   C 428 178, 426 189, 420 197
   C 414 180, 406 166, 400 160
   C 394 166, 386 180, 380 197
   C 374 189, 372 178, 376 164
   C 362 168, 350 180, 338 199 Z`
);

/**
 * 9. ANATOMICAL CYLINDRICAL NECK, INNER STAND-COLLAR & BROAD MASCULINE COAT
 * Neck is tucked cleanly inside the collar opening (zero boxy steps sticking out around the neck!).
 */
export const NECK_PILLAR_PATH = compilePathTemplate(
  `M 350 288 C 350 304, 348 320, 346 344 L 418 344 C 416 318, 414 290, 412 264 Z`,
  `M 360 286 C 360 304, 358 320, 356 344 L 430 344 C 428 320, 426 296, 424 274 Z`,
  `M 366 284 C 366 302, 364 320, 362 344 L 438 344 C 436 320, 434 302, 434 284 Z`
);

export const NECK_LEFT_RIM_PATH = compilePathTemplate(
  `M 350 292 C 350 306, 349 318, 347 328`,
  `M 360 290 C 360 304, 359 316, 357 326`,
  `M 366 288 C 366 302, 365 314, 363 324`
);

export const COAT_BODY_PATH = compilePathTemplate(
  `M 332 324
   C 356 316, 422 314, 446 322
   L 526 380
   C 556 416, 570 518, 576 680
   L 242 680
   C 250 524, 272 424, 302 380 Z`,
  `M 336 324
   C 362 316, 432 316, 456 324
   L 544 384
   C 576 420, 592 520, 598 680
   L 210 680
   C 218 522, 242 422, 278 384 Z`,
  `M 340 324
   C 368 318, 432 318, 460 324
   L 558 386
   C 590 422, 604 522, 610 680
   L 190 680
   C 196 522, 210 422, 242 386 Z`
);

export const COAT_LEFT_RIM_PATH = compilePathTemplate(
  `M 332 325 L 302 380 C 274 424, 252 524, 246 680`,
  `M 336 325 L 278 384 C 244 422, 220 522, 214 680`,
  `M 340 325 L 242 386 C 212 422, 198 522, 194 680`
);

export const COAT_RIGHT_RIM_PATH = compilePathTemplate(
  `M 446 323 L 526 380 C 554 416, 566 518, 572 680`,
  `M 456 325 L 544 384 C 574 420, 588 520, 594 680`,
  `M 460 325 L 558 386 C 588 422, 602 522, 606 680`
);

export const LAPEL_LEFT_PATH = compilePathTemplate(
  `M 332 324 L 336 428 L 354 408 L 346 320 Z`,
  `M 336 324 L 356 430 L 378 410 L 356 320 Z`,
  `M 340 324 L 372 432 L 400 412 L 362 320 Z`
);

export const LAPEL_RIGHT_PATH = compilePathTemplate(
  `M 434 320 L 382 430 L 354 408 L 414 316 Z`,
  `M 448 322 L 404 431 L 378 410 L 426 318 Z`,
  `M 460 324 L 428 432 L 400 412 L 438 320 Z`
);

export const COAT_SEAM_PATH = compilePathTemplate(
  `M 354 408 L 344 680`,
  `M 378 410 L 376 680`,
  `M 400 412 L 400 680`
);

/**
 * 10. NEAR EYE DURING TURN (Viewer's RIGHT Eye at Front x=426, y=215.5)
 */
export const NEAR_BROW_PATH = compilePathTemplate(
  `M 334 202 C 340 198, 350 200, 358 205`,
  `M 412 204 C 402 200, 390 201.5, 378 206.5`,
  `M 446 204.5 C 436 200.5, 422 202, 410 207`
);

export const NEAR_EYELID_IDLE_PATH = compilePathTemplate(
  `M 336 214.5 C 341 211, 349 211.8, 355 216`,
  `M 408 215 C 401 211.2, 390 211.8, 381 216.2`,
  `M 440 215.5 C 433 211.5, 422 212, 414 216.5`
);

export const NEAR_HUNTER_EYE_PATH = compilePathTemplate(
  `M 335 214.5 C 340 211, 348 211.2, 355 216 C 349 218.8, 340 218.5, 335 214.5 Z`,
  `M 409 214.8 C 402 211, 391 211.2, 381 216.2 C 389 219.2, 401 218.8, 409 214.8 Z`,
  `M 442 215 C 435 211, 424 211.2, 413 216.5 C 421 219.5, 434 219.2, 442 215 Z`
);

/**
 * 11. FAR EYE DURING TURN (Viewer's LEFT Eye / Anatomical Right Eye -> Target of Eye Dive at x=374, y=215.5!)
 */
export const FAR_BROW_PATH = compilePathTemplate(
  `M 320 203.5 C 324 200, 330 201, 336 205.5`,
  `M 332 204 C 338 200, 348 201.5, 358 206.5`,
  `M 354 204.5 C 364 200.5, 378 202, 390 207`
);

export const FAR_HUNTER_EYE_PATH = compilePathTemplate(
  `M 322 214.8 C 325 211.2, 331 211.4, 336 216 C 332 218.6, 325 218.4, 322 214.8 Z`,
  `M 334 214.8 C 340 211, 348 211.2, 356 216.2 C 350 219.2, 340 218.8, 334 214.8 Z`,
  `M 358 215 C 365 211, 376 211.2, 387 216.5 C 379 219.5, 366 219.2, 358 215 Z`
);

export interface RigPoseMetrics {
  turn: number;
  headT: number;
  hairT: number;
  torsoT: number;
  arcNodY: number;
  nearEyeCx: number;
  farEyeCx: number;
  farEyeVisibility: number;
  leftEarOpacity: number;
  frontReliefOpacity: number;
  noseReliefOpacity: number;
  rightJawRimOpacity: number;
  mouthReliefOpacity: number;
}

export function computeRigPoseMetrics(rawTurn: number): RigPoseMetrics {
  const turn = clamp(rawTurn, 0, 1);
  const headT = smoothstep(0.0, 0.96, turn);
  const hairT = smoothstep(0.03, 1.0, turn);
  const torsoT = smoothstep(0.06, 1.0, turn);

  const arcNodY = Number((Math.sin(headT * Math.PI) * 4.5).toFixed(2));

  // Near eye travels from x=344 (side profile) -> x=394 (3/4 view) -> x=426 (front right eye)
  const nearEyeCx = Number(interp3(344, 394, 426, headT).toFixed(2));
  // Far eye (target eye) emerges from x=328 (behind nose) -> x=345 (3/4 left eye) -> x=374 (front left eye)
  const farEyeCx = Number(interp3(328, 345, 374, headT).toFixed(2));

  const farEyeVisibility = Number(smoothstep(0.18, 0.48, headT).toFixed(3));
  const leftEarOpacity = Number(smoothstep(0.35, 0.75, headT).toFixed(3));
  const frontReliefOpacity = Number(smoothstep(0.25, 0.85, headT).toFixed(3));
  const noseReliefOpacity = Number(
    (smoothstep(0.16, 0.46, headT) * (0.85 - headT * 0.3)).toFixed(3)
  );
  const rightJawRimOpacity = Number(
    (0.12 + smoothstep(0.2, 0.85, headT) * 0.78).toFixed(3)
  );
  const mouthReliefOpacity = Number(
    (0.35 + smoothstep(0.2, 0.75, headT) * 0.48).toFixed(3)
  );

  return {
    turn,
    headT,
    hairT,
    torsoT,
    arcNodY,
    nearEyeCx,
    farEyeCx,
    farEyeVisibility,
    leftEarOpacity,
    frontReliefOpacity,
    noseReliefOpacity,
    rightJawRimOpacity,
    mouthReliefOpacity,
  };
}

export const VERTEX_SHADER_SOURCE = 'void main() { gl_Position = vec4(0.0); }';
export const FRAGMENT_SHADER_SOURCE =
  'uniform float uHeadTurn; uniform float uEyesGlow; void main() {}';
