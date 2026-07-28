import React from "react";
import { getDictionary, Locale } from "./dictionaries";
import Hero from "@/components/Hero";
import ServiceCard from "@/components/ServiceCard";
import ProductTabs from "@/components/ProductTabs";
import PartnerLogos from "@/components/PartnerLogos";
import { getCatalogProducts } from "@/lib/products";
import { Award, Clock, Briefcase, CheckCircle2, Phone, Mail, Factory } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const [dict, products] = await Promise.all([
    getDictionary(lang as Locale),
    getCatalogProducts(lang),
  ]);

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white text-neutral-900">
      {/* 1. Hero Slider */}
      <Hero lang={lang} dict={dict} />

      {/* 2. Trust Bar */}
      <section className="bg-neutral-50 border-b border-neutral-100 text-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-start">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row items-center gap-4 px-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">{dict.common.yearsExp}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {lang === "ar" ? "خبرة تفوق عشرين عاماً في السوق المصري" : "Over 20 years of trusted industry service"}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row items-center gap-4 px-4 border-y md:border-y-0 md:border-s border-neutral-200 py-6 md:py-0">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">{dict.common.isoCertified}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {lang === "ar" ? "نلتزم بأعلى معايير الجودة والتصنيع" : "Adhering to high engineering and supply standards"}
                </p>
              </div>
            </div>

            {/* Feature 3 — partner brands */}
            <div className="flex flex-col md:flex-row items-center gap-4 px-4 md:border-s border-neutral-200">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                <Factory className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">
                  {lang === "ar" ? "٨ علامات شريكة" : "8 Partner Brands"}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {lang === "ar" ? "وكلاء معتمدون لكبرى المصانع العالمية" : "Authorized agents for leading global factories"}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col md:flex-row items-center gap-4 px-4 md:border-s border-neutral-200">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-900">{dict.common.support24}</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {lang === "ar" ? "فريق جاهز لخدمتكم وصيانة الطلمبات" : "Quick response support for emergency wells maintenance"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Two-Column Supply vs Maintenance Highlight Block */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Supply block - White background with green accent top line */}
            <div className="bg-white border-t-4 border-emerald-500 border-x border-b border-neutral-200 text-neutral-900 p-8 md:p-12 rounded-3xl shadow-md flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
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
            <div className="bg-neutral-950 border-t-4 border-emerald-500 text-white p-8 md:p-12 rounded-3xl shadow-xl flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 border border-neutral-800">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-4">
                  {dict.servicesPage.categories.maintenance}
                </span>
                <h2 className="text-2xl md:text-3xl font-black mb-6 text-white">
                  {dict.servicesPage.maintenanceTitle}
                </h2>
                <p className="text-neutral-400 text-sm leading-relaxed mb-8">
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

      {/* 4. How It Works (3-Step Guide) */}
      <section className="py-20 bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-widest">
              {lang === "ar" ? "كيف نعمل" : "How It Works"}
            </span>
            <h2 className="text-3xl font-black text-neutral-900 mt-3 mb-4">
              {lang === "ar" ? "ثلاث خطوات لضمان استمرار أعمالك" : "Three steps to ensure your operations never stop"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-neutral-100 -z-10" />

            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto bg-white border border-neutral-100 shadow-md shadow-neutral-100/50 rounded-3xl flex items-center justify-center mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 text-white font-black rounded-full flex items-center justify-center text-sm">1</span>
                <Phone className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{lang === "ar" ? "تواصل معنا" : "Contact Us"}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">
                {lang === "ar" ? "ارسل استفسارك أو طلبك وسنقوم بالرد الفوري من قبل فريق الدعم الفني." : "Send your inquiry and our technical support team will respond immediately."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto bg-white border border-neutral-100 shadow-md shadow-neutral-100/50 rounded-3xl flex items-center justify-center mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 text-white font-black rounded-full flex items-center justify-center text-sm">2</span>
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{lang === "ar" ? "المعاينة والاستشارة" : "Inspection & Consulting"}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">
                {lang === "ar" ? "نقوم بدراسة متطلبات البئر أو المحطة وتقديم الحلول الفنية والمالية الأنسب." : "We study your well or station requirements and provide the optimal technical & financial solution."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto bg-white border border-neutral-100 shadow-md shadow-neutral-100/50 rounded-3xl flex items-center justify-center mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 text-white font-black rounded-full flex items-center justify-center text-sm">3</span>
                <Award className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">{lang === "ar" ? "التنفيذ والضمان" : "Execution & Warranty"}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto">
                {lang === "ar" ? "نبدأ فوراً في أعمال التوريد والتركيب أو الصيانة مع تقديم ضمان معتمد." : "We immediately start supply, installation or maintenance with a certified warranty."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Products Showcase Section */}
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

      {/* 6. Why El Waha Section */}
      <section className="py-20 bg-black text-white relative">
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
              <div className="p-6 bg-neutral-900/40 backdrop-blur-xs rounded-2xl border border-neutral-800">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-xl mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {lang === "ar" ? "خبرة 20+ عاماً" : "20+ Years Experience"}
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {lang === "ar"
                    ? "نفخر بتنفيذ مئات الآبار ومحطات الضخ الناجحة في مختلف الظروف الجيولوجية بمصر."
                    : "Hundreds of successful wells drilled and pumping stations built across Egypt's diverse terrains."}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 bg-neutral-900/40 backdrop-blur-xs rounded-2xl border border-neutral-800">
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
              <div className="p-6 bg-neutral-900/40 backdrop-blur-xs rounded-2xl border border-neutral-800 sm:col-span-2">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-xl mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {lang === "ar" ? "صيانة ودعم متكامل" : "Comprehensive 24/7 Support"}
                </h3>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {lang === "ar"
                    ? "ورش صيانة مجهزة بالكامل للف وصيانة المواتير، مع أسطول صيانة متنقل مستعد لدعم بئرك على مدار الساعة."
                    : "State-of-the-art workshops for motor rewinding, paired with a mobile maintenance fleet ready round the clock."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Partners Strip */}
      <PartnerLogos lang={lang} />

      {/* 8. Contact CTA Band */}
      <section className="bg-black text-white py-16 border-t border-neutral-800 relative overflow-hidden">
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
                ? "تواصل مع مهندسينا الآن للحصول على استشارة مجانية وطلب عرض أسعار مخصص لمشروعك."
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
              className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold border border-neutral-700 px-6 py-3.5 rounded-xl transition-all"
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
