/**
 * Anim pack registry — slots, directional keys, skills, skeleton, bake status.
 *
 * Policy: Flare/OPB/KayKit contribute **clips only** (no hero product).
 * Adio GLB = pistol / crossbow / gunfight. Unity = blocks, knockbacks, get-ups.
 */

import { LOCO_BAKED, normalizeAnimPackId } from "./anims";
import {
  ADIO_CLIPS,
  RAIDRIAR_GLB,
  RAIDRIAR_ROLE_MAP,
  type SkeletonRuntime,
} from "./animSources";

/** Locomotion / combat / reaction clip roles */
export type ClipRole =
  | "idle"
  | "walk"
  | "run"
  | "sprint"
  | "walk_back"
  | "walk_left"
  | "walk_right"
  | "run_back"
  | "run_left"
  | "run_right"
  | "strafe_left"
  | "strafe_right"
  | "jump"
  | "jump_loop"
  | "land"
  | "dash"
  | "dodge_f"
  | "dodge_b"
  | "dodge_l"
  | "dodge_r"
  | "attack1"
  | "attack2"
  | "attack3"
  | "skill_a"
  | "skill_b"
  | "block"
  | "block_idle"
  | "block_react"
  | "parry"
  | "hit"
  | "stun"
  | "knockback"
  | "flyback"
  | "flyback_loop"
  | "flyback_end"
  | "down"
  | "getup"
  | "slam"
  | "death"
  | "cast"
  | "aim"
  | "fire"
  | "reload"
  | "warcry"
  | "draw"
  | "sheath"
  | "boost";

export type DirectionalSlot =
  | "idle"
  | "forward"
  | "back"
  | "left"
  | "right"
  | "forward_left"
  | "forward_right"
  | "back_left"
  | "back_right";

export type BakeStatus =
  | "production_baked"
  | "needs_bake"
  | "native_embedded"
  | "library_shared"
  | "partial"
  | "clip_harvest";

export interface ClipCandidate {
  key: string;
  sourceFolder?: string;
  /** glb path for embedded harvest */
  sourceGlb?: string;
  priority?: number;
}

export interface SkillClipDef {
  skillId: string;
  name: string;
  role: ClipRole;
  candidates: ClipCandidate[];
  blendOnLocomotion: boolean;
  upperBodyWeight?: number;
  hitWindow?: [number, number];
  rangeM?: number;
  cooldownS?: number;
  locomotionSkill?: boolean;
  /** Reaction / CC — full body, interrupts loco */
  reaction?: boolean;
}

export interface AnimPackDef {
  id: string;
  label: string;
  skeleton: SkeletonRuntime;
  sourceRootId: string;
  bakeStatus: BakeStatus;
  clips: Partial<Record<ClipRole, ClipCandidate[]>>;
  directional?: Partial<Record<DirectionalSlot, ClipRole>>;
  skills: SkillClipDef[];
  tags: string[];
  /** Never use pack meshes as fleet heroes */
  clipsOnly?: boolean;
  notes?: string;
}

function c(
  key: string,
  sourceFolder?: string,
  priority = 0,
  sourceGlb?: string,
): ClipCandidate {
  return { key, sourceFolder, priority, sourceGlb };
}

const ADIO = "D:/Games/Models/one_piece_bounty_rush_adio.glb";

function adio(name: string, priority = 0): ClipCandidate {
  return {
    key: name,
    sourceFolder: "adio",
    sourceGlb: ADIO,
    priority,
  };
}

function raidriar(name: string, priority = 0): ClipCandidate {
  return {
    key: name,
    sourceFolder: "raidriar",
    sourceGlb: RAIDRIAR_GLB,
    priority,
  };
}

export const DEFAULT_DIRECTIONAL: Record<DirectionalSlot, ClipRole> = {
  idle: "idle",
  forward: "run",
  back: "walk_back",
  left: "strafe_left",
  right: "strafe_right",
  forward_left: "run",
  forward_right: "run",
  back_left: "walk_back",
  back_right: "walk_back",
};

/** Production grudge6 sword + shield (baked Bip001) */
export const PACK_SWORD_SHIELD: AnimPackDef = {
  id: "sword_shield",
  label: "Sword & Shield",
  skeleton: "bip001",
  sourceRootId: "fleet_baked_bip001",
  bakeStatus: "production_baked",
  tags: ["melee", "1h", "shield", "grudge6"],
  clips: {
    idle: [c(LOCO_BAKED.idle), c("sword_shield/sword and shield idle")],
    walk: [c(LOCO_BAKED.walk)],
    run: [c(LOCO_BAKED.run), c("sword_shield/sword and shield run")],
    jump: [c(LOCO_BAKED.jump)],
    warcry: [c(LOCO_BAKED.warcry)],
    attack1: [
      c("sword_shield/sword and shield attack"),
      c("sword_shield/sword and shield slash"),
    ],
    attack2: [
      c("sword_shield/sword and shield attack (2)"),
      c("sword_shield/sword and shield slash 1"),
    ],
    cast: [c("sword_shield/sword and shield casting")],
    death: [c("sword_shield/sword and shield death")],
    hit: [c("magic/Standing React Small From Front")],
  },
  directional: { ...DEFAULT_DIRECTIONAL, forward: "run" },
  skills: [
    {
      skillId: "ss_slash",
      name: "Slash",
      role: "attack1",
      candidates: [c("sword_shield/sword and shield slash")],
      blendOnLocomotion: true,
      upperBodyWeight: 0.95,
      hitWindow: [0.28, 0.55],
      rangeM: 2.5,
      cooldownS: 0.35,
    },
    {
      skillId: "ss_slash2",
      name: "Slash 2",
      role: "attack2",
      candidates: [c("sword_shield/sword and shield attack (2)")],
      blendOnLocomotion: true,
      upperBodyWeight: 0.95,
      hitWindow: [0.28, 0.55],
      rangeM: 2.6,
      cooldownS: 0.4,
    },
  ],
};

