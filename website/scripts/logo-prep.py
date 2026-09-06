#!/usr/bin/env python3
"""Isolate the Nicola Iovine logo and restyle it for the black hero.

The source is dark lettering on a pale ground. Rather than threshold-keying it
(which leaves hard, aliased edges and background crumbs), this derives alpha
from luminance: the darker a pixel, the more opaque it becomes. Antialiased
glyph edges survive as genuine partial alpha, so the mark sits on black with no
halo and no stair-stepping.

Every pixel is then repainted a single premium silver-grey, so the original
tone can never leak through as a colour cast.

    python3 scripts/logo-prep.py <source> [--tone 8F9499] [--out public/ni]
"""
import argparse, pathlib, sys
import numpy as np
from PIL import Image

def hex_rgb(h: str):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('source')
    ap.add_argument('--tone', default='8F9499', help='target silver-grey')
    ap.add_argument('--out', default='public/ni')
    ap.add_argument('--white', type=float, default=0.93,
                    help='luminance at/above which a pixel is fully background')
    ap.add_argument('--black', type=float, default=0.28,
                    help='luminance at/below which a pixel is fully ink')
    ap.add_argument('--max-alpha', type=float, default=1.0)
    args = ap.parse_args()

    src = pathlib.Path(args.source)
    if not src.exists():
        print(f'source not found: {src}', file=sys.stderr)
        return 1

    im = Image.open(src).convert('RGBA')
    a = np.asarray(im).astype(np.float32) / 255.0
    rgb, src_a = a[:, :, :3], a[:, :, 3]

    # Two kinds of source. If the file already carries a real alpha channel,
    # that matting is authoritative — trust it. Only fall back to luminance
    # keying for flat artwork delivered as dark ink on a pale ground, where
    # deriving alpha from darkness is the only way to get clean edges.
    has_alpha = float((src_a < 0.98).mean()) > 0.02
    if has_alpha:
        alpha = src_a * args.max_alpha
        mode = 'existing alpha channel'
    else:
        lum = rgb[:, :, 0] * 0.2126 + rgb[:, :, 1] * 0.7152 + rgb[:, :, 2] * 0.0722
        alpha = (args.white - lum) / max(args.white - args.black, 1e-6)
        alpha = np.clip(alpha, 0.0, 1.0) * args.max_alpha
        mode = 'luminance key'

    tone = np.array(hex_rgb(args.tone), dtype=np.float32) / 255.0
    out = np.zeros_like(a)
    out[:, :, 0], out[:, :, 1], out[:, :, 2] = tone
    out[:, :, 3] = alpha

    img = Image.fromarray((out * 255.0 + 0.5).astype(np.uint8), 'RGBA')

    # crop to the ink so the hero can size the mark itself
    ys, xs = np.nonzero(alpha > 0.02)
    if ys.size:
        img = img.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))

    outdir = pathlib.Path(args.out); outdir.mkdir(parents=True, exist_ok=True)
    png, webp = outdir / 'logo.png', outdir / 'logo.webp'
    img.save(png)
    img.save(webp, 'WEBP', quality=94, method=6)

    cov = float((alpha > 0.02).mean() * 100)
    soft = float(((alpha > 0.02) & (alpha < 0.98)).mean() * 100)
    print(f'source     {im.size[0]}x{im.size[1]}')
    print(f'cropped    {img.size[0]}x{img.size[1]}  aspect {img.size[0]/img.size[1]:.4f}')
    print(f'matting    {mode}')
    print(f'ink cover  {cov:.2f}%   soft edge {soft:.2f}%   tone #{args.tone}')
    print(f'wrote      {png} ({png.stat().st_size/1024:.1f} KB)')
    print(f'wrote      {webp} ({webp.stat().st_size/1024:.1f} KB)')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
