"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { shadeById } from "@/data/shades";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

const fields = [
  { name: "email", label: "Email", type: "email", autoComplete: "email", span: 2 },
  { name: "firstName", label: "First name", autoComplete: "given-name" },
  { name: "lastName", label: "Last name", autoComplete: "family-name" },
  { name: "address", label: "Address", autoComplete: "street-address", span: 2 },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "postalCode", label: "Postal code", autoComplete: "postal-code" },
  { name: "country", label: "Country", autoComplete: "country-name", span: 2 },
] as const;

type FieldName = (typeof fields)[number]["name"];
type Confirmation = { reference: string; total: number; email: string };

export function CheckoutView() {
  const { items, subtotal, setQty, remove, clear } = useCart();
  const [values, setValues] = useState<Record<FieldName, string>>(
    () => Object.fromEntries(fields.map((f) => [f.name, ""])) as Record<FieldName, string>,
  );
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  // A confirmation is not something to come back to after navigating away.
  useLayoutEffect(() => () => setConfirmation(null), []);

  const shipping = subtotal >= siteConfig.freeShippingThreshold || subtotal === 0 ? 0 : siteConfig.shippingFee;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ slug, size, qty }) => ({ slug, size, qty })),
          customer: values,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setFormError(data.error ?? "Please check the highlighted fields.");
        return;
      }
      setConfirmation({ reference: data.reference, total: data.total, email: values.email });
      clear();
      window.scrollTo({ top: 0 });
    } catch {
      setFormError("We couldn't reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (confirmation) {
    return (
      <div className="container-luxe py-20 md:py-28">
        <p className="eyebrow text-crimson">Order received</p>
        <h1 className="display mt-5 text-5xl md:text-7xl">Thank you.</h1>
        <p className="mt-6 max-w-lg text-graphite">
          Your order <span className="font-medium text-charcoal">{confirmation.reference}</span> totalling{" "}
          {formatPrice(confirmation.total)} has been recorded for {confirmation.email}.
        </p>
        <p className="mt-3 max-w-lg text-sm text-stone">
          This is a demonstration storefront: no payment has been taken and nothing will ship.
        </p>
        <Link href="/shop" className="eyebrow mt-10 inline-block bg-charcoal px-6 py-4 text-bone">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="container-luxe py-20 md:py-28">
        <h1 className="display text-5xl md:text-7xl">Checkout</h1>
        <p className="mt-6 text-graphite">Your bag is empty.</p>
        <Link href="/shop" className="eyebrow mt-8 inline-block bg-crimson px-6 py-4 text-bone hover:bg-burgundy">
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-16">
      <form onSubmit={submit} noValidate className="lg:col-span-7" aria-describedby={formError ? "checkout-error" : undefined}>
        <h1 className="display text-5xl md:text-6xl">Checkout</h1>
        <p className="mt-3 text-sm text-stone">Demonstration checkout: no payment is collected.</p>

        <fieldset className="mt-10">
          <legend className="eyebrow mb-6">Contact &amp; delivery</legend>
          <div className="grid grid-cols-2 gap-x-5 gap-y-6">
            {fields.map((f) => (
              <div key={f.name} className={"span" in f && f.span === 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}>
                <label htmlFor={`co-${f.name}`} className="eyebrow block text-stone">
                  {f.label}
                </label>
                <input
                  id={`co-${f.name}`}
                  name={f.name}
                  type={"type" in f ? f.type : "text"}
                  autoComplete={f.autoComplete}
                  required
                  value={values[f.name]}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, [f.name]: e.target.value }));
                    if (errors[f.name]) setErrors((er) => ({ ...er, [f.name]: undefined }));
                  }}
                  aria-invalid={!!errors[f.name]}
                  aria-describedby={errors[f.name] ? `co-${f.name}-err` : undefined}
                  className={`mt-2 w-full border-b bg-transparent py-2.5 focus:outline-none ${
                    errors[f.name] ? "border-crimson" : "border-charcoal/25 focus:border-charcoal"
                  }`}
                />
                {errors[f.name] && (
                  <p id={`co-${f.name}-err`} className="mt-1.5 text-xs text-crimson">
                    {errors[f.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </fieldset>

        {formError && (
          <p id="checkout-error" role="alert" className="mt-8 text-sm text-crimson">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="eyebrow mt-10 w-full bg-crimson py-4 text-bone transition-colors hover:bg-burgundy disabled:opacity-60"
        >
          {sending ? "Placing order…" : `Place order · ${formatPrice(subtotal + shipping)}`}
        </button>
      </form>

      <aside aria-labelledby="summary-title" className="lg:col-span-5">
        <div className="bg-sand/60 p-6 md:p-8 lg:sticky lg:top-28">
          <h2 id="summary-title" className="eyebrow">
            Order summary
          </h2>
          <ul className="mt-6 divide-y divide-charcoal/10">
            {items.map((item) => (
              <li key={`${item.slug}-${item.size}`} className="flex gap-4 py-4">
                <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-burgundy">
                  <Image src={item.product.images[0].src} alt="" fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <p className="font-serif leading-tight">{item.product.name}</p>
                    <p className="text-sm tabular-nums">{formatPrice(item.lineTotal)}</p>
                  </div>
                  <p className="mt-1 text-xs text-stone">
                    {shadeById[item.product.shade].name} · {item.size}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper value={item.qty} label={item.product.name} onChange={(q) => setQty(item.slug, item.size, q)} />
                    <button type="button" onClick={() => remove(item.slug, item.size)} className="text-xs text-stone hover:text-charcoal hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t hairline pt-4 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="tabular-nums">{shipping ? formatPrice(shipping) : "Complimentary"}</dd>
            </div>
            <div className="flex justify-between border-t hairline pt-3 font-serif text-xl">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(subtotal + shipping)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
