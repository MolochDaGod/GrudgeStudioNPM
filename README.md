# Grudge Playground

The canonical game development SDK and editor for the **Grudge Studio** ecosystem. Consolidates all editor tools from across Grudge projects into a single, unified platform.

Built by **Racalvin The Pirate King**.

## Quick Start

```bash
npm install
npm run dev       # Dev server at http://localhost:5000
npm run build     # Production build to dist/
```

## Features

### Game Engine
- **3D Rendering** — Three.js WebGL with PBR materials, post-processing (outline pass, bloom)
- **Physics** — Rapier 3D for rigid bodies, colliders, raycasting
- **Combat** — D&D-style stats, combo attacks, AI opponents with difficulty scaling
- **Cameras** — Third Person, First Person, Action, RTS, Top Down, Isometric
- **Networking** — Colyseus + Socket.IO for real-time multiplayer
- **Audio** — Howler.js spatial audio, sound effects
- **Scripting** — Lua scripting via Fengari, visual scripting via Node Graph

### World Builder (3D Scene Editor)
- Unity-style transform gizmos — `W` Move, `E` Rotate, `R` Scale, `Q` Select
- Scene Hierarchy panel with drag-and-drop
- Inspector panel for live property editing
- Terrain sculpting — raise, lower, smooth, flatten, paint, noise, water
- **AI Biome Generation** — select from 8 biomes and generate terrain procedurally
- Asset library with characters, primitives, nature, structures, lights
- GLTF/FBX import and export
- Cloud storage integration
- Prefab system with mirror mode and undo/redo (80-entry stack)
- 15 map templates — Arena, MOBA, MMO Zone, Dungeon, Survival Island, etc.

### AI Map Generation Engine
Procedural world generation ported from across the Grudge ecosystem:
- **SimplexNoise** — 2D simplex noise with fractal Brownian motion (fBm)
- **SeededRandom** — Deterministic random for reproducible worlds
- **8 Biome Presets** — Grass, Jungle, Water, Stone, Dirt, Desert, Snow, Volcanic
- **Poisson Disk Sampling** — Well-spaced placement for decorations and camps
- **Generators** — Decorations, enemy camps, settlements, roads, dungeon layouts, heightmaps

### Animation System
- Retargeting service for Mixamo/custom skeletons
- Animation state machine with blend transitions
- **Voxel Animation Brushes** — Paint-based animation authoring:
  - 6 brush types: Pose, Wave, Pulse, Spin, Bounce, Tremble
  - Per-body-part keyframe editing (7 parts: head, torso, arms, legs, weapon)
  - 6 easing functions: linear, easeIn, easeOut, easeInOut, overshoot, bounce
  - Class-specific presets for Warrior, Ranger, Mage, Worg
- Timeline editor with keyframe interpolation

### Character System
- Modular character generation with swappable body parts
- 8+ playable characters with animations
- 22-bone skeletal hierarchy (Mixamo/Unity compatible)
- Character builder with race/class selection

### Skill Tree System
- 4 class skill trees — Warrior, Mage, Ranger, Worg
- MOBA-style 6-slot layout: Q, W, E, D, F + R (ultimate)
- 2-3 skill options per slot with weapon affinity
- Loadout persistence and import/export

### Vehicle Physics (v2.12.0)
- Rapier 3D-based car physics with suspension and steering
- Q-learning AI for autonomous driving
- 7 vehicle models with telemetry

## Project Structure

```
src/
  ai/              # AI helpers, pathfinding, combat announcer, cloud save
  animation/       # Animation library, state machine, retargeting
    VoxelAnimationBrushes.js   # Paint-based animation authoring system
  arena/           # Arena combat scene and AI controllers
  assets/          # Asset database and service
  audio/           # Howler.js audio manager
  cameras/         # Camera manager and chase camera
  characters/      # Modular character factory and assembler
  combat/          # Combat feedback system
  components/      # Physics collision components
  core/            # Engine core (input, physics, state, scene director)
  editor/          # World builder, node graph, timeline, panels
    MapTemplates.js            # 15 map templates for quick scene creation
    PrefabSystem.js            # Prefab save/load with mirror mode + undo
    TerrainEditor.js           # Terrain sculpting + AI biome generation
    TerrainToolsPanel.js       # Terrain tools UI with biome selector
    TransformController.js     # Gizmo controls (translate/rotate/scale)
  effects/         # Water system
  environment/     # Environment manager, prefab scene loader
  fighters/        # 3D fighter entities, AI, animation layers
  network/         # Grudge network service, friends, leaderboards, chat
  render/          # LOD manager
  scenes/          # Character select, world builder scenes
  scripting/       # Lua engine, script manager, weapon prefabs
  stats/           # Skill tree stats, admin panel
    SkillTreeTemplates.js      # Class skill trees + loadout management
  storage/         # Character storage service
  styles/          # CSS (main, editor, playground)
  terrain/         # Procedural terrain, physical terrain
    AIMapGenerator.js          # Simplex noise, biomes, settlements, dungeons
  ui/              # Action bars, targeting, hotkeys, touch controls
  vehicles/        # Vehicle physics, AI controller, asset manifest
  viewer/          # Model viewer entry point
public/
  models/          # 3D assets (characters, vehicles, arena)
  img/             # Textures and backgrounds
```