/**
 * Shared reactions — knockbacks, fly-backs, get-ups, stun, slam.
 * Unity reactions/ + Adio blownback/down (clips only).
 */
export const PACK_REACTIONS: AnimPackDef = {
  id: "reactions",
  label: "Knockback / Flyback / Get-up / Stun",
  skeleton: "bip001",
  sourceRootId: "unity_mixamo_library",
  bakeStatus: "needs_bake",
  clipsOnly: true,
  tags: ["reaction", "cc", "hitstun", "knockback", "getup"],
  notes:
    "Bake Unity reactions FBX → Bip001. Adio blownback/down are OPB-rig harvest for gunfight adapters.",
  clips: {
    hit: [
      c("reactions/hit-to-head.fbx", "reactions"),
      c("reactions/big-body-blow.fbx", "reactions"),
      adio("pl_adio_orig01_damage", 2),
    ],
    knockback: [
      c("reactions/big-body-blow.fbx", "reactions"),
      c("reactions/jump-away.fbx", "reactions"),
      c("reactions/jogging-stumble.fbx", "reactions"),
    ],
    flyback: [
      c("reactions/flying-back.fbx", "reactions"),
      c("reactions/knocked-up-and-back.fbx", "reactions"),
      adio("pl_adio_orig01_blownback_lp", 1),
    ],
    flyback_loop: [
      adio("pl_adio_orig01_blownback_lp"),
      c("reactions/falling-idle.fbx", "reactions"),
    ],
    flyback_end: [
      adio("pl_adio_orig01_blownback_end"),
      c("reactions/fallen.fbx", "reactions"),
    ],
    down: [
      c("reactions/fallen.fbx", "reactions"),
      c("reactions/knocked-out.fbx", "reactions"),
      adio("pl_adio_orig01_down"),
    ],
    getup: [
      c("reactions/get-up.fbx", "reactions"),
      c("extra/corkscrew-kip-up.fbx", "extra"),
      adio("pl_adio_orig01_down_end"),
    ],
    slam: [
      c("reactions/knocked-up.fbx", "reactions"),
      c("reactions/wall-crash.fbx", "reactions"),
      adio("pl_adio_orig01_slammed"),
    ],
    stun: [
      c("reactions/stunned.fbx", "reactions"),
      adio("pl_adio_orig01_stun"),
      adio("pl_adio_orig01_electric_shock", 1),
      adio("pl_adio_orig01_shake", 2),
    ],
    death: [
      c("reactions/knocked-unconscious.fbx", "reactions"),
      c("reactions/fallen.fbx", "reactions"),
    ],
  },
  skills: [
    {
      skillId: "react_hit",
      name: "Hit React",
      role: "hit",
      candidates: [c("reactions/hit-to-head.fbx", "reactions")],
      blendOnLocomotion: false,
      reaction: true,
      cooldownS: 0.2,
    },
    {
      skillId: "react_flyback",
      name: "Fly Back",
      role: "flyback",
      candidates: [c("reactions/flying-back.fbx", "reactions")],
      blendOnLocomotion: false,
      reaction: true,
      cooldownS: 0.5,
    },
    {
      skillId: "react_getup",
      name: "Get Up",
      role: "getup",
      candidates: [c("reactions/get-up.fbx", "reactions")],
      blendOnLocomotion: false,
      reaction: true,
      cooldownS: 0.1,
    },
  ],
};

/** Blocks & parries — Unity block/ */
export const PACK_BLOCK: AnimPackDef = {
  id: "block",
  label: "Block & Parry",
  skeleton: "bip001",
  sourceRootId: "unity_mixamo_library",
  bakeStatus: "needs_bake",
  clipsOnly: true,
  tags: ["block", "parry", "defense"],
  clips: {
    block_idle: [c("block/standing-block-idle.fbx", "block")],
    block: [
      c("block/left-block.fbx", "block"),
      c("block/right-block.fbx", "block"),
    ],
    block_react: [
      c("block/block-react-large.fbx", "block"),
      c("block/standing-block-react-large.fbx", "block"),
      c("block/great-sword-impact.fbx", "block"),
    ],
    parry: [
      c("block/parry.fbx", "block"),
      c("reactions/parry.fbx", "reactions"),
    ],
  },
  skills: [
    {
      skillId: "block_hold",
      name: "Block",
      role: "block",
      candidates: [c("block/standing-block-idle.fbx", "block")],
      blendOnLocomotion: true,
      upperBodyWeight: 0.85,
      cooldownS: 0,
    },
    {
      skillId: "parry",
      name: "Parry",
      role: "parry",
      candidates: [c("block/parry.fbx", "block")],
      blendOnLocomotion: false,
      hitWindow: [0.1, 0.35],
      cooldownS: 0.8,
    },
  ],
};

