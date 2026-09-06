#!/usr/bin/env python3
"""Prepare the section-two background: true greyscale, reduced contrast, baked.

Baked rather than done with a CSS filter so the result is guaranteed
monochrome regardless of filter support, and so levels can be controlled
precisely instead of by eye.
"""
import argparse, pathlib
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('source'); ap.add_argument('--out', default='public/ni')
ap.add_argument('--contrast', type=float, default=0.72, help='<1 flattens')
ap.add_argument('--lift', type=float, default=0.06, help='raise blacks')
ap.add_argument('--gain', type=float, default=0.86)
a = ap.parse_args()

im = Image.open(a.source).convert('RGB')
x = np.asarray(im).astype(np.float32) / 255.0
lum = x[:, :, 0]*0.2126 + x[:, :, 1]*0.7152 + x[:, :, 2]*0.0722
out = 0.5 + (lum - 0.5) * a.contrast          # flatten around mid
out = out * a.gain + a.lift                    # gentle, keeps it off pure black
out = np.clip(out, 0, 1)
g = Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'L').convert('RGB')

d = pathlib.Path(a.out); d.mkdir(parents=True, exist_ok=True)
g.save(d / 'section-2-bg.webp', 'WEBP', quality=88, method=6)
sat = np.asarray(g).astype(int)
print(f'size {g.size}  saturation max {int((sat.max(2)-sat.min(2)).max())} (0 = true greyscale)')
print(f'luminance mean {out.mean():.3f}  p5 {np.percentile(out,5):.3f}  p95 {np.percentile(out,95):.3f}')
print(f"wrote {d/'section-2-bg.webp'} ({(d/'section-2-bg.webp').stat().st_size/1024:.1f} KB)")
