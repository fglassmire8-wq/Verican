/**
 * One-shot first boot: if User is empty, run the existing seed
 * (Francis + approved MAX A/C). Skip when any user already exists.
 *
 * Invokes tsx by absolute path so this works in Docker without
 * node_modules/.bin on PATH (prisma db seed would spawn `tsx` and fail).
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);
const tsxCli = path.join(path.dirname(require.resolve("tsx/package.json")), "dist/cli.mjs");
const prisma = new PrismaClient();

let count;
try {
  count = await prisma.user.count();
} catch (error) {
  console.error("Could not count User rows; not seeding.");
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
}
await prisma.$disconnect();

if (count > 0) {
  console.error(`Seed skipped: User table already has ${count} row(s).`);
  process.exit(0);
}

if (!process.env.SEED_OWNER_PASSWORD) {
  console.error("User table is empty; SEED_OWNER_PASSWORD is required to seed Francis.");
  process.exit(1);
}

console.error("User table is empty; seeding Francis and approved MAX A/C.");
const result = spawnSync(process.execPath, [tsxCli, "prisma/seed.ts"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
