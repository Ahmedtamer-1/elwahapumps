/**
 * Seeds four draft job adverts into the Job table.
 *
 * Run with:  npx tsx scripts/seed-jobs.ts
 *
 * They go in with `isActive: false`, so they appear in /admin/jobs as Draft
 * and nothing reaches the public careers page until someone reviews each one
 * and ticks "Published". The wording is drafted from the trades El Waha
 * actually runs — the rewinding workshop, the field crews, the panel shop and
 * technical sales — but the titles, locations, requirements and posting dates
 * are guesses and need confirming by whoever hires.
 *
 * Safe to re-run: an advert whose English title already exists is skipped, so
 * this will not duplicate rows or overwrite edits made in the admin.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

interface DraftJob {
  titleEn: string;
  titleAr: string;
  departmentEn: string;
  departmentAr: string;
  typeEn: string;
  typeAr: string;
  locationEn: string;
  locationAr: string;
  descEn: string;
  descAr: string;
  requirements: { en: string; ar: string }[];
  postedOn: string;
  sortOrder: number;
}

const DRAFTS: DraftJob[] = [
  {
    titleEn: "Submersible Motor Rewinding Technician",
    titleAr: "فني لف مواتير غاطسة",
    departmentEn: "Maintenance",
    departmentAr: "الصيانة",
    typeEn: "Full time",
    typeAr: "دوام كامل",
    locationEn: "6th of October workshop",
    locationAr: "مركز صيانة 6 أكتوبر",
    descEn:
      "Rewinding and overhauling submersible motors in our workshop, from stator stripping through winding, testing and reassembly.",
    descAr:
      "لف وعمرة المواتير الغاطسة داخل مركز الصيانة، من فك الستيتور حتى اللف والاختبار وإعادة التجميع.",
    requirements: [
      {
        en: "Industrial secondary school or technical institute, electrical section",
        ar: "دبلوم صنايع أو معهد فني، قسم كهرباء",
      },
      {
        en: "At least 3 years' hands-on experience rewinding submersible motors",
        ar: "خبرة عملية لا تقل عن 3 سنوات في لف المواتير الغاطسة",
      },
      {
        en: "Confident with megger, hi-pot and insulation resistance testing",
        ar: "إجادة استخدام أجهزة قياس العزل والاختبار",
      },
      {
        en: "Precise, methodical and comfortable working to a wiring schedule",
        ar: "دقة وانضباط في العمل والالتزام بجداول اللف",
      },
      { en: "Military service completed or exempt", ar: "موقف التجنيد محدد" },
    ],
    postedOn: "2026-08-03",
    sortOrder: 1,
  },
  {
    titleEn: "Pump Installation & Maintenance Technician (Field)",
    titleAr: "فني تركيب وصيانة طلمبات (ميداني)",
    departmentEn: "Maintenance",
    departmentAr: "الصيانة",
    typeEn: "Full time · travel required",
    typeAr: "دوام كامل · يتطلب السفر",
    locationEn: "Client sites, nationwide",
    locationAr: "مواقع العملاء بالجمهورية",
    descEn:
      "Installing, commissioning and servicing submersible pump sets on wells and pumping stations, as part of a mobile crew on call to clients.",
    descAr:
      "تركيب وتشغيل وصيانة مجموعات الطلمبات الغاطسة في الآبار ومحطات الضخ، ضمن فريق صيانة متنقل تحت طلب العملاء.",
    requirements: [
      {
        en: "Technical diploma, mechanical or electrical section",
        ar: "دبلوم فني، قسم ميكانيكا أو كهرباء",
      },
      {
        en: "Experience installing and pulling submersible pumps in wells",
        ar: "خبرة في تنزيل وتطليع الطلمبات الغاطسة داخل الآبار",
      },
      {
        en: "Able to read a pump curve and a wiring diagram",
        ar: "القدرة على قراءة منحنى الطلمبة والرسم الكهربائي",
      },
      {
        en: "Willing to travel to sites across Egypt and work on call",
        ar: "الاستعداد للسفر للمواقع والعمل تحت الطلب",
      },
      {
        en: "Full commitment to site health and safety rules",
        ar: "الالتزام الكامل بقواعد الصحة والسلامة المهنية",
      },
    ],
    postedOn: "2026-07-29",
    sortOrder: 2,
  },
  {
    titleEn: "Electrical Panel & Control Technician",
    titleAr: "فني لوحات كهرباء وتحكم",
    departmentEn: "Electrical",
    departmentAr: "الكهرباء",
    typeEn: "Full time",
    typeAr: "دوام كامل",
    locationEn: "6th of October workshop",
    locationAr: "مركز صيانة 6 أكتوبر",
    descEn:
      "Building, wiring and commissioning starter and control panels for pump sets, including soft starters and variable frequency drives.",
    descAr:
      "تجميع وتوصيل وتشغيل لوحات البدء والتحكم لمجموعات الطلمبات، شاملة الـ Soft Starter ومغيرات التردد.",
    requirements: [
      {
        en: "Technical diploma or institute, electrical or control section",
        ar: "دبلوم أو معهد فني، قسم كهرباء أو تحكم",
      },
      {
        en: "At least 2 years assembling and wiring control panels",
        ar: "خبرة لا تقل عن سنتين في تجميع وتوصيل لوحات التحكم",
      },
      {
        en: "Able to work from a single-line diagram and panel schedule",
        ar: "القدرة على العمل من الرسم الأحادي وجدول اللوحة",
      },
      {
        en: "Working knowledge of VFDs and motor protection relays",
        ar: "معرفة عملية بمغيرات التردد وريلاي حماية المواتير",
      },
    ],
    postedOn: "2026-07-22",
    sortOrder: 3,
  },
  {
    titleEn: "Technical Sales Engineer",
    titleAr: "مهندس مبيعات فني",
    departmentEn: "Sales",
    departmentAr: "المبيعات",
    typeEn: "Full time",
    typeAr: "دوام كامل",
    locationEn: "6th of October, Giza",
    locationAr: "6 أكتوبر، الجيزة",
    descEn:
      "Sizing pump sets against client duty points, preparing quotations and following enquiries through to a delivered and commissioned installation.",
    descAr:
      "اختيار مجموعات الطلمبات المناسبة لنقاط تشغيل العميل، وإعداد عروض الأسعار ومتابعة الطلب حتى التوريد والتشغيل.",
    requirements: [
      {
        en: "Mechanical or agricultural engineering degree",
        ar: "بكالوريوس هندسة ميكانيكية أو زراعية",
      },
      {
        en: "Able to read pump performance curves and select a duty point",
        ar: "القدرة على قراءة منحنيات الأداء واختيار نقطة التشغيل",
      },
      {
        en: "Experience selling pumps, motors or irrigation equipment is an advantage",
        ar: "خبرة في بيع الطلمبات أو المواتير أو معدات الري تُعد ميزة",
      },
      {
        en: "Good written and spoken English for dealing with manufacturers",
        ar: "إجادة اللغة الإنجليزية للتعامل مع المصنّعين",
      },
      {
        en: "Driving licence and willingness to visit client sites",
        ar: "رخصة قيادة والاستعداد لزيارة مواقع العملاء",
      },
    ],
    postedOn: "2026-07-15",
    sortOrder: 4,
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const draft of DRAFTS) {
    const existing = await prisma.job.findFirst({
      where: { titleEn: draft.titleEn },
      select: { id: true },
    });

    if (existing) {
      console.log(`skipped (already exists): ${draft.titleEn}`);
      skipped++;
      continue;
    }

    await prisma.job.create({
      data: {
        titleEn: draft.titleEn,
        titleAr: draft.titleAr,
        departmentEn: draft.departmentEn,
        departmentAr: draft.departmentAr,
        typeEn: draft.typeEn,
        typeAr: draft.typeAr,
        locationEn: draft.locationEn,
        locationAr: draft.locationAr,
        descEn: draft.descEn,
        descAr: draft.descAr,
        requirements: JSON.stringify(draft.requirements),
        postedOn: new Date(`${draft.postedOn}T00:00:00.000Z`),
        sortOrder: draft.sortOrder,
        // Draft, not live. Review each advert in /admin/jobs, then publish.
        isActive: false,
      },
    });

    console.log(`created draft: ${draft.titleEn}`);
    created++;
  }

  const total = await prisma.job.count();
  const live = await prisma.job.count({ where: { isActive: true } });
  console.log(`\n${created} created, ${skipped} skipped.`);
  console.log(`Jobs in database: ${total} (${live} published, ${total - live} draft).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
