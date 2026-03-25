export class ClassDetection {
    constructor(attributeSystem) {
        this.attributeSystem = attributeSystem
        
        this.archetypes = [
            {
                name: 'Berserker',
                tier: 'Mythic',
                className: 'mythic',
                description: 'A fearsome warrior who channels rage into devastating attacks.',
                requirements: { Strength: 40, Constitution: 30 }
            },
            {
                name: 'Archmage',
                tier: 'Mythic',
                className: 'mythic',
                description: 'Master of the arcane arts with unrivaled magical power.',
                requirements: { Intelligence: 40, Wisdom: 30 }
            },
            {
                name: 'Shadow Dancer',
                tier: 'Mythic',
                className: 'mythic',
                description: 'A deadly assassin who strikes from the shadows.',
                requirements: { Dexterity: 40, Luck: 25 }
            },
            {
                name: 'Paladin',
                tier: 'Legendary',
                className: 'legendary',
                description: 'Holy warrior blessed with divine protection.',
                requirements: { Strength: 30, Willpower: 30, Charisma: 20 }
            },
            {
                name: 'Battlemage',
                tier: 'Legendary',
                className: 'legendary',
                description: 'Warrior-mage combining martial and magical prowess.',
                requirements: { Strength: 25, Intelligence: 30, Constitution: 20 }
            },
            {
                name: 'Ranger',
                tier: 'Legendary',
                className: 'legendary',
                description: 'Swift hunter with deadly precision.',
                requirements: { Dexterity: 30, Wisdom: 20, Luck: 20 }
            },
            {
                name: 'Warrior',
                tier: 'Epic',
                className: 'epic',
                description: 'Skilled fighter with balanced combat abilities.',
                requirements: { Strength: 25, Constitution: 20 }
            },
            {
                name: 'Mage',
                tier: 'Epic',
                className: 'epic',
                description: 'Practitioner of the magical arts.',
                requirements: { Intelligence: 25, Wisdom: 15 }
            },
            {
                name: 'Rogue',
                tier: 'Epic',
                className: 'epic',
                description: 'Cunning fighter specializing in quick strikes.',
                requirements: { Dexterity: 25, Luck: 15 }
            },
            {
                name: 'Tank',
                tier: 'Rare',
                className: 'rare',
                description: 'Heavily armored defender.',
                requirements: { Constitution: 25, Willpower: 15 }
            },
            {
                name: 'Healer',
                tier: 'Rare',
                className: 'rare',
                description: 'Support specialist focused on restoration.',
                requirements: { Wisdom: 25, Charisma: 15 }
            },
            {
                name: 'Fighter',
                tier: 'Common',
                className: 'common',
                description: 'Basic combat training.',
                requirements: { Strength: 15 }
            },
            {
                name: 'Apprentice',
                tier: 'Common',
                className: 'common',
                description: 'Aspiring magic user.',
                requirements: { Intelligence: 15 }
            },
            {
                name: 'Scout',
                tier: 'Common',
                className: 'common',
                description: 'Quick and agile explorer.',
                requirements: { Dexterity: 15 }
            }
        ]
    }

    detect() {
        const attrs = this.attributeSystem.attributes
        const total = this.attributeSystem.getTotalSpent()

        if (total === 0) {
            return {
                name: '...',
                tier: 'Unclassified',
                className: 'unclassified',
                description: 'Spend all 160 points to reveal your class rank.'
            }
        }

        for (const archetype of this.archetypes) {
            let matches = true
            
            for (const [attr, minValue] of Object.entries(archetype.requirements)) {
                if ((attrs[attr] || 0) < minValue) {
                    matches = false
                    break
                }
            }
            
            if (matches) {
                return archetype
            }
        }

        const highestAttr = Object.entries(attrs).reduce((max, [attr, val]) => 
            val > max.val ? { attr, val } : max, { attr: '', val: 0 }
        )

        if (highestAttr.val >= 10) {
            return {
                name: `${highestAttr.attr} Novice`,
                tier: 'Novice',
                className: 'novice',
                description: `Beginning to develop ${highestAttr.attr.toLowerCase()}-based skills.`
            }
        }

        return {
            name: 'Adventurer',
            tier: 'Beginner',
            className: 'beginner',
            description: 'A fresh adventurer just starting their journey.'
        }
    }
}
