import React from "react";
import { getDictionary, Locale } from "../dictionaries";
import Breadcrumb from "@/components/Breadcrumb";
import { FileText, Download, Phone, Droplets, Settings, Zap, Layers, CircleDot, Cable } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function ProductsPage({ params }: PageProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const productCategories = [
    { id: "pumps", label: dict.productsPage.pumps, icon: Droplets },
    { id: "motors", label: dict.productsPage.motors, icon: Settings },
    { id: "electrical", label: dict.productsPage.electrical, icon: Zap },
    { id: "pipes", label: dict.productsPage.pipes, icon: Layers },
    { id: "thrust-bearings", label: dict.productsPage.thrustBearings, icon: CircleDot },
    { id: "cables", label: dict.productsPage.cables, icon: Cable },
  ];

  const brandsList = [
    { id: "astral-pipes", name: "Astral Pipes", logo: "/images/brand/astral-logo.png" },
    { id: "pmc", name: "PMC", logo: "/images/brand/pmc-logo.png" },
    { id: "kurlar", name: "Kurlar", logo: "/images/brand/kurlar-logo.png" },
    { id: "alka", name: "ALKA Thrust Bearing", logo: "/images/brand/alka-logo.png" },
    { id: "novo", name: "Novo Solar Inverter", logo: "/images/brand/NOVO.png" },
    { id: "tormac", name: "Tormac Pumps", logo: "/images/brand/Tormac.png" },
    { id: "untel", name: "Üntel", logo: "/images/brand/Untel.png" },
  ];

  return (
    <div className="bg-black min-h-screen pb-20">
      {/* Hero Section with Product Categories */}
      <section className="relative pt-32 pb-12 min-h-[50vh] flex flex-col justify-end bg-neutral-950 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop" 
            alt="Industrial Background" 
            className="w-full h-full object-cover opacity-20" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        </div>

        <div className="relative z-10 w-[95%] max-w-[1600px] mx-auto px-4 w-full">
          <div className="mb-16 flex flex-col items-center text-center">
            <Breadcrumb items={[{ label: dict.nav.products }]} lang={lang} />
            <h1 className="text-3xl md:text-5xl font-black text-white mt-4">
              {dict.productsPage.title}
            </h1>
          </div>
          
          {/* Category Placeholder Vectors Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-10 justify-items-center">
            {productCategories.map(cat => (
              <Link href={`/${lang}/products/category/${cat.id}`} key={cat.id} className="flex flex-col items-center group cursor-pointer w-full max-w-[200px]">
                <div className="w-full aspect-square border border-neutral-600/50 group-hover:border-emerald-500 transition-all duration-300 flex items-center justify-center mb-6 relative bg-black/40 backdrop-blur-sm">
                   {/* Placeholder icon until SVG/PNG is provided */}
                   <cat.icon className="w-12 h-12 md:w-16 md:h-16 text-neutral-400 group-hover:text-emerald-400 transition-colors" strokeWidth={1} />
                   <span className="absolute bottom-2 right-2 text-[8px] text-neutral-500 uppercase tracking-widest font-mono">Placeholder</span>
                </div>
                <span className="text-neutral-300 font-medium text-sm md:text-base text-center group-hover:text-white transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Our Brands Section */}
      <section className="bg-neutral-950 py-16 lg:py-24 border-b border-neutral-900">
        <div className="w-[95%] max-w-[1600px] mx-auto px-4 text-center">
          <h2 className="text-xs font-bold text-neutral-500 tracking-widest uppercase mb-16">
            {lang === "ar" ? "العلامات التجارية" : "OUR BRANDS"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 md:gap-12 items-center justify-items-center w-full">
            {brandsList.map(brand => (
              <Link href={`/${lang}/agents/${brand.id}`} key={brand.id} className="relative w-full max-w-[140px] md:max-w-[220px] h-20 md:h-28 opacity-60 hover:opacity-100 transition-all duration-300 cursor-pointer grayscale hover:grayscale-0 brightness-200 hover:brightness-100">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 140px, 220px"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-[95%] max-w-[1600px] mx-auto px-4 mt-12 mb-20">

        {/* B2B Catalog Download Card */}
        <div className="mt-8 text-white py-8 flex flex-col md:flex-row items-center justify-between gap-8 relative border-t border-neutral-900">
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-start">
            <div className="text-emerald-500 p-2">
              <FileText className="w-10 h-10 md:w-12 md:h-12" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                {lang === "ar" 
                  ? "كتالوج المنتجات والمواصفات الفنية الكاملة" 
                  : "Download Our Technical Product Catalog"}
              </h3>
              <p className="text-neutral-400 text-xs md:text-sm max-w-lg leading-relaxed">
                {lang === "ar"
                  ? "احصل على كتالوج شركة الواحة المفصل الذي يحتوي على كافة قياسات وموديلات المواتير، الطلمبات، ولوحات التحكم الكهربائية."
                  : "Get El Waha's detailed catalog featuring all dimensions, ratings, and models for motors, pumps, and control panels."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10 shrink-0 w-full sm:w-auto">
            <Link
              href={`/${lang}/contact?subject=${encodeURIComponent(
                lang === "ar" ? "طلب كتالوج المنتجات" : "Product Catalog Request"
              )}`}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl text-xs transition-colors"
            >
              <Download className="w-4.5 h-4.5" />
              <span>{dict.productsPage.downloadCatalog}</span>
            </Link>
            <a
              href="tel:+201066685532"
              className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-neutral-900 text-white border border-neutral-700 hover:border-neutral-500 font-bold px-8 py-4 rounded-xl text-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{lang === "ar" ? "استفسار هاتفي" : "Phone Inquiry"}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
