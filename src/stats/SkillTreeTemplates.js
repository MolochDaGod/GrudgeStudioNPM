/*
    GRUDGE Studio - Skill Tree Templates
    Merged from GDevelopAssistant skill-tree-editor.tsx + DCQ skill-trees.ts
    Provides class skill trees, slot pools, loadout management, and templates.
*/

// ── Skill Tree Node (GDevelop-style hierarchy) ─────────────────

export const SKILL_TEMPLATES = {
  warrior: [
    {
      id: 'warrior-1', title: "Warrior's Resolve",
      tooltip: 'Increase base health by 10%',
      children: [
        { id: 'warrior-2', title: 'Iron Skin', tooltip: 'Reduce physical damage taken by 5%',
          children: [{ id: 'warrior-3', title: 'Unbreakable', tooltip: 'Become immune to stagger effects', children: [] }]
        },
        { id: 'warrior-4', title: 'Battle Cry', tooltip: 'Inspire nearby allies, increasing damage', children: [] }
      ]
    }
  ],
  mage: [
    {
      id: 'mage-1', title: 'Arcane Knowledge',
      tooltip: 'Increase mana pool by 15%',
      children: [
        { id: 'mage-2', title: 'Fireball', tooltip: 'Launch a fiery projectile at enemies',
          children: [{ id: 'mage-3', title: 'Meteor Strike', tooltip: 'Call down meteors from the sky', children: [] }]
        },
        { id: 'mage-4', title: 'Frost Nova', tooltip: 'Freeze nearby enemies in place', children: [] }
      ]
    }
  ],
  ranger: [
    {
      id: 'ranger-1', title: 'Keen Eye',
      tooltip: 'Increase ranged accuracy by 15%',
      children: [
        { id: 'ranger-2', title: 'Precision Shot', tooltip: 'Deal 200% damage with an aimed shot',
          children: [{ id: 'ranger-3', title: 'Volley', tooltip: 'Fire a burst of arrows at multiple targets', children: [] }]
        },
        { id: 'ranger-4', title: 'Trap Mastery', tooltip: 'Place traps that slow and damage enemies', children: [] }
      ]
    }
  ],
  worg: [
    {
      id: 'worg-1', title: 'Primal Instinct',
      tooltip: 'Increase attack speed by 10%',
      children: [
        { id: 'worg-2', title: 'Feral Rage', tooltip: 'Enter a rage state increasing damage by 20%',
          children: [{ id: 'worg-3', title: 'Alpha Strike', tooltip: 'Devastating leaping attack', children: [] }]
        },
        { id: 'worg-4', title: 'Pack Tactics', tooltip: 'Nearby allies deal bonus damage', children: [] }
      ]
    }
  ],
}

// ── Slot-Based Skill System (DCQ MOBA-style) ──────────────────
// Layout: Q W E D F | R (ultimate)

export const SLOT_LABELS = ['Q', 'W', 'E', 'R', 'D', 'F']
export const SLOT_TYPES = ['attack', 'core', 'defensive', 'ultimate', 'special', 'burst']

// Class ability pools with full metadata

