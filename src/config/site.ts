/**
 * Central brand configuration. Change the brand name, navigation, contact details
 * and currency here; components read from this file rather than hard-coding copy.
 */
export const siteConfig = {
  brandName: "RED",
  legalName: "The Red Company",
  tagline: "Make the RED statement",
  /** Public URL, used for absolute social-image links. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "RED is a fashion and lifestyle house that makes one colour only. Apparel, streetwear, footwear, bags, accessories and objects — every piece exclusively red.",
  currency: "USD",
  locale: "en-US",
  freeShippingThreshold: 500,
  shippingFee: 25,
  nav: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "The Red Spectrum", href: "/#spectrum" },
    { label: "Our Story", href: "/story" },
    { label: "Contact", href: "/contact" },
  ],
  cta: { label: "Shop Collection", href: "/shop" },
  contact: {
    email: "studio@theredcompany.example",
    phone: "+33 1 00 00 00 00",
    address: ["RED Studio", "14 Rue du Rouge", "75003 Paris, France"],
    hours: "Monday to Saturday, 10:00 — 19:00 CET",
  },
  contactTopics: ["Orders & delivery", "Sizing & fit", "Bridal appointments", "Press", "Other"],
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
