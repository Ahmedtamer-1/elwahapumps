/**
 * Pump selection engine.
 *
 * Pure functions only: no data import, no Prisma, no React. The catalogue is
 * passed in, which keeps this directly runnable under `node --test` (see
 * pump-selector.test.ts) and lets the tests use small fixtures instead of the
 * real 926-variant dataset. `@/lib/pump-data` binds these to the real catalogue.
 *
 * Selection follows how a pump engineer actually sizes a borehole pump:
 *   1. the pump must reach the required head at the required flow — a pump that
 *      delivers 95% of it cannot lift the water and is not a candidate;
 *   2. among those, prefer the one that runs most efficiently at that duty point,
 *      because that is what determines the customer's electricity bill.
 *
 * Step 2 reads the efficiency the catalogue actually publishes for the family
 * (traced off its performance chart by scripts/extract_chart_curves.py) rather than
 * standing in a proxy for it. That is also what makes the power figures real: with
 * head and efficiency, shaft power is rho*g*Q*H/eta, and the motor load that
 * follows is the number that decides whether a selection can be built at all.
 */

export interface PumpVariant {
  /** Full catalogue designation, unique across the dataset, e.g. "K10SX-200/1B". */
  code: string;
  /** Designation without the trim marker, e.g. "K10SX-200/1". Not unique. */
  model: string;
  stages: number;
  /** Reduced-impeller build: "A", "AA", "AAA", "B". Null for the full impeller. */
  trim: string | null;
  motorKw: number;
  motorHp: number;
  /** Motor bore diameters this pump can be coupled to, e.g. [6, 7, 8]. */
  motorBores: number[];
  /**
   * Head in metres, one entry per family.flowPointsM3h, same order.
   * Null means the catalogue prints no value at that flow — the pump is not
   * permitted to run there. Nulls only ever occur as a trailing run.
   */
  headsM: (number | null)[];
  lengthMm: number;
  weightKg: number;
  /** Flow-column indices repaired from a misprint; see pump-curve-corrections.json. */
  correctedColumns?: number[];
}

export interface PumpFamily {
  code: string;
  series: "KP" | "KSX";
  /** Well bore the pump fits, in inches. */
  boreInch: number;
  /** Nominal (best-efficiency) flow, from the model code. */
  qNomM3h: number;
  flowPointsM3h: number[];
  flowPointsLs: number[];
  /** Slug of the matching catalogue product page. */
  productSlug: string;
  outlet: string | null;
  /**
   * Pump efficiency in percent, one entry per flowPointsM3h, same order. Null where
   * the published curve does not reach that flow. This is a property of the
   * hydraulic stage, so it is held on the family and applies to every variant in
   * it — adding stages multiplies head and power together and leaves efficiency
   * unchanged.
   */
  etaPct: (number | null)[];
  /** Required NPSH in metres, one entry per flowPointsM3h, same order. */
  npshM: (number | null)[];
  /**
   * The flow range the catalogue shades as recommended, [low, high] in m3/h.
   * Absent when it could not be read off the chart.
   */
  bandM3h?: [number, number];
  sourcePdf: string;
  sourcePage: number;
  variants: PumpVariant[];
}

export interface KmMotor {
  code: string;
  boreInch: number;
  hp: number;
  kw: number;
  /** Mains voltage the electrical figures below are quoted at. */
  voltage: number;
  rpm: number;
  currentA: number;
  startingCurrentA: number;
  /** Motor efficiency at full load, percent. Distinct from pump efficiency. */
  efficiencyPct: number;
  cosPhi: number;
  lengthMm: number;
  weightKg: number;
}

// ---------------------------------------------------------------------------
// units
// ---------------------------------------------------------------------------

export type FlowUnit = "m3h" | "ls" | "lmin";
export type HeadUnit = "m" | "bar";

export const FLOW_UNITS: FlowUnit[] = ["m3h", "ls", "lmin"];
export const HEAD_UNITS: HeadUnit[] = ["m", "bar"];

/** 1 bar of water column at 4 °C. */
const METRES_PER_BAR = 10.19716;

export function toM3h(value: number, unit: FlowUnit): number {
  switch (unit) {
    case "m3h":
      return value;
    case "ls":
      return value * 3.6;
    case "lmin":
      return value * 0.06;
  }
}

export function fromM3h(value: number, unit: FlowUnit): number {
  switch (unit) {
    case "m3h":
      return value;
    case "ls":
      return value / 3.6;
    case "lmin":
      return value / 0.06;
  }
}

