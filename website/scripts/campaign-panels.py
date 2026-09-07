#!/usr/bin/env python3
"""Prepare the section-four campaign panels.

Two jobs.

1. Remove the NI logo panel. The supplied files still carry the white
   `n.i. hairdressing` band across the bottom — roughly the last 13-16% of each
   frame, at a different height in each. The brief is explicit that no logo
   panel may sit under the campaign images, so the band is detected and cut.
   The photograph above it is untouched; nothing is redrawn.

   Detection is by row mean: the band is a flat near-white field, so scanning
   up from the bottom for the last row that is clearly photographic finds the
   seam. The signature strokes inside the band are dark, which is why the scan
   looks for a sustained run rather than a single row.

2. Grade, barely. Section four is meant to read as more alive than the rest of
   the site, so this keeps almost all of the original colour: hair, skin and
   clothing have to stay. Saturation 0.9, a whisper of the site's cool accent,
   and no lift at all.
"""
import pathlib
import numpy as np
from PIL import Image

SRC = pathlib.Path('/tmp/claude-0/-home-user-md-data-table/'
                   '93aac1b9-9b7c-5cde-9e93-eccdbbbd9f1b/scratchpad/tz')
OUT = pathlib.Path('public/ni/campaign')
NAMES = ['slide4-treatment-01', 'slide4-treatment-02', 'slide4-treatment-03']

SATURATION, CONTRAST, GAIN = 0.90, 0.95, 0.97
TINT = np.array([0x6F, 0x9F, 0xA3], np.float32) / 255
TINT_STRENGTH = 0.05
LONG_EDGE = 1500


def panel_top(a):
    """Row where the white logo band begins, or None if there isn't one."""
    rows = a.mean(axis=(1, 2))
    H = len(rows)
    # A band row is bright on average even where the signature crosses it.
    band = rows > 0.82
    # Walk up from the bottom while we are still inside a mostly-bright run.
    y = H - 1
    while y > H * 0.6 and band[max(y - 24, 0):y + 1].mean() > 0.75:
        y -= 1
    if y >= H - 1:
        return None
    # Back off the seam itself. The band's top edge is antialiased against the
    # photograph, and leaving even a few of those rows shows as a pale hairline
    # along the bottom of the panel — visible in the first cut I made.
    while y > H * 0.6 and rows[y - 3:y + 1].mean() > 0.78:
        y -= 1
    return y + 1


OUT.mkdir(parents=True, exist_ok=True)
for i, name in enumerate(NAMES, 1):
    im = Image.open(SRC / f'{name}.png').convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255
    cut = panel_top(a)
    assert cut is not None, f'{name}: no logo band found — check before shipping'
    assert 0.6 < cut / im.height < 0.95, f'{name}: implausible cut at {cut}/{im.height}'
    a = a[:cut]
    assert a[-8:].mean() < 0.85, f'{name}: a pale seam survived the cut'

    lum = a[:, :, 0]*0.2126 + a[:, :, 1]*0.7152 + a[:, :, 2]*0.0722
    muted = lum[..., None] + (a - lum[..., None]) * SATURATION
    curve = np.clip((0.5 + (lum - 0.5) * CONTRAST) * GAIN, 0, 1)
    out = muted * (curve / np.maximum(lum, 1e-4))[..., None]
    c = TINT / TINT.mean()
    out = np.clip(out * (1 + (c - 1) * TINT_STRENGTH)[None, None, :], 0, 1)

    g = Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGB')
    if max(g.size) > LONG_EDGE:
        s = LONG_EDGE / max(g.size)
        g = g.resize((round(g.width * s), round(g.height * s)), Image.LANCZOS)
    dst = OUT / f'c{i}.webp'
    g.save(dst, 'WEBP', quality=88, method=6)
    ch = (out.max(2) - out.min(2)).mean()
    print(f'{dst}  logo band cut at {cut}/{im.height} ({(im.height-cut)/im.height*100:.1f}% removed)'
          f'  -> {g.size[0]}x{g.size[1]} ratio {g.size[0]/g.size[1]:.3f}'
          f'  chroma {ch:.3f}  {dst.stat().st_size/1024:.0f} KB')
