/**
 * Animation source roots — provenance for bake, debug, and fleet loaders.
 *
 * Policy:
 *   - Flare OPB / KayKit GLBs = **animation harvest only** (no hero/character product).
 *   - Production heroes stay grudge6 Bip001 kits.
 *   - Adio OPB GLB = pistol / crossbow / gunfight clip source.
 *   - Unity Mixamo FBX = knockback, block, get-up, dash, weapon packs → Bip001 bake.
 */

export type AnimPipelineId =
  | "unity_mixamo_to_bip001"
  | "raidriar_bmf_to_bip001"
  | "opb_clips_only"
  | "kaykit_clips_only"
  | "baked_bip001";

export type SkeletonRuntime =
  | "bip001"
  | "mixamo"
  | "b_mf"
  | "opb"
  | "kaykit"
  | "unknown";

export interface AnimSourceRoot {
  id: string;
  label: string;
  pipeline: AnimPipelineId;
  skeleton: SkeletonRuntime;
  /** Absolute or machine-local path (dev/debug only) */
  localPath?: string;
  pathHint: string;
  output: "fbx" | "glb_embedded" | "baked_json" | "glb_library";
  /** If true: extract AnimationClips only — do not ship mesh as hero */
  clipsOnly: boolean;
  notes: string;
}

/** Canonical roots discovered on the studio machine / fleet */
export const ANIM_SOURCE_ROOTS: readonly AnimSourceRoot[] = [
  {
    id: "unity_mixamo_library",
    label: "Original Unity / Mixamo animation library",
    pipeline: "unity_mixamo_to_bip001",
    skeleton: "mixamo",
    localPath:
      "C:\\Users\\nugye\\Documents\\animator\\animator\\public\\anim\\animations",
    pathHint: "Documents/animator/.../public/anim/animations",
    output: "fbx",
    clipsOnly: true,
    notes:
      "~252 FBX: sword, greatsword, bow, pistol, block, reactions (fly-back, get-up, knock), extra dash. Retarget Mixamo→Bip001.",
  },
  {
    id: "opb_adio_pistol",
    label: "OPB Adio — pistol / crossbow / gunfight clips",
    pipeline: "opb_clips_only",
    skeleton: "opb",
    localPath: "D:\\Games\\Models\\one_piece_bounty_rush_adio.glb",
    pathHint: "D:/Games/Models/one_piece_bounty_rush_adio.glb",
    output: "glb_embedded",
    clipsOnly: true,
    notes:
      "Primary gunfight source. 30 clips: idle/run/combo/skill/dodge/jump/damage/down/blownback/stun. r_weapon_joint for pistols. Harvest clips only — not a fleet hero mesh.",
  },
  {
    id: "raidriar_infinity_blade",
    label: "Raidriar God King (Infinity Blade) — 1H mace / axe retarget",
    pipeline: "raidriar_bmf_to_bip001",
    skeleton: "b_mf",
    localPath: "D:\\Games\\Models\\raidriar_the_god_king_-_infinity_blade.glb",
    pathHint: "D:/Games/Models/raidriar_the_god_king_-_infinity_blade.glb",
    output: "glb_embedded",
    clipsOnly: true,
    notes:
      "10 Action Stash clips on b_MF_* skeleton. Retarget B_MF_TO_BIP001 for grudge6. Use for 1H mace + 1H axe attacks. Weapon bones: b_MF_Weapon_R/L. Not a fleet hero mesh.",
  },
  {
    id: "flare_opb_clip_harvest",
    label: "Flare OPB GLBs — clip harvest only (no heroes)",
    pipeline: "opb_clips_only",
    skeleton: "opb",
    localPath:
      "F:\\GitHub\\Flare-Boss-Arena\\Flare-Boss-Arena\\artifacts\\grudge-game\\public\\models\\skins",
    pathHint: "Flare skins + attached_assets OPB GLBs",
    output: "glb_embedded",
    clipsOnly: true,
    notes:
      "Do NOT use as playable heroes. Extract _idle/_run/_combo/_skill/_damage/_dodge and reaction-like clips; retarget or play on matching OPB-rig adapters only. Prefer Adio for pistol.",
  },
  {
    id: "flare_kaykit_clip_harvest",
    label: "Flare KayKit anim libraries — clips only",
    pipeline: "kaykit_clips_only",
    skeleton: "kaykit",
    localPath:
      "F:\\GitHub\\Flare-Boss-Arena\\Flare-Boss-Arena\\artifacts\\grudge-game\\public\\models\\kaykit",
    pathHint: "kaykit/anim/*.glb + anim-ext/* (not heroes/)",
    output: "glb_library",
    clipsOnly: true,
    notes:
      "Harvest movement/combat/dodge clips from anim/ and anim-ext/. Ignore heroes/*.glb as character product.",
  },
  {
    id: "fleet_baked_bip001",
    label: "Fleet baked Bip001 JSON clips",
    pipeline: "baked_bip001",
    skeleton: "bip001",
    pathHint: "/anims/baked + assets.grudge-studio.com/anims/baked",
    output: "baked_json",
    clipsOnly: true,
    notes: "Production SSOT for grudge6. Prefer same-origin first.",
  },
] as const;

