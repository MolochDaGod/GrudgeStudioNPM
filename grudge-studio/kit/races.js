/**
 * GRUDGE 6 race roster — lockstep with character-viewer races.ts / character-kit raceAssets.ts
 */

export const GRUDGE_RACE_IDS = [
  'barbarians',
  'dwarves',
  'high-elves',
  'orcs',
  'undead',
  'western-kingdoms',
]

/** @type {Record<string, import('./types.js').RaceAsset>} */
export const RACE_ASSETS = {
  barbarians: {
    id: 'barbarians',
    name: 'Barbarians',
    abbr: 'BRB',
    color: '#c2410c',
    modelUrl: '/assets/barbarians/models/characters/BRB_Characters_customizable.FBX',
    textureUrl: '/assets/barbarians/textures/BRB_StandardUnits_texture.webp',
    skeleton: 'Bip001',
    animPack: 'unarmed',
  },
  dwarves: {
    id: 'dwarves',
    name: 'Dwarves',
    abbr: 'DWF',
    color: '#b45309',
    modelUrl: '/assets/dwarves/models/characters/DWF_Characters_customizable.FBX',
    textureUrl: '/assets/dwarves/textures/DWF_Standard_Units.webp',
    skeleton: 'Bip001',
    animPack: 'unarmed',
  },
  'high-elves': {
    id: 'high-elves',
    name: 'High Elves',
    abbr: 'ELF',
    color: '#0891b2',
    modelUrl: '/assets/elves/models/characters/ELF_Characters_customizable.FBX',
    textureUrl: '/assets/elves/textures/ELF_HighElves_Texture.webp',
    skeleton: 'Bip001',
    animPack: 'unarmed',
  },
  orcs: {
    id: 'orcs',
    name: 'Orcs',
    abbr: 'ORC',
    color: '#15803d',
    modelUrl: '/assets/orcs/models/characters/ORC_Characters_Customizable.FBX',
    textureUrl: '/assets/orcs/textures/ORC_StandardUnits.webp',
    skeleton: 'Bip001',
    animPack: 'unarmed',
  },
  undead: {
    id: 'undead',
    name: 'Undead',
    abbr: 'UD',
    color: '#7c3aed',
    modelUrl: '/assets/undead/models/characters/UD_Characters_customizable.FBX',
    textureUrl: '/assets/undead/textures/UD_Standard_Units.webp',
    skeleton: 'Bip001',
    animPack: 'unarmed',
  },
  'western-kingdoms': {
    id: 'western-kingdoms',
    name: 'W. Kingdoms',
    abbr: 'WK',
    color: '#1d4ed8',
    modelUrl: '/assets/western-kingdoms/models/characters/WK_Characters_customizable.FBX',
    textureUrl: '/assets/western-kingdoms/textures/WK_Standard_Units.webp',
    skeleton: 'Bip001',
    animPack: 'unarmed',
  },
}

export function getRace(id) {
  return RACE_ASSETS[id] ?? RACE_ASSETS.barbarians
}