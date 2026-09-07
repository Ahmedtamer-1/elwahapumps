/**
 * Engine tests. Run with:
 *
 *   node --test src/lib/pump-selector.test.ts
 *
 * Node 24 strips TypeScript natively, so this needs no test runner, no compiler
 * and no new dependency. It imports only `pump-selector.ts`, which is data-free —
 * the fixtures below are hand-built so the expected answers can be reasoned about
 * by hand, and a real-catalogue smoke test reads the JSON directly at the end.
 */

import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";

import {
  compatibleMotors,
  efficiencyZone,
  findVariant,
  fromM3h,
  headAtFlow,
  efficiencyAtFlow,
  hydraulicKw,
  npshAtFlow,
  shaftKw,
  maxFlowM3h,
  resolveMotor,
  selectPumps,
  toM3h,
  toMeters,
  type KmMotor,
  type PumpFamily,
  type PumpVariant,
} from "./pump-selector";

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------

function variant(
  code: string,
  stages: number,
  headsM: (number | null)[],
  overrides: Partial<PumpVariant> = {},
): PumpVariant {
  return {
    code,
    model: code.replace(/(A{1,4}|B{1,4})$/, ""),
    stages,
    trim: /(A{1,4}|B{1,4})$/.exec(code)?.[1] ?? null,
    motorKw: 22,
    motorHp: 30,
    motorBores: [6, 7],
    headsM,
    lengthMm: 1000 + stages * 100,
    weightKg: 30 + stages,
    ...overrides,
  };
}

/** Nominal flow 60 m3/h, breakpoints 0/20/40/60/80, ~14 m per stage at nominal. */
const family60: PumpFamily = {
  code: "TEST-660",
  series: "KP",
  boreInch: 6,
  qNomM3h: 60,
  flowPointsM3h: [0, 20, 40, 60, 80],
  flowPointsLs: [0, 5.56, 11.11, 16.67, 22.22],
  productSlug: "pump-submersible",
  outlet: 'BSP 4"',
  // Peaks at the nominal 60 m3/h, as a real family does.
  etaPct: [null, 45, 68, 78, 62],
  npshM: [null, 2.5, 3.0, 3.6, 5.0],
  bandM3h: [50, 70],
  sourcePdf: "test",
  sourcePage: 1,
  variants: [
    variant("TEST-660/01", 1, [20, 18, 16, 14, 10]),
    variant("TEST-660/05", 5, [100, 90, 80, 70, 50]),
    variant("TEST-660/09", 9, [180, 162, 144, 126, 90]),
    variant("TEST-660/10", 10, [200, 180, 160, 140, 100]),
    // Highest flow not permitted: trailing null.
    variant("TEST-660/12", 12, [240, 216, 192, 168, null]),
  ],
};

/**
 * Nominal flow 46 m3/h — at 60 m3/h this family runs past its BEP and is 12 points
 * less efficient there (66% against family60's 78%), but it fits a 120 m duty more
 * tightly (122 m) than family60's best does (126 m). That combination is what
 * distinguishes efficiency-first ranking from head-fit-first.
 */
const family46: PumpFamily = {
  ...family60,
  code: "TEST-646",
  qNomM3h: 46,
  etaPct: [null, 55, 74, 66, 48],
  npshM: [null, 2.4, 2.9, 4.2, 6.1],
  bandM3h: [38, 54],
  variants: [variant("TEST-646/09", 9, [185, 170, 150, 122, 88])],
};

/** Electrical figures are illustrative but self-consistent; only kW/HP/bore rank. */
function motor(code: string, boreInch: number, hp: number, kw: number): KmMotor {
  return {
    code,
    boreInch,
    hp,
    kw,
    voltage: 380,
    rpm: 2880,
    currentA: Math.round(kw * 2.2 * 10) / 10,
    startingCurrentA: Math.round(kw * 2.2 * 3.9),
    efficiencyPct: 85,
    cosPhi: 0.85,
    lengthMm: 700 + Math.round(kw * 18),
    weightKg: 35 + Math.round(kw * 2),
  };
}

