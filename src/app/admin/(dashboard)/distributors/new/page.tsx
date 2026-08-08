import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/admin/ui";
import DistributorForm from "@/components/admin/DistributorForm";

export const metadata = { title: "New distributor" };
export const dynamic = "force-dynamic";

export default async function NewDistributorPage() {
  await requireUser();

  return (
    <>
      <Link
        href="/admin/distributors"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to distributors
      </Link>

      <PageHeader
        title="New distributor"
        subtitle="They appear on the map and in the list as soon as you save, unless you untick the visibility box."
      />

      <Card className="max-w-4xl">
        <DistributorForm />
      </Card>
    </>
  );
}
