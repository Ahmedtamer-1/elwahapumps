"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { REGIONS } from "@/data/distributors";

/**
 * Distributors, edited from /admin/distributors.
 *
 * Coordinates are the field most likely to be entered wrong, so they are
 * validated against Egypt's actual bounding box rather than just the global
 * -90/-180 range: a pin swapped lat-for-lng lands in the Indian Ocean and
 * would otherwise save happily and simply look broken on the map.
 */

/** Egypt, generously bounded. Catches swapped or mistyped coordinates. */
const EGYPT_BOUNDS = { minLat: 21.5, maxLat: 32.0, minLng: 24.5, maxLng: 37.0 };

const coordinate = (
  label: string,
  min: number,
  max: number,
) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v), `${label} must be a number`)
    .refine(
      (v) => v >= min && v <= max,
      `${label} must be between ${min} and ${max} — that is the range covering Egypt. Check you have not swapped latitude and longitude.`,
    );

const distributorSchema = z.object({
  nameAr: z.string().trim().min(1, "Arabic name is required").max(200),
  nameEn: z.string().trim().min(1, "English name is required").max(200),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    // Egyptian mobiles: 11 digits starting 01. Stored in local form.
    .regex(/^01\d{9}$/, "Phone must be an 11-digit Egyptian mobile, e.g. 01012345678"),
  cityAr: z.string().trim().min(1, "Arabic city is required").max(160),
  cityEn: z.string().trim().min(1, "English city is required").max(160),
  region: z.enum(REGIONS),
  lat: coordinate("Latitude", EGYPT_BOUNDS.minLat, EGYPT_BOUNDS.maxLat),
  lng: coordinate("Longitude", EGYPT_BOUNDS.minLng, EGYPT_BOUNDS.maxLng),
  mapUrl: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine(
      (v) => v === undefined || /^https?:\/\//.test(v),
      "Map link must start with http:// or https://",
    ),
  sortOrder: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : 0))
    .refine((v) => Number.isInteger(v), "Order must be a whole number"),
  isActive: z.string().optional(),
});

export interface DistributorFormState {
  error?: string;
}

/** Push the change out to the public locations page straight away. */
function revalidateLocations() {
  revalidatePath("/admin/distributors");
  revalidatePath("/[lang]/locations", "page");
}

export async function saveDistributor(
  _prev: DistributorFormState,
  formData: FormData,
): Promise<DistributorFormState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");

  const parsed = distributorSchema.safeParse({
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn"),
    phone: formData.get("phone"),
    cityAr: formData.get("cityAr"),
    cityEn: formData.get("cityEn"),
    region: formData.get("region"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    mapUrl: formData.get("mapUrl"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;

  const data = {
    nameAr: d.nameAr,
    nameEn: d.nameEn,
    // Strip anything that is not a digit, so a pasted "0101 234 5678" saves
    // in the same shape the tel: and wa.me links are built from.
    phone: d.phone.replace(/\D/g, ""),
    cityAr: d.cityAr,
    cityEn: d.cityEn,
    region: d.region,
    lat: d.lat,
    lng: d.lng,
    mapUrl: d.mapUrl ?? null,
    sortOrder: d.sortOrder,
    isActive: d.isActive === "on",
  };

  if (id) {
    await prisma.distributor.update({ where: { id }, data });
  } else {
    await prisma.distributor.create({ data });
  }

  revalidateLocations();
  redirect("/admin/distributors");
}

export async function deleteDistributor(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.distributor.delete({ where: { id } });

  revalidateLocations();
  redirect("/admin/distributors");
}

/** Take a distributor off the map, or put them back, without losing the row. */
export async function toggleDistributorActive(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const distributor = await prisma.distributor.findUnique({ where: { id } });
  if (!distributor) return;

  await prisma.distributor.update({
    where: { id },
    data: { isActive: !distributor.isActive },
  });

  revalidateLocations();
}
