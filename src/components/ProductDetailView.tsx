"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Truck, Phone, MessageSquare } from "lucide-react";
import type { CatalogProduct } from "@/lib/products";
import type { ProductModelRow } from "@/data/products";
import { priceOnRequestLabel } from "@/lib/price";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductVariantSelector, { useVariantSelection } from "@/components/ProductVariantSelector";
import CatalogueButton from "@/components/CatalogueButton";
import type { Dictionary } from "../app/[lang]/dictionaries";

interface ProductDetailViewProps {
  product: CatalogProduct;
  lang: string;
  dict: Dictionary;
  title: string;
  desc: string;
}

/** Every column a model table can show, in display order, past the model name. */
const MODEL_COLUMNS = [
  { key: "flow", labelKey: "tableFlow" },
  { key: "head", labelKey: "tableHead" },
  { key: "motor", labelKey: "tableMotor" },
  { key: "hp", labelKey: "tableHp" },
  { key: "weight", labelKey: "tableWeight" },
  { key: "outlet", labelKey: "tableOutlet" },
] as const satisfies ReadonlyArray<{ key: keyof ProductModelRow; labelKey: string }>;

function SpecsTable({ specs }: { specs: Record<string, string> }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/30">
      <table className="w-full text-left border-collapse">
        <tbody className="divide-y divide-outline-variant/20">
          {Object.entries(specs).map(([key, value], idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container"}>
              <th className="py-4 px-6 font-headline-md text-[16px] text-on-surface-variant w-1/3 border-r border-outline-variant/10 rtl:border-r-0 rtl:border-l rtl:text-right">
                {key}
              </th>
              <td className="py-4 px-6 font-body-md text-primary font-medium rtl:text-right">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductDetailView({ product, lang, dict, title, desc }: ProductDetailViewProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeDocTab, setActiveDocTab] = useState<"overview" | "technical">("overview");

  const isAr = lang === "ar";

  // Size selectors for the chosen combination.
  const selection = useVariantSelection(product.options, product.variantRows);
  const variant = selection.selected;

  // Prices are not shown publicly — every enquiry is quoted by phone, so the
  // price slot carries the call-us label instead of a figure.
  const shownPrice = priceOnRequestLabel(lang);

  // "6" · 7.5 HP · Cast Iron" — carried into the cart and the WhatsApp message so the
  // enquiry names the exact size rather than just the product.
  const variantLabel = selection.axes
    .filter((a) => a.selected !== undefined)
    .map((a) => a.values.find((v) => v.value === a.selected)?.label)
    .filter(Boolean)
    .join(" · ");

  const tableSpecs = isAr ? product.tableSpecsAr : product.tableSpecsEn;
  const features = isAr ? product.featuresAr : product.featuresEn;
  const hasDocs = Boolean(
    (features && features.length > 0) ||
    (product.modelGroups && product.modelGroups.length > 0) ||
    (product.specGroups && product.specGroups.length > 0)
  );
  const t = dict.productsPage;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column - Gallery */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="glass-card rounded-2xl overflow-hidden mb-4 p-4 aspect-square relative flex items-center justify-center bg-white shadow-sm">
              <Image 
                src={product.gallery[activeImage]} 
                alt={title} 
                fill 
                className="object-contain p-6"
              />
            </div>
            
            {/* Thumbnails */}
            {product.gallery.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.gallery.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white ${
                      activeImage === idx ? "border-secondary shadow-md" : "border-outline-variant hover:border-secondary/50"
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details & Variants */}
        <div className="lg:col-span-7">
          <div className="mb-6">
            {product.modelNo && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-label-sm font-mono uppercase tracking-wider text-outline">{t.modelNo}:</span>
                <span className="px-2.5 py-1 rounded-md bg-surface-container border border-outline-variant/40 font-bold text-label-sm text-primary">
                  {product.modelNo}
                </span>
              </div>
            )}
            <h1 className="text-display-lg-mobile md:text-display-lg text-primary mb-2 font-display-lg">{title}</h1>
            <div className="flex items-center gap-4 text-label-sm text-outline mb-4">
              <span className="flex items-center gap-1 text-primary"><ShieldCheck className="w-4 h-4" /> {isAr ? "ضمان معتمد" : "Certified Warranty"}</span>
            </div>

            <p className="text-2xl md:text-3xl font-bold text-primary mb-1">{shownPrice}</p>
            {variant && Object.keys(variant.specs).length > 0 && (
              <p className="text-label-sm text-outline mb-4">
                {Object.values(variant.specs).join(" · ")}
              </p>
            )}

            <p className="text-body-md text-on-surface-variant leading-relaxed">
              {desc}
            </p>
          </div>

          <div className="h-px w-full bg-outline-variant/30 my-8"></div>

          {/* Size selectors, priced from the catalogue sheet */}
          <ProductVariantSelector axes={selection.axes} choose={selection.choose} />

          {/* Supplier Info & CTAs */}
          <div className="glass-card p-6 rounded-2xl bg-surface-container-lowest">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/30">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                EW
              </div>
              <div>
                <h4 className="font-headline-md text-[18px] text-primary">{isAr ? "شركة الواحة لخدمات الآبار والطلمبات" : "El Waha Pumps"}</h4>
                <p className="text-label-sm text-outline flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-4 h-4 text-secondary" /> 
                  {isAr ? "مورد موثوق" : "Verified Supplier"}
                </p>
              </div>
            </div>

            <AddToCartButton
              lang={lang}
              className="w-full mb-4 py-4"
              item={{
                productId: product.id,
                slug: product.id,
                name: title,
                unitPrice: variant ? variant.price : product.price,
                currency: variant ? variant.currency : product.currency,
                image: product.gallery[0],
                variantId: variant?.id,
                variantLabel: variantLabel || undefined,
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href={`/${lang}/contact?subject=${encodeURIComponent(isAr ? `طلب عرض سعر: ${title}` : `Quote Request: ${title}`)}`}
                className="bg-secondary hover:bg-secondary/90 text-white font-headline-md text-[16px] py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active-scale-98"
              >
                <MessageSquare className="w-5 h-5" />
                {isAr ? "طلب عرض سعر" : "Get Latest Price"}
              </Link>
              <a
                href="tel:+201066685532"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-headline-md text-[16px] py-4 rounded-xl flex items-center justify-center gap-2 transition-all active-scale-98"
              >
                <Phone className="w-5 h-5" />
                {isAr ? "اتصل الآن" : "Call Now"}
              </a>
            </div>
            
            {/* The datasheet, in the buy box. §1.3: a buyer who cannot find
                specifications leaves to find them elsewhere — so the
                catalogue sits beside the price, not buried further down. */}
            <CatalogueButton productId={product.id} lang={lang} className="mt-6" />

            <div className="mt-4 flex items-center justify-center gap-6 text-label-sm text-outline">
              <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> {isAr ? "شحن لجميع المحافظات" : "Nationwide Shipping"}</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> {isAr ? "حماية المشتري" : "Buyer Protection"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation: Overview / Technical Data tabs for products with extended data, plain specs table otherwise */}
      {hasDocs ? (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => setActiveDocTab("overview")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeDocTab === "overview"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200"
              }`}
            >
              {t.overview}
            </button>
            <button
              onClick={() => setActiveDocTab("technical")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeDocTab === "technical"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200"
              }`}
            >
              {t.technicalData}
            </button>
          </div>

          {activeDocTab === "overview" ? (
            features && features.length > 0 && (
              <div>
                <h3 className="font-headline-md text-xl text-primary mb-5">{t.features}</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-body-md text-on-surface-variant">
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : (
            <div className="space-y-12">
              <div>
                <h3 className="font-headline-md text-xl text-primary mb-5">{t.specs}</h3>
                <SpecsTable specs={tableSpecs} />
              </div>

              {product.modelGroups && product.modelGroups.length > 0 && (
                <div className="space-y-8">
                  {product.modelGroups.map((group) => {
                    // Catalogues differ in which figures they quote, so show only
                    // the columns this group's rows actually fill — an empty
                    // "Outlet" column reads as missing data rather than N/A.
                    const columns = MODEL_COLUMNS.filter((col) =>
                      group.rows.some((row) => row[col.key])
                    );

                    return (
                    <div key={group.diameter}>
                      <h3 className="font-headline-md text-xl text-primary mb-1">
                        {group.diameter} {t.modelSeries}
                        <span className="text-label-sm font-normal text-outline ms-2">({group.flowRange})</span>
                      </h3>
                      <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-x-auto mt-4">
                        <table className="w-full text-left border-collapse min-w-[560px]">
                          <thead>
                            <tr className="bg-surface-container">
                              <th className="py-3 px-4 text-label-sm font-bold text-outline uppercase tracking-wide rtl:text-right">{t.tableModel}</th>
                              {columns.map((col) => (
                                <th key={col.key} className="py-3 px-4 text-label-sm font-bold text-outline uppercase tracking-wide rtl:text-right">
                                  {t[col.labelKey]}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/20">
                            {group.rows.map((row, rIdx) => (
                              <tr key={row.model} className={rIdx % 2 === 0 ? "bg-surface-container-lowest" : "bg-white"}>
                                <td className="py-3 px-4 font-bold text-primary text-body-md rtl:text-right">{row.model}</td>
                                {columns.map((col) => (
                                  <td key={col.key} className="py-3 px-4 text-on-surface-variant rtl:text-right">
                                    {row[col.key] ?? "—"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              {product.specGroups && product.specGroups.length > 0 && (
                <div className="space-y-8">
                  {product.specGroups.map((group) => (
                    <div key={group.title}>
                      <h3 className="font-headline-md text-xl text-primary mb-1">
                        {group.title}
                        {group.subtitle && (
                          <span className="block text-label-sm font-normal text-outline mt-1">{group.subtitle}</span>
                        )}
                      </h3>
                      <div className="glass-card rounded-2xl border border-outline-variant/30 overflow-x-auto mt-4">
                        <table className="w-full text-left border-collapse min-w-[720px]">
                          <thead>
                            <tr className="bg-surface-container">
                              {(isAr ? group.columnsAr : group.columnsEn).map((col, cIdx) => (
                                <th key={cIdx} className="py-3 px-4 text-label-sm font-bold text-outline uppercase tracking-wide rtl:text-right whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/20">
                            {group.rows.map((row, rIdx) => (
                              <tr key={row.type} className={rIdx % 2 === 0 ? "bg-surface-container-lowest" : "bg-white"}>
                                <td className="py-3 px-4 font-bold text-primary text-body-md rtl:text-right whitespace-nowrap">{row.type}</td>
                                {row.values.map((val, vIdx) => (
                                  <td key={vIdx} className="py-3 px-4 text-on-surface-variant rtl:text-right whitespace-nowrap">{val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-16">
          <h2 className="font-display-lg text-3xl text-primary mb-8 border-b-2 border-primary inline-block pb-2">
            {isAr ? "المواصفات الفنية" : "Technical Specifications"}
          </h2>
          <SpecsTable specs={tableSpecs} />
        </div>
      )}
    </div>
  );
}
