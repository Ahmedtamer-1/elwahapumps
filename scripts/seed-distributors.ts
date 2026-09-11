/**
 * Seeds the distributor network from the company's own spreadsheet.
 *
 * Run with:  npx tsx scripts/seed-distributors.ts
 *
 * Names, phone and mapUrl come from the sheet, as checked and returned by the
 * owner on 11 Sep 2026. Each name is held in both scripts so neither language
 * page shows the other's; the English spellings of the Arabic names are
 * transliterations and should be confirmed before print use.
 * `lat`/`lng` are NOT in the sheet — it carries only a Google Maps *search*
 * link by city name, which has no coordinates in it — so every pin below is a
 * town-centre coordinate looked up from the city name. Accurate enough to put
 * each distributor in the right town, not accurate enough to be an address.
 *
 * The four marked NEEDS CONFIRMATION are the ones whose city name in the sheet
 * does not resolve to a single place. Fix those in /admin/distributors once
 * the real locations are known.
 *
 * Safe to re-run: a distributor whose phone is already on file is skipped,
 * so this will not duplicate rows or overwrite edits made in the admin.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

function mapsSearch(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

interface SeedRow {
  nameAr: string;
  nameEn: string;
  phone: string;
  cityAr: string;
  cityEn: string;
  region: string;
  lat: number;
  lng: number;
  /** The exact query string the company's spreadsheet used. */
  sheetQuery: string;
  sortOrder: number;
  /** Set where the sheet's city name is ambiguous. Printed as a warning. */
  needsConfirmation?: string;
}

const ROWS: SeedRow[] = [
  // ── Greater Cairo & Giza ──────────────────────────────────────────────
  {
    nameAr: "آبار جروب",
    nameEn: "Abar Group",
    phone: "01021991995",
    cityAr: "أبو رواش",
    cityEn: "Abu Rawash",
    region: "greater-cairo",
    lat: 30.0333,
    lng: 31.1,
    sheetQuery: "ابو رواش, Egypt",
    sortOrder: 1,
  },
  {
    nameAr: "نور المصطفى",
    nameEn: "Nour El Mostafa",
    phone: "01145069247",
    cityAr: "السبتية",
    cityEn: "El Sabtiya",
    region: "greater-cairo",
    lat: 30.0667,
    lng: 31.2333,
    sheetQuery: "السابتيه, Egypt",
    sortOrder: 2,
  },
  {
    nameAr: "مجدي خلاف",
    nameEn: "Magdy Khallaf",
    phone: "01272448666",
    cityAr: "السبتية",
    cityEn: "El Sabtiya",
    region: "greater-cairo",
    lat: 30.0667,
    lng: 31.2333,
    sheetQuery: "السابتيه, Egypt",
    sortOrder: 3,
  },
  {
    nameAr: "جرين سولار",
    nameEn: "Green Solar",
    phone: "01203637999",
    cityAr: "الجيزة - الواحات البحريه",
    cityEn: "Giza — Bahariya Oasis Road",
    region: "greater-cairo",
    lat: 29.987,
    lng: 31.1313,
    sheetQuery: "الجيزة - الواحات البحريه, Egypt",
    sortOrder: 4,
    needsConfirmation: "Bahariya road runs ~350 km. Pinned at the Giza end — ask for the km marker.",
  },

  // ── Upper Egypt ───────────────────────────────────────────────────────
  {
    nameAr: "خليل سرور",
    nameEn: "Khalil Sorour",
    phone: "01098406882",
    cityAr: "المنيا",
    cityEn: "Minya",
    region: "upper-egypt",
    lat: 28.1099,
    lng: 30.7503,
    sheetQuery: "المنيا, Egypt",
    sortOrder: 1,
  },
  {
    nameAr: "ستار صن",
    nameEn: "Star Sun",
    phone: "01120204442",
    cityAr: "أسيوط",
    cityEn: "Asyut",
    region: "upper-egypt",
    lat: 27.1809,
    lng: 31.1837,
    sheetQuery: "اسيوط, Egypt",
    sortOrder: 3,
  },
  {
    nameAr: "عبدالرحمن العربي",
    nameEn: "Abdelrahman El Araby",
    phone: "01000525848",
    cityAr: "نكلة",
    cityEn: "Nakla",
    region: "upper-egypt",
    lat: 29.0667,
    lng: 31.0833,
    sheetQuery: "نكله, Egypt",
    sortOrder: 4,
    needsConfirmation: "Several places are called نكلة. Pinned on Beni Suef — confirm the governorate.",
  },

  // ── New Valley & the Oases ────────────────────────────────────────────
  {
    nameAr: "مجدي خلف",
    nameEn: "Magdy Khalaf",
    phone: "01125752380",
    cityAr: "الفرافرة",
    cityEn: "Farafra",
    region: "oases",
    lat: 27.0587,
    lng: 27.9702,
    sheetQuery: "الفرافره, Egypt",
    sortOrder: 1,
  },
  {
    nameAr: "رضا البسيوني",
    nameEn: "Reda El Bassiouny",
    phone: "01553328611",
    cityAr: "الفرافرة",
    cityEn: "Farafra",
    region: "oases",
    lat: 27.0587,
    lng: 27.9702,
    sheetQuery: "الفرافره, Egypt",
    sortOrder: 2,
  },
  {
    nameAr: "سولار سيتي",
    nameEn: "Solar City",
    phone: "01111753518",
    cityAr: "الداخلة",
    cityEn: "Dakhla",
    region: "oases",
    lat: 25.4914,
    lng: 28.9781,
    sheetQuery: "الداخله, Egypt",
    sortOrder: 3,
  },
  {
    nameAr: "عبد الحميد جاما",
    nameEn: "Abdel Hamid Gama",
    phone: "01212972544",
    cityAr: "الواحات",
    cityEn: "El Wahat (Bahariya)",
    region: "oases",
    lat: 28.35,
    lng: 28.86,
    sheetQuery: "الواحات, Egypt",
    sortOrder: 4,
    needsConfirmation: "Sheet says only 'الواحات'. Pinned on Bawiti, Bahariya — confirm which oasis.",
  },
];

async function main() {
  let created = 0;
  let skipped = 0;
  const toConfirm: string[] = [];

  for (const row of ROWS) {
    const existing = await prisma.distributor.findFirst({
      where: { phone: row.phone },
      select: { id: true },
    });

    if (existing) {
      console.log(`skipped (already exists): ${row.nameEn} — ${row.cityEn}`);
      skipped++;
      continue;
    }

    await prisma.distributor.create({
      data: {
        nameAr: row.nameAr,
        nameEn: row.nameEn,
        phone: row.phone,
        cityAr: row.cityAr,
        cityEn: row.cityEn,
        region: row.region,
        lat: row.lat,
        lng: row.lng,
        mapUrl: mapsSearch(row.sheetQuery),
        sortOrder: row.sortOrder,
        isActive: true,
      },
    });

    console.log(`created: ${row.nameEn} — ${row.cityEn}`);
    created++;

    if (row.needsConfirmation) {
      toConfirm.push(`  ${row.nameEn} (${row.cityAr}): ${row.needsConfirmation}`);
    }
  }

  const total = await prisma.distributor.count();
  const live = await prisma.distributor.count({ where: { isActive: true } });
  console.log(`\n${created} created, ${skipped} skipped.`);
  console.log(`Distributors in database: ${total} (${live} live, ${total - live} hidden).`);

  if (toConfirm.length) {
    console.log(`\nPINS NEEDING CONFIRMATION (${toConfirm.length}) — fix in /admin/distributors:`);
    for (const line of toConfirm) console.log(line);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
