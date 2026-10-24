import { siteConfig } from "@/config/site";
import { productBySlug } from "@/data/products";
import { MAX_QTY } from "@/lib/cart-store";
import { cleanText, isEmail } from "@/lib/validation";

/**
 * Demonstration checkout. Re-prices the bag from the catalogue (never trusting client
 * totals), validates the delivery details and returns an order reference. No payment is
 * taken; a payment provider would be called here.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawItems: unknown[] = Array.isArray(body?.items) ? body.items : [];
  const items = rawItems.flatMap((raw) => {
    const i = raw as { slug?: string; size?: string; qty?: number };
    const product = i.slug ? productBySlug[i.slug] : undefined;
    const qty = Math.floor(Number(i.qty));
    if (!product || !i.size || !product.sizes.includes(i.size) || !(qty >= 1 && qty <= MAX_QTY)) return [];
    return [{ slug: product.slug, name: product.name, size: i.size, qty, unitPrice: product.price }];
  });

  if (!items.length || items.length !== rawItems.length) {
    return Response.json({ ok: false, error: "Your bag has changed. Please review it and try again." }, { status: 400 });
  }

  const c = body?.customer ?? {};
  const customer = {
    email: cleanText(c.email, 254),
    firstName: cleanText(c.firstName, 80),
    lastName: cleanText(c.lastName, 80),
    address: cleanText(c.address, 200),
    city: cleanText(c.city, 100),
    postalCode: cleanText(c.postalCode, 20),
    country: cleanText(c.country, 80),
  };
  const errors: Record<string, string> = {};
  if (!isEmail(customer.email)) errors.email = "Enter a valid email address.";
  for (const key of ["firstName", "lastName", "address", "city", "postalCode", "country"] as const) {
    if (!customer[key]) errors[key] = "Required.";
  }
  if (Object.keys(errors).length) return Response.json({ ok: false, errors }, { status: 400 });

  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.qty, 0);
  const shipping = subtotal >= siteConfig.freeShippingThreshold ? 0 : siteConfig.shippingFee;
  const reference = `RED-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  return Response.json({ ok: true, reference, items, subtotal, shipping, total: subtotal + shipping });
}
