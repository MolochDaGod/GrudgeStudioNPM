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

export type SkeletonKind = "bip001" | "mixamo" | "b_mf" | "opb" | "unknown";

/** Canonical grudge6 bone names (spaces as in Unity FBX export). */
export const BIP001_BONES = {
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
  lShieldContainer: "L_shield_container",
} as const;

export const MIXAMO_BONES = {
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
  rightHand: "mixamorigRightHand",
} as const;

/**
 * Infinity Blade / Raidriar God King bones (Sketchfab export).
 * Trailing `_N` indices vary; match via normalizeBoneToken.
 */
export const B_MF_BONES = {
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
  rWeapon: "b_MF_Weapon_R_29",
} as const;

/**
 * Semantic bone pairs for **Mixamo → Bip001** retarget.
 * `mixamo` = source track bone; `bip` = production grudge6 target bone.
 * (Alias `BIP001_MIXAMO_MAP` kept for older imports.)
 */
export const MIXAMO_TO_BIP001: ReadonlyArray<{ mixamo: string; bip: string }> = [
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
  { mixamo: MIXAMO_BONES.rightHand, bip: BIP001_BONES.rHand },
];

/**
 * **Raidriar / Infinity Blade (b_MF_*) → Bip001** retarget pairs.
 * Strip exporter indices; rematchTrackName uses normalizeBoneToken.
 */
export const B_MF_TO_BIP001: ReadonlyArray<{ source: string; bip: string }> = [
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
  { source: B_MF_BONES.rHand, bip: BIP001_BONES.rHand },
];

/** @deprecated use MIXAMO_TO_BIP001 — same pairs, bip-first field order */
export const BIP001_MIXAMO_MAP: ReadonlyArray<{ bip: string; mixamo: string }> =
  MIXAMO_TO_BIP001.map(({ bip, mixamo }) => ({ bip, mixamo }));

