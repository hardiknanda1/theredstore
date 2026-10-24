import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the RED studio about orders, sizing, bridal appointments or press.",
};

export default function ContactPage() {
  return (
    <>
      <header className="bg-oxblood pb-14 pt-32 text-bone md:pb-20 md:pt-44">
        <div className="container-luxe">
          <p className="eyebrow text-scarlet">Contact</p>
          <h1 className="display mt-5 text-6xl md:text-8xl">Get in touch</h1>
        </div>
      </header>
      <div className="container-luxe grid gap-16 py-16 md:py-24 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-4">
          <div>
            <h2 className="eyebrow text-stone">Studio</h2>
            <address className="mt-4 font-serif text-xl not-italic leading-relaxed">
              {siteConfig.contact.address.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
          </div>
          <div>
            <h2 className="eyebrow text-stone">Write</h2>
            <a href={`mailto:${siteConfig.contact.email}`} className="mt-4 block break-all font-serif text-xl hover:text-crimson">
              {siteConfig.contact.email}
            </a>
            <p className="mt-1 text-sm text-graphite">{siteConfig.contact.phone}</p>
          </div>
          <div>
            <h2 className="eyebrow text-stone">Hours</h2>
            <p className="mt-4 text-sm text-graphite">{siteConfig.contact.hours}</p>
            <p className="mt-2 text-sm text-graphite">Bridal fittings by appointment only.</p>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <p className="mb-10 max-w-lg text-graphite">
            Questions about an order, a fit or a made-to-order piece? Send us a note and a member of the studio will reply
            within one working day.
          </p>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
