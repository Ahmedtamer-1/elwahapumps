import React from "react";
import { getDictionary, hasLocale, Locale } from "../dictionaries";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { localizedAlternates } from "@/lib/seo";

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

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Page Header */}
      <section className="bg-black text-white py-16 md:py-20 border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-emerald-500 font-extrabold text-xs uppercase tracking-widest block mb-2">
            {dict.nav.contact}
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            {dict.contactPage.title}
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto leading-relaxed">
            {dict.contactPage.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Information Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-4">
                {dict.contactPage.infoTitle}
              </h2>

              <div className="space-y-4">
                {/* Office */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                      {dict.contactPage.office}
                    </span>
                    <span className="text-neutral-700 text-xs font-semibold leading-relaxed">
                      {dict.common.addressValue}
                    </span>
                  </div>
                </div>

                {/* Phones */}
                <div className="flex gap-4 items-start border-t border-neutral-50 pt-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                      {dict.common.phoneLabel}
                    </span>
                    <div className="flex flex-col gap-1 text-neutral-700 text-xs font-semibold">
                      <a href="tel:+201066685532" className="hover:text-emerald-600 transition-colors">
                        +20 106 668 5532
                      </a>
                      <a href="tel:+201068155336" className="hover:text-emerald-600 transition-colors">
                        +20 106 815 5336
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 items-start border-t border-neutral-50 pt-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                      {dict.common.emailLabel}
                    </span>
                    <a href="mailto:info@elwahapumps.com" className="text-neutral-700 text-xs font-semibold hover:text-emerald-600 transition-colors">
                      info@elwahapumps.com
                    </a>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex gap-4 items-start border-t border-neutral-50 pt-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                      {dict.common.workHoursLabel}
                    </span>
                    <span className="text-neutral-700 text-xs font-semibold">
                      {dict.common.workHoursValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="border-t border-neutral-100 pt-6">
                <span className="block text-xs font-bold text-neutral-400 uppercase mb-3">
                  {dict.common.socialMedia}
                </span>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com/elwahapumps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 text-neutral-500 hover:bg-emerald-600 hover:text-white border border-neutral-100 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                  <a
                    href="https://youtube.com/@elwahapumps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 text-neutral-500 hover:bg-red-600 hover:text-white border border-neutral-100 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="mt-12 bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm overflow-hidden h-[450px]">
          <h2 className="text-base font-bold text-neutral-900 mb-3 px-2">
            {dict.contactPage.findUs}
          </h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110594.39455122175!2d30.730303102377227!3d29.977259695663737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458564c7dcbe185%3A0xe54e60cf0b621fe8!2sCPC%20Industrial%20Complex!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg"
            width="100%"
            height="90%"
            style={{ border: 0, borderRadius: "1.25rem" }}
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
