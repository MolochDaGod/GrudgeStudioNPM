import type { AnimPackId, CharacterKind, CharacterLoadout } from "@grudge-studio/character";

export type UnitFaction =
  | "player"
  | "ally"
  | "enemy"
  | "neutral"
  | "wildlife"
  | "civilian";

export type UnitRole =
  | "infantry"
  | "ranged"
  | "cavalry"
  | "siege"
  | "support"
  | "boss"
  | "vendor"
  | "quest"
  | "worker";

/** Shared spawnable entity for editor + game deploy */
export interface UnitDef {
  id: string;
  kind: Extract<CharacterKind, "npc" | "unit" | "boss" | "civilian">;
  displayName: string;
  faction: UnitFaction;
  role: UnitRole;
  /** grudge6 race or creature id */
  raceOrCreatureId: string;
  loadout?: CharacterLoadout;
  animPack?: AnimPackId;
  /** Preferred mesh CDN key (optional override) */
  meshCdnKey?: string;
  /** AI brain id */
  brainId?: string;
  /** Scale relative to 1.8 m human (1 = human) */
  humanScale?: number;
  tags?: string[];
}

export interface NpcDef extends UnitDef {
  kind: "npc" | "civilian" | "boss";
  dialogueId?: string;
  shopId?: string;
  patrolPathId?: string;
}

export interface UnitSpawnSpec {
  unitId: string;
  position: [number, number, number];
  yaw?: number;
  team?: string;
  seed?: number;
}
