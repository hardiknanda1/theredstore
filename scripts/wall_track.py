"""Measures the left wall's per-frame horizontal drift and writes src/lib/hero/wall-track.ts.

Frames 1-144 come from the original film; 145-179 and the closing studio shot use the
lehenga still, which gets its own measured offset.

Usage: python3 scripts/wall_track.py <film-frames-dir> <lehenga-still> src/lib/hero/wall-track.ts
"""
import os
import re
import sys

import numpy as np
from PIL import Image

frames_dir, lehenga, out = sys.argv[1:4]
FILM_FRAMES = 144


def pillar_edge(path):
    im = np.array(Image.open(path).convert("L")).astype(float)
    h, w = im.shape
    edges = []
    for r in (0.08, 0.12, 0.16, 0.6, 0.7):
        y = int(h * r)
        row = im[y - 2 : y + 3, : int(0.35 * w)].mean(0)
        g = np.convolve(np.diff(row), np.ones(3), "same")
        edges.append((int(np.argmin(g[int(0.15 * w) :])) + int(0.15 * w)) / w)
    return float(np.median(edges))


files = sorted(os.listdir(frames_dir), key=lambda s: int(re.findall(r"\d+", s)[0]))[:FILM_FRAMES]
v = np.array([pillar_edge(os.path.join(frames_dir, f)) for f in files])
n = len(v)
med = np.array([np.median(v[max(0, i - 20) : i + 21]) for i in range(n)])
bad = np.abs(v - med) > 0.002  # frames where the red figure occludes the wall edge
idx = np.arange(n)
v[bad] = np.interp(idx[bad], idx[~bad], v[~bad])
smooth = np.convolve(np.pad(v, 3, mode="edge"), np.ones(7) / 7, "valid")
base = smooth[0]
film = smooth - base
still = pillar_edge(lehenga) - base
values = list(film) + [still] * 35

lines = [
    "/**",
    " * Horizontal drift of the left wall (pillar edge) per frame, as a fraction of frame width,",
    " * measured relative to frame 1: frames 1–144 from the film, 145–179 from the lehenga still.",
    " * Keeps the wall typography locked to the wall at every frame.",
    " */",
    "export const WALL_DRIFT: readonly number[] = [",
]
for i in range(0, len(values), 10):
    lines.append("  " + ", ".join("%.4f" % x for x in values[i : i + 10]) + ",")
lines.append("];")
lines.append("")
lines.append("/** Drift for the closing studio shot, which shares the lehenga still's framing. */")
lines.append("export const STUDIO_DRIFT = %.4f;" % still)
open(out, "w").write("\n".join(lines) + "\n")
print("still offset:", round(still, 4))
