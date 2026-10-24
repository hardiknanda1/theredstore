"use client";

import { useEffect, useRef, useState } from "react";
import { notoSerifDisplay, ptSerif } from "@/lib/fonts";
import { HeroAssetCache } from "@/lib/hero/frame-cache";
import {
  FILM_END,
  FILM_START,
  PIN_VH,
  computeLayout,
  safeRightFor,
  timelineAt,
  drawLockup,
  drawScene,
  drawWallText,
  featherEdges,
  paintBackdrop,
  type FrameSet,
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
 * scrolls past, a sticky canvas maps scroll progress onto the film (frames 1–144), the two
 * stills (145–150, 151–179), the dissolve to the E, and THE RED COMPANY lockup. The wall
 * typography is drawn throughout. See the timeline in lib/hero/sequence.ts.
 */
export function HeroSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [firstFrame, setFirstFrame] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    if (!section || !sticky || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wallFamily = ptSerif.style.fontFamily;
    const lockupFamily = notoSerifDisplay.style.fontFamily;
    let vw = 0;
    let vh = 0;
    let dirty = true;
    let raf = 0;
    let running = false;
    let lastT = -1;

    const readTarget = () => {
      const total = section.offsetHeight - sticky.offsetHeight;
      if (total <= 0) return 0;
      const p = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
      return timelineAt(p);
    };
    let t = readTarget();

    const cache = new HeroAssetCache(pickFrameSet(), () => {
      setProgress(cache.loaded / cache.total);
      if (cache.film(FILM_START)) setFirstFrame(true);
      // A newly decoded image may be closer to what this position should show.
      dirty = true;
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
      dirty = true;
      draw();
    };

    const draw = () => {
      if (!vw || !vh) return;
      const layout = computeLayout(vw, vh, safeRightFor(t));
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      paintBackdrop(ctx, vw, vh, layout);
      const drift = drawScene(ctx, layout, t, cache);
      featherEdges(ctx, vw, vh, layout);
      drawWallText(ctx, layout, drift, wallFamily);
      if (t > FILM_END) drawLockup(ctx, layout, t, lockupFamily);
      lastT = t;
      dirty = false;
    };

    const tick = () => {
      const target = readTarget();
      const diff = target - t;
      t = reduceMotion || Math.abs(diff) < 0.02 ? target : t + diff * EASE;
      if (dirty || t !== lastT) draw();
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
    // Repaint once the faces are ready so the wall type and lockup never use a fallback.
    Promise.all([
      document.fonts.load(`400 48px ${wallFamily}`),
      document.fonts.load(`italic 400 48px ${wallFamily}`),
      document.fonts.load(`700 48px ${lockupFamily}`),
      document.fonts.load(`400 48px ${lockupFamily}`),
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

  const pct = Math.round(progress * 100);

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
          aria-label="A model in a white gown stands in a deep red studio. A red figure emerges from behind the wall, merges into her, and her look changes through a red thread gown, streetwear, tailoring and a bridal lehenga. The word OBSESSED appears, then fades with her, leaving one E that becomes The Red Company."
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

        {/* Preload progress. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-5 text-bone/70 md:px-10 md:pb-8">
          <span
            className={`eyebrow transition-opacity duration-700 ${pct < 100 ? "opacity-100" : "opacity-0"}`}
            aria-live="polite"
          >
            {pct < 100 ? `Loading film ${pct}%` : "Film ready"}
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
