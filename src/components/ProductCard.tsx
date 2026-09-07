import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct } from "@/lib/products";
import { priceOnRequestLabel } from "@/lib/price";

/**
 * One product tile — shared by the home-page teaser (ProductTeaser.tsx,
 * server-rendered) and the full tab-filtered grid (ProductTabs.tsx,
 * client-rendered). No hooks, so it works unchanged in either.
 */
export default function ProductCard({
  product,
  lang,
  label,
}: {
  product: CatalogProduct;
  lang: string;
  label: string;
}) {
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
