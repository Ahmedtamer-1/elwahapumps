/**
 * Extracts Kurlar submersible-pump performance tables and the KM motor ladder
 * out of the two PDF catalogues in public/Catalogue, into:
 *
 *   src/data/pump-curves.json   6"/8"/10" KP (bolted SS) + KSX (cast SS) families
 *   src/data/km-motors.json     the 49 real KM6/7/8/10 motor codes
 *
 * Run with:  node scripts/extract-pump-curves.mjs
 * Then:      node scripts/verify-pump-curves.mjs   <- must pass before the data is used
 *
 * Why `pdftotext -table` and not `-layout`: this is Xpdf's pdftotext (v4.00), whose
 * `-table` mode reconstructs one output line per table row. Plain `-layout` merges
 * adjacent numeric cells ("3 4" -> "34") and splits tall rows across two lines,
 * both of which silently corrupt head values. `-table` does neither.
 *
 * The 4" KPN/KPS families are deliberately skipped — out of scope for v1.
 */

import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOGUE_DIR = join(ROOT, "public", "Catalogue");
const DATA_DIR = join(ROOT, "src", "data");

const KSX_PDF = join(CATALOGUE_DIR, "KSX Catalogue.pdf");
const KURLAR_PDF = join(CATALOGUE_DIR, "Kurlar-Product-Catalogue-2025.pdf");

/** Page (1-based) holding the KM motor ladder in the Kurlar catalogue. */
const MOTOR_PAGE = 38;

/**
 * Families we expect to find, as a tripwire: if the PDFs are ever replaced and a
 * family disappears (or a new one appears), extraction fails loudly instead of
 * quietly shipping a smaller catalogue.
 */
const EXPECTED_FAMILIES = [
  "K6SX-36", "K6SX-48", "K6SX-60", "K6SX-72",
  "K8SX-80", "K8SX-96", "K8SX-112", "K8SX-128", "K8SX-144",
  "K10SX-200", "K10SX-225", "K10SX-250", "K10SX-275",
  "KP-610", "KP-617", "KP-624", "KP-630", "KP-638", "KP-646", "KP-660",
  "KP-877", "KP-895", "KP-898",
  "KP-10110", "KP-10125", "KP-10160", "KP-10215",
];

// ---------------------------------------------------------------------------
// pdftotext
// ---------------------------------------------------------------------------

function pageText(pdfPath, page) {
  // latin1: the Turkish glyphs come out mangled either way and we only read
  // ASCII tokens (model codes, numbers). Decoding as utf8 would throw.
  const buf = execFileSync(
    "pdftotext",
    ["-table", "-f", String(page), "-l", String(page), pdfPath, "-"],
    { maxBuffer: 32 * 1024 * 1024 },
  );
  return buf.toString("latin1");
}

function pageCount(pdfPath) {
  // Xpdf's pdftotext has no -info; dump everything once and count form feeds.
  const buf = execFileSync("pdftotext", ["-table", pdfPath, "-"], {
    maxBuffer: 64 * 1024 * 1024,
  });
  return buf.toString("latin1").split("\f").length;
}

// ---------------------------------------------------------------------------
// parsing helpers
// ---------------------------------------------------------------------------

