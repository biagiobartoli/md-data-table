#!/usr/bin/env python3
"""Isolate the two brand marks for the PRODOTTI section.

The sources are screenshots: a dark mark sitting on a pale ground, usually with
some of the page around it. Three things have to happen, and the order matters.

  1. CROP to the mark. Everything after this keys on darkness, so any other
     dark pixel left in the frame — a navigation bar, a photograph, a caption —
     becomes part of the logo. --crop takes fractions of the source so the same
     numbers work whatever resolution the screenshot was taken at.

  2. KEY the background out by luminance rather than by thresholding. The
     darker a pixel, the more opaque it becomes, so antialiased glyph edges
     survive as genuine partial alpha and the mark sits on the site's black
     with no halo and no stair-stepping. A hard threshold gives you both.

  3. REPAINT every pixel one silver. The brief allows either a silver mark or a
     brand-authentic dark one; dark is not an option on this background, and
     leaving the source tone would let the screenshot's own cast — the pink in
     one of them — leak through as colour on a page that has almost none.

Then it crops to the ink, so the page can size each mark itself rather than
inheriting whatever margin the screenshot happened to have.

    python3 scripts/brand-logos.py KEVIN.png NAK.png
    python3 scripts/brand-logos.py KEVIN.png NAK.png \
        --crop-a 0.30,0.18,0.70,0.52 --crop-b 0.10,0.40,0.90,0.60

Run it with --check first: it prints what it would key without writing, so a
crop can be dialled in without four rounds of look-at-the-file.
"""
import argparse, pathlib, sys
import numpy as np
from PIL import Image

# id, output stem, human name — the ids match BRANDS in app/nicola-iovine/brands.ts
TARGETS = [('kevin-murphy', 'Kevin Murphy'), ('nak-hair', 'Nak Hair Australia')]


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def parse_crop(spec):
    """'l,t,r,b' as fractions of the source, or None for the whole frame."""
    if not spec:
        return None
    try:
        l, t, r, b = (float(v) for v in spec.split(','))
    except ValueError:
        raise SystemExit(f'--crop wants four comma-separated fractions, got {spec!r}')
    if not (0 <= l < r <= 1 and 0 <= t < b <= 1):
        raise SystemExit(f'--crop out of order or out of range: {spec!r}')
    return l, t, r, b


