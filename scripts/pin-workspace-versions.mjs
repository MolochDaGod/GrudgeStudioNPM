import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const versions = {};
for (const dir of readdirSync("packages")) {
  const pkg = JSON.parse(readFileSync(join("packages", dir, "package.json"), "utf8"));
  versions[pkg.name] = pkg.version;
}

for (const dir of readdirSync("packages")) {
  const p = join("packages", dir, "package.json");
  const pkg = JSON.parse(readFileSync(p, "utf8"));
  let changed = false;
  for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
    const block = pkg[field];
    if (!block) continue;
    for (const [name, range] of Object.entries(block)) {
      if (!name.startsWith("@grudge-studio/")) continue;
      const v = versions[name];
      if (!v) continue;
      const next = `^${v}`;
      if (range !== next) {
        block[name] = next;
        changed = true;
      }
    }
  }
  if (changed) {
    writeFileSync(p, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log("pinned", pkg.name);
  }
}
