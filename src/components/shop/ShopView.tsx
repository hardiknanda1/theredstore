"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { categories, products } from "@/data/products";
import { shadeById, shades } from "@/data/shades";
import {
  applyQuery,
  parseQuery,
  priceBuckets,
  serializeQuery,
  sizeOptions,
  sortOptions,
  type CatalogQuery,
  type SortId,
} from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { CloseIcon, FilterIcon } from "@/components/ui/icons";

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ShopView() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = useMemo(() => parseQuery(new URLSearchParams(params.toString())), [params]);
  const results = useMemo(() => applyQuery(query), [query]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Close the mobile filter sheet if this page is hidden by a navigation.
  useLayoutEffect(() => () => setFiltersOpen(false), []);

  const update = (patch: Partial<CatalogQuery>) => {
    const next = { ...query, ...patch };
    // Sizes not offered in the new category would silently empty the grid; drop them.
    if (patch.category !== undefined) {
      const valid = sizeOptions(next.category);
      next.sizes = next.sizes.filter((s) => valid.includes(s));
    }
    router.replace(`${pathname}${serializeQuery(next)}`, { scroll: false });
  };

  const activeCount = query.shades.length + query.sizes.length + (query.price ? 1 : 0);
  const clearFilters = () => update({ shades: [], sizes: [], price: null });

  const heading = query.category ? categories.find((c) => c.id === query.category)!.label : "All pieces";
  const shadeLine =
    query.shades.length === 1 ? shadeById[query.shades[0]] : null;

  return (
    <>
      {/* Category navigation */}
      <div className="sticky top-16 z-30 border-b hairline bg-bone/95 backdrop-blur md:top-20">
        <div className="container-luxe flex items-center gap-4">
          <nav aria-label="Categories" className="-mx-1 flex flex-1 gap-1 overflow-x-auto py-3 [scrollbar-width:none]">
            {[{ id: null, label: "All" }, ...categories].map((c) => {
              const active = query.category === c.id;
              const count = applyQuery({ ...query, category: c.id as CatalogQuery["category"] }).length;
              return (
                <button
                  key={c.id ?? "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: c.id as CatalogQuery["category"] })}
                  className={`eyebrow shrink-0 px-3.5 py-2.5 transition-colors ${
                    active ? "bg-charcoal text-bone" : "text-graphite hover:bg-sand"
                  }`}
                >
                  {c.label} <span className="opacity-50">{count}</span>
                </button>
              );
            })}
          </nav>
          <label className="hidden items-center gap-2 md:flex">
            <span className="eyebrow text-stone">Sort</span>
            <select
              value={query.sort}
              onChange={(e) => update({ sort: e.target.value as SortId })}
              className="eyebrow cursor-pointer border border-charcoal/15 bg-transparent px-3 py-2.5"
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="container-luxe grid gap-10 py-10 lg:grid-cols-[15rem_1fr] lg:gap-14 lg:py-14">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-40">
            <FilterControls query={query} update={update} />
            {activeCount > 0 && (
              <button type="button" onClick={clearFilters} className="eyebrow mt-8 text-stone underline-offset-4 hover:text-charcoal hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="display text-4xl md:text-5xl">{heading}</h2>
              <p className="mt-2 text-sm text-stone" aria-live="polite">
                {results.length} {results.length === 1 ? "piece" : "pieces"}
                {shadeLine && <> in {shadeLine.name}</>}
              </p>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <select
                aria-label="Sort"
                value={query.sort}
                onChange={(e) => update({ sort: e.target.value as SortId })}
                className="eyebrow border border-charcoal/15 bg-transparent px-3 py-2.5 md:hidden"
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="eyebrow inline-flex items-center gap-2 border border-charcoal/15 px-3.5 py-2.5"
                aria-haspopup="dialog"
              >
                <FilterIcon width={16} height={16} /> Filter{activeCount ? ` (${activeCount})` : ""}
              </button>
            </div>
          </div>

          {activeCount > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Active filters">
              {query.shades.map((s) => (
                <Chip key={s} label={shadeById[s].name} color={shadeById[s].hex} onRemove={() => update({ shades: query.shades.filter((x) => x !== s) })} />
              ))}
              {query.sizes.map((s) => (
                <Chip key={s} label={`Size ${s}`} onRemove={() => update({ sizes: query.sizes.filter((x) => x !== s) })} />
              ))}
              {query.price && (
                <Chip label={priceBuckets.find((b) => b.id === query.price)!.label} onRemove={() => update({ price: null })} />
              )}
            </ul>
          )}

          {results.length ? (
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6">
              {results.map((p, i) => (
                <li key={p.slug}>
                  <ProductCard product={p} priority={i < 3} sizes="(min-width: 1024px) 24vw, (min-width: 768px) 33vw, 50vw" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10 border hairline px-6 py-16 text-center">
              <p className="display text-3xl">Nothing in that combination, yet.</p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-stone">Try removing a filter, or browse every piece in the collection.</p>
              <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="eyebrow mt-6 bg-charcoal px-6 py-3.5 text-bone">
                Reset all
              </button>
            </div>
          )}
        </div>
      </div>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        query={query}
        update={update}
        resultCount={results.length}
        onClear={clearFilters}
      />
    </>
  );
}

function Chip({ label, color, onRemove }: { label: string; color?: string; onRemove: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center gap-2 border border-charcoal/15 px-3 py-1.5 text-xs transition-colors hover:border-charcoal"
        aria-label={`Remove filter ${label}`}
      >
        {color && <span className="size-2.5 rounded-full" style={{ background: color }} aria-hidden />}
        {label}
        <CloseIcon width={12} height={12} />
      </button>
    </li>
  );
}

function FilterControls({ query, update }: { query: CatalogQuery; update: (p: Partial<CatalogQuery>) => void }) {
  const sizes = sizeOptions(query.category);
  return (
    <div className="space-y-9">
      <fieldset>
        <legend className="eyebrow mb-4">Shade</legend>
        <ul className="space-y-1">
          {shades.map((s) => {
            const checked = query.shades.includes(s.id);
            const count = applyQuery({ ...query, shades: [s.id] }).length;
            return (
              <li key={s.id}>
                <label className={`group flex cursor-pointer items-center gap-3 py-1.5 text-sm ${count === 0 && !checked ? "opacity-40" : ""}`}>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={() => update({ shades: toggle(query.shades, s.id) })}
                  />
                  <span
                    className={`size-5 shrink-0 ring-offset-2 ring-offset-bone transition-shadow peer-focus-visible:ring-2 peer-focus-visible:ring-charcoal ${
                      checked ? "ring-1 ring-charcoal" : ""
                    }`}
                    style={{ background: s.hex }}
                    aria-hidden
                  />
                  <span className={checked ? "font-medium" : "group-hover:underline"}>{s.name}</span>
                  <span className="ml-auto text-xs text-stone tabular-nums">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-4">Size</legend>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => {
            const checked = query.sizes.includes(s);
            return (
              <label key={s} className="cursor-pointer">
                <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => update({ sizes: toggle(query.sizes, s) })} />
                <span
                  className={`inline-block min-w-11 border px-2.5 py-2 text-center text-xs transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-charcoal ${
                    checked ? "border-charcoal bg-charcoal text-bone" : "border-charcoal/15 hover:border-charcoal"
                  }`}
                >
                  {s}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-4">Price</legend>
        <ul className="space-y-1">
          {priceBuckets.map((b) => {
            const checked = query.price === b.id;
            return (
              <li key={b.id}>
                <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
                  <input
                    type="radio"
                    name="price"
                    className="peer sr-only"
                    checked={checked}
                    onChange={() => update({ price: b.id })}
                    onClick={() => checked && update({ price: null })}
                  />
                  <span
                    className={`grid size-4 place-items-center rounded-full border peer-focus-visible:ring-2 peer-focus-visible:ring-charcoal ${
                      checked ? "border-charcoal" : "border-charcoal/30"
                    }`}
                    aria-hidden
                  >
                    {checked && <span className="size-2 rounded-full bg-charcoal" />}
                  </span>
                  <span className={checked ? "font-medium" : ""}>{b.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}

function FilterSheet({
  open,
  onClose,
  query,
  update,
  resultCount,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  query: CatalogQuery;
  update: (p: Partial<CatalogQuery>) => void;
  resultCount: number;
  onClear: () => void;
}) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" tabIndex={-1} aria-label="Close filters" className="absolute inset-0 bg-ink/50" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col bg-bone"
            initial={{ y: reduce ? 0 : "100%" }}
            animate={{ y: 0 }}
            exit={{ y: reduce ? 0 : "100%" }}
            transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b hairline px-5 py-4">
              <p className="eyebrow">Filter</p>
              <button type="button" onClick={onClose} aria-label="Close filters" className="-mr-2 p-2" autoFocus>
                <CloseIcon />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-6">
              <FilterControls query={query} update={update} />
            </div>
            <div className="flex gap-3 border-t hairline px-5 py-4">
              <button type="button" onClick={onClear} className="eyebrow flex-1 border border-charcoal/20 py-3.5">
                Clear
              </button>
              <button type="button" onClick={onClose} className="eyebrow flex-[2] bg-charcoal py-3.5 text-bone">
                Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Static fallback rendered while the search params resolve. */
export function ShopFallback() {
  return (
    <div className="container-luxe py-14">
      <p className="text-sm text-stone">Loading the collection…</p>
      <ul className="sr-only">
        {products.map((p) => (
          <li key={p.slug}>
            <Link href={`/product/${p.slug}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
