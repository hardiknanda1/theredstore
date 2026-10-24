"""Measures the left wall's per-frame horizontal drift and writes src/lib/hero/wall-track.ts.

Usage: python3 scripts/wall_track.py <dir-with-original-frames> src/lib/hero/wall-track.ts
"""
import os
import re
import sys

import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
files = sorted(os.listdir(src), key=lambda s: int(re.findall(r"\d+", s)[0]))
vals = []
for f in files:
    im = np.array(Image.open(os.path.join(src, f)).convert("L")).astype(float)
    if im.shape[1] == 1920:  # frame 180: drop the white export strips
        im = im[7:, :1906]
    h, w = im.shape
    edges = []
    for r in (0.08, 0.12, 0.16, 0.6, 0.7):
        y = int(h * r)
        row = im[y - 2 : y + 3, : int(0.35 * w)].mean(0)
        g = np.convolve(np.diff(row), np.ones(3), "same")
        edges.append((int(np.argmin(g[int(0.15 * w) :])) + int(0.15 * w)) / w)
    vals.append(float(np.median(edges)))

v = np.array(vals)
n = len(v)
med = np.array([np.median(v[max(0, i - 20) : i + 21]) for i in range(n)])
bad = np.abs(v - med) > 0.002  # frames where the red figure occludes the wall edge
idx = np.arange(n)
v[bad] = np.interp(idx[bad], idx[~bad], v[~bad])
smooth = np.convolve(np.pad(v, 3, mode="edge"), np.ones(7) / 7, "valid")
off = smooth - smooth[0]

lines = [
    "/**",
    " * Horizontal drift of the left wall (pillar edge) per frame, as a fraction of frame width,",
    " * measured from the supplied frames relative to frame 1. Used to keep the wall typography",
    " * locked to the wall while the camera settles slightly during the film.",
    " */",
    "export const WALL_DRIFT: readonly number[] = [",
]
for i in range(0, n, 10):
    lines.append("  " + ", ".join("%.4f" % x for x in off[i : i + 10]) + ",")
lines.append("];")
open(out, "w").write("\n".join(lines) + "\n")
