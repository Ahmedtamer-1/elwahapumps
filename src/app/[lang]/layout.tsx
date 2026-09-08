import React from "react";
import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { Archivo, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { getDictionary, hasLocale, Locale } from "./dictionaries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/components/cart/CartContext";
import { AGENCY_COUNT, FOUNDED, NAME_AR, NAME_EN } from "@/lib/company";
import { SITE_URL, localizedAlternates } from "@/lib/seo";
import { jsonLdScriptProps, organizationSchema, websiteSchema } from "@/lib/schema";
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

export const viewport: Viewport = {
  themeColor: "#0e3b2e",
};

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  const isAr = lang === "ar";
  // Title template uses the short brand form (lib/company.ts), not the
  // full legal name — the Arabic legal name alone is 36 characters, which
  // left almost no budget for the page's own title before the ~60-char
  // point search results start truncating at.
  const siteName = isAr ? NAME_AR : NAME_EN;
  const description = isAr
    ? `توريد وتركيب وصيانة طلمبات الأعماق الغاطسة في مصر منذ عام ${FOUNDED}. توكيلات حصرية لـ${AGENCY_COUNT} شركة عالمية، شهادة ISO 9001، وصيانة للمواتير ولوحات التشغيل ومنظمات الجهد.`
    : `Deep-well pumping equipment supplied, installed and maintained across Egypt since ${FOUNDED}. Exclusive Egyptian agent for ${AGENCY_COUNT} manufacturers, ISO 9001 certified, with service for motors, control panels and voltage regulators.`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      template: `%s | ${siteName}`,
      default: isAr
        ? `${siteName} | توريد وصيانة طلمبات ومواتير`
        : `${siteName} | Supply & Maintenance`,
    },
    // §07 voice: specific over superlative, and the record stated correctly.
    // Founding year and agency count are interpolated from lib/company.ts
    // so this can never drift out of step with it again.
    description,
    alternates: localizedAlternates(lang, "/"),
    openGraph: {
      type: "website",
      siteName,
      locale: isAr ? "ar_EG" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_EG",
      title: siteName,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
    },
    // No explicit `icons` block — src/app/favicon.ico is already picked up
    // by Next's file convention. Declaring it again here duplicated the
    // <link rel="icon"> tag.
    robots: {
      // Lets Google and Bing quote full passages and full-size images
      // in an AI Overview or chat answer, rather than truncating at
      // their (much shorter) defaults — content worth citing should be
      // citable in full, not just as a fragment.
      "max-snippet": -1,
      "max-image-preview": "large",
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
        {/* One Organization/LocalBusiness + WebSite graph on every page —
            the live WordPress site emits a Yoast schema graph today, so
            skipping this would make the migration lose structured data
            rather than gain it. Facts come from lib/company.ts, so they
            can't drift from the visible copy the way "11 agencies" and
            AGENCY_COUNT=12 once did. */}
        <script {...jsonLdScriptProps(organizationSchema(lang))} />
        <script {...jsonLdScriptProps(websiteSchema(lang))} />
        {/* Every page opens with a fixed header carrying ten-plus links and
            a mega-menu. Without this, reaching the content by keyboard
            means tabbing through all of it on every navigation (S6-T05).
            Visually hidden until focused, then it lands over the header. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:bg-pine focus:text-bone focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:outline-2 focus:outline-offset-2 focus:outline-brass"
        >
          {lang === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
        </a>
        <CartProvider>
          <Header lang={lang} dict={dict} />

          {/* Main Content Area. tabIndex={-1} so the skip link can actually
              move focus here, not just scroll to it. */}
          <main id="main" tabIndex={-1} className="flex-grow outline-none">
            {children}
          </main>

          <Footer lang={lang} dict={dict} />
          <WhatsAppButton lang={lang} />
        </CartProvider>
      </body>
    </html>
  );
}
