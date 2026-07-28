/**
 * Imports the owner's price sheet into ProductOption / ProductOptionValue / ProductVariant.
 *
 * Re-runnable by design: price lists get reissued every few months, so running this
 * again against an updated workbook updates prices in place (via the
 * @@unique([productId, comboKey]) constraint) instead of creating duplicates. Variants
 * that disappear from the sheet are removed so the DB stays a mirror of the workbook.
 *
 *   npx tsx prisma/import-catalog.ts [path/to/workbook.xlsx]
 *
 * The workbook's 408 rows are not 408 products — names repeat, and each sheet is really
 * one existing product with a handful of selector axes. See SHEETS below for the mapping,
 * which was verified against each product's `modelNo` (KM → motors, KP → turbines, …).
 */
import "dotenv/config";
import path from "node:path";

import ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const WORKBOOK =
  process.argv[2] ?? "C:/Users/LEGION/OneDrive/Desktop/el waha sheets.xlsx";

/** Data rows start at row 3: row 1 is a banner, row 2 is the header. */
const FIRST_DATA_ROW = 3;

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const corrections: string[] = [];
const warnings: string[] = [];

// ---------------------------------------------------------------------------
// Value labelling helpers
// ---------------------------------------------------------------------------

interface Labelled {
  value: string;
  labelEn: string;
  labelAr: string;
  numeric: number | null;
}

