"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Where a real model goes.
 *
 * Drop a burger .glb at `public/models/burger.glb`, then set
 *   NEXT_PUBLIC_BURGER_GLB=/models/burger.glb
 * in `.env.local`, and it is used instead of the procedural model — no code
 * changes needed. Nothing else has to move:
 * the lighting, shadows, drag-to-rotate and scroll-driven explode all live in
 * burger-stage.tsx and are model-agnostic.
 *
 * With the variable unset (the default) the loader is never mounted, so the
 * page makes no request for a model that isn't there and the procedural
 * burger renders instead.
 */
export const BURGER_GLB = process.env.NEXT_PUBLIC_BURGER_GLB ?? "";

/** Named layers, top to bottom, matched case-insensitively against mesh names. */
const LAYER_HINTS = [
  ["bun_top", "topbun", "crown"],
  ["tomato"],
  ["lettuce", "salad"],
  ["onion"],
  ["cheese"],
  ["patty", "meat", "beef"],
  ["pickle"],
  ["bun_bottom", "bottombun", "heel"],
];

export function BurgerGLTF({
  explodeRef,
  spin = 0,
  spread,
}: {
  explodeRef?: React.MutableRefObject<number>;
  spin?: number;
  spread: { y: number; spread: number }[];
}) {
  const { scene } = useGLTF(BURGER_GLB);
  const root = useRef<THREE.Group>(null);
  const parts = useRef<{ obj: THREE.Object3D; baseY: number; idx: number }[]>([]);
  const eased = useRef(0);

  useEffect(() => {
    const found: { obj: THREE.Object3D; baseY: number; idx: number }[] = [];
    scene.traverse((o) => {
      if (!(o as THREE.Mesh).isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const name = o.name.toLowerCase();
      const idx = LAYER_HINTS.findIndex((hints) =>
        hints.some((h) => name.includes(h)),
      );
      if (idx >= 0) found.push({ obj: o, baseY: o.position.y, idx });
    });
    parts.current = found;
  }, [scene]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const target = explodeRef ? explodeRef.current : 0;
    eased.current += (target - eased.current) * Math.min(1, delta * 6);
    const e = eased.current;

    if (root.current) {
      root.current.rotation.y = spin;
      root.current.position.y = Math.sin(t * 0.6) * 0.035;
    }
    // Only meshes we could identify get pulled apart; anything unmatched
    // stays put rather than flying off in a direction we guessed.
    parts.current.forEach(({ obj, baseY, idx }) => {
      obj.position.y = baseY + (spread[idx]?.spread ?? 0) * e;
    });
  });

  return (
    <group ref={root} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}
