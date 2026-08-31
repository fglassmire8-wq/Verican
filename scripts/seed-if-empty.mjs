/**
 * One-shot first boot: if User is empty, run the existing seed
 * (Francis + approved MAX A/C). Skip when any user already exists.
 */
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

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
const result = spawnSync(process.execPath, ["scripts/db-seed.mjs"], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