/** Arabic-Indic digits are not used — Egyptian trade sheets read Western digits. */
function num(raw: string): number | null {
  const m = raw.replace(/[٫,]/g, ".").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/** `6"` → 6 inch. Handles the combined `10"-8"` kit sizes. */
function inch(raw: string): Labelled {
  const v = raw.trim();
  return {
    value: v,
    labelEn: v,
    labelAr: `${v.replace(/"/g, "")} بوصة`,
    numeric: num(v),
  };
}

function hp(raw: string): Labelled {
  const v = String(num(raw) ?? raw.trim());
  return { value: v, labelEn: `${v} HP`, labelAr: `${v} حصان`, numeric: num(v) };
}

function bar(raw: string): Labelled {
  const v = String(num(raw) ?? raw.trim());
  return { value: `${v} bar`, labelEn: `${v} bar`, labelAr: `${v} بار`, numeric: num(v) };
}

function mm2(raw: string): Labelled {
  const v = String(num(raw) ?? raw.trim());
  return { value: v, labelEn: `${v} mm²`, labelAr: `${v} مم²`, numeric: num(v) };
}

function mm(raw: string): Labelled {
  const v = String(num(raw) ?? raw.trim());
  return { value: `${v} mm`, labelEn: `${v} mm`, labelAr: `${v} مم`, numeric: num(v) };
}

function plain(raw: string): Labelled {
  const v = raw.trim();
  return { value: v, labelEn: v, labelAr: v, numeric: num(v) };
}

function stage(raw: string): Labelled {
  const v = String(num(raw) ?? raw.trim());
  return { value: v, labelEn: `${v} stage`, labelAr: `${v} مرحلة`, numeric: num(v) };
}

/**
 * The sheet spells stainless several ways — "(304)" and "(SS 304)" look like the same
 * alloy, but they carry different prices (6" 50 HP: 101,302 vs 129,675), so they are
 * genuinely different items and must NOT be merged. Only the display label is tidied;
 * `value` keeps the sheet's own wording so each stays a distinct selector option.
 */
const MATERIALS: Record<string, { en: string; ar: string }> = {
  "standard (cast iron)": { en: "Cast Iron", ar: "زهر" },
  "stainless steel": { en: "Stainless Steel", ar: "استانلس ستيل" },
  "stainless steel (304)": { en: "Stainless Steel 304", ar: "استانلس ستيل 304" },
  "stainless steel (ss 304)": { en: "Stainless Steel SS 304", ar: "استانلس ستيل SS 304" },
  "stainless steel (316)": { en: "Stainless Steel 316", ar: "استانلس ستيل 316" },
  "stainless steel (ss 316)": { en: "Stainless Steel SS 316", ar: "استانلس ستيل SS 316" },
};

function material(raw: string): Labelled {
  const hit = MATERIALS[raw.trim().toLowerCase()];
  if (!hit) return plain(raw);
  return { value: raw.trim(), labelEn: hit.en, labelAr: hit.ar, numeric: null };
}

// ---------------------------------------------------------------------------
// Sheet configuration
// ---------------------------------------------------------------------------

type Cells = (string | null)[];

interface OptionSpec {
  key: string;
  labelEn: string;
  labelAr: string;
  unit?: string;
  /** Reads the raw value for this axis out of a row; null omits the axis for that row. */
  read: (c: Cells) => Labelled | null;
}

interface DerivedSpec {
  key: string;
  labelEn: string;
  labelAr: string;
  col: number;
  /** Bare figures like "0.55 · 0.75" are unreadable — append the unit at import time. */
  suffix?: string;
}

interface SheetSpec {
  sheet: string;
  productSlug: string;
  priceCol: number;
  options: OptionSpec[];
  derived?: DerivedSpec[];
  /** Column whose repeated value marks a genuine duplicate row (e.g. turbine Model). */
  dedupeCol?: number;
  /** Product to create when the slug does not exist yet. */
  create?: {
    categorySlug: string;
    nameEn: string;
    nameAr: string;
    descEn: string;
    descAr: string;
    image: string;
    specsBlob: Record<string, unknown>;
  };
}

/** Standard cable cross-sections in mm², used to arbitrate name-vs-column conflicts. */
const STANDARD_MM2 = new Set([1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240]);

const SHEETS: SheetSpec[] = [
  {
    sheet: "UPVC Pipes",
    productSlug: "pipe-upvc-column",
    priceCol: 3,
    options: [
      { key: "diameter", labelEn: "Diameter", labelAr: "القطر", read: (c) => (c[1] ? inch(c[1]) : null) },
      { key: "pressure", labelEn: "Pressure Rating", labelAr: "درجة الضغط", unit: "bar", read: (c) => (c[2] ? bar(c[2]) : null) },
    ],
  },
  {
    sheet: "Submersible Motors",
    productSlug: "motor-hitemp",
    priceCol: 4,
    options: [
      { key: "diameter", labelEn: "Diameter", labelAr: "القطر", read: (c) => (c[1] ? inch(c[1]) : null) },
      { key: "hp", labelEn: "Power", labelAr: "القدرة", unit: "HP", read: (c) => (c[2] ? hp(c[2]) : null) },
      { key: "material", labelEn: "Material", labelAr: "الخامة", read: (c) => (c[3] ? material(c[3]) : null) },
    ],
  },
  {
    sheet: "Motor Winding Wire",
    productSlug: "elec-winding-wire",
    priceCol: 2,
    options: [
      { key: "wire", labelEn: "Wire Diameter", labelAr: "قطر السلك", unit: "mm", read: (c) => (c[1] ? mm(c[1]) : null) },
    ],
    create: {
      categorySlug: "electrical",
      nameEn: "Motor Winding Wire",
      nameAr: "سلك لف مواتير",
      descEn:
        "Enamelled copper winding wire for rewinding submersible and surface motors, stocked from 13 mm up to 31 mm.",
      descAr:
        "سلك نحاس معزول للف المواتير الغاطسة والسطحية، متوفر من مقاس 13 مم حتى 31 مم.",
      image: "/images/products/pmc-winding-wire.png",
      specsBlob: {
        specs: ["Enamelled Copper", "Submersible Grade", "13–31 mm"],
        variants: [],
        tableSpecsEn: { Material: "Enamelled copper", Application: "Motor rewinding" },
        tableSpecsAr: { "الخامة": "نحاس معزول", "الاستخدام": "لف المواتير" },
        featuresEn: [
          "High-temperature enamel insulation",
          "Consistent diameter tolerance for tight winding",
          "Suitable for submersible and surface motors",
        ],
        featuresAr: [
          "عزل يتحمل درجات الحرارة العالية",
          "دقة عالية في القطر للف محكم",
          "مناسب للمواتير الغاطسة والسطحية",
        ],
      },
    },
  },
  {
    // The sheet's Brand column reads UNTEL and its 3-core cross-sections span 6–95 mm²,
    // which is the Üntel H07VVH6-F flat cable ("3x10-3x120 mm²"), not the generic
    // submersible cable page.
    sheet: "Cables",
    productSlug: "cable-flat-untel",
    priceCol: 4,
    options: [
      {
        key: "section",
        labelEn: "Cross-Section",
        labelAr: "المقطع",
        unit: "mm²",
        // The name ("كابل 3*95") and the Cross-Section column disagree on three rows.
        // The name wins where it names a standard size; where it doesn't (3*11), the
        // column is the plausible one, so keep it and flag the row for the owner.
        read: (c) => {
          const col = c[3] ? num(c[3]) : null;
          const fromName = c[0] ? num(c[0].split("*").pop() ?? "") : null;
          if (fromName !== null && col !== null && fromName !== col) {
            if (STANDARD_MM2.has(fromName)) {
              corrections.push(
                `Cables "${c[0]}": cross-section ${col} → ${fromName} (taken from the name)`,
              );
              return mm2(String(fromName));
            }
            warnings.push(
              `Cables "${c[0]}": name says ${fromName} mm² but column says ${col} mm². ` +
                `${fromName} is not a standard size, so ${col} was used — please confirm.`,
            );
          }
          return col !== null ? mm2(String(col)) : null;
        },
      },
    ],
  },
  {
    sheet: "Pump Sets & Kits",
    productSlug: "thrust-bearing-heavy",
    priceCol: 3, // header cell is blank in the sheet
    options: [
      { key: "brand", labelEn: "Brand", labelAr: "الماركة", read: (c) => (c[1] ? plain(c[1]) : null) },
      { key: "diameter", labelEn: "Diameter", labelAr: "القطر", read: (c) => (c[2] ? inch(c[2]) : null) },
      {
        key: "port",
        labelEn: "Port Size",
        labelAr: "الفتحة",
        unit: "mm",
        // The Port Size column was dropped from this revision of the sheet, which made
        // AMBO 8" and KPS 8" look like duplicate rows. It survives inside the Arabic
        // description as "فتحة (25)", so recover it there.
        read: (c) => {
          const m = c[0]?.match(/فتحة\s*\(?\s*(\d+)\s*\)?/);
          if (!m) return null;
          corrections.push(`Kits "${c[0]?.trim()}": port size ${m[1]} recovered from the name`);
          return mm(m[1]);
        },
      },
    ],
  },
  {
    sheet: "Stainless Turbines",
    productSlug: "pump-submersible",
    priceCol: 9,
    dedupeCol: 5,
    options: [
      { key: "series", labelEn: "Model", labelAr: "الموديل", read: (c) => (c[1] ? plain(c[1]) : null) },
      { key: "stage", labelEn: "Stages", labelAr: "عدد المراحل", read: (c) => (c[2] ? stage(c[2]) : null) },
    ],
    derived: [
      { key: "model", labelEn: "Model Code", labelAr: "كود الموديل", col: 5 },
      { key: "motorKw", labelEn: "Motor (kW)", labelAr: "القدرة (كيلوواط)", col: 6, suffix: " kW" },
      { key: "motorHp", labelEn: "Motor (HP)", labelAr: "القدرة (حصان)", col: 7, suffix: " HP" },
      { key: "outlet", labelEn: "Outlet", labelAr: "المخرج", col: 8 },
    ],
  },
  {
    sheet: "Inverters",
    productSlug: "elec-inverter",
    priceCol: 4,
    options: [
      {
        key: "power",
        labelEn: "Power",
        labelAr: "القدرة",
        // kW and HP are the same axis in two units (19 values, 1:1), so they collapse
        // into one selector carrying both figures.
        read: (c) => {
          const kw = c[2] ? num(c[2]) : null;
          if (kw === null) return null;
          const power = c[3] ? num(c[3]) : null;
          const label = power !== null ? `${kw} kW / ${power} HP` : `${kw} kW`;
          const labelAr = power !== null ? `${kw} كيلوواط / ${power} حصان` : `${kw} كيلوواط`;
          return { value: String(kw), labelEn: label, labelAr, numeric: kw };
        },
      },
    ],
    derived: [{ key: "model", labelEn: "Model", labelAr: "الموديل", col: 1 }],
  },
];

// ---------------------------------------------------------------------------
// Workbook reading
// ---------------------------------------------------------------------------

/** exceljs hands back strings, numbers, formula results or rich-text objects. */
function cellText(value: ExcelJS.CellValue): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const v = value as { richText?: { text: string }[]; result?: unknown; text?: string };
    if (v.richText) return v.richText.map((t) => t.text).join("").trim() || null;
    if (v.result !== undefined) return cellText(v.result as ExcelJS.CellValue);
    if (v.text) return v.text.trim() || null;
  }
  return null;
}

