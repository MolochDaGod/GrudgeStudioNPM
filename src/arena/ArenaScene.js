import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { ProceduralTerrain } from '../terrain/ProceduralTerrain.js'
import { Fighter3D } from '../fighters/Fighter3D.js'
import { AIController } from '../fighters/AIController.js'
import { GameConfig, GameState } from '../core/GameState.js'
import { CameraManager, CameraMode } from '../cameras/CameraManager.js'
import { Layers, setLayerRecursive } from '../core/Layers.js'
import { getPhysicsManager } from '../core/PhysicsManager.js'
import { getAssetPath } from '../core/paths.js'
import { TargetingSystem } from '../ui/TargetingSystem.js'
import { actionBarManager } from '../ui/ActionBar.js'
import { hotkeyManager } from '../ui/HotkeyManager.js'
import { CombatFeedback } from '../combat/CombatFeedback.js'
import { AudioManager } from '../audio/AudioManager.js'
import { EnhancedAIController } from './EnhancedAIController.js'
import { LODManager } from '../render/LODManager.js'
import { TouchControls } from '../ui/TouchControls.js'
import { skillTreeStats } from '../stats/SkillTreeStats.js'

export class ArenaScene {
  constructor(renderer, camera) {
    this.renderer = renderer
    this.camera = camera
    this.scene = new THREE.Scene()
    this.clock = new THREE.Clock()
    
    this.state = GameState.LOADING
    this.roundNumber = 1
    this.roundTimer = GameConfig.match.roundTime
    this.scores = { player: 0, opponent: 0 }
    
    this.player = null
    this.opponent = null
    this.aiController = null
    this.arenaModel = null
    this.terrain = null
    this.cameraManager = null
    this.physics = null
    
    this.onLoadProgress = null
    this.onCameraModeChange = null
    this.onStateChange = null
    this.onHealthUpdate = null
    this.onRoundEnd = null
    this.onMatchEnd = null
    
    this.targetingSystem = null
    this.actionBarsCreated = false
    
    this.combatFeedback = null
    this.audioManager = null
    this.lodManager = null
    this.touchControls = null
    this.useEnhancedAI = true
  }
  
  async init() {
    await this.initPhysics()
    this.setupLighting()
    this.setupEnvironment()
    await this.loadArenaModel()
    this.createTerrain()
    await this.createFighters()
    this.setupCamera()
    this.setupTargeting()
    this.setupActionBars()
    this.setupHotkeys()
    this.setupCombatFeedback()
    this.setupAudio()
    this.setupLOD()
    this.setupTouchControls()
    
    this.state = GameState.MENU
    if (this.onStateChange) this.onStateChange(this.state)
  }
  
  setupCombatFeedback() {
    this.combatFeedback = new CombatFeedback(this.scene, this.camera)
    this.combatFeedback.onComboUpdate = (count) => {
      if (count > 2) {
        console.log(`Combo x${count}!`)
      }
    }
  }
  
  setupAudio() {
    this.audioManager = new AudioManager(this.camera)
    this.audioManager.init()
  }
  
  setupLOD() {
    this.lodManager = new LODManager(this.scene, this.camera)
  }
  
  setupTouchControls() {
    if (TouchControls.isTouchDevice()) {
      this.touchControls = new TouchControls({
        onMove: (x, y) => {
          if (this.touchInput) {
            this.touchInput.x = x
            this.touchInput.y = y
          }
        },
        onJump: () => {
          if (this.player && this.state === GameState.PLAYING) {
            this.player.velocity.y = GameConfig.fighter.jumpForce
          }
        },
        onAttack: () => {
          this.performAction('attack_light')
        },
        onBlock: () => {
          this.performAction('block')
        },
        onSpecial: () => {
          this.performAction('attack_special')
        }
      })
      this.touchInput = { x: 0, y: 0 }
    }
  }
  
  setupTargeting() {
    this.targetingSystem = new TargetingSystem(this.scene, this.camera, this.renderer)
    
    if (this.opponent) {
      this.targetingSystem.registerTarget(this.opponent.group, {
        name: 'Enemy Gladiator',
        health: this.opponent.health,
        maxHealth: this.opponent.maxHealth,
        faction: 'enemy'
      })
    }
    
    this.targetingSystem.onTargetChange = (target) => {
      console.log('Target changed:', target?.userData?.targetData?.name)
    }
    
    this.targetingSystem.onTargetLock = (target) => {
      console.log('Target locked:', target?.userData?.targetData?.name)
    }
  }
  
