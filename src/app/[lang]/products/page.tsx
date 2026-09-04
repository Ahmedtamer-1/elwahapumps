import React from "react";
import { getDictionary, Locale } from "../dictionaries";
import { getCatalogProducts } from "@/lib/products";
import ProductTabs from "@/components/ProductTabs";
import Link from "next/link";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function ProductsPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const products = await getCatalogProducts(lang);

  return (
    <div className="bg-bone min-h-screen">
      <section className="bg-pine pt-8 pb-7 md:pt-32 md:pb-14 border-t border-bone/15">
        <div className="w-[95%] max-w-[1152px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-14">
          <div>
            <div className="font-mono font-medium text-[10px] md:text-[11px] leading-4 tracking-[0.16em] uppercase text-brass">
              {lang === "ar" ? "الكتالوج" : "Catalogue"}
            </div>
            <h1 className="mt-2.5 md:mt-3.5 font-extrabold text-[30px] leading-[33px] md:text-[46px] md:leading-[48px] tracking-[-0.03em] md:tracking-[-0.035em] text-bone">
              {dict.productsPage.title}
            </h1>
            <div className="h-[3px] w-[52px] md:w-16 bg-brass my-4 md:my-5" aria-hidden="true" />
            <p className="m-0 font-normal text-[13.5px] leading-[22px] md:text-[14.5px] md:leading-[25px] text-bone/75 max-w-[60ch]">
              {lang === "ar"
                ? "نوفر مجموعة واسعة من المعدات والآلات الصناعية الموثوقة وعالية الجودة لقطاعات الزراعة والمياه والبناء."
                : "We provide a wide range of high-quality, reliable industrial equipment and machinery for agriculture, water, and construction sectors."}
            </p>
          </div>

          <div className="shrink-0 md:border md:border-bone/25 md:p-5 w-full md:w-auto md:min-w-[250px]">
            <div className="hidden md:block font-mono font-medium text-[10.5px] tracking-[0.16em] uppercase text-bone/55">
              {lang === "ar" ? "لست متأكداً من المضخة؟" : "Not sure which pump?"}
            </div>
            <div className="hidden md:block mt-2.5 font-semibold text-[15px] leading-[22px] text-bone">
              {lang === "ar" ? "حدد الحجم حسب نقطة التشغيل" : "Size it by duty point"}
            </div>
            <Link
              href={`/${lang}/selector`}
              className="mt-5 md:mt-4 block bg-brass text-ink font-semibold text-[13px] md:text-[12.5px] p-[15px] md:p-3 text-center hover:bg-white transition-colors"
            >
              {lang === "ar" ? "افتح محدد المضخات" : "Open the pump selector"}
            </Link>
          </div>
        </div>
      </section>

      <ProductTabs lang={lang} dict={dict} products={products} isTeaser={false} />
    </div>
  );
}
