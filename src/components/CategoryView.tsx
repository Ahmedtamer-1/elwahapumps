"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCT_CATEGORIES, categoryLabel } from "@/data/categories";
import type { CatalogListProduct } from "@/lib/products";
import type { Dictionary, Locale } from "../app/[lang]/dictionaries";
import Breadcrumbs from "@/components/Breadcrumbs";
import { brandOrder } from "@/data/brands";

/**
 * One category of the catalogue, as a grid of cards under a tab bar.
 *
 * This was a dark sidebar beside a single column of stacked rows: the filter
 * and the breadcrumb lived in the sidebar, and each product took the full
 * width of the page, so four pumps filled two screens and moving to another
 * category meant going back to /products first.
 *
 * The tabs are real links, one per category, not client-side filter state.
 * Each category already has its own indexable URL, and a reader who lands on
 * /products/category/motors from search can then reach the other five without
 * a round trip through the index page.
 *
 * The brand filter is the one control that stays client-side — it narrows
 * what is already on the page, and putting it in the URL would fork the
 * canonical address of a category into a set of near-identical ones.
 */
export default function CategoryView({
  products,
  category,
  lang,
  dict,
  counts,
}: {
  products: CatalogListProduct[];
  category: string;
  lang: string;
  dict: Dictionary;
  /** Live product count per category slug, for the tab bar. */
  counts: Record<string, number>;
}) {
  const isAr = lang === "ar";
  const title = categoryLabel(dict, category);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Real manufacturers, read from the product's own brand field.
  //
  // This used to split the model number and take the first word, which is why
  // the control headed "Brand" offered KP, KSX, 8E, 140-270, H07RN8-F and
  // Bore-Well — model codes and cable standards, not brands. A customer
  // looking for Kurlar, Rovatti, Panelli or Tormac found none of them, and the
  // twelve agencies the company actually holds appeared nowhere.
  //
  // Ordered to match the agency list in company.ts, so the chips, the logo
  // wall and the agents page all name the manufacturers in the same order.
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort((a, b) => brandOrder(a) - brandOrder(b));
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (selectedBrands.length === 0) return products;
    return products.filter((p) => p.brand && selectedBrands.includes(p.brand));
  }, [products, selectedBrands]);

  const totalCount = useMemo(
    () => Object.values(counts).reduce((sum, n) => sum + n, 0),
    [counts],
  );

  return (
    <div className="bg-white">
      {/* Tab bar. Horizontally scrollable on a phone rather than wrapped to
          three rows — the tabs are a single line of navigation, and a reader
          who can see the row is cut off knows to push it. */}
      <nav
        aria-label={isAr ? "أقسام المنتجات" : "Product categories"}
        className="border-b border-rule bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto">
            <TabLink
              href={`/${lang}/products`}
              label={isAr ? "كل المنتجات" : "All Products"}
              count={totalCount}
              active={false}
            />
            {PRODUCT_CATEGORIES.map((slug) => (
              <TabLink
                key={slug}
                href={`/${lang}/products/category/${slug}`}
                label={categoryLabel(dict, slug)}
                count={counts[slug] ?? 0}
                active={slug === category}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <Breadcrumbs
            lang={lang as Locale}
            items={[
              { name: dict.nav.home, path: "/" },
              { name: dict.nav.products, path: "/products" },
              { name: title, path: `/products/category/${category}` },
            ]}
          />
        </div>

        {/* Brand filter.
            Shown only when a category carries more than one brand. With a
            single manufacturer the control cannot narrow anything: ticking
            its one chip only hides the items that have no brand at all, which
            is not what a reader expects a brand filter to do. Pipes (Astral
            only) and Electrical (NOVO, plus El Waha's own control panels)
            fall into that case.

            A group of toggle buttons rather than checkboxes now that it sits
            in a row: each chip carries its own pressed state, so the state is
            announced without a label wrapping an invisible input. */}
        {availableBrands.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b border-rule-light">
            <span className="spec-label text-stone-light me-2">
              {isAr ? "الماركة" : "Brand"}
            </span>
            {availableBrands.map((brand) => {
              const on = selectedBrands.includes(brand);
              return (
                <button
                  key={brand}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setSelectedBrands((prev) =>
                      prev.includes(brand)
                        ? prev.filter((b) => b !== brand)
                        : [...prev, brand],
                    )
                  }
                  className={`px-4 py-2 text-sm font-semibold border transition-colors ${
                    on
                      ? "bg-pine text-bone border-pine"
                      : "bg-white text-stone border-rule hover:border-pine hover:text-pine"
                  }`}
                >
                  {brand}
                </button>
              );
            })}
            {selectedBrands.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedBrands([])}
                className="px-3 py-2 text-sm font-semibold text-stone underline underline-offset-4 hover:text-pine"
              >
                {isAr ? "إلغاء التصفية" : "Clear"}
              </button>
            )}
          </div>
        )}

        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                lang={lang}
                isAr={isAr}
                categoryName={title}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-stone py-20">
            {products.length === 0
              ? isAr
                ? "لا توجد منتجات في هذا القسم."
                : "No products found in this category."
              : isAr
                ? "لا توجد منتجات مطابقة لهذه التصفية."
                : "No products match the selected filter."}
          </p>
        )}
      </div>
    </div>
  );
}

