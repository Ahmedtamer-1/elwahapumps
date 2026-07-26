import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

interface FooterProps {
  lang: string;
  dict: any;
}

export default function Footer({ lang, dict }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-neutral-600 border-t border-neutral-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Brief & Socials */}
          <div>
            <Link href={`/${lang}`} className="block mb-6">
              <Image
                src="/images/brand/elwaha-logo-h.png"
                alt={lang === "ar" ? "شعار شركة الواحة لخدمات الآبار والطلمبات" : "El Waha for Well & Pump Services logo"}
                width={609}
                height={183}
                className="h-14 w-auto"
              />
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              {lang === "ar"
                ? "شركة رائدة في مجال الآبار وأنظمة الضخ بمصر. خبرة تفوق 20 عاماً في توريد وصيانة الطلمبات الغاطسة ومولدات التحكم ومغيرات السرعة."
                : "A leading company in water wells and pumping systems in Egypt. 20+ years of experience in supply & maintenance of submersible pumps, controllers, and VFDs."}
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com/elwahapumps"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 hover:bg-emerald-600 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@elwahapumps"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
                aria-label="YouTube"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96C5.12 19 12 19 12 19s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z" />
                  <polygon points="9.75 15.02 15.5 11.54 9.75 8.07 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-6 border-s-2 border-emerald-500 ps-3">
              {lang === "ar" ? "روابط سريعة" : "Quick Links"}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href={`/${lang}`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/products`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.nav.products}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/agents`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.nav.agents}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Quick List */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-6 border-s-2 border-emerald-500 ps-3">
              {dict.nav.services}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href={`/${lang}/services/pump-supply`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.servicesData["pump-supply"].title}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/services/panel-design`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.servicesData["panel-design"].title}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/services/inverter-supply`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.servicesData["inverter-supply"].title}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/services/pump-maintenance`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.servicesData["pump-maintenance"].title}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/services/motor-maintenance`} className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  {dict.servicesData["motor-maintenance"].title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-6 border-s-2 border-emerald-500 ps-3">
              {dict.contactPage.infoTitle}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">{dict.common.addressValue}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex flex-col gap-0.5 text-sm">
                  <a href="tel:+201066685532" className="text-neutral-600 hover:text-emerald-600 transition-colors">
                    +20 106 668 5532
                  </a>
                  <a href="tel:+201068155336" className="text-neutral-600 hover:text-emerald-600 transition-colors">
                    +20 106 815 5336
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <a href="mailto:info@lwahapumps.com" className="text-sm text-neutral-600 hover:text-emerald-600 transition-colors">
                  info@lwahapumps.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm">{dict.common.workHoursValue}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <p className="text-xs text-neutral-500">
            &copy; {currentYear} {dict.common.allRightsReserved}.
          </p>
          <div className="flex gap-6 text-xs text-neutral-500">
            {lang === "ar" ? (
              <>
                <Link href="/ar" className="hover:text-emerald-600 transition-colors">العربية</Link>
                <Link href="/en" className="hover:text-emerald-600 transition-colors">English</Link>
              </>
            ) : (
              <>
                <Link href="/ar" className="hover:text-emerald-600 transition-colors">Arabic</Link>
                <Link href="/en" className="hover:text-emerald-600 transition-colors">English</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