def isolate(path, crop, tone, white, black, pad):
    im = Image.open(path).convert('RGBA')
    full = im.size
    if crop:
        w, h = im.size
        l, t, r, b = crop
        im = im.crop((round(l * w), round(t * h), round(r * w), round(b * h)))

    a = np.asarray(im).astype(np.float32) / 255.0
    rgb, src_a = a[:, :, :3], a[:, :, 3]

    # A file that already carries real matting is authoritative; only fall back
    # to keying for flat artwork on a pale ground.
    if float((src_a < 0.98).mean()) > 0.02:
        alpha, mode = src_a.copy(), 'existing alpha channel'
    else:
        lum = rgb[:, :, 0] * 0.2126 + rgb[:, :, 1] * 0.7152 + rgb[:, :, 2] * 0.0722
        alpha = np.clip((white - lum) / max(white - black, 1e-6), 0.0, 1.0)
        mode = 'luminance key'

    ys, xs = np.nonzero(alpha > 0.02)
    if not ys.size:
        raise SystemExit(f'{path}: nothing survived the key — the crop is probably '
                         f'empty, or --white/--black need adjusting')

    # Does the ink run off the edge of the crop? That means the crop cut through
    # the mark, or caught something that is not the mark.
    box = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    touches = [n for n, hit in (('left', box[0] == 0), ('top', box[1] == 0),
                                ('right', box[2] == im.size[0]),
                                ('bottom', box[3] == im.size[1])) if hit]

    tone_rgb = np.array(hex_rgb(tone), np.float32) / 255.0
    out = np.zeros_like(a)
    out[:, :, 0], out[:, :, 1], out[:, :, 2] = tone_rgb
    out[:, :, 3] = alpha
    img = Image.fromarray((out * 255.0 + 0.5).astype(np.uint8), 'RGBA').crop(box)

    if pad:
        p = round(pad * max(img.size))
        canvas = Image.new('RGBA', (img.size[0] + 2 * p, img.size[1] + 2 * p), (0, 0, 0, 0))
        canvas.paste(img, (p, p))
        img = canvas

    stats = {
        'full': full, 'keyed': im.size, 'out': img.size, 'mode': mode,
        'cover': float((alpha > 0.02).mean() * 100),
        'soft': float(((alpha > 0.02) & (alpha < 0.98)).mean() * 100),
        'touches': touches,
    }
    return img, stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('kevin', help='Kevin Murphy source screenshot')
    ap.add_argument('nak', help='Nak Hair source screenshot')
    ap.add_argument('--crop-a', default='', help="Kevin crop as 'l,t,r,b' fractions")
    ap.add_argument('--crop-b', default='', help="Nak crop as 'l,t,r,b' fractions")
    ap.add_argument('--tone', default='C6CBCE',
                    help='silver the mark is repainted to; matches .wordmark')
    ap.add_argument('--white', type=float, default=0.90,
                    help='luminance at/above which a pixel is fully background')
    ap.add_argument('--black', type=float, default=0.30,
                    help='luminance at/below which a pixel is fully ink')
    ap.add_argument('--pad', type=float, default=0.0,
                    help='transparent margin as a fraction of the long edge')
    ap.add_argument('--out', default='public/ni/brands')
    ap.add_argument('--check', action='store_true',
                    help='report only; write nothing')
    a = ap.parse_args()

    outdir = pathlib.Path(a.out)
    if not a.check:
        outdir.mkdir(parents=True, exist_ok=True)

    problems = []
    for (stem, name), src, crop in zip(TARGETS, (a.kevin, a.nak),
                                       (parse_crop(a.crop_a), parse_crop(a.crop_b))):
        p = pathlib.Path(src)
        if not p.exists():
            print(f'source not found: {p}', file=sys.stderr)
            return 1
        img, st = isolate(p, crop, a.tone, a.white, a.black, a.pad)

        print(f'\n{name}')
        print(f'  source   {st["full"][0]}x{st["full"][1]}'
              f'   keyed from {st["keyed"][0]}x{st["keyed"][1]}   ({st["mode"]})')
        print(f'  mark     {st["out"][0]}x{st["out"][1]}   aspect {st["out"][0]/st["out"][1]:.3f}')
        print(f'  ink      {st["cover"]:.2f}% of the crop, {st["soft"]:.2f}% soft edge')

        # Loud rather than silent: a logo that came out wrong is worse than one
        # that did not come out at all, and both look like "it ran fine".
        if st['touches']:
            problems.append(f'{name}: ink reaches the {", ".join(st["touches"])} '
                            f'edge of the crop — widen it, or it is cutting the mark')
        if st['cover'] > 55:
            problems.append(f'{name}: {st["cover"]:.0f}% of the crop keyed as ink — '
                            f'the background is probably not pale enough to key, '
                            f'or --white is too high')
        if st['cover'] < 1.5:
            problems.append(f'{name}: only {st["cover"]:.1f}% keyed as ink — '
                            f'the crop is probably off the mark')
        if st['soft'] < 0.05:
            problems.append(f'{name}: no soft edge at all — the source looks '
                            f'already thresholded, and the mark will alias')

        if not a.check:
            dst = outdir / f'{stem}.webp'
            img.save(dst, 'WEBP', quality=95, method=6, lossless=True)
            print(f'  wrote    {dst} ({dst.stat().st_size/1024:.1f} KB)')

    if problems:
        print('\n' + '\n'.join('!  ' + p for p in problems), file=sys.stderr)
        return 2
    if a.check:
        print('\nlooks clean — drop --check to write')
    else:
        print('\nNow set `logo` for each brand in app/nicola-iovine/brands.ts:')
        for stem, name in TARGETS:
            print(f"    {name:20} logo: '/ni/brands/{stem}.webp'")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
