/**
 * Animation blending helpers — weight curves, layer intents, bone-mask tokens.
 * Hosts apply weights to THREE.AnimationAction; this package stays duck-typed.
 *
 * Weapon skill profiles live in @grudge-studio/assets (SKILL_BLEND_PROFILES).
 * Runtime application: LocomotionCore + skillOnLocoWeights.
 * See packages/assets/docs/WEAPON_SKILL_BLENDS.md
 */

/** Common blend layer ids for combat + loco */
export type BlendLayerId =
  | "locomotion"
  | "upper_body"
  | "full_body_skill"
  | "additive"
  | "face"
  | "ik";

export interface LayerWeights {
  locomotion: number;
  upper_body: number;
  full_body_skill: number;
  additive: number;
}

/** Default: full loco, no skill */
export function defaultLayerWeights(): LayerWeights {
  return {
    locomotion: 1,
    upper_body: 0,
    full_body_skill: 0,
    additive: 0,
  };
}

/**
 * When a weapon skill plays on top of locomotion:
 * - allowLoco keeps partial gait under upper-body weight
 * - otherwise almost freezes loco for full-body skills
 */
export function skillOnLocoWeights(opts: {
  skillWeight?: number;
  allowLocomotion?: boolean;
  skillLocoRetain?: number;
}): LayerWeights {
  const skillW = clamp01(opts.skillWeight ?? 1);
  const retain = opts.skillLocoRetain ?? 0.55;
  const allow = opts.allowLocomotion !== false;
  return {
    locomotion: allow ? retain * (1 - skillW * 0.5) : 0.12 * (1 - skillW),
    upper_body: skillW,
    full_body_skill: allow ? 0 : skillW,
    additive: 0,
  };
}

/** Smoothstep ease 0–1 */
export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** Linear interpolate */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Crossfade plan for two exclusive actions (A → B over fadeS seconds).
 * Host applies each frame: A weight = out, B weight = in.
 */
export function crossfadePlan(
  elapsedS: number,
  fadeS: number,
): { fromWeight: number; toWeight: number; done: boolean } {
  if (fadeS <= 0) return { fromWeight: 0, toWeight: 1, done: true };
  const t = clamp01(elapsedS / fadeS);
  const e = smoothstep(t);
  return { fromWeight: 1 - e, toWeight: e, done: t >= 1 };
}

/**
 * Bone groups for optional mask filtering (hosts map to AnimationObjectGroup
 * or strip tracks). Names are Bip001 tokens after normalizeBoneToken.
 */
export const BONE_MASK_GROUPS = {
  /** Legs + hips — keep under locomotion when skill is upper-body */
  lowerBody: [
    "pelvis",
    "lthigh",
    "lcalf",
    "lfoot",
    "rthigh",
    "rcalf",
    "rfoot",
  ],
  upperBody: [
    "spine",
    "spine1",
    "spine2",
    "neck",
    "head",
    "lclavicle",
    "lupperarm",
    "lforearm",
    "lhand",
    "rclavicle",
    "rupperarm",
    "rforearm",
    "rhand",
  ],
  spineChain: ["spine", "spine1", "spine2", "neck", "head"],
  rightArm: ["rclavicle", "rupperarm", "rforearm", "rhand"],
  leftArm: ["lclavicle", "lupperarm", "lforearm", "lhand"],
} as const;

export type BoneMaskGroup = keyof typeof BONE_MASK_GROUPS;

/**
 * Gait blend intent from continuous speed (for multi-clip weighted trees).
 * Weights sum ≈ 1.
 */
export function gaitBlendFromSpeed(
  speed01: number,
  sprinting: boolean,
  walkFrac = 0.45,
): { idle: number; walk: number; run: number; sprint: number } {
  const s = clamp01(speed01);
  if (s < 0.05) {
    return { idle: 1, walk: 0, run: 0, sprint: 0 };
  }
  if (sprinting) {
    // blend run→sprint from mid speed
    const t = smoothstep((s - 0.5) / 0.5);
    return { idle: 0, walk: 0, run: 1 - t, sprint: t };
  }
  if (s < walkFrac) {
    const t = smoothstep(s / walkFrac);
    return { idle: 1 - t, walk: t, run: 0, sprint: 0 };
  }
  const t = smoothstep((s - walkFrac) / (1 - walkFrac));
  return { idle: 0, walk: 1 - t, run: t, sprint: 0 };
}

/**
 * Recommended skillLocoRetain by skill category (mirrors assets SKILL_BLEND_PROFILES).
 * Prefer importing profiles from assets when available.
 */
export const DEFAULT_SKILL_LOCO_RETAIN = {
  melee_upper: 0.55,
  melee_full: 0.12,
  finisher: 0.08,
  ranged: 0.1,
  magic: 0.1,
  mobility: 0.08,
  block: 0.65,
  parry: 0.15,
  reaction: 0.05,
} as const;

export type SkillLocoRetainKey = keyof typeof DEFAULT_SKILL_LOCO_RETAIN;
