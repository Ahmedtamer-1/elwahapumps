/**
 * Validates src/data/pump-curves.json and src/data/km-motors.json.
 *
 *   node scripts/verify-pump-curves.mjs
 *
 * Exits non-zero on the first category of failure found. Nothing should consume
 * this data until it exits 0: a head value that is wrong by a column would put an
 * undersized pump down a customer's well, and no amount of UI polish recovers
 * from that. The checks below are therefore physical invariants, not style nits.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const families = JSON.parse(
  readFileSync(join(ROOT, "src", "data", "pump-curves.json"), "utf8"),
);
const motors = JSON.parse(
  readFileSync(join(ROOT, "src", "data", "km-motors.json"), "utf8"),
);

const EXPECTED_FAMILY_COUNT = 27;
const EXPECTED_MOTOR_COUNT = 49;
// 930 rows are printed across the two catalogues; 4 (KP-895/21../24) are withheld
// by scripts/pump-curve-corrections.json because their printed curves are unusable.
const EXPECTED_VARIANT_COUNT = 926;

const failures = [];
const warnings = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);

/** Variants whose recommended motor has no KM equivalent — see the tally below. */
const motorGaps = { noSeries: [], noExactHp: [] };

// ---------------------------------------------------------------------------
// motors
// ---------------------------------------------------------------------------

if (motors.length !== EXPECTED_MOTOR_COUNT) {
  fail("km-motors", `expected ${EXPECTED_MOTOR_COUNT} motors, got ${motors.length}`);
}

const motorsByBore = new Map();
for (const motor of motors) {
  const match = /^KM(6|7|8|10)-(\d+(?:\.\d+)?)$/.exec(motor.code);
  if (!match) {
    fail("km-motors", `code ${motor.code} is not KM{bore}-{hp}`);
    continue;
  }
  if (Number(match[1]) !== motor.boreInch) {
    fail("km-motors", `${motor.code} bore field ${motor.boreInch} != code`);
  }
  if (Number(match[2]) !== motor.hp) {
    fail("km-motors", `${motor.code} hp field ${motor.hp} != code suffix`);
  }
  if (!(motor.kw > 0) || !(motor.hp > 0)) {
    fail("km-motors", `${motor.code} has non-positive power (${motor.kw} kW / ${motor.hp} HP)`);
  }
  // A motor's kW should be ~0.735 x HP; the catalogue rounds to a standard frame,
  // so allow a generous band and only assert the two columns aren't transposed.
  const ratio = motor.kw / motor.hp;
  if (ratio < 0.6 || ratio > 0.95) {
    fail("km-motors", `${motor.code} kW/HP ratio ${ratio.toFixed(2)} is implausible`);
  }
  if (!motorsByBore.has(motor.boreInch)) motorsByBore.set(motor.boreInch, new Set());
  motorsByBore.get(motor.boreInch).add(motor.hp);

  // Data-sheet figures. These reach the customer on a printed selection, and a
  // decimal point in the wrong place is not obvious by eye, so each is bounded by
  // what a 2-pole submersible motor can physically be.
  if (!(motor.rpm >= 2700 && motor.rpm <= 3000)) {
    fail("km-motors", `${motor.code} rpm ${motor.rpm} is not a 2-pole speed`);
  }
  if (!(motor.efficiencyPct >= 60 && motor.efficiencyPct <= 95)) {
    fail("km-motors", `${motor.code} efficiency ${motor.efficiencyPct} % is implausible`);
  }
  if (!(motor.cosPhi > 0.5 && motor.cosPhi <= 1)) {
    fail("km-motors", `${motor.code} cos phi ${motor.cosPhi} is implausible`);
  }
  if (!(motor.lengthMm > 300 && motor.lengthMm < 4000)) {
    fail("km-motors", `${motor.code} length ${motor.lengthMm} mm is implausible`);
  }
  if (!(motor.weightKg > 5 && motor.weightKg < 1500)) {
    fail("km-motors", `${motor.code} weight ${motor.weightKg} kg is implausible`);
  }
  if (motor.startingCurrentA <= motor.currentA) {
    fail("km-motors", `${motor.code} starting current ${motor.startingCurrentA} A is not above running ${motor.currentA} A`);
  }
  // Cross-check the nameplate against the electrical row it was read from: the two
  // came off different tables on different pages, so agreement means neither was
  // mis-attributed to a neighbouring motor.
  const inputKw = (Math.sqrt(3) * motor.voltage * motor.currentA * motor.cosPhi) / 1000;
  const impliedKw = (inputKw * motor.efficiencyPct) / 100;
  const drift = Math.abs(impliedKw - motor.kw) / motor.kw;
  if (drift > 0.15) {
    fail(
      "km-motors",
      `${motor.code}: ${motor.currentA} A at ${motor.voltage} V, cos phi ${motor.cosPhi},` +
        ` eff ${motor.efficiencyPct} % implies ${impliedKw.toFixed(1)} kW shaft,` +
        ` but it is rated ${motor.kw} kW (${(drift * 100).toFixed(0)} % apart)`,
    );
  }
}

