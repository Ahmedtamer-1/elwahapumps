import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, Locale } from "../dictionaries";
import { categoryLabel } from "@/data/categories";
import {
  catalogueHref,
  cataloguesByCategory,
  catalogueTotals,
  type Catalogue,
} from "@/data/catalogues";
import { ArrowUpRight, Download, Phone } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

/**
 * The catalogue library — every manufacturer datasheet El Waha holds.
 *
 * Brand Report §1.3 names "no specifications anywhere" as the finding that
 * costs the most enquiries: "A buyer choosing a pump needs flow rate, head,
 * bore diameter, power and materials. The site describes; it never specifies.
 * Serious buyers leave to find a datasheet." This page is the answer to that,
 * and it is deliberately not a marketing page — it is an index.
 *
 * Each card is set as a spec plate (§05/§07): the manufacturer's own mark, the
 * catalogue's own title, and mono metadata that says what the tap will cost —
 * one of these files is 25 MB and contractors read on phones between jobs.
 */

/** One catalogue, as a spec plate with the manufacturer's mark on top. */
function CatalogueCard({ catalogue, lang }: { catalogue: Catalogue; lang: string }) {
  const isAr = lang === "ar";
  const title = isAr ? catalogue.titleAr : catalogue.titleEn;
  const href = catalogueHref(catalogue);

  return (
    <article className="group flex flex-col border border-rule bg-white hover:border-pine transition-colors duration-300">
      {/* The mark, at one optical height across every card — the same
          normalisation the partner wall uses, so nine logos at nine scales
          read as a library rather than as a jumble. */}
      <div className="relative flex h-28 items-center justify-center border-b border-rule-light bg-bone">
        {catalogue.logo ? (
          <Image
            src={catalogue.logo}
            alt={catalogue.brand}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain px-10 py-6 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
          />
        ) : (
          // Voltson supplied no logo file. The name, set in mono, is a
          // deliberate placeholder rather than an empty box.
          <span
            className="font-mono text-[15px] font-medium uppercase tracking-[0.2em] text-stone"
            dir="ltr"
          >
            {catalogue.brand}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Brand first — the buyer is choosing between manufacturers. */}
        <span className="spec-label text-pine">{catalogue.brand}</span>

        <h3 className="mt-1.5 text-[15px] font-semibold leading-6 text-ink">
          {title}
        </h3>

        {/* What the tap costs, before it is taken. Western digits on the
            Arabic side too (§5.2 rule 5). */}
        <p
          className="mt-3 font-mono text-[11px] leading-4 text-stone"
          dir="ltr"
        >
          PDF · {catalogue.sizeMb.toFixed(1)} MB · {catalogue.pages}{" "}
          {isAr ? "صفحة" : catalogue.pages === 1 ? "page" : "pages"}
        </p>

        <div className="mt-5 flex items-center gap-2 border-t border-rule-light pt-4">
          <a
            href={href}
            // PDFs open in the browser's viewer; a new tab keeps this index.
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 bg-pine px-4 py-2.5 text-[13px] font-semibold text-bone hover:bg-field transition-colors"
          >
            <span>{isAr ? "افتح الكتالوج" : "Open catalogue"}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>

          <a
            href={href}
            download
            className="inline-flex items-center justify-center border border-rule px-3 py-2.5 text-stone hover:border-pine hover:text-pine transition-colors"
            aria-label={
              isAr ? `تحميل ${title} (PDF)` : `Download ${title} (PDF)`
            }
            title={isAr ? "تحميل" : "Download"}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default async function CataloguesPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const isAr = lang === "ar";
  const groups = cataloguesByCategory();
  const totals = catalogueTotals();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header band. Flat pine — §03.5 allows pine, bone or white only. */}
      <section className="bg-pine pt-32 pb-14 text-bone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="spec-label text-brass">
            {isAr ? "المكتبة الفنية" : "Technical library"}
          </span>

          <h1 className="mt-3 text-h1 sm:text-display font-extrabold text-bone">
            {dict.nav.catalogues}
          </h1>

          <div className="brass-rule mt-6" aria-hidden="true" />

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-bone/75">
            {isAr
              ? "كتالوجات المصنّعين الأصلية للمنتجات التي نوردها: معدل التصريف، الرفع، القطر، القدرة والمواد. حمّلها قبل أن تتصل بنا — لتعرف رقم الموديل الذي تحتاجه."
              : "The manufacturers' own catalogues for the equipment we supply: flow rate, head, bore diameter, power and materials. Read them before you call — so you know the model number you need."}
          </p>

          {/* The library, as figures. A number and a name, never a
              superlative (§07). */}
          <dl
            className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t-2 border-brass pt-4"
            dir="ltr"
          >
            {[
              {
                figure: totals.catalogues,
                label: isAr ? "كتالوج" : "Catalogues",
              },
              {
                figure: totals.brands,
                label: isAr ? "مصنّع" : "Manufacturers",
              },
              {
                figure: totals.pages,
                label: isAr ? "صفحة مواصفات" : "Pages of specifications",
              },
            ].map((stat) => (
              <div key={stat.label} className={isAr ? "text-right" : ""}>
                <dd className="font-mono text-2xl font-medium leading-none text-brass">
                  {stat.figure}
                </dd>
                <dt className="mt-1.5 text-[12px] text-bone/70">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* One group per product family, in reading order. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {groups.map((group) => (
          <section key={group.category} className="mt-14 first:mt-12">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-t-2 border-pine pt-3">
              <h2 className="text-h3 font-extrabold text-pine">
                {categoryLabel(dict, group.category)}
              </h2>
              <span className="spec-label shrink-0" dir="ltr">
                {group.items.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((catalogue) => (
                <CatalogueCard
                  key={catalogue.id}
                  catalogue={catalogue}
                  lang={lang}
                />
              ))}
            </div>
          </section>
        ))}

        {/* §2.4 value 01: the customer should be able to see the model number
            before they call — and reach an engineer when the sheet is not
            enough. */}
        <section className="mt-16 flex flex-col gap-6 border-t-2 border-pine bg-bone p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <span className="spec-label text-pine">
              {isAr ? "لم تجد الكتالوج المطلوب؟" : "Catalogue not listed?"}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              {isAr
                ? "نمثّل مصنّعين إضافيين ونوفّر كتالوجات ومواصفات لم تُنشر هنا بعد. اطلبها من فريق الدعم الفني وسنرسلها لك."
                : "We represent further manufacturers and hold datasheets not yet published here. Ask our technical team and we will send them to you."}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href="tel:+201066685532"
              className="inline-flex items-center justify-center gap-2 bg-pine px-5 py-3 text-[13px] font-semibold text-bone hover:bg-field transition-colors"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span dir="ltr">+20 106 668 5532</span>
            </a>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center border border-pine px-5 py-3 text-[13px] font-semibold text-pine hover:bg-pine hover:text-bone transition-colors"
            >
              {dict.common.bookNow}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
