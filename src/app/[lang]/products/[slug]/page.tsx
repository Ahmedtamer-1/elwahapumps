import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, Locale } from "../../dictionaries";
import ProductDetailView from "@/components/ProductDetailView";
import { getCatalogProduct, getProductSlugs } from "@/lib/products";
import { categoryLabel } from "@/data/categories";
import { localizedAlternates } from "@/lib/seo";
import { breadcrumbSchema, jsonLdScriptProps, productSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

/**
 * Prebuild every product in both locales (S4-T12).
 *
 * These pages were rendered on demand, so the first visitor to each one paid
 * for the query and the render — and on a small VPS that first visitor is
 * often the search-engine crawler forming its impression of the page.
 *
 * The layout sets `revalidate = 60`, so this seeds the cache rather than
 * freezing it: prices stay at most a minute stale, and an edit in /admin
 * calls revalidatePath for an immediate refresh.
 *
 * A product added after the build is not in this list. It still renders —
 * Next falls back to rendering unknown params on demand — it simply misses
 * the prebuilt head start.
 */
export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return ["ar", "en"].flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const product = await getCatalogProduct(slug, lang);
  if (!product) return {};
  return {
    title: product.title,
    description: product.desc,
    alternates: localizedAlternates(lang, `/products/${slug}`),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { lang, slug } = await params;

  const product = await getCatalogProduct(slug, lang);
  if (!product) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);

  return (
    <div className="bg-white min-h-screen pb-20">
      <script
        {...jsonLdScriptProps(
          productSchema(lang as Locale, product, `/products/${slug}`),
        )}
      />
      {/* Schema only. ProductDetailView renders the visible breadcrumb bar
          itself, so rendering <Breadcrumbs> here as well put two nav
          landmarks with the same name on the page — the trail is shown
          once, and this keeps the BreadcrumbList it needs (S1-T10). */}
      <script
        {...jsonLdScriptProps(
          breadcrumbSchema(lang as Locale, [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.products, path: "/products" },
            { name: categoryLabel(dict, product.category), path: `/products/category/${product.category}` },
            { name: product.title, path: `/products/${slug}` },
          ]),
        )}
      />
      {/* Main Content */}
      <ProductDetailView
        product={product}
        lang={lang}
        dict={dict}
        title={product.title}
        desc={product.desc}
      />
    </div>
  );
}
