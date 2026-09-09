"use client";

import React, { Suspense } from "react";
import { PRODUCT_CATEGORIES, categoryLabel } from "@/data/categories";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Zap, Droplets, Settings, Layers, Wrench, Cable } from "lucide-react";
import type { ProductData } from "@/data/products";
import type { CatalogListProduct } from "@/lib/products";
import type { Dictionary } from "../app/[lang]/dictionaries";
import ProductCard from "@/components/ProductCard";

/**
 * The tab-filtered product grid, reading/writing its active category via
 * the URL (?category=). The home page's teaser used to be a mode of this
 * same component (isTeaser=true) but never needed useSearchParams at all
 * — see ProductTeaser.tsx, a plain Server Component that replaced it, so
 * a crawler fetching "/" gets real product cards instead of this
 * component's Suspense fallback. This file is currently unused (nothing
 * renders <ProductTabs>), kept as a working "browse by category" pattern
 * for a future products-page redesign rather than deleted.
 */
interface ProductTabsProps {
  lang: string;
  dict: Dictionary;
  products: CatalogListProduct[];
}

function ProductTabsContent({ lang, dict, products }: ProductTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = (searchParams.get("category") as "all" | "motors" | "pumps" | "electrical" | "pipes" | "spare-parts" | "cables") || "all";

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
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
 isActive
 ? "bg-emerald-600 text-white "
 : "bg-bone text-stone hover:bg-rule-light border border-rule"
 }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} lang={lang} label={categoryLabels[product.category]} />
        ))}
      </div>
    </div>
  );
}

export default function ProductTabs(props: ProductTabsProps) {
  return (
    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-bone"></div>}>
      <ProductTabsContent {...props} />
    </Suspense>
  );
}
