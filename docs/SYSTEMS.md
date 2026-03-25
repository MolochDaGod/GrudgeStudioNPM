# Grudge Playground — Systems Documentation

Developer reference for the consolidated editor and game systems.

---

## AI Map Generation (`src/terrain/AIMapGenerator.js`)

Procedural world generation engine consolidated from Dungeon-Crawler-Quest and 3dmmogrudge.

### Classes

#### `SimplexNoise`
2D simplex noise generator with seeded permutation table.

```js
const noise = new SimplexNoise(42)
noise.noise2D(x, y)              // Returns -1 to 1
noise.fbm(x, y, octaves, lac, persist)  // Returns 0 to 1
```

- `noise2D(x, y)` — Raw 2D simplex noise, range [-1, 1]
- `fbm(x, y, octaves=4, lacunarity=2, persistence=0.5)` — Fractal Brownian motion, returns [0, 1]

#### `SeededRandom`
Deterministic PRNG using the Lehmer (Park-Miller) algorithm.

```js
const rng = new SeededRandom(12345)
rng.next()              // [0, 1)
rng.range(10, 20)       // Float in [10, 20)
rng.intRange(1, 6)      // Integer in [1, 6]
rng.pick(['a', 'b'])    // Random element
```

### Biome Configs

`BIOME_CONFIGS` contains 8 preset biomes:

| Biome    | Density | Height Var | Terrain Color | Road Type |
|----------|---------|------------|---------------|-----------|
| grass    | 8       | 0.2        | `#4a7c59`     | dirt      |
| jungle   | 14      | 0.15       | `#2d5a27`     | dirt      |
| water    | 6       | 0.05       | `#1a5276`     | bridge    |
| stone    | 10      | 0.5        | `#696969`     | stone     |
| dirt     | 7       | 0.3        | `#8B4513`     | dirt      |
| desert   | 4       | 0.35       | `#C2B280`     | dirt      |
| snow     | 5       | 0.4        | `#FFFAFA`     | stone     |
| volcanic | 6       | 0.6        | `#8B0000`     | stone     |

Each biome defines `decorations` (weighted types with scale ranges), `enemyTypes`, `buildingTypes`, `roadType`, and `heightVariation`.

### Generator Functions

- `generateBiomeDecorations(biome, bounds, seed)` — Poisson-disk-sampled decorations with noise-based density clustering
- `generateEnemyCamps(biome, bounds, baseLevel, seed)` — Enemy camp placement with boss probability
- `generateSettlement(biome, center, size, seed)` — Non-overlapping building clusters ('small'|'medium'|'large')
- `generateRoad(from, to, type, seed, windiness)` — Midpoint-displacement road with natural curves
- `generateDungeonLayout(width, height, roomCount, seed)` — BSP-like room generation with entrance/boss rooms and nearest-neighbor corridors
- `generateHeightmap(gridW, gridH, variation, seed)` — 2D noise heightmap
- `generateZoneData(zoneId, bounds, terrainType, baseLevel, isSafeZone, seed)` — Full zone with decorations, camps, buildings, and heightmap
- `applyHeightmapToTerrain(terrainEditor, biomeKey, seed)` — Direct integration with the TerrainEditor

### Utility Functions

- `poissonDisk(rng, width, height, minDist, maxAttempts)` — Poisson disk sampling for well-spaced point distribution
- `weightedPick(rng, items)` — Weighted random selection from array of `{ weight }` objects

---

## Voxel Animation Brushes (`src/animation/VoxelAnimationBrushes.js`)

Paint-based animation authoring system ported from the Dungeon-Crawler-Quest entity editor.

### Body Parts

7 animatable parts: `leftLeg`, `rightLeg`, `leftArm`, `rightArm`, `torso`, `head`, `weapon`

Each has a label, color (for UI), and center offset defined in `BODY_PART_CENTERS`.

### Brushes

Each brush is a factory that returns a `(time) => { ox, oy, oz }` function:

| Brush   | Color     | Description                          | Key Params                  |
|---------|-----------|--------------------------------------|-----------------------------|
| pose    | `#ef4444` | Static offset                        | ox, oy, oz, intensity       |
| wave    | `#3b82f6` | Sinusoidal oscillation               | amplitude, frequency, axis  |
| pulse   | `#22c55e` | Heartbeat-like vertical pulse        | amplitude, speed            |
| spin    | `#a855f7` | Circular rotation sweep              | radius, speed               |
| bounce  | `#f59e0b` | Vertical bounce                      | height, speed               |
| tremble | `#06b6d4` | Multi-frequency micro-shake          | magnitude, speed            |

### Easing

`ease(t, type)` supports: `linear`, `easeIn`, `easeOut`, `easeInOut`, `overshoot`, `bounce`

### Keyframe System

- `sampleMotion(keyframes, time)` — Interpolates between sorted keyframes with easing per segment
- `generateSmoothedAnimation(keyframes, duration, fps)` — Pre-bakes animation to frame array

### Class Presets

