# Grudge Studio Tools - Comprehensive Guide

## 📚 Table of Contents

1. [Shader Systems](#shader-systems)
2. [Input Systems](#input-systems)
3. [Camera Systems](#camera-systems)
4. [Physics Systems](#physics-systems)
5. [Example Tools](#example-tools)
6. [Quick Start Examples](#quick-start-examples)

---

## Shader Systems

Advanced shader-based visual effects and materials.

### ShaderAnimationSystem

Create animated shaders for dynamic visual effects.

```javascript
import { ShaderAnimationSystem } from 'grudge-studio/tools'

const shaderSystem = new ShaderAnimationSystem()

// Water shader with waves
const waterMaterial = shaderSystem.createWaterShader({
    color: new THREE.Color(0x006994),
    opacity: 0.8,
    waveHeight: 0.1,
    waveSpeed: 1.0,
    waveFrequency: 2.0
})

const waterGeometry = new THREE.PlaneGeometry(100, 100, 64, 64)
const water = new THREE.Mesh(waterGeometry, waterMaterial)
scene.add(water)

// Update in animation loop
shaderSystem.update()
```

#### Available Shaders

- **Water Shader**: Animated wave effects with customizable parameters
- **Lava Shader**: Bubbling lava with color gradients
- **Portal Shader**: Swirling dimensional portals
- **Fireball Shader**: Animated fire spell effects

### MaterialSystem

Comprehensive material management for different object types.

```javascript
const materialSystem = new MaterialSystem()

// Combat materials
const metalMaterial = materialSystem.createCombatMaterial('metal', {
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2
})

const stoneMaterial = materialSystem.createCombatMaterial('stone', {
    color: 0x666666,
    roughness: 0.9
})

const fleshMaterial = materialSystem.createCombatMaterial('flesh', {
    color: 0xffaa88
})

const energyMaterial = materialSystem.createCombatMaterial('energy', {
    color: 0x00ffff,
    intensity: 2.0
})

// Environment materials
const forestMaterials = materialSystem.createEnvironmentMaterial('forest')
// Returns: { ground, foliage, bark }

// Optimize materials across scene
const materialCount = materialSystem.optimizeMaterials(scene)
console.log(`Optimized to ${materialCount} unique materials`)
```

### SkyboxSystem

Dynamic and procedural skybox generation.

```javascript
const skyboxSystem = new SkyboxSystem()

// Procedural skybox
const skybox = skyboxSystem.createProceduralSkybox({
    topColor: new THREE.Color(0x0077ff),
    bottomColor: new THREE.Color(0xffffff),
    exponent: 0.6
})
scene.add(skybox)

// Dynamic time-of-day skybox
const timeOfDay = 0.3 // 0 = midnight, 0.5 = noon, 1 = midnight
const dynamicSkybox = skyboxSystem.createDynamicSkybox(timeOfDay)
scene.add(dynamicSkybox)

// Environment presets
const desertSkybox = skyboxSystem.createEnvironmentSkybox('desert')
// Available: 'forest', 'desert', 'space'
```

---

## Input Systems

Multi-modal input handling for mouse, gamepad, and motion controls.

### UnifiedInputManager

Centralized input management across all input methods.

```javascript
import { UnifiedInputManager } from 'grudge-studio/tools'

const inputManager = new UnifiedInputManager(camera, domElement)
await inputManager.initialize()

// Bind custom actions
inputManager.bindAction('sprint', [
    'keyboard:Shift',
    'gamepad:RB'
])

// Listen for input events
inputManager.on('movement', (direction) => {
    player.move(direction)
})

inputManager.on('attack', (data) => {
    player.attack(data)
})

// Update in animation loop
inputManager.update(deltaTime)

// Query input state
const movement = inputManager.getMovementVector()
const look = inputManager.getLookDelta()
const isJumping = inputManager.isActionActive('jump')
```

### GamepadSystem

Full gamepad support with vibration feedback.

```javascript
const gamepadSystem = new GamepadSystem()

// Update gamepad state
gamepadSystem.update()

// Query button states
if (gamepadSystem.isButtonPressed(0, 'A')) {
    console.log('A button pressed')
}

if (gamepadSystem.isButtonJustPressed(0, 'X')) {
    console.log('X button just pressed')
}

// Get analog stick input
const leftStick = gamepadSystem.getLeftStick(0)
const rightStick = gamepadSystem.getRightStick(0)

// Haptic feedback
gamepadSystem.vibrate(0, 0.5, 0.8, 200) // weak, strong, duration
```

### LeapMotionSystem

Hand gesture recognition and motion controls.

```javascript
const leapMotion = new LeapMotionSystem()
await leapMotion.initialize()

// Listen for hand gestures
leapMotion.onGrab = (handType, strength) => {
    console.log(`${handType} hand grabbing with ${strength} strength`)
}

leapMotion.onSwipe = (direction, speed) => {
    console.log(`Swipe detected: ${direction}, speed: ${speed}`)
}

leapMotion.onFingerCount = (handType, count) => {
    console.log(`${handType} hand showing ${count} fingers`)
}

// Get hand position
const handPos = leapMotion.getHandPosition('right')
if (handPos) {
    player.position.copy(handPos)
}
```

---

## Camera Systems

Multiple camera controllers for different gameplay perspectives.

### OrbitCameraController

Perfect for action games and third-person views.

```javascript
import { OrbitCameraController } from 'grudge-studio/tools'

const orbitalCamera = new OrbitCameraController(camera, domElement, {
    enableRotate: true,
    enableZoom: true,
    enablePan: true,
    enableDamping: true,
    dampingFactor: 0.05,
    autoRotate: true,
    autoRotateSpeed: 2.0
})

// Update in animation loop
orbitalCamera.update(deltaTime)

// Set target
orbitalCamera.setTarget(new THREE.Vector3(0, 0, 0))
orbitalCamera.setDistance(15)
```

### FirstPersonCameraController

Immersive first-person perspective with physics.

```javascript
import { FirstPersonCameraController } from 'grudge-studio/tools'

const fpCamera = new FirstPersonCameraController(camera, {
    moveSpeed: 10,
    jumpSpeed: 15,
    gravity: -30,
    lookSpeed: 2
})

// Set collision objects for ground detection
fpCamera.setCollisionObjects([groundMesh, wallMesh])

// Update with input
fpCamera.update(deltaTime, inputManager)
```

### ThirdPersonCameraController

Smart third-person camera with collision avoidance.

```javascript
import { ThirdPersonCameraController } from 'grudge-studio/tools'

const tpCamera = new ThirdPersonCameraController(camera, player, {
    offset: new THREE.Vector3(0, 3, -8),
    followSpeed: 5,
    rotationSpeed: 3,
    minDistance: 2
})

// Detect obstacles
tpCamera.setCollisionObjects([buildings, terrain])

tpCamera.update(deltaTime, inputManager)
```

### CinematicCameraSystem

Create cinematic sequences and camera paths.

```javascript
import { CinematicCameraSystem } from 'grudge-studio/tools'

const cinematicCam = new CinematicCameraSystem(camera)

// Define camera shots
cinematicCam.defineShot('intro', [
    {
        time: 0,
        position: new THREE.Vector3(0, 10, -20),
        lookAt: new THREE.Vector3(0, 0, 0),
        fov: 50
    },
    {
        time: 3000,
        position: new THREE.Vector3(20, 5, 0),
        lookAt: new THREE.Vector3(0, 2, 0),
        fov: 60
    }
])

// Create smooth camera path
cinematicCam.createPath('main_route', [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(10, 5, 10),
    new THREE.Vector3(20, 10, 0),
    new THREE.Vector3(10, 5, -10)
], { duration: 10000 })

// Play shot
await cinematicCam.playShot('intro')

// Play path
await cinematicCam.followPath('main_route')
```

---

## Physics Systems

Full 3D physics simulation with collision detection.

### PhysicsWorld

Complete physics engine with rigid bodies and constraints.

```javascript
import { PhysicsWorld, PhysicsBody, SphereShape, BoxShape } from 'grudge-studio/tools'

const physics = new PhysicsWorld({
    gravity: new THREE.Vector3(0, -9.81, 0),
    timeStep: 1/60
})

// Create dynamic body
const sphereShape = new SphereShape(1)
const body = new PhysicsBody({
    type: 'dynamic',
    shape: sphereShape,
    mass: 10,
    position: new THREE.Vector3(0, 5, 0),
    mesh: sphereMesh,
    restitution: 0.5,
    friction: 0.3
})

physics.addBody(body)

// Apply forces
body.applyForce(new THREE.Vector3(0, 100, 0)) // Upward force
body.applyImpulse(new THREE.Vector3(50, 0, 0), contactPoint)

// Raycast for hits
const hits = physics.raycast(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -1, 0),
    100
)

hits.forEach(hit => {
    console.log(`Hit ${hit.body.id} at distance ${hit.distance}`)
})

// Update physics
physics.step(deltaTime)
```

### Constraints

Connect bodies with distance and spring constraints.

```javascript
import { DistanceConstraint, SpringConstraint } from 'grudge-studio/tools'

// Distance constraint (rigid connection)
const constraint = new DistanceConstraint(body1, body2, 5, 0.9)
physics.addConstraint(constraint)

// Spring constraint (elastic connection)
const spring = new SpringConstraint(body1, body2, 5, 50, 2)
physics.addConstraint(spring)
```

---

## Example Tools

Ready-to-use visual effects and systems.

### InteractiveParticleSystem

Dynamic particle effects responsive to input.

```javascript
import { InteractiveParticleSystem } from 'grudge-studio/tools'

const particles = new InteractiveParticleSystem(scene, {
    count: 1000
})

// Add attractors
particles.addAttractor(new THREE.Vector3(0, 0, 0), 50)

// Update in animation loop
particles.update(deltaTime, mousePosition)
```

### AdvancedLightingSystem

Professional lighting with dynamic effects.

```javascript
import { AdvancedLightingSystem } from 'grudge-studio/tools'

const lights = new AdvancedLightingSystem(scene, {
    shadows: true,
    dynamicLighting: true
})

// Create point light
const { id, light } = lights.createPointLight(
    new THREE.Vector3(5, 5, 5),
    0xffffff,
    1,
    50
)

// Create spotlight
lights.createSpotlight(
    new THREE.Vector3(0, 10, 0),
    new THREE.Vector3(0, 0, 0),
    0xffffff,
    1,
    50,
    Math.PI / 4
)

// Create fire light with flickering
const fireLight = lights.createFireLight(new THREE.Vector3(10, 2, 10))

// Update time of day
lights.update(deltaTime)
```

### ProceduralTerrain

Infinite procedural terrain generation.

```javascript
import { ProceduralTerrain } from 'grudge-studio/tools'

const terrain = new ProceduralTerrain({
    size: 200,
    segments: 64,
    heightScale: 20,
    noiseScale: 0.1
})

scene.add(terrain.mesh)

// Get height at world position
const height = terrain.getHeightAt(worldX, worldZ)
```

### InteractiveObjectSystem

Pick, hover, and drag 3D objects.

```javascript
import { InteractiveObjectSystem } from 'grudge-studio/tools'

const interaction = new InteractiveObjectSystem(scene, camera)

// Register interactive object
const id = interaction.addInteractiveObject(mesh, {
    hoverable: true,
    clickable: true,
    draggable: true,
    data: { type: 'treasure', value: 100 }
})

// Setup callbacks
interaction.onHover(id, (mesh, point, data) => {
    mesh.material.emissive.setHex(0x333333)
})

interaction.onClick(id, (mesh, data) => {
    console.log(`Collected ${data.type}!`)
})

interaction.onDrag(id, (mesh, point, data) => {
    mesh.position.copy(point)
})
```

### SpatialAudioSystem

3D audio with positional effects.

```javascript
import { SpatialAudioSystem } from 'grudge-studio/tools'

const audio = new SpatialAudioSystem(camera, { masterVolume: 1.0 })

// Load sounds
const { id: bgmId } = await audio.loadSound('/audio/bgm.mp3', {
    loop: true,
    volume: 0.5
})

const { id: sfxId } = await audio.loadSound('/audio/footstep.mp3', {
    positional: true,
    refDistance: 20,
    volume: 1.0
})

// Play sounds
audio.playSound(bgmId)
audio.playSound(sfxId, enemyPosition)

// Audio zones
const zone = audio.createAudioZone(
    new THREE.Vector3(0, 0, 0),
    30,
    bgmId,
    { fadeDistance: 15, volume: 1.0 }
)

audio.updateAudioZones([zone], camera.position)
```

---

## Quick Start Examples

### Complete First-Person Game

```javascript
import * as THREE from 'three'
import { createGrudgeStudioSetup, QuickSetup } from 'grudge-studio/tools'

const canvas = document.querySelector('canvas')

// Setup FPS game
const setup = QuickSetup.createFPSGame(canvas, {
    moveSpeed: 15,
    lookSpeed: 2,
    shadows: true
})

// Create game world
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
)
ground.rotation.x = -Math.PI / 2
setup.scene.add(ground)

// Add enemy
const enemy = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xff0000 })
)
enemy.position.set(10, 1, 10)
setup.scene.add(enemy)

// Create physics body for enemy
const enemyBody = new setup.physicsWorld.PhysicsBody({
    shape: new setup.physicsWorld.SphereShape(1),
    mass: 50,
    position: enemy.position,
    mesh: enemy
})
setup.physicsWorld.addBody(enemyBody)
```

### Third-Person Adventure Game

```javascript
const setup = QuickSetup.createAdventureGame(canvas, player, {
    followSpeed: 5,
    rotationSpeed: 3
})

const interaction = setup.examplesSystem.getInteractionSystem()

// Make treasure chests interactive
interaction.addInteractiveObject(treasureChest, {
    clickable: true,
    data: { treasure: 100 }
})

interaction.onClick('chest', (mesh, data) => {
    player.addGold(data.treasure)
    mesh.visible = false
})
```

### Cinematic Experience

```javascript
const setup = QuickSetup.createCinematicExperience(canvas, {
    autoRotate: false
})

const cinematicCam = setup.cinematicCamera

// Create opening sequence
cinematicCam.defineShot('opening', [
    {
        time: 0,
        position: new THREE.Vector3(0, 20, -40),
        fov: 50
    },
    {
        time: 5000,
        position: new THREE.Vector3(30, 15, -30),
        fov: 60
    }
])

// Play when ready
document.querySelector('button.play').addEventListener('click', () => {
    cinematicCam.playShot('opening')
})
```

### Interactive Showcase

```javascript
const setup = QuickSetup.createInteractiveShowcase(canvas)

const lights = setup.examplesSystem.getLightingSystem()
const shaders = setup.examplesSystem.getShaderSystem()

// Add interactive visual effects
const portal = new THREE.Mesh(
    new THREE.RingGeometry(2, 4, 32),
    shaders.createPortalShader()
)
setup.scene.add(portal)

const water = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    shaders.createWaterShader()
)
setup.scene.add(water)

// Interactive lighting
lights.createFireLight(new THREE.Vector3(5, 3, 5))
```

---

## Performance Monitoring

```javascript
import { PerformanceMonitor } from 'grudge-studio/tools'

const monitor = new PerformanceMonitor(renderer, { showStats: true })

// In animation loop
monitor.update()

// Get stats
const stats = monitor.getStats()
console.log(`FPS: ${stats.fps}`)
console.log(`Draw Calls: ${stats.drawCalls}`)
console.log(`Memory: ${stats.memory}MB`)
```

---

## Advanced Integration

Combine multiple systems for complex games:

```javascript
import * as Tools from 'grudge-studio/tools'

class GameEngine {
    constructor(canvas) {
        this.input = new Tools.UnifiedInputManager(camera, canvas)
        this.physics = new Tools.PhysicsWorld()
        this.shaders = new Tools.ShaderAnimationSystem()
        this.lighting = new Tools.AdvancedLightingSystem(scene)
        this.particles = new Tools.InteractiveParticleSystem(scene)
        this.interaction = new Tools.InteractiveObjectSystem(scene, camera)
        this.audio = new Tools.SpatialAudioSystem(camera)
    }
    
    update(deltaTime) {
        this.input.update(deltaTime)
        this.physics.step(deltaTime)
        this.shaders.update()
        this.lighting.update(deltaTime)
        this.particles.update(deltaTime)
        this.audio.updateAudioZones(this.zones, camera.position)
    }
}
```

---

For more information, visit the [main README](README.md) and [API Reference](API.md).