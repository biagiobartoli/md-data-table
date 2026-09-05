"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  displaceGeometry,
  fbm3,
  makeBumpTexture,
  makeSurfaceTexture,
} from "@/lib/procedural";


/** Dev guard: NaN vertices silently break bounding spheres and frustum culling. */
function checkFinite(geo: THREE.BufferGeometry, name: string) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as ArrayLike<number>;
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i])) {
      console.warn(`[burger] NaN in ${name} at index ${i}`);
      return geo;
    }
  }
  return geo;
}

/* ---------------------------------------------------------------- *
 * Geometry builders. Everything is generated — no .glb, no CDN.
 * ---------------------------------------------------------------- */

/** Dome for a bun half: hemisphere, squashed, noise-displaced, capped flat. */
function makeBunDome(radius: number, height: number, seed: number) {
  const geo = new THREE.SphereGeometry(radius, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // squash vertically, and let the shoulders bulge slightly outward
    const t = v.y / radius;
    const bulge = 1 + 0.06 * Math.sin(t * Math.PI);
    v.x *= bulge;
    v.z *= bulge;
    v.y *= height / radius;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  displaceGeometry(geo, radius * 0.028, 2.6 + seed, 4);
  return geo;
}

/** Patty: cylinder with an irregular, slightly bulging rim. */
function makePatty(radius: number, height: number) {
  const geo = new THREE.CylinderGeometry(radius, radius * 0.97, height, 128, 12, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r > 1e-4) {
      const ang = Math.atan2(v.z, v.x);
      // irregular edge + vertical bulge in the middle of the patty
      const wob =
        1 +
        0.035 * Math.sin(ang * 7 + 1.3) +
        0.022 * Math.sin(ang * 13 + 0.4) +
        0.05 * (1 - Math.abs(v.y / (height / 2)) ** 2);
      v.x *= wob;
      v.z *= wob;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  displaceGeometry(geo, radius * 0.016, 7, 4);
  return geo;
}

/** Cheese: a square slab that droops over the patty edge. */
function makeCheese(halfWidth: number) {
  const seg = 64;
  const geo = new THREE.PlaneGeometry(halfWidth * 2, halfWidth * 2, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z) / halfWidth;
    // flat over the patty, then melts down past the rim
    const dt = Math.min(1, Math.max(0, (r - 0.58) / 0.42));
    const droop = r < 0.58 ? 0 : -Math.pow(dt, 1.6) * halfWidth * 0.46;
    const ripple = 0.008 * halfWidth * Math.sin(Math.atan2(v.z, v.x) * 11);
    pos.setXYZ(i, v.x, v.y + droop + ripple * (r > 0.7 ? 1 : 0), v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Lettuce: a frilled annulus. The frill is mostly radial — a real leaf
 *  waves in plan view, not just up and down. Pure vertical displacement
 *  reads as a sawtooth, which is what this looked like first time round. */
function makeLettuce(inner: number, outer: number) {
  const radial = 260;
  const rings = 16;
  const geo = new THREE.RingGeometry(inner, outer, radial, rings);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    const t = Math.min(1, Math.max(0, (r - inner) / (outer - inner)));
    const ang = Math.atan2(v.z, v.x);

    // radial frill, strongest at the leaf edge
    const frill =
      Math.sin(ang * 13) * 0.055 +
      Math.sin(ang * 21 + 0.8) * 0.03 +
      Math.sin(ang * 34 + 2.1) * 0.014;
    const rr = r + frill * Math.pow(t, 1.5) * (outer - inner) * 2.6;

    // gentle vertical curl, plus noise so no two points sit at the same height
    const curl =
      Math.sin(ang * 9 + 0.5) * Math.pow(t, 2.2) * (outer - inner) * 0.22;
    const lift = (fbm3(v.x * 6, 1.3, v.z * 6, 3) - 0.5) * 0.045;

    pos.setXYZ(i, Math.cos(ang) * rr, v.y + curl + lift, Math.sin(ang) * rr);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function makeTomato(radius: number, thickness: number) {
  const geo = new THREE.CylinderGeometry(radius, radius, thickness, 72, 1);
  displaceGeometry(geo, radius * 0.01, 9, 3);
  return geo;
}

/* ---------------------------------------------------------------- *
 * The model
 * ---------------------------------------------------------------- */

export type BurgerModelProps = {
  /** 0 = assembled, 1 = fully exploded */
  explode?: number;
  /**
   * Live explode value read inside useFrame. Driving this from a ref instead
   * of a prop keeps scroll updates off the React render path — a prop would
   * re-render the whole Canvas subtree on every scroll frame.
   */
  explodeRef?: React.MutableRefObject<number>;
  /** extra Y rotation in radians */
  spin?: number;
};

export function BurgerModel({ explode = 0, explodeRef, spin = 0 }: BurgerModelProps) {
  const group = useRef<THREE.Group>(null);
  const layers = useRef<(THREE.Group | null)[]>([]);

  /* ---- geometry (built once) ---- */
  const geo = useMemo(
    () => ({
      topBun: checkFinite(makeBunDome(1.0, 0.62, 0.0), "topBun"),
      bottomBun: checkFinite(makeBunDome(0.98, 0.34, 3.1), "bottomBun"),
      patty: checkFinite(makePatty(0.94, 0.26), "patty"),
      cheese: checkFinite(makeCheese(0.92), "cheese"),
      lettuce: checkFinite(makeLettuce(0.5, 1.0), "lettuce"),
      tomato: checkFinite(makeTomato(0.82, 0.075), "tomato"),
    }),
    [],
  );

  /* ---- textures (built once, in the browser) ---- */
  const tex = useMemo(() => {
    const bunMap = makeSurfaceTexture({
      base: "#C08A50",
      dark: "#96612F",
      light: "#DFB683",
      scale: 6,
      speckle: 0,
    });
    return {
      bunMap,
      bunBump: makeBumpTexture({ scale: 26, contrast: 1.5 }),
      pattyMap: makeSurfaceTexture({
        base: "#8A5629",
        dark: "#552C13",
        light: "#B87C40",
        scale: 9,
        speckle: 260,
        speckleColor: "#2A1408",
      }),
      pattyBump: makeBumpTexture({ scale: 34, contrast: 2.2 }),
      cheeseMap: makeSurfaceTexture({
        base: "#F3A81C",
        dark: "#DE8C08",
        light: "#FFC855",
        scale: 4,
      }),
      lettuceMap: makeSurfaceTexture({
        base: "#79AC55",
        dark: "#547F36",
        light: "#A7CE7F",
        scale: 7,
      }),
      tomatoMap: makeSurfaceTexture({
        base: "#C8503C",
        dark: "#9B3122",
        light: "#E4806B",
        scale: 8,
      }),
    };
  }, []);

  /* ---- sesame seeds, scattered on the dome ---- */
  const seeds = useMemo(() => {
    const out: { pos: THREE.Vector3; quat: THREE.Quaternion; scale: number }[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 64; i++) {
      // fibonacci-ish scatter over the upper dome
      const t = (i + 0.5) / 64;
      const phi = Math.acos(1 - t * 0.82);
      const theta = i * 2.399963;
      const n = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      );
      const p = n.clone().multiply(new THREE.Vector3(1.0, 0.62, 1.0)).multiplyScalar(0.995);
      const normal = n.clone().multiply(new THREE.Vector3(1, 1 / 0.62, 1)).normalize();
      out.push({
        pos: p,
        quat: new THREE.Quaternion().setFromUnitVectors(up, normal),
        scale: 0.85 + ((i * 37) % 10) / 40,
      });
    }
    return out;
  }, []);

  /* ---- assembled Y positions, and where each layer flies to ---- */
  const stack = useMemo(
    () => [
      { y: 0.24, spread: 1.55 }, // top bun
      { y: 0.17, spread: 1.02 }, // tomato
      { y: 0.07, spread: 0.66 }, // lettuce
      { y: 0.01, spread: 0.34 }, // cheese
      { y: -0.14, spread: 0.06 }, // patty
      { y: -0.26, spread: -0.26 }, // bottom bun
    ],
    [],
  );

  const eased = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const target = explodeRef ? explodeRef.current : explode;
    // critically-damped-ish follow so scrolling never looks jittery
    eased.current += (target - eased.current) * Math.min(1, delta * 6);
    const e = eased.current;

    if (group.current) {
      group.current.rotation.y = spin;
      group.current.position.y = Math.sin(t * 0.6) * 0.035;
    }
    layers.current.forEach((g, i) => {
      if (!g) return;
      const s = stack[i];
      g.position.y = s.y + s.spread * e;
      // layers fan slightly as they separate — reads as deliberate, not chaotic
      g.rotation.y = e * (i % 2 === 0 ? 0.22 : -0.28);
    });
  });

  const setLayer = (i: number) => (el: THREE.Group | null) => {
    layers.current[i] = el;
  };

  return (
    <group ref={group} dispose={null}>
      {/* top bun */}
      <group ref={setLayer(0)}>
        <mesh geometry={geo.topBun} castShadow receiveShadow>
          <meshStandardMaterial
            map={tex.bunMap}
            bumpMap={tex.bunBump}
            bumpScale={0.012}
            roughness={0.82}
            metalness={0}
          />
        </mesh>
        {seeds.map((s, i) => (
          <mesh
            key={i}
            position={s.pos}
            quaternion={s.quat}
            scale={[0.05 * s.scale, 0.022 * s.scale, 0.075 * s.scale]}
            castShadow
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial color="#F6E3BC" roughness={0.55} />
          </mesh>
        ))}
      </group>

      {/* tomato */}
      <group ref={setLayer(1)}>
        <mesh geometry={geo.tomato} castShadow receiveShadow>
          <meshStandardMaterial
            map={tex.tomatoMap}
            roughness={0.32}
            metalness={0}
          />
        </mesh>
      </group>

      {/* lettuce */}
      <group ref={setLayer(2)}>
        <mesh geometry={geo.lettuce} castShadow receiveShadow>
          <meshStandardMaterial
            map={tex.lettuceMap}
            roughness={0.45}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* cheese */}
      <group ref={setLayer(3)}>
        <mesh geometry={geo.cheese} castShadow receiveShadow>
          <meshStandardMaterial
            map={tex.cheeseMap}
            roughness={0.28}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* patty */}
      <group ref={setLayer(4)}>
        <mesh geometry={geo.patty} castShadow receiveShadow>
          <meshStandardMaterial
            map={tex.pattyMap}
            bumpMap={tex.pattyBump}
            bumpScale={0.02}
            roughness={0.62}
            metalness={0}
          />
        </mesh>
      </group>

      {/* bottom bun */}
      <group ref={setLayer(5)}>
        <mesh geometry={geo.bottomBun} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            map={tex.bunMap}
            bumpMap={tex.bunBump}
            bumpScale={0.012}
            roughness={0.85}
            metalness={0}
          />
        </mesh>
      </group>
    </group>
  );
}
