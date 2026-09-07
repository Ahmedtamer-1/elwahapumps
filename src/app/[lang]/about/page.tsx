import React from "react";
import Image from "next/image";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import { AGENCIES, AGENCY_COUNT, yearsOfService } from "@/lib/company";
import { fill } from "@/lib/format";
import { localizedAlternates } from "@/lib/seo";
import {
  ShieldCheck,
  Target,
  Eye,
  Users,
  FileCheck,
  Warehouse,
  Clock,
  BadgeCheck,
} from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.aboutPage.title,
    description: dict.aboutPage.subtitle,
    alternates: localizedAlternates(lang, "/about"),
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  /**
   * Six facts, not four. The old grid padded to four with "98% customer
   * satisfaction", which is unverifiable and drags the credibility of the
   * three real numbers down with it. Every figure here is one the company
   * can stand behind, and the year count derives from FOUNDED so it cannot
   * go stale.
   */
  const facts = [
    { value: `${yearsOfService()}+`, label: dict.aboutPage.stats.experience, icon: Clock },
    { value: String(AGENCY_COUNT), label: dict.aboutPage.stats.brands, icon: ShieldCheck },
    { value: "230+", label: dict.aboutPage.stats.projects, icon: FileCheck },
    { value: "80+", label: dict.aboutPage.stats.team, icon: Users },
    { value: "3,000 m²", label: dict.aboutPage.stats.facility, icon: Warehouse },
    { value: "24/7", label: dict.aboutPage.stats.support, icon: BadgeCheck },
  ];

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-pine text-bone py-16 md:py-20 border-b border-field">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-h1 md:text-display font-extrabold text-center mb-4">
            {dict.nav.about}
          </h1>
          <p className="text-emerald-400 text-center text-small max-w-xl mx-auto">
            {dict.aboutPage.subtitle}
          </p>
        </div>
      </section>

      {/* Story, with the team alongside it */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          <div>
            <div className="border-t-2 border-brass pt-3 mb-6">
              <h2 className="text-h2 md:text-h1 font-extrabold text-pine">
                {dict.aboutPage.title}
              </h2>
            </div>
            <div className="space-y-4 text-stone text-body">
              <p>{dict.aboutPage.p1}</p>
              <p>{dict.aboutPage.p2}</p>
              <p>{fill(dict.aboutPage.p3, { count: AGENCY_COUNT })}</p>
            </div>
          </div>

          {/* The people behind the paragraphs — the workshop team, so the
              headcount in the text has a face rather than staying a figure. */}
          <figure className="lg:sticky lg:top-28">
            <div className="relative aspect-[3/2] border border-rule bg-bone">
              <Image
                src="/images/about/team.jpg"
                alt={lang === "ar" ? "فريق شركة الواحة لخدمات الآبار والطلمبات" : "The El Waha Pumps team"}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                preload
              />
            </div>
            <figcaption className="mt-3 text-spec uppercase text-stone">
              {lang === "ar"
                ? "فريق الواحة — مركز الصيانة والمخازن، الجيزة"
                : "The El Waha team — workshop and stores, Giza"}
            </figcaption>
          </figure>
        </div>

        {/*
          The two halves of the business, stated plainly. Prospects arrive
          wanting one or the other — a new well equipped, or an existing one
          kept running — so the split is worth naming rather than leaving
          them to infer it from the service list.
        */}
        <div className="mb-20">
          <span className="text-spec uppercase text-stone-light block mb-5">
            {dict.aboutPage.divisionsLabel}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-rule border border-rule">
            <div className="bg-white p-8">
              <div className="border-t-2 border-brass pt-3 mb-3">
                <h3 className="text-h3 font-extrabold text-pine">
                  {dict.aboutPage.divisions.supplyTitle}
                </h3>
              </div>
              <p className="text-small text-stone">{dict.aboutPage.divisions.supplyDesc}</p>
            </div>
            <div className="bg-white p-8">
              <div className="border-t-2 border-brass pt-3 mb-3">
                <h3 className="text-h3 font-extrabold text-pine">
                  {dict.aboutPage.divisions.serviceTitle}
                </h3>
              </div>
              <p className="text-small text-stone">{dict.aboutPage.divisions.serviceDesc}</p>
            </div>
          </div>
        </div>

        {/* Facts */}
        <div className="grid grid-cols-2 md:grid-cols-3 border-t border-l border-rule mb-20">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.label}
                className="p-6 sm:p-8 border-b border-r border-rule bg-white hover:bg-bone transition-colors"
              >
                <Icon className="w-5 h-5 text-brass mb-4" />
                <div className="text-h1 font-extrabold text-pine mb-1 tabular-nums">
                  {fact.value}
                </div>
                <div className="text-small text-stone">{fact.label}</div>
              </div>
            );
          })}
        </div>

        {/* Exclusive agencies — the proof behind the AGENCY_COUNT claim */}
        <div className="mb-20">
          <div className="border-t-2 border-pine pt-3 mb-4">
            <h2 className="text-h3 sm:text-h2 font-extrabold text-pine">
              {dict.aboutPage.agenciesTitle}
            </h2>
          </div>
          <p className="text-small text-stone max-w-2xl mb-8">
            {dict.aboutPage.agenciesSubtitle}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-rule">
            {AGENCIES.map((agency) => (
              <div
                key={agency.name}
                className="group relative h-28 flex items-center justify-center border-b border-r border-rule bg-white"
              >
                <div className="relative w-full h-16">
                  <Image
                    src={agency.logo}
                    alt={agency.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    quality={95}
                    className="object-contain px-4"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* The grid above is logos only, no text an answer engine or a
              screen reader can use; this is the actual indexable content —
              every agency name as selectable text. */}
          <p className="mt-4 text-small text-stone">
            {AGENCIES.map((agency, idx) => (
              <React.Fragment key={agency.name}>
                {idx > 0 && (lang === "ar" ? "، " : ", ")}
                {agency.name}
              </React.Fragment>
            ))}
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-rule border border-rule">
          <div className="p-8 sm:p-10 bg-bone flex gap-6">
            <div className="w-11 h-11 flex items-center justify-center bg-pine text-bone shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-h3 font-extrabold text-pine mb-3">
                {dict.aboutPage.vision}
              </h3>
              <p className="text-stone text-small">{dict.aboutPage.visionText}</p>
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-bone flex gap-6">
            <div className="w-11 h-11 flex items-center justify-center bg-pine text-bone shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-h3 font-extrabold text-pine mb-3">
                {dict.aboutPage.mission}
              </h3>
              <p className="text-stone text-small">{dict.aboutPage.missionText}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
