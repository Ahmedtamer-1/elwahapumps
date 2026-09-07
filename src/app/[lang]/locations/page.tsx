import React from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import DistributorNetwork from "@/components/DistributorNetwork";
import { coverageTotals } from "@/data/distributors";
import { getPublishedDistributors } from "@/lib/distributors";
import { localizedAlternates } from "@/lib/seo";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const isAr = lang === "ar";
  return {
    title: dict.nav.locations,
    description: isAr
      ? "موزّعونا المعتمدون من القاهرة والجيزة حتى الصعيد والواحات. اختر أقرب موزّع لك واتصل به مباشرة."
      : "Our authorised distributors, from Cairo and Giza through Upper Egypt to the Western Desert oases.",
    alternates: localizedAlternates(lang, "/locations"),
  };
}

/**
 * The distributor network — where to buy, and who to call.
 *
 * §2.4 value 04: a phone number is not a badge to display, it is a number
 * that gets answered. Every distributor on this page carries a live tel: link
 * and a WhatsApp link, so the map is a way of finding a person rather than a
 * decoration above a contact form.
 */
export default async function LocationsPage({ params }: PageProps) {
  const { lang } = await params;
  const [dict, distributors] = await Promise.all([
    getDictionary(lang as Locale),
    getPublishedDistributors(),
  ]);
  const isAr = lang === "ar";
  const totals = coverageTotals(distributors);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header band. Flat pine — §03.5 allows pine, bone or white only. */}
      <section className="bg-pine pt-32 pb-14 text-bone">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="spec-label text-brass">
            {isAr ? "شبكة التوزيع" : "Distributor network"}
          </span>

          <h1 className="mt-3 text-h1 font-extrabold text-bone sm:text-display">
            {dict.nav.locations}
          </h1>

          <div className="brass-rule mt-6" aria-hidden="true" />

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-bone/75">
            {isAr
              ? "موزّعونا المعتمدون من القاهرة والجيزة حتى الصعيد والواحات. اختر أقرب موزّع لك واتصل به مباشرة."
              : "Our authorised distributors, from Cairo and Giza through Upper Egypt to the Western Desert oases. Find the one nearest you and call them directly."}
          </p>

          {/* The network, as figures — a number and a name, never a
              superlative (§07). */}
          <dl
            className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t-2 border-brass pt-4"
            dir="ltr"
          >
            {[
              { figure: totals.distributors, label: isAr ? "موزّع معتمد" : "Distributors" },
              { figure: totals.cities, label: isAr ? "مدينة" : "Cities" },
              { figure: totals.regions, label: isAr ? "أقاليم" : "Regions" },
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

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* No distributors published means no map and no list — the
            head-office panel below carries the page on its own, rather than
            an empty map sitting beside an empty column. */}
        {distributors.length > 0 && (
          <DistributorNetwork lang={lang} distributors={distributors} />
        )}

        {/* No distributor nearby is still a sale — route it to head office. */}
        <section className="mt-16 flex flex-col gap-6 border-t-2 border-pine bg-bone p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <span className="spec-label text-pine">
              {isAr ? "لا يوجد موزّع في منطقتك؟" : "No distributor in your area?"}
            </span>
            <p className="mt-2 text-sm leading-relaxed text-stone">
              {isAr
                ? "نورّد ونركّب ونصون في جميع المحافظات من مقرنا في 6 أكتوبر. تواصل مع فريق المبيعات مباشرة."
                : "We supply, install and maintain in every governorate from our base in 6th of October City. Talk to the sales team directly."}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <a
              href="tel:+201066685532"
              className="inline-flex items-center justify-center gap-2 bg-pine px-5 py-3 text-[13px] font-semibold text-bone transition-colors hover:bg-field"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span dir="ltr">+20 106 668 5532</span>
            </a>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center border border-pine px-5 py-3 text-[13px] font-semibold text-pine transition-colors hover:bg-pine hover:text-bone"
            >
              {isAr ? "تواصل معنا" : "Contact us"}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