/** Kurlar writes decimals with either separator, sometimes both on one page. */
function num(token) {
  const n = Number(String(token).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function isNumeric(token) {
  return /^\d+(?:[.,]\d+)?$/.test(token);
}

/** `6''-7''-8''` or `6"-7"-8"` -> [6, 7, 8] */
function parseBores(token) {
  if (!/^\d+(?:''|")(?:-\d+(?:''|"))*$/.test(token)) return null;
  return token.split("-").map((part) => parseInt(part, 10));
}

/**
 * Model code -> { bore, qNom }. The digits in a Kurlar code are the bore
 * followed by the nominal (best-efficiency) flow in m3/h:
 *   K6SX-36  -> 6",  36 m3/h        KP-610    -> 6",  10 m3/h
 *   K10SX-250-> 10", 250 m3/h       KP-10160  -> 10", 160 m3/h
 * Note qNom is the model's nominal duty, which usually but NOT always coincides
 * with one of the printed flow breakpoints (KP-630's are 0/8/16/24/28/32/39).
 */
function parseFamilyCode(code) {
  const ksx = code.match(/^K(6|8|10)SX-(\d+)$/);
  if (ksx) {
    return { series: "KSX", boreInch: Number(ksx[1]), qNomM3h: Number(ksx[2]) };
  }
  const kp = code.match(/^KP-(\d+)$/);
  if (kp) {
    const digits = kp[1];
    if (digits.startsWith("10") && digits.length >= 4) {
      return { series: "KP", boreInch: 10, qNomM3h: Number(digits.slice(2)) };
    }
    return {
      series: "KP",
      boreInch: Number(digits[0]),
      qNomM3h: Number(digits.slice(1)),
    };
  }
  return null;
}

/**
 * Flow breakpoints. The header is two lines: `l/s  0 5.55 11.11 ...` and
 * `m3/h  0 20 40 ...`. Take numeric tokens after the unit label and stop at the
 * first non-numeric one (`INCH (")` / `CIKIS`), which ends the flow block.
 */
function parseFlowRow(line, label) {
  const idx = line.indexOf(label);
  if (idx === -1) return null;
  const tokens = line.slice(idx + label.length).trim().split(/\s+/);
  const values = [];
  for (const token of tokens) {
    if (!isNumeric(token)) break;
    values.push(num(token));
  }
  return values.length >= 4 ? values : null;
}

const MODEL_RE = /(K(?:6|8|10)SX-\d+\/\d+[AB]{0,2}|KP[\s-]?\d+\/\d+)/;

/**
 * One table row -> a variant, or null if the line isn't a data row.
 *
 * Layout after the model code:
 *   <bores> <kW> <HP> <head x N> [outlet tokens] <length mm> <weight kg> [chart noise]
 *
 * Heads are taken by count (N = number of flow breakpoints) rather than by column
 * position: `-table` re-derives column boundaries per row group, so x-positions
 * wobble between rows while the token count never does. Length is then the first
 * integer >= 350 that follows (no head or outlet value reaches that), and weight
 * is the token right after it. Everything beyond is the component-list and
 * performance-chart text sharing the page, and is discarded.
 */
function parseVariantRow(line, expectedHeadCount) {
  const match = line.match(MODEL_RE);
  if (!match) return null;

  let model = match[1].replace(/\s+/g, "-").replace(/^KP-?/, "KP-");
  let rest = line.slice(match.index + match[1].length).replace(/H\(m\)/g, " ");

  // Trim variants (reduced-impeller builds) are a separate product and must be
  // kept. KSX attaches them to the code (K10SX-250/1B); KP puts them in the next
  // column (KP-10160/01 A).
  let trim = null;
  const attached = model.match(/\/(\d+)(A{1,2}|B{1,2})$/);
  const separate = rest.match(/^\s+(A{1,2}|B{1,2})(?=\s)/);
  if (attached) {
    trim = attached[2];
    model = model.slice(0, model.length - trim.length);
  } else if (separate) {
    trim = separate[1];
    rest = rest.slice(separate[0].length);
  }

  const stages = Number(model.split("/")[1]);
  if (!Number.isFinite(stages) || stages < 1) return null;

  const tokens = rest.trim().split(/\s+/).filter(Boolean);
  let i = 0;

  const bores = parseBores(tokens[i]);
  if (!bores) return null;
  i += 1;

  if (!isNumeric(tokens[i]) || !isNumeric(tokens[i + 1])) return null;
  const motorKw = num(tokens[i]);
  const motorHp = num(tokens[i + 1]);
  i += 2;

  const headsM = [];
  while (headsM.length < expectedHeadCount && i < tokens.length) {
    if (!isNumeric(tokens[i])) break;
    headsM.push(num(tokens[i]));
    i += 1;
  }
  if (headsM.length !== expectedHeadCount) return null;

  // Outlet cells are vertically merged in the PDF, so a given row may carry a
  // fragment ("+", "FLANGE", "DN", "80") or nothing at all. Collect whatever is
  // here for reference; the authoritative value comes from the page footer.
  const outletTokens = [];
  let lengthMm = null;
  let weightKg = null;
  for (; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (isNumeric(token) && num(token) >= 350 && Number.isInteger(num(token))) {
      lengthMm = num(token);
      const next = tokens[i + 1];
      if (next && isNumeric(next)) weightKg = num(next);
      break;
    }
    outletTokens.push(token);
  }
  if (lengthMm === null || weightKg === null) return null;

  return {
    model,
    stages,
    trim,
    motorKw,
    motorHp,
    motorBores: bores,
    headsM,
    outletRaw: outletTokens.join(" ").trim() || null,
    lengthMm,
    weightKg,
  };
}

/** `Outlet Connection / Ciki Baglantisi` in the page footer, e.g. `BSP 4"`. */
function parseOutletFromFooter(lines) {
  for (let i = 0; i < lines.length; i += 1) {
    const idx = lines[i].indexOf("Outlet Connection");
    if (idx === -1) continue;
    // The value sits on the following line, in the same column.
    const below = lines[i + 1];
    if (!below) continue;
    const value = below.slice(idx).trim().split(/\s{2,}/)[0];
    if (value) return value;
  }
  return null;
}

// ---------------------------------------------------------------------------
// page -> family
// ---------------------------------------------------------------------------

function parsePumpPage(text, pageNo, sourceFile) {
  const lines = text.split("\n");

  const flowLs = lines.map((l) => parseFlowRow(l, "l/s")).find(Boolean);
  const flowM3h = lines.map((l) => parseFlowRow(l, "m3/h")).find(Boolean);
  if (!flowLs || !flowM3h) return null;
  if (flowLs.length !== flowM3h.length) {
    throw new Error(
      `${sourceFile} p${pageNo}: flow header mismatch — ${flowLs.length} l/s values vs ${flowM3h.length} m3/h values`,
    );
  }

  const variants = [];
  for (const line of lines) {
    const variant = parseVariantRow(line, flowM3h.length);
    if (variant) variants.push(variant);
  }
  if (variants.length < 3) return null;

  const familyCode = variants[0].model.split("/")[0];
  const meta = parseFamilyCode(familyCode);
  if (!meta) return null;

  // A page holds exactly one family; anything else means the row regex leaked.
  const strays = variants.filter((v) => v.model.split("/")[0] !== familyCode);
  if (strays.length > 0) {
    throw new Error(
      `${sourceFile} p${pageNo}: expected only ${familyCode} but also matched ${[
        ...new Set(strays.map((v) => v.model.split("/")[0])),
      ].join(", ")}`,
    );
  }

  return {
    code: familyCode,
    series: meta.series,
    boreInch: meta.boreInch,
    qNomM3h: meta.qNomM3h,
    productSlug: meta.series === "KSX" ? "pump-cast-stainless" : "pump-submersible",
    outlet: parseOutletFromFooter(lines),
    flowPointsM3h: flowM3h,
    flowPointsLs: flowLs,
    sourcePdf: sourceFile,
    sourcePage: pageNo,
    variants: variants.map(({ outletRaw, ...v }) => v),
  };
}

function extractFamilies(pdfPath, label) {
  const total = pageCount(pdfPath);
  const families = [];
  for (let page = 1; page <= total; page += 1) {
    const family = parsePumpPage(pageText(pdfPath, page), page, label);
    if (family) families.push(family);
  }
  return families;
}

// ---------------------------------------------------------------------------
// KM motor ladder
// ---------------------------------------------------------------------------

/**
 * Page 38 lists every motor as `KM6-30  30  22  3x6  1  3x4  2  4  15`
 * = code, HP, kW, then cable-selection data (D.O.L. mm2 / runs, wye-delta mm2 /
 * runs, max cable length m, max starts/hour). Only code/HP/kW are taken here;
 * the cable columns are where a future cable-sizing feature would read from.
 */
function extractMotors(pdfPath) {
  const text = pageText(pdfPath, MOTOR_PAGE);
  const byCode = new Map();
  for (const line of text.split("\n")) {
    const m = line.match(/\b(KM(6|7|8|10)-(\d+(?:\.\d+)?))\s+([\d.,]+)\s+([\d.,]+)\b/);
    if (!m) continue;
    const [, code, bore, hpFromCode, hp, kw] = m;
    if (num(hp) !== num(hpFromCode)) {
      throw new Error(
        `motor ${code}: HP column ${hp} disagrees with the code suffix ${hpFromCode}`,
      );
    }
    byCode.set(code, {
      code,
      boreInch: Number(bore),
      hp: num(hp),
      kw: num(kw),
    });
  }
  return [...byCode.values()].sort((a, b) => a.boreInch - b.boreInch || a.hp - b.hp);
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
  for (const pdf of [KSX_PDF, KURLAR_PDF]) {
    if (!existsSync(pdf)) throw new Error(`missing catalogue PDF: ${pdf}`);
  }

  console.log("Extracting KSX catalogue…");
  const ksx = extractFamilies(KSX_PDF, "KSX Catalogue.pdf");
  console.log(`  ${ksx.length} families, ${ksx.reduce((n, f) => n + f.variants.length, 0)} variants`);

  console.log("Extracting Kurlar 2025 catalogue…");
  const kurlarAll = extractFamilies(KURLAR_PDF, "Kurlar-Product-Catalogue-2025.pdf");
  // 4" KPN/KPS never match parseFamilyCode, so they drop out on their own; this
  // guard is for anything else unexpected (e.g. a future 12" line).
  const kp = kurlarAll.filter((f) => f.boreInch >= 6);
  console.log(`  ${kp.length} families, ${kp.reduce((n, f) => n + f.variants.length, 0)} variants`);

  const families = [...ksx, ...kp];

  const found = families.map((f) => f.code).sort();
  const missing = EXPECTED_FAMILIES.filter((c) => !found.includes(c));
  const unexpected = found.filter((c) => !EXPECTED_FAMILIES.includes(c));
  if (missing.length || unexpected.length) {
    throw new Error(
      `family set changed — missing: [${missing.join(", ")}], unexpected: [${unexpected.join(", ")}]`,
    );
  }

  console.log("Extracting KM motor ladder…");
  const motors = extractMotors(KURLAR_PDF);
  console.log(`  ${motors.length} motor codes`);

  writeFileSync(
    join(DATA_DIR, "pump-curves.json"),
    `${JSON.stringify(families, null, 2)}\n`,
  );
  writeFileSync(
    join(DATA_DIR, "km-motors.json"),
    `${JSON.stringify(motors, null, 2)}\n`,
  );

  const totalVariants = families.reduce((n, f) => n + f.variants.length, 0);
  console.log(
    `\nWrote src/data/pump-curves.json (${families.length} families, ${totalVariants} variants)`,
  );
  console.log(`Wrote src/data/km-motors.json (${motors.length} motors)`);
  console.log("\nNow run: node scripts/verify-pump-curves.mjs");
}

main();
