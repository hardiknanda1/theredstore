"use client";

import { useState } from "react";
import type { Product } from "@/data/products";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

export function ProductPurchase({ product }: { product: Product }) {
  const { add } = useCart();
  const single = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(single ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);

  const submit = () => {
    if (!size) {
      setError(true);
      return;
    }
    add(product.slug, size, qty);
    setQty(1);
  };

  return (
    <div className="space-y-7">
      {!single && (
        <fieldset aria-describedby={error ? "size-error" : undefined}>
          <div className="mb-3 flex items-center justify-between">
            <legend className="eyebrow">Size</legend>
            {size && <span className="text-xs text-stone">Selected: {size}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <label key={s} className="cursor-pointer">
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={size === s}
                  onChange={() => {
                    setSize(s);
                    setError(false);
                  }}
                  className="peer sr-only"
                />
                <span
                  className={`inline-block min-w-14 border px-3 py-3 text-center text-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-charcoal ${
                    size === s ? "border-charcoal bg-charcoal text-bone" : "border-charcoal/20 hover:border-charcoal"
                  }`}
                >
                  {s}
                </span>
              </label>
            ))}
          </div>
          {error && (
            <p id="size-error" role="alert" className="mt-3 text-sm text-crimson">
              Please choose a size.
            </p>
          )}
        </fieldset>
      )}

      <div className="flex items-stretch gap-3">
        <QuantityStepper value={qty} onChange={setQty} label={product.name} allowZero={false} />
        <button
          type="button"
          onClick={submit}
          className="eyebrow flex-1 bg-crimson py-4 text-bone transition-colors hover:bg-burgundy"
        >
          Add to bag
        </button>
      </div>
      <p className="text-xs leading-relaxed text-stone">
        Complimentary shipping over $500 · Returns within 30 days · Each piece ships in RED packaging
      </p>
    </div>
  );
}
