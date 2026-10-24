import { STUDIO_DRIFT, WALL_DRIFT } from "./wall-track";

/**
 * Timeline of the hero, in frame units (one unit = one frame of scroll):
 *
 *   0 – 144   film frames 1–144, exactly as supplied
 *   144 – 179 frames 145–179: the lehenga still, framed like the film (cross-faded in from frame 144)
 *   150 – 152 OBSESSED fades in over it
 *   179 – 191 the model and OBSESSED dissolve into the empty studio; the centre E stays
 *   189 – 207 R and D, then THE and COMPANY, form around the E
 *   207 – 215 hold
 */
export const FILM_FRAMES = 144;
export const LEHENGA_START = 144;
export const OBSESSED_START = 150;
export const FILM_END = 179;
const DISSOLVE = [FILM_END, FILM_END + 12] as const;
const RED_IN = [FILM_END + 10, FILM_END + 20] as const;
const WORDS_IN = [FILM_END + 16, FILM_END + 28] as const;
export const TIMELINE_LENGTH = FILM_END + 36;
/** The hero stays pinned for this much scroll (in viewport heights). */
export const PIN_VH = 350;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export type FrameSet = "desktop" | "mobile";
export type StillId = "lehenga" | "studio";

export function frameUrl(set: FrameSet, index: number): string {
  const n = String(index + 1).padStart(3, "0");
  return set === "desktop" ? `/frames/desktop/f${n}.jpg` : `/frames/mobile/f${n}.webp`;
}

export function stillUrl(set: FrameSet, id: StillId): string {
  return `/hero/${set}/${id}.webp`;
}

/**
 * OBSESSED is drawn as two alpha-matted layers over the lehenga still: the word without its
 * centre E, and that E on its own, which stays on screen while the rest dissolves.
 */
export const TYPE_SPRITE_URL = "/hero/type-sprite.png";
export const E_SPRITE_URL = "/hero/e-sprite.png";

/** Aspect ratio of the film. */
export const FILM_ASPECT = 16 / 9;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Region of the film that must always stay visible (fractions of the frame): the left wall
 * with its typography, the red figure's entrance, the model and the final lockup.
 */
const SAFE = { left: 0.02, right: 0.64, top: 0.04, bottom: 0.95 };
/** OBSESSED spans to 80% of the frame width, so the safe region widens before it appears. */
const SAFE_RIGHT_OBSESSED = 0.82;
const FOCUS_X = 0.45;
const FOCUS_Y = 0.5;

/**
 * Where the film is drawn inside a viewport of vw×vh CSS pixels. Wide screens get a
 * full-bleed cover crop; narrow/portrait screens scale down just enough to keep the safe
 * region in view, and the remaining space is filled with the studio's wall and floor tones.
 */
export function computeLayout(vw: number, vh: number, safeRight = SAFE.right): Rect {
  const coverH = Math.max(vh, vw / FILM_ASPECT);
  const fitH = Math.min(
    vw / ((safeRight - SAFE.left) * FILM_ASPECT),
    vh / (SAFE.bottom - SAFE.top),
  );
  const h = Math.min(coverH, fitH);
  const w = h * FILM_ASPECT;

  const place = (view: number, size: number, focus: number, lo: number, hi: number, slack: number) => {
    if (size <= view) return (view - size) * slack;
    // Cover the viewport while keeping the safe region [lo, hi] on screen.
    const min = Math.max(view - size, -lo * size);
    const max = Math.min(0, view - hi * size);
    const ideal = view / 2 - focus * size;
    return min > max ? (min + max) / 2 : Math.min(max, Math.max(min, ideal));
  };

  return {
    x: place(vw, w, FOCUS_X, SAFE.left, safeRight, 0.5),
    y: place(vh, h, FOCUS_Y, SAFE.top, SAFE.bottom, 0.42),
    w,
    h,
  };
}

/**
 * Right edge of the safe region at timeline position t: on narrow screens the picture eases
 * back during the lehenga still so that the whole of OBSESSED (and later the lockup) fits.
 * Wide screens are unaffected because their cover crop already shows it.
 */
export function safeRightFor(t: number) {
  return SAFE.right + (SAFE_RIGHT_OBSESSED - SAFE.right) * smoothstep(OBSESSED_START - 3, OBSESSED_START + 0.5, t);
}

/** Studio tones used to extend the picture on screens narrower than the film. */
export const STUDIO_TOP = "#3d0508";
export const STUDIO_BOTTOM = "#9c151b";


/** Index of the film frame (0-based) shown at timeline position t, within the original film. */
export function filmIndexFor(t: number) {
  return Math.min(FILM_FRAMES - 1, Math.max(0, Math.floor(t)));
}

