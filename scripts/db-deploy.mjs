import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const prismaCli = require.resolve("prisma/build/index.js");

const pick = spawnSync(process.execPath, ["scripts/prisma-provider.mjs"], {
  env: process.env,
  encoding: "utf8",
});
if (pick.stderr) process.stderr.write(pick.stderr);
if (pick.status !== 0) process.exit(pick.status ?? 1);

const schema = pick.stdout.trim();
const run = (args) => {
  const result = spawnSync(process.execPath, [prismaCli, ...args, "--schema", schema], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

run(["generate"]);
run(["migrate", "deploy"]);
