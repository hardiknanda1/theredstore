"""Builds the closing hero assets from the two supplied stills.

  1. studio plate  - the lehenga still with the model removed (the empty studio she dissolves into)
  2. type sprite   - the white OBSESSED lettering matted out of the OBSESSED still, minus its centre E
  3. E sprite      - that centre E on its own, which stays on screen when the rest dissolves

The plate: each masked row is rebuilt by interpolating the wall/floor colour between the
unmasked pixels on either side (the studio is lit in smooth horizontal gradients), then the
fine fabric texture of the wall is restored from an untouched band of the same rows.

The type: pixels near a letter are unmixed as  pixel = a * white + (1 - a) * background,  with
the background estimated locally from the surrounding non-letter pixels, which gives clean
anti-aliased edges and ignores the gold jewellery behind the word.

Usage: python3 scripts/hero_plate.py <lehenga-still> <obsessed-still> <plate.png> <type.png> <e.png>
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

lehenga_path, obsessed_path, plate_out, type_out, e_out = sys.argv[1:6]


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


# ---------------------------------------------------------------- 1. studio plate
img = Image.open(lehenga_path).convert("RGB")
W, H = img.size
a = np.array(img).astype(float)

mask = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(mask)
d.rectangle((468, 18, 1205, 892), fill=255)  # model, veil, arms, kaleeras
d.ellipse((500, 800, 1180, 975), fill=255)  # contact shadow under the skirt
m = np.array(mask) > 0

low = blur(a, 3)
high = a - low
fill = low.copy()
for y in range(H):
    xs = np.where(m[y])[0]
    if not len(xs):
        continue
    x0, x1 = xs.min(), xs.max()
    left = low[y, max(0, x0 - 6) : x0 - 1].mean(0)
    right = low[y, x1 + 2 : min(W, x1 + 8)].mean(0)
    t = np.linspace(0, 1, x1 - x0 + 1)[:, None]
    t = t * t * (3 - 2 * t) * 0.5 + t * 0.5
    fill[y, x0 : x1 + 1] = left * (1 - t) + right * t
smooth = blur(fill, 6)
mf = m.astype(float)[..., None]
fill = fill * (1 - mf) + smooth * mf

band = high[:, 1290:1640]  # clean wall/floor to the right of the model
tex = np.concatenate([band] * (W // band.shape[1] + 2), axis=1)[:, :W]
feather = np.array(mask.filter(ImageFilter.GaussianBlur(10))).astype(float)[..., None] / 255
plate = a * (1 - feather) + (fill + tex) * feather
Image.fromarray(plate.clip(0, 255).astype(np.uint8)).save(plate_out)

# ---------------------------------------------------------------- 2/3. type mattes
ob = np.array(Image.open(obsessed_path).convert("RGB")).astype(float)
BAND = (322, 316, 1362, 474)  # OBSESSED line in the 1671x941 still
E_BOX = (770, 355, 856, 466)  # the centre E, with a little margin
x0, y0, x1, y1 = BAND
p = ob[y0:y1, x0:x1]
white = np.array([251.0, 248.0, 247.0])

core = p.min(2) > 205  # certainly letter
rows = np.arange(y0, y1)[:, None]
core &= (rows >= 360) & (rows <= 462)  # the letters' cap band; drops highlights on the hands above
near = np.array(Image.fromarray((core * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 0
bgw = (~near).astype(float)
bg = np.stack([blur(p[..., c] * bgw, 5) for c in range(3)], -1) / (blur(bgw, 5)[..., None] + 1e-4)
diff = white - bg
alpha = ((p - bg) * diff).sum(-1) / ((diff * diff).sum(-1) + 1e-4)
alpha = np.clip(alpha, 0, 1) * near
alpha[core] = 1.0


def sprite(al):
    rgba = np.dstack([np.broadcast_to(white, al.shape + (3,)), al * 255]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


ex0, ey0, ex1, ey1 = E_BOX
e_alpha = np.zeros_like(alpha)
e_alpha[ey0 - y0 : ey1 - y0, ex0 - x0 : ex1 - x0] = alpha[ey0 - y0 : ey1 - y0, ex0 - x0 : ex1 - x0]
rest = alpha - e_alpha
sprite(rest).save(type_out, optimize=True)
sprite(e_alpha[ey0 - y0 : ey1 - y0, ex0 - x0 : ex1 - x0]).save(e_out, optimize=True)
