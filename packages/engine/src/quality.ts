/**
 * Runtime 3D host expectations (pairs with @grudge-studio/deploy QUALITY_SYSTEM).
 * Pins match Grok Builder + fleet SSOT (three 0.185, Rapier 0.19).
 */

import { HOST_STACK } from "./hostStack";

export const RUNTIME_3D_REQUIREMENTS = {
  three: HOST_STACK.three,
  typesThree: HOST_STACK.typesThree,
  physics: ["@dimforge/rapier3d-compat", "@react-three/rapier"] as const,
  rapierCompat: HOST_STACK.rapierCompat,
  r3f: HOST_STACK.r3f,
  drei: HOST_STACK.drei,
  r3fRapier: HOST_STACK.r3fRapier,
  optionalBvh: "three-mesh-bvh",
  walk: "rapier-cct",
  pick: "three-mesh-bvh",
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

function looksLike185(range: string | undefined): boolean {
  if (!range) return false;
  return /0\.185/.test(range);
}

export function assertRuntimeHints(pkg: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): { ok: boolean; missing: string[] } {
  const all = { ...pkg.devDependencies, ...pkg.dependencies };
  const missing: string[] = [];
  if (!all.three) missing.push("three");
  else if (!looksLike185(all.three)) missing.push("three@^0.185 (stale pin)");
  const types = all["@types/three"];
  if (types && /0\.17[0-9]/.test(types)) missing.push("@types/three@^0.185.4 (0.170 defs are wrong for r185)");
  const hasRapier =
    !!all["@dimforge/rapier3d-compat"] ||
    !!all["@react-three/rapier"] ||
    !!all["@dimforge/rapier3d"];
  if (!hasRapier) missing.push("rapier");
  return { ok: missing.length === 0, missing };
}
