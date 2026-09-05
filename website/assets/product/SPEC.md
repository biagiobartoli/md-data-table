# KELVIN K-600 — product asset contract

Authoritative spec, confirmed by the asset author.

## Production layers

All **750 × 2098 RGBA**, true transparency, one shared canvas and coordinate
system. Stack with identical positioning (`position:absolute; inset:0`).

Order, back to front:

1. `bottle-shadow.png`
2. `bottle-body.png`   — contains the hidden threaded neck behind cap/ring
3. `bottle-ring.png`
4. `bottle-cap.png`

Cap and ring geometry comes from the same assembled master: **do not
independently resize or reposition them in the neutral state.**

## References (verification only, never shipped)

- `bottle-master-reference.png` — neutral assembled state
- `assembled-check.png`
- `exploded-check.png`

## Branding

**K-600 VACUUM** throughout.

## Motion rules

- Cap travels upward most, ring upward less, body subtly downward
- Heavy, controlled motion
- No large CSS `rotationY` on flat images — keep rotation subtle
- `bottle-shadow.png` animates independently (scale + opacity react to movement)

## Verifying

    python3 website/assets/product/verify.py

Checks canvas size, real alpha, per-layer bounding boxes, keying halos, and
composites the four layers to diff against the master reference. Writes
`_composite.png` and `_diff.png`. Must pass before integration.
