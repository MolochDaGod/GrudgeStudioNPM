/**
 * World deploy contract — harvested from Grok Builder GAME_SYSTEMS + STACK_HELPERS + DEPLOY.md.
 * Extend this file; do not invent a second deploy catalog in Dev Tool.
 */

export const WORLD_PHYSICS = {
  gravity: [0, -9.81, 0] as const,
  timeStep: 1 / 60,
  oneWorld: true,
  walk: "rapier-cct" as const,
  pick: "three-mesh-bvh" as const,
  ground: "heightfield-or-fixed-cuboid-or-fixed-trimesh" as const,
  playerShape: "capsule" as const,
  ban: ["convex-hull-on-modular-hero", "dynamic-trimesh", "second-physics-world", "orbit-writing-play-camera"],
} as const;

export const WORLD_R3F = {
  canvas: "<Canvas shadows dpr={[1,2]} gl={{ antialias: true }}>",
  physics: "<Physics gravity={[0,-9.81,0]} timeStep={1/60} debug={physicsDebug}>",
  helpers: ["AdaptiveDpr", "Environment", "ContactShadows", "Grid 1m"],
  editCamera: "OrbitControls only while !playMode",
} as const;

export const WORLD_DEPLOY_HOSTS = {
  spa: "Vercel prebuilt (.vercel/output → prod alias)",
  worker: "wrangler deploy (AI / search only — no physics on the Worker)",
  binaries: "https://assets.grudge-studio.com",
  definitions: "https://objectstore.grudge-studio.com / https://info.grudge-studio.com",
  player: "Railway Postgres",
  editor: "https://forge.grudge-studio.com",
  grokBuilder: "https://grok-builder.vercel.app",
} as const;

export const WORLD_DEPLOY_CHECKLIST: readonly string[] = [
  "[ ] three@^0.185.1 + @types/three@^0.185.4 (not 0.170 defs)",
  "[ ] Rapier: @dimforge/rapier3d-compat@^0.19.3 and/or @react-three/rapier@^2.2",
  "[ ] R3F world: @react-three/fiber@^9.7 + @react-three/drei@^10.7",
  "[ ] Single Physics world, fixed 1/60, gravity SI",
  "[ ] Player capsule CCT — not convex hull, not Meshy/capsule-hero mesh",
  "[ ] Ground = heightfield OR fixed cuboid OR fixed trimesh; same sample as feet",
  "[ ] Play camera sole writer; Orbit gated to edit",
  "[ ] One mixer; stripPositionTracks on grounded kits",
  "[ ] CDN binaries; ObjectStore/info definitions JSON; Railway player SSOT",
  "[ ] SPA: Vercel prebuilt; Worker: wrangler (no Rapier WASM on the edge)",
  "[ ] ?physicsDebug=1 gated — never forced on prod",
];

export function worldDeployChecklist(): readonly string[] {
  return WORLD_DEPLOY_CHECKLIST;
}
