import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  // Prisma 7 requires an explicit driver adapter; the schema no longer carries the URL.
  const adapter = new PrismaBetterSqlite3({ url });
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
