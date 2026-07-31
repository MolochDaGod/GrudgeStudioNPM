import {
  bakedAnimUrl,
  LOCO_BAKED,
  getAnimPack,
  type ClipRole,
  normalizeAnimPackId,
} from "@grudge-studio/assets";

export type BattleClipSlot =
  | "idle"
  | "walk"
  | "run"
  | "attack1"
  | "attack2"
  | "jump"
  | "jumpAttack"
  | "cast"
  | "hit"
  | "death"
  | "warcry";

/** Default sword_shield battle map (rel paths under /anims/baked). */
export const DEFAULT_BATTLE_CLIPS: Record<BattleClipSlot, string[]> = {
  idle: [LOCO_BAKED.idle, "sword_shield/sword and shield idle"],
  walk: [LOCO_BAKED.walk],
  run: [LOCO_BAKED.run, "sword_shield/sword and shield run"],
  attack1: ["sword_shield/sword and shield attack", "sword_shield/sword and shield slash"],
  attack2: ["sword_shield/sword and shield attack (2)", "sword_shield/sword and shield slash 1"],
  jump: [LOCO_BAKED.jump, "locomotion/jumping up"],
  jumpAttack: ["sword_shield/sword and shield attack (4)"],
  cast: ["sword_shield/sword and shield casting", "magic/spell casting"],
  hit: ["magic/Standing React Small From Front", "locomotion/reacting"],
  death: ["sword_shield/sword and shield death"],
  warcry: [LOCO_BAKED.warcry, "sword_shield/sword and shield power up"],
};

export function battleClipUrls(
  slot: BattleClipSlot,
  sameOrigin = true,
): string[] {
  return (DEFAULT_BATTLE_CLIPS[slot] ?? []).map((rel) => bakedAnimUrl(rel, sameOrigin));
}

/**
 * Resolve candidate URL keys for a pack role via ANIM_PACKS registry.
 * Skips .fbx source keys (not loadable as baked JSON until bake).
 */
export function packRoleUrls(
  packId: string,
  role: ClipRole | BattleClipSlot,
  sameOrigin = true,
): string[] {
  const pack = getAnimPack(packId);
  const cands = pack.clips[role as ClipRole] ?? [];
  const keys = cands
    .map((c) => c.key)
    .filter((k) => !k.endsWith(".fbx") && !k.startsWith("_"));
  if (keys.length === 0 && role in DEFAULT_BATTLE_CLIPS) {
    return battleClipUrls(role as BattleClipSlot, sameOrigin);
  }
  return keys.map((rel) => bakedAnimUrl(rel, sameOrigin));
}

/** Skill clip URL candidates for pack skillId */
export function packSkillUrls(
  packId: string,
  skillId: string,
  sameOrigin = true,
): string[] {
  const pack = getAnimPack(normalizeAnimPackId(packId));
  const skill = pack.skills.find((s) => s.skillId === skillId);
  if (!skill) return [];
  return skill.candidates
    .map((c) => c.key)
    .filter((k) => !k.endsWith(".fbx") && !k.startsWith("_"))
    .map((rel) => bakedAnimUrl(rel, sameOrigin));
}
