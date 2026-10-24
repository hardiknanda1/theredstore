import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopFallback, ShopView } from "@/components/shop/ShopView";

export const metadata: Metadata = {
  title: "Shop",
  description: "The full RED collection: apparel, streetwear, footwear, bags, accessories and lifestyle objects, every piece red.",
};

export default function ShopPage() {
  return (
    <>
      <header className="bg-oxblood pb-14 pt-32 text-bone md:pb-20 md:pt-44">
        <div className="container-luxe grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow text-scarlet">The Collection · AW26</p>
            <h1 className="display mt-5 text-6xl md:text-8xl">Shop RED</h1>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-bone/60 md:col-span-4 md:justify-self-end">
            Every piece from the film, in seven shades of red. Filter by category, shade, size or price.
          </p>
        </div>
      </header>
      <Suspense fallback={<ShopFallback />}>
        <ShopView />
      </Suspense>
    </>
  );
}
