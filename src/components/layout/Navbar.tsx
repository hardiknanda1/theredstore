"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { useCart } from "@/components/cart/CartProvider";
import { BagIcon, CloseIcon, MenuIcon } from "@/components/ui/icons";

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const solid = scrolled || menuOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-bone transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid
            ? "border-b border-bone/10 bg-ink/90 backdrop-blur-md"
            : "border-b border-transparent bg-gradient-to-b from-ink/35 to-transparent"
        }`}
      >
        <a
          href="#main"
          className="eyebrow sr-only bg-bone px-4 py-2 text-charcoal focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
        >
          Skip to content
        </a>
        <nav aria-label="Primary" className="container-luxe flex h-16 items-center gap-6 md:h-20">
          <Link
            href="/"
            className="font-serif text-2xl tracking-[0.32em] md:text-[1.7rem]"
            aria-label={`${siteConfig.legalName}, home`}
            onClick={() => setMenuOpen(false)}
          >
            {siteConfig.brandName}
          </Link>

          <ul className="ml-6 hidden items-center gap-7 lg:flex">
            {siteConfig.nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
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

          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <Link
              href={siteConfig.cta.href}
              className="eyebrow hidden border border-bone/40 px-5 py-3 transition-colors hover:border-bone hover:bg-bone hover:text-charcoal sm:inline-block"
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
                  count > 0 ? "bg-scarlet text-bone" : "bg-bone/15 text-bone/70"
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
