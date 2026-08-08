/**
 * One-off migration: rename the "Thrust Bearings" category to "Spare Parts"
 * and move the Motor Winding Wire product into it.
 *
 * The category is a database row (seeded from prisma/seed.ts), so renaming it
 * in the dictionaries alone would leave the live site showing the old label
 * and serving the old /products/category/thrust-bearings URL.
 *
 * Idempotent: re-running it is a no-op.
 *
 *   npx tsx scripts/rename-spare-parts.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const OLD_SLUG = "thrust-bearings";
const NEW_SLUG = "spare-parts";
const NEW_NAME_EN = "Spare Parts";
const NEW_NAME_AR = "قطع الغيار";
/** Motor Winding Wire — currently filed under Electrical Component. */
const MOVE_PRODUCT = "elec-winding-wire";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const category =
    (await prisma.category.findUnique({ where: { slug: NEW_SLUG } })) ??
    (await prisma.category.findUnique({ where: { slug: OLD_SLUG } }));

  if (!category) {
    throw new Error(`Neither "${OLD_SLUG}" nor "${NEW_SLUG}" exists — nothing to rename.`);
  }

  if (category.slug === OLD_SLUG) {
    await prisma.category.update({
      where: { id: category.id },
      data: { slug: NEW_SLUG, nameEn: NEW_NAME_EN, nameAr: NEW_NAME_AR },
    });
    console.log(`renamed category: ${OLD_SLUG} -> ${NEW_SLUG} ("${NEW_NAME_EN}")`);
  } else {
    // Already renamed; make sure the labels match the intended ones.
    await prisma.category.update({
      where: { id: category.id },
      data: { nameEn: NEW_NAME_EN, nameAr: NEW_NAME_AR },
    });
    console.log(`category already "${NEW_SLUG}" — labels reasserted`);
  }

  const product = await prisma.product.findUnique({
    where: { slug: MOVE_PRODUCT },
    include: { category: true },
  });

  if (!product) {
    console.warn(`product "${MOVE_PRODUCT}" not found — skipped the move`);
  } else if (product.categoryId === category.id) {
    console.log(`"${product.nameEn}" is already in ${NEW_SLUG}`);
  } else {
    await prisma.product.update({
      where: { id: product.id },
      data: { categoryId: category.id },
    });
    console.log(`moved "${product.nameEn}": ${product.category.slug} -> ${NEW_SLUG}`);
  }

  const summary = await prisma.category.findMany({
    select: { slug: true, nameEn: true, _count: { select: { products: true } } },
    orderBy: { slug: "asc" },
  });
  console.log("\ncategories now:");
  for (const c of summary) {
    console.log(`  ${c.slug.padEnd(14)} ${c.nameEn.padEnd(22)} ${c._count.products} product(s)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
