import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, SubmitButton } from "@/components/admin/ui";
import DistributorForm, {
  type DistributorFormValues,
} from "@/components/admin/DistributorForm";
import { deleteDistributor } from "@/lib/actions/distributors";

export const metadata = { title: "Edit distributor" };
export const dynamic = "force-dynamic";

export default async function EditDistributorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const distributor = await prisma.distributor.findUnique({ where: { id } });
  if (!distributor) notFound();

  const values: DistributorFormValues = {
    id: distributor.id,
    nameAr: distributor.nameAr,
    nameEn: distributor.nameEn,
    phone: distributor.phone,
    cityAr: distributor.cityAr,
    cityEn: distributor.cityEn,
    region: distributor.region,
    lat: String(distributor.lat),
    lng: String(distributor.lng),
    mapUrl: distributor.mapUrl ?? "",
    sortOrder: String(distributor.sortOrder),
    isActive: distributor.isActive,
  };

  return (
    <>
      <Link
        href="/admin/distributors"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone hover:text-pine mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to distributors
      </Link>

      <PageHeader
        title={distributor.nameEn}
        subtitle={`${distributor.cityEn} · ${distributor.phone}`}
        action={
          // Checking the pin is the one thing you cannot do from the form.
          <Link
            href={`https://www.google.com/maps/search/?api=1&query=${distributor.lat},${distributor.lng}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
          >
            Check this pin on Google Maps
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="max-w-4xl space-y-6">
        <Card>
          <DistributorForm distributor={values} />
        </Card>

        <Card title="Danger zone">
          <form action={deleteDistributor}>
            <input type="hidden" name="id" value={distributor.id} />
            <p className="text-xs text-stone mb-3">
              Deleting removes the distributor permanently. To take them off the map while you
              confirm their details, untick &ldquo;Shown on the public locations page&rdquo;
              instead.
            </p>
            <SubmitButton type="submit" variant="danger">
              Delete distributor
            </SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
