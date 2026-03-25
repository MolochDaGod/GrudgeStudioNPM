import { getEffectiveStatValue, calculatePowerScore, getPowerRanking, getStatBreakdown } from './StatsUtils.js'

let characterStorageModule = null

async function getCharacterStorage() {
    if (!characterStorageModule) {
        try {
            const module = await import('../storage/CharacterStorageService.js')
            characterStorageModule = module.characterStorage
        } catch (e) {
            console.warn('[SkillTreeStats] CharacterStorage not available:', e)
        }
    }
    return characterStorageModule
}

export class SkillTreeStats {
    constructor() {
        this.storageKey = 'grudge_skill_tree'
        this.characterId = 'default'
        this.baseStats = {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        }
        this.effectiveStats = {}
        this.derivedStats = {}
        this.skills = new Map()
        this.skillPoints = 0
        this.level = 1
        this.powerScore = 0
        this.powerRanking = null
        this.cloudSyncEnabled = true
        this.lastCloudSync = 0
        
        this.load()
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey)
            if (data) {
                const parsed = JSON.parse(data)
                this.baseStats = parsed.baseStats || this.baseStats
                this.skills = new Map(parsed.skills || [])
                this.skillPoints = parsed.skillPoints || 0
                this.level = parsed.level || 1
            }
        } catch (e) {
            console.warn('Failed to load skill tree:', e)
        }
        
        this.recalculateDerived()
        
        if (this.cloudSyncEnabled) {
            this.loadFromCloud()
        }
    }

    async loadFromCloud() {
        try {
            const storage = await getCharacterStorage()
            if (!storage) return

            const result = await storage.loadSkillTree(this.characterId)
            if (result.source === 'cloud' && result.data) {
                const cloudData = result.data
                const localTime = parseInt(localStorage.getItem(`${this.storageKey}_modified`) || '0')
                
                if (cloudData.lastModified > localTime) {
                    this.baseStats = cloudData.baseStats || this.baseStats
                    this.skills = new Map(cloudData.skills || [])
                    this.skillPoints = cloudData.skillPoints || 0
                    this.level = cloudData.level || 1
                    this.recalculateDerived()
                    console.log('[SkillTreeStats] Loaded from cloud')
                }
            }
        } catch (e) {
            console.warn('[SkillTreeStats] Cloud load failed:', e)
        }
    }

    save() {
        try {
            const data = {
                baseStats: this.baseStats,
                skills: Array.from(this.skills.entries()),
                skillPoints: this.skillPoints,
                level: this.level
            }
            localStorage.setItem(this.storageKey, JSON.stringify(data))
            localStorage.setItem(`${this.storageKey}_modified`, Date.now().toString())
            
            if (this.cloudSyncEnabled) {
                this.saveToCloud(data)
            }
        } catch (e) {
            console.warn('Failed to save skill tree:', e)
        }
    }

    async saveToCloud(data) {
        try {
            const storage = await getCharacterStorage()
            if (!storage) return

            await storage.saveSkillTree(data, this.characterId)
            this.lastCloudSync = Date.now()
        } catch (e) {
            console.warn('[SkillTreeStats] Cloud save failed:', e)
        }
    }

    setCharacterId(id) {
        this.characterId = id
        this.load()
    }

    enableCloudSync(enabled) {
        this.cloudSyncEnabled = enabled
        if (enabled) {
            this.loadFromCloud()
        }
    }

    recalculateDerived() {
        this.effectiveStats = {}
        for (const [stat, value] of Object.entries(this.baseStats)) {
            this.effectiveStats[stat] = getEffectiveStatValue(value)
        }
        
        const str = this.effectiveStats.strength
        const dex = this.effectiveStats.dexterity
        const con = this.effectiveStats.constitution
        const int = this.effectiveStats.intelligence
        const wis = this.effectiveStats.wisdom

        this.derivedStats = {
            maxHealth: 100 + (con - 10) * 10 + this.level * 10,
            attackDamage: 10 + (str - 10) * 2,
            attackSpeed: 1 + (dex - 10) * 0.03,
            criticalChance: 5 + (dex - 10) * 0.5,
            criticalDamage: 150 + (str - 10) * 5,
            defense: (con - 10) * 2,
            blockEfficiency: 50 + (con - 10) * 2,
            moveSpeed: 5 + (dex - 10) * 0.2,
            manaPool: 50 + (int - 10) * 10,
            magicDamage: 10 + (int - 10) * 2,
            cooldownReduction: (wis - 10) * 0.5,
            healthRegen: 1 + (con - 10) * 0.1,
            dodgeChance: (dex - 10) * 0.3
        }

        this.skills.forEach((level, skillId) => {
            this.applySkillBonuses(skillId, level)
        })
        
        this.powerScore = calculatePowerScore({
            ...this.baseStats,
            maxHealth: this.derivedStats.maxHealth,
            attackPower: this.derivedStats.attackDamage,
            defense: this.derivedStats.defense
        })
        this.powerRanking = getPowerRanking(this.powerScore)
    }

    applySkillBonuses(skillId, level) {
        const skillBonuses = {
            'power_strike': { attackDamage: level * 3 },
            'swift_feet': { moveSpeed: level * 0.3, dodgeChance: level * 1 },
            'iron_skin': { defense: level * 3, maxHealth: level * 15 },
            'battle_focus': { criticalChance: level * 2, criticalDamage: level * 10 },
            'berserker': { attackDamage: level * 5, attackSpeed: level * 0.02 },
            'guardian': { blockEfficiency: level * 5, defense: level * 2 },
            'arcane_power': { magicDamage: level * 4, manaPool: level * 10 },
            'quick_recovery': { healthRegen: level * 0.5, cooldownReduction: level * 1 }
        }

        const bonuses = skillBonuses[skillId]
        if (bonuses) {
            Object.entries(bonuses).forEach(([stat, value]) => {
                if (this.derivedStats[stat] !== undefined) {
                    this.derivedStats[stat] += value
                }
            })
        }
    }

    upgradeSkill(skillId) {
        if (this.skillPoints <= 0) return false

        const currentLevel = this.skills.get(skillId) || 0
        const maxLevel = 5

        if (currentLevel >= maxLevel) return false

        this.skills.set(skillId, currentLevel + 1)
        this.skillPoints--
        this.recalculateDerived()
        this.save()

        return true
    }

    setStat(statName, value) {
        if (this.baseStats[statName] !== undefined) {
            this.baseStats[statName] = Math.max(1, Math.min(30, value))
            this.recalculateDerived()
            this.save()
        }
    }

    addStatPoints(statName, points) {
        if (this.baseStats[statName] !== undefined) {
            this.baseStats[statName] = Math.max(1, Math.min(30, this.baseStats[statName] + points))
            this.recalculateDerived()
            this.save()
        }
    }

    addSkillPoints(points) {
        this.skillPoints += points
        this.save()
    }

    levelUp() {
        this.level++
        this.skillPoints += 1
        this.recalculateDerived()
        this.save()
    }

    getBaseStat(statName) {
        return this.baseStats[statName] || 0
    }

    getDerivedStat(statName) {
        return this.derivedStats[statName] || 0
    }

    getSkillLevel(skillId) {
        return this.skills.get(skillId) || 0
    }

    getAllStats() {
        return {
            base: { ...this.baseStats },
            effective: { ...this.effectiveStats },
            derived: { ...this.derivedStats },
            level: this.level,
            skillPoints: this.skillPoints,
            powerScore: this.powerScore,
            powerRanking: this.powerRanking
        }
    }
    
    getStatBreakdown(statName) {
        const rawValue = this.baseStats[statName]
        if (rawValue === undefined) return null
        return getStatBreakdown(rawValue)
    }
    
    getPowerScore() {
        return this.powerScore
    }
    
    getPowerRanking() {
        return this.powerRanking
    }

    applyToFighter(fighterConfig) {
        return {
            ...fighterConfig,
            maxHealth: this.derivedStats.maxHealth,
            attackDamage: this.derivedStats.attackDamage,
            attackSpeed: this.derivedStats.attackSpeed,
            criticalChance: this.derivedStats.criticalChance,
            criticalDamage: this.derivedStats.criticalDamage,
            defense: this.derivedStats.defense,
            blockEfficiency: this.derivedStats.blockEfficiency,
            moveSpeed: this.derivedStats.moveSpeed,
            dodgeChance: this.derivedStats.dodgeChance
        }
    }

    reset() {
        this.baseStats = {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10
        }
        this.skills.clear()
        this.skillPoints = this.level - 1
        this.recalculateDerived()
        this.save()
    }
}

export const skillTreeStats = new SkillTreeStats()