const motors: KmMotor[] = [
  motor("KM6-20", 6, 20, 15),
  motor("KM6-25", 6, 25, 18.5),
  motor("KM6-30", 6, 30, 22),
  motor("KM6-35", 6, 35, 26.5),
  motor("KM7-30", 7, 30, 22),
  motor("KM7-40", 7, 40, 30),
  motor("KM8-50", 8, 50, 37),
  motor("KM10-100", 10, 100, 75),
];

// ---------------------------------------------------------------------------
// units
// ---------------------------------------------------------------------------

test("flow unit conversion", () => {
  assert.equal(toM3h(10, "m3h"), 10);
  assert.equal(toM3h(10, "ls"), 36);
  assert.equal(toM3h(1000, "lmin"), 60);
  // Round trips.
  for (const unit of ["m3h", "ls", "lmin"] as const) {
    assert.ok(Math.abs(fromM3h(toM3h(7.5, unit), unit) - 7.5) < 1e-9);
  }
});

test("head unit conversion", () => {
  assert.equal(toMeters(120, "m"), 120);
  // 12 bar is ~122 m of water column.
  assert.ok(Math.abs(toMeters(12, "bar") - 122.37) < 0.01);
});

// ---------------------------------------------------------------------------
// interpolation
// ---------------------------------------------------------------------------

test("headAtFlow returns catalogue values exactly at breakpoints", () => {
  const v = family60.variants[3]; // /10
  assert.equal(headAtFlow(family60, v, 0), 200);
  assert.equal(headAtFlow(family60, v, 20), 180);
  assert.equal(headAtFlow(family60, v, 60), 140);
  assert.equal(headAtFlow(family60, v, 80), 100);
});

test("headAtFlow interpolates linearly between breakpoints", () => {
  const v = family60.variants[3]; // 160 at 40, 140 at 60
  assert.equal(headAtFlow(family60, v, 50), 150);
  assert.equal(headAtFlow(family60, v, 45), 155);
});

test("headAtFlow refuses to extrapolate past the published range", () => {
  const v = family60.variants[3];
  assert.equal(headAtFlow(family60, v, 80.1), null);
  assert.equal(headAtFlow(family60, v, 1000), null);
});

test("a trailing null shortens the usable range", () => {
  const v = family60.variants[4]; // /12, no value at 80
  assert.equal(maxFlowM3h(family60, v), 60);
  assert.equal(headAtFlow(family60, v, 60), 168);
  assert.equal(headAtFlow(family60, v, 70), null, "70 is past the last published flow");
});

test("hydraulicKw matches the standard formula", () => {
  // 60 m3/h at 120 m ~= 19.6 kW of water power.
  assert.ok(Math.abs(hydraulicKw(60, 120) - 19.62) < 0.02);
});

test("efficiency zones follow the printed recommended-flow band", () => {
  // family60's chart shades 50-70 m3/h; the "good" shoulder is 35% of that width.
  assert.equal(efficiencyZone(50, family60), "optimal");
  assert.equal(efficiencyZone(60, family60), "optimal");
  assert.equal(efficiencyZone(70, family60), "optimal");
  assert.equal(efficiencyZone(73, family60), "good");
  assert.equal(efficiencyZone(46, family60), "good");
  assert.equal(efficiencyZone(80, family60), "acceptable");
  assert.equal(efficiencyZone(20, family60), "acceptable");
});

test("efficiency zones fall back to distance from nominal without a band", () => {
  const unbanded = { qNomM3h: 60, bandM3h: undefined };
  assert.equal(efficiencyZone(60, unbanded), "optimal");
  assert.equal(efficiencyZone(66, unbanded), "optimal");
  assert.equal(efficiencyZone(67, unbanded), "good");
  assert.equal(efficiencyZone(75, unbanded), "good");
  assert.equal(efficiencyZone(76, unbanded), "acceptable");
});

test("efficiency and NPSH interpolate within the traced curve", () => {
  assert.equal(efficiencyAtFlow(family60, 60), 78);
  assert.equal(efficiencyAtFlow(family60, 50), 73); // midway between 68 and 78
  assert.equal(npshAtFlow(family60, 40), 3);
});

