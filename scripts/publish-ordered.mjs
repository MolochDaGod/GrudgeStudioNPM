/**
 * Publish workspace packages in dependency order.
 * Auth: ~/.npmrc or NPM_TOKEN / NODE_AUTH_TOKEN (never printed).
 */
import { spawnSync } from "node:child_process";

const ORDER = [
  "@grudge-studio/core",
  "@grudge-studio/asset-resolver",
  "@grudge-studio/assets",
  "@grudge-studio/stack",
  "@grudge-studio/engine",
  "@grudge-studio/character",
  "@grudge-studio/animator",
  "@grudge-studio/units",
  "@grudge-studio/bake",
  "@grudge-studio/deploy",
  "@grudge-studio/sdk",
];

function run(args) {
  const r = spawnSync("npm", args, { stdio: "inherit", shell: true });
  return r.status ?? 1;
}

const who = spawnSync("npm", ["whoami"], { encoding: "utf8", shell: true });
if (who.status !== 0) {
  console.error("[publish] npm whoami failed — token in ~/.npmrc is unauthorized or missing.");
  console.error("[publish] Create a granular npm token (Automation, R/W) for @grudge-studio and put it in ~/.npmrc:");
  console.error("  //registry.npmjs.org/:_authToken=npm_...");
  process.exit(1);
}
console.log(`[publish] as ${String(who.stdout).trim()}`);

for (const name of ORDER) {
  console.log(`\n[publish] ${name}`);
  const code = run(["publish", "-w", name, "--access", "public"]);
  if (code !== 0) process.exit(code);
}
console.log("\n[publish] all packages published");
