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
      <div className="bg-white border-b border-rule p-[22px_40px] flex items-center justify-between mb-8">
        <div>
          <div className="font-medium text-[10.5px] font-mono tracking-[0.16em] uppercase text-stone-light">
            Account overview
          </div>
          <h1 className="mt-[8px] font-extrabold text-[24px] leading-[28px] tracking-[-0.02em] text-ink">
            Good morning, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex gap-3 hidden sm:flex">
          <Link
            href="/admin/leads"
            className="border border-rule/25 text-pine font-semibold text-[12.5px] p-[12px_20px] transition-colors hover:border-pine"
          >
            Open leads
          </Link>
          <Link
            href="/admin/inquiries"
            className="bg-pine text-bone font-semibold text-[12.5px] p-[12px_20px] transition-colors hover:bg-field"
          >
            New inquiry
          </Link>
        </div>
      </div>

      <div className="p-[0_40px_40px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[1px] bg-rule border border-rule mb-[32px]">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <Card title="Latest leads">
              {recentLeads.length === 0 ? (
                <EmptyState message="No leads yet. Submissions from the website contact form land here." />
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-bone">
                      <th className="text-left p-[10px_26px] font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-stone">Name</th>
                      <th className="text-left p-[10px_14px] font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-stone hidden sm:table-cell">Subject</th>
                      <th className="text-left p-[10px_14px] font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-stone hidden md:table-cell">Raised</th>
                      <th className="text-right p-[10px_26px] font-medium text-[10px] font-mono tracking-[0.14em] uppercase text-stone">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead, index) => {
                      const isLast = index === recentLeads.length - 1;
                      return (
                        <tr key={lead.id} className="group hover:bg-bone/50 transition-colors">
                          <td className={`p-[15px_26px] font-medium text-[12.5px] font-mono text-ink ${!isLast ? 'border-b border-rule/10' : ''}`}>
                            <Link href={`/admin/leads/${lead.id}`} className="block w-full">
                              {lead.name}
                            </Link>
                          </td>
                          <td className={`p-[15px_14px] font-normal text-[13px] text-ink hidden sm:table-cell ${!isLast ? 'border-b border-rule/10' : ''}`}>
                            <Link href={`/admin/leads/${lead.id}`} className="block w-full truncate max-w-[200px]">
                              {lead.subject || "No subject"}
                            </Link>
                          </td>
                          <td className={`p-[15px_14px] font-normal text-[12px] font-mono text-stone hidden md:table-cell ${!isLast ? 'border-b border-rule/10' : ''}`}>
                            {relativeTime(lead.createdAt)}
                          </td>
                          <td className={`p-[15px_26px] text-right ${!isLast ? 'border-b border-rule/10' : ''}`}>
                            <Badge
                              label={lead.status}
                              className={LEAD_STATUS_STYLE[lead.status as LeadStatus]}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Card>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white border border-rule border-t-[3px] border-t-brass p-[24px_26px]">
              <div className="font-medium text-[10.5px] font-mono tracking-[0.16em] uppercase text-stone">
                Leads per week
              </div>
              <h3 className="mt-[12px] font-extrabold text-[18px] leading-[24px] text-ink">
                Last 12 weeks
              </h3>
              <div className="mt-4">
                <TrendColumns data={weekBuckets} caption="Leads received per week over the last 12 weeks" />
              </div>
            </div>
            
            <div className="bg-ink p-[24px_26px]">
              <div className="font-medium text-[10.5px] font-mono tracking-[0.16em] uppercase text-brass">
                Admin Support
              </div>
              <p className="mt-[12px] font-normal text-[13px] leading-[22px] text-bone/75">
                Need help with the CRM? Contact the internal IT desk.
              </p>
              <div className="mt-[18px] bg-brass text-ink font-semibold text-[13px] font-mono p-[13px] text-center">
                +20 106 668 5532
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
