"use client";

import { useEffect, useRef, useState } from "react";
import { ptSerif } from "@/lib/fonts";
import { FrameCache } from "@/lib/hero/frame-cache";
import {
  FRAME_COUNT,
  PIN_VH,
  TIMELINE_LENGTH,
  computeLayout,
  drawLockup,
  drawWallText,
  featherEdges,
  frameIndexFor,
  paintBackdrop,
  sourceRect,
  type FrameSet,
  type Rect,
} from "@/lib/hero/sequence";
import { siteConfig } from "@/config/site";

/** Fraction of the remaining distance covered per animation frame when easing to the scroll position. */
const EASE = 0.24;

function pickFrameSet(): FrameSet {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const smallScreen = Math.min(window.screen.width, window.screen.height) < 768;
  return smallScreen || conn?.saveData ? "mobile" : "desktop";
}

/**
 * Scroll-scrubbed campaign film. The section is PIN_VH taller than the viewport; while it
 * scrolls past, a sticky canvas maps scroll progress onto the 180 supplied frames, holds the
 * final frame for HOLD_FRAMES, and draws the wall typography and THE RED COMPANY lockup.
 */
export function HeroSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [firstFrame, setFirstFrame] = useState(false);
  const [atStart, setAtStart] = useState(true);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    if (!section || !sticky || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const family = ptSerif.style.fontFamily;
    let vw = 0;
    let vh = 0;
    let layout: Rect = { x: 0, y: 0, w: 0, h: 0 };
    let dirty = true;
    let raf = 0;
    let running = false;
    let lastT = -1;
    let lastSource = -1;
    let startFlag = true;

    const readTarget = () => {
      const total = section.offsetHeight - sticky.offsetHeight;
      if (total <= 0) return 0;
      const p = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
      return p * TIMELINE_LENGTH;
    };
    let t = readTarget();

    const cache = new FrameCache(pickFrameSet(), (index) => {
      setLoaded(cache.loaded);
      if (index === 0) setFirstFrame(true);
      // Redraw if the newly decoded frame is closer to the one we should be showing.
      const want = frameIndexFor(t);
      if (Math.abs(index - want) < Math.abs(lastSource - want) || lastSource < 0) dirty = true;
      if (!running) draw();
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      vw = rect.width;
      vh = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = computeLayout(vw, vh);
      dirty = true;
      draw();
    };

    const draw = () => {
      if (!vw || !vh) return;
      const index = frameIndexFor(t);
      const found = cache.nearestLoaded(index);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      paintBackdrop(ctx, vw, vh, layout);
      if (found) {
        const s = sourceRect(found.index, found.img);
        ctx.drawImage(found.img, s.sx, s.sy, s.sw, s.sh, layout.x, layout.y, layout.w, layout.h);
        lastSource = found.index;
      }
      featherEdges(ctx, vw, vh, layout);
      if (index < FRAME_COUNT - 1) {
        drawWallText(ctx, layout, index, family);
      } else if (found?.index === FRAME_COUNT - 1) {
        drawLockup(ctx, layout, t, family);
      }
      lastT = t;
      dirty = false;
    };

    const tick = () => {
      const target = readTarget();
      const diff = target - t;
      t = reduceMotion || Math.abs(diff) < 0.02 ? target : t + diff * EASE;
      if (dirty || t !== lastT) draw();
      const nowStart = target < 1.5;
      if (nowStart !== startFlag) {
        startFlag = nowStart;
        setAtStart(nowStart);
      }
      if (running) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      rootMargin: "100px 0px",
    });
    io.observe(section);

    cache.start();
    // Repaint once the display face is ready so the wall type and lockup use PT Serif.
    Promise.all([
      document.fonts.load(`400 48px ${family}`),
      document.fonts.load(`italic 400 48px ${family}`),
    ])
      .then(() => {
        dirty = true;
        if (!running) draw();
      })
      .catch(() => {});

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      cache.dispose();
    };
  }, []);

  const pct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label={`${siteConfig.legalName} campaign film`}
      className="relative bg-oxblood"
      style={{ height: `calc(100svh + ${PIN_VH}vh)` }}
    >
      <h1 className="sr-only">
        {siteConfig.legalName} — {siteConfig.tagline}
      </h1>
      <div ref={stickyRef} className="sticky top-0 h-svh w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="A model in a white gown stands in a deep red studio. A red figure emerges from behind the wall, merges into her, and her look changes through a red thread gown, streetwear, tailoring and a bridal lehenga, ending on the words The Red Company."
          className="block h-full w-full"
        />

        {/* Loading state: shown until the first frame is decoded. */}
        <div
          aria-hidden={firstFrame}
          className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-oxblood transition-opacity duration-700 ${
            firstFrame ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="display text-4xl tracking-[0.3em] text-bone/80">RED</span>
        </div>

        {/* Preload progress and scroll cue. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-5 text-bone/70 md:px-10 md:pb-8">
          <span
            className={`eyebrow transition-opacity duration-700 ${pct < 100 ? "opacity-100" : "opacity-0"}`}
            aria-live="polite"
          >
            {pct < 100 ? `Loading film ${pct}%` : "Film ready"}
          </span>
          <span
            className={`eyebrow flex items-center gap-3 transition-opacity duration-700 ${
              atStart ? "opacity-100" : "opacity-0"
            }`}
          >
            Scroll
            <span className="relative block h-8 w-px overflow-hidden bg-bone/20">
              <span className="absolute inset-x-0 top-0 h-3 animate-[cue_2.2s_var(--ease-luxe)_infinite] bg-bone motion-reduce:animate-none" />
            </span>
          </span>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-bone/10"
          aria-hidden
        >
          <div
            className="h-full bg-bone/60 transition-[width] duration-300"
            style={{ width: `${pct}%`, opacity: pct < 100 ? 1 : 0 }}
          />
        </div>
      </div>
    </section>
  );
}