/**
 * Pistol / gunfight — Adio OPB clips (primary) + Unity pistol FBX (bake to Bip001).
 * Clips only from Adio GLB — not Adio as fleet hero.
 */
export const PACK_PISTOL: AnimPackDef = {
  id: "pistol",
  label: "Pistol / Gunfight (Adio + Unity)",
  skeleton: "opb",
  sourceRootId: "opb_adio_pistol",
  bakeStatus: "clip_harvest",
  clipsOnly: true,
  tags: ["ranged", "pistol", "gun", "adio", "opb_clips"],
  notes:
    `Primary source ${ADIO}. Combos/skills/dodge/jump for pistol fighting. Unity pistol/ pack bakes to Bip001 for grudge6 kits. Attach pistols to r_weapon_joint.`,
  clips: {
    idle: [
      adio("pl_adio_orig01_idle_a"),
      adio("pl_adio_orig01_idlehome_a", 1),
      c("pistol/idle.fbx", "pistol", 2),
    ],
    run: [adio("pl_adio_orig01_run"), c("pistol/run-forward.fbx", "pistol", 1)],
    walk: [c("pistol/walk-forward.fbx", "pistol"), adio("pl_adio_orig01_run", 1)],
    walk_back: [c("pistol/walk-backward.fbx", "pistol")],
    run_back: [c("pistol/run-backward.fbx", "pistol")],
    strafe_left: [
      c("pistol/strafe-left.fbx", "pistol"),
      c("pistol/run-arc-left.fbx", "pistol", 1),
    ],
    strafe_right: [
      c("pistol/strafe-right.fbx", "pistol"),
      c("pistol/run-arc-right.fbx", "pistol", 1),
    ],
    jump: [adio("pl_adio_orig01_jump"), c("pistol/pistol-jump.fbx", "pistol", 1)],
    jump_loop: [adio("pl_adio_orig01_jump_lp")],
    land: [adio("pl_adio_orig01_jump_end")],
    dash: [adio("pl_adio_orig01_dodge")],
    dodge_f: [adio("pl_adio_orig01_dodge")],
    attack1: [adio("pl_adio_orig01_combo_a"), c("pistol/gunplay.fbx", "pistol", 1)],
    attack2: [adio("pl_adio_orig01_combo_b"), c("pistol/pistol-whip.fbx", "pistol", 1)],
    attack3: [adio("pl_adio_orig01_combo_c"), c("pistol/charged-pistol.fbx", "pistol", 1)],
    skill_a: [adio("pl_adio_orig01_skill_a")],
    skill_b: [adio("pl_adio_orig01_skill_b")],
    fire: [adio("pl_adio_orig01_combo_a"), c("pistol/gunplay.fbx", "pistol", 1)],
    aim: [c("pistol/idle.fbx", "pistol"), adio("pl_adio_orig01_idle_a", 1)],
    draw: [c("pistol/drawing-gun.fbx", "pistol")],
    hit: [adio("pl_adio_orig01_damage")],
    stun: [adio("pl_adio_orig01_stun")],
    flyback_loop: [adio("pl_adio_orig01_blownback_lp")],
    flyback_end: [adio("pl_adio_orig01_blownback_end")],
    down: [adio("pl_adio_orig01_down")],
    getup: [adio("pl_adio_orig01_down_end")],
    boost: [adio("pl_adio_orig01_boost")],
  },
  directional: {
    ...DEFAULT_DIRECTIONAL,
    left: "strafe_left",
    right: "strafe_right",
    back: "walk_back",
  },
  skills: [
    {
      skillId: "pistol_fire",
      name: "Fire",
      role: "fire",
      candidates: [adio("pl_adio_orig01_combo_a")],
      blendOnLocomotion: true,
      upperBodyWeight: 0.9,
      hitWindow: [0.2, 0.45],
      rangeM: 35,
      cooldownS: 0.25,
    },
    {
      skillId: "pistol_combo_b",
      name: "Combo B",
      role: "attack2",
      candidates: [adio("pl_adio_orig01_combo_b")],
      blendOnLocomotion: true,
      rangeM: 30,
      cooldownS: 0.4,
    },
    {
      skillId: "pistol_skill_a",
      name: "Skill A",
      role: "skill_a",
      candidates: [adio("pl_adio_orig01_skill_a")],
      blendOnLocomotion: false,
      rangeM: 40,
      cooldownS: 1.5,
    },
    {
      skillId: "pistol_skill_b",
      name: "Skill B",
      role: "skill_b",
      candidates: [adio("pl_adio_orig01_skill_b")],
      blendOnLocomotion: false,
      rangeM: 40,
      cooldownS: 2.0,
    },
    {
      skillId: "pistol_dodge",
      name: "Dodge",
      role: "dash",
      candidates: [adio("pl_adio_orig01_dodge")],
      blendOnLocomotion: false,
      locomotionSkill: true,
      cooldownS: 0.9,
    },
    {
      skillId: "pistol_whip",
      name: "Pistol Whip",
      role: "attack2",
      candidates: [c("pistol/pistol-whip.fbx", "pistol")],
      blendOnLocomotion: false,
      rangeM: 1.8,
      cooldownS: 0.6,
    },
  ],
};