export function toMeters(value: number, unit: HeadUnit): number {
  return unit === "bar" ? value * METRES_PER_BAR : value;
}

export function fromMeters(value: number, unit: HeadUnit): number {
  return unit === "bar" ? value / METRES_PER_BAR : value;
}

export function isFlowUnit(value: string): value is FlowUnit {
  return (FLOW_UNITS as string[]).includes(value);
}

export function isHeadUnit(value: string): value is HeadUnit {
  return (HEAD_UNITS as string[]).includes(value);
}

// ---------------------------------------------------------------------------
// curve interpolation
// ---------------------------------------------------------------------------

/**
 * Highest flow the catalogue publishes a head for on this variant. Beyond it we
 * have no data and must not extrapolate — the curve collapses steeply near a
 * pump's maximum flow, so a straight-line guess there would overstate head.
 */
export function maxFlowM3h(family: PumpFamily, variant: PumpVariant): number {
  let last = 0;
  for (let i = 0; i < variant.headsM.length; i += 1) {
    if (variant.headsM[i] !== null) last = family.flowPointsM3h[i];
  }
  return last;
}

/**
 * Head this variant delivers at `qM3h`, linearly interpolated between the two
 * bracketing catalogue breakpoints. Null when the flow is outside the published
 * range.
 */
export function headAtFlow(
  family: PumpFamily,
  variant: PumpVariant,
  qM3h: number,
): number | null {
  if (!(qM3h >= 0)) return null;

  const points: { q: number; h: number }[] = [];
  for (let i = 0; i < variant.headsM.length; i += 1) {
    const head = variant.headsM[i];
    if (head !== null) points.push({ q: family.flowPointsM3h[i], h: head });
  }
  if (points.length === 0) return null;
  if (qM3h > points[points.length - 1].q) return null;

  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (qM3h <= b.q) {
      if (qM3h === a.q) return a.h;
      const span = b.q - a.q;
      if (span === 0) return b.h;
      return a.h + ((b.h - a.h) * (qM3h - a.q)) / span;
    }
  }
  return points[0].h;
}

/** Hydraulic (water) power at a duty point, in kW. */
export function hydraulicKw(qM3h: number, headM: number): number {
  return (qM3h * headM) / 367;
}

/**
 * Interpolates a family-level curve (efficiency, NPSH) onto an arbitrary flow, and
 * returns null outside the range the catalogue actually draws.
 *
 * Refusing to extrapolate matters more here than it does for head, and is not just
 * fastidiousness. A catalogue tabulates head across a pump's whole flow range but
 * only plots efficiency over the useful part of it, so a big pump asked for a small
 * flow has a head figure and no efficiency figure. Carrying the nearest drawn value
 * across that gap would claim, for instance, that a 200 m3/h pump still runs at 80%
 * when throttled to 60 — and since selection ranks on efficiency, that fiction wins
 * the ranking and puts a 10" pump down a well that needs a 6" one. A null instead
 * ranks it last, which is the honest answer: that duty point is off its curve.
 */
function curveAtFlow(
  flows: number[],
  values: (number | null)[],
  qM3h: number,
): number | null {
  const points: { q: number; v: number }[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (value !== null && flows[i] !== undefined) points.push({ q: flows[i], v: value });
  }
  if (points.length === 0) return null;
  if (qM3h < points[0].q || qM3h > points[points.length - 1].q) return null;

  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (qM3h <= b.q) {
      const span = b.q - a.q;
      if (span === 0) return b.v;
      return a.v + ((b.v - a.v) * (qM3h - a.q)) / span;
    }
  }
  return points[0].v;
}

/** Pump efficiency at a flow, in percent. Null when the family has no curve. */
export function efficiencyAtFlow(family: PumpFamily, qM3h: number): number | null {
  return curveAtFlow(family.flowPointsM3h, family.etaPct ?? [], qM3h);
}

/** Required NPSH at a flow, in metres. Null when the family has no curve. */
export function npshAtFlow(family: PumpFamily, qM3h: number): number | null {
  return curveAtFlow(family.flowPointsM3h, family.npshM ?? [], qM3h);
}

/**
 * Shaft power the pump absorbs at a duty point, in kW — the number the motor has
 * to cover. Null without an efficiency curve, because a shaft power guessed from
 * an assumed efficiency would understate the motor and is worse than no figure.
 */
export function shaftKw(qM3h: number, headM: number, etaPct: number | null): number | null {
  if (etaPct === null || etaPct <= 0) return null;
  return hydraulicKw(qM3h, headM) / (etaPct / 100);
}

