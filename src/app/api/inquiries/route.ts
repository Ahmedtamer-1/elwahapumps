import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyNewCartInquiry } from "@/lib/notify";

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

  const { name, phone, items } = parsed.data;

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
      name: name || null,
      phone: phone || null,
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
    phone: phone || null,
    itemCount: pricedItems.length,
    totalEstimate: inquiry.totalEstimate,
  });

  return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
}
