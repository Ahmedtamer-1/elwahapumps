"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Zap, Droplets, Settings, ChevronRight, Layers, CircleDot, Cable } from "lucide-react";
import { products, ProductData } from "@/data/products";

interface ProductTabsProps {
  lang: string;
  dict: any;
  isTeaser?: boolean;
}

function ProductCard({ product, lang, dict, label }: { product: ProductData; lang: string; dict: any; label: string }) {
  const productTitle = dict.productsData[product.id as keyof typeof dict.productsData]?.title || product.id;
  const productDesc = dict.productsData[product.id as keyof typeof dict.productsData]?.desc || "";

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
        <h4 className="text-lg font-bold text-neutral-800 mb-2 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
          {productTitle}
        </h4>
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
          <span className="flex-1 text-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors duration-200">
            {lang === "ar" ? "عرض التفاصيل" : "View Details"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductTabsContent({ lang, dict, isTeaser = false }: ProductTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = isTeaser ? "all" : (searchParams.get("category") as "all" | "motors" | "pumps" | "electrical" | "pipes" | "thrust-bearings" | "cables") || "all";

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === "all") {
      params.delete("category");
    } else {
      params.set("category", tabId);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  let filteredProducts = activeTab === "all" ? products : products.filter((p) => p.category === activeTab);
  
  if (isTeaser) {
    filteredProducts = filteredProducts.slice(0, 3);
  }

  const tabs = [
    { id: "all", label: dict.productsPage.all, icon: null },
    { id: "motors", label: dict.productsPage.motors, icon: Settings },
    { id: "pumps", label: dict.productsPage.pumps, icon: Droplets },
    { id: "electrical", label: dict.productsPage.electrical, icon: Zap },
    { id: "pipes", label: dict.productsPage.pipes, icon: Layers },
    { id: "thrust-bearings", label: dict.productsPage.thrustBearings, icon: CircleDot },
    { id: "cables", label: dict.productsPage.cables, icon: Cable },
  ] as const;

  const categoryLabels: Record<ProductData["category"], string> = {
    motors: dict.productsPage.motors,
    pumps: dict.productsPage.pumps,
    electrical: dict.productsPage.electrical,
    pipes: dict.productsPage.pipes,
    "thrust-bearings": dict.productsPage.thrustBearings,
    cables: dict.productsPage.cables,
  };

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
          <div className="flex w-max gap-6 animate-marquee-left hover:[animation-play-state:paused]">
            {[...filteredProducts, ...filteredProducts].map((product, idx) => (
              <div key={`${product.id}-${idx}`} className="w-80 shrink-0">
                <ProductCard product={product} lang={lang} dict={dict} label={categoryLabels[product.category]} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} dict={dict} label={categoryLabels[product.category]} />
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
