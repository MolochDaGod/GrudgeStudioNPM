/**
 * Weapon skill animation + blend SSOT.
 * Pack skills (animPacks) + blend profiles → hosts build LocomotionCore WeaponSkillDef.
 */

import {
  ANIM_PACKS,
  getAnimPack,
  type ClipCandidate,
  type ClipRole,
  type SkillClipDef,
} from "./animPacks";

/** How the skill layers onto locomotion */
export type SkillBlendKind =
  | "melee_upper"
  | "melee_full"
  | "ranged"
  | "magic"
  | "mobility"
  | "block"
  | "parry"
  | "reaction"
  | "finisher";

/**
 * Full blend profile for a weapon skill.
 * Maps 1:1 to LocomotionCore.playWeaponSkill options (+ skillLocoRetain for host).
 */
export interface SkillBlendProfile {
  kind: SkillBlendKind;
  /** 0–1 skill action weight */
  upperBodyWeight: number;
  /** Keep gait under skill */
  allowLocomotion: boolean;
  /** Loco retain multiplier while skill plays (LocomotionCore skillLocoRetain) */
  skillLocoRetain: number;
  fadeIn: number;
  fadeOut: number;
  hitWindow: [number, number];
  weaponCollider: boolean;
  /** Full-body dash/roll */
  locomotionSkill?: boolean;
  /** CC / hit react — interrupts combat */
  reaction?: boolean;
  /** Optional bone mask hint for hosts */
  boneMask?: "upperBody" | "full" | "rightArm" | "lowerBody";
  /** Recommended continuous gait under skill */
  continuousGait?: boolean;
}

/** Canonical blend presets — do not invent per-game numbers */
export const SKILL_BLEND_PROFILES: Record<SkillBlendKind, SkillBlendProfile> = {
  melee_upper: {
    kind: "melee_upper",
    upperBodyWeight: 0.95,
    allowLocomotion: true,
    skillLocoRetain: 0.55,
    fadeIn: 0.08,
    fadeOut: 0.12,
    hitWindow: [0.28, 0.55],
    weaponCollider: true,
    boneMask: "upperBody",
    continuousGait: true,
  },
  melee_full: {
    kind: "melee_full",
    upperBodyWeight: 1,
    allowLocomotion: false,
    skillLocoRetain: 0.12,
    fadeIn: 0.1,
    fadeOut: 0.15,
    hitWindow: [0.3, 0.65],
    weaponCollider: true,
    boneMask: "full",
    continuousGait: false,
  },
  ranged: {
    kind: "ranged",
    upperBodyWeight: 1,
    allowLocomotion: false,
    skillLocoRetain: 0.1,
    fadeIn: 0.1,
    fadeOut: 0.15,
    hitWindow: [0.35, 0.5],
    weaponCollider: false,
    boneMask: "upperBody",
    continuousGait: false,
  },
  magic: {
    kind: "magic",
    upperBodyWeight: 1,
    allowLocomotion: false,
    skillLocoRetain: 0.1,
    fadeIn: 0.12,
    fadeOut: 0.18,
    hitWindow: [0.4, 0.65],
    weaponCollider: false,
    boneMask: "upperBody",
  },
  mobility: {
    kind: "mobility",
    upperBodyWeight: 1,
    allowLocomotion: false,
    skillLocoRetain: 0.08,
    fadeIn: 0.05,
    fadeOut: 0.1,
    hitWindow: [0.1, 0.85],
    weaponCollider: false,
    locomotionSkill: true,
    boneMask: "full",
  },
  block: {
    kind: "block",
    upperBodyWeight: 0.85,
    allowLocomotion: true,
    skillLocoRetain: 0.65,
    fadeIn: 0.06,
    fadeOut: 0.1,
    hitWindow: [0, 1],
    weaponCollider: false,
    boneMask: "upperBody",
    continuousGait: true,
  },
  parry: {
    kind: "parry",
    upperBodyWeight: 1,
    allowLocomotion: false,
    skillLocoRetain: 0.15,
    fadeIn: 0.04,
    fadeOut: 0.1,
    hitWindow: [0.1, 0.35],
    weaponCollider: false,
    boneMask: "upperBody",
  },
  reaction: {
    kind: "reaction",
    upperBodyWeight: 1,
    allowLocomotion: false,
    skillLocoRetain: 0.05,
    fadeIn: 0.05,
    fadeOut: 0.15,
    hitWindow: [0, 1],
    weaponCollider: false,
    reaction: true,
    boneMask: "full",
  },
  finisher: {
    kind: "finisher",
    upperBodyWeight: 1,
    allowLocomotion: false,
    skillLocoRetain: 0.08,
    fadeIn: 0.1,
    fadeOut: 0.18,
    hitWindow: [0.3, 0.7],
    weaponCollider: true,
    boneMask: "full",
  },
};

