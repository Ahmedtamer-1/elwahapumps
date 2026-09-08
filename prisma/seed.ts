import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

import { products } from "../src/data/products";
import { addTormac } from "./add-tormac";
import en from "../src/dictionaries/en.json";
import ar from "../src/dictionaries/ar.json";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/** Category slugs used by the existing static catalogue, with labels from the dictionaries. */
const categories = [
  { slug: "pumps", nameEn: en.productsPage.pumps, nameAr: ar.productsPage.pumps },
  // Was missing from this list while present in src/data/categories.ts and
  // linked from the header nav — silently dropped two products (the Rovatti
  // and Tormac surface pumps) and left the nav link pointing at an empty page.
  { slug: "surface-pumps", nameEn: en.productsPage.surfacePumps, nameAr: ar.productsPage.surfacePumps },
  { slug: "motors", nameEn: en.productsPage.motors, nameAr: ar.productsPage.motors },
  { slug: "electrical", nameEn: en.productsPage.electrical, nameAr: ar.productsPage.electrical },
  { slug: "pipes", nameEn: en.productsPage.pipes, nameAr: ar.productsPage.pipes },
  { slug: "spare-parts", nameEn: en.productsPage.spareParts, nameAr: ar.productsPage.spareParts },
  { slug: "cables", nameEn: en.productsPage.cables, nameAr: ar.productsPage.cables },
];

type ProductDict = Record<string, { title: string; category: string; desc: string }>;

const DEFAULT_ADMIN_PASSWORD = "ChangeMe123!";

/**
 * Re-running the seed must never overwrite content edited through the admin.
 *
 * The database is the runtime source of truth; `src/data/products.ts` is a
 * one-time fixture for bootstrapping an empty install. The product upsert
 * used to carry a full `update` block, so every re-run silently reverted
 * every name, description, image list and specification an operator had
 * changed (S7-T07). Set SEED_OVERWRITE_PRODUCTS=1 to deliberately re-import
 * the fixture over live rows.
 */
const OVERWRITE_PRODUCTS = process.env.SEED_OVERWRITE_PRODUCTS === "1";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@elwahapumps.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  // The default password is published in the README, so it is a development
  // convenience only. Refuse it in production rather than quietly creating a
  // known-credential administrator on a live box.
  if (process.env.NODE_ENV === "production" && adminPassword === DEFAULT_ADMIN_PASSWORD) {
    throw new Error(
      "Refusing to seed the default admin password in production. " +
        "Set SEED_ADMIN_PASSWORD to a strong value before seeding.",
    );
  }

  // 1. Admin user. Flagged to force a password change on first sign-in —
  //    without that, the documented default stays valid indefinitely.
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "El Waha Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      mustChangePassword: true,
    },
  });
  console.log(`✔ Admin user ready: ${adminEmail}`);

  // 2. Categories
  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameEn: c.nameEn, nameAr: c.nameAr },
      create: c,
    });
    categoryIdBySlug.set(c.slug, row.id);
  }
  console.log(`✔ ${categories.length} categories ready`);

  // 3. Products — migrated from src/data/products.ts + the productsData dictionaries.
  //    The full original ProductData shape is preserved verbatim in `specs` so the
  //    existing detail-page rendering keeps working unchanged.
  const enProducts = en.productsData as ProductDict;
  const arProducts = ar.productsData as ProductDict;

  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.category);
    if (!categoryId) {
      console.warn(`⚠ Skipping ${p.id}: unknown category "${p.category}"`);
      continue;
    }

    const enEntry = enProducts[p.id];
    const arEntry = arProducts[p.id];

    // `specs` keeps everything except the columns that get their own DB fields.
    const { gallery } = p;
    const specsBlob: Record<string, unknown> = { ...p };
    delete specsBlob.id;
    delete specsBlob.category;
    delete specsBlob.gallery;

    await prisma.product.upsert({
      where: { slug: p.id },
      // Create-only by default — see OVERWRITE_PRODUCTS above.
      update: OVERWRITE_PRODUCTS
        ? {
            categoryId,
            nameEn: enEntry?.title ?? p.id,
            nameAr: arEntry?.title ?? p.id,
            descEn: enEntry?.desc ?? null,
            descAr: arEntry?.desc ?? null,
            images: JSON.stringify(gallery),
            specs: JSON.stringify(specsBlob),
          }
        : {},
      create: {
        slug: p.id,
        categoryId,
        nameEn: enEntry?.title ?? p.id,
        nameAr: arEntry?.title ?? p.id,
        descEn: enEntry?.desc ?? null,
        descAr: arEntry?.desc ?? null,
        price: null,
        images: JSON.stringify(gallery),
        specs: JSON.stringify(specsBlob),
      },
    });
  }
  console.log(
    `✔ ${products.length} products ready` +
      (OVERWRITE_PRODUCTS ? " (existing rows overwritten from the fixture)" : " (existing rows left untouched)"),
  );

  // 4. Tormac. It lives in its own file because it carries full variant
  //    matrices rather than the flat fixture shape, but it is not optional:
  //    src/data/catalogues.ts maps the two largest catalogues on the site to
  //    its slugs, so a seed without it leaves those pointing at nothing.
  await addTormac();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