/** Electrical input power drawn from the supply, in kW. */
export function inputKw(shaft: number, motor: KmMotor): number {
  return shaft / (motor.efficiencyPct / 100);
}

// ---------------------------------------------------------------------------
// selection
// ---------------------------------------------------------------------------

export type EfficiencyZone = "optimal" | "good" | "acceptable";

/**
 * Which band of its curve the pump is running in.
 *
 * Prefers the range the catalogue itself shades as recommended, which is the
 * manufacturer's own statement of where the pump should be run. Only where that
 * band could not be read does it fall back to distance from nominal flow.
 */
export function efficiencyZone(
  qM3h: number,
  family: Pick<PumpFamily, "qNomM3h" | "bandM3h">,
): EfficiencyZone {
  const band = family.bandM3h;
  if (band) {
    if (qM3h >= band[0] && qM3h <= band[1]) return "optimal";
    // Just outside the shaded range: still sensible, but no longer where the
    // manufacturer wants it run.
    const margin = (band[1] - band[0]) * 0.35;
    if (qM3h >= band[0] - margin && qM3h <= band[1] + margin) return "good";
    return "acceptable";
  }
  const bepDistance = Math.abs(qM3h - family.qNomM3h) / family.qNomM3h;
  if (bepDistance <= 0.1) return "optimal";
  if (bepDistance <= 0.25) return "good";
  return "acceptable";
}

export interface Candidate {
  family: PumpFamily;
  variant: PumpVariant;
  /** Interpolated head at the requested flow, in metres. */
  headM: number;
  /** How far the delivered head overshoots what was asked for, as a fraction. */
  headExcess: number;
  /** |q - qNom| / qNom — how far off its best-efficiency flow the pump runs. */
  bepDistance: number;
  zone: EfficiencyZone;
  /** Published pump efficiency at this duty point, percent. Null if unavailable. */
  etaPct: number | null;
  /** Required NPSH at this duty point, metres. Null if unavailable. */
  npshM: number | null;
  hydraulicKw: number;
  /** Power at the pump shaft, kW — hydraulic power divided by pump efficiency. */
  shaftKw: number | null;
  /**
   * Shaft power as a fraction of the motor's rating: what the motor is actually
   * asked to deliver. Above 1 the motor is overloaded and the selection is not
   * buildable as listed. NOT pump efficiency.
   */
  motorLoad: number | null;
}

export interface SelectionInput {
  qM3h: number;
  hM: number;
}

export type SelectionStatus = "ok" | "oversized" | "no-match" | "invalid";

export interface SelectionResult {
  status: SelectionStatus;
  top: Candidate | null;
  alternatives: Candidate[];
  /** Total candidates that met the head requirement, before the oversize cap. */
  matchCount: number;
  /**
   * The oversize cap that was actually needed, as a fraction (0.3 = +30%). Above
   * the default it means nothing reasonable existed and the UI should say so.
   */
  appliedCapPct: number | null;
  /**
   * When nothing reaches the target head: the most any in-range pump can deliver
   * at that flow, so the UI can explain the limit instead of showing nothing.
   */
  bestAvailableHeadM: number | null;
}

/** Default cap on head overshoot. Beyond this the motor and running cost are wasted. */
const DEFAULT_CAP = 0.3;
/** Progressively relaxed only when nothing at all fits, so a result is still offered. */
const RELAXED_CAPS = [0.6, 1.5];
const MAX_ALTERNATIVES = 8;
const MAX_PER_FAMILY = 2;

function compareCandidates(a: Candidate, b: Candidate): number {
  // Efficiency first — the owner's rule, and now the published figure rather than
  // a proxy for it. Rounded to whole percent before comparing, because the curves
  // are traced off a printed chart and a 0.2-point difference is reading noise,
  // not a real reason to prefer a worse-fitting pump.
  const ea = a.etaPct === null ? -1 : Math.round(a.etaPct);
  const eb = b.etaPct === null ? -1 : Math.round(b.etaPct);
  if (ea !== eb) return eb - ea;
  // Equal efficiency, different families: prefer the one running nearer its nominal
  // flow. Two families often cross within a point of each other, and there the
  // manufacturer's own intent is the better guide — it is the pump sized for this
  // duty, and it matches what Kurlar's selection sheet picks at the same crossings.
  if (a.bepDistance !== b.bepDistance) return a.bepDistance - b.bepDistance;
  // Within one family every variant shares the efficiency curve and the nominal
  // flow, so head fit is what separates them: the least oversized pump wastes the
  // least motor and cable.
  if (a.headExcess !== b.headExcess) return a.headExcess - b.headExcess;
  return a.variant.code.localeCompare(b.variant.code);
}

