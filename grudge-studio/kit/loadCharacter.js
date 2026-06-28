import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { assetLoadError, resolveAssetUrl } from './assetBase.js'
import { powerOfTenScale, unifySkeletons } from './skeleton.js'

const fbxLoader = new FBXLoader()
fbxLoader.crossOrigin = 'anonymous'

export function normalizeCharacterGroup(fbx, targetHeight = 2) {
  const skeleton = unifySkeletons(fbx)
  fbx.rotation.y = Math.PI / 2
  fbx.updateWorldMatrix(true, true)

  const _p = new THREE.Vector3()
  const _q = new THREE.Quaternion()
  const _s = new THREE.Vector3()
  const effScaleOf = (node) => {
    node.matrixWorld.decompose(_p, _q, _s)
    return Math.max(Math.abs(_s.x), Math.abs(_s.y), Math.abs(_s.z))
  }
  const skinnedEff = []
  fbx.traverse((node) => {
    if (node instanceof THREE.SkinnedMesh) skinnedEff.push(effScaleOf(node))
  })
  skinnedEff.sort((a, b) => a - b)
  const refEff = skinnedEff.length > 0 ? skinnedEff[Math.floor(skinnedEff.length / 2)] : 1
  let normalizedAny = false
  fbx.traverse((node) => {
    if (node instanceof THREE.Mesh && !(node instanceof THREE.SkinnedMesh)) {
      const correction = powerOfTenScale(refEff, effScaleOf(node))
      if (correction !== 1) {
        node.scale.multiplyScalar(correction)
        normalizedAny = true
      }
    }
  })
  if (normalizedAny) fbx.updateWorldMatrix(true, true)

  const bodyBox = new THREE.Box3()
  let bodyMeshCount = 0
  fbx.traverse((node) => {
    if (node instanceof THREE.SkinnedMesh) {
      bodyBox.expandByObject(node)
      bodyMeshCount++
    }
  })
  const box = bodyMeshCount > 0 ? bodyBox : new THREE.Box3().setFromObject(fbx)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) fbx.scale.setScalar(targetHeight / maxDim)

  fbx.updateWorldMatrix(true, true)
  const bodyBox2 = new THREE.Box3()
  fbx.traverse((node) => {
    if (node instanceof THREE.SkinnedMesh) bodyBox2.expandByObject(node)
  })
  const grounded = bodyMeshCount > 0 ? bodyBox2 : new THREE.Box3().setFromObject(fbx)
  fbx.position.y -= grounded.min.y

  return skeleton
}

export function loadCharacterModel(modelUrl) {
  const url = resolveAssetUrl(modelUrl)
  return new Promise((resolve, reject) => {
    fbxLoader.load(
      url,
      (fbx) => {
        try {
          const meshNames = []
          fbx.traverse((child) => {
            if (child instanceof THREE.SkinnedMesh || child instanceof THREE.Mesh) {
              child.castShadow = true
              child.receiveShadow = true
              if (child.name) meshNames.push(child.name)
            }
          })
          const skeleton = normalizeCharacterGroup(fbx)
          const mixer = new THREE.AnimationMixer(fbx)
          resolve({ group: fbx, skeleton, mixer, meshNames })
        } catch (err) {
          reject(err)
        }
      },
      undefined,
      (err) => reject(assetLoadError(url, err)),
    )
  })
}