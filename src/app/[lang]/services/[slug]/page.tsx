import React from "react";
import { getDictionary, Locale, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2, Phone, Mail, Wrench, Shield } from "lucide-react";
import { localizedAlternates } from "@/lib/seo";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PHONE_SALES, WHATSAPP_SALES } from "@/lib/company";

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug } = await params;
  if (!hasLocale(lang) || !serviceSlugs.includes(slug)) return {};
  const dict = await getDictionary(lang);
  const service = dict.servicesData[slug as keyof typeof dict.servicesData];
  if (!service) return {};
  return {
    title: service.title,
    description: service.short,
    alternates: localizedAlternates(lang, `/services/${slug}`),
  };
}

export const serviceSlugs = [
  "pump-supply",
  "panel-design",
  "marine-cable-supply",
  "well-pipe-supply",
  "spare-parts-supply",
  "pump-maintenance",
  "motor-maintenance",
  "panel-maintenance",
];

/**
 * Services we have photographs of, keyed by slug. A service with two frames
 * gets them side by side behind the header band; the second is dropped on
 * narrow screens, where half a photograph reads as a mistake. Services with
 * no entry keep the plain pine band.
 */
const SERVICE_PHOTO: Record<
  string,
  {
    srcs: string[];
    alt: { en: string; ar: string };
    position?: string;
    /** "contain" shows the whole frame — for portrait shots that a wide band would crop. */
    fit?: "cover" | "contain";
  }
> = {
  "pump-supply": {
    srcs: ["/images/services/well-site.jpg", "/images/services/pump-crate.jpg"],
    alt: {
      en: "A rig setting a pump on a well site, and a crated Kurlar pump leaving the store",
      ar: "معدات التركيب في موقع البئر، وطلمبة كورلار في صندوقها أثناء الخروج من المخزن",
    },
  },
  "panel-design": {
    srcs: ["/images/services/panel-assembly.jpeg"],
    alt: {
      en: "Control panels being assembled at the El Waha panel shop",
      ar: "تجميع لوحات التحكم داخل مركز صيانة الواحة",
    },
  },
  "marine-cable-supply": {
    srcs: ["/images/services/cable-store.jpg"],
    alt: {
      en: "Submersible cable drums being moved in the El Waha store",
      ar: "بكر الكابلات الغاطسة داخل مخزن الواحة",
    },
  },
  "well-pipe-supply": {
    srcs: ["/images/services/pipe-delivery.jpg"],
    // Portrait frame in a wide band. Cropping it to fill loses the load, so the
    // whole photograph is shown, parked on the side the type does not use.
    fit: "contain",
    position: "ltr:object-right rtl:object-left",
    alt: {
      en: "An El Waha crew loading a delivery of Astral well pipe",
      ar: "فريق الواحة أثناء تحميل شحنة مواسير أعماق من Astral",
    },
  },
  "pump-maintenance": {
    srcs: ["/images/services/pump-strip.jpg", "/images/services/lathe-work.jpg"],
    alt: {
      en: "A submersible pump stripped on the bench, and a worn part being machined on the lathe",
      ar: "فك طلمبة غاطسة على المنضدة، وخرط جزء تالف على المخرطة",
    },
  },
  "motor-maintenance": {
    srcs: ["/images/services/motor-bay.jpg", "/images/services/rewinding-wire.jpg"],
    alt: {
      en: "Motors stripped for rewinding in the El Waha service centre, and winding wire being sized",
      ar: "مواتير تحت إعادة اللف في مركز صيانة الواحة، وقياس سلك اللف قبل التركيب",
    },
  },
  "panel-maintenance": {
    srcs: ["/images/services/panel-service.jpg", "/images/services/panel-wiring.jpg"],
    alt: {
      en: "An El Waha technician working inside a control panel, and contactors being wired on the backplate",
      ar: "فني الواحة أثناء العمل داخل لوحة تحكم، وتوصيل الكونتاكتورات على لوحة التركيب",
    },
  },
  "spare-parts-supply": {
    srcs: ["/images/services/parts-store.jpg", "/images/services/parts-wire.jpg"],
    alt: {
      en: "Thrust bearings and winding wire on the shelves of the El Waha parts store",
      ar: "كراسي التحميل وأسلاك اللف على أرفف مخزن قطع الغيار بالواحة",
    },
  },
};