export const CLASS_SKILL_POOLS = {
  Warrior: {
    color: '#ef4444',
    slots: [
      { slotIndex: 0, slotLabel: 'Q', slotType: 'attack', options: [
        { id: 'w-q-0', name: 'Cleave', cooldown: 5, damage: 40, range: 100, type: 'damage', desc: 'Wide melee cleave hitting all nearby enemies' },
        { id: 'w-q-1', name: 'Shield Charge', cooldown: 7, damage: 30, range: 200, type: 'dash', desc: 'Charge forward with shield, knocking back enemies' },
      ]},
      { slotIndex: 1, slotLabel: 'W', slotType: 'core', options: [
        { id: 'w-w-0', name: 'Shield Bash', cooldown: 8, damage: 30, range: 90, type: 'damage', desc: 'Bash with shield, stunning target for 1s' },
        { id: 'w-w-1', name: 'War Stomp', cooldown: 10, damage: 40, range: 150, type: 'aoe', desc: 'Stomp the ground stunning nearby enemies' },
        { id: 'w-w-2', name: 'Heroic Leap', cooldown: 12, damage: 45, range: 300, type: 'dash', desc: 'Leap to target area dealing AoE damage on landing' },
      ]},
      { slotIndex: 2, slotLabel: 'E', slotType: 'defensive', options: [
        { id: 'w-e-0', name: 'Block', cooldown: 6, damage: 0, type: 'buff', desc: 'Raise shield blocking incoming damage for 2s' },
        { id: 'w-e-1', name: 'Parry', cooldown: 4, damage: 0, type: 'buff', desc: 'Perfect timing parry that stuns attacker' },
      ]},
      { slotIndex: 3, slotLabel: 'R', slotType: 'ultimate', options: [
        { id: 'w-r-0', name: 'Berserker Rage', cooldown: 45, damage: 0, type: 'buff', desc: 'Enter rage gaining 50% damage and 30% speed for 8s' },
      ]},
      { slotIndex: 4, slotLabel: 'D', slotType: 'special', options: [
        { id: 'w-d-0', name: 'Rallying Cry', cooldown: 20, damage: 0, type: 'buff', desc: 'Boost nearby allies ATK by 15% for 5s' },
        { id: 'w-d-1', name: 'Rending Strike', cooldown: 7, damage: 35, type: 'damage', desc: 'Slash that causes bleed over 4s' },
      ]},
      { slotIndex: 5, slotLabel: 'F', slotType: 'burst', options: [
        { id: 'w-f-0', name: 'Executioner', cooldown: 14, damage: 80, type: 'damage', desc: '3x damage to targets below 25% HP' },
      ]},
    ],
  },
  Mage: {
    color: '#8b5cf6',
    slots: [
      { slotIndex: 0, slotLabel: 'Q', slotType: 'attack', options: [
        { id: 'm-q-0', name: 'Fireball', cooldown: 4, damage: 50, range: 350, type: 'damage', desc: 'Launch a fiery projectile' },
        { id: 'm-q-1', name: 'Lightning Bolt', cooldown: 5, damage: 55, range: 300, type: 'damage', desc: 'Instant bolt of lightning' },
      ]},
      { slotIndex: 1, slotLabel: 'W', slotType: 'core', options: [
        { id: 'm-w-0', name: 'Arcane Missiles', cooldown: 6, damage: 20, type: 'damage', desc: 'Fire 3 auto-targeting missiles' },
        { id: 'm-w-1', name: 'Mana Burn', cooldown: 10, damage: 40, type: 'damage', desc: 'Burn target mana, dealing damage equal to mana burned' },
        { id: 'm-w-2', name: 'Rune Ward', cooldown: 18, damage: 0, type: 'heal', desc: 'Place a healing rune that regenerates ally HP' },
      ]},
      { slotIndex: 2, slotLabel: 'E', slotType: 'defensive', options: [
        { id: 'm-e-0', name: 'Ice Block', cooldown: 30, damage: 0, type: 'buff', desc: 'Become invulnerable for 3s but cannot act' },
        { id: 'm-e-1', name: 'Blink', cooldown: 12, damage: 0, type: 'dash', desc: 'Teleport a short distance' },
      ]},
      { slotIndex: 3, slotLabel: 'R', slotType: 'ultimate', options: [
        { id: 'm-r-0', name: 'Meteor Storm', cooldown: 60, damage: 100, type: 'aoe', desc: 'Rain meteors in a large area for 5s' },
      ]},
      { slotIndex: 4, slotLabel: 'D', slotType: 'special', options: [
        { id: 'm-d-0', name: 'Counterspell', cooldown: 16, damage: 0, type: 'debuff', desc: 'Silence target for 2s' },
        { id: 'm-d-1', name: 'Elemental Surge', cooldown: 12, damage: 60, type: 'aoe', desc: 'Release elemental burst around you' },
      ]},
      { slotIndex: 5, slotLabel: 'F', slotType: 'burst', options: [
        { id: 'm-f-0', name: 'Spell Echo', cooldown: 20, damage: 0, type: 'buff', desc: 'Next ability cast within 6s is cast twice' },
      ]},
    ],
  },
  Ranger: {
    color: '#22c55e',
    slots: [
      { slotIndex: 0, slotLabel: 'Q', slotType: 'attack', options: [
        { id: 'r-q-0', name: 'Aimed Shot', cooldown: 4, damage: 45, range: 400, type: 'damage', desc: 'Powerful aimed bow shot' },
        { id: 'r-q-1', name: 'Quick Draw', cooldown: 3, damage: 30, range: 350, type: 'damage', desc: 'Fast instant shot, short cooldown' },
      ]},
      { slotIndex: 1, slotLabel: 'W', slotType: 'core', options: [
        { id: 'r-w-0', name: 'Volley', cooldown: 8, damage: 25, type: 'aoe', desc: 'Fire a spread of arrows in a cone' },
        { id: 'r-w-1', name: 'Net Shot', cooldown: 12, damage: 10, type: 'debuff', desc: 'Fire a net, rooting target for 2s' },
        { id: 'r-w-2', name: 'Tracking Mark', cooldown: 14, damage: 0, type: 'debuff', desc: 'Mark target, +20% damage taken for 6s' },
      ]},
      { slotIndex: 2, slotLabel: 'E', slotType: 'defensive', options: [
        { id: 'r-e-0', name: 'Evasive Roll', cooldown: 8, damage: 0, type: 'dash', desc: 'Roll backward dodging attacks' },
        { id: 'r-e-1', name: 'Camouflage', cooldown: 20, damage: 0, type: 'buff', desc: 'Become invisible for 4s, next attack crits' },
      ]},
      { slotIndex: 3, slotLabel: 'R', slotType: 'ultimate', options: [
        { id: 'r-r-0', name: 'Rain of Arrows', cooldown: 50, damage: 80, type: 'aoe', desc: 'Rain arrows on an area for 4s' },
      ]},
      { slotIndex: 4, slotLabel: 'D', slotType: 'special', options: [
        { id: 'r-d-0', name: 'Smoke Arrow', cooldown: 16, damage: 15, type: 'debuff', desc: 'Create a blind zone for 3s' },
      ]},
      { slotIndex: 5, slotLabel: 'F', slotType: 'burst', options: [
        { id: 'r-f-0', name: 'Piercing Shot', cooldown: 10, damage: 70, type: 'damage', desc: 'Arrow that pierces through all enemies in a line' },
      ]},
    ],
  },
  Worg: {
    color: '#d97706',
    slots: [
      { slotIndex: 0, slotLabel: 'Q', slotType: 'attack', options: [
        { id: 'wg-q-0', name: 'Savage Claw', cooldown: 3, damage: 35, range: 80, type: 'damage', desc: 'Quick slashing claw attack' },
        { id: 'wg-q-1', name: 'Venom Strike', cooldown: 6, damage: 20, range: 80, type: 'damage', desc: 'Poison DoT 5s' },
      ]},
      { slotIndex: 1, slotLabel: 'W', slotType: 'core', options: [
        { id: 'wg-w-0', name: 'Predator Leap', cooldown: 10, damage: 35, type: 'dash', desc: 'Leap onto target, slowing 30%' },
        { id: 'wg-w-1', name: 'Pack Howl', cooldown: 18, damage: 0, type: 'debuff', desc: 'Reduce enemy ATK by 20% for 3s' },
      ]},
      { slotIndex: 2, slotLabel: 'E', slotType: 'defensive', options: [
        { id: 'wg-e-0', name: 'Feral Dodge', cooldown: 6, damage: 0, type: 'dash', desc: 'Quick sidestep dodge' },
      ]},
      { slotIndex: 3, slotLabel: 'R', slotType: 'ultimate', options: [
        { id: 'wg-r-0', name: 'Primal Transformation', cooldown: 60, damage: 0, type: 'buff', desc: 'Transform to chosen form for 12s' },
      ]},
      { slotIndex: 4, slotLabel: 'D', slotType: 'special', options: [
        { id: 'wg-d-0', name: 'Shadow Clone', cooldown: 22, damage: 0, type: 'summon', desc: 'Create a shadow clone that attacks 6s' },
        { id: 'wg-d-1', name: 'Feral Frenzy', cooldown: 14, damage: 15, type: 'aoe', desc: 'Rapid multi-hit all nearby 5 times' },
      ]},
      { slotIndex: 5, slotLabel: 'F', slotType: 'burst', options: [
        { id: 'wg-f-0', name: 'Savage Bite', cooldown: 8, damage: 55, type: 'damage', desc: 'Ferocious bite that heals for 50% of damage' },
      ]},
    ],
  },
}

