"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { BurgerModel } from "./burger-model";

/**
 * Studio lighting is built from Lightformers rather than an HDRI preset:
 * drei's <Environment preset="..."> streams an .hdr from a remote CDN, which
 * fails behind a restrictive network and leaves the model lit by nothing.
 * Hand-placed lightformers give the same soft product-render falloff with
 * zero network dependency.
 */
function Studio() {
  return (
    <Environment resolution={256}>
      {/* broad soft key from above */}
      <Lightformer
        intensity={2.6}
        form="rect"
        position={[0, 5, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
      />
      {/* warm rim from behind right — the "ember" side */}
      <Lightformer
        intensity={3.2}
        form="rect"
        color="#FFB068"
        position={[4, 2, -3]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={[6, 5, 1]}
      />
      {/* cool fill from the left keeps the shadow side from going muddy */}
      <Lightformer
        intensity={1.1}
        form="rect"
        color="#CFE0FF"
        position={[-5, 1, 2]}
        rotation={[0, Math.PI / 2.4, 0]}
        scale={[6, 6, 1]}
      />
      {/* low bounce, like light coming back off the counter */}
      <Lightformer
        intensity={0.8}
        form="rect"
        color="#FFE9D2"
        position={[0, -3, 2]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[8, 8, 1]}
      />
    </Environment>
  );
}

export type BurgerStageProps = {
  explode?: number;
  explodeRef?: React.MutableRefObject<number>;
  spin?: number;
  className?: string;
  /** allow drag-to-rotate */
  interactive?: boolean;
};

export function BurgerStage({
  explode = 0,
  explodeRef,
  spin = 0,
  className,
  interactive = true,
}: BurgerStageProps) {
  const [drag, setDrag] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    dragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDrag((d) => d + (e.clientX - lastX.current) * 0.008);
    lastX.current = e.clientX;
  };
  const onUp = () => {
    dragging.current = false;
  };

  return (
    <div
      className={className}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      style={{ touchAction: "pan-y", cursor: interactive ? "grab" : "default" }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.55, 4.1], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>
          <Studio />

          {/* key light casts the actual contact shadow */}
          <directionalLight
            position={[3, 6, 3]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0005}
          />
          <ambientLight intensity={0.25} />

          <group position={[0, -0.15, 0]}>
            <BurgerModel explode={explode} explodeRef={explodeRef} spin={reduced ? 0 : spin + drag} />
            <ContactShadows
              position={[0, -0.66, 0]}
              opacity={0.55}
              scale={6}
              blur={2.4}
              far={2}
              resolution={512}
              color="#3B2415"
            />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
