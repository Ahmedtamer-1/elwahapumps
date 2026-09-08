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
  SOCIAL,
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
/** The four confirmed profiles (content brief, 1.4), with their glyphs. */
const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: SOCIAL.facebook,
    paths: ["M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"],
  },
  {
    label: "YouTube",
    href: SOCIAL.youtube,
    paths: [
      "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96C5.12 19 12 19 12 19s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z",
      "M9.75 15.02 15.5 11.54 9.75 8.07z",
    ],
  },
  {
    label: "LinkedIn",
    href: SOCIAL.linkedin,
    paths: [
      "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
      "M6 9H2v12h4z",
      "M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    ],
  },
  {
    label: "Instagram",
    href: SOCIAL.instagram,
    paths: [
      "M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6z",
      "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
      "M17.5 6.5h.01",
    ],
  },
];

export default function Footer({ lang, dict }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const isAr = lang === "ar";

  const quickLinks = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/about`, label: dict.nav.about },
    { href: `/${lang}/products`, label: dict.nav.products },
    { href: `/${lang}/agents`, label: dict.nav.agents },
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
    <footer className="bg-pine text-bone/75 pt-16 pb-8">
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
            <p className="text-[13px] leading-6 text-bone/70 mb-6 max-w-[42ch]">
              {isAr
                ? `توريد وتركيب وصيانة طلمبات الأعماق في مصر منذ عام ${FOUNDED}. توكيلات حصرية لـ${AGENCY_COUNT} شركة عالمية، وشهادة ISO 9001، ونفس الفريق يقوم بالصيانة بعد التوريد.`
                : `Deep-well pumping equipment supplied, installed and maintained across Egypt since ${FOUNDED}. Exclusive Egyptian agent for ${AGENCY_COUNT} manufacturers, ISO 9001 certified — and the same team services it afterwards.`}
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
                  className="w-10 h-10 flex items-center justify-center border border-bone/20 text-bone/70 hover:border-brass hover:text-brass transition-colors"
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
                  className="text-[13px] leading-5 text-bone/75 hover:text-brass transition-colors"
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
                  className="text-[13px] leading-5 text-bone/75 hover:text-brass transition-colors"
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
                <span className="text-[13px] leading-6 text-bone/75">{dict.common.addressValue}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brass shrink-0 mt-1" aria-hidden="true" />
                {/* Brass on pine, 5.9:1 AA. Western digits on both sites
                    (§5.2 rule 5) — numbers get copied across languages. */}
                <div className="flex flex-col gap-1">
                  <a
                    href={`tel:${PHONE_SALES}`}
                    dir="ltr"
                    className="font-mono text-[12px] tracking-[0.08em] text-brass hover:text-bone transition-colors"
                  >
                    +20 106 668 5532
                  </a>
                  <a
                    href={`tel:${PHONE_SUPPORT}`}
                    dir="ltr"
                    className="font-mono text-[12px] tracking-[0.08em] text-brass hover:text-bone transition-colors"
                  >
                    +20 106 815 5336
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brass shrink-0 mt-1" aria-hidden="true" />
                {/* Corrected domain — the old one was missing its "e", so
                    every enquiry sent from the site failed (§1.3). */}
                <a
                  href="mailto:info@elwahapumps.com"
                  dir="ltr"
                  className="font-mono text-[12px] text-bone/75 hover:text-brass transition-colors break-all"
                >
                  info@elwahapumps.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-brass shrink-0 mt-1" aria-hidden="true" />
                <span className="text-[13px] leading-6 text-bone/75">{dict.common.workHoursValue}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar. ISO 9001 stated plainly rather than buried in small
            type above the navigation, which is where it used to sit (§1.1). */}
        <div className="pt-6 border-t border-bone/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] tracking-[0.14em] text-bone/75 text-center md:text-start">
            {/* The registered name comes from company.ts, not from a
                dictionary string — it had already drifted there, with the
                English reading "El Waha Pumps Company". */}
            &copy; {currentYear} {dict.common.allRightsReserved}{" "}
            {isAr ? `${LEGAL_NAME_AR} ${ENTITY_FORM_AR}` : `${LEGAL_NAME_EN} ${ENTITY_FORM_EN}`} · ISO 9001
          </p>
          <div className="flex gap-5">
            <Link
              href="/ar"
              className="font-mono text-[11px] tracking-[0.14em] text-bone/75 hover:text-brass transition-colors"
            >
              {isAr ? "العربية" : "Arabic"}
            </Link>
            <Link
              href="/en"
              className="font-mono text-[11px] tracking-[0.14em] text-bone/75 hover:text-brass transition-colors"
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
    <p className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-bone border-t-2 border-brass pt-3 mb-5">
      {children}
    </p>
  );
}

function FooterColumn({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}