export function selectPumps(
  input: SelectionInput,
  families: PumpFamily[],
): SelectionResult {
  const empty: SelectionResult = {
    status: "invalid",
    top: null,
    alternatives: [],
    matchCount: 0,
    appliedCapPct: null,
    bestAvailableHeadM: null,
  };

  const { qM3h, hM } = input;
  if (!Number.isFinite(qM3h) || !Number.isFinite(hM) || qM3h <= 0 || hM <= 0) {
    return empty;
  }

  const reaching: Candidate[] = [];
  let bestAvailableHeadM: number | null = null;

  for (const family of families) {
    for (const variant of family.variants) {
      const headM = headAtFlow(family, variant, qM3h);
      if (headM === null) continue; // flow outside this pump's published range

      if (bestAvailableHeadM === null || headM > bestAvailableHeadM) {
        bestAvailableHeadM = headM;
      }
      // Must actually reach the required head. Under-delivery is not a candidate:
      // a pump 5% short of the water level lifts nothing at all.
      if (headM < hM) continue;

      const bepDistance = Math.abs(qM3h - family.qNomM3h) / family.qNomM3h;
      const power = hydraulicKw(qM3h, headM);
      const etaPct = efficiencyAtFlow(family, qM3h);
      const shaft = shaftKw(qM3h, headM, etaPct);
      reaching.push({
        family,
        variant,
        headM,
        headExcess: (headM - hM) / hM,
        bepDistance,
        zone: efficiencyZone(qM3h, family),
        etaPct,
        npshM: npshAtFlow(family, qM3h),
        hydraulicKw: power,
        shaftKw: shaft,
        motorLoad: shaft === null ? null : shaft / variant.motorKw,
      });
    }
  }

  if (reaching.length === 0) {
    return {
      status: "no-match",
      top: null,
      alternatives: [],
      matchCount: 0,
      appliedCapPct: null,
      bestAvailableHeadM,
    };
  }

  let cap = DEFAULT_CAP;
  let shortlist = reaching.filter((c) => c.headExcess <= cap);
  for (const relaxed of RELAXED_CAPS) {
    if (shortlist.length > 0) break;
    cap = relaxed;
    shortlist = reaching.filter((c) => c.headExcess <= cap);
  }
  // Nothing even within the loosest cap: everything available is wildly oversized,
  // so offer the tightest fits there are rather than an empty page.
  if (shortlist.length === 0) {
    cap = Math.max(...reaching.map((c) => c.headExcess));
    shortlist = reaching;
  }

  shortlist.sort(compareCandidates);

  const top = shortlist[0];
  const perFamily = new Map<string, number>([[top.family.code, 1]]);
  const alternatives: Candidate[] = [];
  const overflow: Candidate[] = [];

  for (const candidate of shortlist.slice(1)) {
    const used = perFamily.get(candidate.family.code) ?? 0;
    if (used < MAX_PER_FAMILY) {
      perFamily.set(candidate.family.code, used + 1);
      alternatives.push(candidate);
    } else {
      overflow.push(candidate);
    }
    if (alternatives.length >= MAX_ALTERNATIVES) break;
  }
  // Backfill only if family diversity left the list short.
  for (const candidate of overflow) {
    if (alternatives.length >= MAX_ALTERNATIVES) break;
    alternatives.push(candidate);
  }

  return {
    status: cap > DEFAULT_CAP ? "oversized" : "ok",
    top,
    alternatives,
    matchCount: reaching.length,
    appliedCapPct: cap,
    bestAvailableHeadM,
  };
}

// ---------------------------------------------------------------------------
// motor selection
// ---------------------------------------------------------------------------

export type MotorStatus = "recommended" | "upsized" | "undersized";

export interface MotorChoice {
  motor: KmMotor;
  status: MotorStatus;
  /** Difference from the catalogue recommendation, as a fraction of its HP. */
  delta: number;
}

export interface MotorOptions {
  /** What the pump table recommends for this variant. */
  recommendedKw: number;
  recommendedHp: number;
  recommendedBores: number[];
  /**
   * Selectable KM motors, HP-ascending. Empty when no KM series covers this pump:
   * the catalogue's pump tables also reference 4" and 12" motors, which have no
   * KM range, so those variants get no override.
   */
  choices: MotorChoice[];
  /** Whether a KM motor exists at exactly the recommended HP. */
  hasExactMatch: boolean;
}

