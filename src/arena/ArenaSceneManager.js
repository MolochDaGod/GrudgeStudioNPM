/*
    GRUDGE Studio - Arena Scene Manager
    Complete scene management using SDK resources
*/

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { ArenaGameStateMachine, ArenaState, ArenaEvent } from './ArenaGameState.js'
import { ArenaEntity, EntityType } from './ArenaEntity.js'
import { ArenaAIController } from './ArenaAIController.js'
import { ProceduralTerrain } from '../terrain/ProceduralTerrain.js'
import { CameraManager, CameraMode } from '../cameras/CameraManager.js'
import { getPhysicsManager } from '../core/PhysicsManager.js'
import { TargetingSystem } from '../ui/TargetingSystem.js'
import { actionBarManager } from '../ui/ActionBar.js'
import { hotkeyManager } from '../ui/HotkeyManager.js'
import { getAssetPath } from '../core/paths.js'
import { Layers, setLayerRecursive } from '../core/Layers.js'

export class ArenaSceneManager {
    constructor(renderer, camera) {
        this.renderer = renderer
        this.camera = camera
        this.scene = new THREE.Scene()
        this.clock = new THREE.Clock()
        
        this.stateMachine = new ArenaGameStateMachine()
        
        this.player = null
        this.opponent = null
        this.aiController = null
        this.entities = new Map()
        
        this.cameraManager = null
        this.targetingSystem = null
        this.physics = null
        this.terrain = null
        this.arenaModel = null
        
        this.lights = []
        this.environmentObjects = []
        
        this.callbacks = {
            onLoadProgress: null,
            onStateChange: null,
            onHealthUpdate: null,
            onRoundEnd: null,
            onMatchEnd: null,
            onCameraModeChange: null
        }
        
        this.config = {
            arenaWidth: 40,
            arenaDepth: 30,
            playerStartDistance: 15,
            roundTime: 90,
            roundsToWin: 2,
            maxRounds: 3,
            countdownDuration: 3
        }
        
        this.setupStateListeners()
    }
    
    setupStateListeners() {
        this.stateMachine.on('stateChange', (event) => {
            this.onStateTransition(event)
            this.callbacks.onStateChange?.(event.to, event.data)
        })
        
        this.stateMachine.on('dataChange', (data) => {
            if (this.stateMachine.isFighting()) {
                this.callbacks.onHealthUpdate?.(
                    data.playerHealth / data.playerMaxHealth,
                    data.opponentHealth / data.opponentMaxHealth,
                    Math.ceil(data.roundTimer)
                )
            }
        })
    }
    
    onStateTransition(event) {
        switch (event.to) {
            case ArenaState.COUNTDOWN:
                this.startCountdown()
                break
            case ArenaState.FIGHTING:
                this.startFighting()
                break
            case ArenaState.ROUND_END:
                this.handleRoundEnd(event.data)
                break
            case ArenaState.MATCH_END:
                this.handleMatchEnd(event.data)
                break
            case ArenaState.MENU:
                this.returnToMenu()
                break
        }
    }
    
    async init() {
        this.reportProgress(5, 'Initializing physics...')
        await this.initPhysics()
        
        this.reportProgress(15, 'Setting up lighting...')
        this.setupLighting()
        
        this.reportProgress(25, 'Creating environment...')
        this.setupEnvironment()
        
        this.reportProgress(40, 'Loading arena model...')
        await this.loadArenaModel()
        
        this.reportProgress(60, 'Generating terrain...')
        this.createTerrain()
        
        this.reportProgress(75, 'Creating fighters...')
        await this.createFighters()
        
        this.reportProgress(90, 'Setting up camera and systems...')
        this.setupCamera()
        this.setupTargeting()
        this.setupActionBars()
        this.setupHotkeys()
        
        this.reportProgress(100, 'Ready!')
        
        this.stateMachine.dispatch(ArenaEvent.LOAD_COMPLETE)
    }
    
    reportProgress(percent, status) {
        this.stateMachine.updateData({ loadProgress: percent, loadStatus: status })
        this.callbacks.onLoadProgress?.(percent, status)
    }
    
