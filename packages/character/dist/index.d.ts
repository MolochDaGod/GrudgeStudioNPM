import { AnimPackId } from '@grudge-studio/assets';
export { AnimPackId, weaponToAnimPack } from '@grudge-studio/assets';

/** Character quality system types — used by editor, deployer, and game hosts. */

type CharacterKind = "hero" | "npc" | "unit" | "boss" | "civilian";
interface CharacterIdentity {
    id: string;
    kind: CharacterKind;
    displayName: string;
    /** grudge6 race id: human | barbarian | dwarf | elf | orc | undead */
    raceId: string;
    classId?: string;
    /** Railway character UUID when player-owned */
    characterUuid?: string;
}
interface CharacterLoadout {
    meshIds?: string[];
    gearPreset?: string;
    weapon?: string;
    animPack?: AnimPackId;
}
interface CharacterDeployOptions {
    /** Target height metres (heroes 1.8) */
    targetHeightM?: number;
    /** Ground Y for feet */
    groundY?: number;
    /** Art-forward: auto | true | false — grudge6 FBX usually needs +π/2 */
    facePlusZ?: "auto" | boolean;
    /** Strip root/hip .position tracks for uniform grounded motion */
    stripPositionTracks?: boolean;
    importPipeline?: "fbx-atlas" | "glb" | "auto";
}
interface CharacterQualityReport {
    ok: boolean;
    heightM: number | null;
    feetErrorM: number | null;
    pelvisFound: boolean;
    handRightFound: boolean;
    errors: string[];
    warnings: string[];
}
/** SI contract for all character hosts */
declare const CHARACTER_SI: {
    readonly humanHeightM: 1.8;
    readonly heightMinM: 1.55;
    readonly heightMaxM: 2.05;
    readonly feetTolM: 0.08;
    readonly capsuleRadiusM: 0.35;
    readonly capsuleHalfHeightM: 0.55;
};
/**
 * Forbidden processes — agents must not do these.
 * Note: Mixamo → Bip001 retarget is the correct pipeline; the kill is
 * playing raw mixamorig tracks on a Bip001 kit without rematch/bake.
 */
declare const CHARACTER_KILL_LIST: readonly ["pelvis_y_as_feet", "hip_position_tracks_on_grounded_kit", "unretargeted_mixamorig_on_bip001", "fit_weapon_to_1_8m", "meshy_capsule_hero", "double_art_forward_yaw", "dispose_director_before_pack_load"];
/** @deprecated alias of unretargeted_mixamorig_on_bip001 */
declare const MIXAMORIG_ON_BIP001_KILL: "unretargeted_mixamorig_on_bip001";

/**
 * Uniformed asset motion — strip hip/root position for grounded kits.
 * Duck-typed THREE.AnimationClip so three can stay a peer.
 */
interface KeyframeTrackLike {
    name: string;
}
interface AnimationClipLike {
    name: string;
    tracks: KeyframeTrackLike[];
    clone?(): AnimationClipLike;
}
/**
 * Remove .position (and optionally .scale) tracks so Bip001 kits stay
 * Box3-grounded. Keeps .quaternion / rotation tracks only.
 * This is the SSOT for "uniformed asset motion" across heroes, NPC, units.
 */
declare function stripPositionTracks<T extends AnimationClipLike>(clip: T, opts?: {
    stripScale?: boolean;
}): T;
/** Hip / root bone name patterns that must not drive world Y on grounded kits */
declare const HIP_ROOT_BONE_RE: RegExp;
/**
 * True if track looks like root/hip translation (dangerous for grounded kits).
 */
declare function isHipOrRootPositionTrack(trackName: string): boolean;
/** Strip only hip/root Y-driving position tracks; keep foot plant motion if any */
declare function stripHipRootPositionTracks<T extends AnimationClipLike>(clip: T): T;
type MotionContract = {
    /** Rotation-only clips on grounded kits */
    rotationOnly: true;
    /** Re-ground after first mixer sample of idle/attack */
    reGroundAfterSample: true;
    /** Never ground with pelvis.y = 0 */
    groundFromBodyBoxMinY: true;
};
declare const GROUNDED_MOTION_CONTRACT: MotionContract;

