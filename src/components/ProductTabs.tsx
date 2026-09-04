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

interface ProductTabsProps {
  lang: string;
  dict: any;
  products: CatalogProduct[];
  isTeaser?: boolean;
}

function ProductCard({ product, lang, label }: { product: CatalogProduct; lang: string; label: string }) {
  const productTitle = product.title;
  const productDesc = product.desc;
  const specsLabel = product.specs.join(' ');

  return (
    <Link
      href={`/${lang}/products/${product.id}`}
      className="flex flex-col bg-white border border-rule group h-full"
    >
      <div className="relative h-[210px] w-full bg-white border-b border-rule/70 flex items-center justify-center p-4">
        <Image
          src={product.gallery[0] || "/images/placeholder.png"}
          alt={productTitle}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-0 left-0 bg-pine text-bone font-mono font-medium text-[10px] tracking-[0.14em] px-[9px] py-[5px] uppercase">
          {label}
        </div>
      </div>

      <div className="p-[22px_24px_24px] flex flex-col flex-grow">
        <div className="font-mono font-medium text-[10.5px] tracking-[0.14em] uppercase text-neutral-500 mb-2">
          {product.category}
        </div>
        <h3 className="font-extrabold text-[17px] leading-[23px] text-ink mb-2.5">
          {productTitle}
        </h3>
        <p className="font-normal text-[13px] leading-[21px] text-neutral-600 line-clamp-3">
          {productDesc}
        </p>

        <div className="mt-auto pt-3.5 border-t border-rule/70 flex items-center justify-between">
          <span className="font-mono font-medium text-[10.5px] tracking-[0.14em] uppercase text-pine group-hover:text-brass transition-colors">
            {lang === 'ar' ? 'عرض المنتج ←' : 'View product →'}
          </span>
          <span className="font-mono font-normal text-[11px] text-neutral-500 line-clamp-1 max-w-[50%] text-right">
            {specsLabel || (lang === 'ar' ? 'التفاصيل' : 'Details')}
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
        <div className="bg-white border-b border-rule">
          <div className="w-[95%] max-w-[1152px] mx-auto flex flex-nowrap md:flex-wrap overflow-x-auto items-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = tab.id === "all" 
                ? products.length 
                : products.filter((p) => p.category === tab.id).length;
              
              if (count === 0 && tab.id !== "all") return null;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`whitespace-nowrap px-3.5 py-3.5 md:px-5 md:py-4 font-semibold text-[12px] md:text-[12.5px] border-b-[3px] transition-colors ${
                    isActive
                      ? "text-pine border-pine"
                      : "text-neutral-500 border-transparent hover:text-pine hover:border-rule"
                  }`}
                >
                  {tab.label} <span className="font-mono text-[11px] text-neutral-400 ml-1">{count}</span>
                </button>
              );
            })}
            <div className="ml-auto font-mono font-medium text-[10.5px] tracking-[0.14em] uppercase text-neutral-400 py-4 hidden md:block">
              {lang === "ar" ? "مرتبة حسب الفئة" : "Sorted by category"}
            </div>
          </div>
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
        <div className={`w-full ${!isTeaser ? "bg-bone py-11 pb-16" : ""}`}>
          <div className={!isTeaser ? "w-[95%] max-w-[1152px] mx-auto" : ""}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} lang={lang} label={categoryLabels[product.category]} />
              ))}
            </div>
          </div>
        </div>
      )}

      {isTeaser && (
        <div className="mt-12 text-center">
          <Link
            href={`/${lang}/products`}
            className="inline-flex items-center gap-2 bg-pine hover:bg-emerald-950 text-bone px-8 py-3.5 font-bold transition-colors"
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
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-field"></div>}>
      <ProductTabsContent {...props} />
    </Suspense>
  );
}
