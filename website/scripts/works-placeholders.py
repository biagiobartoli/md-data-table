#!/usr/bin/env python3
"""PLACEHOLDER generator for section five (I NOSTRI LAVORI). DELETE ME.

Nicola has not supplied photographs of the salon's work yet. Rather than reach
for unrelated stock — the brief rules that out, and rightly — this crops the
hair photography already in the project: the three Kevin Murphy campaign frames
and the ash-blonde shot from section two. All four are real hair results, so the
composition can be judged against the right subject matter at the right ratios.

A works gallery is not six full-length portraits. Portfolio sets mix the whole
look with the detail that proves it — length, colour transition, texture — so
half of these are deliberately tight crops.

When the real set arrives: drop the files into public/ni/works/ and update
PLATES in app/nicola-iovine/works.ts. Then delete this script and its output.

The grade is deliberately lighter than section three's gallery. That section is
about a room and is nearly monochrome; this one is about colour work, so it
keeps most of its saturation and only loses a little contrast.
"""
import pathlib
import numpy as np
from PIL import Image

OUT = pathlib.Path('public/ni/works')
C = 'public/ni/campaign'
HAIR = 'public/ni/section-2-hair-source.png'

# name, source, target ratio (w/h), crop centre (fx, fy), zoom
# Every crop stays above y=0.74 of the campaign frames. The KEVIN.MURPHY lockup
# is baked into the bottom of those photographs, and repeated across six plates
# it read as Kevin Murphy's campaign rather than as Nicola's work.
PLATES = [
    ('w1', f'{C}/c1.webp', 3/4,  (0.52, 0.27), 1.34),  # the whole look
    ('w2', f'{C}/c2.webp', 1/1,  (0.72, 0.50), 2.60),  # curl detail
    ('w3', HAIR,           3/2,  (0.50, 0.55), 1.55),  # colour across a band
    ('w4', f'{C}/c3.webp', 4/5,  (0.52, 0.21), 1.38),  # men's cut
    # Tight enough that it reads as a detail of the colour rather than as a
    # second crop of w1 — same photograph, so at any wider framing the green
    # jacket comes back and the two plates look like a duplication.
    ('w5', f'{C}/c1.webp', 2/3,  (0.600, 0.42), 3.10),  # lengths
    ('w6', f'{C}/c2.webp', 4/5,  (0.50, 0.23), 1.36),  # finished styling
]

CONTRAST, GAIN, LIFT, SATURATION = 0.90, 0.96, 0.02, 0.82
TINT = np.array([0x6F, 0x9F, 0xA3], np.float32) / 255
TINT_STRENGTH = 0.06
LONG_EDGE = 1000


def crop(im, ratio, centre, zoom):
    W, H = im.size
    w, h = (W, W / ratio) if W / ratio <= H else (H * ratio, H)
    w, h = w / zoom, h / zoom
    cx, cy = centre[0] * W, centre[1] * H
    l = min(max(cx - w / 2, 0), W - w)
    t = min(max(cy - h / 2, 0), H - h)
    return im.crop((round(l), round(t), round(l + w), round(t + h)))


def grade(im):
    x = np.asarray(im.convert('RGB')).astype(np.float32) / 255
    lum = x[:, :, 0]*0.2126 + x[:, :, 1]*0.7152 + x[:, :, 2]*0.0722
    muted = lum[..., None] + (x - lum[..., None]) * SATURATION
    curve = np.clip((0.5 + (lum - 0.5) * CONTRAST) * GAIN + LIFT, 0, 1)
    out = muted * (curve / np.maximum(lum, 1e-4))[..., None]
    c = TINT / TINT.mean()
    return Image.fromarray(
        (np.clip(out * (1 + (c - 1) * TINT_STRENGTH)[None, None, :], 0, 1)
         * 255 + 0.5).astype(np.uint8), 'RGB')


OUT.mkdir(parents=True, exist_ok=True)
for name, src, ratio, centre, zoom in PLATES:
    im = crop(Image.open(src), ratio, centre, zoom)
    s = LONG_EDGE / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    g = grade(im)
    dst = OUT / f'{name}.webp'
    g.save(dst, 'WEBP', quality=88, method=6)
    a = np.asarray(g).astype(np.float32) / 255
    print(f'{dst}  {g.size[0]}x{g.size[1]}  ratio {g.size[0]/g.size[1]:.3f}'
          f'  chroma {(a.max(2)-a.min(2)).mean():.3f}  {dst.stat().st_size/1024:.0f} KB')
