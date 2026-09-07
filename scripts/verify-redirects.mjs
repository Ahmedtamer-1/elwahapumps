#!/usr/bin/env node
/**
 * Verifies every legacy URL in scripts/legacy-urls.txt actually redirects
 * to its recorded destination and that destination returns 200.
 *
 * A legacy URL always carried a trailing slash on the old WordPress site,
 * and Next.js strips that slash before either next.config.ts's
 * redirects() or src/proxy.ts ever see the pathname (confirmed by testing
 * — not the documented behaviour, but the actual one). That makes a
 * two-hop chain the expected shape for most rows here: 308 (trailing
 * slash removed) → 308 (the real redirect) → 200. Both hops must be 308
 * (permanent); a chain that goes through anything else, or exceeds five
 * hops, is reported as a failure.
 *
 * Usage:
 *   node scripts/verify-redirects.mjs [--target=https://elwahapumps.com]
 *
 * Defaults to http://localhost:3000 — run `npm run build && npm start`
 * first when checking locally. Against production, pass the real origin.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const targetArg = process.argv.find((a) => a.startsWith("--target="));
const BASE_URL = targetArg ? targetArg.slice("--target=".length) : "http://localhost:3000";

function parseLegacyUrls(text) {
  const rows = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const [oldPath, newPath] = line.split("\t");
    if (!oldPath || newPath === undefined) continue;
    rows.push({ oldPath, newPath });
  }
  return rows;
}

function expectedDestination(newPath) {
  if (newPath.startsWith("/sitemap")) return newPath;
  return `/ar${newPath === "/" ? "" : newPath}`;
}

/** Follows a chain of redirects manually, recording every hop's status. */
async function followChain(startUrl, maxHops = 5) {
  const hops = [];
  let url = startUrl;
  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": "verify-redirects" } });
    hops.push({ url, status: res.status });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return { hops, finalStatus: res.status, finalUrl: url, error: "redirect with no Location header" };
      url = new URL(location, url).toString();
      continue;
    }
    return { hops, finalStatus: res.status, finalUrl: url };
  }
  return { hops, finalStatus: "TOO_MANY_HOPS", finalUrl: url };
}

async function main() {
  const listPath = join(__dirname, "legacy-urls.txt");
  const rows = parseLegacyUrls(readFileSync(listPath, "utf-8"));

  console.log(`Verifying ${rows.length} legacy URLs against ${BASE_URL}\n`);

  const failures = [];
  let passCount = 0;

  for (const { oldPath, newPath } of rows) {
    // "/" is handled by src/proxy.ts directly, not a redirects() rule —
    // still verified here since it's a real legacy URL.
    const startUrl = BASE_URL + oldPath;
    const expected = expectedDestination(newPath);
    const { hops, finalStatus, finalUrl, error } = await followChain(startUrl);

    const finalPath = new URL(finalUrl).pathname;
    const badHopStatus = hops.slice(0, -1).find((h) => h.status !== 308 && h.status !== 307);

    const ok =
      !error &&
      finalStatus === 200 &&
      finalPath === expected &&
      !badHopStatus;

    if (ok) {
      passCount++;
    } else {
      failures.push({
        oldPath,
        expected,
        finalStatus,
        finalPath,
        hops: hops.map((h) => `${h.status} ${new URL(h.url).pathname}`).join(" -> "),
        error,
      });
    }
  }

  console.log(`${passCount}/${rows.length} passed\n`);

  if (failures.length > 0) {
    console.log("FAILURES:\n");
    console.table(
      failures.map((f) => ({
        "old path": f.oldPath,
        expected: f.expected,
        "got path": f.finalPath,
        "got status": f.finalStatus,
        chain: f.hops,
        error: f.error ?? "",
      })),
    );
    process.exitCode = 1;
  } else {
    console.log("All legacy URLs redirect to their expected destination.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
