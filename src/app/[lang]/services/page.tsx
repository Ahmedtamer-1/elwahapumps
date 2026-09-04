import React from "react";
import { getDictionary, Locale } from "../dictionaries";
import Link from "next/link";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ServicesPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const { tab = "all" } = await searchParams;
  const dict = await getDictionary(lang as Locale);

  const supplyServiceIds = [
    "pump-supply",
    "panel-design",
    "marine-cable-supply",
    "well-pipe-supply",
    "spare-parts-supply",
  ];

  const maintenanceServiceIds = [
    "pump-maintenance",
    "motor-maintenance",
    "panel-maintenance",
  ];

  const showSupply = tab === "all" || tab === "supply";
  const showMaintenance = tab === "all" || tab === "maintenance";

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-pine py-16 md:py-[60px]">
        {/* Background image & gradient */}
        <div className="absolute inset-0 bg-[url('/images/about/team.jpg')] bg-center bg-cover"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-pine/95 via-pine/80 to-pine/40"></div>
        
        <div className="relative max-w-[1152px] mx-auto px-4 sm:px-8">
          <div className="spec-label text-brass mb-3.5">
            {dict.nav.services}
          </div>
          <h1 className="text-[40px] md:text-[48px] md:leading-[50px] tracking-[-0.035em] font-extrabold text-bone max-w-[24ch] text-balance">
            {dict.servicesPage.title}
          </h1>
          <div className="brass-rule my-[22px]"></div>
          <p className="text-[15px] leading-[26px] text-bone/80 max-w-[62ch]">
            {dict.servicesPage.subtitle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-bone border-b border-rule">
        <div className="max-w-[1152px] mx-auto px-4 sm:px-8 flex flex-wrap gap-0">
          <Link
            href={`/${lang}/services?tab=all`}
            className={`px-[26px] py-[18px] text-[12.5px] font-semibold border-b-[3px] transition-colors ${
              tab === "all"
                ? "text-pine border-pine"
                : "text-stone border-transparent hover:text-pine"
            }`}
          >
            {lang === "ar" ? "كل الخدمات" : "All Services"}
          </Link>
          <Link
            href={`/${lang}/services?tab=supply`}
            className={`px-[26px] py-[18px] text-[12.5px] font-semibold border-b-[3px] transition-colors ${
              tab === "supply"
                ? "text-pine border-pine"
                : "text-stone border-transparent hover:text-pine"
            }`}
          >
            {dict.servicesPage.categories.supply}{" "}
            <span className="font-mono text-[11px] text-stone-light ms-1">{supplyServiceIds.length}</span>
          </Link>
          <Link
            href={`/${lang}/services?tab=maintenance`}
            className={`px-[26px] py-[18px] text-[12.5px] font-semibold border-b-[3px] transition-colors ${
              tab === "maintenance"
                ? "text-pine border-pine"
                : "text-stone border-transparent hover:text-pine"
            }`}
          >
            {dict.servicesPage.categories.maintenance}{" "}
            <span className="font-mono text-[11px] text-stone-light ms-1">{maintenanceServiceIds.length}</span>
          </Link>
        </div>
      </div>

      {/* Supply & Install Section */}
      {showSupply && (
        <div className="bg-white py-16 md:py-[64px]">
          <div className="max-w-[1152px] mx-auto px-4 sm:px-8">
            <div className="border-t-2 border-pine pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="spec-label mb-3">
                  {dict.servicesPage.categories.supply}
                </div>
                <h2 className="text-[28px] md:text-[30px] md:leading-[34px] tracking-[-0.025em] font-extrabold text-pine">
                  {dict.servicesPage.supplyTitle}
                </h2>
              </div>
              <p className="text-[13.5px] leading-[23px] text-stone max-w-[44ch] md:pb-1">
                {dict.servicesPage.supplyDesc}
              </p>
            </div>

            <div className="mt-9 grid grid-cols-1 md:grid-cols-2 gap-px bg-rule border border-rule">
              {supplyServiceIds.map((id, index) => {
                const service = dict.servicesData[id as keyof typeof dict.servicesData];
                const num = String(index + 1).padStart(2, "0");
                return (
                  <div key={id} className="bg-white p-8 md:p-[34px] md:px-[36px] flex flex-col h-full group">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] font-medium text-brass">{num}</span>
                      <h3 className="text-[19px] leading-[26px] font-extrabold text-ink group-hover:text-pine transition-colors">
                        {service.title}
                      </h3>
                    </div>
                    <p className="mt-[14px] text-[13.5px] leading-[23px] text-stone max-w-[48ch] flex-grow">
                      {service.short}
                    </p>
                    <div className="mt-5 spec-label text-pine group-hover:text-field transition-colors">
                      {lang === "ar" ? "اقرأ المزيد ←" : "Read more →"}
                    </div>
                  </div>
                );
              })}
              
              {/* Not listed card */}
              <div className="bg-bone p-8 md:p-[34px] md:px-[36px] flex flex-col justify-center">
                <div className="spec-label mb-3">
                  {lang === "ar" ? "غير مدرج؟" : "Not listed?"}
                </div>
                <p className="text-[13.5px] leading-[23px] text-ink max-w-[40ch]">
                  {lang === "ar"
                    ? "أخبرنا بإنتاجية البئر وعمقه وسيقوم مهندسونا بتحديد المواصفات المطلوبة."
                    : "Tell us the well's yield and depth and our engineers will scope the supply against it."}
                </p>
                <div className="mt-5 self-start bg-pine hover:bg-field text-bone text-[12.5px] font-semibold py-[13px] px-[22px] transition-colors cursor-pointer">
                  {dict.common.requestQuote}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance & Support Section */}
      {showMaintenance && (
        <div className="bg-pine py-16 md:py-[64px] md:pb-[72px]">
          <div className="max-w-[1152px] mx-auto px-4 sm:px-8">
            <div className="border-t-2 border-brass pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="spec-label text-brass mb-3">
                  {dict.servicesPage.categories.maintenance}
                </div>
                <h2 className="text-[28px] md:text-[30px] md:leading-[34px] tracking-[-0.025em] font-extrabold text-bone">
                  {dict.servicesPage.maintenanceTitle}
                </h2>
              </div>
              <p className="text-[13.5px] leading-[23px] text-bone/70 max-w-[44ch] md:pb-1">
                {dict.servicesPage.maintenanceDesc}
              </p>
            </div>

            <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {maintenanceServiceIds.map((id, index) => {
                const service = dict.servicesData[id as keyof typeof dict.servicesData];
                const num = String(supplyServiceIds.length + index + 1).padStart(2, "0");
                return (
                  <div key={id} className="border border-bone/20 border-t-[3px] border-t-brass p-6 md:p-[32px] md:px-[30px]">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[11px] font-medium text-brass">{num}</span>
                      <h3 className="text-[18px] leading-[25px] font-extrabold text-bone">
                        {service.title}
                      </h3>
                    </div>
                    <p className="mt-[14px] text-[13.5px] leading-[23px] text-bone/70">
                      {service.short}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* How a callout works */}
      {showMaintenance && (
        <div className="bg-bone py-16 md:py-[68px]">
          <div className="max-w-[1152px] mx-auto px-4 sm:px-8">
            <div className="border-t-2 border-pine pt-4">
              <div className="spec-label mb-3">
                {lang === "ar" ? "كيف تعمل طلبات الاستدعاء" : "How a callout works"}
              </div>
              <h2 className="text-[28px] leading-[34px] tracking-[-0.02em] font-extrabold text-pine max-w-[24ch]">
                {lang === "ar"
                  ? "أربع خطوات من المكالمة الهاتفية حتى يعود البئر للعمل."
                  : "Four steps from the phone call to the well running again."}
              </h2>
            </div>
            
            <div className="mt-[34px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
              <div className="md:pe-7 md:border-t-2 border-pine md:pt-[18px]">
                <div className="spec-label text-brass mb-3">
                  {lang === "ar" ? "الخطوة 01" : "STEP 01"}
                </div>
                <h3 className="text-[16px] leading-[22px] font-extrabold text-ink">
                  {lang === "ar" ? "اتصل بنا أو راسلنا" : "Call or message us"}
                </h3>
                <p className="mt-2.5 text-[13px] leading-[22px] text-stone">
                  {lang === "ar"
                    ? "أخبرنا بالبئر، والمعدات وما هو العطل. عبر الهاتف أو واتساب، ليلاً أو نهاراً."
                    : "Tell us the well, the equipment and what it is doing. Phone or WhatsApp, day or night."}
                </p>
              </div>
              <div className="md:px-7 md:border-t-2 border-rule md:border-s border-s-rule md:pt-[18px]">
                <div className="spec-label text-brass mb-3">
                  {lang === "ar" ? "الخطوة 02" : "STEP 02"}
                </div>
                <h3 className="text-[16px] leading-[22px] font-extrabold text-ink">
                  {lang === "ar" ? "التشخيص" : "We diagnose"}
                </h3>
                <p className="mt-2.5 text-[13px] leading-[22px] text-stone">
                  {lang === "ar"
                    ? "يزور المهندس الموقع، أو يتم نقل الوحدة لورشة العمل لاختبارها بمعداتنا."
                    : "An engineer attends the site, or the unit comes into the workshop for testing on our own equipment."}
                </p>
              </div>
              <div className="md:px-7 md:border-t-2 border-rule md:border-s border-s-rule md:pt-[18px]">
                <div className="spec-label text-brass mb-3">
                  {lang === "ar" ? "الخطوة 03" : "STEP 03"}
                </div>
                <h3 className="text-[16px] leading-[22px] font-extrabold text-ink">
                  {lang === "ar" ? "الإصلاح" : "We repair"}
                </h3>
                <p className="mt-2.5 text-[13px] leading-[22px] text-stone">
                  {lang === "ar"
                    ? "إعادة اللف، التشغيل الآلي، واستبدال القطع - بقطع غيار أصلية من وكالاتنا."
                    : "Rewinding, machining, part replacement and recalibration — with genuine spare parts from our agencies."}
                </p>
              </div>
              <div className="md:ps-7 md:border-t-2 border-rule md:border-s border-s-rule md:pt-[18px]">
                <div className="spec-label text-brass mb-3">
                  {lang === "ar" ? "الخطوة 04" : "STEP 04"}
                </div>
                <h3 className="text-[16px] leading-[22px] font-extrabold text-ink">
                  {lang === "ar" ? "العودة للخدمة" : "Back in service"}
                </h3>
                <p className="mt-2.5 text-[13px] leading-[22px] text-stone">
                  {lang === "ar"
                    ? "يتم اختبار الوحدة للتأكد من قدرتها قبل إعادتها للبئر."
                    : "The unit is tested against its duty point before it goes back down the borehole."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-ink py-12 md:py-[52px]">
        <div className="max-w-[1152px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-[48px]">
          <div className="max-w-[60ch]">
            <h2 className="text-[26px] leading-[32px] tracking-[-0.02em] font-extrabold text-bone">
              {lang === "ar" ? "هل تحتاج لإعادة بئر للخدمة؟" : "Need a well back in service?"}
            </h2>
            <p className="mt-3 text-[14px] leading-[24px] text-bone/70">
              {lang === "ar"
                ? "اتصل بنا مباشرة، أو أرسل التفاصيل وسيقوم مهندس بالرد عليك."
                : "Call us directly, or send the details and an engineer will come back to you."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <div className="bg-brass text-ink font-mono font-semibold text-[13.5px] px-6 py-[15px] text-center cursor-pointer">
              +20 106 668 5532
            </div>
            <div className="border border-bone/30 text-bone font-semibold text-[13.5px] px-6 py-[15px] text-center cursor-pointer hover:bg-bone/10 transition-colors">
              {lang === "ar" ? "راسلنا على واتساب" : "WhatsApp Us"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
