import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Badge, Card, Field, PageHeader, SubmitButton, inputClass } from "@/components/admin/ui";
import ActivityTimeline from "@/components/admin/ActivityTimeline";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STATUSES,
  LEAD_STATUS_STYLE,
  type LeadSource,
  type LeadStatus,
} from "@/lib/crm";
import { formatDateTime } from "@/lib/format";
import {
  addLeadNote,
  assignLead,
  convertLeadToCustomer,
  deleteLead,
  updateLeadStatus,
} from "@/lib/actions/crm";

export const metadata = { title: "Lead" };
export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const [lead, staff] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        customer: { select: { id: true, name: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { name: true } } },
        },
      },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!lead) notFound();

  return (
    <>
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to leads
      </Link>

      <PageHeader
        title={lead.name}
        subtitle={`${LEAD_SOURCE_LABEL[lead.source as LeadSource]} · ${formatDateTime(lead.createdAt)}`}
        action={<Badge label={lead.status} className={LEAD_STATUS_STYLE[lead.status as LeadStatus]} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Inquiry">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-bold text-neutral-500 uppercase mb-1">Phone</dt>
                <dd>
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {lead.phone}
                    </a>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-neutral-500 uppercase mb-1">Email</dt>
                <dd>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline break-all"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold text-neutral-500 uppercase mb-1">Subject</dt>
                <dd className="text-neutral-800">{lead.subject || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold text-neutral-500 uppercase mb-1">Message</dt>
                <dd className="text-neutral-800 whitespace-pre-wrap break-words">
                  {lead.message || "—"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Activity">
            <form action={addLeadNote} className="mb-6">
              <input type="hidden" name="leadId" value={lead.id} />
              <Field label="Add a note">
                <textarea
                  name="body"
                  rows={3}
                  required
                  placeholder="Called the client, quoted 3 units…"
                  className={`${inputClass} resize-none`}
                />
              </Field>
              <div className="mt-3">
                <SubmitButton type="submit">Save note</SubmitButton>
              </div>
            </form>
            <ActivityTimeline items={lead.activities} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status">
            <form action={updateLeadStatus} className="space-y-3">
              <input type="hidden" name="leadId" value={lead.id} />
              <select name="status" defaultValue={lead.status} className={inputClass}>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <SubmitButton type="submit" className="w-full">
                Update status
              </SubmitButton>
            </form>
          </Card>

          <Card title="Owner">
            <form action={assignLead} className="space-y-3">
              <input type="hidden" name="leadId" value={lead.id} />
              <select name="assignedToId" defaultValue={lead.assignedToId ?? ""} className={inputClass}>
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <SubmitButton type="submit" variant="ghost" className="w-full">
                Assign
              </SubmitButton>
            </form>
          </Card>

          <Card title="Customer">
            {lead.customer ? (
              <Link
                href={`/admin/customers/${lead.customer.id}`}
                className="text-sm font-semibold text-emerald-700 hover:underline"
              >
                {lead.customer.name}
              </Link>
            ) : (
              <form action={convertLeadToCustomer}>
                <input type="hidden" name="leadId" value={lead.id} />
                <p className="text-sm text-neutral-500 mb-3">
                  Not linked to a customer record yet.
                </p>
                <SubmitButton type="submit" className="w-full">
                  Convert to customer
                </SubmitButton>
              </form>
            )}
          </Card>

          <Card title="Danger zone">
            <form action={deleteLead}>
              <input type="hidden" name="leadId" value={lead.id} />
              <SubmitButton type="submit" variant="danger" className="w-full">
                Delete lead
              </SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
