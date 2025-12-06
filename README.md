# GRUDGE STUDIO SDK

A comprehensive game development framework for building 3D multiplayer games using Three.js and Socket.IO.

## Installation

```bash
npm install grudge-studio
```

### Peer Dependencies

Make sure you have these installed in your project:

```bash
npm install three socket.io-client
```

## Quick Start

```javascript
import { Vec3, EventBus, InputManager, Clock } from 'grudge-studio/core'
import { SceneManager, ThirdPersonCamera } from 'grudge-studio/render'
import { ThirdPersonController, CombatController } from 'grudge-studio/controllers'
import { TerrainGenerator, BiomeSystem } from 'grudge-studio/terrain'
import { NetworkManager, Lobby, StateSync } from 'grudge-studio/net'
import { UICanvas, HealthBar, Minimap } from 'grudge-studio/ui'
import { AssetManifest, AssetBundle } from 'grudge-studio/assets'
```

## Modules

### Core
Math utilities, collision detection, state machines, events, input handling, and time utilities.

```javascript
import { Vec3, Mat4, Quat, AABB, Sphere, Capsule, Ray } from 'grudge-studio/core'
import { StateMachine, EventEmitter, EventBus } from 'grudge-studio/core'
import { InputManager, GamepadManager, InputMap } from 'grudge-studio/core'
import { Clock, Timer, Tween } from 'grudge-studio/core'
```

**Math Classes:**
- `Vec2`, `Vec3` - 2D/3D vectors with full math operations
- `Mat4` - 4x4 matrix for transformations
- `Quat` - Quaternion for rotations
- `noise2D`, `noise3D` - Simplex noise functions
- `Easing` - Animation easing functions

**Collision:**
- `AABB` - Axis-aligned bounding boxes
- `Sphere` - Sphere collision
- `Capsule` - Capsule collision (great for characters)
- `Ray` - Raycasting

### Render
Scene management and camera systems built on Three.js.

```javascript
import { SceneManager } from 'grudge-studio/render'
import { OrbitCamera, FollowCamera, FirstPersonCamera } from 'grudge-studio/render'
import { ThirdPersonCamera, CinematicCamera } from 'grudge-studio/render'
import { AnimationController, MaterialFactory } from 'grudge-studio/render'
import { AssetLoader, ParticleSystem } from 'grudge-studio/render'
```

**Camera Systems:**
- `OrbitCamera` - Orbit around a target point
- `FollowCamera` - Smooth follow with offset
- `FirstPersonCamera` - FPS-style camera
- `ThirdPersonCamera` - Over-the-shoulder camera
- `CinematicCamera` - Spline-based camera paths

### Controllers
Character and vehicle controllers with physics.

```javascript
import { CharacterController } from 'grudge-studio/controllers'
import { FirstPersonController, ThirdPersonController } from 'grudge-studio/controllers'
import { PlatformerController, VehicleController } from 'grudge-studio/controllers'
import { CombatController, DamageSystem } from 'grudge-studio/controllers'
```

**Character Types:**
- `FirstPersonController` - FPS movement with mouse look
- `ThirdPersonController` - Third-person with sprint and crouch
- `PlatformerController` - Jump, double-jump, wall-jump, dash

**Combat:**
- `CombatController` - Attack combos, blocking, dodging
- `DamageSystem` - Health, damage types, resistances

### Terrain
Procedural terrain generation with LOD and biomes.

```javascript
import { HeightMap, TerrainGenerator } from 'grudge-studio/terrain'
import { TerrainChunk, LODTerrain } from 'grudge-studio/terrain'
import { BiomeSystem } from 'grudge-studio/terrain'
```

**Features:**
- Simplex noise-based heightmaps
- Infinite terrain with LOD chunks
- Biome coloring based on height, moisture, temperature

### Net
Multiplayer networking with Socket.IO.

```javascript
import { NetworkManager, StateSync } from 'grudge-studio/net'
import { ClientPrediction, Lobby } from 'grudge-studio/net'
import { ServerTemplate } from 'grudge-studio/net'
```

**Features:**
- Automatic state synchronization
- Client-side prediction with reconciliation
- Lobby and room management
- Server boilerplate templates

### UI
Canvas-based UI system for games.

```javascript
import { UICanvas, HealthBar, Button } from 'grudge-studio/ui'
import { Panel, Text, Minimap } from 'grudge-studio/ui'
```

**Components:**
- `HealthBar` - Animated health/mana bars
- `Button` - Interactive buttons with hover/click states
- `Panel` - Container panels with backgrounds
- `Text` - Text rendering with fonts and styles
- `Minimap` - Game minimap with entity markers

### Assets
Asset management with CDN support.

```javascript
import { AssetManifest, AssetBundle } from 'grudge-studio/assets'
import { AssetPipeline } from 'grudge-studio/assets'
```

**Features:**
- Asset registry with versioning
- Bundle loading for grouped assets
- CDN support for production
- Processing pipeline for optimization

## Examples

### Arena Fighter

```javascript
import { SceneManager, ThirdPersonCamera } from 'grudge-studio/render'
import { ThirdPersonController, CombatController, DamageSystem } from 'grudge-studio/controllers'
import { InputManager, Clock } from 'grudge-studio/core'
import { UICanvas, HealthBar } from 'grudge-studio/ui'

// Initialize
const scene = new SceneManager({ container: document.body })
const input = new InputManager()
const clock = new Clock()
const ui = new UICanvas(window.innerWidth, window.innerHeight)

// Create player
const player = new ThirdPersonController(scene.scene, input, {
  moveSpeed: 8,
  sprintSpeed: 14
})

// Add combat
const combat = new CombatController(player)
const damage = new DamageSystem()
damage.registerEntity('player', { maxHealth: 100 })

// UI
const healthBar = new HealthBar(20, 20, 200, 20, { maxValue: 100 })
ui.addComponent(healthBar)

// Game loop
function update() {
  const delta = clock.getDelta()
  player.update(delta)
  combat.update(delta)
  healthBar.setValue(damage.getHealth('player'))
  ui.render()
  scene.render()
  requestAnimationFrame(update)
}
update()
```

### Multiplayer Lobby

```javascript
import { NetworkManager, Lobby, StateSync } from 'grudge-studio/net'

const network = new NetworkManager('https://your-server.com')
const lobby = new Lobby(network)
const sync = new StateSync(network)

// Create/join rooms
lobby.createRoom('My Room', { maxPlayers: 4 })
lobby.onRoomCreated((room) => console.log('Room created:', room.id))

// Sync player state
sync.registerEntity('player', playerObject, ['position', 'rotation'])
sync.onEntityUpdate((id, state) => {
  // Update remote player
})
```

### Procedural World

```javascript
import { LODTerrain, BiomeSystem } from 'grudge-studio/terrain'

const biomes = new BiomeSystem()
biomes.addBiome('forest', { 
  color: 0x228B22,
  heightRange: [0.3, 0.6],
  moistureRange: [0.5, 1.0]
})

const terrain = new LODTerrain(scene, {
  chunkSize: 64,
  viewDistance: 3,
  biomeSystem: biomes
})

// Update chunks based on camera position
function update() {
  terrain.update(camera.position)
}
```

## API Reference

Full API documentation is available in the `docs` module:

```javascript
import { KnowledgeBase, PromptLibrary, Examples } from 'grudge-studio/docs'

const kb = new KnowledgeBase()
console.log(kb.getModuleAPI('core'))
console.log(kb.search('camera'))

const prompts = new PromptLibrary()
console.log(prompts.getPrompt('debug_performance'))
```

## License

MIT
