import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined;
};

function databaseUrl() {
  if (process.env.MINDMARK_DATABASE_URL) {
    return process.env.MINDMARK_DATABASE_URL;
  }
  // Vercel: writable temp path (ephemeral — not for real production data)
  if (process.env.VERCEL) {
    return "file:/tmp/mindmark.db";
  }
  return "file:./dev.db";
}

function createClient() {
  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl(),
  });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.db ?? createClient();
globalForPrisma.db = db;
