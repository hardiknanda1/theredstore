"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { productBySlug, type Product } from "@/data/products";
import { cartStore, type CartLine } from "@/lib/cart-store";

export interface CartItem extends CartLine {
  product: Product;
  lineTotal: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  /** The most recently added item, used for the drawer's confirmation line. */
  lastAdded: { slug: string; size: string } | null;
  open: () => void;
  close: () => void;
  add: (slug: string, size: string, qty?: number) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartContextValue["lastAdded"]>(null);

  const add = useCallback((slug: string, size: string, qty = 1) => {
    cartStore.add(slug, size, qty);
    setLastAdded({ slug, size });
    setIsOpen(true);
  }, []);
  const open = useCallback(() => {
    setLastAdded(null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const items = lines.map((l) => {
      const product = productBySlug[l.slug];
      return { ...l, product, lineTotal: product.price * l.qty };
    });
    return {
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.lineTotal, 0),
      isOpen,
      lastAdded,
      open,
      close,
      add,
      setQty: cartStore.setQty,
      remove: cartStore.remove,
      clear: cartStore.clear,
    };
  }, [lines, isOpen, lastAdded, open, close, add]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
