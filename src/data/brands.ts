import { AGENCIES } from "@/lib/company";

/**
 * The manufacturer a catalogue entry comes from.
 *
 * Typed against AGENCIES so a brand can only ever be one of the twelve
 * agencies the company actually holds. A typo or an invented manufacturer
 * fails the type check rather than reaching a filter control.
 */
export type BrandName = (typeof AGENCIES)[number]["name"];

/**
 * Product slug -> manufacturer.
 *
 * Why this exists as a map rather than a field on the fixture: three of the
 * nineteen catalogue rows are not in `src/data/products.ts` at all. Two come
 * from `prisma/add-tormac.ts`, and `elec-winding-wire` exists only in the
 * database, created by an ad-hoc script that predates the fixture. A brand
 * that lived only on the fixture would silently leave those three unbranded —
 * and PMC, whose one product is that database-only row, would vanish from the
 * catalogue's brand filter entirely.
 *
 * Every value below was read from the product's own English copy in the
 * dictionaries or in add-tormac.ts, not inferred from the model code. The
 * model code is what the old filter used, which is why it offered "KP",
 * "8E" and "H07RN8-F" as though they were brands.
 *
 * `null` is a deliberate entry, not a gap: it records a product that has no
 * manufacturer because El Waha builds it themselves.
 */
export const PRODUCT_BRANDS: Record<string, BrandName | null> = {
  // Kurlar — "Genuine Kurlar ..." in each description.
  "pump-submersible": "Kurlar",
  "pump-cast-stainless": "Kurlar",
  "motor-hitemp": "Kurlar",

  // Rovatti — "Italian-built ... from Rovatti Pompe".
  "pump-rovatti": "Rovatti",
  "pump-rovatti-surface": "Rovatti",

  // Panelli.
  "pump-panelli-sx": "Panelli",
  "motor-panelli": "Panelli",

  // Tormac. The two variant-matrix products come from prisma/add-tormac.ts.
  "pump-tormac-surface": "Tormac",
  "pump-tormac-ts": "Tormac",
  "motor-tormac-eco": "Tormac",

  "motor-franklin": "Franklin Electric",
  "elec-inverter": "NOVO",
  "pipe-upvc-column": "Astral Pipes",
  "thrust-bearing-heavy": "Alka",
  "winding-wire-voltson": "Voltson",
  "cable-submersible": "Aristoncavi",
  "cable-flat-untel": "Untel",

  // Database-only row ("PMC Wires"), not present in the fixture.
  "elec-winding-wire": "PMC",

  // Not a represented brand: the description says these are "built up in
  // El Waha's own workshop". Left unbranded rather than labelled with a
  // manufacturer the company does not claim for it.
  "elec-control-panel": null,
};

/**
 * Display order for brand filters, following the order the agencies are
 * listed in company.ts rather than alphabetically, so the sidebar matches
 * the logo wall and the agents page.
 */
export function brandOrder(name: string): number {
  const i = AGENCIES.findIndex((a) => a.name === name);
  return i === -1 ? AGENCIES.length : i;
}
