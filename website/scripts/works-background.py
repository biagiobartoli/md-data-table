#!/usr/bin/env python3
"""Prepare the section-five background: the barber's bench.

Two jobs.

1. Cut the corner marks. The supplied file carries four white L-shaped crop
   brackets, one in each corner, reaching about 60px in from every edge — an
   export artefact, and the brief asks for no watermark. A 66px inset removes
   all four with margin and costs 4% of the frame. The script asserts they are
   gone before it writes, so a re-export with different margins fails loudly
   instead of shipping a bracket.

2. Grade it down, warm. The brief is explicit that this must not go black and
   white, so saturation only comes off a little; the darkening is a gamma
   (which deepens midtones and leaves black at black) rather than a lift, so
   the section's CSS scrim can stay light on top of it. No cool tint — this is
   the one warm thing on the site and it is supposed to be.
"""
import pathlib
import numpy as np
from PIL import Image

SRC = pathlib.Path('/tmp/claude-0/-home-user-md-data-table/'
                   '93aac1b9-9b7c-5cde-9e93-eccdbbbd9f1b/scratchpad/bg5/'
                   'postazione_da_barbiere_dal_fascino_rétro.png')
OUT = pathlib.Path('public/ni/works/bench.webp')

INSET = 66
SATURATION, GAMMA, GAIN = 0.88, 1.22, 0.90
LONG_EDGE = 1800

im = Image.open(SRC).convert('RGB')
W, H = im.size
im = im.crop((INSET, INSET, W - INSET, H - INSET))

a = np.asarray(im).astype(np.float32) / 255
lum = a[:, :, 0]*0.2126 + a[:, :, 1]*0.7152 + a[:, :, 2]*0.0722

# No bracket may survive: they are near-white, and nothing else in the frame is.
for name, ys, xs in [('TL', slice(0, 80), slice(0, 80)),
                     ('TR', slice(0, 80), slice(-80, None)),
                     ('BL', slice(-80, None), slice(0, 80)),
                     ('BR', slice(-80, None), slice(-80, None))]:
    n = int((lum[ys, xs] > 0.85).sum())
    assert n == 0, f'{name} corner still has {n} near-white pixels — widen INSET'

muted = lum[..., None] + (a - lum[..., None]) * SATURATION
curve = np.clip((lum ** GAMMA) * GAIN, 0, 1)
out = np.clip(muted * (curve / np.maximum(lum, 1e-4))[..., None], 0, 1)

g = Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGB')
if max(g.size) > LONG_EDGE:
    s = LONG_EDGE / max(g.size)
    g = g.resize((round(g.width * s), round(g.height * s)), Image.LANCZOS)
OUT.parent.mkdir(parents=True, exist_ok=True)
g.save(OUT, 'WEBP', quality=88, method=6)

q = np.asarray(g).astype(np.float32) / 255
ql = q[:, :, 0]*0.2126 + q[:, :, 1]*0.7152 + q[:, :, 2]*0.0722
print(f'{OUT}  {g.size[0]}x{g.size[1]} ratio {g.size[0]/g.size[1]:.3f}'
      f'  corner brackets removed ({INSET}px inset, all four corners assert clean)')
print(f'  luminance mean {ql.mean():.3f} (was {lum.mean():.3f})'
      f'  chroma mean {(q.max(2)-q.min(2)).mean():.3f}'
      f'  mean rgb {[round(float(q[:,:,i].mean()),3) for i in range(3)]}'
      f'  {OUT.stat().st_size/1024:.0f} KB')