/**
 * Crossbow / xbow — Adio gunfight cadence + bow aim/fire language.
 * Same clip harvest policy (no OPB hero mesh).
 */
export const PACK_CROSSBOW: AnimPackDef = {
  id: "crossbow",
  label: "Crossbow / Xbow",
  skeleton: "opb",
  sourceRootId: "opb_adio_pistol",
  bakeStatus: "clip_harvest",
  clipsOnly: true,
  tags: ["ranged", "crossbow", "xbow", "adio", "bow"],
  notes:
    "Uses Adio combat clips for fighting loop + Unity bow aim/shoot for Bip001 bake path. Pistol pack skills shared where fire cadence matches.",
  clips: {
    idle: [adio("pl_adio_orig01_idle_a"), c("bow/standing-idle-01.fbx", "bow", 1)],
    run: [adio("pl_adio_orig01_run")],
    walk: [c("bow/standing-walk-forward.fbx", "bow")],
    aim: [
      c("bow/standing-aim-overdraw.fbx", "bow"),
      adio("pl_adio_orig01_idle_a", 1),
    ],
    fire: [
      c("bow/shooting-arrow.fbx", "bow"),
      adio("pl_adio_orig01_combo_a", 1),
    ],
    attack1: [adio("pl_adio_orig01_combo_a"), c("bow/shooting-arrow.fbx", "bow", 1)],
    skill_a: [adio("pl_adio_orig01_skill_a"), c("bow/standing-aim-overdraw.fbx", "bow", 1)],
    skill_b: [adio("pl_adio_orig01_skill_b")],
    dash: [adio("pl_adio_orig01_dodge")],
    dodge_f: [c("bow/standing-dodge-forward.fbx", "bow"), adio("pl_adio_orig01_dodge", 1)],
    dodge_b: [c("bow/standing-dodge-backward.fbx", "bow")],
    dodge_l: [c("bow/standing-dodge-left.fbx", "bow")],
    dodge_r: [c("bow/standing-dodge-right.fbx", "bow")],
    hit: [adio("pl_adio_orig01_damage")],
    draw: [c("bow/standing-equip-bow.fbx", "bow"), c("pistol/drawing-gun.fbx", "pistol", 1)],
  },
  skills: [
    {
      skillId: "xbow_shot",
      name: "Crossbow Shot",
      role: "fire",
      candidates: [c("bow/shooting-arrow.fbx", "bow"), adio("pl_adio_orig01_combo_a", 1)],
      blendOnLocomotion: false,
      hitWindow: [0.35, 0.55],
      rangeM: 32,
      cooldownS: 0.7,
    },
    {
      skillId: "xbow_skill",
      name: "Power Bolt",
      role: "skill_a",
      candidates: [adio("pl_adio_orig01_skill_a")],
      blendOnLocomotion: false,
      rangeM: 40,
      cooldownS: 2.0,
    },
    {
      skillId: "xbow_dodge",
      name: "Dodge",
      role: "dash",
      candidates: [adio("pl_adio_orig01_dodge")],
      blendOnLocomotion: false,
      locomotionSkill: true,
      cooldownS: 0.9,
    },
  ],
};

/** Dash / evade */
export const PACK_DASH: AnimPackDef = {
  id: "dash",
  label: "Dash & Evade",
  skeleton: "bip001",
  sourceRootId: "unity_mixamo_library",
  bakeStatus: "needs_bake",
  clipsOnly: true,
  tags: ["mobility", "dodge", "dash", "mixamo"],
  notes: "Unity extra/ + bow dodges. Adio dodge also listed on pistol pack.",
  clips: {
    dash: [
      c("extra/running-slide.fbx", "extra", 0),
      c("extra/quick-roll-to-run.fbx", "extra", 1),
      adio("pl_adio_orig01_dodge", 2),
    ],
    dodge_f: [
      c("bow/standing-dodge-forward.fbx", "bow"),
      c("extra/aerial-evade.fbx", "extra"),
    ],
    dodge_b: [
      c("bow/standing-dodge-backward.fbx", "bow"),
      c("extra/corkscrew-evade.fbx", "extra"),
    ],
    dodge_l: [c("bow/standing-dodge-left.fbx", "bow")],
    dodge_r: [c("bow/standing-dodge-right.fbx", "bow")],
    jump: [c("extra/jump-up.fbx", "extra")],
  },
  skills: [
    {
      skillId: "dash_slide",
      name: "Running Slide",
      role: "dash",
      candidates: [c("extra/running-slide.fbx", "extra")],
      blendOnLocomotion: false,
      locomotionSkill: true,
      cooldownS: 1.2,
    },
    {
      skillId: "dash_roll",
      name: "Quick Roll",
      role: "dash",
      candidates: [c("extra/quick-roll-to-run.fbx", "extra")],
      blendOnLocomotion: false,
      locomotionSkill: true,
      cooldownS: 1.0,
    },
  ],
};

