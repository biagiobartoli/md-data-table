#!/usr/bin/env python3
"""Prepare the two brand plates for section two.

Three problems in the sources, all handled here rather than in CSS:

  1. They are tonally mismatched — Kevin Murphy sits around 0.64 mean
     luminance, NAK around 0.85. Side by side on near-black, NAK reads as a
     glowing tile. Each is normalised to its own p2/p98 then remapped into one
     shared, deliberately dark window, so the pair matches.
  2. They are opaque rectangles. A hard edge on a dark editorial page reads as
     a product card, which is what the brief rules out. The outer band is
     feathered to alpha so each plate melts into the ground.
  Both sources are correctly oriented. The NAK bottles are shot at an angle
  and rotated, which can read as mirrored at a glance — it is not. Do not
  "fix" it by flipping; that genuinely reverses the branding.
"""
import argparse, pathlib
import numpy as np
from PIL import Image

PLATES = {
    'kevin-murphy-bw-faded': dict(crop=(180, 250, 900, 1150), flip=False),
    'nak-hair-bw-faded':     dict(crop=(140, 100, 1100, 1300), flip=False),
}
OUT_W, OUT_H = 720, 900          # 4:5, identical for both so the pair sits level


def apply_tint(v, hexcol, strength):
    """Multiply a greyscale ramp by a hue-normalised accent.

    Normalising the accent to mean 1.0 keeps the image's luminance structure
    intact and adds only hue, so the result stays a monochrome photograph with
    an undertone rather than becoming a coloured image.
    """
    import numpy as _np
    h = hexcol.lstrip('#')
    c = _np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], _np.float32) / 255.0
    c = c / max(c.mean(), 1e-6)
    c = 1.0 + (c - 1.0) * strength
    out = _np.clip(v[..., None] * c[None, None, :], 0, 1)
    return out

def feather(w, h, band=0.20, soft=0.95):
    """Alpha ramp on the outer band. It has to be wide and eased, not a thin
    edge: the plate interiors are far brighter than the ground, so a narrow
    feather still leaves a readable rectangle."""
    ax = np.clip(np.minimum(np.arange(w), w - 1 - np.arange(w)) / (band * w), 0, 1)
    ay = np.clip(np.minimum(np.arange(h), h - 1 - np.arange(h)) / (band * h), 0, 1)
    a = np.minimum(ax[None, :], ay[:, None]) ** soft
    return a

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default='public/ni'); ap.add_argument('--out', default='public/ni')
    ap.add_argument('--lo', type=float, default=0.05); ap.add_argument('--hi', type=float, default=0.52)
    ap.add_argument('--contrast', type=float, default=0.88)
    ap.add_argument('--no-flip', action='store_true')
    ap.add_argument('--tint', default='6F9FA3')
    ap.add_argument('--tint-strength', type=float, default=0.46)
    a = ap.parse_args()
    src, out = pathlib.Path(a.src), pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)

    for name, cfg in PLATES.items():
        im = Image.open(src / f'{name}.png').convert('RGB').crop(cfg['crop'])
        if cfg['flip'] and not a.no_flip:
            im = im.transpose(Image.FLIP_LEFT_RIGHT)
        im = im.resize((OUT_W, OUT_H), Image.LANCZOS)

        x = np.asarray(im).astype(np.float32) / 255.0
        lum = x[:, :, 0]*0.2126 + x[:, :, 1]*0.7152 + x[:, :, 2]*0.0722
        p2, p98 = np.percentile(lum, 2), np.percentile(lum, 98)
        n = np.clip((lum - p2) / max(p98 - p2, 1e-6), 0, 1)      # equalise the pair
        n = 0.5 + (n - 0.5) * a.contrast
        v = np.clip(a.lo + n * (a.hi - a.lo), 0, 1)              # one shared dark window

        rgba = np.zeros((OUT_H, OUT_W, 4), np.float32)
        rgba[:, :, :3] = apply_tint(v, a.tint, a.tint_strength)
        rgba[:, :, 3] = feather(OUT_W, OUT_H)
        img = Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), 'RGBA')
        img.save(out / f'{name.replace("-bw-faded", "")}.webp', 'WEBP', quality=90, method=6)

        f = out / f'{name.replace("-bw-faded", "")}.webp'
        ch = (rgba[:, :, :3].max(2) - rgba[:, :, :3].min(2))
        print(f'{name:24} -> {f.name:18} lum {v.mean():.3f}  '
              f'chroma mean {ch.mean():.3f} max {ch.max():.3f}  {f.stat().st_size/1024:.1f} KB')

if __name__ == '__main__':
    main()
