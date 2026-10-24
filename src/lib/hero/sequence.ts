import { WALL_DRIFT } from "./wall-track";

/** Number of frames in the supplied film (frame-0001 … frame-180, sorted numerically). */
export const FRAME_COUNT = 180;
/** Extra scroll, in frame units, during which the final frame is held for the title lockup. */
export const HOLD_FRAMES = 20;
export const TIMELINE_LENGTH = FRAME_COUNT + HOLD_FRAMES;
/** The hero stays pinned for this much scroll (in viewport heights). */
export const PIN_VH = 350;

export type FrameSet = "desktop" | "mobile";

export function frameUrl(set: FrameSet, index: number): string {
  const n = String(index + 1).padStart(3, "0");
  return set === "desktop" ? `/frames/desktop/f${n}.jpg` : `/frames/mobile/f${n}.webp`;
}

/** Aspect ratio of the film. */
export const FILM_ASPECT = 16 / 9;

/**
 * Frame 180 was exported at 1920×1080 with a 5px white strip along the top and an 11px
 * strip down the right edge (plus a pixel or two of compression ringing). We sample only the
 * clean picture area (as fractions, so the
 * same crop applies to the downsized mobile set).
 */
export function sourceRect(index: number, img: HTMLImageElement) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (index === FRAME_COUNT - 1) {
    return { sx: 0, sy: (h * 7) / 1080, sw: (w * 1906) / 1920, sh: (h * 1073) / 1080 };
  }
  return { sx: 0, sy: 0, sw: w, sh: h };
}

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
const FOCUS_X = 0.45;
const FOCUS_Y = 0.5;

/**
 * Where the film is drawn inside a viewport of vw×vh CSS pixels. Wide screens get a
 * full-bleed cover crop; narrow/portrait screens scale down just enough to keep the safe
 * region in view, and the remaining space is filled with the studio's wall and floor tones.
 */
export function computeLayout(vw: number, vh: number): Rect {
  const coverH = Math.max(vh, vw / FILM_ASPECT);
  const fitH = Math.min(
    vw / ((SAFE.right - SAFE.left) * FILM_ASPECT),
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
    x: place(vw, w, FOCUS_X, SAFE.left, SAFE.right, 0.5),
    y: place(vh, h, FOCUS_Y, SAFE.top, SAFE.bottom, 0.42),
    w,
    h,
  };
}

/** Studio tones used to extend the picture on screens narrower than the film. */
export const STUDIO_TOP = "#3d0508";
export const STUDIO_BOTTOM = "#9c151b";

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export interface DrawState {
  /** Continuous timeline position in frame units: 0 … TIMELINE_LENGTH. */
  t: number;
  frameIndex: number;
}

export function frameIndexFor(t: number) {
  return Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(t)));
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
 * "Make the RED statement" set on the left wall (the pillar face) for frames 1–179.
 * Coordinates are in film space and follow the measured wall drift, so the type stays
 * fixed to the wall at every frame and every viewport size.
 */
export function drawWallText(
  ctx: CanvasRenderingContext2D,
  r: Rect,
  frameIndex: number,
  family: string,
) {
  const drift = WALL_DRIFT[frameIndex] ?? 0;
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

/**
 * Ink box of the white serif "E" already present in frame 180, measured in pixels of the
 * cleaned 1906×1073 picture and expressed as fractions.
 */
const E_BOX = {
  left: 852 / 1906,
  right: 956 / 1906,
  top: 447 / 1073,
  baseline: 596 / 1073,
};

export const LOCKUP_RED_COLOR = "#3b030a";
export const LOCKUP_WORD_COLOR = "#f6ece4";

/**
 * Final lockup: deep-red R and D drawn either side of the film's own E (which is left
 * untouched), with THE above and COMPANY below. Sizes are derived from the E's measured cap
 * height and PT Serif's own metrics so baseline, scale and spacing match.
 */
export function drawLockup(ctx: CanvasRenderingContext2D, r: Rect, t: number, family: string) {
  const reveal = smoothstep(FRAME_COUNT + 0.5, FRAME_COUNT + 8, t);
  const words = smoothstep(FRAME_COUNT + 5, FRAME_COUNT + 15, t);
  if (reveal <= 0 && words <= 0) return;

  const capPx = (E_BOX.baseline - E_BOX.top) * r.h;
  const inkLeft = r.x + E_BOX.left * r.w;
  const inkRight = r.x + E_BOX.right * r.w;
  const baseline = r.y + E_BOX.baseline * r.h;

  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 100px ${family}`;
  const capRatio = ctx.measureText("E").actualBoundingBoxAscent / 100 || 0.7;
  const size = capPx / capRatio;
  ctx.font = `400 ${size}px ${family}`;

  const mE = ctx.measureText("E");
  // Fit the measured E ink width to the film's E so spacing is derived from the same scale.
  const inkW = mE.actualBoundingBoxLeft + mE.actualBoundingBoxRight;
  const xScale = inkW > 0 ? (inkRight - inkLeft) / inkW : 1;
  const originE = inkLeft + mE.actualBoundingBoxLeft * xScale;
  const advE = mE.width * xScale;
  const advR = (ctx.measureText("RE").width - mE.width) * xScale;
  const advD = ctx.measureText("D").width * xScale;
  const kernED = (ctx.measureText("ED").width - mE.width - ctx.measureText("D").width) * xScale;

  // A touch of display tracking so the serifs of R and E do not collide.
  const track = capPx * 0.035;
  const glide = (1 - reveal) * capPx * 0.08;
  ctx.globalAlpha = reveal;
  ctx.fillStyle = LOCKUP_RED_COLOR;
  ctx.fillText("R", originE - advR - track - glide, baseline);
  ctx.fillText("D", originE + advE + kernED + track + glide, baseline);

  // THE / COMPANY, centred on the full RED word.
  const mR = ctx.measureText("R");
  const mD = ctx.measureText("D");
  const left = originE - advR - track - mR.actualBoundingBoxLeft;
  const right = originE + advE + kernED + track + Math.min(advD, mD.actualBoundingBoxRight);
  const cx = (left + right) / 2;

  const wordSize = size * 0.24;
  ctx.font = `400 ${wordSize}px ${family}`;
  const wordCap = ctx.measureText("T").actualBoundingBoxAscent;
  const gap = capPx * 0.3;
  const rise = (1 - words) * capPx * 0.06;
  ctx.globalAlpha = words;
  ctx.fillStyle = LOCKUP_WORD_COLOR;
  fillTracked(ctx, "THE", cx, baseline - capPx - gap + rise, wordSize * 0.42, "center");
  fillTracked(ctx, "COMPANY", cx, baseline + gap + wordCap - rise, wordSize * 0.42, "center");
  ctx.restore();
}
