import React from "react";
import { localizedAlternates } from "@/lib/seo";
import CartView from "@/components/cart/CartView";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

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

  /* A signed-in customer should not type their name and number again. Read
     from the CRM record rather than the session so an office correction to
     the number is what gets used. Signed out, both are undefined and the
     form opens empty exactly as before. */
  const session = await getCurrentCustomer();
  const customer = session
    ? await prisma.customer.findUnique({
        where: { id: session.customerId },
        select: { name: true, phone: true },
      })
    : null;

  return (
    <div className="bg-bone min-h-screen pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-ink mb-2">
          {isAr ? "سلة الطلب" : "Request Cart"}
        </h1>
        <p className="text-stone mb-8 text-sm max-w-2xl">
          {isAr
            ? "راجع المنتجات المختارة ثم أرسل طلبك مباشرة عبر واتساب ليتواصل معك فريق المبيعات."
            : "Review your selected equipment, then send the list straight to our sales team on WhatsApp."}
        </p>

        <CartView
          lang={lang}
          defaultName={customer?.name ?? session?.name}
          defaultPhone={customer?.phone ?? undefined}
        />
      </div>
    </div>
  );
}
