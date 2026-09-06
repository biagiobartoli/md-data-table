#!/usr/bin/env python3
"""Prepare a section-two photographic background: muted, flattened, baked.

Baked rather than done with a CSS filter so the treatment is guaranteed
identical regardless of filter support, and so levels can be controlled
precisely instead of by eye.

The tonal move is applied as a *ratio on luminance* rather than to each
channel independently. That re-maps brightness without dragging hue around,
which is what lets --saturation mean what it says: at 0.0 the result is true
greyscale, at 1.0 the original colour survives the flattening intact, and in
between the photograph stays recognisably itself while losing its intensity.
Partial desaturation is the point for the hair image — fully monochrome
drains the tones the shot exists to show.
"""
import argparse, pathlib
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('source'); ap.add_argument('--out', default='public/ni')
ap.add_argument('--name', default='section-2-bg', help='output stem, no extension')
ap.add_argument('--contrast', type=float, default=0.72, help='<1 flattens')
ap.add_argument('--lift', type=float, default=0.06, help='raise blacks')
ap.add_argument('--gain', type=float, default=0.86)
ap.add_argument('--saturation', type=float, default=0.0,
                help='0 = greyscale, 1 = keep the original chroma')
ap.add_argument('--tint', default='6F9FA3')
ap.add_argument('--tint-strength', type=float, default=0.62)
ap.add_argument('--max-width', type=int, default=0, help='0 = leave as-is')
a = ap.parse_args()


def tint_vector(hexcol, strength):
    """A hue-normalised multiplier for the accent.

    Normalising to mean 1.0 keeps the image's luminance structure intact and
    adds only hue, so the result reads as a photograph with an undertone
    rather than as a coloured image.
    """
    h = hexcol.lstrip('#')
    c = np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], np.float32) / 255.0
    c = c / max(c.mean(), 1e-6)
    return 1.0 + (c - 1.0) * strength


im = Image.open(a.source).convert('RGB')
if a.max_width and im.width > a.max_width:
    im = im.resize((a.max_width, round(im.height * a.max_width / im.width)),
                   Image.LANCZOS)
x = np.asarray(im).astype(np.float32) / 255.0

lum = x[:, :, 0]*0.2126 + x[:, :, 1]*0.7152 + x[:, :, 2]*0.0722
# Pull chroma toward the luminance axis, keeping whatever fraction was asked for.
muted = lum[..., None] + (x - lum[..., None]) * a.saturation

curve = 0.5 + (lum - 0.5) * a.contrast     # flatten around mid
curve = curve * a.gain + a.lift             # gentle, keeps it off pure black
curve = np.clip(curve, 0, 1)
# Re-map brightness by ratio so the retained chroma rides along unchanged.
out = muted * (curve / np.maximum(lum, 1e-4))[..., None]
out = np.clip(out * tint_vector(a.tint, a.tint_strength)[None, None, :], 0, 1)

g = Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGB')
d = pathlib.Path(a.out); d.mkdir(parents=True, exist_ok=True)
dst = d / f'{a.name}.webp'
g.save(dst, 'WEBP', quality=88, method=6)

q = np.asarray(g).astype(np.float32) / 255
ch = q.max(2) - q.min(2)
print(f'size {g.size}  saturation {a.saturation}  tint #{a.tint} @ {a.tint_strength}')
print(f'chroma mean {ch.mean():.4f}  p95 {np.percentile(ch,95):.4f}  max {ch.max():.3f}'
      f'   (source mean {(x.max(2)-x.min(2)).mean():.4f})')
print(f'luminance mean {curve.mean():.3f}  p5 {np.percentile(curve,5):.3f}  p95 {np.percentile(curve,95):.3f}')
print(f'wrote {dst} ({dst.stat().st_size/1024:.1f} KB)')
