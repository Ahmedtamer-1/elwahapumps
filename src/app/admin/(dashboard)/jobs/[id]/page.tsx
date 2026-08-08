import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, SubmitButton } from "@/components/admin/ui";
import JobForm, { type JobFormValues } from "@/components/admin/JobForm";
import { deleteJob } from "@/lib/actions/jobs";

export const metadata = { title: "Edit job" };
export const dynamic = "force-dynamic";

/** Unpack the paired bullets back into the two textareas that produced them. */
function splitRequirements(raw: string): { en: string; ar: string } {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { en: "", ar: "" };
    return {
      en: parsed.map((r) => (typeof r?.en === "string" ? r.en : "")).join("\n"),
      ar: parsed.map((r) => (typeof r?.ar === "string" ? r.ar : "")).join("\n"),
    };
  } catch {
    return { en: "", ar: "" };
  }
}

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();

  const requirements = splitRequirements(job.requirements);

  const values: JobFormValues = {
    id: job.id,
    titleEn: job.titleEn,
    titleAr: job.titleAr,
    departmentEn: job.departmentEn,
    departmentAr: job.departmentAr,
    typeEn: job.typeEn,
    typeAr: job.typeAr,
    locationEn: job.locationEn,
    locationAr: job.locationAr,
    descEn: job.descEn,
    descAr: job.descAr,
    requirementsEn: requirements.en,
    requirementsAr: requirements.ar,
    postedOn: job.postedOn.toISOString().slice(0, 10),
    sortOrder: String(job.sortOrder),
    isActive: job.isActive,
  };

  return (
    <>
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to jobs
      </Link>

      <PageHeader
        title={job.titleEn}
        subtitle={`${job.departmentEn} · ${job.locationEn}`}
        action={
          <Link
            href="/ar/careers#positions"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
          >
            View careers page
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="max-w-4xl space-y-6">
        <Card>
          <JobForm job={values} />
        </Card>

        <Card title="Danger zone">
          <form action={deleteJob}>
            <input type="hidden" name="id" value={job.id} />
            <p className="text-xs text-neutral-500 mb-3">
              Deleting removes the advert permanently. To close the vacancy but keep the text for
              next time, untick &ldquo;Published on the careers page&rdquo; instead.
            </p>
            <SubmitButton type="submit" variant="danger">
              Delete job
            </SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