  setupActionBars() {
    if (this.actionBarsCreated) return
    
    actionBarManager.createDefaultLayout()
    actionBarManager.hideAll()
    this.actionBarsCreated = true
  }
  
  setupHotkeys() {
    hotkeyManager.on('attack_light', () => this.performAction('attack_light'))
    hotkeyManager.on('attack_heavy', () => this.performAction('attack_heavy'))
    hotkeyManager.on('attack_special', () => this.performAction('attack_special'))
    hotkeyManager.on('block', () => this.performAction('block'))
    hotkeyManager.on('target_lock', () => this.cycleTarget())
    hotkeyManager.on('dodge_left', () => this.performAction('dodge_left'))
    hotkeyManager.on('dodge_right', () => this.performAction('dodge_right'))
  }
  
  performAction(actionId) {
    if (!this.player || this.state !== GameState.PLAYING) return
    
    const binding = hotkeyManager.getBinding(actionId)
    console.log('Performing action:', actionId, 'animation:', binding?.animation)
    
    switch (actionId) {
      case 'attack_light':
        this.player.attack('light')
        break
      case 'attack_heavy':
        this.player.attack('heavy')
        break
      case 'attack_special':
        this.player.attack('special')
        break
      case 'block':
        this.player.startBlock()
        break
    }
  }
  
  cycleTarget() {
    if (!this.targetingSystem) return
    
    if (this.targetingSystem.currentTarget) {
      this.targetingSystem.toggleLock()
    } else {
      const playerPos = this.player?.group?.position || new THREE.Vector3()
      const forward = new THREE.Vector3(0, 0, -1)
      if (this.camera) {
        this.camera.getWorldDirection(forward)
      }
      
      const target = this.targetingSystem.findNearestTarget(playerPos, forward)
      if (target) {
        this.targetingSystem.setTarget(target)
        this.targetingSystem.lockTarget()
      }
    }
  }
  
