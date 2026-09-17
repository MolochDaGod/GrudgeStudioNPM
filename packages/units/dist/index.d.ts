import { CharacterKind, CharacterLoadout, AnimPackId } from '@grudge-studio/character';

type UnitFaction = "player" | "ally" | "enemy" | "neutral" | "wildlife" | "civilian";
type UnitRole = "infantry" | "ranged" | "cavalry" | "siege" | "support" | "boss" | "vendor" | "quest" | "worker";
/** Shared spawnable entity for editor + game deploy */
interface UnitDef {
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
interface NpcDef extends UnitDef {
    kind: "npc" | "civilian" | "boss";
    dialogueId?: string;
    shopId?: string;
    patrolPathId?: string;
}
interface UnitSpawnSpec {
    unitId: string;
    position: [number, number, number];
    yaw?: number;
    team?: string;
    seed?: number;
}

/** Starter unit templates — editor can extend via ObjectStore */
declare const DEFAULT_UNIT_CATALOG: UnitDef[];
declare const DEFAULT_NPC_CATALOG: NpcDef[];
declare function getUnitDef(id: string, extra?: UnitDef[]): UnitDef | undefined;
declare function getNpcDef(id: string, extra?: NpcDef[]): NpcDef | undefined;

export { DEFAULT_NPC_CATALOG, DEFAULT_UNIT_CATALOG, type NpcDef, type UnitDef, type UnitFaction, type UnitRole, type UnitSpawnSpec, getNpcDef, getUnitDef };
