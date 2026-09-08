/**
 * Nightly SQLite backup (PLAN.md S7-T09).
 *
 * Uses SQLite's own `VACUUM INTO`, not a file copy. Copying a live
 * database is unsafe under WAL: the .db file alone can be missing
 * committed transactions that are still only in the -wal sidecar, so a
 * `cp` taken mid-write can restore short. `VACUUM INTO` asks SQLite for a
 * consistent snapshot and writes a single compacted file that is a valid
 * database on its own.
 *
 * Usage:
 *   npx tsx scripts/backup-db.ts [--out=./backups] [--keep=14]
 *
 * Cron it on the VPS, e.g. nightly at 03:15:
 *   15 3 * * * cd /srv/elwaha && npx tsx scripts/backup-db.ts >> /var/log/elwaha-backup.log 2>&1
 *
 * Restore: stop the app, replace the live .db with a backup file (delete
 * any stale -wal/-shm sidecars beside it), then start the app. Do this
 * once on staging before trusting it — an untested backup is a guess.
 */
import "dotenv/config";
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

function arg(name: string, fallback: string): string {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

/** DATABASE_URL is a Prisma URL ("file:./dev.db"), not a plain path. */
function databasePath(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const raw = url.startsWith("file:") ? url.slice("file:".length) : url;
  return resolve(process.cwd(), raw);
}

function main() {
  const dbPath = databasePath();
  if (!existsSync(dbPath)) throw new Error(`No database at ${dbPath}`);

  const outDir = resolve(process.cwd(), arg("out", "./backups"));
  const keep = Number(arg("keep", "14"));
  if (!Number.isInteger(keep) || keep < 1) throw new Error("--keep must be a positive integer");

  mkdirSync(outDir, { recursive: true });

  // Colons are illegal in Windows filenames, so the timestamp is flattened.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = join(outDir, `elwaha-${stamp}.db`);

  const db = new Database(dbPath, { readonly: false });
  try {
    // Single quotes and a doubled-quote escape: the path is ours, but the
    // habit costs nothing.
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  } finally {
    db.close();
  }

  const bytes = statSync(target).size;
  console.log(`✔ ${target} (${(bytes / 1e6).toFixed(2)} MB)`);

  // Prune oldest first, keeping the newest `keep`.
  const backups = readdirSync(outDir)
    .filter((f) => f.startsWith("elwaha-") && f.endsWith(".db"))
    .sort()
    .reverse();

  for (const stale of backups.slice(keep)) {
    unlinkSync(join(outDir, stale));
    console.log(`  pruned ${stale}`);
  }

  console.log(`  ${Math.min(backups.length, keep)} backup(s) retained in ${outDir}`);
}

try {
  main();
} catch (err) {
  console.error("backup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
