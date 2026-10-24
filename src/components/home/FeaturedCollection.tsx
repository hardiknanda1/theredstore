import Link from "next/link";
import { categories, products } from "@/data/products";
import { ProductCard } from "@/components/shop/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon } from "@/components/ui/icons";

export function FeaturedCollection() {
  const featured = [...products].sort((a, b) => a.featured - b.featured).slice(0, 8);
  return (
    <section aria-labelledby="collection-title" className="bg-bone py-20 md:py-32">
      <div className="container-luxe">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-crimson">The Collection</p>
            <h2 id="collection-title" className="display mt-5 text-5xl md:text-7xl">
              Pieces from the film
            </h2>
          </div>
          <nav aria-label="Shop by category">
            <ul className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.id}`}
                    className="eyebrow inline-block border border-charcoal/15 px-4 py-2.5 transition-colors hover:border-charcoal hover:bg-charcoal hover:text-bone"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-16 md:gap-x-6 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={(i % 4) * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </ul>

        <div className="mt-16 flex justify-center">
          <Link
            href="/shop"
            className="eyebrow group inline-flex items-center gap-3 border-b border-charcoal pb-1.5 hover:text-crimson"
          >
            View all {products.length} pieces
            <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
