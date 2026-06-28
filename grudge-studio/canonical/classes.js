/**
 * Canonical GRUDGE Warlords classes — aligned with game-content/classes.ts
 * (mage / warrior / ranger / worge)
 */

export const CLASS_IDS = ['warrior', 'mage', 'ranger', 'worge']

export const CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    role: 'Melee DPS / Tank',
    color: '#ef4444',
    presetId: 'warrior',
    animPack: 'sword_shield',
    description: 'Front-line fighter with shield mastery and cleaving strikes.',
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    role: 'Spellcaster',
    color: '#8b5cf6',
    presetId: 'mage',
    animPack: 'magic',
    description: 'Arcane devastation and protective wards.',
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    role: 'Ranged DPS',
    color: '#10b981',
    presetId: 'ranger',
    animPack: 'longbow',
    description: 'Precision archery and battlefield control.',
  },
  worge: {
    id: 'worge',
    name: 'Worge',
    role: 'Shapeshifter',
    color: '#f59e0b',
    presetId: 'warrior',
    animPack: 'unarmed',
    description: 'Beast-form brawler — the canonical shapeshifter class.',
  },
}

/** Legacy alias used in older skill-tree UI */
export const CLASS_ALIASES = { worg: 'worge' }