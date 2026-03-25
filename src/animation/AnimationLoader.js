/*
    GRUDGE Studio - Animation Loader
    Loads and caches animation clips from FBX/GLTF files
*/

import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getAssetPath } from '../core/paths.js'
import { AnimationManifest } from './AnimationManifest.js'

export class AnimationLoader {
    constructor() {
        this.fbxLoader = new FBXLoader()
        this.gltfLoader = new GLTFLoader()
        this.cache = new Map()
        this.loading = new Map()
    }
    
    async loadClip(clipId) {
        if (this.cache.has(clipId)) {
            return this.cache.get(clipId)
        }
        
        if (this.loading.has(clipId)) {
            return this.loading.get(clipId)
        }
        
        const manifest = AnimationManifest.clips[clipId]
        if (!manifest) {
            console.error(`[AnimationLoader] Unknown clip: ${clipId}`)
            return null
        }
        
        const loadPromise = this.loadFromPath(manifest.path, clipId)
        this.loading.set(clipId, loadPromise)
        
        try {
            const clip = await loadPromise
            if (clip) {
                clip.name = clipId
                this.cache.set(clipId, clip)
            }
            return clip
        } finally {
            this.loading.delete(clipId)
        }
    }
    
    async loadFromPath(path, name) {
        const fullPath = getAssetPath('/' + path)
        const ext = path.split('.').pop().toLowerCase()
        
        console.log(`[AnimationLoader] Loading: ${path}`)
        
        try {
            if (ext === 'fbx') {
                return await this.loadFBX(fullPath, name)
            } else if (ext === 'gltf' || ext === 'glb') {
                return await this.loadGLTF(fullPath, name)
            } else {
                console.error(`[AnimationLoader] Unsupported format: ${ext}`)
                return null
            }
        } catch (error) {
            console.error(`[AnimationLoader] Failed to load ${path}:`, error)
            return null
        }
    }
    
    async loadFBX(path, name) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                path,
                (fbx) => {
                    if (fbx.animations && fbx.animations.length > 0) {
                        const clip = fbx.animations[0]
                        clip.name = name
                        console.log(`[AnimationLoader] Loaded FBX clip: ${name} (${clip.duration.toFixed(2)}s)`)
                        resolve(clip)
                    } else {
                        console.warn(`[AnimationLoader] No animations in FBX: ${path}`)
                        resolve(null)
                    }
                },
                undefined,
                reject
            )
        })
    }
    
    async loadGLTF(path, name) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    if (gltf.animations && gltf.animations.length > 0) {
                        const clip = gltf.animations[0]
                        clip.name = name
                        console.log(`[AnimationLoader] Loaded GLTF clip: ${name} (${clip.duration.toFixed(2)}s)`)
                        resolve(clip)
                    } else {
                        console.warn(`[AnimationLoader] No animations in GLTF: ${path}`)
                        resolve(null)
                    }
                },
                undefined,
                reject
            )
        })
    }
    
    async loadMultiple(clipIds) {
        const promises = clipIds.map(id => this.loadClip(id))
        const clips = await Promise.all(promises)
        return clips.filter(clip => clip !== null)
    }
    
    async loadPreset(presetName) {
        const preset = AnimationManifest.presets[presetName]
        if (!preset) {
            console.error(`[AnimationLoader] Unknown preset: ${presetName}`)
            return []
        }
        return this.loadMultiple(preset.clips)
    }
    
    async loadCategory(category) {
        const cat = AnimationManifest.categories[category]
        if (!cat) {
            console.error(`[AnimationLoader] Unknown category: ${category}`)
            return []
        }
        return this.loadMultiple(cat.clips)
    }
    
    getFromCache(clipId) {
        return this.cache.get(clipId) || null
    }
    
    isLoaded(clipId) {
        return this.cache.has(clipId)
    }
    
    clearCache() {
        this.cache.clear()
    }
    
    getCacheStats() {
        return {
            loaded: this.cache.size,
            loading: this.loading.size,
            clips: Array.from(this.cache.keys())
        }
    }
}

export const animationLoader = new AnimationLoader()
