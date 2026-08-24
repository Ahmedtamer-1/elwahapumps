/**
 * Adds the two Tormac catalogue entries — TS series submersible pumps and ECO
 * series submersible motors — with their Diameter × Power selectors.
 *
 *   npx tsx prisma/add-tormac.ts
 *
 * Re-runnable, like prisma/import-catalog.ts: products are matched on slug and
 * variants on @@unique([productId, comboKey]), so running it again refreshes the
 * technical data in place instead of duplicating it. Prices are deliberately
 * left null — El Waha's price sheet does not cover Tormac yet, so every variant
 * shows "Price on request" until the owner types a figure into /admin/products.
 *
 * Every figure below is transcribed from the two catalogues in public/Catalogue:
 *   Tormac Submersible Pumps_50Hz.pdf   — "Pump Operating Limitations" (p.5) and
 *                                          the per-model kW/HP performance tables
 *   Tormac Submersible Motor 50Hz.pdf   — "Electrical Data" (p.23-25) and
 *                                          "Technical Data" (p.20-22)
 *
 * The power axis stops at 150 HP on both products. Larger frames exist in the
 * catalogues (10" motors to 250 HP, 10" pumps to 300 HP) but El Waha does not
 * stock above 150 HP, so listing them would quote what cannot be supplied.
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/** Nothing above this is offered — see the file header. */
const MAX_HP = 150;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * The catalogues quote both units on every row and buyers here ask in HP, so HP
 * is the selector and kW is revealed after the choice. This is the pairing both
 * Tormac catalogues use — it is a fixed frame table, not a 0.746 conversion
 * (4 kW is sold as 5.5 HP, 9.3 kW as 12.5 HP).
 */
const HP_TO_KW: Record<number, number> = {
  0.5: 0.37,
  0.75: 0.55,
  1: 0.75,
  1.5: 1.1,
  2: 1.5,
  3: 2.2,
  4: 3,
  5: 3.7,
  5.5: 4,
  6: 4.5,
  7.5: 5.5,
  10: 7.5,
  12.5: 9.3,
  15: 11,
  17.5: 13,
  20: 15,
  25: 18.5,
  30: 22,
  35: 26,
  40: 30,
  50: 37,
  60: 45,
  75: 55,
  85: 63,
  100: 75,
  125: 93,
  150: 110,
};

interface OptionValueSpec {
  value: string;
  labelEn: string;
  labelAr: string;
  numeric: number | null;
}

interface OptionSpec {
  key: string;
  labelEn: string;
  labelAr: string;
  unit?: string;
  values: OptionValueSpec[];
}

interface VariantSpec {
  selections: Record<string, string>;
  /** Revealed on the detail page once a combination is chosen. */
  specs: Record<string, string>;
}

interface ProductSpec {
  slug: string;
  categorySlug: string;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  image: string;
  specsBlob: Record<string, unknown>;
  options: OptionSpec[];
  variants: VariantSpec[];
}

function diameterValue(inches: string): OptionValueSpec {
  return {
    value: inches,
    labelEn: inches,
    labelAr: `${inches.replace(/"/g, "")} بوصة`,
    numeric: Number.parseFloat(inches),
  };
}

function hpValue(hp: number): OptionValueSpec {
  return {
    value: String(hp),
    labelEn: `${hp} HP`,
    labelAr: `${hp} حصان`,
    numeric: hp,
  };
}

/** Option keys sorted alphabetically, matching prisma/import-catalog.ts. */
function comboKeyOf(selections: Record<string, string>): string {
  return Object.keys(selections)
    .sort()
    .map((k) => `${k}=${selections[k]}`)
    .join(";");
}

// ---------------------------------------------------------------------------
// Pumps — Tormac TS series
// ---------------------------------------------------------------------------

/**
 * Power ratings actually published for each bore size, read off the per-model
 * performance tables (TS 100-1 … TS 250-215) and cross-checked against the
 * "Pump Operating Limitations" table on page 5.
 *
 * The 4" list runs past that table's 11 kW ceiling because TS 100-8-66-6 and
 * -73-6 are 13 kW: the trailing "-6" in the model code is Tormac's marker for a
 * 4" pump end driven by a 6" motor, which the catalogue's model classification
 * spells out. They are genuine catalogue items, so they are listed.
 */
