import React from "react";
import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { Archivo, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { getDictionary, hasLocale, Locale, type Dictionary } from "./dictionaries";
import Header, { type HeaderDict } from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SiteChrome from "@/components/SiteChrome";
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
/*
 * Font preloads (S4-T11 follow-up). Next injects one <link rel="preload"> per
 * font file, and this layout used to produce ten: four Archivo weights, four
 * Plex Arabic weights and two Plex Mono weights, all racing the hero image
 * for bandwidth on every page. Now:
 *
 *  - Archivo loads as its variable font — no `weight` list — so one file
 *    covers every weight from 400 to 900 (it also gives font-black a real
 *    900 instead of a synthesised one). It is the one preloaded file: Latin
 *    resolves to it first on both locales, including the model numbers and
 *    digits on Arabic pages.
 *  - Plex Arabic and Plex Mono keep their files but are not preloaded. They
 *    are still fetched as soon as the stylesheet asks for them, and
 *    `display: swap` with Next's metric-matched fallback keeps text visible
 *    and the layout still while they arrive. Plex Arabic is not a variable
 *    font, so preloading it means all four weights — on English pages too,
 *    where it renders nothing.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

/**
 * Arabic only (S4-T11).
 *
 * This also carried the `latin` subset. Next injects a preload link per
 * subset, so that was four extra woff2 files on every page in both locales,
 * for glyphs that never render from this family: `--font-sans` lists Archivo
 * first, so Latin always resolves there, and Plex Arabic is only reached for
 * glyphs Archivo lacks. The `--font-arabic` stack in globals.css is declared
 * but referenced nowhere, so nothing asks this family for Latin either.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});

/** Only what the header reads — it is a client component, so its props ship in every page's HTML. */
function headerDict(dict: Dictionary): HeaderDict {
  const p = dict.productsPage;
  return {
    nav: dict.nav,
    productsPage: {
      types: p.types,
      pumps: p.pumps,
      motors: p.motors,
      electrical: p.electrical,
      pipes: p.pipes,
      spareParts: p.spareParts,
      cables: p.cables,
      all: p.all,
    },
  };
}

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
    ? `توريد وتركيب وصيانة طلمبات الأعماق الغاطسة في مصر منذ عام ${FOUNDED}. توكيلات حصرية لـ${AGENCY_COUNT} شركة عالمية، وصيانة للمواتير ولوحات التشغيل ومنظمات الجهد.`
    : `Deep-well pumping equipment supplied, installed and maintained across Egypt since ${FOUNDED}. Exclusive Egyptian agent for ${AGENCY_COUNT} manufacturers, with service for motors, control panels and voltage regulators.`;

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
          <SiteChrome>
            <Header lang={lang} dict={headerDict(dict)} />
          </SiteChrome>

          {/* Main Content Area. tabIndex={-1} so the skip link can actually
              move focus here, not just scroll to it. */}
          <main id="main" tabIndex={-1} className="flex-grow outline-none">
            {children}
          </main>

          <SiteChrome>
            <Footer lang={lang} dict={dict} />
            <WhatsAppButton lang={lang} />
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
