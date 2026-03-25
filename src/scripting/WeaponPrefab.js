/*
    GRUDGE Studio - Weapon Prefab System
    Links weapon models, scripts, skill trees, and animations
*/

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { scriptManager } from './ScriptManager.js'

export class WeaponPrefab {
    constructor(config = {}) {
        this.id = config.id || 'weapon_' + Date.now()
        this.name = config.name || 'Unnamed Weapon'
        this.type = config.type || 'melee'
        
        this.modelPath = config.modelPath || null
        this.scriptPath = config.scriptPath || null
        this.skillTreeId = config.skillTreeId || null
        
        this.animations = {
            idle: config.animations?.idle || 'idle',
            attack1: config.animations?.attack1 || 'attack_1',
            attack2: config.animations?.attack2 || 'attack_2',
            attack3: config.animations?.attack3 || 'attack_3',
            special: config.animations?.special || 'special',
            block: config.animations?.block || 'block'
        }
        
        this.stats = {
            baseDamage: config.stats?.baseDamage || 10,
            attackSpeed: config.stats?.attackSpeed || 1.0,
            range: config.stats?.range || 2.0,
            critChance: config.stats?.critChance || 5,
            critMultiplier: config.stats?.critMultiplier || 1.5
        }
        
        this.attachPoint = config.attachPoint || 'rightHand'
        this.offset = config.offset || new THREE.Vector3(0, 0, 0)
        this.rotation = config.rotation || new THREE.Euler(0, 0, 0)
        this.scale = config.scale || 1.0
        
        this.model = null
        this.mixer = null
        this.clips = new Map()
        this.loaded = false
        this.script = null
    }

    async load() {
        const promises = []
        
        if (this.modelPath) {
            promises.push(this.loadModel())
        }
        
        if (this.scriptPath) {
            promises.push(this.loadScript())
        }
        
        await Promise.all(promises)
        this.loaded = true
        
        console.log(`[WeaponPrefab] Loaded: ${this.name}`)
        return this
    }

    async loadModel() {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader()
            
            loader.load(
                this.modelPath,
                (gltf) => {
                    this.model = gltf.scene
                    this.model.name = this.id
                    
                    this.model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true
                        }
                    })
                    
                    this.model.scale.setScalar(this.scale)
                    this.model.position.copy(this.offset)
                    this.model.rotation.copy(this.rotation)
                    
                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(this.model)
                        
