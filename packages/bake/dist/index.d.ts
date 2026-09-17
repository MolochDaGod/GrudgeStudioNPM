import * as _grudge_studio_character from '@grudge-studio/character';

/**
 * Bake pipeline SSOT — CLI (grudge-convert) implements; npm documents + validates jobs.
 */
type BakeTarget = "character_kit" | "anim_pack" | "weapon" | "prop" | "building" | "terrain_chunk" | "unit_mesh";
interface BakeJob {
    id: string;
    target: BakeTarget;
    /** Source path (FBX/GLB) */
    input: string;
    /** Output GLB / JSON key under R2 */
    outputKey: string;
    /** SI: force human fit for character_kit only */
    fitHumanHeight?: boolean;
    /** Always true for anim packs on grounded kits */
    rotationOnlyAnims?: boolean;
    stripPositionTracks?: boolean;
    textureWebp?: boolean;
    draco?: boolean;
    colliderBake?: boolean;
}
interface BakeQualityGate {
    id: string;
    description: string;
    required: boolean;
}
/** Gates every bake must document; CLI maps to validators */
declare const BAKE_QUALITY_GATES: BakeQualityGate[];
declare const BAKE_DEFAULTS: {
    readonly humanHeightM: 1.8;
    readonly motion: _grudge_studio_character.MotionContract;
    readonly practices: {
        readonly banMeshy: true;
        readonly banPermanentCapsules: true;
        readonly isolateMultiMeshPacks: true;
        readonly preferSameOriginBakedAnims: true;
        readonly magicByteCheckGlb: true;
        readonly cdnSsot: "https://assets.grudge-studio.com";
        readonly objectStoreSsot: "https://objectstore.grudge-studio.com/api/v1";
        readonly grudge6Equip: "child-mesh visibility on Bip001 kit, not model swap";
        readonly forgeDeployApp: "https://forge.grudge-studio.com";
        readonly npmQualitySystem: "@grudge-studio/sdk + character/units/bake/deploy";
        readonly rotationOnlyGroundedAnims: true;
        readonly groundFromBodyBoxMinY: true;
        readonly characterDeployPackage: "@grudge-studio/character";
        readonly unitsNpcPackage: "@grudge-studio/units";
        readonly bakePackage: "@grudge-studio/bake";
        readonly deployPackage: "@grudge-studio/deploy";
        readonly animPackRegistry: "getAnimPack / ANIM_PACKS / animSources";
        readonly animDebug: "buildAnimSystemDebugReport / formatAnimDebugReport";
        readonly mixamoToBip001Only: true;
        readonly noCrossSkeletonWithoutAdapter: true;
        readonly flareClipsOnly: true;
        readonly adioPistolSource: "D:/Games/Models/one_piece_bounty_rush_adio.glb";
        readonly raidriarMaceAxeSource: "D:/Games/Models/raidriar_the_god_king_-_infinity_blade.glb";
        readonly raidriarRetarget: "B_MF_TO_BIP001 / retargetRaidriarClipToBip001";
        readonly directional: "directionalSlotFromXZ + clipRoleForDirection";
        readonly blend: "LocomotionCore + skillOnLocoWeights + SKILL_BLEND_PROFILES";
        readonly weaponSkills: "combatSkillKit \u2192 toWeaponSkillPayload \u2192 weaponSkillFromPayload";
        readonly weaponSkillDocs: "packages/assets/docs/WEAPON_SKILL_BLENDS.md";
        readonly sharedReactions: "withSharedReactions(packId) + PACK_REACTIONS + combatSkillKit";
    };
    /** Local CLI path convention */
    readonly convertCli: "ObjectStore/tools/grudge-convert";
    readonly forgeEditor: "https://forge.grudge-studio.com";
};
declare function validateBakeJob(job: BakeJob): {
    ok: boolean;
    errors: string[];
};
/** Recommend flags by target */
declare function recommendedBakeFlags(target: BakeTarget): Partial<BakeJob>;
/**
 * Expand registry packs that need bake into BakeJob list.
 * Inputs are relative to unity_mixamo_library localPath when available.
 */
declare function bakeJobsFromAnimRegistry(packIds?: string[]): BakeJob[];

export { BAKE_DEFAULTS, BAKE_QUALITY_GATES, type BakeJob, type BakeQualityGate, type BakeTarget, bakeJobsFromAnimRegistry, recommendedBakeFlags, validateBakeJob };
