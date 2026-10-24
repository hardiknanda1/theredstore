"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site";
import { shadeById } from "@/data/shades";
import { formatPrice } from "@/lib/format";
import { CloseIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { items, subtotal, count, isOpen, close, setQty, remove, lastAdded } = useCart();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [isOpen, close]);

  const remaining = siteConfig.freeShippingThreshold - subtotal;
  const added = lastAdded ? items.find((i) => i.slug === lastAdded.slug && i.size === lastAdded.size) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
        >
          <button
            type="button"
            aria-label="Close bag"
            tabIndex={-1}
            className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
            onClick={close}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bone text-charcoal shadow-2xl"
            initial={{ x: reduce ? 0 : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : "100%" }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b hairline px-6 py-5">
              <h2 id="cart-title" className="eyebrow">
                Your bag <span className="text-stone">({count})</span>
              </h2>
              <button ref={closeRef} type="button" onClick={close} className="-mr-2 p-2 hover:opacity-60" aria-label="Close bag">
                <CloseIcon />
              </button>
            </div>

            {added && (
              <p className="border-b hairline bg-sand/60 px-6 py-3 text-sm" role="status">
                Added <span className="font-medium">{added.product.name}</span>
                {added.size !== "One Size" && <> · {added.size}</>}
              </p>
            )}

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="display text-3xl">Your bag is empty.</p>
                <p className="max-w-xs text-sm text-stone">
                  Every piece we make is red. Start with the collection, or explore by shade.
                </p>
                <Link
                  href="/shop"
                  onClick={close}
                  className="eyebrow bg-crimson px-6 py-3.5 text-bone transition-colors hover:bg-burgundy"
                >
                  Shop collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-charcoal/10 overflow-y-auto px-6">
                  {items.map((item) => (
                    <li key={`${item.slug}-${item.size}`} className="flex gap-4 py-5">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={close}
                        className="relative block aspect-[4/5] w-20 shrink-0 overflow-hidden bg-sand"
                      >
                        <Image src={item.product.images[0].src} alt={item.product.images[0].alt} fill sizes="80px" className="object-cover" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/product/${item.slug}`} onClick={close} className="font-serif text-lg leading-tight hover:underline">
                            {item.product.name}
                          </Link>
                          <span className="text-sm tabular-nums">{formatPrice(item.lineTotal)}</span>
                        </div>
                        <p className="mt-1 flex items-center gap-2 text-xs text-stone">
                          <span className="size-2.5 rounded-full" style={{ background: shadeById[item.product.shade].hex }} aria-hidden />
                          {shadeById[item.product.shade].name} · {item.size}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <QuantityStepper
                            value={item.qty}
                            label={item.product.name}
                            onChange={(q) => setQty(item.slug, item.size, q)}
                          />
                          <button
                            type="button"
                            onClick={() => remove(item.slug, item.size)}
                            className="text-xs text-stone underline-offset-4 hover:text-charcoal hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-4 border-t hairline px-6 py-6">
                  <p className="text-xs text-stone">
                    {remaining > 0
                      ? `${formatPrice(remaining)} away from complimentary shipping.`
                      : "Your order ships complimentary."}
                  </p>
                  <div className="flex items-baseline justify-between">
                    <span className="eyebrow">Subtotal</span>
                    <span className="font-serif text-2xl tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="eyebrow flex w-full items-center justify-center bg-crimson py-4 text-bone transition-colors hover:bg-burgundy"
                  >
                    Checkout
                  </Link>
                  <button type="button" onClick={close} className="eyebrow w-full py-2 text-stone hover:text-charcoal">
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
