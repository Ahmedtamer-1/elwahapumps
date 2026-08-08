import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/admin/ui";
import JobForm from "@/components/admin/JobForm";

export const metadata = { title: "New job" };
export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  await requireUser();

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
        title="New job"
        subtitle="Both languages are required — the careers page is published in Arabic and English."
      />

      <Card className="max-w-4xl">
        <JobForm />
      </Card>
    </>
  );
}
