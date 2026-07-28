"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * Variant pricing lives apart from `saveProduct` because it is edited in bulk:
 * a supplier raises a whole series and the admin retypes dozens of figures in one
 * pass. Every action here writes in a single transaction and then republishes the
 * catalogue, so a price change is live on the public site immediately.
 */

export interface VariantPriceState {
  error?: string;
  saved?: number;
}

/** Mirrors revalidateCatalog() in actions/products.ts — same two paths. */
function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/[lang]", "layout");
}

/** Blank clears the price back to "on request"; anything else must be a number ≥ 0. */
const priceField = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v)))
  .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Prices must be zero or more");

/**
 * Recomputes the product's cached price span. Listing pages read priceMin/priceMax
 * rather than aggregating variants per request, so it has to be refreshed on write.
 */
async function refreshPriceRange(productId: string) {
  const agg = await prisma.productVariant.aggregate({
    where: { productId, isActive: true, price: { not: null } },
    _min: { price: true },
    _max: { price: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { priceMin: agg._min.price, priceMax: agg._max.price },
  });
}

/**
 * Saves every changed price on the product page in one submit. Form fields arrive as
 * `price:<variantId>`, so an untouched row simply round-trips its current value.
 */
export async function updateVariantPrices(
  _prev: VariantPriceState,
  formData: FormData,
): Promise<VariantPriceState> {
  await requireUser();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return { error: "Missing product" };

  const existing = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true, price: true },
  });

  const updates: { id: string; price: number | null }[] = [];
  for (const variant of existing) {
    const raw = formData.get(`price:${variant.id}`);
    if (raw === null) continue;

    const parsed = priceField.safeParse(String(raw));
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid price" };
    }
    if (parsed.data !== variant.price) updates.push({ id: variant.id, price: parsed.data });
  }

  if (updates.length === 0) return { saved: 0 };

  await prisma.$transaction(
    updates.map((u) =>
      prisma.productVariant.update({ where: { id: u.id }, data: { price: u.price } }),
    ),
  );

  await refreshPriceRange(productId);
  revalidateCatalog();
  return { saved: updates.length };
}

/**
 * Applies a percentage move to the variants the admin ticked — the common case when a
 * supplier lifts an entire series. Results are rounded to whole pounds; El Waha does
 * not quote piastres.
 */
export async function adjustVariantPrices(
  _prev: VariantPriceState,
  formData: FormData,
): Promise<VariantPriceState> {
  await requireUser();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) return { error: "Missing product" };

  const percent = Number(String(formData.get("percent") ?? "").trim());
  if (!Number.isFinite(percent) || percent === 0) {
    return { error: "Enter a percentage to apply, e.g. 10 or -5" };
  }
  if (percent <= -100) return { error: "That would make prices negative" };

  const ids = formData.getAll("selected").map(String).filter(Boolean);
  if (ids.length === 0) return { error: "Tick the rows you want to adjust" };

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: ids }, productId, price: { not: null } },
    select: { id: true, price: true },
  });
  if (variants.length === 0) return { error: "None of the selected rows has a price yet" };

  await prisma.$transaction(
    variants.map((v) =>
      prisma.productVariant.update({
        where: { id: v.id },
        data: { price: Math.round((v.price as number) * (1 + percent / 100)) },
      }),
    ),
  );

  await refreshPriceRange(productId);
  revalidateCatalog();
  return { saved: variants.length };
}

/** Hides a combination the branch no longer sells, without deleting its price history. */
export async function toggleVariantActive(formData: FormData): Promise<void> {
  await requireUser();

  const id = String(formData.get("variantId") ?? "");
  if (!id) return;

  const variant = await prisma.productVariant.findUnique({
    where: { id },
    select: { isActive: true, productId: true },
  });
  if (!variant) return;

  await prisma.productVariant.update({
    where: { id },
    data: { isActive: !variant.isActive },
  });

  await refreshPriceRange(variant.productId);
  revalidateCatalog();
}