/** Ordered deploy steps — implement each in host or use gameopen characterDeploy */
declare const CHARACTER_DEPLOY_STEPS: readonly ["load_kit", "unify_skeletons", "box3_fit_height", "atlas_rebind", "equip_mesh_ids", "reground_after_equip", "art_forward_plus_z", "center_xz_pelvis", "ground_feet_min_y", "load_anim_pack_strip_position", "animation_director_idle", "sample_and_reground", "wire_skills_colliders", "capsule_surface_locomotion", "diagnose_quality"];
type CharacterDeployStep = (typeof CHARACTER_DEPLOY_STEPS)[number];
declare function defaultDeployOptions(partial?: CharacterDeployOptions): Required<Pick<CharacterDeployOptions, "targetHeightM" | "groundY" | "facePlusZ" | "stripPositionTracks" | "importPipeline">>;
/** Recommend art-forward yaw for grudge6 FBX kits */
declare function recommendArtForwardYaw(importPipeline: CharacterDeployOptions["importPipeline"], raceId?: string): number;
declare function evaluateHeightQuality(heightM: number | null): {
    ok: boolean;
    error?: string;
};
declare function evaluateFeetQuality(feetErrorM: number | null): {
    ok: boolean;
    error?: string;
};
declare function buildQualityReport(input: {
    heightM: number | null;
    feetErrorM: number | null;
    pelvisFound: boolean;
    handRightFound: boolean;
    extraErrors?: string[];
    extraWarnings?: string[];
}): CharacterQualityReport;
declare const MOTION: MotionContract;

/**
 * Skeleton SSOT — Bip001 (grudge6) production target + Mixamo source naming.
 *
 * Canonical retarget direction (bake / runtime):
 *   Mixamo package clips (mixamorig*)  →  Bip001 skeleton (grudge6 heroes)
 *
 * Baked fleet clips under /anims/baked are already Bip001 rotation-only.
 * This map is for importing raw Mixamo packs and rematching track names
 * onto a Bip001 rig — not the reverse.
 */
type SkeletonKind = "bip001" | "mixamo" | "b_mf" | "opb" | "unknown";
/** Canonical grudge6 bone names (spaces as in Unity FBX export). */
declare const BIP001_BONES: {
    readonly root: "Bip001";
    readonly pelvis: "Bip001 Pelvis";
    readonly spine: "Bip001 Spine";
    readonly spine1: "Bip001 Spine1";
    readonly spine2: "Bip001 Spine2";
    readonly neck: "Bip001 Neck";
    readonly head: "Bip001 Head";
    readonly lThigh: "Bip001 L Thigh";
    readonly lCalf: "Bip001 L Calf";
    readonly lFoot: "Bip001 L Foot";
    readonly rThigh: "Bip001 R Thigh";
    readonly rCalf: "Bip001 R Calf";
    readonly rFoot: "Bip001 R Foot";
    readonly lClavicle: "Bip001 L Clavicle";
    readonly lUpperArm: "Bip001 L UpperArm";
    readonly lForearm: "Bip001 L Forearm";
    readonly lHand: "Bip001 L Hand";
    readonly rClavicle: "Bip001 R Clavicle";
    readonly rUpperArm: "Bip001 R UpperArm";
    readonly rForearm: "Bip001 R Forearm";
    readonly rHand: "Bip001 R Hand";
    /** Equip containers (may be Object3D, not Bone) */
    readonly rHandContainer: "R_hand_container";
    readonly lHandContainer: "L_hand_container";
    readonly lShieldContainer: "L_shield_container";
};
declare const MIXAMO_BONES: {
    readonly hips: "mixamorigHips";
    readonly spine: "mixamorigSpine";
    readonly leftUpLeg: "mixamorigLeftUpLeg";
    readonly leftLeg: "mixamorigLeftLeg";
    readonly leftFoot: "mixamorigLeftFoot";
    readonly rightUpLeg: "mixamorigRightUpLeg";
    readonly rightLeg: "mixamorigRightLeg";
    readonly rightFoot: "mixamorigRightFoot";
    readonly leftArm: "mixamorigLeftArm";
    readonly leftForeArm: "mixamorigLeftForeArm";
    readonly leftHand: "mixamorigLeftHand";
    readonly rightArm: "mixamorigRightArm";
    readonly rightForeArm: "mixamorigRightForeArm";
    readonly rightHand: "mixamorigRightHand";
};
/**
 * Infinity Blade / Raidriar God King bones (Sketchfab export).
 * Trailing `_N` indices vary; match via normalizeBoneToken.
 */
