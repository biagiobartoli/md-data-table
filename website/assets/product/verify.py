#!/usr/bin/env python3
"""Verify the layered product assets before integrating them.

Checks canvas size, real alpha, per-layer bounding boxes, edge fringing, and
whether compositing shadow -> body -> ring -> cap reproduces the master
reference. Run from anywhere:  python3 website/assets/product/verify.py
"""
import sys, pathlib
from PIL import Image
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
EXPECT = (750, 2098)
LAYERS = ["bottle-shadow.png", "bottle-body.png", "bottle-ring.png", "bottle-cap.png"]  # back -> front
MASTER = "bottle-master-reference.png"

def load(name):
    p = HERE / name
    if not p.exists():
        return None, f"MISSING: {name}"
    im = Image.open(p)
    return im, None

def describe(name, im):
    rgba = im.convert("RGBA")
    a = np.array(rgba)[:, :, 3]
    nz = np.argwhere(a > 0)
    if nz.size == 0:
        return f"  {name:26} {im.size} mode={im.mode}  !! FULLY TRANSPARENT"
    y0, x0 = nz.min(0); y1, x1 = nz.max(0)
    opaque = (a == 255).mean() * 100
    clear  = (a == 0).mean() * 100
    soft   = 100 - opaque - clear
    size_ok = "OK " if im.size == EXPECT else "!! "
    mode_ok = "OK " if im.mode == "RGBA" else "!! "
    return (f"  {name:26} {size_ok}{str(im.size):12} {mode_ok}{im.mode:5} "
            f"bbox=({x0},{y0})-({x1},{y1}) w={x1-x0+1} h={y1-y0+1}  "
            f"alpha: {clear:.1f}% clear / {soft:.1f}% soft / {opaque:.1f}% opaque")

def fringe_check(name, im):
    """Dark or light halo left by keying shows as semi-transparent pixels whose
    colour diverges sharply from the neighbouring opaque body."""
    rgba = np.array(im.convert("RGBA")).astype(np.float32)
    a = rgba[:, :, 3]
    semi = (a > 8) & (a < 248)
    if semi.sum() < 50:
        return f"  {name:26} no meaningful soft edge (hard cutout — may alias)"
    lum_semi = rgba[:, :, :3][semi].mean()
    solid = a >= 248
    lum_solid = rgba[:, :, :3][solid].mean() if solid.sum() else float("nan")
    return (f"  {name:26} soft-edge luma {lum_semi:6.1f} vs body {lum_solid:6.1f}  "
            f"(large gap => keying halo)")

def main():
    print("=" * 100)
    print(f"expected canvas {EXPECT[0]}x{EXPECT[1]} RGBA\n")
    ims, missing = {}, []
    for n in LAYERS + [MASTER]:
        im, err = load(n)
        if err: missing.append(err)
        else:   ims[n] = im
    if missing:
        for m in missing: print(" ", m)
        if any(l in " ".join(missing) for l in LAYERS):
            print("\nFAIL — production layers missing; nothing to verify.")
            return 1

    print("LAYERS (back to front)")
    for n in LAYERS:
        if n in ims: print(describe(n, ims[n]))
    print("\nEDGE QUALITY")
    for n in LAYERS:
        if n in ims: print(fringe_check(n, ims[n]))

    # composite in the documented order
    base = Image.new("RGBA", ims[LAYERS[0]].size, (0, 0, 0, 0))
    for n in LAYERS:
        base = Image.alpha_composite(base, ims[n].convert("RGBA"))
    base.save(HERE / "_composite.png")
    print(f"\nwrote {HERE/'_composite.png'}")

    if MASTER in ims:
        m = ims[MASTER].convert("RGBA")
        if m.size != base.size:
            print(f"\n!! master is {m.size}, composite is {base.size} — cannot diff directly")
            return 1
        A = np.array(base).astype(np.int16); B = np.array(m).astype(np.int16)
        # compare only where either has content
        mask = (A[:, :, 3] > 8) | (B[:, :, 3] > 8)
        d = np.abs(A[:, :, :3] - B[:, :, :3]).mean(2)
        dm = d[mask]
        alpha_d = np.abs(A[:, :, 3] - B[:, :, 3])
        print("\nCOMPOSITE vs MASTER")
        print(f"  mean |diff| over content : {dm.mean():.2f} / 255")
        print(f"  95th percentile          : {np.percentile(dm, 95):.2f}")
        print(f"  pixels >16 diff          : {(dm > 16).mean()*100:.2f}%")
        print(f"  alpha mean |diff|        : {alpha_d.mean():.2f}")
        # where does it diverge?
        bad = (d > 24) & mask
        if bad.sum():
            ys, xs = np.nonzero(bad)
            print(f"  divergent bbox           : ({xs.min()},{ys.min()})-({xs.max()},{ys.max()})")
        Image.fromarray((np.clip(d, 0, 255)).astype(np.uint8)).save(HERE / "_diff.png")
        print(f"  wrote {HERE/'_diff.png'}")
        ok = dm.mean() < 3 and (dm > 16).mean() < 0.02
        print(f"\n  ALIGNMENT: {'PASS' if ok else 'REVIEW — see _diff.png'}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
