import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import RAPIER from '@dimforge/rapier3d-compat'

import { assetManifest } from './core/AssetManifest.js'
import { getAssetPath } from './core/paths.js'
import { SpawnPointManager } from './editor/SpawnPointManager.js'
import { TransformController } from './editor/TransformController.js'
import { ContextMenu } from './editor/ContextMenu.js'
import { ChaseCamera } from './cameras/ChaseCamera.js'
import { PathGrid, Pathfinder, AIAgent, PathVisualizer } from './ai/Pathfinding.js'
import { GridOverlay } from './editor/GridOverlay.js'
import { TerrainSculptTool } from './editor/TerrainSculptTool.js'
import { AssetPalette } from './editor/AssetPalette.js'
import { PlacementTool } from './editor/PlacementTool.js'
import { EditorToolbar } from './editor/EditorToolbar.js'
import { PhysicalTerrain } from './terrain/PhysicalTerrain.js'
import { EnvironmentManager } from './environment/EnvironmentManager.js'
import { EnvironmentPanel } from './editor/EnvironmentPanel.js'
import { PrefabSceneLoader } from './environment/PrefabSceneLoader.js'
import { ScenePickerPanel } from './editor/ScenePickerPanel.js'

class EditorPlayground {
    constructor() {
        this.canvas = document.querySelector('canvas.webgl')
        this.renderer = null
        this.camera = null
        this.scene = null
        this.controls = null
        this.clock = new THREE.Clock()
        
        this.physicsWorld = null
        this.arenaModel = null
        this.testCharacter = null
        
        this.spawnManager = null
        this.transformController = null
        this.contextMenu = null
        this.chaseCamera = null
        this.pathGrid = null
        this.pathfinder = null
        this.pathVisualizer = null
        this.aiAgent = null
        
        this.gridOverlay = null
        this.sculptTool = null
        this.assetPalette = null
        this.placementTool = null
        this.editorToolbar = null
        this.physicalTerrain = null
        
        this.environmentManager = null
        this.environmentPanel = null
        this.prefabSceneLoader = null
        this.scenePickerPanel = null
        
        this.currentTool = 'select'
        this.isPlayMode = false
        this.showNavMesh = false
        this.useChaseCam = false
        
        this.frameCount = 0
        this.lastFpsUpdate = 0
        this.fps = 0
    }
    
