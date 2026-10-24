import Link from "next/link";
import { siteConfig } from "@/config/site";
import { categories } from "@/data/products";
import { shades } from "@/data/shades";

export function Footer() {
  return (
    <footer className="bg-ink text-bone">
      <div className="container-luxe grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-4">
          <p className="font-serif text-5xl tracking-[0.3em]">{siteConfig.brandName}</p>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone/60">{siteConfig.description}</p>
        </div>

        <nav aria-label="Shop" className="md:col-span-2">
          <h2 className="eyebrow text-bone/50">Shop</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/shop" className="hover:text-scarlet">
                All pieces
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.id}`} className="hover:text-scarlet">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Shades" className="md:col-span-2">
          <h2 className="eyebrow text-bone/50">The Red Spectrum</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {shades.map((s) => (
              <li key={s.id}>
                <Link href={`/shop?shade=${s.id}`} className="group inline-flex items-center gap-2.5 hover:text-scarlet">
                  <span className="size-2.5 rounded-full ring-1 ring-bone/20" style={{ background: s.hex }} aria-hidden />
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="House" className="md:col-span-2">
          <h2 className="eyebrow text-bone/50">The House</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/story" className="hover:text-scarlet">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-scarlet">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-scarlet">
                Checkout
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="eyebrow text-bone/50">Studio</h2>
          <address className="mt-5 space-y-1 text-sm not-italic text-bone/80">
            {siteConfig.contact.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <a href={`mailto:${siteConfig.contact.email}`} className="mt-3 block break-all hover:text-scarlet">
              {siteConfig.contact.email}
            </a>
          </address>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {siteConfig.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="text-bone/60 hover:text-bone">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-bone/10">
        <div className="container-luxe flex flex-col gap-2 py-6 text-xs text-bone/40 md:flex-row md:justify-between">
          <p>© 2026 {siteConfig.legalName}. All pieces are red.</p>
          <p>Demonstration storefront: no orders are fulfilled and no payments are taken.</p>
        </div>
      </div>
    </footer>
  );
}
