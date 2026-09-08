"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AGENCY_COUNT } from "@/lib/company";
import { fill } from "@/lib/format";

interface HeroProps {
  lang: string;
  dict: {
    hero: { title: string; subtitle: string; ctaCall: string; ctaContact: string };
    common: { requestQuote: string };
  };
}

/**
 * El Waha's own jobs, replacing the Unsplash stock frames of other
 * companies' installations the imagery direction ruled out. A well site
 * under construction, the workshop rewinding motors, and a Kurlar crate
 * going out on the forklift — real work, not stock photography.
 */
const HERO_IMAGES = [
  { src: "/images/services/well-site.jpg", alt: { en: "A well site under construction", ar: "موقع حفر بئر أثناء الإنشاء" } },
  { src: "/images/services/motor-bay.jpg", alt: { en: "Rewinding submersible motors in the workshop", ar: "إعادة لف موتورات غاطسة في الورشة" } },
  { src: "/images/services/pump-crate.jpg", alt: { en: "A Kurlar pump crate loaded for delivery", ar: "صندوق طلمبة كورلار جاهز للتسليم" } },
];

export default function Hero({ lang, dict }: HeroProps) {
  const isAr = lang === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-pine flex items-center">
      {/* Background Slider */}
      {HERO_IMAGES.map((image, idx) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div
            className={`absolute inset-0 transition-transform duration-[10000ms] ease-out origin-center ${
              idx === currentSlide ? "scale-110" : "scale-100"
            }`}
          >
            <Image
              src={image.src}
              alt={isAr ? image.alt.ar : image.alt.en}
              fill
              sizes="100vw"
              // Only the slide painted first has any chance of being the
              // LCP element — the rest sit at opacity-0 behind it and
              // load lazily, exactly the browser's own default for an
              // offscreen image.
              preload={idx === 0}
              loading={idx === 0 ? undefined : "lazy"}
              className="object-cover"
            />
          </div>
          {/* Pine scrim rather than black, so the photography sits inside
              the palette instead of beside it. Carries bone text at AAA. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to ${isAr ? "left" : "right"}, rgba(14,59,46,0.94) 0%, rgba(14,59,46,0.72) 45%, rgba(14,59,46,0.25) 100%)`,
            }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* No `isAr` margin/alignment patches anywhere in this block:
            `dir="rtl"` on <html> already places a narrower block, a fixed
            -width rule and a flex row against the inline-start edge. The
            patches were fighting it — `justify-end` in particular pushed
            the Arabic buttons to the *opposite* side from the headline
            they belong to (S5-T02). */}
        <div className="max-w-2xl transition-all duration-1000 transform translate-y-0 opacity-100">
          {/* Brass rule opens the block — the accent pairing for dark
              grounds. The founding date and city that used to sit above it
              are carried by the About page and the footer instead. */}
          <div className="w-16 h-[3px] bg-brass mb-6" aria-hidden="true" />

          {/* Display level, §05 Table 4. The Arabic uplift in size and
              leading is carried by the [dir=rtl] rules in globals.css. */}
          <h1 className="text-h1 sm:text-display font-extrabold text-bone text-balance">
            {dict.hero.title}
          </h1>

          {/* The specifics the headline can't hold: {AGENCY_COUNT} agencies,
              one point of contact, a service team. §07 — a number or a
              name, not "highest level". */}
          <p className="mt-5 text-body text-bone/80 max-w-[52ch]">
            {fill(dict.hero.subtitle, { count: AGENCY_COUNT })}
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
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

      {/* Navigation Dots (Bottom Right) */}
      {/* `end-*` rather than a left/right ternary: the dots belong in the
          trailing corner in both languages, and the responsive bump at
          `md` used to apply to English only. */}
      <div className="absolute bottom-10 end-10 md:end-16 z-30 flex gap-3">
        {HERO_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            // Brass marks the active slide. Pine would disappear into the
            // photograph; brass is the system's accent for exactly this.
            className={`h-[3px] transition-all duration-300 ${
              idx === currentSlide ? "bg-brass w-10" : "bg-bone/40 hover:bg-bone/80 w-5"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
