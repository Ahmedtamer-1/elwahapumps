import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { PRODUCT_CATEGORIES } from "@/data/categories";
import { getCatalogProducts } from "@/lib/products";
import { events } from "@/data/events";
import { serviceSlugs } from "./[lang]/services/[slug]/page";
import { agentSlugs } from "./[lang]/agents/[slug]/page";

const LOCALES = ["ar", "en"] as const;

/**
 * One <url> entry per locale per page, each carrying alternates.languages
 * for both locales plus x-default — the pattern Google's own docs use for
 * a bilingual sitemap, and the same pairing localizedAlternates()
 * (src/lib/seo.ts) puts in each page's own <head>.
 *
 * `path` is locale-less, e.g. "" for home or "/products/pump-submersible".
 */
function entry(path: string): MetadataRoute.Sitemap {
  const clean = path === "/" ? "" : path;
  const languages = {
    ar: `${SITE_URL}/ar${clean}`,
    en: `${SITE_URL}/en${clean}`,
    "x-default": `${SITE_URL}/ar${clean}`,
  };
  return LOCALES.map((lang) => ({
    url: `${SITE_URL}/${lang}${clean}`,
    alternates: { languages },
  }));
}

// Matches the layout's own revalidate window (src/app/[lang]/layout.tsx),
// so the sitemap's freshness claim doesn't outrun the pages it lists.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/about",
    "/products",
    "/services",
    "/agents",
    "/contact",
    "/catalogues",
    "/careers",
    "/locations",
    "/events",
    "/support",
    "/selector",
  ];

  // Product ids (slugs) are locale-independent — one fetch covers both
  // locale URLs below.
  const products = await getCatalogProducts("ar");

  const entries: MetadataRoute.Sitemap = [
    ...staticPaths.flatMap(entry),
    ...PRODUCT_CATEGORIES.flatMap((slug) => entry(`/products/category/${slug}`)),
    ...products.flatMap((p) => entry(`/products/${p.id}`)),
    ...serviceSlugs.flatMap((slug) => entry(`/services/${slug}`)),
    ...agentSlugs.flatMap((slug) => entry(`/agents/${slug}`)),
    ...events.flatMap((e) => entry(`/events/${e.id}`)),
  ];

  // /cart, /selector's own result URLs, /admin and /api are deliberately
  // excluded — see robots.ts and the noindex on cart/selector-with-query.

  return entries;
}
