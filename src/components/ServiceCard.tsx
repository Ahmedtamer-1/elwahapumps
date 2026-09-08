import React from "react";
import Link from "next/link";

interface ServiceCardProps {
  id: string;
  title: string;
  short: string;
  lang: string;
  /**
   * Position in the run, from 1. Set as a mono numeral beside the title —
   * the catalogue numbering the report uses for every enumerated series.
   * Omitted, the numeral simply does not appear.
   */
  index?: number;
  /**
   * A short mono tag set at the end of the title row — the category, when a
   * listing is mixing more than one of them.
   */
  meta?: string;
  /**
   * Which ground the card is sitting on. `light` is the white plate used in
   * the hairline grid; `pine` is the bordered plate used when the section
   * itself is pine (§04: bone on pine, ink on bone — nothing else).
   */
  tone?: "light" | "pine";
}

/**
 * One service, as a plate.
 *
 * This card was the last thing on the site still wearing the old kit: a
 * rounded white panel, a mint chip with a lucide glyph in it, slate body copy
 * and a lift-on-hover. None of that is in the system — §03.5 allows flat pine,
 * bone or white only, there is no radius anywhere in the identity, and the
 * icon chips were decoration standing in for the one thing a buyer actually
 * wants from a service listing, which is what it covers.
 *
 * So the glyph is gone and the numeral takes its place. Numbering a service
 * run costs nothing, tells a reader how long the list is, and gives the brass
 * somewhere legitimate to sit — a rule and a numeral, well under the 10% the
 * accent is allowed on any surface.
 */
export default function ServiceCard({
  id,
  title,
  short,
  lang,
  index,
  meta,
  tone = "light",
}: ServiceCardProps) {
  const isAr = lang === "ar";
  const onPine = tone === "pine";

  return (
    <Link
      href={`/${lang}/services/${id}`}
      /* The whole plate is the target. It used to be a "Learn More" link at
         the bottom of a div, which on a touch screen is a 90px-wide tap area
         inside a card the thumb has already landed on. */
      className={`group flex h-full flex-col p-8 md:p-9 transition-colors duration-300 ${
        onPine
          ? "border border-bone/20 border-t-[3px] border-t-brass hover:bg-field/40"
          : "bg-white hover:bg-bone"
      }`}
    >
      <div className="flex items-baseline gap-3">
        {index !== undefined && (
          /* Brass only on pine. The mockup sets these numerals in brass on the
             white cards too, but §04's pairing table rules that out and the
             measurement backs it: #d2ab5c on white is 1.9:1, which is not a
             numeral, it is a smudge. On light ground the numeral takes pine,
             which is the same accenting move at a ratio that survives. */
          <span
            className={`font-mono text-[11px] font-medium tabular-nums ${
              onPine ? "text-brass" : "text-pine"
            }`}
            aria-hidden="true"
          >
            {String(index).padStart(2, "0")}
          </span>
        )}
        <h3
          className={`text-h3 font-extrabold text-balance ${
            onPine ? "text-bone" : "text-ink"
          }`}
        >
          {title}
        </h3>
        {meta && (
          <span
            className={`spec-label ms-auto shrink-0 ${
              onPine ? "text-bone/60" : "text-stone-light"
            }`}
          >
            {meta}
          </span>
        )}
      </div>

      <p
        className={`mt-3.5 max-w-[48ch] text-small leading-6 ${
          onPine ? "text-bone/75" : "text-stone"
        }`}
      >
        {short}
      </p>

      {/* Pushed to the foot so a row of cards agrees on where the action sits,
          whatever the description does above it. */}
      <span
        className={`spec-label mt-auto pt-5 inline-flex items-center gap-1.5 transition-colors ${
          onPine ? "text-brass" : "text-pine group-hover:text-field"
        }`}
      >
        {isAr ? "اقرأ المزيد" : "Read more"}
        <span
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
        >
          {isAr ? "←" : "→"}
        </span>
      </span>
    </Link>
  );
}
