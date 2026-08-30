/**
 * Pick the Prisma schema from DATABASE_URL.
 * - file: / sqlite → prisma/schema.prisma (local and Railway volume)
 * - postgres:// or postgresql:// → prisma-postgres/schema.prisma
 *
 * Prints the schema path on stdout. Logs go to stderr so this can be
 * captured: SCHEMA="$(node scripts/prisma-provider.mjs)"
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sqliteSchema = path.join(root, "prisma", "schema.prisma");
const postgresDir = path.join(root, "prisma-postgres");
const postgresSchema = path.join(postgresDir, "schema.prisma");

const url = process.env.DATABASE_URL || "";
const postgres = /^(postgres|postgresql):\/\//i.test(url);

function ensureSqliteParentDir(databaseUrl) {
  const match = databaseUrl.match(/^file:(.+)$/i);
  if (!match) return;

  let filePath = match[1];
  if (filePath.startsWith("///")) {
    filePath = filePath.slice(2);
  } else if (filePath.startsWith("//")) {
    filePath = filePath.slice(1);
  }

  const abs = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(path.join(root, "prisma"), filePath);

  mkdirSync(path.dirname(abs), { recursive: true });
}

if (postgres) {
  mkdirSync(postgresDir, { recursive: true });
  const source = readFileSync(sqliteSchema, "utf8");
  const dest = source.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
  writeFileSync(postgresSchema, dest);
  console.error("Prisma provider: postgresql (DATABASE_URL is Postgres)");
  process.stdout.write(postgresSchema);
} else {
  if (url) ensureSqliteParentDir(url);
  console.error("Prisma provider: sqlite");
  process.stdout.write(sqliteSchema);
}
