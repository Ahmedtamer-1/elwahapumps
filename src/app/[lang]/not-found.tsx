import Link from "next/link";

/**
 * Renders whenever notFound() is thrown by a page inside this segment
 * (an unknown product/category/service/agent/event slug, or any unmatched
 * path caught by [...rest]/page.tsx) — see products/[slug]/page.tsx,
 * products/category/[category]/page.tsx, services/[slug]/page.tsx,
 * agents/[slug]/page.tsx, events/[slug]/page.tsx.
 *
 * It is still wrapped by [lang]/layout.tsx (the layout only stops wrapping
 * a not-found boundary when the layout itself is what threw), so the site
 * header, footer, <html lang/dir> and dictionary-driven chrome are already
 * in place — this file only owns the message.
 *
 * Deliberately a Server Component, not "use client" with usePathname() to
 * read the locale: tested and confirmed in this Next 16.2.10 + Turbopack
 * build that a Client Component here is NOT wired up as the segment's
 * not-found boundary — Next silently falls back to its own generic default
 * 404 instead (verified with a marker string that never appeared in the
 * response until this was made a plain Server Component). Since
 * not-found.tsx receives no props either way, the locale can't be read
 * from params — so, like global-not-found.tsx, this shows both languages
 * rather than guessing one.
 */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-md text-center">
        <p className="text-sm font-mono uppercase tracking-widest text-brass mb-4">404</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-1">الصفحة غير موجودة</h1>
        <h2 dir="ltr" className="text-lg font-semibold text-stone mb-6">
          Page not found
        </h2>
        <p className="text-sm text-stone mb-8">
          الصفحة التي تبحث عنها غير متاحة، أو تم نقلها.
          <br />
          <span dir="ltr">The page you&apos;re looking for isn&apos;t available, or it moved.</span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/ar"
            className="inline-flex items-center justify-center bg-pine hover:bg-field text-bone font-semibold text-sm px-6 py-3 transition-colors"
          >
            الصفحة الرئيسية
          </Link>
          <Link
            href="/ar/products"
            className="inline-flex items-center justify-center border border-pine text-pine hover:bg-pine hover:text-bone font-semibold text-sm px-6 py-3 transition-colors"
          >
            تصفح المنتجات
          </Link>
          <Link
            href="/ar/contact"
            className="inline-flex items-center justify-center border border-pine text-pine hover:bg-pine hover:text-bone font-semibold text-sm px-6 py-3 transition-colors"
          >
            تواصل معنا
          </Link>
        </div>
        <div dir="ltr" className="flex flex-wrap items-center justify-center gap-3 mt-3">
          <Link
            href="/en"
            className="inline-flex items-center justify-center bg-pine hover:bg-field text-bone font-semibold text-sm px-6 py-3 transition-colors"
          >
            Homepage
          </Link>
          <Link
            href="/en/products"
            className="inline-flex items-center justify-center border border-pine text-pine hover:bg-pine hover:text-bone font-semibold text-sm px-6 py-3 transition-colors"
          >
            Browse products
          </Link>
          <Link
            href="/en/contact"
            className="inline-flex items-center justify-center border border-pine text-pine hover:bg-pine hover:text-bone font-semibold text-sm px-6 py-3 transition-colors"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
