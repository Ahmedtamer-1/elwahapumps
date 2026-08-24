/**
 * Builds the conductor-size selector for the Voltson EXCELGRIP winding wire.
 *
 * Run with:  npx tsx scripts/seed-voltson-wire-sizes.ts
 *
 * Sizes, overall diameter, resistance and weight are transcribed from the
 * EXCELGRIP catalogue's gauge table (tested per IS 8783) — the same table the
 * product page renders under Technical Data. Each size becomes one variant, so
 * picking a size reveals its own figures beside the price and carries them into
 * the cart and the WhatsApp enquiry.
 *
 * Prices are deliberately left null: the company has not quoted per-size prices
 * for this wire, so the page shows "Price on request" rather than inventing a
 * number. Set them in /admin once they are known — re-running this script will
 * NOT overwrite a price that has been filled in.
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

const PRODUCT_SLUG = "winding-wire-voltson";
const OPTION_KEY = "size";

interface WireSize {
  /** Nominal conductor cross-section, mm² — the number the buyer asks for. */
  sqmm: string;
  /** Overall diameter over the poly wrap, mm. */
  od: string;
  /** Conductor cross-sectional area, mm². */
  area: string;
  /** Maximum conductor resistance at 20°C, Ω/km. */
  resistance: string;
  /** Approximate weight, kg/km. */
  weight: string;
}

const SIZES: WireSize[] = [
  { sqmm: "0.40", od: "0.80", area: "0.126", resistance: "140.00", weight: "1.47" },
  { sqmm: "0.50", od: "0.90", area: "0.196", resistance: "87.80", weight: "2.15" },
  { sqmm: "0.60", od: "1.00", area: "0.283", resistance: "60.98", weight: "2.98" },
  { sqmm: "0.70", od: "1.10", area: "0.385", resistance: "44.78", weight: "3.95" },
  { sqmm: "0.80", od: "1.20", area: "0.503", resistance: "34.30", weight: "5.05" },
  { sqmm: "0.90", od: "1.35", area: "0.636", resistance: "27.10", weight: "6.30" },
  { sqmm: "1.00", od: "1.45", area: "0.786", resistance: "21.95", weight: "7.80" },
  { sqmm: "1.10", od: "1.55", area: "0.951", resistance: "17.50", weight: "9.20" },
  { sqmm: "1.20", od: "1.65", area: "1.131", resistance: "15.26", weight: "10.90" },
  { sqmm: "1.30", od: "1.75", area: "1.328", resistance: "12.58", weight: "12.70" },
  { sqmm: "1.40", od: "1.85", area: "1.540", resistance: "11.20", weight: "14.90" },
  { sqmm: "1.50", od: "2.00", area: "1.768", resistance: "9.75", weight: "17.00" },
  { sqmm: "1.60", od: "2.10", area: "2.011", resistance: "8.57", weight: "19.20" },
  { sqmm: "1.70", od: "2.20", area: "2.271", resistance: "7.59", weight: "21.60" },
  { sqmm: "1.80", od: "2.30", area: "2.546", resistance: "6.77", weight: "24.20" },
  { sqmm: "1.90", od: "2.40", area: "2.836", resistance: "6.08", weight: "26.80" },
  { sqmm: "2.00", od: "2.50", area: "3.143", resistance: "5.49", weight: "29.60" },
  { sqmm: "2.10", od: "2.60", area: "3.465", resistance: "4.98", weight: "32.55" },
  { sqmm: "2.20", od: "2.70", area: "3.803", resistance: "4.53", weight: "35.60" },
  { sqmm: "2.30", od: "2.80", area: "4.156", resistance: "4.15", weight: "38.85" },
  { sqmm: "2.40", od: "2.90", area: "4.526", resistance: "3.81", weight: "42.20" },
];

/** The stored value and the visible label, e.g. "1.50 mm²". */
function valueOf(s: WireSize): string {
  return `${s.sqmm} mm²`;
}

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

  const option = existingOption
    ? await prisma.productOption.update({
        where: { id: existingOption.id },
        data: { labelEn: "Conductor Size", labelAr: "مقاس الموصل", unit: "mm²", sortOrder: 0 },
        select: { id: true },
      })
    : await prisma.productOption.create({
        data: {
          productId: product.id,
          key: OPTION_KEY,
          labelEn: "Conductor Size",
          labelAr: "مقاس الموصل",
          unit: "mm²",
          sortOrder: 0,
        },
        select: { id: true },
      });

  // 2. One value per size, in ascending order.
  for (const [i, size] of SIZES.entries()) {
    const value = valueOf(size);
    const existing = await prisma.productOptionValue.findFirst({
      where: { optionId: option.id, value },
      select: { id: true },
    });
    const data = {
      labelEn: value,
      labelAr: `${size.sqmm} مم²`,
      numeric: Number(size.sqmm),
      sortOrder: i,
    };
    if (existing) {
      await prisma.productOptionValue.update({ where: { id: existing.id }, data });
    } else {
      await prisma.productOptionValue.create({
        data: { optionId: option.id, value, ...data },
      });
    }
  }

  // 3. One variant per size. `specs` is what shows beside the price once a
  //    size is picked, so it carries the figures a rewinder actually checks.
  for (const [i, size] of SIZES.entries()) {
    const value = valueOf(size);
    const comboKey = `${OPTION_KEY}=${value}`;
    const specs = JSON.stringify({
      size: `${size.sqmm} mm²`,
      od: `${size.od} mm OD`,
      resistance: `${size.resistance} Ω/km`,
      weight: `${size.weight} kg/km`,
    });

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

  console.log(`✔ ${SIZES.length} conductor sizes ready on ${PRODUCT_SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
