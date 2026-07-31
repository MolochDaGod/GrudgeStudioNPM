/**
 * Debug, directional, blending, and weapon-skill practices — agent + host SSOT.
 */

export const ANIM_DEBUG_PRACTICES = {
  /** Always log pack + skeleton + bakeStatus on character spawn */
  logPackOnSpawn: true,
  /** Prefer buildAnimSystemDebugReport() in /debug overlay */
  systemReport: "buildAnimSystemDebugReport | formatAnimDebugReport",
  /** Per-frame optional (dev only): layer weights + skill progress */
  frameHud: "formatLayerWeights(loco.layerWeights) + skillState",
  /** On skill fire: blendPracticeHint(...) */
  onSkill: "blendPracticeHint",
  /** Never silent-fail missing clips — list missingRoles() */
  missingClips: "missingRoles(packId, loaded)",
  /** Catalog hotbar skills + blends */
  skillCatalog: "formatWeaponSkillAnimCatalog(packId?) | describeSkillBlend",
} as const;

export const ANIM_DIRECTIONAL_PRACTICES = {
  /** Map stick/WASD to xz then directionalSlotFromXZ */
  input: "directionalSlotFromXZ(x, z) → clipRoleForDirection(pack, slot)",
  /** Prefer continuous gaitBlendFromSpeed when only forward speed */
  forwardOnly: "gaitBlendFromSpeed(speed01, sprinting) on idle/walk/run/sprint",
  /** When pack has 4/8-way clips (longbow), use directional roles */
  eightWay: "walk_left/right/back + run_* from pack.clips",
  /** Strafe: do not mirror left onto right without checking root facing */
  noBlindMirror: true,
  deadzone: 0.12,
} as const;

export const ANIM_BLEND_PRACTICES = {
  /** Base layer always locomotion */
  baseLayer: "locomotion",
  /** Use SKILL_BLEND_PROFILES — do not invent retain numbers */
  profiles: "SKILL_BLEND_PROFILES / resolveSkillBlendProfile",
  /** Light melee while moving */
  melee_upper: "upper 0.95, allowLocomotion true, skillLocoRetain 0.55",
  /** Heavy / plant */
  melee_full: "upper 1, allowLocomotion false, retain ~0.12",
  /** Dash/roll/slide */
  mobility: "locomotionSkill, full body, fadeIn 0.05",
  /** Block hold can walk */
  block: "upper 0.85, retain 0.65",
  /** Reactions interrupt everything */
  reaction: "full body freeze, reaction: true",
  /** Runtime weights */
  weaponOnLoco: "skillOnLocoWeights / previewSkillLayerWeights",
  fadeInS: 0.08,
  fadeOutS: 0.12,
  hitWindowDefault: [0.28, 0.55] as [number, number],
  continuousGait: true,
  boneMasks: "BONE_MASK_GROUPS in @grudge-studio/animator",
  docs: "packages/assets/docs/WEAPON_SKILL_BLENDS.md",
} as const;

export const ANIM_WEAPON_SKILL_PRACTICES = {
  /** Kit = weapon pack + reactions + block + dash */
  kit: "combatSkillKit(weaponPackId)",
  /** Payload → LocomotionCore */
  play: "toWeaponSkillPayload → weaponSkillFromPayload(clip, payload) → playWeaponSkill",
  /** Collider only in hit window */
  collider: "skillState.inHitWindow && skillState.weaponColliderActive",
  /** State machine */
  state: "applyLocoSnapshot + combat states knockback/flyback/getup/block/parry",
  /** Pack skill fields */
  skillDef: "SkillClipDef: candidates, blendOnLocomotion, hitWindow, rangeM, cooldownS",
  /** Factories */
  factories:
    "makeMeleeSkill | makeRangedSkill | makeMobilitySkill | makeBlockSkill | makeReactionSkill | makeFinisherSkill",
} as const;

export const ANIM_PIPELINE_PRACTICES = {
  bip001Production:
    "Mixamo/Unity FBX → MIXAMO_TO_BIP001 → strip hip position → baked JSON",
  /** Flare / OPB / KayKit = clips only — never ship as fleet heroes */
  clipsOnlyFromFlare: true,
  noFlareHeroes: "Do not use Flare skins or KayKit heroes as playable characters",
  opb: "Harvest AnimationClips from OPB GLBs (prefer Adio for pistol). Suffix scheme.",
  adioPistol: "D:/Games/Models/one_piece_bounty_rush_adio.glb → pistol + crossbow packs",
  raidriarMaceAxe:
    "D:/Games/Models/raidriar_the_god_king_-_infinity_blade.glb → B_MF_TO_BIP001 → mace_1h + axe_1h",
  kaykit: "Harvest anim/*.glb libraries only — ignore heroes/",
  reactions: "Unity reactions/ + Adio blownback/down/getup → PACK_REACTIONS",
  blocks: "Unity block/ → PACK_BLOCK",
  kill: "unretargeted_mixamorig_on_bip001",
  sameOriginFirst: true,
} as const;

/** Checklist for PR / QA */
export function animQualityChecklist(): string[] {
  return [
    "[ ] Pack id from getAnimPack / normalizeAnimPackId",
    "[ ] Skeleton matches pipeline (bip001 vs opb vs kaykit / b_mf retarget)",
    "[ ] Flare/OPB/KayKit/Raidriar used for clips only — no hero product",
    "[ ] Pistol/crossbow use Adio clip harvest",
    "[ ] Mace/axe use Raidriar + B_MF_TO_BIP001",
    "[ ] combatSkillKit includes reactions + block + dash",
    "[ ] Each skill has blend kind (SKILL_BLEND_PROFILES)",
    "[ ] Hit windows drive weapon colliders only",
    "[ ] LocomotionCore base gait + playWeaponSkill overlays",
    "[ ] Directional: directionalSlotFromXZ or gaitBlendFromSpeed",
    "[ ] Debug: formatWeaponSkillAnimCatalog + formatAnimDebugReport",
    "[ ] needs_bake packs not loaded as raw FBX on Bip001",
    "[ ] Same-origin baked URL tried first",
  ];
}
