#!/usr/bin/env python3
"""Generate the film-grain tile as a two-tone RGBA PNG.

Why not an SVG feTurbulence with mix-blend-mode:overlay, which is the usual
recipe and is what this page had first: the blend mode is free until something
underneath it repaints every frame, and section four's slideshow does exactly
that. Measured over that section, a fixed full-viewport overlay layer cost
37.3ms per frame against 16.8ms with the blend removed — a whole section
running at half frame rate for a texture nobody is meant to consciously see.

So the grain is baked instead. Overlay's useful behaviour here is that it
brightens some pixels and darkens others rather than veiling everything one
way; that is reproduced by putting BOTH light and dark grains in one tile and
carrying them in the alpha channel, which composites normally and costs
nothing. The tile is tuned so the two populations are balanced, which is what
keeps it from reading as a grey film over the page.

The output is inlined as a data URI, so it is deliberately small and heavily
quantised — a 128px tile at this density is indistinguishable from a 512px one
once it is at 5% opacity, and repeats invisibly because the noise has no
structure to line up.
"""
import base64, io, pathlib
import numpy as np
from PIL import Image

SIZE = 128
DENSITY = 0.34      # share of pixels carrying any grain at all
SPLIT = 0.5         # of those, the share that are light rather than dark
rng = np.random.default_rng(7)

n = rng.random((SIZE, SIZE))
carry = n < DENSITY
light = carry & (rng.random((SIZE, SIZE)) < SPLIT)

rgba = np.zeros((SIZE, SIZE, 4), np.uint8)
rgba[..., :3] = np.where(light[..., None], 255, 0)
# Alpha is itself noisy, so grains vary in strength instead of all being the
# same dot — a uniform alpha reads as dither, not as film.
strength = (rng.random((SIZE, SIZE)) ** 1.6 * 255).astype(np.uint8)
rgba[..., 3] = np.where(carry, strength, 0)

im = Image.fromarray(rgba, 'RGBA')
buf = io.BytesIO()
im.save(buf, 'PNG', optimize=True)
raw = buf.getvalue()
uri = 'data:image/png;base64,' + base64.b64encode(raw).decode()

out = pathlib.Path('scripts/grain-tile.txt')
out.write_text(uri)
print(f'{SIZE}x{SIZE}  carry {carry.mean()*100:.0f}%  light/dark '
      f'{light.sum()}/{(carry & ~light).sum()}  png {len(raw)/1024:.1f} KB  '
      f'data URI {len(uri)/1024:.1f} KB')
print(f'wrote {out}')
