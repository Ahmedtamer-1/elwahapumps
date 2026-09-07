// Bypasses every layout (see the `experimental.globalNotFound` comment in
// next.config.ts), so it must be a full document and import its own
// styles/fonts — nothing from [lang]/layout.tsx reaches this page.
import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 — El Waha Pumps",
  description: "The page you are looking for does not exist.",
};

/**
 * Handles paths that don't match any route at all — chiefly an invalid
 * :lang segment (e.g. /xyz), which fails hasLocale() inside
 * [lang]/layout.tsx and so throws notFound() from the layout itself. A
 * notFound() thrown by a layout bubbles past that segment's own
 * not-found.tsx (a sibling of the layout that failed) up to this file,
 * since there is no root app/layout.tsx here to compose an ordinary one
 * from. The locale is genuinely unknown at this point, so both languages
 * are shown together rather than guessed.
 */
export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={`${archivo.variable} ${plexArabic.variable}`}>
      <body className="bg-bone text-ink min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-md text-center">
          <p className="text-sm font-mono uppercase tracking-widest text-brass mb-4">404</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">الصفحة غير موجودة</h1>
          <h2 dir="ltr" className="text-lg font-semibold text-stone mb-6">
            Page not found
          </h2>
          <p className="text-sm text-stone mb-8">
            الصفحة التي تبحث عنها غير متاحة.
            <br />
            <span dir="ltr">The page you&apos;re looking for isn&apos;t available.</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ar"
              className="inline-flex items-center justify-center bg-pine hover:bg-field text-bone font-semibold text-sm px-6 py-3 transition-colors"
            >
              الصفحة الرئيسية
            </Link>
            <Link
              href="/en"
              dir="ltr"
              className="inline-flex items-center justify-center border border-pine text-pine hover:bg-pine hover:text-bone font-semibold text-sm px-6 py-3 transition-colors"
            >
              Homepage (English)
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
