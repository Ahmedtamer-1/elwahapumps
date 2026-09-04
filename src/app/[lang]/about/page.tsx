import React from "react";
import Image from "next/image";
import { getDictionary, Locale } from "../dictionaries";
import { AGENCIES, AGENCY_COUNT, yearsOfService } from "@/lib/company";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const facts = [
    { value: `${yearsOfService()}+`, label: dict.aboutPage.stats.experience },
    { value: String(AGENCY_COUNT), label: dict.aboutPage.stats.brands },
    { value: "230+", label: dict.aboutPage.stats.projects },
    { value: "80+", label: dict.aboutPage.stats.team },
    { value: "3,000 m²", label: dict.aboutPage.stats.facility },
    { value: "24/7", label: dict.aboutPage.stats.support },
  ];

  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="bg-pine py-16 md:py-[60px]">
        <div className="max-w-[1152px] mx-auto px-4 sm:px-8">
          <div className="spec-label text-brass mb-3.5">
            {lang === "ar" ? "عن الشركة" : "About the company"}
          </div>
          <h1 className="text-[40px] md:text-[52px] md:leading-[54px] tracking-[-0.035em] font-extrabold text-bone max-w-[24ch] text-balance">
            {dict.aboutPage.title}
          </h1>
          <div className="brass-rule my-6"></div>
          <p className="text-[15.5px] leading-[26px] text-bone/80 max-w-[56ch]">
            {dict.aboutPage.subtitle}
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="bg-white py-16 md:py-[80px]">
        <div className="max-w-[1152px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-[72px] items-start">
          <div className="space-y-[22px] text-ink text-[15px] leading-[28px] text-pretty">
            <p>{dict.aboutPage.p1}</p>
            <p>{dict.aboutPage.p2}</p>
            <p>{dict.aboutPage.p3}</p>
          </div>
          <div>
            <div className="relative h-[280px] bg-pine">
              <Image
                src="/images/about/team.jpg"
                alt={lang === "ar" ? "فريق شركة الواحة للمضخات" : "The El Waha Pumps team"}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="border-s-[3px] border-s-brass ps-[18px] py-1 mt-5 font-mono text-[12px] leading-[20px] text-stone">
              {lang === "ar"
                ? "تجميع اللوحات، ورشة مدينة السادس من أكتوبر"
                : "Panel assembly, 6th of October City workshop"}
            </div>
          </div>
        </div>
      </div>

      {/* How we got here */}
      <div className="bg-bone border-t border-rule py-16 md:py-[72px]">
        <div className="max-w-[1152px] mx-auto px-4 sm:px-8">
          <div className="section-rule spec-label mb-[34px]">
            {dict.aboutPage.milestonesLabel}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-rule bg-white">
            <div className="p-8 md:p-[38px] md:px-10 border-b md:border-b-0 md:border-e border-rule">
              <div className="text-[44px] leading-none font-extrabold tracking-tight text-brass">
                2013
              </div>
              <p className="mt-4 text-[14.5px] leading-[25px] text-ink max-w-[34ch]">
                {dict.aboutPage.milestones.founded}
              </p>
            </div>
            <div className="p-8 md:p-[38px] md:px-10">
              <div className="text-[44px] leading-none font-extrabold tracking-tight text-pine">
                {dict.aboutPage.milestones.todayLabel}
              </div>
              <p className="mt-4 text-[14.5px] leading-[25px] text-ink max-w-[38ch]">
                {dict.aboutPage.milestones.today}
              </p>
            </div>
          </div>

          <div className="mt-[56px] grid grid-cols-1 sm:grid-cols-3 gap-0 border-t-2 border-pine">
            <div className="pt-[22px] pb-6 sm:pb-0 sm:pe-8 border-b sm:border-b-0 sm:border-e border-rule">
              <div className="text-[34px] leading-[38px] font-extrabold text-pine">
                {facts[2].value}
              </div>
              <div className="mt-2 spec-label">{facts[2].label}</div>
            </div>
            <div className="pt-[22px] pb-6 sm:pb-0 sm:px-8 border-b sm:border-b-0 sm:border-e border-rule">
              <div className="text-[34px] leading-[38px] font-extrabold text-pine">
                {facts[3].value}
              </div>
              <div className="mt-2 spec-label">{facts[3].label}</div>
            </div>
            <div className="pt-[22px] sm:ps-8">
              <div className="text-[34px] leading-[38px] font-extrabold text-pine">
                {facts[4].value}
              </div>
              <div className="mt-2 spec-label">{facts[4].label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="bg-white py-16 md:py-[76px]">
        <div className="max-w-[1152px] mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="bg-pine p-8 md:p-[44px] md:pb-10">
            <div className="spec-label text-brass">
              {dict.aboutPage.vision}
            </div>
            <p className="mt-5 text-[18px] leading-[30px] text-bone text-pretty">
              {dict.aboutPage.visionText}
            </p>
          </div>
          <div className="border border-rule border-t-[3px] border-t-pine p-8 md:p-[44px] md:pb-10">
            <div className="spec-label text-stone">
              {dict.aboutPage.mission}
            </div>
            <p className="mt-5 text-[18px] leading-[30px] text-ink text-pretty">
              {dict.aboutPage.missionText}
            </p>
          </div>
        </div>
      </div>

      {/* Agencies */}
      <div className="bg-bone border-t border-rule py-16 md:py-[72px]">
        <div className="max-w-[1152px] mx-auto px-4 sm:px-8">
          <div className="section-rule flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-[48px]">
            <div>
              <div className="spec-label mb-3">
                {dict.aboutPage.divisionsLabel}
              </div>
              <h2 className="text-[28px] md:text-[32px] md:leading-[36px] tracking-[-0.025em] font-extrabold text-pine">
                {dict.aboutPage.agenciesTitle}
              </h2>
            </div>
            <p className="text-[13.5px] leading-[23px] text-stone max-w-[46ch] md:pb-1">
              {dict.aboutPage.agenciesSubtitle}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-rule border-s-[3px] border-s-pine py-[30px] px-8">
              <div className="spec-label">
                {dict.aboutPage.divisions.supplyTitle}
              </div>
              <p className="mt-3 text-[14px] leading-[24px] text-ink">
                {dict.aboutPage.divisions.supplyDesc}
              </p>
            </div>
            <div className="bg-white border border-rule border-s-[3px] border-s-brass py-[30px] px-8">
              <div className="spec-label">
                {dict.aboutPage.divisions.serviceTitle}
              </div>
              <p className="mt-3 text-[14px] leading-[24px] text-ink">
                {dict.aboutPage.divisions.serviceDesc}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-rule border border-rule">
            {AGENCIES.map((agency) => (
              <div key={agency.name} className="bg-white h-[84px] flex items-center justify-center p-4">
                <Image
                  src={agency.logo}
                  alt={agency.name}
                  width={104}
                  height={34}
                  className="max-h-[34px] max-w-[104px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
