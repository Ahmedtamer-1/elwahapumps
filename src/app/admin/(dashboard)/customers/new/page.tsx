import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/admin/ui";
import CustomerForm from "@/components/admin/CustomerForm";

export const metadata = { title: "New customer" };

export default async function NewCustomerPage() {
  await requireUser();

  return (
    <>
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to customers
      </Link>

      <PageHeader title="New customer" />

      <Card className="max-w-3xl">
        <CustomerForm />
      </Card>
    </>
  );
}
