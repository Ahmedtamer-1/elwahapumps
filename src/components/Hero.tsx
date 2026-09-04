"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface HeroProps {
  lang: string;
  dict: {
    hero: { title: string; subtitle: string; ctaCall: string; ctaContact: string };
    common: { requestQuote: string };
  };
}

/**
 * TODO(brand §06): these are Unsplash stock frames of other companies'
 * installations, which the imagery direction rules out explicitly. They
 * are placeholders until the shoot happens — report decision 05, two
 * days, three sites and the workshop. Swap for real El Waha jobs;
 * nothing else in this component needs to change.
 */
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=2070&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop"
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
    <section className="relative w-full md:h-[85vh] md:min-h-[600px] overflow-hidden bg-pine flex items-center">
      {/* Background Slider */}
      {HERO_IMAGES.map((src, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out origin-center ${
              idx === currentSlide ? "scale-110" : "scale-100"
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
          {/* Pine scrim rather than black, so the photography sits inside
              the palette instead of beside it. Carries bone text at AAA. */}
          <div 
            className="absolute inset-0 max-md:bg-gradient-to-b max-md:from-pine/92 max-md:to-pine/72 md:!bg-none"
            style={{
              backgroundImage: `linear-gradient(to ${isAr ? "left" : "right"}, rgba(14,59,46,0.94) 0%, rgba(14,59,46,0.72) 45%, rgba(14,59,46,0.25) 100%)`,
            }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-11 md:py-0">
        <div className={`max-w-2xl transition-all duration-1000 transform ${isAr ? "ml-auto" : ""} translate-y-0 opacity-100`}>
          {/* Brass rule opens the block — the accent pairing for dark
              grounds. The founding date and city that used to sit above it
              are carried by the About page and the footer instead. */}
          <div className={`w-[52px] md:w-16 h-[3px] bg-brass mb-5 md:mb-6 ${isAr ? "ml-auto" : ""}`} aria-hidden="true" />

          {/* Display level, §05 Table 4. The Arabic uplift in size and
              leading is carried by the [dir=rtl] rules in globals.css. */}
          <h1 className="text-[34px] leading-[36px] tracking-[-0.03em] md:text-h1 sm:text-display font-extrabold text-bone text-balance">
            {dict.hero.title}
          </h1>

          {/* The specifics the headline can't hold: six agencies, one point
              of contact, a service team. §07 — a number or a name, not
              "highest level". */}
          <p className="mt-4 md:mt-5 text-[14px] leading-[23px] md:text-body text-bone/80 max-w-[52ch]">
            {dict.hero.subtitle}
          </p>

          <div className={`flex flex-col md:flex-row gap-2.5 md:gap-3 mt-6 md:mt-9 ${isAr ? "md:justify-end" : ""}`}>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center bg-brass hover:bg-bone text-ink font-semibold text-[14px] w-full md:w-auto px-4 md:px-8 py-4 transition-colors active-scale-98 text-center"
            >
              {dict.common.requestQuote}
            </Link>
            <Link
              href={`/${lang}/products`}
              className="inline-flex items-center justify-center text-bone font-semibold text-[14px] w-full md:w-auto px-4 md:px-8 py-4 border border-bone/30 hover:border-brass hover:text-brass transition-colors active-scale-98 text-center"
            >
              {isAr ? "تصفّح المنتجات" : "Browse the catalogue"}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Dots (Bottom Right) */}
      <div className={`absolute bottom-10 ${isAr ? "left-10" : "right-10 md:right-16"} z-30 flex gap-3`}>
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