const PUMP_HP_BY_DIAMETER: Record<string, number[]> = {
  '4"': [0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 5.5, 7.5, 10, 12.5, 15, 17.5],
  '6"': [1, 2, 3, 4, 5, 5.5, 7.5, 10, 12.5, 15, 17.5, 20, 25, 30, 35, 40, 50, 60, 75, 85],
  '8"': [7.5, 12.5, 15, 17.5, 20, 25, 30, 35, 40, 50, 60, 75, 85, 100, 125, 150],
  '10"': [12.5, 15, 17.5, 20, 25, 30, 35, 40, 50, 60, 75, 85, 100, 125, 150],
};

/** "Pump Operating Limitations - TS Series", catalogue page 5, verbatim. */
const PUMP_LIMITS: Record<
  string,
  { series: string; dischargeM3h: string; headM: string; delivery: string; pressure: string }
> = {
  '4"': { series: "TS 100", dischargeM3h: "0.4 – 19 m³/h", headM: "4 – 535 m", delivery: "32, 40 & 50 mm", pressure: "5.4 MPa (54 bar)" },
  '6"': { series: "TS 150", dischargeM3h: "7 – 120 m³/h", headM: "4.5 – 870 m", delivery: "50, 65, 80 & 100 mm", pressure: "8.5 MPa (85 bar)" },
  '8"': { series: "TS 200", dischargeM3h: "20 – 126 m³/h", headM: "8 – 518 m", delivery: "100 & 125 mm", pressure: "5.2 MPa (52 bar)" },
  '10"': { series: "TS 250", dischargeM3h: "18 – 280 m³/h", headM: "6 – 488 m", delivery: "150 mm", pressure: "4.9 MPa (49 bar)" },
};

const PUMP_DIAMETERS = Object.keys(PUMP_HP_BY_DIAMETER);

