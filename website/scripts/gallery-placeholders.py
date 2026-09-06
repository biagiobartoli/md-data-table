#!/usr/bin/env python3
"""PLACEHOLDER generator for the section-three gallery. DELETE ME.

Nicola has not supplied the salon photographs yet, and section three cannot be
judged against grey boxes — the composition, the entrance directions and the
hover recede all depend on real photographic content at the real aspect
ratios. So this crops the two photographs we do have into the seven plates the
layout calls for, at the ratios the art direction wants.

These are stand-ins, not art direction. When the real set arrives: drop the
files into public/ni/gallery/ and update PLATES in app/nicola-iovine/gallery.ts.
Then delete this script and the images it made.

The treatment matches section two's: partially desaturated, flattened, faintly
cool — the gallery's resting state is muted and hover restores it, so these are
baked one stop *less* muted than they appear, with the rest done in CSS.
"""
import pathlib
import numpy as np
from PIL import Image

OUT = pathlib.Path('public/ni/gallery')
SRC_HAIR = 'public/ni/section-2-hair-source.png'
SRC_ROOM = ('/tmp/claude-0/-home-user-md-data-table/'
            '93aac1b9-9b7c-5cde-9e93-eccdbbbd9f1b/scratchpad/bgzip/'
            'section-2-background-source.png')

# name, source, target ratio (w/h), crop centre in source (fx, fy), zoom
PLATES = [
    ('g1', SRC_HAIR, 3/4,  (0.50, 0.30), 1.05),
    ('g2', SRC_ROOM, 4/5,  (0.66, 0.30), 1.55),
    ('g3', SRC_HAIR, 1/1,  (0.30, 0.70), 1.90),
    ('g4', SRC_ROOM, 3/2,  (0.44, 0.62), 1.25),
    ('g5', SRC_HAIR, 2/3,  (0.72, 0.55), 2.10),
    ('g6', SRC_ROOM, 1/1,  (0.30, 0.24), 2.20),
    ('g7', SRC_HAIR, 4/5,  (0.34, 0.88), 1.70),
]

CONTRAST, GAIN, LIFT, SATURATION = 0.74, 0.94, 0.07, 0.72
TINT = np.array([0x6F, 0x9F, 0xA3], np.float32) / 255
LONG_EDGE = 900


def crop(im, ratio, centre, zoom):
    W, H = im.size
    # the largest box of this ratio that fits, then zoomed in
    w, h = (W, W / ratio) if W / ratio <= H else (H * ratio, H)
    w, h = w / zoom, h / zoom
    cx, cy = centre[0] * W, centre[1] * H
    l = min(max(cx - w / 2, 0), W - w)
    t = min(max(cy - h / 2, 0), H - h)
    return im.crop((round(l), round(t), round(l + w), round(t + h)))


def treat(im):
    x = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    lum = x[:, :, 0]*0.2126 + x[:, :, 1]*0.7152 + x[:, :, 2]*0.0722
    muted = lum[..., None] + (x - lum[..., None]) * SATURATION
    curve = np.clip((0.5 + (lum - 0.5) * CONTRAST) * GAIN + LIFT, 0, 1)
    out = muted * (curve / np.maximum(lum, 1e-4))[..., None]
    c = TINT / TINT.mean()
    out = np.clip(out * (1 + (c - 1) * 0.10)[None, None, :], 0, 1)
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGB')


OUT.mkdir(parents=True, exist_ok=True)
for name, src, ratio, centre, zoom in PLATES:
    im = crop(Image.open(src), ratio, centre, zoom)
    s = LONG_EDGE / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    g = treat(im)
    dst = OUT / f'{name}.webp'
    g.save(dst, 'WEBP', quality=86, method=6)
    print(f'{dst}  {g.size[0]}x{g.size[1]}  ratio {g.size[0]/g.size[1]:.3f}'
          f'  {dst.stat().st_size/1024:.0f} KB')