    async init() {
        await RAPIER.init()
        
        this.setupRenderer()
        this.setupCamera()
        this.setupScene()
        this.setupControls()
        this.setupPhysics()
        
        this.setupEnvironment()
        this.setupPrefabSceneLoader()
        await this.loadArena()
        this.setupTerrain()
        this.setupGridOverlay()
        this.setupSpawnPoints()
        this.setupPathfinding()
        this.setupTransformControls()
        this.setupContextMenu()
        this.setupChaseCamera()
        this.setupTerrainTools()
        this.setupAssetPalette()
        this.setupEnvironmentPanel()
        this.setupScenePickerPanel()
        
        this.bindUI()
        this.setupSceneTreeEvents()
        this.updateSceneTree()
        
        window.addEventListener('resize', () => this.onResize())
        
        this.animate()
        console.log('[Playground] Editor initialized')
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.2
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        )
        this.camera.position.set(30, 20, 30)
    }
    
    setupScene() {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x87ceeb)
        
        const gridHelper = new THREE.GridHelper(100, 50, 0x333355, 0x222244)
        this.scene.add(gridHelper)
    }
    
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05
        this.controls.minDistance = 5
        this.controls.maxDistance = 150
    }
    
    setupPhysics() {
        const gravity = { x: 0.0, y: -9.81, z: 0.0 }
        this.physicsWorld = new RAPIER.World(gravity)
        
        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50)
        this.physicsWorld.createCollider(groundColliderDesc)
    }
    
    async loadArena() {
        const arenaConfig = assetManifest.getDefaultArena()
        if (!arenaConfig) return
        
        const loader = new GLTFLoader()
        
        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load(getAssetPath('/' + arenaConfig.path), resolve, undefined, reject)
            })
            
            this.arenaModel = gltf.scene
            this.arenaModel.name = 'Arena'
            this.arenaModel.scale.setScalar(arenaConfig.scale)
            
            this.arenaModel.traverse((child) => {
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
            
            this.scene.add(this.arenaModel)
            
            this.createTestCharacter()
            
            console.log('[Playground] Arena loaded:', arenaConfig.name)
        } catch (error) {
            console.warn('[Playground] Failed to load arena:', error)
        }
    }
    
    createTestCharacter() {
        const geometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16)
        const material = new THREE.MeshStandardMaterial({
            color: 0xe94560,
            metalness: 0.3,
            roughness: 0.6
        })
        this.testCharacter = new THREE.Mesh(geometry, material)
        this.testCharacter.position.set(0, 1, 0)
        this.testCharacter.name = 'TestCharacter'
        this.testCharacter.castShadow = true
        this.scene.add(this.testCharacter)
        
        this.transformController?.addSelectableObject(this.testCharacter)
    }
    
    setupSpawnPoints() {
        this.spawnManager = new SpawnPointManager(this.scene)
        
        const defaultSpawns = assetManifest.getSpawnPoints()
        defaultSpawns.forEach(spawn => {
            this.spawnManager.addSpawnPoint(spawn)
        })
    }
    
    setupPathfinding() {
        this.pathGrid = new PathGrid(60, 60, 1)
        this.pathfinder = new Pathfinder(this.pathGrid)
        this.pathVisualizer = new PathVisualizer(this.scene)
        
        if (this.arenaModel) {
            this.arenaModel.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    this.pathGrid.addObstacleFromMesh(child)
                }
            })
        }
    }
    
    setupTransformControls() {
        this.transformController = new TransformController(
            this.camera,
            this.renderer,
            this.scene,
            {
                snap: false,
                onSelect: (obj) => this.onObjectSelected(obj),
                onDeselect: (obj) => this.onObjectDeselected(obj),
                onChange: (obj, transform) => this.onObjectTransformed(obj, transform)
            }
        )
        this.transformController.setOrbitControls(this.controls)
        
        if (this.arenaModel) {
            this.transformController.addSelectableObject(this.arenaModel)
        }
        if (this.testCharacter) {
            this.transformController.addSelectableObject(this.testCharacter)
        }
    }
    
    setupContextMenu() {
        this.contextMenu = new ContextMenu()
        
        this.contextMenu.on('modeChange', (mode) => {
            this.transformController.setMode(mode)
            this.updateToolButtons(mode)
        })
        
        this.contextMenu.on('duplicate', (target) => {
            if (target) {
                const clone = target.clone()
                clone.position.x += 2
                clone.name = `${target.name}_copy`
                this.scene.add(clone)
                this.transformController.addSelectableObject(clone)
                this.updateSceneTree()
            }
        })
        
        this.contextMenu.on('delete', (target) => {
            if (target && target !== this.arenaModel) {
                this.scene.remove(target)
                this.transformController.removeSelectableObject(target)
                this.updateSceneTree()
            }
        })
        
        this.contextMenu.on('setSpawn', (target) => {
            if (target) {
                this.spawnManager.addSpawnPoint({
                    position: target.position.clone(),
                    team: 'neutral',
                    role: 'generic'
                })
            }
        })
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            const selected = this.transformController.getSelectedObject()
            this.contextMenu.open(e.clientX, e.clientY, selected)
        })
    }
    
    setupChaseCamera() {
        this.chaseCamera = new ChaseCamera(this.camera, {
            offsetX: 0,
            offsetY: 4,
            offsetZ: 8,
            smoothness: 0.08
        })
        
        if (this.testCharacter) {
            this.chaseCamera.setTarget(this.testCharacter)
        }
    }
    
    setupTerrain() {
        this.physicalTerrain = new PhysicalTerrain({
            width: 50,
            depth: 50,
            segments: 32,
            maxHeight: 10,
            minHeight: 0
        })
        
        const mesh = this.physicalTerrain.generate((x, z) => {
            return 0
        })
        
        mesh.position.y = -0.5
        this.scene.add(mesh)
        
        if (this.physicsWorld) {
            this.physicalTerrain.initPhysics(this.physicsWorld)
        }
    }
    
    setupGridOverlay() {
        this.gridOverlay = new GridOverlay({
            width: 50,
            depth: 50,
            cellSize: 2,
            color: 0x4488ff,
            opacity: 0.2
        })
        
        if (this.physicalTerrain) {
            this.gridOverlay.syncWithTerrain(this.physicalTerrain)
        }
        
        this.scene.add(this.gridOverlay.getGroup())
    }
    
    setupTerrainTools() {
        this.sculptTool = new TerrainSculptTool({
            brushRadius: 5,
            brushStrength: 0.5,
            brushFalloff: 'smooth'
        })
        
        if (this.physicalTerrain) {
            this.sculptTool.setTerrain(this.physicalTerrain, this.physicsWorld)
        }
        
        this.scene.add(this.sculptTool.getCursor())
        
        this.sculptTool.onTerrainModified = () => {
            if (this.gridOverlay && this.physicalTerrain) {
                this.gridOverlay.syncWithTerrain(this.physicalTerrain)
            }
        }
        
        this.placementTool = new PlacementTool({
            scene: this.scene,
            terrain: this.physicalTerrain,
            gridOverlay: this.gridOverlay,
            transformController: this.transformController
        })
        
        this.placementTool.onObjectPlaced = (obj, asset) => {
            this.updateSceneTree()
            console.log(`[Playground] Placed ${asset.name}`)
        }
        
        this.canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e))
        this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e))
        this.canvas.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e))
    }
    
    setupAssetPalette() {
        const paletteContainer = document.getElementById('asset-palette-container')
        this.assetPalette = new AssetPalette(paletteContainer)
        
        this.assetPalette.onAssetSelected = (asset) => {
            console.log('[Playground] Asset selected:', asset?.name)
            if (this.currentTool === 'place') {
                this.placementTool.setAssetPalette(this.assetPalette)
                this.placementTool.updatePreview()
            }
        }
        
        paletteContainer.style.display = 'none'
    }
    
    setupEnvironment() {
        this.environmentManager = new EnvironmentManager(this.scene, this.renderer)
        this.environmentManager.init()
        console.log('[Playground] Environment system initialized')
    }
    
    setupPrefabSceneLoader() {
        this.prefabSceneLoader = new PrefabSceneLoader(this.scene)
        
        this.prefabSceneLoader.addListener((event, data) => {
            if (event === 'loadComplete') {
                console.log('[Playground] Prefab scene loaded:', data.sceneInfo?.name)
                this.updateSceneTree()
            }
        })
    }
    
    setupEnvironmentPanel() {
        const sidebar = document.querySelector('.sidebar')
        if (sidebar && this.environmentManager) {
            const envContainer = document.getElementById('environment-panel-container') || document.createElement('div')
            envContainer.id = 'environment-panel-container'
            if (!envContainer.parentElement) {
                sidebar.appendChild(envContainer)
            }
            this.environmentPanel = new EnvironmentPanel(envContainer, this.environmentManager)
            console.log('[Playground] Environment panel initialized')
        }
    }
    
    setupScenePickerPanel() {
        const sidebar = document.querySelector('.sidebar')
        if (sidebar && this.prefabSceneLoader) {
            const sceneContainer = document.getElementById('scene-picker-container') || document.createElement('div')
            sceneContainer.id = 'scene-picker-container'
            if (!sceneContainer.parentElement) {
                sidebar.appendChild(sceneContainer)
            }
            this.scenePickerPanel = new ScenePickerPanel(sceneContainer, this.prefabSceneLoader)
            console.log('[Playground] Scene picker panel initialized')
        }
    }
    
    onCanvasMouseMove(event) {
        if (this.currentTool === 'sculpt' && this.sculptTool) {
            this.sculptTool.onMouseMove(event, this.camera, this.canvas)
        } else if (this.currentTool === 'place' && this.placementTool) {
            this.placementTool.onMouseMove(event, this.camera, this.canvas)
        }
    }
    
    onCanvasMouseDown(event) {
        if (this.currentTool === 'sculpt' && this.sculptTool) {
            this.sculptTool.onMouseDown(event)
        } else if (this.currentTool === 'place' && this.placementTool) {
            this.placementTool.onMouseDown(event, this.camera, this.canvas)
        }
    }
    
    onCanvasMouseUp(event) {
        if (this.currentTool === 'sculpt' && this.sculptTool) {
            this.sculptTool.onMouseUp(event)
        }
    }
    
    setEditorMode(mode) {
        this.currentTool = mode
        
        const paletteContainer = document.getElementById('asset-palette-container')
        
        if (mode === 'select' || mode === 'move' || mode === 'rotate' || mode === 'scale') {
            this.transformController?.enable()
            this.sculptTool?.deactivate()
            this.placementTool?.deactivate()
            this.controls.enabled = true
            paletteContainer.style.display = 'none'
        } else if (mode === 'sculpt') {
            this.transformController?.disable()
            this.sculptTool?.activate()
            this.placementTool?.deactivate()
            this.controls.enabled = true
            paletteContainer.style.display = 'none'
        } else if (mode === 'place') {
            this.transformController?.disable()
            this.sculptTool?.deactivate()
            this.placementTool?.activate()
            this.placementTool.setAssetPalette(this.assetPalette)
            this.controls.enabled = true
            paletteContainer.style.display = 'block'
        }
        
        const toolModeEl = document.getElementById('tool-mode')
        if (toolModeEl) {
            toolModeEl.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`
        }
        
        this.updateToolButtons(mode)
    }
    
    regenerateTerrain(width, depth, maxHeight) {
        if (this.physicalTerrain) {
            this.scene.remove(this.physicalTerrain.getMesh())
            this.physicalTerrain.dispose()
        }
        
        this.physicalTerrain = new PhysicalTerrain({
            width: width || 50,
            depth: depth || 50,
            segments: 32,
            maxHeight: maxHeight || 10,
            minHeight: 0
        })
        
        const mesh = this.physicalTerrain.generate((x, z) => {
            return 0
        })
        
        mesh.position.y = -0.5
        this.scene.add(mesh)
        
        if (this.physicsWorld) {
            this.physicalTerrain.initPhysics(this.physicsWorld)
        }
        
        if (this.gridOverlay) {
            this.gridOverlay.syncWithTerrain(this.physicalTerrain)
        }
        
        if (this.sculptTool) {
            this.sculptTool.setTerrain(this.physicalTerrain, this.physicsWorld)
        }
        
        if (this.placementTool) {
            this.placementTool.setTerrain(this.physicalTerrain)
        }
        
        console.log(`[Playground] Terrain regenerated: ${width}x${depth}, maxH: ${maxHeight}`)
    }
    
    flattenTerrain() {
        if (!this.physicalTerrain || !this.physicalTerrain.mesh) return
        
        const geometry = this.physicalTerrain.mesh.geometry
        const positions = geometry.attributes.position
        
        for (let i = 0; i < positions.count; i++) {
            positions.setY(i, 0)
            this.physicalTerrain.heightData[i] = 0
        }
        
        positions.needsUpdate = true
        geometry.computeVertexNormals()
        
        if (this.physicsWorld) {
            this.physicalTerrain.initPhysics(this.physicsWorld)
        }
        
        console.log('[Playground] Terrain flattened')
    }
    
    onObjectSelected(obj) {
        this.updateInspector(obj)
        this.updateSceneTree()
    }
    
    onObjectDeselected(obj) {
        this.updateInspector(null)
        this.updateSceneTree()
    }
    
    onObjectTransformed(obj, transform) {
        this.updateInspector(obj)
    }
    
    updateToolButtons(mode) {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active')
        })
        
        switch (mode) {
            case 'translate':
            case 'move':
                document.getElementById('tool-move')?.classList.add('active')
                break
            case 'rotate':
                document.getElementById('tool-rotate')?.classList.add('active')
                break
            case 'scale':
                document.getElementById('tool-scale')?.classList.add('active')
                break
            case 'sculpt':
                document.getElementById('tool-sculpt')?.classList.add('active')
                break
            case 'place':
                document.getElementById('tool-place')?.classList.add('active')
                break
            default:
                document.getElementById('tool-select')?.classList.add('active')
        }
        
        document.getElementById('tool-mode').textContent = `Mode: ${mode}`
    }
    
    updateSceneTree() {
        const treeEl = document.getElementById('scene-tree')
        if (!treeEl) return
        
        const selected = this.transformController?.getSelectedObject()
        let html = ''
        
        // Build a map of objects by UUID for selection
        if (!this.sceneObjectMap) {
            this.sceneObjectMap = new Map()
        }
        this.sceneObjectMap.clear()
        
        this.scene.children.forEach(child => {
            if (child.name && !child.name.startsWith('_')) {
                this.sceneObjectMap.set(child.uuid, child)
                const isSelected = child === selected
                const icon = child.type === 'Group' ? '📁' : '🧊'
                html += `<div class="tree-item ${isSelected ? 'selected' : ''}" data-uuid="${child.uuid}">
                    <span class="tree-icon">${icon}</span>
                    <span class="tree-name">${child.name || 'Unnamed'}</span>
                </div>`
            }
        })
        
        treeEl.innerHTML = html || '<div style="color:#666">No objects</div>'
        
        document.getElementById('object-count').textContent = `Objects: ${this.scene.children.length}`
    }
    
    setupSceneTreeEvents() {
        const treeEl = document.getElementById('scene-tree')
        if (!treeEl) return
        
        treeEl.addEventListener('click', (e) => {
            const treeItem = e.target.closest('.tree-item')
            if (!treeItem) return
            
            const uuid = treeItem.dataset.uuid
            if (!uuid || !this.sceneObjectMap) return
            
            const obj = this.sceneObjectMap.get(uuid)
            if (obj) {
                // Make sure object is selectable
                if (!this.transformController.selectableObjects.includes(obj)) {
                    this.transformController.addSelectableObject(obj)
                }
                this.transformController.select(obj)
                this.updateSceneTree()
            }
        })
    }
    
    updateInspector(obj) {
        const inspector = document.getElementById('inspector')
        if (!inspector) return
        
        if (!obj) {
            inspector.innerHTML = '<p class="placeholder">Select an object to inspect</p>'
            return
        }
        
        inspector.innerHTML = `
            <div class="inspector-row">
                <label>Name</label>
                <input type="text" value="${obj.name || ''}" readonly>
            </div>
            <div class="inspector-row">
                <label>Position</label>
                <input type="number" value="${obj.position.x.toFixed(2)}" step="0.1" data-prop="position.x">
                <input type="number" value="${obj.position.y.toFixed(2)}" step="0.1" data-prop="position.y">
                <input type="number" value="${obj.position.z.toFixed(2)}" step="0.1" data-prop="position.z">
            </div>
            <div class="inspector-row">
                <label>Rotation</label>
                <input type="number" value="${THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(1)}" step="5" data-prop="rotation.x">
                <input type="number" value="${THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(1)}" step="5" data-prop="rotation.y">
                <input type="number" value="${THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(1)}" step="5" data-prop="rotation.z">
            </div>
            <div class="inspector-row">
                <label>Scale</label>
                <input type="number" value="${obj.scale.x.toFixed(2)}" step="0.1" data-prop="scale.x">
                <input type="number" value="${obj.scale.y.toFixed(2)}" step="0.1" data-prop="scale.y">
                <input type="number" value="${obj.scale.z.toFixed(2)}" step="0.1" data-prop="scale.z">
            </div>
        `
    }
    
    bindUI() {
        document.getElementById('tool-select')?.addEventListener('click', () => {
            this.transformController.deselect()
            this.updateToolButtons('select')
        })
        
        document.getElementById('tool-move')?.addEventListener('click', () => {
            this.transformController.setMode('translate')
            this.updateToolButtons('translate')
        })
        
        document.getElementById('tool-rotate')?.addEventListener('click', () => {
            this.transformController.setMode('rotate')
            this.updateToolButtons('rotate')
        })
        
        document.getElementById('tool-scale')?.addEventListener('click', () => {
            this.transformController.setMode('scale')
            this.updateToolButtons('scale')
        })
        
        document.getElementById('tool-spawn')?.addEventListener('click', () => {
            const spawn = this.spawnManager.addSpawnPoint({
                position: { x: 0, y: 0, z: 0 },
                team: 'neutral',
                role: 'generic'
            })
            console.log('[Playground] Added spawn:', spawn.id)
        })
        
        document.getElementById('tool-navmesh')?.addEventListener('click', () => {
            this.showNavMesh = !this.showNavMesh
            if (this.showNavMesh) {
                this.pathVisualizer.showGrid(this.pathGrid, true)
            } else {
                this.pathVisualizer.clearGrid()
            }
            document.getElementById('tool-navmesh')?.classList.toggle('active', this.showNavMesh)
        })
        
        document.getElementById('tool-path')?.addEventListener('click', () => {
            this.testPathfinding()
        })
        
        document.getElementById('tool-sculpt')?.addEventListener('click', () => {
            this.setEditorMode('sculpt')
        })
        
        document.getElementById('tool-place')?.addEventListener('click', () => {
            this.setEditorMode('place')
        })
        
        document.getElementById('btn-generate-terrain')?.addEventListener('click', () => {
            const width = parseFloat(document.getElementById('terrain-width')?.value) || 50
            const depth = parseFloat(document.getElementById('terrain-depth')?.value) || 50
            const maxHeight = parseFloat(document.getElementById('terrain-height')?.value) || 10
            this.regenerateTerrain(width, depth, maxHeight)
        })
        
        document.getElementById('btn-flatten-terrain')?.addEventListener('click', () => {
            this.flattenTerrain()
        })
        
        document.getElementById('tool-play')?.addEventListener('click', () => {
            this.togglePlayMode()
        })
        
        document.getElementById('tool-camera')?.addEventListener('click', () => {
            this.toggleChaseCamera()
        })
        
        document.getElementById('btn-generate-nav')?.addEventListener('click', () => {
            this.regenerateNavMesh()
        })
        
        document.getElementById('btn-test-ai')?.addEventListener('click', () => {
            this.testAIAgent()
        })
        
        document.getElementById('btn-ai-help')?.addEventListener('click', () => {
            this.toggleAIChat()
        })
        
        document.getElementById('close-ai-chat')?.addEventListener('click', () => {
            this.toggleAIChat()
        })
        
        document.getElementById('ai-chat-send')?.addEventListener('click', () => {
            this.sendAIMessage()
        })
        
        document.getElementById('ai-chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendAIMessage()
        })
        
        document.getElementById('layer-spawns')?.addEventListener('change', (e) => {
            this.spawnManager.setVisible(e.target.checked)
        })
        
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
            
            switch (e.key.toLowerCase()) {
                case 'v':
                    this.setEditorMode('select')
                    break
                case 'g':
                    this.setEditorMode('move')
                    this.transformController?.setMode('translate')
                    break
                case 'r':
                    this.setEditorMode('rotate')
                    this.transformController?.setMode('rotate')
                    break
                case 's':
                    if (!e.ctrlKey && !e.metaKey) {
                        this.setEditorMode('scale')
                        this.transformController?.setMode('scale')
                    }
                    break
                case 'b':
                    this.setEditorMode('sculpt')
                    break
                case 'p':
                    this.setEditorMode('place')
                    break
                case 'f':
                    this.focusSelected()
                    break
                case '[':
                    if (this.sculptTool && this.currentTool === 'sculpt') {
                        this.sculptTool.setBrushRadius(this.sculptTool.brushRadius - 1)
                    }
                    break
                case ']':
                    if (this.sculptTool && this.currentTool === 'sculpt') {
                        this.sculptTool.setBrushRadius(this.sculptTool.brushRadius + 1)
                    }
                    break
                case '1':
                    if (this.currentTool === 'sculpt') {
                        this.sculptTool?.setMode('raise')
                    }
                    break
                case '2':
                    if (this.currentTool === 'sculpt') {
                        this.sculptTool?.setMode('lower')
                    }
                    break
                case '3':
                    if (this.currentTool === 'sculpt') {
                        this.sculptTool?.setMode('level')
                    }
                    break
                case '4':
                    if (this.currentTool === 'sculpt') {
                        this.sculptTool?.setMode('smooth')
                    }
                    break
            }
        })
    }
    
    togglePlayMode() {
        this.isPlayMode = !this.isPlayMode
        document.getElementById('tool-play')?.classList.toggle('active', this.isPlayMode)
        
        if (this.isPlayMode) {
            this.controls.enabled = false
            if (this.useChaseCam) {
                this.chaseCamera.enable()
                this.chaseCamera.snapToTarget()
            }
        } else {
            this.controls.enabled = true
            this.chaseCamera.disable()
        }
    }
    
    toggleChaseCamera() {
        this.useChaseCam = !this.useChaseCam
        document.getElementById('tool-camera')?.classList.toggle('active', this.useChaseCam)
        
        if (this.useChaseCam && this.isPlayMode) {
            this.chaseCamera.enable()
        } else {
            this.chaseCamera.disable()
        }
    }
    
    focusSelected() {
        const selected = this.transformController?.getSelectedObject()
        if (selected) {
            const box = new THREE.Box3().setFromObject(selected)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            
            this.controls.target.copy(center)
            this.camera.position.set(
                center.x + maxDim * 2,
                center.y + maxDim,
                center.z + maxDim * 2
            )
        }
    }
    
    testPathfinding() {
        const start = new THREE.Vector3(-10, 0, -10)
        const end = new THREE.Vector3(10, 0, 10)
        
        const path = this.pathfinder.findPath(start, end)
        
        if (path) {
            const smoothPath = this.pathfinder.smoothPath(path)
            this.pathVisualizer.showPath(smoothPath, 0x00ff00)
            console.log('[Playground] Path found:', path.length, 'waypoints')
        } else {
            console.log('[Playground] No path found')
        }
    }
    
    regenerateNavMesh() {
        this.pathGrid = new PathGrid(60, 60, 1)
        
        if (this.arenaModel) {
            this.arenaModel.traverse((child) => {
                if (child.isMesh) {
                    this.pathGrid.addObstacleFromMesh(child)
                }
            })
        }
        
        this.pathfinder = new Pathfinder(this.pathGrid)
        
        if (this.showNavMesh) {
            this.pathVisualizer.clearGrid()
            this.pathVisualizer.showGrid(this.pathGrid, true)
        }
        
        console.log('[Playground] NavMesh regenerated')
    }
    
    testAIAgent() {
        if (!this.testCharacter) return
        
        const spawn = this.spawnManager.getRandomSpawn()
        if (spawn) {
            this.testCharacter.position.copy(spawn.position)
            this.testCharacter.position.y = 1
        }
        
        this.aiAgent = new AIAgent(this.testCharacter, this.pathfinder, {
            speed: 4,
            onArrival: () => {
                console.log('[AI] Agent arrived at goal')
            },
            onPathFound: (path) => {
                this.pathVisualizer.showPath(path, 0x00ffff)
            }
        })
        
        const randomGoal = new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            0,
            (Math.random() - 0.5) * 20
        )
        this.aiAgent.setGoal(randomGoal)
        
        console.log('[Playground] AI agent moving to goal')
    }
    
    toggleAIChat() {
        const panel = document.getElementById('ai-chat-panel')
        panel?.classList.toggle('hidden')
    }
    
    async sendAIMessage() {
        const input = document.getElementById('ai-chat-input')
        const messages = document.getElementById('ai-chat-messages')
        const query = input?.value.trim()
        
        if (!query) return
        
        messages.innerHTML += `<div class="ai-message user">${query}</div>`
        input.value = ''
        
        messages.innerHTML += `<div class="ai-message assistant">Thinking...</div>`
        messages.scrollTop = messages.scrollHeight
        
        if (typeof puter !== 'undefined' && puter.ai) {
            try {
                const response = await puter.ai.chat(
                    `You are an AI assistant for the GRUDGE game editor. Help with pathfinding, spawn points, terrain, and game development questions. User asks: ${query}`,
                    { system: 'You are a helpful game development assistant. Be concise.' }
                )
                
                const lastMessage = messages.querySelector('.ai-message.assistant:last-child')
                if (lastMessage) lastMessage.textContent = response
            } catch (error) {
                const lastMessage = messages.querySelector('.ai-message.assistant:last-child')
                if (lastMessage) lastMessage.textContent = 'Error: Could not connect to AI'
            }
        } else {
            const lastMessage = messages.querySelector('.ai-message.assistant:last-child')
            if (lastMessage) lastMessage.textContent = 'AI not available. Include Puter script to enable.'
        }
        
        messages.scrollTop = messages.scrollHeight
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    
    animate() {
        requestAnimationFrame(() => this.animate())
        
        const deltaTime = this.clock.getDelta()
        const elapsed = this.clock.getElapsedTime()
        
        this.frameCount++
        if (elapsed - this.lastFpsUpdate >= 1) {
            this.fps = this.frameCount
            this.frameCount = 0
            this.lastFpsUpdate = elapsed
            document.getElementById('fps-counter').textContent = `FPS: ${this.fps}`
        }
        
        this.physicsWorld?.step()
        
        if (this.isPlayMode && this.useChaseCam) {
            this.chaseCamera.update(deltaTime)
        } else {
            this.controls.update()
        }
        
        if (this.aiAgent) {
            this.aiAgent.update(deltaTime)
        }
        
        if (this.environmentManager) {
            this.environmentManager.update(deltaTime)
        }
        
        this.renderer.render(this.scene, this.camera)
    }
}

const playground = new EditorPlayground()
playground.init().catch(console.error)
