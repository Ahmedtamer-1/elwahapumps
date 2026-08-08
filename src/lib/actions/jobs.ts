"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * Job adverts, edited from /admin/jobs.
 *
 * Requirements arrive as two textareas — one English line per bullet, one
 * Arabic line per bullet — and are zipped by index into the JSON array the
 * public page reads. Zipping by line number is what keeps the two languages
 * in step without asking the editor to manage a repeater widget.
 */

const jobSchema = z.object({
  titleEn: z.string().trim().min(1, "English job title is required").max(200),
  titleAr: z.string().trim().min(1, "Arabic job title is required").max(200),
  departmentEn: z.string().trim().min(1, "English department is required").max(120),
  departmentAr: z.string().trim().min(1, "Arabic department is required").max(120),
  typeEn: z.string().trim().min(1, "English employment type is required").max(120),
  typeAr: z.string().trim().min(1, "Arabic employment type is required").max(120),
  locationEn: z.string().trim().min(1, "English location is required").max(160),
  locationAr: z.string().trim().min(1, "Arabic location is required").max(160),
  descEn: z.string().trim().min(1, "English description is required").max(4000),
  descAr: z.string().trim().min(1, "Arabic description is required").max(4000),
  requirementsEn: z.string().max(4000).optional(),
  requirementsAr: z.string().max(4000).optional(),
  postedOn: z
    .string()
    .trim()
    .min(1, "Posting date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Posting date must be a real date"),
  sortOrder: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : 0))
    .refine((v) => Number.isInteger(v), "Order must be a whole number"),
  isActive: z.string().optional(),
});

export interface JobFormState {
  error?: string;
}

/**
 * Push the change to the public careers page immediately. That page carries
 * `revalidate = 3600` for its "posted N days ago" line, which would otherwise
 * hold a new advert back for up to an hour.
 */
function revalidateCareers() {
  revalidatePath("/admin/jobs");
  revalidatePath("/[lang]/careers", "page");
}

/** One value per line, blanks dropped. */
function splitLines(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Pair the two requirement lists by line number.
 *
 * If one language runs longer, the extra bullets are kept with the other side
 * blank rather than silently dropped — losing an editor's typing is worse than
 * showing a half-translated bullet they can see and fix.
 */
function zipRequirements(en: string[], ar: string[]): { en: string; ar: string }[] {
  const rows: { en: string; ar: string }[] = [];
  for (let i = 0; i < Math.max(en.length, ar.length); i++) {
    rows.push({ en: en[i] ?? "", ar: ar[i] ?? "" });
  }
  return rows;
}

export async function saveJob(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");

  const parsed = jobSchema.safeParse({
    titleEn: formData.get("titleEn"),
    titleAr: formData.get("titleAr"),
    departmentEn: formData.get("departmentEn"),
    departmentAr: formData.get("departmentAr"),
    typeEn: formData.get("typeEn"),
    typeAr: formData.get("typeAr"),
    locationEn: formData.get("locationEn"),
    locationAr: formData.get("locationAr"),
    descEn: formData.get("descEn"),
    descAr: formData.get("descAr"),
    requirementsEn: formData.get("requirementsEn"),
    requirementsAr: formData.get("requirementsAr"),
    postedOn: formData.get("postedOn"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;

  // `new Date("2026-02-31")` yields an Invalid Date rather than throwing, which
  // Prisma would then reject with an opaque error. Catch it here instead.
  const postedOn = new Date(`${d.postedOn}T00:00:00.000Z`);
  if (Number.isNaN(postedOn.getTime())) {
    return { error: "Posting date must be a real date" };
  }

  const requirements = zipRequirements(
    splitLines(d.requirementsEn),
    splitLines(d.requirementsAr),
  );

  const data = {
    titleEn: d.titleEn,
    titleAr: d.titleAr,
    departmentEn: d.departmentEn,
    departmentAr: d.departmentAr,
    typeEn: d.typeEn,
    typeAr: d.typeAr,
    locationEn: d.locationEn,
    locationAr: d.locationAr,
    descEn: d.descEn,
    descAr: d.descAr,
    requirements: JSON.stringify(requirements),
    postedOn,
    sortOrder: d.sortOrder,
    isActive: d.isActive === "on",
  };

  if (id) {
    await prisma.job.update({ where: { id }, data });
  } else {
    await prisma.job.create({ data });
  }

  revalidateCareers();
  redirect("/admin/jobs");
}

export async function deleteJob(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.job.delete({ where: { id } });

  revalidateCareers();
  redirect("/admin/jobs");
}

/** Take an advert off the site, or put it back, without losing the text. */
export async function toggleJobActive(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return;

  await prisma.job.update({
    where: { id },
    data: { isActive: !job.isActive },
  });

  revalidateCareers();
}
