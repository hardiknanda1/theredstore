import type { ShadeId } from "./shades";

/**
 * Sample catalogue. All product data lives here so it can be swapped for a real catalogue
 * or CMS feed without touching components. Apparel, footwear, bag and accessory imagery is
 * cropped from the RED campaign film; lifestyle objects are studio stills.
 */

export type CategoryId = "apparel" | "streetwear" | "footwear" | "bags" | "accessories" | "lifestyle";

export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  { id: "apparel", label: "Apparel", blurb: "Gowns, tailoring and ceremony." },
  { id: "streetwear", label: "Streetwear", blurb: "Heavyweight basics, cut wide." },
  { id: "footwear", label: "Footwear", blurb: "Built up from the sole." },
  { id: "bags", label: "Bags", blurb: "Leather, carried close." },
  { id: "accessories", label: "Accessories", blurb: "The finishing red." },
  { id: "lifestyle", label: "Lifestyle", blurb: "Objects for a red interior." },
];

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  slug: string;
  name: string;
  category: CategoryId;
  shade: ShadeId;
  price: number;
  sizes: string[];
  images: ProductImage[];
  summary: string;
  description: string;
  details: string[];
  composition: string;
  /** Lower numbers appear first in the default "Featured" sort. */
  featured: number;
  /** ISO date used for "Newest" sorting. */
  added: string;
  /** Frame of the campaign film the piece appears in. */
  filmFrame?: number;
}

const APPAREL = ["XS", "S", "M", "L", "XL"];
const ONE = ["One Size"];

const img = (name: string, alt: string): ProductImage => ({ src: `/products/${name}.jpg`, alt });

