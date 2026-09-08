import React from "react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import ServiceCard from "@/components/ServiceCard";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { localizedAlternates } from "@/lib/seo";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.servicesPage.title,
    description: dict.servicesPage.subtitle,
    // Canonical to the bare path regardless of ?tab= — the home page and
    // this page's own tab bar link three different ?tab= variants.
    alternates: localizedAlternates(lang, "/services"),
  };
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

  const displayServices: { id: string; category: "supply" | "maintenance" }[] = [];

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

  const tabs = [
    {
      key: "all",
      label: lang === "ar" ? "كل الخدمات" : "All Services",
      count: supplyServiceIds.length + maintenanceServiceIds.length,
    },
    {
      key: "supply",
      label: dict.servicesPage.categories.supply,
      count: supplyServiceIds.length,
    },
    {
      key: "maintenance",
      label: dict.servicesPage.categories.maintenance,
      count: maintenanceServiceIds.length,
    },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <PageHeader
        eyebrow={dict.nav.services}
        title={dict.servicesPage.title}
        subtitle={dict.servicesPage.subtitle}
      />

      {/* Tabs.
          A filter bar is navigation, not a set of buttons, so it is set the
          way the site sets navigation: a bone strip under the masthead, the
          active tab carrying a pine underline. The old pills put a filled
          emerald block on white for the selected state, which is the same
          treatment as the primary call to action further down the page — two
          different meanings wearing one badge. Each tab shows its count in
          mono, so the choice is made before the tap rather than after. */}
      <div className="sticky z-40 bg-bone border-b border-rule mb-12"
        // Flush under the header once scrolled. The old hardcoded
        // 72/80px sat above the real header height (S5-T01).
        style={{ top: "var(--header-h-scrolled)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <Link
                key={t.key}
                href={`/${lang}/services?tab=${t.key}`}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap px-5 sm:px-6 py-4 text-[12.5px] font-semibold border-b-[3px] transition-colors ${
                  active
                    ? "text-pine border-pine"
                    : "text-stone border-transparent hover:text-pine"
                }`}
              >
                {t.label}{" "}
                <span className="font-mono text-[11px] font-medium text-stone-light tabular-nums">
                  {t.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Services grid.
          A single hairline lattice rather than eight floating cards: the grid
          gap is 1px of rule showing through from the container behind it, so
          the run reads as one plate divided up — the way a specification
          table does — instead of a scatter of tiles. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="sr-only">
          {tab === "supply"
            ? dict.servicesPage.categories.supply
            : tab === "maintenance"
              ? dict.servicesPage.categories.maintenance
              : lang === "ar"
                ? "كل الخدمات"
                : "All Services"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
          {displayServices.map(({ id, category }, i) => (
            <ServiceCard
              key={id}
              id={id}
              index={i + 1}
              /* The category only earns a marker when both kinds are on screen
                 at once; inside a filtered run every card carries it, which
                 tells the reader nothing. */
              meta={
                tab === "all"
                  ? category === "supply"
                    ? dict.servicesPage.categories.supply
                    : dict.servicesPage.categories.maintenance
                  : undefined
              }
              title={dict.servicesData[id as keyof typeof dict.servicesData].title}
              short={dict.servicesData[id as keyof typeof dict.servicesData].short}
              lang={lang}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