// ── Loadout Management ─────────────────────────────────────────

const LOADOUT_STORAGE_KEY = 'grudge_skill_loadout'

/**
 * Create a default loadout with first option selected for each slot.
 */
export function createDefaultLoadout(className) {
  return {
    className,
    selections: [0, 0, 0, 0, 0, 0],
  }
}

/**
 * Build the ability array from a loadout selection.
 */
export function buildAbilitiesFromLoadout(loadout) {
  const classData = CLASS_SKILL_POOLS[loadout.className]
  if (!classData) return []

  return classData.slots.map((slot, i) => {
    const selIdx = loadout.selections[i] || 0
    const option = slot.options[selIdx]
    return option ? { ...option, slotLabel: slot.slotLabel } : null
  }).filter(Boolean)
}

/**
 * Get abilities in HUD display order: [Q, W, E, D, F, R]
 */
export function getHudOrderAbilities(abilities) {
  if (abilities.length < 6) return abilities
  return [abilities[0], abilities[1], abilities[2], abilities[4], abilities[5], abilities[3]]
}

export function saveLoadout(loadout) {
  try { localStorage.setItem(LOADOUT_STORAGE_KEY, JSON.stringify(loadout)) } catch {}
}

export function loadSavedLoadout() {
  try {
    const raw = localStorage.getItem(LOADOUT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/**
 * Change skill selection for a slot. Returns updated loadout.
 */
export function setSlotSelection(loadout, slotIndex, optionIndex) {
  const classData = CLASS_SKILL_POOLS[loadout.className]
  if (!classData) return loadout
  const pool = classData.slots[slotIndex]
  if (!pool || optionIndex < 0 || optionIndex >= pool.options.length) return loadout
  const newSelections = [...loadout.selections]
  newSelections[slotIndex] = optionIndex
  return { ...loadout, selections: newSelections }
}

// ── Template Export/Import ─────────────────────────────────────

export function exportSkillTree(className) {
  const template = SKILL_TEMPLATES[className.toLowerCase()]
  const pools = CLASS_SKILL_POOLS[className]
  return JSON.stringify({ template, pools, className }, null, 2)
}

export function importSkillTree(jsonString) {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    console.error('Failed to import skill tree:', e)
    return null
  }
}
