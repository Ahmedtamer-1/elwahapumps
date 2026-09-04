import { getDictionary, Locale } from "./dictionaries";
import Hero from "@/components/Hero";
import Link from "next/link";
import Image from "next/image";
import { AGENCIES } from "@/lib/company";
import { SUCCESS_PARTNERS } from "@/data/success-partners";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params;
  const [dict] = await Promise.all([
    getDictionary(lang as Locale),
  ]);

  const isAr = lang === "ar";
  
  // Pick the exact 6 success partners requested by the layout
  const partnerIds = ["juhayna", "aldahra", "sharbatly-fruit", "mozare3", "blue-nile", "rakha"];
  const displayPartners = SUCCESS_PARTNERS.filter(p => partnerIds.includes(p.id));

  return (
    <div className="flex flex-col w-full bg-bone text-ink font-sans">
      <Hero lang={lang} dict={dict} />

      {/* 4-Stat Bar (from HTML) */}
      <div className="relative border-t border-bone/15 bg-pine">
        <div className="max-w-7xl mx-auto md:px-8 grid grid-cols-2 md:grid-cols-4">
          <div className="p-4 md:py-6 border-b md:border-b-0 border-bone/15 rtl:border-l rtl:border-r-0 ltr:border-r ltr:md:border-r">
            <div className="font-mono text-[9.5px] md:text-[11px] uppercase tracking-widest text-bone/55">{isAr ? "?? ????? ???" : "In the market since"}</div>
            <div className="mt-1 md:mt-1.5 font-sans font-extrabold text-[20px] md:text-[22px] text-brass">2013</div>
          </div>
          <div className="p-4 md:py-6 md:ltr:pl-8 md:rtl:pr-8 border-b md:border-b-0 border-bone/15 ltr:md:border-r rtl:border-l rtl:border-r-0">
            <div className="font-mono text-[9.5px] md:text-[11px] uppercase tracking-widest text-bone/55">{isAr ? "??????? ?????" : "Exclusive agencies"}</div>
            <div className="mt-1 md:mt-1.5 font-sans font-extrabold text-[20px] md:text-[22px] text-brass">11</div>
          </div>
          <div className="p-4 md:py-6 md:ltr:pl-8 md:rtl:pr-8 border-b md:border-b-0 md:border-b-none border-bone/15 ltr:border-r ltr:md:border-r rtl:border-l rtl:border-r-0">
            <div className="font-mono text-[9.5px] md:text-[11px] uppercase tracking-widest text-bone/55">{isAr ? "????????? ???? ??????" : "Governorates covered"}</div>
            <div className="mt-1 md:mt-1.5 font-sans font-extrabold text-[20px] md:text-[22px] text-brass">27</div>
          </div>
          <div className="p-4 md:py-6 md:ltr:pl-8 md:rtl:pr-8 border-b md:border-b-0 border-bone/15">
            <div className="font-mono text-[9.5px] md:text-[11px] uppercase tracking-widest text-bone/55">{isAr ? "??????" : "Quality"}</div>
            <div className="mt-1 md:mt-1.5 font-sans font-extrabold text-[20px] md:text-[22px] text-brass">ISO 9001</div>
          </div>
        </div>
      </div>

      {/* Supply vs Maintenance block */}
      <div className="bg-white py-9 md:py-[88px] border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-7">
          <div className="border-t-[3px] border-pine border-x border-b border-black/15 px-[22px] py-[24px] md:p-10 md:pb-8 flex flex-col justify-between min-h-[auto] md:min-h-[300px]">
            <div>
              <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-neutral-600">{dict.servicesPage.categories.supply}</div>
              <h2 className="mt-3 md:mt-4 font-sans font-extrabold text-[21px] leading-[26px] md:text-[28px] md:leading-[34px] tracking-tight text-ink">
                {dict.servicesPage.supplyTitle}
              </h2>
              <p className="mt-3 md:mt-4 font-sans text-[13px] leading-[22px] md:text-[14px] md:leading-6 text-neutral-600 max-w-[46ch]">
                {dict.servicesPage.supplyDesc}
              </p>
            </div>
            <div className="mt-8 font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-pine">
              <Link href={`/${lang}/services?tab=supply`} className="hover:text-emerald-700">
                {isAr ? "استعرض خدمات التوريد" : "Explore supply services"} →
              </Link>
            </div>
          </div>
          <div className="bg-pine border-t-[3px] border-brass px-[22px] py-[24px] md:p-10 md:pb-8 flex flex-col justify-between min-h-[auto] md:min-h-[300px]">
            <div>
              <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-brass">{dict.servicesPage.categories.maintenance}</div>
              <h2 className="mt-3 md:mt-4 font-sans font-extrabold text-[21px] leading-[26px] md:text-[28px] md:leading-[34px] tracking-tight text-bone">
                {dict.servicesPage.maintenanceTitle}
              </h2>
              <p className="mt-3 md:mt-4 font-sans text-[13px] leading-[22px] md:text-[14px] md:leading-6 text-bone/75 max-w-[46ch]">
                {dict.servicesPage.maintenanceDesc}
              </p>
            </div>
            <div className="mt-8 font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-brass">
              <Link href={`/${lang}/services?tab=maintenance`} className="hover:text-yellow-500">
                {isAr ? "استعرض خدمات الصيانة" : "Explore maintenance services"} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Products Showcase */}
      <div className="bg-bone border-t border-black/10 py-10 md:py-[84px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-t-[2px] border-pine pt-4 gap-4">
            <div>
              <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-neutral-600">{isAr ? "??? ????????" : "Products Showcase"}</div>
              <h2 className="mt-2.5 md:mt-3 font-sans font-extrabold text-[26px] leading-[30px] md:text-[34px] md:leading-[38px] tracking-tight text-pine">
                {isAr ? "كل ما تحتاجه للآبار الجوفية" : "Everything that goes down the borehole"}
              </h2>
            </div>
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-pine pb-1">
              <Link href={`/${lang}/products`}>{isAr ? "كل المنتجات" : "All products"} →</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-9">
            {/* Submersible Pumps */}
            <div className="bg-white border border-black/15 group flex flex-col">
              <div className="h-[180px] bg-white bg-[url('/images/products/pump-kurlar.webp')] bg-center bg-contain bg-no-repeat border-b border-black/10 group-hover:opacity-90 transition-opacity"></div>
              <div className="p-5 flex-1 relative bg-white">
                <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Pumps · 6" 8" 10"</div>
                <div className="mt-2 font-sans font-extrabold text-[17px] leading-6 text-ink">{dict.productsPage.types.submersiblePumps}</div>
                <div className="mt-1.5 font-sans text-[13px] leading-[21px] text-neutral-600">Kurlar, Panelli, Rovatti — stainless, cast stainless and cast iron.</div>
              </div>
            </div>
            {/* Submersible Motors */}
            <div className="bg-white border border-black/15 group flex flex-col">
              <div className="h-[180px] bg-white bg-[url('/images/products/motor-kurlar.webp')] bg-center bg-contain bg-no-repeat border-b border-black/10 group-hover:opacity-90 transition-opacity"></div>
              <div className="p-5 flex-1 relative bg-white">
                <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Motors · rewindable</div>
                <div className="mt-2 font-sans font-extrabold text-[17px] leading-6 text-ink">{dict.productsPage.types.submersibleMotors}</div>
                <div className="mt-1.5 font-sans text-[13px] leading-[21px] text-neutral-600">Kurlar, Franklin Electric and Panelli, to 75°C ambient.</div>
              </div>
            </div>
            {/* Control Panels */}
            <div className="bg-white border border-black/15 group flex flex-col">
              <div className="h-[180px] bg-white bg-[url('/images/products/panel-star-delta.webp')] bg-center bg-contain bg-no-repeat border-b border-black/10 group-hover:opacity-90 transition-opacity"></div>
              <div className="p-5 flex-1 relative bg-white">
                <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Electrical · VFD / soft start</div>
                <div className="mt-2 font-sans font-extrabold text-[17px] leading-6 text-ink">{dict.productsPage.types.controlPanels}</div>
                <div className="mt-1.5 font-sans text-[13px] leading-[21px] text-neutral-600">{isAr ? "????? ?? ????? ??????? ?????? ?????? ?????? ??????." : "Built in our own workshop, specified against the motor."}</div>
              </div>
            </div>
            {/* Well Pipes */}
            <div className="bg-white border border-black/15 group flex flex-col">
              <div className="h-[180px] bg-white bg-[url('/images/products/pipe-astral.webp')] bg-center bg-contain bg-no-repeat border-b border-black/10 group-hover:opacity-90 transition-opacity"></div>
              <div className="p-5 flex-1 relative bg-white">
                <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Pipes · uPVC column</div>
                <div className="mt-2 font-sans font-extrabold text-[17px] leading-6 text-ink">{dict.productsPage.types.pipes}</div>
                <div className="mt-1.5 font-sans text-[13px] leading-[21px] text-neutral-600">{isAr ? "?????? ????? ?? ??????? ?? ????? ??? ?????." : "Astral lead-free, square-thread, double stud locking."}</div>
              </div>
            </div>
            {/* Submersible Cable */}
            <div className="bg-white border border-black/15 group flex flex-col">
              <div className="h-[180px] bg-white bg-[url('/images/products/cable-untel.webp')] bg-center bg-contain bg-no-repeat border-b border-black/10 group-hover:opacity-90 transition-opacity"></div>
              <div className="p-5 flex-1 relative bg-white">
                <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Cables · 450/750 V</div>
                <div className="mt-2 font-sans font-extrabold text-[17px] leading-6 text-ink">{dict.productsPage.types.cables}</div>
                <div className="mt-1.5 font-sans text-[13px] leading-[21px] text-neutral-600">Ü>{isAr ? "?????? ?????? ?????? ?????? IPX8 ??? 10 ???." : "?ntel flat cable, IPX8 tested to 10 bar."}</div>
              </div>
            </div>
            {/* Spare Parts */}
            <div className="bg-white border border-black/15 group flex flex-col">
              <div className="h-[180px] bg-white bg-[url('/images/products/spares-alka.webp')] bg-center bg-contain bg-no-repeat border-b border-black/10 group-hover:opacity-90 transition-opacity"></div>
              <div className="p-5 flex-1 relative bg-white">
                <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-400">Spare parts · from stock</div>
                <div className="mt-2 font-sans font-extrabold text-[17px] leading-6 text-ink">{dict.productsPage.types.thrustBearings} & Winding Wire</div>
                <div className="mt-1.5 font-sans text-[13px] leading-[21px] text-neutral-600">{isAr ? "????? ????? ALKA SiC? ???? ???? ????? Voltson." : "ALKA SiC thrust bearings, Voltson enamelled copper."}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pump Selector Strip */}
      <div className="bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-0 lg:gap-12">
          <div className="pt-12 pb-6 lg:py-16 ltr:lg:pr-12 rtl:lg:pl-12">
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-brass">Pump selector · 926 builds, 27 Kurlar families</div>
            <h2 className="mt-3 md:mt-4 font-sans font-extrabold text-[28px] leading-[32px] md:text-[40px] md:leading-[44px] tracking-tight text-bone max-w-[22ch]">
              {dict.pumpSelector.title}
            </h2>
            <p className="mt-3 md:mt-4 font-sans text-[14px] leading-[24px] md:text-[15px] md:leading-[26px] text-bone/70 max-w-[52ch]">
              {dict.pumpSelector.subtitle}
            </p>
            <div className="mt-6 font-mono text-[11px] md:text-[12px] leading-5 text-bone/45 max-w-[60ch]">
              {dict.pumpSelector.sourceNote}
            </div>
          </div>
          <div className="bg-bone p-6 md:p-11 self-center mb-12 mt-0 lg:my-12 border-t-[3px] border-brass">
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-neutral-600">{dict.pumpSelector.dutyPoint}</div>
            <div className="mt-5">
              <label className="block font-sans font-semibold text-[12px] text-ink mb-1.5">{dict.pumpSelector.flowLabel}</label>
              <div className="flex border border-black/25 bg-white">
                <div className="flex-1 p-3 font-mono text-[15px] text-ink">60</div>
                <div className="ltr:border-l rtl:border-r border-black/15 p-3 font-mono text-[12px] text-neutral-600 bg-bone flex items-center justify-center min-w-[60px]">{dict.pumpSelector.unitM3h} ▾</div>
              </div>
            </div>
            <div className="mt-4.5">
              <label className="block font-sans font-semibold text-[12px] text-ink mb-1.5">{dict.pumpSelector.headLabel}</label>
              <div className="flex border border-black/25 bg-white">
                <div className="flex-1 p-3 font-mono text-[15px] text-ink">120</div>
                <div className="ltr:border-l rtl:border-r border-black/15 p-3 font-mono text-[12px] text-neutral-600 bg-bone flex items-center justify-center min-w-[60px]">{dict.pumpSelector.unitM} ▾</div>
              </div>
            </div>
            <div className="mt-6 bg-pine text-bone text-center p-4 font-sans font-semibold text-[13.5px] cursor-pointer hover:bg-emerald-950 transition-colors">
              <Link href={`/${lang}/pump-selector`} className="block w-full">{dict.pumpSelector.submit}</Link>
            </div>
            <div className="mt-3.5 font-sans text-[11px] md:text-[11.5px] leading-[18px] text-neutral-600 text-center">
              {dict.pumpSelector.notAdvice}
            </div>
          </div>
        </div>
      </div>

      {/* Why El Waha */}
      <div className="bg-pine py-12 md:py-[84px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16 items-start">
          <div>
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-brass">{isAr ? "????? ???????" : "Why El Waha"}</div>
            <h2 className="mt-3 md:mt-4 font-sans font-extrabold text-[26px] leading-[30px] md:text-[34px] md:leading-[38px] tracking-tight text-bone text-balance">{isAr ? "?? ???? ????? ????????? ???? ?? ????? ??? ??????? ???????." : "No two wells are alike, so nothing is sized from a table."}</h2>
            <p className="mt-3.5 md:mt-4.5 font-sans text-[13.5px] leading-[23px] md:text-[14.5px] md:leading-[25px] text-bone/75 max-w-[44ch]">{isAr ? "???? ???????? ????? ?????? ?? ????? ????? ??? ???? ????? ????? ??????? ??????? ??? ????? ?? ???. ??? ?????? ????? ?? ?????? ???????? ?? ???? ??? ????? ????? ???? ????." : "Our engineers size every installation against the well's own yield and head before anything is supplied. That difference shows up in the electricity bill every month, and in how often the irrigation stops."}</p>
            <div className="mt-6 md:mt-7 inline-block border border-bone/30 text-bone font-sans font-semibold text-[13px] px-6 py-[14px] hover:border-brass hover:text-brass transition-colors cursor-pointer w-full md:w-auto text-center">
              <Link href={`/${lang}/about`} className="block w-full">{isAr ? "?? ??????" : "About the company"}</Link>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="border-t-[2px] border-brass pt-4 ltr:pr-4 md:ltr:pr-7 rtl:pl-4 md:rtl:pl-7 pb-6 md:pb-7">
              <div className="font-sans font-extrabold text-[26px] md:text-[38px] leading-[30px] md:leading-[40px] text-bone">230+</div>
              <div className="mt-1.5 md:mt-2 font-mono text-[9.5px] md:text-[11px] uppercase tracking-widest text-bone/60 leading-[14px] md:leading-[16px]">{isAr ? "????? ????? ?? ??????" : "Agricultural projects delivered"}</div>
            </div>
            <div className="border-t-[2px] border-brass pt-4 ltr:pl-4 md:ltr:pl-7 rtl:pr-4 md:rtl:pr-7 pb-6 md:pb-7">
              <div className="font-sans font-extrabold text-[26px] md:text-[38px] leading-[30px] md:leading-[40px] text-bone">80+</div>
              <div className="mt-1.5 md:mt-2 font-mono text-[9.5px] md:text-[11px] uppercase tracking-widest text-bone/60 leading-[14px] md:leading-[16px]">{isAr ? "????? ????" : "Engineers and technicians"}</div>
            </div>
            <div className="border-t border-bone/20 pt-4 ltr:pr-4 md:ltr:pr-7 rtl:pl-4 md:rtl:pl-7 pb-6 md:pb-7">
              <div className="font-sans font-extrabold text-[26px] md:text-[38px] leading-[30px] md:leading-[40px] text-bone">3,000 m²</div>
              <div className="mt-1.5 md:mt-2 font-mono text-[9.5px] md:text-[11px] uppercase tracking-widest text-bone/60 leading-[14px] md:leading-[16px]">{isAr ? "???? ????? ?????" : "Warehouse and workshop"}</div>
            </div>
            <div className="border-t border-bone/20 pt-4 ltr:pl-4 md:ltr:pl-7 rtl:pr-4 md:rtl:pr-7 pb-6 md:pb-7">
              <div className="font-sans font-extrabold text-[26px] md:text-[38px] leading-[30px] md:leading-[40px] text-bone">24 / 7</div>
              <div className="mt-1.5 md:mt-2 font-mono text-[9.5px] md:text-[11px] uppercase tracking-widest text-bone/60 leading-[14px] md:leading-[16px]">{isAr ? "??????? ??? ???? ???? ?????" : "Response, every day of the year"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusive Egyptian agencies */}
      <div className="bg-white py-16 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-600 text-center">{isAr ? "??????? ????? ?? ???" : "Exclusive Egyptian agencies"}</div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-[1px] bg-black/12 border border-black/12">
            {AGENCIES.slice(0, 12).map((agency, i) => (
              <div key={i} className="bg-white h-[88px] flex items-center justify-center p-4">
                <Image src={agency.logo} alt={agency.name} width={110} height={36} className="max-h-[36px] w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Who we supply */}
      <div className="bg-bone py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">Who we supply</div>
            <div className="font-sans text-[12px] text-neutral-400">A selection of clients across agriculture and industry</div>
          </div>
          <div className="mt-6 flex gap-10 items-center flex-wrap opacity-75">
            {displayPartners.map(partner => (
              <Image key={partner.id} src={partner.logo} alt={partner.name.en} width={120} height={40} className="h-[40px] w-auto object-contain" />
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA Band */}
      <div className="bg-pine border-t border-bone/15 py-12 md:py-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
          <div className="max-w-[620px]">
            <h2 className="m-0 font-sans font-extrabold text-[24px] leading-[30px] md:text-[30px] md:leading-[36px] tracking-tight text-bone">
              {lang === "ar" ? "هل تحتاج لتجهيز بئرك أو صيانة طلمباتك؟" : "Need well preparation or pumps maintenance?"}
            </h2>
            <p className="mt-3.5 font-sans text-[13.5px] md:text-[14px] leading-[24px] text-bone/70">
              {lang === "ar" ? "تواصل مع المهندسين الآن للحصول على استشارة مجانية وطلب عرض أسعار مخصص لمشروعك." : "Get in touch with our engineers today for a free technical consultation and a custom quotation."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 md:gap-3 shrink-0 w-full md:w-auto">
            <a href="tel:+201066685532" className="bg-brass text-ink font-mono font-semibold text-[13.5px] px-[26px] py-4 hover:bg-bone transition-colors text-center w-full md:w-auto">
              +20 106 668 5532
            </a>
            <Link href={`/${lang}/contact`} className="border border-bone/30 text-bone font-sans font-semibold text-[13.5px] px-[26px] py-4 hover:border-brass hover:text-brass transition-colors text-center w-full md:w-auto">
              Send an enquiry
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
