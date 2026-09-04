/**
 * Success partners — the clients, not the agencies.
 *
 * Distinct from the manufacturer list in `lib/company.ts` (AGENCIES): those
 * are the brands El Waha represents, these are the farms, packhouses and
 * agri-investment companies El Waha has supplied and maintained.
 *
 * Logos live in `public/images/partners/`, one file per entry. Filenames are
 * ASCII slugs on purpose — several arrived as `download (2).webp` or with an
 * Arabic filename, which makes for fragile image URLs.
 *
 * The whole set was re-cut in one pass: every file is a 669×373 PNG with the
 * background removed and the mark centred, so a single fixed box renders them
 * all at the same optical scale with no per-logo tuning.
 */

export interface SuccessPartner {
  id: string;
  name: { en: string; ar: string };
  logo: string;
}

export const SUCCESS_PARTNERS: SuccessPartner[] = [
  {
    id: "juhayna",
    name: { en: "Juhayna", ar: "جهينة" },
    logo: "/images/partners/juhayna-mark.webp",
  },
  {
    id: "wadi-elnour",
    name: { en: "Wadi ElNour Agricultural Investment & Development", ar: "وادي النور للاستثمار والتنمية الزراعية" },
    logo: "/images/partners/wadi-elnour-mark.webp",
  },
  {
    id: "sharbatly-fruit",
    name: { en: "Sharbatly Fruit", ar: "الشربتلي للفاكهة" },
    logo: "/images/partners/sharbatly-fruit-mark.webp",
  },
  {
    id: "mostakbal-misr",
    name: { en: "Mostakbal Misr for Sustainable Development", ar: "مستقبل مصر للزراعة المستدامة" },
    logo: "/images/partners/mostakbal-misr-mark.webp",
  },
  {
    id: "el-arosa-tea",
    name: { en: "El Arosa Tea", ar: "شاي العروسة" },
    logo: "/images/partners/el-arosa-tea-mark.webp",
  },
  {
    id: "aldahra",
    name: { en: "Al Dahra", ar: "الظاهرة" },
    logo: "/images/partners/aldahra-mark.webp",
  },
  {
    id: "blue-nile",
    name: { en: "Blue Nile — Growers, Packers & Exporters", ar: "بلو نايل للتصدير والتعبئة" },
    logo: "/images/partners/blue-nile-mark.webp",
  },
  {
    id: "linah-farms",
    name: { en: "Linah Farms", ar: "مزارع لينة" },
    logo: "/images/partners/linah-farms-mark.webp",
  },
  {
    id: "mozare3",
    name: { en: "Mozare3 — Farmers' Partner", ar: "مزارع — شريك الفلاح" },
    logo: "/images/partners/mozare3-mark.webp",
  },
  {
    id: "ata-group",
    name: { en: "ATA Group — International Agricultural Fertilizers", ar: "مجموعة عطا — الشركة الدولية للأسمدة الزراعية" },
    logo: "/images/partners/ata-group-mark.webp",
  },
  {
    id: "belco",
    name: { en: "Belco", ar: "بلكو" },
    logo: "/images/partners/belco-mark.webp",
  },
  {
    id: "garden-fresh",
    name: { en: "Garden Fresh", ar: "جاردن فريش" },
    logo: "/images/partners/garden-fresh-mark.webp",
  },
  {
    id: "green-hand",
    name: { en: "Green Hand", ar: "جرين هاند" },
    logo: "/images/partners/green-hand-mark.webp",
  },
  {
    id: "rakha",
    name: { en: "Rakha for Agricultural Investment & Development", ar: "رخاء للاستثمار الزراعي والتنمية" },
    logo: "/images/partners/rakha-mark.webp",
  },
  {
    id: "agricultural-investment-development",
    name: { en: "Agricultural Investment & Development Company", ar: "شركة الاستثمارات والتنمية الزراعية" },
    logo: "/images/partners/agricultural-investment-development-mark.webp",
  },
  {
    id: "jk-agricultural-investment",
    name: { en: "JK for Agricultural Investment", ar: "جي كي للاستثمار الزراعي" },
    logo: "/images/partners/jk-agricultural-investment-mark.webp",
  },
  {
    id: "nana",
    name: { en: "Nana", ar: "نانا" },
    logo: "/images/partners/nana-mark.webp",
  },
  {
    id: "med",
    name: { en: "Mechanical & Electrical Department", ar: "إدارة الميكانيكا والكهرباء" },
    logo: "/images/partners/med-mechanical-electrical-mark.webp",
  },
];
