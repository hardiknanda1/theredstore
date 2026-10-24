"""Builds an empty-studio plate from the OBSESSED still by removing the model and the type.

Each masked row is rebuilt by interpolating the wall/floor colour between the unmasked pixels
on either side (the studio is lit in smooth horizontal gradients), then the fine fabric texture
of the wall is restored from an untouched band of the same rows.

Also cuts the centre E of OBSESSED into an alpha sprite, which the hero keeps on screen while
the model and the rest of the word dissolve into the plate.

Usage: python3 scripts/hero_plate.py <obsessed-image> <plate-out.png> [<e-sprite-out.png>]
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
img = Image.open(src).convert("RGB")
W, H = img.size
a = np.array(img).astype(float)

TEXT = (322, 316, 1362, 474)  # OBSESSED line (crosses the pillar edge at the O)
girl = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(girl)
d.rectangle((425, 0, 1245, 900), fill=255)  # model, veil, arms, kaleeras
d.ellipse((470, 800, 1260, 990), fill=255)  # contact shadow under the skirt
mask = girl.copy()
ImageDraw.Draw(mask).rectangle(TEXT, fill=255)
m = np.array(girl) > 0


def box(x, r, axis):
    pad = [(r + 1, r) if i == axis else (0, 0) for i in range(x.ndim)]
    c = np.cumsum(np.pad(x, pad, mode="edge"), axis=axis)
    hi = np.take(c, range(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, range(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return (hi - lo) / (2 * r + 1)


def blur(x, r):
    for _ in range(3):
        x = box(box(x, r, 0), r, 1)
    return x


low = blur(a, 3)
high = a - low  # fabric / floor texture

fill = low.copy()
for y in range(H):
    xs = np.where(m[y])[0]
    if not len(xs):
        continue
    x0, x1 = xs.min(), xs.max()
    left = low[y, max(0, x0 - 6) : x0 - 1].mean(0) if x0 > 1 else low[y, x1 + 2 : x1 + 8].mean(0)
    right = low[y, x1 + 2 : min(W, x1 + 8)].mean(0) if x1 < W - 2 else left
    t = np.linspace(0, 1, x1 - x0 + 1)[:, None]
    # ease the blend so the gradient keeps the soft studio fall-off rather than a hard ramp
    t = t * t * (3 - 2 * t) * 0.5 + t * 0.5
    fill[y, x0 : x1 + 1] = left * (1 - t) + right * t

# smooth vertically inside the mask so row-to-row noise in the edge samples does not streak
smooth = blur(fill, 6)
mf = m.astype(float)[..., None]
fill = fill * (1 - mf) + smooth * mf

# The type line is filled vertically from the rows just above and below it, which keeps the
# pillar edge crisp where the O overlaps it.
tx0, ty0, tx1, ty1 = TEXT
top = fill[ty0 - 3 : ty0, tx0 : tx1 + 1].mean(0)
bottom = fill[ty1 + 1 : ty1 + 4, tx0 : tx1 + 1].mean(0)
t = np.linspace(0, 1, ty1 - ty0 + 1)[:, None, None]
fill[ty0 : ty1 + 1, tx0 : tx1 + 1] = top * (1 - t) + bottom * t

# texture: borrow the high-frequency detail from the clean band to the right of the model
tex = np.zeros_like(a)
band = high[:, 1370:1660]  # clear of the D
reps = int(np.ceil(W / band.shape[1])) + 1
tiled = np.concatenate([band] * reps, axis=1)[:, :W]
tex[:] = tiled

feather = np.array(mask.filter(ImageFilter.GaussianBlur(10))).astype(float)[..., None] / 255
plate = a * (1 - feather) + (fill + tex) * feather
Image.fromarray(plate.clip(0, 255).astype(np.uint8)).save(out)

if len(sys.argv) > 3:
    # Centre E: x 779-845, y 365-455 in the 1671x941 still; the box adds a little margin.
    x0, y0, x1, y1 = 770, 355, 856, 466
    c = a[y0:y1, x0:x1]
    t = np.clip((c.min(2) - 110) / (235 - 110), 0, 1)
    alpha = t * t * (3 - 2 * t)
    solid = c[alpha > 0.98].mean(0)
    rgba = np.dstack([np.broadcast_to(solid, c.shape), alpha * 255]).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(sys.argv[3], optimize=True)
