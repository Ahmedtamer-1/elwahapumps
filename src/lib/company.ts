/**
 * Company facts that copy is derived from, in one place.
 *
 * One founding date, used everywhere: El Waha began in 2013 as a 200 m²
 * maintenance centre in Giza. The site previously carried a second, earlier
 * date in some places and this one in others, which read as a contradiction
 * to anyone comparing the About page against the footer.
 *
 * Deriving the year count from FOUNDED means it can never go stale, so
 * nobody has to remember to update it.
 */
export const FOUNDED = 2013;

/**
 * The live WordPress site (as of the last audit) publishes
 * info@lwahapumps.com — a domain typo — while every page in this codebase
 * already uses this address. Kept here as the one place notify.ts and any
 * future code reads it from, rather than re-typing the literal.
 */
export const EMAIL = "info@elwahapumps.com";

/** Whole years in the market, as of now. */
export function yearsOfService(now: Date = new Date()): number {
  return now.getFullYear() - FOUNDED;
}

/**
 * Exclusive Egyptian agencies. Naming them beats "leading global brands",
 * because a competitor without the agencies cannot copy the list.
 *
 * AGENCY_COUNT is the true total; AGENCIES holds the ones we have logo
 * artwork for — which, since the marks were re-cut as one set, is all of
 * them. To add another, drop the file in public/images/brand on the same
 * 669x373 transparent canvas as the rest and add the row here.
 */
export const AGENCY_COUNT = 12;

export const AGENCIES = [
  { name: "Kurlar", logo: "/images/brand/kurlar-mark.png" },
  { name: "Panelli", logo: "/images/brand/panelli-mark.png" },
  { name: "Astral Pipes", logo: "/images/brand/astral-mark.png" },
  { name: "PMC", logo: "/images/brand/pmc-mark.png" },
  { name: "NOVO", logo: "/images/brand/novo-mark.png" },
  { name: "Tormac", logo: "/images/brand/tormac-mark.png" },
  { name: "Untel", logo: "/images/brand/untel-mark.png" },
  { name: "Alka", logo: "/images/brand/alka-mark.png" },
  { name: "Voltson", logo: "/images/brand/voltson-mark.png" },
  { name: "Rovatti", logo: "/images/brand/rovatti-mark.png" },
  { name: "Franklin Electric", logo: "/images/brand/franklin-mark.png" },
  { name: "Aristoncavi", logo: "/images/brand/aristoncavi-mark.png" },
] as const;

/**
 * Short brand form, for places a full legal name is too long — the <title>
 * tag template (a 60-character budget shared with the page's own title),
 * og:site_name, and similar. LEGAL_NAME is the registered name, used where
 * precision matters (JSON-LD, the footer copyright line).
 */
export const NAME_EN = "El Waha Pumps";
export const NAME_AR = "الواحة للطلمبات";

/**
 * The registered names, as given by the company (content brief, Part 2).
 *
 * The Arabic was supplied without full orthography — "الواحه ... الابار" — and
 * is recorded here in the standard spelling. Flagged back for confirmation
 * against the commercial register, since this is the legal name and it feeds
 * the legal pages and the structured data.
 */
export const LEGAL_NAME_EN = "El Waha for Wells and Pumps";
export const LEGAL_NAME_AR = "الواحة لخدمات الآبار والطلمبات";

/** Joint-stock company (شركة مساهمة مصرية). For the footer legal line. */
export const ENTITY_FORM_EN = "SAE";
export const ENTITY_FORM_AR = "ش.م.م";

/**
 * Sales/WhatsApp line, then the second support line.
 *
 * These are the only place either number is written down. They used to be
 * hardcoded at 22 call sites across 17 files, and `.env.example` plus the
 * README additionally told operators to set a `WHATSAPP_PHONE` variable
 * that nothing ever read — so changing the number where the deploy
 * documentation said to change it did nothing at all. That variable is
 * gone; the number is a company fact like the address and the legal name,
 * not a deployment setting, and it belongs here beside them.
 */
export const PHONE_SALES = "+201066685532";
export const PHONE_SUPPORT = "+201068155336";

/** wa.me and WhatsApp deep links take the number without the leading "+". */
export const WHATSAPP_SALES = PHONE_SALES.replace("+", "");

/** From src/dictionaries/{ar,en}.json common.addressValue, kept in one place for JSON-LD. */
export const ADDRESS = {
  streetEn: "CPC Industrial Complex, 6th Industrial Zone",
  streetAr: "مجمع سي بي سي الصناعي، المنطقة الصناعية السادسة",
  localityEn: "6th of October City",
  localityAr: "مدينة 6 أكتوبر",
  regionEn: "Giza",
  regionAr: "الجيزة",
  countryCode: "EG",
};

/**
 * From the Google Maps embed already published on the contact page
 * (src/app/[lang]/contact/page.tsx) — reused here rather than re-guessed,
 * not independently re-surveyed against the actual plot.
 */
export const GEO = { latitude: 29.977259695663737, longitude: 30.730303102377227 };

/** Already linked from the footer; reused here for JSON-LD sameAs. */
/**
 * All four confirmed live by the company (content brief, 1.4). LinkedIn and
 * Instagram were not previously listed anywhere on the site.
 *
 * These become `sameAs` in the Organization schema, which is how a search
 * engine or an assistant ties the profiles to this company rather than
 * guessing. A dead URL here is worse than an absent one, so nothing goes in
 * that has not been confirmed.
 */
export const SOCIAL = {
  facebook: "https://facebook.com/elwahapumps",
  youtube: "https://youtube.com/@elwahapumps",
  linkedin: "https://www.linkedin.com/company/el-waha-for-wells-services-and-pumps/",
  instagram: "https://www.instagram.com/elwahapumps1/",
};
