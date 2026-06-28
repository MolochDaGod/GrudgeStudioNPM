/**
 * @grudge-studio/character-kit (JS) — GRUDGE 6 Bip001 load + baked anim pipeline.
 * Ported from grudge-character-animator/lib/character-kit.
 */

export { setAssetBase, getAssetBase, resolveAssetUrl, assetLoadError } from './assetBase.js'
export { GRUDGE_RACE_IDS, RACE_ASSETS, getRace } from './races.js'
export {
  DEFAULT_BONE_MAP,
  BIP001_ORDERED,
  MIXAMO_ORDERED,
  mixamoToBipMap,
  normalizeBoneName,
  detectRigType,
} from './boneMap.js'
export { powerOfTenScale, unifySkeletons, findHandBone } from './skeleton.js'
export { ANIM_PACK_CLIPS, bakedClipUrl, loadBakedClip, toRotationOnlyClip } from './anims.js'
export { loadCharacterModel, normalizeCharacterGroup } from './loadCharacter.js'