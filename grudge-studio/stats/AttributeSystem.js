import {
    getEffectiveStatValue,
    getStatEffectiveness,
    getNextPointEffectiveness,
    getStatBreakdown,
    calculatePowerScore,
    getPowerRanking,
    DIMINISHING_RETURNS_THRESHOLD,
    HARD_CAP_THRESHOLD,
    DECAY_RATE,
    POST_CAP_EFFECTIVENESS
} from '../../src/stats/StatsUtils.js'

export {
    getEffectiveStatValue,
    getStatEffectiveness,
    getNextPointEffectiveness,
    getStatBreakdown,
    calculatePowerScore,
    getPowerRanking,
    DIMINISHING_RETURNS_THRESHOLD,
    HARD_CAP_THRESHOLD,
    DECAY_RATE,
    POST_CAP_EFFECTIVENESS
}

export const ATTRIBUTE_DEFINITIONS = {
    Strength: {
        color: '#ef4444',
        description: 'Physical power',
        fullDescription: 'Increases physical damage, carry capacity, and melee effectiveness.',
        statContributions: { damage: 2.0, carryWeight: 5, meleePower: 1.5 }
    },
    Dexterity: {
        color: '#22c55e',
        description: 'Agility and precision',
        fullDescription: 'Improves attack speed, evasion, and ranged accuracy.',
        statContributions: { attackSpeed: 0.02, evasion: 0.3, accuracy: 1.5 }
    },
    Constitution: {
        color: '#f97316',
        description: 'Health and resilience',
        fullDescription: 'Boosts maximum health, stamina, and resistance to status effects.',
        statContributions: { health: 10, stamina: 5, statusResist: 0.2 }
    },
    Intelligence: {
        color: '#3b82f6',
        description: 'Magical aptitude',
        fullDescription: 'Enhances mana pool, spell damage, and cooldown reduction.',
        statContributions: { mana: 8, spellDamage: 1.8, cooldownReduction: 0.15 }
    },
    Wisdom: {
        color: '#a855f7',
        description: 'Mental fortitude',
        fullDescription: 'Improves mana regeneration, experience gain, and magic resistance.',
        statContributions: { manaRegen: 0.5, expBonus: 0.1, magicResist: 0.25 }
    },
    Charisma: {
        color: '#ec4899',
        description: 'Social influence',
        fullDescription: 'Affects NPC relations, shop prices, and companion effectiveness.',
        statContributions: { shopDiscount: 0.2, companionBonus: 0.5, persuasion: 1.0 }
    },
    Luck: {
        color: '#eab308',
        description: 'Fortune and chance',
        fullDescription: 'Increases critical hit chance, loot quality, and dodge chance.',
        statContributions: { criticalChance: 0.25, lootBonus: 0.3, dodgeChance: 0.1 }
    },
    Willpower: {
        color: '#06b6d4',
        description: 'Mental strength',
        fullDescription: 'Boosts defense, crowd control resistance, and focus duration.',
        statContributions: { defense: 1.5, ccResist: 0.3, focusDuration: 0.5 }
    }
}

export const STAT_DESCRIPTIONS = {
    health: 'Maximum health points',
    mana: 'Maximum mana for abilities',
    stamina: 'Maximum stamina for actions',
    damage: 'Base physical damage',
    defense: 'Damage reduction',
    evasion: 'Chance to dodge attacks',
    criticalChance: 'Chance for critical hits',
    attackSpeed: 'Speed multiplier for attacks',
    spellDamage: 'Bonus magical damage',
    manaRegen: 'Mana regeneration per second'
}

export const PERCENTAGE_STATS = new Set([
    'evasion', 'criticalChance', 'attackSpeed', 'cooldownReduction',
    'statusResist', 'magicResist', 'expBonus', 'shopDiscount',
    'lootBonus', 'dodgeChance', 'ccResist'
])

export const TOTAL_POINTS = 160

export class AttributeSystem {
    constructor() {
        this.attributes = {}
        Object.keys(ATTRIBUTE_DEFINITIONS).forEach(attr => {
            this.attributes[attr] = 0
        })
    }

    setAttribute(name, value) {
        if (ATTRIBUTE_DEFINITIONS[name] !== undefined) {
            this.attributes[name] = Math.max(0, Math.min(TOTAL_POINTS, value))
        }
    }

    getAttribute(name) {
        return this.attributes[name] || 0
    }

    getEffectiveAttribute(name) {
        return getEffectiveStatValue(this.getAttribute(name))
    }

    getAttributeBreakdown(name) {
        return getStatBreakdown(this.getAttribute(name))
    }

    getTotalSpent() {
        return Object.values(this.attributes).reduce((sum, v) => sum + v, 0)
    }

    getRemainingPoints() {
        return TOTAL_POINTS - this.getTotalSpent()
    }

    calculateStats() {
        const stats = {
            health: 100, mana: 50, stamina: 100, damage: 10, defense: 5,
            evasion: 0, criticalChance: 5, attackSpeed: 1.0, spellDamage: 0,
            manaRegen: 1, carryWeight: 50, meleePower: 0, accuracy: 50,
            statusResist: 0, cooldownReduction: 0, expBonus: 0, magicResist: 0,
            shopDiscount: 0, companionBonus: 0, persuasion: 0, lootBonus: 0,
            dodgeChance: 0, ccResist: 0, focusDuration: 0
        }

        Object.entries(this.attributes).forEach(([attr, rawValue]) => {
            if (rawValue === 0) return
            const effectiveValue = getEffectiveStatValue(rawValue)
            const def = ATTRIBUTE_DEFINITIONS[attr]
            
            if (def?.statContributions) {
                Object.entries(def.statContributions).forEach(([stat, perPoint]) => {
                    if (stats[stat] !== undefined) {
                        stats[stat] += effectiveValue * perPoint
                    }
                })
            }
        })

        return stats
    }

    reset() {
        Object.keys(this.attributes).forEach(attr => {
            this.attributes[attr] = 0
        })
    }

    randomize() {
        this.reset()
        let remaining = TOTAL_POINTS
        const attrs = Object.keys(this.attributes)
        
        while (remaining > 0) {
            const randomAttr = attrs[Math.floor(Math.random() * attrs.length)]
            const toAdd = Math.min(remaining, Math.floor(Math.random() * 10) + 1)
            this.attributes[randomAttr] += toAdd
            remaining -= toAdd
        }
    }

    toBase64() {
        return btoa(Object.values(this.attributes).join(','))
    }

    fromBase64(encoded) {
        try {
            const values = atob(encoded).split(',').map(Number)
            Object.keys(this.attributes).forEach((key, i) => {
                this.attributes[key] = values[i] || 0
            })
        } catch (e) {
            console.error('Failed to decode build:', e)
        }
    }
}
