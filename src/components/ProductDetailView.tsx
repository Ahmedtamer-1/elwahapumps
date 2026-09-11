"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, ShoppingCart, Check } from "lucide-react";
import type { CatalogProduct } from "@/lib/products";
import type { Dictionary } from "../app/[lang]/dictionaries";
import type { ProductModelRow } from "@/data/products";
import { priceOnRequestLabel } from "@/lib/price";
import { useCart } from "@/components/cart/CartContext";
import ProductVariantSelector, { useVariantSelection } from "@/components/ProductVariantSelector";
import { catalogueHref, cataloguesForProduct } from "@/data/catalogues";

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

/* ------------------------------------------------------------------ */
/* Table primitives                                                    */
/*                                                                     */
/* One set of cell styles for every table on the page. They were three */
/* near-copies before, which is why the specs table, the model tables  */
/* and the spec-group tables each had slightly different padding and   */
/* a different idea of what a header looked like.                      */
/* ------------------------------------------------------------------ */

/* Alignment lives here rather than per cell: every column reads from the start
   edge, figures included. The numeric columns used to be end-aligned, which is
   the convention for a column of figures you compare down — but these tables
   are read across, one model at a time, and the figures ended up sitting far
   from the model name that owns them with a gap of empty cell between.

   `text-start`, not `text-left`, so the Arabic tables align right without a
   second set of rules. `tabular-nums` stays on the figure cells: the digits
   still line up with each other, they just line up from the other edge.

   The cell borders are `rule` rather than `rule-light` — the grid was faint
   enough at 0.10 alpha that a wide table stopped reading as a grid at all. */
const TH =
  "border border-rule bg-bone px-3.5 py-2.5 text-start font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-stone whitespace-nowrap";
const TD = "border border-rule px-3.5 py-2.5 text-start font-mono text-[12.5px] text-ink";

