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

export const AGENCIES = [
  { name: "Kurlar", logo: "/images/brand/kurlar-mark.webp" },
  { name: "Panelli", logo: "/images/brand/panelli-mark.webp" },
  { name: "Astral Pipes", logo: "/images/brand/astral-mark.webp" },
  { name: "PMC", logo: "/images/brand/pmc-mark.webp" },
  { name: "NOVO", logo: "/images/brand/novo-mark.webp" },
  { name: "Tormac", logo: "/images/brand/tormac-mark.webp" },
  { name: "Untel", logo: "/images/brand/untel-mark.webp" },
  { name: "Alka", logo: "/images/brand/alka-mark.webp" },
  { name: "Voltson", logo: "/images/brand/voltson-mark.webp" },
  { name: "Rovatti", logo: "/images/brand/rovatti-mark.webp" },
  { name: "Franklin Electric", logo: "/images/brand/franklin-mark.webp" },
  { name: "Aristoncavi", logo: "/images/brand/aristoncavi-mark.webp" },
] as const;
