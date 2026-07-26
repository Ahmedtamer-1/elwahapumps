import React from "react";
import { getDictionary, Locale } from "../dictionaries";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AgentsPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const agents = [
    { id: "astral-pipes", name: "Astral Pipes" },
    { id: "jee-pumps", name: "JEE Pumps" },
    { id: "pmc", name: "PMC" },
    { id: "kurlar", name: "Kurlar" },
    { id: "alka", name: "ALKA Thrust Bearing" },
  ];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Page Header */}
      <section className="bg-black text-white py-16 md:py-20 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-emerald-500 font-extrabold text-xs uppercase tracking-widest block mb-2">
            {dict.nav.agents}
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            {dict.agentsPage.title}
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto leading-relaxed">
            {dict.agentsPage.subtitle}
          </p>
        </div>
      </section>

      {/* Agents Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent) => {
            const data = dict.agentsData[agent.id as keyof typeof dict.agentsData];
            if (!data) return null;

            return (
              <div
                key={agent.id}
                className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100/50">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{dict.agentsPage.agentTitle}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-neutral-800 mb-2 font-sans group-hover:text-emerald-600 transition-colors duration-200">
                    {data.name}
                  </h3>
                  <h4 className="text-emerald-600 font-bold text-xs mb-4">
                    {data.title}
                  </h4>
                  <p className="text-neutral-500 text-xs leading-relaxed mb-8">
                    {data.desc}
                  </p>
                </div>

                <Link
                  href={`/${lang}/agents/${agent.id}`}
                  className="inline-flex items-center justify-center gap-1 w-full py-2.5 bg-neutral-50 hover:bg-emerald-600 text-neutral-700 hover:text-white font-bold text-xs rounded-xl border border-neutral-100 hover:border-emerald-600 transition-all duration-200"
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
