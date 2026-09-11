import React from "react";
import { getDictionary, hasLocale, Locale } from "../../dictionaries";
import { events } from "@/data/events";
import { notFound } from "next/navigation";
import Link from "next/link";
import EventGallery from "@/components/EventGallery";
import { ArrowLeft, ArrowRight, Calendar, MapPin } from "lucide-react";
import { localizedAlternates } from "@/lib/seo";
import { breadcrumbSchema, jsonLdScriptProps } from "@/lib/schema";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !events.some((e) => e.id === slug)) return {};
  const dict = await getDictionary(lang);
  const data = dict.eventsData[slug as keyof typeof dict.eventsData];
  if (!data) return {};
  return {
    title: data.title,
    description: data.desc,
    alternates: localizedAlternates(lang, `/events/${slug}`),
  };
}

export async function generateStaticParams() {
  const locales = ["ar", "en"];
  const params: { lang: string; slug: string }[] = [];

  for (const lang of locales) {
    for (const event of events) {
      params.push({ lang, slug: event.id });
    }
  }

  return params;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;

  const event = events.find((e) => e.id === slug);
  if (!event) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const data = dict.eventsData[slug as keyof typeof dict.eventsData];
  if (!data) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Schema only — the visible trail was taken off every page, but the
          BreadcrumbList still tells a search engine where this page sits, and
          it is what puts the site hierarchy under the result rather than a
          bare URL. */}
      <script
        {...jsonLdScriptProps(
          breadcrumbSchema(lang as Locale, [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.events, path: "/events" },
            { name: data.title, path: `/events/${slug}` },
          ]),
        )}
      />
      {/* Header Banner */}
      <section className="bg-pine text-bone py-16 border-b border-bone/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${lang}/events`}
            className="inline-flex items-center text-xs font-bold text-emerald-400 hover:text-emerald-300 mb-4 transition-colors"
          >
            {lang === "ar" ? <ArrowRight className="w-4 h-4 me-1" /> : <ArrowLeft className="w-4 h-4 me-1" />}
            {dict.eventsPage.backToEvents}
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{event.year}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mt-1">
            {data.title}
          </h1>
          <p className="text-bone/75 text-xs mt-2 font-bold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {data.location}
          </p>
          <p className="text-bone/75 text-sm mt-5 max-w-3xl leading-relaxed">
            {data.desc}
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <EventGallery images={event.gallery} alt={data.title} />
      </section>
    </div>
  );
}
