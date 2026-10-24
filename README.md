# RED — The Red Company

A fashion and lifestyle storefront for a house that only makes red. It opens on a scroll-scrubbed campaign film that ends on the **THE RED COMPANY** lockup, then moves into a working shop.

Built with Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS v4 and Framer Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

Set `NEXT_PUBLIC_SITE_URL` in production so social-image URLs resolve to the real domain.

## Structure

| Path | What it holds |
| --- | --- |
| `src/config/site.ts` | Brand name, navigation, CTA, contact details, currency, shipping rules |
| `src/data/products.ts` | The sample catalogue, categories, film chapters and home-page edit (replace with a real feed) |
| `src/data/shades.ts` | The seven shades of the Red Spectrum, with hex/RGB values and copy |
| `src/lib/hero/` | Hero timeline, layout maths, asset loader and the measured wall-drift track |
| `src/lib/catalog.ts` | Filtering, sorting and URL (de)serialisation for the shop |
| `src/lib/cart-store.ts` | Cart store (localStorage-backed, synced across tabs) |
| `src/components/` | Hero, home sections, shop, product, cart, checkout, contact, layout |
| `src/app/api/` | `newsletter`, `contact` and `checkout` endpoints (validation only; see below) |
| `public/frames/` | Film frames 7–144: `desktop/` holds the original JPEGs, `mobile/` 960px WebP copies |
| `public/hero/` | The lehenga still and empty-studio plate (desktop and mobile), and the OBSESSED type and E mattes |
| `public/products/`, `public/editorial/` | Product and editorial imagery (studio stills; see below) |
| `scripts/` | Python scripts that generate the studio stills, the hero plate and E sprite, and the wall-drift track |

## The hero film

| Frames | What plays |
| --- | --- |
| 7–144 | The original film frames, unchanged (the film opens on frame 7; frames 1–6 are not used) |
| 145–179 | The lehenga still, framed to match the film (cross-fades in from frame 144) |
| 151–179 | OBSESSED over it (the word fades in over two frames) |
| then | The model and OBSESSED dissolve into the empty studio; the centre E stays exactly where it was |
| then | R and D slide in beside the E, then THE and COMPANY appear, and the composition holds |

- The section is pinned for about 475vh and scroll maps continuously onto that timeline, so scrolling up plays it backwards. Frames 87–150 get 2.2× as much scroll per frame as the rest (`PACING` in `sequence.ts`), so the gown, streetwear, tailoring and the lehenga linger.
- **OBSESSED** is lifted from the supplied OBSESSED image as two alpha mattes (`scripts/hero_plate.py`): the word without its centre E, and the E alone. They are drawn over the lehenga still at the same position and size, so the picture never changes framing. During the dissolve the word fades and the E stays exactly where it is.
- **Empty studio.** The plate the model dissolves into is rebuilt from the lehenga still: each row behind her is interpolated across from the wall and floor on either side, and the wall texture is restored from untouched areas.
- **Lockup type.** The R and D are set in **Noto Serif Display Bold**, the closest match to the OBSESSED E among 30+ Didone and display serifs. They are sized from that E's cap height, sit on its baseline, and keep OBSESSED's letter spacing. The E stays white, R and D are crimson, and THE and COMPANY are off-white.
- **Wall typography.** "Make the RED statement" is drawn on the left wall for the whole hero. The camera drifts slightly during the film, and the lehenga still sits a fraction of a pixel off it. Both were measured (`wall-track.ts`) and compensated, so the type stays fixed to the wall.
- **Loading.** Frame 7 loads first, then the stills, then the rest of the film coarse-to-fine (every 32nd, 16th … frame). Everything is decoded with `img.decode()` and drawn in `requestAnimationFrame` only while the hero is on screen. Small screens and Save-Data connections get 960px WebP copies.
- The canvas is sized for the device pixel ratio (capped at 2×) and redrawn on resize. Portrait screens scale the film down just enough to keep the wall, the figure, the model and the lockup in view.

## Imagery

None of the hero's imagery is used elsewhere on the site. Product and editorial images are **studio still renders** (`scripts/studio_render.py`): objects, folded garments and draped cloth in each product's shade, lit like a single studio shoot. They stand in until photography is available. To swap them, drop photos into `public/products/` and `public/editorial/` under the same file names, or point `images` in `src/data/products.ts` at your own assets.

## Commerce

The filters (category, shade, size, price) and the sort order are stored in the URL, so filtered views can be linked and shared. Selecting a shade in the Red Spectrum opens `/shop?shade=…`.

The cart persists in `localStorage`. Checkout re-prices the order on the server from the catalogue and returns an order reference. **No payment is taken and nothing is stored.** The `checkout`, `contact` and `newsletter` routes are where a payment provider, inbox or mailing-list service would be connected.