export const products: Product[] = [
  {
    slug: "filament-gown",
    name: "Filament Gown",
    category: "apparel",
    shade: "garnet",
    price: 4850,
    sizes: ["XS", "S", "M", "L"],
    images: [
      img("filament-gown-1", "Model in the Filament Gown, arms outstretched, red threads falling to the floor"),
      img("filament-gown-2", "Close view of the gown's woven red threadwork bodice"),
      img("filament-gown-3", "The gown's long, fringed skirt pooling on the studio floor"),
    ],
    summary: "Hand-knotted threadwork over a sheer second skin.",
    description:
      "Thousands of red filaments are hand-knotted into an open web that falls from the shoulders to the floor. The gown is built over a sheer stretch base, so the threadwork moves on its own and settles differently every time you stand still.",
    details: ["Floor length with a pooled fringe hem", "Concealed back zip", "Made to order in 6 weeks", "Each gown is numbered"],
    composition: "Viscose filament 82%, polyamide 18%. Base: polyamide 78%, elastane 22%.",
    featured: 1,
    added: "2026-09-12",
    filmFrame: 90,
  },
  {
    slug: "rani-bridal-lehenga",
    name: "Rani Bridal Lehenga",
    category: "apparel",
    shade: "ruby",
    price: 7800,
    sizes: ["XS", "S", "M", "L"],
    images: [
      img("bridal-lehenga-1", "Model wearing the ruby bridal lehenga with an embroidered veil"),
      img("bridal-lehenga-2", "Detail of zardozi arches embroidered on the lehenga skirt"),
      img("tulle-dupatta-2", "Full-length view of the lehenga with the dupatta draped over the head"),
    ],
    summary: "Zardozi-embroidered silk velvet in heirloom ruby.",
    description:
      "A three-piece bridal set of skirt, blouse and dupatta in silk velvet, embroidered by hand with arches and florals in antique gold zari. The skirt is cut with twenty-four panels for a full, weighty swing.",
    details: ["Skirt, blouse and dupatta included", "Hand embroidery: approx. 900 hours", "Fitting appointment included", "Ships in a lined keepsake trunk"],
    composition: "Silk velvet 100%. Embroidery: metallic zari, glass beads, sequins.",
    featured: 2,
    added: "2026-09-20",
    filmFrame: 150,
  },
  {
    slug: "oversized-tailored-blazer",
    name: "Oversized Tailored Blazer",
    category: "apparel",
    shade: "crimson",
    price: 1650,
    sizes: APPAREL,
    images: [
      img("tailored-blazer-1", "Model in the crimson oversized blazer worn with a sling bag"),
      img("tailored-blazer-2", "Full look: crimson blazer over cargo shorts and platform trainers"),
      img("luminous-tie-2", "The blazer worn over a matching shirt and luminous tie"),
    ],
    summary: "Dropped shoulders, single-breasted, cut long.",
    description:
      "Our signature blazer is cut wide through the shoulder and long through the body, then softened with a half-canvas construction so it drapes rather than stands. Wear it buttoned over a tie or open over a tee.",
    details: ["Single-breasted, two-button", "Half-canvas construction", "Flap pockets and a ticket pocket", "Fully lined in cupro"],
    composition: "Wool gabardine 100%. Lining: cupro 100%.",
    featured: 3,
    added: "2026-08-30",
    filmFrame: 128,
  },
  {
    slug: "heavyweight-boxy-tee",
    name: "Heavyweight Boxy Tee",
    category: "streetwear",
    shade: "scarlet",
    price: 145,
    sizes: APPAREL,
    images: [
      img("boxy-tee-1", "Model in the scarlet heavyweight boxy tee"),
      img("boxy-tee-2", "Full look: boxy tee with cargo shorts, cap and platform trainers"),
    ],
    summary: "300gsm loopback jersey with a dropped shoulder.",
    description:
      "A tee made heavy on purpose. Knitted from 300gsm cotton jersey, garment-dyed for depth of colour, and cut boxy with an elbow-length sleeve. It holds its shape wash after wash.",
    details: ["Boxy, cropped-to-hip fit", "Ribbed crew neck", "Garment dyed: slight tonal variation", "Pre-shrunk"],
    composition: "Organic cotton 100%.",
    featured: 4,
    added: "2026-09-02",
    filmFrame: 106,
  },
  {
    slug: "utility-cargo-short",
    name: "Utility Cargo Short",
    category: "streetwear",
    shade: "scarlet",
    price: 260,
    sizes: APPAREL,
    images: [
      img("cargo-short-1", "Scarlet cargo shorts worn below the knee with red socks"),
      img("cargo-short-2", "Full look with cargo shorts, boxy tee and sling bag"),
    ],
    summary: "Knee-length twill with bellowed cargo pockets.",
    description:
      "Long, wide and practical. Cotton twill shorts with bellowed cargo pockets, a relaxed seat and a hem that sits below the knee. Drawcords at the hem let you gather them in.",
    details: ["Relaxed, below-the-knee length", "Bellowed cargo pockets with snap flaps", "Adjustable hem drawcords", "Zip fly"],
    composition: "Cotton twill 100%.",
    featured: 9,
    added: "2026-09-02",
    filmFrame: 107,
  },
  {
    slug: "wide-cargo-trouser",
    name: "Wide Cargo Trouser",
    category: "streetwear",
    shade: "crimson",
    price: 520,
    sizes: APPAREL,
    images: [
      img("wide-cargo-trouser-1", "Crimson wide-leg cargo trousers falling over platform trainers"),
      img("wide-cargo-trouser-2", "Full look: wide cargo trousers with the oversized blazer"),
    ],
    summary: "A wide, full-length leg with tailored creases.",
    description:
      "Part tailoring, part utility. A full-length wide leg in wool-blend gabardine, pressed with a front crease and finished with low cargo pockets, so it pairs equally well with the blazer or the tee.",
    details: ["High rise, wide leg", "Pressed front crease", "Low cargo pockets", "Belt loops and side adjusters"],
    composition: "Wool 64%, polyester 36%.",
    featured: 6,
    added: "2026-09-08",
    filmFrame: 140,
  },
  {
    slug: "second-skin-bodysuit",
    name: "Second Skin Bodysuit",
    category: "apparel",
    shade: "cherry",
    price: 340,
    sizes: APPAREL,
    images: [
      img("second-skin-1", "The figure from the film in a seamless cherry-red bodysuit"),
      img("second-skin-2", "The cherry bodysuit walking beside the model in the white gown"),
    ],
    summary: "Seamless, head-to-toe, the colour of the film.",
    description:
      "Worn by the figure in our campaign film. A seamless bodysuit knitted in a single piece of matte, second-skin jersey. Wear it alone or as a base layer under the Filament Gown.",
    details: ["Seamless circular knit", "Long sleeves, ankle length", "Concealed back zip", "Matte, opaque finish"],
    composition: "Polyamide 76%, elastane 24%.",
    featured: 12,
    added: "2026-08-21",
    filmFrame: 30,
  },
  {
    slug: "platform-trainer",
    name: "Platform Trainer",
    category: "footwear",
    shade: "cherry",
    price: 690,
    sizes: ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"],
    images: [
      img("platform-trainer-1", "Cherry platform trainers worn with red ribbed socks"),
      img("platform-trainer-2", "Platform trainers under cargo shorts with hanging drawcords"),
    ],
    summary: "A sculpted 5cm sole in tonal leather and mesh.",
    description:
      "Built from the sole up: a sculpted 5cm platform unit, a padded collar and layered overlays of nappa leather and technical mesh, all dyed to the same cherry red, laces included.",
    details: ["5cm sculpted rubber sole", "Padded collar and tongue", "Removable cushioned insole", "Tonal laces"],
    composition: "Upper: calf leather 60%, polyester mesh 40%. Sole: rubber.",
    featured: 5,
    added: "2026-09-15",
    filmFrame: 106,
  },
  {
    slug: "ribbed-sport-sock",
    name: "Ribbed Sport Sock",
    category: "footwear",
    shade: "scarlet",
    price: 35,
    sizes: ["S", "M", "L"],
    images: [
      img("cargo-short-1", "Scarlet ribbed sport socks worn pulled up under cargo shorts"),
      img("platform-trainer-1", "The socks worn with the Platform Trainer"),
    ],
    summary: "Thick-ribbed cotton, worn pulled up.",
    description:
      "A thick, ribbed crew sock with a cushioned foot and a reinforced heel and toe, dyed to match the Platform Trainer. Made to be worn pulled up.",
    details: ["Cushioned terry sole", "Reinforced heel and toe", "Sold as a pair", "S: EU 36–39 · M: 40–43 · L: 44–46"],
    composition: "Combed cotton 80%, polyamide 17%, elastane 3%.",
    featured: 20,
    added: "2026-09-15",
    filmFrame: 107,
  },
  {
    slug: "messenger-sling",
    name: "Messenger Sling",
    category: "bags",
    shade: "oxblood",
    price: 890,
    sizes: ONE,
    images: [
      img("messenger-sling-1", "Oxblood leather messenger sling worn across the body"),
      img("messenger-sling-2", "The messenger sling worn over the crimson blazer"),
    ],
    summary: "Full-grain leather with an adjustable webbing strap.",
    description:
      "A compact messenger in full-grain leather, worn across the body. The flap closes with a hidden magnetic catch; the strap is wide webbing with a leather-wrapped buckle so it sits flat on a tee or a blazer.",
    details: ["Magnetic flap closure", "Interior zip pocket", "Adjustable 4cm webbing strap", "Fits a phone, wallet and keys"],
    composition: "Full-grain calf leather. Lining: cotton canvas.",
    featured: 7,
    added: "2026-08-28",
    filmFrame: 106,
  },
  {
    slug: "top-handle-mini-bag",
    name: "Top-Handle Mini Bag",
    category: "bags",
    shade: "garnet",
    price: 1250,
    sizes: ONE,
    images: [
      img("top-handle-bag-1", "Garnet top-handle mini bag held at the hip"),
      img("top-handle-bag-2", "The mini bag carried with the Filament Gown"),
    ],
    summary: "Structured leather with a polished buckle strap.",
    description:
      "A small, structured top-handle bag in smooth leather with a buckled front strap and a polished metal clasp. Carried in the film alongside the Filament Gown.",
    details: ["Rolled leather top handle", "Buckle strap with push clasp", "Suede-lined interior", "Protective metal feet"],
    composition: "Smooth calf leather. Lining: suede.",
    featured: 10,
    added: "2026-09-12",
    filmFrame: 93,
  },
  {
    slug: "wide-brim-raffia-hat",
    name: "Wide-Brim Raffia Hat",
    category: "accessories",
    shade: "crimson",
    price: 420,
    sizes: ["S", "M", "L"],
    images: [
      img("brim-hat-1", "Model in the crimson wide-brim raffia hat"),
      img("brim-hat-2", "The wide-brim hat worn with the Filament Gown"),
    ],
    summary: "Hand-woven raffia with a frayed, unfinished brim.",
    description:
      "A broad, sculptural brim of hand-woven raffia, dyed crimson and left frayed at the edge. An inner grosgrain band keeps it steady.",
    details: ["12cm brim", "Frayed raw edge", "Grosgrain inner band", "Packable: reshapes with steam"],
    composition: "Raffia 100%. Band: cotton grosgrain.",
    featured: 8,
    added: "2026-09-12",
    filmFrame: 92,
  },
  {
    slug: "six-panel-cap",
    name: "Six-Panel Cap",
    category: "accessories",
    shade: "vermilion",
    price: 95,
    sizes: ONE,
    images: [
      img("six-panel-cap-1", "Model wearing the vermilion six-panel cap"),
      img("six-panel-cap-2", "The cap worn with the boxy tee and sling"),
    ],
    summary: "Brushed cotton with a curved peak.",
    description:
      "A structured six-panel cap in brushed cotton twill with a pre-curved peak and tonal embroidered eyelets. Adjustable at the back with a leather strap.",
    details: ["Structured crown", "Pre-curved peak", "Leather strap with metal clasp", "Tonal eyelets"],
    composition: "Cotton twill 100%. Strap: calf leather.",
    featured: 11,
    added: "2026-09-02",
    filmFrame: 108,
  },
  {
    slug: "satin-tie",
    name: "Satin Tie",
    category: "accessories",
    shade: "garnet",
    price: 165,
    sizes: ONE,
    images: [
      img("satin-tie-1", "Garnet satin tie worn with a matching shirt and blazer"),
      img("tailored-blazer-1", "The satin tie as part of the full tailored look"),
    ],
    summary: "Heavy silk satin, seven-fold construction.",
    description:
      "A seven-fold tie in heavy silk satin with a soft sheen. Hand-finished with a slip stitch so it ties a clean, full knot.",
    details: ["7.5cm blade", "Seven-fold, unlined", "Hand slip-stitched", "Presented in a box"],
    composition: "Silk 100%.",
    featured: 14,
    added: "2026-08-30",
    filmFrame: 130,
  },
  {
    slug: "luminous-tie",
    name: "Luminous Tie",
    category: "accessories",
    shade: "vermilion",
    price: 240,
    sizes: ONE,
    images: [
      img("luminous-tie-1", "Vermilion luminous tie worn with the crimson blazer"),
      img("luminous-tie-2", "The luminous tie as part of the full tailored look"),
    ],
    summary: "Satin edged with a fine reflective piping.",
    description:
      "Our satin tie with a fine reflective piping stitched along every edge, which catches light and appears to glow, as it does in the film.",
    details: ["7.5cm blade", "Reflective edge piping", "Hand slip-stitched", "Presented in a box"],
    composition: "Silk 92%, reflective polyester piping 8%.",
    featured: 13,
    added: "2026-09-08",
    filmFrame: 140,
  },
  {
    slug: "embroidered-tulle-dupatta",
    name: "Embroidered Tulle Dupatta",
    category: "accessories",
    shade: "ruby",
    price: 680,
    sizes: ONE,
    images: [
      img("tulle-dupatta-1", "Ruby tulle dupatta draped over the head with an embroidered border"),
      img("tulle-dupatta-2", "The dupatta worn with the Rani bridal lehenga"),
    ],
    summary: "Sheer tulle veil with a hand-embroidered border.",
    description:
      "A sheer silk tulle veil scattered with hand-sewn sequins and finished with a deep embroidered border. Sold separately from the Rani lehenga for those who wear it with their own.",
    details: ["2.5m × 1.2m", "Hand-embroidered border", "Scattered sequin field", "Ships folded in tissue"],
    composition: "Silk tulle 100%. Embroidery: zari and sequins.",
    featured: 15,
    added: "2026-09-20",
    filmFrame: 147,
  },
  {
    slug: "ember-candle",
    name: "Ember Candle",
    category: "lifestyle",
    shade: "vermilion",
    price: 85,
    sizes: ["220 g"],
    images: [
      img("vermilion-candle-1", "Vermilion ceramic candle vessel on a red studio backdrop"),
      img("vermilion-candle-2", "The Ember Candle from a lower angle"),
    ],
    summary: "Smoked cedar, pink pepper and red amber.",
    description:
      "A rapeseed and coconut wax candle in a glazed ceramic vessel you can keep. Notes of smoked cedar, pink pepper and red amber. Approximately 50 hours of burn time.",
    details: ["220 g wax, approx. 50 hours", "Cotton wick", "Glazed stoneware vessel", "Hand-poured"],
    composition: "Rapeseed and coconut wax, fragrance oils. Vessel: glazed stoneware.",
    featured: 16,
    added: "2026-10-01",
  },
  {
    slug: "lidded-vessel",
    name: "Lidded Vessel",
    category: "lifestyle",
    shade: "oxblood",
    price: 320,
    sizes: ONE,
    images: [
      img("oxblood-vase-1", "Oxblood glazed lidded vessel on a red studio backdrop"),
      img("oxblood-vase-2", "The lidded vessel catching studio light"),
    ],
    summary: "Thrown stoneware in a deep oxblood glaze.",
    description:
      "A wheel-thrown stoneware vessel with a fitted stopper, finished in a high-fire oxblood glaze that pools darker at the base. Each one varies slightly.",
    details: ["Height 32cm", "Wheel-thrown", "High-fire glaze", "Not watertight: decorative"],
    composition: "Stoneware with copper-red glaze.",
    featured: 17,
    added: "2026-10-01",
  },
  {
    slug: "rouge-absolu-eau-de-parfum",
    name: "Rouge Absolu Eau de Parfum",
    category: "lifestyle",
    shade: "ruby",
    price: 210,
    sizes: ["50 ml", "100 ml"],
    images: [
      img("ruby-parfum-1", "Ruby lacquered fragrance bottle on a red studio backdrop"),
      img("ruby-parfum-2", "The fragrance bottle in profile"),
    ],
    summary: "Rose, saffron and dark woods.",
    description:
      "Our house fragrance: Turkish rose and saffron over a base of oud and dark woods. The bottle is lacquered in ruby with a weighted cap.",
    details: ["Eau de parfum", "Refillable bottle", "Weighted lacquered cap", "Made in Grasse"],
    composition: "Alcohol denat., parfum, aqua.",
    featured: 18,
    added: "2026-10-05",
  },
  {
    slug: "studio-mug",
    name: "Studio Mug",
    category: "lifestyle",
    shade: "cherry",
    price: 48,
    sizes: ["350 ml"],
    images: [
      img("cherry-mug-1", "Cherry glazed ceramic mug on a red studio backdrop"),
      img("cherry-mug-2", "The Studio Mug from the front"),
    ],
    summary: "Glazed stoneware, made for the morning.",
    description:
      "A generous stoneware mug glazed inside and out in cherry red, with a thick rolled rim and a handle sized for the whole hand.",
    details: ["350 ml", "Dishwasher and microwave safe", "Fully glazed", "Rolled rim"],
    composition: "Stoneware.",
    featured: 19,
    added: "2026-10-05",
  },
];

