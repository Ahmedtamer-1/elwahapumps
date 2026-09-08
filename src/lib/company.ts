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
export const QUALITY_STANDARD = "ISO 9001";

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
