export const KnowledgeBase = {
  overview: {
    name: 'GRUDGE STUDIO SDK',
    version: '1.0.0',
    description: 'A comprehensive game development SDK for building 3D multiplayer games with Three.js',
    modules: {
      core: 'Math utilities, collision detection, state machines, events, input handling, time management',
      render: 'Scene management, camera systems, animation controllers, material factory, asset loading, particles',
      controllers: 'Character controllers (FPS, TPS, platformer), vehicle physics, combat system',
      terrain: 'Procedural terrain generation, heightmaps, LOD chunking, biome system',
      net: 'Networking with Socket.IO, state sync, client prediction, lobby system',
      docs: 'Knowledge base, AI prompts, example templates'
    }
  },

  architecture: {
    patterns: {
      eventDriven: 'Use EventEmitter for decoupled component communication',
      stateMachine: 'Manage complex state transitions with StateMachine and AnimationStateMachine',
      componentBased: 'Controllers and systems work as composable components',
      modular: 'Each module is independent and can be used separately'
    },
    
    conventions: {
      naming: {
        classes: 'PascalCase (e.g., CharacterController, SceneManager)',
        methods: 'camelCase (e.g., update, addState, setPosition)',
        constants: 'UPPER_SNAKE_CASE for true constants',
        events: 'camelCase string identifiers (e.g., "playerJoined", "stateUpdate")'
      },
      
      patterns: {
        factory: 'Use static factory methods for complex object creation',
        builder: 'Chain methods that return this for fluent API',
        observer: 'EventEmitter pattern for pub/sub',
        singleton: 'EventBus provides global message passing'
      }
    }
  },

  quickStart: {
    basicSetup: \`
import { SceneManager, OrbitCamera } from '@grudge-studio/render'
import { InputManager } from '@grudge-studio/core'
import { Clock } from '@grudge-studio/core'

// Create scene
const scene = new SceneManager({ container: document.body })
scene.addDirectionalLight()
scene.addAmbientLight()

// Create camera controller
const orbit = new OrbitCamera(scene.getCamera(), { distance: 10 })

// Create input manager
const input = new InputManager()

// Game loop
const clock = new Clock()
function gameLoop() {
  const dt = clock.getDelta()
  
  // Handle input
  if (input.isMouseDown(0)) {
    orbit.rotate(input.getMouseDelta().x, input.getMouseDelta().y)
  }
  
  // Update
  orbit.update(dt)
  input.update()
  
  // Render
  scene.render()
  requestAnimationFrame(gameLoop)
}

gameLoop()
\`,

    characterController: \`
import { ThirdPersonController } from '@grudge-studio/controllers'
import { ThirdPersonCamera } from '@grudge-studio/render'

// Create player mesh
const playerMesh = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.5, 1),
  new THREE.MeshStandardMaterial({ color: 0x4488ff })
)
scene.add(playerMesh)

// Create controller
const controller = new ThirdPersonController(playerMesh, camera, {
  moveSpeed: 8,
  jumpForce: 10,
  sensitivity: 0.003
})

// In game loop
const move = input.getMovementVector()
controller.setMoveDirection(move.x, move.y)
controller.setForward(controller.getForward())

if (input.isKeyPressed('Space')) {
  controller.jump()
}

controller.look(input.getMouseDelta().x, input.getMouseDelta().y)
controller.update(dt)
\`,

    terrainGeneration: \`
import { TerrainGenerator } from '@grudge-studio/terrain'

const terrain = new TerrainGenerator({
  width: 200,
  depth: 200,
  resolution: 256,
  maxHeight: 30
})

terrain.generateHeightMap({
  octaves: 6,
  persistence: 0.5,
  frequency: 0.02,
  island: true
})

terrain.createMaterial({ shader: true })
const mesh = terrain.build()
scene.add(mesh)

// Get height at position
const height = terrain.getHeightAt(playerX, playerZ)
\`,

    multiplayerSetup: \`
import { NetworkManager, Lobby, StateSync } from '@grudge-studio/net'

const network = new NetworkManager({ debug: true })
const lobby = new Lobby(network)
const stateSync = new StateSync(network)

// Connect
await network.connect('http://localhost:3000')

// Join or create room
await lobby.joinRoom('arena-1', { name: 'Player1' })

// Register entities for sync
stateSync.registerEntity('player-' + network.getPlayerId(), {
  position: { x: 0, y: 0, z: 0 },
  rotation: 0,
  health: 100
}, true)

// In game loop - update state
stateSync.setState('player-' + network.getPlayerId(), {
  position: player.position,
  rotation: player.rotation.y
})

// Start syncing
stateSync.startSync()
\`
  },

  api: {
    core: {
      Vec2: 'import { Vec2 } from "@grudge-studio/core" - 2D vector with add, sub, mul, dot, normalize, etc.',
      Vec3: 'import { Vec3 } from "@grudge-studio/core" - 3D vector with cross product and additional operations',
      Mat4: 'import { Mat4 } from "@grudge-studio/core" - 4x4 matrix for 3D transformations',
      Quat: 'import { Quat } from "@grudge-studio/core" - Quaternion for rotations',
      AABB: 'import { AABB } from "@grudge-studio/core" - Axis-aligned bounding box collision',
      Sphere: 'import { Sphere } from "@grudge-studio/core" - Sphere collision primitive',
      Capsule: 'import { Capsule } from "@grudge-studio/core" - Capsule collision for characters',
      StateMachine: 'import { StateMachine, State } from "@grudge-studio/core" - Finite state machine',
      EventEmitter: 'import { EventEmitter } from "@grudge-studio/core" - Event pub/sub system',
      EventBus: 'import { EventBus } from "@grudge-studio/core" - Global event channel system',
      InputManager: 'import { InputManager } from "@grudge-studio/core" - Keyboard/mouse/touch input',
      Gamepad: 'import { Gamepad } from "@grudge-studio/core" - Gamepad/controller support',
      Clock: 'import { Clock } from "@grudge-studio/core" - Delta time and FPS tracking',
      Timer: 'import { Timer, TimerManager } from "@grudge-studio/core" - Delayed/repeated callbacks',
      Tween: 'import { Tween, TweenManager } from "@grudge-studio/core" - Property animation'
    },
    
    render: {
      SceneManager: 'Creates renderer, scene, camera, and manages lighting',
      OrbitCamera: 'Orbit around a target point with mouse drag',
      FollowCamera: 'Smooth follow camera for third-person games',
      FirstPersonCamera: 'First-person camera with pitch/yaw and head bob',
      ThirdPersonCamera: 'Third-person camera with collision detection',
      CinematicCamera: 'Keyframe-based camera animation',
      AnimationController: 'Three.js animation mixer wrapper with crossfading',
      AnimationStateMachine: 'State-based animation transitions',
      MaterialFactory: 'Preset materials: standard, toon, glass, metal, emissive',
      AssetLoader: 'Load GLB/GLTF, textures, audio with caching',
      ParticleSystem: 'GPU-friendly point-based particle system',
      ParticleEmitter: 'Configurable particle emission with shapes'
    },
    
    controllers: {
      CharacterController: 'Base character physics with grounding, jumping, slopes',
      FirstPersonController: 'FPS character with camera integration',
      ThirdPersonController: 'TPS character with camera follow',
      PlatformerController: 'Double jump, wall slide, dash abilities',
      VehicleController: 'Arcade vehicle physics with steering',
      CombatController: 'Attack registration, combos, blocking, stun',
      DamageSystem: 'Health, armor, damage modifiers, resistances'
    },
    
    terrain: {
      HeightMap: 'Generate and manipulate 2D height data',
      TerrainGenerator: 'Create terrain mesh from heightmap',
      TerrainChunk: 'Single terrain tile with LOD support',
      LODTerrain: 'Infinite terrain with chunked loading',
      BiomeSystem: 'Temperature/moisture-based biome coloring'
    },
    
    net: {
      NetworkManager: 'Socket.IO wrapper with reconnection and ping',
      StateSync: 'Entity state synchronization with interpolation',
      ClientPrediction: 'Input prediction and server reconciliation',
      Lobby: 'Room creation, player management, ready system',
      ServerTemplate: 'Node.js/Express server boilerplate'
    }
  },

  troubleshooting: {
    'Model not loading': 'Ensure GLTF/GLB path is correct. Use AssetLoader.loadModel() and check console for errors.',
    'No shadows': 'Enable shadow maps on SceneManager, set castShadow/receiveShadow on meshes.',
    'Character falling through floor': 'Add ground collider to controller.setColliders(). Check collider layer.',
    'Network messages not received': 'Verify socket.io client is loaded. Check CORS settings on server.',
    'Terrain too slow': 'Reduce resolution, use LODTerrain for large worlds.',
    'Animation not playing': 'Check clip name matches. Use AnimationController.addClips() first.',
    'Camera clipping into walls': 'Enable collision on ThirdPersonCamera with setCameraColliders().',
    'Input not working': 'Call inputManager.update() each frame. Check key codes (use KeyW not W).'
  },

  bestPractices: [
    'Always call update() methods each frame (controllers, cameras, tweens, timers)',
    'Dispose resources when done (geometries, materials, textures)',
    'Use EventBus for cross-system communication',
    'Pool frequently created objects (particles, projectiles)',
    'Use LOD terrain for large open worlds',
    'Implement client prediction for smooth multiplayer',
    'Separate game logic from rendering',
    'Use state machines for complex AI and player states'
  ]
}
