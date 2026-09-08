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
export default function PageHeader({ eyebrow, title, subtitle, image, children }: PageHeaderProps) {
  return (
    <section className="relative bg-pine text-bone py-16 md:py-20 overflow-hidden">
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
            className="object-cover opacity-35"
          />
          {/* Pine, not black. A black scrim over a photograph is what put this
              masthead outside the palette in the first place. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(14,59,46,0.86) 0%, rgba(14,59,46,0.72) 50%, rgba(14,59,46,0.92) 100%)",
            }}
          />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    </section>
  );
}
