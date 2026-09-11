/**
 * Deep Oasis conformance. Run with:
 *
 *   node --test src/lib/design-system.test.ts
 *
 * The brand system in `src/app/globals.css` is not advice — it names five
 * colours, one radius (none) and one way to separate surfaces (a hairline).
 * Nothing enforced that, so the public site drifted back to stock Tailwind:
 * neutral greys next to the brand greys, rounded-xl next to square, drop
 * shadows next to hairlines, and `rgba(16,185,129)` — Tailwind's emerald,
 * which is not a colour this brand owns — used as an atmospheric wash.
 *
 * These assertions are the mechanical half of the system. They cannot judge
 * whether a heading is set at the right level or whether bone-on-pine clears
 * AA; they can prove that no file reintroduces a token the system replaced.
 * That is worth having, because the drift did not arrive in one bad commit —
 * it arrived one `rounded-xl` at a time.
 *
 * Scope is the public site. `/admin` is an internal CRM with different needs
 * (density, scannability over brand) and is deliberately exempt.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const ROOT = join(import.meta.dirname, "..", "..");
const SRC = join(ROOT, "src");

/** Directories whose contents are not part of the public brand surface. */
const EXEMPT_DIRS = [
  join("src", "components", "admin"),
  join("src", "app", "admin"),
];

/**
 * Circles that are genuinely circular. A radius rule exists to stop
 * rounded rectangles, not to square off a dot or a round button — so
 * `rounded-full` is allowed where the element is actually a circle, and
 * only there. Each entry is a file plus why it holds.
 */
const CIRCLE_ALLOWLIST: Record<string, string> = {
  [join("src", "components", "WhatsAppButton.tsx")]: "round floating action button",
  [join("src", "components", "Header.tsx")]: "cart count badge",
  [join("src", "components", "cart", "CartButton.tsx")]: "cart count badge",
  [join("src", "components", "ProductDetailView.tsx")]: "bullet dot",
  [join("src", "app", "[lang]", "agents", "[slug]", "page.tsx")]: "bullet dot",
};

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(tsx|ts|css)$/.test(entry) && !/\.test\.ts$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const publicFiles = walk(SRC)
  .map((f) => relative(ROOT, f))
  .filter((f) => !EXEMPT_DIRS.some((d) => f.startsWith(d + sep)))
  // globals.css defines the system, so it is allowed to name the values the
  // rest of the site may not hardcode.
  .filter((f) => f !== join("src", "app", "globals.css"));

/** Every match of `re`, as "path:line — the offending line". */
function findAll(re: RegExp): string[] {
  const hits: string[] = [];
  for (const file of publicFiles) {
    const lines = readFileSync(join(ROOT, file), "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (new RegExp(re.source, re.flags.replace("g", "")).test(line)) {
        hits.push(`${file}:${i + 1} — ${line.trim().slice(0, 100)}`);
      }
    });
  }
  return hits;
}

function report(hits: string[], rule: string): string {
  return `${hits.length} violation(s) of "${rule}":\n${hits.join("\n")}`;
}

test("no rounded corners — the system sets one radius, and it is zero", () => {
  const hits = findAll(/\brounded-(sm|md|lg|xl|2xl|3xl)\b/).filter((h) => {
    const file = h.split(":")[0];
    return !(file in CIRCLE_ALLOWLIST);
  });
  assert.equal(hits.length, 0, report(hits, "no rounded-sm|md|lg|xl|2xl|3xl"));
});

test("rounded-full only where the element is actually a circle", () => {
  const hits = findAll(/\brounded-full\b/).filter((h) => {
    const file = h.split(":")[0];
    return !(file in CIRCLE_ALLOWLIST);
  });
  assert.equal(hits.length, 0, report(hits, "rounded-full outside the circle allowlist"));
});

test("no stock neutral greys — the palette's greys are stone, bone, ink and rule", () => {
  const hits = findAll(/\b(?:text|bg|border|divide|ring|from|via|to)-neutral-\d{2,3}\b/);
  assert.equal(hits.length, 0, report(hits, "no neutral-* utilities"));
});

test("no drop shadows — surfaces separate on a hairline, not a shadow", () => {
  const hits = findAll(/\bshadow-(sm|md|lg|xl|2xl|xs)\b/);
  assert.equal(hits.length, 0, report(hits, "no shadow-* utilities"));
});

test("no stock Tailwind emerald — 16,185,129 is not a colour this brand owns", () => {
  const hits = findAll(/16,\s*185,\s*129/);
  assert.equal(hits.length, 0, report(hits, "no rgba(16,185,129,…)"));
});