function readRows(ws: ExcelJS.Worksheet): { rowNumber: number; cells: Cells }[] {
  const out: { rowNumber: number; cells: Cells }[] = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber < FIRST_DATA_ROW) return;
    const cells: Cells = [];
    for (let c = 0; c < 12; c++) cells.push(cellText(row.getCell(c + 1).value));
    if (cells[0]) out.push({ rowNumber, cells });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

interface ParsedRow {
  comboKey: string;
  selections: Record<string, string>;
  specs: Record<string, string>;
  price: number | null;
  sortKey: number[];
}

async function resolveProductId(spec: SheetSpec): Promise<string | null> {
  const existing = await prisma.product.findUnique({
    where: { slug: spec.productSlug },
    select: { id: true },
  });
  if (existing) return existing.id;

  if (!spec.create) {
    warnings.push(`Sheet "${spec.sheet}": product "${spec.productSlug}" not found — skipped`);
    return null;
  }

  const category = await prisma.category.findUnique({
    where: { slug: spec.create.categorySlug },
    select: { id: true },
  });
  if (!category) {
    warnings.push(`Sheet "${spec.sheet}": category "${spec.create.categorySlug}" missing — skipped`);
    return null;
  }

  const created = await prisma.product.create({
    data: {
      slug: spec.productSlug,
      categoryId: category.id,
      nameEn: spec.create.nameEn,
      nameAr: spec.create.nameAr,
      descEn: spec.create.descEn,
      descAr: spec.create.descAr,
      images: JSON.stringify([spec.create.image]),
      specs: JSON.stringify(spec.create.specsBlob),
    },
    select: { id: true },
  });
  corrections.push(`Created new product "${spec.productSlug}" (${spec.create.nameEn})`);
  return created.id;
}

