import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'

// Grudge Studio imports
import GrudgeStudioTools from './tools/index.js'
import { Vec3, SimplexNoise } from '../core/index.js'
import { TerrainGenerator } from '../terrain/index.js'
import { ParticleSystem } from '../render/index.js'

class PlaygroundApp {
    constructor() {
        this.scene = new THREE.Scene()
        this.camera = null
        this.renderer = null
        this.controls = null
        this.composer = null
        
        // Character system
        this.characters = new Map()
        this.currentCharacter = null
        this.characterAnimations = new Map()
        this.mixer = null
        
        // Environment
        this.terrain = null
        this.environment = 'forest'
        this.particles = []
        
        // Game state
        this.gameMode = 'sandbox'
        this.isArenaMode = false
        this.opponents = []
        
        // Performance monitoring
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: performance.now(),
            triangles: 0,
            drawCalls: 0
        }
        
        this.clock = new THREE.Clock()
        this.loadingManager = new THREE.LoadingManager()
        
        // Initialize Grudge Studio Tools
        this.grudgeTools = null
        
        this.init()
    }

    async init() {
        this.setupRenderer()
        this.setupCamera()
        this.setupControls()
        this.setupLights()
        this.setupPostProcessing()
        this.setupLoaders()
        
        await this.loadCharacters()
        this.createEnvironment()
        this.setupEventListeners()
        
        // Initialize Grudge Studio Tools after basic setup
        this.initializeGrudgeTools()
        
        this.hideLoadingScreen()
        
        this.animate()
    }

    setupRenderer() {
        const canvas = document.querySelector('canvas.webgl')
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            powerPreference: 'high-performance'
        })
        
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setClearColor(0x0a0a0a, 1)
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        )
        this.camera.position.set(10, 8, 10)
        this.scene.add(this.camera)
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.maxDistance = 50
        this.controls.minDistance = 2
        this.controls.maxPolarAngle = Math.PI * 0.9
    }

    setupLights() {
        // Directional light (sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1)
        this.sunLight.position.set(10, 10, 5)
        this.sunLight.castShadow = true
        this.sunLight.shadow.mapSize.width = 2048
        this.sunLight.shadow.mapSize.height = 2048
        this.sunLight.shadow.camera.near = 0.1
        this.sunLight.shadow.camera.far = 50
        this.sunLight.shadow.camera.left = -20
        this.sunLight.shadow.camera.right = 20
        this.sunLight.shadow.camera.top = 20
        this.sunLight.shadow.camera.bottom = -20
        this.scene.add(this.sunLight)

        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.3)
        this.scene.add(this.ambientLight)

        // Point lights for dramatic effect
        this.pointLight1 = new THREE.PointLight(0xff6b35, 0.5, 20)
        this.pointLight1.position.set(-10, 5, 10)
        this.scene.add(this.pointLight1)

        this.pointLight2 = new THREE.PointLight(0x35a7ff, 0.5, 20)
        this.pointLight2.position.set(10, 5, -10)
        this.scene.add(this.pointLight2)
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer)
        
        const renderPass = new RenderPass(this.scene, this.camera)
        this.composer.addPass(renderPass)
        
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.5, 0.4, 0.85
        )
        this.composer.addPass(bloomPass)
        
        const smaaPass = new SMAAPass(
            window.innerWidth * this.renderer.getPixelRatio(),
            window.innerHeight * this.renderer.getPixelRatio()
        )
        this.composer.addPass(smaaPass)
    }

    setupLoaders() {
        // GLTF Loader with Draco compression
        this.gltfLoader = new GLTFLoader(this.loadingManager)
        
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/libs/draco/')
        this.gltfLoader.setDRACOLoader(dracoLoader)
        
        // Loading progress
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = (itemsLoaded / itemsTotal) * 100
            this.updateLoadingProgress(progress)
        }
    }

    async loadCharacters() {
        const characterConfigs = [
            {
                id: 'orc-warrior',
                name: 'Orc Warrior',
                modelPath: '/assets/models/characters/orc_warrior.glb',
                animations: ['idle', 'walk', 'attack', 'victory'],
                scale: 1.0,
                color: 0x4a7c3a
            },
            {
                id: 'skeleton-mage',
                name: 'Skeleton Mage',
                modelPath: '/assets/models/characters/skeleton_mage.glb',
                animations: ['idle', 'cast_spell', 'float', 'summon'],
                scale: 1.1,
                color: 0x8b4c8b
            },
            {
                id: 'elf-ranger',
                name: 'Elf Ranger',
                modelPath: '/assets/models/characters/elf_ranger.glb',
                animations: ['idle', 'bow_draw', 'run', 'dodge'],
                scale: 0.95,
                color: 0x2d5a27
            },
            {
                id: 'human-paladin',
                name: 'Human Paladin',
                modelPath: '/assets/models/characters/human_paladin.glb',
                animations: ['idle', 'sword_stance', 'holy_spell', 'charge'],
                scale: 1.0,
                color: 0xffd700
            },
            {
                id: 'dwarf-berserker',
                name: 'Dwarf Berserker',
                modelPath: '/assets/models/characters/dwarf_berserker.glb',
                animations: ['idle', 'axe_swing', 'rage', 'battle_cry'],
                scale: 0.8,
                color: 0x8b4513
            },
            {
                id: 'dwarven-guardian',
                name: 'Dwarven Guardian',
                modelPath: '/assets/models/characters/dwarven_guardian.glb',
                animations: ['idle', 'shield_block', 'hammer_slam', 'defend'],
                scale: 0.85,
                color: 0x4682b4
            }
        ]

        // Load character models
        for (const config of characterConfigs) {
            try {
                await this.loadCharacterModel(config)
            } catch (error) {
                console.warn(`Failed to load character ${config.id}, using fallback:`, error)
                this.createFallbackCharacter(config)
            }
        }

        // Set initial character
        this.setActiveCharacter('orc-warrior')
    }

    async loadCharacterModel(config) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                config.modelPath,
                (gltf) => {
                    const character = {
                        model: gltf.scene,
                        animations: gltf.animations,
                        mixer: new THREE.AnimationMixer(gltf.scene),
                        config: config
                    }

                    // Setup character
                    character.model.scale.setScalar(config.scale)
                    character.model.position.y = 0
                    character.model.castShadow = true
                    character.model.receiveShadow = true

                    // Store animations
                    const animationMap = new Map()
                    gltf.animations.forEach((clip) => {
                        const action = character.mixer.clipAction(clip)
                        animationMap.set(clip.name, action)
                    })
                    character.animationMap = animationMap

                    this.characters.set(config.id, character)
                    resolve(character)
                },
                (progress) => {
                    console.log(`Loading ${config.id}: ${(progress.loaded / progress.total * 100)}%`)
                },
                reject
            )
        })
    }

    createFallbackCharacter(config) {
        // Create a simple geometric character as fallback
        const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8)
        const material = new THREE.MeshStandardMaterial({ 
            color: config.color,
            roughness: 0.7,
            metalness: 0.1
        })
        
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 0.75
        mesh.castShadow = true
        mesh.receiveShadow = true

        const character = {
            model: mesh,
            animations: [],
            mixer: null,
            config: config,
            animationMap: new Map()
        }

        this.characters.set(config.id, character)
    }

    setActiveCharacter(characterId) {
        // Hide current character
        if (this.currentCharacter) {
            this.scene.remove(this.currentCharacter.model)
        }

        // Show new character
        const character = this.characters.get(characterId)
        if (character) {
            this.currentCharacter = character
            this.scene.add(character.model)
            this.mixer = character.mixer

            // Update UI
            document.querySelectorAll('.character-card').forEach(card => {
                card.classList.remove('active')
            })
            document.querySelector(`[data-character="${characterId}"]`).classList.add('active')

            // Play idle animation
            this.playAnimation('idle')
        }
    }

    playAnimation(animationName) {
        if (!this.currentCharacter || !this.currentCharacter.animationMap) return

        // Stop all current animations
        this.currentCharacter.animationMap.forEach(action => action.stop())

        // Play requested animation
        const action = this.currentCharacter.animationMap.get(animationName)
        if (action) {
            action.reset()
            action.play()
        }
    }

    createEnvironment() {
        // Create terrain
        this.createTerrain()
        
        // Add skybox
        this.createSkybox()
        
        // Add environment objects
        this.createEnvironmentObjects()
        
        // Add particles
        this.createParticleEffects()
    }

    createTerrain() {
        const terrainSize = 50
        const terrainResolution = 128
        
        this.terrain = new TerrainGenerator({
            size: terrainSize,
            resolution: terrainResolution,
            height: 2,
            noise: {
                frequency: 0.5,
                amplitude: 1,
                octaves: 4
            }
        })

        const terrainMesh = this.terrain.generate()
        terrainMesh.receiveShadow = true
        this.scene.add(terrainMesh)
    }

    createSkybox() {
        const loader = new THREE.CubeTextureLoader()
        const skyboxTexture = loader.load([
            '/assets/skybox/px.jpg', '/assets/skybox/nx.jpg',
            '/assets/skybox/py.jpg', '/assets/skybox/ny.jpg',
            '/assets/skybox/pz.jpg', '/assets/skybox/nz.jpg'
        ])
        this.scene.background = skyboxTexture
    }

    createEnvironmentObjects() {
        // Create arena if in arena mode
        if (this.gameMode === 'arena') {
            this.createArena()
        }

        // Add decorative elements based on environment
        this.addEnvironmentDecorations()
    }

    createArena() {
        const arenaSize = 20
        const arenaGeometry = new THREE.RingGeometry(arenaSize * 0.8, arenaSize, 32)
        const arenaMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.8,
            metalness: 0.1
        })
        
        const arena = new THREE.Mesh(arenaGeometry, arenaMaterial)
        arena.rotation.x = -Math.PI / 2
        arena.position.y = 0.1
        arena.receiveShadow = true
        this.scene.add(arena)

        // Add arena walls
        this.createArenaWalls(arenaSize)
    }

    createArenaWalls(size) {
        const wallHeight = 3
        const wallThickness = 0.5
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2
            const x = Math.cos(angle) * size
            const z = Math.sin(angle) * size
            
            const wallGeometry = new THREE.BoxGeometry(2, wallHeight, wallThickness)
            const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 })
            const wall = new THREE.Mesh(wallGeometry, wallMaterial)
            
            wall.position.set(x, wallHeight / 2, z)
            wall.lookAt(0, wallHeight / 2, 0)
            wall.castShadow = true
            wall.receiveShadow = true
            
            this.scene.add(wall)
        }
    }

    addEnvironmentDecorations() {
        // Add trees, rocks, etc. based on environment preset
        const decorationCount = 20
        
        for (let i = 0; i < decorationCount; i++) {
            const decoration = this.createRandomDecoration()
            this.scene.add(decoration)
        }
    }

    createRandomDecoration() {
        const type = Math.random()
        let decoration
        
        if (type < 0.4) {
            // Tree
            decoration = this.createTree()
        } else if (type < 0.7) {
            // Rock
            decoration = this.createRock()
        } else {
            // Crystal
            decoration = this.createCrystal()
        }
        
        // Random position
        const angle = Math.random() * Math.PI * 2
        const distance = 15 + Math.random() * 20
        decoration.position.x = Math.cos(angle) * distance
        decoration.position.z = Math.sin(angle) * distance
        decoration.position.y = this.getTerrainHeight(decoration.position.x, decoration.position.z)
        
        return decoration
    }

    createTree() {
        const group = new THREE.Group()
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8)
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
        trunk.position.y = 1.5
        trunk.castShadow = true
        group.add(trunk)
        
        // Leaves
        const leavesGeometry = new THREE.SphereGeometry(2, 8, 6)
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 })
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
        leaves.position.y = 4
        leaves.castShadow = true
        group.add(leaves)
        
        return group
    }

    createRock() {
        const geometry = new THREE.DodecahedronGeometry(1 + Math.random())
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x696969,
            roughness: 0.9,
            metalness: 0.1
        })
        const rock = new THREE.Mesh(geometry, material)
        rock.castShadow = true
        rock.receiveShadow = true
        return rock
    }

    createCrystal() {
        const geometry = new THREE.OctahedronGeometry(0.8)
        const material = new THREE.MeshStandardMaterial({
            color: 0x9370db,
            transparent: true,
            opacity: 0.8,
            emissive: 0x301934,
            roughness: 0,
            metalness: 0.1
        })
        const crystal = new THREE.Mesh(geometry, material)
        crystal.castShadow = true
        return crystal
    }

    createParticleEffects() {
        // Magic particles
        const particleSystem = new ParticleSystem({
            count: 200,
            spread: 30,
            color: 0xffd700,
            size: 0.1,
            speed: 0.5
        })
        
        this.particles.push(particleSystem)
        this.scene.add(particleSystem.mesh)
    }

    getTerrainHeight(x, z) {
        // Simple noise-based height calculation
        return noise2D(x * 0.1, z * 0.1) * 2
    }

    setupEventListeners() {
        // Character selection
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', () => {
                const characterId = card.dataset.character
                this.setActiveCharacter(characterId)
            })
        })

        // Animation controls
        document.getElementById('btn-animate').addEventListener('click', () => {
            const animations = this.currentCharacter?.config.animations || []
            const randomAnim = animations[Math.floor(Math.random() * animations.length)]
            this.playAnimation(randomAnim)
        })

        document.getElementById('btn-combat-stance').addEventListener('click', () => {
            this.playAnimation('attack')
        })

        document.getElementById('btn-victory-pose').addEventListener('click', () => {
            this.playAnimation('victory')
        })

        // Environment controls
        this.setupEnvironmentControls()
        
        // Game mode controls
        this.setupGameModeControls()
        
        // Utility controls
        this.setupUtilityControls()
        
        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this))
        
        // Keyboard controls
        this.setupKeyboardControls()
    }

    setupEnvironmentControls() {
        // Terrain controls
        document.getElementById('terrain-scale').addEventListener('input', (e) => {
            if (this.terrain) {
                this.terrain.setScale(parseFloat(e.target.value))
            }
            this.updateValueDisplay(e.target, e.target.value)
        })

        document.getElementById('terrain-height').addEventListener('input', (e) => {
            if (this.terrain) {
                this.terrain.setHeight(parseFloat(e.target.value))
            }
            this.updateValueDisplay(e.target, e.target.value)
        })

        // Lighting controls
        document.getElementById('sun-intensity').addEventListener('input', (e) => {
            this.sunLight.intensity = parseFloat(e.target.value)
            this.updateValueDisplay(e.target, e.target.value)
        })

        document.getElementById('ambient-light').addEventListener('input', (e) => {
            this.ambientLight.intensity = parseFloat(e.target.value)
            this.updateValueDisplay(e.target, e.target.value)
        })

        // Environment presets
        document.getElementById('environment-preset').addEventListener('change', (e) => {
            this.changeEnvironment(e.target.value)
        })
    }

    setupGameModeControls() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.id.replace('btn-', '')
                this.setGameMode(mode)
                
                // Update UI
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
            })
        })

        // Arena controls
        document.getElementById('btn-start-battle').addEventListener('click', () => {
            this.startArenaBattle()
        })
    }

    setupUtilityControls() {
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.resetCamera()
        })

        document.getElementById('btn-fullscreen').addEventListener('click', () => {
            this.toggleFullscreen()
        })

        document.getElementById('btn-screenshot').addEventListener('click', () => {
            this.takeScreenshot()
        })
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case ' ':
                    e.preventDefault()
                    this.playAnimation('jump')
                    break
                case 'c':
                    this.cycleCameraMode()
                    break
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    const characterIds = Array.from(this.characters.keys())
                    const index = parseInt(e.key) - 1
                    if (characterIds[index]) {
                        this.setActiveCharacter(characterIds[index])
                    }
                    break
            }
        })
    }

    setGameMode(mode) {
        this.gameMode = mode
        
        // Hide all mode controls
        document.querySelectorAll('.mode-controls').forEach(el => {
            el.style.display = 'none'
        })
        
        // Show relevant controls
        if (mode === 'arena') {
            document.getElementById('arena-controls').style.display = 'block'
            this.isArenaMode = true
            this.createArena()
        } else {
            this.isArenaMode = false
        }
        
        if (mode === 'building') {
            document.getElementById('building-controls').style.display = 'block'
        }
    }

    startArenaBattle() {
        this.showNotification('Arena Battle Started!', 'success')
        // Implement arena battle logic
    }

    changeEnvironment(preset) {
        this.environment = preset
        
        // Change skybox and lighting based on preset
        switch(preset) {
            case 'desert':
                this.sunLight.color.setHex(0xffaa00)
                this.ambientLight.color.setHex(0x444422)
                break
            case 'arctic':
                this.sunLight.color.setHex(0xaaccff)
                this.ambientLight.color.setHex(0x223344)
                break
            case 'volcanic':
                this.sunLight.color.setHex(0xff4400)
                this.ambientLight.color.setHex(0x442200)
                break
            default:
                this.sunLight.color.setHex(0xffffff)
                this.ambientLight.color.setHex(0x404040)
        }
    }

    resetCamera() {
        this.camera.position.set(10, 8, 10)
        this.controls.target.set(0, 0, 0)
        this.controls.update()
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    takeScreenshot() {
        const link = document.createElement('a')
        link.download = 'grudge-studio-screenshot.png'
        link.href = this.renderer.domElement.toDataURL()
        link.click()
        
        this.showNotification('Screenshot saved!', 'success')
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div')
        notification.className = `notification ${type}`
        notification.textContent = message
        
        const container = document.getElementById('notifications')
        container.appendChild(notification)
        
        setTimeout(() => {
            notification.remove()
        }, 3000)
    }

    updateValueDisplay(input, value) {
        const display = input.parentElement.querySelector('.value-display')
        if (display) {
            display.textContent = value
        }
    }

    updateLoadingProgress(progress) {
        const progressBar = document.querySelector('.loading-progress')
        const progressText = document.querySelector('.loading-text')
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`
        }
        
        if (progressText) {
            progressText.textContent = `Loading assets... ${Math.round(progress)}%`
        }
    }

    initializeGrudgeTools() {
        try {
            // Initialize the comprehensive Three.js examples system
            this.grudgeTools = new GrudgeStudioTools.ThreeJSExamplesSystem(
                this.scene,
                this.camera,
                this.renderer,
                this.renderer.domElement
            )
            
            // Initialize all systems
            this.grudgeTools.initialize().then(() => {
                console.log('Grudge Studio Tools initialized successfully')
                
                // Add some demo interactive objects
                this.addDemoTools()
            }).catch(error => {
                console.error('Failed to initialize Grudge Studio Tools:', error)
            })
            
        } catch (error) {
            console.error('Error setting up Grudge Studio Tools:', error)
        }
    }
    
    addDemoTools() {
        // Create some interactive shader effects
        const shaderSystem = this.grudgeTools.getShaderSystem()
        
        // Add water effect near characters
        const waterGeometry = new THREE.PlaneGeometry(15, 15, 32, 32)
        const waterMaterial = shaderSystem.createWaterShader({
            color: new THREE.Color(0x006994),
            waveHeight: 0.3,
            waveSpeed: 1.2
        })
        const water = new THREE.Mesh(waterGeometry, waterMaterial)
        water.rotation.x = -Math.PI / 2
        water.position.set(5, 0.1, 5)
        this.scene.add(water)
        
        // Add portal effect
        const portalGeometry = new THREE.RingGeometry(1.5, 3, 32)
        const portalMaterial = shaderSystem.createPortalShader({
            innerColor: new THREE.Color(0x8800ff),
            outerColor: new THREE.Color(0x0066ff)
        })
        const portal = new THREE.Mesh(portalGeometry, portalMaterial)
        portal.position.set(-8, 4, -8)
        portal.lookAt(this.camera.position)
        this.scene.add(portal)
        
        // Add interactive lighting
        const lightingSystem = this.grudgeTools.getLightingSystem()
        const fireLight = lightingSystem.createFireLight(new THREE.Vector3(3, 2, -5))
        
        console.log('Demo tools added to playground')
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen')
        loadingScreen.style.opacity = '0'
        
        setTimeout(() => {
            loadingScreen.style.display = 'none'
        }, 500)
    }

    updateStats() {
        this.stats.frameCount++
        const currentTime = performance.now()
        
        if (currentTime >= this.stats.lastTime + 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (currentTime - this.stats.lastTime))
            this.stats.frameCount = 0
            this.stats.lastTime = currentTime
            
            // Update UI
            const fpsCounter = document.getElementById('fps-counter')
            if (fpsCounter) fpsCounter.textContent = this.stats.fps
            
            const triangleCount = document.getElementById('triangle-count')
            if (triangleCount) triangleCount.textContent = this.renderer.info.render.triangles
            
            const drawCalls = document.getElementById('draw-calls')
            if (drawCalls) drawCalls.textContent = this.renderer.info.render.calls
        }
    }

    onWindowResize() {
        // Update camera
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        
        // Update renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.composer.setSize(window.innerWidth, window.innerHeight)
    }

    animate() {
        requestAnimationFrame(() => this.animate())
        
        const deltaTime = this.clock.getDelta()
        
        // Update controls
        this.controls.update()
        
        // Update character animations
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
        
        // Update particles
        this.particles.forEach(particle => {
            particle.update(deltaTime)
        })
        
        // Update Grudge Studio Tools
        if (this.grudgeTools) {
            this.grudgeTools.update(deltaTime)
        }
        
        // Update stats
        this.updateStats()
        
        // Render
        this.composer.render()
    }
}

// Initialize the playground when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new PlaygroundApp()
})