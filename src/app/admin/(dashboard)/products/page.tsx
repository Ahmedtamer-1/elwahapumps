import React from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader, SubmitButton } from "@/components/admin/ui";
import { formatCurrency } from "@/lib/format";
import { toggleProductActive } from "@/lib/actions/products";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

function firstImage(images: string): string | null {
  try {
    const parsed = JSON.parse(images) as string[];
    return parsed[0] ?? null;
  } catch {
    return null;
  }
}

export default async function ProductsAdminPage() {
  await requireUser();

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { category: { select: { nameEn: true } } },
  });

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="The catalogue behind the public website — prices, stock, and visibility."
        action={
          <Link href="/admin/products/new">
            <SubmitButton type="button">New product</SubmitButton>
          </Link>
        }
      />

      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <EmptyState message="No products yet." />
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-stone uppercase border-b border-rule">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3 hidden md:table-cell">Category</th>
                  <th className="px-5 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-right hidden sm:table-cell">Stock</th>
                  <th className="px-5 py-3">Visible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule-light">
                {products.map((p) => {
                  const img = firstImage(p.images);
                  return (
                    <tr key={p.id} className="hover:bg-bone transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 shrink-0 bg-bone overflow-hidden">
                            {img && (
                              <Image src={img} alt="" fill className="object-contain p-1" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-semibold text-ink hover:text-emerald-700 block truncate"
                            >
                              {p.nameEn}
                            </Link>
                            <p className="text-xs text-stone-light font-mono truncate">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell text-stone">
                        {p.category.nameEn}
                      </td>
                      <td className="px-5 py-3 text-right text-ink font-semibold tabular-nums whitespace-nowrap">
                        {p.price === null ? (
                          <span className="text-stone-light font-normal">On request</span>
                        ) : (
                          formatCurrency(p.price, p.currency)
                        )}
                      </td>
                      <td className="px-5 py-3 text-right hidden sm:table-cell text-stone tabular-nums">
                        {p.stock ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <form action={toggleProductActive}>
                          <input type="hidden" name="id" value={p.id} />
                          <button type="submit" title="Toggle visibility">
                            <Badge
                              label={p.isActive ? "Live" : "Hidden"}
                              className={
                                p.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-bone text-stone border-rule"
                              }
                            />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
