import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  // Prisma 7 requires an explicit driver adapter; the schema no longer carries the URL.
  // libsql, not better-sqlite3: better-sqlite3's prebuilt binary needs glibc
  // 2.29, the Namecheap server has 2.28, and shared hosting has no compiler
  // to build it from source. libsql's binary loads there. It reads and
  // writes the same SQLite file with the same iso8601 timestamp default, so
  // switching involves no data migration.
  const adapter = new PrismaLibSql({ url });
  const client = new PrismaClient({ adapter });

  /*
    Write-ahead logging, set once per process (S7-T09).

    The default rollback journal takes an exclusive lock for the whole of
    every write, so one staff member saving a lead blocks every other
    reader. WAL lets readers carry on against the last committed state
    while a write is in flight — which is the difference between a
    responsive admin and a stalling one when a few people use it at once.
    It is a persistent property of the database file, so setting it here
    is idempotent.

    NORMAL synchronous is the standard pairing: under WAL it is durable
    across application crashes, risking only the most recent commits in a
    full power loss — a trade the backup script below covers.
  */
  client
    .$executeRawUnsafe("PRAGMA journal_mode = WAL;")
    .then(() => client.$executeRawUnsafe("PRAGMA synchronous = NORMAL;"))
    // Never fatal: a database that cannot take these still works, just
    // with the old locking behaviour.
    .catch((err) => console.warn("[prisma] could not enable WAL:", err));

  return client;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