                        gltf.animations.forEach((clip) => {
                            this.clips.set(clip.name, clip)
                        })
                    }
                    
                    resolve(this.model)
                },
                undefined,
                (error) => {
                    console.error(`[WeaponPrefab] Failed to load model: ${this.modelPath}`, error)
                    reject(error)
                }
            )
        })
    }

    async loadScript() {
        const scriptInfo = await scriptManager.loadWeaponScript(this.scriptPath)
        if (scriptInfo) {
            this.script = scriptInfo
            scriptManager.runScript(scriptInfo.key)
        }
        return scriptInfo
    }

    playAnimation(animName, fadeTime = 0.2, loop = true) {
        if (!this.mixer) return null
        
        const clipName = this.animations[animName] || animName
        const clip = this.clips.get(clipName)
        
        if (!clip) {
            console.warn(`[WeaponPrefab] Animation not found: ${clipName}`)
            return null
        }
        
        const action = this.mixer.clipAction(clip)
        action.reset()
        action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce)
        action.clampWhenFinished = !loop
        action.fadeIn(fadeTime)
        action.play()
        
        return action
    }

    stopAnimation(animName, fadeTime = 0.2) {
        if (!this.mixer) return
        
        const clipName = this.animations[animName] || animName
        const clip = this.clips.get(clipName)
        
        if (clip) {
            const action = this.mixer.existingAction(clip)
            if (action) {
                action.fadeOut(fadeTime)
            }
        }
    }

    stopAllAnimations(fadeTime = 0.2) {
        if (!this.mixer) return
        this.mixer.stopAllAction()
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
    }

    attach(skeleton, boneName) {
        if (!this.model) return false
        
        const bone = skeleton.getBoneByName(boneName || this.attachPoint)
        if (bone) {
            bone.add(this.model)
            return true
        }
        
        console.warn(`[WeaponPrefab] Bone not found: ${boneName}`)
        return false
    }

    detach() {
        if (this.model && this.model.parent) {
            this.model.parent.remove(this.model)
        }
    }

    callScriptFunction(funcName, ...args) {
        if (!this.script) return null
        return scriptManager.callScriptFunction(funcName, ...args)
    }

    attack() {
        return this.callScriptFunction('weapon:attack')
    }

    block() {
        return this.callScriptFunction('weapon:block')
    }

    special() {
        return this.callScriptFunction('weapon:special')
    }

    getStats() {
        const skillBonuses = this.getSkillBonuses()
        
        return {
            damage: this.stats.baseDamage * (1 + skillBonuses.damage / 100),
            attackSpeed: this.stats.attackSpeed * (1 + skillBonuses.speed / 100),
            range: this.stats.range,
            critChance: this.stats.critChance + skillBonuses.crit,
            critMultiplier: this.stats.critMultiplier
        }
    }

    getSkillBonuses() {
        if (!this.skillTreeId) {
            return { damage: 0, speed: 0, crit: 0, defense: 0 }
        }
        
        const saved = localStorage.getItem(`grudge_weapon_tree_${this.skillTreeId}`)
        if (saved) {
            try {
                const data = JSON.parse(saved)
                return data.bonuses || { damage: 0, speed: 0, crit: 0, defense: 0 }
            } catch (e) {
                return { damage: 0, speed: 0, crit: 0, defense: 0 }
            }
        }
        
        return { damage: 0, speed: 0, crit: 0, defense: 0 }
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            modelPath: this.modelPath,
            scriptPath: this.scriptPath,
            skillTreeId: this.skillTreeId,
            animations: this.animations,
            stats: this.stats,
            attachPoint: this.attachPoint,
            offset: { x: this.offset.x, y: this.offset.y, z: this.offset.z },
            rotation: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z },
            scale: this.scale
        }
    }

    static fromJSON(json) {
        const config = {
            ...json,
            offset: new THREE.Vector3(json.offset?.x || 0, json.offset?.y || 0, json.offset?.z || 0),
            rotation: new THREE.Euler(json.rotation?.x || 0, json.rotation?.y || 0, json.rotation?.z || 0)
        }
        return new WeaponPrefab(config)
    }

    dispose() {
        this.detach()
        
        if (this.model) {
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.geometry?.dispose()
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose())
                        } else {
                            child.material.dispose()
                        }
                    }
                }
            })
        }
        
        if (this.mixer) {
            this.mixer.stopAllAction()
            this.mixer.uncacheRoot(this.model)
        }
        
        this.clips.clear()
        this.model = null
        this.mixer = null
        this.loaded = false
    }
}

export class WeaponPrefabManager {
    constructor() {
        this.prefabs = new Map()
        this.equipped = null
    }

    register(prefab) {
        this.prefabs.set(prefab.id, prefab)
        console.log(`[WeaponPrefabManager] Registered: ${prefab.name}`)
    }

    async load(prefabId) {
        const prefab = this.prefabs.get(prefabId)
        if (prefab && !prefab.loaded) {
            await prefab.load()
        }
        return prefab
    }

    equip(prefabId, skeleton, boneName) {
        if (this.equipped) {
            this.equipped.detach()
        }
        
        const prefab = this.prefabs.get(prefabId)
        if (prefab) {
            prefab.attach(skeleton, boneName)
            this.equipped = prefab
            return true
        }
        
        return false
    }

    unequip() {
        if (this.equipped) {
            this.equipped.detach()
            this.equipped = null
        }
    }

    getEquipped() {
        return this.equipped
    }

    update(deltaTime) {
        if (this.equipped) {
            this.equipped.update(deltaTime)
        }
    }

    savePrefabs() {
        const data = {}
        this.prefabs.forEach((prefab, id) => {
            data[id] = prefab.toJSON()
        })
        localStorage.setItem('grudge_weapon_prefabs', JSON.stringify(data))
    }

    loadPrefabs() {
        const saved = localStorage.getItem('grudge_weapon_prefabs')
        if (saved) {
            try {
                const data = JSON.parse(saved)
                Object.entries(data).forEach(([id, json]) => {
                    const prefab = WeaponPrefab.fromJSON(json)
                    this.register(prefab)
                })
            } catch (e) {
                console.error('[WeaponPrefabManager] Failed to load prefabs:', e)
            }
        }
    }

    dispose() {
        this.unequip()
        this.prefabs.forEach(prefab => prefab.dispose())
        this.prefabs.clear()
    }
}

export const weaponPrefabManager = new WeaponPrefabManager()
