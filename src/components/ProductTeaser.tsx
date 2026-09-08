import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PRODUCT_CATEGORIES, categoryLabel } from "@/data/categories";
import type { ProductData } from "@/data/products";
import type { CatalogProduct } from "@/lib/products";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import ProductCard from "@/components/ProductCard";

/**
 * The home page's scrolling product row — a Server Component, not the
 * "use client" ProductTabs the home page used before this. ProductTabs
 * called useSearchParams() unconditionally (needed only for its
 * tab-filtering mode, which nothing actually uses — it's rendered
 * exclusively as a teaser, here and nowhere else), which put the whole
 * thing behind a Suspense boundary. A crawler or an answer engine
 * fetching "/" got the pulsing skeleton fallback, not the product cards,
 * on a page whose whole job is to name what the company sells.
 */
const SECONDS_PER_CARD = 10.7;

export default function ProductTeaser({
  lang,
  dict,
  products,
}: {
  lang: string;
  dict: Dictionary;
  products: CatalogProduct[];
}) {
  const categoryLabels = Object.fromEntries(
    PRODUCT_CATEGORIES.map((slug) => [slug, categoryLabel(dict, slug)]),
  ) as Record<ProductData["category"], string>;

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div
          className="flex w-max gap-6 animate-marquee-left hover:[animation-play-state:paused]"
          style={{
            animationDuration: `${(products.length * SECONDS_PER_CARD).toFixed(1)}s`,
          }}
        >
          {[...products, ...products].map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="w-80 shrink-0 product-card">
              <ProductCard product={product} lang={lang} label={categoryLabels[product.category]} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href={`/${lang}/products`}
          className="inline-flex items-center gap-2 bg-pine hover:bg-field text-white px-8 py-3.5 font-bold transition-colors"
        >
          <span>{lang === "ar" ? "استعرض كل المنتجات" : "View All Products"}</span>
          <ChevronRight className="w-5 h-5 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
