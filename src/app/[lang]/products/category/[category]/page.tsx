import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, Locale } from "../../../dictionaries";
import CategoryView from "@/components/CategoryView";
import { PRODUCT_CATEGORIES, getCatalogProductsByCategory } from "@/lib/products";

interface PageProps {
  params: Promise<{ lang: string; category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { lang, category } = await params;

  if (!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number])) {
    notFound();
  }

  const [categoryProducts, dict] = await Promise.all([
    getCatalogProductsByCategory(category, lang),
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