`CLASS_ANIMATION_PRESETS` provides ready-made `idle`, `walk`, and `attack` functions for:
- **Warrior** — Heavy melee swings with wind-up, follow-through, and weapon glow
- **Ranger** — Bow draw, hold, release, recoil sequence
- **Mage** — Charge, cast, recover pattern with floating arms
- **Worg** — Fast lunge-and-strike with feral movements

---

## Skill Tree Templates (`src/stats/SkillTreeTemplates.js`)

Merged skill system from GDevelopAssistant and Dungeon-Crawler-Quest.

### Two Systems

1. **Hierarchical Templates** (`SKILL_TEMPLATES`) — Tree-structured skill nodes for the skill tree UI. Each node has `id`, `title`, `tooltip`, `children[]`.

2. **Slot-Based Pools** (`CLASS_SKILL_POOLS`) — MOBA-style 6-slot skill selection for gameplay. Slots: Q (attack), W (core), E (defensive), R (ultimate), D (special), F (burst). Each slot has 1-3 selectable options.

### Loadout Management

```js
createDefaultLoadout('Warrior')   // { className, selections: [0,0,0,0,0,0] }
setSlotSelection(loadout, 1, 2)   // Change slot 1 to option index 2
buildAbilitiesFromLoadout(loadout) // Returns 6-ability array
getHudOrderAbilities(abilities)    // Reorders to [Q,W,E,D,F,R] for HUD display
saveLoadout(loadout)               // Persists to localStorage
loadSavedLoadout()                 // Restores from localStorage
```

### Import/Export

```js
const json = exportSkillTree('Warrior')  // JSON string of templates + pools
const data = importSkillTree(jsonString) // Parse back
```

---

## Map Templates (`src/editor/MapTemplates.js`)

15 pre-defined map templates ported from GDevelopAssistant.

### Template Properties

Each template has: `id`, `name`, `icon`, `category`, `description`, `defaultSize` ({width, height, depth}), `terrainType` ('flat'|'heightmap'|'procedural'), `biome`, `features[]`

### Categories

pvp, rpg, competitive, survival, shooter, mmorpg, racing, strategy, exploration, creative

### Entity Presets

14 placeable entity types across categories: spawn, item, prop, npc, logic.

### Auto-Generation

`generateTemplateEntities(template)` reads a template's `features` array and places appropriate spawn points, towers, health pickups, and boss NPCs.

---

## Prefab System (`src/editor/PrefabSystem.js`)

Scene object serialization and reuse with mirror mode and undo.

### Mirror Mode

```js
prefabSystem.setMirrorMode(true, 'x')  // Enable X-axis symmetry
// instantiateWithMirror() places two copies, one mirrored
prefabSystem.setMirrorMode(false)       // Disable
```

Supports `x`, `y`, `z` mirror axes. Rotation Y is flipped for the mirror copy.

### Undo/Redo

80-entry undo stack. Callers push arbitrary entries:

```js
prefabSystem.pushUndo({ type: 'place', id: obj.id, prev: null })
const entry = prefabSystem.undo()  // Returns the entry, or null
const entry = prefabSystem.redo()
prefabSystem.canUndo  // boolean
prefabSystem.canRedo  // boolean
```

### Serialization

Prefabs serialize the full object tree: geometry type + parameters, material properties, lights, children. Stored in localStorage under `grudge_prefabs`.

```js
prefabSystem.createPrefab('Tower', [obj1, obj2], { category: 'Structures' })
const group = prefabSystem.instantiate(prefabId, position, { rotation, scale })
prefabSystem.exportPrefab(prefabId)  // JSON string
prefabSystem.importPrefab(json)      // Imports with new ID
```

---

## Terrain Editor Integration

The `TerrainEditor` class now integrates with the AI Map Generator:

```js
terrainEditor.generateFromBiome('desert', 42)  // Generate desert terrain
TerrainEditor.BIOME_LIST  // [{ key: 'grass', label: 'Grass', color }, ...]
```

The **Terrain Tools Panel** includes:
- Biome dropdown (8 options)
- "AI Generate Biome" button that calls `generateFromBiome`
- Existing sculpt tools (raise/lower/smooth/flatten/paint/noise/water)

---

## Editor Exports (`src/editor/index.js`)

```js
// Existing
export { ModelViewer, createModelViewerElement } from './ModelViewer.js'
export { AssetPreview, assetPreview } from './AssetPreview.js'
export { ConsolePanel, consolePanel } from './ConsolePanel.js'
export { AIGeneratorPanel, aiGeneratorPanel } from './AIGeneratorPanel.js'
export { NodeGraph, Node, Port, Connection, nodeGraph } from './NodeGraph.js'
export { NodeGraphEditor, nodeGraphEditor } from './NodeGraphEditor.js'
export { Timeline, timeline } from './Timeline.js'

// New (v3.0.0)
export { MAP_TEMPLATES, ENTITY_PRESETS, TEMPLATE_CATEGORIES, getTemplate, generateTemplateEntities } from './MapTemplates.js'
export { PrefabSystem, prefabSystem } from './PrefabSystem.js'
```
