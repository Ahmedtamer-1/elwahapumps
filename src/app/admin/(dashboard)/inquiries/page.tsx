import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader, SubmitButton, inputClass } from "@/components/admin/ui";
import { INQUIRY_STATUSES, INQUIRY_STATUS_STYLE, type InquiryStatus } from "@/lib/crm";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  convertInquiryToCustomer,
  deleteInquiry,
  updateInquiryStatus,
} from "@/lib/actions/crm";

export const metadata = { title: "Cart inquiries" };
export const dynamic = "force-dynamic";

interface InquiryItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number | null;
}

function parseItems(raw: string): InquiryItem[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InquiryItem[]) : [];
  } catch {
    return [];
  }
}

export default async function InquiriesPage() {
  await requireUser();

  const inquiries = await prisma.cartInquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { id: true, name: true } } },
    take: 200,
  });

  return (
    <>
      <PageHeader
        title="Cart inquiries"
        subtitle="Requests visitors sent to WhatsApp from the website cart."
      />

      {inquiries.length === 0 ? (
        <Card>
          <EmptyState message="No cart inquiries yet. They appear here when a visitor sends their cart via WhatsApp." />
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const items = parseItems(inq.items);
            return (
              <Card key={inq.id}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-ink">
                        {inq.name || "Anonymous visitor"}
                      </h3>
                      <Badge
                        label={inq.status}
                        className={INQUIRY_STATUS_STYLE[inq.status as InquiryStatus]}
                      />
                    </div>
                    <p className="text-xs text-stone">
                      {inq.phone ? (
                        <a href={`tel:${inq.phone}`} className="text-emerald-700 font-semibold hover:underline">
                          {inq.phone}
                        </a>
                      ) : (
                        "No phone provided"
                      )}
                      {" · "}
                      {formatDateTime(inq.createdAt)}
                    </p>
                  </div>

                  <div className="text-end">
                    <p className="text-xs font-bold text-stone uppercase">Estimate</p>
                    <p className="text-lg font-semibold text-ink tabular-nums">
                      {inq.totalEstimate === null ? "On request" : formatCurrency(inq.totalEstimate)}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-rule-light">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-bold text-stone uppercase bg-bone">
                        <th className="px-4 py-2">Item</th>
                        <th className="px-4 py-2 text-right">Qty</th>
                        <th className="px-4 py-2 text-right">Unit price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule-light">
                      {items.map((item, idx) => (
                        <tr key={`${item.productId}-${idx}`}>
                          <td className="px-4 py-2 text-ink">{item.name}</td>
                          <td className="px-4 py-2 text-right tabular-nums text-ink">
                            {item.qty}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums text-ink">
                            {item.unitPrice === null ? "—" : formatCurrency(item.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-end gap-3 mt-4 pt-4 border-t border-rule-light">
                  <form action={updateInquiryStatus} className="flex items-end gap-2">
                    <input type="hidden" name="inquiryId" value={inq.id} />
                    <select
                      name="status"
                      defaultValue={inq.status}
                      className={`${inputClass} w-auto`}
                    >
                      {INQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <SubmitButton type="submit" variant="ghost">
                      Update
                    </SubmitButton>
                  </form>

                  {inq.customer ? (
                    <Link
                      href={`/admin/customers/${inq.customer.id}`}
                      className="text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      {inq.customer.name}
                    </Link>
                  ) : (
                    <form action={convertInquiryToCustomer}>
                      <input type="hidden" name="inquiryId" value={inq.id} />
                      <SubmitButton type="submit">Convert to customer</SubmitButton>
                    </form>
                  )}

                  <form action={deleteInquiry} className="ms-auto">
                    <input type="hidden" name="id" value={inq.id} />
                    <SubmitButton type="submit" variant="danger">
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
