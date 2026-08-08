import React from "react";
import { FileText, ArrowUpRight } from "lucide-react";
import { catalogueHref, cataloguesForProduct, type Catalogue } from "@/data/catalogues";

/**
 * "Open the catalogue" — the datasheet link §1.3 says the site is missing.
 *
 * Set as a spec plate: pine rule, mono metadata, brand named. Opens in a new
 * tab so the buyer keeps the product page they were reading.
 */
export function CatalogueLink({ catalogue, lang }: { catalogue: Catalogue; lang: string }) {
  const isAr = lang === "ar";
  const title = isAr ? catalogue.titleAr : catalogue.titleEn;

  return (
    <a
      href={catalogueHref(catalogue)}
      // PDFs open in the browser's viewer; a new tab keeps the product page.
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 border border-rule hover:border-pine bg-white px-4 py-3.5 transition-colors"
    >
      <FileText className="w-5 h-5 text-pine shrink-0" aria-hidden="true" />

      <span className="flex flex-col min-w-0 flex-1">
        {/* Brand first — the buyer is choosing between manufacturers. */}
        <span className="spec-label text-pine">{catalogue.brand}</span>
        <span className="text-[13px] font-semibold text-ink truncate">{title}</span>
      </span>

      {/* Size up front: contractors read on phones between jobs (§07), and
          one of these catalogues is 25 MB. */}
      <span className="font-mono text-[11px] text-stone whitespace-nowrap" dir="ltr">
        PDF · {catalogue.sizeMb.toFixed(1)} MB
      </span>

      <ArrowUpRight
        className="w-4 h-4 text-stone group-hover:text-pine shrink-0 transition-colors"
        aria-hidden="true"
      />
    </a>
  );
}

/**
 * Every catalogue that documents a product. Renders nothing when none is
 * mapped, so a product without a datasheet shows no empty shell — §1.3
 * counted stray empty widgets as part of what made the old site read
 * unattended.
 */
export default function CatalogueButton({
  productId,
  lang,
  className = "",
}: {
  productId: string;
  lang: string;
  className?: string;
}) {
  const catalogues = cataloguesForProduct(productId);
  if (catalogues.length === 0) return null;

  const isAr = lang === "ar";

  return (
    <div className={className}>
      <div className="border-t-2 border-pine pt-2.5 mb-3">
        <span className="spec-label">
          {isAr
            ? catalogues.length > 1
              ? "الكتالوجات الفنية"
              : "الكتالوج الفني"
            : catalogues.length > 1
              ? "Technical catalogues"
              : "Technical catalogue"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {catalogues.map((c) => (
          <CatalogueLink key={c.id} catalogue={c} lang={lang} />
        ))}
      </div>

      {/* §2.4 value 01: the customer should be able to see the model number
          before they call. */}
      <p className="mt-3 font-mono text-[11px] leading-4 text-stone-light">
        {isAr
          ? "مواصفات كاملة: معدل التصريف، الرفع، القطر، القدرة والمواد."
          : "Full specifications: flow rate, head, bore diameter, power and materials."}
      </p>
    </div>
  );
}
