import React from "react";
import { getDictionary, Locale } from "../../dictionaries";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, Mail, Phone, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang as Locale);
  const agent = dict.agentsData[slug as keyof typeof dict.agentsData];

  if (!agent) {
    return { title: "Agent Not Found" };
  }

  return {
    title: agent.name,
    description: agent.desc,
  };
}

const agentSlugs = ["astral-pipes", "jee-pumps", "pmc", "kurlar", "alka"];

export async function generateStaticParams() {
  const locales = ["ar", "en"];
  const params: { lang: string; slug: string }[] = [];
  
  for (const lang of locales) {
    for (const slug of agentSlugs) {
      params.push({ lang, slug });
    }
  }
  
  return params;
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;

  if (!agentSlugs.includes(slug)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const agent = dict.agentsData[slug as keyof typeof dict.agentsData];

  if (!agent) {
    notFound();
  }

  // Define product lines based on brand slug
  const productLinesMap = {
    "astral-pipes": lang === "ar"
      ? [
          "مواسير uPVC مسننة لتنزيل طلمبات الآبار العميقة",
          "مواسير تغليف وتغشية الآبار (Casing Pipes) لحماية البئر من الانهيار",
          "لاصق ووصلات الأنابيب البلاستيكية المقاومة للضغط العالي",
        ]
      : [
          "Threaded uPVC column pipes for deep water well pumps",
          "Well casing pipes to safeguard wells against collapse",
          "High-pressure plastic solvents, fittings, and connectors",
        ],
    "jee-pumps": lang === "ar"
      ? [
          "طلمبات آبار غاطسة متعددة المراحل بقدرات تصل إلى 150 حصان",
          "طلمبات طرد مركزي أفقية لنقل المياه والري بمعدلات تدفق ضخمة",
          "طلمبات طرد مركزي رأسية لمحطات التحلية والتغذية الصناعية",
        ]
      : [
          "Multistage submersible well pumps with capacities up to 150 HP",
          "Horizontal centrifugal pumps for massive water transfer and irrigation",
          "Vertical centrifugal pumps for desalination and industrial booster systems",
        ],
    "pmc": lang === "ar"
      ? [
          "قواطع كهربائية وكونتاكتورات لحماية المحركات الكبيرة",
          "محولات تيار وأجهزة قياس رقمية للوحات التشغيل الكهربائية",
          "مثبتات جهد صناعية لتعديل وتثبيت الجهد الداخل للمحركات",
        ]
      : [
          "Molded-case circuit breakers and contactors for heavy motors",
          "Current transformers and digital meters for electrical panels",
          "Industrial automatic voltage stabilizer relays and components",
        ],
    "kurlar": lang === "ar"
      ? [
          "محركات غاطسة استانلس ستيل (Stainless Steel Submersible Motors)",
          "محركات غاطسة حديد زهر مبردة بالماء للعمل الشاق",
          "أسلاك إعادة لف المحركات فائقة العزل ضد المياه والحرارة",
        ]
      : [
          "Stainless steel submersible water-filled motors",
          "Heavy-duty water-cooled cast iron submersible motors",
          "Ultra-insulated submersible motor rewinding wires",
        ],
    "alka": lang === "ar"
      ? [
          "كراسي تحميل كربونية وبرونزية للمحركات الغاطسة 6 بوصة و8 بوصة و10 بوصة",
          "أطقم إصلاح وإعادة تأهيل كراسي تحميل محركات الآبار",
          "حلقات اتزان مانعة للاحتكاك لامتصاص القوى الرأسية في المضخات العميقة",
        ]
      : [
          "Carbon-graphite and bronze thrust bearings for 6\", 8\", and 10\" submersible motors",
          "Complete thrust bearing rebuild and repair kits",
          "Thrust pads and friction-reducing segments for absorbing vertical loads",
        ],
  };

  const productLines = productLinesMap[slug as keyof typeof productLinesMap] || [];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header Banner */}
      <section className="bg-black text-white py-16 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${lang}/agents`}
            className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 mb-4 transition-colors"
          >
            {lang === "ar" ? <ArrowRight className="w-4 h-4 me-1" /> : <ArrowLeft className="w-4 h-4 me-1" />}
            {lang === "ar" ? "العودة للوكلاء" : "Back to Agents"}
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{dict.agentsPage.agentTitle}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-3">
                {agent.name}
              </h1>
              <p className="text-neutral-400 text-xs mt-1.5 font-bold">
                {agent.title}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Brand Description & Products supplied */}
          <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl border border-neutral-200 shadow-xs">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-4">
              {lang === "ar" ? "حول العلامة التجارية والشراكة" : "About the Brand & Partnership"}
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed mb-10">
              {agent.desc}
            </p>

            <h3 className="text-lg font-bold text-neutral-900 mb-6 border-t border-neutral-100 pt-8">
              {lang === "ar" ? "خطوط المنتجات التي نوفرها" : "Product Lines Supplied"}
            </h3>
            <ul className="space-y-4 mb-6">
              {productLines.map((line, idx) => (
                <li key={idx} className="flex gap-3 items-start p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                  <span className="text-neutral-700 text-xs font-semibold leading-relaxed">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: CTA Panel */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-neutral-950 text-white p-6 md:p-8 rounded-3xl relative overflow-hidden border border-neutral-800 animate-pulse-subtle">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.04),transparent_50%)]" />
              <h3 className="text-xl font-bold mb-4 relative z-10">
                {lang === "ar" ? "طلب تسعير منتجات" : "Product Quote Request"}
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed mb-6 relative z-10">
                {lang === "ar"
                  ? "نوفر منتجات العلامة التجارية الأصلية بالكامل مع الضمان المعتمد. أرسل استفسارك وسيقوم فريق المبيعات بالرد عليك."
                  : "We supply original branded items with full certified warranty. Send your inquiry and our sales team will respond promptly."}
              </p>
              <div className="space-y-3 relative z-10">
                <Link
                  href={`/${lang}/contact?subject=${encodeURIComponent(
                    lang === "ar" 
                      ? `طلب تسعير لمنتجات علامة ${agent.name}` 
                      : `Quote request for ${agent.name} products`
                  )}`}
                  className="block text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10"
                >
                  {dict.common.requestQuote}
                </Link>
                <a
                  href="tel:+201066685532"
                  className="flex items-center justify-center gap-2 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold border border-neutral-800 rounded-xl text-xs transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>+20 106 668 5532</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
