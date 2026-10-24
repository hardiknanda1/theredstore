"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/data/products";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
    if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
      <ul className="flex gap-2 md:w-20 md:flex-col" role="tablist" aria-label={`${name} images`} onKeyDown={onKeyDown}>
        {images.map((img, i) => (
          <li key={img.src} role="presentation" className="w-16 md:w-full">
            <button
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls="product-image"
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              className={`relative block aspect-[4/5] w-full overflow-hidden transition-opacity ${
                i === index ? "opacity-100 ring-1 ring-charcoal ring-offset-2 ring-offset-bone" : "opacity-55 hover:opacity-100"
              }`}
            >
              <Image src={img.src} alt={`View ${i + 1}: ${img.alt}`} fill sizes="80px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <div id="product-image" role="tabpanel" className="relative aspect-[4/5] flex-1 overflow-hidden bg-burgundy" onKeyDown={onKeyDown}>
        {images.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== index}
          />
        ))}
        <p className="eyebrow absolute bottom-4 right-4 bg-ink/40 px-2.5 py-1.5 text-bone backdrop-blur" aria-live="polite">
          {index + 1} / {images.length}
          <span className="sr-only">: {current.alt}</span>
        </p>
      </div>
    </div>
  );
}
