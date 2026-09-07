import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyNewLead } from "@/lib/notify";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone is required").max(40),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, phone, subject, message } = parsed.data;

  await prisma.lead.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      subject: subject || null,
      message: message || null,
      source: "CONTACT_FORM",
      status: "NEW",
    },
  });

  // Never lets a slow or misconfigured mail server fail the submission —
  // notifyNewLead catches its own errors and only logs them. The lead is
  // already durably saved by the time this runs.
  await notifyNewLead({ name, phone, email: email || null, subject: subject || null, message: message || null });

  return NextResponse.json({ ok: true }, { status: 201 });
}
