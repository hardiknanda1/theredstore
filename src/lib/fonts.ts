import { Instrument_Sans, Noto_Serif_Display, PT_Serif } from "next/font/google";

/**
 * PT Serif is the display face. It was chosen by matching glyph shapes against the white
 * "E" baked into the final frame of the campaign film (IoU 0.96), so the R and D drawn
 * beside it read as the same typeface.
 */
export const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-pt-serif",
  display: "swap",
});

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
});

/**
 * Didone used for the closing lockup. Matched against the centre E of the OBSESSED still
 * (Bold, IoU 0.85 at that letter's 91px cap height) so the drawn R and D sit with it.
 */
export const notoSerifDisplay = Noto_Serif_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-display",
  display: "swap",
});
