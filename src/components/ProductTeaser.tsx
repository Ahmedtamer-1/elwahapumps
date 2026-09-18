import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PRODUCT_CATEGORIES, categoryLabel } from "@/data/categories";
import type { ProductData } from "@/data/products";
import type { CatalogListProduct } from "@/lib/products";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import ProductCard from "@/components/ProductCard";
import MarqueeRow from "@/components/MarqueeRow";
import DeferredProductCards from "@/components/DeferredProductCards";

/**
 * The home page's scrolling product row — still a Server Component (the row
 * itself is the client MarqueeRow shell, the cards are rendered here), not the
 * "use client" ProductTabs the home page used before this. ProductTabs
 * called useSearchParams() unconditionally (needed only for its
 * tab-filtering mode, which nothing actually uses — it's rendered
 * exclusively as a teaser, here and nowhere else), which put the whole
 * thing behind a Suspense boundary. A crawler or an answer engine
 * fetching "/" got the pulsing skeleton fallback, not the product cards,
 * on a page whose whole job is to name what the company sells.
 */
const SECONDS_PER_CARD = 10.7;

/**
 * A card shows three lines of description (line-clamp-3), about 130
 * characters at this width, but the full text used to go out — and twice,
 * since the cards cross into the client MarqueeRow and are serialised as
 * well as rendered. Cut at a word boundary a little past what shows, so the
 * clamp still ends the visible text and nothing reads as truncated early.
 */
const DESC_CHARS = 180;

/**
 * Cards rendered on the server. Four fill a desktop row (4 × 344px); the
 * rest go to DeferredProductCards as data and mount after load.
 */
const SERVER_CARDS = 4;
function clip(text: string): string {
  if (text.length <= DESC_CHARS) return text;
  const cut = text.slice(0, DESC_CHARS);
  const space = cut.lastIndexOf(" ");
  return `${space > 120 ? cut.slice(0, space) : cut}…`;
}

export default function ProductTeaser({
  lang,
  dict,
  products,
}: {
  lang: string;
  dict: Dictionary;
  products: CatalogListProduct[];
}) {
  const categoryLabels = Object.fromEntries(
    PRODUCT_CATEGORIES.map((slug) => [slug, categoryLabel(dict, slug)]),
  ) as Record<ProductData["category"], string>;

  // Only what a card shows: the first image, not the whole gallery, and the
  // description clipped to the three lines it has room for.
  const slim = products.map((p) => ({
    ...p,
    desc: clip(p.desc),
    gallery: p.gallery.slice(0, 1),
  }));

  return (
    <div className="w-full">
      <MarqueeRow
        durationSeconds={products.length * SECONDS_PER_CARD}
        className="[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
        trackClassName="gap-6"
        ariaLabel={lang === "ar" ? "مجموعة المنتجات" : "Product range"}
        controls
        backLabel={lang === "ar" ? "المنتجات السابقة" : "Previous products"}
        forwardLabel={lang === "ar" ? "المنتجات التالية" : "Next products"}
      >
        {/* One copy — MarqueeRow clones it for the loop. */}
        {slim.slice(0, SERVER_CARDS).map((product) => (
          <div key={product.id} className="w-80 shrink-0 product-card">
            <ProductCard product={product} lang={lang} label={categoryLabels[product.category]} />
          </div>
        ))}
        <DeferredProductCards products={slim.slice(SERVER_CARDS)} lang={lang} labels={categoryLabels} />
      </MarqueeRow>

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
