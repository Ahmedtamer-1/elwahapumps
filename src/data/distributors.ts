/**
 * Shared distributor vocabulary — the things that are the same for every row.
 *
 * The distributors themselves live in the database and are managed from
 * /admin/distributors; see `lib/distributors.ts` for the read side. This file
 * is client-safe (no Prisma import), so the map and list components can use
 * the labels and link builders without dragging the database client into the
 * browser bundle — the same split as data/categories.ts and lib/products.ts.
 */

export const REGIONS = ["greater-cairo", "upper-egypt", "oases"] as const;

export type Region = (typeof REGIONS)[number];

export const REGION_LABELS: Record<Region, { ar: string; en: string }> = {
  "greater-cairo": { ar: "القاهرة الكبرى والجيزة", en: "Greater Cairo & Giza" },
  "upper-egypt": { ar: "الصعيد", en: "Upper Egypt" },
  oases: { ar: "الوادي الجديد والواحات", en: "New Valley & the Oases" },
};

/** Reading order for the list: nearest the head office first. */
export const REGION_ORDER: Region[] = ["greater-cairo", "upper-egypt", "oases"];

/** A distributor as the public page consumes it. */
export interface Distributor {
  id: string;
  name: string;
  phone: string;
  city: { ar: string; en: string };
  region: Region;
  /** [longitude, latitude] — MapLibre's order, not Google's. */
  coords: [number, number];
  mapUrl: string;
}

/** Google Maps search link by place name, the form the company's sheet uses. */
export function mapsSearch(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Tel/WhatsApp need the international form; the sheet stores the local one. */
export function internationalPhone(phone: string): string {
  return `+20${phone.replace(/^0/, "")}`;
}

export function whatsAppLink(phone: string, lang: string): string {
  const text =
    lang === "ar"
      ? "مرحباً، أود الاستفسار عن طلمبات ومواتير الواحة."
      : "Hello, I would like to ask about El Waha pumps and motors.";
  return `https://wa.me/20${phone.replace(/^0/, "")}?text=${encodeURIComponent(text)}`;
}

/** Distributors grouped by region, in reading order, empty groups dropped. */
export function groupByRegion(distributors: Distributor[]) {
  return REGION_ORDER.map((region) => ({
    region,
    items: distributors.filter((d) => d.region === region),
  })).filter((group) => group.items.length > 0);
}

/** Distinct towns covered — a truer headline figure than counting rows. */
export function coverageTotals(distributors: Distributor[]) {
  return {
    distributors: distributors.length,
    cities: new Set(distributors.map((d) => d.city.ar)).size,
    regions: new Set(distributors.map((d) => d.region)).size,
  };
}