/** Samurai / 2H — Unity only, no OPB heroes */
export const PACK_SAMURAI: AnimPackDef = {
  id: "samurai",
  label: "Samurai / Greatsword",
  skeleton: "bip001",
  sourceRootId: "unity_mixamo_library",
  bakeStatus: "needs_bake",
  clipsOnly: true,
  tags: ["melee", "2h", "samurai", "greatsword", "mixamo"],
  notes: "Unity greatsword/sword only. No Flare hero meshes.",
  clips: {
    idle: [c("greatsword/great-sword-idle.fbx", "greatsword")],
    walk: [c("greatsword/great-sword-walk.fbx", "greatsword")],
    run: [c("greatsword/great-sword-run.fbx", "greatsword")],
    attack1: [
      c("greatsword/great-sword-slash.fbx", "greatsword"),
      c("sword/inward-slash.fbx", "sword"),
    ],
    attack2: [
      c("greatsword/great-sword-slash-2.fbx", "greatsword"),
      c("sword/outward-slash.fbx", "sword"),
    ],
    attack3: [
      c("greatsword/great-sword-high-spin-attack.fbx", "greatsword"),
      c("greatsword/great-sword-combo.fbx", "greatsword"),
    ],
    skill_a: [
      c("greatsword/great-sword-jump-attack.fbx", "greatsword"),
      c("sword/slash-advance.fbx", "sword"),
    ],
    skill_b: [c("greatsword/great-sword-overhead.fbx", "greatsword")],
    block: [c("greatsword/great-sword-blocking.fbx", "greatsword")],
    death: [c("greatsword/two-handed-sword-death.fbx", "greatsword")],
    draw: [c("greatsword/draw-great-sword-1.fbx", "greatsword")],
  },
  skills: [
    {
      skillId: "samurai_slash",
      name: "Katana Slash",
      role: "attack1",
      candidates: [c("greatsword/great-sword-slash.fbx", "greatsword")],
      blendOnLocomotion: true,
      upperBodyWeight: 0.92,
      hitWindow: [0.3, 0.55],
      rangeM: 2.8,
      cooldownS: 0.4,
    },
    {
      skillId: "samurai_spin",
      name: "High Spin",
      role: "attack3",
      candidates: [c("greatsword/great-sword-high-spin-attack.fbx", "greatsword")],
      blendOnLocomotion: false,
      hitWindow: [0.25, 0.7],
      rangeM: 3.2,
      cooldownS: 1.5,
    },
  ],
};

export const PACK_LONGBOW: AnimPackDef = {
  id: "longbow",
  label: "Longbow",
  skeleton: "bip001",
  sourceRootId: "unity_mixamo_library",
  bakeStatus: "partial",
  clipsOnly: true,
  tags: ["ranged", "bow"],
  clips: {
    idle: [c("bow/standing-idle-01.fbx", "bow")],
    walk: [c("bow/standing-walk-forward.fbx", "bow")],
    run: [c("bow/standing-run-forward.fbx", "bow")],
    walk_back: [c("bow/standing-walk-back.fbx", "bow")],
    walk_left: [c("bow/standing-walk-left.fbx", "bow")],
    walk_right: [c("bow/standing-walk-right.fbx", "bow")],
    run_back: [c("bow/standing-run-back.fbx", "bow")],
    run_left: [c("bow/standing-run-left.fbx", "bow")],
    run_right: [c("bow/standing-run-right.fbx", "bow")],
    attack1: [c("bow/shooting-arrow.fbx", "bow")],
    aim: [c("bow/standing-aim-overdraw.fbx", "bow")],
    fire: [c("bow/shooting-arrow.fbx", "bow")],
    dodge_f: [c("bow/standing-dodge-forward.fbx", "bow")],
    dodge_b: [c("bow/standing-dodge-backward.fbx", "bow")],
    dodge_l: [c("bow/standing-dodge-left.fbx", "bow")],
    dodge_r: [c("bow/standing-dodge-right.fbx", "bow")],
  },
  directional: {
    idle: "idle",
    forward: "run",
    back: "walk_back",
    left: "walk_left",
    right: "walk_right",
    forward_left: "run_left",
    forward_right: "run_right",
    back_left: "walk_back",
    back_right: "walk_back",
  },
  skills: [
    {
      skillId: "bow_shot",
      name: "Shoot",
      role: "fire",
      candidates: [c("bow/shooting-arrow.fbx", "bow")],
      blendOnLocomotion: false,
      hitWindow: [0.35, 0.5],
      rangeM: 28,
      cooldownS: 0.5,
    },
  ],
};

