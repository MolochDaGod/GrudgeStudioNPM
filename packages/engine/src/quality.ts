/**
 * Runtime 3D host expectations (pairs with @grudge-studio/deploy QUALITY_SYSTEM).
 */

export const RUNTIME_3D_REQUIREMENTS = {
  three: "^0.185",
  physics: ["@dimforge/rapier3d-compat", "@react-three/rapier"] as const,
  optionalBvh: "three-mesh-bvh",
  optionalPathfinding: "three-pathfinding",
  stateUi: "zustand",
  qualityNpm: [
    "@grudge-studio/character",
    "@grudge-studio/animator",
    "@grudge-studio/units",
    "@grudge-studio/bake",
    "@grudge-studio/deploy",
  ] as const,
} as const;

export function assertRuntimeHints(pkg: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): { ok: boolean; missing: string[] } {
  const all = { ...pkg.devDependencies, ...pkg.dependencies };
  const missing: string[] = [];
  if (!all.three) missing.push("three");
  const hasRapier =
    !!all["@dimforge/rapier3d-compat"] ||
    !!all["@react-three/rapier"] ||
    !!all["@dimforge/rapier3d"];
  if (!hasRapier) missing.push("rapier");
  return { ok: missing.length === 0, missing };
}
