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

/**
 * The scale figures, in one place for the same reason as the founding date.
 *
 * These were typed literally into the About page's stat row and were about to
 * be typed a second time into the homepage — which is exactly how a site ends
 * up claiming 230 projects on one page and 250 on another. Anything quoted in
 * more than one place belongs here.
 *
 * GOVERNORATES is all 27 of Egypt's: the About copy already claims coverage of
 * every one, so the homepage states the number rather than the adjective.
 */
export const GOVERNORATES = 27;
export const PROJECTS_DELIVERED = "230+";
export const TEAM_SIZE = "80+";
export const FACILITY_AREA = "3,000 m²";
export const RESPONSE_COVER = "24 / 7";

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
 * Head office, from the company's own Google Maps listing (supplied 14 Sep
 * 2026). This replaces the earlier CPC Industrial Complex pin, which sat
 * about 14 km west of the actual premises.
 *
 * Feeds the JSON-LD, the head-office pin on the distributor map, and the map
 * on the contact page — change it here and all three follow.
 */
export const GEO = { latitude: 29.9541766, longitude: 30.8704717 };

/** The Google Maps place itself, for "Directions" links. */
export const HQ_MAP_URL = "https://maps.google.com/?cid=15569346922629761745";

/** Selection id the distributor map and list use for the head-office pin. */
export const HQ_SELECTION_ID = "el-waha-hq";

/** Keyless embed of the same point, for the contact page iframe. */
export function hqMapEmbedUrl(lang: string): string {
  // www.google.com, not maps.google.com: it is the only frame-src the CSP in
  // next.config.ts allows.
  return `https://www.google.com/maps?q=${GEO.latitude},${GEO.longitude}&z=16&hl=${lang === "ar" ? "ar" : "en"}&output=embed`;
}

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

/**
 * The same four profiles with their glyphs (24×24 stroke paths), shared by
 * the footer and the contact page so neither can drift to a shorter list.
 */
export const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: SOCIAL.facebook,
    paths: ["M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"],
  },
  {
    label: "YouTube",
    href: SOCIAL.youtube,
    paths: [
      "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96C5.12 19 12 19 12 19s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z",
      "M9.75 15.02 15.5 11.54 9.75 8.07z",
    ],
  },
  {
    label: "LinkedIn",
    href: SOCIAL.linkedin,
    paths: [
      "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",
      "M6 9H2v12h4z",
      "M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    ],
  },
  {
    label: "Instagram",
    href: SOCIAL.instagram,
    paths: [
      "M16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6z",
      "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",
      "M17.5 6.5h.01",
    ],
  },
] as const;
