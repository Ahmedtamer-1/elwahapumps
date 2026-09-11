"""
Takes the white studio ground out of a product photograph.

    python scripts/strip-white-background.py public/images/products/foo.png [...]

Most of the catalogue arrived as cut-outs on transparency, but a handful of
photographs came on a white ground. On the site those sit on bone cards, so
each one drew a bright white rectangle inside its card — which is what this
removes.

Not a hard cutout. The photographs carry a soft contact shadow under the
product, and a threshold that takes white away leaves that shadow behind as a
grey blob with a cut edge. Instead the background is keyed by brightness:
white goes fully transparent, the shadow keeps its own greys at partial alpha,
and the ramp between them is smooth, so the shadow still reads as a shadow on
whatever ground the image is placed over.

Only the light region *connected to the border* is keyed. White inside the
photograph — a printed label, the lettering along a cable — is enclosed by the
product, never reaches an edge, and is left alone.

Writes <name>.png beside the original (a .jpeg input becomes a .png, since
JPEG has no alpha channel) and leaves the source file untouched.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

# The ramp that keys the ground. Below FLOOR a pixel is fully opaque; at WHITE
# and above it is fully transparent; in between it keeps a proportional alpha,
# which is what preserves the contact shadow.
#
# WHITE is 248 rather than 255 because a "white" studio ground is rarely pure:
# several of these photographs bottom out at 251-253, and a ramp anchored at
# 255 left them at alpha 20 — an almost-invisible haze that still printed a
# pale rectangle on the card.
FLOOR = 205
WHITE = 248


def strip(path: Path) -> Path:
    img = Image.open(path).convert("RGBA")
    rgba = np.array(img).astype(np.int16)
    rgb, alpha = rgba[..., :3], rgba[..., 3]

    # The darkest channel, not the average: a coloured highlight is not the
    # background, and min() keeps anything with colour in it out of the key.
    darkest = rgb.min(axis=2)

    # Everything light enough to be part of the ground, then only the part of
    # it that reaches an edge of the frame.
    light = (darkest >= FLOOR) & (alpha > 0)
    labels, count = ndimage.label(light)
    if count == 0:
        print(f"  no light region found, nothing to do: {path.name}")
        return path

    border = np.concatenate([labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])
    touching = set(int(v) for v in np.unique(border) if v != 0)
    if not touching:
        print(f"  no light region touches the border, nothing to do: {path.name}")
        return path

    background = np.isin(labels, list(touching))

    keyed = np.clip((WHITE - darkest) * (255.0 / (WHITE - FLOOR)), 0, 255).astype(np.uint8)
    new_alpha = np.where(background, np.minimum(alpha, keyed), alpha).astype(np.uint8)

    out_arr = np.dstack([rgba[..., :3].astype(np.uint8), new_alpha])
    out_path = path.with_suffix(".png")
    Image.fromarray(out_arr, "RGBA").save(out_path, optimize=True)

    cleared = int((new_alpha == 0).sum())
    share = cleared / new_alpha.size * 100
    print(f"  {path.name} -> {out_path.name}  ({share:.0f}% of the frame now transparent)")
    return out_path


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(2)
    for arg in sys.argv[1:]:
        strip(Path(arg))
