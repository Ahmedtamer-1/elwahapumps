import { NextResponse } from "next/server";
import { getCatalogProduct } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [en, ar] = await Promise.all([
    getCatalogProduct(slug, "en"),
    getCatalogProduct(slug, "ar"),
  ]);

  if (!en) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = {
    slug: en.id,
    category: en.category,
    name: { en: en.title, ar: ar?.title ?? en.title },
    description: { en: en.desc, ar: ar?.desc ?? en.desc },
    modelNo: en.modelNo ?? null,
    specs: { en: en.specs, ar: ar?.specs ?? en.specs },
    tableSpecs: { en: en.tableSpecsEn, ar: en.tableSpecsAr },
    features: { en: en.featuresEn ?? [], ar: en.featuresAr ?? [] },
    modelGroups: en.modelGroups ?? [],
    specGroups: en.specGroups ?? [],
    options: en.options,
    variants: en.variantRows.map((v) => ({
      id: v.id,
      selections: v.selections,
      specs: v.specs,
      sku: v.sku,
    })),
    gallery: en.gallery,
    url: {
      en: `${SITE_URL}/en/products/${en.id}`,
      ar: `${SITE_URL}/ar/products/${en.id}`,
    },
  };

  return NextResponse.json(product, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
