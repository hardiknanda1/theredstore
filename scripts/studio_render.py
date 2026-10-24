"""Studio still-life renderer for RED product and editorial imagery.

Signed-distance raymarching in numpy with soft shadows, ambient occlusion, a filmic tone curve
and procedural material detail (woven, knit and leather bump, velvet sheen, metal, gold
embroidery). Every shot uses the same red seamless studio and key light so the catalogue reads
as one shoot. Replace the generated files with photography whenever it is available.

Usage: python3 scripts/studio_render.py <scene> <object-hex> <backdrop-hex> <out.jpg> [angle] [--wide]
Scenes: hat cap tophandle messenger tie socks trainer tee shorts trouser blazer gown lehenga
        dupatta bodysuit candle vase perfume mug flatlay drapewide
"""
import sys

import numpy as np
from PIL import Image

SS = 1.5


def norm(v):
    return v / np.linalg.norm(v, axis=-1, keepdims=True)


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def length2(a, b):
    return np.sqrt(a * a + b * b)


def rot_y(p, ang):
    c, s = np.cos(ang), np.sin(ang)
    x, y, z = p[..., 0], p[..., 1], p[..., 2]
    return np.stack([c * x + s * z, y, -s * x + c * z], -1)


def cyl(p, r, h, rr=0.0, y0=0.0):
    """Capped cylinder resting on y=y0 with height 2h, rounded by rr."""
    qx = length2(p[..., 0], p[..., 2]) - r + rr
    qy = np.abs(p[..., 1] - y0 - h) - h + rr
    return np.minimum(np.maximum(qx, qy), 0) + length2(np.maximum(qx, 0), np.maximum(qy, 0)) - rr


def rbox(p, c, b, r):
    q = np.abs(p - c) - np.asarray(b) + r
    return np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(q.max(-1), 0) - r


def ellipsoid(p, c, r):
    q = (p - c) / np.asarray(r)
    k0 = np.linalg.norm(q, axis=-1)
    k1 = np.linalg.norm(q / np.asarray(r), axis=-1)
    return k0 * (k0 - 1) / np.maximum(k1, 1e-6)


def torus(p, c, R, r, plane="xy"):
    q = p - c
    if plane == "xy":
        a, b, z = q[..., 0], q[..., 1], q[..., 2]
    elif plane == "xz":
        a, b, z = q[..., 0], q[..., 2], q[..., 1]
    else:
        a, b, z = q[..., 2], q[..., 1], q[..., 0]
    return length2(length2(a, b) - R, z) - r


def backdrop(p):
    return smin(p[..., 1], 3.2 - p[..., 2], 1.6)


# ----------------------------------------------------------------------------- scenes
# Each scene returns a list of (distance, material-id) parts. Material ids index MATERIALS.


def drape(p, height, radius, folds, amp, twist=0.0, thick=0.012):
    """A length of cloth settled over a hidden mound: radial folds widening towards the hem."""
    x, z = p[..., 0], p[..., 2]
    r = length2(x, z)
    th = np.arctan2(z, x)
    mound = height * np.exp(-((r / radius) ** 2) * 1.6)
    a = amp * np.clip(r / radius, 0, 1.4) ** 1.2
    fold = a * (0.6 * np.sin(folds * th + r * 2.5 + twist) + 0.4 * np.sin(folds * 1.7 * th - r * 3.1 + 1.3))
    h = mound + fold * np.exp(-((r / (radius * 1.25)) ** 6))
    h = np.maximum(h, 0.0)
    sheet = (np.abs(p[..., 1] - h) - thick) * 0.45
    # a finite hem with a gently wavy edge, so the cloth ends on the studio floor
    hem = r - radius * (1.45 + 0.06 * np.sin(folds * th + 0.5))
    return np.maximum(sheet, hem * 0.7)


def wrinkles(p, amp):
    return amp * (np.sin(7.1 * p[..., 0] + 2.3 * p[..., 2]) * np.sin(5.3 * p[..., 2] - 1.7 * p[..., 0]) + 0.5 * np.sin(13.0 * p[..., 0] - 9.0 * p[..., 2]))