/** Infer blend kind from skill flags / role when not set */
export function inferSkillBlendKind(skill: SkillClipDef): SkillBlendKind {
  if (skill.reaction) return "reaction";
  if (skill.locomotionSkill) return "mobility";
  const id = skill.skillId.toLowerCase();
  const role = skill.role;
  if (role === "parry" || id.includes("parry")) return "parry";
  if (role === "block" || role === "block_idle" || id.includes("block")) {
    return "block";
  }
  if (
    role === "hit" ||
    role === "knockback" ||
    role === "flyback" ||
    role === "getup" ||
    role === "down" ||
    role === "stun" ||
    role === "slam" ||
    id.includes("react")
  ) {
    return "reaction";
  }
  if (role === "dash" || role === "dodge_f" || id.includes("dodge") || id.includes("dash")) {
    return "mobility";
  }
  if (role === "cast" || id.includes("magic") || id.includes("cast")) return "magic";
  if (
    role === "fire" ||
    role === "aim" ||
    id.includes("bow") ||
    id.includes("pistol") ||
    id.includes("xbow") ||
    id.includes("shot")
  ) {
    return "ranged";
  }
  if (
    role === "skill_a" ||
    role === "skill_b" ||
    id.includes("slam") ||
    id.includes("finisher") ||
    id.includes("spin") ||
    id.includes("cleave")
  ) {
    if (skill.blendOnLocomotion === false) return "finisher";
    return "melee_full";
  }
  if (skill.blendOnLocomotion === false) return "melee_full";
  return "melee_upper";
}

/** Resolve profile: explicit skill fields override preset */
export function resolveSkillBlendProfile(
  skill: SkillClipDef,
  kind?: SkillBlendKind,
): SkillBlendProfile {
  const k = kind ?? inferSkillBlendKind(skill);
  const base = { ...SKILL_BLEND_PROFILES[k] };
  if (skill.upperBodyWeight != null) base.upperBodyWeight = skill.upperBodyWeight;
  if (skill.blendOnLocomotion != null) base.allowLocomotion = skill.blendOnLocomotion;
  if (skill.hitWindow) base.hitWindow = skill.hitWindow;
  if (skill.locomotionSkill != null) base.locomotionSkill = skill.locomotionSkill;
  if (skill.reaction != null) base.reaction = skill.reaction;
  return base;
}

/** Flattened weapon skill anim entry for catalogs / hotbar / deploy */
export interface WeaponSkillAnimEntry {
  skillId: string;
  name: string;
  animPack: string;
  role: ClipRole;
  candidates: ClipCandidate[];
  blend: SkillBlendProfile;
  rangeM: number;
  cooldownS: number;
  /** Hotbar slot hint 1–4 */
  slotHint?: number;
}

/** Collect all skills from a pack with resolved blends */
export function weaponSkillsForPack(packId: string): WeaponSkillAnimEntry[] {
  const pack = getAnimPack(packId);
  return pack.skills.map((sk, i) => {
    const blend = resolveSkillBlendProfile(sk);
    return {
      skillId: sk.skillId,
      name: sk.name,
      animPack: pack.id,
      role: sk.role,
      candidates: sk.candidates,
      blend,
      rangeM: sk.rangeM ?? defaultRangeForKind(blend.kind),
      cooldownS: sk.cooldownS ?? defaultCdForKind(blend.kind),
      slotHint: i < 4 ? i + 1 : undefined,
    };
  });
}

/** All weapon skill anims across registered packs */
export function listAllWeaponSkillAnims(): WeaponSkillAnimEntry[] {
  const out: WeaponSkillAnimEntry[] = [];
  for (const p of ANIM_PACKS) {
    if (p.skills.length === 0) continue;
    out.push(...weaponSkillsForPack(p.id));
  }
  return out;
}

