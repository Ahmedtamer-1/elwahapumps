import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, Locale } from "../../../dictionaries";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import CategoryView from "@/components/CategoryView";
import PageHeader from "@/components/PageHeader";
import {
  PRODUCT_CATEGORIES,
  getCatalogListProductsByCategory,
  getCategoryCounts,
} from "@/lib/products";
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

  const [categoryProducts, counts, dict] = await Promise.all([
    getCatalogListProductsByCategory(category, lang),
    getCategoryCounts(),
    getDictionary(lang as Locale),
  ]);

  const isAr = lang === "ar";
  const title = categoryLabel(dict, category);

  return (
    <div className="bg-white min-h-screen">
      {/* The same masthead every interior page opens on, rather than the
          category name buried in the old dark sidebar. The eyebrow names the
          section, so the h1 is free to be the category alone. */}
      <PageHeader
        eyebrow={dict.nav.products}
        title={title}
        subtitle={dict.productsPage.subtitle}
      >
        {/* Sizing is the question a reader arrives at a pump category with,
            and the selector is the one place on the site that answers it. */}
        <Link
          href={`/${lang}/selector`}
          className="inline-flex items-center gap-2 bg-brass hover:bg-bone text-ink font-semibold text-sm px-8 py-4 transition-colors active-scale-98"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          {isAr ? "افتح دليل اختيار الطلمبة" : "Open the pump selector"}
        </Link>
      </PageHeader>

      <CategoryView
        products={categoryProducts}
        category={category}
        lang={lang}
        dict={dict}
        counts={counts}
      />
    </div>
  );
}
