import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, Locale } from "../../dictionaries";
import Breadcrumb from "@/components/Breadcrumb";
import ProductDetailView from "@/components/ProductDetailView";
import { products } from "@/data/products";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateStaticParams() {
  const locales = ["ar", "en"];
  const params: { lang: string; slug: string }[] = [];
  
  for (const lang of locales) {
    for (const p of products) {
      params.push({ lang, slug: p.id });
    }
  }
  
  return params;
}

export default async function ProductPage({ params }: PageProps) {
  const { lang, slug } = await params;
  
  const product = products.find(p => p.id === slug);
  if (!product) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  
  const title = dict.productsData[slug as keyof typeof dict.productsData]?.title || product.id;
  const desc = dict.productsData[slug as keyof typeof dict.productsData]?.desc || "";

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header Banner */}
      <section className="bg-primary text-white pt-10 pb-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb 
            lang={lang} 
            items={[
              { label: dict.nav.products, href: `/${lang}/products` },
              { label: title }
            ]} 
          />
        </div>
      </section>

      {/* Main Content */}
      <ProductDetailView 
        product={product} 
        lang={lang} 
        dict={dict} 
        title={title} 
        desc={desc} 
      />
    </div>
  );
}