def folded(p, c, size, layers=2, crease=True):
    """Neatly folded garment(s): soft, pillowed layers with rolled front folds and light creasing."""
    sx, sy, sz = size
    parts = []
    for i in range(layers):
        cc = np.array([c[0] + 0.03 * i, c[1] + sy + 2 * sy * i * 0.95, c[2] - 0.02 * i])
        q = p - cc
        # pillowing: thicker in the middle than at the edges, like folded cloth
        puff = sy * (1 + 0.35 * (1 - np.clip((q[..., 0] / sx) ** 2 + (q[..., 2] / sz) ** 2, 0, 1)))
        body = np.maximum(np.abs(q[..., 0]) - sx, np.abs(q[..., 2]) - sz)
        body = length2(np.maximum(body + sy * 0.9, 0), np.maximum(np.abs(q[..., 1]) - puff + sy * 0.9, 0)) - sy * 0.9 + np.minimum(np.maximum(body + sy * 0.9, np.abs(q[..., 1]) - puff + sy * 0.9), 0)
        if crease:
            roll = length2(q[..., 1], q[..., 2] + sz) - sy * 1.15
            roll = np.maximum(roll, np.abs(q[..., 0]) - sx + sy)
            body = smin(body, roll, 0.05)
        parts.append(body - wrinkles(p, 0.012) * (q[..., 1] > 0))
    return np.minimum.reduce(parts)


