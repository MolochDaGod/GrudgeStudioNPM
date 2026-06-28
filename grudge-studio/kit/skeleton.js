import * as THREE from 'three'

export function powerOfTenScale(reference, current) {
  if (!(reference > 0) || !(current > 0)) return 1
  return Math.pow(10, Math.round(Math.log10(reference / current)))
}

/** Collapse per-mesh skeletons onto one canonical Bip001 chain. */
export function unifySkeletons(root) {
  root.updateMatrixWorld(true)
  const canon = new Map()
  const queue = [...root.children]
  while (queue.length) {
    const node = queue.shift()
    if (node instanceof THREE.Bone && !canon.has(node.name)) canon.set(node.name, node)
    queue.push(...node.children)
  }
  if (canon.size === 0) return null

  let widest = null
  root.traverse((node) => {
    if (node instanceof THREE.SkinnedMesh && node.skeleton) {
      const newBones = node.skeleton.bones.map((b) => canon.get(b.name) ?? b)
      const newSkel = new THREE.Skeleton(newBones, node.skeleton.boneInverses)
      node.bind(newSkel, node.bindMatrix)
      if (!widest || newSkel.bones.length > widest.bones.length) widest = newSkel
    }
  })
  return widest
}

export function findHandBone(root, side) {
  const exact = side === 'R' ? 'Bip001_R_Hand' : 'Bip001_L_Hand'
  let exactHit = null
  let fuzzyHit = null
  let fuzzyName = ''
  const want = side === 'R' ? /rhand|righthand|handr|rwrist/ : /lhand|lefthand|handl|lwrist/
  const isFinger = /finger|thumb|index|middle|ring|pinky|pinkie|metacarp|digit/
  root.traverse((node) => {
    if (exactHit) return
    if (node.name === exact) {
      exactHit = node
      return
    }
    const norm = node.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!want.test(norm) || isFinger.test(norm)) return
    if (!fuzzyHit || norm.length < fuzzyName.length) {
      fuzzyHit = node
      fuzzyName = norm
    }
  })
  return exactHit ?? fuzzyHit
}