/**
 * @grudge-studio/engine physics SSOT — constants + CCT configure.
 *
 * WASM world still lives in the host (Island3D PhysicsWorld, Open
 * CharacterCapsuleKcc, Casting PhysicsWorld). This package does not
 * ship Rapier. Hosts call configureRapierCharacterController(cct).
 *
 * Walk = Rapier kinematic CCT. three-mesh-bvh = pick/camera only.
 */

/** Duck-typed Rapier KinematicCharacterController (avoid WASM in this package). */
export type RapierCharacterController = {
  setUp?: (v: { x: number; y: number; z: number }) => void;
  setMaxSlopeClimbAngle: (rad: number) => void;
  setMinSlopeSlideAngle: (rad: number) => void;
  enableAutostep: (maxHeight: number, minWidth: number, includeDynamics: boolean) => void;
  enableSnapToGround: (dist: number) => void;
  setApplyImpulsesToDynamicBodies: (on: boolean) => void;
};

export const HUMAN_CCT = {
  /** SI metres — Open PLAYER_CAPSULE / Island3D addCharacterCapsule */
  radius: 0.35,
  halfHeight: 0.55,
  /** Skin; Island3D uses 0.01, Open 0.08 — hosts pick at createCharacterController */
  controllerOffset: 0.08,
  autostepHeight: 0.5,
  autostepMinWidth: 0.2,
  snapToGround: 0.5,
  maxSlopeClimbDeg: 45,
  minSlopeSlideDeg: 30,
  applyImpulsesToDynamic: true,
} as const;

export const PHYSICS_DEFAULTS = {
  /** Rapier world gravity for dynamics / vehicles */
  gravityY: -9.81,
  /** CCT desired-Y gravity (Open CharacterCapsuleKcc / Controller) */
  characterGravityY: -12,
  fixedStep: 1 / 60,
  maxSubsteps: 5,
  characterHeightM: 1.8,
  capsuleRadiusM: HUMAN_CCT.radius,
  capsuleHalfHeightM: HUMAN_CCT.halfHeight,
  walkAuthority: "rapier-cct" as const,
  pickAuthority: "three-mesh-bvh" as const,
} as const;

export function capsuleCenterOffset(
  radius = HUMAN_CCT.radius,
  halfHeight = HUMAN_CCT.halfHeight,
): number {
  return radius + halfHeight;
}

/** Island3D / Casting law: gravity in desired movement, not RB forces. */
export function configureRapierCharacterController(
  cct: RapierCharacterController,
  opts: Partial<typeof HUMAN_CCT> = {},
): void {
  const c = { ...HUMAN_CCT, ...opts };
  cct.setUp?.({ x: 0, y: 1, z: 0 });
  cct.setMaxSlopeClimbAngle((c.maxSlopeClimbDeg * Math.PI) / 180);
  cct.setMinSlopeSlideAngle((c.minSlopeSlideDeg * Math.PI) / 180);
  cct.enableAutostep(c.autostepHeight, c.autostepMinWidth, true);
  cct.enableSnapToGround(c.snapToGround);
  cct.setApplyImpulsesToDynamicBodies(c.applyImpulsesToDynamic);
}

export function applyGamepadDeadzone(v: number, zone = 0.18): number {
  const a = Math.abs(v);
  if (a < zone) return 0;
  return Math.sign(v) * ((a - zone) / (1 - zone));
}

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
    id: "open-danger",
    host: "open.grudge-studio.com/danger",
    engine: "Controller.ts + CharacterCapsuleKcc",
    physics: "Rapier CCT",
  },
  {
    id: "client-island3d",
    host: "client.grudge-studio.com",
    engine: "Island3DEngine",
    physics: "PhysicsWorld.addCharacterCapsule + moveCharacter",
  },
  {
    id: "casting",
    host: "casting.grudge-studio.com",
    engine: "loadRaceKit + PhysicsWorld",
    physics: "Rapier CCT",
  },
  {
    id: "gladiators",
    host: "grudge-combat.vercel.app",
    engine: "combat lab",
    physics: "Rapier CCT",
  },
  {
    id: "mine-loader",
    host: "mineloader.grudge-studio.com",
    engine: "VoxelEngine",
    physics: "WorldPhysics + RapierHelper",
  },
  {
    id: "warlord-genesis",
    host: "warlords /edit + warcamp",
    engine: "R3F Game",
    physics: "@react-three/rapier Physics debug=",
  },
] as const;
