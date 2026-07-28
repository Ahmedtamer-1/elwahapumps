"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { LEAD_STATUSES, INQUIRY_STATUSES } from "@/lib/crm";

/* ------------------------------------------------------------------ leads */

export async function updateLeadStatus(formData: FormData) {
  const user = await requireUser();

  const parsed = z
    .object({ leadId: z.string().min(1), status: z.enum(LEAD_STATUSES) })
    .safeParse({ leadId: formData.get("leadId"), status: formData.get("status") });
  if (!parsed.success) return;

  const existing = await prisma.lead.findUnique({ where: { id: parsed.data.leadId } });
  if (!existing || existing.status === parsed.data.status) return;

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: parsed.data.leadId },
      data: { status: parsed.data.status },
    }),
    // Status moves are part of the story of a lead, so they join the timeline.
    prisma.activity.create({
      data: {
        type: "STATUS_CHANGE",
        body: `Status changed from ${existing.status} to ${parsed.data.status}`,
        leadId: parsed.data.leadId,
        authorId: user.userId,
      },
    }),
  ]);

  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function assignLead(formData: FormData) {
  await requireUser();

  const leadId = String(formData.get("leadId") ?? "");
  const rawAssignee = String(formData.get("assignedToId") ?? "");
  if (!leadId) return;

  await prisma.lead.update({
    where: { id: leadId },
    data: { assignedToId: rawAssignee || null },
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

export async function addLeadNote(formData: FormData) {
  const user = await requireUser();

  const parsed = z
    .object({ leadId: z.string().min(1), body: z.string().trim().min(1).max(4000) })
    .safeParse({ leadId: formData.get("leadId"), body: formData.get("body") });
  if (!parsed.success) return;

  await prisma.activity.create({
    data: {
      type: "NOTE",
      body: parsed.data.body,
      leadId: parsed.data.leadId,
      authorId: user.userId,
    },
  });

  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
}

export async function deleteLead(formData: FormData) {
  await requireUser();
  const leadId = String(formData.get("leadId") ?? "");
  if (!leadId) return;

  // Activities reference the lead, so they go first.
  await prisma.$transaction([
    prisma.activity.deleteMany({ where: { leadId } }),
    prisma.lead.delete({ where: { id: leadId } }),
  ]);

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

/**
 * Promote a lead into a Customer record, linking the lead and moving its
 * activity timeline onto the customer so nothing is orphaned.
 */
export async function convertLeadToCustomer(formData: FormData) {
  await requireUser();
  const leadId = String(formData.get("leadId") ?? "");
  if (!leadId) return;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead || lead.customerId) return;

  const customer = await prisma.customer.create({
    data: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
    },
  });

  await prisma.$transaction([
    prisma.lead.update({ where: { id: leadId }, data: { customerId: customer.id } }),
    prisma.activity.updateMany({ where: { leadId }, data: { customerId: customer.id } }),
  ]);

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/leads/${leadId}`);
  redirect(`/admin/customers/${customer.id}`);
}

/* -------------------------------------------------------------- customers */

const customerSchema = z.object({
  name: z.string().trim().min(1).max(160),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(400).optional(),
});

export async function saveCustomer(formData: FormData) {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!parsed.success) return;

  const data = {
    name: parsed.data.name,
    company: parsed.data.company || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    address: parsed.data.address || null,
  };

  if (id) {
    await prisma.customer.update({ where: { id }, data });
    revalidatePath(`/admin/customers/${id}`);
    revalidatePath("/admin/customers");
    return;
  }

  const created = await prisma.customer.create({ data: { ...data, source: "MANUAL" } });
  revalidatePath("/admin/customers");
  redirect(`/admin/customers/${created.id}`);
}

export async function addCustomerNote(formData: FormData) {
  const user = await requireUser();

  const parsed = z
    .object({ customerId: z.string().min(1), body: z.string().trim().min(1).max(4000) })
    .safeParse({ customerId: formData.get("customerId"), body: formData.get("body") });
  if (!parsed.success) return;

  await prisma.activity.create({
    data: {
      type: "NOTE",
      body: parsed.data.body,
      customerId: parsed.data.customerId,
      authorId: user.userId,
    },
  });

  revalidatePath(`/admin/customers/${parsed.data.customerId}`);
}

export async function deleteCustomer(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Detach dependents rather than cascade-deleting their history.
  await prisma.$transaction([
    prisma.activity.deleteMany({ where: { customerId: id } }),
    prisma.lead.updateMany({ where: { customerId: id }, data: { customerId: null } }),
    prisma.cartInquiry.updateMany({ where: { customerId: id }, data: { customerId: null } }),
    prisma.customer.delete({ where: { id } }),
  ]);

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

/* -------------------------------------------------------------- inquiries */

export async function updateInquiryStatus(formData: FormData) {
  await requireUser();

  const parsed = z
    .object({ inquiryId: z.string().min(1), status: z.enum(INQUIRY_STATUSES) })
    .safeParse({ inquiryId: formData.get("inquiryId"), status: formData.get("status") });
  if (!parsed.success) return;

  await prisma.cartInquiry.update({
    where: { id: parsed.data.inquiryId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function convertInquiryToCustomer(formData: FormData) {
  await requireUser();
  const inquiryId = String(formData.get("inquiryId") ?? "");
  if (!inquiryId) return;

  const inquiry = await prisma.cartInquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry || inquiry.customerId) return;

  const customer = await prisma.customer.create({
    data: {
      name: inquiry.name || "Unnamed cart inquiry",
      phone: inquiry.phone,
      source: "WHATSAPP_CART",
    },
  });

  await prisma.cartInquiry.update({
    where: { id: inquiryId },
    data: { customerId: customer.id, status: "CONVERTED" },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/customers");
  redirect(`/admin/customers/${customer.id}`);
}

export async function deleteInquiry(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.cartInquiry.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
}
