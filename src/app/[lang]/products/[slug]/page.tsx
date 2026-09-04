import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, Locale } from "../../dictionaries";
import ProductDetailView from "@/components/ProductDetailView";
import { getCatalogProduct } from "@/lib/products";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const product = await getCatalogProduct(slug, lang);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.title,
    description: product.desc,
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
    <div className="bg-background min-h-screen pb-20">
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