declare const B_MF_BONES: {
    readonly root: "b_MF_Root_38";
    readonly pelvis: "b_MF_Pelvis_37";
    readonly spine1: "b_MF_Spine_01_36";
    readonly spine2: "b_MF_Spine_02_35";
    readonly spine3: "b_MF_Spine_03_34";
    readonly neck: "b_MF_Neck_9";
    readonly head: "b_MF_Head_8";
    readonly lThigh: "b_MF_Thigh_L_7";
    readonly lCalf: "b_MF_Calf_L_6";
    readonly lFoot: "b_MF_Foot_L_5";
    readonly rThigh: "b_MF_Thigh_R_4";
    readonly rCalf: "b_MF_Calf_R_3";
    readonly rFoot: "b_MF_Foot_R_2";
    readonly lClavicle: "b_MF_Clavicle_L_21";
    readonly lUpperArm: "b_MF_UpperArm_L_20";
    readonly lForearm: "b_MF_Forearm_L_19";
    readonly lHand: "b_MF_Hand_L_18";
    readonly lWeapon: "b_MF_Weapon_L_17";
    readonly rClavicle: "b_MF_Clavicle_R_33";
    readonly rUpperArm: "b_MF_UpperArm_R_32";
    readonly rForearm: "b_MF_Forearm_R_31";
    readonly rHand: "b_MF_Hand_R_30";
    readonly rWeapon: "b_MF_Weapon_R_29";
};
/**
 * Semantic bone pairs for **Mixamo → Bip001** retarget.
 * `mixamo` = source track bone; `bip` = production grudge6 target bone.
 * (Alias `BIP001_MIXAMO_MAP` kept for older imports.)
 */
declare const MIXAMO_TO_BIP001: ReadonlyArray<{
    mixamo: string;
    bip: string;
}>;
/**
 * **Raidriar / Infinity Blade (b_MF_*) → Bip001** retarget pairs.
 * Strip exporter indices; rematchTrackName uses normalizeBoneToken.
 */
declare const B_MF_TO_BIP001: ReadonlyArray<{
    source: string;
    bip: string;
}>;
/** @deprecated use MIXAMO_TO_BIP001 — same pairs, bip-first field order */
declare const BIP001_MIXAMO_MAP: ReadonlyArray<{
    bip: string;
    mixamo: string;
}>;
/** Normalize bone token for fuzzy match */
declare function normalizeBoneToken(name: string): string;
/**
 * Remap one track name onto `availableBoneNames` (usually the Bip001 rig).
 * Prefer exact match → fuzzy token → **Mixamo source → Bip001 target**.
 *
 * Production call: rematchTrackName("mixamorigLeftUpLeg.quaternion", bip001Bones)
 * → "Bip001 L Thigh.quaternion"
 */
declare function rematchTrackName(trackName: string, availableBoneNames: string[]): string;
/**
 * Retarget a Mixamo / Raidriar (b_MF) / mixed clip onto a Bip001 bone list.
 * Returns how many track names changed. Host should also strip hip-Y
 * position tracks after rematch (see stripHipRootPositionTracks).
 */
declare function rematchClipTracks(clip: {
    tracks: Array<{
        name: string;
    }>;
}, availableBoneNames: string[]): number;
/** Alias: explicit Mixamo package → Bip001 production */
declare const retargetMixamoClipToBip001: typeof rematchClipTracks;
/** Alias: Raidriar Infinity Blade b_MF → Bip001 */
declare const retargetRaidriarClipToBip001: typeof rematchClipTracks;
declare function detectSkeletonKind(boneNames: string[]): SkeletonKind;
/** Collect bone names from a duck-typed SkinnedMesh / Object3D tree */
declare function collectBoneNames(root: {
    traverse?: (fn: (o: {
        isBone?: boolean;
        name?: string;
        type?: string;
    }) => void) => void;
    skeleton?: {
        bones?: Array<{
            name: string;
        }>;
    };
}): string[];
/** Find first matching attach bone in scene graph (duck-typed) */
declare function findAttachBone(root: {
    getObjectByName?: (n: string) => unknown;
    traverse?: (fn: (o: {
        name?: string;
    }) => void) => void;
}, candidates: readonly string[]): unknown | null;
/** Hand / weapon attach priority for projectiles and colliders */
declare const WEAPON_ATTACH_BONES: readonly ["R_hand_container", "Bip001 R Hand", "Bip001_R_Hand", "mixamorigRightHand", "b_MF_Weapon_R_29", "b_MF_Hand_R_30"];
declare const SHIELD_ATTACH_BONES: readonly ["L_shield_container", "L_hand_container", "Bip001 L Hand", "mixamorigLeftHand"];
interface SkeletonContract {
    kind: SkeletonKind;
    /** grudge6 production always Bip001 */
    requireBip001ForGrudge6: true;
    hipBoneCandidates: string[];
    groundFromBodyBoxNotHip: true;
}
declare const SKELETON_CONTRACT: SkeletonContract;
/** Quality report for skeleton readiness */
declare function skeletonQualityReport(boneNames: string[]): {
    kind: SkeletonKind;
    ok: boolean;
    hasHips: boolean;
    hasRightHand: boolean;
    missingCritical: string[];
};

