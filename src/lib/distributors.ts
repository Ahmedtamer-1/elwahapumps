import { prisma } from "@/lib/prisma";
import {
  REGIONS,
  mapsSearch,
  type Distributor,
  type Region,
} from "@/data/distributors";

/**
 * Distributors, as the public locations page consumes them.
 *
 * The database stores lat/lng as two columns and the region as a plain
 * string; this module is the one place that becomes the `[lng, lat]` tuple
 * MapLibre expects and a narrowed `Region`, so no component has to know the
 * storage shape.
 */

/** A row whose region no longer matches the known set falls back rather than
 *  disappearing — a typo in the admin should not silently drop a stockist. */
function toRegion(value: string): Region {
  return (REGIONS as readonly string[]).includes(value)
    ? (value as Region)
    : "greater-cairo";
}

type DistributorRow = {
  id: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  cityAr: string;
  cityEn: string;
  region: string;
  lat: number;
  lng: number;
  mapUrl: string | null;
};

function toView(row: DistributorRow): Distributor {
  return {
    id: row.id,
    name: { ar: row.nameAr, en: row.nameEn },
    phone: row.phone,
    city: { ar: row.cityAr, en: row.cityEn },
    region: toRegion(row.region),
    // MapLibre takes [longitude, latitude]; Google quotes them the other way
    // round, which is the single easiest thing to get wrong here.
    coords: [row.lng, row.lat],
    // Fall back to a search by city name, the same form the company's own
    // spreadsheet used, so a row saved without a link still points somewhere.
    mapUrl: row.mapUrl || mapsSearch(`${row.cityAr}, Egypt`),
  };
}

/**
 * Live distributors for the public page, in display order.
 *
 * Returns an empty array when nothing is published — the page then shows its
 * head-office panel alone rather than an empty map beside an empty list.
 */
export async function getPublishedDistributors(): Promise<Distributor[]> {
  const rows = await prisma.distributor.findMany({
    where: { isActive: true },
    orderBy: [{ region: "asc" }, { sortOrder: "asc" }, { nameEn: "asc" }],
  });

  return rows.map(toView);
}