export const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p])) as Record<string, Product>;

/** Editorial campaign chapters, in the order they appear in the film. */
export const chapters = [
  {
    id: "the-figure",
    numeral: "I",
    title: "The Figure",
    copy: "Something red steps out from behind the wall. It doesn't ask, it arrives.",
    frame: 34,
    shopHref: "/product/second-skin-bodysuit",
    shopLabel: "Shop the bodysuit",
  },
  {
    id: "the-thread",
    numeral: "II",
    title: "The Thread",
    copy: "Red threads cover the white gown and weave themselves into something new.",
    frame: 90,
    shopHref: "/product/filament-gown",
    shopLabel: "Shop the Filament Gown",
  },
  {
    id: "the-street",
    numeral: "III",
    title: "The Street",
    copy: "Heavy cotton and long cargos, with the gaze still glowing.",
    frame: 110,
    shopHref: "/shop?category=streetwear",
    shopLabel: "Shop streetwear",
  },
  {
    id: "the-suit",
    numeral: "IV",
    title: "The Suit",
    copy: "Crimson tailoring, cut wide. The tie catches the light.",
    frame: 140,
    shopHref: "/shop?shade=crimson",
    shopLabel: "Shop crimson",
  },
  {
    id: "the-heirloom",
    numeral: "V",
    title: "The Heirloom",
    copy: "It ends in ruby: velvet, gold thread and a veil.",
    frame: 148,
    shopHref: "/product/rani-bridal-lehenga",
    shopLabel: "Shop the Rani lehenga",
  },
] as const;
