"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { shades, type ShadeId } from "@/data/shades";
import { productsInShade } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { ArrowIcon } from "@/components/ui/icons";

/**
 * Seven tall colour blocks. Selecting a shade expands it to reveal its values, character
 * and the pieces made in it, with a direct link into the filtered collection.
 */
export function RedSpectrum({ initial = "crimson" }: { initial?: ShadeId }) {
  const [active, setActive] = useState<ShadeId>(initial);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + shades.length) % shades.length;
    setActive(shades[next].id);
    buttons.current[next]?.focus();
  };

  return (
    <section id="spectrum" aria-labelledby="spectrum-title" className="scroll-mt-20 bg-ink py-20 text-bone md:py-32">
      <div className="container-luxe">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="eyebrow text-scarlet">The Red Spectrum</p>
            <h2 id="spectrum-title" className="display mt-5 text-5xl md:text-7xl">
              Seven reds.
              <br />
              <em className="text-bone/70">One obsession.</em>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-bone/60 md:col-span-5 md:justify-self-end">
            Red is not one colour. Each shade has its own temperature, texture and time of day. Choose a shade
            to see what we make in it.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-1.5 md:mt-16 lg:h-[76vh] lg:min-h-[560px] lg:flex-row" role="group" aria-label="Shades">
          {shades.map((shade, i) => {
            const isActive = shade.id === active;
            const pieces = productsInShade(shade.id);
            return (
              <div
                key={shade.id}
                className={`relative overflow-hidden transition-[flex-grow] duration-700 ease-[var(--ease-luxe)] lg:min-w-0 lg:basis-0 ${
                  isActive ? "lg:grow-[7]" : "lg:grow"
                }`}
                style={{ background: shade.hex, color: shade.ink }}
              >
                {/* Soft studio light across the swatch surface. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(120% 80% at 30% 0%, rgba(255,255,255,0.14), transparent 60%), linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.22))",
                  }}
                />
                <button
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={isActive}
                  aria-controls={`shade-panel-${shade.id}`}
                  onClick={() => setActive(shade.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`relative flex w-full items-center justify-between px-5 py-5 text-left transition-[filter] duration-300 lg:h-full lg:flex-col lg:items-start lg:justify-between lg:px-5 lg:py-6 ${
                    isActive ? "cursor-default lg:pointer-events-none lg:absolute lg:inset-0" : "hover:brightness-110"
                  }`}
                >
                  <span className={`eyebrow opacity-70 ${isActive ? "lg:opacity-0" : ""}`}>0{i + 1}</span>
                  <span
                    className={`font-serif text-xl lg:text-2xl lg:[writing-mode:vertical-rl] lg:rotate-180 ${
                      isActive ? "lg:opacity-0" : ""
                    }`}
                  >
                    {shade.name}
                  </span>
                  <span className={`eyebrow opacity-70 ${isActive ? "lg:opacity-0" : ""}`}>{shade.hex}</span>
                </button>

                <div
                  id={`shade-panel-${shade.id}`}
                  aria-live="polite"
                  className={`relative ${isActive ? "block" : "hidden"} lg:absolute lg:inset-0 lg:block lg:min-w-[38rem] ${
                    isActive ? "lg:opacity-100 lg:transition-opacity lg:delay-300 lg:duration-700" : "lg:pointer-events-none lg:opacity-0"
                  }`}
                >
                  {isActive && (
                    <div className="flex h-full flex-col justify-between gap-10 px-5 pb-6 lg:px-10 lg:py-9">
                      <div className="flex items-start justify-between gap-6">
                        <span className="eyebrow max-lg:hidden opacity-70">0{i + 1} / 07</span>
                        <dl className="grid grid-cols-[auto_auto] gap-x-5 gap-y-1 text-xs tabular-nums opacity-80 lg:text-right">
                          <dt className="eyebrow opacity-70">Hex</dt>
                          <dd>{shade.hex}</dd>
                          <dt className="eyebrow opacity-70">RGB</dt>
                          <dd>{shade.rgb.join(" · ")}</dd>
                        </dl>
                      </div>

                      <div>
                        <h3 className="display text-6xl max-lg:hidden xl:text-8xl">{shade.name}</h3>
                        <p className="eyebrow mt-5 opacity-80">{shade.mood}</p>
                        <p className="mt-3 max-w-md text-sm leading-relaxed opacity-90">{shade.note}</p>
                        <p className="mt-2 text-xs italic opacity-70">Texture: {shade.texture}</p>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-6">
                        <ul className="flex gap-2.5">
                          {pieces.slice(0, 3).map((p) => (
                            <li key={p.slug}>
                              <Link href={`/product/${p.slug}`} className="group block w-20 lg:w-24" title={`${p.name}, ${formatPrice(p.price)}`}>
                                <span className="relative block aspect-[4/5] overflow-hidden ring-1 ring-black/10">
                                  <Image
                                    src={p.images[0].src}
                                    alt={p.name}
                                    fill
                                    sizes="96px"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={`/shop?shade=${shade.id}`}
                          className="eyebrow group inline-flex items-center gap-3 border-b border-current pb-1.5"
                        >
                          Shop {shade.name} · {pieces.length} {pieces.length === 1 ? "piece" : "pieces"}
                          <ArrowIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
