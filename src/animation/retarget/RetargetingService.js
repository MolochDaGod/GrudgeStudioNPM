/*
    GRUDGE Studio - Animation Retargeting Service
    Applies animations from one skeleton to another using bone mapping
*/

import * as THREE from 'three'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { HumanoidProfile, createBoneMap } from '../rig/HumanoidProfile.js'

export class RetargetingService {
    constructor() {
        this.cache = new Map()
        this.sourceMappings = new Map()
        this.targetMappings = new Map()
    }
    
    registerSourceSkeleton(id, skeleton, profile = HumanoidProfile) {
        const boneMap = createBoneMap(skeleton, profile)
        this.sourceMappings.set(id, {
            skeleton,
            profile,
            boneMap,
            restPose: this.captureRestPose(skeleton)
        })
        console.log(`[RetargetingService] Registered source skeleton: ${id}`)
    }
    
    registerTargetSkeleton(id, skeleton, profile = HumanoidProfile) {
        const boneMap = createBoneMap(skeleton, profile)
        this.targetMappings.set(id, {
            skeleton,
            profile,
            boneMap,
            restPose: this.captureRestPose(skeleton),
            scaleCompensation: this.calculateScaleCompensation(skeleton, boneMap)
        })
        console.log(`[RetargetingService] Registered target skeleton: ${id}`)
    }
    
    captureRestPose(skeleton) {
        const pose = {}
        skeleton.bones.forEach((bone, index) => {
            pose[bone.name] = {
                position: bone.position.clone(),
                quaternion: bone.quaternion.clone(),
                scale: bone.scale.clone()
            }
        })
        return pose
    }
    
    calculateScaleCompensation(skeleton, boneMap) {
        const hips = boneMap.get('hips')
        const leftFoot = boneMap.get('leftFoot')
        
        if (!hips || !leftFoot) return 1.0
        
        const hipsPos = new THREE.Vector3()
        const footPos = new THREE.Vector3()
        
        hips.bone.getWorldPosition(hipsPos)
        leftFoot.bone.getWorldPosition(footPos)
        
        return hipsPos.y - footPos.y
    }
    
    retargetAnimation(clip, sourceId, targetId) {
        const cacheKey = `${clip.name}_${sourceId}_${targetId}`
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)
        }
        
        const source = this.sourceMappings.get(sourceId)
        const target = this.targetMappings.get(targetId)
        
        if (!source || !target) {
            console.error(`[RetargetingService] Missing mapping: source=${sourceId}, target=${targetId}`)
            return null
        }
        
        const retargetedTracks = []
        
        for (const track of clip.tracks) {
            const boneName = track.name.split('.')[0]
            const property = track.name.split('.')[1]
            
            let canonicalName = null
            for (const [canonical, mapping] of source.boneMap.entries()) {
                if (mapping.originalName === boneName) {
                    canonicalName = canonical
                    break
                }
            }
            
            if (!canonicalName) {
                retargetedTracks.push(track.clone())
                continue
            }
            
            const targetMapping = target.boneMap.get(canonicalName)
            if (!targetMapping) {
                continue
            }
            
            const newTrackName = `${targetMapping.originalName}.${property}`
            
            let newTrack
            if (property === 'quaternion') {
                newTrack = new THREE.QuaternionKeyframeTrack(
                    newTrackName,
                    track.times.slice(),
                    this.retargetRotations(track.values, source, target, canonicalName)
                )
            } else if (property === 'position') {
                newTrack = new THREE.VectorKeyframeTrack(
                    newTrackName,
                    track.times.slice(),
                    this.retargetPositions(track.values, source, target, canonicalName)
                )
            } else {
                newTrack = track.clone()
                newTrack.name = newTrackName
            }
            
            retargetedTracks.push(newTrack)
        }
        
        const retargetedClip = new THREE.AnimationClip(
            `${clip.name}_retargeted`,
            clip.duration,
            retargetedTracks
        )
        
        this.cache.set(cacheKey, retargetedClip)
        console.log(`[RetargetingService] Retargeted: ${clip.name} -> ${targetId}`)
        
        return retargetedClip
    }
    
    retargetRotations(values, source, target, boneName) {
        const result = new Float32Array(values.length)
        
        const sourceRest = source.boneMap.get(boneName)
        const targetRest = target.boneMap.get(boneName)
        
        if (!sourceRest || !targetRest) {
            return values.slice()
        }
        
        const sourceRestQ = source.restPose[sourceRest.originalName]?.quaternion || new THREE.Quaternion()
        const targetRestQ = target.restPose[targetRest.originalName]?.quaternion || new THREE.Quaternion()
        
        const sourceRestInv = sourceRestQ.clone().invert()
        
        const tempQ = new THREE.Quaternion()
        const deltaQ = new THREE.Quaternion()
        
        for (let i = 0; i < values.length; i += 4) {
            tempQ.set(values[i], values[i + 1], values[i + 2], values[i + 3])
            
            deltaQ.copy(sourceRestInv).multiply(tempQ)
            deltaQ.premultiply(targetRestQ)
            
            result[i] = deltaQ.x
            result[i + 1] = deltaQ.y
            result[i + 2] = deltaQ.z
            result[i + 3] = deltaQ.w
        }
        
        return result
    }
    
    retargetPositions(values, source, target, boneName) {
        const result = new Float32Array(values.length)
        
        const scaleFactor = target.scaleCompensation / (source.scaleCompensation || 1)
        
        for (let i = 0; i < values.length; i += 3) {
            result[i] = values[i] * scaleFactor
            result[i + 1] = values[i + 1] * scaleFactor
            result[i + 2] = values[i + 2] * scaleFactor
        }
        
        return result
    }
    
    clearCache() {
        this.cache.clear()
    }
}

export const retargetingService = new RetargetingService()
