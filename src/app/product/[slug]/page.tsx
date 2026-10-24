import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, productBySlug, products } from "@/data/products";
import { shadeById } from "@/data/shades";
import { relatedProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductCard } from "@/components/shop/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug[slug];
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.summary,
    openGraph: { images: [product.images[0].src] },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = productBySlug[slug];
  if (!product) notFound();

  const shade = shadeById[product.shade];
  const category = categories.find((c) => c.id === product.category)!;
  const related = relatedProducts(product);

  return (
    <>
      <div className="bg-oxblood pt-16 md:pt-20" />
      <div className="container-luxe py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="eyebrow text-stone">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/shop" className="hover:text-charcoal">
                Shop
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/shop?category=${category.id}`} className="hover:text-charcoal">
                {category.label}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-charcoal">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <h1 className="display text-5xl md:text-6xl">{product.name}</h1>
              <p className="mt-4 text-lg text-graphite">{product.summary}</p>
              <p className="mt-6 font-serif text-3xl tabular-nums">{formatPrice(product.price)}</p>

              <Link
                href={`/shop?shade=${shade.id}`}
                className="group mt-6 flex items-center gap-4 border hairline p-3 transition-colors hover:border-charcoal"
              >
                <span className="h-12 w-12 shrink-0" style={{ background: shade.hex }} aria-hidden />
                <span className="flex-1">
                  <span className="eyebrow block text-stone">Shade</span>
                  <span className="font-serif text-lg">{shade.name}</span>
                  <span className="ml-2 text-xs text-stone tabular-nums">{shade.hex}</span>
                </span>
                <span className="eyebrow pr-2 text-stone group-hover:text-charcoal">All {shade.name} →</span>
              </Link>

              <div className="mt-8">
                <ProductPurchase product={product} />
              </div>

              <p className="mt-10 text-sm leading-relaxed text-graphite">{product.description}</p>

              <div className="mt-8 divide-y divide-charcoal/10 border-y hairline">
                <details className="group py-4" open>
                  <summary className="eyebrow flex cursor-pointer list-none items-center justify-between">
                    Details <span className="transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-graphite">
                    {product.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </details>
                <details className="group py-4">
                  <summary className="eyebrow flex cursor-pointer list-none items-center justify-between">
                    Composition &amp; care <span className="transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-graphite">{product.composition}</p>
                  <p className="mt-2 text-sm text-graphite">
                    Store away from direct sunlight to protect the colour. Professional clean recommended for tailoring and embroidery.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="eyebrow flex cursor-pointer list-none items-center justify-between">
                    Shipping &amp; returns <span className="transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-sm text-graphite">
                    Complimentary express shipping on orders over $500. Returns accepted within 30 days in original condition; made-to-order pieces are final sale.
                  </p>
                </details>
              </div>

            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="related-title" className="border-t hairline py-16 md:py-24">
        <div className="container-luxe">
          <h2 id="related-title" className="display text-4xl md:text-5xl">
            Wear it with
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