async function importSheet(wb: ExcelJS.Workbook, spec: SheetSpec) {
  const ws = wb.getWorksheet(spec.sheet);
  if (!ws) {
    warnings.push(`Sheet "${spec.sheet}" not found in the workbook`);
    return;
  }

  const productId = await resolveProductId(spec);
  if (!productId) return;

  const rows = readRows(ws);

  // Collect option values in first-seen order, then sort numerically below.
  const optionValues = new Map<string, Map<string, Labelled>>();
  for (const o of spec.options) optionValues.set(o.key, new Map());

  const byCombo = new Map<string, ParsedRow>();
  const seenDedupe = new Set<string>();
  let merged = 0;

  for (const { rowNumber, cells } of rows) {
    if (spec.dedupeCol !== undefined) {
      const key = cells[spec.dedupeCol];
      if (key) {
        if (seenDedupe.has(key)) {
          corrections.push(
            `${spec.sheet} row ${rowNumber}: duplicate of "${key}" dropped`,
          );
          continue;
        }
        seenDedupe.add(key);
      }
    }

    const selections: Record<string, string> = {};
    const sortKey: number[] = [];
    for (const o of spec.options) {
      const labelled = o.read(cells);
      if (!labelled) {
        sortKey.push(Number.NEGATIVE_INFINITY);
        continue;
      }
      selections[o.key] = labelled.value;
      optionValues.get(o.key)!.set(labelled.value, labelled);
      sortKey.push(labelled.numeric ?? Number.NEGATIVE_INFINITY);
    }

    if (Object.keys(selections).length === 0) {
      warnings.push(`${spec.sheet} row ${rowNumber}: no selectable attributes — skipped`);
      continue;
    }

    const specs: Record<string, string> = {};
    for (const d of spec.derived ?? []) {
      const v = cells[d.col];
      if (v) specs[d.key] = d.suffix ? `${v}${d.suffix}` : v;
    }

    const priceRaw = cells[spec.priceCol];
    const price = priceRaw ? num(priceRaw) : null;
    if (price === null) {
      warnings.push(`${spec.sheet} row ${rowNumber}: no usable price ("${priceRaw ?? ""}")`);
    }

    const comboKey = Object.keys(selections)
      .sort()
      .map((k) => `${k}=${selections[k]}`)
      .join(";");

    // A repeated combination is not necessarily a mistake. The turbine sheet lists the
    // same series+stage two or three times as "A"/"AA"/"AAA" motor trims — same pump
    // end, different motor pairing, and verified to always carry the same price. Those
    // rows merge into one variant whose derived specs list every compatible motor.
    const clash = byCombo.get(comboKey);
    if (clash) {
      if (clash.price !== null && price !== null && clash.price !== price) {
        warnings.push(
          `${spec.sheet} row ${rowNumber}: "${comboKey}" repeats with a different price ` +
            `(${clash.price} vs ${price}) — kept ${clash.price}`,
        );
      }
      for (const [k, v] of Object.entries(specs)) {
        const prev = clash.specs[k];
        if (!prev) clash.specs[k] = v;
        else if (!prev.split(" / ").includes(v)) clash.specs[k] = `${prev} / ${v}`;
      }
      merged++;
      continue;
    }

    byCombo.set(comboKey, { comboKey, selections, specs, price, sortKey });
  }

  // --- options + their values -------------------------------------------------
  for (const [i, o] of spec.options.entries()) {
    const values = [...optionValues.get(o.key)!.values()];
    if (values.length === 0) continue;

    const option = await prisma.productOption.upsert({
      where: { productId_key: { productId, key: o.key } },
      update: { labelEn: o.labelEn, labelAr: o.labelAr, unit: o.unit ?? null, sortOrder: i },
      create: {
        productId,
        key: o.key,
        labelEn: o.labelEn,
        labelAr: o.labelAr,
        unit: o.unit ?? null,
        sortOrder: i,
      },
      select: { id: true },
    });

    values.sort((a, b) => {
      if (a.numeric !== null && b.numeric !== null) return a.numeric - b.numeric;
      return a.labelEn.localeCompare(b.labelEn);
    });

    for (const [vi, v] of values.entries()) {
      await prisma.productOptionValue.upsert({
        where: { optionId_value: { optionId: option.id, value: v.value } },
        update: { labelEn: v.labelEn, labelAr: v.labelAr, numeric: v.numeric, sortOrder: vi },
        create: {
          optionId: option.id,
          value: v.value,
          labelEn: v.labelEn,
          labelAr: v.labelAr,
          numeric: v.numeric,
          sortOrder: vi,
        },
      });
    }

    // Drop values that vanished from the sheet.
    await prisma.productOptionValue.deleteMany({
      where: { optionId: option.id, value: { notIn: values.map((v) => v.value) } },
    });
  }

  // --- variants ---------------------------------------------------------------
  const parsed = [...byCombo.values()];
  parsed.sort((a, b) => {
    for (let i = 0; i < Math.max(a.sortKey.length, b.sortKey.length); i++) {
      const d = (a.sortKey[i] ?? 0) - (b.sortKey[i] ?? 0);
      if (d !== 0 && Number.isFinite(d)) return d;
    }
    return a.comboKey.localeCompare(b.comboKey);
  });

  let created = 0;
  let updated = 0;
  for (const [i, p] of parsed.entries()) {
    const data = {
      selections: JSON.stringify(p.selections),
      specs: JSON.stringify(p.specs),
      price: p.price,
      sortOrder: i,
      isActive: true,
    };
    const existing = await prisma.productVariant.findUnique({
      where: { productId_comboKey: { productId, comboKey: p.comboKey } },
      select: { id: true },
    });
    if (existing) updated++;
    else created++;

    await prisma.productVariant.upsert({
      where: { productId_comboKey: { productId, comboKey: p.comboKey } },
      update: data,
      create: { productId, comboKey: p.comboKey, ...data },
    });
  }

  const removed = await prisma.productVariant.deleteMany({
    where: { productId, comboKey: { notIn: parsed.map((p) => p.comboKey) } },
  });

  const prices = parsed.map((p) => p.price).filter((p): p is number => p !== null);
  await prisma.product.update({
    where: { id: productId },
    data: {
      priceMin: prices.length ? Math.min(...prices) : null,
      priceMax: prices.length ? Math.max(...prices) : null,
    },
  });

  const range = prices.length
    ? `${Math.min(...prices).toLocaleString()}–${Math.max(...prices).toLocaleString()} EGP`
    : "no prices";
  console.log(
    `  ${spec.sheet.padEnd(20)} → ${spec.productSlug.padEnd(22)} ` +
      `${String(parsed.length).padStart(3)} variants ` +
      `(+${created} new, ${updated} updated${removed.count ? `, −${removed.count} removed` : ""}` +
      `${merged ? `, ${merged} motor trims merged` : ""})  ${range}`,
  );
}

