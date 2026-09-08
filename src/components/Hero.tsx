"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FOUNDED,
  AGENCY_COUNT,
  GOVERNORATES,
  QUALITY_STANDARD,
} from "@/lib/company";

interface HeroProps {
  lang: string;
  dict: {
    hero: { title: string; subtitle: string; ctaCall: string; ctaContact: string };
    common: { requestQuote: string };
    home: {
      heroStats: {
        since: string;
        agencies: string;
        governorates: string;
        quality: string;
      };
    };
  };
}

/**
 * The hero opens on El Waha's own work — Brand Report §06.
 *
 * These were Unsplash frames of other companies' installations, which the
 * imagery direction rules out explicitly. They are now the company's own
 * photographs, and the three frames are the three things El Waha actually
 * does: it puts pumps down wells, it overhauls them, and it stocks them.
 * That is why the frame labels are the controls — the label names the work,
 * not the slide, so the index carries information instead of decorating.
 *
 * Every source frame is a 4000–6000px camera original, so they go through
 * next/image rather than a CSS background: unoptimised, the first paint
 * would drag 4 MB down the wire for a 1600px slot.
 */
const FRAMES = [
  {
    src: "/images/services/well-site.jpg",
    label: { en: "Well site", ar: "موقع البئر" },
    alt: {
      en: "A drilling rig and lengths of column pipe laid out across an El Waha well site.",
      ar: "حفارة وأطوال مواسير عمود مجهّزة في موقع بئر تابع للواحة.",
    },
  },
  {
    src: "/images/services/pump-strip.jpg",
    label: { en: "Service workshop", ar: "ورشة الصيانة" },
    alt: {
      en: "An El Waha technician stripping a submersible pump down on the workshop bench.",
      ar: "فنّي الواحة يفكّ طلمبة غاطسة على منضدة الورشة.",
    },
  },
  {
    src: "/images/services/motor-bay.jpg",
    label: { en: "Ready to ship", ar: "جاهز للتسليم" },
    alt: {
      en: "Pumps and motors lined up on the El Waha workshop floor, checked before dispatch.",
      ar: "طلمبات ومواتير مصفوفة في ورشة الواحة تحت المراجعة قبل التسليم.",
    },
  },
] as const;

