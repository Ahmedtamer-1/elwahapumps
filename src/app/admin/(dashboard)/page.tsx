import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import StatTile from "@/components/admin/StatTile";
import TrendColumns, { type TrendPoint } from "@/components/admin/TrendColumns";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { LEAD_STATUS_STYLE, OPEN_LEAD_STATUSES, type LeadStatus } from "@/lib/crm";
import { relativeTime } from "@/lib/format";

export const metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function OverviewPage() {
  const user = await requireUser();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86_400_000);

  const [
    leadsThisWeek,
    leadsPrevWeek,
    openLeads,
    totalCustomers,
    newInquiries,
    recentLeads,
    leadsForTrend,
  ] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.lead.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.lead.count({ where: { status: { in: OPEN_LEAD_STATUSES } } }),
    prisma.customer.count(),
    prisma.cartInquiry.count({ where: { status: "NEW" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.lead.findMany({
      where: { createdAt: { gte: new Date(now.getTime() - 12 * 7 * 86_400_000) } },
      select: { createdAt: true },
    }),
  ]);

  // Bucket the last 12 weeks, oldest first.
  const weekBuckets: TrendPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = startOfDay(new Date(now.getTime() - i * 7 * 86_400_000));
    const end = new Date(start.getTime() + 7 * 86_400_000);
    weekBuckets.push({
      label: start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      value: leadsForTrend.filter((l) => l.createdAt >= start && l.createdAt < end).length,
    });
  }
  const trendValues = weekBuckets.map((b) => b.value);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Leads, inquiries, and customer activity across El Waha."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatTile
          label="New leads (7 days)"
          value={leadsThisWeek}
          delta={{ value: leadsThisWeek - leadsPrevWeek, period: "prior week" }}
          trend={trendValues}
          href="/admin/leads"
        />
        <StatTile label="Open leads" value={openLeads} href="/admin/leads" />
        <StatTile label="New cart inquiries" value={newInquiries} href="/admin/inquiries" />
        <StatTile label="Customers" value={totalCustomers} href="/admin/customers" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card title="Leads per week — last 12 weeks" className="lg:col-span-3">
          <TrendColumns data={weekBuckets} caption="Leads received per week over the last 12 weeks" />
        </Card>

        <Card title="Latest leads" className="lg:col-span-2">
          {recentLeads.length === 0 ? (
            <EmptyState message="No leads yet. Submissions from the website contact form land here." />
          ) : (
            <ul className="divide-y divide-rule-light -my-2">
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="flex items-center justify-between gap-3 py-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate group-hover:text-emerald-700">
                        {lead.name}
                      </p>
                      <p className="text-xs text-stone truncate">
                        {lead.subject || "No subject"} · {relativeTime(lead.createdAt)}
                      </p>
                    </div>
                    <Badge
                      label={lead.status}
                      className={LEAD_STATUS_STYLE[lead.status as LeadStatus]}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
