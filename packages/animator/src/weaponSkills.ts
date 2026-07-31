/**
 * Weapon skill → LocomotionCore bridge.
 * Uses pack skill data + blend profiles from @grudge-studio/assets when available;
 * pure factories work without loading packs.
 */

import {
  makeMagicSkill,
  makeMeleeSkill,
  makeRangedSkill,
  type WeaponSkillDef,
  DEFAULT_MELEE_HIT_WINDOW,
} from "./locomotionCore";
import { skillOnLocoWeights, type LayerWeights } from "./blend";

/** Duck-typed payload from assets.toWeaponSkillPayload (avoid hard cycle at typecheck) */
export interface SkillAnimPayloadLike {
  id: string;
  name?: string;
  animPack?: string;
  upperBodyWeight: number;
  allowLocomotion: boolean;
  fadeIn: number;
  fadeOut: number;
  hitWindow: [number, number];
  rangeM: number;
  cooldownS: number;
  weaponCollider: boolean;
  locomotionSkill?: boolean;
  skillLocoRetain?: number;
  blendKind?: string;
}

/**
 * Build a LocomotionCore WeaponSkillDef from a resolved THREE clip + pack payload.
 */
export function weaponSkillFromPayload(
  clip: unknown,
  payload: SkillAnimPayloadLike,
): WeaponSkillDef {
  return {
    id: payload.id,
    name: payload.name,
    clip,
    animPack: payload.animPack,
    upperBodyWeight: payload.upperBodyWeight,
    allowLocomotion: payload.allowLocomotion,
    fadeIn: payload.fadeIn,
    fadeOut: payload.fadeOut,
    hitWindow: payload.hitWindow,
    rangeM: payload.rangeM,
    cooldownS: payload.cooldownS,
    weaponCollider: payload.weaponCollider,
  };
}

/** Quick factories by combat category */
export function makeMobilitySkill(
  id: string,
  clip: unknown,
  extra: Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  return {
    id,
    clip,
    upperBodyWeight: 1,
    allowLocomotion: false,
    fadeIn: 0.05,
    fadeOut: 0.1,
    hitWindow: [0.1, 0.85],
    weaponCollider: false,
    rangeM: 0,
    cooldownS: 0.9,
    ...extra,
  };
}

export function makeBlockSkill(
  id: string,
  clip: unknown,
  extra: Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  return {
    id,
    clip,
    upperBodyWeight: 0.85,
    allowLocomotion: true,
    fadeIn: 0.06,
    fadeOut: 0.1,
    hitWindow: [0, 1],
    weaponCollider: false,
    rangeM: 0,
    cooldownS: 0,
    ...extra,
  };
}

export function makeParrySkill(
  id: string,
  clip: unknown,
  extra: Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  return {
    id,
    clip,
    upperBodyWeight: 1,
    allowLocomotion: false,
    fadeIn: 0.04,
    fadeOut: 0.1,
    hitWindow: [0.1, 0.35],
    weaponCollider: false,
    rangeM: 0,
    cooldownS: 0.8,
    ...extra,
  };
}

export function makeReactionSkill(
  id: string,
  clip: unknown,
  extra: Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  return {
    id,
    clip,
    upperBodyWeight: 1,
    allowLocomotion: false,
    fadeIn: 0.05,
    fadeOut: 0.15,
    hitWindow: [0, 1],
    weaponCollider: false,
    rangeM: 0,
    cooldownS: 0.2,
    ...extra,
  };
}

export function makeFinisherSkill(
  id: string,
  clip: unknown,
  rangeM = 3,
  extra: Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  return {
    id,
    clip,
    rangeM,
    upperBodyWeight: 1,
    allowLocomotion: false,
    fadeIn: 0.1,
    fadeOut: 0.18,
    hitWindow: [0.3, 0.7],
    weaponCollider: true,
    cooldownS: 1.5,
    ...extra,
  };
}

/**
 * Layer weights while a skill runs — same math as LocomotionCore.
 * Hosts can preview without starting the skill.
 */
export function previewSkillLayerWeights(
  skill: Pick<WeaponSkillDef, "upperBodyWeight" | "allowLocomotion">,
  skillLocoRetain = 0.55,
): LayerWeights {
  return skillOnLocoWeights({
    skillWeight: skill.upperBodyWeight ?? 1,
    allowLocomotion: skill.allowLocomotion,
    skillLocoRetain,
  });
}

/** Category → factory */
export function makeSkillByCategory(
  category:
    | "melee"
    | "ranged"
    | "magic"
    | "mobility"
    | "block"
    | "parry"
    | "reaction"
    | "finisher",
  id: string,
  clip: unknown,
  opts: { rangeM?: number } & Partial<WeaponSkillDef> = {},
): WeaponSkillDef {
  const { rangeM, ...extra } = opts;
  switch (category) {
    case "melee":
      return makeMeleeSkill(id, clip, rangeM ?? 2.5, extra);
    case "ranged":
      return makeRangedSkill(id, clip, rangeM ?? 22, extra);
    case "magic":
      return makeMagicSkill(id, clip, rangeM ?? 18, extra);
    case "mobility":
      return makeMobilitySkill(id, clip, extra);
    case "block":
      return makeBlockSkill(id, clip, extra);
    case "parry":
      return makeParrySkill(id, clip, extra);
    case "reaction":
      return makeReactionSkill(id, clip, extra);
    case "finisher":
      return makeFinisherSkill(id, clip, rangeM ?? 3, extra);
    default:
      return makeMeleeSkill(id, clip, 2.5, extra);
  }
}

export { DEFAULT_MELEE_HIT_WINDOW };
