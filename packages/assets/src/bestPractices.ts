/** Hard rules for agents and games consuming Grudge assets. */
export const ASSET_BEST_PRACTICES = {
  banMeshy: true,
  banPermanentCapsules: true,
  isolateMultiMeshPacks: true,
  preferSameOriginBakedAnims: true,
  magicByteCheckGlb: true,
  cdnSsot: "https://assets.grudge-studio.com",
  objectStoreSsot: "https://objectstore.grudge-studio.com/api/v1",
  grudge6Equip: "child-mesh visibility on Bip001 kit, not model swap",
  forgeDeployApp: "https://forge.grudge-studio.com",
  /** Quality SSOT monorepo */
  npmQualitySystem: "@grudge-studio/sdk + character/units/bake/deploy",
  /** Uniformed motion: strip hip/root .position on grounded kits */
  rotationOnlyGroundedAnims: true,
  /** Ground from skinned Box3 min.y — never pelvis.y */
  groundFromBodyBoxMinY: true,
  characterDeployPackage: "@grudge-studio/character",
  unitsNpcPackage: "@grudge-studio/units",
  bakePackage: "@grudge-studio/bake",
  deployPackage: "@grudge-studio/deploy",
  /** Anim asset management */
  animPackRegistry: "getAnimPack / ANIM_PACKS / animSources",
  animDebug: "buildAnimSystemDebugReport / formatAnimDebugReport",
  mixamoToBip001Only: true,
  noCrossSkeletonWithoutAdapter: true,
  /** Never promote Flare skins / KayKit heroes to fleet characters */
  flareClipsOnly: true,
  adioPistolSource: "D:/Games/Models/one_piece_bounty_rush_adio.glb",
  raidriarMaceAxeSource:
    "D:/Games/Models/raidriar_the_god_king_-_infinity_blade.glb",
  raidriarRetarget: "B_MF_TO_BIP001 / retargetRaidriarClipToBip001",
  directional: "directionalSlotFromXZ + clipRoleForDirection",
  blend: "LocomotionCore + skillOnLocoWeights + SKILL_BLEND_PROFILES",
  weaponSkills: "combatSkillKit → toWeaponSkillPayload → weaponSkillFromPayload",
  weaponSkillDocs: "packages/assets/docs/WEAPON_SKILL_BLENDS.md",
  sharedReactions: "withSharedReactions(packId) + PACK_REACTIONS + combatSkillKit",
} as const;