/** Skills for combat kit: weapon pack + shared reactions + block + dash */
export function combatSkillKit(weaponPackId: string): WeaponSkillAnimEntry[] {
  const base = weaponSkillsForPack(weaponPackId);
  const extra = [
    ...weaponSkillsForPack("reactions"),
    ...weaponSkillsForPack("block"),
    ...weaponSkillsForPack("dash"),
  ];
  const seen = new Set(base.map((s) => s.skillId));
  for (const s of extra) {
    if (!seen.has(s.skillId)) {
      base.push(s);
      seen.add(s.skillId);
    }
  }
  return base;
}

function defaultRangeForKind(k: SkillBlendKind): number {
  switch (k) {
    case "ranged":
      return 28;
    case "magic":
      return 18;
    case "mobility":
    case "reaction":
    case "block":
    case "parry":
      return 0;
    case "finisher":
      return 3.0;
    case "melee_full":
      return 2.8;
    default:
      return 2.5;
  }
}

function defaultCdForKind(k: SkillBlendKind): number {
  switch (k) {
    case "melee_upper":
      return 0.35;
    case "melee_full":
      return 0.9;
    case "finisher":
      return 1.5;
    case "ranged":
      return 0.5;
    case "magic":
      return 0.8;
    case "mobility":
      return 0.9;
    case "parry":
      return 0.8;
    case "block":
      return 0;
    case "reaction":
      return 0.2;
    default:
      return 0.4;
  }
}

/**
 * Data payload hosts pass into LocomotionCore (clip resolved separately).
 * Does not include the THREE clip object.
 */
export interface WeaponSkillAnimPayload {
  id: string;
  name?: string;
  animPack: string;
  upperBodyWeight: number;
  allowLocomotion: boolean;
  fadeIn: number;
  fadeOut: number;
  hitWindow: [number, number];
  rangeM: number;
  cooldownS: number;
  weaponCollider: boolean;
  locomotionSkill?: boolean;
  reaction?: boolean;
  blendKind: SkillBlendKind;
  skillLocoRetain: number;
  boneMask?: SkillBlendProfile["boneMask"];
  /** First candidate key for loaders */
  preferredClipKey: string;
  candidates: ClipCandidate[];
}

export function toWeaponSkillPayload(entry: WeaponSkillAnimEntry): WeaponSkillAnimPayload {
  const b = entry.blend;
  return {
    id: entry.skillId,
    name: entry.name,
    animPack: entry.animPack,
    upperBodyWeight: b.upperBodyWeight,
    allowLocomotion: b.allowLocomotion,
    fadeIn: b.fadeIn,
    fadeOut: b.fadeOut,
    hitWindow: b.hitWindow,
    rangeM: entry.rangeM,
    cooldownS: entry.cooldownS,
    weaponCollider: b.weaponCollider,
    locomotionSkill: b.locomotionSkill,
    reaction: b.reaction,
    blendKind: b.kind,
    skillLocoRetain: b.skillLocoRetain,
    boneMask: b.boneMask,
    preferredClipKey: entry.candidates[0]?.key ?? "",
    candidates: entry.candidates,
  };
}

/** Human-readable blend practice line for docs / debug */
export function describeSkillBlend(entry: WeaponSkillAnimEntry): string {
  const b = entry.blend;
  return (
    `${entry.skillId} [${b.kind}] upper=${b.upperBodyWeight} ` +
    `loco=${b.allowLocomotion ? "blend" : "freeze"} retain=${b.skillLocoRetain} ` +
    `hit=${b.hitWindow[0]}-${b.hitWindow[1]} fade=${b.fadeIn}/${b.fadeOut}s ` +
    `collider=${b.weaponCollider}${b.locomotionSkill ? " DASH" : ""}${b.reaction ? " REACT" : ""}`
  );
}

export function formatWeaponSkillAnimCatalog(packId?: string): string {
  const list = packId ? weaponSkillsForPack(packId) : listAllWeaponSkillAnims();
  const lines = [`=== Weapon skill anims (${list.length}) ===`];
  let cur = "";
  for (const e of list) {
    if (e.animPack !== cur) {
      cur = e.animPack;
      lines.push(`\n# ${cur}`);
    }
    lines.push(`  ${describeSkillBlend(e)}  range=${e.rangeM}m cd=${e.cooldownS}s`);
    lines.push(`    clips: ${e.candidates.map((c) => c.key).join(" | ")}`);
  }
  return lines.join("\n");
}
