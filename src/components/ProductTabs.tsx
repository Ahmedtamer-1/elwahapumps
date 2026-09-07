"use client";

import React, { Suspense } from "react";
import { PRODUCT_CATEGORIES, categoryLabel } from "@/data/categories";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Zap, Droplets, Settings, ChevronRight, Layers, Wrench, Cable } from "lucide-react";
import type { ProductData } from "@/data/products";
import type { CatalogProduct } from "@/lib/products";
import { priceOnRequestLabel } from "@/lib/price";
import type { Dictionary } from "../app/[lang]/dictionaries";

interface ProductTabsProps {
  lang: string;
  dict: Dictionary;
  products: CatalogProduct[];
  isTeaser?: boolean;
}

function ProductCard({ product, lang, label }: { product: CatalogProduct; lang: string; label: string }) {
  const productTitle = product.title;
  const productDesc = product.desc;

  return (
    <Link
      href={`/${lang}/products/${product.id}`}
      className="flex flex-col justify-between h-full overflow-hidden bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 shadow-xs hover:shadow-lg transition-all duration-300 group"
    >
      {/* Product Image */}
      <div className="relative w-full h-48 bg-neutral-50 flex items-center justify-center p-4">
        <Image
          src={product.gallery[0]}
          alt={productTitle}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-white/90 backdrop-blur-sm shadow-sm text-emerald-600 rounded-md border border-neutral-100">
            {label}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-neutral-800 mb-2 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
          {productTitle}
        </h3>
        <p className="text-neutral-500 text-sm leading-relaxed mb-4 line-clamp-3">
          {productDesc}
        </p>

        {/* Specs Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {product.specs.map((spec, idx) => (
            <span key={idx} className="inline-flex items-center text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-sm">
              {spec}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-auto">
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-neutral-900 truncate">
              {priceOnRequestLabel(lang)}
            </p>
          </div>
          <span className="shrink-0 text-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors duration-200">
            {lang === "ar" ? "عرض التفاصيل" : "View Details"}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Seconds of travel per card in the home-page teaser, chosen to preserve the
 * scroll speed the three-card version ran at (a 320px card plus its 24px gap
 * crossing the window in a little over ten seconds).
 */
const SECONDS_PER_CARD = 10.7;

function ProductTabsContent({ lang, dict, products, isTeaser = false }: ProductTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = isTeaser ? "all" : (searchParams.get("category") as "all" | "motors" | "pumps" | "electrical" | "pipes" | "spare-parts" | "cables") || "all";

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "all") {
      params.delete("category");
    } else {
      params.set("category", tabId);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filteredProducts =
    activeTab === "all" ? products : products.filter((p) => p.category === activeTab);

  const tabs = [
    { id: "all", label: dict.productsPage.all, icon: null },
    { id: "motors", label: dict.productsPage.motors, icon: Settings },
    { id: "pumps", label: dict.productsPage.pumps, icon: Droplets },
    { id: "electrical", label: dict.productsPage.electrical, icon: Zap },
    { id: "pipes", label: dict.productsPage.pipes, icon: Layers },
    { id: "spare-parts", label: dict.productsPage.spareParts, icon: Wrench },
    { id: "cables", label: dict.productsPage.cables, icon: Cable },
  ] as const;

  // Built from the shared slug -> dictionary-key map so a renamed category
  // cannot fall out of sync with the tab labels.
  const categoryLabels = Object.fromEntries(
    PRODUCT_CATEGORIES.map((slug) => [slug, categoryLabel(dict, slug)])
  ) as Record<ProductData["category"], string>;

  return (
    <div className="w-full">
      {/* Tab Buttons - Hide if teaser */}
      {!isTeaser && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Products */}
      {isTeaser ? (
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div
            className="flex w-max gap-6 animate-marquee-left hover:[animation-play-state:paused]"
            // The teaser shows the whole catalogue, so the row's width is not
            // fixed — and the shared 32s keyframe would sprint through a long
            // row and crawl through a short one. Pacing the duration by the
            // card count instead holds one reading speed however many products
            // the catalogue grows to.
            style={{
              animationDuration: `${(filteredProducts.length * SECONDS_PER_CARD).toFixed(1)}s`,
            }}
          >
            {[...filteredProducts, ...filteredProducts].map((product, idx) => (
              <div key={`${product.id}-${idx}`} className="w-80 shrink-0">
                <ProductCard product={product} lang={lang} label={categoryLabels[product.category]} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} label={categoryLabels[product.category]} />
          ))}
        </div>
      )}

      {isTeaser && (
        <div className="mt-12 text-center">
          <Link
            href={`/${lang}/products`}
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3.5 rounded-xl font-bold transition-colors"
          >
            <span>{lang === "ar" ? "استعرض كل المنتجات" : "View All Products"}</span>
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ProductTabs(props: ProductTabsProps) {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-neutral-100 rounded-3xl"></div>}>
      <ProductTabsContent {...props} />
    </Suspense>
  );
}
