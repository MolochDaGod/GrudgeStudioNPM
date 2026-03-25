/*
    GRUDGE Studio - Universal Character
    Combines model, rig profile, and animations into a unified playable character
    Follows Needle Engine best practices for character handling
*/

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { AnimatorComponent, DefaultCombatGraph } from './components/AnimatorComponent.js'
import { retargetingService } from './retarget/RetargetingService.js'
import { animationLoader } from './AnimationLoader.js'
import { HumanoidProfile, validateSkeleton, createBoneMap } from './rig/HumanoidProfile.js'
import { QuadrupedProfile, validateQuadrupedSkeleton } from './rig/QuadrupedProfile.js'
import { getAssetPath } from '../core/paths.js'

function getProfileByName(profileName) {
    switch (profileName) {
        case 'quadruped':
            return QuadrupedProfile
        case 'humanoid':
        default:
            return HumanoidProfile
    }
}

export class UniversalCharacter {
    constructor(config = {}) {
        this.config = {
            id: config.id || `char_${Date.now()}`,
            name: config.name || 'Character',
            modelPath: config.modelPath,
            profile: config.profile || 'humanoid',
            scale: config.scale || 1.0,
            animationPreset: config.animationPreset || 'combatCharacter',
            useRetargeting: config.useRetargeting ?? true,
            ...config
        }
        
        this.root = new THREE.Group()
        this.root.name = this.config.name
        
        this.model = null
        this.skeleton = null
        this.boneMap = null
        this.animator = null
        
        this.isLoaded = false
        this.isReady = false
        
        this.loader = new GLTFLoader()
        
        this.onLoaded = null
        this.onReady = null
        this.onError = null
    }
    
    async load() {
        try {
            await this.loadModel()
            await this.setupSkeleton()
            await this.loadAnimations()
            this.setupAnimator()
            
            this.isLoaded = true
            this.isReady = true
            
            if (this.onLoaded) this.onLoaded(this)
            if (this.onReady) this.onReady(this)
            
            console.log(`[UniversalCharacter] ${this.config.name} ready`)
            return this
        } catch (error) {
            console.error(`[UniversalCharacter] Failed to load ${this.config.name}:`, error)
            if (this.onError) this.onError(error)
            throw error
        }
    }
    
    async loadModel() {
        const path = getAssetPath('/' + this.config.modelPath)
        console.log(`[UniversalCharacter] Loading model: ${path}`)
        
        const gltf = await new Promise((resolve, reject) => {
            this.loader.load(path, resolve, undefined, reject)
        })
        
        this.model = gltf.scene
        this.model.scale.setScalar(this.config.scale)
        
        this.model.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        
        this.root.add(this.model)
        
        if (gltf.animations && gltf.animations.length > 0) {
            this.embeddedAnimations = gltf.animations
            console.log(`[UniversalCharacter] Found ${gltf.animations.length} embedded animations`)
        }
    }
    
    async setupSkeleton() {
        this.model.traverse(child => {
            if (child.isSkinnedMesh && child.skeleton) {
                this.skeleton = child.skeleton
            }
        })
        
        if (!this.skeleton) {
            console.warn(`[UniversalCharacter] No skeleton found in model`)
            return
        }
        
        const profile = getProfileByName(this.config.profile)
        
        const validation = this.config.profile === 'quadruped' 
            ? validateQuadrupedSkeleton(this.skeleton)
            : validateSkeleton(this.skeleton, profile)
        
        this.boneMap = this.config.profile === 'quadruped'
            ? null
            : createBoneMap(this.skeleton, profile)
        
        console.log(`[UniversalCharacter] Skeleton validation (${this.config.profile}):`, {
            valid: validation.valid,
            mapped: Object.keys(validation.mappedBones).length,
            missing: validation.missingRequired
        })
        
        if (this.config.useRetargeting && this.config.profile === 'humanoid') {
            retargetingService.registerTargetSkeleton(
                this.config.id,
                this.skeleton,
                profile
            )
        }
    }
    