def scene_parts(kind, p):
    if kind == "hat":
        r = length2(p[..., 0], p[..., 2])
        sag = 0.06 * np.clip(r - 0.6, 0, None) ** 2
        brim = np.maximum(np.abs(p[..., 1] - 0.06 + sag) - 0.025, r - 1.45) * 0.8
        crown = cyl(p, 0.62 - 0.08 * np.clip(p[..., 1] - 0.1, 0, 1), 0.3, 0.12, 0.06)
        band = np.maximum(cyl(p, 0.64, 0.06, 0.01, 0.1), -cyl(p, 0.6, 0.2, 0, 0))
        return [(smin(brim, crown, 0.06), 1), (band, 4)]
    if kind == "cap":
        crown = ellipsoid(p, np.array([0, 0.0, 0]), (0.78, 0.72, 0.85))
        crown = np.maximum(crown, -p[..., 1] + 0.02)
        pz = p[..., 2] + 0.55
        peak = np.maximum(np.abs(p[..., 1] - 0.06 + 0.12 * np.clip(-pz, 0, 1) ** 2) - 0.022, ellipsoid(p, np.array([0, 0.06, -0.75]), (0.62, 1.0, 0.62)))
        peak = np.maximum(peak, p[..., 2] + 0.45)
        button = ellipsoid(p, np.array([0, 0.73, 0]), (0.07, 0.035, 0.07))
        return [(smin(crown, peak, 0.03), 1), (button, 1)]
    if kind == "tophandle":
        body = rbox(p, np.array([0, 0.6, 0]), (0.85, 0.6, 0.32), 0.12)
        flap = rbox(p, np.array([0, 0.92, -0.33]), (0.84, 0.3, 0.02), 0.02)
        handle = torus(p, np.array([0, 1.28, 0]), 0.42, 0.055, "xy")
        handle = np.maximum(handle, -(p[..., 1] - 1.2))
        clasp = rbox(p, np.array([0, 0.66, -0.37]), (0.08, 0.1, 0.03), 0.02)
        strap = rbox(p, np.array([0, 0.95, -0.36]), (0.05, 0.28, 0.012), 0.01)
        return [(smin(body, flap, 0.02), 1), (handle, 1), (strap, 1), (clasp, 3)]
    if kind == "messenger":
        q = rot_y(p, 0.25)
        body = rbox(q, np.array([0, 0.5, 0]), (1.05, 0.5, 0.28), 0.14)
        flap = rbox(q, np.array([0, 0.72, -0.29]), (1.04, 0.32, 0.02), 0.03)
        buckle = rbox(q, np.array([0, 0.52, -0.33]), (0.11, 0.07, 0.02), 0.01)
        strap = np.maximum(np.abs(q[..., 1] - 0.012) - 0.012, np.abs(length2(q[..., 0] + 0.3, q[..., 2] + 0.9) - 1.25) - 0.1)
        strap = np.maximum(strap, q[..., 2] + 0.05)
        return [(smin(body, flap, 0.02), 1), (strap, 2), (buckle, 3)]
    if kind == "tie":
        # a rolled tie: a fat coil with visible wraps, its blade tip resting in front
        r = length2(p[..., 0], p[..., 2])
        roll = cyl(p, 0.72, 0.27, 0.08)
        grooves = 0.012 * np.abs(np.sin(r * 34))
        roll = roll + grooves * (p[..., 1] > 0.5)
        hole = cyl(p, 0.1, 0.4, 0.02, 0.3)
        q = rot_y(p - np.array([0.1, 0, -0.95]), 0.35)
        blade = rbox(q, np.array([0, 0.018, 0]), (0.3, 0.018, 0.5), 0.015)
        blade = np.maximum(blade, q[..., 2] - 0.15 + 1.4 * np.abs(q[..., 0]))  # pointed tip
        return [(np.maximum(smin(roll, blade, 0.05), -hole), 1)]
    if kind == "socks":
        a = ellipsoid(p, np.array([-0.32, 0.32, 0]), (0.36, 0.32, 0.62))
        b = ellipsoid(p, np.array([0.34, 0.3, 0.08]), (0.36, 0.3, 0.6))
        return [(smin(a, b, 0.05), 1)]
    if kind == "trainer":
        q = rot_y(p, -0.45)  # toe points to +x
        sole = rbox(q, np.array([0, 0.12, 0]), (1.28, 0.12, 0.46), 0.06)
        sole = sole - 0.012 * (np.sin(q[..., 0] * 22) > 0.6) * (np.abs(q[..., 1] - 0.16) < 0.12)
        body = ellipsoid(q, np.array([0.0, 0.26, 0]), (1.22, 0.4, 0.42))
        heel = ellipsoid(q, np.array([-0.62, 0.5, 0]), (0.58, 0.46, 0.4))
        upper = np.maximum(smin(body, heel, 0.2), -(q[..., 1] - 0.2))
        collar = ellipsoid(q, np.array([-0.5, 0.98, 0]), (0.36, 0.14, 0.28))
        upper = np.maximum(upper, -collar)
        tongue = ellipsoid(q, np.array([-0.12, 0.8, 0]), (0.32, 0.1, 0.2))
        laces = np.minimum.reduce([
            rbox(q, np.array([0.38 - 0.16 * i, 0.68 + 0.035 * i, 0]), (0.022, 0.02, 0.28), 0.015) for i in range(4)
        ])
        return [(sole, 2), (smin(upper, tongue, 0.06), 1), (laces, 4)]
    if kind == "tee":
        base = folded(p, (0, 0, 0), (0.95, 0.07, 0.78), 2)
        # ribbed crew neck on the top layer
        neck = torus(p, np.array([0, 0.42, 0.35]), 0.3, 0.035, "xz")
        neck = np.maximum(neck, p[..., 2] - 0.35)
        return [(smin(base, neck, 0.03), 1)]
    if kind == "shorts":
        base = folded(p, (0, 0, 0), (0.85, 0.09, 0.72), 2)
        cord = np.minimum(
            length2(p[..., 1] - 0.5, length2(p[..., 0] - 0.18, p[..., 2] + 0.55) - 0.12) - 0.016,
            length2(p[..., 1] - 0.5, length2(p[..., 0] + 0.08, p[..., 2] + 0.62) - 0.1) - 0.016,
        )
        return [(base, 1), (cord, 4)]
    if kind == "trouser":
        base = folded(p, (0, 0, 0), (0.7, 0.08, 1.05), 3)
        crease = rbox(p, np.array([0, 0.66, 0]), (0.008, 0.012, 0.95), 0.006)
        return [(smin(base, crease, 0.02), 1)]
    if kind == "blazer":
        base = folded(p, (0, 0, 0), (1.0, 0.1, 0.82), 1)
        top = 0.27
        # turned-down collar band across the back and a row of buttons
        collar = rbox(p, np.array([0, top + 0.01, 0.58]), (0.62, 0.035, 0.14), 0.035)
        buttons = np.minimum(cyl(p - np.array([0.0, 0, -0.2]), 0.06, 0.014, 0.012, top), cyl(p - np.array([0.0, 0, -0.5]), 0.06, 0.014, 0.012, top))
        pocket = rbox(p, np.array([0.55, top, -0.35]), (0.22, 0.01, 0.035), 0.01)
        return [(smin(base, np.minimum(collar, pocket), 0.03), 1), (buttons, 4)]
    if kind == "gown":
        return [(drape(p, 0.95, 1.25, 11, 0.12, 0.4), 1)]
    if kind == "lehenga":
        return [(drape(p, 0.95, 1.35, 14, 0.11, 1.1, 0.016), 5)]
    if kind == "dupatta":
        q = rot_y(p, 0.35) / 1.25
        x, z = q[..., 0], q[..., 2]
        h = 0.12 + 0.1 * np.sin(2.6 * x + 0.8 * z) + 0.06 * np.sin(4.1 * z - 1.3 * x + 0.7) + 0.03 * np.sin(7.3 * x + 3.1 * z)
        sheet = (np.abs(q[..., 1] - np.maximum(h, 0.01)) - 0.01) * 0.45
        edge = np.maximum(np.abs(x) - 1.45, np.abs(z) - 0.95)
        return [(np.maximum(sheet, edge), 6)]
    if kind == "bodysuit":
        return [(drape(p, 0.55, 1.1, 8, 0.08, 2.0, 0.012), 1)]
    if kind == "candle":
        outer = cyl(p, 0.62, 0.55, 0.06)
        inner = cyl(p - np.array([0, 0.18, 0]), 0.54, 0.6, 0.04)
        wax = cyl(p, 0.545, 0.47, 0.02)
        wick = cyl(p - np.array([0, 0.9, 0]), 0.012, 0.07)
        return [(np.maximum(outer, -inner), 1), (wax, 7), (wick, 8)]
    if kind == "vase":
        y = np.clip(p[..., 1], 0, 2.4)
        t = y / 2.4
        r = 0.34 + 0.36 * np.sin(np.pi * np.clip(t * 1.12, 0, 1)) ** 1.1
        r = np.where(t > 0.88, 0.2 + (t - 0.88) * 0.6, np.maximum(r, 0.2))
        d = np.maximum((length2(p[..., 0], p[..., 2]) - r) * 0.7, np.maximum(-p[..., 1], p[..., 1] - 2.4))
        return [(np.maximum(d, -cyl(p - np.array([0, 2.2, 0]), 0.13, 0.3)), 1)]
    if kind == "perfume":
        bottle = rbox(p, np.array([0, 0.78, 0]), (0.58, 0.78, 0.3), 0.12)
        collar = cyl(p - np.array([0, 1.52, 0]), 0.16, 0.08, 0.02)
        capd = cyl(p - np.array([0, 1.66, 0]), 0.3, 0.3, 0.05)
        return [(bottle, 1), (collar, 3), (capd, 2)]
    if kind == "mug":
        outer = cyl(p, 0.6, 0.62, 0.05)
        inner = cyl(p - np.array([0, 0.12, 0]), 0.53, 0.7, 0.03)
        handle = torus(p, np.array([0.62, 0.66, 0]), 0.3, 0.07, "xy")
        handle = np.maximum(handle, -(length2(p[..., 0], p[..., 2]) - 0.58))
        return [(np.minimum(np.maximum(outer, -inner), handle), 1)]
    if kind in ("group1", "group2"):
        # monochrome still-life groupings for wide editorial shots
        layout = {
            "group1": [("tophandle", (-1.7, 0.6, 0.15)), ("hat", (1.5, 0, 0.9)), ("perfume", (0.15, 0, -0.55))],
            "group2": [("messenger", (-1.5, 0.3, 0.3)), ("vase", (1.3, -0.4, 0.8)), ("mug", (0.45, 0.4, -1.0))],
        }[kind]
        parts = []
        for sub, (x, ang, z) in layout:
            q = rot_y(p - np.array([x, 0, z]), ang)
            parts += scene_parts(sub, q)
        return parts
    if kind == "drapewide":
        x, z = p[..., 0], p[..., 2]
        h = 0.35 + 0.28 * np.sin(1.3 * x + 0.4) + 0.14 * np.sin(2.9 * x - 1.1 * z) + 0.07 * np.sin(6.1 * x + 2.3 * z)
        h = h * np.clip(1.6 - 0.25 * np.abs(z), 0, 1)
        return [((np.abs(p[..., 1] - np.maximum(h, 0)) - 0.02) * 0.4, 1)]
    raise ValueError(kind)


