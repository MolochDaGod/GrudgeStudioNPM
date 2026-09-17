#!/usr/bin/env node
/**
 * Copy built package dist into sibling grudge-dev-tool vendor/.
 * SSOT remains this repo — vendor is a CI/packaging snapshot only.
 *
 *   npm run build
 *   npm run sync:dev-tool
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destRoot = join(root, "..", "grudge-dev-tool", "vendor", "@grudge-studio");
const slices = ["animator", "assets", "core", "engine"];

if (!existsSync(destRoot)) {
  console.error(`[sync-vendor] missing ${destRoot} — clone grudge-dev-tool next to this repo`);
  process.exit(1);
}

for (const name of slices) {
  const srcDist = join(root, "packages", name, "dist");
  const srcPkg = join(root, "packages", name, "package.json");
  if (!existsSync(srcDist) || !existsSync(srcPkg)) {
    console.error(`[sync-vendor] build ${name} first (missing dist)`);
    process.exit(1);
  }
  const pkg = JSON.parse(readFileSync(srcPkg, "utf8"));
  const dest = join(destRoot, name);
  mkdirSync(join(dest, "dist"), { recursive: true });
  cpSync(srcDist, join(dest, "dist"), { recursive: true });
  const slim = {
    name: pkg.name,
    version: pkg.version,
    type: "module",
    main: "./dist/index.cjs",
    module: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
        require: "./dist/index.cjs",
      },
    },
    files: ["dist"],
  };
  writeFileSync(join(dest, "package.json"), `${JSON.stringify(slim, null, 2)}\n`);
  console.log(`[sync-vendor] ${pkg.name}@${pkg.version} → ${dest}`);
}
