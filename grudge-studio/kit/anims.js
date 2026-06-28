import * as THREE from 'three'
import { assetLoadError, resolveAssetUrl } from './assetBase.js'

export const ANIM_PACK_CLIPS = {
  unarmed: {
    idle: 'unarmed/fight_idle',
    walk: 'locomotion/walking',
    run: 'locomotion/running',
    attack: 'unarmed/punching',
  },
  magic: {
    idle: 'magic/standing idle',
    walk: 'locomotion/walking',
    run: 'magic/Standing Run Forward',
    attack: 'magic/standing 1h cast spell 01',
  },
  sword_shield: {
    idle: 'sword_shield/sword and shield idle',
    walk: 'locomotion/walking',
    run: 'sword_shield/sword and shield run',
    attack: 'sword_shield/sword and shield attack',
  },
  longbow: {
    idle: 'longbow/standing idle 01',
    walk: 'locomotion/walking',
    run: 'longbow/standing run forward',
    attack: 'longbow/standing aim recoil',
  },
}

export function bakedClipUrl(rel) {
  return resolveAssetUrl(`/anims/baked/${rel}.json`)
}

export function toRotationOnlyClip(clip) {
  const tracks = clip.tracks.filter((t) => t.name.endsWith('.quaternion'))
  return new THREE.AnimationClip(clip.name, clip.duration, tracks)
}

export async function loadBakedClip(rel) {
  const url = bakedClipUrl(rel)
  let res
  try {
    res = await fetch(url)
  } catch (err) {
    throw assetLoadError(url, err)
  }
  if (!res.ok) throw assetLoadError(`${url} (HTTP ${res.status})`)
  const json = await res.json()
  return toRotationOnlyClip(THREE.AnimationClip.parse(json))
}