test("efficiency is null outside the curve the catalogue draws", () => {
  // The plotted curve runs 20..80 m3/h (index 0 is null). Beyond it there is no
  // published efficiency, and carrying the end value across would let a badly
  // oversized pump claim its best-point efficiency at a flow it never sees.
  assert.equal(efficiencyAtFlow(family60, 5), null);
  assert.equal(efficiencyAtFlow(family60, 200), null);
  assert.equal(npshAtFlow(family60, 5), null);
});

test("shaft power divides hydraulic power by pump efficiency", () => {
  // 60 m3/h at 120 m is 19.62 kW of water power; at 78% the shaft sees 25.2 kW.
  const shaft = shaftKw(60, 120, 78)!;
  assert.ok(Math.abs(shaft - 25.15) < 0.05);
  assert.equal(shaftKw(60, 120, null), null, "no curve means no invented figure");
  assert.equal(shaftKw(60, 120, 0), null);
});

// ---------------------------------------------------------------------------
// selection
// ---------------------------------------------------------------------------

test("rejects nonsensical input", () => {
  for (const input of [
    { qM3h: 0, hM: 100 },
    { qM3h: 60, hM: 0 },
    { qM3h: -5, hM: 100 },
    { qM3h: Number.NaN, hM: 100 },
  ]) {
    assert.equal(selectPumps(input, [family60]).status, "invalid");
  }
});

test("never recommends a pump that falls short of the required head", () => {
  // At 60 m3/h the /09 gives 126 m and the /10 gives 140 m.
  const result = selectPumps({ qM3h: 60, hM: 130 }, [family60]);
  assert.equal(result.status, "ok");
  const codes = [result.top, ...result.alternatives].map((c) => c!.variant.code);
  assert.ok(!codes.includes("TEST-660/09"), "126 m cannot serve a 130 m duty");
  for (const candidate of [result.top!, ...result.alternatives]) {
    assert.ok(candidate.headM >= 130);
  }
});

test("ranks by published efficiency, not by tightest head fit", () => {
  // At 60 m3/h TEST-660/09 gives 126 m at 78% and TEST-646/09 gives 122 m at 66%,
  // against a 120 m duty. The less efficient pump fits the head better, so a
  // head-first rule would pick it; the owner's rule puts efficiency first.
  const result = selectPumps({ qM3h: 60, hM: 120 }, [family60, family46]);
  assert.equal(result.top!.variant.code, "TEST-660/09");
  assert.equal(result.top!.zone, "optimal");
  assert.equal(result.top!.etaPct, 78);

  const alt = result.alternatives.find((c) => c.family.code === "TEST-646");
  assert.ok(alt, "the less efficient pump should still be offered as an alternative");
  assert.ok(
    alt!.headExcess < result.top!.headExcess,
    "the alternative fits head better yet still ranks below on efficiency",
  );
  assert.ok(alt!.etaPct! < result.top!.etaPct!);
  assert.equal(alt!.zone, "acceptable");
});

test("reports shaft power and motor load at the delivered head", () => {
  const result = selectPumps({ qM3h: 60, hM: 120 }, [family60]);
  const top = result.top!;
  // Power follows the head the pump actually delivers (126 m for the /09), not the
  // 120 m that was asked for: the surplus is real work the motor has to do.
  assert.equal(top.headM, 126);
  assert.ok(Math.abs(top.hydraulicKw - (60 * 126) / 367) < 0.02);
  assert.equal(top.etaPct, 78);
  assert.ok(Math.abs(top.shaftKw! - 26.41) < 0.05);
  assert.ok(Math.abs(top.motorLoad! - 26.41 / 22) < 0.01);
  assert.equal(top.npshM, 3.6);
});

test("head fit breaks ties within one family", () => {
  // /09 (126 m) and /10 (140 m) both serve a 120 m duty at the same BEP distance.
  const result = selectPumps({ qM3h: 60, hM: 120 }, [family60]);
  assert.equal(result.top!.variant.code, "TEST-660/09", "smallest sufficient wins");
});

