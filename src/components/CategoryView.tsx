"use client";

import React, { useState, useMemo } from "react";
import { categoryLabel } from "@/data/categories";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, ArrowLeft } from "lucide-react";
import type { CatalogProduct } from "@/lib/products";
import { formatPrice, formatPriceRange } from "@/lib/price";

export default function CategoryView({
  products,
  category,
  lang,
  dict,
}: {
  products: CatalogProduct[];
  category: string;
  lang: string;
  dict: any;
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

  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-white ${isAr ? "md:flex-row-reverse" : ""}`}>
      {/* Sidebar */}
      <aside className="w-full md:w-72 lg:w-80 bg-[#3f3f3f] text-white shrink-0 p-6 pt-24 md:p-10 md:pt-32 flex flex-col md:min-h-screen">
        <Link href={`/${lang}/products`} className={`text-sm text-neutral-400 hover:text-white flex items-center gap-2 mb-8 group w-fit ${isAr ? "flex-row-reverse" : ""}`}>
          <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isAr ? "rotate-180 group-hover:translate-x-1" : ""}`} />
          {isAr ? "العودة للمنتجات" : "Back to Products"}
        </Link>

        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-2xl font-light flex items-center gap-4">
            <div className="w-10 h-10 border border-neutral-500 flex items-center justify-center opacity-70">
              <div className="w-4 h-4 border border-current rounded-sm"></div>
            </div>
            {title}
          </h1>
          <button 
            className="md:hidden border border-neutral-500 px-3 py-1.5 text-xs font-medium uppercase tracking-wider"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            {isFiltersOpen ? (isAr ? "إخفاء الفلاتر" : "Hide Filters") : (isAr ? "إظهار الفلاتر" : "Show Filters")}
          </button>
        </div>

        <div className={`flex flex-col overflow-hidden transition-all duration-500 ${isFiltersOpen ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0 md:max-h-none md:opacity-100 md:mt-0"}`}>
          <div className="mb-10">
             <div className="inline-block border border-white px-4 py-1.5 text-sm font-medium tracking-wide">
               {isAr ? "تسوق الآن" : "Shop Now"}
             </div>
          </div>

          <div className="text-sm mb-6">
            {isAr ? "تصفية حسب :" : "Filter by :"}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-8 pb-6 md:pb-0">
          {/* Brand Filter */}
          {availableBrands.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-lg mb-1">{isAr ? "الماركة" : "Brand"}</h3>
              <div className="h-px w-full bg-neutral-500/50 mb-2"></div>
              {availableBrands.map(brand => (
                <label key={brand} className="flex items-center gap-3 text-sm cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5 bg-transparent border border-white/70 appearance-none checked:bg-white checked:border-white transition-colors cursor-pointer"
                  />
                  <span className="group-hover:text-neutral-300">{brand}</span>
                </label>
              ))}
            </div>
          )}

          {/* Dummy Filters to match screenshot aesthetic */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg mb-1">{isAr ? "التسوق عبر الإنترنت" : "Online Shopping"}</h3>
            <div className="h-px w-full bg-neutral-500/50 mb-2"></div>
            {["Cairo Sales", "Sharaf DG", "Ehab Center"].map(opt => (
              <label key={opt} className="flex items-center gap-3 text-sm cursor-pointer group">
                <input type="checkbox" className="w-3.5 h-3.5 bg-transparent border border-white/70 appearance-none checked:bg-white cursor-pointer" />
                <span className="group-hover:text-neutral-300">{opt}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-lg mb-1">{isAr ? "اللون" : "Color"}</h3>
            <div className="h-px w-full bg-neutral-500/50 mb-2"></div>
            {["Black", "Stainless steel", "White"].map(opt => (
              <label key={opt} className="flex items-center gap-3 text-sm cursor-pointer group">
                <input type="checkbox" className="w-3.5 h-3.5 bg-transparent border border-white/70 appearance-none checked:bg-white cursor-pointer" />
                <span className="group-hover:text-neutral-300">{opt}</span>
              </label>
            ))}
          </div>
        </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white p-6 pt-24 md:p-12 md:pt-32 lg:p-20 lg:pt-32">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          {products.map((product) => {
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
                   <p className="text-sm text-neutral-400 mb-4">
                     {product.modelNo
                       ? /series\s*$/i.test(product.modelNo)
                         ? product.modelNo
                         : `${product.modelNo} Series`
                       : categoryLabel(dict, category)}
                   </p>
                   
                   <div className="flex flex-col gap-1.5 text-xs text-neutral-500 font-medium">
                     {product.specs.slice(0, 3).map((spec, i) => (
                       <div key={i} className="flex gap-2">
                         <span className="text-neutral-400">{isAr ? "ميزة:" : "Feature:"}</span>
                         <span className="text-neutral-700">{spec}</span>
                       </div>
                     ))}
                   </div>

                   <p className="mt-4 text-lg font-bold text-neutral-900">
                     {product.priceMin !== null
                       ? formatPriceRange(product.priceMin, product.priceMax, product.currency, lang)
                       : formatPrice(product.price, product.currency, lang)}
                   </p>
                   
                   <Link href={`/${lang}/products/${product.id}`} className={`absolute bottom-0 ${isAr ? 'left-0' : 'right-0'} translate-y-1/2 w-12 h-12 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-xl z-10`}>
                     {isAr ? <ArrowUpRight className="w-5 h-5 scale-x-[-1]" /> : <ArrowUpRight className="w-5 h-5" />}
                   </Link>
                 </div>
               </div>
             )
          })}
          
          {products.length === 0 && (
             <div className="text-center text-neutral-400 py-20">
                {isAr ? "لا توجد منتجات في هذا القسم." : "No products found in this category."}
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
