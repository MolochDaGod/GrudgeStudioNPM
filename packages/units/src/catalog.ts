import type { NpcDef, UnitDef } from "./types";

/** Starter unit templates — editor can extend via ObjectStore */
export const DEFAULT_UNIT_CATALOG: UnitDef[] = [
  {
    id: "unit.footman",
    kind: "unit",
    displayName: "Footman",
    faction: "player",
    role: "infantry",
    raceOrCreatureId: "human",
    loadout: { weapon: "sword_shield", animPack: "sword_shield" },
    animPack: "sword_shield",
    humanScale: 1,
    tags: ["grudge6", "melee"],
  },
  {
    id: "unit.archer",
    kind: "unit",
    displayName: "Archer",
    faction: "player",
    role: "ranged",
    raceOrCreatureId: "human",
    loadout: { weapon: "longbow", animPack: "longbow" },
    animPack: "longbow",
    humanScale: 1,
    tags: ["grudge6", "ranged"],
  },
  {
    id: "unit.orc_raider",
    kind: "unit",
    displayName: "Orc Raider",
    faction: "enemy",
    role: "infantry",
    raceOrCreatureId: "orc",
    loadout: { weapon: "axe", animPack: "axe_1h" },
    animPack: "axe_1h",
    humanScale: 1.05,
    tags: ["grudge6", "enemy"],
  },
  {
    id: "unit.mace_guard",
    kind: "unit",
    displayName: "Mace Guard",
    faction: "player",
    role: "infantry",
    raceOrCreatureId: "human",
    loadout: { weapon: "mace", animPack: "mace_1h" },
    animPack: "mace_1h",
    humanScale: 1,
    tags: ["grudge6", "melee", "mace"],
  },
];

export const DEFAULT_NPC_CATALOG: NpcDef[] = [
  {
    id: "npc.blacksmith",
    kind: "npc",
    displayName: "Blacksmith",
    faction: "civilian",
    role: "vendor",
    raceOrCreatureId: "dwarf",
    loadout: { weapon: "hammer", animPack: "mace_1h" },
    animPack: "mace_1h",
    dialogueId: "dlg.blacksmith",
    shopId: "shop.forge",
    tags: ["vendor", "town"],
  },
  {
    id: "npc.quest_captain",
    kind: "npc",
    displayName: "Quest Captain",
    faction: "ally",
    role: "quest",
    raceOrCreatureId: "human",
    loadout: { weapon: "sword_shield", animPack: "sword_shield" },
    animPack: "sword_shield",
    dialogueId: "dlg.captain",
    tags: ["quest", "camp"],
  },
];

export function getUnitDef(id: string, extra: UnitDef[] = []): UnitDef | undefined {
  return [...DEFAULT_UNIT_CATALOG, ...extra].find((u) => u.id === id);
}

export function getNpcDef(id: string, extra: NpcDef[] = []): NpcDef | undefined {
  return [...DEFAULT_NPC_CATALOG, ...extra].find((u) => u.id === id);
}
