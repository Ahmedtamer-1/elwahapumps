import React from "react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";
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
    title: dict.agentsPage.title,
    description: dict.agentsPage.subtitle,
    alternates: localizedAlternates(lang, "/agents"),
  };
}

export default async function AgentsPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  // Kept in step with agentSlugs in agents/[slug]/page.tsx by hand. This list
  // was missing novo/tormac/untel, whose pages exist and are linked from the
  // Products page (S0-T02), and still carried JEE Pumps, which is not an
  // agency at all (content brief, 1.3).
  const agents = [
    { id: "astral-pipes", name: "Astral Pipes" },
    { id: "pmc", name: "PMC" },
    { id: "kurlar", name: "Kurlar" },
    { id: "alka", name: "ALKA Thrust Bearing" },
    { id: "novo", name: "NOVO" },
    { id: "tormac", name: "Tormac" },
    { id: "untel", name: "Üntel" },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Page Header */}
      <PageHeader
        eyebrow={dict.nav.agents}
        title={dict.agentsPage.title}
        subtitle={dict.agentsPage.subtitle}
      />

      {/* Agents Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => {
            const data = dict.agentsData[agent.id as keyof typeof dict.agentsData];
            if (!data) return null;

            return (
              <div
                key={agent.id}
                className="bg-white p-6 md:p-8 border border-rule hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100/50">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{dict.agentsPage.agentTitle}</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-extrabold text-ink mb-2 font-sans group-hover:text-emerald-600 transition-colors duration-200">
                    {data.name}
                  </h2>
                  {/* A descriptor under the brand name, not a heading — as an
                      h4 under an h2 it skipped a level on every card. */}
                  <p className="text-emerald-600 font-bold text-xs mb-4">
                    {data.title}
                  </p>
                  <p className="text-stone text-xs leading-relaxed mb-8">
                    {data.desc}
                  </p>
                </div>

                <Link
                  href={`/${lang}/agents/${agent.id}`}
                  className="inline-flex items-center justify-center gap-1 w-full py-2.5 bg-bone hover:bg-emerald-600 text-ink hover:text-bone font-bold text-xs border border-rule-light hover:border-emerald-600 transition-all duration-200"
                >
                  <span>{dict.agentsPage.viewProducts}</span>
                  {lang === "ar" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
