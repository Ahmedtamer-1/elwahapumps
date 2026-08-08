/**
 * Company facts that copy is derived from, in one place.
 *
 * The site claimed "over 20 years" for six years after it stopped being
 * true (Brand Report §1.1) — a 26-year record is the strongest thing the
 * company owns and it was being understated. Deriving the number from the
 * founding year means it can never go stale again, so nobody has to
 * remember to update it.
 */
export const FOUNDED = 2000;

/** Whole years of trading, as of now. */
export function yearsOfService(now: Date = new Date()): number {
  return now.getFullYear() - FOUNDED;
}

/**
 * Exclusive Egyptian agencies (§1.1). Six manufacturers, named — the
 * report is explicit that naming them beats "leading global brands",
 * because a competitor without the agencies cannot copy the list.
 */
export const AGENCIES = ["Astral Pipes", "Alka", "PMC", "JEE Pumps", "Kinee", "Kurlar"] as const;
