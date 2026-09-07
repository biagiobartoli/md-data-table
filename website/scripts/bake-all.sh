#!/bin/sh
# Every baked asset on the NICOLA IOVINE page, with the exact arguments that
# produced the files currently in public/ni. Kept because the parameters are
# the art direction: without them a re-bake is a guess, and the treatments were
# tuned against measured chroma rather than by eye.
set -e
cd "$(dirname "$0")/.."

# Section two — the hair photograph behind the STORIA column. Held at 0.88
# saturation so the tones stay natural and warm; only lightly cooled so it
# still belongs to the page palette. Flattened (contrast 0.66) so the text
# that sits over it keeps its contrast.
python3 scripts/section2-bg.py public/ni/section-2-hair-source.png \
  --name section-2-hair --saturation 0.88 --tint-strength 0.05 \
  --contrast 0.66 --lift 0.08 --gain 0.98 --max-width 1400

# Section two — the two product plates. The sources are already monochrome, so
# their only colour is the tint; at the old 0.46 they read as cyan chips beside
# a hair photograph that is now warm. 0.28 keeps them a neutral silver.
python3 scripts/section2-products.py --tint-strength 0.28

# Section three — the flower behind SALONE. The source is all but achromatic
# (chroma 0.003), so the cool cast is entirely the tint; it is screen-blended
# over black, which is why it is baked dark rather than faded in CSS.
python3 scripts/section2-bg.py public/ni/salone-flower-source.png \
  --name salone-flower --saturation 0.40 --tint-strength 0.52 \
  --contrast 0.92 --lift 0.0 --gain 0.86 --gamma 1.12 --max-width 1500

# Not covered here: the gallery and works placeholder sets. Their scripts crop
# from a source that only ever lived outside the repo, so they cannot be
# re-run — which is moot, since both sets are stand-ins to be replaced by real
# photography and their scripts deleted along with them.
