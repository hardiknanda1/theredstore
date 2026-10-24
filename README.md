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
| `src/data/products.ts` | The sample catalogue, categories and campaign chapters (replace with a real feed) |
| `src/data/shades.ts` | The seven shades of the Red Spectrum, with hex/RGB values and copy |
| `src/lib/hero/` | Film timeline, layout maths, frame loader and the measured wall-drift track |
| `src/lib/catalog.ts` | Filtering, sorting and URL (de)serialisation for the shop |
| `src/lib/cart-store.ts` | Cart store (localStorage-backed, synced across tabs) |
| `src/components/` | Hero, home sections, shop, product, cart, checkout, contact, layout |
| `src/app/api/` | `newsletter`, `contact` and `checkout` endpoints (validation only; see below) |
| `public/frames/` | The film: `desktop/` holds the 180 original JPEGs, `mobile/` 960px WebP copies |
| `public/products/` | Product imagery |
| `scripts/` | Python scripts that generated the product crops, lifestyle stills and wall-drift track from the source frames |

## The hero film

- The 180 supplied frames are sorted numerically and played in order. The section is pinned for 350vh. Scroll position maps onto the frames, then the final frame holds for 20 more frame-units while the lockup appears. Scrolling up plays the film backwards.
- Frames are loaded coarse-to-fine: frame 1, then frame 180, then every 32nd, 16th … frame. Each is decoded with `img.decode()` and kept in memory, and drawing happens in `requestAnimationFrame` only while the hero is on screen. Until a frame is ready, the nearest decoded frame stands in.
- The canvas is sized for the device pixel ratio (capped at 2×) and redrawn by a `ResizeObserver`. Wide screens get a cover crop. On portrait screens the film scales down just enough to keep the wall, the figure, the model and the lockup in view, and the space around it is filled with the studio's wall and floor tones.
- Small screens and Save-Data connections load the 3 MB WebP set instead of the 15 MB originals.
- **Wall typography.** "Make the RED statement" is drawn in film coordinates on the left wall for frames 1–179. The camera drifts by up to ~4px across the film. That drift was measured per frame (`wall-track.ts`) and is compensated, so the type stays fixed to the wall.
- **Final lockup.** Frame 180 was exported at 1920×1080 with white strips on the top and right edges; these are cropped at draw time and the frame is otherwise untouched. The white E is the film's own pixels. The R and D are set in **PT Serif**, which matched the E's glyph shape with an IoU of 0.96 against 50 candidate serifs. They are sized from the E's measured cap height and placed on its baseline. THE and COMPANY are centred above and below.

## Imagery

- Apparel, streetwear, footwear, bag and accessory images are crops of the looks in the campaign film, so every product shown actually appears in it.
- The four lifestyle objects (candle, vessel, fragrance, mug) are studio still-life renders made for this project.
- To use real photography, replace the files in `public/products/` or point `images` in `src/data/products.ts` at your own assets.

## Commerce

The filters (category, shade, size, price) and the sort order are stored in the URL, so filtered views can be linked and shared. Selecting a shade in the Red Spectrum opens `/shop?shade=…`.

The cart persists in `localStorage`. Checkout re-prices the order on the server from the catalogue and returns an order reference. **No payment is taken and nothing is stored.** The `checkout`, `contact` and `newsletter` routes are where a payment provider, inbox or mailing-list service would be connected.
