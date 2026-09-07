/**
 * Regenerates public/llms-full.txt from the database and dictionaries
 * (PLAN.md S3-T11). public/llms.txt is the small, hand-written entry
 * point (S3-T01); this is the fuller catalogue dump it links to, built
 * fresh every time so it can never drift from a product edit the way a
 * hand-maintained file would.
 *
 * Runs as the "prebuild" npm script, before `next build`.
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCatalogProducts } from "../src/lib/products";
import { PRODUCT_CATEGORIES, categoryLabel } from "../src/data/categories";
import { getDictionary } from "../src/app/[lang]/dictionaries";
import {
  NAME_EN,
  LEGAL_NAME_EN,
  EMAIL,
  PHONE_SALES,
  PHONE_SUPPORT,
  ADDRESS,
  AGENCIES,
  AGENCY_COUNT,
  yearsOfService,
} from "../src/lib/company";
import { prisma } from "../src/lib/prisma";

const SITE_URL = "https://elwahapumps.com";

async function main() {
  const [products, dict] = await Promise.all([getCatalogProducts("en"), getDictionary("en")]);

  const lines: string[] = [];
  lines.push(`# ${NAME_EN} — Full Catalogue`);
  lines.push("");
  lines.push(`${LEGAL_NAME_EN}. Exclusive Egyptian agent for ${AGENCY_COUNT} pump, motor, pipe, cable and electrical brands.`);
  lines.push(`${yearsOfService()}+ years in the water-well and industrial pump business.`);
  lines.push(`Address: ${ADDRESS.streetEn}, ${ADDRESS.localityEn}, ${ADDRESS.regionEn}, Egypt.`);
  lines.push(`Email: ${EMAIL} | Sales: ${PHONE_SALES} | Support: ${PHONE_SUPPORT}`);
  lines.push("");
  lines.push("## Agencies");
  for (const agency of AGENCIES) {
    lines.push(`- ${agency.name}`);
  }
  lines.push("");

  for (const category of PRODUCT_CATEGORIES) {
    const inCategory = products.filter((p) => p.category === category);
    if (inCategory.length === 0) continue;
    lines.push(`## ${categoryLabel(dict, category)}`);
    lines.push(`${SITE_URL}/en/products/category/${category}`);
    lines.push("");
    for (const p of inCategory) {
      lines.push(`### ${p.title}`);
      if (p.modelNo) lines.push(`Model: ${p.modelNo}`);
      lines.push(p.desc);
      if (p.specs) lines.push(`Specs: ${p.specs}`);
      lines.push(`URL: ${SITE_URL}/en/products/${p.id}`);
      lines.push("");
    }
  }

  const outPath = join(process.cwd(), "public", "llms-full.txt");
  writeFileSync(outPath, lines.join("\n") + "\n", "utf-8");
  console.log(`Wrote ${outPath} (${products.length} products).`);
}

main()
  .catch((err) => {
    console.error("generate-llms-full failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
