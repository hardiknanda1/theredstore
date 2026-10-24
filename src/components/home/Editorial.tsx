import Image from "next/image";
import Link from "next/link";
import { chapters } from "@/data/products";
import { frameUrl } from "@/lib/hero/sequence";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon } from "@/components/ui/icons";

const still = (frame: number) => frameUrl("desktop", frame - 1);

/** Campaign chapters drawn from the film: one wide opening still, then four portrait cards. */
export function Editorial() {
  const [lead, ...rest] = [chapters[1], chapters[0], chapters[2], chapters[3], chapters[4]];
  return (
    <section aria-labelledby="campaign-title" className="bg-charcoal py-20 text-bone md:py-32">
      <div className="container-luxe">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-scarlet">The Campaign</p>
            <h2 id="campaign-title" className="display mt-5 text-5xl md:text-7xl">
              Submerged in red
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-bone/60">
            Five chapters, one continuous take. A red figure steps out of the wall and the outfit keeps
            changing. Every look in it is in the collection.
          </p>
        </div>

        <Reveal className="mt-12 md:mt-16">
          <Link href={lead.shopHref} className="group relative block aspect-[4/5] overflow-hidden sm:aspect-video">
            <Image
              src={still(lead.frame)}
              alt={`Campaign still, chapter ${lead.numeral}: ${lead.title}`}
              fill
              sizes="(min-width: 1440px) 1312px, 100vw"
              className="object-cover object-[47%_50%] transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between md:p-10">
              <div>
                <p className="eyebrow text-bone/70">Chapter {lead.numeral}</p>
                <p className="display mt-3 text-4xl md:text-6xl">{lead.title}</p>
                <p className="mt-3 max-w-md text-sm text-bone/80">{lead.copy}</p>
              </div>
              <span className="eyebrow inline-flex items-center gap-3 border-b border-bone pb-1.5">
                {lead.shopLabel}
                <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </Reveal>

        <ul className="mt-4 grid grid-cols-2 gap-4 md:mt-6 md:gap-6 lg:grid-cols-4">
          {rest.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 0.08}>
              <Link href={c.shopHref} className="group block">
                <span className="relative block aspect-[4/5] overflow-hidden">
                  <Image
                    src={still(c.frame)}
                    alt={`Campaign still, chapter ${c.numeral}: ${c.title}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className={`object-cover transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.03] ${
                      c.id === "the-figure" ? "object-[40%_50%]" : "object-[47%_50%]"
                    }`}
                  />
                </span>
                <span className="mt-4 block">
                  <span className="eyebrow text-bone/50">Chapter {c.numeral}</span>
                  <span className="display mt-2 block text-2xl md:text-3xl">{c.title}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-bone/60">{c.copy}</span>
                  <span className="eyebrow mt-4 inline-flex items-center gap-2 text-bone/80 group-hover:text-scarlet">
                    {c.shopLabel}
                    <ArrowIcon width={14} height={14} />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
