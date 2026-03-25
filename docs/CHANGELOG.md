# Changelog

## v3.0.0 — Editor Consolidation & AI Map Generation

Major release that consolidates all editor tools from across the Grudge Studio ecosystem into Playground as the single canonical editor.

### New Modules

- **AI Map Generation Engine** (`src/terrain/AIMapGenerator.js`)
  - SimplexNoise with fractal Brownian motion
  - SeededRandom for deterministic generation
  - 8 biome presets: grass, jungle, water, stone, dirt, desert, snow, volcanic
  - Poisson disk sampling for natural object placement
  - Generators: biome decorations, enemy camps, settlements, roads, dungeon layouts, heightmaps
  - Direct TerrainEditor integration via `applyHeightmapToTerrain()`

- **Voxel Animation Brushes** (`src/animation/VoxelAnimationBrushes.js`)
  - 6 animation brushes: Pose, Wave, Pulse, Spin, Bounce, Tremble
  - 7-part body system: head, torso, leftArm, rightArm, leftLeg, rightLeg, weapon
  - 6 easing functions with keyframe interpolation
  - Class-specific animation presets (Warrior, Ranger, Mage, Worg)
  - Motion keyframe sampling and smoothed animation generation

- **Skill Tree Templates** (`src/stats/SkillTreeTemplates.js`)
  - Hierarchical skill tree nodes for 4 classes
  - MOBA-style 6-slot skill pools (Q/W/E/D/F/R) with 2-3 options per slot
  - Loadout management with localStorage persistence
  - Import/export functionality

- **Map Templates** (`src/editor/MapTemplates.js`)
  - 15 map templates: Arena, Battleground, Town, Forest, MOBA, Open World, Race Track, FPS Arena, TPS Level, MMO Zone, Turn-Based Grid, RPG Dungeon, Survival Island, World Canvas, PvP Arena
  - 14 entity presets across spawn, item, prop, npc, logic categories
  - 10 template categories
  - Auto-entity generation from template features

### Enhancements

- **PrefabSystem** — Added mirror mode (X/Y/Z axis symmetry) and 80-entry undo/redo stack
- **TerrainEditor** — Added `generateFromBiome()` method and `BIOME_LIST` static getter
- **TerrainToolsPanel** — Added biome dropdown selector and "AI Generate Biome" button
- **Editor exports** — Added MapTemplates and PrefabSystem to `src/editor/index.js`

### Ecosystem

- Created `playground-redirect.ts` in GDevelopAssistant mapping 7 editor routes to Playground
- Consolidated editors replaced from: GDevelopAssistant (6 editors), Dungeon-Crawler-Quest (world-editor, ai-map-gen), 3dmmogrudge (ai-map-gen)

### Docs

- Rewrote README with full feature list, project structure, API reference, controls, ecosystem info
- Created `docs/SYSTEMS.md` — detailed developer reference for all new modules
- Created `docs/CHANGELOG.md`

---

## v2.13.0

- Asset database manager
- Cloud save integration

## v2.12.0 — Vehicle Physics & AI Learning

- VehiclePhysics with Rapier 3D
- VehicleAIController with Q-learning
- VehicleAITrainer for parallel training
- 7 vehicle models with telemetry

## v2.0.0

- 3D World Builder with Unity-style controls
- Scene Hierarchy and Inspector panels
- Terrain sculpting tools
- Node Graph Editor
- Timeline animation editor
- Character builder with modular parts
- Arena combat with AI opponents