// Motor length and weight must both rise with power within a bore: the frame only
// gets longer as stacks are added. A fall means two rows were read out of order.
for (const [bore, _] of motorsByBore) {
  const ladder = motors
    .filter((m) => m.boreInch === bore)
    .sort((a, b) => a.hp - b.hp);
  for (let i = 1; i < ladder.length; i += 1) {
    if (ladder[i].lengthMm < ladder[i - 1].lengthMm) {
      fail("km-motors", `${bore}": ${ladder[i].code} is shorter than the smaller ${ladder[i - 1].code}`);
    }
    if (ladder[i].weightKg < ladder[i - 1].weightKg) {
      fail("km-motors", `${bore}": ${ladder[i].code} is lighter than the smaller ${ladder[i - 1].code}`);
    }
  }
}

// ---------------------------------------------------------------------------
// families
// ---------------------------------------------------------------------------

if (families.length !== EXPECTED_FAMILY_COUNT) {
  fail("families", `expected ${EXPECTED_FAMILY_COUNT}, got ${families.length}`);
}

const seenCodes = new Map();
let variantCount = 0;

for (const family of families) {
  const where = family.code;
  const flows = family.flowPointsM3h;
  const n = flows.length;

  if (n < 4) fail(where, `only ${n} flow breakpoints`);
  if (family.flowPointsLs.length !== n) {
    fail(where, `${n} m3/h breakpoints but ${family.flowPointsLs.length} l/s`);
  }
  if (flows[0] !== 0) fail(where, `first flow breakpoint is ${flows[0]}, expected 0`);
  for (let i = 1; i < n; i += 1) {
    if (!(flows[i] > flows[i - 1])) {
      fail(where, `flow breakpoints not ascending at index ${i}: ${flows.join(", ")}`);
    }
  }
  // l/s and m3/h must describe the same points: 1 l/s = 3.6 m3/h. Both rows are
  // printed rounded, so the tolerance comes from that precision rather than a
  // guess: l/s is given to one decimal (±0.05 l/s = ±0.18 m3/h) and m3/h as an
  // integer (±0.5), so a faithful pair can legitimately disagree by ~0.7 m3/h.
  // KP-610 prints "1.6 l/s" against "6 m3/h", where 1.67 would be exact.
  const roundingSlack = 0.7;
  for (let i = 0; i < Math.min(n, family.flowPointsLs.length); i += 1) {
    const derived = family.flowPointsLs[i] * 3.6;
    const off = Math.abs(derived - flows[i]);
    if (flows[i] > 0 && off > Math.max(roundingSlack, flows[i] * 0.02)) {
      fail(where, `flow column ${i}: ${family.flowPointsLs[i]} l/s = ${derived.toFixed(1)} m3/h, but m3/h row says ${flows[i]}`);
    }
  }

  if (!(family.qNomM3h > 0) || family.qNomM3h > flows[n - 1]) {
    fail(where, `qNom ${family.qNomM3h} outside flow range 0..${flows[n - 1]}`);
  }
  if (![6, 8, 10].includes(family.boreInch)) {
    fail(where, `bore ${family.boreInch}" is out of scope for v1`);
  }
  if (!family.outlet) {
    warn(where, "no outlet connection stated on its catalogue page");
  }

  // Efficiency and NPSH, read off the chart pages by scripts/extract_chart_curves.py.
  // These are traced from drawn polylines rather than tabulated figures, so they get
  // checked against the physics harder than the table data does.
  if (!Array.isArray(family.etaPct) || family.etaPct.length !== n) {
    fail(where, `etaPct must have ${n} entries, one per flow breakpoint`);
  } else {
    const known = family.etaPct
      .map((value, i) => ({ value, flow: flows[i] }))
      .filter((p) => p.value !== null);
    if (known.length < 3) {
      fail(where, `only ${known.length} efficiency points could be read`);
    } else {
      const best = known.reduce((a, b) => (b.value > a.value ? b : a));
      if (best.value < 45 || best.value > 90) {
        fail(where, `peak efficiency ${best.value} % is outside 45-90 %`);
      }
      // A pump peaks at its nominal flow — that is what the number in the model
      // code means. If the traced curve peaks somewhere else, the chart's flow
      // axis was mis-calibrated and every efficiency on it is wrong.
      const off = Math.abs(best.flow - family.qNomM3h) / family.qNomM3h;
      if (off > 0.3) {
        fail(where, `efficiency peaks at ${best.flow} m3/h, but the model code says nominal is ${family.qNomM3h}`);
      }
      for (const point of known) {
        if (point.value < 0 || point.value > 90) {
          fail(where, `efficiency ${point.value} % at ${point.flow} m3/h is out of range`);
        }
      }
    }
  }

  if (!Array.isArray(family.npshM) || family.npshM.length !== n) {
    fail(where, `npshM must have ${n} entries, one per flow breakpoint`);
  } else {
    const known = family.npshM.filter((v) => v !== null);
    if (known.some((v) => v <= 0 || v > 20)) {
      fail(where, `NPSH values out of range: ${known.join(", ")}`);
    }
    // NPSH required rises with flow. It may dip slightly below the best-efficiency
    // point, so only a fall across the whole range is treated as an error.
    if (known.length >= 2 && known.at(-1) <= known[0]) {
      fail(where, `NPSH does not rise across the flow range (${known[0]} -> ${known.at(-1)} m)`);
    }
  }

  if (family.bandM3h) {
    const [low, high] = family.bandM3h;
    if (!(low < high) || low < 0 || high > flows[n - 1] * 1.25) {
      fail(where, `recommended flow band ${low}-${high} m3/h is not inside the plotted range`);
    }
  } else {
    warn(where, "no recommended-flow band could be read from its chart");
  }

  for (const variant of family.variants) {
    variantCount += 1;
    const at = `${where} ${variant.code}`;

    if (seenCodes.has(variant.code)) {
      fail(at, `duplicate code, already seen in ${seenCodes.get(variant.code)}`);
    }
    seenCodes.set(variant.code, where);

    if (variant.code !== `${variant.model}${variant.trim ?? ""}`) {
      fail(at, `code does not equal model + trim (${variant.model} + ${variant.trim})`);
    }
    if (variant.model.split("/")[0] !== family.code) {
      fail(at, `belongs to family ${variant.model.split("/")[0]}, not ${family.code}`);
    }
    if (Number(variant.model.split("/")[1]) !== variant.stages) {
      fail(at, `stages ${variant.stages} disagrees with the model suffix`);
    }

    if (variant.headsM.length !== n) {
      fail(at, `${variant.headsM.length} head values for ${n} flow breakpoints`);
      continue;
    }
    if (variant.headsM[0] === null) {
      fail(at, "no shut-off head (flow 0) — the row did not parse");
    }

    // Head falls as flow rises. Equality is allowed: the catalogue prints repeated
    // values on flat parts of a curve (K10SX-200/1 lists 31 twice).
    let sawNull = false;
    for (let i = 0; i < n; i += 1) {
      const head = variant.headsM[i];
      if (head === null) {
        sawNull = true;
        continue;
      }
      // A dash means "not permitted at this flow", which can only apply to the
      // high-flow tail. A gap in the middle means a cell was dropped.
      if (sawNull) {
        fail(at, `head present at flow ${flows[i]} after an earlier blank — a cell was missed`);
      }
      if (!(head > 0)) fail(at, `head ${head} at flow ${flows[i]} is not positive`);
      const previous = variant.headsM[i - 1];
      if (i > 0 && previous !== null && head > previous) {
        fail(at, `head rises with flow: ${previous} -> ${head} at flow ${flows[i]}`);
      }
    }

    if (!(variant.motorKw > 0)) fail(at, `motorKw ${variant.motorKw}`);
    if (!(variant.motorHp > 0)) fail(at, `motorHp ${variant.motorHp}`);
    if (!(variant.lengthMm > 0)) fail(at, `lengthMm ${variant.lengthMm}`);
    if (!(variant.weightKg > 0)) fail(at, `weightKg ${variant.weightKg}`);

    if (!variant.motorBores?.length) {
      fail(at, "no motor bore sizes");
    } else {
      for (let i = 1; i < variant.motorBores.length; i += 1) {
        if (!(variant.motorBores[i] > variant.motorBores[i - 1])) {
          fail(at, `motorBores not ascending: ${variant.motorBores.join("-")}`);
        }
      }
      // Not every recommendation maps onto a KM motor, and that is the catalogue's
      // doing rather than a parse error: the pump tables also reference 4" and 12"
      // motors, which have no KM series, and occasionally an HP the ladder skips
      // (180 HP on a KM10, which offers 175 and 200). Those variants simply get no
      // override dropdown. Tallied so the UI's coverage is a known quantity.
      const coveredBores = variant.motorBores.filter((b) => motorsByBore.has(b));
      if (coveredBores.length === 0) {
        motorGaps.noSeries.push(`${at} (${variant.motorHp} HP, bore ${variant.motorBores.join("/")})`);
      } else if (!coveredBores.some((b) => motorsByBore.get(b).has(variant.motorHp))) {
        motorGaps.noExactHp.push(`${at} (${variant.motorHp} HP, bore ${coveredBores.join("/")})`);
      }
      // What must hold is that the recommendation is in the right ballpark for a
      // covered bore — an off-by-a-column HP would land far outside the ladder.
      for (const bore of coveredBores) {
        const ladder = [...motorsByBore.get(bore)].sort((a, b) => a - b);
        if (variant.motorHp > ladder.at(-1) * 1.5) {
          fail(at, `${variant.motorHp} HP far exceeds the KM${bore} ladder (max ${ladder.at(-1)})`);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Cross-row checks, grouped by trim. These are what actually catch a
  // misparsed row: a shifted column or a dropped digit breaks them even when
  // the row looks individually plausible.
  // ------------------------------------------------------------------
  const byTrim = new Map();
  for (const variant of family.variants) {
    const key = variant.trim ?? "";
    if (!byTrim.has(key)) byTrim.set(key, []);
    byTrim.get(key).push(variant);
  }

  for (const [trim, group] of byTrim) {
    const label = trim ? `${where} trim ${trim}` : where;
    const ordered = [...group].sort((a, b) => a.stages - b.stages);

    for (let i = 1; i < ordered.length; i += 1) {
      const previous = ordered[i - 1];
      const current = ordered[i];
      if (current.stages === previous.stages) {
        fail(label, `two variants both at ${current.stages} stages (${previous.code}, ${current.code})`);
      }
      if (current.motorKw < previous.motorKw) {
        fail(label, `motor shrinks with more stages: ${previous.code} ${previous.motorKw} kW -> ${current.code} ${current.motorKw} kW`);
      }
      if (current.lengthMm < previous.lengthMm) {
        fail(label, `length shrinks with more stages: ${previous.code} ${previous.lengthMm} mm -> ${current.code} ${current.lengthMm} mm`);
      }
      // Hard physical invariant: at a fixed flow, adding a stage adds head.
      for (let col = 0; col < n; col += 1) {
        const a = previous.headsM[col];
        const b = current.headsM[col];
        if (a === null || b === null) continue;
        if (b <= a) {
          fail(
            label,
            `head does not increase with stages at flow ${flows[col]}: ${previous.code}=${a} -> ${current.code}=${b}`,
          );
        }
      }
    }

    // Tripwire for a future catalogue revision: the head added by each extra stage
    // is locally stable within a column, so a mis-typeset cell shows up as an
    // increment far from the column's median.
    //
    // A warning rather than a failure, deliberately. Cumulative head/stage is NOT
    // constant across a family — short pumps sit below the trend because entry and
    // exit losses are a fixed overhead, so a strict version fires on every /01 row.
    // The hard invariants above (head falls with flow, head rises with stages) are
    // what actually gate the data; this only points a human at anything odd.
    for (let col = 0; col < n; col += 1) {
      const points = ordered.filter((v) => v.headsM[col] !== null);
      if (points.length < 6) continue;
      const increments = [];
      for (let i = 1; i < points.length; i += 1) {
        increments.push(
          (points[i].headsM[col] - points[i - 1].headsM[col]) /
            (points[i].stages - points[i - 1].stages),
        );
      }
      const sorted = [...increments].sort((a, b) => a - b);
      const typical = sorted[Math.floor(sorted.length / 2)];
      if (!(typical > 0)) continue;
      for (let i = 0; i < increments.length; i += 1) {
        const ratio = increments[i] / typical;
        if (ratio < 0.45 || ratio > 1.9) {
          warn(
            label,
            `${points[i].code} -> ${points[i + 1].code} at flow ${flows[col]} adds ${increments[i].toFixed(1)} m/stage vs typical ${typical.toFixed(1)}`,
          );
        }
      }
    }
  }
}

if (variantCount !== EXPECTED_VARIANT_COUNT) {
  fail("variants", `expected ${EXPECTED_VARIANT_COUNT}, got ${variantCount}`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

console.log(
  `${families.length} families, ${variantCount} variants, ${motors.length} motors`,
);
console.log(
  `bores: ${[...new Set(families.map((f) => f.boreInch))].sort((a, b) => a - b).join('", ')}"`,
);

const flowSpan = families
  .map((f) => `${f.code} qNom=${f.qNomM3h} range=0..${f.flowPointsM3h.at(-1)} n=${f.variants.length}`)
  .join("\n  ");
console.log(`\nfamilies:\n  ${flowSpan}`);

const gapTotal = motorGaps.noSeries.length + motorGaps.noExactHp.length;
console.log(
  `\nmotor override coverage: ${variantCount - gapTotal}/${variantCount} variants map onto a KM motor exactly`,
);
if (motorGaps.noExactHp.length) {
  console.log(
    `  ${motorGaps.noExactHp.length} recommend an HP the KM ladder skips (override offers the neighbouring sizes):`,
  );
  console.log(`    ${motorGaps.noExactHp.slice(0, 6).join("\n    ")}`);
  if (motorGaps.noExactHp.length > 6) console.log(`    … and ${motorGaps.noExactHp.length - 6} more`);
}
if (motorGaps.noSeries.length) {
  console.log(
    `  ${motorGaps.noSeries.length} need a 4" or 12" motor, which has no KM series (no override possible):`,
  );
  console.log(`    ${motorGaps.noSeries.slice(0, 6).join("\n    ")}`);
  if (motorGaps.noSeries.length > 6) console.log(`    … and ${motorGaps.noSeries.length - 6} more`);
}

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s) — data is usable but incomplete:`);
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (failures.length) {
  console.error(`\n${failures.length} FAILURE(S):`);
  for (const f of failures.slice(0, 60)) console.error(`  x ${f}`);
  if (failures.length > 60) console.error(`  … and ${failures.length - 60} more`);
  process.exit(1);
}

console.log("\nAll checks passed.");
