import { getFleetUrls } from "@grudge-studio/core";

/** Race kit FBX on CDN (SSOT for modular characters). */
export const GRUDGE6_RACE_FBX: Record<string, string> = {
  human: "models/grudge6/races/WK_Characters.fbx",
  barbarian: "models/grudge6/races/BRB_Characters.fbx",
  dwarf: "models/grudge6/races/DWF_Characters.fbx",
  elf: "models/grudge6/races/ELF_Characters.fbx",
  orc: "models/grudge6/races/ORC_Characters.fbx",
  undead: "models/grudge6/races/UD_Characters.fbx",
};

export const GRUDGE6_RACE_ATLAS: Record<string, string> = {
  human: "textures/grudge6/western-kingdoms/WK_Standard_Units.webp",
  barbarian: "textures/grudge6/barbarians/BRB_StandardUnits_texture.webp",
  dwarf: "textures/grudge6/dwarves/DWF_Standard_Units.webp",
  elf: "textures/grudge6/elves/ELF_HighElves_Texture.webp",
  orc: "textures/grudge6/orcs/ORC_StandardUnits.webp",
  undead: "textures/grudge6/undead/UD_Standard_Units.webp",
};

export function grudge6RaceUrl(raceId: string): string {
  const rel = GRUDGE6_RACE_FBX[raceId] ?? GRUDGE6_RACE_FBX.human;
  return `${getFleetUrls().assets}/${rel}`;
}

export function grudge6AtlasUrl(raceId: string): string {
  const rel = GRUDGE6_RACE_ATLAS[raceId] ?? GRUDGE6_RACE_ATLAS.human;
  return `${getFleetUrls().assets}/${rel}`;
}

export type AnimPackId =
  | "sword_shield"
  | "magic"
  | "longbow"
  | "unarmed"
  | "rifle"
  | "pistol"
  | "crossbow"
  | "2h_melee"
  | "samurai"
  | "mace_1h"
  | "axe_1h"
  | "dash"
  | "reactions"
  | "block";

export function weaponToAnimPack(weapon: string): AnimPackId {
  const w = weapon.toLowerCase();
  if (w.includes("crossbow") || w.includes("xbow")) return "crossbow";
  if (w.includes("bow")) return "longbow";
  if (w.includes("rifle")) return "rifle";
  if (w.includes("pistol") || w.includes("gun")) return "pistol";
  if (w.includes("magic") || w.includes("staff")) return "magic";
  if (w.includes("mace") || w.includes("hammer") || w.includes("club")) return "mace_1h";
  if (w.includes("katana") || w.includes("samurai")) return "samurai";
  if (w.includes("greatsword") || w.includes("2h")) return "2h_melee";
  if (w.includes("axe") || w.includes("hatchet")) return "axe_1h";
  if (w.includes("unarmed") || w.includes("fist")) return "unarmed";
  return "sword_shield";
}
