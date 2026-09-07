import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

/**
 * Public, machine-readable product feed (PLAN.md S3-T09). There was no
 * way for a procurement agent, a comparison tool, or an LLM doing its own
 * fetch to consume the catalogue except by scraping rendered HTML. A
 * Google Merchant feed isn't viable here — every price is quoted on
 * request, not published — so a plain JSON catalogue is the closer fit.
 *
 * Matches the layout's own revalidate window so this can't claim
 * freshness the page content doesn't have.
 */
export const revalidate = 60;

export async function GET() {
  const [enProducts, arProducts] = await Promise.all([
    getCatalogProducts("en"),
    getCatalogProducts("ar"),
  ]);
  const arById = new Map(arProducts.map((p) => [p.id, p]));

  const products = enProducts.map((en) => {
    const ar = arById.get(en.id);
    return {
      slug: en.id,
      category: en.category,
      name: { en: en.title, ar: ar?.title ?? en.title },
      description: { en: en.desc, ar: ar?.desc ?? en.desc },
      modelNo: en.modelNo ?? null,
      specs: { en: en.specs, ar: ar?.specs ?? en.specs },
      image: en.gallery[0] ?? null,
      // Price is deliberately omitted — every product is quoted on
      // request, and there is no default price to publish.
      url: {
        en: `${SITE_URL}/en/products/${en.id}`,
        ar: `${SITE_URL}/ar/products/${en.id}`,
      },
    };
  });

  return NextResponse.json(
    { count: products.length, products },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
