import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProjectsPage({ params: { lang } }: { params: { lang: string } }) {
  const isAr = lang === 'ar';
  
  const featuredProject = {
    id: "agriculture-new-valley",
    sector: "Agriculture · New Valley",
    sectorAr: "زراعة · الوادي الجديد",
    title: "Fourteen wells equipped for a 4,200 feddan pivot scheme",
    titleAr: "تجهيز 14 بئر لمشروع زراعي بمساحة 4200 فدان",
    description: "Kurlar KSX cast stainless pumps and Franklin Hi-Temp motors, uPVC column pipe, Üntel submersible cable, and inverter panels built in our workshop. Sized well by well against measured yield, and on our maintenance contract since handover.",
    descriptionAr: "طلمبات كورلار استانلس ومواتير فرانكلين حرارية، مواسير uPVC، كابلات أونتيل، ولوحات تشغيل إنفرتر. تم حساب المقاسات لكل بئر بناءً على الإنتاجية، مع عقد صيانة شامل.",
    image: "https://images.unsplash.com/photo-1592982537447-6f23f81e35be?q=80&w=1280&auto=format&fit=crop",
    stats: [
      { label: "Wells", labelAr: "الآبار", value: "14" },
      { label: "Duty point", labelAr: "نقطة التشغيل", value: "160 m³/h · 96 m" },
      { label: "Delivered", labelAr: "التسليم", value: "2024" }
    ]
  };

  const projects = [
    {
      id: "food-industry-nubaria",
      sector: "Food & industry · Nubaria",
      sectorAr: "غذاء وصناعة · النوبارية",
      title: "Process water supply, dairy plant",
      titleAr: "محطة مياه لمصنع ألبان",
      description: "Two boreholes and a booster set, with star-delta panels and voltage stabilizers for an unstable feed.",
      descriptionAr: "بئران ومجموعة تعزيز، مع لوحات تشغيل ستار-دلتا ومثبتات جهد للتيار غير المستقر.",
      image: "https://images.unsplash.com/photo-1621644155100-349ef1dc423a?q=80&w=800&auto=format&fit=crop",
      summary: "2 wells · 2023",
      summaryAr: "بئران · 2023"
    },
    {
      id: "agriculture-minya",
      sector: "Agriculture · Minya",
      sectorAr: "زراعة · المنيا",
      title: "Citrus farm rehabilitation",
      titleAr: "إعادة تأهيل مزرعة موالح",
      description: "Six ageing installations rewound, recalibrated and returned to duty, with SiC thrust bearings for sandy wells.",
      descriptionAr: "صيانة وإعادة لف 6 وحدات قديمة لتعمل بكفاءة مرة أخرى، مع رولمان بلي SiC للآبار الرملية.",
      image: null,
      summary: "6 wells · 2024",
      summaryAr: "6 آبار · 2024"
    },
    {
      id: "water-networks-beheira",
      sector: "Water networks · Beheira",
      sectorAr: "شبكات مياه · البحيرة",
      title: "Village supply station",
      titleAr: "محطة مياه قرية",
      description: "Tormac split case pumps with an inverter panel, holding network pressure through the daily demand curve.",
      descriptionAr: "طلمبات تورماك مع لوحات إنفرتر للحفاظ على ضغط الشبكة طوال اليوم.",
      image: null,
      summary: "1 station · 2025",
      summaryAr: "محطة واحدة · 2025"
    },
    {
      id: "reclamation-toshka",
      sector: "Reclamation · Toshka",
      sectorAr: "استصلاح · توشكى",
      title: "Deep wells on new reclaimed land",
      titleAr: "آبار عميقة في أراضٍ مستصلحة",
      description: "Rovatti radial borehole pumps for high static head, staged over a 400 m column.",
      descriptionAr: "طلمبات روفاتي للأعماق الكبيرة، على مواسير بطول 400 متر.",
      image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=800&auto=format&fit=crop",
      summary: "9 wells · 2023",
      summaryAr: "9 آبار · 2023"
    },
    {
      id: "agriculture-sharkia",
      sector: "Agriculture · Sharkia",
      sectorAr: "زراعة · الشرقية",
      title: "Standard pivot irrigation setup",
      titleAr: "ري محوري قياسي",
      description: "Kurlar pump, Panelli motor, complete supply and installation.",
      descriptionAr: "طلمبة كورلار، موتور بانيللي، توريد وتركيب كامل.",
      image: "https://images.unsplash.com/photo-1592982537447-6f23f81e35be?q=80&w=800&auto=format&fit=crop",
      summary: "4 wells · 2025",
      summaryAr: "4 آبار · 2025"
    }
  ];

  return (
    <main className="min-h-screen pb-12 bg-bone">
      {/* Hero Section */}
      <section className="bg-pine pt-[56px] pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-mono text-[11px] leading-4 tracking-[0.16em] uppercase text-brass">
            {isAr ? "أعمالنا" : "Delivered work"}
          </div>
          <h1 className="mt-3.5 font-extrabold text-[48px] leading-[50px] tracking-tight text-bone max-w-[26ch] text-balance">
            {isAr ? "230 مشروع زراعي، بئر تلو الآخر" : "230 agricultural projects, well by well"}
          </h1>
          <div className="h-[3px] w-16 bg-brass my-[22px]"></div>
          <p className="m-0 font-normal text-[15px] leading-[26px] text-bone/75 max-w-[62ch]">
            {isAr 
              ? "كل تركيب مصمم خصيصاً ليناسب إنتاجية البئر وضغطه. هذه مجموعة من المشاريع التي قام مهندسونا بتوريدها وتركيبها وتوفير صيانتها."
              : "Every installation is sized against the well's own yield and head. These are a selection of the projects our engineers scoped, supplied and now maintain."}
          </p>
          
          <div className="mt-11 grid grid-cols-2 md:grid-cols-4 border-t border-bone/15">
            <div className="py-5 ltr:pr-6 rtl:pl-6">
              <div className="font-extrabold text-[24px] text-brass">230+</div>
              <div className="mt-[6px] font-mono text-[10.5px] tracking-[0.14em] uppercase text-bone/60">
                {isAr ? "مشاريع تم تسليمها" : "Projects delivered"}
              </div>
            </div>
            <div className="py-5 px-6 border-l border-bone/15">
              <div className="font-extrabold text-[24px] text-brass">27</div>
              <div className="mt-[6px] font-mono text-[10.5px] tracking-[0.14em] uppercase text-bone/60">
                {isAr ? "محافظة" : "Governorates"}
              </div>
            </div>
            <div className="py-5 px-6 border-l border-bone/15">
              <div className="font-extrabold text-[24px] text-brass">2013</div>
              <div className="mt-[6px] font-mono text-[10.5px] tracking-[0.14em] uppercase text-bone/60">
                {isAr ? "في السوق منذ" : "In the market since"}
              </div>
            </div>
            <div className="py-5 ltr:pl-6 rtl:pr-6 border-l border-bone/15">
              <div className="font-extrabold text-[24px] text-brass">24 / 7</div>
              <div className="mt-[6px] font-mono text-[10.5px] tracking-[0.14em] uppercase text-bone/60">
                {isAr ? "خدمة ما بعد البيع" : "Aftersales response"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center overflow-x-auto">
          <div className="py-4 ltr:pr-5 rtl:pl-5 font-semibold text-[12.5px] text-pine border-b-[3px] border-pine whitespace-nowrap">
            {isAr ? "جميع القطاعات" : "All sectors"}
          </div>
          <div className="py-4 px-5 font-semibold text-[12.5px] text-stone whitespace-nowrap cursor-pointer hover:text-pine">
            {isAr ? "الزراعة" : "Agriculture"}
          </div>
          <div className="py-4 px-5 font-semibold text-[12.5px] text-stone whitespace-nowrap cursor-pointer hover:text-pine">
            {isAr ? "الغذاء والصناعة" : "Food & industry"}
          </div>
          <div className="py-4 px-5 font-semibold text-[12.5px] text-stone whitespace-nowrap cursor-pointer hover:text-pine">
            {isAr ? "شبكات المياه" : "Water networks"}
          </div>
          <div className="py-4 px-5 font-semibold text-[12.5px] text-stone whitespace-nowrap cursor-pointer hover:text-pine">
            {isAr ? "الاستصلاح" : "Reclamation"}
          </div>
          <div className="ltr:ml-auto rtl:mr-auto font-mono text-[10.5px] tracking-[0.14em] uppercase text-stone-light">
            {isAr ? "عرض 6 من 230" : "Showing 6 of 230"}
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="bg-bone py-11">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Featured Project */}
          <div className="bg-white border border-rule grid grid-cols-1 md:grid-cols-2 mb-6">
            <div className="h-64 md:h-[340px] bg-pine relative">
               <Image src={featuredProject.image} alt={isAr ? featuredProject.titleAr : featuredProject.title} fill className="object-cover" />
            </div>
            <div className="p-11 pb-10 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <span className="bg-pine text-bone font-mono text-[10px] tracking-[0.14em] uppercase py-1.5 px-2.5">
                  {isAr ? "مشروع مميز" : "FEATURED PROJECT"}
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-stone-light">
                  {isAr ? featuredProject.sectorAr : featuredProject.sector}
                </span>
              </div>
              <h2 className="mt-[18px] font-extrabold text-[28px] leading-[34px] tracking-tight text-ink max-w-[24ch]">
                {isAr ? featuredProject.titleAr : featuredProject.title}
              </h2>
              <p className="mt-[14px] font-normal text-[14px] leading-[25px] text-stone max-w-[48ch]">
                {isAr ? featuredProject.descriptionAr : featuredProject.description}
              </p>
              
              <div className="mt-[26px] grid grid-cols-3 border-t border-rule pt-4">
                {featuredProject.stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-stone-light">
                      {isAr ? stat.labelAr : stat.label}
                    </div>
                    <div className="mt-1 font-mono font-semibold text-[15px] text-ink">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white border border-rule flex flex-col">
                <div 
                  className={`h-[190px] ${project.image ? 'bg-pine relative' : 'bg-bone flex items-center justify-center relative'}`}
                  style={!project.image ? { backgroundImage: "repeating-linear-gradient(135deg, rgba(20,20,20,.07) 0 10px, transparent 10px 20px)" } : undefined}
                >
                  {project.image && (
                    <Image src={project.image} alt={isAr ? project.titleAr : project.title} fill className="object-cover" />
                  )}
                  {!project.image && (
                     <span className="relative z-10 font-mono font-medium text-[10.5px] tracking-[0.14em] uppercase text-stone-light px-2 py-1 bg-white/80">
                       {isAr ? "صورة الموقع مطلوبة" : "Site photo needed"}
                     </span>
                  )}
                </div>
                <div className="p-[22px] px-[24px] pb-[24px] flex-grow flex flex-col">
                  <div className="font-mono font-medium text-[10.5px] tracking-[0.14em] uppercase text-stone-light">
                    {isAr ? project.sectorAr : project.sector}
                  </div>
                  <h3 className="mt-2 font-extrabold text-[17px] leading-[23px] text-ink">
                    {isAr ? project.titleAr : project.title}
                  </h3>
                  <p className="mt-2.5 font-normal text-[13px] leading-[21px] text-stone">
                    {isAr ? project.descriptionAr : project.description}
                  </p>
                  
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-rule font-mono text-[11.5px] text-stone-light">
                    <span>{isAr ? project.summaryAr : project.summary}</span>
                    <Link href="#" className="text-pine tracking-[0.14em] uppercase font-medium text-[10.5px] hover:text-brass transition-colors">
                      {isAr ? "دراسة حالة" : "Case study"} <span aria-hidden="true" className="rtl:rotate-180 inline-block">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}