function buildPump(): ProductSpec {
  const variants: VariantSpec[] = [];
  for (const diameter of PUMP_DIAMETERS) {
    const limits = PUMP_LIMITS[diameter];
    for (const hp of PUMP_HP_BY_DIAMETER[diameter]) {
      if (hp > MAX_HP) continue;
      variants.push({
        selections: { diameter, hp: String(hp) },
        specs: {
          series: `${limits.series} (${diameter})`,
          motorKw: `${HP_TO_KW[hp]} kW`,
          discharge: limits.dischargeM3h,
          head: limits.headM,
          delivery: limits.delivery,
        },
      });
    }
  }

  const usedHp = [
    ...new Set(PUMP_DIAMETERS.flatMap((d) => PUMP_HP_BY_DIAMETER[d]).filter((h) => h <= MAX_HP)),
  ].sort((a, b) => a - b);

  return {
    slug: "pump-tormac-ts",
    categorySlug: "pumps",
    nameEn: "Tormac Stainless Steel Submersible Pumps",
    nameAr: "طلمبات تورماك الغاطسة استانلس ستيل",
    descEn:
      'Tormac TS series borehole submersible pumps in fully stainless steel construction — AISI 304 as version TS, AISI 316 as version TN — for 4", 6", 8" and 10" wells. Discharge from 0.4 to 280 m³/h and total head to 870 m at 2900 rpm, with NEMA-standard spline coupling and performance certified to ISO 9906:2012 Grade 3B. Manufactured in ISO 9001 facilities.',
    descAr:
      'طلمبات تورماك الغاطسة سلسلة TS لآبار الأعماق، بتصنيع كامل من الاستانلس ستيل — درجة AISI 304 في الإصدار TS ودرجة AISI 316 في الإصدار TN — لآبار مقاس 4 و6 و8 و10 بوصة. تصريف من 0.4 حتى 280 م³/ساعة ورفع كلي حتى 870 متر على سرعة 2900 لفة/دقيقة، مع وصلة إسبلاين بمواصفة NEMA وأداء معتمد وفق ISO 9906:2012 درجة 3B. مصنّعة في منشآت معتمدة بشهادة ISO 9001.',
    image: "/images/products/pump-tormac-ts.jpeg",
    specsBlob: {
      specs: ["AISI 304 / 316", '4" – 10"', "0.4–280 m³/h"],
      modelNo: "TS - TN",
      // The public selector is driven by the priced ProductOption rows below;
      // this block is the static summary the detail page shows above them.
      variants: [
        {
          labelEn: "Diameter",
          labelAr: "القطر",
          options: PUMP_DIAMETERS.map((d) => ({ id: d.replace(/"/g, "in"), name: d })),
        },
      ],
      tableSpecsEn: {
        Series: "TS (AISI 304) / TN (AISI 316)",
        "Nominal Diameter": '4", 6", 8", 10"',
        "Power Range": "0.37 kW – 220 kW",
        Speed: "2900 rpm",
        "Discharge Range": "0.4 – 280 m³/h",
        "Total Head Range": "4 – 870 m",
        "Max Operating Pressure": "Up to 8.5 MPa (85 bar)",
        "Shaft Coupling": 'Splines (Keyway / Splines on 10")',
        "Horizontal Installation": "Minimum 30° angle",
        "Water Temperature (max)": "NBR 35°C / Viton 50°C",
        "Permissible Sand": "50 g/m³ (max.)",
      },
      tableSpecsAr: {
        "السلسلة": "TS (استانلس 304) / TN (استانلس 316)",
        "القطر الاسمي": "4، 6، 8، 10 بوصة",
        "مدى القدرة": "0.37 – 220 كيلوواط",
        "السرعة": "2900 لفة/دقيقة",
        "مدى التصريف": "0.4 – 280 م³/ساعة",
        "مدى الرفع الكلي": "4 – 870 متر",
        "أقصى ضغط تشغيل": "حتى 8.5 ميجاباسكال (85 بار)",
        "وصلة العمود": "إسبلاين (خابور/إسبلاين في مقاس 10 بوصة)",
        "التركيب الأفقي": "بزاوية 30 درجة كحد أدنى",
        "درجة حرارة الماء (قصوى)": "NBR 35°م / Viton 50°م",
        "نسبة الرمل المسموحة": "50 جم/م³ كحد أقصى",
      },
      featuresEn: [
        "Fully stainless steel casing, impellers and diffusers (AISI 304 or 316)",
        "Individual stage casing — each stage is separately replaceable",
        "Built-in check valve and suction inter-connector losses included in the published curves",
        "Rated for continuous duty at 2900 rpm on 50 Hz supply",
        "Handles up to 50 g/m³ of sand without derating",
      ],
      featuresAr: [
        "جسم ومراوح وموزّعات من الاستانلس ستيل بالكامل (درجة 304 أو 316)",
        "كل مرحلة في جسم مستقل — يمكن استبدال المرحلة وحدها",
        "محبس عدم رجوع مدمج، وخسائره محتسبة داخل منحنيات الأداء المنشورة",
        "مصممة للتشغيل المستمر على 2900 لفة/دقيقة وتردد 50 هرتز",
        "تتحمل حتى 50 جم/م³ من الرمال دون خفض الأداء",
      ],
      specGroups: [
        {
          title: "Pump Operating Limitations — TS Series",
          subtitle: `Tormac Submersible Pumps 50 Hz catalogue, page 5 · powers listed here run to ${MAX_HP} HP`,
          columnsEn: ["Specification", '4"', '6"', '8"', '10"'],
          columnsAr: ["البيان", "4 بوصة", "6 بوصة", "8 بوصة", "10 بوصة"],
          rows: [
            { type: "Power Range", values: ["0.37–11 kW", "0.55–75 kW", "5.5–130 kW", "9.3–220 kW"] },
            { type: "Speed", values: ["2900 rpm", "2900 rpm", "2900 rpm", "2900 rpm"] },
            { type: "Discharge (m³/h)", values: ["0.4 – 19", "7 – 120", "20 – 126", "18 – 280"] },
            { type: "Discharge (lpm)", values: ["7.2 – 317", "116.4 – 2000", "330 – 2100", "300 – 4667"] },
            { type: "Total Head (m)", values: ["4 – 535", "4.5 – 870", "8 – 518", "6 – 488"] },
            { type: "Total Head (ft)", values: ["13 – 1755", "15 – 2788", "26.24 – 1700", "19.68 – 1600"] },
            { type: "Delivery Size", values: ["32, 40 & 50 mm", "50, 65, 80 & 100 mm", "100 & 125 mm", "150 mm"] },
            { type: "Max Operating Pressure", values: ["5.4 MPa (54 bar)", "8.5 MPa (85 bar)", "5.2 MPa (52 bar)", "4.9 MPa (49 bar)"] },
            { type: "Shaft Coupling", values: ["Splines", "Splines", "Splines", "Keyway / Splines"] },
          ],
        },
      ],
    },
    options: [
      {
        key: "diameter",
        labelEn: "Diameter",
        labelAr: "القطر",
        values: PUMP_DIAMETERS.map(diameterValue),
      },
      {
        key: "hp",
        labelEn: "Power",
        labelAr: "القدرة",
        unit: "HP",
        values: usedHp.map(hpValue),
      },
    ],
    variants,
  };
}

// ---------------------------------------------------------------------------
// Motors — Tormac ECO series
// ---------------------------------------------------------------------------

/**
 * "Electrical Data", motor catalogue pages 23-25, three-phase 380/415 V rows.
 * Tuple order: [HP, kW, full-load current A, locked rotor A, efficiency %,
 * thrust capacity N, model code].
 *
 * The 7" tables print Current and Locked Rotor Amps the other way round from
 * every other frame (they read "256 A / 69 A" for a 37 kW motor, which is not
 * physical); the 8" table lists the same machine as 80 A / 280 A. The 7" rows
 * below are transcribed in the corrected orientation.
 */
type MotorRow = [number, number, number, number, number, number, string];

const MOTOR_ROWS: Record<string, MotorRow[]> = {
  '4"': [
    [0.5, 0.37, 1.9, 5, 48, 3000, "D4-03 TA-TK"],
    [0.75, 0.55, 2.4, 7, 57, 3000, "D4-05 TA-TK"],
    [1, 0.75, 2.8, 9, 64, 3000, "D4-07 TA-TK"],
    [1.5, 1.1, 3.9, 15, 67, 3000, "D4-11 TA-TK"],
    [2, 1.5, 4.7, 19, 68, 3000, "D4-15 TA-TK"],
    [3, 2.2, 7.1, 32, 70, 6500, "D4-22 TA-TK"],
    [4, 3, 9.1, 42, 72, 6500, "D4-30 TA-TK"],
    [5, 3.7, 10.1, 50, 71, 6500, "D4-37 TA-TK"],
    [5.5, 4, 10.3, 52, 69, 6500, "D4-40 TA-TK"],
    [7.5, 5.5, 14.2, 71, 71, 6500, "D4-55 TA-TK"],
    [10, 7.5, 18.2, 93, 72, 6500, "D4-75 TA-TK"],
  ],
  '6"': [
    [5.5, 4, 10.8, 43, 76, 15500, "D6-40 TA-TK"],
    [6, 4.5, 12, 48, 76, 15500, "D6-45 TA-TK"],
    [7.5, 5.5, 13.5, 52, 78, 15500, "D6-55 TA-TK"],
    [10, 7.5, 18.5, 70, 82, 15500, "D6-75 TA-TK"],
    [12.5, 9.3, 21, 84, 82, 15500, "D6-93 TA-TK"],
    [15, 11, 25, 102, 82, 15500, "D6-110 TA-TK"],
    [17.5, 13, 29.5, 118, 83, 15500, "D6-130 TA-TK"],
    [20, 15, 33, 148, 83, 15500, "D6-150 TA-TK"],
    [25, 18.5, 42.5, 188, 83, 15500, "D6-185 TA-TK"],
    [30, 22, 49.2, 225, 83, 15500, "D6-220 TA-TK"],
    [35, 26, 56.5, 270, 83, 27500, "D6-260 TA-TK"],
    [40, 30, 67.2, 355, 83, 27500, "D6-300 TA-TK"],
    [50, 37, 83, 420, 82, 27500, "D6-370 TA-TK"],
    [60, 45, 93, 465, 82, 27500, "D6-450 TA-TK"],
  ],
  '7"': [
    [50, 37, 80, 280, 86, 45500, "D7-370 TA-TB"],
    [60, 45, 92, 315, 85, 45500, "D7-450 TA-TB"],
    [75, 55, 112, 410, 87, 45500, "D7-550 TA-TB"],
    [85, 63, 126, 510, 88, 45500, "D7-630 TA-TB"],
    [100, 75, 151, 592, 89, 45500, "D7-750 TA-TB"],
  ],
  '8"': [
    [50, 37, 80, 280, 86, 45500, "D8-370 TB-TK"],
    [60, 45, 92, 315, 85, 45500, "D8-450 TB-TK"],
    [75, 55, 112, 410, 86, 45500, "D8-550 TB-TK"],
    [85, 63, 126, 510, 88, 45500, "D8-630 TB-TK"],
    [100, 75, 151, 592, 87, 45500, "D8-750 TB-TK"],
    [125, 93, 188, 636, 88, 45500, "D8-930 TB-TK"],
    [150, 110, 225, 785, 87, 45500, "D8-1100 TB-TK"],
  ],
  // The catalogue continues to 250 HP here; MAX_HP trims the rest.
  '10"': [
    [110, 81, 166, 824, 86, 75000, "D10-810 TB-TK"],
    [125, 93, 181, 1102, 87, 75000, "D10-930 TB-TK"],
    [150, 110, 220, 1326, 87, 75000, "D10-1100 TB-TK"],
  ],
};

const MOTOR_DIAMETERS = Object.keys(MOTOR_ROWS);

function buildMotor(): ProductSpec {
  const variants: VariantSpec[] = [];
  for (const diameter of MOTOR_DIAMETERS) {
    for (const [hp, kw, amps, lra, eff, thrust, model] of MOTOR_ROWS[diameter]) {
      if (hp > MAX_HP) continue;
      variants.push({
        selections: { diameter, hp: String(hp) },
        specs: {
          model,
          motorKw: `${kw} kW`,
          current: `${amps} A`,
          lockedRotor: `${lra} A`,
          efficiency: `${eff}%`,
          thrust: `${thrust.toLocaleString("en-US")} N`,
        },
      });
    }
  }

  const usedHp = [
    ...new Set(
      MOTOR_DIAMETERS.flatMap((d) => MOTOR_ROWS[d].map((r) => r[0])).filter((h) => h <= MAX_HP),
    ),
  ].sort((a, b) => a - b);

  return {
    slug: "motor-tormac-eco",
    categorySlug: "motors",
    nameEn: "Tormac ECO Series Submersible Motors",
    nameAr: "مواتير تورماك الغاطسة سلسلة ECO",
    descEn:
      'Tormac ECO series borehole submersible motors — water-cooled and rewindable in the field. Stainless steel stator shell, housings and motor base resist corrosion; the pressure-equalising diaphragm and shaft seal keep sand and well water out of the winding. Available 4", 6", 8" and 10", 380/415 V three phase, to NEMA mounting standards and ISO 9001.',
    descAr:
      'مواتير تورماك الغاطسة سلسلة ECO لآبار الأعماق، مبردة بالماء، وقابلة لإعادة اللف. جلبة الاستاتور والأغلفة وقاعدة الموتور من الاستانلس ستيل لمقاومة التآكل، مع حجاب معادلة الضغط ومانع تسرب العمود لمنع دخول الرمل ومياه البئر إلى الملفات. متوفرة بمقاسات 4 و6 و8 و10 بوصة، 380/415 فولت ثلاثي الأوجه، بأبعاد تركيب NEMA وشهادة ISO 9001.',
    image: "/images/products/motor-tormac-eco.jpeg",
    specsBlob: {
      specs: ["Rewindable", "IP68", "NEMA Standard"],
      modelNo: "D4 - D10",
      variants: [
        {
          labelEn: "Diameter",
          labelAr: "القطر",
          options: MOTOR_DIAMETERS.map((d) => ({ id: d.replace(/"/g, "in"), name: d })),
        },
      ],
      tableSpecsEn: {
        Series: "ECO Series, water-filled rewindable",
        Diameter: '4", 6", 8", 10"',
        "Rated Output": "0.37 kW – 110 kW (0.5 – 150 HP)",
        "Rated Speed": "2900 rpm",
        "Standard Voltage": "380/415 V, 3 Phase, 50 Hz",
        "Voltage Tolerance": "−15% / +6%",
        Protection: "IP 58 / IP 68",
        Duty: "S1 (Continuous)",
        "Rotation Sequence": "CW & CCW",
        "Class of Insulation": "Y",
        "Minimum Linear Flow": '0.15 m/s (4"–6"), 0.16 m/s (7"–10")',
        "Liquid Temperature": "38°C max.",
        "Mounting Dimensions": "NEMA Standard",
        "Starting Method": "DOL / Star-Delta (Wye-Delta above 37 kW)",
        "Internal Fill": "Deionised water (lubricant and coolant)",
      },
      tableSpecsAr: {
        "السلسلة": "سلسلة ECO، ممتلئة بالماء وقابلة لإعادة اللف",
        "القطر": "4، 6، 8، 10 بوصة",
        "القدرة المقننة": "0.37 – 110 كيلوواط (0.5 – 150 حصان)",
        "السرعة المقننة": "2900 لفة/دقيقة",
        "الجهد القياسي": "380/415 فولت، ثلاثي الأوجه، 50 هرتز",
        "تفاوت الجهد": "−15% / +6%",
        "فئة الحماية": "IP 58 / IP 68",
        "نظام التشغيل": "S1 (مستمر)",
        "اتجاه الدوران": "مع عقارب الساعة وعكسها",
        "فئة العزل": "Y",
        "أقل سرعة تدفق للتبريد": "0.15 م/ث (4–6 بوصة)، 0.16 م/ث (7–10 بوصة)",
        "درجة حرارة السائل": "38°م كحد أقصى",
        "أبعاد التركيب": "مواصفة NEMA",
        "طريقة البدء": "مباشر / نجمة-دلتا (نجمة-دلتا فوق 37 كيلوواط)",
        "سائل الملء الداخلي": "ماء منزوع الأيونات (تزييت وتبريد)",
      },
      featuresEn: [
        "Rewindable construction — repairs and rewinding are done at field level",
        "Stainless steel 304/316 stator shell, housings shell and motor base",
        "Pre-filled with environmentally safe deionised water as lubricant and coolant",
        "Uniquely designed thrust bearing rated 3,000 N to 75,000 N by frame",
        "Shaft seal and sand guard prevent ingress of liquid and sand",
        "High-temperature 70°C / 90°C versions available with PT sensor and PE2 / XLPE / PA winding",
      ],
      featuresAr: [
        "تصميم قابل لإعادة اللف — الإصلاح وإعادة اللف يتمان في الموقع",
        "جلبة استاتور وأغلفة وقاعدة موتور من الاستانلس ستيل 304/316",
        "معبأة مسبقًا بماء منزوع الأيونات آمن بيئيًا للتزييت والتبريد",
        "كرسي تحميل محوري بتصميم خاص بقدرة من 3,000 حتى 75,000 نيوتن حسب المقاس",
        "مانع تسرب العمود وواقي الرمل يمنعان دخول السوائل والرمال",
        "تتوفر إصدارات حرارة عالية 70°م / 90°م مع حساس PT وملف PE2 / XLPE / PA",
      ],
      specGroups: [
        {
          title: "Technical Data by Frame — ECO Series 50 Hz",
          subtitle: `Tormac Submersible Motor 50 Hz catalogue, pages 20-22 · powers listed here run to ${MAX_HP} HP`,
          columnsEn: ["Specification", '4"', '6"', '7"', '8"', '10"'],
          columnsAr: ["البيان", "4 بوصة", "6 بوصة", "7 بوصة", "8 بوصة", "10 بوصة"],
          rows: [
            { type: "Rated Output", values: ["0.37–7.5 kW", "4–45 kW", "37–75 kW", "37–93 kW", "81–220 kW"] },
            { type: "Power (HP)", values: ["0.5–10", "5.5–60", "50–100", "50–125", "110–300"] },
            { type: "Outer Diameter", values: ["98 mm", "143 mm", "180 mm", "196 mm", "236 mm"] },
            { type: "Protection", values: ["IP 58", "IP 58 / IP 68", "IP 68", "IP 58 / IP 68", "IP 68"] },
            { type: "Thrust Load", values: ["3,000–6,500 N", "15,500–27,500 N", "45,500 N", "45,500 N", "60,000–75,000 N"] },
            { type: "Switching Frequency", values: ["20 / hour", "20 / hour", "4 / hour", "15 / hour", "10 / hour"] },
            { type: "Minimum Linear Flow", values: ["0.15 m/s", "0.15 m/s", "0.16 m/s", "0.16 m/s", "0.16 m/s"] },
            { type: "Starting Method", values: ["DOL (1Ph CSCR)", "DOL / SD", "DOL / SD", "DOL / SD", "DOL / SD"] },
          ],
        },
      ],
    },
    options: [
      {
        key: "diameter",
        labelEn: "Diameter",
        labelAr: "القطر",
        values: MOTOR_DIAMETERS.map(diameterValue),
      },
      {
        key: "hp",
        labelEn: "Power",
        labelAr: "القدرة",
        unit: "HP",
        values: usedHp.map(hpValue),
      },
    ],
    variants,
  };
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

async function upsertProduct(spec: ProductSpec) {
  const category = await prisma.category.findUnique({
    where: { slug: spec.categorySlug },
    select: { id: true },
  });
  if (!category) throw new Error(`Category "${spec.categorySlug}" does not exist`);

  const existing = await prisma.product.findUnique({
    where: { slug: spec.slug },
    select: { id: true, specs: true },
  });

  // An owner may already have edited the spec chips from /admin/products, and
  // the admin form writes only `specs` back into this blob. Keep whatever is in
  // the database for that key and refresh the technical payload around it.
  let chips = spec.specsBlob.specs;
  if (existing) {
    try {
      const prev = JSON.parse(existing.specs) as { specs?: string[] };
      if (Array.isArray(prev.specs) && prev.specs.length > 0) chips = prev.specs;
    } catch {
      /* unparseable blob — fall back to the catalogue chips */
    }
  }

  const data = {
    categoryId: category.id,
    nameEn: spec.nameEn,
    nameAr: spec.nameAr,
    descEn: spec.descEn,
    descAr: spec.descAr,
    images: JSON.stringify([spec.image]),
    specs: JSON.stringify({ ...spec.specsBlob, specs: chips }),
  };

  const product = existing
    ? await prisma.product.update({ where: { id: existing.id }, data, select: { id: true } })
    : await prisma.product.create({ data: { slug: spec.slug, ...data }, select: { id: true } });

  // --- options + their values -----------------------------------------------
  for (const [i, o] of spec.options.entries()) {
    const option = await prisma.productOption.upsert({
      where: { productId_key: { productId: product.id, key: o.key } },
      update: { labelEn: o.labelEn, labelAr: o.labelAr, unit: o.unit ?? null, sortOrder: i },
      create: {
        productId: product.id,
        key: o.key,
        labelEn: o.labelEn,
        labelAr: o.labelAr,
        unit: o.unit ?? null,
        sortOrder: i,
      },
      select: { id: true },
    });

    for (const [vi, v] of o.values.entries()) {
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

    await prisma.productOptionValue.deleteMany({
      where: { optionId: option.id, value: { notIn: o.values.map((v) => v.value) } },
    });
  }

  // --- variants -------------------------------------------------------------
  const comboKeys: string[] = [];
  let created = 0;
  for (const [i, v] of spec.variants.entries()) {
    const comboKey = comboKeyOf(v.selections);
    comboKeys.push(comboKey);

    const existingVariant = await prisma.productVariant.findUnique({
      where: { productId_comboKey: { productId: product.id, comboKey } },
      select: { id: true },
    });
    if (!existingVariant) created++;

    await prisma.productVariant.upsert({
      where: { productId_comboKey: { productId: product.id, comboKey } },
      // `price` is intentionally absent from the update so a figure the owner
      // has typed into /admin survives a re-run of this script.
      update: {
        selections: JSON.stringify(v.selections),
        specs: JSON.stringify(v.specs),
        sortOrder: i,
        isActive: true,
      },
      create: {
        productId: product.id,
        comboKey,
        selections: JSON.stringify(v.selections),
        specs: JSON.stringify(v.specs),
        sortOrder: i,
        isActive: true,
      },
    });
  }

  const removed = await prisma.productVariant.deleteMany({
    where: { productId: product.id, comboKey: { notIn: comboKeys } },
  });

  // Keep the listing range in step with whatever prices exist now.
  const priced = await prisma.productVariant.findMany({
    where: { productId: product.id, isActive: true, price: { not: null } },
    select: { price: true },
  });
  const prices = priced.map((p) => p.price!).filter((p) => Number.isFinite(p));
  await prisma.product.update({
    where: { id: product.id },
    data: {
      priceMin: prices.length ? Math.min(...prices) : null,
      priceMax: prices.length ? Math.max(...prices) : null,
    },
  });

  const range = prices.length
    ? `${Math.min(...prices).toLocaleString()}–${Math.max(...prices).toLocaleString()} EGP`
    : "no prices yet — shows as Price on request";
  console.log(
    `  ${spec.slug.padEnd(18)} ${existing ? "updated" : "created"}  ` +
      `${String(spec.variants.length).padStart(3)} variants (+${created} new` +
      `${removed.count ? `, −${removed.count} removed` : ""})  ${range}`,
  );
}

async function main() {
  console.log("Adding the Tormac catalogue entries\n");
  await upsertProduct(buildPump());
  await upsertProduct(buildMotor());

  const total = await prisma.productVariant.count();
  console.log(`\n✔ ${total} variants in the catalogue`);
  console.log(
    "\nPrices are blank on every Tormac variant. Set them from " +
      "/admin/products once the Tormac price sheet is issued.",
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
