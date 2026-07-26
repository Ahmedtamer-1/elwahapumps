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
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-neutral-950 flex items-center">
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
          {/* Dark Overlay for text readability */}
          <div className={`absolute inset-0 bg-gradient-to-r ${isAr ? "from-black/10 via-black/60 to-black/90" : "from-black/90 via-black/60 to-black/10"}`} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`max-w-2xl transition-all duration-1000 transform ${isAr ? "ml-auto" : ""} translate-y-0 opacity-100`}>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 drop-shadow-sm">
            {isAr ? "تأسست ٢٠٠٤ · ٦ أكتوبر، الجيزة" : "Est. 2004 · 6th of October, Giza"}
          </span>
          <div className={`w-14 h-[3px] bg-emerald-500 rounded-full my-6 shadow-sm ${isAr ? 'ml-auto' : ''}`} aria-hidden="true" />
          
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-black leading-[1.1] text-white text-balance drop-shadow-lg">
            {dict.hero.title}
          </h1>
          
          <div className={`flex flex-wrap gap-4 mt-10 ${isAr ? 'justify-end' : ''}`}>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 active-scale-98"
            >
              {dict.common.requestQuote}
            </Link>
            <Link
              href={`/${lang}/products`}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold text-sm px-8 py-4 rounded-xl border border-white/20 transition-all active-scale-98"
            >
              {isAr ? "تصفّح المنتجات" : "Browse the catalog"}
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
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentSlide 
                ? "bg-emerald-500 w-8 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                : "bg-white/40 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
