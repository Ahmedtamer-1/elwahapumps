"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface EventGalleryProps {
  images: string[];
  alt: string;
}

export default function EventGallery({ images, alt }: EventGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const showPrev = useCallback(
    () => setActiveIndex((idx) => (idx === null ? idx : (idx - 1 + images.length) % images.length)),
    [images.length]
  );
  const showNext = useCallback(
    () => setActiveIndex((idx) => (idx === null ? idx : (idx + 1) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, close, showPrev, showNext]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((src, idx) => (
          <button
            key={src}
            onClick={() => setActiveIndex(idx)}
            className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 group"
          >
            <Image
              src={src}
              alt={`${alt} ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Previous"
            className="absolute left-4 rtl:left-auto rtl:right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-7 h-7 rtl:rotate-180" />
          </button>

          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`${alt} ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next"
            className="absolute right-4 rtl:right-auto rtl:left-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-7 h-7 rtl:rotate-180" />
          </button>

          <div
            dir="ltr"
            className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs font-semibold tracking-wide"
          >
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
