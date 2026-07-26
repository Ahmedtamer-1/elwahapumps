import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, Locale } from "../../../dictionaries";
import { products } from "@/data/products";
import CategoryView from "@/components/CategoryView";

interface PageProps {
  params: Promise<{ lang: string; category: string }>;
}

export async function generateStaticParams() {
  const locales = ["ar", "en"];
  const categories = ["pumps", "motors", "electrical", "pipes", "thrust-bearings", "cables"];
  const params: { lang: string; category: string }[] = [];
  
  for (const lang of locales) {
    for (const category of categories) {
      params.push({ lang, category });
    }
  }
  
  return params;
}

export default async function CategoryPage({ params }: PageProps) {
  const { lang, category } = await params;
  
  // Validate category
  const validCategories = ["pumps", "motors", "electrical", "pipes", "thrust-bearings", "cables"];
  if (!validCategories.includes(category)) {
    notFound();
  }

  const categoryProducts = products.filter(p => p.category === category);
  const dict = await getDictionary(lang as Locale);

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
