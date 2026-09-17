/**
 * Host npm pins harvested from Grok Builder (`F:\GitHub\grok-builder` package.json).
 * Fleet SSOT stays three ^0.185 — do not invent a second renderer pin.
 * WASM Rapier still lives in the host; this package only declares versions.
 */

export const HOST_STACK = {
  source: "grok-builder",
  sourceUrl: "https://grok-builder.vercel.app",
  three: "^0.185.1",
  typesThree: "^0.185.4",
  rapierCompat: "^0.19.3",
  r3f: "^9.7.0",
  drei: "^10.7.8",
  r3fRapier: "^2.2.0",
  zustand: "^5.0.3",
  react: "^19.2.0",
} as const;

export type HostStackId = keyof typeof HOST_STACK;

/** Imperative Three host (Island3D / Open / Dev Tool Play). */
export const IMPERATIVE_HOST_DEPS = {
  three: HOST_STACK.three,
  "@dimforge/rapier3d-compat": HOST_STACK.rapierCompat,
  "three-mesh-bvh": "^0.9.0",
} as const;

/** R3F + Rapier host (Forge / Grok Builder / warcamp). */
export const R3F_HOST_DEPS = {
  three: HOST_STACK.three,
  "@react-three/fiber": HOST_STACK.r3f,
  "@react-three/drei": HOST_STACK.drei,
  "@react-three/rapier": HOST_STACK.r3fRapier,
  zustand: HOST_STACK.zustand,
} as const;
