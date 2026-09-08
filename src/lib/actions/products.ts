"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AGENCIES } from "@/lib/company";

const BRAND_NAMES = AGENCIES.map((a) => a.name) as string[];

/** Empty string -> undefined, so blank form fields don't become "" in the DB. */
const optionalText = z
  .string()
  .trim()
  .max(4000)
  .optional()
  .transform((v) => (v ? v : undefined));

const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
  categorySlug: z.string().trim().min(1),
  nameEn: z.string().trim().min(1, "English name is required").max(200),
  nameAr: z.string().trim().min(1, "Arabic name is required").max(200),
  descEn: optionalText,
  descAr: optionalText,
  sku: z.string().trim().max(80).optional().transform((v) => (v ? v : undefined)),
  // Blank is legitimate — El Waha build some items themselves — but anything
  // else must be one of the twelve agencies. Free text here is how the brand
  // filter fills up with model codes again.
  brand: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine(
      (v) => v === undefined || BRAND_NAMES.includes(v),
      "Brand must be one of the agencies listed in lib/company.ts, or left blank",
    ),
  currency: z.string().trim().min(1).max(8),
  price: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Price must be a positive number"),
  stock: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine(
      (v) => v === null || (Number.isInteger(v) && v >= 0),
      "Stock must be a whole number",
    ),
  images: z.string().trim().max(4000).optional(),
  specChips: z.string().trim().max(1000).optional(),
  isActive: z.string().optional(),
});

export interface ProductFormState {
  error?: string;
}

/**
 * Push a catalogue change out to the public site straight away. The `[lang]`
 * layout also carries `revalidate = 60`, so even if a path is missed here the
 * site self-corrects within a minute rather than serving a stale price forever.
 */
function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/[lang]", "layout");
}

/** One value per line, blanks dropped. */
function splitLines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");

  const parsed = productSchema.safeParse({
    slug: formData.get("slug"),
    categorySlug: formData.get("categorySlug"),
    nameEn: formData.get("nameEn"),
    nameAr: formData.get("nameAr"),
    descEn: formData.get("descEn"),
    descAr: formData.get("descAr"),
    sku: formData.get("sku"),
    brand: formData.get("brand"),
    currency: formData.get("currency"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    images: formData.get("images"),
    specChips: formData.get("specChips"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;

  const category = await prisma.category.findUnique({ where: { slug: d.categorySlug } });
  if (!category) return { error: "Unknown category" };

  // Another product already owns this slug (slugs are the public URL).
  const clash = await prisma.product.findUnique({ where: { slug: d.slug } });
  if (clash && clash.id !== id) {
    return { error: `Slug "${d.slug}" is already used by another product` };
  }

  const images = splitLines(d.images);
  const specChips = splitLines(d.specChips);

  // Preserve the rich spec payload (variants, model tables, features) that the
  // seed imported — the admin form only edits the summary chips.
  const existing = id ? await prisma.product.findUnique({ where: { id } }) : null;
  let specsBlob: Record<string, unknown> = {};
  if (existing) {
    try {
      specsBlob = JSON.parse(existing.specs) as Record<string, unknown>;
    } catch {
      specsBlob = {};
    }
  }
  specsBlob.specs = specChips;

  const data = {
    slug: d.slug,
    categoryId: category.id,
    nameEn: d.nameEn,
    nameAr: d.nameAr,
    descEn: d.descEn ?? null,
    descAr: d.descAr ?? null,
    sku: d.sku ?? null,
    brand: d.brand ?? null,
    currency: d.currency,
    price: d.price,
    stock: d.stock,
    images: JSON.stringify(images),
    specs: JSON.stringify(specsBlob),
    isActive: d.isActive === "on",
  };

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({ data });
  }

  revalidateCatalog();
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.product.delete({ where: { id } });

  revalidateCatalog();
  redirect("/admin/products");
}

export async function toggleProductActive(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });

  revalidateCatalog();
}
