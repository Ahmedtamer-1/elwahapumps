import React from "react";
import Image from "next/image";
import { SUCCESS_PARTNERS } from "@/data/success-partners";

interface SuccessPartnersProps {
  lang: string;
}

/**
 * The client wall — who El Waha has actually supplied and maintained.
 *
 * Same treatment as the old agency wall (Brand Report §1.3): one optical
 * height, one grey, brand colour returning only on hover, so twenty-two marks
 * at twenty-two scales read as a roster rather than as a jumble of logos.
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
                className={`group flex w-52 h-28 shrink-0 items-center justify-center border border-rule hover:border-pine transition-colors duration-300 ${
                  // A white mark on a transparent ground is invisible on bone,
                  // so it gets a pine tile instead of being dropped.
                  partner.onDark ? "bg-pine" : "bg-bone"
                }`}
              >
                <div className="relative w-full h-16">
                  <Image
                    src={partner.logo}
                    alt={isAr ? partner.name.ar : partner.name.en}
                    fill
                    sizes="208px"
                    className="object-contain px-6 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        
      </div>
    </div>
  );
}