export function paintBackdrop(ctx: CanvasRenderingContext2D, vw: number, vh: number, r: Rect) {
  if (r.y > 0.5 || r.y + r.h < vh - 0.5) {
    ctx.fillStyle = STUDIO_TOP;
    ctx.fillRect(0, 0, vw, r.y + r.h * 0.5);
    ctx.fillStyle = STUDIO_BOTTOM;
    ctx.fillRect(0, r.y + r.h * 0.5, vw, vh - (r.y + r.h * 0.5));
  }
  if (r.x > 0.5 || r.x + r.w < vw - 0.5) {
    ctx.fillStyle = STUDIO_TOP;
    ctx.fillRect(0, 0, vw, vh);
  }
}

/** Feathers the picture edges into the studio fill when the film does not cover the screen. */
export function featherEdges(ctx: CanvasRenderingContext2D, vw: number, vh: number, r: Rect) {
  const f = r.h * 0.08;
  if (r.y > 0.5) {
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + f);
    g.addColorStop(0, STUDIO_TOP);
    g.addColorStop(1, "rgba(61,5,8,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, r.y - 1, vw, f + 1);
  }
  if (r.y + r.h < vh - 0.5) {
    const g = ctx.createLinearGradient(0, r.y + r.h - f, 0, r.y + r.h);
    g.addColorStop(0, "rgba(156,21,27,0)");
    g.addColorStop(1, STUDIO_BOTTOM);
    ctx.fillStyle = g;
    ctx.fillRect(0, r.y + r.h - f, vw, f + 1);
  }
}

export interface HeroAssets {
  /** The requested film frame if decoded, otherwise the nearest decoded film frame. */
  film(index: number): HTMLImageElement | null;
  still(id: StillId): HTMLImageElement | null;
  typeSprite: HTMLImageElement | null;
  eSprite: HTMLImageElement | null;
}

function drawPicture(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, r: Rect, alpha = 1) {
  if (!img || alpha <= 0) return false;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(img, r.x, r.y, r.w, r.h);
  ctx.globalAlpha = 1;
  return true;
}

/**
 * Paints the picture for timeline position t and returns the wall drift to use for the
 * wall typography at that moment.
 */
export function drawScene(ctx: CanvasRenderingContext2D, r: Rect, t: number, a: HeroAssets): number {
  const lehenga = a.still("lehenga");

  if (t < LEHENGA_START) {
    const index = filmIndexFor(t);
    drawPicture(ctx, a.film(index), r);
    return WALL_DRIFT[index] ?? 0;
  }

  if (t < FILM_END) {
    // Frame 145 cross-fades from the film's frame 144 into the lehenga still.
    const mix = lehenga ? smoothstep(LEHENGA_START, LEHENGA_START + 1, t) : 0;
    if (mix < 1) drawPicture(ctx, a.film(FILM_FRAMES - 1), r);
    drawPicture(ctx, lehenga, r, mix);
    // OBSESSED fades in over the first two frames after 150.
    const typeIn = smoothstep(OBSESSED_START, OBSESSED_START + 2, t);
    drawType(ctx, r, a, typeIn, typeIn);
    const from = WALL_DRIFT[FILM_FRAMES - 1] ?? 0;
    const to = WALL_DRIFT[Math.min(Math.floor(t), FILM_END - 1)] ?? STUDIO_DRIFT;
    return from + (to - from) * mix;
  }

  // The model and OBSESSED dissolve into the empty studio; the centre E is held throughout.
  const studio = a.still("studio");
  const fade = studio ? smoothstep(DISSOLVE[0], DISSOLVE[1], t) : 0;
  if (!drawPicture(ctx, studio, r)) drawPicture(ctx, lehenga, r);
  drawPicture(ctx, lehenga, r, 1 - fade);
  drawType(ctx, r, a, 1 - fade, 1);
  return STUDIO_DRIFT;
}

/** Draws OBSESSED: the word (without its centre E) at `alpha`, and the E at `eAlpha`. */
function drawType(ctx: CanvasRenderingContext2D, r: Rect, a: HeroAssets, alpha: number, eAlpha: number) {
  if (alpha > 0 && a.typeSprite) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(a.typeSprite, r.x + TYPE.x * r.w, r.y + TYPE.y * r.h, TYPE.w * r.w, TYPE.h * r.h);
  }
  if (eAlpha > 0 && a.eSprite) {
    ctx.globalAlpha = eAlpha;
    ctx.drawImage(a.eSprite, r.x + E_SPRITE.x * r.w, r.y + E_SPRITE.y * r.h, E_SPRITE.w * r.w, E_SPRITE.h * r.h);
  }
  ctx.globalAlpha = 1;
}

/** Draws text with manual tracking (canvas letterSpacing is not universally supported). */
function fillTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: "left" | "center" = "left",
) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let cx = align === "center" ? x - total / 2 : x;
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + tracking;
  });
  return total;
}

