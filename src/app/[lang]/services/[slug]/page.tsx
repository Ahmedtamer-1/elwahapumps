import React from "react";
import { getDictionary, Locale, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Phone, Mail, Wrench, Shield } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

const serviceSlugs = [
  "pump-supply",
  "panel-design",
  "regulator-design",
  "inverter-supply",
  "marine-cable-supply",
  "well-pipe-supply",
  "pump-maintenance",
  "motor-maintenance",
  "panel-maintenance",
  "regulator-maintenance",
];

export async function generateStaticParams() {
  const locales = ["ar", "en"];
  const params: { lang: string; slug: string }[] = [];
  
  for (const lang of locales) {
    for (const slug of serviceSlugs) {
      params.push({ lang, slug });
    }
  }
  
  return params;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  
  if (!serviceSlugs.includes(slug)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const service = dict.servicesData[slug as keyof typeof dict.servicesData];
  
  if (!service) {
    notFound();
  }

  const isSupply = [
    "pump-supply",
    "panel-design",
    "regulator-design",
    "inverter-supply",
    "marine-cable-supply",
    "well-pipe-supply",
  ].includes(slug);

  // Features list depending on language
  const features = lang === "ar"
    ? [
        "فحص فني دقيق واختيار المعدات المناسبة للبئر",
        "الالتزام الكامل بالمعايير الهندسية وجودة التنفيذ",
        "توفير قطع الغيار والملحقات الأصلية 100% بالضمان",
        "دعم فني متواصل وصيانة دورية بعد التركيب",
      ]
    : [
        "Precise technical analysis of well requirements",
        "Full compliance with engineering & build quality standards",
        "100% genuine parts & equipment with certified warranty",
        "Continuous technical support and ongoing maintenance options",
      ];

  // Filter related services
  const relatedSlugs = serviceSlugs
    .filter((s) => s !== slug && (isSupply ? [
      "pump-supply",
      "panel-design",
      "regulator-design",
      "inverter-supply",
      "marine-cable-supply",
      "well-pipe-supply",
    ].includes(s) : [
      "pump-maintenance",
      "motor-maintenance",
      "panel-maintenance",
      "regulator-maintenance",
    ].includes(s)))
    .slice(0, 3);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header Banner */}
      <section className="bg-black text-white py-16 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${lang}/services`}
            className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 mb-4 transition-colors"
          >
            {lang === "ar" ? <ArrowRight className="w-4 h-4 me-1" /> : <ArrowLeft className="w-4 h-4 me-1" />}
            {lang === "ar" ? "العودة للخدمات" : "Back to Services"}
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {isSupply ? dict.servicesPage.categories.supply : dict.servicesPage.categories.maintenance}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-3">
                {service.title}
              </h1>
            </div>
            {/* Action buttons */}
            <div className="flex gap-4 shrink-0">
              <a
                href="tel:+201066685532"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/10 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{lang === "ar" ? "اتصل الآن" : "Call Now"}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Description & Features */}
          <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl border border-neutral-200 shadow-xs">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-4">
              {lang === "ar" ? "تفاصيل الخدمة الهندسية" : "Engineering Service Details"}
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed mb-8 whitespace-pre-line">
              {service.desc}
            </p>

            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              {lang === "ar" ? "مميزات ومخرجات الخدمة" : "Key Benefits & Deliverables"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feat, idx) => (
                <div key={idx} className="flex gap-3 items-start p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-neutral-700 text-xs font-medium leading-normal">{feat}</span>
                </div>
              ))}
            </div>

            {/* B2B Trust Badge */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/40 text-neutral-700 text-xs">
              <Shield className="w-8 h-8 text-emerald-600 shrink-0" />
              <div className="leading-relaxed">
                <span className="font-bold text-neutral-800 block mb-0.5">
                  {lang === "ar" ? "جودة مضمونة بنسبة 100%" : "100% Quality Guaranteed"}
                </span>
                {lang === "ar"
                  ? "جميع المواد والمعدات المستخدمة معتمدة من كبرى العلامات ومطابقة للمواصفات القياسية."
                  : "All equipment and components used are fully certified by major brands and match industry standards."}
              </div>
            </div>
          </div>

          {/* Right Column: CTA Panel & Related Services */}
          <div className="lg:col-span-4 space-y-8">
            {/* Lead capture card */}
            <div className="bg-neutral-950 text-white p-6 md:p-8 rounded-3xl relative overflow-hidden border border-neutral-800 animate-pulse-subtle">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.04),transparent_50%)]" />
              <h3 className="text-xl font-bold mb-4 relative z-10">
                {lang === "ar" ? "هل لديك استفسار؟" : "Have Questions?"}
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed mb-6 relative z-10">
                {lang === "ar"
                  ? "فريقنا الهندسي مستعد لتوفير تفاصيل إضافية وعروض أسعار لخدمة:"
                  : "Our engineering team is ready to provide additional specs and price quotes for:"}
                <strong className="block text-white mt-1 text-sm font-semibold">{service.title}</strong>
              </p>
              <div className="space-y-3 relative z-10">
                <Link
                  href={`/${lang}/contact?subject=${encodeURIComponent(
                    lang === "ar" 
                      ? `طلب تسعير لخدمة ${service.title}` 
                      : `Quote request for ${service.title}`
                  )}`}
                  className="block text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10"
                >
                  {dict.common.requestQuote}
                </Link>
                <a
                  href="mailto:info@elwahapumps.com"
                  className="flex items-center justify-center gap-2 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold border border-neutral-800 rounded-xl text-xs transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@elwahapumps.com</span>
                </a>
              </div>
            </div>

            {/* Related Services */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
              <h3 className="text-base font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-2">
                {lang === "ar" ? "خدمات ذات صلة" : "Related Services"}
              </h3>
              <ul className="space-y-3">
                {relatedSlugs.map((relSlug) => {
                  const relService = dict.servicesData[relSlug as keyof typeof dict.servicesData];
                  return (
                    <li key={relSlug}>
                      <Link
                        href={`/${lang}/services/${relSlug}`}
                        className="group block p-3 bg-neutral-50 hover:bg-emerald-50/50 rounded-xl border border-neutral-100 hover:border-emerald-200 transition-all duration-200"
                      >
                        <span className="block text-neutral-800 text-xs font-bold group-hover:text-emerald-600 transition-colors leading-relaxed">
                          {relService?.title}
                        </span>
                        <span className="inline-flex items-center text-[10px] font-semibold text-neutral-400 group-hover:text-emerald-500 mt-1 transition-colors">
                          {lang === "ar" ? "تفاصيل الخدمة" : "Service details"}
                          {lang === "ar" ? <ArrowLeft className="w-3 h-3 ms-1" /> : <ArrowRight className="w-3 h-3 ms-1" />}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
