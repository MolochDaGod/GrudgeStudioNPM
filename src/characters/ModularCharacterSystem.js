import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EventEmitter } from '../core/EventEmitter.js'

export const BONE_HIERARCHY = {
    root: 'Armature',
    hips: 'Hips',
    spine: 'Spine',
    spine1: 'Spine1',
    spine2: 'Spine2',
    neck: 'Neck',
    head: 'Head',
    leftShoulder: 'LeftShoulder',
    leftArm: 'LeftArm',
    leftForeArm: 'LeftForeArm',
    leftHand: 'LeftHand',
    rightShoulder: 'RightShoulder',
    rightArm: 'RightArm',
    rightForeArm: 'RightForeArm',
    rightHand: 'RightHand',
    leftUpLeg: 'LeftUpLeg',
    leftLeg: 'LeftLeg',
    leftFoot: 'LeftFoot',
    rightUpLeg: 'RightUpLeg',
    rightLeg: 'RightLeg',
    rightFoot: 'RightFoot'
}

export const BODY_SLOTS = {
    HEAD: 'head',
    TORSO: 'torso',
    LEFT_ARM: 'leftArm',
    RIGHT_ARM: 'rightArm',
    LEFT_LEG: 'leftLeg',
    RIGHT_LEG: 'rightLeg',
    ACCESSORY_HEAD: 'accessoryHead',
    ACCESSORY_BACK: 'accessoryBack',
    WEAPON_RIGHT: 'weaponRight',
    WEAPON_LEFT: 'weaponLeft'
}

export const STANDARD_ANIMATIONS = {
    idle: 'idle',
    walk: 'walk',
    run: 'run',
    jump: 'jump',
    attack_light: 'attack_light',
    attack_heavy: 'attack_heavy',
    block: 'block',
    hit: 'hit',
    death: 'death'
}

export class ModularCharacterSystem {
    constructor() {
        this.loader = new GLTFLoader()
        this.cache = new Map()
        this.loadingQueue = []
        this.isLoading = false
        this.events = new EventEmitter()
        this.basePath = '/models/characters/'
        this.cloudBucket = null
        this.maxCacheSize = 50
    }

    setCloudBucket(bucketUrl) {
        this.cloudBucket = bucketUrl
    }

    getAssetPath(assetName) {
        if (this.cloudBucket) {
            return `${this.cloudBucket}/${assetName}`
        }
        return `${this.basePath}${assetName}`
    }

    async loadAsset(assetName, options = {}) {
        const cacheKey = options.cacheKey || assetName
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)
            return cached.scene.clone()
        }

        const path = this.getAssetPath(assetName)
        
        this.events.emit('loadStart', { asset: assetName })
        
        try {
            const gltf = await this.loader.loadAsync(path)
            
            this.cache.set(cacheKey, {
                scene: gltf.scene,
                animations: gltf.animations,
                loadedAt: Date.now()
            })
            
            this.evictCacheIfNeeded()
            
            this.events.emit('loadComplete', { asset: assetName })
            
            return gltf.scene.clone()
        } catch (error) {
            this.events.emit('loadError', { asset: assetName, error })
            throw error
        }
    }

    async loadWithAnimations(assetName) {
        const cacheKey = assetName
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)
            return {
                scene: cached.scene.clone(),
                animations: cached.animations
            }
        }

        const path = this.getAssetPath(assetName)
        
        try {
            const gltf = await this.loader.loadAsync(path)
            
            this.cache.set(cacheKey, {
                scene: gltf.scene,
                animations: gltf.animations,
                loadedAt: Date.now()
            })
            
            return {
                scene: gltf.scene.clone(),
                animations: gltf.animations
            }
        } catch (error) {
            console.error(`Failed to load ${assetName}:`, error)
            throw error
        }
    }

    async preloadAssets(assetList, onProgress) {
        const total = assetList.length
        let loaded = 0

        const promises = assetList.map(async (asset) => {
            await this.loadAsset(asset)
            loaded++
            if (onProgress) {
                onProgress(loaded / total, asset)
            }
        })

        await Promise.all(promises)
    }

    evictCacheIfNeeded() {
        if (this.cache.size > this.maxCacheSize) {
            let oldest = null
            let oldestTime = Infinity
            
            for (const [key, value] of this.cache) {
                if (value.loadedAt < oldestTime) {
                    oldestTime = value.loadedAt
                    oldest = key
                }
            }
            
            if (oldest) {
                this.cache.delete(oldest)
            }
        }
    }

    clearCache() {
        this.cache.clear()
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            assets: Array.from(this.cache.keys())
        }
    }
}

export const modularCharacterSystem = new ModularCharacterSystem()
