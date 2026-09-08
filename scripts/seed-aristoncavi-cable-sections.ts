/**
 * Builds the cross-section selector for the Aristoncavi SUBMERSIBLE 07 cable.
 *
 * Run with:  npx tsx scripts/seed-aristoncavi-cable-sections.ts
 *
 * The eight sections are the range El Waha stocks. Each becomes one variant, so
 * picking a section carries it into the cart and the WhatsApp enquiry — a cable
 * order is meaningless without the section, and the page previously offered no
 * way to state one.
 *
 * NOTE ON 1x90: IEC 60228 has no 90 mm² conductor — the series runs
 * … 50, 70, 95, 120 …. This list is seeded exactly as it was supplied. If 95 was
 * intended, change it in SECTIONS below and re-run; the old row is left behind,
 * so delete the 1x90 variant in /admin afterwards.
 *
 * Prices are deliberately left null: the company quotes cable by the metre at
 * the day's copper price, so the page shows "Price on request" rather than
 * inventing a number. Set them in /admin if that changes — re-running this
 * script will NOT overwrite a price that has been filled in.
 *
 * Safe to re-run: the option, its values and the variants are matched on their
 * natural keys and updated in place, so this never duplicates rows.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

const PRODUCT_SLUG = "cable-submersible";
const OPTION_KEY = "section";

/** Nominal conductor cross-section, mm². Single-core throughout. */
const SECTIONS = ["10", "16", "25", "35", "50", "70", "90", "120"] as const;

const labelEn = (mm2: string) => `1x${mm2} mm²`;
const labelAr = (mm2: string) => `1×${mm2} مم²`;

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

  // 1. The option itself.
  const existingOption = await prisma.productOption.findFirst({
    where: { productId: product.id, key: OPTION_KEY },
    select: { id: true },
  });

  const data = {
    labelEn: "Cross Section",
    labelAr: "المقطع",
    unit: "mm²",
    sortOrder: 0,
  };

  const option = existingOption
    ? await prisma.productOption.update({
        where: { id: existingOption.id },
        data,
        select: { id: true },
      })
    : await prisma.productOption.create({
        data: { productId: product.id, key: OPTION_KEY, ...data },
        select: { id: true },
      });

  // 2. One value per section, in ascending order.
  for (const [i, mm2] of SECTIONS.entries()) {
    const value = labelEn(mm2);
    const existing = await prisma.productOptionValue.findFirst({
      where: { optionId: option.id, value },
      select: { id: true },
    });
    const valueData = {
      labelEn: value,
      labelAr: labelAr(mm2),
      numeric: Number(mm2),
      sortOrder: i,
    };
    if (existing) {
      await prisma.productOptionValue.update({ where: { id: existing.id }, data: valueData });
    } else {
      await prisma.productOptionValue.create({
        data: { optionId: option.id, value, ...valueData },
      });
    }
  }

  // 3. One variant per section. `specs` is what shows beside the price once a
  //    section is picked. Only the section is stated: Aristoncavi do not
  //    publish per-section diameters or weights on the product page, and a
  //    guessed figure here would travel into a quotation.
  for (const [i, mm2] of SECTIONS.entries()) {
    const value = labelEn(mm2);
    const comboKey = `${OPTION_KEY}=${value}`;
    const specs = JSON.stringify({ section: value, cores: "1", type: "H07RN8-F" });

    const existing = await prisma.productVariant.findFirst({
      where: { productId: product.id, comboKey },
      select: { id: true },
    });

    if (existing) {
      // Price is intentionally not in this update — an admin-entered price survives.
      await prisma.productVariant.update({
        where: { id: existing.id },
        data: {
          selections: JSON.stringify({ [OPTION_KEY]: value }),
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
          selections: JSON.stringify({ [OPTION_KEY]: value }),
          specs,
          price: null,
          currency: "EGP",
          sortOrder: i,
          isActive: true,
        },
      });
    }
  }

  console.log(`✔ ${SECTIONS.length} cross-sections ready on ${PRODUCT_SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
