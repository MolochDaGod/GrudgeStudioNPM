/*
    GRUDGE Studio - Map Templates
    Ported from GDevelopAssistant map-editor.tsx
    Provides pre-defined map templates and entity presets for quick scene creation.
*/

// ── Map Templates ──────────────────────────────────────────────

export const MAP_TEMPLATES = [
  { id: 'arena', name: 'Arena', icon: '🎯', category: 'pvp',
    description: 'Circular combat arena with spectator stands',
    defaultSize: { width: 256, height: 64, depth: 256 },
    terrainType: 'flat', biome: 'stone',
    features: ['circular_walls', 'spawn_points', 'health_pickups', 'weapon_pickups'] },
  { id: 'battleground', name: 'Battleground', icon: '⚔️', category: 'pvp',
    description: 'Large open battlefield with cover positions',
    defaultSize: { width: 512, height: 128, depth: 512 },
    terrainType: 'procedural', biome: 'grassland',
    features: ['terrain_variation', 'cover_objects', 'capture_points', 'vehicle_spawns'] },
  { id: 'town', name: 'Town Scene', icon: '🏰', category: 'rpg',
    description: 'Medieval town with buildings and streets',
    defaultSize: { width: 512, height: 64, depth: 512 },
    terrainType: 'flat', biome: 'grassland',
    features: ['buildings', 'streets', 'marketplace', 'npcs', 'quests'] },
  { id: 'forest', name: 'Forest', icon: '🌲', category: 'survival',
    description: 'Dense forest environment with clearings',
    defaultSize: { width: 1024, height: 256, depth: 1024 },
    terrainType: 'procedural', biome: 'forest',
    features: ['trees', 'rocks', 'wildlife', 'resources', 'water'] },
  { id: 'moba', name: 'MOBA', icon: '🗺️', category: 'competitive',
    description: '3-lane MOBA map with jungle',
    defaultSize: { width: 512, height: 32, depth: 512 },
    terrainType: 'flat', biome: 'grassland',
    features: ['lanes', 'towers', 'jungle', 'bases', 'minion_spawns'] },
  { id: 'open_world', name: 'Open World', icon: '🌍', category: 'exploration',
    description: 'Large explorable world with varied terrain',
    defaultSize: { width: 2048, height: 512, depth: 2048 },
    terrainType: 'procedural', biome: 'mixed',
    features: ['biome_transitions', 'points_of_interest', 'dungeons', 'villages'] },
  { id: 'race_track', name: 'Race Track', icon: '🏎️', category: 'racing',
    description: 'Racing circuit with checkpoints',
    defaultSize: { width: 1024, height: 64, depth: 1024 },
    terrainType: 'heightmap', biome: 'desert',
    features: ['track_path', 'checkpoints', 'barriers', 'spectator_areas'] },
  { id: 'fps', name: 'FPS Arena', icon: '🔫', category: 'shooter',
    description: 'First-person shooter map with corridors',
    defaultSize: { width: 256, height: 128, depth: 256 },
    terrainType: 'flat', biome: 'industrial',
    features: ['corridors', 'rooms', 'verticality', 'weapon_spawns', 'cover'] },
  { id: 'tps', name: 'TPS Level', icon: '🎮', category: 'shooter',
    description: 'Third-person shooter level design',
    defaultSize: { width: 384, height: 96, depth: 384 },
    terrainType: 'heightmap', biome: 'urban',
    features: ['cover_system', 'vantage_points', 'flank_routes', 'objectives'] },
  { id: 'mmo', name: 'MMO Zone', icon: '👥', category: 'mmorpg',
    description: 'Large zone for MMO gameplay',
    defaultSize: { width: 1024, height: 256, depth: 1024 },
    terrainType: 'procedural', biome: 'fantasy',
    features: ['quest_hubs', 'mob_spawns', 'dungeons', 'fast_travel', 'gathering'] },
  { id: 'turn_based', name: 'Turn-Based Grid', icon: '♟️', category: 'strategy',
    description: 'Grid-based tactical combat map',
    defaultSize: { width: 128, height: 32, depth: 128 },
    terrainType: 'flat', biome: 'grassland',
    features: ['grid_tiles', 'elevation', 'cover_tiles', 'objective_tiles'] },
  { id: 'rpg_dungeon', name: 'RPG Dungeon', icon: '🏚️', category: 'rpg',
    description: 'Classic dungeon crawler layout',
    defaultSize: { width: 256, height: 64, depth: 256 },
    terrainType: 'flat', biome: 'dungeon',
    features: ['rooms', 'corridors', 'traps', 'treasure', 'boss_room'] },
  { id: 'survival', name: 'Survival Island', icon: '🏝️', category: 'survival',
    description: 'Island survival scenario',
    defaultSize: { width: 512, height: 128, depth: 512 },
    terrainType: 'procedural', biome: 'tropical',
    features: ['beaches', 'jungle', 'caves', 'resources', 'wildlife'] },
  { id: 'world_building', name: 'World Canvas', icon: '✨', category: 'creative',
    description: 'Blank canvas for world building',
    defaultSize: { width: 1024, height: 256, depth: 1024 },
    terrainType: 'flat', biome: 'grassland',
    features: ['empty_canvas', 'full_tools', 'unlimited_entities'] },
  { id: 'pvp_arena', name: 'PvP Arena', icon: '⚔️', category: 'pvp',
    description: 'Balanced competitive arena',
    defaultSize: { width: 192, height: 48, depth: 192 },
    terrainType: 'flat', biome: 'stone',
    features: ['symmetrical', 'spawn_balance', 'power_positions', 'line_of_sight'] },
]