# ----------------------------------------------------------------------------- materials


def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]) ** 2.2


def value_noise(p, scale):
    q = p * scale
    i = np.floor(q)
    f = q - i
    f = f * f * (3 - 2 * f)

    def h(ix, iy, iz):
        n = (ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791)
        return ((n * 1103515245 + 12345) & 0xFFFF) / 65535.0

    ii = i.astype(np.int64)
    x, y, z = ii[..., 0], ii[..., 1], ii[..., 2]
    fx, fy, fz = f[..., 0], f[..., 1], f[..., 2]
    c = {}
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                c[dx, dy, dz] = h(x + dx, y + dy, z + dz)
    lerp = lambda a, b, t: a + (b - a) * t
    x00 = lerp(c[0, 0, 0], c[1, 0, 0], fx)
    x10 = lerp(c[0, 1, 0], c[1, 1, 0], fx)
    x01 = lerp(c[0, 0, 1], c[1, 0, 1], fx)
    x11 = lerp(c[0, 1, 1], c[1, 1, 1], fx)
    return lerp(lerp(x00, x10, fy), lerp(x01, x11, fy), fz)


TEXTURES = {
    "twill": lambda p: np.sin(110 * (p[..., 0] + p[..., 1] * 0.7 + p[..., 2] * 0.4)) * 0.5,
    "knit": lambda p: np.abs(np.sin(90 * p[..., 0])) * 0.6 + 0.3 * np.sin(45 * p[..., 2] + 30 * p[..., 1]),
    "leather": lambda p: value_noise(p, 38) + 0.5 * value_noise(p, 90),
    "raffia": lambda p: np.sin(70 * np.arctan2(p[..., 2], p[..., 0])) * 0.4 + 0.4 * np.sin(60 * length2(p[..., 0], p[..., 2])),
    "satin": lambda p: 0.15 * value_noise(p, 6),
    "none": None,
}


