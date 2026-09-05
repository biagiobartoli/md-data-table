import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * Deterministic value noise. No dependencies, no remote assets — the
 * whole point is that every texture and every bump is generated in the
 * browser, so the scene never waits on a CDN.
 * ------------------------------------------------------------------ */

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

export function valueNoise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const zf = smooth(z - zi);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const c000 = hash3(xi, yi, zi);
  const c100 = hash3(xi + 1, yi, zi);
  const c010 = hash3(xi, yi + 1, zi);
  const c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1);
  const c101 = hash3(xi + 1, yi, zi + 1);
  const c011 = hash3(xi, yi + 1, zi + 1);
  const c111 = hash3(xi + 1, yi + 1, zi + 1);

  return lerp(
    lerp(lerp(c000, c100, xf), lerp(c010, c110, xf), yf),
    lerp(lerp(c001, c101, xf), lerp(c011, c111, xf), yf),
    zf,
  );
}

export function fbm3(x: number, y: number, z: number, octaves = 4) {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise3(x * freq, y * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.07;
  }
  return sum / norm;
}

/**
 * Push every vertex along its own normal by fbm noise. This is what turns a
 * mathematically perfect sphere into something that reads as baked dough.
 */
export function displaceGeometry(
  geo: THREE.BufferGeometry,
  amplitude: number,
  frequency: number,
  octaves = 4,
) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    const d =
      (fbm3(v.x * frequency, v.y * frequency, v.z * frequency, octaves) - 0.5) *
      2 *
      amplitude;
    pos.setXYZ(i, v.x + n.x * d, v.y + n.y * d, v.z + n.z * d);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Mottled surface texture — warm base with darker patches and fine speckle. */
export function makeSurfaceTexture({
  size = 512,
  base,
  dark,
  light,
  scale = 5,
  speckle = 0,
  speckleColor = "#ffffff",
}: {
  size?: number;
  base: string;
  dark: string;
  light: string;
  scale?: number;
  speckle?: number;
  speckleColor?: string;
}) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  const cBase = new THREE.Color(base);
  const cDark = new THREE.Color(dark);
  const cLight = new THREE.Color(light);
  const tmp = new THREE.Color();

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm3((x / size) * scale, (y / size) * scale, 0.5, 5);
      tmp.copy(cBase);
      if (n < 0.5) tmp.lerp(cDark, (0.5 - n) * 1.6);
      else tmp.lerp(cLight, (n - 0.5) * 1.6);
      const i = (y * size + x) * 4;
      d[i] = tmp.r * 255;
      d[i + 1] = tmp.g * 255;
      d[i + 2] = tmp.b * 255;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  if (speckle > 0) {
    ctx.fillStyle = speckleColor;
    for (let i = 0; i < speckle; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 1.6 + 0.4;
      ctx.globalAlpha = Math.random() * 0.5 + 0.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Greyscale bump companion to makeSurfaceTexture. */
export function makeBumpTexture({
  size = 512,
  scale = 8,
  contrast = 1,
}: {
  size?: number;
  scale?: number;
  contrast?: number;
}) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = fbm3((x / size) * scale, (y / size) * scale, 2.3, 5);
      const v = Math.min(255, Math.max(0, ((n - 0.5) * contrast + 0.5) * 255));
      const i = (y * size + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Derive a tangent-space normal map from an fbm height field.
 * Normal maps carry far more surface detail than bumpScale alone — this is
 * what makes the bun read as crumb rather than as a smooth shaded dome.
 */
export function makeNormalTexture({
  size = 512,
  scale = 20,
  strength = 2.4,
}: {
  size?: number;
  scale?: number;
  strength?: number;
}) {
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      height[y * size + x] = fbm3((x / size) * scale, (y / size) * scale, 4.7, 5);
    }
  }

  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const at = (x: number, y: number) =>
    height[((y + size) % size) * size + ((x + size) % size)];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // central differences → gradient → normal
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * size + x) * 4;
      d[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      d[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      d[i + 2] = (1 / len) * 0.5 * 255 + 127.5;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
