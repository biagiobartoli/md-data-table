# KELVIN K-600 — product render specification

Layered product assets for the scroll-driven exploded-view sequence in
`website/prototype.html`. Deliver into this folder.

## Files required

| File | Contents |
|---|---|
| `bottle-body.webp` | Vessel only — shoulder, barrel, base, **including the threaded neck and mouth** normally hidden under the ring and cap |
| `bottle-cap.webp` | Cap only, complete |
| `bottle-ring.webp` | Neck ring / collar only, complete |
| `bottle-shadow.webp` | Contact shadow alone — soft black on transparent, no product |

## The one rule that matters most

**Render every layer from a single scene, with one camera that never moves.**

Export each component on an **identical canvas**, with the component sitting in
its **assembled position**. Stacking all four files at the same coordinates must
reproduce the assembled bottle exactly, pixel for pixel.

If the camera, focal length, or framing shifts between exports, the layers will
not align and the exploded view cannot be rebuilt in the browser.

Do **not** move the parts apart in the render. The animation does the moving.

## Occlusion — the detail that is usually missed

Each component must be **complete**, not clipped by whatever normally covers it.

When the cap lifts, the bottle's threaded neck is exposed. If the body is
rendered with the cap on, that geometry does not exist in the file and a hole
appears mid-animation. Render each part in isolation (hide the others), keeping
the camera fixed.

Same for the area beneath the ring.

## Technical

- **Canvas:** identical for all four layers. Recommended **1000 × 2800 px**,
  assembled product ≈ 2400 px tall, horizontally centred.
  (Displayed at ~68vh; this covers 2× DPR on a 1440p display plus the 1.12×
  dolly-in without softening.)
- **Alpha:** true transparency. No matte, no keying from a black background —
  keyed edges leave dark fringing that is very visible on this dark ground.
- **Lens:** long — 85–135 mm equivalent, or orthographic. Minimal perspective
  keeps the stacked layers believable. Camera at product mid-height, straight-on
  elevation.
- **Colour:** sRGB.
- **Format:** WebP with alpha (quality ~90). Please also keep 16-bit PNG masters
  so we can re-export without generation loss.
- **No baked shadows or reflections on the parts** — the contact shadow is its
  own layer so it can scale and fade independently.

## Lighting / art direction

The scene is near-black (`#07070A`) with a warm gold key. Light the product
**for a dark background**: bright specular rim highlights defining the silhouette
edges, controlled falloff, deep but not crushed shadow side. A product lit for a
white studio background will look pasted-on here.

Material: brushed 18/8 stainless with a fine vertical grain, plus one gold
anodised band (`#C89B4A`). Subtle engraved `KELVIN / K-600 VACUUM` wordmark on
the barrel.

## Optional — real rotation

CSS `rotationY` on a flat image reads as a rotating card, not a rotating object.
The current prototype keeps rotation to ~11° so it holds up.

For genuine scroll-driven rotation, the industry approach is an **image
sequence**: 36–72 frames of a turntable, same camera, `frames/000.webp …`.
That is a separate deliverable from the layered set above and cannot be exploded —
we would use it for a rotation beat and the layered set for the exploded view.

Not required for the first integration. Say if you want it and I will spec framing.
