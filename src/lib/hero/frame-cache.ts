import { E_SPRITE_URL, FILM_FRAMES, frameUrl, stillUrl, type FrameSet, type HeroAssets, type StillId } from "./sequence";

/** Coarse-to-fine order: every 32nd, 16th … film frame, so any scroll position soon has a neighbour. */
function filmOrder(count: number): number[] {
  const order: number[] = [];
  const seen = new Set<number>([0]);
  for (let stride = 32; stride >= 1; stride /= 2) {
    for (let i = 0; i < count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  return order;
}

const STILLS: StillId[] = ["lehenga", "obsessed", "studio"];

/**
 * Loads and decodes the hero imagery (img.decode keeps decoding off the main thread), a few
 * at a time, and keeps the decoded images for instant drawing. Frame 1 loads first, then the
 * three stills and the E sprite, then the rest of the film coarse-to-fine.
 */
export class HeroAssetCache implements HeroAssets {
  private readonly frames: (HTMLImageElement | null)[] = new Array(FILM_FRAMES).fill(null);
  private readonly stills = new Map<StillId, HTMLImageElement>();
  eSprite: HTMLImageElement | null = null;
  loaded = 0;
  readonly total = FILM_FRAMES + STILLS.length + 1;
  private disposed = false;
  private pending = new Set<HTMLImageElement>();

  constructor(
    private readonly set: FrameSet,
    private readonly onLoad: () => void,
    private readonly concurrency = 6,
  ) {}

  start() {
    const jobs: (() => Promise<void>)[] = [
      ...STILLS.map((id) => () => this.load(stillUrl(this.set, id), (img) => this.stills.set(id, img))),
      () => this.load(E_SPRITE_URL, (img) => (this.eSprite = img)),
      ...filmOrder(FILM_FRAMES).map((i) => () => this.load(frameUrl(this.set, i), (img) => (this.frames[i] = img))),
    ];
    // Frame 1 alone first, so the opening picture appears as early as possible.
    this.load(frameUrl(this.set, 0), (img) => (this.frames[0] = img)).finally(() => {
      for (let i = 0; i < this.concurrency; i++) void this.worker(jobs);
    });
  }

  private async worker(jobs: (() => Promise<void>)[]) {
    while (!this.disposed && jobs.length) await jobs.shift()!();
  }

  private async load(url: string, store: (img: HTMLImageElement) => void) {
    if (this.disposed) return;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    this.pending.add(img);
    try {
      await img.decode();
      if (this.disposed) return;
      store(img);
      this.loaded++;
      this.onLoad();
    } catch {
      // A failed image is skipped; film() bridges gaps with a neighbouring frame.
    } finally {
      this.pending.delete(img);
    }
  }

  film(index: number): HTMLImageElement | null {
    for (let d = 0; d < FILM_FRAMES; d++) {
      const a = this.frames[index - d];
      if (a) return a;
      const b = this.frames[index + d];
      if (b) return b;
    }
    return null;
  }

  still(id: StillId): HTMLImageElement | null {
    return this.stills.get(id) ?? null;
  }

  dispose() {
    this.disposed = true;
    for (const img of this.pending) img.src = "";
    this.pending.clear();
    this.frames.fill(null);
    this.stills.clear();
    this.eSprite = null;
  }
}
