import { BODY_SLOTS, STANDARD_ANIMATIONS } from './ModularCharacterSystem.js'

const STORAGE_KEY = 'grudge_character_configs'

export class CharacterConfigManager {
    constructor() {
        this.configs = new Map()
        this.loadFromStorage()
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const data = JSON.parse(stored)
                Object.entries(data).forEach(([id, config]) => {
                    this.configs.set(id, config)
                })
            }
        } catch (error) {
            console.warn('Failed to load character configs from storage:', error)
        }
    }

    saveToStorage() {
        try {
            const data = Object.fromEntries(this.configs)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        } catch (error) {
            console.warn('Failed to save character configs:', error)
        }
    }

    createConfig(options = {}) {
        const id = options.id || `char_${Date.now()}`
        
        const config = {
            id,
            name: options.name || 'New Character',
            base: options.base || 'base_character.glb',
            parts: {
                [BODY_SLOTS.HEAD]: options.head || null,
                [BODY_SLOTS.TORSO]: options.torso || null,
                [BODY_SLOTS.LEFT_ARM]: options.leftArm || null,
                [BODY_SLOTS.RIGHT_ARM]: options.rightArm || null,
                [BODY_SLOTS.LEFT_LEG]: options.leftLeg || null,
                [BODY_SLOTS.RIGHT_LEG]: options.rightLeg || null
            },
            accessories: options.accessories || [],
            animations: {
                [STANDARD_ANIMATIONS.idle]: options.idleAnim || 'idle',
                [STANDARD_ANIMATIONS.walk]: options.walkAnim || 'walk',
                [STANDARD_ANIMATIONS.run]: options.runAnim || 'run',
                [STANDARD_ANIMATIONS.jump]: options.jumpAnim || 'jump',
                [STANDARD_ANIMATIONS.attack_light]: options.attackLightAnim || 'attack_light',
                [STANDARD_ANIMATIONS.attack_heavy]: options.attackHeavyAnim || 'attack_heavy',
                [STANDARD_ANIMATIONS.block]: options.blockAnim || 'block',
                [STANDARD_ANIMATIONS.hit]: options.hitAnim || 'hit',
                [STANDARD_ANIMATIONS.death]: options.deathAnim || 'death'
            },
            stats: {
                strength: options.strength || 10,
                dexterity: options.dexterity || 10,
                constitution: options.constitution || 10,
                intelligence: options.intelligence || 10,
                wisdom: options.wisdom || 10,
                charisma: options.charisma || 10,
                luck: options.luck || 10,
                willpower: options.willpower || 10
            },
            appearance: {
                skinColor: options.skinColor || '#c9a882',
                hairColor: options.hairColor || '#3d2b1f',
                eyeColor: options.eyeColor || '#4a7c59',
                scale: options.scale || 1.0
            },
            metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
                version: 1
            }
        }

        this.configs.set(id, config)
        this.saveToStorage()
        
        return config
    }

    getConfig(id) {
        return this.configs.get(id) || null
    }

    updateConfig(id, updates) {
        const config = this.configs.get(id)
        if (!config) return null

        const updated = this.deepMerge(config, updates)
        updated.metadata.updatedAt = Date.now()
        updated.metadata.version++
        
        this.configs.set(id, updated)
        this.saveToStorage()
        
        return updated
    }

    deepMerge(target, source) {
        const result = { ...target }
        
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key])
            } else {
                result[key] = source[key]
            }
        }
        
        return result
    }

    deleteConfig(id) {
        const deleted = this.configs.delete(id)
        if (deleted) {
            this.saveToStorage()
        }
        return deleted
    }

    getAllConfigs() {
        return Array.from(this.configs.values())
    }

    exportConfig(id) {
        const config = this.configs.get(id)
        if (!config) return null
        return JSON.stringify(config, null, 2)
    }

    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString)
            if (!config.id) {
                config.id = `char_${Date.now()}`
            }
            config.metadata = config.metadata || {}
            config.metadata.importedAt = Date.now()
            
            this.configs.set(config.id, config)
            this.saveToStorage()
            
            return config
        } catch (error) {
            console.error('Failed to import config:', error)
            return null
        }
    }

    duplicateConfig(id, newName) {
        const original = this.configs.get(id)
        if (!original) return null

        const duplicate = JSON.parse(JSON.stringify(original))
        duplicate.id = `char_${Date.now()}`
        duplicate.name = newName || `${original.name} (Copy)`
        duplicate.metadata.createdAt = Date.now()
        duplicate.metadata.updatedAt = Date.now()
        
        this.configs.set(duplicate.id, duplicate)
        this.saveToStorage()
        
        return duplicate
    }
}

export const CHARACTER_PRESETS = {
    warrior: {
        name: 'Warrior',
        base: 'gladiator.glb',
        stats: { strength: 15, constitution: 14, dexterity: 10 }
    },
    rogue: {
        name: 'Rogue',
        base: 'base_character.glb',
        stats: { dexterity: 15, luck: 14, strength: 10 }
    },
    mage: {
        name: 'Mage',
        base: 'swimmer.glb',
        stats: { intelligence: 15, wisdom: 14, willpower: 12 }
    },
    berserker: {
        name: 'Berserker',
        base: 'orc/scene.gltf',
        stats: { strength: 18, constitution: 12, willpower: 8 }
    },
    beast: {
        name: 'Beast',
        base: 'wolf/scene.gltf',
        stats: { dexterity: 16, strength: 14, constitution: 10 }
    }
}

export const characterConfigManager = new CharacterConfigManager()
