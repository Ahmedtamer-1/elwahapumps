import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import ServiceCard from "@/components/ServiceCard";
import { AGENCY_COUNT, PHONE_SALES, WHATSAPP_SALES } from "@/lib/company";
import { Phone, MessageCircle, Mail, PackageCheck } from "lucide-react";
import { fill } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import { localizedAlternates } from "@/lib/seo";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.supportPage.title,
    description: dict.supportPage.subtitle,
    alternates: localizedAlternates(lang, "/support"),
  };
}

/** The maintenance services, in the order a well fails. */
const MAINTENANCE_SERVICES = [
  "pump-maintenance",
  "motor-maintenance",
  "panel-maintenance",
] as const;

const PHONE = PHONE_SALES;
const WHATSAPP = WHATSAPP_SALES;

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
      {/* The photograph is the promise the copy makes, so it sits under the
          headline rather than further down. */}
      <PageHeader
        eyebrow={dict.nav.afterSales}
        title={t.title}
        subtitle={t.subtitle}
        image={{
          src: "/images/support/fleet.jpg",
          alt: isAr
            ? "أسطول الصيانة المتنقل لشركة الواحة"
            : "The El Waha mobile maintenance fleet",
        }}
      >
        <a
          href={`tel:${PHONE}`}
          className="inline-flex items-center gap-2 bg-brass hover:bg-bone text-ink font-semibold text-sm px-8 py-4 transition-colors active-scale-98"
        >
          <Phone className="w-4 h-4" aria-hidden="true" />
          {t.ctaCall}
        </a>
        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-bone/30 hover:border-brass hover:text-brass text-bone font-semibold text-sm px-8 py-4 transition-colors active-scale-98"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          {t.ctaWhatsapp}
        </a>
      </PageHeader>

      {/* The numbers a buyer wants before trusting a callout promise. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-rule p-6 text-center"
            >
              {/* A figure on a plate is a specification, and §05 reserves
                  mono for exactly that. .plate-value is the primitive for it,
                  already carrying tabular figures so a row of these aligns on
                  the digit rather than drifting. */}
              <div className="plate-value text-pine mb-1">{stat.value}</div>
              <div className="text-stone text-xs leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What we service — the existing maintenance services, not a second copy of them. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-ink mb-3">
            {t.servicesTitle}
          </h2>
          <p className="text-stone text-sm leading-relaxed">{t.servicesDesc}</p>
        </div>

        {/* Same hairline lattice as the services index, so a reader arriving
            here from there is looking at one component, not two. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
          {MAINTENANCE_SERVICES.map((id, i) => {
            const service = dict.servicesData[id as keyof typeof dict.servicesData];
            if (!service) return null;
            return (
              <ServiceCard
                key={id}
                id={id}
                index={i + 1}
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
            className="inline-flex items-center gap-1 text-sm font-bold text-pine hover:text-field"
          >
            {t.viewAllServices}
            <span>{isAr ? "←" : "→"}</span>
          </Link>
        </div>
      </section>

      {/* How a callout works. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-ink mb-3">
            {t.processTitle}
          </h2>
          <p className="text-stone text-sm leading-relaxed">{t.processDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            /* A numbered sequence set on rules rather than in boxes. The
               filled pine square held one digit and a lot of weight for it;
               opening the step on a rule — heavy on the first, hairline after
               — reads as a progression, which a row of equal tiles never
               did. */
            <div
              key={step.title}
              className={`relative pt-4 ${
                idx === 0 ? "border-t-2 border-pine" : "border-t-2 border-rule"
              }`}
            >
              <div className="spec-label text-pine">
                {isAr ? "خطوة" : "Step"}{" "}
                <span className="tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-extrabold text-ink mt-3 mb-2">{step.title}</h3>
              <p className="text-stone text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Genuine parts — the agency count comes from company.ts so it cannot drift. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-pine text-bone p-8 md:p-12 flex flex-col md:flex-row items-start gap-6">
          {/* Was emerald-600/20, which the ramp resolves to pine at 20% — a
              chip the same colour as the panel behind it. Field is the tonal
              green §04 keeps for exactly this: shapes on pine, never on
              white. */}
          <div className="inline-flex items-center justify-center p-3 bg-field text-brass shrink-0">
            <PackageCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-h3 md:text-h2 font-extrabold text-bone mb-3">{t.warrantyTitle}</h2>
            <p className="text-bone/75 text-small leading-relaxed max-w-3xl">
              {fill(t.warrantyDesc, { count: AGENCY_COUNT })}
            </p>
            {/* Brass, not emerald-500: the ramp in globals.css maps
                emerald-500 to Pine, so this line was pine-on-pine — a 1.0
                contrast ratio, invisible on the ground it sits on. */}
            <p className="spec-label text-brass mt-4">
              {isAr
                ? `${AGENCY_COUNT} وكالة حصرية في مصر`
                : `${AGENCY_COUNT} exclusive Egyptian agencies`}
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="border border-rule p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-ink mb-3">
            {t.ctaTitle}
          </h2>
          <p className="text-stone text-sm leading-relaxed max-w-xl mx-auto mb-8">
            {t.ctaDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${PHONE}`}
              className="inline-flex items-center gap-2 bg-pine hover:bg-field text-bone font-bold text-sm px-6 py-3 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {t.ctaCall}
            </a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-rule hover:border-pine text-ink font-bold text-sm px-6 py-3 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {t.ctaWhatsapp}
            </a>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center gap-2 border border-rule hover:border-pine text-ink font-bold text-sm px-6 py-3 transition-colors"
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
