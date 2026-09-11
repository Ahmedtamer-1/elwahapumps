/**
 * Applies the distributor list the owner checked and returned on 11 Sep 2026.
 *
 * Run with:  npx tsx scripts/apply-distributor-check.ts
 *
 * Two things came back from that sheet:
 *
 *   1. Every name now exists in both scripts. The sheet held one name per
 *      distributor — Arabic for eight of them, Latin for three — so the English
 *      page was showing Arabic script and the Arabic page Latin. The English
 *      spellings of the Arabic names are transliterations, not the owner's own
 *      wording; they are the one thing here worth a second pair of eyes.
 *
 *   2. Green Solar's location was corrected from "الجيزة - طريق الواحات" to
 *      "الجيزة - الواحات البحريه". The pin is unchanged: it was already at the
 *      Giza end of that road, and the sheet gave no km marker to move it to.
 *
 * Phones were confirmed correct and are used here as the match key, so this is
 * safe to re-run and touches nothing else on the row.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

interface Correction {
  phone: string;
  nameAr: string;
  nameEn: string;
  cityAr?: string;
  cityEn?: string;
}

const CORRECTIONS: Correction[] = [
  { phone: "01021991995", nameAr: "آبار جروب", nameEn: "Abar Group" },
  { phone: "01145069247", nameAr: "نور المصطفى", nameEn: "Nour El Mostafa" },
  { phone: "01272448666", nameAr: "مجدي خلاف", nameEn: "Magdy Khallaf" },
  {
    phone: "01203637999",
    nameAr: "جرين سولار",
    nameEn: "Green Solar",
    cityAr: "الجيزة - الواحات البحريه",
    cityEn: "Giza — Bahariya Oasis Road",
  },
  { phone: "01098406882", nameAr: "خليل سرور", nameEn: "Khalil Sorour" },
  { phone: "01120204442", nameAr: "ستار صن", nameEn: "Star Sun" },
  { phone: "01000525848", nameAr: "عبدالرحمن العربي", nameEn: "Abdelrahman El Araby" },
  { phone: "01125752380", nameAr: "مجدي خلف", nameEn: "Magdy Khalaf" },
  { phone: "01553328611", nameAr: "رضا البسيوني", nameEn: "Reda El Bassiouny" },
  { phone: "01111753518", nameAr: "سولار سيتي", nameEn: "Solar City" },
  { phone: "01212972544", nameAr: "عبد الحميد جاما", nameEn: "Abdel Hamid Gama" },
];

async function main() {
  let updated = 0;
  const missing: string[] = [];

  for (const c of CORRECTIONS) {
    const existing = await prisma.distributor.findFirst({
      where: { phone: c.phone },
      select: { id: true },
    });

    // A phone that is no longer on file means the row was edited or removed in
    // the admin since the sheet went out — worth reporting, not worth guessing.
    if (!existing) {
      missing.push(`${c.nameEn} (${c.phone})`);
      continue;
    }

    await prisma.distributor.update({
      where: { id: existing.id },
      data: {
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        ...(c.cityAr ? { cityAr: c.cityAr } : {}),
        ...(c.cityEn ? { cityEn: c.cityEn } : {}),
      },
    });

    console.log(`updated: ${c.nameEn} — ${c.nameAr}`);
    updated++;
  }

  console.log(`\n${updated} of ${CORRECTIONS.length} distributors updated.`);

  if (missing.length) {
    console.log(`\nNOT FOUND BY PHONE (${missing.length}) — check /admin/distributors:`);
    for (const line of missing) console.log(`  ${line}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