// ── Entity Presets ─────────────────────────────────────────────

export const ENTITY_PRESETS = [
  { id: 'player_spawn', name: 'Player Spawn', icon: '🟢', category: 'spawn', color: '#22c55e' },
  { id: 'enemy_spawn', name: 'Enemy Spawn', icon: '🔴', category: 'spawn', color: '#ef4444' },
  { id: 'item_health', name: 'Health Pack', icon: '💚', category: 'item', color: '#22c55e' },
  { id: 'item_ammo', name: 'Ammo', icon: '🔵', category: 'item', color: '#3b82f6' },
  { id: 'item_weapon', name: 'Weapon', icon: '🟡', category: 'item', color: '#f59e0b' },
  { id: 'prop_tree', name: 'Tree', icon: '🌲', category: 'prop', color: '#16a34a' },
  { id: 'prop_rock', name: 'Rock', icon: '🪨', category: 'prop', color: '#78716c' },
  { id: 'prop_building', name: 'Building', icon: '🏠', category: 'prop', color: '#94a3b8' },
  { id: 'prop_crate', name: 'Crate', icon: '📦', category: 'prop', color: '#a16207' },
  { id: 'npc_friendly', name: 'Friendly NPC', icon: '👤', category: 'npc', color: '#06b6d4' },
  { id: 'npc_enemy', name: 'Enemy NPC', icon: '⚔️', category: 'npc', color: '#dc2626' },
  { id: 'trigger_zone', name: 'Trigger Zone', icon: '🔶', category: 'logic', color: '#a855f7' },
  { id: 'waypoint', name: 'Waypoint', icon: '📍', category: 'logic', color: '#eab308' },
  { id: 'camera_point', name: 'Camera Point', icon: '📷', category: 'logic', color: '#6366f1' },
]

// ── Template Categories ────────────────────────────────────────

export const TEMPLATE_CATEGORIES = [
  { id: 'pvp', label: 'PvP', icon: '⚔️' },
  { id: 'rpg', label: 'RPG', icon: '🏰' },
  { id: 'competitive', label: 'Competitive', icon: '🏆' },
  { id: 'survival', label: 'Survival', icon: '🏝️' },
  { id: 'shooter', label: 'Shooter', icon: '🔫' },
  { id: 'mmorpg', label: 'MMO', icon: '👥' },
  { id: 'racing', label: 'Racing', icon: '🏎️' },
  { id: 'strategy', label: 'Strategy', icon: '♟️' },
  { id: 'exploration', label: 'Exploration', icon: '🌍' },
  { id: 'creative', label: 'Creative', icon: '✨' },
]

// ── Helpers ────────────────────────────────────────────────────

export function getTemplate(templateId) {
  return MAP_TEMPLATES.find(t => t.id === templateId) || null
}

export function getTemplatesByCategory(category) {
  return MAP_TEMPLATES.filter(t => t.category === category)
}

export function getEntityPresetsByCategory(category) {
  return ENTITY_PRESETS.filter(p => p.category === category)
}

/**
 * Generate initial entity placements based on template features.
 * Returns an array of entity objects ready to be placed in the scene.
 */
export function generateTemplateEntities(template) {
  const entities = []
  const { defaultSize, features } = template

  if (features.includes('spawn_points') || features.includes('player_spawn')) {
    entities.push(
      { type: 'player_spawn', position: { x: -defaultSize.width / 4, y: 0, z: 0 } },
      { type: 'player_spawn', position: { x: defaultSize.width / 4, y: 0, z: 0 } },
    )
  }

  if (features.includes('spawn_balance') || features.includes('symmetrical')) {
    entities.push(
      { type: 'enemy_spawn', position: { x: 0, y: 0, z: -defaultSize.depth / 3 } },
      { type: 'enemy_spawn', position: { x: 0, y: 0, z: defaultSize.depth / 3 } },
    )
  }

  if (features.includes('health_pickups')) {
    entities.push(
      { type: 'item_health', position: { x: 0, y: 1, z: 0 } },
    )
  }

  if (features.includes('towers') || features.includes('bases')) {
    const halfW = defaultSize.width / 2 - 20
    const halfD = defaultSize.depth / 2 - 20
    entities.push(
      { type: 'prop_building', position: { x: -halfW, y: 0, z: -halfD }, properties: { team: 0, type: 'tower' } },
      { type: 'prop_building', position: { x: halfW, y: 0, z: halfD }, properties: { team: 1, type: 'tower' } },
    )
  }

  if (features.includes('boss_room')) {
    entities.push(
      { type: 'npc_enemy', position: { x: 0, y: 0, z: -defaultSize.depth / 2 + 30 }, properties: { isBoss: true } },
    )
  }

  return entities
}
