"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { useCart } from "@/components/cart/CartProvider";
import { BagIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";

/** Perceived lightness (0–1) of a computed CSS colour, or null if it is (nearly) transparent. */
function lightness(color: string): number | null {
  const nums = color.match(/-?[\d.]+%?/g)?.map((n) => (n.endsWith("%") ? parseFloat(n) / 100 : parseFloat(n)));
  if (!nums || nums.length < 3) return null;
  const alpha = nums.length > 3 ? nums[3] : 1;
  if (alpha < 0.5) return null;
  if (color.startsWith("oklab") || color.startsWith("oklch")) return nums[0];
  const scale = color.startsWith("color(") ? 1 : 255;
  const [r, g, b] = nums.slice(0, 3).map((v) => v / scale);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Lightness of the page background at a viewport point, ignoring the navbar itself. */
function lightnessAt(x: number, y: number, header: HTMLElement): number {
  for (const el of document.elementsFromPoint(x, y)) {
    if (header.contains(el)) continue;
    for (let node: Element | null = el; node; node = node.parentElement) {
      const l = lightness(getComputedStyle(node).backgroundColor);
      if (l !== null) return l;
    }
    return 0;
  }
  return 0;
}

/** True when the page behind a navbar element is light, so that element's text should turn dark. */
function isLightBehind(el: HTMLElement | null, header: HTMLElement): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (!r.width) return false;
  const y = r.top + r.height / 2;
  const samples = [0.15, 0.5, 0.85].map((fx) => lightnessAt(r.left + r.width * fx, y, header));
  return samples.reduce((a, b) => a + b, 0) / samples.length > 0.55;
}

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { count, open } = useCart();
  // Which parts of the bar currently sit over a light background.
  const [onLight, setOnLight] = useState({ brand: false, links: [] as boolean[], actions: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const menuButton = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // The bar stays transparent; its text flips between light and dark to stay readable
  // over whatever is behind it. The brand, each link and the actions are judged separately because
  // the bar often spans light and dark content at once (e.g. a product grid).
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const header = headerRef.current;
      if (!header) return;
      const next = {
        brand: isLightBehind(brandRef.current, header),
        links: Array.from(linksRef.current?.children ?? [], (li) => isLightBehind(li as HTMLElement, header)),
        actions: isLightBehind(actionsRef.current, header),
      };
      setOnLight((prev) =>
        prev.brand === next.brand &&
        prev.actions === next.actions &&
        prev.links.join() === next.links.join()
          ? prev
          : next,
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const tone = (light: boolean) => (light && !menuOpen ? "text-charcoal" : "text-bone");
  const dark = onLight.actions && !menuOpen;

  return (
    <>
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50 bg-transparent"
      >
        <a
          href="#main"
          className="eyebrow sr-only bg-bone px-4 py-2 text-charcoal focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
        >
          Skip to content
        </a>
        <nav aria-label="Primary" className="container-luxe flex h-16 items-center gap-6 md:h-20">
          <Link
            ref={brandRef}
            href="/"
            className={`font-serif text-2xl tracking-[0.32em] transition-colors duration-300 md:text-[1.7rem] ${tone(onLight.brand)}`}
            aria-label={`${siteConfig.legalName}, home`}
            onClick={() => setMenuOpen(false)}
          >
            {siteConfig.brandName}
          </Link>

          <ul
            ref={linksRef}
            className="ml-6 hidden items-center gap-7 lg:flex"
          >
            {siteConfig.nav.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className={`transition-colors duration-300 ${tone(!!onLight.links[i])}`}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`eyebrow relative py-2 transition-opacity hover:opacity-100 ${
                      active ? "opacity-100" : "opacity-70"
                    } after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-500 ${
                      active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div
            ref={actionsRef}
            className={`ml-auto flex items-center gap-2 transition-colors duration-300 md:gap-4 ${tone(onLight.actions)}`}
          >
            <Link
              href={siteConfig.cta.href}
              className={`eyebrow hidden border px-5 py-3 transition-colors sm:inline-block ${
                dark
                  ? "border-charcoal/40 hover:border-charcoal hover:bg-charcoal hover:text-bone"
                  : "border-bone/40 hover:border-bone hover:bg-bone hover:text-charcoal"
              }`}
            >
              {siteConfig.cta.label}
            </Link>
            <button
              type="button"
              onClick={open}
              className="relative p-2 transition-opacity hover:opacity-70"
              aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <BagIcon width={22} height={22} />
              <span
                className={`absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.625rem] font-semibold tabular-nums transition-colors ${
                  count > 0 ? "bg-scarlet text-bone" : dark ? "bg-charcoal/10 text-charcoal/70" : "bg-bone/15 text-bone/70"
                }`}
                aria-hidden
              >
                {count}
              </span>
            </button>
            <button
              ref={menuButton}
              type="button"
              className="-mr-2 p-2 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <CloseIcon width={22} height={22} /> : <MenuIcon width={22} height={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise trap this fixed sheet. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-ink px-4 pb-10 pt-8 text-bone md:top-20 lg:hidden"
            initial={{ opacity: 0, y: reduce ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="space-y-1">
              {siteConfig.nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="display block border-b border-bone/10 py-4 text-4xl"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <Link
              href={siteConfig.cta.href}
              onClick={() => setMenuOpen(false)}
              className="eyebrow mt-10 block bg-crimson py-4 text-center text-bone"
            >
              {siteConfig.cta.label}
            </Link>
            <p className="mt-auto pt-10 text-sm text-bone/50">{siteConfig.contact.email}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
