import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <div className="bg-oxblood pt-16 md:pt-20" />
      <CheckoutView />
    </>
  );
}
