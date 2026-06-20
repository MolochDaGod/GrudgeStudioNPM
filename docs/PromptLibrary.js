export const PromptLibrary = {
  systemPrompt: \`You are an expert game developer assistant specializing in the GRUDGE STUDIO SDK. 
This SDK provides a comprehensive framework for building 3D multiplayer games using Three.js.

Key modules:
- core: Math (Vec2/Vec3/Mat4/Quat), collision (AABB/Sphere/Capsule), state machines, events, input, time
- render: Scene management, cameras (Orbit/Follow/FirstPerson/ThirdPerson/Cinematic), animation, materials, particles
- controllers: Character controllers (FPS/TPS/Platformer), vehicle physics, combat system
- terrain: Procedural generation, heightmaps, LOD chunking, biomes
- net: Socket.IO networking, state sync, client prediction, lobby system

When helping users:
1. Use the appropriate SDK modules and classes
2. Follow the established patterns (EventEmitter, StateMachine, fluent API)
3. Provide working code examples
4. Explain the architecture decisions
5. Suggest best practices for performance and maintainability\`,

  prompts: {
    createCharacter: \`Create a player character with:
- Third person controller
- Smooth camera follow
- Jump and run abilities
- Basic collision with ground

Use ThirdPersonController from @grudge-studio/controllers and ThirdPersonCamera from @grudge-studio/render.\`,

    createCombat: \`Implement a combat system with:
- Light and heavy attacks
- Combo chains (light -> light -> heavy)
- Blocking with stamina
- Damage and knockback
- Hit reactions

Use CombatController and DamageSystem from @grudge-studio/controllers.\`,

    createTerrain: \`Generate a procedural terrain with:
- Multiple biomes based on height and moisture
- LOD for performance
- Player can walk on terrain surface
- Height-based coloring

Use TerrainGenerator, BiomeSystem, and LODTerrain from @grudge-studio/terrain.\`,

    createMultiplayer: \`Set up multiplayer with:
- Room/lobby system
- Player state synchronization
- Smooth interpolation for remote players
- Host migration on disconnect

Use NetworkManager, Lobby, and StateSync from @grudge-studio/net.\`,

    createFPS: \`Build a first-person shooter with:
- FPS camera with mouse look
- WASD movement with sprint
- Weapon aiming and shooting
- Recoil and crosshair

Use FirstPersonController from @grudge-studio/controllers and FirstPersonCamera from @grudge-studio/render.\`,

    createPlatformer: \`Create a 3D platformer character with:
- Double jump
- Wall slide and wall jump
- Dash ability with cooldown
- Coyote time for forgiving jumps

Use PlatformerController from @grudge-studio/controllers.\`,

    createVehicle: \`Implement vehicle physics with:
- Steering and acceleration
- Handbrake for drifting
- Speed-dependent turning
- Camera follow

Use VehicleController from @grudge-studio/controllers and FollowCamera from @grudge-studio/render.\`,

    createAnimation: \`Set up animation system with:
- Idle, walk, run, jump states
- Smooth transitions between animations
- Attack animations with events
- Blend trees for movement

Use AnimationController and AnimationStateMachine from @grudge-studio/render.\`,

    createParticles: \`Create a particle effect for:
- Explosion with fire and smoke
- Sparks on impact
- Trail behind moving objects
- Magic spell effects

Use ParticleSystem and ParticleEmitter from @grudge-studio/render.\`,

    createUI: \`Build game UI with:
- Health bar
- Stamina/energy bar
- Minimap
- Inventory grid
- Damage numbers

Use standard HTML/CSS with the EventBus from @grudge-studio/core for game events.\`
  },

  codeTemplates: {
    gameLoop: \`
import { Clock } from '@grudge-studio/core'
import { SceneManager } from '@grudge-studio/render'
import { InputManager } from '@grudge-studio/core'

const scene = new SceneManager({ container: document.body })
const input = new InputManager()
const clock = new Clock()

function update(dt) {
  // Game logic here
}

function render() {
  scene.render()
}

function gameLoop() {
  const dt = clock.getDelta()
  update(dt)
  render()
  input.update()
  requestAnimationFrame(gameLoop)
}

gameLoop()
\`,

    playerSetup: \`
import * as THREE from 'three'
import { ThirdPersonController } from '@grudge-studio/controllers'
import { AssetLoader } from '@grudge-studio/render'

const loader = new AssetLoader()
const playerModel = await loader.loadModel('/models/player.glb')

const player = playerModel.scene
scene.add(player)

const controller = new ThirdPersonController(player, camera, {
  moveSpeed: 8,
  runSpeed: 14,
  jumpForce: 12
})

// Set up collision
controller.setColliders([ground, walls])

// Animation
const animator = AnimationController.fromModel(player)
animator.addClips(playerModel.animations)
animator.play('idle')
\`,

    networkSetup: \`
import { NetworkManager, Lobby, StateSync } from '@grudge-studio/net'

const network = new NetworkManager()
const lobby = new Lobby(network)
const sync = new StateSync(network)

await network.connect(window.location.origin)

lobby.on('playerJoined', (player) => {
  console.log('Player joined:', player.name)
  createRemotePlayer(player.id)
})

lobby.on('playerLeft', ({ playerId }) => {
  removeRemotePlayer(playerId)
})

sync.onRemoteUpdate = (entityId, state, playerId) => {
  updateRemotePlayer(entityId, state)
}

await lobby.joinRoom('game-1', { name: playerName })
sync.registerEntity(myPlayerId, initialState, true)
sync.startSync()
\`,

    combatSetup: \`
import { CombatController, DamageSystem } from '@grudge-studio/controllers'

const damageSystem = new DamageSystem()
const combat = new CombatController()

// Register attacks
combat.registerAttack('lightAttack', {
  damage: 10,
  knockback: 3,
  stunDuration: 0.2,
  startup: 0.1,
  active: 0.15,
  recovery: 0.2,
  comboChain: ['lightAttack', 'heavyAttack']
})

combat.registerAttack('heavyAttack', {
  damage: 25,
  knockback: 8,
  stunDuration: 0.5,
  startup: 0.3,
  active: 0.2,
  recovery: 0.5
})

// Register entities
damageSystem.registerEntity('player', { maxHealth: 100 })
damageSystem.registerEntity('enemy', { maxHealth: 50 })

// Handle hits
combat.on('attackActive', (name, data) => {
  const hits = checkHitbox(data.hitbox)
  for (const target of hits) {
    damageSystem.applyDamage(target.id, data.damage, { element: 'physical' })
  }
})
\`
  },

  errorSolutions: {
    'Cannot read property of undefined': 'Check that all required modules are imported and initialized before use.',
    'Object is not iterable': 'Ensure you are passing an array where expected, not a single object.',
    'WebGL context lost': 'Too many draw calls or memory leak. Dispose unused geometries and materials.',
    'Socket connection refused': 'Server may not be running. Check server logs and CORS configuration.',
    'Animation not found': 'Verify animation clip name matches the name in the GLB file.',
    'Collision not detecting': 'Ensure colliders are added to controller and objects are on correct layers.'
  }
}
