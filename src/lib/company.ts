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
 * artwork for. The last two are pending artwork — add them here and drop
 * the file in public/images/brand and the logo row picks them up.
 */
export const AGENCY_COUNT = 11;

export const AGENCIES = [
  { name: "Kurlar", logo: "/images/brand/kurlar-logo.png" },
  { name: "Pedrollo", logo: "/images/brand/Pedrollo.jpg" },
  { name: "Astral Pipes", logo: "/images/brand/astral-logo.png" },
  { name: "PMC", logo: "/images/brand/pmc-logo.png" },
  { name: "NOVO", logo: "/images/brand/NOVO.png" },
  { name: "Tormac", logo: "/images/brand/Tormac.png" },
  { name: "Untel", logo: "/images/brand/Untel.png" },
  { name: "Alka", logo: "/images/brand/alka-logo.png" },
  { name: "Voltson", logo: "/images/brand/voltson.png" },
  { name: "Rovatti", logo: "/images/brand/rovatti.jpeg" },
  { name: "Franklin Electric", logo: "/images/brand/franklin.jpeg" },
] as const;
