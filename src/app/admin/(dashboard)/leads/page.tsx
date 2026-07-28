import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STATUSES,
  LEAD_STATUS_STYLE,
  type LeadSource,
  type LeadStatus,
} from "@/lib/crm";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const { status } = await searchParams;

  const activeStatus = LEAD_STATUSES.find((s) => s === status);
  const leads = await prisma.lead.findMany({
    where: activeStatus ? { status: activeStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { assignedTo: { select: { name: true } } },
    take: 200,
  });

  const counts = await prisma.lead.groupBy({ by: ["status"], _count: true });
  const countFor = (s: LeadStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <>
      <PageHeader title="Leads" subtitle="Inquiries captured from the website contact form." />

      {/* Filters sit in one row above the content they scope. */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/admin/leads"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
            !activeStatus
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
          }`}
        >
          All ({total})
        </Link>
        {LEAD_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/leads?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              activeStatus === s
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
            }`}
          >
            {s} ({countFor(s)})
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        {leads.length === 0 ? (
          <EmptyState message="No leads here yet." />
        ) : (
          <div className="overflow-x-auto -m-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-neutral-500 uppercase border-b border-neutral-200">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3 hidden md:table-cell">Subject</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Source</th>
                  <th className="px-5 py-3 hidden lg:table-cell">Owner</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-semibold text-neutral-900 hover:text-emerald-700"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-xs text-neutral-500">{lead.phone || lead.email || "—"}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell text-neutral-600 max-w-xs truncate">
                      {lead.subject || "—"}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                      {LEAD_SOURCE_LABEL[lead.source as LeadSource]}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell text-neutral-500 text-xs">
                      {lead.assignedTo?.name ?? "Unassigned"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge label={lead.status} className={LEAD_STATUS_STYLE[lead.status as LeadStatus]} />
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-500 text-xs tabular-nums whitespace-nowrap">
                      {formatDate(lead.createdAt)}
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
