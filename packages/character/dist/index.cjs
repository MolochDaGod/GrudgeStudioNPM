"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BIP001_BONES: () => BIP001_BONES,
  BIP001_MIXAMO_MAP: () => BIP001_MIXAMO_MAP,
  B_MF_BONES: () => B_MF_BONES,
  B_MF_TO_BIP001: () => B_MF_TO_BIP001,
  CHARACTER_DEPLOY_STEPS: () => CHARACTER_DEPLOY_STEPS,
  CHARACTER_KILL_LIST: () => CHARACTER_KILL_LIST,
  CHARACTER_SI: () => CHARACTER_SI,
  GROUNDED_MOTION_CONTRACT: () => GROUNDED_MOTION_CONTRACT,
  HIP_ROOT_BONE_RE: () => HIP_ROOT_BONE_RE,
  MIXAMORIG_ON_BIP001_KILL: () => MIXAMORIG_ON_BIP001_KILL,
  MIXAMO_BONES: () => MIXAMO_BONES,
  MIXAMO_TO_BIP001: () => MIXAMO_TO_BIP001,
  MOTION: () => MOTION,
  SHIELD_ATTACH_BONES: () => SHIELD_ATTACH_BONES,
  SKELETON_CONTRACT: () => SKELETON_CONTRACT,
  WEAPON_ATTACH_BONES: () => WEAPON_ATTACH_BONES,
  applyLocoSnapshot: () => applyLocoSnapshot,
  buildQualityReport: () => buildQualityReport,
  collectBoneNames: () => collectBoneNames,
  combatFromSkillProgress: () => combatFromSkillProgress,
  createDefaultCharacterState: () => createDefaultCharacterState,
  defaultDeployOptions: () => defaultDeployOptions,
  detectSkeletonKind: () => detectSkeletonKind,
  evaluateFeetQuality: () => evaluateFeetQuality,
  evaluateHeightQuality: () => evaluateHeightQuality,
  findAttachBone: () => findAttachBone,
  isHipOrRootPositionTrack: () => isHipOrRootPositionTrack,
  locomotionFromSpeed: () => locomotionFromSpeed,
  normalizeBoneToken: () => normalizeBoneToken,
  recommendArtForwardYaw: () => recommendArtForwardYaw,
  reduceCharacterState: () => reduceCharacterState,
  rematchClipTracks: () => rematchClipTracks,
  rematchTrackName: () => rematchTrackName,
  retargetMixamoClipToBip001: () => retargetMixamoClipToBip001,
  retargetRaidriarClipToBip001: () => retargetRaidriarClipToBip001,
  skeletonQualityReport: () => skeletonQualityReport,
  stateToNetPatch: () => stateToNetPatch,
  stripHipRootPositionTracks: () => stripHipRootPositionTracks,
  stripPositionTracks: () => stripPositionTracks,
  weaponToAnimPack: () => import_assets.weaponToAnimPack
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var CHARACTER_SI = {
  humanHeightM: 1.8,
  heightMinM: 1.55,
  heightMaxM: 2.05,
  feetTolM: 0.08,
  capsuleRadiusM: 0.35,
  capsuleHalfHeightM: 0.55
};
var CHARACTER_KILL_LIST = [
  "pelvis_y_as_feet",
  "hip_position_tracks_on_grounded_kit",
  /** raw mixamorig tracks on Bip001 without retarget (use MIXAMO_TO_BIP001 bake) */
  "unretargeted_mixamorig_on_bip001",
  "fit_weapon_to_1_8m",
  "meshy_capsule_hero",
  "double_art_forward_yaw",
  "dispose_director_before_pack_load"
];
var MIXAMORIG_ON_BIP001_KILL = "unretargeted_mixamorig_on_bip001";

// src/motion.ts
function stripPositionTracks(clip, opts = {}) {
  const stripScale = opts.stripScale ?? true;
  const next = typeof clip.clone === "function" ? clip.clone() : { ...clip, tracks: [...clip.tracks] };
  next.tracks = clip.tracks.filter((t) => {
    const n = t.name || "";
    if (/\.position$/i.test(n)) return false;
    if (stripScale && /\.scale$/i.test(n)) return false;
    return true;
  });
  return next;
}
var HIP_ROOT_BONE_RE = /(bip001(\s|_)?(pelvis|hip)?|hips|mixamorig:?hips|root|armature)/i;
function isHipOrRootPositionTrack(trackName) {
  if (!/\.position$/i.test(trackName)) return false;
  const bone = trackName.split(".")[0] || "";
  return HIP_ROOT_BONE_RE.test(bone) || /^(root|hips|pelvis)$/i.test(bone);
}
function stripHipRootPositionTracks(clip) {
  const next = typeof clip.clone === "function" ? clip.clone() : { ...clip, tracks: [...clip.tracks] };
  next.tracks = clip.tracks.filter((t) => !isHipOrRootPositionTrack(t.name || ""));
  return next;
}
var GROUNDED_MOTION_CONTRACT = {
  rotationOnly: true,
  reGroundAfterSample: true,
  groundFromBodyBoxMinY: true
};