export default function Hero({ lang, dict }: HeroProps) {
  const isAr = lang === "ar";

  /* Every figure comes from company.ts, so the strip cannot drift from the
     About page or the footer the way two hand-typed copies would. */
  const heroStats = [
    { label: dict.home.heroStats.since, value: String(FOUNDED) },
    { label: dict.home.heroStats.agencies, value: String(AGENCY_COUNT) },
    { label: dict.home.heroStats.governorates, value: String(GOVERNORATES) },
    { label: dict.home.heroStats.quality, value: QUALITY_STANDARD },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  /* A carousel that advances on its own is motion the reader did not ask
     for, so it is the first thing to go when they have asked for less. The
     labels stay, and stay operable — the frames just wait to be chosen. */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FRAMES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [reducedMotion]);

  return (
    /* A flex column rather than a stack of absolutely-positioned layers. The
       frame index used to be pinned at bottom-8; with a stat strip beneath it
       that approach needs a hard-coded offset per breakpoint, and the strip
       reflows to two columns on a phone. In flow, the three bands simply sit
       on each other at every width. */
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-pine flex flex-col">
      {FRAMES.map((frame, idx) => (
        <div
          key={frame.src}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
          idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          aria-hidden={idx !== currentSlide}
        >
          <Image
            src={frame.src}
            alt={frame.alt[isAr ? "ar" : "en"]}
            fill
            sizes="100vw"
            /* `priority` is deprecated in Next 16, so the lead frame — the
               LCP element — asks for eager loading at high fetch priority
               directly, and the other two stay lazy. */
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "auto"}
            className={`object-cover transition-transform ease-out origin-center ${
                reducedMotion
                ? ""
                : `duration-[9000ms] ${idx === currentSlide ? "scale-105" : "scale-100"}`
            }`}
          />
          {/* Pine scrim rather than black, so the photography sits inside
              the palette instead of beside it. Carries bone text at AAA. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to ${isAr ? "left" : "right"}, rgba(14,59,46,0.94) 0%, rgba(14,59,46,0.72) 45%, rgba(14,59,46,0.25) 100%)`,
            }}
          />
          {/* The frame labels sit over open desert in the lead shot, where
              bone on bare photograph would not clear AA. A second pine wash
              along the bottom edge holds them. */}
          <div
            className="absolute inset-x-0 bottom-0 h-40"
            style={{
              backgroundImage:
                "linear-gradient(to top, rgba(14,59,46,0.88) 0%, rgba(14,59,46,0) 100%)",
            }}
          />
        </div>
      ))}

      {/* Content — takes the free height and centres inside it. */}
      <div className="relative z-20 flex-1 flex items-center w-full min-h-0">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full`}>
        <div className={`max-w-2xl ${isAr ? "ml-auto" : ""}`}>
          {/* Brass rule opens the block — the accent pairing for dark
              grounds. The founding date and city that used to sit above it
              are carried by the About page and the footer instead. */}
          <div className={`w-16 h-[3px] bg-brass mb-6 ${isAr ? "ml-auto" : ""}`} aria-hidden="true" />

          {/* Display level, §05 Table 4. The Arabic uplift in size and
              leading is carried by the [dir=rtl] rules in globals.css. */}
          <h1 className="text-h1 sm:text-display font-extrabold text-bone text-balance">
            {dict.hero.title}
          </h1>

          {/* The specifics the headline can't hold: the agencies, one point
              of contact, a service team. §07 — a number or a name, not
              "highest level". */}
          <p className="mt-5 text-body text-bone/80 max-w-[52ch]">
            {dict.hero.subtitle}
          </p>

          <div className={`flex flex-wrap gap-3 mt-9 ${isAr ? "justify-end" : ""}`}>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center bg-brass hover:bg-bone text-ink font-semibold text-sm px-8 py-4 transition-colors active-scale-98"
            >
              {dict.common.requestQuote}
            </Link>
            <Link
              href={`/${lang}/products`}
              className="inline-flex items-center justify-center text-bone font-semibold text-sm px-8 py-4 border border-bone/30 hover:border-brass hover:text-brass transition-colors active-scale-98"
            >
              {isAr ? "تصفّح المنتجات" : "Browse the catalogue"}
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Frame index. Each control is the name of the work in the frame, so
          choosing one reads as choosing a subject rather than a slide — and
          a reader who never touches it has still been told what all three
          photographs show. */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-7">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {FRAMES.map((frame, idx) => {
            const active = idx === currentSlide;
            return (
              <button
                key={frame.src}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-current={active ? "true" : undefined}
                className={`spec-label border-t-2 pt-2 transition-colors ${
                    active
                    ? "border-brass text-brass"
                    : "border-bone/25 text-bone/60 hover:border-bone/60 hover:text-bone"
                }`}
              >
                {frame.label[isAr ? "ar" : "en"]}
              </button>
            );
          })}
        </div>
      </div>

      {/* The credentials strip.
          Four figures a buyer weighs before reading anything else: how long we
          have been at it, how many agencies we hold, how much of the country
          we cover, and the standard we work to. They were scattered across the
          About page and the footer, which is too late — this is the band that
          decides whether the rest of the page gets read.

          Every value is a Latin run and is isolated as one. Bidi otherwise
          resolves "ISO 9001" and the bare numerals against the surrounding
          Arabic and reorders them. */}
      <div className="relative z-30 border-t border-bone/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4">
          {heroStats.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-4 sm:py-5 ${
                /* Hairlines between columns, never before the first in a row.
                   The row is 2-up on a phone and 4-up from lg, so which
                   indices need an edge changes with the breakpoint. */
                i % 2 !== 0 ? "border-s border-bone/15 ps-5" : ""
              } ${i !== 0 ? "lg:border-s lg:border-bone/15 lg:ps-8" : "lg:border-s-0 lg:ps-0"}`}
            >
              <div className="spec-label text-bone/55">{stat.label}</div>
              <div dir="ltr" className="mt-1.5 text-xl sm:text-[22px] font-extrabold text-brass">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