/** A specifications plate — key/value pairs, as the nameplate on the unit. */
function SpecsTable({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs);
  if (entries.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-start">
        <tbody>
          {entries.map(([key, value], idx) => (
            <tr key={key} className={idx % 2 === 1 ? "bg-bone" : "bg-white"}>
              <th scope="row" className={`${TH} w-1/3`}>
                {key}
              </th>
              <td className={`${TD} font-medium`}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductDetailView({ product, lang, dict, title, desc }: ProductDetailViewProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const isAr = lang === "ar";
  const { add } = useCart();

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

  // What each panel actually holds, kept apart so a tab is never offered
  // with nothing behind it and the page never opens on an empty panel.
  const hasOverview = Boolean(features && features.length > 0);
  const hasTechnical = Boolean(
    Object.keys(tableSpecs).length > 0 ||
    (product.modelGroups && product.modelGroups.length > 0) ||
    (product.specGroups && product.specGroups.length > 0)
  );
  const hasDocs = hasOverview || hasTechnical;

  /* Overview opens first. A reader who has just chosen this product from a
     category wants to know what it is before they read a seven-column table
     of model codes; the tables are what they come back for, not what they
     arrive on. Products with no features fall through to the tables, which
     is all they have. */
  const [activeDocTab, setActiveDocTab] = useState<"technical" | "overview">(
    hasOverview ? "overview" : "technical",
  );
  const t = dict.productsPage;

  const catalogues = cataloguesForProduct(product.id);
  const catalogue = catalogues[0];

  /**
   * The headline specifications, read as a nameplate strip under the title.
   *
   * The series comes from the model number where the catalogue gives one; the
   * rest are the first entries of the product's own spec table. Real data
   * only — a product without specs simply shows a shorter strip rather than
   * inventing cells to fill the row.
   */
  const nameplate = [
    ...(product.modelNo ? [{ label: t.modelSeries, value: product.modelNo }] : []),
    /* A spec whose own label is the series is dropped here: several
       products carry both a model number and a "Series" row, and the strip
       was spending two of its three cells saying Series twice (Tormac TS
       read "TS - TN" next to "TS (AISI 304) / TN (AISI 316)"). The row
       itself stays in the technical data table below — this only decides
       what is worth lifting into the nameplate. */
    ...Object.entries(tableSpecs)
      .filter(([label]) => label.trim().toLowerCase() !== t.modelSeries.trim().toLowerCase())
      .map(([label, value]) => ({ label, value })),
  ].slice(0, 3);

  const addToCart = () => {
    add({
      productId: product.id,
      slug: product.id,
      name: title,
      unitPrice: variant ? variant.price : product.price,
      currency: variant ? variant.currency : product.currency,
      image: product.gallery[0],
      variantId: variant?.id,
      variantLabel: variantLabel || undefined,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Gallery */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="relative border border-rule bg-white h-[340px] sm:h-[400px]">
                <Image
                  src={product.gallery[activeImage]}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain p-6"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {product.gallery.length > 1 && (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {product.gallery.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      aria-label={`${title} — ${idx + 1}`}
                      aria-current={activeImage === idx ? "true" : undefined}
                      className={`relative h-[78px] bg-white transition-colors ${
                        activeImage === idx
                          ? "border-2 border-pine"
                          : "border border-rule hover:border-pine"
                      }`}
                    >
                      <Image src={img} alt="" fill sizes="120px" className="object-contain p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-7">
            {/* True of every product on the site: El Waha is the exclusive
                Egyptian agent for the manufacturers it stocks. */}
            <span className="spec-label block">
              {isAr ? "وكيل حصري في مصر" : "Exclusive Egyptian agent"}
            </span>

            <h1 className="mt-4 text-h2 md:text-h1 font-extrabold text-ink text-balance">
              {title}
            </h1>

            {/* The nameplate strip — the figures a buyer checks before reading
                a word of prose, held between two hairlines. */}
            {nameplate.length > 0 && (
              <dl className="mt-5 flex flex-wrap border-y border-rule">
                {nameplate.map((spec, i) => (
                  <div
                    key={spec.label}
                    className={`py-3 ${
                      i === 0 ? "pe-6" : "px-6 border-s border-rule"
                    }`}
                  >
                    <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-stone-light">
                      {spec.label}
                    </dt>
                    <dd className="mt-1 text-[13px] font-semibold text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <p className="mt-6 text-body text-ink max-w-[62ch] text-pretty">{desc}</p>

            {/* Price is a call, not a figure. */}
            <p className="mt-6 spec-label text-pine">{shownPrice}</p>

            {/* Size selectors, priced from the catalogue sheet */}
            <div className="mt-6">
              <ProductVariantSelector axes={selection.axes} choose={selection.choose} />
            </div>

            {/* The three ways out of this page. The buy box this replaces
                carried an "EW" avatar, a "Verified Supplier" badge, and
                nationwide-shipping and buyer-protection notices — marketplace
                furniture for a company that quotes every job by phone. */}
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href={`/${lang}/contact?subject=${encodeURIComponent(
                  isAr ? `طلب عرض سعر: ${title}` : `Quote Request: ${title}`
                )}`}
                className="inline-flex items-center justify-center bg-pine hover:bg-field text-bone font-semibold text-[13.5px] px-8 py-4 transition-colors active-scale-98"
              >
                {t.inquiry}
              </Link>

              {catalogue && (
                <a
                  href={catalogueHref(catalogue)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-rule hover:border-pine text-pine font-semibold text-[13.5px] px-8 py-4 transition-colors"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  {t.downloadCatalog}
                </a>
              )}

              <button
                type="button"
                onClick={addToCart}
                className="inline-flex items-center justify-center gap-2 border border-rule hover:border-pine text-pine font-semibold text-[13.5px] px-7 py-4 transition-colors"
              >
                {added ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                )}
                {added
                  ? isAr
                    ? "تمت الإضافة"
                    : "Added to cart"
                  : isAr
                    ? "أضف إلى الطلب"
                    : "Add to cart"}
              </button>
            </div>

            {/* Size up front: contractors read on phones between jobs, and one
                of these catalogues is 25 MB. */}
            {catalogue && (
              <p className="mt-3 font-mono text-[11px] text-stone" dir="ltr">
                {catalogue.brand} · PDF · {catalogue.sizeMb.toFixed(1)} MB
              </p>
            )}
          </div>
        </div>

        {/* Documentation.
            Full width rather than inside the 7-column details track as the
            mockup draws it: these tables run to seven columns and 720px, and
            in half a container they would be a horizontal scroll on desktop
            as well as on a phone. */}
        <div className="mt-14">
          {hasDocs ? (
            <>
              {/* Tabs on a pine rule, active carrying brass — the same tab
                  treatment as the services index. */}
              <div className="border-t-2 border-pine">
                <div role="tablist" className="flex flex-wrap">
                  {([
                    ...(hasOverview
                      ? ([{ id: "overview", label: t.overview }] as const)
                      : []),
                    ...(hasTechnical
                      ? ([{ id: "technical", label: t.technicalData }] as const)
                      : []),
                  ]).map((tab, i) => {
                    const active = activeDocTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        type="button"
                        aria-selected={active}
                        onClick={() => setActiveDocTab(tab.id)}
                        className={`py-3.5 text-[12.5px] font-semibold border-b-2 transition-colors ${
                          i === 0 ? "pe-6" : "px-6"
                        } ${active ? "text-pine border-brass" : "text-stone border-transparent hover:text-pine"}`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Both panels stay in the DOM and are toggled with `hidden`,
                  not conditionally mounted. The specification tables are the
                  most technical content on the site and a crawler only ever
                  sees the initial HTML, so mounting them on a tab click made
                  them invisible to search and to answer engines (S3-T03). */}
              <div hidden={activeDocTab !== "overview"}>
                {features && features.length > 0 && (
                  <div className="mt-8">
                    <h2 className="spec-label mb-4">{t.features}</h2>
                    {/* A plain bulleted list, not the ruled grid of cells this
                        used to be. Boxed in a border with a hairline between
                        every entry, it read as a second specification table
                        sitting above the real ones — and the overview is the
                        part a reader takes in before any table, so it is set
                        at reading size rather than caption size. */}
                    <ul className="max-w-3xl space-y-3">
                      {features.map((feature) => (
                        <li key={feature} className="flex gap-3 text-body-lg text-ink">
                          {/* Drawn rather than a list marker: `list-disc`
                              sizes its dot from the font, and at this size
                              that dot is a blob. */}
                          <span
                            aria-hidden="true"
                            className="mt-[0.7em] h-[5px] w-[5px] shrink-0 rounded-full bg-ink"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-12" hidden={activeDocTab !== "technical"}>
                  {Object.keys(tableSpecs).length > 0 && (
                    <section>
                      <h2 className="spec-label mb-4">{t.specs}</h2>
                      <SpecsTable specs={tableSpecs} />
                    </section>
                  )}

                  {product.modelGroups?.map((group) => {
                    // Catalogues differ in which figures they quote, so show only
                    // the columns this group's rows actually fill — an empty
                    // "Outlet" column reads as missing data rather than N/A.
                    const columns = MODEL_COLUMNS.filter((col) =>
                      group.rows.some((row) => row[col.key])
                    );

                    return (
                      <section key={group.diameter}>
                        <h2 className="spec-label mb-1">
                          {group.diameter} {t.modelSeries}
                        </h2>
                        <p className="font-mono text-[11px] text-stone-light mb-4" dir="ltr">
                          {group.flowRange}
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse min-w-[560px]">
                            <thead>
                              <tr>
                                <th className={TH}>{t.tableModel}</th>
                                {columns.map((col) => (
                                  <th key={col.key} className={TH}>
                                    {t[col.labelKey]}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {group.rows.map((row, rIdx) => (
                                <tr key={row.model} className={rIdx % 2 === 1 ? "bg-bone" : "bg-white"}>
                                  <td className={`${TD} font-medium whitespace-nowrap`}>
                                    {row.model}
                                  </td>
                                  {columns.map((col) => (
                                    /* Figures align on the digit — a column of
                                       ratings is read down, not across. */
                                    <td key={col.key} className={`${TD} tabular-nums`}>
                                      {row[col.key] ?? "—"}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    );
                  })}

                  {product.specGroups?.map((group) => (
                    <section key={group.title}>
                      <h2 className="spec-label mb-1">{group.title}</h2>
                      {group.subtitle && (
                        <p className="font-mono text-[11px] text-stone-light mb-4">
                          {group.subtitle}
                        </p>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[720px]">
                          <thead>
                            <tr>
                              {(isAr ? group.columnsAr : group.columnsEn).map((col) => (
                                <th key={col} className={TH}>
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {group.rows.map((row, rIdx) => (
                              <tr key={row.type} className={rIdx % 2 === 1 ? "bg-bone" : "bg-white"}>
                                <td className={`${TD} font-medium whitespace-nowrap`}>{row.type}</td>
                                {row.values.map((val, vIdx) => (
                                  <td
                                    key={vIdx}
                                    className={`${TD} tabular-nums whitespace-nowrap`}
                                  >
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  ))}
              </div>
            </>
          ) : (
            <section>
              <div className="border-t-2 border-pine pt-4 mb-6">
                <h2 className="text-h3 font-extrabold text-pine">{t.specs}</h2>
              </div>
              <SpecsTable specs={tableSpecs} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
