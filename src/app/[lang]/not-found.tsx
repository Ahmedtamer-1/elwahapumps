import NotFoundContent from "@/components/NotFoundContent";

/**
 * Renders whenever notFound() is thrown by a page inside this segment
 * (an unknown product/category/service/agent/event slug, or any unmatched
 * path caught by [...rest]/page.tsx) — see products/[slug]/page.tsx,
 * products/category/[category]/page.tsx, services/[slug]/page.tsx,
 * events/[slug]/page.tsx.
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
 * from params here. NotFoundContent, a client child, reads it from the
 * pathname instead, so an English 404 is entirely English. (The segment
 * boundary itself stays this Server Component.)
 */
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
      <NotFoundContent />
    </div>
  );
}
