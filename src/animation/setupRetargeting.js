/*
    GRUDGE Studio - Retargeting Setup
    Registers source skeletons for animation retargeting
*/

import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { retargetingService } from './retarget/RetargetingService.js'
import { HumanoidProfile } from './rig/HumanoidProfile.js'
import { getAssetPath } from '../core/paths.js'

let isInitialized = false

export async function initializeRetargeting() {
    if (isInitialized) return
    
    console.log('[Retargeting] Initializing source skeletons...')
    
    try {
        await registerSpartanSkeleton()
        isInitialized = true
        console.log('[Retargeting] Initialization complete')
    } catch (error) {
        console.error('[Retargeting] Initialization failed:', error)
    }
}

async function registerSpartanSkeleton() {
    const loader = new FBXLoader()
    const path = getAssetPath('/models/characters/spartan/Animations/Spartan@idle.fbx')
    
    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (fbx) => {
                let skeleton = null
                fbx.traverse(child => {
                    if (child.isSkinnedMesh && child.skeleton) {
                        skeleton = child.skeleton
                    }
                })
                
                if (skeleton) {
                    retargetingService.registerSourceSkeleton('spartan', skeleton, HumanoidProfile)
                    console.log('[Retargeting] Registered Spartan skeleton as source')
                    resolve()
                } else {
                    console.warn('[Retargeting] No skeleton found in Spartan FBX')
                    resolve()
                }
            },
            undefined,
            (error) => {
                console.warn('[Retargeting] Could not load Spartan skeleton, retargeting disabled:', error.message)
                resolve()
            }
        )
    })
}

export function isRetargetingReady() {
    return isInitialized
}