// src/deploy.ts
var import_assets = require("@grudge-studio/assets");
var CHARACTER_DEPLOY_STEPS = [
  "load_kit",
  "unify_skeletons",
  "box3_fit_height",
  "atlas_rebind",
  "equip_mesh_ids",
  "reground_after_equip",
  "art_forward_plus_z",
  "center_xz_pelvis",
  "ground_feet_min_y",
  "load_anim_pack_strip_position",
  "animation_director_idle",
  "sample_and_reground",
  "wire_skills_colliders",
  "capsule_surface_locomotion",
  "diagnose_quality"
];
function defaultDeployOptions(partial = {}) {
  return {
    targetHeightM: partial.targetHeightM ?? CHARACTER_SI.humanHeightM,
    groundY: partial.groundY ?? 0,
    facePlusZ: partial.facePlusZ ?? "auto",
    stripPositionTracks: partial.stripPositionTracks ?? true,
    importPipeline: partial.importPipeline ?? "auto"
  };
}
function recommendArtForwardYaw(importPipeline, raceId) {
  if (importPipeline === "glb") return 0;
  if (importPipeline === "fbx-atlas" || importPipeline === "auto") return Math.PI / 2;
  void raceId;
  return Math.PI / 2;
}
function evaluateHeightQuality(heightM) {
  if (heightM == null || !Number.isFinite(heightM)) {
    return { ok: false, error: "height_unknown" };
  }
  if (heightM < CHARACTER_SI.heightMinM || heightM > CHARACTER_SI.heightMaxM) {
    return {
      ok: false,
      error: `height_out_of_range:${heightM.toFixed(2)}m (want ${CHARACTER_SI.heightMinM}\u2013${CHARACTER_SI.heightMaxM})`
    };
  }
  return { ok: true };
}
function evaluateFeetQuality(feetErrorM) {
  if (feetErrorM == null || !Number.isFinite(feetErrorM)) {
    return { ok: false, error: "feet_unknown" };
  }
  if (Math.abs(feetErrorM) > CHARACTER_SI.feetTolM) {
    return {
      ok: false,
      error: `feet_error:${feetErrorM.toFixed(3)}m (tol ${CHARACTER_SI.feetTolM})`
    };
  }
  return { ok: true };
}
function buildQualityReport(input) {
  const errors = [...input.extraErrors ?? []];
  const warnings = [...input.extraWarnings ?? []];
  const h = evaluateHeightQuality(input.heightM);
  if (!h.ok && h.error) errors.push(h.error);
  const f = evaluateFeetQuality(input.feetErrorM);
  if (!f.ok && f.error) errors.push(f.error);
  if (!input.pelvisFound) errors.push("pelvis_bone_missing");
  if (!input.handRightFound) warnings.push("right_hand_missing");
  return {
    ok: errors.length === 0,
    heightM: input.heightM,
    feetErrorM: input.feetErrorM,
    pelvisFound: input.pelvisFound,
    handRightFound: input.handRightFound,
    errors,
    warnings
  };
}
var MOTION = GROUNDED_MOTION_CONTRACT;

