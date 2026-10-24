import { FRAME_COUNT, frameUrl, type FrameSet } from "./sequence";

/**
 * Coarse-to-fine load order: the first and last frames, then every 32nd, 16th … frame.
 * Any scroll position soon has a nearby frame to show, and detail fills in progressively.
 */
function loadOrder(count: number): number[] {
  const order: number[] = [0, count - 1];
  const seen = new Set(order);
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

/**
 * Loads and decodes the film frames off the main thread (img.decode), a few at a time,
 * and keeps the decoded images for instant drawing.
 */
export class FrameCache {
  readonly frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
  loaded = 0;
  private disposed = false;
  private pending = new Set<HTMLImageElement>();

  constructor(
    private readonly set: FrameSet,
    private readonly onFrame: (index: number) => void,
    private readonly concurrency = 6,
  ) {}

  start() {
    const queue = loadOrder(FRAME_COUNT);
    // Frame 1 alone first, so the opening picture appears as early as possible.
    const first = queue.shift()!;
    this.load(first).finally(() => {
      for (let i = 0; i < this.concurrency; i++) void this.worker(queue);
    });
  }

  private async worker(queue: number[]) {
    while (!this.disposed && queue.length) {
      await this.load(queue.shift()!);
    }
  }

  private async load(index: number) {
    if (this.disposed) return;
    const img = new Image();
    img.decoding = "async";
    img.src = frameUrl(this.set, index);
    this.pending.add(img);
    try {
      await img.decode();
      if (this.disposed) return;
      this.frames[index] = img;
      this.loaded++;
      this.onFrame(index);
    } catch {
      // A failed frame is skipped; nearestLoaded() bridges the gap with a neighbour.
    } finally {
      this.pending.delete(img);
    }
  }

  /** The requested frame if it is ready, otherwise the closest decoded frame. */
  nearestLoaded(index: number): { img: HTMLImageElement; index: number } | null {
    // The final title frame is never borrowed to stand in for a film frame.
    const last = FRAME_COUNT - 1;
    for (let d = 0; d < FRAME_COUNT; d++) {
      const i = index - d;
      const j = index + d;
      const a = this.frames[i];
      if (a && (i !== last || index === last)) return { img: a, index: i };
      const b = this.frames[j];
      if (b && (j !== last || index === last)) return { img: b, index: j };
    }
    return null;
  }

  dispose() {
    this.disposed = true;
    for (const img of this.pending) img.src = "";
    this.pending.clear();
    this.frames.fill(null);
  }
}
