"use client";

import { useLayoutEffect, useState } from "react";
import { siteConfig } from "@/config/site";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", topic: siteConfig.contactTopics[0] as string, message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  // Start fresh rather than showing an old confirmation after navigating back.
  useLayoutEffect(() => () => setSent(null), []);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (key in errors) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFailure(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? {});
        return;
      }
      setSent(data.reference);
      setValues((v) => ({ ...v, message: "" }));
    } catch {
      setFailure("We couldn't send your message. Please try again or email us directly.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className="border hairline p-8">
        <p className="display text-4xl">Message received.</p>
        <p className="mt-4 text-sm text-graphite">
          Reference <span className="font-medium text-charcoal">{sent}</span>. The studio replies within one working day.
        </p>
        <button type="button" onClick={() => setSent(null)} className="eyebrow mt-8 border-b border-charcoal pb-1">
          Send another message
        </button>
      </div>
    );
  }

  const inputCls = (bad?: string) =>
    `mt-2 w-full border-b bg-transparent py-2.5 focus:outline-none ${bad ? "border-crimson" : "border-charcoal/25 focus:border-charcoal"}`;

  return (
    <form onSubmit={submit} noValidate className="grid gap-7 sm:grid-cols-2">
      <div>
        <label htmlFor="c-name" className="eyebrow text-stone">
          Name
        </label>
        <input id="c-name" autoComplete="name" value={values.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "c-name-err" : undefined} className={inputCls(errors.name)} />
        {errors.name && <p id="c-name-err" className="mt-1.5 text-xs text-crimson">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="c-email" className="eyebrow text-stone">
          Email
        </label>
        <input id="c-email" type="email" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "c-email-err" : undefined} className={inputCls(errors.email)} />
        {errors.email && <p id="c-email-err" className="mt-1.5 text-xs text-crimson">{errors.email}</p>}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-topic" className="eyebrow text-stone">
          Topic
        </label>
        <select id="c-topic" value={values.topic} onChange={set("topic")} className={`${inputCls()} cursor-pointer`}>
          {siteConfig.contactTopics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="eyebrow text-stone">
          Message
        </label>
        <textarea id="c-message" rows={5} value={values.message} onChange={set("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "c-message-err" : undefined} className={`${inputCls(errors.message)} resize-y`} />
        {errors.message && <p id="c-message-err" className="mt-1.5 text-xs text-crimson">{errors.message}</p>}
      </div>
      {failure && (
        <p role="alert" className="text-sm text-crimson sm:col-span-2">
          {failure}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={sending} className="eyebrow bg-crimson px-10 py-4 text-bone transition-colors hover:bg-burgundy disabled:opacity-60">
          {sending ? "Sending…" : "Get in touch"}
        </button>
      </div>
    </form>
  );
}