/**
 * "Make the RED statement" set on the left wall (the pillar face) for the whole hero.
 * Coordinates are in film space and follow the measured wall drift, so the type stays
 * fixed to the wall at every frame and every viewport size.
 */
export function drawWallText(ctx: CanvasRenderingContext2D, r: Rect, drift: number, family: string) {
  const x = r.x + (0.043 + drift) * r.w;
  const at = (ny: number) => r.y + ny * r.h;
  const small = r.h * 0.044;
  const big = r.h * 0.128;

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(246, 236, 228, 0.94)";
  ctx.shadowColor = "rgba(20, 0, 2, 0.35)";
  ctx.shadowBlur = r.h * 0.006;
  ctx.shadowOffsetY = r.h * 0.002;

  ctx.font = `italic 400 ${small}px ${family}`;
  fillTracked(ctx, "Make the", x + big * 0.03, at(0.215), small * 0.02);

  ctx.font = `400 ${big}px ${family}`;
  fillTracked(ctx, "RED", x, at(0.338), big * 0.04);

  ctx.font = `italic 400 ${small}px ${family}`;
  fillTracked(ctx, "statement", x + big * 0.03, at(0.405), small * 0.02);
  ctx.restore();
}

/** The type was matted from the 1671×941 OBSESSED still; positions are in its pixels. */
const STILL_W = 1671;
const STILL_H = 941;
const TYPE = { x: 322 / STILL_W, y: 316 / STILL_H, w: 1040 / STILL_W, h: 158 / STILL_H };
const E_SPRITE = { x: 770 / STILL_W, y: 355 / STILL_H, w: 86 / STILL_W, h: 111 / STILL_H };
const E_INK = { left: 779 / STILL_W, right: 846 / STILL_W, top: 365 / STILL_H, baseline: 456 / STILL_H };
/** Ink gap between letters in OBSESSED, as a fraction of cap height (≈ 64px gaps at 91px caps). */
const TRACKING = 0.7;

export const LOCKUP_RED_COLOR = "#c1121f";
export const LOCKUP_WORD_COLOR = "#f6ece4";

/**
 * Final lockup around the E kept from OBSESSED: deep-red R and D set in the same Didone
 * (Noto Serif Display Bold, matched to the E) with OBSESSED's letter spacing, then THE above
 * and COMPANY below. Sizes come from the E's measured cap height.
 */
export function drawLockup(ctx: CanvasRenderingContext2D, r: Rect, t: number, family: string) {
  const reveal = smoothstep(RED_IN[0], RED_IN[1], t);
  const words = smoothstep(WORDS_IN[0], WORDS_IN[1], t);
  if (reveal <= 0 && words <= 0) return;

  const capPx = (E_INK.baseline - E_INK.top) * r.h;
  const inkLeft = r.x + E_INK.left * r.w;
  const inkRight = r.x + E_INK.right * r.w;
  const baseline = r.y + E_INK.baseline * r.h;

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 100px ${family}`;
  const capRatio = ctx.measureText("E").actualBoundingBoxAscent / 100 || 0.7;
  const size = capPx / capRatio;
  ctx.font = `700 ${size}px ${family}`;

  const gap = capPx * TRACKING;
  const glide = (1 - reveal) * capPx * 0.18;
  const mR = ctx.measureText("R");
  const mD = ctx.measureText("D");
  const rRight = inkLeft - gap;
  const dLeft = inkRight + gap;
  ctx.globalAlpha = reveal;
  ctx.fillStyle = LOCKUP_RED_COLOR;
  ctx.fillText("R", rRight - mR.actualBoundingBoxRight + glide, baseline);
  ctx.fillText("D", dLeft + mD.actualBoundingBoxLeft - glide, baseline);

  // THE / COMPANY, centred on the RED word.
  const left = rRight - (mR.actualBoundingBoxLeft + mR.actualBoundingBoxRight);
  const right = dLeft + (mD.actualBoundingBoxLeft + mD.actualBoundingBoxRight);
  const cx = (left + right) / 2;

  const wordSize = size * 0.3;
  ctx.font = `400 ${wordSize}px ${family}`;
  const wordCap = ctx.measureText("T").actualBoundingBoxAscent;
  const space = capPx * 0.42;
  const rise = (1 - words) * capPx * 0.1;
  ctx.globalAlpha = words;
  ctx.fillStyle = LOCKUP_WORD_COLOR;
  fillTracked(ctx, "THE", cx, baseline - capPx - space + rise, wordSize * 0.6, "center");
  fillTracked(ctx, "COMPANY", cx, baseline + space + wordCap - rise, wordSize * 0.6, "center");
  ctx.restore();
}
