/**
 * Bip001 ↔ Mixamo bone map — mirrors character-viewer/src/types/boneMap.ts
 * GRUDGE 6 champions ride Bip001; Mixamo clips retarget via this map (offline bake preferred).
 */

export const DEFAULT_BONE_MAP = {
  Bip001_Pelvis: 'mixamorigHips',
  Bip001_Spine: 'mixamorigSpine',
  Bip001_Neck: 'mixamorigNeck',
  Bip001_Head: 'mixamorigHead',
  Bip001_L_Clavicle: 'mixamorigLeftShoulder',
  Bip001_L_UpperArm: 'mixamorigLeftArm',
  Bip001_L_Forearm: 'mixamorigLeftForeArm',
  Bip001_L_Hand: 'mixamorigLeftHand',
  Bip001_R_Clavicle: 'mixamorigRightShoulder',
  Bip001_R_UpperArm: 'mixamorigRightArm',
  Bip001_R_Forearm: 'mixamorigRightForeArm',
  Bip001_R_Hand: 'mixamorigRightHand',
  Bip001_L_Thigh: 'mixamorigLeftUpLeg',
  Bip001_L_Calf: 'mixamorigLeftLeg',
  Bip001_L_Foot: 'mixamorigLeftFoot',
  Bip001_L_Toe0: 'mixamorigLeftToeBase',
  Bip001_R_Thigh: 'mixamorigRightUpLeg',
  Bip001_R_Calf: 'mixamorigRightLeg',
  Bip001_R_Foot: 'mixamorigRightFoot',
  Bip001_R_Toe0: 'mixamorigRightToeBase',
}

export const BIP001_ORDERED = Object.keys(DEFAULT_BONE_MAP)

export const MIXAMO_ORDERED = [
  'mixamorigHips',
  'mixamorigSpine',
  'mixamorigSpine1',
  'mixamorigSpine2',
  'mixamorigNeck',
  'mixamorigHead',
  'mixamorigLeftShoulder',
  'mixamorigLeftArm',
  'mixamorigLeftForeArm',
  'mixamorigLeftHand',
  'mixamorigRightShoulder',
  'mixamorigRightArm',
  'mixamorigRightForeArm',
  'mixamorigRightHand',
  'mixamorigLeftUpLeg',
  'mixamorigLeftLeg',
  'mixamorigLeftFoot',
  'mixamorigLeftToeBase',
  'mixamorigRightUpLeg',
  'mixamorigRightLeg',
  'mixamorigRightFoot',
  'mixamorigRightToeBase',
]

/** Invert map: Mixamo track name → Bip001 (for runtime clip rename). */
export function mixamoToBipMap() {
  const out = {}
  for (const [bip, mix] of Object.entries(DEFAULT_BONE_MAP)) {
    out[mix] = bip
    // Spine compression: Mixamo Spine1 also feeds Bip001_Spine
    if (mix === 'mixamorigSpine') out.mixamorigSpine1 = bip
    if (mix === 'mixamorigSpine') out.mixamorigSpine2 = 'Bip001_Spine1'
  }
  return out
}

export function normalizeBoneName(name) {
  if (!name) return name
  let n = name.includes(' ') ? name.replace(/\s/g, '_') : name
  if (/^Bip01_/i.test(n)) n = n.replace(/^Bip01_/i, 'Bip001_')
  return n
}

export function detectRigType(boneNames) {
  let mix = 0
  let bip = 0
  for (const raw of boneNames) {
    const n = normalizeBoneName(raw)
    if (n.startsWith('mixamorig')) mix++
    if (/^Bip0{1,3}1/i.test(n)) bip++
  }
  if (mix >= 3) return 'mixamo25'
  if (bip >= 3) return 'bip001'
  return 'unknown'
}