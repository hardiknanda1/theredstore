import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { instrumentSans, ptSerif } from "@/lib/fonts";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.legalName} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.brandName}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.legalName,
    description: siteConfig.description,
    images: [{ url: "/frames/desktop/f090.jpg", width: 1280, height: 720 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#2b0508",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${ptSerif.variable} ${instrumentSans.variable} antialiased`}>
      <body className="min-h-svh">
        <CartProvider>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
