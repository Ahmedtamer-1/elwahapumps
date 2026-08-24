import React from "react";
import { notFound } from "next/navigation";
import { Archivo, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { getDictionary, hasLocale, Locale } from "./dictionaries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SplashScreen from "@/components/SplashScreen";
import { CartProvider } from "@/components/cart/CartContext";
import "../globals.css";

/**
 * Three families, one job each — Brand Report §05.
 *
 * Archivo sets Latin, IBM Plex Sans Arabic sets Arabic, and IBM Plex Mono
 * is reserved for specifications, model numbers and eyebrow labels. The
 * `--font-sans` stack in globals.css lists Archivo before Plex Arabic so
 * the browser resolves each glyph to the family that covers it.
 */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
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
    // §07 voice: specific over superlative, and the record stated correctly.
    // Founding year and agency count are the ones in lib/company.ts — keep
    // them in step if that file changes.
    description: isAr
      ? "توريد وتركيب وصيانة طلمبات الأعماق الغاطسة في مصر منذ عام 2013. توكيلات حصرية لإحدى عشرة شركة عالمية، شهادة ISO 9001، وصيانة للمواتير ولوحات التشغيل ومنظمات الجهد."
      : "Deep-well pumping equipment supplied, installed and maintained across Egypt since 2013. Exclusive Egyptian agent for 11 manufacturers, ISO 9001 certified, with service for motors, control panels and voltage regulators.",
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

  const dict = await getDictionary(lang as Locale);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = `${archivo.variable} ${plexArabic.variable} ${plexMono.variable}`;

  return (
    <html lang={lang} dir={dir} className={fontClass}>
      <body className="bg-white text-ink antialiased font-sans flex flex-col min-h-screen">
        <CartProvider>
          <SplashScreen />
          <Header lang={lang} dict={dict} />

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