def material_table(kind, color):
    c = hexrgb(color)
    fabric = {
        "hat": "raffia", "cap": "twill", "tee": "knit", "shorts": "twill", "trouser": "twill", "blazer": "twill",
        "socks": "knit", "bodysuit": "knit", "gown": "satin", "tophandle": "leather", "messenger": "leather",
        "trainer": "leather", "tie": "satin", "group1": "leather", "group2": "leather",
    }.get(kind, "none")
    gloss = {
        "hat": 0.05, "cap": 0.1, "tee": 0.05, "shorts": 0.08, "trouser": 0.12, "blazer": 0.12, "socks": 0.04,
        "bodysuit": 0.25, "gown": 0.2, "tophandle": 0.55, "messenger": 0.45, "trainer": 0.4, "tie": 0.9,
        "dupatta": 0.3, "lehenga": 0.15, "drapewide": 0.45, "group1": 0.5, "group2": 0.5,
    }.get(kind, 0.9 if kind in ("perfume", "candle") else 0.55)
    return {
        1: dict(albedo=c, gloss=gloss, tex=fabric, bump=0.35 if fabric != "none" else 0, sheen=0.6 if kind in ("lehenga",) else 0.0),
        2: dict(albedo=c * 0.75 + 0.01, gloss=0.2, tex="leather" if kind == "trainer" else "none", bump=0.15, sheen=0),
        3: dict(albedo=np.array([0.62, 0.45, 0.22]), gloss=1.6, tex="none", bump=0, sheen=0, metal=True),
        4: dict(albedo=c * 0.45, gloss=0.3, tex="twill", bump=0.2, sheen=0),
        5: dict(albedo=c, gloss=0.12, tex="satin", bump=0.1, sheen=0.9, embroidery=True),
        6: dict(albedo=c * 1.05, gloss=0.35, tex="satin", bump=0.1, sheen=0.4, embroidery="border"),
        7: dict(albedo=np.array([0.62, 0.5, 0.44]), gloss=0.15, tex="none", bump=0, sheen=0),
        8: dict(albedo=np.array([0.02, 0.015, 0.015]), gloss=0, tex="none", bump=0, sheen=0),
    }


# ----------------------------------------------------------------------------- render


