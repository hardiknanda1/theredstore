import { productBySlug } from "@/data/products";

export interface CartLine {
  slug: string;
  size: string;
  qty: number;
}

const KEY = "red-cart-v1";
export const MAX_QTY = 10;
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

/** Drops anything that no longer matches the catalogue (removed products or sizes). */
function sanitize(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return EMPTY;
  return input.flatMap((l) => {
    const product = productBySlug[l?.slug];
    if (!product || !product.sizes.includes(l.size)) return [];
    const qty = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(l.qty)) || 1));
    return [{ slug: l.slug, size: l.size, qty }];
  });
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    lines = sanitize(JSON.parse(window.localStorage.getItem(KEY) ?? "[]"));
  } catch {
    lines = EMPTY;
  }
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private mode); the cart still works for this session.
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  try {
    lines = sanitize(JSON.parse(e.newValue ?? "[]"));
  } catch {
    lines = EMPTY;
  }
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot() {
    load();
    return lines;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  add(slug: string, size: string, qty = 1) {
    load();
    const existing = lines.find((l) => l.slug === slug && l.size === size);
    commit(
      existing
        ? lines.map((l) => (l === existing ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
        : [...lines, { slug, size, qty: Math.min(MAX_QTY, qty) }],
    );
  },
  setQty(slug: string, size: string, qty: number) {
    if (qty < 1) return cartStore.remove(slug, size);
    commit(lines.map((l) => (l.slug === slug && l.size === size ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)));
  },
  remove(slug: string, size: string) {
    commit(lines.filter((l) => !(l.slug === slug && l.size === size)));
  },
  clear() {
    commit(EMPTY);
  },
};
