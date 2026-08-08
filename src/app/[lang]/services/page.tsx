import React from "react";
import { getDictionary, Locale } from "../dictionaries";
import ServiceCard from "@/components/ServiceCard";
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
    "regulator-design",
    "inverter-supply",
    "marine-cable-supply",
    "well-pipe-supply",
  ];

  const maintenanceServiceIds = [
    "pump-maintenance",
    "motor-maintenance",
    "panel-maintenance",
    "regulator-maintenance",
  ];

  let displayServices: { id: string; category: "supply" | "maintenance" }[] = [];

  if (tab === "all" || tab === "supply") {
    displayServices.push(
      ...supplyServiceIds.map((id) => ({ id, category: "supply" as const }))
    );
  }

  if (tab === "all" || tab === "maintenance") {
    displayServices.push(
      ...maintenanceServiceIds.map((id) => ({ id, category: "maintenance" as const }))
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <section className="bg-black text-white py-16 md:py-20 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="text-emerald-500 font-extrabold text-xs uppercase tracking-widest block mb-2 mt-4">
            {dict.nav.services}
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            {dict.servicesPage.title}
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto leading-relaxed">
            {dict.servicesPage.subtitle}
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[72px] md:top-[80px] z-40 bg-white/90 backdrop-blur-md pt-6 pb-4 border-b border-neutral-200 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center gap-4">
          <Link
            href={`/${lang}/services?tab=all`}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              tab === "all"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200"
            }`}
          >
            {lang === "ar" ? "كل الخدمات" : "All Services"}
          </Link>
          <Link
            href={`/${lang}/services?tab=supply`}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              tab === "supply"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200"
            }`}
          >
            {dict.servicesPage.categories.supply}
          </Link>
          <Link
            href={`/${lang}/services?tab=maintenance`}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              tab === "maintenance"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200"
            }`}
          >
            {dict.servicesPage.categories.maintenance}
          </Link>
        </div>
      </div>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map(({ id, category }) => (
            <div key={id} className="relative">
              <span className={`absolute top-4 end-4 z-10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                category === "supply" 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}>
                {category === "supply" ? dict.servicesPage.categories.supply : dict.servicesPage.categories.maintenance}
              </span>
              <ServiceCard
                id={id}
                title={dict.servicesData[id as keyof typeof dict.servicesData].title}
                short={dict.servicesData[id as keyof typeof dict.servicesData].short}
                lang={lang}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
