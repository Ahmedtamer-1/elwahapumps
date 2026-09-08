import React from "react";
import Image from "next/image";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import PageHeader from "@/components/PageHeader";
import { localizedAlternates } from "@/lib/seo";
import {
  AGENCIES,
  FOUNDED,
  PROJECTS_DELIVERED,
  TEAM_SIZE,
  FACILITY_AREA,
} from "@/lib/company";

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
  const isAr = lang === "ar";

  /**
   * Three figures, not six.
   *
   * The grid used to carry six, each behind a lucide glyph. Two problems.
   * The icons encoded nothing — a clock beside a year count and a shield
   * beside an agency count are the same gesture twice — and half the figures
   * are now stated better elsewhere on their own terms: the years and the
   * agency count open the homepage in the hero strip, the founding year is
   * the left half of the milestone panel below, and round-the-clock cover is
   * a sentence in the third paragraph rather than a stat tile.
   *
   * What is left is what only this page says: the work delivered, the people
   * who did it, and the floor they did it on. Values come from company.ts so
   * they cannot drift from the homepage.
   */
  const facts = [
    { value: PROJECTS_DELIVERED, label: dict.aboutPage.stats.projects },
    { value: TEAM_SIZE, label: dict.aboutPage.stats.team },
    { value: FACILITY_AREA, label: dict.aboutPage.stats.facility },
  ];

  return (
    <div className="bg-white">
      {/* The masthead every interior page opens on — start-aligned, on a brass
          rule. This page used to centre its own, set the subtitle in
          emerald-400 and use the nav label as the h1, which spent the
          headline slot on the word "About Us" and left the real title
          ("Two Decades of Deep-Well Engineering") as a section heading
          further down. */}
      <PageHeader
        eyebrow={dict.home.aboutCta}
        title={dict.aboutPage.title}
        subtitle={dict.aboutPage.subtitle}
      />

      {/* The story, with the workshop alongside it. 7/5 rather than 50/50:
          three paragraphs at half the container run to about 90 characters a
          line, well past comfortable. */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Ink, not stone. This is the page's primary reading, and §04
              keeps stone for secondary body and captions. */}
          <div className="lg:col-span-7 space-y-5 text-ink text-body">
            <p className="text-pretty">{dict.aboutPage.p1}</p>
            <p className="text-pretty">{dict.aboutPage.p2}</p>
            <p className="text-pretty">{dict.aboutPage.p3}</p>
          </div>

          {/* The people behind the paragraphs, so the headcount in the text
              has a face rather than staying a figure. */}
          <figure className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative aspect-[3/2] bg-pine">
              <Image
                src="/images/about/team.jpg"
                alt={isAr ? "فريق شركة الواحة للمضخات" : "The El Waha Pumps team"}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            {/* A caption is an annotation, so it is set as one: mono, stone,
                on a brass edge rather than floating under the frame. */}
            <figcaption className="mt-5 border-s-[3px] border-brass ps-4 py-1 font-mono text-xs leading-5 text-stone">
              {isAr
                ? "فريق الواحة — مركز الصيانة والمخازن، الجيزة"
                : "The El Waha team — workshop and stores, Giza"}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* How we got here.
          These two milestones have been sitting in the dictionaries unused.
          They are the most persuasive thing on the page — five people in a
          200 m² room to eighty across every governorate is the whole argument
          in two panels — so they now appear. */}
      <section className="bg-bone border-t border-rule py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t-2 border-pine pt-4 spec-label">
            {dict.aboutPage.milestonesLabel}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-rule border border-rule">
            <div className="bg-white p-8 sm:p-10">
              {/* Stone for the founding year, pine for today — the only two
                  points on the line, so they are told apart by colour rather
                  than by a rule between them. This was brass, which is 2.16:1
                  on white and the one pairing the brand doc rules out; stone
                  keeps the past/present contrast and clears AA (S6-T02). */}
              <div dir="ltr" className="text-h1 font-extrabold text-stone leading-none">
                <span className="inline-block">{FOUNDED}</span>
              </div>
              <p className="mt-4 text-small leading-6 text-ink max-w-[34ch]">
                {dict.aboutPage.milestones.founded}
              </p>
            </div>
            <div className="bg-white p-8 sm:p-10">
              <div className="text-h1 font-extrabold text-pine leading-none">
                {dict.aboutPage.milestones.todayLabel}
              </div>
              <p className="mt-4 text-small leading-6 text-ink max-w-[38ch]">
                {dict.aboutPage.milestones.today}
              </p>
            </div>
          </div>

          {/* The figures behind "today", on one rule. */}
          <dl className="mt-12 grid grid-cols-1 sm:grid-cols-3 border-t-2 border-pine">
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className={`pt-5 pb-1 ${
                  i !== 0 ? "sm:border-s sm:border-rule sm:ps-8" : "sm:pe-8"
                } ${i !== 0 ? "max-sm:border-t max-sm:border-rule max-sm:mt-5" : ""}`}
              >
                <dd
                  dir="ltr"
                  className="text-h2 font-extrabold text-pine leading-none tabular-nums"
                >
                  <span className="inline-block">{fact.value}</span>
                </dd>
                <dt className="spec-label mt-2.5">{fact.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Vision & Mission.
          One on pine, one on paper. They used to be two identical bone cards
          behind two icon chips, which said the two statements were the same
          kind of thing; a vision is an aspiration and a mission is a
          commitment, and giving them opposite grounds is the cheapest way to
          say so. Set at body-lg — these are the two sentences on the page
          most likely to be read aloud. */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7">
          <div className="bg-pine p-9 sm:p-11">
            <div className="spec-label text-brass">{dict.aboutPage.vision}</div>
            <p className="mt-5 text-body-lg text-bone text-pretty">
              {dict.aboutPage.visionText}
            </p>
          </div>
          <div className="border border-rule border-t-[3px] border-t-pine p-9 sm:p-11">
            <div className="spec-label">{dict.aboutPage.mission}</div>
            <p className="mt-5 text-body-lg text-ink text-pretty">
              {dict.aboutPage.missionText}
            </p>
          </div>
        </div>
      </section>

      {/* The two halves of the business. Prospects arrive wanting one or the
          other — a new well equipped, or an existing one kept running — so the
          split is worth naming rather than leaving them to infer it. Pine edge
          for supply, brass for service, matching how the two are marked on the
          homepage and the services index. */}
      <section className="bg-bone border-t border-rule py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="spec-label block">{dict.aboutPage.divisionsLabel}</span>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-rule border-s-[3px] border-s-pine p-8">
              <div className="spec-label">{dict.aboutPage.divisions.supplyTitle}</div>
              <p className="mt-3 text-small leading-6 text-ink">
                {dict.aboutPage.divisions.supplyDesc}
              </p>
            </div>
            <div className="bg-white border border-rule border-s-[3px] border-s-brass p-8">
              <div className="spec-label">{dict.aboutPage.divisions.serviceTitle}</div>
              <p className="mt-3 text-small leading-6 text-ink">
                {dict.aboutPage.divisions.serviceDesc}
              </p>
            </div>
          </div>

          {/* Exclusive agencies — the proof behind the agency-count claim.
              The list comes from AGENCIES so it and the figure quoted
              elsewhere cannot disagree. A hairline lattice at a fixed cell
              height: the marks are all cut to one canvas, so one box holds
              them at one optical scale. */}
          <div className="mt-14 border-t-2 border-pine pt-4 flex flex-wrap items-end justify-between gap-x-12 gap-y-3">
            <h2 className="text-h3 sm:text-h2 font-extrabold text-pine">
              {dict.aboutPage.agenciesTitle}
            </h2>
            <p className="text-small leading-6 text-stone max-w-[46ch] pb-1">
              {dict.aboutPage.agenciesSubtitle}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-rule border border-rule">
            {AGENCIES.map((agency) => (
              <div
                key={agency.name}
                className="relative h-24 bg-white flex items-center justify-center"
              >
                <div className="relative w-full h-10">
                  <Image
                    src={agency.logo}
                    alt={agency.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                    quality={95}
                    className="object-contain px-4"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