  async initPhysics() {
    try {
      this.physics = await getPhysicsManager()
      
      this.physics.createGroundCollider({ x: 30, z: 30 }, 0)
      
      console.log('Physics initialized with ground collider')
    } catch (error) {
      console.warn('Physics initialization failed:', error)
    }
  }
  
  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5)
    this.scene.add(ambientLight)
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5)
    mainLight.position.set(10, 20, 10)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    mainLight.shadow.camera.near = 0.5
    mainLight.shadow.camera.far = 50
    mainLight.shadow.camera.left = -25
    mainLight.shadow.camera.right = 25
    mainLight.shadow.camera.top = 25
    mainLight.shadow.camera.bottom = -25
    this.scene.add(mainLight)
    
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3)
    fillLight.position.set(-10, 10, -10)
    this.scene.add(fillLight)
    
    const rimLight = new THREE.DirectionalLight(0xff8844, 0.4)
    rimLight.position.set(0, 5, -15)
    this.scene.add(rimLight)
  }
  
  setupEnvironment() {
    this.scene.background = new THREE.Color(0x0a0a1a)
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02)
    
    const floorGeometry = new THREE.PlaneGeometry(100, 100)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.2,
      roughness: 0.8
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)
    
    const arenaFloorGeometry = new THREE.PlaneGeometry(GameConfig.arena.width, GameConfig.arena.depth)
    const arenaFloorMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a4e,
      metalness: 0.3,
      roughness: 0.6
    })
    const arenaFloor = new THREE.Mesh(arenaFloorGeometry, arenaFloorMaterial)
    arenaFloor.rotation.x = -Math.PI / 2
    arenaFloor.position.y = 0.02
    arenaFloor.receiveShadow = true
    this.scene.add(arenaFloor)
    
    this.createArenaBoundary()
  }
  
  createArenaBoundary() {
    const width = GameConfig.arena.width
    const depth = GameConfig.arena.depth
    const halfW = width / 2
    const halfD = depth / 2
    
    const borderMaterial = new THREE.MeshStandardMaterial({
      color: 0x667eea,
      emissive: 0x334477,
      metalness: 0.8,
      roughness: 0.2
    })
    
    const borderThickness = 0.4
    const borderHeight = 0.6
    
    const topBorder = new THREE.Mesh(
      new THREE.BoxGeometry(width + borderThickness * 2, borderHeight, borderThickness),
      borderMaterial
    )
    topBorder.position.set(0, borderHeight / 2, -halfD - borderThickness / 2)
    this.scene.add(topBorder)
    
    const bottomBorder = new THREE.Mesh(
      new THREE.BoxGeometry(width + borderThickness * 2, borderHeight, borderThickness),
      borderMaterial
    )
    bottomBorder.position.set(0, borderHeight / 2, halfD + borderThickness / 2)
    this.scene.add(bottomBorder)
    
    const leftBorder = new THREE.Mesh(
      new THREE.BoxGeometry(borderThickness, borderHeight, depth),
      borderMaterial
    )
    leftBorder.position.set(-halfW - borderThickness / 2, borderHeight / 2, 0)
    this.scene.add(leftBorder)
    
    const rightBorder = new THREE.Mesh(
      new THREE.BoxGeometry(borderThickness, borderHeight, depth),
      borderMaterial
    )
    rightBorder.position.set(halfW + borderThickness / 2, borderHeight / 2, 0)
    this.scene.add(rightBorder)
    
    const corners = [
      { x: -halfW, z: -halfD },
      { x: halfW, z: -halfD },
      { x: -halfW, z: halfD },
      { x: halfW, z: halfD }
    ]
    
    corners.forEach(corner => {
      const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.6, 5, 8)
      const pillarMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a5e,
        metalness: 0.5,
        roughness: 0.5
      })
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
      pillar.position.set(corner.x, 2.5, corner.z)
      pillar.castShadow = true
      this.scene.add(pillar)
      
      const lightGeometry = new THREE.SphereGeometry(0.3, 16, 16)
      const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x667eea })
      const light = new THREE.Mesh(lightGeometry, lightMaterial)
      light.position.set(corner.x, 5.5, corner.z)
      this.scene.add(light)
      
      const pointLight = new THREE.PointLight(0x667eea, 0.5, 10)
      pointLight.position.copy(light.position)
      this.scene.add(pointLight)
    })
  }
  
  async loadArenaModel() {
    const loader = new GLTFLoader()
    
    try {
      if (this.onLoadProgress) this.onLoadProgress(30, 'Loading arena model...')
      
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          getAssetPath('/models/arena.glb'),
          resolve,
          (progress) => {
            if (this.onLoadProgress) {
              const percent = 30 + (progress.loaded / progress.total) * 40
              this.onLoadProgress(percent, 'Loading arena model...')
            }
          },
          reject
        )
      })
      
      this.arenaModel = gltf.scene
      this.arenaModel.scale.set(1, 1, 1)
      this.arenaModel.position.set(0, 0, 0)
      
      this.arenaColliders = []
      
      this.arenaModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          const box = new THREE.Box3().setFromObject(child)
          this.arenaColliders.push({
            mesh: child,
            box: box,
            name: child.name
          })
        }
      })
      
      this.scene.add(this.arenaModel)
      
      setLayerRecursive(this.arenaModel, Layers.ARENA)
      
      const arenaBox = new THREE.Box3().setFromObject(this.arenaModel)
      const arenaSize = arenaBox.getSize(new THREE.Vector3())
      const arenaCenter = arenaBox.getCenter(new THREE.Vector3())
      
      console.log('Arena size:', arenaSize)
      console.log('Arena center:', arenaCenter)
      
      this.arenaModel.position.x -= arenaCenter.x
      this.arenaModel.position.z -= arenaCenter.z
      this.arenaModel.position.y -= arenaBox.min.y
      
      if (this.onLoadProgress) this.onLoadProgress(70, 'Arena loaded!')
    } catch (error) {
      console.warn('Could not load arena model:', error)
      if (this.onLoadProgress) this.onLoadProgress(70, 'Using default arena')
    }
  }
  
  createTerrain() {
    if (this.onLoadProgress) this.onLoadProgress(80, 'Generating terrain...')
    
    this.terrain = new ProceduralTerrain({
      width: 200,
      depth: 200,
      segments: 128,
      scale: 1,
      height: 3,
      frequency: 0.3
    })
    
    const terrainMesh = this.terrain.getMesh()
    terrainMesh.position.y = -15
    terrainMesh.position.x = 80
    terrainMesh.position.z = 60
    setLayerRecursive(terrainMesh, Layers.ARENA)
    this.scene.add(terrainMesh)
    
    if (this.onLoadProgress) this.onLoadProgress(90, 'Terrain complete!')
  }
  
  async createFighters() {
    if (this.onLoadProgress) this.onLoadProgress(95, 'Creating fighters...')
    
    const startDistance = GameConfig.arena.playerStartDistance
    const playerModelPath = getAssetPath('/models/characters/viking/scene.gltf')
    const opponentModelPath = getAssetPath('/models/characters/orc/scene.gltf')
    
    this.player = new Fighter3D({
      isPlayer: true,
      color: 0x4ade80,
      startPosition: new THREE.Vector3(-startDistance / 2, 0, 0),
      facingDirection: 1,
      modelPath: playerModelPath
    })
    const playerMesh = this.player.getMesh()
    setLayerRecursive(playerMesh, Layers.PLAYER)
    this.scene.add(playerMesh)
    
    this.opponent = new Fighter3D({
      isPlayer: false,
      color: 0xef4444,
      startPosition: new THREE.Vector3(startDistance / 2, 0, 0),
      facingDirection: -1,
      modelPath: opponentModelPath
    })
    const opponentMesh = this.opponent.getMesh()
    setLayerRecursive(opponentMesh, Layers.MONSTERS)
    this.scene.add(opponentMesh)
    
    await Promise.all([
      this.player.loadModel(),
      this.opponent.loadModel()
    ])
    
    const playerStats = skillTreeStats.applyToFighter({})
    if (playerStats.maxHealth) {
      this.player.maxHealth = playerStats.maxHealth
      this.player.health = playerStats.maxHealth
    }
    
    if (this.useEnhancedAI) {
      this.aiController = new EnhancedAIController(this.opponent, 0.5)
    } else {
      this.aiController = new AIController(this.opponent, 0.5)
    }
    
    if (this.onLoadProgress) this.onLoadProgress(100, 'Ready!')
  }
  
  setupCamera() {
    this.camera.position.set(0, 15, 25)
    this.camera.lookAt(0, 0, 0)
    
    this.cameraManager = new CameraManager(this.camera)
    this.cameraManager.onModeChange = (mode, name) => {
      if (this.onCameraModeChange) {
        this.onCameraModeChange(mode, name)
      }
    }
  }
  
  setCameraMode(modeIndex) {
    const modes = Object.values(CameraMode)
    if (modeIndex >= 0 && modeIndex < modes.length) {
      this.cameraManager.setMode(modes[modeIndex], this.player, this.opponent)
    }
  }
  
  getCameraModeName() {
    return this.cameraManager ? this.cameraManager.getModeName() : 'Third Person'
  }
  
  getCameraModeIndex() {
    const modes = Object.values(CameraMode)
    return modes.indexOf(this.cameraManager?.currentMode || CameraMode.THIRD_PERSON)
  }
  
  startMatch() {
    this.state = GameState.PLAYING
    this.roundNumber = 1
    this.roundTimer = GameConfig.match.roundTime
    this.scores = { player: 0, opponent: 0 }
    
    this.player.reset()
    this.opponent.reset()
    
    if (this.audioManager) {
      this.audioManager.playSound('round_start')
    }
    
    if (this.touchControls) {
      this.touchControls.enable()
    }
    
    actionBarManager.showAll()
    
    if (this.targetingSystem && this.opponent) {
      this.targetingSystem.registerTarget(this.opponent.group, {
        name: 'Enemy Gladiator',
        health: this.opponent.health,
        maxHealth: this.opponent.maxHealth,
        faction: 'enemy'
      })
    }
    
    if (this.onStateChange) this.onStateChange(this.state)
  }
  
  update(input, isTargetLocked = false) {
    const deltaTime = this.clock.getDelta()
    
    if (this.physics) {
      this.physics.step(deltaTime)
    }
    
    if (this.terrain) {
      this.terrain.update(deltaTime, 0.2)
    }
    
    if (this.state === GameState.PLAYING) {
      this.roundTimer -= deltaTime
      
      if (this.roundTimer <= 0) {
        this.endRound()
        return
      }
      
      this.player.update(deltaTime, input, this.opponent, isTargetLocked)
      
      const aiInput = this.aiController.update(deltaTime, this.player)
      this.opponent.update(deltaTime, aiInput, this.player)
      
      if (this.onHealthUpdate) {
        this.onHealthUpdate(
          this.player.getHealthPercent(),
          this.opponent.getHealthPercent(),
          Math.ceil(this.roundTimer)
        )
      }
      
      if (this.targetingSystem) {
        const playerPos = this.player?.group?.position || new THREE.Vector3()
        this.targetingSystem.update(playerPos)
        
        if (this.targetingSystem.currentTarget && this.opponent) {
          this.targetingSystem.updateTargetHealth(
            this.opponent.health,
            this.opponent.maxHealth
          )
        }
      }
      
      if (!this.player.isAlive() || !this.opponent.isAlive()) {
        this.endRound()
      }
      
      if (this.cameraManager) {
        this.cameraManager.update(this.player, this.opponent, input, deltaTime, isTargetLocked)
      } else {
        this.updateCamera(isTargetLocked)
      }
    }
    
    if (this.combatFeedback) {
      this.combatFeedback.update(deltaTime)
    }
    
    if (this.lodManager) {
      this.lodManager.update(deltaTime)
    }
    
    if (this.targetingSystem) {
      const rendered = this.targetingSystem.render()
      if (!rendered) {
        this.renderer.render(this.scene, this.camera)
      }
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }
  
  triggerHitFeedback(position, damage, options = {}) {
    if (this.combatFeedback) {
      this.combatFeedback.triggerHit(position, damage, options)
    }
    if (this.audioManager) {
      const soundName = options.isCritical ? 'hit_critical' : 
                        options.attackType === 'heavy' ? 'hit_heavy' : 'hit_light'
      this.audioManager.playSound(soundName, { position })
    }
  }
  
  updateCamera(isTargetLocked = false) {
    if (isTargetLocked) {
      const playerPos = this.player.getPosition()
      const opponentPos = this.opponent.getPosition()
      
      const behindPlayer = playerPos.clone()
      const dirToOpponent = opponentPos.clone().sub(playerPos).normalize()
      behindPlayer.sub(dirToOpponent.multiplyScalar(8))
      behindPlayer.y = 6
      
      this.camera.position.lerp(behindPlayer, 0.1)
      this.camera.lookAt(opponentPos.x, 1.5, opponentPos.z)
    } else {
      const midpoint = this.player.getPosition().clone()
        .add(this.opponent.getPosition())
        .multiplyScalar(0.5)
      
      const distance = this.player.getPosition().distanceTo(this.opponent.getPosition())
      const cameraDistance = Math.max(15, 10 + distance * 0.8)
      
      this.camera.position.x = midpoint.x
      this.camera.position.z = midpoint.z + cameraDistance
      this.camera.position.y = 8 + distance * 0.3
      
      this.camera.lookAt(midpoint.x, 1, midpoint.z)
    }
  }
  
  endRound() {
    const playerWon = this.opponent.getHealth() < this.player.getHealth()
    
    if (playerWon) {
      this.scores.player++
    } else {
      this.scores.opponent++
    }
    
    if (this.onRoundEnd) {
      this.onRoundEnd(this.roundNumber, playerWon, this.scores)
    }
    
    if (this.scores.player >= GameConfig.match.roundsToWin || 
        this.scores.opponent >= GameConfig.match.roundsToWin) {
      this.endMatch()
      return
    }
    
    this.roundNumber++
    this.roundTimer = GameConfig.match.roundTime
    this.player.reset()
    this.opponent.reset()
    
    this.state = GameState.PLAYING
  }
  
  endMatch() {
    const playerWon = this.scores.player > this.scores.opponent
    this.state = GameState.MATCH_END
    
    if (this.onMatchEnd) {
      this.onMatchEnd(playerWon, this.scores)
    }
    
    if (this.onStateChange) this.onStateChange(this.state)
  }
  
  pause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED
      if (this.onStateChange) this.onStateChange(this.state)
    }
  }
  
  resume() {
    if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING
      this.clock.getDelta()
      if (this.onStateChange) this.onStateChange(this.state)
    }
  }
  
  returnToMenu() {
    this.state = GameState.MENU
    if (this.onStateChange) this.onStateChange(this.state)
  }
  
  getState() {
    return this.state
  }
  
  getScene() {
    return this.scene
  }
  
  dispose() {
    if (this.player) this.player.dispose()
    if (this.opponent) this.opponent.dispose()
    if (this.terrain) this.terrain.dispose()
    if (this.combatFeedback) this.combatFeedback.dispose()
    if (this.audioManager) this.audioManager.dispose()
    if (this.lodManager) this.lodManager.dispose()
    if (this.touchControls) this.touchControls.dispose()
    
    this.scene.traverse((child) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }
}