export const PACK_MAGIC: AnimPackDef = {
  id: "magic",
  label: "Magic",
  skeleton: "bip001",
  sourceRootId: "unity_mixamo_library",
  bakeStatus: "partial",
  clipsOnly: true,
  tags: ["magic", "caster"],
  clips: {
    idle: [c("magic-loco/standing-idle.fbx", "magic-loco")],
    walk: [c("magic-loco/standing-walk-forward.fbx", "magic-loco")],
    run: [c("magic-loco/standing-run-forward.fbx", "magic-loco")],
    cast: [c("magic/casting-spell.fbx", "magic")],
    attack1: [c("magic/standing-1h-magic-attack-01.fbx", "magic")],
    attack2: [c("magic/standing-1h-magic-attack-02.fbx", "magic")],
    skill_a: [c("magic/standing-2h-magic-area-attack-01.fbx", "magic")],
  },
  skills: [
    {
      skillId: "magic_cast",
      name: "Cast",
      role: "cast",
      candidates: [c("magic/casting-spell.fbx", "magic")],
      blendOnLocomotion: false,
      hitWindow: [0.4, 0.65],
      rangeM: 18,
      cooldownS: 0.8,
    },
  ],
};

/**
 * 1H Mace — Raidriar Infinity Blade retarget (primary) + Unity hell-slammer.
 * Pipeline: extract clips → B_MF_TO_BIP001 → strip hip-Y → bake.
 */
export const PACK_MACE_1H: AnimPackDef = {
  id: "mace_1h",
  label: "1H Mace",
  skeleton: "bip001",
  sourceRootId: "raidriar_infinity_blade",
  bakeStatus: "needs_bake",
  clipsOnly: true,
  tags: ["melee", "1h", "mace", "raidriar", "retarget"],
  notes:
    `Primary: ${RAIDRIAR_GLB} via B_MF_TO_BIP001. Secondary Unity mace/ hell-slammer. Not Raidriar mesh as hero.`,
  clips: {
    idle: [
      raidriar(RAIDRIAR_ROLE_MAP.idle),
      c(LOCO_BAKED.idle, "locomotion", 1),
    ],
    walk: [c(LOCO_BAKED.walk)],
    run: [c(LOCO_BAKED.run)],
    attack1: [
      raidriar(RAIDRIAR_ROLE_MAP.attack1),
      c("mace/hell-slammer-a.fbx", "mace", 1),
    ],
    attack2: [
      raidriar(RAIDRIAR_ROLE_MAP.attack2),
      c("mace/hell-slammer-b.fbx", "mace", 1),
    ],
    attack3: [raidriar(RAIDRIAR_ROLE_MAP.attack3)],
    skill_a: [
      raidriar(RAIDRIAR_ROLE_MAP.attack_heavy),
      raidriar(RAIDRIAR_ROLE_MAP.skill_a, 1),
      c("mace/hell-slammer-a.fbx", "mace", 2),
    ],
    skill_b: [raidriar(RAIDRIAR_ROLE_MAP.skill_b)],
    hit: [raidriar(RAIDRIAR_ROLE_MAP.hit)],
    death: [raidriar(RAIDRIAR_ROLE_MAP.death)],
  },
  skills: [
    {
      skillId: "mace_swing",
      name: "Mace Swing",
      role: "attack1",
      candidates: [raidriar(RAIDRIAR_ROLE_MAP.attack1)],
      blendOnLocomotion: true,
      upperBodyWeight: 0.95,
      hitWindow: [0.28, 0.55],
      rangeM: 2.4,
      cooldownS: 0.4,
    },
    {
      skillId: "mace_swing2",
      name: "Mace Swing 2",
      role: "attack2",
      candidates: [raidriar(RAIDRIAR_ROLE_MAP.attack2)],
      blendOnLocomotion: true,
      upperBodyWeight: 0.95,
      hitWindow: [0.28, 0.55],
      rangeM: 2.5,
      cooldownS: 0.45,
    },
    {
      skillId: "mace_slam",
      name: "Hell Slam",
      role: "skill_a",
      candidates: [
        raidriar(RAIDRIAR_ROLE_MAP.attack_heavy),
        c("mace/hell-slammer-a.fbx", "mace", 1),
      ],
      blendOnLocomotion: false,
      hitWindow: [0.35, 0.65],
      rangeM: 2.8,
      cooldownS: 1.2,
    },
    {
      skillId: "mace_slam_b",
      name: "Hell Slam B",
      role: "skill_b",
      candidates: [
        c("mace/hell-slammer-b.fbx", "mace"),
        raidriar(RAIDRIAR_ROLE_MAP.skill_b, 1),
      ],
      blendOnLocomotion: false,
      hitWindow: [0.35, 0.65],
      rangeM: 2.8,
      cooldownS: 1.4,
    },
  ],
};

/**
 * 1H Axe — Raidriar retarget (primary) + Unity greataxe combo (1H use).
 * Same source GLB; different skill cadence / range bias.
 */
