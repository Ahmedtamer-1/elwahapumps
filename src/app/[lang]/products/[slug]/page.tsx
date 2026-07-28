import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, Locale } from "../../dictionaries";
import Breadcrumb from "@/components/Breadcrumb";
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
    <div className="bg-background min-h-screen pb-20">
      {/* Header Banner */}
      <section className="bg-primary text-white pt-10 pb-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            lang={lang}
            items={[
              { label: dict.nav.products, href: `/${lang}/products` },
              { label: product.title }
            ]}
          />
        </div>
      </section>

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
