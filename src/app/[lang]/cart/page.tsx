import React from "react";
import { localizedAlternates } from "@/lib/seo";
import CartView from "@/components/cart/CartView";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  return {
    title: lang === "ar" ? "سلة الطلب" : "Request Cart",
    alternates: localizedAlternates(lang === "ar" ? "ar" : "en", "/cart"),
    // A visitor's own working list, not content — nothing to rank on.
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({ params }: PageProps) {
  const { lang } = await params;
  const isAr = lang === "ar";

  return (
    <div className="bg-neutral-50 min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-neutral-900 mb-2">
          {isAr ? "سلة الطلب" : "Request Cart"}
        </h1>
        <p className="text-neutral-500 mb-8 text-sm max-w-2xl">
          {isAr
            ? "راجع المنتجات المختارة ثم أرسل طلبك مباشرة عبر واتساب ليتواصل معك فريق المبيعات."
            : "Review your selected equipment, then send the list straight to our sales team on WhatsApp."}
        </p>

        <CartView lang={lang} />
      </div>
    </div>
  );
}
