import { Reveal } from "@/components/ui/Reveal";

export const manifestoLines = [
  "Red is the first colour the eye names.",
  "It is the colour of a warning and of a wedding.",
  "We decided to make nothing else.",
];

export function Manifesto() {
  return (
    <section aria-labelledby="manifesto-title" className="bg-bone py-24 md:py-40">
      <div className="container-luxe grid gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <p id="manifesto-title" className="eyebrow text-crimson">
            Manifesto
          </p>
        </div>
        <div className="md:col-span-9">
          {manifestoLines.map((line, i) => (
            <Reveal key={line} delay={i * 0.12}>
              <p className={`display text-4xl md:text-6xl lg:text-7xl ${i === manifestoLines.length - 1 ? "text-crimson" : ""}`}>
                {line}
              </p>
            </Reveal>
          ))}
          <Reveal delay={0.4} className="mt-12 grid gap-8 text-sm leading-relaxed text-graphite md:grid-cols-2">
            <p>
              Working in one colour means every decision goes into cut, cloth and finish. A scarlet tee and an
              oxblood bag can sit next to each other because they come from the same family, and we
              treat each shade as seriously as another house would treat a whole palette.
            </p>
            <p>
              We work with ateliers that dye to our own standards and embroiderers who have made bridal wear for
              generations. Fewer pieces, made properly, in the colour people notice first.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
