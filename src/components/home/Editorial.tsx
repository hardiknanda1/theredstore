import Image from "next/image";
import Link from "next/link";
import { edit, productBySlug } from "@/data/products";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon } from "@/components/ui/icons";

/** The Edit: one wide story about the cloth, then four portrait entry points into the collection. */
export function Editorial() {
  const { lead, cards } = edit;
  return (
    <section aria-labelledby="edit-title" className="bg-charcoal py-20 text-bone md:py-32">
      <div className="container-luxe">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-scarlet">The Edit</p>
            <h2 id="edit-title" className="display mt-5 text-5xl md:text-7xl">
              Submerged in red
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-bone/60">
            Tailoring, leather, ceremony and objects for the home. Four ways into a collection made in one colour.
          </p>
        </div>

        <Reveal className="mt-12 md:mt-16">
          <Link href={lead.href} className="group relative block aspect-[4/5] overflow-hidden sm:aspect-video">
            <Image
              src={lead.image.src}
              alt={lead.image.alt}
              fill
              sizes="(min-width: 1440px) 1312px, 100vw"
              className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10">
              <div>
                <p className="eyebrow text-bone/70">{lead.eyebrow}</p>
                <p className="display mt-3 text-4xl md:text-6xl">{lead.title}</p>
                <p className="mt-3 max-w-md text-sm text-bone/80">{lead.copy}</p>
              </div>
              <span className="eyebrow inline-flex items-center gap-3 border-b border-bone pb-1.5">
                {lead.cta}
                <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>

        <ul className="mt-4 grid grid-cols-2 gap-4 md:mt-6 md:gap-6 lg:grid-cols-4">
          {cards.map((c, i) => {
            const image = productBySlug[c.slug].images[0];
            return (
              <Reveal as="li" key={c.title} delay={i * 0.08}>
                <Link href={c.href} className="group block">
                  <span className="relative block aspect-[4/5] overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.03]"
                    />
                  </span>
                  <span className="mt-4 block">
                    <span className="display block text-2xl md:text-3xl">{c.title}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-bone/60">{c.copy}</span>
                    <span className="eyebrow mt-4 inline-flex items-center gap-2 text-bone/80 group-hover:text-scarlet">
                      {c.cta}
                      <ArrowIcon width={14} height={14} />
                    </span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
