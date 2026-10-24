import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon } from "@/components/ui/icons";

export function Intro() {
  return (
    <section aria-label="Introduction" className="relative bg-oxblood text-bone">
      {/* Continues the studio floor (sampled from the film's last frame) down into the page. */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#c72a29] via-[#5c0b10] to-transparent md:h-64" />
      <div className="container-luxe relative grid gap-10 py-24 md:grid-cols-12 md:py-36">
        <Reveal className="md:col-span-8">
          <p className="eyebrow text-bone/60">Autumn / Winter 2026</p>
          <p className="display mt-6 text-4xl md:text-6xl lg:text-7xl">
            We make one colour,
            <br />
            <em className="text-scarlet">in every shade of it.</em>
          </p>
        </Reveal>
        <Reveal delay={0.15} className="flex flex-col justify-end gap-8 md:col-span-4">
          <p className="text-sm leading-relaxed text-bone/70">
            Gowns, tailoring, streetwear, leather and objects for the home. Everything we make is red, from
            the brightest scarlet to oxblood, and the collection is the one you just watched.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shop" className="eyebrow group inline-flex items-center gap-3 bg-bone px-6 py-4 text-charcoal transition-colors hover:bg-scarlet hover:text-bone">
              Shop the collection
              <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/#spectrum" className="eyebrow inline-flex items-center border border-bone/30 px-6 py-4 transition-colors hover:border-bone">
              Explore by shade
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
