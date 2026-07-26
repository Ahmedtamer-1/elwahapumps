import React from "react";
import Link from "next/link";
import Image from "next/image";

interface PartnerLogosProps {
  lang: string;
}

/**
 * Partner cards: each mark renders in its own real brand color (accent bar),
 * while El Waha's own chrome stays green & gray. Logos are served locally —
 * do not hotlink the old WordPress site.
 */
const partners = [
  {
    id: "kurlar",
    name: "Kurlar",
    logo: "/images/brand/kurlar-logo.png",
    accent: "#114286", // sampled from the Kurlar wordmark
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Heavy industrial & deep wells", ar: "صناعي ثقيل وآبار عميقة" },
  },
  {
    id: "astral-pipes",
    name: "Astral Pipes",
    logo: "/images/brand/astral-logo.png",
    accent: "#1E6FA8",
    type: { en: "Specialist supplier", ar: "مورّد متخصص" },
    bestFor: { en: "Column pipes · 25-yr warranty", ar: "مواسير الأعماق · ضمان ٢٥ سنة" },
  },
  {
    id: "pmc",
    name: "PMC",
    logo: "/images/brand/pmc-logo.png",
    accent: "#4A5568",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Pump systems", ar: "منظومات طلمبات" },
  },
  {
    id: "alka",
    name: "ALKA Thrust Bearing",
    logo: "/images/brand/alka-logo.png",
    accent: "#C1272D",
    type: { en: "Component supplier", ar: "مورّد مكوّنات" },
    bestFor: { en: "Thrust bearings & wear parts", ar: "كراسي تحميل وقطع غيار" },
  },
  {
    id: "novo",
    name: "Novo Solar Inverter",
    logo: "/images/brand/NOVO.png",
    accent: "#2A5CAA",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Solar & VFD inverters", ar: "عاكسات شمسية ومغيرات تردد" },
  },
  {
    id: "tormac",
    name: "Tormac Pumps",
    logo: "/images/brand/Tormac.png",
    accent: "#129490",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Surface & submersible pumps", ar: "طلمبات سطحية وغاطسة" },
  },
  {
    id: "untel",
    name: "Üntel",
    logo: "/images/brand/Untel.png",
    accent: "#C8202E",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Submersible motor cables", ar: "كابلات المواتير الغاطسة" },
  },
];

export default function PartnerLogos({ lang }: PartnerLogosProps) {
  const isAr = lang === "ar";
  const t = (obj: { en: string; ar: string }) => (isAr ? obj.ar : obj.en);

  return (
    <div className="w-full py-14 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="block text-center md:text-start text-emerald-600 font-extrabold text-xs uppercase tracking-widest mb-2">
          {isAr ? "الوكلاء" : "Partners"}
        </span>
        <h2 className="text-center md:text-start text-2xl md:text-3xl font-black text-neutral-900 mb-8">
          {isAr ? "نمثّل مصنّعين مختارين — لا كلّ من يبيع" : "We represent select manufacturers"}
        </h2>

        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max gap-4 animate-marquee-left hover:[animation-play-state:paused]">
            {[...partners, ...partners].map((partner, idx) => (
              <Link
                key={`${partner.id}-${idx}`}
                href={`/${lang}/agents/${partner.id}`}
                className="group flex flex-col w-64 shrink-0 bg-white rounded-xl border border-neutral-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                style={{ borderInlineStartWidth: 3, borderInlineStartColor: partner.accent }}
              >
                <div className="relative w-full h-20 p-4 mt-2">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    sizes="256px"
                    className="object-contain p-3 opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="px-4 pb-4 pt-1 flex flex-col gap-1.5">
                  <span
                    className="self-start font-mono text-[9.5px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm"
                    style={{ color: partner.accent, backgroundColor: `${partner.accent}14` }}
                  >
                    {t(partner.type)}
                  </span>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                      {isAr ? "أفضل استخدام" : "Best for"}
                    </span>
                    {t(partner.bestFor)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-5 font-mono text-[11px] text-neutral-400">
          {isAr
            ? "شعارات الشركاء تظهر بألوانها الحقيقية؛ هويتنا تبقى بالأخضر والرمادي."
            : "Partner marks appear in their own brand colors; our identity stays green & gray."}
        </p>
      </div>
    </div>
  );
}
