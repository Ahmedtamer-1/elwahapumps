"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const COPY = {
  ar: {
    title: "الصفحة غير موجودة",
    body: "الصفحة التي تبحث عنها غير متاحة، أو تم نقلها.",
    home: "الصفحة الرئيسية",
    products: "تصفح المنتجات",
    contact: "تواصل معنا",
  },
  en: {
    title: "Page not found",
    body: "The page you're looking for isn't available, or it moved.",
    home: "Homepage",
    products: "Browse products",
    contact: "Contact us",
  },
} as const;

/**
 * The body of [lang]/not-found.tsx, in the page's own language.
 *
 * not-found.tsx gets no params, and it has to stay a Server Component (see
 * the note there), so the locale is read here instead: this is a client
 * child, and usePathname() works during the server render too, so the
 * right language is in the HTML from the first byte. It used to print both
 * languages, which left Arabic headings and buttons on every English 404.
 */
export default function NotFoundContent() {
  const pathname = usePathname() ?? "";
  const lang = pathname.split("/")[1] === "en" ? "en" : "ar";
  const t = COPY[lang];

  return (
    <div className="max-w-md text-center">
      <p className="text-sm font-mono uppercase tracking-widest text-brass mb-4">404</p>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-4">{t.title}</h1>
      <p className="text-sm text-stone mb-8">{t.body}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${lang}`}
          className="inline-flex items-center justify-center bg-pine hover:bg-field text-bone font-semibold text-sm px-6 py-3 transition-colors"
        >
          {t.home}
        </Link>
        <Link
          href={`/${lang}/products`}
          className="inline-flex items-center justify-center border border-pine text-pine hover:bg-pine hover:text-bone font-semibold text-sm px-6 py-3 transition-colors"
        >
          {t.products}
        </Link>
        <Link
          href={`/${lang}/contact`}
          className="inline-flex items-center justify-center border border-pine text-pine hover:bg-pine hover:text-bone font-semibold text-sm px-6 py-3 transition-colors"
        >
          {t.contact}
        </Link>
      </div>
    </div>
  );
}
