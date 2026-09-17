"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_NPC_CATALOG: () => DEFAULT_NPC_CATALOG,
  DEFAULT_UNIT_CATALOG: () => DEFAULT_UNIT_CATALOG,
  getNpcDef: () => getNpcDef,
  getUnitDef: () => getUnitDef
});
module.exports = __toCommonJS(index_exports);

// src/catalog.ts
var DEFAULT_UNIT_CATALOG = [
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
    tags: ["grudge6", "melee"]
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
    tags: ["grudge6", "ranged"]
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
    tags: ["grudge6", "enemy"]
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
    tags: ["grudge6", "melee", "mace"]
  }
];
var DEFAULT_NPC_CATALOG = [
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
    tags: ["vendor", "town"]
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
    tags: ["quest", "camp"]
  }
];
function getUnitDef(id, extra = []) {
  return [...DEFAULT_UNIT_CATALOG, ...extra].find((u) => u.id === id);
}
function getNpcDef(id, extra = []) {
  return [...DEFAULT_NPC_CATALOG, ...extra].find((u) => u.id === id);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_NPC_CATALOG,
  DEFAULT_UNIT_CATALOG,
  getNpcDef,
  getUnitDef
});
//# sourceMappingURL=index.cjs.map