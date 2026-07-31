/**
 * @grudge-studio/engine physics SSOT notes + debug gate.
 *
 * Runtime implementation lives in each game host (WASM peer deps):
 *   - GrudgeBuilder Island3D: client/src/island3d/physics/{PhysicsWorld,RapierHelper}
 *   - Mine-Loader voxelcraft: src/lib/physics/{WorldPhysics,RapierHelper}
 *   - warlord-genesis R3F: @react-three/rapier <Physics debug={…}>
 *
 * All 3D deploy surfaces MUST:
 *   1. Use Rapier (@dimforge/rapier3d-compat or @react-three/rapier) — one engine per game
 *   2. Fixed 60Hz step, SI meters (1 unit = 1 m)
 *   3. Heightfield for regular terrain grids; trimesh/cuboid for GLB / authored boxes
 *   4. Gate debug wires: ?physicsDebug=1 or localStorage grudge_physics_debug=1
 */

export const PHYSICS_DEFAULTS = {
  gravityY: -30,
  fixedStep: 1 / 60,
  characterHeightM: 1.85,
  capsuleRadiusM: 0.35,
} as const;

export type PhysicsDebugGate = {
  query: boolean;
  localStorage: boolean;
  enabled: boolean;
};

/** Shared gate used by every Grudge 3D client */
export function readPhysicsDebugGate(
  search: string | null | undefined = typeof window !== "undefined"
    ? window.location.search
    : "",
  storageGet?: (key: string) => string | null,
): PhysicsDebugGate {
  let query = false;
  try {
    const q = new URLSearchParams(search || "");
    query =
      q.get("physicsDebug") === "1" ||
      q.get("rapierDebug") === "1";
    if (q.get("physicsDebug") === "0") {
      return { query: false, localStorage: false, enabled: false };
    }
  } catch {
    /* ignore */
  }
  let ls = false;
  try {
    const get =
      storageGet ??
      ((k: string) =>
        typeof localStorage !== "undefined" ? localStorage.getItem(k) : null);
    ls = get("grudge_physics_debug") === "1";
  } catch {
    /* ignore */
  }
  return { query, localStorage: ls, enabled: query || ls };
}

export const PHYSICS_FLEET_SURFACES = [
  {
    id: "client-island3d",
    host: "client.grudge-studio.com",
    engine: "Island3DEngine",
    physics: "PhysicsWorld + RapierHelper",
  },
  {
    id: "mine-loader",
    host: "mine-loader / voxelcraft",
    engine: "VoxelEngine",
    physics: "WorldPhysics + RapierHelper",
  },
  {
    id: "warlord-genesis",
    host: "warlords /edit + warcamp",
    engine: "R3F Game",
    physics: "@react-three/rapier Physics debug=",
  },
  {
    id: "danger-room",
    host: "threejs-rapier-react-three-controller",
    engine: "Danger Room",
    physics: "@dimforge/rapier3d-compat (reference)",
  },
] as const;
