import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, Field, PageHeader, SubmitButton, inputClass } from "@/components/admin/ui";
import ActivityTimeline from "@/components/admin/ActivityTimeline";
import CustomerForm from "@/components/admin/CustomerForm";
import { INQUIRY_STATUS_STYLE, LEAD_STATUS_STYLE, type InquiryStatus, type LeadStatus } from "@/lib/crm";
import { formatCurrency, formatDate } from "@/lib/format";
import { addCustomerNote, deleteCustomer } from "@/lib/actions/crm";

export const metadata = { title: "Customer" };
export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      leads: { orderBy: { createdAt: "desc" } },
      inquiries: { orderBy: { createdAt: "desc" } },
      activities: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!customer) notFound();

  return (
    <>
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone hover:text-pine mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to customers
      </Link>

      <PageHeader
        title={customer.name}
        subtitle={customer.company || `Customer since ${formatDate(customer.createdAt)}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Details">
            <CustomerForm customer={customer} />
          </Card>

          <Card title="Activity">
            <form action={addCustomerNote} className="mb-6">
              <input type="hidden" name="customerId" value={customer.id} />
              <Field label="Add a note">
                <textarea
                  name="body"
                  rows={3}
                  required
                  placeholder="Follow-up scheduled for next week…"
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <div className="mt-3">
                <SubmitButton type="submit">Save note</SubmitButton>
              </div>
            </form>
            <ActivityTimeline items={customer.activities} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title={`Leads (${customer.leads.length})`}>
            {customer.leads.length === 0 ? (
              <p className="text-sm text-stone">No linked leads.</p>
            ) : (
              <ul className="space-y-3">
                {customer.leads.map((lead) => (
                  <li key={lead.id}>
                    <Link href={`/admin/leads/${lead.id}`} className="flex items-start justify-between gap-2 group">
                      <span className="text-sm text-ink group-hover:text-emerald-700 min-w-0 truncate">
                        {lead.subject || lead.name}
                      </span>
                      <Badge label={lead.status} className={LEAD_STATUS_STYLE[lead.status as LeadStatus]} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Cart inquiries (${customer.inquiries.length})`}>
            {customer.inquiries.length === 0 ? (
              <p className="text-sm text-stone">No linked inquiries.</p>
            ) : (
              <ul className="space-y-3">
                {customer.inquiries.map((inq) => (
                  <li key={inq.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-ink tabular-nums">
                      {formatCurrency(inq.totalEstimate)}
                    </span>
                    <Badge
                      label={inq.status}
                      className={INQUIRY_STATUS_STYLE[inq.status as InquiryStatus]}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Danger zone">
            <form action={deleteCustomer}>
              <input type="hidden" name="id" value={customer.id} />
              <p className="text-xs text-stone mb-3">
                Linked leads and inquiries are kept, but unlinked from this customer.
              </p>
              <SubmitButton type="submit" variant="danger" className="w-full">
                Delete customer
              </SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
