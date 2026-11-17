'use client';

import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  compute3DBustPose,
  computeRightEyeAnchorUV,
  HERO_CAMERA_CONFIG,
  HeroBustRigController,
} from '@/lib/hero-3d-geometry';
import { damp } from '@/lib/scroll-math';

export interface HeroBustRigRefState {
  turn: number;
  eyesGlow: number;
  pointerX: number;
  pointerY: number;
  invalidate?: () => void;
  setAnchorUV?: (u: number, v: number) => void;
}

interface HeroBustCanvasProps {
  rigRef: React.MutableRefObject<HeroBustRigRefState>;
  reducedMotion: boolean;
  onReady: () => void;
  onContextLost: () => void;
}

interface BustSceneProps {
  rigRef: React.MutableRefObject<HeroBustRigRefState>;
  reducedMotion: boolean;
  onReady: () => void;
}

function BustScene({ rigRef, reducedMotion, onReady }: BustSceneProps) {
  const mountRef = useRef<THREE.Group>(null);
  const controllerRef = useRef<HeroBustRigController | null>(null);
  const pointerStateRef = useRef({ x: 0, y: 0, lastTurn: -1, lastGlow: -1 });
  const { size, invalidate } = useThree();

  useEffect(() => {
    const rig = rigRef.current;
    rig.invalidate = invalidate;
    return () => {
      if (rig.invalidate === invalidate) {
        rig.invalidate = undefined;
      }
    };
  }, [invalidate, rigRef]);

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const { u, v } = computeRightEyeAnchorUV(aspect, 1);
    rigRef.current.setAnchorUV?.(u, v);
    invalidate();
  }, [invalidate, rigRef, size.height, size.width]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const controller = new HeroBustRigController();
    controllerRef.current = controller;
    mount.add(controller.root);

    const rig = rigRef.current;
    controller.applyPose(
      reducedMotion ? 0 : rig.turn,
      reducedMotion ? 0 : rig.eyesGlow,
      0,
      0
    );

    invalidate();
    onReady();

    return () => {
      mount.remove(controller.root);
      controllerRef.current = null;
      controller.dispose();
    };
  }, [invalidate, onReady, reducedMotion, rigRef]);

  useFrame((_, delta) => {
    const controller = controllerRef.current;
    if (!controller) return;

    const rig = rigRef.current;
    const targetTurn = reducedMotion ? 0 : rig.turn;
    const pose = compute3DBustPose(targetTurn);
    const targetGlow = reducedMotion ? 0 : Math.max(rig.eyesGlow, pose.eyesGlow);

    const targetPtrX = reducedMotion ? 0 : rig.pointerX * pose.pointerWeight;
    const targetPtrY = reducedMotion ? 0 : rig.pointerY * pose.pointerWeight;

    const ptr = pointerStateRef.current;
    const ptrDelta =
      Math.abs(targetPtrX - ptr.x) + Math.abs(targetPtrY - ptr.y);

    if (ptrDelta > 0.001) {
      ptr.x = damp(ptr.x, targetPtrX, 7.5, delta);
      ptr.y = damp(ptr.y, targetPtrY, 7.5, delta);
      invalidate();
    } else {
      ptr.x = targetPtrX;
      ptr.y = targetPtrY;
    }

    controller.applyPose(targetTurn, targetGlow, ptr.x, ptr.y);

    if (
      Math.abs(targetTurn - ptr.lastTurn) > 0.0005 ||
      Math.abs(targetGlow - ptr.lastGlow) > 0.0005
    ) {
      ptr.lastTurn = targetTurn;
      ptr.lastGlow = targetGlow;
      const aspect = size.width / Math.max(1, size.height);
      const { u, v } = computeRightEyeAnchorUV(aspect, 1);
      rig.setAnchorUV?.(u, v);
    }
  });

  return <group ref={mountRef} />;
}

export function HeroBustCanvas({
  rigRef,
  reducedMotion,
  onReady,
  onContextLost,
}: HeroBustCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{
        fov: HERO_CAMERA_CONFIG.fov,
        position: [...HERO_CAMERA_CONFIG.position],
        near: 0.1,
        far: 100,
      }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      }}
      style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(...HERO_CAMERA_CONFIG.target);
        const handleLost = (e: Event) => {
          e.preventDefault();
          onContextLost();
        };
        gl.domElement.addEventListener('webglcontextlost', handleLost, {
          once: true,
        });
      }}
    >
      <BustScene
        rigRef={rigRef}
        reducedMotion={reducedMotion}
        onReady={onReady}
      />
    </Canvas>
  );
}
