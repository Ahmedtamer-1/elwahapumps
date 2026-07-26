import React from "react";
import { getDictionary, Locale } from "../dictionaries";
import { ShieldCheck, Target, Eye, Users, FileCheck, CheckSquare } from "lucide-react";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const stats = [
    { value: "20+", label: dict.aboutPage.stats.experience, icon: Users },
    { value: "500+", label: dict.aboutPage.stats.projects, icon: FileCheck },
    { value: "5", label: dict.aboutPage.stats.brands, icon: ShieldCheck },
    { value: "98%", label: dict.aboutPage.stats.satisfaction, icon: CheckSquare },
  ];

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="bg-black text-white py-16 md:py-20 relative border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl md:text-5xl font-black text-center mb-4">
            {dict.nav.about}
          </h1>
          <p className="text-neutral-400 text-center text-sm max-w-xl mx-auto leading-relaxed">
            {dict.aboutPage.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-6">
              {dict.aboutPage.title}
            </h2>
            <div className="space-y-4 text-neutral-600 text-sm leading-relaxed">
              <p>{dict.aboutPage.p1}</p>
              <p>{dict.aboutPage.p2}</p>
              <p>{dict.aboutPage.p3}</p>
            </div>
          </div>
          {/* Visual block */}
          <div className="relative h-96 bg-black rounded-3xl overflow-hidden shadow-xl flex items-center justify-center p-8 text-center text-white border border-neutral-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)]" />
            <div className="relative z-10">
              <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest block mb-2">
                شركة الواحة لخدمات الآبار
              </span>
              <p className="text-2xl font-black max-w-sm mx-auto leading-relaxed mb-4">
                {lang === "ar" 
                  ? "أكثر من عقدين من الالتزام بتوفير المياه بأحدث الحلول الهندسية" 
                  : "More than two decades of commitment to providing water with the latest engineering solutions"}
              </p>
              <div className="inline-block px-4 py-2 bg-emerald-500/15 backdrop-blur-md rounded-xl text-xs font-bold border border-emerald-500/20 text-emerald-400">
                {dict.common.isoCertified}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-6 bg-white border border-neutral-200 rounded-2xl text-center shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all"
              >
                <div className="w-10 h-10 mx-auto flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-black text-neutral-900 mb-1">{stat.value}</div>
                <div className="text-xs text-neutral-500 font-semibold">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision card */}
          <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl flex gap-6 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-2xl shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {dict.aboutPage.vision}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {dict.aboutPage.visionText}
              </p>
            </div>
          </div>

          {/* Mission card */}
          <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-3xl flex gap-6 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-2xl shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">
                {dict.aboutPage.mission}
              </h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                {dict.aboutPage.missionText}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
