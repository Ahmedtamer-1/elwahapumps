import React from "react";
import Image from "next/image";
import { SUCCESS_PARTNERS } from "@/data/success-partners";

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

        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max gap-3 animate-marquee-left hover:[animation-play-state:paused]">
            {[...SUCCESS_PARTNERS, ...SUCCESS_PARTNERS].map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="flex w-52 h-28 shrink-0 items-center justify-center bg-white border border-rule hover:border-pine transition-colors duration-300"
              >
                {/* Every source file is 669×373 with the mark centred, so one
                    box and `object-contain` scales the whole roster alike. */}
                <div className="relative w-full h-20">
                  <Image
                    src={partner.logo}
                    alt={isAr ? partner.name.ar : partner.name.en}
                    fill
                    sizes="(max-width: 640px) 208px, 416px"
                    quality={95}
                    className="object-contain px-5"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The marquee above is decorative (logos, no text an answer engine
            or a screen reader can use); this is the actual content — every
            name as selectable text, so the client relationships are real,
            indexable facts and not just pixels inside a scrolling image
            strip. */}
        <p className="mt-6 text-sm leading-relaxed text-stone">
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
