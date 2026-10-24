"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { shadeById } from "@/data/shades";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";

interface Props {
  product: Product;
  priority?: boolean;
  sizes?: string;
  tone?: "light" | "dark";
}

export function ProductCard({ product, priority, sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw", tone = "light" }: Props) {
  const { add } = useCart();
  const [picking, setPicking] = useState(false);
  const shade = shadeById[product.shade];
  const single = product.sizes.length === 1;
  const [primary, secondary] = product.images;

  const quickAdd = () => {
    if (single) add(product.slug, product.sizes[0]);
    else setPicking((v) => !v);
  };

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-burgundy">
        <Link href={`/product/${product.slug}`} className="absolute inset-0" aria-label={product.name}>
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-[1.03]"
          />
          {secondary && (
            <Image
              src={secondary.src}
              alt=""
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 max-md:hidden"
            />
          )}
        </Link>

        {/* Quick add: hover reveals it on pointer devices; always reachable on touch and keyboard. */}
        <div
          className={`absolute inset-x-0 bottom-0 transition-all duration-500 ease-[var(--ease-luxe)] ${
            picking
              ? "translate-y-0 opacity-100"
              : "md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
          }`}
        >
          {picking ? (
            <div className="bg-bone/95 p-3 text-charcoal backdrop-blur" role="group" aria-label={`Choose a size for ${product.name}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="eyebrow text-stone">Select size</span>
                <button type="button" onClick={() => setPicking(false)} aria-label="Close size picker" className="p-1 hover:opacity-60">
                  <CloseIcon width={14} height={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      add(product.slug, s);
                      setPicking(false);
                    }}
                    className="min-w-10 border border-charcoal/20 px-2 py-1.5 text-xs transition-colors hover:border-charcoal hover:bg-charcoal hover:text-bone"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={quickAdd}
              className="eyebrow flex w-full items-center justify-center gap-2 bg-bone/90 py-3 text-charcoal backdrop-blur transition-colors hover:bg-bone max-md:absolute max-md:bottom-2 max-md:right-2 max-md:size-9 max-md:w-9 max-md:rounded-full max-md:p-0"
              aria-label={single ? `Add ${product.name} to bag` : `Quick add ${product.name}`}
            >
              <PlusIcon width={14} height={14} />
              <span className="max-md:sr-only">{single ? "Add to bag" : "Quick add"}</span>
            </button>
          )}
        </div>
      </div>

      <div className={`mt-4 flex items-start justify-between gap-3 ${tone === "dark" ? "text-bone" : "text-charcoal"}`}>
        <div className="min-w-0">
          <h3 className="font-serif text-[1.05rem] leading-snug">
            <Link href={`/product/${product.slug}`} className="hover:underline hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className={`mt-1 flex items-center gap-2 text-xs ${tone === "dark" ? "text-bone/60" : "text-stone"}`}>
            <span className="size-2 rounded-full" style={{ background: shade.hex }} aria-hidden />
            {shade.name}
          </p>
        </div>
        <p className="shrink-0 text-sm tabular-nums">{formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
