import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Logo from "@/components/Logo";
import {
  AGENCY_COUNT,
  ENTITY_FORM_AR,
  ENTITY_FORM_EN,
  FOUNDED,
  LEGAL_NAME_AR,
  LEGAL_NAME_EN,
  PHONE_SALES,
  PHONE_SUPPORT,
  SOCIAL_LINKS,
} from "@/lib/company";
import type { Dictionary } from "../app/[lang]/dictionaries";

interface FooterProps {
  lang: string;
  dict: Dictionary;
}

/**
 * Footer on pine — Brand Report §04. Pine dominates in print and in the
 * environment, and bone on pine is the system's strongest pairing at
 * 13.1:1 AAA. Brass appears only as the column rules and the phone
 * numbers, keeping it well under the 10% ceiling.
 */
export default function Footer({ lang, dict }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const isAr = lang === "ar";

  const quickLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/products`, label: dict.nav.products },
    { href: `/${lang}/contact`, label: dict.nav.contact },
  ];

  const serviceLinks = (
    [
      "pump-supply",
      "panel-design",
      "pump-maintenance",
      "motor-maintenance",
    ] as const
  ).map((slug) => ({
    href: `/${lang}/services/${slug}`,
    label: dict.servicesData[slug].title,
  }));

  return (
    <footer className="bg-pine text-bone/75 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Company brief & socials */}
          <div>
            <Link href={`/${lang}`} aria-label="El Waha" className="inline-block mb-6">
              <Logo variant="mark" x={20} reversed />
            </Link>
            {/* §07 voice: specific over superlative. The old copy claimed
                "leading company" and "20+ years"; this names the record,
                the certification and the agencies instead. */}
            <p className="text-sm text-bone/70 mb-6 max-w-[42ch]">
              {isAr
                ? `توريد وتركيب وصيانة طلمبات الأعماق في مصر منذ عام ${FOUNDED}. توكيلات حصرية لـ${AGENCY_COUNT} شركة عالمية، ونفس الفريق يقوم بالصيانة بعد التوريد.`
                : `Deep-well pumping equipment supplied, installed and maintained across Egypt since ${FOUNDED}. Exclusive Egyptian agent for ${AGENCY_COUNT} manufacturers — and the same team services it afterwards.`}
            </p>

            {/* Driven from company.ts so the footer and the structured
                data's sameAs cannot list different profiles. */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 max-md:w-11 max-md:h-11 flex items-center justify-center border border-bone/20 text-bone/70 hover:border-brass hover:text-brass transition-colors"
                  aria-label={social.label}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {social.paths.map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <FooterColumn title={isAr ? "روابط سريعة" : "Quick Links"}>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-bone/75 hover:text-brass transition-colors max-md:inline-flex max-md:items-center max-md:min-h-11"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* Services. §2.4 value 02 — maintenance is sold as prominently
              as supply, so it keeps a full column here. */}
          <FooterColumn title={dict.nav.services}>
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-bone/75 hover:text-brass transition-colors max-md:inline-flex max-md:items-center max-md:min-h-11"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* Contact */}
          <div>
            <FooterHeading>{dict.contactPage.infoTitle}</FooterHeading>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brass shrink-0 mt-1" aria-hidden="true" />
                <span className="text-sm text-bone/75">{dict.common.addressValue}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brass shrink-0 mt-1 max-md:mt-3.5" aria-hidden="true" />
                {/* Brass on pine, 5.9:1 AA. Western digits on both sites
                    (§5.2 rule 5) — numbers get copied across languages. */}
                <div className="flex flex-col gap-1 max-md:gap-0">
                  <a
                    href={`tel:${PHONE_SALES}`}
                    dir="ltr"
                    className="font-mono text-xs tracking-[0.08em] text-brass hover:text-bone transition-colors max-md:inline-flex max-md:items-center max-md:min-h-11"
                  >
                    +20 106 668 5532
                  </a>
                  <a
                    href={`tel:${PHONE_SUPPORT}`}
                    dir="ltr"
                    className="font-mono text-xs tracking-[0.08em] text-brass hover:text-bone transition-colors max-md:inline-flex max-md:items-center max-md:min-h-11"
                  >
                    +20 106 815 5336
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brass shrink-0 mt-1 max-md:mt-3.5" aria-hidden="true" />
                {/* Corrected domain — the old one was missing its "e", so
                    every enquiry sent from the site failed (§1.3). */}
                <a
                  href="mailto:info@elwahapumps.com"
                  dir="ltr"
                  className="font-mono text-xs text-bone/75 hover:text-brass transition-colors break-all max-md:inline-flex max-md:items-center max-md:min-h-11"
                >
                  info@elwahapumps.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-brass shrink-0 mt-1" aria-hidden="true" />
                <span className="text-sm text-bone/75">{dict.common.workHoursValue}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar. */}
        <div className="pt-6 border-t border-bone/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs tracking-[0.14em] text-bone/75 text-center md:text-start">
            {/* The registered name comes from company.ts, not from a
                dictionary string — it had already drifted there, with the
                English reading "El Waha Pumps Company". */}
            &copy; {currentYear} {dict.common.allRightsReserved}{" "}
            {isAr ? `${LEGAL_NAME_AR} ${ENTITY_FORM_AR}` : `${LEGAL_NAME_EN} ${ENTITY_FORM_EN}`}
          </p>
          <div className="flex gap-5">
            <Link
              href="/ar"
              className="font-mono text-xs tracking-[0.14em] text-bone/75 hover:text-brass transition-colors max-md:inline-flex max-md:items-center max-md:min-h-11"
            >
              {isAr ? "العربية" : "Arabic"}
            </Link>
            <Link
              href="/en"
              className="font-mono text-xs tracking-[0.14em] text-bone/75 hover:text-brass transition-colors max-md:inline-flex max-md:items-center max-md:min-h-11"
            >
              English
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Column head: brass rule above, bone label. Matches the report's
 *  section-head treatment rather than a left border in green. Not a
 *  heading element — these are link-group labels inside the footer
 *  landmark, and pages whose content never reaches h2/h3 were jumping
 *  straight from the page's h1 to four of these as h4. */
function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-extrabold uppercase tracking-[0.1em] text-bone border-t-2 border-brass pt-3 mb-5">
      {children}
    </p>
  );
}

function FooterColumn({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      {/* Below md each link is its own 44px row (see the links), so the
          list spacing collapses rather than stacking on top of it. */}
      <ul className="space-y-3 max-md:space-y-0">{children}</ul>
    </div>
  );
}
