import React from "react";
import Image from "next/image";

interface PageHeaderProps {
  /** Mono eyebrow — usually the nav label for this section. */
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Optional photograph behind the masthead, held by a pine scrim. */
  image?: { src: string; alt: string };
  /** Optional calls to action, rendered under the subtitle. */
  children?: React.ReactNode;
  /** Optional panel set beside the title on desktop, below it on mobile. */
  aside?: React.ReactNode;
}

/**
 * The masthead every interior page opens on.
 *
 * Each page used to build its own — centred on one near-black or another,
 * with the eyebrow in a different green and the subtitle in a different grey
 * each time. Two problems with that. The first is that near-black with a
 * single bright accent is a stock look this brand does not own; §04 gives the
 * site pine for its dark ground. The second is that a reader moving between
 * Services, Support and Contact was being shown three different mastheads for
 * the same kind of page.
 *
 * Start-aligned rather than centred, opening on a brass rule, so an interior
 * page begins the way the hero and every section rule on the site does. It
 * sits a level below the hero in the type scale on purpose — h1 here against
 * display there — because it is a signpost, not a thesis.
 */
export default function PageHeader({ eyebrow, title, subtitle, image, children, aside }: PageHeaderProps) {
  return (
    <section className="relative bg-pine text-bone py-section overflow-hidden">
      {image && (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            /* `priority` is deprecated in Next 16 — a masthead image is the
               LCP element, so it says so directly. */
            loading="eager"
            fetchPriority="high"
            className="object-cover opacity-50"
          />
          {/* Pine, not black. A black scrim over a photograph is what put this
              masthead outside the palette in the first place.

              Lightened from 0.86/0.72/0.92: at that weight the photograph
              was a green texture rather than a picture, and on /support the
              picture is the promise the copy makes — a fleet of vans and the
              crews standing with them. The edges stay heavier than the
              middle so the masthead still closes top and bottom against the
              header above and the section below. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(14,59,46,0.82) 0%, rgba(14,59,46,0.60) 50%, rgba(14,59,46,0.88) 100%)",
            }}
          />
        </>
      )}
      <div
        className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          aside ? "grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-end" : ""
        }`}
      >
        <div className={aside ? "lg:col-span-8" : undefined}>
          <div className="w-16 h-[3px] bg-brass mb-6" aria-hidden="true" />
          <span className="spec-label text-brass block mb-3">{eyebrow}</span>
          <h1 className="text-h2 md:text-h1 font-extrabold text-bone text-balance max-w-[24ch]">
            {title}
          </h1>
          {subtitle && (
            /* Bone at 75% clears AA on pine; the neutral-400 these pages used
               did not, and it was on every one of them. */
            <p className="mt-4 text-body text-bone/75 max-w-[60ch]">{subtitle}</p>
          )}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {aside && <div className="lg:col-span-4">{aside}</div>}
      </div>
    </section>
  );
}
