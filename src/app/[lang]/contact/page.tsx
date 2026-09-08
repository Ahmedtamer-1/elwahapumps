import React from "react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import ContactForm from "@/components/ContactForm";
import PageHeader from "@/components/PageHeader";
import { localizedAlternates } from "@/lib/seo";
import { EMAIL, PHONE_SALES, PHONE_SUPPORT } from "@/lib/company";

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
              className="hover:text-pine transition-colors w-fit"
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
          className="hover:text-pine transition-colors"
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
    <div className="bg-white min-h-screen pb-20">
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
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com/elwahapumps"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-11 h-11 flex items-center justify-center bg-bone text-stone hover:bg-pine hover:text-bone border border-rule transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com/@elwahapumps"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-11 h-11 flex items-center justify-center bg-bone text-stone hover:bg-pine hover:text-bone border border-rule transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96C5.12 19 12 19 12 19s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z" />
                      <polygon points="9.75 15.02 15.5 11.54 9.75 8.07 9.75 15.02" />
                    </svg>
                  </a>
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
        <div className="mt-12 bg-white border-t-2 border-pine border-x border-b border-rule p-4 overflow-hidden h-[450px]">
          <h3 className="text-h3 font-extrabold text-pine mb-3 px-2">
            {dict.contactPage.findUs}
          </h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110594.39455122175!2d30.730303102377227!3d29.977259695663737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458564c7dcbe185%3A0xe54e60cf0b621fe8!2sCPC%20Industrial%20Complex!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg"
            width="100%"
            height="90%"
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
