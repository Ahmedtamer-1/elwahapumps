import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/Logo";
import { AGENCY_COUNT, PROJECTS_DELIVERED, RESPONSE_COVER } from "@/lib/company";
import type { Dictionary } from "../../app/[lang]/dictionaries";

/**
 * The split layout the sign-in and sign-up pages share: a pine brand panel
 * with the team photograph and the scale figures on one side, the form on a
 * white sheet on the other. On mobile the panel collapses to a short band
 * above the form, so the fields are still the first thing within reach.
 *
 * The figures come from company.ts — the same ones the About page and the
 * homepage quote — so this panel cannot claim a different number.
 */
export default function AuthShell({
  lang,
  dict,
  title,
  fullscreen = false,
  children,
}: {
  lang: string;
  dict: Dictionary["account"];
  title: string;
  /** Fill the viewport edge to edge (the page renders without header/footer). */
  fullscreen?: boolean;
  children: React.ReactNode;
}) {
  const isAr = lang === "ar";
  const stats = [
    { figure: PROJECTS_DELIVERED, label: dict.statProjects },
    { figure: RESPONSE_COVER.replace(/\s/g, ""), label: dict.statResponse },
    { figure: String(AGENCY_COUNT), label: dict.statAgencies },
  ];

  return (
    <div
      className={
        fullscreen ? "bg-white min-h-dvh" : "bg-bone min-h-screen px-4 py-8 sm:px-6 md:py-12 lg:px-8"
      }
    >
      <div
        className={
          fullscreen
            ? "grid min-h-dvh grid-cols-1 bg-white lg:grid-cols-2"
            : "mx-auto grid max-w-7xl grid-cols-1 overflow-hidden border border-rule bg-white shadow-[0_1px_2px_rgba(20,20,20,0.04)] lg:min-h-[640px] lg:grid-cols-2"
        }
      >
        {/* Brand panel */}
        <aside className="relative flex flex-col overflow-hidden bg-pine p-8 text-bone sm:p-10 lg:p-12">
          <Image
            src="/images/about/team.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover opacity-20 grayscale"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(14,59,46,0.72) 0%, rgba(14,59,46,0.86) 60%, rgba(14,59,46,0.96) 100%)",
            }}
          />

          <div className="relative flex h-full flex-col">
            <Link href={`/${lang}`} aria-label="El Waha" className="inline-block w-fit">
              <Logo x={22} reversed />
            </Link>

            <div className="mt-10 lg:mt-auto">
              <div className="h-[3px] w-16 bg-brass" aria-hidden="true" />
              <p className="mt-6 max-w-[18ch] text-h3 font-extrabold leading-tight text-bone sm:text-h2">
                {dict.panelTitle}
              </p>
              <p className="mt-5 hidden max-w-[46ch] text-sm leading-relaxed text-bone/75 sm:block">
                {dict.panelBody}
              </p>
            </div>

            <dl className="mt-10 hidden gap-x-10 gap-y-4 border-t border-bone/15 pt-6 sm:flex sm:flex-wrap lg:mt-auto">
              {stats.map((stat) => (
                <div key={stat.label} className={isAr ? "text-right" : ""}>
                  <dd className="text-2xl font-extrabold leading-none text-brass" dir="ltr">
                    {stat.figure}
                  </dd>
                  <dt className="spec-label mt-2 text-bone/60">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </aside>

        {/* Form sheet */}
        <section className={`flex items-center p-8 sm:p-10 lg:p-16 ${fullscreen ? "justify-center" : ""}`}>
          <div className="w-full max-w-md">
            {/* With no header on the page, this is the way back to the site. */}
            {fullscreen && (
              <Link
                href={`/${lang}`}
                className="spec-label mb-10 inline-flex items-center gap-2 text-stone hover:text-pine"
              >
                <span aria-hidden="true">{isAr ? "→" : "←"}</span>
                {dict.backToSite}
              </Link>
            )}
            <span className="spec-label block text-stone">{dict.eyebrow}</span>
            <h1 className="mt-3 text-h2 font-extrabold text-ink">{title}</h1>
            <div className="mt-5 mb-8 h-[3px] w-14 bg-brass" aria-hidden="true" />
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
