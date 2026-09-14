"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Phone, MessageCircle, ExternalLink, Factory } from "lucide-react";
import {
  ADDRESS,
  HQ_MAP_URL,
  HQ_SELECTION_ID,
  NAME_AR,
  NAME_EN,
  PHONE_SALES,
  WHATSAPP_SALES,
} from "@/lib/company";
import {
  REGION_LABELS,
  groupByRegion,
  internationalPhone,
  whatsAppLink,
  type Distributor,
} from "@/data/distributors";

/**
 * Map and list, side by side, sharing one selection.
 *
 * MapLibre touches `window` at import time, so the map is loaded client-side
 * only — server-rendering it throws. The list is deliberately NOT inside that
 * dynamic boundary: it is the part that carries the phone numbers, and it has
 * to be there whether or not the basemap loads.
 */
const DistributorMap = dynamic(() => import("@/components/DistributorMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse border border-rule bg-bone sm:h-[520px]" />
  ),
});

function DistributorCard({
  distributor,
  lang,
  isSelected,
  onSelect,
}: {
  distributor: Distributor;
  lang: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isAr = lang === "ar";

  return (
    <div
      className={`border p-4 transition-colors duration-200 ${
      isSelected ? "border-pine bg-bone" : "border-rule bg-white hover:border-pine"
      }`}
    >
      {/* Selecting is what moves the map; the phone links below stay separate
          so tapping "call" never hijacks the viewport. */}
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-3 text-start"
        aria-pressed={isSelected}
      >
        <MapPin
          className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? "text-brass" : "text-pine"}`}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ink">
            {isAr ? distributor.name.ar : distributor.name.en}
          </span>
          <span className="mt-0.5 block text-sm text-stone">
            {isAr ? distributor.city.ar : distributor.city.en}
          </span>
        </span>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-rule-light pt-3">
        <a
          href={`tel:${internationalPhone(distributor.phone)}`}
          className="inline-flex items-center gap-1.5 bg-pine px-3 py-2 font-mono text-xs font-medium text-bone transition-colors hover:bg-field max-md:min-h-11"
          dir="ltr"
        >
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          {distributor.phone}
        </a>

        <a
          href={whatsAppLink(distributor.phone, lang)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border border-rule px-3 py-2 text-xs font-semibold text-stone transition-colors hover:border-pine hover:text-pine max-md:min-h-11"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {isAr ? "واتساب" : "WhatsApp"}
        </a>

        {/* The spreadsheet's own Google Maps link — the authoritative
            location, since our pin is only town-level. */}
        <a
          href={distributor.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border border-rule px-3 py-2 text-xs font-semibold text-stone transition-colors hover:border-pine hover:text-pine max-md:min-h-11"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          {isAr ? "الخريطة" : "Maps"}
        </a>
      </div>
    </div>
  );
}

/** Head office, set apart from the distributors in brass and pine. */
function HeadOfficeCard({
  lang,
  isSelected,
  onSelect,
}: {
  lang: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isAr = lang === "ar";

  return (
    <section className="mb-8">
      <div
        className={`border-2 border-t-4 p-4 transition-colors duration-200 ${
          isSelected ? "border-brass bg-bone" : "border-pine border-t-brass bg-white hover:border-brass"
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full items-start gap-3 text-start"
          aria-pressed={isSelected}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-pine text-brass">
            <Factory className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="spec-label block text-brass">
              {isAr ? "المقر الرئيسي والمصنع" : "Head office & works"}
            </span>
            <span className="mt-1 block text-[15px] font-bold text-ink">
              {isAr ? NAME_AR : NAME_EN}
            </span>
            <span className="mt-0.5 block text-sm text-stone">
              {isAr
                ? `${ADDRESS.localityAr}، ${ADDRESS.regionAr}`
                : `${ADDRESS.localityEn}, ${ADDRESS.regionEn}`}
            </span>
          </span>
        </button>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-rule-light pt-3">
          <a
            href={`tel:${PHONE_SALES}`}
            className="inline-flex items-center gap-1.5 bg-pine px-3 py-2 font-mono text-xs font-medium text-bone transition-colors hover:bg-field max-md:min-h-11"
            dir="ltr"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            +20 106 668 5532
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_SALES}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-rule px-3 py-2 text-xs font-semibold text-stone transition-colors hover:border-pine hover:text-pine max-md:min-h-11"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {isAr ? "واتساب" : "WhatsApp"}
          </a>
          <a
            href={HQ_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-rule px-3 py-2 text-xs font-semibold text-stone transition-colors hover:border-pine hover:text-pine max-md:min-h-11"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            {isAr ? "الاتجاهات" : "Directions"}
          </a>
        </div>
      </div>
    </section>
  );
}

export default function DistributorNetwork({
  lang,
  distributors,
}: {
  lang: string;
  distributors: Distributor[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isAr = lang === "ar";
  const groups = groupByRegion(distributors);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Map sticks while the list scrolls past it on desktop. */}
      <div className="lg:col-span-3">
        <div className="lg:sticky lg:top-28">
          <DistributorMap
            distributors={distributors}
            lang={lang}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <HeadOfficeCard
          lang={lang}
          isSelected={selectedId === HQ_SELECTION_ID}
          onSelect={() => setSelectedId(HQ_SELECTION_ID)}
        />
        {groups.map((group) => (
          <section key={group.region} className="mb-8 last:mb-0">
            <div className="mb-4 flex items-baseline justify-between gap-3 border-t-2 border-pine pt-3">
              <h2 className="text-[15px] font-bold text-pine">
                {isAr
                  ? REGION_LABELS[group.region].ar
                  : REGION_LABELS[group.region].en}
              </h2>
              <span className="spec-label shrink-0" dir="ltr">
                {group.items.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {group.items.map((distributor) => (
                <DistributorCard
                  key={distributor.id}
                  distributor={distributor}
                  lang={lang}
                  isSelected={selectedId === distributor.id}
                  onSelect={() => setSelectedId(distributor.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
