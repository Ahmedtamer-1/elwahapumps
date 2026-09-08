import React from "react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import { events } from "@/data/events";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ImageIcon, ArrowLeft, ArrowRight } from "lucide-react";
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
    title: dict.eventsPage.title,
    description: dict.eventsPage.subtitle,
    alternates: localizedAlternates(lang, "/events"),
  };
}

export default async function EventsPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Page Header */}
      <PageHeader
        eyebrow={dict.nav.events}
        title={dict.eventsPage.title}
        subtitle={dict.eventsPage.subtitle}
      />

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const data = dict.eventsData[event.id as keyof typeof dict.eventsData];
            if (!data) return null;

            return (
              <Link
                href={`/${lang}/events/${event.id}`}
                key={event.id}
                className="bg-white border border-rule hover:border-emerald-500/50 hover: transition-all duration-300 overflow-hidden group flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-bone overflow-hidden">
                  <Image
                    src={event.cover}
                    alt={data.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 inline-flex items-center gap-1.5 px-3 py-1 bg-pine text-bone text-[10px] font-bold">
                    <Calendar className="w-3 h-3" />
                    <span>{event.year}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <div className="inline-flex items-center gap-1.5 mb-3">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100/50">
                      {dict.eventsPage.eventTag}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-ink mb-2 group-hover:text-emerald-600 transition-colors duration-200">
                    {data.title}
                  </h3>
                  <p className="text-stone text-xs font-semibold mb-4">
                    {data.location}
                  </p>
                  <p className="text-stone text-xs leading-relaxed mb-6 flex-1">
                    {data.desc}
                  </p>

                  <div className="inline-flex items-center justify-between w-full py-2.5 px-4 bg-bone group-hover:bg-emerald-600 text-ink group-hover:text-bone font-bold text-xs border border-rule-light group-hover:border-emerald-600 transition-all duration-200">
                    <span className="inline-flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {event.gallery.length} {dict.eventsPage.photosCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {dict.eventsPage.viewGallery}
                      {lang === "ar" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