/**
 * Motors that both physically fit this pump and actually exist, HP-ascending.
 *
 * Deduplicated by HP, keeping the smallest bore that offers it — a KM6-30 and a
 * KM7-30 are the same 30 HP to the customer, and the narrower one is the cheaper,
 * more widely stocked motor.
 */
export function compatibleMotors(
  variant: PumpVariant,
  motors: KmMotor[],
): MotorOptions {
  const bores = new Set(variant.motorBores);
  const byHp = new Map<number, KmMotor>();
  for (const motor of motors) {
    if (!bores.has(motor.boreInch)) continue;
    const existing = byHp.get(motor.hp);
    if (!existing || motor.boreInch < existing.boreInch) byHp.set(motor.hp, motor);
  }

  const choices: MotorChoice[] = [...byHp.values()]
    .sort((a, b) => a.hp - b.hp)
    .map((motor) => ({
      motor,
      status:
        motor.hp === variant.motorHp
          ? ("recommended" as const)
          : motor.hp > variant.motorHp
            ? ("upsized" as const)
            : ("undersized" as const),
      delta: (motor.hp - variant.motorHp) / variant.motorHp,
    }));

  return {
    recommendedKw: variant.motorKw,
    recommendedHp: variant.motorHp,
    recommendedBores: variant.motorBores,
    choices,
    hasExactMatch: choices.some((c) => c.status === "recommended"),
  };
}

/**
 * The motor the UI should show. `requestedHp` is the customer's override, which is
 * ignored if it names a motor that does not fit this pump — a hand-edited URL must
 * not be able to put an impossible motor on a datasheet.
 */
export function resolveMotor(
  options: MotorOptions,
  requestedHp: number | null,
): { choice: MotorChoice | null; isOverride: boolean; isUndersized: boolean } {
  const fallback =
    options.choices.find((c) => c.status === "recommended") ??
    // No exact match: default to the smallest motor that still covers the
    // recommendation, never to a smaller one.
    options.choices.find((c) => c.motor.hp > options.recommendedHp) ??
    null;

  if (requestedHp === null) {
    return { choice: fallback, isOverride: false, isUndersized: false };
  }
  const requested = options.choices.find((c) => c.motor.hp === requestedHp);
  if (!requested) {
    return { choice: fallback, isOverride: false, isUndersized: false };
  }
  return {
    choice: requested,
    isOverride: requested !== fallback,
    isUndersized: requested.status === "undersized",
  };
}

// ---------------------------------------------------------------------------
// lookup
// ---------------------------------------------------------------------------

/**
 * What goes down the borehole: pump and motor stacked, plus what has to be lifted
 * to get it there. Both numbers decide whether an installation is possible at all,
 * so they are shown together rather than left for the customer to add up.
 */
export function assembly(
  variant: PumpVariant,
  motor: KmMotor | null,
): { lengthMm: number; weightKg: number; motorIncluded: boolean } {
  return {
    lengthMm: variant.lengthMm + (motor?.lengthMm ?? 0),
    weightKg: Math.round((variant.weightKg + (motor?.weightKg ?? 0)) * 10) / 10,
    motorIncluded: motor !== null,
  };
}

/**
 * The pump's full published curve, resampled for plotting. Head comes from the
 * variant, efficiency from the family, and power is derived from the two — the
 * catalogues plot no power curve, but with head and efficiency it is determined.
 */
export interface CurvePoint {
  qM3h: number;
  headM: number;
  etaPct: number | null;
  shaftKw: number | null;
  npshM: number | null;
}

export function curveOf(
  family: PumpFamily,
  variant: PumpVariant,
  steps = 40,
): CurvePoint[] {
  const top = maxFlowM3h(family, variant);
  if (!(top > 0)) return [];
  const points: CurvePoint[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const qM3h = (top * i) / steps;
    const headM = headAtFlow(family, variant, qM3h);
    if (headM === null) continue;
    const etaPct = efficiencyAtFlow(family, qM3h);
    points.push({
      qM3h,
      headM,
      etaPct,
      shaftKw: shaftKw(qM3h, headM, etaPct),
      npshM: npshAtFlow(family, qM3h),
    });
  }
  return points;
}

export function findVariant(
  code: string,
  families: PumpFamily[],
): { family: PumpFamily; variant: PumpVariant } | null {
  for (const family of families) {
    const variant = family.variants.find((v) => v.code === code);
    if (variant) return { family, variant };
  }
  return null;
}
