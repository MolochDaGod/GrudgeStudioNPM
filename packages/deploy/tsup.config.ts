import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "@grudge-studio/bake",
    "@grudge-studio/character",
    "@grudge-studio/core",
    "@grudge-studio/stack",
    "@grudge-studio/units",
  ],
});