async function main() {
  const file = path.resolve(WORKBOOK);
  console.log(`Reading ${file}\n`);

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);

  for (const spec of SHEETS) await importSheet(wb, spec);

  // Every variant in the database comes from this script, so a product that is no
  // longer any sheet's target must be released — otherwise remapping a sheet to a
  // different product leaves the old one showing prices that nothing maintains.
  const owned = SHEETS.map((s) => s.productSlug);
  const orphans = await prisma.product.findMany({
    where: { slug: { notIn: owned }, variants: { some: {} } },
    select: { id: true, slug: true, _count: { select: { variants: true } } },
  });
  for (const o of orphans) {
    await prisma.productVariant.deleteMany({ where: { productId: o.id } });
    await prisma.productOption.deleteMany({ where: { productId: o.id } });
    await prisma.product.update({
      where: { id: o.id },
      data: { priceMin: null, priceMax: null },
    });
    corrections.push(
      `Released "${o.slug}": ${o._count.variants} variants cleared — no sheet maps to it any more`,
    );
  }

  const total = await prisma.productVariant.count();
  console.log(`\n✔ ${total} variants in the catalogue`);

  if (corrections.length) {
    console.log(`\nCorrections applied (${corrections.length}):`);
    for (const c of [...new Set(corrections)]) console.log(`  • ${c}`);
  }
  if (warnings.length) {
    console.log(`\n⚠ Needs your review (${warnings.length}):`);
    for (const w of [...new Set(warnings)]) console.log(`  • ${w}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
