"use client";

import { useState } from "react";
import { isEmail } from "@/lib/validation";

type Status = { state: "idle" | "sending" } | { state: "done" } | { state: "error"; message: string };

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setStatus({ state: "error", message: "Please enter a valid email address." });
      return;
    }
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus({ state: "done" });
      setEmail("");
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  };

  return (
    <section aria-labelledby="newsletter-title" className="bg-[#4a0000] text-bone">
      <div className="container-luxe grid gap-10 py-20 md:grid-cols-12 md:items-end md:py-28">
        <div className="md:col-span-6">
          <p className="eyebrow text-bone/70">The Red Letter</p>
          <h2 id="newsletter-title" className="display mt-5 text-4xl md:text-6xl">
            First to see every new shade.
          </h2>
        </div>
        <div className="md:col-span-6">
          {status.state === "done" ? (
            <p className="display text-3xl" role="status">
              Thank you. You&rsquo;re on the list.
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-3">
              <label htmlFor="newsletter-email" className="eyebrow block text-bone/70">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
                <input
                  id="newsletter-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status.state === "error") setStatus({ state: "idle" });
                  }}
                  aria-invalid={status.state === "error"}
                  aria-describedby="newsletter-help"
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 border-b border-bone/50 bg-transparent py-3 text-lg placeholder:text-bone/40 focus:border-bone focus:outline-none sm:mr-6"
                />
                <button
                  type="submit"
                  disabled={status.state === "sending"}
                  className="eyebrow bg-bone px-8 py-4 text-[#4a0000] transition-colors hover:bg-scarlet hover:text-bone disabled:opacity-60"
                >
                  {status.state === "sending" ? "Subscribing…" : "Subscribe"}
                </button>
              </div>
              <p id="newsletter-help" className="text-xs text-bone/70" aria-live="polite">
                {status.state === "error"
                  ? status.message
                  : "One letter a month. New shades, new pieces, no noise. Unsubscribe any time."}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