def render(kind, color, bg, out, rot=0.5, wide=False, preview=False):
    global SS
    W, H = (1600, 900) if wide else (960, 1200)
    if preview:
        W, H, SS = W * 3 // 10, H * 3 // 10, 1.0
    mats = material_table(kind, color)

    def scene(p):
        parts = scene_parts(kind, p)
        d0 = backdrop(p)
        ds = np.stack([d0] + [d for d, _ in parts], -1)
        ids = np.array([0] + [m for _, m in parts])
        k = ds.argmin(-1)
        return ds.min(-1), ids[k]

    w, h = int(W * SS), int(H * SS)
    dist = 7.6 if kind.startswith("group") else 9.0 if wide or kind in ("gown", "lehenga", "bodysuit", "dupatta") else 7.0
    cam = np.array([np.sin(rot) * dist, 2.6 if kind in ("gown", "lehenga", "dupatta", "tee", "shorts", "trouser", "blazer", "drapewide") else 2.3, -np.cos(rot) * dist])
    ty = {"vase": 1.15, "perfume": 1.0, "gown": 0.7, "lehenga": 0.65, "bodysuit": 0.45, "dupatta": 0.3, "tee": 0.25,
          "shorts": 0.25, "trouser": 0.35, "blazer": 0.25, "socks": 0.35, "tie": 0.3, "hat": 0.4, "cap": 0.4,
          "trainer": 0.5, "tophandle": 0.9, "messenger": 0.6, "drapewide": 0.45, "group1": 0.75, "group2": 0.75}.get(kind, 0.95)
    target = np.array([0, ty, 0])
    fw = norm(target - cam)
    rt = norm(np.cross(np.array([0, 1, 0]), fw))
    up = np.cross(fw, rt)
    fov = np.tan(np.radians(15 if not wide else 17))
    ys, xs = np.mgrid[0:h, 0:w]
    u = (xs + 0.5) / w * 2 - 1
    v = 1 - (ys + 0.5) / h * 2
    dirs = norm(fw + u[..., None] * rt * fov * (w / h) + v[..., None] * up * fov).reshape(-1, 3)
    n = dirs.shape[0]
    t = np.zeros(n)
    hit = np.zeros(n, bool)
    alive = np.ones(n, bool)
    for _ in range(200):
        idx = np.where(alive)[0]
        if idx.size == 0:
            break
        d, _ = scene(cam + dirs[idx] * t[idx, None])
        t[idx] += d
        done = d < 1e-3
        hit[idx[done]] = True
        alive[idx[done | (t[idx] > 40)]] = False
    p = cam + dirs * t[:, None]
    _, mat = scene(p)
    e = 1e-3
    nrm = norm(np.stack([scene(p + np.eye(3)[i] * e)[0] - scene(p - np.eye(3)[i] * e)[0] for i in range(3)], -1))

    # material detail: bump-map the normal with each material's texture
    albedo = np.tile(hexrgb(bg), (n, 1))
    gloss = np.zeros(n)
    sheen = np.zeros(n)
    metal = np.zeros(n, bool)
    for mid, m in mats.items():
        sel = mat == mid
        if not sel.any():
            continue
        albedo[sel] = m["albedo"]
        gloss[sel] = m["gloss"]
        sheen[sel] = m["sheen"]
        metal[sel] = m.get("metal", False)
        tex = TEXTURES.get(m["tex"])
        if tex is not None and m["bump"] > 0:
            ps = p[sel]
            eps = 2e-3
            base = tex(ps)
            g = np.stack([(tex(ps + np.eye(3)[i] * eps) - base) / eps for i in range(3)], -1)
            nn = nrm[sel]
            g = g - nn * (g * nn).sum(-1, keepdims=True)
            nrm[sel] = norm(nn - m["bump"] * 0.004 * g)
            # woven/knit textures also modulate colour slightly, like real cloth
            albedo[sel] *= (0.9 + 0.1 * (base - base.min()) / (np.ptp(base) + 1e-6))[:, None]
        emb = m.get("embroidery")
        if emb:
            ps = p[sel]
            r = length2(ps[:, 0], ps[:, 2])
            th = np.arctan2(ps[:, 2], ps[:, 0])
            if emb == "border":
                q = rot_y(ps, 0.35)
                edge_d = np.minimum(1.45 - np.abs(q[:, 0]), 0.95 - np.abs(q[:, 2]))
                motif = ((edge_d > 0.06) & (edge_d < 0.16) & (np.abs(np.sin(40 * (q[:, 0] + q[:, 2]))) > 0.5)) | (value_noise(ps, 26) > 0.94)
            else:
                # zari: a narrow border just inside the hem, a second band above it, and a
                # scatter of small sequins/butis across the velvet
                hem_r = 1.35 * (1.45 + 0.06 * np.sin(14 * th + 0.5))
                to_hem = hem_r - r
                border = (to_hem > 0.05) & (to_hem < 0.13)
                band2 = (to_hem > 0.32) & (to_hem < 0.36)
                butis = (value_noise(ps * np.array([1, 0.6, 1]), 26) > 0.86) & (value_noise(ps, 70) > 0.55)
                motif = border | band2 | butis
            gold = np.array([0.42, 0.27, 0.09])
            a = albedo[sel]
            a[motif] = gold
            albedo[sel] = a
            g2 = gloss[sel]
            g2[motif] = 1.4
            gloss[sel] = g2

    key = norm(np.array([-0.55, 0.75, -0.45]))
    res = np.ones(n)
    st = np.full(n, 0.02)
    origin = p + nrm * 2e-3
    for _ in range(64):
        d, _ = scene(origin + key * st[:, None])
        res = np.minimum(res, 9 * np.maximum(d, 0) / st)
        st += np.clip(d, 0.01, 0.25)
    shadow = np.clip(res, 0, 1) ** 1.3
    ao = np.zeros(n)
    for i in range(1, 6):
        hh = 0.07 * i
        d, _ = scene(p + nrm * hh)
        ao += (hh - d) / (2 ** i)
    ao = np.clip(1 - 2.2 * ao, 0, 1)

    ndl = np.clip((nrm * key).sum(-1), 0, 1)
    fill = np.clip((nrm * norm(np.array([0.7, 0.3, -0.6]))).sum(-1), 0, 1)
    sky = 0.5 + 0.5 * nrm[:, 1]
    vdir = -dirs
    half = norm(key + vdir)
    ndv = np.clip((nrm * vdir).sum(-1), 0, 1)
    spec_pow = np.where(metal, 40, np.where(gloss > 0.5, 70, 18))
    spec = np.clip((nrm * half).sum(-1), 0, 1) ** spec_pow
    fres = 0.04 + 0.96 * (1 - ndv) ** 5
    is_obj = mat != 0
    lin = albedo * (3.2 * ndl[:, None] * shadow[:, None] + 0.12 * fill[:, None] + 0.22 * sky[:, None] * ao[:, None])
    # velvet: brightening at grazing angles
    lin += (albedo * sheen[:, None]) * ((1 - ndv) ** 2.5 * 1.4 * (0.4 + 0.6 * shadow))[:, None]
    spec_col = np.where(metal[:, None], albedo * 2.2, 1.0)
    lin += spec_col * ((gloss * (2.2 * spec * shadow + 0.5 * fres * sky * ao)) * is_obj)[:, None]
    fall = 0.35 + 0.9 * np.exp(-(p[:, 0] ** 2) / (7 if not wide else 16) - ((p[:, 1] - 0.6) ** 2) / 5 - (np.maximum(p[:, 2], 0) ** 2) / 30)
    lin = np.where(is_obj[:, None], lin, lin * fall[:, None])
    lin = np.where(hit[:, None], lin, hexrgb(bg) * 0.6)
    x = np.maximum(lin * 0.62, 0)
    mapped = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)
    img = (np.clip(mapped, 0, 1) ** (1 / 2.2)).reshape(h, w, 3)
    im = Image.fromarray((img * 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)
    rng = np.random.default_rng(7)
    arr = np.clip(np.asarray(im).astype(float) + rng.normal(0, 2.2, (H, W, 1)), 0, 255).astype(np.uint8)
    Image.fromarray(arr).save(out, quality=88, optimize=True, progressive=True)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    kind, color, bg, out = args[:4]
    rot = float(args[4]) if len(args) > 4 else 0.5
    render(kind, color, bg, out, rot, wide="--wide" in sys.argv, preview="--preview" in sys.argv)
