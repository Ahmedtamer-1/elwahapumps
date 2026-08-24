/**
 * Builds the starting-type selector for El Waha's electrical control panels.
 *
 * Run with:  npx tsx scripts/seed-control-panel-types.ts
 *
 * The three types are the ones the company builds — inverter, soft starter and
 * star-delta. Each becomes one variant, so picking a type shows what that
 * starting method actually does beside the price and carries it into the cart
 * and the WhatsApp enquiry, which is the difference between "I want a panel"
 * and "I want a soft-start panel".
 *
 * Prices are left null on purpose: a panel is quoted against the motor it will
 * run, so there is no list price to show. The page reads "Price on request".
 * Re-running this script never overwrites a price entered in /admin.
 *
 * Safe to re-run: rows are matched on their natural keys and updated in place.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

const PRODUCT_SLUG = "elec-control-panel";
const OPTION_KEY = "starter";

interface PanelType {
  value: string;
  labelEn: string;
  labelAr: string;
  /** Shown beside the price once the type is picked. */
  summaryEn: string;
  summaryAr: string;
}

const TYPES: PanelType[] = [
  {
    value: "inverter",
    labelEn: "Inverter (VFD)",
    labelAr: "إنفرتر (VFD)",
    summaryEn: "Variable-speed control · matches pump output to demand",
    summaryAr: "تحكم في السرعة · يوائم تصرف الطلمبة مع الاحتياج",
  },
  {
    value: "soft-start",
    labelEn: "Soft Starter",
    labelAr: "سوفت ستارت",
    summaryEn: "Gradual ramp to full speed · lowest starting shock",
    summaryAr: "تصاعد تدريجي حتى السرعة الكاملة · أقل صدمة عند البدء",
  },
  {
    value: "star-delta",
    labelEn: "Star-Delta",
    labelAr: "ستار دلتا",
    summaryEn: "Stepped starting · reduced starting current on larger motors",
    summaryAr: "بدء متدرج · تيار بدء أقل للمواتير الكبيرة",
  },
];

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    select: { id: true },
  });
  if (!product) {
    throw new Error(
      `No product with slug "${PRODUCT_SLUG}". Run "npx tsx prisma/seed.ts" first.`,
    );
  }

  const existingOption = await prisma.productOption.findFirst({
    where: { productId: product.id, key: OPTION_KEY },
    select: { id: true },
  });

  const labels = { labelEn: "Panel Type", labelAr: "نوع اللوحة", unit: null, sortOrder: 0 };

  const option = existingOption
    ? await prisma.productOption.update({
        where: { id: existingOption.id },
        data: labels,
        select: { id: true },
      })
    : await prisma.productOption.create({
        data: { productId: product.id, key: OPTION_KEY, ...labels },
        select: { id: true },
      });

  for (const [i, type] of TYPES.entries()) {
    const existing = await prisma.productOptionValue.findFirst({
      where: { optionId: option.id, value: type.value },
      select: { id: true },
    });
    const data = {
      labelEn: type.labelEn,
      labelAr: type.labelAr,
      numeric: null,
      sortOrder: i,
    };
    if (existing) {
      await prisma.productOptionValue.update({ where: { id: existing.id }, data });
    } else {
      await prisma.productOptionValue.create({
        data: { optionId: option.id, value: type.value, ...data },
      });
    }
  }

  for (const [i, type] of TYPES.entries()) {
    const comboKey = `${OPTION_KEY}=${type.value}`;
    const specs = JSON.stringify({ type: type.labelEn, summary: type.summaryEn });

    const existing = await prisma.productVariant.findFirst({
      where: { productId: product.id, comboKey },
      select: { id: true },
    });

    if (existing) {
      await prisma.productVariant.update({
        where: { id: existing.id },
        data: {
          selections: JSON.stringify({ [OPTION_KEY]: type.value }),
          specs,
          sortOrder: i,
          isActive: true,
        },
      });
    } else {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          comboKey,
          selections: JSON.stringify({ [OPTION_KEY]: type.value }),
          specs,
          price: null,
          currency: "EGP",
          sortOrder: i,
          isActive: true,
        },
      });
    }
  }

  console.log(`✔ ${TYPES.length} panel types ready on ${PRODUCT_SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
