import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, Locale } from "../dictionaries";
import ServiceCard from "@/components/ServiceCard";
import { AGENCY_COUNT } from "@/lib/company";
import { fill } from "@/lib/format";
import { Phone, MessageCircle, Mail, PackageCheck } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

/** The maintenance services, in the order a well fails. */
const MAINTENANCE_SERVICES = [
  "pump-maintenance",
  "motor-maintenance",
  "panel-maintenance",
] as const;

const PHONE = "+201066685532";
const WHATSAPP = "201066685532";

export default async function SupportPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const t = dict.supportPage;
  const isAr = lang === "ar";

  const stats = [
    { value: t.stat1Value, label: t.stat1Label },
    { value: t.stat2Value, label: t.stat2Label },
    { value: t.stat3Value, label: t.stat3Label },
    { value: t.stat4Value, label: t.stat4Label },
  ];

  const steps = [
    { title: t.step1Title, desc: t.step1Desc },
    { title: t.step2Title, desc: t.step2Desc },
    { title: t.step3Title, desc: t.step3Desc },
    { title: t.step4Title, desc: t.step4Desc },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Page header — the black band the events and products pages open with,
          carrying the callout fleet behind it. The photograph is the promise
          the copy makes, so it sits under the headline rather than further
          down; the overlay keeps the type at full contrast. */}
      <section className="relative bg-black text-white py-16 md:py-20 border-b border-neutral-900 overflow-hidden">
        <Image
          src="/images/support/fleet.jpg"
          alt={isAr ? "أسطول الصيانة المتنقل لشركة الواحة" : "The El Waha mobile maintenance fleet"}
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-35"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-emerald-500 font-extrabold text-xs uppercase tracking-widest block mb-2">
            {dict.nav.afterSales}
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4">{t.title}</h1>
          <p className="text-neutral-400 text-sm max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t.ctaCall}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-neutral-700 hover:border-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t.ctaWhatsapp}
            </a>
          </div>
        </div>
      </section>

      {/* The numbers a buyer wants before trusting a callout promise. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 text-center"
            >
              <div className="text-2xl md:text-3xl font-black text-emerald-600 mb-1">
                {stat.value}
              </div>
              <div className="text-neutral-500 text-xs leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What we service — the existing maintenance services, not a second copy of them. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">
            {t.servicesTitle}
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">{t.servicesDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MAINTENANCE_SERVICES.map((id) => {
            const service = dict.servicesData[id as keyof typeof dict.servicesData];
            if (!service) return null;
            return (
              <ServiceCard
                key={id}
                id={id}
                title={service.title}
                short={service.short}
                lang={lang}
              />
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href={`/${lang}/services?tab=maintenance`}
            className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700"
          >
            {t.viewAllServices}
            <span>{isAr ? "←" : "→"}</span>
          </Link>
        </div>
      </section>

      {/* How a callout works. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">
            {t.processTitle}
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">{t.processDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="relative bg-neutral-50 rounded-2xl border border-neutral-200 p-6"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-4">
                {idx + 1}
              </div>
              <h3 className="font-extrabold text-neutral-800 mb-2">{step.title}</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Genuine parts — the agency count comes from company.ts so it cannot drift. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start gap-6">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-600/20 text-emerald-400 rounded-xl shrink-0">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black mb-3">{t.warrantyTitle}</h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl">
              {fill(t.warrantyDesc, { count: AGENCY_COUNT })}
            </p>
            <p className="text-emerald-500 text-xs font-bold mt-4">
              {isAr
                ? `${AGENCY_COUNT} وكالة حصرية في مصر`
                : `${AGENCY_COUNT} exclusive Egyptian agencies`}
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="border border-neutral-200 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">
            {t.ctaTitle}
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed max-w-xl mx-auto mb-8">
            {t.ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t.ctaCall}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-neutral-300 hover:border-emerald-500 text-neutral-800 font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t.ctaWhatsapp}
            </a>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 border border-neutral-300 hover:border-emerald-500 text-neutral-800 font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t.ctaContact}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
