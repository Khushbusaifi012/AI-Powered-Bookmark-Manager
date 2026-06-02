/**
 * Apply Prisma schema to Turso (run once after creating a Turso DB).
 * Requires: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN in web/.env
 *
 * Usage: node scripts/push-schema-turso.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  try {
    const raw = readFileSync(resolve(root, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z_]+)="?([^"]+)"?/);
      if (m) process.env[m[1]] = m[2];
    }
  } catch {
    /* no .env */
  }
}

loadEnv();

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in web/.env");
  process.exit(1);
}

const dbName = process.env.TURSO_DB_NAME;
if (!dbName) {
  console.error(
    "Also set TURSO_DB_NAME=mindmark (your Turso database name from dashboard)",
  );
  process.exit(1);
}

console.log("Generating SQL from Prisma schema...");
const sql = execSync(
  "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script",
  { cwd: root, encoding: "utf8" },
);

const sqlFile = resolve(root, "prisma", "turso-init.sql");
import { writeFileSync } from "node:fs";
writeFileSync(sqlFile, sql);
console.log("Wrote", sqlFile);

console.log("Applying to Turso (requires Turso CLI: https://docs.turso.tech/cli)...");
try {
  execSync(`turso db shell ${dbName} < "${sqlFile}"`, {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  console.log("Done — tables created on Turso.");
} catch {
  console.log("\nTurso CLI not available or shell failed.");
  console.log("Manual: turso db shell", dbName);
  console.log("Then paste SQL from:", sqlFile);
}