test("caps head overshoot at +30% by default", () => {
  // At 60 m3/h a 20 m duty could be met by everything up to /12 (168 m); only the
  // /01 (14 m) is too small. Nothing sits within +30% of 20 m, so the engine
  // relaxes the cap and says so rather than returning nothing.
  const result = selectPumps({ qM3h: 60, hM: 20 }, [family60]);
  assert.equal(result.status, "oversized");
  assert.ok(result.appliedCapPct! > 0.3);
  assert.ok(result.top);
});

test("reports the achievable head when nothing reaches the target", () => {
  const result = selectPumps({ qM3h: 60, hM: 5000 }, [family60]);
  assert.equal(result.status, "no-match");
  assert.equal(result.top, null);
  assert.equal(result.matchCount, 0);
  assert.equal(result.bestAvailableHeadM, 168, "the /12 is the tallest at 60 m3/h");
});

test("returns no-match when the flow is outside every published range", () => {
  const result = selectPumps({ qM3h: 5000, hM: 100 }, [family60]);
  assert.equal(result.status, "no-match");
  assert.equal(result.bestAvailableHeadM, null);
});

test("alternatives stay diverse across families", () => {
  const many: PumpFamily[] = Array.from({ length: 6 }, (_, i) => ({
    ...family60,
    code: `FAM-${i}`,
    qNomM3h: 60 + i, // slightly different BEP so ordering is deterministic
    variants: family60.variants.map((v) => variant(`FAM-${i}/${v.stages}`, v.stages, v.headsM)),
  }));
  const result = selectPumps({ qM3h: 60, hM: 120 }, many);
  const counts = new Map<string, number>();
  for (const c of [result.top!, ...result.alternatives]) {
    counts.set(c.family.code, (counts.get(c.family.code) ?? 0) + 1);
  }
  for (const [code, n] of counts) {
    assert.ok(n <= 2, `${code} contributed ${n} entries; at most 2 expected`);
  }
});

// ---------------------------------------------------------------------------
// motors
// ---------------------------------------------------------------------------

test("motor list is limited to bores that physically fit", () => {
  const sixInchOnly = variant("X/1", 1, [10], { motorBores: [6], motorHp: 30, motorKw: 22 });
  const options = compatibleMotors(sixInchOnly, motors);
  assert.deepEqual(
    options.choices.map((c) => c.motor.code),
    ["KM6-20", "KM6-25", "KM6-30", "KM6-35"],
  );
  assert.ok(!options.choices.some((c) => c.motor.boreInch !== 6));
});

test("motor list is HP-ascending, HP-deduped, and prefers the narrower bore", () => {
  const options = compatibleMotors(
    variant("X/1", 1, [10], { motorBores: [6, 7], motorHp: 30, motorKw: 22 }),
    motors,
  );
  const hps = options.choices.map((c) => c.motor.hp);
  assert.deepEqual(hps, [...hps].sort((a, b) => a - b), "ascending");
  assert.equal(new Set(hps).size, hps.length, "no duplicate HP");
  // 30 HP exists as both KM6-30 and KM7-30; the 6" is the cheaper, stocked one.
  assert.equal(options.choices.find((c) => c.motor.hp === 30)!.motor.code, "KM6-30");
});

test("motor statuses are tagged against the catalogue recommendation", () => {
  const options = compatibleMotors(
    variant("X/1", 1, [10], { motorBores: [6, 7], motorHp: 30, motorKw: 22 }),
    motors,
  );
  assert.ok(options.hasExactMatch);
  const recommended = options.choices.filter((c) => c.status === "recommended");
  assert.equal(recommended.length, 1, "exactly one recommendation");
  assert.equal(recommended[0].motor.hp, 30);

  const byHp = new Map(options.choices.map((c) => [c.motor.hp, c]));
  assert.equal(byHp.get(25)!.status, "undersized");
  assert.equal(byHp.get(35)!.status, "upsized");
  assert.ok(Math.abs(byHp.get(35)!.delta - 5 / 30) < 1e-9);
  assert.ok(Math.abs(byHp.get(25)!.delta - -5 / 30) < 1e-9);
});