/**
 * Character / combat state machine — pure data for hosts + editor.
 * Pair with LocomotionCore for anim; UUID nodes for deploy graph.
 */
type LocomotionState = "idle" | "walk" | "run" | "sprint" | "jump" | "fall" | "land" | "swim" | "climb" | "mount" | "boat";
type CombatState = "ready" | "windup" | "active" | "recovery" | "block" | "parry" | "hitstun" | "knockback" | "flyback" | "down" | "getup" | "stun" | "dead";
type SurfaceState = "ground" | "wade" | "swim" | "climb" | "wallRun" | "mount" | "boat" | "fly";
interface CharacterRuntimeState {
    /** Stable entity uuid (deploy graph / net) */
    uuid?: string;
    locomotion: LocomotionState;
    combat: CombatState;
    surface: SurfaceState;
    /** Active weapon skill id or null */
    skillId: string | null;
    /** Anim pack id */
    animPack: string;
    /** 0–1 move intent */
    moveSpeed01: number;
    sprinting: boolean;
    /** Weapon collider should be live */
    weaponColliderActive: boolean;
    /** In skill hit window */
    inHitWindow: boolean;
    /** Skill progress 0–1 */
    skillProgress: number;
    /** Facing yaw radians */
    yaw: number;
}
declare function createDefaultCharacterState(partial?: Partial<CharacterRuntimeState>): CharacterRuntimeState;
/** Derive locomotion label from speed */
declare function locomotionFromSpeed(speed01: number, sprinting: boolean): LocomotionState;
/** Combat phase from skill progress + hit window */
declare function combatFromSkillProgress(busy: boolean, progress: number, hitWindow?: [number, number]): CombatState;
/**
 * Snapshot from LocomotionCore-like runtime (duck-typed to avoid package cycle).
 * Call after loco.update(dt) each frame.
 */
interface LocoSkillSnapshot {
    busy: boolean;
    skillId: string | null;
    progress: number;
    inHitWindow: boolean;
    weaponColliderActive: boolean;
    gait?: LocomotionState | string;
}
declare function applyLocoSnapshot(state: CharacterRuntimeState, snap: LocoSkillSnapshot, move: {
    speed01: number;
    sprinting: boolean;
}): CharacterRuntimeState;
interface StateTransitionEvent {
    type: "move" | "stop" | "sprint" | "skill_start" | "skill_end" | "skill_tick" | "hit" | "knockback" | "flyback" | "down" | "getup" | "stun" | "block" | "parry" | "die" | "surface" | "anim_pack";
    payload?: Record<string, unknown>;
}
/**
 * Tiny reducer for UI / net sync — host applies to CharacterRuntimeState.
 */
declare function reduceCharacterState(state: CharacterRuntimeState, ev: StateTransitionEvent): CharacterRuntimeState;
/** JSON-safe patch for multiplayer / save */
declare function stateToNetPatch(state: CharacterRuntimeState): Record<string, unknown>;

export { type AnimationClipLike, BIP001_BONES, BIP001_MIXAMO_MAP, B_MF_BONES, B_MF_TO_BIP001, CHARACTER_DEPLOY_STEPS, CHARACTER_KILL_LIST, CHARACTER_SI, type CharacterDeployOptions, type CharacterDeployStep, type CharacterIdentity, type CharacterKind, type CharacterLoadout, type CharacterQualityReport, type CharacterRuntimeState, type CombatState, GROUNDED_MOTION_CONTRACT, HIP_ROOT_BONE_RE, type KeyframeTrackLike, type LocoSkillSnapshot, type LocomotionState, MIXAMORIG_ON_BIP001_KILL, MIXAMO_BONES, MIXAMO_TO_BIP001, MOTION, type MotionContract, SHIELD_ATTACH_BONES, SKELETON_CONTRACT, type SkeletonContract, type SkeletonKind, type StateTransitionEvent, type SurfaceState, WEAPON_ATTACH_BONES, applyLocoSnapshot, buildQualityReport, collectBoneNames, combatFromSkillProgress, createDefaultCharacterState, defaultDeployOptions, detectSkeletonKind, evaluateFeetQuality, evaluateHeightQuality, findAttachBone, isHipOrRootPositionTrack, locomotionFromSpeed, normalizeBoneToken, recommendArtForwardYaw, reduceCharacterState, rematchClipTracks, rematchTrackName, retargetMixamoClipToBip001, retargetRaidriarClipToBip001, skeletonQualityReport, stateToNetPatch, stripHipRootPositionTracks, stripPositionTracks };
