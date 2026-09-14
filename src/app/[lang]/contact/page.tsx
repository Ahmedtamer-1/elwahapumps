import React from "react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import ContactForm from "@/components/ContactForm";
import PageHeader from "@/components/PageHeader";
import { localizedAlternates } from "@/lib/seo";
import { ExternalLink } from "lucide-react";
import { EMAIL, HQ_MAP_URL, PHONE_SALES, PHONE_SUPPORT, SOCIAL_LINKS, hqMapEmbedUrl } from "@/lib/company";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ subject?: string | string[] }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.contactPage.title,
    description: dict.contactPage.subtitle,
    // Canonical is the bare path regardless of ?subject= — every product,
    // agent and service page links here with a different subject param, so
    // without this each of those would be a crawlable near-duplicate.
    alternates: localizedAlternates(lang, "/contact"),
  };
}

export default async function ContactPage({ params, searchParams }: PageProps) {
  const { lang } = await params;
  const { subject } = await searchParams;
  const dict = await getDictionary(lang as Locale);
  const initialSubject = Array.isArray(subject) ? subject[0] : subject;

  /**
   * The contact details as a plate rather than four icon chips.
   *
   * Each row used to carry a coloured icon tile beside a label that said the
   * same thing — a pin next to "OFFICE", an envelope next to "EMAIL". The
   * label is the more precise of the two, so the icon went and the rows are
   * set the way every other specification on this site is: mono key, value.
   */
  const rows: { key: string; value: React.ReactNode }[] = [
    {
      key: dict.contactPage.office,
      value: dict.common.addressValue,
    },
    {
      key: dict.common.phoneLabel,
      value: (
        <span className="flex flex-col gap-1">
          {[PHONE_SALES, PHONE_SUPPORT].map((raw, i) => (
            <a
              key={raw}
              href={`tel:${raw}`}
              dir="ltr"
              className="hover:text-pine transition-colors w-fit max-md:inline-flex max-md:items-center max-md:min-h-11"
            >
              {["+20 106 668 5532", "+20 106 815 5336"][i]}
            </a>
          ))}
        </span>
      ),
    },
    {
      key: dict.common.emailLabel,
      value: (
        <a
          href={`mailto:${EMAIL}`}
          dir="ltr"
          className="hover:text-pine transition-colors max-md:inline-flex max-md:items-center max-md:min-h-11"
        >
          {EMAIL}
        </a>
      ),
    },
    {
      key: dict.common.workHoursLabel,
      value: dict.common.workHoursValue,
    },
  ];

  return (
    <div className="bg-white min-h-screen pb-section">
      <PageHeader
        eyebrow={dict.nav.contact}
        title={dict.contactPage.title}
        subtitle={dict.contactPage.subtitle}
      />

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Info */}
          <div className="lg:col-span-5">
            <div className="bg-white border-t-2 border-pine border-x border-b border-rule p-6 md:p-8">
              <h2 className="text-h3 font-extrabold text-pine border-b border-rule pb-4 mb-2">
                {dict.contactPage.infoTitle}
              </h2>

              <dl>
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 py-4 border-b border-rule-light"
                  >
                    <dt className="spec-label sm:pt-1">{row.key}</dt>
                    <dd className="sm:col-span-2 text-small text-ink font-medium leading-relaxed">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Social links */}
              <div className="pt-6">
                <span className="spec-label block mb-3">{dict.common.socialMedia}</span>
                <div className="flex flex-wrap gap-3">
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-11 h-11 flex items-center justify-center bg-bone text-stone hover:bg-pine hover:text-bone border border-rule transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {social.paths.map((d) => (
                          <path key={d} d={d} />
                        ))}
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Form */}
          <div className="lg:col-span-7">
            <ContactForm lang={lang} dict={dict} initialSubject={initialSubject} />
          </div>
        </div>

        {/* Embedded Map */}
        <div className="mt-12 bg-white border-t-2 border-pine border-x border-b border-rule p-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-2">
            <h3 className="text-h3 font-extrabold text-pine">
              {dict.contactPage.findUs}
            </h3>
            <a
              href={HQ_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-pine px-4 py-2.5 text-sm font-semibold text-bone hover:bg-field transition-colors"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {lang === "ar" ? "الاتجاهات على خرائط جوجل" : "Directions on Google Maps"}
            </a>
          </div>
          <iframe
            src={hqMapEmbedUrl(lang)}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps Location - El Waha Pumps"
          />
        </div>
      </section>
    </div>
  );
}
