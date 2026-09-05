# Ember & Ash — flame-grilled burger landing page

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui structure.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Project structure

This follows the shadcn convention, with `src/` enabled:

```
src/
├── app/
│   ├── globals.css      design tokens (dark "Ember & Ash" palette)
│   ├── layout.tsx       fonts: Playfair Display SC + Karla
│   └── page.tsx         section composition
├── components/
│   ├── ui/              shadcn-convention primitives (see below)
│   └── sections/        page sections
└── lib/
    ├── utils.ts         cn() helper
    └── images.ts        how to swap in real photography
```

`components.json` points the `ui` alias at `@/components/ui`. Keeping that exact
path matters: `npx shadcn@latest add <component>` writes there by default, and
every shadcn component imports its siblings via that alias. Rename the folder
and each future `add` either fails or silently creates a second copy.

## Components in `components/ui`

| File | Origin | Notes |
|------|--------|-------|
| `card.tsx` | shadcn/ui | unmodified |
| `container-scroll-animation.tsx` | Aceternity | `Header` props typed (was `any`, which fails `next lint`) |
| `spotlight.tsx` | ibelick | listener cleanup fixed — see below |
| `splite.tsx` | Spline wrapper | wrapped in an error boundary — see below |
| `spline-boundary.tsx` | added | catches Spline fetch failures |
| `burger-art.tsx` | added | vector food art, no image CDN needed |

### Three deliberate deviations from the supplied snippets

1. **`splite.tsx` — added an error boundary.** `<Suspense>` handles the *loading*
   state of a lazy component but not a *failed fetch*. Without a boundary, a
   visitor who is offline, running an ad-blocker, or hitting a Spline outage got
   a blank page and `Application error: a client-side exception has occurred`.
   Verified: this page white-screened before the fix and degrades gracefully now.

2. **`spotlight.tsx` — fixed the listener cleanup.** The original passed fresh
   arrow functions to `removeEventListener`, so the `mouseenter`/`mouseleave`
   listeners were never removed and accumulated on every remount.

3. **`container-scroll-animation.tsx` — typed `Header`'s props.** `: any` fails
   the default `next lint` rule `@typescript-eslint/no-explicit-any`, which
   breaks `next build`.

Also removed: `<Spotlight fill="white" />` from the supplied demo. `Spotlight`
accepts `className`, `size`, and `springOptions` only — `fill` is a type error.

### Spline scene

`src/components/sections/hero.tsx` has a `SPLINE_SCENE` constant pointing at
Spline's public demo scene. **Replace it** with your own scene from
https://app.spline.design — the default is a robot, which is not a burger.
The vector burger renders underneath as the guaranteed-visible layer.

### `@splinetool/runtime` is pinned to 1.x

v2.x breaks `next build` with `Can't resolve '../libs/draco/draco_decoder.js'`.
Do not bump it to 2.x without re-verifying the build.

## The 3D burger

`src/components/three/` holds a real WebGL model (react-three-fiber), not an
illustration. Everything is generated at runtime — there is no `.glb`, no
texture download, no HDRI fetch:

- **Geometry** is procedural. Bun halves are hemispheres squashed and pushed
  along their normals by fbm noise so they read as baked dough; the patty is a
  cylinder with an irregular rim; lettuce is a ring frilled *radially* (frilling
  it vertically produced a sawtooth); cheese is a plane that droops past the
  patty edge.
- **Textures** are drawn into a `<canvas>` at runtime by `src/lib/procedural.ts`
  (mottled colour maps plus greyscale bump companions).
- **Lighting** is four `<Lightformer>` panels inside `<Environment>`. drei's
  `<Environment preset="...">` streams an `.hdr` from a remote CDN — behind a
  restrictive network that silently leaves the model unlit.

### Scroll-driven exploded view

`src/components/sections/stack-3d.tsx` pins for 320vh and maps scroll progress
to an explode value. That value is passed as a **ref**, not a prop:
`BurgerModel` reads it inside `useFrame` and eases toward it. A prop would
re-render the entire Canvas subtree on every scroll frame.

### Tuning it

Layer positions live in the `stack` array in `burger-model.tsx` — `y` is the
assembled rest height, `spread` is where the layer flies to when exploded.
Colours are the `makeSurfaceTexture` calls in the same file.

If you later buy or sculpt a real burger `.glb`, drop it in and swap
`<BurgerModel />` for a `useGLTF` load; the stage, lighting, and scroll
plumbing stay as they are.

## Images

No stock photography is wired up. The build environment could not reach an
image CDN to verify URLs, and unverified Unsplash IDs render as broken boxes.
`src/lib/images.ts` documents the three steps to swap the vector art for real
photos.
