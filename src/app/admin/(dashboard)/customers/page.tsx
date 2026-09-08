import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Card, EmptyState, PageHeader, SubmitButton } from "@/components/admin/ui";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await requireUser();

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true, inquiries: true } } },
    take: 200,
  });

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Companies and contacts El Waha does business with."
        action={
          <Link href="/admin/customers/new">
            <SubmitButton type="button">New customer</SubmitButton>
          </Link>
        }
      />

      <Card className="overflow-hidden">
        {customers.length === 0 ? (
          <EmptyState message="No customers yet. Convert a lead or add one manually." />
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-stone uppercase border-b border-rule">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3 hidden md:table-cell">Company</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Contact</th>
                  <th className="px-5 py-3 text-right">Leads</th>
                  <th className="px-5 py-3 text-right">Inquiries</th>
                  <th className="px-5 py-3 text-right">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule-light">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-bone transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="font-semibold text-ink hover:text-emerald-700"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-stone">
                      {c.company || "—"}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-stone text-xs">
                      {c.phone || c.email || "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-ink tabular-nums">
                      {c._count.leads}
                    </td>
                    <td className="px-5 py-3 text-right text-ink tabular-nums">
                      {c._count.inquiries}
                    </td>
                    <td className="px-5 py-3 text-right text-stone text-xs tabular-nums whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
