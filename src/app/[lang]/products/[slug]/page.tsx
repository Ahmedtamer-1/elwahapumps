import React from "react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, Locale } from "../../dictionaries";
import ProductDetailView from "@/components/ProductDetailView";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCatalogProduct } from "@/lib/products";
import { categoryLabel } from "@/data/categories";
import { localizedAlternates } from "@/lib/seo";
import { jsonLdScriptProps, productSchema } from "@/lib/schema";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
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
    <div className="bg-background min-h-screen pb-20">
      <script
        {...jsonLdScriptProps(
          productSchema(lang as Locale, product, `/products/${slug}`),
        )}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs
          lang={lang as Locale}
          items={[
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.products, path: "/products" },
            { name: categoryLabel(dict, product.category), path: `/products/category/${product.category}` },
            { name: product.title, path: `/products/${slug}` },
          ]}
        />
      </div>
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