    async initPhysics() {
        try {
            this.physics = await getPhysicsManager()
            this.physics.createGroundCollider(
                { x: this.config.arenaWidth, z: this.config.arenaDepth },
                0
            )
        } catch (error) {
            console.warn('Physics initialization failed:', error)
        }
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x6080a0, 0.8)
        this.scene.add(ambientLight)
        this.lights.push(ambientLight)
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 2.0)
        mainLight.position.set(10, 25, 10)
        mainLight.castShadow = true
        mainLight.shadow.mapSize.width = 2048
        mainLight.shadow.mapSize.height = 2048
        mainLight.shadow.camera.near = 0.5
        mainLight.shadow.camera.far = 60
        mainLight.shadow.camera.left = -35
        mainLight.shadow.camera.right = 35
        mainLight.shadow.camera.top = 35
        mainLight.shadow.camera.bottom = -35
        mainLight.shadow.bias = -0.0001
        this.scene.add(mainLight)
        this.lights.push(mainLight)
        
        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5)
        fillLight.position.set(-15, 12, -15)
        this.scene.add(fillLight)
        this.lights.push(fillLight)
        
        const rimLight = new THREE.DirectionalLight(0xff8844, 0.6)
        rimLight.position.set(0, 8, -20)
        this.scene.add(rimLight)
        this.lights.push(rimLight)
        
        const topLight = new THREE.DirectionalLight(0xffffff, 0.4)
        topLight.position.set(0, 30, 0)
        this.scene.add(topLight)
        this.lights.push(topLight)
    }
    
    setupEnvironment() {
        this.scene.background = new THREE.Color(0x1a1a2e)
        this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.008)
        
        const floorGeometry = new THREE.PlaneGeometry(150, 150)
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d2d4a,
            metalness: 0.1,
            roughness: 0.9
        })
        const floor = new THREE.Mesh(floorGeometry, floorMaterial)
        floor.rotation.x = -Math.PI / 2
        floor.position.y = -0.01
        floor.receiveShadow = true
        this.scene.add(floor)
        this.environmentObjects.push(floor)
        
        const arenaFloorGeometry = new THREE.PlaneGeometry(
            this.config.arenaWidth,
            this.config.arenaDepth
        )
        const arenaFloorMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d3d6a,
            metalness: 0.2,
            roughness: 0.7
        })
        const arenaFloor = new THREE.Mesh(arenaFloorGeometry, arenaFloorMaterial)
        arenaFloor.rotation.x = -Math.PI / 2
        arenaFloor.position.y = 0.01
        arenaFloor.receiveShadow = true
        this.scene.add(arenaFloor)
        this.environmentObjects.push(arenaFloor)
        
        const gridHelper = new THREE.GridHelper(this.config.arenaWidth, 20, 0x4a4a7a, 0x3a3a5a)
        gridHelper.position.y = 0.02
        this.scene.add(gridHelper)
        this.environmentObjects.push(gridHelper)
        
        this.createArenaBoundary()
    }
    
    createArenaBoundary() {
        const { arenaWidth, arenaDepth } = this.config
        const halfW = arenaWidth / 2
        const halfD = arenaDepth / 2
        
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0x667eea,
            emissive: 0x334477,
            metalness: 0.8,
            roughness: 0.2
        })
        
        const borders = [
            { pos: [0, 0.3, -halfD - 0.2], size: [arenaWidth + 0.8, 0.6, 0.4] },
            { pos: [0, 0.3, halfD + 0.2], size: [arenaWidth + 0.8, 0.6, 0.4] },
            { pos: [-halfW - 0.2, 0.3, 0], size: [0.4, 0.6, arenaDepth] },
            { pos: [halfW + 0.2, 0.3, 0], size: [0.4, 0.6, arenaDepth] }
        ]
        
        borders.forEach(({ pos, size }) => {
            const geometry = new THREE.BoxGeometry(...size)
            const border = new THREE.Mesh(geometry, borderMaterial)
            border.position.set(...pos)
            border.castShadow = true
            border.receiveShadow = true
            this.scene.add(border)
            this.environmentObjects.push(border)
        })
        
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
            this.environmentObjects.push(pillar)
            
            const orbGeometry = new THREE.SphereGeometry(0.3, 16, 16)
            const orbMaterial = new THREE.MeshBasicMaterial({ color: 0x667eea })
            const orb = new THREE.Mesh(orbGeometry, orbMaterial)
            orb.position.set(corner.x, 5.5, corner.z)
            this.scene.add(orb)
            this.environmentObjects.push(orb)
            
            const pointLight = new THREE.PointLight(0x667eea, 0.5, 12)
            pointLight.position.copy(orb.position)
            this.scene.add(pointLight)
            this.lights.push(pointLight)
        })
    }
    
    async loadArenaModel() {
        const loader = new GLTFLoader()
        
        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    getAssetPath('/models/arena.glb'),
                    resolve,
                    (progress) => {
                        if (progress.total) {
                            const percent = 40 + (progress.loaded / progress.total) * 20
                            this.reportProgress(percent, 'Loading arena model...')
                        }
                    },
                    reject
                )
            })
            
            this.arenaModel = gltf.scene
            this.arenaModel.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
            
            const box = new THREE.Box3().setFromObject(this.arenaModel)
            const center = box.getCenter(new THREE.Vector3())
            this.arenaModel.position.x -= center.x
            this.arenaModel.position.z -= center.z
            this.arenaModel.position.y -= box.min.y
            
            setLayerRecursive(this.arenaModel, Layers.ARENA)
            this.scene.add(this.arenaModel)
            
        } catch (error) {
            console.warn('Could not load arena model:', error)
        }
    }
    
    createTerrain() {
        this.terrain = new ProceduralTerrain({
            width: 200,
            depth: 200,
            segments: 128,
            scale: 1,
            height: 3,
            frequency: 0.3
        })
        
        const terrainMesh = this.terrain.getMesh()
        terrainMesh.position.set(80, -15, 60)
        setLayerRecursive(terrainMesh, Layers.ARENA)
        this.scene.add(terrainMesh)
    }
    
    async createFighters() {
        const playerModelPath = getAssetPath('/models/characters/viking/scene.gltf')
        const opponentModelPath = getAssetPath('/models/characters/orc/scene.gltf')
        const startDistance = this.config.playerStartDistance
        
        this.player = new ArenaEntity({
            type: EntityType.PLAYER,
            name: 'Viking Warrior',
            position: new THREE.Vector3(-startDistance / 2, 0, 0),
            rotation: 0,
            modelPath: playerModelPath,
            color: 0x4ade80,
            stats: {
                maxHealth: 100,
                health: 100,
                strength: 12,
                dexterity: 10,
                constitution: 11
            }
        })
        
        this.opponent = new ArenaEntity({
            type: EntityType.AI,
            name: 'Orc Warrior',
            position: new THREE.Vector3(startDistance / 2, 0, 0),
            rotation: Math.PI,
            modelPath: opponentModelPath,
            color: 0xef4444,
            stats: {
                maxHealth: 100,
                health: 100,
                strength: 14,
                dexterity: 8,
                constitution: 12
            }
        })
        
        await Promise.all([
            this.player.loadModel(),
            this.opponent.loadModel()
        ])
        
        setLayerRecursive(this.player.group, Layers.PLAYER)
        setLayerRecursive(this.opponent.group, Layers.MONSTERS)
        
        this.scene.add(this.player.group)
        this.scene.add(this.opponent.group)
        
        this.entities.set(this.player.id, this.player)
        this.entities.set(this.opponent.id, this.opponent)
        
        this.aiController = new ArenaAIController(this.opponent, 'MEDIUM')
        this.aiController.setTarget(this.player)
        
        this.stateMachine.updateData({
            playerHealth: this.player.stats.health,
            playerMaxHealth: this.player.stats.maxHealth,
            opponentHealth: this.opponent.stats.health,
            opponentMaxHealth: this.opponent.stats.maxHealth
        })
    }
    
    setupCamera() {
        this.camera.position.set(0, 15, 25)
        this.camera.lookAt(0, 0, 0)
        
        this.cameraManager = new CameraManager(this.camera)
        this.cameraManager.onModeChange = (mode, name) => {
            this.callbacks.onCameraModeChange?.(mode, name)
        }
    }
    
    setupTargeting() {
        this.targetingSystem = new TargetingSystem(this.scene, this.camera, this.renderer)
        
        if (this.opponent) {
            this.targetingSystem.registerTarget(this.opponent.group, {
                name: this.opponent.name,
                health: this.opponent.stats.health,
                maxHealth: this.opponent.stats.maxHealth,
                faction: 'enemy'
            })
        }
        
        this.targetingSystem.onTargetChange = (target) => {
            console.log('Target:', target?.userData?.targetData?.name)
        }
    }
    
    setupActionBars() {
        actionBarManager.createDefaultLayout()
        actionBarManager.hideAll()
    }
    
    setupHotkeys() {
        hotkeyManager.on('attack_light', () => this.performPlayerAction('attack_light'))
        hotkeyManager.on('attack_heavy', () => this.performPlayerAction('attack_heavy'))
        hotkeyManager.on('attack_special', () => this.performPlayerAction('attack_special'))
        hotkeyManager.on('block', () => this.performPlayerAction('block'))
        hotkeyManager.on('target_lock', () => this.cycleTarget())
    }
    
    performPlayerAction(actionId) {
        if (!this.player || !this.stateMachine.isFighting()) return
        
        switch (actionId) {
            case 'attack_light':
            case 'attack_heavy':
            case 'attack_special':
                const attackType = actionId.replace('attack_', '')
                const attack = this.player.attack(attackType)
                if (attack && this.player.canAttack(this.opponent)) {
                    const result = this.opponent.takeDamage(attack.damage, this.player)
                    this.updateHealthDisplay()
                    
                    if (result.killed) {
                        this.stateMachine.dispatch(ArenaEvent.FIGHTER_DEFEATED, { winner: 'player' })
                    }
                }
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
            const playerPos = this.player?.getPosition() || new THREE.Vector3()
            const forward = new THREE.Vector3()
            this.camera.getWorldDirection(forward)
            
            const target = this.targetingSystem.findNearestTarget(playerPos, forward)
            if (target) {
                this.targetingSystem.setTarget(target)
                this.targetingSystem.lockTarget()
            }
        }
    }
    
    startMatch() {
        console.log('[ArenaSceneManager] startMatch() called, current state:', this.stateMachine.getState())
        this.resetFighters()
        
        if (this.player) {
            console.log('[ArenaSceneManager] Player position:', this.player.group.position.toArray())
            console.log('[ArenaSceneManager] Player visible:', this.player.group.visible)
            console.log('[ArenaSceneManager] Player in scene:', this.scene.children.includes(this.player.group))
        }
        if (this.opponent) {
            console.log('[ArenaSceneManager] Opponent position:', this.opponent.group.position.toArray())
            console.log('[ArenaSceneManager] Opponent visible:', this.opponent.group.visible)
            console.log('[ArenaSceneManager] Opponent in scene:', this.scene.children.includes(this.opponent.group))
        }
        
        console.log('[ArenaSceneManager] Fighters reset, dispatching START_MATCH event...')
        this.stateMachine.dispatch(ArenaEvent.START_MATCH)
        console.log('[ArenaSceneManager] New state:', this.stateMachine.getState())
        actionBarManager.showAll()
    }
    
    startCountdown() {
        let count = this.config.countdownDuration
        
        const countdown = setInterval(() => {
            count--
            this.stateMachine.updateData({ countdownTimer: count })
            
            if (count <= 0) {
                clearInterval(countdown)
                this.stateMachine.dispatch(ArenaEvent.COUNTDOWN_DONE)
            }
        }, 1000)
    }
    
    startFighting() {
        this.stateMachine.updateData({
            roundTimer: this.config.roundTime
        })
    }
    
    handleRoundEnd(data) {
        const { scores, roundNumber } = data
        
        this.callbacks.onRoundEnd?.(roundNumber, data.winner === 'player', scores)
        
        if (scores.player >= this.config.roundsToWin || 
            scores.opponent >= this.config.roundsToWin) {
            const matchWinner = scores.player >= this.config.roundsToWin ? 'player' : 'opponent'
            this.stateMachine.dispatch(ArenaEvent.MATCH_WON, { matchWinner })
        } else {
            this.stateMachine.updateData({ roundNumber: roundNumber + 1 })
            
            setTimeout(() => {
                this.resetFighters()
                this.stateMachine.dispatch(ArenaEvent.NEXT_ROUND)
            }, 2000)
        }
    }
    
    handleMatchEnd(data) {
        this.callbacks.onMatchEnd?.(data.matchWinner === 'player', data.scores)
        actionBarManager.hideAll()
    }
    
    returnToMenu() {
        this.resetFighters()
        actionBarManager.hideAll()
    }
    
    resetFighters() {
        const startDistance = this.config.playerStartDistance
        
        if (this.player) {
            this.player.respawn(new THREE.Vector3(-startDistance / 2, 0, 0))
            this.player.group.rotation.y = 0
            this.player.group.visible = true
            if (!this.scene.children.includes(this.player.group)) {
                this.scene.add(this.player.group)
                console.log('[ArenaSceneManager] Re-added player to scene')
            }
        }
        
        if (this.opponent) {
            this.opponent.respawn(new THREE.Vector3(startDistance / 2, 0, 0))
            this.opponent.group.rotation.y = Math.PI
            this.opponent.group.visible = true
            if (!this.scene.children.includes(this.opponent.group)) {
                this.scene.add(this.opponent.group)
                console.log('[ArenaSceneManager] Re-added opponent to scene')
            }
        }
        
        if (this.aiController) {
            this.aiController.reset()
        }
        
        this.updateHealthDisplay()
    }
    
    updateHealthDisplay() {
        this.stateMachine.updateData({
            playerHealth: this.player?.stats.health || 0,
            opponentHealth: this.opponent?.stats.health || 0
        })
    }
    
    update(input, isTargetLocked = false) {
        const deltaTime = this.clock.getDelta()
        
        if (this.physics) {
            this.physics.step(deltaTime)
        }
        
        if (this.terrain) {
            this.terrain.update(deltaTime, 0.2)
        }
        
        if (this.stateMachine.isFighting()) {
            const data = this.stateMachine.getData()
            const newTimer = data.roundTimer - deltaTime
            
            if (newTimer <= 0) {
                const winner = this.player.stats.health > this.opponent.stats.health ? 'player' : 'opponent'
                this.stateMachine.dispatch(ArenaEvent.ROUND_TIMEOUT, { winner })
            } else {
                this.stateMachine.updateData({ roundTimer: newTimer })
            }
            
            this.updatePlayer(deltaTime, input, isTargetLocked)
            this.updateOpponent(deltaTime)
            
            this.checkCombat()
            
            if (this.targetingSystem) {
                this.targetingSystem.update(this.player?.getPosition() || new THREE.Vector3())
                if (this.opponent) {
                    this.targetingSystem.updateTargetHealth(
                        this.opponent.stats.health,
                        this.opponent.stats.maxHealth
                    )
                }
            }
        }
        
        this.entities.forEach(entity => {
            entity.update(deltaTime)
        })
        
        if (this.cameraManager && this.stateMachine.isActive()) {
            this.cameraManager.update(this.player, this.opponent, input, deltaTime, isTargetLocked)
        }
        
        this.render()
    }
    
    updatePlayer(deltaTime, input, isTargetLocked) {
        if (!this.player || !input) return
        
        const moveDirection = new THREE.Vector3()
        
        if (input.isForward()) moveDirection.z -= 1
        if (input.isBackward()) moveDirection.z += 1
        if (input.isLeft()) moveDirection.x -= 1
        if (input.isRight()) moveDirection.x += 1
        
        if (this.camera && moveDirection.lengthSq() > 0) {
            const cameraDirection = new THREE.Vector3()
            this.camera.getWorldDirection(cameraDirection)
            cameraDirection.y = 0
            cameraDirection.normalize()
            
            const cameraRight = new THREE.Vector3()
            cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))
            
            const worldMove = new THREE.Vector3()
            worldMove.addScaledVector(cameraDirection, -moveDirection.z)
            worldMove.addScaledVector(cameraRight, moveDirection.x)
            
            moveDirection.copy(worldMove)
        }
        
        const isRunning = input.isRunning?.() || false
        this.player.move(moveDirection, deltaTime, isRunning)
        
        if (isTargetLocked && this.opponent) {
            this.player.lookAt(this.opponent)
        }
        
        this.constrainToArena(this.player)
    }
    
    updateOpponent(deltaTime) {
        if (!this.opponent || !this.aiController) return
        
        const aiInput = this.aiController.update(deltaTime)
        
        if (aiInput.moveDirection.lengthSq() > 0) {
            this.opponent.move(aiInput.moveDirection, deltaTime, aiInput.run)
        }
        
        if (aiInput.attack && this.opponent.canAttack(this.player)) {
            const attack = this.opponent.attack(aiInput.attackType || 'light')
            if (attack) {
                const result = this.player.takeDamage(attack.damage, this.opponent)
                this.updateHealthDisplay()
                
                if (result.killed) {
                    this.stateMachine.dispatch(ArenaEvent.FIGHTER_DEFEATED, { winner: 'opponent' })
                }
            }
        }
        
        if (aiInput.block) {
            this.opponent.startBlock()
        } else if (this.opponent.state.isBlocking) {
            this.opponent.endBlock()
        }
        
        this.constrainToArena(this.opponent)
    }
    
    checkCombat() {
        if (!this.player?.state.isAlive || !this.opponent?.state.isAlive) return
        
        if (!this.player.state.isAlive) {
            this.stateMachine.dispatch(ArenaEvent.FIGHTER_DEFEATED, { winner: 'opponent' })
        } else if (!this.opponent.state.isAlive) {
            this.stateMachine.dispatch(ArenaEvent.FIGHTER_DEFEATED, { winner: 'player' })
        }
    }
    
    constrainToArena(entity) {
        const { arenaWidth, arenaDepth } = this.config
        const halfW = arenaWidth / 2 - 1
        const halfD = arenaDepth / 2 - 1
        
        const pos = entity.group.position
        pos.x = THREE.MathUtils.clamp(pos.x, -halfW, halfW)
        pos.z = THREE.MathUtils.clamp(pos.z, -halfD, halfD)
    }
    
    render() {
        if (!this.renderer || !this.scene || !this.camera) {
            console.warn('[ArenaSceneManager] Missing renderer/scene/camera for render')
            return
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
    
    setCameraMode(modeIndex) {
        const modes = Object.values(CameraMode)
        if (modeIndex >= 0 && modeIndex < modes.length && this.cameraManager) {
            this.cameraManager.setMode(modes[modeIndex], this.player, this.opponent)
        }
    }
    
    pause() {
        if (this.stateMachine.isFighting()) {
            this.stateMachine.dispatch(ArenaEvent.PAUSE)
        }
    }
    
    resume() {
        if (this.stateMachine.getState() === ArenaState.PAUSED) {
            this.stateMachine.dispatch(ArenaEvent.RESUME)
            this.clock.getDelta()
        }
    }
    
    quit() {
        this.stateMachine.dispatch(ArenaEvent.QUIT)
    }
    
    getState() {
        return this.stateMachine.getState()
    }
    
    getScene() {
        return this.scene
    }
    
    dispose() {
        this.entities.forEach(entity => entity.dispose())
        this.entities.clear()
        
        if (this.terrain) this.terrain.dispose()
        
        this.environmentObjects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose()
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose())
                } else {
                    obj.material.dispose()
                }
            }
        })
        
        this.scene.traverse(child => {
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

export default ArenaSceneManager
