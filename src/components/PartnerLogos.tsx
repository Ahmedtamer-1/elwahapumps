import React from "react";
import Link from "next/link";
import Image from "next/image";

interface PartnerLogosProps {
  lang: string;
}

/**
 * The partner wall — Brand Report §1.3.
 *
 * The finding was "six partner logos at six scales… presented as a jumble,
 * it looks like a list of logos found online". The prescribed fix is a
 * fixed optical height and a single grey, so exclusive agency for a set of
 * international manufacturers reads as the moat it is.
 *
 * Each mark is therefore normalised at the source: the brand files are all
 * cut to the same 669x373 transparent canvas with the artwork centred, so
 * one box holds them at one optical height without a grey wash over the top.
 * Colour is on from the start — a hover-only reveal shows nothing at all on
 * a touch screen, which is most of this traffic.
 *
 * Logos are served locally — do not hotlink the old WordPress site.
 */
const partners = [
  {
    id: "kurlar",
    name: "Kurlar",
    logo: "/images/brand/kurlar-mark.webp",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Heavy industrial & deep wells", ar: "صناعي ثقيل وآبار عميقة" },
  },
  {
    id: "astral-pipes",
    name: "Astral Pipes",
    logo: "/images/brand/astral-mark.webp",
    type: { en: "Specialist supplier", ar: "مورّد متخصص" },
    // Western digits on the Arabic side too (§5.2 rule 5): specs and
    // warranties get copied across both languages.
    bestFor: { en: "Column pipes · 25-yr warranty", ar: "مواسير الأعماق · ضمان 25 سنة" },
  },
  {
    id: "pmc",
    name: "PMC",
    logo: "/images/brand/pmc-mark.webp",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Pump systems", ar: "منظومات طلمبات" },
  },
  {
    id: "alka",
    name: "ALKA Thrust Bearing",
    logo: "/images/brand/alka-mark.webp",
    type: { en: "Component supplier", ar: "مورّد مكوّنات" },
    bestFor: { en: "Thrust bearings & wear parts", ar: "كراسي تحميل وقطع غيار" },
  },
  {
    id: "novo",
    name: "Novo Solar Inverter",
    logo: "/images/brand/novo-mark.webp",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Solar & VFD inverters", ar: "عاكسات شمسية ومغيرات تردد" },
  },
  {
    id: "tormac",
    name: "Tormac Pumps",
    logo: "/images/brand/tormac-mark.webp",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Surface & submersible pumps", ar: "طلمبات سطحية وغاطسة" },
  },
  {
    id: "untel",
    name: "Üntel",
    logo: "/images/brand/untel-mark.webp",
    type: { en: "Manufacturer", ar: "مصنّع" },
    bestFor: { en: "Submersible motor cables", ar: "كابلات المواتير الغاطسة" },
  },
];

export default function PartnerLogos({ lang }: PartnerLogosProps) {
  const isAr = lang === "ar";
  const t = (obj: { en: string; ar: string }) => (isAr ? obj.ar : obj.en);

  return (
    <div className="w-full py-14 bg-white border-y border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t-2 border-pine pt-3 mb-8">
          <span className="spec-label block mb-2">{isAr ? "الوكالات" : "Agencies"}</span>
          {/* §07: name them. The list is the claim. */}
          <h2 className="text-h3 sm:text-h2 font-extrabold text-pine">
            {isAr ? "نمثّل مصنّعين مختارين — لا كلّ من يبيع" : "We represent select manufacturers"}
          </h2>
        </div>

        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max gap-3 animate-marquee-left hover:[animation-play-state:paused]">
            {[...partners, ...partners].map((partner, idx) => (
              <Link
                key={`${partner.id}-${idx}`}
                href={`/${lang}/agents/${partner.id}`}
                className="group flex flex-col w-60 shrink-0 bg-white border border-rule hover:border-pine transition-colors duration-300"
              >
                {/* Fixed optical height: every mark gets the same box and the
                    same padding, so none of them shouts louder than the rest. */}
                <div className="relative w-full h-16 mx-auto my-5">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    sizes="240px"
                    quality={95}
                    className="object-contain px-6"
                  />
                </div>
                <div className="px-5 pb-5 pt-1 flex flex-col gap-2 border-t border-rule-light">
                  <span className="self-start font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-pine pt-3">
                    {t(partner.type)}
                  </span>
                  <p className="text-[12px] text-stone leading-5">
                    <span className="spec-label block text-[9.5px] mb-1">
                      {isAr ? "أفضل استخدام" : "Best for"}
                    </span>
                    {t(partner.bestFor)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-5 font-mono text-[11px] leading-4 text-stone-light">
          {isAr
            ? "الشعارات معروضة بارتفاع بصري واحد وبألوانها الأصلية."
            : "Marks are shown at one optical height, in their own brand colour."}
        </p>
      </div>
    </div>
  );
}