export async function generateStaticParams() {
  const locales = ["ar", "en"];
  const params: { lang: string; slug: string }[] = [];
  
  for (const lang of locales) {
    for (const slug of serviceSlugs) {
      params.push({ lang, slug });
    }
  }
  
  return params;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { lang, slug } = await params;
  
  if (!serviceSlugs.includes(slug)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const service = dict.servicesData[slug as keyof typeof dict.servicesData];
  
  if (!service) {
    notFound();
  }

  const isSupply = [
    "pump-supply",
    "panel-design",
    "marine-cable-supply",
    "well-pipe-supply",
    "spare-parts-supply",
  ].includes(slug);

  // Features list depending on language
  const features = lang === "ar"
    ? [
        "فحص فني دقيق واختيار المعدات المناسبة للبئر",
        "الالتزام الكامل بالمعايير الهندسية وجودة التنفيذ",
        "قطع غيار ومعدات أصلية من الوكيل الحصري، بضمان المصنع",
        "دعم فني متواصل وصيانة دورية بعد التركيب",
      ]
    : [
        "Precise technical analysis of well requirements",
        "Full compliance with engineering & build quality standards",
        "Genuine parts and equipment from the exclusive agent, with factory warranty",
        "Continuous technical support and ongoing maintenance options",
      ];

  const photo = SERVICE_PHOTO[slug];

  // Filter related services
  const relatedSlugs = serviceSlugs
    .filter((s) => s !== slug && (isSupply ? [
      "pump-supply",
      "panel-design",
      "marine-cable-supply",
      "well-pipe-supply",
      "spare-parts-supply",
    ].includes(s) : [
      "pump-maintenance",
      "motor-maintenance",
      "panel-maintenance",
    ].includes(s)))
    .slice(0, 3);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/*
        Header band. The page is a sales document, so it opens the way the
        printed one does: a brass rule, the service named at display size, the
        one-line summary under it, and a single solid call button — no chip
        repeating the tab the visitor just clicked, and no back link competing
        with the site's own navigation. The photograph, where a service has
        one, sits behind at low opacity under a pine wash.
      */}
      <section className="relative bg-pine text-bone border-b border-field overflow-hidden">
        {photo && (
          <>
            <div className="absolute inset-0 flex">
              {photo.srcs.map((src, idx) => (
                <div
                  key={src}
                  className={`relative flex-1 ${idx > 0 ? "hidden md:block" : ""}`}
                >
                  <Image
                    src={src}
                    alt={idx === 0 ? (lang === "ar" ? photo.alt.ar : photo.alt.en) : ""}
                    fill
                    sizes={photo.srcs.length > 1 ? "(max-width: 768px) 100vw, 50vw" : "100vw"}
                    // Only the first frame is ever visible below `md` — the
                    // second is `hidden md:block` — so only it should be
                    // preloaded. Preloading both meant mobile visitors
                    // fetched an image they'd never see.
                    preload={idx === 0}
                    className={`${photo.fit === "contain" ? "object-contain" : "object-cover"} ${
                      photo.position ?? ""
                    }`}
                  />
                </div>
              ))}
            </div>
            {/*
              Two scrims rather than one flat wash. A photograph dimmed evenly
              to 30% reads as a texture, not a picture — the subject is lost and
              the band may as well be empty. Instead the pine runs opaque behind
              the column of type, where contrast has to hold, and clears away
              across the rest of the frame so the photograph is legible as a
              photograph. The light tint on top only keeps it in brand colour.
            */}
            <div
              aria-hidden
              className="absolute inset-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-pine via-pine/85 to-pine/15"
            />
            <div aria-hidden className="absolute inset-0 bg-pine/20" />
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="mb-6">
              <Breadcrumbs
                lang={lang as Locale}
                dark
                items={[
                  { name: dict.nav.home, path: "/" },
                  { name: dict.nav.services, path: "/services" },
                  { name: service.title, path: `/services/${slug}` },
                ]}
              />
            </div>
            <span aria-hidden className="block h-0.5 w-16 bg-brass mb-6" />
            <h1 className="text-h1 md:text-display font-extrabold">{service.title}</h1>
            {service.short && (
              <p className="mt-5 text-body text-bone/75 leading-relaxed max-w-2xl">
                {service.short}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`tel:${PHONE_SALES}`}
                className="inline-flex items-center gap-2 bg-brass hover:bg-brass/90 text-pine px-6 py-3 text-[13px] font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>{lang === "ar" ? "اتصل الآن" : "Call Now"}</span>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_SALES}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-bone/30 hover:border-brass hover:text-brass text-bone px-6 py-3 text-[13px] font-semibold transition-colors"
              >
                {lang === "ar" ? "تواصل عبر واتساب" : "Message on WhatsApp"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Description & Features */}
          <div className="lg:col-span-8 bg-white p-6 md:p-10 rounded-3xl border border-neutral-200 shadow-xs">
            <h2 className="text-xl font-bold text-neutral-900 mb-6 border-b border-neutral-100 pb-4">
              {lang === "ar" ? "تفاصيل الخدمة الهندسية" : "Engineering Service Details"}
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed mb-8 whitespace-pre-line">
              {service.desc}
            </p>

            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              {lang === "ar" ? "مميزات ومخرجات الخدمة" : "Key Benefits & Deliverables"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feat, idx) => (
                <div key={idx} className="flex gap-3 items-start p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-neutral-700 text-xs font-medium leading-normal">{feat}</span>
                </div>
              ))}
            </div>

            {/* B2B Trust Badge — "Exclusive agent" replaces the earlier
                the earlier unfalsifiable quality-guarantee badge with the real,
                checkable relationship (see /agents). */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/40 text-neutral-700 text-xs">
              <Shield className="w-8 h-8 text-emerald-600 shrink-0" />
              <div className="leading-relaxed">
                <span className="font-bold text-neutral-800 block mb-0.5">
                  {lang === "ar" ? "قطع ومعدات أصلية من الوكيل الحصري" : "Genuine Parts, Exclusive Agent"}
                </span>
                {lang === "ar"
                  ? "جميع المواد والمعدات المستخدمة معتمدة من كبرى العلامات ومطابقة للمواصفات القياسية."
                  : "All equipment and components used are fully certified by major brands and match industry standards."}
              </div>
            </div>
          </div>

          {/* Right Column: CTA Panel & Related Services */}
          <div className="lg:col-span-4 space-y-8">
            {/* Lead capture card */}
            <div className="bg-neutral-950 text-white p-6 md:p-8 rounded-3xl relative overflow-hidden border border-neutral-800 animate-pulse-subtle">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.04),transparent_50%)]" />
              <h3 className="text-xl font-bold mb-4 relative z-10">
                {lang === "ar" ? "هل لديك استفسار؟" : "Have Questions?"}
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed mb-6 relative z-10">
                {lang === "ar"
                  ? "فريقنا الهندسي مستعد لتوفير تفاصيل إضافية وعروض أسعار لخدمة:"
                  : "Our engineering team is ready to provide additional specs and price quotes for:"}
                <strong className="block text-white mt-1 text-sm font-semibold">{service.title}</strong>
              </p>
              <div className="space-y-3 relative z-10">
                <Link
                  href={`/${lang}/contact?subject=${encodeURIComponent(
                    lang === "ar" 
                      ? `طلب تسعير لخدمة ${service.title}` 
                      : `Quote request for ${service.title}`
                  )}`}
                  className="block text-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/10"
                >
                  {dict.common.requestQuote}
                </Link>
                <a
                  href="mailto:info@elwahapumps.com"
                  className="flex items-center justify-center gap-2 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold border border-neutral-800 rounded-xl text-xs transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@elwahapumps.com</span>
                </a>
              </div>
            </div>

            {/* Related Services */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
              <h3 className="text-base font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-2">
                {lang === "ar" ? "خدمات ذات صلة" : "Related Services"}
              </h3>
              <ul className="space-y-3">
                {relatedSlugs.map((relSlug) => {
                  const relService = dict.servicesData[relSlug as keyof typeof dict.servicesData];
                  return (
                    <li key={relSlug}>
                      <Link
                        href={`/${lang}/services/${relSlug}`}
                        className="group block p-3 bg-neutral-50 hover:bg-emerald-50/50 rounded-xl border border-neutral-100 hover:border-emerald-200 transition-all duration-200"
                      >
                        <span className="block text-neutral-800 text-xs font-bold group-hover:text-emerald-600 transition-colors leading-relaxed">
                          {relService?.title}
                        </span>
                        <span className="inline-flex items-center text-[10px] font-semibold text-neutral-400 group-hover:text-emerald-500 mt-1 transition-colors">
                          {lang === "ar" ? "تفاصيل الخدمة" : "Service details"}
                          {lang === "ar" ? <ArrowLeft className="w-3 h-3 ms-1" /> : <ArrowRight className="w-3 h-3 ms-1" />}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
