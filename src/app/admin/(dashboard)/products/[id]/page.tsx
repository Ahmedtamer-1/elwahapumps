import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card, PageHeader, SubmitButton } from "@/components/admin/ui";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import VariantPriceTable, { type AdminVariantRow } from "@/components/admin/VariantPriceTable";
import { deleteProduct } from "@/lib/actions/products";

export const metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { slug: true } },
        options: {
          orderBy: { sortOrder: "asc" },
          select: { key: true, values: { select: { value: true, labelEn: true } } },
        },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" }, select: { slug: true, nameEn: true } }),
  ]);

  if (!product) notFound();

  // Turn each variant's stored `{option: value}` map into the same human label the
  // public selector shows, so the admin recognises the row they are pricing.
  const labelFor = new Map(
    product.options.map((o) => [
      o.key,
      new Map(o.values.map((v) => [v.value, v.labelEn])),
    ]),
  );

  const variantRows: AdminVariantRow[] = product.variants.map((v) => {
    const selections = parseJson<Record<string, string>>(v.selections, {});
    const specs = parseJson<Record<string, string>>(v.specs, {});
    return {
      id: v.id,
      label:
        product.options
          .map((o) => labelFor.get(o.key)?.get(selections[o.key] ?? "") ?? selections[o.key])
          .filter(Boolean)
          .join(" · ") || "—",
      specs: Object.values(specs).join(" · "),
      price: v.price,
      currency: v.currency,
      isActive: v.isActive,
    };
  });

  const specsBlob = parseJson<{ specs?: string[] }>(product.specs, {});

  const values: ProductFormValues = {
    id: product.id,
    slug: product.slug,
    categorySlug: product.category.slug,
    nameEn: product.nameEn,
    nameAr: product.nameAr,
    descEn: product.descEn ?? "",
    descAr: product.descAr ?? "",
    sku: product.sku ?? "",
    currency: product.currency,
    price: product.price === null ? "" : String(product.price),
    stock: product.stock === null ? "" : String(product.stock),
    images: parseJson<string[]>(product.images, []).join("\n"),
    specChips: (specsBlob.specs ?? []).join("\n"),
    isActive: product.isActive,
  };

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone hover:text-pine mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to products
      </Link>

      <PageHeader
        title={product.nameEn}
        subtitle={product.category.slug}
        action={
          <Link
            href={`/en/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
          >
            View on site
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="max-w-4xl space-y-6">
        <Card>
          <ProductForm categories={categories} product={values} />
        </Card>

        {variantRows.length > 0 && (
          <Card
            title={`Prices — ${variantRows.length} variants`}
            subtitle="Imported from the price sheet. Edit here when the market moves; changes go live immediately."
          >
            <VariantPriceTable
              productId={product.id}
              variants={variantRows}
              currency={product.currency}
            />
          </Card>
        )}

        <Card title="Danger zone">
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <p className="text-xs text-stone mb-3">
              Deleting removes the product and its public page permanently. To take it offline
              temporarily, uncheck &ldquo;Visible on the public website&rdquo; instead.
            </p>
            <SubmitButton type="submit" variant="danger">
              Delete product
            </SubmitButton>
          </form>
        </Card>
      </div>
    </>
  );
}
