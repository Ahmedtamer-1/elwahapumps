import React from "react";
import Image from "next/image";
import { SUCCESS_PARTNERS } from "@/data/success-partners";
import MarqueeRow from "@/components/MarqueeRow";

interface SuccessPartnersProps {
  lang: string;
}

/**
 * The client wall — who El Waha has actually supplied and maintained.
 *
 * The logos were re-cut as one set (same canvas, background removed, mark
 * centred), so the §1.3 "one optical height" fix no longer needs a grey wash
 * to hold the wall together: a single fixed box does it. Brand colour is on
 * from the start rather than appearing on hover — on a touch screen there is
 * no hover, and half the roster was reading as grey smudges.
 *
 * These are clients, not agencies, so the tiles carry no type/best-for plate
 * and link nowhere — the name is the claim.
 */
export default function SuccessPartners({ lang }: SuccessPartnersProps) {
  const isAr = lang === "ar";

  return (
    <div className="w-full py-14 bg-white border-y border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t-2 border-pine pt-3 mb-8">
          <h2 className="text-h3 sm:text-h2 font-extrabold text-pine">
            {isAr ? "شركاء النجاح" : "Success Partners"}
          </h2>
        </div>

        <MarqueeRow
          durationSeconds={32}
          className="[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
          trackClassName="gap-3"
          ariaLabel={isAr ? "شركاء النجاح" : "Success Partners"}
        >
          {/* One copy — MarqueeRow clones it for the loop. */}
          {SUCCESS_PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="flex w-52 h-28 shrink-0 items-center justify-center bg-white border border-rule hover:border-pine transition-colors duration-300"
            >
              {/* Every source file is 669×373 with the mark centred, so one
                  box and `object-contain` scales the whole roster alike. */}
              <div className="relative w-full h-20">
                {/* Fixed width rather than `fill` + `sizes`: the box is
                    always 208px, and `sizes` listed fifteen candidate
                    widths per logo in the HTML where 1x/2x is all it needs. */}
                <Image
                  src={partner.logo}
                  alt={isAr ? partner.name.ar : partner.name.en}
                  width={208}
                  height={116}
                  quality={95}
                  className="absolute inset-0 w-full h-full object-contain px-5"
                />
              </div>
            </div>
          ))}
        </MarqueeRow>

        {/* Not painted, but not deleted either. The marquee above is
            decorative — logos, no text an answer engine or a screen reader
            can use — so this list is the only place the client
            relationships exist as real, indexable facts rather than pixels
            inside a scrolling image strip. `sr-only` takes it out of the
            layout (it was a paragraph-shaped block of grey under the wall)
            while leaving it in the document for search and assistive tech. */}
        <p className="sr-only">
          {SUCCESS_PARTNERS.map((partner, idx) => (
            <React.Fragment key={partner.id}>
              {idx > 0 && (isAr ? "، " : ", ")}
              {isAr ? partner.name.ar : partner.name.en}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}