/** One tab. The count is part of the link's text, so it is read out with it. */
function TabLink({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 flex items-baseline gap-2 px-4 py-4 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
        active
          ? "border-brass text-pine"
          : "border-transparent text-stone hover:text-pine hover:border-rule"
      }`}
    >
      {label}
      <span className="font-mono text-xs text-stone-light tabular-nums">{count}</span>
    </Link>
  );
}

/**
 * One product card.
 *
 * The whole tile is a single link. The "View product" row at the foot is
 * part of it rather than a second link to the same place — two links with
 * different names pointing at one product is what a screen reader has to
 * read twice.
 */
function ProductTile({
  product,
  lang,
  isAr,
  categoryName,
}: {
  product: CatalogListProduct;
  lang: string;
  isAr: boolean;
  categoryName: string;
}) {
  // Some modelNo values already end in "Series" (e.g. "AP+ Series"), which
  // used to render as "AP+ Series Series".
  const series = product.modelNo
    ? /series\s*$/i.test(product.modelNo)
      ? product.modelNo
      : `${product.modelNo} Series`
    : null;

  const eyebrow = [product.brand, series].filter(Boolean).join(" · ");

  /* The size markers the catalogue quotes — 6"-10", IP68, 50 Hz — pulled out
     of the spec chips by length. The same array also holds selling phrases
     ("Corrosion Resistant", "Made in Italy"); those belong in the description,
     not in a corner of the card's foot, and at that width they pushed the
     "View product" row onto two lines. Two at most, for the same reason. */
  const markers = product.specs.filter((s) => s.length <= 12).slice(0, 2);

  return (
    <Link
      href={`/${lang}/products/${product.id}`}
      className="group flex flex-col bg-white border border-rule hover:border-pine transition-colors duration-300"
    >
      <div className="relative aspect-[4/3] bg-bone overflow-hidden">
        <Image
          src={product.gallery[0] || "/images/placeholder.jpg"}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-0 start-0 spec-label bg-pine text-bone px-3 py-1.5">
          {categoryName}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        {eyebrow && (
          <span className="spec-label text-stone-light mb-2">{eyebrow}</span>
        )}
        <h2 className="text-lg font-bold text-ink mb-2 group-hover:text-pine transition-colors">
          {product.title}
        </h2>
        <p className="text-sm text-stone leading-relaxed line-clamp-3">
          {product.desc}
        </p>

        <div className="mt-5 pt-4 border-t border-rule-light flex items-center justify-between gap-3">
          <span className="spec-label text-pine inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            {isAr ? "عرض المنتج" : "View product"}
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </span>
          {markers.length > 0 && (
            <span className="font-mono text-[11px] text-stone-light truncate">
              {markers.join("  ")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
