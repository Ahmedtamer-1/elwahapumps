"use client";

import React, { useState, useMemo } from "react";
import { categoryLabel } from "@/data/categories";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, ArrowLeft } from "lucide-react";
import type { CatalogProduct } from "@/lib/products";
import { priceOnRequestLabel } from "@/lib/price";
import type { Dictionary, Locale } from "../app/[lang]/dictionaries";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function CategoryView({
  products,
  category,
  lang,
  dict,
}: {
  products: CatalogProduct[];
  category: string;
  lang: string;
  dict: Dictionary;
}) {
  const isAr = lang === "ar";
  const title = categoryLabel(dict, category);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => {
      if (p.modelNo) brands.add(p.modelNo.split(" ")[0]);
    });
    return Array.from(brands);
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (selectedBrands.length === 0) return products;
    return products.filter(
      (p) => p.modelNo && selectedBrands.includes(p.modelNo.split(" ")[0]),
    );
  }, [products, selectedBrands]);

  // No `md:flex-row-reverse` for Arabic on the row below: `dir="rtl"`
  // already lays a flex row out right-to-left, so reversing it on top put
  // the sidebar on the left in *both* languages (S5-T02).
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-full md:w-72 lg:w-80 bg-[#3f3f3f] text-white shrink-0 p-6 md:p-10 flex flex-col md:min-h-screen">
        <div className="mb-4">
          <Breadcrumbs
            lang={lang as Locale}
            dark
            items={[
              { name: dict.nav.home, path: "/" },
              { name: dict.nav.products, path: "/products" },
              { name: title, path: `/products/category/${category}` },
            ]}
          />
        </div>
        {/* The row is not reversed for Arabic — `dir` handles the order,
            and reversing it as well put the arrow on the far side of the
            label it points away from. Only the glyph itself flips, which
            is what `rtl:` variants are for. */}
        <Link href={`/${lang}/products`} className="text-sm text-neutral-300 hover:text-white flex items-center gap-2 mb-8 group w-fit">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
          {isAr ? "العودة للمنتجات" : "Back to Products"}
        </Link>

        <div className="flex justify-between items-center mb-6 md:mb-8">
          {/* The decorative icon is a block-level div, which isn't valid
              content inside h1 (heading content is phrasing content) — it
              now sits beside the h1 in a shared flex wrapper instead of
              nested inside it. */}
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 border border-neutral-500 flex items-center justify-center opacity-70"
              aria-hidden="true"
            >
              <div className="w-4 h-4 border border-current rounded-sm"></div>
            </div>
            <h1 className="text-2xl font-light">{title}</h1>
          </div>
          <button
            className="md:hidden border border-neutral-500 px-3 py-1.5 text-xs font-medium uppercase tracking-wider"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            {isFiltersOpen ? (isAr ? "إخفاء الفلاتر" : "Hide Filters") : (isAr ? "إظهار الفلاتر" : "Show Filters")}
          </button>
        </div>

        <div className={`flex flex-col overflow-hidden transition-all duration-500 ${isFiltersOpen ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0 md:max-h-none md:opacity-100 md:mt-0"}`}>
          {availableBrands.length > 0 && (
            <div className="text-sm mb-6">
              {isAr ? "تصفية حسب :" : "Filter by :"}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col gap-8 pb-6 md:pb-0">
          {/* Brand Filter — wired to actually filter `products` below. Note
              "brand" here is derived from the model number prefix
              (e.g. "KP", "8E"), not a real brand field, so labels can look
              like model codes until products carry a proper brand. */}
          {availableBrands.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* A filter-group label, not a heading — matches Footer's and
                  the mega-menu's column labels, and keeps this from
                  sitting as an h3 before the page's first h2 (the product
                  titles in the main column). */}
              <p className="font-bold text-lg mb-1">{isAr ? "الماركة" : "Brand"}</p>
              <div className="h-px w-full bg-neutral-500/50 mb-2"></div>
              {availableBrands.map(brand => (
                <label key={brand} className="flex items-center gap-3 text-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() =>
                      setSelectedBrands((prev) =>
                        prev.includes(brand)
                          ? prev.filter((b) => b !== brand)
                          : [...prev, brand],
                      )
                    }
                    className="w-3.5 h-3.5 bg-transparent border border-white/70 appearance-none checked:bg-white checked:border-white transition-colors cursor-pointer"
                  />
                  <span className="group-hover:text-neutral-300">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white p-6 md:p-12 lg:p-20">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          {visibleProducts.map((product) => {
             const titleStr = product.title;

             return (
               <div key={product.id} className="flex flex-col md:flex-row gap-8 items-center md:items-start group border-b border-neutral-200 pb-12 relative w-full">
                 {/* Product Image */}
                 <Link href={`/${lang}/products/${product.id}`} className="w-full md:w-72 aspect-[4/3] bg-neutral-100 relative shrink-0 cursor-pointer overflow-hidden">
                   <Image 
                     src={product.gallery[0] || "/images/placeholder.jpg"} 
                     alt={titleStr}
                     fill
                     className="object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                   />
                 </Link>
                 
                 {/* Product Info */}
                 <div className={`flex-1 flex flex-col pt-2 w-full ${isAr ? 'md:pr-4' : 'md:pl-4'}`}>
                   <h2 className="text-xl font-bold text-neutral-800 mb-1">{titleStr}</h2>
                   {/* Some modelNo values already end in "Series" (e.g. "AP+
                       Series"), which used to render as "AP+ Series Series". */}
                   <p className="text-sm text-stone mb-4">
                     {product.modelNo
                       ? /series\s*$/i.test(product.modelNo)
                         ? product.modelNo
                         : `${product.modelNo} Series`
                       : categoryLabel(dict, category)}
                   </p>
                   
                   <div className="flex flex-col gap-1.5 text-xs text-neutral-500 font-medium">
                     {product.specs.slice(0, 3).map((spec, i) => (
                       <div key={i} className="flex gap-2">
                         <span className="text-stone">{isAr ? "ميزة:" : "Feature:"}</span>
                         <span className="text-neutral-700">{spec}</span>
                       </div>
                     ))}
                   </div>

                   <p className="mt-4 text-lg font-bold text-neutral-900">
                     {priceOnRequestLabel(lang)}
                   </p>
                   
                   {/* Icon-only, so it needs a name of its own — and one
                       that says *which* product, since a page of these
                       otherwise reads as a list of identical "link"s. */}
                   <Link
                     href={`/${lang}/products/${product.id}`}
                     aria-label={isAr ? `عرض ${titleStr}` : `View ${titleStr}`}
                     className={`absolute bottom-0 ${isAr ? 'left-0' : 'right-0'} translate-y-1/2 w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-xl z-10`}
                   >
                     {isAr
                       ? <ArrowUpRight className="w-5 h-5 scale-x-[-1]" aria-hidden="true" />
                       : <ArrowUpRight className="w-5 h-5" aria-hidden="true" />}
                   </Link>
                 </div>
               </div>
             )
          })}
          
          {visibleProducts.length === 0 && (
             <div className="text-center text-stone py-20">
                {products.length === 0
                  ? (isAr ? "لا توجد منتجات في هذا القسم." : "No products found in this category.")
                  : (isAr ? "لا توجد منتجات مطابقة لهذا التصفية." : "No products match the selected filter.")}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
