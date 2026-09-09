import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, Locale } from "../../../dictionaries";
import CategoryView from "@/components/CategoryView";
import { PRODUCT_CATEGORIES, getCatalogListProductsByCategory } from "@/lib/products";
import { categoryLabel } from "@/data/categories";
import { localizedAlternates } from "@/lib/seo";

interface PageProps {
  params: Promise<{ lang: string; category: string }>;
}

/**
 * Prebuild all seven categories in both locales (S4-T12).
 *
 * The set is fixed and known at build time — the page 404s on anything not in
 * PRODUCT_CATEGORIES — so there is nothing to discover at runtime. As with the
 * product pages, the layout's `revalidate = 60` keeps these fresh; this only
 * removes the cold render the first visitor used to pay for.
 */
export async function generateStaticParams() {
  return ["ar", "en"].flatMap((lang) =>
    PRODUCT_CATEGORIES.map((category) => ({ lang, category })),
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, category } = await params;
  if (!hasLocale(lang)) return {};
  if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) return {};
  const dict = await getDictionary(lang);
  const label = categoryLabel(dict, category);
  return {
    title: label,
    description: dict.productsPage.subtitle,
    alternates: localizedAlternates(lang, `/products/category/${category}`),
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { lang, category } = await params;

  if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) {
    notFound();
  }

  const [categoryProducts, dict] = await Promise.all([
    getCatalogListProductsByCategory(category, lang),
    getDictionary(lang as Locale),
  ]);

  return (
    <div className="bg-white min-h-screen">
      <CategoryView
        products={categoryProducts}
        category={category}
        lang={lang}
        dict={dict}
      />
    </div>
  );
}