/** Normalize bone token for fuzzy match */
export function normalizeBoneToken(name: string): string {
  return name
    .replace(/^mixamorig:?/i, "")
    .replace(/^bip001[\s_]?/i, "")
    .replace(/^b_?mf_?/i, "")
    .replace(/_\d+$/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

/**
 * Remap one track name onto `availableBoneNames` (usually the Bip001 rig).
 * Prefer exact match → fuzzy token → **Mixamo source → Bip001 target**.
 *
 * Production call: rematchTrackName("mixamorigLeftUpLeg.quaternion", bip001Bones)
 * → "Bip001 L Thigh.quaternion"
 */
export function rematchTrackName(
  trackName: string,
  availableBoneNames: string[],
): string {
  const dot = trackName.lastIndexOf(".");
  if (dot < 0) return trackName;
  const bone = trackName.slice(0, dot);
  const prop = trackName.slice(dot);
  const exact = availableBoneNames.find((b) => b === bone);
  if (exact) return trackName;
  const token = normalizeBoneToken(bone);
  const hit = availableBoneNames.find((b) => normalizeBoneToken(b) === token);
  if (hit) return hit + prop;
  // common bip001 space vs underscore
  const underscored = bone.replace(/\s+/g, "_");
  const spaced = bone.replace(/_/g, " ");
  const hit2 =
    availableBoneNames.find((b) => b === underscored || b === spaced) ||
    availableBoneNames.find(
      (b) => normalizeBoneToken(b) === normalizeBoneToken(underscored),
    );
  if (hit2) return hit2 + prop;

  // Primary: Mixamo track → Bip001 bone on target
  for (const pair of MIXAMO_TO_BIP001) {
    if (normalizeBoneToken(bone) === normalizeBoneToken(pair.mixamo)) {
      const m = availableBoneNames.find(
        (b) =>
          b === pair.bip ||
          normalizeBoneToken(b) === normalizeBoneToken(pair.bip),
      );
      if (m) return m + prop;
    }
  }
  // Raidriar / Infinity Blade b_MF_* → Bip001
  for (const pair of B_MF_TO_BIP001) {
    if (normalizeBoneToken(bone) === normalizeBoneToken(pair.source)) {
      const m = availableBoneNames.find(
        (b) =>
          b === pair.bip ||
          normalizeBoneToken(b) === normalizeBoneToken(pair.bip),
      );
      if (m) return m + prop;
    }
  }
  // Secondary only: already-Bip001 track fuzzy match on target
  for (const pair of MIXAMO_TO_BIP001) {
    if (normalizeBoneToken(bone) === normalizeBoneToken(pair.bip)) {
      const m = availableBoneNames.find(
        (b) =>
          b === pair.bip ||
          normalizeBoneToken(b) === normalizeBoneToken(pair.bip),
      );
      if (m) return m + prop;
    }
  }
  return trackName;
}

/**
 * Retarget a Mixamo / Raidriar (b_MF) / mixed clip onto a Bip001 bone list.
 * Returns how many track names changed. Host should also strip hip-Y
 * position tracks after rematch (see stripHipRootPositionTracks).
 */
export function rematchClipTracks(
  clip: { tracks: Array<{ name: string }> },
  availableBoneNames: string[],
): number {
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

/** Alias: explicit Mixamo package → Bip001 production */
export const retargetMixamoClipToBip001 = rematchClipTracks;
/** Alias: Raidriar Infinity Blade b_MF → Bip001 */
export const retargetRaidriarClipToBip001 = rematchClipTracks;

export function detectSkeletonKind(boneNames: string[]): SkeletonKind {
  const n = boneNames.join(" ");
  if (/bip001/i.test(n)) return "bip001";
  if (/mixamorig/i.test(n)) return "mixamo";
  if (/b_mf_|b_MF_/i.test(n)) return "b_mf";
  if (/world_joint|pl_/i.test(n)) return "opb";
  return "unknown";
}

/** Collect bone names from a duck-typed SkinnedMesh / Object3D tree */
export function collectBoneNames(root: {
  traverse?: (fn: (o: { isBone?: boolean; name?: string; type?: string }) => void) => void;
  skeleton?: { bones?: Array<{ name: string }> };
}): string[] {
  const names = new Set<string>();
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

/** Find first matching attach bone in scene graph (duck-typed) */
export function findAttachBone(
  root: {
    getObjectByName?: (n: string) => unknown;
    traverse?: (fn: (o: { name?: string }) => void) => void;
  },
  candidates: readonly string[],
): unknown | null {
  for (const name of candidates) {
    const hit = root.getObjectByName?.(name);
    if (hit) return hit;
  }
  // fuzzy
  let found: unknown = null;
  const tokens = candidates.map(normalizeBoneToken);
  root.traverse?.((o) => {
    if (found || !o.name) return;
    if (tokens.includes(normalizeBoneToken(o.name))) found = o;
  });
  return found;
}

/** Hand / weapon attach priority for projectiles and colliders */
export const WEAPON_ATTACH_BONES = [
  BIP001_BONES.rHandContainer,
  BIP001_BONES.rHand,
  "Bip001_R_Hand",
  MIXAMO_BONES.rightHand,
  B_MF_BONES.rWeapon,
  B_MF_BONES.rHand,
] as const;

export const SHIELD_ATTACH_BONES = [
  BIP001_BONES.lShieldContainer,
  BIP001_BONES.lHandContainer,
  BIP001_BONES.lHand,
  MIXAMO_BONES.leftHand,
] as const;

export interface SkeletonContract {
  kind: SkeletonKind;
  /** grudge6 production always Bip001 */
  requireBip001ForGrudge6: true;
  hipBoneCandidates: string[];
  groundFromBodyBoxNotHip: true;
}

export const SKELETON_CONTRACT: SkeletonContract = {
  kind: "bip001",
  requireBip001ForGrudge6: true,
  hipBoneCandidates: [
    BIP001_BONES.pelvis,
    BIP001_BONES.root,
    MIXAMO_BONES.hips,
    "Hips",
    "pelvis",
  ],
  groundFromBodyBoxNotHip: true,
};

/** Quality report for skeleton readiness */
export function skeletonQualityReport(boneNames: string[]): {
  kind: SkeletonKind;
  ok: boolean;
  hasHips: boolean;
  hasRightHand: boolean;
  missingCritical: string[];
} {
  const kind = detectSkeletonKind(boneNames);
  const tokens = new Set(boneNames.map(normalizeBoneToken));
  const missingCritical: string[] = [];
  const need =
    kind === "mixamo"
      ? ["hips", "leftupleg", "rightupleg", "lefthand", "righthand"]
      : ["pelvis", "lthigh", "rthigh", "lhand", "rhand"];
  for (const n of need) {
    if (![...tokens].some((t) => t.includes(n) || n.includes(t))) {
      missingCritical.push(n);
    }
  }
  const hasHips =
    tokens.has("pelvis") ||
    tokens.has("hips") ||
    boneNames.some((b) => /pelvis|hips/i.test(b));
  const hasRightHand =
    tokens.has("rhand") ||
    tokens.has("righthand") ||
    boneNames.some((b) => /r.?hand|righthand/i.test(b));
  return {
    kind,
    ok: missingCritical.length === 0 && hasHips,
    hasHips,
    hasRightHand,
    missingCritical,
  };
}
