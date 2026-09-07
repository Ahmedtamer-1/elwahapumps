"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Catches unhandled runtime errors thrown while rendering a page inside
 * this segment — e.g. an uncaught Prisma error in a page that has no
 * try/catch of its own. Without this, Next's bare default error screen
 * showed instead of the site chrome.
 *
 * Error boundaries must be Client Components. Like not-found.tsx, this
 * receives no `params`, so the locale is read from the URL.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const pathname = usePathname();
  const isAr = !pathname?.startsWith("/en");
  const lang = isAr ? "ar" : "en";

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-md text-center">
        <p className="text-sm font-mono uppercase tracking-widest text-brass mb-4">
          {isAr ? "خطأ" : "Error"}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-3">
          {isAr ? "حدث خطأ غير متوقع" : "Something went wrong"}
        </h1>
        <p className="text-sm text-stone mb-8">
          {isAr
            ? "حاول مرة أخرى، أو تواصل معنا إذا استمرت المشكلة."
            : "Try again, or contact us if the problem continues."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex items-center justify-center bg-pine hover:bg-field text-bone font-semibold text-sm px-6 py-3 transition-colors"
          >
            {isAr ? "إعادة المحاولة" : "Try again"}
          </button>
          <a
            href={`/${lang}`}
            className="inline-flex items-center justify-center border border-pine text-pine hover:bg-pine hover:text-bone font-semibold text-sm px-6 py-3 transition-colors"
          >
            {isAr ? "الصفحة الرئيسية" : "Go to homepage"}
          </a>
        </div>
      </div>
    </div>
  );
}
