import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, Locale } from "../../dictionaries";
import ProductDetailView from "@/components/ProductDetailView";
import { getCatalogProduct } from "@/lib/products";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
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