// src/skeleton.ts
var BIP001_BONES = {
  root: "Bip001",
  pelvis: "Bip001 Pelvis",
  spine: "Bip001 Spine",
  spine1: "Bip001 Spine1",
  spine2: "Bip001 Spine2",
  neck: "Bip001 Neck",
  head: "Bip001 Head",
  lThigh: "Bip001 L Thigh",
  lCalf: "Bip001 L Calf",
  lFoot: "Bip001 L Foot",
  rThigh: "Bip001 R Thigh",
  rCalf: "Bip001 R Calf",
  rFoot: "Bip001 R Foot",
  lClavicle: "Bip001 L Clavicle",
  lUpperArm: "Bip001 L UpperArm",
  lForearm: "Bip001 L Forearm",
  lHand: "Bip001 L Hand",
  rClavicle: "Bip001 R Clavicle",
  rUpperArm: "Bip001 R UpperArm",
  rForearm: "Bip001 R Forearm",
  rHand: "Bip001 R Hand",
  /** Equip containers (may be Object3D, not Bone) */
  rHandContainer: "R_hand_container",
  lHandContainer: "L_hand_container",
  lShieldContainer: "L_shield_container"
};
var MIXAMO_BONES = {
  hips: "mixamorigHips",
  spine: "mixamorigSpine",
  leftUpLeg: "mixamorigLeftUpLeg",
  leftLeg: "mixamorigLeftLeg",
  leftFoot: "mixamorigLeftFoot",
  rightUpLeg: "mixamorigRightUpLeg",
  rightLeg: "mixamorigRightLeg",
  rightFoot: "mixamorigRightFoot",
  leftArm: "mixamorigLeftArm",
  leftForeArm: "mixamorigLeftForeArm",
  leftHand: "mixamorigLeftHand",
  rightArm: "mixamorigRightArm",
  rightForeArm: "mixamorigRightForeArm",
  rightHand: "mixamorigRightHand"
};
var B_MF_BONES = {
  root: "b_MF_Root_38",
  pelvis: "b_MF_Pelvis_37",
  spine1: "b_MF_Spine_01_36",
  spine2: "b_MF_Spine_02_35",
  spine3: "b_MF_Spine_03_34",
  neck: "b_MF_Neck_9",
  head: "b_MF_Head_8",
  lThigh: "b_MF_Thigh_L_7",
  lCalf: "b_MF_Calf_L_6",
  lFoot: "b_MF_Foot_L_5",
  rThigh: "b_MF_Thigh_R_4",
  rCalf: "b_MF_Calf_R_3",
  rFoot: "b_MF_Foot_R_2",
  lClavicle: "b_MF_Clavicle_L_21",
  lUpperArm: "b_MF_UpperArm_L_20",
  lForearm: "b_MF_Forearm_L_19",
  lHand: "b_MF_Hand_L_18",
  lWeapon: "b_MF_Weapon_L_17",
  rClavicle: "b_MF_Clavicle_R_33",
  rUpperArm: "b_MF_UpperArm_R_32",
  rForearm: "b_MF_Forearm_R_31",
  rHand: "b_MF_Hand_R_30",
  rWeapon: "b_MF_Weapon_R_29"
};
var MIXAMO_TO_BIP001 = [
  { mixamo: MIXAMO_BONES.hips, bip: BIP001_BONES.pelvis },
  { mixamo: MIXAMO_BONES.spine, bip: BIP001_BONES.spine },
  { mixamo: MIXAMO_BONES.leftUpLeg, bip: BIP001_BONES.lThigh },
  { mixamo: MIXAMO_BONES.leftLeg, bip: BIP001_BONES.lCalf },
  { mixamo: MIXAMO_BONES.leftFoot, bip: BIP001_BONES.lFoot },
  { mixamo: MIXAMO_BONES.rightUpLeg, bip: BIP001_BONES.rThigh },
  { mixamo: MIXAMO_BONES.rightLeg, bip: BIP001_BONES.rCalf },
  { mixamo: MIXAMO_BONES.rightFoot, bip: BIP001_BONES.rFoot },
  { mixamo: MIXAMO_BONES.leftArm, bip: BIP001_BONES.lUpperArm },
  { mixamo: MIXAMO_BONES.leftForeArm, bip: BIP001_BONES.lForearm },
  { mixamo: MIXAMO_BONES.leftHand, bip: BIP001_BONES.lHand },
  { mixamo: MIXAMO_BONES.rightArm, bip: BIP001_BONES.rUpperArm },
  { mixamo: MIXAMO_BONES.rightForeArm, bip: BIP001_BONES.rForearm },
  { mixamo: MIXAMO_BONES.rightHand, bip: BIP001_BONES.rHand }
];
var B_MF_TO_BIP001 = [
  { source: B_MF_BONES.pelvis, bip: BIP001_BONES.pelvis },
  { source: B_MF_BONES.root, bip: BIP001_BONES.root },
  { source: B_MF_BONES.spine1, bip: BIP001_BONES.spine },
  { source: B_MF_BONES.spine2, bip: BIP001_BONES.spine1 },
  { source: B_MF_BONES.spine3, bip: BIP001_BONES.spine2 },
  { source: B_MF_BONES.neck, bip: BIP001_BONES.neck },
  { source: B_MF_BONES.head, bip: BIP001_BONES.head },
  { source: B_MF_BONES.lThigh, bip: BIP001_BONES.lThigh },
  { source: B_MF_BONES.lCalf, bip: BIP001_BONES.lCalf },
  { source: B_MF_BONES.lFoot, bip: BIP001_BONES.lFoot },
  { source: B_MF_BONES.rThigh, bip: BIP001_BONES.rThigh },
  { source: B_MF_BONES.rCalf, bip: BIP001_BONES.rCalf },
  { source: B_MF_BONES.rFoot, bip: BIP001_BONES.rFoot },
  { source: B_MF_BONES.lClavicle, bip: BIP001_BONES.lClavicle },
  { source: B_MF_BONES.lUpperArm, bip: BIP001_BONES.lUpperArm },
  { source: B_MF_BONES.lForearm, bip: BIP001_BONES.lForearm },
  { source: B_MF_BONES.lHand, bip: BIP001_BONES.lHand },
  { source: B_MF_BONES.rClavicle, bip: BIP001_BONES.rClavicle },
  { source: B_MF_BONES.rUpperArm, bip: BIP001_BONES.rUpperArm },
  { source: B_MF_BONES.rForearm, bip: BIP001_BONES.rForearm },
  { source: B_MF_BONES.rHand, bip: BIP001_BONES.rHand }
];
var BIP001_MIXAMO_MAP = MIXAMO_TO_BIP001.map(({ bip, mixamo }) => ({ bip, mixamo }));
function normalizeBoneToken(name) {
  return name.replace(/^mixamorig:?/i, "").replace(/^bip001[\s_]?/i, "").replace(/^b_?mf_?/i, "").replace(/_\d+$/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}
function rematchTrackName(trackName, availableBoneNames) {
  const dot = trackName.lastIndexOf(".");
  if (dot < 0) return trackName;
  const bone = trackName.slice(0, dot);
  const prop = trackName.slice(dot);
  const exact = availableBoneNames.find((b) => b === bone);
  if (exact) return trackName;
  const token = normalizeBoneToken(bone);
  const hit = availableBoneNames.find((b) => normalizeBoneToken(b) === token);
  if (hit) return hit + prop;
  const underscored = bone.replace(/\s+/g, "_");
  const spaced = bone.replace(/_/g, " ");
  const hit2 = availableBoneNames.find((b) => b === underscored || b === spaced) || availableBoneNames.find(
    (b) => normalizeBoneToken(b) === normalizeBoneToken(underscored)
  );
  if (hit2) return hit2 + prop;
  for (const pair of MIXAMO_TO_BIP001) {
    if (normalizeBoneToken(bone) === normalizeBoneToken(pair.mixamo)) {
      const m = availableBoneNames.find(
        (b) => b === pair.bip || normalizeBoneToken(b) === normalizeBoneToken(pair.bip)
      );
      if (m) return m + prop;
    }
  }
  for (const pair of B_MF_TO_BIP001) {
    if (normalizeBoneToken(bone) === normalizeBoneToken(pair.source)) {
      const m = availableBoneNames.find(
        (b) => b === pair.bip || normalizeBoneToken(b) === normalizeBoneToken(pair.bip)
      );
      if (m) return m + prop;
    }
  }
  for (const pair of MIXAMO_TO_BIP001) {
    if (normalizeBoneToken(bone) === normalizeBoneToken(pair.bip)) {
      const m = availableBoneNames.find(
        (b) => b === pair.bip || normalizeBoneToken(b) === normalizeBoneToken(pair.bip)
      );
      if (m) return m + prop;
    }
  }
  return trackName;
}
function rematchClipTracks(clip, availableBoneNames) {
  let changed = 0;
  for (const t of clip.tracks) {
    const next = rematchTrackName(t.name, availableBoneNames);
    if (next !== t.name) {
      t.name = next;
      changed++;
    }
  }
  return changed;
}
var retargetMixamoClipToBip001 = rematchClipTracks;
var retargetRaidriarClipToBip001 = rematchClipTracks;
function detectSkeletonKind(boneNames) {
  const n = boneNames.join(" ");
  if (/bip001/i.test(n)) return "bip001";
  if (/mixamorig/i.test(n)) return "mixamo";
  if (/b_mf_|b_MF_/i.test(n)) return "b_mf";
  if (/world_joint|pl_/i.test(n)) return "opb";
  return "unknown";
}
function collectBoneNames(root) {
  const names = /* @__PURE__ */ new Set();
  if (root.skeleton?.bones) {
    for (const b of root.skeleton.bones) {
      if (b.name) names.add(b.name);
    }
  }
  root.traverse?.((o) => {
    if (o.isBone || o.type === "Bone") {
      if (o.name) names.add(o.name);
    }
  });
  return [...names];
}
function findAttachBone(root, candidates) {
  for (const name of candidates) {
    const hit = root.getObjectByName?.(name);
    if (hit) return hit;
  }
  let found = null;
  const tokens = candidates.map(normalizeBoneToken);
  root.traverse?.((o) => {
    if (found || !o.name) return;
    if (tokens.includes(normalizeBoneToken(o.name))) found = o;
  });
  return found;
}
var WEAPON_ATTACH_BONES = [
  BIP001_BONES.rHandContainer,
  BIP001_BONES.rHand,
  "Bip001_R_Hand",
  MIXAMO_BONES.rightHand,
  B_MF_BONES.rWeapon,
  B_MF_BONES.rHand
];
var SHIELD_ATTACH_BONES = [
  BIP001_BONES.lShieldContainer,
  BIP001_BONES.lHandContainer,
  BIP001_BONES.lHand,
  MIXAMO_BONES.leftHand
];
var SKELETON_CONTRACT = {
  kind: "bip001",
  requireBip001ForGrudge6: true,
  hipBoneCandidates: [
    BIP001_BONES.pelvis,
    BIP001_BONES.root,
    MIXAMO_BONES.hips,
    "Hips",
    "pelvis"
  ],
  groundFromBodyBoxNotHip: true
};
function skeletonQualityReport(boneNames) {
  const kind = detectSkeletonKind(boneNames);
  const tokens = new Set(boneNames.map(normalizeBoneToken));
  const missingCritical = [];
  const need = kind === "mixamo" ? ["hips", "leftupleg", "rightupleg", "lefthand", "righthand"] : ["pelvis", "lthigh", "rthigh", "lhand", "rhand"];
  for (const n of need) {
    if (![...tokens].some((t) => t.includes(n) || n.includes(t))) {
      missingCritical.push(n);
    }
  }
  const hasHips = tokens.has("pelvis") || tokens.has("hips") || boneNames.some((b) => /pelvis|hips/i.test(b));
  const hasRightHand = tokens.has("rhand") || tokens.has("righthand") || boneNames.some((b) => /r.?hand|righthand/i.test(b));
  return {
    kind,
    ok: missingCritical.length === 0 && hasHips,
    hasHips,
    hasRightHand,
    missingCritical
  };
}

// src/state.ts
function createDefaultCharacterState(partial = {}) {
  return {
    locomotion: "idle",
    combat: "ready",
    surface: "ground",
    skillId: null,
    animPack: "sword_shield",
    moveSpeed01: 0,
    sprinting: false,
    weaponColliderActive: false,
    inHitWindow: false,
    skillProgress: 0,
    yaw: 0,
    ...partial
  };
}
function locomotionFromSpeed(speed01, sprinting) {
  if (speed01 < 0.05) return "idle";
  if (sprinting) return "sprint";
  if (speed01 < 0.45) return "walk";
  return "run";
}
function combatFromSkillProgress(busy, progress, hitWindow = [0.28, 0.55]) {
  if (!busy) return "ready";
  if (progress < hitWindow[0]) return "windup";
  if (progress <= hitWindow[1]) return "active";
  return "recovery";
}
function applyLocoSnapshot(state, snap, move) {
  const hitWindow = [0.28, 0.55];
  return {
    ...state,
    moveSpeed01: move.speed01,
    sprinting: move.sprinting,
    locomotion: snap.gait ?? locomotionFromSpeed(move.speed01, move.sprinting),
    skillId: snap.skillId,
    skillProgress: snap.progress,
    inHitWindow: snap.inHitWindow,
    weaponColliderActive: snap.weaponColliderActive,
    combat: combatFromSkillProgress(snap.busy, snap.progress, hitWindow)
  };
}
function reduceCharacterState(state, ev) {
  const next = { ...state };
  switch (ev.type) {
    case "move":
      next.moveSpeed01 = Number(ev.payload?.speed01 ?? 0.7);
      next.sprinting = !!ev.payload?.sprint;
      next.locomotion = locomotionFromSpeed(next.moveSpeed01, next.sprinting);
      break;
    case "stop":
      next.moveSpeed01 = 0;
      next.sprinting = false;
      next.locomotion = "idle";
      break;
    case "sprint":
      next.sprinting = !!ev.payload?.on;
      if (next.moveSpeed01 > 0.05) {
        next.locomotion = locomotionFromSpeed(next.moveSpeed01, next.sprinting);
      }
      break;
    case "skill_start":
      next.skillId = String(ev.payload?.skillId ?? "skill");
      next.combat = "windup";
      next.skillProgress = 0;
      next.inHitWindow = false;
      next.weaponColliderActive = false;
      break;
    case "skill_tick": {
      const progress = Number(ev.payload?.progress ?? 0);
      const hitWindow = ev.payload?.hitWindow ?? [
        0.28,
        0.55
      ];
      next.skillProgress = progress;
      next.combat = combatFromSkillProgress(true, progress, hitWindow);
      next.inHitWindow = progress >= hitWindow[0] && progress <= hitWindow[1];
      next.weaponColliderActive = !!(ev.payload?.weaponCollider !== false && next.inHitWindow);
      break;
    }
    case "skill_end":
      next.skillId = null;
      next.combat = "ready";
      next.weaponColliderActive = false;
      next.inHitWindow = false;
      next.skillProgress = 0;
      break;
    case "hit":
      next.combat = "hitstun";
      next.weaponColliderActive = false;
      break;
    case "knockback":
      next.combat = "knockback";
      next.weaponColliderActive = false;
      break;
    case "flyback":
      next.combat = "flyback";
      next.weaponColliderActive = false;
      break;
    case "down":
      next.combat = "down";
      next.moveSpeed01 = 0;
      next.weaponColliderActive = false;
      break;
    case "getup":
      next.combat = "getup";
      break;
    case "stun":
      next.combat = "stun";
      next.moveSpeed01 = 0;
      break;
    case "block":
      next.combat = "block";
      break;
    case "parry":
      next.combat = "parry";
      break;
    case "die":
      next.combat = "dead";
      next.locomotion = "idle";
      next.skillId = null;
      next.weaponColliderActive = false;
      break;
    case "surface":
      next.surface = ev.payload?.surface ?? "ground";
      break;
    case "anim_pack":
      next.animPack = String(ev.payload?.animPack ?? next.animPack);
      break;
    default:
      break;
  }
  return next;
}
function stateToNetPatch(state) {
  return {
    uuid: state.uuid,
    locomotion: state.locomotion,
    combat: state.combat,
    surface: state.surface,
    skillId: state.skillId,
    animPack: state.animPack,
    moveSpeed01: state.moveSpeed01,
    sprinting: state.sprinting,
    weaponColliderActive: state.weaponColliderActive,
    inHitWindow: state.inHitWindow,
    skillProgress: state.skillProgress,
    yaw: state.yaw
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BIP001_BONES,
  BIP001_MIXAMO_MAP,
  B_MF_BONES,
  B_MF_TO_BIP001,
  CHARACTER_DEPLOY_STEPS,
  CHARACTER_KILL_LIST,
  CHARACTER_SI,
  GROUNDED_MOTION_CONTRACT,
  HIP_ROOT_BONE_RE,
  MIXAMORIG_ON_BIP001_KILL,
  MIXAMO_BONES,
  MIXAMO_TO_BIP001,
  MOTION,
  SHIELD_ATTACH_BONES,
  SKELETON_CONTRACT,
  WEAPON_ATTACH_BONES,
  applyLocoSnapshot,
  buildQualityReport,
  collectBoneNames,
  combatFromSkillProgress,
  createDefaultCharacterState,
  defaultDeployOptions,
  detectSkeletonKind,
  evaluateFeetQuality,
  evaluateHeightQuality,
  findAttachBone,
  isHipOrRootPositionTrack,
  locomotionFromSpeed,
  normalizeBoneToken,
  recommendArtForwardYaw,
  reduceCharacterState,
  rematchClipTracks,
  rematchTrackName,
  retargetMixamoClipToBip001,
  retargetRaidriarClipToBip001,
  skeletonQualityReport,
  stateToNetPatch,
  stripHipRootPositionTracks,
  stripPositionTracks,
  weaponToAnimPack
});
//# sourceMappingURL=index.cjs.map