## Pages

The build produces several standalone pages:

- **`index.html`** — Main launcher with Arena Combat, 3D Playground, and World Builder
- **`playground.html`** — Interactive physics/shader/particle showcase
- **`viewer.html`** — 3D model viewer with animation support
- **`character-builder.html`** — Character creation with race/class/skill selection
- **`skill-tree.html`** — Skill tree editor and loadout builder
- **`assets.html`** — Asset browser connected to object storage

## API Reference

### AI Map Generator

```javascript
import {
  SimplexNoise, SeededRandom, BIOME_CONFIGS,
  generateBiomeDecorations, generateEnemyCamps,
  generateSettlement, generateDungeonLayout,
  applyHeightmapToTerrain
} from './src/terrain/AIMapGenerator.js'

// Generate noise-based terrain directly on the editor
applyHeightmapToTerrain(terrainEditor, 'volcanic', 42)

// Generate decorations for a zone
const decos = generateBiomeDecorations(BIOME_CONFIGS.jungle, bounds, seed)

// Generate a dungeon with 8 rooms
const rooms = generateDungeonLayout(800, 600, 8, seed)
```

### Animation Brushes

```javascript
import {
  ANIMATION_BRUSHES, applyBrush, sampleMotion,
  generateSmoothedAnimation, CLASS_ANIMATION_PRESETS
} from './src/animation/VoxelAnimationBrushes.js'

// Apply a wave brush to the torso
const offset = applyBrush('wave', 'torso', time, { amplitude: 3, frequency: 2 })

// Interpolate between keyframes
const pose = sampleMotion(keyframes, currentTime)

// Get warrior walk animation at time t
const walkPose = CLASS_ANIMATION_PRESETS.Warrior.walk(t)
```

### Skill Trees

```javascript
import {
  CLASS_SKILL_POOLS, createDefaultLoadout,
  buildAbilitiesFromLoadout, setSlotSelection
} from './src/stats/SkillTreeTemplates.js'

const loadout = createDefaultLoadout('Warrior')
const updated = setSlotSelection(loadout, 1, 2)  // Heroic Leap on W slot
const abilities = buildAbilitiesFromLoadout(updated)
```

### Map Templates

```javascript
import {
  MAP_TEMPLATES, getTemplate, generateTemplateEntities
} from './src/editor/MapTemplates.js'

const moba = getTemplate('moba')
const entities = generateTemplateEntities(moba)  // Towers, spawns, etc.
```

### Prefab System

```javascript
import { prefabSystem } from './src/editor/PrefabSystem.js'

// Enable symmetric building
prefabSystem.setMirrorMode(true, 'x')

// Place a prefab with automatic mirroring
const instances = prefabSystem.instantiateWithMirror(prefabId, position)

// Undo/redo
prefabSystem.pushUndo({ type: 'place', objects: instances })
prefabSystem.undo()
```

## Ecosystem Consolidation

Grudge Playground is the **canonical editor** for the Grudge Studio ecosystem. The following editors from other projects have been consolidated here:

- **GDevelopAssistant** — model-viewer, character-editor, skill-tree-editor, map-editor, rts-map-editor, rts-scene-editor, rts-builder, viewport-asset-viewer
- **Dungeon-Crawler-Quest** — world-editor (2D), ai-map-gen
- **3dmmogrudge** — ai-map-gen (duplicate)

Game-specific editors (NexusNemesis deck builder, SpaceRTS ship editor, DCQ entity/animation editors) remain in their projects but share data formats with Playground.

See `GDevelopAssistant/client/src/lib/playground-redirect.ts` for the redirect mapping.

## Tech Stack

- **Three.js** — 3D WebGL rendering
- **Rapier 3D** — Physics engine
- **Vite** — Build tool (108 modules)
- **Colyseus** — Multiplayer game server
- **Socket.IO** — Real-time networking
- **Fengari** — Lua scripting
- **GSAP** — Animation tweening
- **Howler** — Audio
- **Puter.js** — Cloud storage

## Deployment

### GitHub Pages

Automatic deployment via GitHub Actions on push to main.

1. Go to Settings > Pages > Source: "GitHub Actions"
2. Push to main — the workflow builds and deploys automatically

### Manual

```bash
npm run build
# Upload dist/ to your hosting
```

### Vercel

```bash
npm run build
# Deploy dist/ via Vercel CLI or dashboard
```

## Controls

### Arena
- `WASD` — Move
- `SPACE` — Jump
- `SHIFT` — Run
- `LMB` — Light Attack
- `RMB` — Heavy Attack
- `TAB` — Lock Target
- `F1/F2/F3` — Camera modes
- `ESC` — Pause

### World Builder
- `W` — Move tool
- `E` — Rotate tool
- `R` — Scale tool
- `Q` — Select tool
- `Delete` — Delete selected
- `Ctrl+Z` — Undo
- `Ctrl+Y` — Redo
- `Ctrl+C/V` — Copy/Paste
- `Middle Mouse` — Pan
- `Scroll` — Zoom
- `[` / `]` — Decrease/Increase brush size (terrain)

## License

MIT License

## Version

v3.0.0 — Editor Consolidation & AI Map Generation