    async loadAnimations() {
        const clips = await animationLoader.loadPreset(this.config.animationPreset)
        
        this.clips = new Map()
        
        const canRetarget = this.config.useRetargeting && 
                           this.skeleton && 
                           this.config.profile === 'humanoid' &&
                           retargetingService.sourceMappings.has('spartan')
        
        for (const clip of clips) {
            if (canRetarget) {
                const retargeted = retargetingService.retargetAnimation(
                    clip,
                    'spartan',
                    this.config.id
                )
                if (retargeted) {
                    this.clips.set(clip.name, retargeted)
                } else {
                    this.clips.set(clip.name, clip)
                }
            } else {
                this.clips.set(clip.name, clip)
            }
        }
        
        if (this.embeddedAnimations) {
            for (const clip of this.embeddedAnimations) {
                if (!this.clips.has(clip.name)) {
                    this.clips.set(clip.name, clip)
                }
            }
        }
        
        console.log(`[UniversalCharacter] Loaded ${this.clips.size} animation clips`)
    }
    
    setupAnimator() {
        this.animator = new AnimatorComponent(this.model)
        
        for (const [name, clip] of this.clips) {
            this.animator.addClip(clip, name)
        }
        
        this.animator.setGraph(DefaultCombatGraph)
        
        this.animator.onStateChange = (newState, oldState) => {
            console.log(`[UniversalCharacter] ${this.config.name}: ${oldState} -> ${newState}`)
        }
        
        if (this.clips.has('idle')) {
            this.animator.setState('idle')
            this.animator.play('idle')
        }
    }
    
    update(deltaTime) {
        if (this.animator) {
            this.animator.update(deltaTime)
        }
    }
    
    setPosition(x, y, z) {
        this.root.position.set(x, y, z)
        return this
    }
    
    setRotation(y) {
        this.root.rotation.y = y
        return this
    }
    
    playAnimation(name, options = {}) {
        if (!this.animator) return
        
        if (options.oneShot) {
            this.animator.playOneShot(name, options)
        } else {
            this.animator.setState(name, options.transition || 0.25)
        }
    }
    
    setSpeed(speed) {
        if (this.animator) {
            this.animator.setParameter('speed', speed)
        }
    }
    
    attack(attackNum = 1) {
        const attackName = `attack_${attackNum}`
        if (this.clips.has(attackName)) {
            this.animator.playOneShot(attackName, { fadeIn: 0.1, fadeOut: 0.2 })
        }
    }
    
    block(isBlocking) {
        if (this.animator) {
            this.animator.setParameter('isBlocking', isBlocking)
            if (isBlocking) {
                this.animator.setState('block', 0.1)
            } else {
                this.animator.setState('idle', 0.2)
            }
        }
    }
    
    takeDamage() {
        if (this.clips.has('hit_damage')) {
            this.animator.playOneShot('hit_damage', { fadeIn: 0.05, fadeOut: 0.2 })
        }
    }
    
    die() {
        if (this.animator) {
            this.animator.setParameter('isDead', true)
        }
    }
    
    getRoot() {
        return this.root
    }
    
    getModel() {
        return this.model
    }
    
    getAnimator() {
        return this.animator
    }
    
    getBoneMap() {
        return this.boneMap
    }
    
    dispose() {
        if (this.animator) {
            this.animator.dispose()
        }
        
        this.model?.traverse(child => {
            if (child.geometry) child.geometry.dispose()
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose())
                } else {
                    child.material.dispose()
                }
            }
        })
        
        this.root.clear()
    }
}

export const CharacterPresets = {
    viking: {
        id: 'viking',
        name: 'Viking Warrior',
        modelPath: 'models/characters/viking/scene.gltf',
        profile: 'humanoid',
        scale: 1.0,
        animationPreset: 'combatCharacter'
    },
    orc: {
        id: 'orc',
        name: 'Orc Warrior',
        modelPath: 'models/characters/orc/scene.gltf',
        profile: 'humanoid',
        scale: 1.0,
        animationPreset: 'combatCharacter'
    },
    shepherd: {
        id: 'shepherd',
        name: 'German Shepherd',
        modelPath: 'models/characters/shepherd/scene.gltf',
        profile: 'quadruped',
        scale: 1.0,
        animationPreset: 'locomotionOnly'
    },
    wolf: {
        id: 'wolf',
        name: 'Shadow Wolf',
        modelPath: 'models/characters/wolf/scene.gltf',
        profile: 'quadruped',
        scale: 1.0,
        animationPreset: 'locomotionOnly'
    }
}

export async function createCharacter(presetOrConfig) {
    const config = typeof presetOrConfig === 'string' 
        ? CharacterPresets[presetOrConfig] 
        : presetOrConfig
    
    if (!config) {
        throw new Error(`Unknown character preset: ${presetOrConfig}`)
    }
    
    const character = new UniversalCharacter(config)
    await character.load()
    return character
}