export const PACK_AXE_1H: AnimPackDef = {
  id: "axe_1h",
  label: "1H Axe",
  skeleton: "bip001",
  sourceRootId: "raidriar_infinity_blade",
  bakeStatus: "needs_bake",
  clipsOnly: true,
  tags: ["melee", "1h", "axe", "raidriar", "retarget"],
  notes:
    `Primary: ${RAIDRIAR_GLB} via B_MF_TO_BIP001. Finisher uses Action Stash .008. greataxe combo as secondary bake candidate.`,
  clips: {
    idle: [
      raidriar(RAIDRIAR_ROLE_MAP.idle),
      c(LOCO_BAKED.idle, "locomotion", 1),
    ],
    walk: [c(LOCO_BAKED.walk)],
    run: [c(LOCO_BAKED.run)],
    attack1: [raidriar(RAIDRIAR_ROLE_MAP.attack1)],
    attack2: [raidriar(RAIDRIAR_ROLE_MAP.attack2)],
    attack3: [raidriar(RAIDRIAR_ROLE_MAP.attack3)],
    skill_a: [
      raidriar(RAIDRIAR_ROLE_MAP.skill_finisher),
      c("greataxe/great-axe-combo.fbx", "greataxe", 1),
    ],
    skill_b: [raidriar(RAIDRIAR_ROLE_MAP.skill_a)],
    hit: [raidriar(RAIDRIAR_ROLE_MAP.hit)],
    death: [raidriar(RAIDRIAR_ROLE_MAP.death)],
  },
  skills: [
    {
      skillId: "axe_chop",
      name: "Axe Chop",
      role: "attack1",
      candidates: [raidriar(RAIDRIAR_ROLE_MAP.attack1)],
      blendOnLocomotion: true,
      upperBodyWeight: 0.95,
      hitWindow: [0.3, 0.55],
      rangeM: 2.5,
      cooldownS: 0.4,
    },
    {
      skillId: "axe_chop2",
      name: "Axe Chop 2",
      role: "attack2",
      candidates: [raidriar(RAIDRIAR_ROLE_MAP.attack2)],
      blendOnLocomotion: true,
      upperBodyWeight: 0.95,
      hitWindow: [0.3, 0.55],
      rangeM: 2.6,
      cooldownS: 0.45,
    },
    {
      skillId: "axe_cleave",
      name: "Cleave",
      role: "attack3",
      candidates: [raidriar(RAIDRIAR_ROLE_MAP.attack3)],
      blendOnLocomotion: false,
      hitWindow: [0.28, 0.6],
      rangeM: 2.9,
      cooldownS: 0.8,
    },
    {
      skillId: "axe_finisher",
      name: "Axe Finisher",
      role: "skill_a",
      candidates: [
        raidriar(RAIDRIAR_ROLE_MAP.skill_finisher),
        c("greataxe/great-axe-combo.fbx", "greataxe", 1),
      ],
      blendOnLocomotion: false,
      hitWindow: [0.3, 0.7],
      rangeM: 3.0,
      cooldownS: 1.5,
    },
  ],
};

/**
 * OPB clip scheme reference (suffix map) — harvest from any OPB GLB including Adio.
 * Not a hero skin pack.
 */
export const PACK_OPB_CLIPS: AnimPackDef = {
  id: "opb_clips",
  label: "OPB Clip Harvest (scheme only)",
  skeleton: "opb",
  sourceRootId: "opb_adio_pistol",
  bakeStatus: "clip_harvest",
  clipsOnly: true,
  tags: ["opb", "clips_only", "harvest", "no_hero"],
  notes:
    "Suffix scheme for extracting clips from OPB GLBs. Prefer Adio for gun. Never register Flare skins as playable heroes.",
  clips: {
    idle: [c("_idle_a"), c("_idlehome_a")],
    run: [c("_run")],
    walk: [c("_run")],
    attack1: [c("_combo_a"), c("_combo_b"), c("_combo_c")],
    skill_a: [c("_skill_a")],
    skill_b: [c("_skill_b")],
    dash: [c("_dodge")],
    jump: [c("_jump")],
    land: [c("_jump_end")],
    hit: [c("_damage")],
    down: [c("_down")],
    getup: [c("_down_end")],
    flyback_loop: [c("_blownback_lp")],
    flyback_end: [c("_blownback_end")],
    stun: [c("_stun")],
    slam: [c("_slammed")],
  },
  skills: [],
};

/** KayKit library clips only — not KayKit heroes */
export const PACK_KAYKIT_CLIPS: AnimPackDef = {
  id: "kaykit_clips",
  label: "KayKit Library Clips",
  skeleton: "kaykit",
  sourceRootId: "flare_kaykit_clip_harvest",
  bakeStatus: "library_shared",
  clipsOnly: true,
  tags: ["kaykit", "clips_only", "no_hero"],
  notes: "anim/*.glb + anim-ext only. Do not use kaykit/heroes as fleet characters.",
  clips: {
    idle: [c("Idle"), c("idle")],
    walk: [c("Walking_A"), c("Walk")],
    run: [c("Running_A"), c("Run")],
    jump: [c("Jump_Start"), c("Jump")],
    dash: [c("Dodge_Forward"), c("Dodge"), c("Roll")],
    attack1: [c("1H_Melee_Attack_Chop"), c("Attack")],
    cast: [c("Spellcast_Shoot")],
    hit: [c("Hit_A"), c("Hit")],
    death: [c("Death_A"), c("Death")],
  },
  skills: [
    {
      skillId: "kaykit_dodge",
      name: "Dodge",
      role: "dash",
      candidates: [c("Dodge_Forward")],
      blendOnLocomotion: false,
      locomotionSkill: true,
      cooldownS: 0.9,
    },
  ],
};

/** @deprecated use PACK_OPB_CLIPS / PACK_PISTOL — was wrongly framed as skins/heroes */
export const PACK_OPB_NATIVE = PACK_OPB_CLIPS;
/** @deprecated use PACK_KAYKIT_CLIPS */
export const PACK_KAYKIT = PACK_KAYKIT_CLIPS;

