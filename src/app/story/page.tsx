import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { chapters } from "@/data/products";
import { shades } from "@/data/shades";
import { frameUrl } from "@/lib/hero/sequence";
import { Manifesto } from "@/components/home/Manifesto";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Why RED makes one colour, and the film behind the collection.",
};

export default function StoryPage() {
  return (
    <>
      <header className="relative flex min-h-[85svh] items-end overflow-hidden bg-oxblood text-bone">
        <Image
          src={frameUrl("desktop", 0)}
          alt="The model in a white gown in the red studio, before the transformation"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_50%] opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-oxblood via-oxblood/30 to-transparent" />
        <div className="container-luxe relative pb-16 md:pb-24">
          <p className="eyebrow text-bone/70">Our Story</p>
          <h1 className="display mt-5 max-w-4xl text-6xl md:text-8xl">
            One colour.
            <br />
            <em>No exceptions.</em>
          </h1>
        </div>
      </header>

      <Manifesto />

      <section aria-labelledby="film-title" className="bg-ink py-20 text-bone md:py-32">
        <div className="container-luxe">
          <p className="eyebrow text-scarlet">The Film</p>
          <h2 id="film-title" className="display mt-5 text-5xl md:text-7xl">
            Five chapters, one take
          </h2>
          <ol className="mt-16 space-y-20 md:space-y-28">
            {chapters.map((c, i) => (
              <Reveal as="li" key={c.id} className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
                <div className={`relative aspect-video overflow-hidden md:col-span-7 ${i % 2 ? "md:order-2" : ""}`}>
                  <Image
                    src={frameUrl("desktop", c.frame - 1)}
                    alt={`Film still, chapter ${c.numeral}: ${c.title}`}
                    fill
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="md:col-span-5">
                  <p className="font-serif text-6xl text-scarlet/80">{c.numeral}</p>
                  <h3 className="display mt-4 text-4xl md:text-5xl">{c.title}</h3>
                  <p className="mt-4 max-w-sm text-bone/70">{c.copy}</p>
                  <Link href={c.shopHref} className="eyebrow group mt-8 inline-flex items-center gap-3 border-b border-bone pb-1.5 hover:text-scarlet">
                    {c.shopLabel}
                    <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="craft-title" className="bg-bone py-20 md:py-32">
        <div className="container-luxe grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-crimson">The Palette</p>
            <h2 id="craft-title" className="display mt-5 text-5xl md:text-6xl">
              Dyed to seven standards
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-graphite">
              Each shade has a master reference, and every dye lot is checked against it in the same light before a
              piece is cut. Leather, silk, cotton and glaze all answer to the same seven colours.
            </p>
            <Link href="/#spectrum" className="eyebrow mt-8 inline-flex items-center gap-3 border-b border-charcoal pb-1.5 hover:text-crimson">
              Explore the spectrum <ArrowIcon width={16} height={16} />
            </Link>
          </div>
          <ul className="grid grid-cols-7 gap-1 self-end md:col-span-7" aria-label="The seven RED shades">
            {shades.map((s) => (
              <li key={s.id}>
                <Link href={`/shop?shade=${s.id}`} className="group block">
                  <span className="block h-40 transition-transform duration-500 group-hover:-translate-y-2 md:h-64" style={{ background: s.hex }} />
                  <span className="eyebrow mt-3 block truncate text-[0.6rem] md:text-[0.6875rem]">{s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
