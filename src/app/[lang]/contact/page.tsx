import React from "react";
import { getDictionary, Locale } from "../dictionaries";
import ContactForm from "@/components/ContactForm";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function ContactPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <section className="bg-pine pt-8 pb-7 md:py-14 border-b border-rule-light">
        <div className="max-w-[1152px] mx-auto px-4 md:px-8">
          <span className="text-brass font-mono font-medium text-[10px] md:text-[11px] leading-4 tracking-[0.16em] uppercase block mb-2.5 md:mb-3.5">
            {dict.nav.contact}
          </span>
          <h1 className="text-[30px] leading-[33px] md:text-[46px] md:leading-[48px] font-extrabold text-bone tracking-[-0.03em] md:tracking-[-0.035em] mb-4 md:mb-5">
            {dict.contactPage.title}
          </h1>
          <div className="h-[3px] w-[52px] md:w-16 bg-brass mb-4 md:mb-5"></div>
          <p className="text-bone/75 text-[13.5px] leading-[22px] md:text-[15px] md:leading-[26px] max-w-[60ch]">
            {dict.contactPage.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-6 md:py-16">
        <div className="max-w-[1152px] mx-auto px-4 md:px-8">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-10 md:gap-14 items-start">
            
            {/* Column 1: Form */}
            <div className="lg:col-span-7 w-full">
              <ContactForm lang={lang} dict={dict} />
            </div>

            {/* Column 2: Info */}
            <div className="lg:col-span-5 flex flex-col gap-8 md:gap-14 w-full">
              <div className="bg-bone border-t-[3px] border-brass px-4 py-6 md:px-8 md:py-8">
                <span className="font-mono font-medium text-[11px] tracking-[0.16em] uppercase text-stone mb-6 block">
                  {dict.contactPage.infoTitle}
                </span>

                <div className="space-y-5 flex flex-col gap-5 mt-6">
                  {/* Office */}
                  <div className="border-t border-rule pt-3.5">
                    <span className="block font-mono text-[10px] tracking-[0.14em] uppercase text-stone-light mb-1.5">
                      {dict.contactPage.office || "HEADQUARTERS"}
                    </span>
                    <span className="text-[13.5px] leading-[22px] text-ink font-normal block">
                      {dict.common.addressValue}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="border-t border-rule pt-3.5">
                    <span className="block font-mono text-[10px] tracking-[0.14em] uppercase text-stone-light mb-1.5">
                      {dict.common.phoneLabel}
                    </span>
                    <div className="text-[14px] leading-[24px] font-mono font-semibold text-pine flex flex-col">
                      <a href="tel:+201066685532" className="hover:text-field transition-colors">+20 106 668 5532</a>
                      <a href="tel:+201068155336" className="hover:text-field transition-colors">+20 106 815 5336</a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="border-t border-rule pt-3.5">
                    <span className="block font-mono text-[10px] tracking-[0.14em] uppercase text-stone-light mb-1.5">
                      {dict.common.emailLabel}
                    </span>
                    <a href="mailto:info@elwahapumps.com" className="text-[13px] font-mono font-normal text-ink hover:text-field transition-colors block mt-1.5">
                      info@elwahapumps.com
                    </a>
                  </div>
                  
                  {/* Working Hours */}
                  <div className="border-t border-rule pt-3.5">
                    <span className="block font-mono text-[10px] tracking-[0.14em] uppercase text-stone-light mb-1.5">
                      {dict.common.workHoursLabel}
                    </span>
                    <span className="text-[13.5px] font-normal text-ink block mt-1.5">
                      {dict.common.workHoursValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Embedded Map */}
              <div className="h-[300px] border border-rule border-t-[3px] border-t-pine">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110594.39455122175!2d30.730303102377227!3d29.977259695663737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458564c7dcbe185%3A0xe54e60cf0b621fe8!2sCPC%20Industrial%20Complex!5e0!3m2!1sen!2seg!4v1700000000000!5m2!1sen!2seg"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Location - El Waha Pumps"
                />
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