export const ANIM_PACKS: readonly AnimPackDef[] = [
  PACK_SWORD_SHIELD,
  PACK_REACTIONS,
  PACK_BLOCK,
  PACK_PISTOL,
  PACK_CROSSBOW,
  PACK_MACE_1H,
  PACK_AXE_1H,
  PACK_DASH,
  PACK_SAMURAI,
  PACK_LONGBOW,
  PACK_MAGIC,
  PACK_OPB_CLIPS,
  PACK_KAYKIT_CLIPS,
];

export function getAnimPack(id: string | null | undefined): AnimPackDef {
  const nid = normalizeAnimPackId(id);
  const hit = ANIM_PACKS.find((p) => p.id === nid);
  if (hit) return hit;
  if (nid === "2h_melee" || nid === "greatsword") return PACK_SAMURAI;
  if (nid === "opb_native" || nid === "opb") return PACK_OPB_CLIPS;
  if (nid === "kaykit") return PACK_KAYKIT_CLIPS;
  if (nid === "gun" || nid === "handgun") return PACK_PISTOL;
  if (nid === "xbow") return PACK_CROSSBOW;
  if (nid === "mace" || nid === "1h_mace") return PACK_MACE_1H;
  if (nid === "axe" || nid === "1h_axe" || nid === "hatchet") return PACK_AXE_1H;
  return PACK_SWORD_SHIELD;
}

/** Raidriar clip inventory for debug tools */
export function raidriarClipInventory(): string[] {
  return Object.values(RAIDRIAR_ROLE_MAP);
}

export function listAnimPackIds(): string[] {
  return ANIM_PACKS.map((p) => p.id);
}

export function packsNeedingBake(): AnimPackDef[] {
  return ANIM_PACKS.filter(
    (p) => p.bakeStatus === "needs_bake" || p.bakeStatus === "partial",
  );
}

/** Packs that are clip harvest only (no hero mesh product) */
export function packsClipsOnly(): AnimPackDef[] {
  return ANIM_PACKS.filter((p) => p.clipsOnly);
}

export function resolveClipCandidates(
  packId: string,
  role: ClipRole,
): ClipCandidate[] {
  return getAnimPack(packId).clips[role] ?? [];
}

/** Merge reaction pack into any combat pack for host state machines */
export function withSharedReactions(
  packId: string,
): Partial<Record<ClipRole, ClipCandidate[]>> {
  const base = getAnimPack(packId);
  const react = PACK_REACTIONS.clips;
  return { ...react, ...base.clips };
}

export function directionalSlotFromXZ(
  x: number,
  z: number,
  deadzone = 0.12,
): DirectionalSlot {
  const mag = Math.hypot(x, z);
  if (mag < deadzone) return "idle";
  const angle = Math.atan2(x, z);
  const deg = (angle * 180) / Math.PI;
  if (deg >= -22.5 && deg < 22.5) return "forward";
  if (deg >= 22.5 && deg < 67.5) return "forward_right";
  if (deg >= 67.5 && deg < 112.5) return "right";
  if (deg >= 112.5 && deg < 157.5) return "back_right";
  if (deg >= 157.5 || deg < -157.5) return "back";
  if (deg >= -157.5 && deg < -112.5) return "back_left";
  if (deg >= -112.5 && deg < -67.5) return "left";
  return "forward_left";
}

export function clipRoleForDirection(
  packId: string,
  slot: DirectionalSlot,
): ClipRole {
  const pack = getAnimPack(packId);
  const map = pack.directional ?? DEFAULT_DIRECTIONAL;
  return map[slot] ?? (slot === "idle" ? "idle" : "run");
}

export function bakeJobsForPack(packId: string): Array<{
  packId: string;
  skillOrRole: string;
  inputRel: string;
  outputKey: string;
  rotationOnly: boolean;
}> {
  const pack = getAnimPack(packId);
  if (pack.skeleton === "opb" || pack.skeleton === "kaykit") {
    // Only Unity .fbx candidates inside hybrid packs
  }
  const jobs: Array<{
    packId: string;
    skillOrRole: string;
    inputRel: string;
    outputKey: string;
    rotationOnly: boolean;
  }> = [];
  const seen = new Set<string>();
  const add = (label: string, key: string) => {
    if (!key.endsWith(".fbx")) return;
    if (seen.has(key)) return;
    seen.add(key);
    const clean = key.replace(/\.fbx$/i, "").replace(/\\/g, "/");
    jobs.push({
      packId: pack.id,
      skillOrRole: label,
      inputRel: key,
      outputKey: `anims/baked/${pack.id}/${clean.split("/").pop()}`,
      rotationOnly: true,
    });
  };
  for (const [role, cands] of Object.entries(pack.clips)) {
    for (const cand of cands ?? []) add(role, cand.key);
  }
  for (const sk of pack.skills) {
    for (const cand of sk.candidates) add(sk.skillId, cand.key);
  }
  return jobs;
}

/** Adio inventory export for debug tools */
export function adioClipInventory(): readonly string[] {
  return ADIO_CLIPS;
}
