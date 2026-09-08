import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/admin/ui";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireUser();
  const categories = await prisma.category.findMany({
    orderBy: { nameEn: "asc" },
    select: { slug: true, nameEn: true },
  });

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone hover:text-pine mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>

      <PageHeader title="New product" />

      <Card className="max-w-4xl">
        <ProductForm categories={categories} />
      </Card>
    </>
  );
}
