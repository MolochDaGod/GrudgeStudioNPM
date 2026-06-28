/**
 * Canonical profession definitions for the Professions tab.
 * Each profession maps to GRUDGE 6 race affinities and harvest/craft loops.
 */

export const PROFESSION_IDS = ['mining', 'engineer', 'chef', 'mystic', 'forester']

export const PROFESSIONS = {
  mining: {
    id: 'mining',
    name: 'Mining',
    icon: '⛏',
    color: '#d97706',
    favoredRaces: ['dwarves', 'barbarians'],
    description: 'Ore extraction and metalworking for the GRUDGE war machine.',
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    icon: '🔧',
    color: '#f97316',
    favoredRaces: ['dwarves', 'western-kingdoms'],
    description: 'Siege engines, deployables, and battlefield tech.',
  },
  chef: {
    id: 'chef',
    name: 'Chef',
    icon: '👨‍🍳',
    color: '#22c55e',
    favoredRaces: ['western-kingdoms', 'high-elves'],
    description: 'Buff food and supply chains for warbands.',
  },
  mystic: {
    id: 'mystic',
    name: 'Mystic',
    icon: '🔮',
    color: '#a855f7',
    favoredRaces: ['high-elves', 'undead'],
    description: 'Arcane crafting, runes, and spirit binding.',
  },
  forester: {
    id: 'forester',
    name: 'Forester',
    icon: '🌲',
    color: '#15803d',
    favoredRaces: ['high-elves', 'orcs'],
    description: 'Lumber, hunting, and wilderness supply.',
  },
}