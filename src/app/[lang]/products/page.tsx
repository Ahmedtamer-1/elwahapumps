import React from "react";
import { getDictionary, Locale } from "../dictionaries";
import { FileText, Download, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCT_CATEGORIES, categoryLabel } from "@/data/categories";

interface PageProps {
  params: Promise<{ lang: string }>;
}

/**
 * Category line-art, one file per slug under /public/images/categories.
 *
 * The source images are black line art on a white ground. They are inverted
 * to white and blended with `screen`, which drops the white ground to
 * transparent and leaves the strokes over pine — the drawings then sit in
 * the palette instead of arriving as white boxes (§04: flat pine, bone or
 * white only, and no additional colours).
 */
const CATEGORY_ART: Record<string, string> = {
  pumps: "/images/categories/pumps.jpeg",
  "surface-pumps": "/images/products/rovatti-surface.png",
  motors: "/images/categories/motors.jpeg",
  electrical: "/images/categories/electrical.jpeg",
  pipes: "/images/categories/pipes.jpeg",
  "spare-parts": "/images/categories/spare-parts.jpeg",
  cables: "/images/categories/cables.jpeg",
};

export default async function ProductsPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const productCategories = PRODUCT_CATEGORIES.map((id) => ({
    id,
    label: categoryLabel(dict, id),
    art: CATEGORY_ART[id],
  }));

  const brandsList = [
    { id: "astral-pipes", name: "Astral Pipes", logo: "/images/brand/astral-logo.png" },
    { id: "pmc", name: "PMC", logo: "/images/brand/pmc-logo.png" },
    { id: "kurlar", name: "Kurlar", logo: "/images/brand/kurlar-logo.png" },
    { id: "alka", name: "ALKA Thrust Bearing", logo: "/images/brand/alka-logo.png" },
    { id: "novo", name: "Novo Solar Inverter", logo: "/images/brand/NOVO.png" },
    { id: "tormac", name: "Tormac Pumps", logo: "/images/brand/Tormac.png" },
    { id: "untel", name: "Üntel", logo: "/images/brand/Untel.png" },
  ];

  return (
    <div className="bg-pine min-h-screen pb-20">
      {/* Category wall. Flat pine — the stock Unsplash "industrial background"
          that used to sit behind this is another company's photograph, which
          §06 rules out, and a flat ground is what lets the line-art blend
          cleanly anyway. */}
      <section className="relative pt-32 pb-16 flex flex-col justify-end bg-pine overflow-hidden">
        <div className="relative z-10 w-[95%] max-w-[1600px] mx-auto px-4">
          <div className="mb-14 flex flex-col items-center text-center">
            <h1 className="text-h1 sm:text-display font-extrabold text-bone mt-4">
              {dict.productsPage.title}
            </h1>
            <div className="brass-rule mt-6" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10 justify-items-center">
            {productCategories.map((cat) => (
              <Link
                href={`/${lang}/products/category/${cat.id}`}
                key={cat.id}
                className="flex flex-col items-center group w-full max-w-[220px]"
              >
                {/* bg-pine here is load-bearing, not decoration: `screen`
                    blends against whatever is painted below the image inside
                    its own stacking context, and the ancestor's z-index
                    isolates it from the section background. Without a pine
                    ground on this wrapper the tiles render as black boxes. */}
                <div className="relative w-full aspect-square bg-pine">
                  <Image
                    src={cat.art}
                    // Decorative: the label below already names the category.
                    alt=""
                    aria-hidden="true"
                    fill
                    // The tile is capped at 220px at every breakpoint, so a
                    // fixed hint is accurate. Leaving vw units here made Next
                    // serve a 3840px-wide file into a 220px slot.
                    sizes="220px"
                    className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                    // invert -> white strokes on black; screen -> the black
                    // drops out, leaving the strokes over pine.
                    style={{ filter: "invert(1)", mixBlendMode: "screen" }}
                  />
                </div>
                <span className="mt-4 text-[15px] md:text-base font-semibold text-bone/85 group-hover:text-brass transition-colors text-center">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our brands. §1.3 prescribed a fixed optical height and a single
          tone for the partner wall; on pine that tone is bone, so each mark
          is knocked out to white and comes back to full colour on hover. */}
      <section className="bg-pine py-16 lg:py-24 border-t border-bone/15">
        <div className="w-[95%] max-w-[1600px] mx-auto px-4">
          <div className="border-t-2 border-brass pt-3 mb-12">
            <h2 className="spec-label text-bone">
              {lang === "ar" ? "العلامات التجارية" : "Our brands"}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 md:gap-10 items-center justify-items-center w-full">
            {brandsList.map((brand) => (
              <Link
                href={`/${lang}/agents/${brand.id}`}
                key={brand.id}
                className="group relative w-full max-w-[140px] md:max-w-[200px] h-16 md:h-20"
                aria-label={brand.name}
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  // brightness-0 + invert flattens any logo to pure white,
                  // which is what gives the wall one optical weight.
                  className="object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-300"
                  sizes="(max-width: 768px) 140px, 200px"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-[95%] max-w-[1600px] mx-auto px-4 mt-12 mb-20">

        {/* Catalogue prompt. The per-product datasheets now live on each
            product page; this is the whole-range request. */}
        <div className="mt-8 text-bone py-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-bone/15">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-start">
            <FileText className="w-10 h-10 text-brass shrink-0" aria-hidden="true" />
            <div>
              <h3 className="text-h3 font-extrabold mb-2 text-bone">
                {lang === "ar"
                  ? "كتالوج المنتجات والمواصفات الفنية الكاملة"
                  : "Request the full technical catalogue"}
              </h3>
              <p className="text-bone/70 text-[13px] max-w-lg leading-6">
                {lang === "ar"
                  ? "المقاسات والموديلات الكاملة للمواتير والطلمبات ولوحات التشغيل. الكتالوج الخاص بكل منتج متاح على صفحته."
                  : "Full dimensions, ratings and models for motors, pumps and control panels. Each product's own catalogue is on its page."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href={`/${lang}/contact?subject=${encodeURIComponent(
                lang === "ar" ? "طلب كتالوج المنتجات" : "Product Catalog Request"
              )}`}
              className="inline-flex items-center justify-center gap-2 bg-brass hover:bg-bone text-ink font-semibold px-8 py-4 text-sm transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>{dict.productsPage.downloadCatalog}</span>
            </Link>
            <a
              href="tel:+201066685532"
              className="inline-flex items-center justify-center gap-2 text-bone border border-bone/30 hover:border-brass hover:text-brass font-semibold px-8 py-4 text-sm transition-colors"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span>{lang === "ar" ? "استفسار هاتفي" : "Phone Inquiry"}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