test("no KM series for the bore means no override is offered", () => {
  // The catalogue's pump tables reference 4" and 12" motors, which have no KM range.
  const options = compatibleMotors(
    variant("X/1", 1, [10], { motorBores: [4], motorHp: 2, motorKw: 1.5 }),
    motors,
  );
  assert.deepEqual(options.choices, []);
  assert.equal(options.hasExactMatch, false);
  assert.equal(options.recommendedHp, 2, "the recommendation is still reported");
  assert.equal(resolveMotor(options, null).choice, null);
});

test("when the ladder skips the recommended HP, the default rounds up", () => {
  // 180 HP is recommended by some pumps but KM10 offers 175 and 200.
  const options = compatibleMotors(
    variant("X/1", 1, [10], { motorBores: [10], motorHp: 180, motorKw: 132 }),
    [
      {
        code: "KM10-175",
        boreInch: 10,
        hp: 175,
        kw: 129,
        voltage: 380,
        rpm: 2900,
        currentA: 235,
        startingCurrentA: 900,
        efficiencyPct: 88,
        cosPhi: 0.88,
        lengthMm: 1650,
        weightKg: 360,
      },
      {
        code: "KM10-200",
        boreInch: 10,
        hp: 200,
        kw: 147,
        voltage: 380,
        rpm: 2910,
        currentA: 268,
        startingCurrentA: 1020,
        efficiencyPct: 88.5,
        cosPhi: 0.89,
        lengthMm: 1720,
        weightKg: 395,
      },
    ],
  );
  assert.equal(options.hasExactMatch, false);
  assert.equal(resolveMotor(options, null).choice!.motor.code, "KM10-200", "never rounds down");
});

test("an override is honoured, and undersizing is flagged", () => {
  const options = compatibleMotors(
    variant("X/1", 1, [10], { motorBores: [6], motorHp: 30, motorKw: 22 }),
    motors,
  );
  const up = resolveMotor(options, 35);
  assert.equal(up.choice!.motor.code, "KM6-35");
  assert.equal(up.isOverride, true);
  assert.equal(up.isUndersized, false);

  const down = resolveMotor(options, 25);
  assert.equal(down.choice!.motor.code, "KM6-25");
  assert.equal(down.isUndersized, true, "must be flagged for the overload warning");
});

test("an impossible override falls back to the recommendation", () => {
  const options = compatibleMotors(
    variant("X/1", 1, [10], { motorBores: [6], motorHp: 30, motorKw: 22 }),
    motors,
  );
  for (const bogus of [999, 0, -5, 100 /* exists, but only as a 10" motor */]) {
    const resolved = resolveMotor(options, bogus);
    assert.equal(resolved.choice!.motor.hp, 30, `hp=${bogus} should be ignored`);
    assert.equal(resolved.isOverride, false);
  }
});

// ---------------------------------------------------------------------------
// real catalogue
// ---------------------------------------------------------------------------

const realFamilies = JSON.parse(
  readFileSync(new URL("../data/pump-curves.json", import.meta.url), "utf8"),
) as PumpFamily[];
const realMotors = JSON.parse(
  readFileSync(new URL("../data/km-motors.json", import.meta.url), "utf8"),
) as KmMotor[];

test("real catalogue: 60 m3/h at 120 m picks a 6\" pump running in its shaded band", () => {
  // Two families are nominally 60 m3/h — KP-660 (bolted) and K6SX-60 (cast) — and
  // they are within a point of each other on efficiency here, so either may win a
  // regenerated dataset. The rule is asserted rather than a model code.
  const result = selectPumps({ qM3h: 60, hM: 120 }, realFamilies);
  assert.equal(result.status, "ok");
  assert.equal(result.top!.family.qNomM3h, 60);
  assert.equal(result.top!.family.boreInch, 6);
  assert.equal(result.top!.zone, "optimal");
  assert.ok(result.top!.headM >= 120);
  assert.ok(result.alternatives.length > 0);

  // Nothing offered is more efficient than the winner.
  for (const c of result.alternatives) {
    assert.ok(
      Math.round(c.etaPct ?? -1) <= Math.round(result.top!.etaPct!),
      `${c.variant.code} is more efficient than the top pick`,
    );
  }

  // And the rule bites: something fits the head more tightly but ranks lower for
  // being less efficient at this duty.
  const tighter = result.alternatives.find((c) => c.headExcess < result.top!.headExcess);
  if (tighter) {
    assert.ok(
      Math.round(tighter.etaPct ?? -1) < Math.round(result.top!.etaPct!),
      "a tighter head fit should only rank lower on efficiency",
    );
  }
});

