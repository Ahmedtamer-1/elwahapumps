import React from "react";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { getDictionary, hasLocale, Locale } from "./dictionaries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SplashScreen from "@/components/SplashScreen";
import { CartProvider } from "@/components/cart/CartContext";
import { getCatalogProducts } from "@/lib/products";
import "../globals.css";

// Load Google Fonts
const ibmPlex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export async function generateStaticParams() {
  return [{ lang: "ar" }, { lang: "en" }];
}

/**
 * Every page renders the header mega-menu, which is built from the product
 * catalogue in the database — so nothing under this layout can be baked at
 * build time without going stale when staff edit products. ISR keeps the
 * static-site speed while capping staleness at a minute; product writes also
 * call revalidatePath for an immediate refresh.
 */
export const revalidate = 60;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  const isAr = lang === "ar";
  return {
    title: {
      template: isAr 
        ? "%s | شركة الواحة لخدمات الآبار والطلمبات" 
        : "%s | El Waha Pumps & Wells Services",
      default: isAr
        ? "شركة الواحة لخدمات الآبار والطلمبات | توريد وصيانة طلمبات ومواتير"
        : "El Waha Pumps & Wells Services | Supply & Maintenance",
    },
    description: isAr
      ? "شركة الواحة لخدمات الآبار والطلمبات بمصر، خبرة 20 عاماً في حفر الآبار وتوريد وصيانة الطلمبات الغاطسة، المحركات، لوحات التشغيل الكهربائية ومنظمات الجهد."
      : "El Waha Pumps Company in Egypt, 20+ years of experience in drilling wells, supply, and maintenance of submersible pumps, motors, and electrical panels.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  // Narrow type or trigger 404
  if (!hasLocale(lang)) {
    notFound();
  }

  const [dict, products] = await Promise.all([
    getDictionary(lang as Locale),
    getCatalogProducts(lang),
  ]);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = ibmPlex.variable;

  // The mega-menu only needs identity, not the full spec payload.
  const menuProducts = products.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
  }));

  return (
    <html lang={lang} dir={dir} className={fontClass}>
      <body className="bg-white text-neutral-900 antialiased font-sans flex flex-col min-h-screen">
        <CartProvider>
          <SplashScreen />
          <Header lang={lang} dict={dict} products={menuProducts} />

          {/* Main Content Area */}
          <main className="flex-grow">
            {children}
          </main>

          <Footer lang={lang} dict={dict} />
          <WhatsAppButton lang={lang} />
        </CartProvider>
      </body>
    </html>
  );
}
