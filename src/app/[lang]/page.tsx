import { getDictionary, Locale } from "./dictionaries";
import Hero from "@/components/Hero";
import ProductTabs from "@/components/ProductTabs";
import SuccessPartners from "@/components/SuccessPartners";
import { getCatalogProducts } from "@/lib/products";
import { CheckCircle2, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { yearsOfService } from "@/lib/company";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const [dict, products] = await Promise.all([
    getDictionary(lang as Locale),
    getCatalogProducts(lang),
  ]);
  const years = yearsOfService();

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white text-neutral-900">
      {/* 1. Hero Slider */}
      <Hero lang={lang} dict={dict} />

      {/* 2. Two-Column Supply vs Maintenance Highlight Block */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Supply block - White background with green accent top line */}
            <div className="bg-white border-t-4 border-pine border-x border-b border-rule text-ink p-8 md:p-12 flex flex-col justify-between group transition-colors duration-300">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-4">
                  {dict.servicesPage.categories.supply}
                </span>
                <h2 className="text-2xl md:text-3xl font-black mb-6 text-neutral-900">
                  {dict.servicesPage.supplyTitle}
                </h2>
                <p className="text-neutral-600 text-sm leading-relaxed mb-8">
                  {dict.servicesPage.supplyDesc}
                </p>
              </div>
              <Link
                href={`/${lang}/services?tab=supply`}
                className="inline-flex items-center gap-2 text-emerald-600 group-hover:text-emerald-700 font-bold text-sm w-fit"
              >
                <span>{lang === "ar" ? "استعرض خدمات التوريد" : "Explore Supply Services"}</span>
                <span className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  {lang === "ar" ? "←" : "→"}
                </span>
              </Link>
            </div>

            {/* Maintenance block - Black background with green accent top line */}
            <div className="bg-pine border-t-4 border-brass text-bone p-8 md:p-12 flex flex-col justify-between group transition-colors duration-300">
              <div>
                {/* Brass is the accent for eyebrows on pine (§04 Fig. 7). */}
                <span className="spec-label text-brass block mb-4">
                  {dict.servicesPage.categories.maintenance}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-bone">
                  {dict.servicesPage.maintenanceTitle}
                </h2>
                {/* Bone at 75% on pine still clears AA; neutral-400 did not. */}
                <p className="text-bone/75 text-sm leading-relaxed mb-8">
                  {dict.servicesPage.maintenanceDesc}
                </p>
              </div>
              <Link
                href={`/${lang}/services?tab=maintenance`}
                className="inline-flex items-center gap-2 text-emerald-400 group-hover:text-emerald-300 font-bold text-sm w-fit"
              >
                <span>{lang === "ar" ? "استعرض خدمات الصيانة" : "Explore Maintenance Services"}</span>
                <span className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  {lang === "ar" ? "←" : "→"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Products Showcase Section */}
      <section className="py-20 bg-neutral-50 border-y border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-widest">
              {dict.productsPage.title}
            </span>
            <h2 className="text-3xl font-black text-neutral-900 mt-3 mb-4">
              {lang === "ar" ? "أجود أنواع الطلمبات والمحركات" : "Premium Pumps, Motors & Electrical Works"}
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              {dict.productsPage.subtitle}
            </p>
          </div>

          <ProductTabs lang={lang} dict={dict} products={products} isTeaser={true} />
        </div>
      </section>

      {/* 4. Why El Waha Section */}
      <section className="py-20 bg-pine text-bone relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text Pillar */}
            <div className="lg:col-span-5">
              <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest">
                {lang === "ar" ? "لماذا شركة الواحة؟" : "Why El Waha?"}
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mt-3 mb-6">
                {lang === "ar"
                  ? "شريكك الموثوق لتأمين تدفق المياه لعقود طويلة"
                  : "Your trusted partner in securing water flow for decades"}
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                {lang === "ar"
                  ? "نجمع بين الخبرة الطويلة والتوكيلات العالمية الحصرية وقطع الغيار الأصلية لنضمن لعملائنا في القطاع الزراعي والصناعي حلول ضخ مياه مستدامة وبأعلى كفاءة طاقة."
                  : "We combine decades of experience with exclusive global brands and genuine parts to guarantee sustainable pumping solutions and top energy efficiency for agricultural and industrial clients."}
              </p>
              <div className="flex gap-4">
                <Link
                  href={`/${lang}/about`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-600/10"
                >
                  {dict.common.learnMore}
                </Link>
              </div>
            </div>

            {/* Icons Pillars */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pillar 1 */}
              <div className="p-6 bg-field/40 border border-bone/15">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-xl mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {lang === "ar" ? `${years} عاماً من الخبرة` : `${years} Years Experience`}
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {lang === "ar"
                    ? "نفخر بتنفيذ مئات الآبار ومحطات الضخ الناجحة في مختلف الظروف الجيولوجية بمصر."
                    : "Hundreds of successful wells drilled and pumping stations built across Egypt's diverse terrains."}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 bg-field/40 border border-bone/15">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-xl mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {lang === "ar" ? "قطع غيار أصلية" : "Genuine Spare Parts"}
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {lang === "ar"
                    ? "نضمن توريد طلمبات ومحركات ومواسير uPVC أصلية بالكامل ومن الوكيل مباشرة."
                    : "Guaranteed authentic pumps, motors, and uPVC column pipes sourced directly from partner brands."}
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 bg-field/40 border border-bone/15 sm:col-span-2">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-xl mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {lang === "ar" ? "صيانة ودعم متكامل" : "Comprehensive 24/7 Support"}
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {lang === "ar"
                    ? "مراكز صيانة مجهزة بالكامل للف وصيانة المواتير، مع أسطول صيانة متنقل مستعد لدعم بئرك على مدار الساعة."
                    : "State-of-the-art workshops for motor rewinding, paired with a mobile maintenance fleet ready round the clock."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Success Partners Strip — the client roster. */}
      <SuccessPartners lang={lang} />

      {/* 6. Contact CTA Band */}
      <section className="bg-pine text-bone py-16 border-t border-bone/15 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.04),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-start lg:flex items-center justify-between gap-8">
          <div className="mb-8 lg:mb-0 max-w-2xl">
            <h2 className="text-3xl font-black mb-4">
              {lang === "ar"
                ? "هل تحتاج لتجهيز بئرك أو صيانة طلمباتك؟"
                : "Need well preparation or pumps maintenance?"}
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              {lang === "ar"
                ? "تواصل مع المهندسين الآن للحصول على استشارة مجانية وطلب عرض أسعار مخصص لمشروعك."
                : "Get in touch with our engineers today for a free technical consultation and a custom quotation."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 shrink-0">
            <a
              href="tel:+201066685532"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/10"
            >
              <Phone className="w-5 h-5" />
              <span>+20 106 668 5532</span>
            </a>
            <Link
              href={`/${lang}/contact`}
              className="inline-flex items-center justify-center gap-2 text-bone font-semibold border border-bone/30 hover:border-brass hover:text-brass px-6 py-3.5 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>{dict.common.bookNow}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