test("real catalogue: a badly oversized pump never wins on a borrowed efficiency", () => {
  // K10SX-200 reaches 121 m at 60 m3/h, more tightly than any 6" pump does, but
  // 60 m3/h is far below where its efficiency curve starts. Before the curve was
  // clamped off, it borrowed its 80% best-point figure and won the ranking — a 10"
  // pump for a duty a 6" pump serves.
  const result = selectPumps({ qM3h: 60, hM: 120 }, realFamilies);
  const offCurve = [result.top!, ...result.alternatives].filter((c) => c.etaPct === null);
  for (const c of offCurve) {
    assert.ok(
      result.alternatives.indexOf(c) >= 0,
      `${c.variant.code} has no published efficiency and must not be the top pick`,
    );
  }
  assert.notEqual(result.top!.etaPct, null);
  assert.ok(result.top!.family.boreInch < 10);
});

test("real catalogue: equivalent duty points in other units agree", () => {
  const base = selectPumps({ qM3h: 60, hM: 120 }, realFamilies);
  const viaLs = selectPumps(
    { qM3h: toM3h(60 / 3.6, "ls"), hM: toMeters(120 / 10.19716, "bar") },
    realFamilies,
  );
  assert.equal(viaLs.top!.variant.code, base.top!.variant.code);
});

test("real catalogue: every candidate reaches the requested head", () => {
  for (const [q, h] of [
    [30, 200],
    [60, 120],
    [100, 300],
    [200, 150],
    [15, 400],
  ] as const) {
    const result = selectPumps({ qM3h: q, hM: h }, realFamilies);
    if (result.status === "no-match") continue;
    for (const candidate of [result.top!, ...result.alternatives]) {
      assert.ok(
        candidate.headM >= h,
        `${candidate.variant.code} gives ${candidate.headM} m for a ${h} m duty at ${q} m3/h`,
      );
    }
  }
});

test("real catalogue: absurd duty points fail cleanly", () => {
  assert.equal(selectPumps({ qM3h: 5000, hM: 50 }, realFamilies).status, "no-match");
  assert.equal(selectPumps({ qM3h: 20, hM: 5000 }, realFamilies).status, "no-match");
});

test("real catalogue: withheld KP-895 variants are absent", () => {
  for (const code of ["KP-895/21", "KP-895/22", "KP-895/23", "KP-895/24"]) {
    assert.equal(findVariant(code, realFamilies), null, `${code} should be withheld`);
  }
  assert.ok(findVariant("KP-895/20", realFamilies), "KP-895/20 remains available");
});

test("real catalogue: corrected cells carry the repaired value", () => {
  const found = findVariant("KP-610/30", realFamilies);
  assert.ok(found);
  // Column 3 is the 9 m3/h breakpoint; the catalogue misprints 375 m there.
  assert.equal(found!.family.flowPointsM3h[3], 9);
  assert.equal(found!.variant.headsM[3], 273);
  assert.deepEqual(found!.variant.correctedColumns, [3]);
});

test("real catalogue: every variant's default motor is never undersized", () => {
  for (const family of realFamilies) {
    for (const v of family.variants) {
      const options = compatibleMotors(v, realMotors);
      const { choice } = resolveMotor(options, null);
      if (choice === null) continue; // 4"/12" pumps have no KM range
      assert.ok(
        choice.motor.hp >= v.motorHp,
        `${v.code} defaults to ${choice.motor.hp} HP below the recommended ${v.motorHp} HP`,
      );
    }
  }
});
