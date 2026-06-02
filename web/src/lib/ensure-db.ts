import { readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";

let initPromise: Promise<void> | null = null;

function vercelDatabasePath() {
  const url =
    process.env.MINDMARK_DATABASE_URL ??
    (process.env.VERCEL ? "file:/tmp/mindmark.db" : "file:./dev.db");
  return url.replace(/^file:/, "");
}

export async function ensureDatabaseReady() {
  if (!process.env.VERCEL) return;
  if (initPromise) return initPromise;

  initPromise = Promise.resolve().then(() => {
    const dbPath = vercelDatabasePath();
    const sqlite = new Database(dbPath);

    try {
      const table = sqlite
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'Bookmark'",
        )
        .get();

      if (!table) {
        const sql = readFileSync(
          join(process.cwd(), "prisma", "vercel-init.sql"),
          "utf8",
        );
        sqlite.exec(sql);
      }
    } finally {
      sqlite.close();
    }
  });

  return initPromise;
}