/** Adio clip name suffixes (pl_adio_orig01_*) */
export const ADIO_CLIP_SUFFIX = {
  idle: ["_idle_a", "_idlehome_a"],
  run: ["_run"],
  attack: ["_combo_a", "_combo_b", "_combo_c"],
  skill: ["_skill_a", "_skill_b"],
  dodge: ["_dodge"],
  jump: ["_jump"],
  jumpLp: ["_jump_lp"],
  land: ["_jump_end"],
  damage: ["_damage"],
  down: ["_down"],
  getup: ["_down_end"],
  blownback: ["_blownback_lp"],
  blownbackEnd: ["_blownback_end"],
  slam: ["_slammed"],
  stun: ["_stun"],
  boost: ["_boost"],
  shock: ["_electric_shock"],
} as const;

/** Full Adio clip names from GLB inventory (2026) */
export const ADIO_CLIPS = [
  "pl_adio_orig01_idle_a",
  "pl_adio_orig01_skill_a",
  "pl_adio_orig01_skill_b",
  "pl_adio_orig01_flagget",
  "pl_adio_orig01_boost",
  "pl_adio_orig01_dodge",
  "pl_adio_orig01_jump",
  "pl_adio_orig01_jump_lp",
  "pl_adio_orig01_jump_end",
  "pl_adio_orig01_damage",
  "pl_adio_orig01_flagget_lp",
  "pl_adio_orig01_flagget_end",
  "pl_adio_orig01_down",
  "pl_adio_orig01_down_end",
  "pl_adio_orig01_slammed",
  "pl_adio_orig01_opening",
  "pl_adio_orig01_victory",
  "pl_adio_orig01_lose",
  "pl_adio_orig01_stun",
  "pl_adio_orig01_idlehome_a",
  "pl_adio_orig01_blownback_lp",
  "pl_adio_orig01_blownback_end",
  "pl_adio_orig01_electric_shock",
  "pl_adio_orig01_shake",
  "pl_adio_orig01_run",
  "pl_adio_orig01_combo_a",
  "pl_adio_orig01_combo_b",
  "pl_adio_orig01_combo_c",
  "pl_adio_orig01_victory_lp",
  "pl_adio_orig01_lose_lp",
] as const;

export const ADIO_WEAPON_JOINTS = [
  "r_weapon_joint_049",
  "l_weapon_joint_042",
  "r_hand_weapon_01",
  "r_hand_weapon_02",
  "l_hand_weapon_01",
  "l_hand_weapon_02",
] as const;

export function getAnimSource(id: string): AnimSourceRoot | undefined {
  return ANIM_SOURCE_ROOTS.find((s) => s.id === id);
}

export function sourcesByPipeline(pipeline: AnimPipelineId): AnimSourceRoot[] {
  return ANIM_SOURCE_ROOTS.filter((s) => s.pipeline === pipeline);
}

/** Only sources marked clipsOnly (should be all Flare/OPB/KayKit harvest) */
export function clipHarvestSources(): AnimSourceRoot[] {
  return ANIM_SOURCE_ROOTS.filter((s) => s.clipsOnly);
}

export const UNITY_MIXAMO_FOLDERS = [
  "block",
  "bow",
  "climb",
  "combo",
  "extra",
  "farming",
  "gestures",
  "greataxe",
  "greatsword",
  "knife",
  "mace",
  "magic",
  "magic-loco",
  "pistol",
  "reactions",
  "rifle",
  "spear",
  "striker",
  "swim",
  "sword",
] as const;

export type UnityMixamoFolder = (typeof UNITY_MIXAMO_FOLDERS)[number];

/**
 * Raidriar Action Stash clips (Sketchfab export names are opaque).
 * Role labels are **provisional** for pack wiring — re-label after studio preview.
 */
export const RAIDRIAR_GLB =
  "D:/Games/Models/raidriar_the_god_king_-_infinity_blade.glb";

export const RAIDRIAR_CLIPS = [
  "[Action Stash]",
  "[Action Stash].001",
  "[Action Stash].002",
  "[Action Stash].003",
  "[Action Stash].004",
  "[Action Stash].005",
  "[Action Stash].006",
  "[Action Stash].007",
  "[Action Stash].008",
  "[Action Stash].009",
] as const;

/** Provisional role map — confirm in Forge / lab viewer */
export const RAIDRIAR_ROLE_MAP = {
  /** Often base / combat idle */
  idle: "[Action Stash]",
  attack1: "[Action Stash].001",
  attack2: "[Action Stash].002",
  attack3: "[Action Stash].003",
  skill_a: "[Action Stash].004",
  skill_b: "[Action Stash].005",
  /** Heavy / slam style — good 1H mace */
  attack_heavy: "[Action Stash].006",
  hit: "[Action Stash].007",
  /** Finisher / spin — good 1H axe */
  skill_finisher: "[Action Stash].008",
  death: "[Action Stash].009",
} as const;

export const RAIDRIAR_WEAPON_BONES = [
  "b_MF_Weapon_R_29",
  "b_MF_Hand_R_30",
  "b_MF_Weapon_L_17",
  "b_MF_Hand_L_18",
] as const;
