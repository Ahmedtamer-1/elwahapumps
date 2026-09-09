import { getDictionary, Locale } from "./dictionaries";
import Hero from "@/components/Hero";
import ProductTeaser from "@/components/ProductTeaser";
import SelectorForm from "@/components/selector/SelectorForm";
import SuccessPartners from "@/components/SuccessPartners";
import { getCatalogListProducts } from "@/lib/products";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";
import {
  PHONE_SALES,
  PROJECTS_DELIVERED,
  TEAM_SIZE,
  FACILITY_AREA,
  RESPONSE_COVER,
} from "@/lib/company";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const [dict, products] = await Promise.all([
    getDictionary(lang as Locale),
    getCatalogListProducts(lang),
  ]);
  const isAr = lang === "ar";

  /* The selector band's copy is the selector page's own — eyebrow, title,
     subtitle, source note and the disclaimer all already exist in both
     dictionaries, so the homepage introduces no new strings to translate and
     the two surfaces cannot drift apart. */
  const sel = dict.pumpSelector as unknown as Record<string, string>;

  /**
   * The company read as four figures.
   *
   * The credentials a buyer checks first — how long, how many agencies, how
   * much of the country, which standard — now open the page in the hero
   * strip. What belongs here is the evidence behind the claim above it: the
   * projects delivered, the people, the floor space and the response cover.
   *
   * Labels are the About page's own stat labels, so the two pages cannot
   * describe the same figures differently, and the figures themselves come
   * from company.ts. Every value is Latin or numeric on purpose — a
   * nameplate that reads identically in both languages is how the actual
   * hardware is labelled.
   */
  const plate = [
    { value: PROJECTS_DELIVERED, key: dict.aboutPage.stats.projects },
    { value: TEAM_SIZE, key: dict.aboutPage.stats.team },
    { value: FACILITY_AREA, key: dict.aboutPage.stats.facility },
    { value: RESPONSE_COVER, key: dict.home.responseLabel },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white text-ink">
      {/* 1. Hero */}
      <Hero lang={lang} dict={dict} />

      {/* 2. Two-Column Supply vs Maintenance Highlight Block */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Supply block — paper ground, pine rule on top */}
            <div className="bg-white border-t-4 border-pine border-x border-b border-rule text-ink p-8 md:p-12 flex flex-col justify-between group">
              <div>
                <span className="spec-label block mb-4">
                  {dict.servicesPage.categories.supply}
                </span>
                <h2 className="text-h3 md:text-h2 font-extrabold mb-6 text-pine">
                  {dict.servicesPage.supplyTitle}
                </h2>
                <p className="text-stone text-small leading-relaxed mb-8 max-w-[52ch]">
                  {dict.servicesPage.supplyDesc}
                </p>
              </div>
              <Link
                href={`/${lang}/services?tab=supply`}
                className="inline-flex items-center gap-2 text-emerald-600 group-hover:text-emerald-700 font-bold text-sm w-fit"
              >
                <span>{isAr ? "استعرض خدمات التوريد" : "Explore Supply Services"}</span>
                <span className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  {isAr ? "←" : "→"}
                </span>
              </Link>
            </div>

            {/* Maintenance block — pine ground, brass rule on top */}
            <div className="bg-pine border-t-4 border-brass text-bone p-8 md:p-12 flex flex-col justify-between group">
              <div>
                {/* Brass is the accent for eyebrows on pine (§04 Fig. 7). */}
                <span className="spec-label text-brass block mb-4">
                  {dict.servicesPage.categories.maintenance}
                </span>
                <h2 className="text-h3 md:text-h2 font-extrabold mb-6 text-bone">
                  {dict.servicesPage.maintenanceTitle}
                </h2>
                {/* Bone at 75% on pine still clears AA; neutral-400 did not. */}
                <p className="text-bone/75 text-small leading-relaxed mb-8 max-w-[52ch]">
                  {dict.servicesPage.maintenanceDesc}
                </p>
              </div>
              <Link
                href={`/${lang}/services?tab=maintenance`}
                className="inline-flex items-center gap-2 text-emerald-400 group-hover:text-emerald-300 font-bold text-sm w-fit"
              >
                <span>{isAr ? "استعرض خدمات الصيانة" : "Explore Maintenance Services"}</span>
                <span className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  {isAr ? "←" : "→"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Products Showcase Section */}
      <section className="py-20 bg-bone border-y border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* The report's chapter opening — pine hairline, eyebrow, heading.
              The heading and the way out of the section share that one rule, so
              "all products" reads as the end of this chapter's title rather
              than a stray button below the grid. The subtitle is gone: the
              products speak for themselves underneath, and the sentence was
              a generic one this brand does not need. */}
          <div className="border-t-2 border-pine pt-4 mb-9 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <span className="spec-label block">{dict.productsPage.title}</span>
              <h2 className="text-h2 font-extrabold text-pine mt-3 text-balance max-w-[24ch]">
                {dict.home.productsHeading}
              </h2>
            </div>
            <Link
              href={`/${lang}/products`}
              className="spec-label text-pine hover:text-field transition-colors inline-flex items-center gap-1.5 pb-1.5 group"
            >
              {dict.productsPage.all}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              >
                {isAr ? "←" : "→"}
              </span>
            </Link>
          </div>

          <ProductTeaser lang={lang} dict={dict} products={products} />
        </div>
      </section>

      {/* 4. Pump selector band.
          The selector is the most useful thing on this site and it was a nav
          item among nine — a buyer had to decide to go looking for it. Here
          the two inputs are live on the homepage, so sizing can start before
          anyone has decided to talk to us.

          It is the same plain GET form the selector page uses, pointed at the
          same route with the same field names, so there is no second copy of
          the selection logic and the result is still a shareable URL. Ink
          ground, because this band sits between two green sections and a
          third would flatten the page. */}
      <section className="bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-10 lg:gap-16">
          <div className="py-16 lg:py-20">
            <span className="spec-label text-brass">{sel.eyebrow}</span>
            <h2 className="mt-4 text-h2 md:text-h1 font-extrabold text-bone text-balance max-w-[22ch]">
              {sel.title}
            </h2>
            <p className="mt-5 text-body text-bone/70 max-w-[52ch]">{sel.subtitle}</p>
            <p className="mt-6 font-mono text-xs leading-5 text-bone/50 max-w-[60ch]">
              {sel.sourceNote}
            </p>
          </div>

          {/* The card is centred against the copy on desktop and simply
              follows it on mobile. */}
          <div className="lg:self-center lg:py-12 pb-16 lg:pb-12">
            <SelectorForm
              dict={sel}
              flow=""
              flowUnit="m3h"
              head=""
              headUnit="m"
              action={`/${lang}/selector`}
              tone="bone"
            />
          </div>
        </div>
      </section>

      {/* 5. Why El Waha — the company data plate */}
      <section className="py-20 bg-pine text-bone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* The claim */}
            <div className="lg:col-span-5">
              <span className="spec-label text-brass block">
                {dict.home.whyEyebrow}
              </span>
              <h2 className="text-h2 font-extrabold text-bone mt-4 text-balance max-w-[24ch]">
                {dict.home.whyTitle}
              </h2>
              <p className="text-bone/75 text-small leading-relaxed mt-5 max-w-[44ch]">
                {dict.home.whyBody}
              </p>
              <Link
                href={`/${lang}/about`}
                className="mt-8 inline-flex items-center justify-center text-bone font-semibold text-sm px-7 py-3.5 border border-bone/30 hover:border-brass hover:text-brass transition-colors active-scale-98"
              >
                {dict.home.aboutCta}
              </Link>
            </div>

            {/* The evidence.
                Four figures on rules rather than a definition list: the plate
                gave every claim a key, a rating and a sentence of prose, which
                is three levels of hierarchy for what is really one number and
                what it counts. Brass rules open the top pair, hairlines the
                second, so the block reads top-down without a box around it. */}
            <div className="lg:col-span-7">
              <dl className="grid grid-cols-1 sm:grid-cols-2">
                {plate.map((row, i) => (
                  <div
                    key={row.key}
                    className={`pt-4 pb-7 ${
                      /* The first row of the pair carries brass, the second a
                         hairline. On one column every row after the first is a
                         hairline. */
                      i < 2 ? "border-t-2 border-brass" : "border-t border-bone/20"
                    } ${i === 1 ? "max-sm:border-t max-sm:border-bone/20" : ""} ${
                      i % 2 === 0 ? "sm:pe-7" : "sm:ps-7"
                    }`}
                  >
                    {/* Every rating is a Latin run, so it is isolated as one:
                        bidi otherwise resolves the slash in "24 / 7" as a
                        neutral between two numbers and flips it to "7 / 24" on
                        the Arabic page. inline-block keeps the isolate from
                        taking the column's alignment with it. */}
                    <dd dir="ltr" className="text-h1 font-extrabold text-bone leading-none">
                      <span className="inline-block">{row.value}</span>
                    </dd>
                    <dt className="spec-label text-bone/60 mt-2.5">{row.key}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Success Partners Strip — the client roster. */}
      <SuccessPartners lang={lang} />

      {/* 6. Contact CTA Band */}
      <section className="bg-pine text-bone py-16 border-t border-bone/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex items-center justify-between gap-12">
          <div className="mb-8 lg:mb-0 max-w-2xl">
            <h2 className="text-h2 font-extrabold text-bone mb-4">
              {isAr
                ? "هل تحتاج لتجهيز بئرك أو صيانة طلمباتك؟"
                : "Need well preparation or pumps maintenance?"}
            </h2>
            <p className="text-bone/75 text-small leading-relaxed max-w-[58ch]">
              {isAr
                ? "تواصل مع المهندسين الآن للحصول على استشارة مجانية وطلب عرض أسعار مخصص لمشروعك."
                : "Get in touch with our engineers today for a free technical consultation and a custom quotation."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={`tel:${PHONE_SALES}`}
              className="inline-flex items-center justify-center gap-2 bg-brass hover:bg-bone text-ink font-semibold text-sm px-8 py-4 transition-colors active-scale-98"
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
              {/* The number is Latin in both languages — §05 rule 5, one
                  numeral set, so a dialled number never has to be re-read. */}
              <span dir="ltr">+20 106 668 5532</span>
            </a>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center gap-2 text-bone font-semibold text-sm px-8 py-4 border border-bone/30 hover:border-brass hover:text-brass transition-colors active-scale-98"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              <span>{dict.common.requestQuote}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
