import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyNewCartInquiry } from "@/lib/notify";
import { guardSubmission, normalisePhone } from "@/lib/form-guard";
import { getCurrentCustomer } from "@/lib/customer-auth";

const inquirySchema = z.object({
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(120),
        name: z.string().trim().min(1).max(200),
        qty: z.number().int().min(1).max(9999),
        unitPrice: z.number().nonnegative().nullable(),
      }),
    )
    .min(1, "Cart is empty")
    .max(100),
  /** Honeypot — see form-guard. Never populated by a real submission. */
  company: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const guard = guardSubmission({ route: "inquiries", request, honeypot: parsed.data.company });
  if (guard.kind === "reject") return guard.response;
  // Indistinguishable from success to the caller, but nothing is written.
  if (guard.kind === "silent-drop") return NextResponse.json({ ok: true }, { status: 201 });

  const { name, items } = parsed.data;
  const phone = normalisePhone(parsed.data.phone);

  /* File it against the account when one is signed in — this is what puts the
     inquiry on their "My inquiries" page, and what lets the admin see one
     customer with a history rather than a stream of anonymous carts.

     Read from the session cookie, never from the request body: a customer id
     the caller can choose is a customer id the caller can borrow. Signed out,
     this is null and the inquiry is filed exactly as it was before. */
  const session = await getCurrentCustomer();
  const customerId = session?.customerId ?? null;

  // Price the cart server-side from the catalogue — never trust the client's
  // totals, since the cart lives in the visitor's localStorage.
  const products = await prisma.product.findMany({
    where: { slug: { in: items.map((i) => i.productId) } },
    select: { slug: true, price: true },
  });
  const priceBySlug = new Map(products.map((p) => [p.slug, p.price]));

  const pricedItems = items.map((item) => ({
    ...item,
    unitPrice: priceBySlug.get(item.productId) ?? null,
  }));

  const totalEstimate = pricedItems.reduce(
    (sum, i) => sum + (i.unitPrice ?? 0) * i.qty,
    0,
  );

  const inquiry = await prisma.cartInquiry.create({
    data: {
      name: name || session?.name || null,
      phone,
      customerId,
      items: JSON.stringify(pricedItems),
      totalEstimate: totalEstimate > 0 ? totalEstimate : null,
      status: "NEW",
      whatsappSentAt: new Date(),
    },
  });

  // See the comment in api/leads/route.ts — notifyNewCartInquiry never
  // throws, so this can't turn a successful save into a failed response.
  await notifyNewCartInquiry({
    id: inquiry.id,
    name: name || null,
    phone,
    itemCount: pricedItems.length,
    totalEstimate: inquiry.totalEstimate,
  });

  return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
}
