import { categories, products, type CategoryId, type Product } from "@/data/products";
import { shades, type ShadeId } from "@/data/shades";

export const priceBuckets = [
  { id: "under-200", label: "Under $200", min: 0, max: 199.99 },
  { id: "200-700", label: "$200 – $700", min: 200, max: 700 },
  { id: "700-2000", label: "$700 – $2,000", min: 700.01, max: 2000 },
  { id: "over-2000", label: "Over $2,000", min: 2000.01, max: Infinity },
] as const;
export type PriceBucketId = (typeof priceBuckets)[number]["id"];

export const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;
export type SortId = (typeof sortOptions)[number]["id"];

export interface CatalogQuery {
  category: CategoryId | null;
  shades: ShadeId[];
  sizes: string[];
  price: PriceBucketId | null;
  sort: SortId;
}

const isCategory = (v: string | null): v is CategoryId => !!v && categories.some((c) => c.id === v);
const isShade = (v: string): v is ShadeId => shades.some((s) => s.id === v);
const isPrice = (v: string | null): v is PriceBucketId => !!v && priceBuckets.some((b) => b.id === v);
const isSort = (v: string | null): v is SortId => !!v && sortOptions.some((o) => o.id === v);

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

/** Reads catalogue filters from the URL, ignoring anything unrecognised. */
export function parseQuery(params: URLSearchParams): CatalogQuery {
  const category = params.get("category");
  const price = params.get("price");
  const sort = params.get("sort");
  return {
    category: isCategory(category) ? category : null,
    shades: list(params.get("shade")).filter(isShade),
    sizes: list(params.get("size")),
    price: isPrice(price) ? price : null,
    sort: isSort(sort) ? sort : "featured",
  };
}

export function serializeQuery(q: CatalogQuery): string {
  const p = new URLSearchParams();
  if (q.category) p.set("category", q.category);
  if (q.shades.length) p.set("shade", q.shades.join(","));
  if (q.sizes.length) p.set("size", q.sizes.join(","));
  if (q.price) p.set("price", q.price);
  if (q.sort !== "featured") p.set("sort", q.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function applyQuery(q: CatalogQuery, source: Product[] = products): Product[] {
  const bucket = priceBuckets.find((b) => b.id === q.price);
  const result = source.filter(
    (p) =>
      (!q.category || p.category === q.category) &&
      (!q.shades.length || q.shades.includes(p.shade)) &&
      (!q.sizes.length || p.sizes.some((s) => q.sizes.includes(s))) &&
      (!bucket || (p.price >= bucket.min && p.price <= bucket.max)),
  );
  const sorted = [...result];
  switch (q.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      sorted.sort((a, b) => b.added.localeCompare(a.added) || a.featured - b.featured);
      break;
    default:
      sorted.sort((a, b) => a.featured - b.featured);
  }
  return sorted;
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL"];

/** Sizes offered by products in the given category (or all), in a sensible order. */
export function sizeOptions(category: CategoryId | null): string[] {
  const set = new Set<string>();
  for (const p of products) if (!category || p.category === category) p.sizes.forEach((s) => set.add(s));
  const rank = (s: string) => {
    const i = SIZE_ORDER.indexOf(s);
    if (i >= 0) return i;
    const n = parseFloat(s.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? 100 + n : 10_000;
  };
  return [...set].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export function productsInShade(shade: ShadeId) {
  return products.filter((p) => p.shade === shade).sort((a, b) => a.featured - b.featured);
}

export function relatedProducts(product: Product, limit = 4) {
  const score = (p: Product) => (p.shade === product.shade ? 2 : 0) + (p.category === product.category ? 1 : 0);
  return products
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => score(b) - score(a) || a.featured - b.featured)
    .slice(0, limit);
}
