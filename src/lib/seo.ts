import type { Locale } from "@/app/[lang]/dictionaries";

/**
 * The one place the production origin is written down. Used for
 * metadataBase (src/app/[lang]/layout.tsx), the sitemap and robots.
 */
export const SITE_URL = "https://elwahapumps.com";

/**
 * Canonical + hreflang for one page, given its locale-less path.
 *
 * `path` starts with "/" and carries no locale prefix — "" or "/" for a
 * home page, "/products/pump-submersible" for a product page. Returned
 * paths are relative; Next resolves them against `metadataBase` (set once,
 * in the root layout's generateMetadata) into the absolute URLs a crawler
 * actually needs. x-default points at the Arabic route: Arabic is the
 * primary locale and `/` redirects there (src/proxy.ts).
 *
 * One call site per page keeps this from drifting the way three copies of
 * an inline alternates object would.
 */
export function localizedAlternates(lang: Locale, path: string) {
  const clean = path === "/" ? "" : path;
  return {
    canonical: `/${lang}${clean}`,
    languages: {
      ar: `/ar${clean}`,
      en: `/en${clean}`,
      "x-default": `/ar${clean}`,
    },
  };
}
