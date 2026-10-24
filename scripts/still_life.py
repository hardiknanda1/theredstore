"""Studio still-life renderer (SDF raymarching in numpy) for lifestyle product shots.

Usage: python3 scripts/still_life.py <candle|vase|perfume|mug> <object-hex> <backdrop-hex> <out.jpg> [angle]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H, SS = 960, 1200, 1.5


def norm(v):
    return v / np.linalg.norm(v, axis=-1, keepdims=True)


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def sd_capped_cyl(p, r, h, round_=0.0):
    # cylinder centred at y=h, half-height h, radius r (resting on y=0)
    q = np.stack([np.hypot(p[..., 0], p[..., 2]) - r + round_, np.abs(p[..., 1] - h) - h + round_], -1)
    return np.minimum(np.maximum(q[..., 0], q[..., 1]), 0) + np.linalg.norm(np.maximum(q, 0), axis=-1) - round_


def sd_box(p, c, b, r):
    q = np.abs(p - c) - b + r
    return np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(q.max(-1), 0) - r


def sd_torus_xy(p, c, R, r):
    q = p - c
    a = np.hypot(q[..., 0], q[..., 1]) - R
    return np.hypot(a, q[..., 2]) - r


def backdrop(p):
    return smin(p[..., 1], 3.2 - p[..., 2], 1.6)


def make_scene(kind):
    def obj(p):
        if kind == 'candle':
            outer = sd_capped_cyl(p, 0.62, 0.55, 0.06)
            inner = sd_capped_cyl(p - np.array([0, 0.18, 0]), 0.54, 0.6, 0.04)
            vessel = np.maximum(outer, -inner)
            wax = sd_capped_cyl(p, 0.545, 0.47, 0.02)
            wick = sd_capped_cyl(p - np.array([0, 0.9, 0]), 0.012, 0.07, 0.0)
            d = np.stack([vessel, wax, wick], -1)
            return d.min(-1), d.argmin(-1) + 1
        if kind == 'vase':
            y = np.clip(p[..., 1], 0, 2.4)
            t = y / 2.4
            r = 0.34 + 0.36 * np.sin(np.pi * np.clip(t * 1.12, 0, 1)) ** 1.1
            r = np.where(t > 0.88, 0.2 + (t - 0.88) * 0.6, np.maximum(r, 0.2))
            body = (np.hypot(p[..., 0], p[..., 2]) - r) * 0.7
            cap = np.maximum(-p[..., 1], p[..., 1] - 2.4)
            d = np.maximum(body, cap)
            hole = sd_capped_cyl(p - np.array([0, 2.2, 0]), 0.13, 0.3)
            d = np.maximum(d, -hole)
            return d, np.ones_like(d, dtype=int)
        if kind == 'perfume':
            bottle = sd_box(p, np.array([0, 0.78, 0]), np.array([0.58, 0.78, 0.3]), 0.12)
            collar = sd_capped_cyl(p - np.array([0, 1.52, 0]), 0.16, 0.08, 0.02)
            capd = sd_capped_cyl(p - np.array([0, 1.66, 0]), 0.3, 0.3, 0.05)
            d = np.stack([bottle, collar, capd], -1)
            return d.min(-1), np.array([1, 3, 2])[d.argmin(-1)]
        if kind == 'mug':
            outer = sd_capped_cyl(p, 0.6, 0.62, 0.05)
            inner = sd_capped_cyl(p - np.array([0, 0.12, 0]), 0.53, 0.7, 0.03)
            cup = np.maximum(outer, -inner)
            handle = sd_torus_xy(p, np.array([0.62, 0.66, 0]), 0.3, 0.07)
            handle = np.maximum(handle, -(np.hypot(p[..., 0], p[..., 2]) - 0.58))
            d = np.minimum(cup, handle)
            return d, np.ones_like(d, dtype=int)
        raise ValueError(kind)

    def scene(p):
        d1, m1 = obj(p)
        d0 = backdrop(p)
        m = np.where(d0 < d1, 0, m1)
        return np.minimum(d0, d1), m

    return scene


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]) ** 2.2


def render(kind, color, bg, out, rot=0.5):
    scene = make_scene(kind)
    w, h = int(W * SS), int(H * SS)
    cam = np.array([2.6 * np.sin(rot), 2.5, -6.6 * np.cos(rot) - 0.0])
    cam = np.array([np.sin(rot) * 7.0, 2.4, -np.cos(rot) * 7.0])
    target = np.array([0, 0.95 if kind != 'vase' else 1.15, 0])
    fw = norm(target - cam)
    rt = norm(np.cross(np.array([0, 1, 0]), fw))
    up = np.cross(fw, rt)
    fov = np.tan(np.radians(15))
    ys, xs = np.mgrid[0:h, 0:w]
    u = (xs + 0.5) / w * 2 - 1
    v = 1 - (ys + 0.5) / h * 2
    dirs = norm(fw + u[..., None] * rt * fov * (w / h) + v[..., None] * up * fov)
    dirs = dirs.reshape(-1, 3)
    n = dirs.shape[0]
    t = np.zeros(n)
    hit = np.zeros(n, bool)
    alive = np.ones(n, bool)
    for _ in range(160):
        idx = np.where(alive)[0]
        if idx.size == 0:
            break
        p = cam + dirs[idx] * t[idx, None]
        d, _ = scene(p)
        t[idx] += d
        done = d < 1e-3
        hit[idx[done]] = True
        alive[idx[done | (t[idx] > 40)]] = False
    p = cam + dirs * t[:, None]
    _, mat = scene(p)
    e = 1e-3
    nrm = norm(np.stack([
        scene(p + np.array([e, 0, 0]))[0] - scene(p - np.array([e, 0, 0]))[0],
        scene(p + np.array([0, e, 0]))[0] - scene(p - np.array([0, e, 0]))[0],
        scene(p + np.array([0, 0, e]))[0] - scene(p - np.array([0, 0, e]))[0]], -1))

    key = norm(np.array([-0.55, 0.75, -0.45]))
    # soft shadow toward key light
    res = np.ones(n)
    st = np.full(n, 0.02)
    origin = p + nrm * 2e-3
    for _ in range(64):
        d, _ = scene(origin + key * st[:, None])
        res = np.minimum(res, 9 * np.maximum(d, 0) / st)
        st += np.clip(d, 0.01, 0.25)
    shadow = np.clip(res, 0, 1) ** 1.3
    # ambient occlusion
    ao = np.zeros(n)
    for i in range(1, 6):
        hh = 0.07 * i
        d, _ = scene(p + nrm * hh)
        ao += (hh - d) / (2 ** i)
    ao = np.clip(1 - 2.2 * ao, 0, 1)

    col_obj = hexrgb(color)
    col_bg = hexrgb(bg)
    albedo = np.where((mat == 0)[:, None], col_bg, col_obj)
    albedo = np.where((mat == 2)[:, None], col_obj * 1.25 + 0.03, albedo)  # wax / cap: lighter
    albedo = np.where((mat == 3)[:, None], np.array([0.55, 0.42, 0.25]), albedo)  # wick/collar: brass
    if kind == 'candle':
        albedo = np.where((mat == 3)[:, None], np.array([0.03, 0.02, 0.02]), albedo)
        albedo = np.where((mat == 2)[:, None], np.array([0.85, 0.78, 0.72]) * col_obj / col_obj.max() * 0.6 + 0.25, albedo)

    ndl = np.clip((nrm * key).sum(-1), 0, 1)
    fill = np.clip((nrm * norm(np.array([0.7, 0.3, -0.6]))).sum(-1), 0, 1)
    sky = 0.5 + 0.5 * nrm[:, 1]
    vdir = -dirs
    half = norm(key + vdir)
    spec = np.clip((nrm * half).sum(-1), 0, 1) ** 70
    fres = 0.04 + 0.96 * (1 - np.clip((nrm * vdir).sum(-1), 0, 1)) ** 5
    is_obj = mat != 0
    lin = albedo * (3.2 * ndl[:, None] * shadow[:, None] + 0.12 * fill[:, None] + 0.22 * sky[:, None] * ao[:, None])
    gloss = np.where(is_obj, 0.9, 0.0)
    if kind == 'mug' or kind == 'vase':
        gloss = np.where(is_obj, 0.55, 0.0)
    lin += (gloss * (2.2 * spec * shadow + 0.5 * fres * sky * ao))[:, None]
    # gentle vignette-like falloff on the backdrop
    fall = 0.35 + 0.9 * np.exp(-(p[:, 0] ** 2) / 7 - ((p[:, 1] - 0.6) ** 2) / 5 - (np.maximum(p[:, 2], 0) ** 2) / 30)
    lin = np.where(is_obj[:, None], lin, lin * fall[:, None])
    lin = np.where(hit[:, None], lin, col_bg * 0.6)
    # filmic tonemap
    x = np.maximum(lin * 0.62, 0)
    mapped = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)
    img = np.clip(mapped, 0, 1) ** (1 / 2.2)
    img = (img.reshape(h, w, 3) * 255).astype(np.uint8)
    im = Image.fromarray(img).resize((W, H), Image.LANCZOS)
    # subtle film grain for photographic texture
    rng = np.random.default_rng(7)
    g = rng.normal(0, 2.2, (H, W, 1))
    arr = np.clip(np.asarray(im).astype(float) + g, 0, 255).astype(np.uint8)
    Image.fromarray(arr).save(out, quality=88, optimize=True, progressive=True)


if __name__ == '__main__':
    kind, color, bg, out = sys.argv[1:5]
    rot = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5
    render(kind, color, bg, out, rot)
