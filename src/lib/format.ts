import { siteConfig } from "@/config/site";

const currency = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return currency.format(value);
}
