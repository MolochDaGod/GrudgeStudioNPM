import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { BaseScene } from '../core/SceneDirector.js'
import { editorState } from '../editor/EditorState.js'
import { tooltipService } from '../editor/TooltipService.js'
import { HierarchyPanel } from '../editor/HierarchyPanel.js'
import { InspectorPanel } from '../editor/InspectorPanel.js'
import { MenuBar } from '../editor/MenuBar.js'
import { TerrainEditor, TERRAIN_TOOLS } from '../editor/TerrainEditor.js'
import { TerrainToolsPanel } from '../editor/TerrainToolsPanel.js'
import { SceneSettingsPanel } from '../editor/SceneSettingsPanel.js'
import { assetImporter } from '../editor/AssetImporter.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { QuickActionsBar } from '../editor/QuickActionsBar.js'
import { OnboardingHints } from '../editor/OnboardingHints.js'
import { RadialMenu } from '../editor/RadialMenu.js'
import { cloudStorage } from '../editor/CloudStorage.js'
import { statsAdminPanel } from '../stats/StatsAdminPanel.js'

export const ASSET_LIBRARY = [
    { id: 'empty', name: 'Empty Object', icon: '⬚', type: 'empty', category: 'Core' },
    { id: 'trigger', name: 'Trigger Zone', icon: '🔶', type: 'trigger', category: 'Core' },
    { id: 'spawn', name: 'Spawn Point', icon: '🎯', type: 'spawn', category: 'Core' },
    { id: 'waypoint', name: 'Waypoint', icon: '📍', type: 'waypoint', category: 'Core' },
    { id: 'tree', name: 'Tree', icon: '🌲', type: 'procedural', generator: 'tree', category: 'Nature' },
    { id: 'rock', name: 'Rock', icon: '🪨', type: 'procedural', generator: 'rock', category: 'Nature' },
    { id: 'bush', name: 'Bush', icon: '🌿', type: 'procedural', generator: 'bush', category: 'Nature' },
    { id: 'gladiator', name: 'Gladiator', icon: '⚔️', type: 'model', path: '/models/gladiator.glb', category: 'Characters', animated: true, collider: 'capsule' },
    { id: 'spartan', name: 'Spartan', icon: '🛡️', type: 'fbx', path: '/models/spartan.fbx', category: 'Characters', animated: true, collider: 'capsule' },
    { id: 'viking', name: 'Viking', icon: '🪓', type: 'model', path: '/models/characters/viking.glb', fallback: '/models/characters/viking/scene.gltf', category: 'Characters', animated: true, collider: { type: 'capsule', radius: 0.5, height: 1.8 } },
    { id: 'orc', name: 'Orc Warrior', icon: '👹', type: 'model', path: '/models/characters/orc.glb', fallback: '/models/characters/orc/scene.gltf', category: 'Characters', animated: true, collider: { type: 'capsule', radius: 0.6, height: 2.0 } },
    { id: 'wolf', name: 'Wolf', icon: '🐺', type: 'model', path: '/models/characters/wolf.glb', fallback: '/models/characters/wolf/scene.gltf', category: 'Characters', animated: true, collider: { type: 'capsule', radius: 0.4, height: 1.0 } },
    { id: 'shepherd', name: 'German Shepherd', icon: '🐕', type: 'model', path: '/models/characters/shepherd.glb', fallback: '/models/characters/shepherd/scene.gltf', category: 'Characters', animated: true, collider: { type: 'capsule', radius: 0.35, height: 0.9 } },
    { id: 'toon', name: 'Toon Character', icon: '🎭', type: 'model', path: '/models/characters/toon_character.glb', category: 'Characters', animated: true, collider: 'capsule' },
    { id: 'swimmer', name: 'Swimmer', icon: '🏊', type: 'model', path: '/models/characters/swimmer.glb', category: 'Characters', animated: true, collider: 'capsule' },
    { id: 'base_char', name: 'Base Character', icon: '🧍', type: 'model', path: '/models/characters/base_character.glb', category: 'Characters', animated: true, collider: 'capsule' },
    { id: 'arena', name: 'Arena', icon: '🏛️', type: 'model', path: '/models/fps_shooter_game_arena_map_v3.glb', category: 'Structures' },
    { id: 'point_light', name: 'Point Light', icon: '💡', type: 'light', lightType: 'point', category: 'Lights' },
    { id: 'spot_light', name: 'Spot Light', icon: '🔦', type: 'light', lightType: 'spot', category: 'Lights' },
    { id: 'dir_light', name: 'Dir Light', icon: '☀️', type: 'light', lightType: 'directional', category: 'Lights' },
    { id: 'camera', name: 'Camera', icon: '📷', type: 'camera', category: 'Core' },
    { id: 'cube', name: 'Cube', icon: '⬜', type: 'primitive', shape: 'box', category: 'Primitives' },
    { id: 'sphere', name: 'Sphere', icon: '🔵', type: 'primitive', shape: 'sphere', category: 'Primitives' },
    { id: 'plane', name: 'Plane', icon: '▬', type: 'primitive', shape: 'plane', category: 'Primitives' },
    { id: 'cylinder', name: 'Cylinder', icon: '🛢️', type: 'primitive', shape: 'cylinder', category: 'Primitives' }
]

export const ASSET_CATEGORIES = ['Core', 'Primitives', 'Nature', 'Characters', 'Structures', 'Lights']

export const TOOLS = {
    SELECT: 'select',
    MOVE: 'move',
    ROTATE: 'rotate',
    SCALE: 'scale',
    PLACE: 'place',
    DELETE: 'delete',
    SCULPT: 'sculpt'
}

export class WorldBuilderScene extends BaseScene {
    constructor(renderer) {
        super('world_builder')
        this.renderer = renderer
        this.gltfLoader = new GLTFLoader()
        this.fbxLoader = new FBXLoader()
        this.gladiatorTexture = null
        this.placedObjects = []
        this.selectedObject = null
        this.currentTool = TOOLS.SELECT
        this.currentAsset = null
        this.gridSize = 1
        this.orbitControls = null
        this.transformControls = null
        this.onBack = null
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.composer = null
        this.outlinePass = null
        this.isPlacing = false
        this.lastPlacePosition = null
        this.placeSpacing = 2
        this.hierarchyPanel = null
        this.inspectorPanel = null
        this.menuBar = null
        this.terrainEditor = null
        this.terrainToolsPanel = null
        this.undoStack = []
        this.redoStack = []
        this.clipboard = null
        this.quickActions = null
        this.onboardingHints = null
        this.hoveredObject = null
        this.radialMenu = null
    }

    async onEnter(data = {}) {
        await super.onEnter(data)
        this.setupScene()
        this.setupLighting()
        this.setupControls()
        this.setupPostProcessing()
        this.createTerrain()
        this.createUI()
        this.bindEvents()
        await this.preloadGladiatorTexture()
    }

    async preloadGladiatorTexture() {
        try {
            const gltf = await this.gltfLoader.loadAsync('/models/gladiator.glb')
            gltf.scene.traverse((child) => {
                if (child.isMesh && child.material && child.material.map) {
                    this.gladiatorTexture = child.material.map
                }
            })
            console.log('Gladiator texture preloaded:', !!this.gladiatorTexture)
        } catch (e) {
            console.warn('Could not preload gladiator texture:', e)
        }
    }

    setupPostProcessing() {
        if (!this.data.camera) return

        const size = this.renderer.getSize(new THREE.Vector2())
        this.composer = new EffectComposer(this.renderer)

        const renderPass = new RenderPass(this.threeScene, this.data.camera)
        this.composer.addPass(renderPass)

        this.outlinePass = new OutlinePass(
            new THREE.Vector2(size.x, size.y),
            this.threeScene,
            this.data.camera
        )
        this.outlinePass.edgeStrength = 3.0
        this.outlinePass.edgeGlow = 1.0
        this.outlinePass.edgeThickness = 2.0
        this.outlinePass.pulsePeriod = 2
        this.outlinePass.visibleEdgeColor.set(0x00ffff)
        this.outlinePass.hiddenEdgeColor.set(0x00ffff)
        this.composer.addPass(this.outlinePass)
    }

    setupScene() {
        this.threeScene.background = new THREE.Color(0x87CEEB)
        this.threeScene.fog = new THREE.Fog(0x87CEEB, 80, 300)

        const grid = new THREE.GridHelper(100, 100, 0x666666, 0x444444)
        grid.position.y = 0.02
        this.threeScene.add(grid)
        this.grid = grid
    }

    setupLighting() {
        this.ambient = new THREE.AmbientLight(0xffffff, 1.2)
        this.threeScene.add(this.ambient)

        const sun = new THREE.DirectionalLight(0xffffff, 2.0)
        sun.position.set(50, 80, 30)
        sun.castShadow = true
        sun.shadow.mapSize.width = 2048
        sun.shadow.mapSize.height = 2048
        sun.shadow.camera.near = 0.5
        sun.shadow.camera.far = 200
        sun.shadow.camera.left = -50
        sun.shadow.camera.right = 50
        sun.shadow.camera.top = 50
        sun.shadow.camera.bottom = -50
        this.threeScene.add(sun)
        this.sun = sun

        this.hemi = new THREE.HemisphereLight(0x87CEEB, 0x556B2F, 0.8)
        this.threeScene.add(this.hemi)

        const fill = new THREE.DirectionalLight(0xffeedd, 0.5)
        fill.position.set(-30, 40, -30)
        this.threeScene.add(fill)
    }

    handleSceneSettingChange(key, value) {
        switch (key) {
            case 'ambientIntensity':
                if (this.ambient) this.ambient.intensity = value
                break
            case 'sunIntensity':
                if (this.sun) this.sun.intensity = value
                break
            case 'sunAngle':
                if (this.sun) {
                    const rad = value * Math.PI / 180
                    const dist = 100
                    this.sun.position.set(
                        Math.cos(rad) * dist,
                        Math.sin(rad) * dist,
                        30
                    )
                }
                break
            case 'sunColor':
                if (this.sun) this.sun.color.set(value)
                break
            case 'skyColor':
                this.threeScene.background = new THREE.Color(value)
                if (this.threeScene.fog) this.threeScene.fog.color.set(value)
                if (this.hemi) this.hemi.color.set(value)
                break
            case 'fogEnabled':
                if (value) {
                    const skyColor = this.threeScene.background?.getHex() || 0x87CEEB
                    this.threeScene.fog = new THREE.Fog(skyColor, 80, 300)
                } else {
                    this.threeScene.fog = null
                }
                break
            case 'fogFar':
                if (this.threeScene.fog) this.threeScene.fog.far = value
                break
            case 'gridVisible':
                if (this.grid) this.grid.visible = value
                break
            case 'gridSize':
                this.recreateGrid(value)
                break
            case 'terrainSize':
                break
        }
    }

    recreateGrid(size) {
        if (this.grid) {
            this.threeScene.remove(this.grid)
            this.grid.geometry.dispose()
            this.grid.material.dispose()
        }
        this.grid = new THREE.GridHelper(size, size, 0x666666, 0x444444)
        this.grid.position.y = 0.02
        this.threeScene.add(this.grid)
    }

    setupControls() {
        if (this.data.camera) {
            this.orbitControls = new OrbitControls(this.data.camera, this.renderer.domElement)
            this.orbitControls.enableDamping = true
            this.orbitControls.dampingFactor = 0.1
            this.orbitControls.maxPolarAngle = Math.PI / 2.1
            this.orbitControls.minDistance = 5
            this.orbitControls.maxDistance = 100
            this.orbitControls.target.set(0, 0, 0)
            
            this.orbitControls.mouseButtons = {
                LEFT: null,
                MIDDLE: THREE.MOUSE.ROTATE,
                RIGHT: THREE.MOUSE.PAN
            }

            this.transformControls = new TransformControls(this.data.camera, this.renderer.domElement)
            this.transformControls.addEventListener('dragging-changed', (e) => {
                this.orbitControls.enabled = !e.value
            })
            this.threeScene.add(this.transformControls)
        }
    }

    createTerrain() {
        this.terrainEditor = new TerrainEditor(this.threeScene, this.data.camera, this.renderer)
        this.terrainEditor.init()
        this.ground = this.terrainEditor.terrain
    }

    createUI() {
        const existing = document.getElementById('world-builder-ui')
        if (existing) existing.remove()

        const ui = document.createElement('div')
        ui.id = 'world-builder-ui'
        ui.innerHTML = this.getEditorStyles() + this.getEditorHTML()
        document.body.appendChild(ui)
        
        this.initEditorPanels()
        this.populateAssets()
        this.bindUIEvents()
        this.setupEditorEventListeners()
    }

    getEditorStyles() {
        return `<style>
            #world-builder-ui { position: fixed; inset: 0; pointer-events: none; z-index: 100; font-family: 'Jost', sans-serif; }
            .editor-menubar { position: absolute; top: 0; left: 0; right: 0; height: 32px; background: rgba(14, 18, 32, 0.98); border-bottom: 1px solid #2a3150; pointer-events: auto; display: flex; align-items: center; }
            .menu-bar { display: flex; height: 100%; }
            .menu-item { position: relative; height: 100%; }
            .menu-label { padding: 0 14px; height: 100%; display: flex; align-items: center; color: #a5b4d0; cursor: pointer; font-size: 13px; transition: all 0.15s; }
            .menu-label:hover, .menu-item.active .menu-label { background: rgba(110, 231, 183, 0.15); color: #e8eaf6; }
            .menu-dropdown { position: absolute; top: 100%; left: 0; min-width: 200px; background: rgba(20, 26, 43, 0.98); border: 1px solid #2a3150; border-radius: 0 0 8px 8px; display: none; box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 99999; }
            .menu-item.active .menu-dropdown { display: block; }
            .menu-option { padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; color: #e8eaf6; cursor: pointer; font-size: 13px; }
            .menu-option:hover { background: rgba(110, 231, 183, 0.15); }
            .menu-shortcut { color: #6ee7b7; font-size: 11px; }
            .menu-separator { height: 1px; background: #2a3150; margin: 4px 8px; }
            .wb-toolbar { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; background: rgba(20, 26, 43, 0.95); padding: 8px 12px; border-radius: 10px; border: 1px solid #2a3150; pointer-events: auto; }
            .wb-tool-btn { width: 38px; height: 38px; border: 2px solid transparent; border-radius: 6px; background: rgba(42, 49, 80, 0.5); color: #a5b4d0; font-size: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
            .wb-tool-btn:hover { border-color: #6ee7b7; color: #e8eaf6; }
            .wb-tool-btn.active { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.2); color: #6ee7b7; }
            .wb-panel { position: absolute; background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(20,26,43,0.92)); border: 1px solid #2a3150; border-radius: 10px; pointer-events: auto; color: #e8eaf6; overflow: hidden; display: flex; flex-direction: column; min-width: 180px; min-height: 100px; }
            .wb-panel.resizable { resize: both; overflow: auto; }
            .wb-panel .panel-drag-handle { cursor: move; user-select: none; }
            .wb-panel .panel-resize-handle { position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #6ee7b7 50%); border-radius: 0 0 10px 0; opacity: 0.5; transition: opacity 0.2s; }
            .wb-panel .panel-resize-handle:hover { opacity: 1; }
            .wb-panel.dragging { opacity: 0.9; box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 1000; }
            .wb-panel .panel-collapse-btn { width: 20px; height: 20px; border: none; border-radius: 4px; background: rgba(42, 49, 80, 0.6); color: #a5b4d0; cursor: pointer; font-size: 10px; margin-left: auto; transition: all 0.15s; }
            .wb-panel .panel-collapse-btn:hover { background: rgba(110, 231, 183, 0.2); color: #6ee7b7; }
            .wb-panel.collapsed .panel-content { display: none; }
            .wb-panel.collapsed { height: auto !important; min-height: 40px; }
            .wb-panel::-webkit-scrollbar { width: 6px; }
            .wb-panel::-webkit-scrollbar-track { background: rgba(20,26,43,0.5); }
            .wb-panel::-webkit-scrollbar-thumb { background: #6ee7b7; border-radius: 3px; }
            .hierarchy-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(14, 18, 32, 0.6); border-bottom: 1px solid #2a3150; font-weight: 600; color: #6ee7b7; font-size: 13px; }
            .hierarchy-btn { width: 22px; height: 22px; border: none; border-radius: 4px; background: rgba(42, 49, 80, 0.6); color: #a5b4d0; cursor: pointer; font-size: 12px; }
            .hierarchy-btn:hover { background: rgba(110, 231, 183, 0.2); color: #6ee7b7; }
            .hierarchy-search { padding: 8px; border-bottom: 1px solid #2a3150; }
            .hierarchy-search input { width: 100%; padding: 6px 10px; background: rgba(42, 49, 80, 0.5); border: 1px solid #2a3150; border-radius: 6px; color: #e8eaf6; font-size: 12px; }
            .hierarchy-search input:focus { outline: none; border-color: #6ee7b7; }
            .hierarchy-tree { flex: 1; overflow-y: auto; padding: 6px 0; max-height: calc(100% - 90px); }
            .hierarchy-node { display: flex; align-items: center; gap: 6px; padding: 6px 8px; cursor: pointer; font-size: 12px; transition: background 0.15s; }
            .hierarchy-node:hover { background: rgba(110, 231, 183, 0.1); }
            .hierarchy-node.selected { background: rgba(110, 231, 183, 0.2); }
            .node-expand { width: 16px; text-align: center; font-size: 10px; color: #6ee7b7; }
            .node-spacer { width: 16px; }
            .node-icon { font-size: 14px; }
            .node-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .hierarchy-empty { padding: 20px; text-align: center; color: #a5b4d0; font-size: 12px; }
            .hierarchy-context-menu .ctx-item { padding: 8px 16px; cursor: pointer; font-size: 13px; color: #e8eaf6; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
            .hierarchy-context-menu .ctx-item:hover { background: rgba(110, 231, 183, 0.15); }
            .hierarchy-context-menu .ctx-danger { color: #ef4444; }
            .hierarchy-context-menu .ctx-separator { height: 1px; background: #2a3150; margin: 4px 0; }
            .hierarchy-context-menu .ctx-shortcut { color: #6ee7b7; font-size: 11px; opacity: 0.7; }
            .rename-input { background: rgba(42, 49, 80, 0.8); border: 1px solid #6ee7b7; border-radius: 4px; color: #e8eaf6; padding: 2px 6px; font-size: 12px; width: 100%; }
            .inspector-header { padding: 10px 12px; background: rgba(14, 18, 32, 0.6); border-bottom: 1px solid #2a3150; font-weight: 600; color: #6ee7b7; font-size: 13px; }
            .inspector-content { flex: 1; overflow-y: auto; padding: 10px; }
            .inspector-empty { padding: 20px; text-align: center; color: #a5b4d0; font-size: 12px; }
            .inspector-section { margin-bottom: 12px; background: rgba(42, 49, 80, 0.3); border-radius: 8px; overflow: hidden; }
            .section-header { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(14, 18, 32, 0.4); font-size: 12px; font-weight: 600; color: #a5b4d0; }
            .section-icon { font-size: 14px; }
            .section-content { padding: 10px; }
            .prop-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
            .prop-row label { color: #a5b4d0; }
            .prop-row input[type="text"], .prop-row input[type="number"] { width: 100px; padding: 4px 8px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 4px; color: #e8eaf6; font-size: 11px; }
            .prop-row input:focus { outline: none; border-color: #6ee7b7; }
            .prop-value { color: #e8eaf6; }
            .prop-uuid { font-family: monospace; font-size: 10px; color: #6ee7b7; }
            .transform-group { margin-bottom: 12px; }
            .transform-group > label { display: block; margin-bottom: 6px; color: #a5b4d0; font-size: 11px; font-weight: 600; }
            .vec3-inputs { display: flex; gap: 6px; }
            .vec-input { flex: 1; display: flex; align-items: center; gap: 4px; }
            .vec-input .axis { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border-radius: 3px; font-size: 10px; font-weight: 700; }
            .vec-input .axis.x { background: rgba(239, 68, 68, 0.3); color: #ef4444; }
            .vec-input .axis.y { background: rgba(34, 197, 94, 0.3); color: #22c55e; }
            .vec-input .axis.z { background: rgba(59, 130, 246, 0.3); color: #3b82f6; }
            .vec-input input { flex: 1; width: 50px; padding: 4px 6px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 4px; color: #e8eaf6; font-size: 11px; }
            .uniform-scale-btn { margin-top: 6px; padding: 4px 8px; background: rgba(42, 49, 80, 0.5); border: 1px solid #2a3150; border-radius: 4px; color: #a5b4d0; cursor: pointer; font-size: 12px; }
            .uniform-scale-btn:hover { border-color: #6ee7b7; }
            .inspector-actions { padding: 10px; display: flex; gap: 8px; border-top: 1px solid #2a3150; }
            .action-btn { flex: 1; padding: 8px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 6px; color: #e8eaf6; cursor: pointer; font-size: 11px; transition: all 0.15s; }
            .action-btn:hover { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.15); }
            .action-btn.danger { border-color: rgba(239, 68, 68, 0.5); }
            .action-btn.danger:hover { border-color: #ef4444; background: rgba(239, 68, 68, 0.15); }
            .wb-assets-panel { top: 420px; left: 20px; width: 220px; max-height: calc(100vh - 460px); }
            .asset-category-header { padding: 6px 10px; background: rgba(14, 18, 32, 0.6); color: #6ee7b7; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; grid-column: 1 / -1; }
            .assets-header { padding: 10px 12px; background: rgba(14, 18, 32, 0.6); border-bottom: 1px solid #2a3150; font-weight: 600; color: #6ee7b7; font-size: 13px; }
            .wb-asset-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; padding: 10px; overflow-y: auto; }
            .wb-asset-item { padding: 8px 6px; background: rgba(42, 49, 80, 0.5); border: 2px solid transparent; border-radius: 6px; cursor: pointer; text-align: center; font-size: 11px; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 2px; }
            .wb-asset-item .asset-icon { font-size: 18px; }
            .wb-asset-item .asset-label { font-size: 9px; color: #a5b4d0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
            .wb-asset-item:hover { border-color: #6ee7b7; }
            .wb-asset-item.selected { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.15); }
            .wb-info { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(20, 26, 43, 0.95); padding: 8px 16px; border-radius: 6px; color: #a5b4d0; font-size: 12px; pointer-events: none; border: 1px solid #2a3150; }
            .shortcut-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; font-size: 13px; color: #a5b4d0; }
            .shortcut-row .key { display: inline-block; min-width: 70px; padding: 4px 8px; background: rgba(42, 49, 80, 0.8); border: 1px solid #2a3150; border-radius: 4px; color: #6ee7b7; font-family: monospace; font-size: 11px; text-align: center; }
            
            .import-dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; }
            .import-dialog { background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(30,36,53,0.98)); border: 1px solid #2a3150; border-radius: 12px; width: 500px; max-width: 90vw; overflow: hidden; }
            .import-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #2a3150; }
            .import-header h2 { margin: 0; color: #6ee7b7; font-size: 16px; }
            .import-close { background: none; border: none; color: #a5b4d0; font-size: 24px; cursor: pointer; padding: 0; line-height: 1; }
            .import-close:hover { color: #e8eaf6; }
            .import-body { padding: 20px; }
            .import-dropzone { border: 2px dashed #2a3150; border-radius: 10px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
            .import-dropzone:hover, .import-dropzone.dragover { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.05); }
            .dropzone-icon { font-size: 48px; }
            .dropzone-text { color: #e8eaf6; font-size: 14px; font-weight: 500; }
            .dropzone-hint { color: #a5b4d0; font-size: 12px; }
            .dropzone-formats { color: #6ee7b7; font-size: 11px; margin-top: 8px; }
            .import-preview { max-height: 200px; overflow-y: auto; }
            .preview-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(42, 49, 80, 0.4); border-radius: 6px; margin-bottom: 8px; }
            .preview-icon { font-size: 20px; }
            .preview-name { flex: 1; color: #e8eaf6; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .preview-size { color: #a5b4d0; font-size: 11px; }
            .preview-remove { background: none; border: none; color: #ef4444; font-size: 18px; cursor: pointer; padding: 0; line-height: 1; }
            .import-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-top: 1px solid #2a3150; }
            .import-option { display: flex; align-items: center; gap: 8px; color: #a5b4d0; font-size: 12px; cursor: pointer; }
            .import-option input { accent-color: #6ee7b7; }
            .import-actions { display: flex; gap: 10px; }
            .import-btn { padding: 8px 20px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
            .import-btn.cancel { background: transparent; border: 1px solid #2a3150; color: #a5b4d0; }
            .import-btn.cancel:hover { border-color: #6ee7b7; color: #e8eaf6; }
            .import-btn.primary { background: #6ee7b7; border: none; color: #0e1220; font-weight: 600; }
            .import-btn.primary:hover { background: #5dd9ac; }
            .import-btn.primary:disabled { background: #3a4a5a; color: #6a7a8a; cursor: not-allowed; }
        </style>`
    }

    getEditorHTML() {
        return `
            <div class="editor-menubar" id="editor-menubar"></div>
            
            <div class="wb-toolbar">
                <button class="wb-tool-btn active" data-tool="select" data-tooltip="Select objects (Q)" data-shortcut="Q">⬚</button>
                <button class="wb-tool-btn" data-tool="move" data-tooltip="Move tool (W)" data-shortcut="W">✥</button>
                <button class="wb-tool-btn" data-tool="rotate" data-tooltip="Rotate tool (E)" data-shortcut="E">↻</button>
                <button class="wb-tool-btn" data-tool="scale" data-tooltip="Scale tool (R)" data-shortcut="R">⤢</button>
                <button class="wb-tool-btn" data-tool="place" data-tooltip="Place assets (P)" data-shortcut="P">+</button>
                <button class="wb-tool-btn" data-tool="sculpt" data-tooltip="Sculpt terrain (T)" data-shortcut="T">🏔️</button>
                <button class="wb-tool-btn" data-tool="delete" data-tooltip="Delete (X)" data-shortcut="X">✕</button>
                <div style="width: 1px; height: 24px; background: #2a3150; margin: 0 4px;"></div>
                <button class="wb-tool-btn" id="info-btn" data-tooltip="Keyboard Shortcuts">ℹ️</button>
            </div>
            
            <div id="shortcuts-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; pointer-events: auto; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(30,36,53,0.98)); border: 1px solid #2a3150; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; color: #e8eaf6;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #6ee7b7; font-size: 18px;">Keyboard Shortcuts</h2>
                        <button id="close-shortcuts" style="background: none; border: none; color: #a5b4d0; font-size: 24px; cursor: pointer;">&times;</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0; border-bottom: 1px solid #2a3150; padding-bottom: 8px;">Tools</h3>
                            <div class="shortcut-row"><span class="key">Q</span> Select</div>
                            <div class="shortcut-row"><span class="key">W</span> Move</div>
                            <div class="shortcut-row"><span class="key">E</span> Rotate</div>
                            <div class="shortcut-row"><span class="key">R</span> Scale</div>
                            <div class="shortcut-row"><span class="key">P</span> Place</div>
                            <div class="shortcut-row"><span class="key">T</span> Sculpt Terrain</div>
                            <div class="shortcut-row"><span class="key">X</span> Delete</div>
                        </div>
                        <div>
                            <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0; border-bottom: 1px solid #2a3150; padding-bottom: 8px;">Edit</h3>
                            <div class="shortcut-row"><span class="key">Ctrl+Z</span> Undo</div>
                            <div class="shortcut-row"><span class="key">Ctrl+Y</span> Redo</div>
                            <div class="shortcut-row"><span class="key">Ctrl+C</span> Copy</div>
                            <div class="shortcut-row"><span class="key">Ctrl+X</span> Cut</div>
                            <div class="shortcut-row"><span class="key">Ctrl+V</span> Paste</div>
                            <div class="shortcut-row"><span class="key">Ctrl+D</span> Duplicate</div>
                            <div class="shortcut-row"><span class="key">Ctrl+S</span> Save Scene</div>
                            <div class="shortcut-row"><span class="key">Ctrl+O</span> Load Scene</div>
                        </div>
                        <div>
                            <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0; border-bottom: 1px solid #2a3150; padding-bottom: 8px;">Selection</h3>
                            <div class="shortcut-row"><span class="key">Ctrl+A</span> Select All</div>
                            <div class="shortcut-row"><span class="key">Esc</span> Deselect</div>
                            <div class="shortcut-row"><span class="key">F</span> Focus Object</div>
                            <div class="shortcut-row"><span class="key">H</span> Hide/Show</div>
                            <div class="shortcut-row"><span class="key">U</span> Unpack Model</div>
                        </div>
                        <div>
                            <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0; border-bottom: 1px solid #2a3150; padding-bottom: 8px;">Terrain Sculpting</h3>
                            <div class="shortcut-row"><span class="key">[</span> Decrease Brush</div>
                            <div class="shortcut-row"><span class="key">]</span> Increase Brush</div>
                            <div class="shortcut-row"><span class="key">1</span> Raise</div>
                            <div class="shortcut-row"><span class="key">2</span> Lower</div>
                            <div class="shortcut-row"><span class="key">3</span> Smooth</div>
                            <div class="shortcut-row"><span class="key">4</span> Flatten</div>
                            <div class="shortcut-row"><span class="key">5</span> Paint</div>
                            <div class="shortcut-row"><span class="key">6</span> Noise</div>
                        </div>
                    </div>
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #2a3150;">
                        <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0;">Camera Controls</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div class="shortcut-row"><span class="key">Middle Click</span> Rotate Camera</div>
                            <div class="shortcut-row"><span class="key">Right Click</span> Pan Camera</div>
                            <div class="shortcut-row"><span class="key">Scroll</span> Zoom In/Out</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wb-panel resizable" style="left: 20px; top: 120px; width: 240px; height: 280px;" id="hierarchy-panel" data-panel-id="hierarchy">
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-panel resizable" style="left: 20px; top: 415px; width: 240px; display: none;" id="terrain-tools-panel" data-panel-id="terrain-tools">
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-panel resizable" style="left: 20px; top: 415px; width: 240px; height: 200px;" id="scene-settings-panel" data-panel-id="scene-settings">
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-panel resizable" style="top: auto; bottom: 60px; left: 20px; width: 240px; height: 220px;" id="assets-panel" data-panel-id="assets">
                <div class="assets-header panel-drag-handle" data-tooltip="Drag and place objects into the scene">
                    <span>Asset Library</span>
                    <button class="panel-collapse-btn" data-action="collapse">▼</button>
                </div>
                <div class="panel-content">
                    <div class="wb-asset-grid" id="wb-assets"></div>
                </div>
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-panel resizable" style="right: 20px; top: 52px; width: 300px; height: calc(100vh - 100px);" id="inspector-panel" data-panel-id="inspector">
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-info">
                <span id="wb-status">Middle-click to rotate camera • Right-click to pan • Left-click to interact</span>
            </div>
        `
    }

    initEditorPanels() {
        const hierarchyContainer = document.getElementById('hierarchy-panel')
        this.hierarchyPanel = new HierarchyPanel(
            hierarchyContainer,
            this.threeScene,
            (obj) => this.selectObject(obj),
            (obj) => this.deleteObject(obj)
        )

        const inspectorContainer = document.getElementById('inspector-panel')
        this.inspectorPanel = new InspectorPanel(
            inspectorContainer,
            (obj) => this.onTransformChange(obj)
        )

        const menuContainer = document.getElementById('editor-menubar')
        this.menuBar = new MenuBar(menuContainer, this.getMenuCommands())

        const terrainContainer = document.getElementById('terrain-tools-panel')
        if (terrainContainer && this.terrainEditor) {
            this.terrainToolsPanel = new TerrainToolsPanel(terrainContainer, this.terrainEditor)
            this.terrainToolsPanel.init()
        }

        const sceneSettingsContainer = document.getElementById('scene-settings-panel')
        if (sceneSettingsContainer) {
            this.sceneSettingsPanel = new SceneSettingsPanel(sceneSettingsContainer, this.threeScene, {
                onUpdate: (key, value) => this.handleSceneSettingChange(key, value)
            })
            this.sceneSettingsPanel.init()
        }

        this.quickActions = new QuickActionsBar(null, (action) => this.handleQuickAction(action))
        this.onboardingHints = new OnboardingHints()
        this.onboardingHints.init()
        this.onboardingHints.start()
        
        this.radialMenu = new RadialMenu((action) => this.handleQuickAction(action))
        
        this.setupDraggablePanels()

        editorState.events.on('delete-object', (obj) => this.deleteObject(obj))
        editorState.events.on('duplicate-object', (obj) => this.duplicateObject(obj))
        editorState.events.on('focus-object', (obj) => this.focusObject(obj))
        editorState.events.on('unpack-object', (obj) => this.unpackModel(obj))
        editorState.events.on('toggle-visibility', (obj) => this.toggleVisibility(obj))
        editorState.events.on('paste-object', (clipboard) => this.pasteFromClipboard(clipboard))
    }
    
    pasteFromClipboard(clipboard) {
        if (!clipboard || !clipboard.object) return
        
        this.saveUndoState()
        const clone = clipboard.object.clone()
        clone.position.x += 2
        clone.userData = { ...clipboard.object.userData }
        this.threeScene.add(clone)
        this.placedObjects.push(clone)
        
        if (clipboard.isCut) {
            this.deleteObject(clipboard.object)
        }
        
        this.selectObject(clone)
        editorState.events.emit('hierarchy-changed')
        console.log('[WorldBuilder] Pasted object')
    }
    
    setupDraggablePanels() {
        const panels = document.querySelectorAll('.wb-panel.resizable')
        
        panels.forEach(panel => {
            const header = panel.querySelector('.hierarchy-header, .inspector-header, .assets-header, .terrain-header, .scene-settings-header')
            if (header) {
                header.classList.add('panel-drag-handle')
            }
            
            let isDragging = false
            let startX, startY, startLeft, startTop
            
            const dragHandle = panel.querySelector('.panel-drag-handle') || header
            if (dragHandle) {
                dragHandle.addEventListener('mousedown', (e) => {
                    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return
                    isDragging = true
                    panel.classList.add('dragging')
                    startX = e.clientX
                    startY = e.clientY
                    const rect = panel.getBoundingClientRect()
                    startLeft = rect.left
                    startTop = rect.top
                    e.preventDefault()
                })
            }
            
            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return
                const dx = e.clientX - startX
                const dy = e.clientY - startY
                panel.style.left = (startLeft + dx) + 'px'
                panel.style.top = (startTop + dy) + 'px'
                panel.style.right = 'auto'
                panel.style.bottom = 'auto'
            })
            
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false
                    panel.classList.remove('dragging')
                    this.savePanelLayout()
                }
            })
            
            const collapseBtn = panel.querySelector('.panel-collapse-btn')
            if (collapseBtn) {
                collapseBtn.addEventListener('click', () => {
                    panel.classList.toggle('collapsed')
                    collapseBtn.textContent = panel.classList.contains('collapsed') ? '▶' : '▼'
                })
            }
        })
        
        this.loadPanelLayout()
    }
    
    savePanelLayout() {
        const layout = {}
        document.querySelectorAll('.wb-panel[data-panel-id]').forEach(panel => {
            const id = panel.dataset.panelId
            const rect = panel.getBoundingClientRect()
            layout[id] = {
                left: panel.style.left,
                top: panel.style.top,
                width: panel.style.width,
                height: panel.style.height
            }
        })
        localStorage.setItem('worldBuilderPanelLayout', JSON.stringify(layout))
    }
    
    loadPanelLayout() {
        try {
            const saved = localStorage.getItem('worldBuilderPanelLayout')
            if (!saved) return
            const layout = JSON.parse(saved)
            Object.entries(layout).forEach(([id, pos]) => {
                const panel = document.querySelector(`[data-panel-id="${id}"]`)
                if (panel && pos) {
                    if (pos.left) panel.style.left = pos.left
                    if (pos.top) panel.style.top = pos.top
                    if (pos.width) panel.style.width = pos.width
                    if (pos.height) panel.style.height = pos.height
                    panel.style.right = 'auto'
                    panel.style.bottom = 'auto'
                }
            })
        } catch (e) {
            console.warn('[WorldBuilder] Could not load panel layout:', e)
        }
    }

    getMenuCommands() {
        return {
            'new-scene': () => this.newScene(),
            'save-scene': () => this.saveScene(),
            'load-scene': () => this.loadScene(),
            'save-cloud': () => this.saveToCloud(),
            'load-cloud': () => this.loadFromCloud(),
            'export-json': () => this.exportJSON(),
            'export-glb': () => this.exportGLB(),
            'import-asset': () => this.showImportDialog(),
            'exit': () => { if (this.onBack) this.onBack() },
            'undo': () => editorState.undo(),
            'redo': () => editorState.redo(),
            'copy': () => editorState.copy(),
            'paste': () => this.paste(),
            'duplicate': () => this.duplicateSelected(),
            'delete': () => { if (this.selectedObject) this.deleteObject(this.selectedObject) },
            'select-all': () => this.selectAll(),
            'toggle-hierarchy': () => this.togglePanel('hierarchy-panel'),
            'toggle-inspector': () => this.togglePanel('inspector-panel'),
            'toggle-assets': () => this.togglePanel('wb-assets-panel'),
            'reset-camera': () => this.resetCamera(),
            'focus-selected': () => { if (this.selectedObject) this.focusObject(this.selectedObject) },
            'toggle-grid': () => { if (this.grid) this.grid.visible = !this.grid.visible },
            'add-tree': () => this.quickAdd('tree'),
            'add-rock': () => this.quickAdd('rock'),
            'add-bush': () => this.quickAdd('bush'),
            'add-gladiator': () => this.quickAdd('gladiator'),
            'add-spartan': () => this.quickAdd('spartan'),
            'show-shortcuts': () => this.showShortcuts(),
            'show-about': () => this.showAbout(),
            'stats-admin': () => statsAdminPanel.toggle()
        }
    }
    
    async saveToCloud() {
        const sceneName = prompt('Enter scene name:', 'my-scene')
        if (!sceneName) return
        
        this.showNotification('Saving to cloud...')
        
        const sceneData = cloudStorage.serializeScene(this.threeScene, {
            name: sceneName,
            settings: {
                terrain: this.terrainEditor ? this.terrainEditor.exportHeightData() : null
            }
        })
        
        const result = await cloudStorage.saveScene(sceneName, sceneData)
        
        if (result.success) {
            this.showNotification(`Saved to cloud: ${sceneName}`)
        } else {
            this.showNotification(`Save failed: ${result.error}`)
        }
    }
    
    async loadFromCloud() {
        this.showNotification('Loading cloud scenes...')
        
        const listResult = await cloudStorage.listScenes()
        
        if (!listResult.success || listResult.scenes.length === 0) {
            this.showNotification('No cloud scenes found')
            return
        }
        
        const sceneNames = listResult.scenes.map(s => s.name).join('\n')
        const sceneName = prompt(`Available scenes:\n${sceneNames}\n\nEnter scene name to load:`)
        
        if (!sceneName) return
        
        const result = await cloudStorage.loadScene(sceneName)
        
        if (result.success) {
            this.newScene()
            const objects = cloudStorage.deserializeScene(result.data, this.threeScene)
            this.placedObjects.push(...objects)
            editorState.events.emit('hierarchy-changed')
            this.showNotification(`Loaded: ${sceneName} (${objects.length} objects)`)
        } else {
            this.showNotification(`Load failed: ${result.error}`)
        }
    }

    setupEditorEventListeners() {
        this.transformControls?.addEventListener('change', () => {
            if (this.selectedObject) {
                this.inspectorPanel?.queueUpdate()
            }
        })
    }

    onTransformChange(obj) {
        editorState.events.emit('hierarchy-changed')
    }

    duplicateObject(obj) {
        if (!obj) return
        const clone = obj.clone()
        clone.position.x += 2
        clone.userData = { ...obj.userData }
        this.threeScene.add(clone)
        this.placedObjects.push(clone)
        this.selectObject(clone)
        editorState.events.emit('hierarchy-changed')
    }

    duplicateSelected() {
        if (this.selectedObject) this.duplicateObject(this.selectedObject)
    }

    focusObject(obj) {
        if (!obj || !this.orbitControls) return
        const box = new THREE.Box3().setFromObject(obj)
        const center = box.getCenter(new THREE.Vector3())
        this.orbitControls.target.copy(center)
        if (this.data.camera) {
            this.data.camera.position.set(center.x + 10, center.y + 5, center.z + 10)
        }
    }

    selectAll() {
        this.placedObjects.forEach(obj => editorState.addToSelection(obj))
    }

    togglePanel(panelId) {
        const panel = document.querySelector(`.${panelId}`) || document.getElementById(panelId)
        if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none'
    }

    resetCamera() {
        if (this.data.camera) {
            this.data.camera.position.set(20, 20, 20)
            this.data.camera.lookAt(0, 0, 0)
        }
        if (this.orbitControls) {
            this.orbitControls.target.set(0, 0, 0)
        }
    }

    quickAdd(assetId) {
        const asset = ASSET_LIBRARY.find(a => a.id === assetId)
        if (asset) {
            const pos = this.orbitControls?.target.clone() || new THREE.Vector3()
            this.placeAsset(asset, pos)
        }
    }

    newScene() {
        if (confirm('Clear all objects? This cannot be undone.')) {
            [...this.placedObjects].forEach(obj => this.deleteObject(obj))
            editorState.clearSelection()
        }
    }

    saveScene() {
        const data = this.placedObjects.map(obj => ({
            assetId: obj.userData.assetId,
            assetName: obj.userData.assetName,
            position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
            rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
            scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
        }))
        localStorage.setItem('grudge_world_builder_scene', JSON.stringify(data))
        alert('Scene saved!')
    }

    loadScene() {
        const saved = localStorage.getItem('grudge_world_builder_scene')
        if (!saved) { alert('No saved scene found.'); return }
        try {
            const data = JSON.parse(saved)
            this.newScene()
            data.forEach(item => {
                const asset = ASSET_LIBRARY.find(a => a.id === item.assetId)
                if (asset) {
                    this.placeAsset(asset, new THREE.Vector3(item.position.x, item.position.y, item.position.z))
                }
            })
        } catch (e) { console.error('Failed to load scene:', e) }
    }

    exportJSON() {
        const data = this.placedObjects.map(obj => ({
            assetId: obj.userData.assetId,
            assetName: obj.userData.assetName,
            position: obj.position.toArray(),
            rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
            scale: obj.scale.toArray()
        }))
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'scene.json'
        a.click()
        URL.revokeObjectURL(url)
        this.showNotification('Exported JSON')
    }

    exportGLB() {
        if (this.placedObjects.length === 0) {
            this.showNotification('No objects to export')
            return
        }
        
        const exportGroup = new THREE.Group()
        this.placedObjects.forEach(obj => {
            const clone = obj.clone()
            exportGroup.add(clone)
        })
        
        const exporter = new GLTFExporter()
        exporter.parse(
            exportGroup,
            (result) => {
                const blob = new Blob([result], { type: 'application/octet-stream' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'scene.glb'
                a.click()
                URL.revokeObjectURL(url)
                this.showNotification('Exported GLB')
            },
            (error) => {
                console.error('GLB export failed:', error)
                this.showNotification('Export failed')
            },
            { binary: true }
        )
    }

    showImportDialog() {
        assetImporter.showImportDialog((result) => {
            this.handleImportResult(result)
        })
    }

    handleImportResult(result) {
        if (result.type === 'model') {
            this.saveUndoState()
            const model = result.object
            model.position.copy(this.orbitControls?.target || new THREE.Vector3())
            this.threeScene.add(model)
            this.placedObjects.push(model)
            this.selectObject(model)
            editorState.events.emit('hierarchy-changed')
            this.showNotification(`Imported: ${model.userData.assetName}`)
            console.log('[WorldBuilder] Imported model:', model.userData.assetName)
        } else if (result.type === 'scene') {
            this.loadSceneData(result.data)
            this.showNotification(`Loaded scene: ${result.filename}`)
        }
    }

    loadSceneData(data) {
        const objects = Array.isArray(data) ? data : (data.objects || [])
        objects.forEach(item => {
            if (item.assetId) {
                const asset = ASSET_LIBRARY.find(a => a.id === item.assetId)
                if (asset) {
                    const pos = Array.isArray(item.position) 
                        ? new THREE.Vector3(...item.position)
                        : new THREE.Vector3(item.position?.x || 0, item.position?.y || 0, item.position?.z || 0)
                    this.placeAsset(asset, pos)
                }
            }
        })
        console.log('[WorldBuilder] Loaded scene with', objects.length, 'objects')
    }

    paste() {
        if (!editorState.canPaste()) return
        editorState.clipboardData.forEach(item => {
            const asset = ASSET_LIBRARY.find(a => a.id === item.type)
            if (asset) {
                const pos = item.position.clone()
                pos.x += 2
                this.placeAsset(asset, pos)
            }
        })
    }

    showShortcuts() {
        alert(`Keyboard Shortcuts (Unity-style):
Q / V - Select tool
W / G - Move tool  
E - Rotate tool
R - Scale tool
P - Place tool
X / Delete - Delete selected
F - Focus on selected
U - Unpack model into parts
Ctrl+S - Save scene
Ctrl+Z - Undo
Ctrl+Y - Redo
Ctrl+C - Copy
Ctrl+V - Paste
Ctrl+D - Duplicate
Ctrl+A - Select all`)
    }

    showAbout() {
        alert('Grudge Studio World Builder v1.0\n\nA professional 3D scene editor for creating game worlds.\n\nBuilt with Three.js')
    }

    populateAssets() {
        const container = document.getElementById('wb-assets')
        if (!container) return

        let html = ''
        ASSET_CATEGORIES.forEach(category => {
            const categoryAssets = ASSET_LIBRARY.filter(a => a.category === category)
            if (categoryAssets.length > 0) {
                html += `<div class="asset-category-header">${category}</div>`
                categoryAssets.forEach((asset, i) => {
                    const idx = ASSET_LIBRARY.indexOf(asset)
                    html += `
                        <div class="wb-asset-item" data-asset="${idx}" data-tooltip="${asset.name}">
                            <span class="asset-icon">${asset.icon || '📦'}</span>
                            <span class="asset-label">${asset.name}</span>
                        </div>
                    `
                })
            }
        })
        container.innerHTML = html

        container.querySelectorAll('.wb-asset-item').forEach(el => {
            el.onclick = () => {
                container.querySelectorAll('.wb-asset-item').forEach(e => e.classList.remove('selected'))
                el.classList.add('selected')
                this.currentAsset = ASSET_LIBRARY[parseInt(el.dataset.asset)]
                this.setTool(TOOLS.PLACE)
            }
        })
    }

    bindUIEvents() {
        const backBtn = document.getElementById('wb-back')
        if (backBtn) {
            backBtn.onclick = () => {
                this.removeUI()
                if (this.onBack) this.onBack()
            }
        }

        document.querySelectorAll('.wb-tool-btn[data-tool]').forEach(btn => {
            btn.onclick = () => this.setTool(btn.dataset.tool)
        })
        
        const infoBtn = document.getElementById('info-btn')
        const shortcutsModal = document.getElementById('shortcuts-modal')
        const closeShortcuts = document.getElementById('close-shortcuts')
        
        if (infoBtn && shortcutsModal) {
            infoBtn.onclick = () => {
                shortcutsModal.style.display = 'flex'
            }
            
            closeShortcuts.onclick = () => {
                shortcutsModal.style.display = 'none'
            }
            
            shortcutsModal.onclick = (e) => {
                if (e.target === shortcutsModal) {
                    shortcutsModal.style.display = 'none'
                }
            }
        }
    }

    setTool(tool) {
        this.currentTool = tool
        document.querySelectorAll('.wb-tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === tool)
        })

        if (this.transformControls) {
            if (tool === TOOLS.MOVE) {
                this.transformControls.setMode('translate')
            } else if (tool === TOOLS.ROTATE) {
                this.transformControls.setMode('rotate')
            } else if (tool === TOOLS.SCALE) {
                this.transformControls.setMode('scale')
            }

            if ([TOOLS.MOVE, TOOLS.ROTATE, TOOLS.SCALE].includes(tool) && this.selectedObject) {
                this.transformControls.attach(this.selectedObject)
            } else {
                this.transformControls.detach()
            }
        }

        if (this.terrainEditor) {
            if (tool === TOOLS.SCULPT) {
                this.terrainEditor.enable()
                if (this.orbitControls) this.orbitControls.enabled = true
            } else {
                this.terrainEditor.disable()
            }
        }

        const terrainPanel = document.getElementById('terrain-tools-panel')
        const sceneSettingsPanel = document.getElementById('scene-settings-panel')
        if (terrainPanel && sceneSettingsPanel) {
            if (tool === TOOLS.SCULPT) {
                terrainPanel.style.display = 'block'
                sceneSettingsPanel.style.display = 'none'
            } else {
                terrainPanel.style.display = 'none'
                sceneSettingsPanel.style.display = 'block'
            }
        }

        const status = document.getElementById('wb-status')
        if (status) {
            const messages = {
                select: 'Click objects to select',
                move: 'Drag to move selected object',
                rotate: 'Drag to rotate selected object',
                scale: 'Drag to scale selected object',
                place: 'Click terrain to place asset',
                sculpt: 'Left-click to sculpt terrain • Use terrain tools panel',
                delete: 'Click objects to delete'
            }
            status.textContent = messages[tool] || ''
        }
    }

    bindEvents() {
        this.onMouseDownBound = this.onMouseDown.bind(this)
        this.onMouseMoveBound = this.onMouseMoveDrag.bind(this)
        this.onMouseUpBound = this.onMouseUp.bind(this)
        this.onKeyDownBound = this.onKeyDown.bind(this)
        this.onContextMenuBound = this.onContextMenu.bind(this)
        
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDownBound)
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMoveBound)
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUpBound)
        this.renderer.domElement.addEventListener('contextmenu', this.onContextMenuBound)
        window.addEventListener('keydown', this.onKeyDownBound)
    }
    
    onContextMenu(event) {
        event.preventDefault()
        
        if (this.radialMenu) {
            this.radialMenu.show(event.clientX, event.clientY)
        }
    }

    onMouseDown(event) {
        if (event.button !== 0) return
        
        if (this.transformControls && this.transformControls.dragging) {
            return
        }
        
        this.updateMouse(event)
        this.raycaster.setFromCamera(this.mouse, this.data.camera)

        if (this.currentTool === TOOLS.SCULPT && this.terrainEditor) {
            this.terrainEditor.onMouseDown(event)
            return
        }

        if (this.currentTool === TOOLS.PLACE && this.currentAsset) {
            this.isPlacing = true
            const intersects = this.raycaster.intersectObject(this.ground)
            if (intersects.length > 0) {
                this.placeAsset(this.currentAsset, intersects[0].point)
                this.lastPlacePosition = intersects[0].point.clone()
            }
        } else if ([TOOLS.SELECT, TOOLS.DELETE, TOOLS.MOVE, TOOLS.ROTATE, TOOLS.SCALE].includes(this.currentTool)) {
            const intersects = this.raycaster.intersectObjects(this.placedObjects, true)
            if (intersects.length > 0) {
                let target = intersects[0].object
                while (target.parent && !this.placedObjects.includes(target)) {
                    target = target.parent
                }

                if (this.currentTool === TOOLS.DELETE) {
                    this.deleteObject(target)
                } else {
                    this.selectObject(target)
                    if ([TOOLS.MOVE, TOOLS.ROTATE, TOOLS.SCALE].includes(this.currentTool) && this.transformControls) {
                        this.transformControls.attach(target)
                    }
                }
            } else if (this.currentTool !== TOOLS.DELETE) {
                this.deselectObject()
            }
        }
    }

    onMouseMoveDrag(event) {
        this.updateMouse(event)
        
        if (this.currentTool === TOOLS.SCULPT && this.terrainEditor) {
            this.terrainEditor.onMouseMove(event)
            return
        }
        
        if (this.isPlacing && this.currentTool === TOOLS.PLACE && this.currentAsset) {
            this.raycaster.setFromCamera(this.mouse, this.data.camera)
            const intersects = this.raycaster.intersectObject(this.ground)
            
            if (intersects.length > 0) {
                const point = intersects[0].point
                
                if (this.lastPlacePosition) {
                    const distance = point.distanceTo(this.lastPlacePosition)
                    if (distance >= this.placeSpacing) {
                        this.placeAsset(this.currentAsset, point)
                        this.lastPlacePosition = point.clone()
                    }
                }
            }
        }

        this.updateHoverHighlight()
    }

    updateHoverHighlight() {
        if (this.currentTool === TOOLS.SCULPT || this.currentTool === TOOLS.PLACE) {
            if (this.hoveredObject) {
                this.hoveredObject = null
                this.updateOutlineSelection()
            }
            return
        }

        this.raycaster.setFromCamera(this.mouse, this.data.camera)
        const selectableObjects = this.placedObjects.map(o => o.object).filter(Boolean)
        const intersects = this.raycaster.intersectObjects(selectableObjects, true)

        let newHovered = null
        if (intersects.length > 0) {
            let hitObject = intersects[0].object
            while (hitObject.parent && !selectableObjects.includes(hitObject)) {
                hitObject = hitObject.parent
            }
            if (selectableObjects.includes(hitObject)) {
                newHovered = hitObject
            }
        }

        if (newHovered !== this.hoveredObject) {
            this.hoveredObject = newHovered
            this.updateOutlineSelection()
            this.renderer.domElement.style.cursor = newHovered ? 'pointer' : 'default'
        }
    }

    updateOutlineSelection() {
        if (!this.outlinePass) return

        const meshes = []
        
        const collectMeshes = (obj) => {
            if (!obj) return
            if (obj.isMesh) {
                meshes.push(obj)
            } else {
                obj.traverse((child) => {
                    if (child.isMesh) meshes.push(child)
                })
            }
        }
        
        collectMeshes(this.selectedObject)
        if (this.hoveredObject && this.hoveredObject !== this.selectedObject) {
            collectMeshes(this.hoveredObject)
        }
        
        if (this.selectedObject) {
            this.outlinePass.visibleEdgeColor.set(0x00ffff)
            this.outlinePass.hiddenEdgeColor.set(0x00ffff)
            this.outlinePass.edgeStrength = 3.0
            this.outlinePass.edgeGlow = 1.0
        } else if (this.hoveredObject) {
            this.outlinePass.visibleEdgeColor.set(0x6ee7b7)
            this.outlinePass.hiddenEdgeColor.set(0x6ee7b7)
            this.outlinePass.edgeStrength = 2.0
            this.outlinePass.edgeGlow = 0.5
        }
        
        this.outlinePass.selectedObjects = meshes
    }

    onMouseUp(event) {
        if (this.currentTool === TOOLS.SCULPT && this.terrainEditor) {
            this.terrainEditor.onMouseUp(event)
        }
        
        if (event.button === 0) {
            this.isPlacing = false
            this.lastPlacePosition = null
        }
    }

    onKeyDown(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return
        
        const key = event.key.toLowerCase()
        
        if (event.ctrlKey || event.metaKey) {
            switch (key) {
                case 'z':
                    event.preventDefault()
                    if (event.shiftKey) {
                        this.redo()
                    } else {
                        this.undo()
                    }
                    return
                case 'y':
                    event.preventDefault()
                    this.redo()
                    return
                case 'd':
                    event.preventDefault()
                    if (this.selectedObject) this.duplicateObject(this.selectedObject)
                    return
                case 'a':
                    event.preventDefault()
                    this.selectAll()
                    return
                case 's':
                    event.preventDefault()
                    this.saveScene()
                    return
                case 'o':
                    event.preventDefault()
                    this.loadScene()
                    return
                case 'g':
                    event.preventDefault()
                    if (this.selectedObject) this.groupSelected()
                    return
                case 'c':
                    event.preventDefault()
                    if (this.selectedObject) this.copyObject(this.selectedObject)
                    return
                case 'x':
                    event.preventDefault()
                    if (this.selectedObject) this.cutObject(this.selectedObject)
                    return
                case 'v':
                    event.preventDefault()
                    this.pasteObject()
                    return
            }
        }
        
        switch (key) {
            case 'q': case 'v': this.setTool(TOOLS.SELECT); break
            case 'w': case 'g': this.setTool(TOOLS.MOVE); break
            case 'e': this.setTool(TOOLS.ROTATE); break
            case 'r': this.setTool(TOOLS.SCALE); break
            case 'p': this.setTool(TOOLS.PLACE); break
            case 't': this.setTool(TOOLS.SCULPT); break
            case 'x': case 'delete': case 'backspace':
                if (this.selectedObject) this.deleteObject(this.selectedObject)
                break
            case 'f':
                if (this.selectedObject) this.focusObject(this.selectedObject)
                break
            case 'u':
                if (this.selectedObject) this.unpackModel(this.selectedObject)
                break
            case 'escape':
                this.deselectAll()
                break
            case 'h':
                if (this.selectedObject) this.toggleVisibility(this.selectedObject)
                break
            case '[':
                if (this.terrainEditor) this.terrainEditor.decreaseBrushSize()
                break
            case ']':
                if (this.terrainEditor) this.terrainEditor.increaseBrushSize()
                break
            case '1': this.setTerrainTool('raise'); break
            case '2': this.setTerrainTool('lower'); break
            case '3': this.setTerrainTool('smooth'); break
            case '4': this.setTerrainTool('flatten'); break
            case '5': this.setTerrainTool('paint'); break
            case '6': this.setTerrainTool('noise'); break
        }
    }
    
    setTerrainTool(tool) {
        if (this.currentTool !== TOOLS.SCULPT) {
            this.setTool(TOOLS.SCULPT)
        }
        if (this.terrainEditor) {
            this.terrainEditor.setTool(tool)
        }
    }
    
    unpackModel(obj) {
        if (!obj) return
        
        const childrenToExtract = []
        const collectChildren = (parent, depth = 0) => {
            parent.children.forEach(child => {
                if (child.isMesh) {
                    childrenToExtract.push({ mesh: child, depth })
                } else if (child.isGroup || child.children?.length > 0) {
                    collectChildren(child, depth + 1)
                }
            })
        }
        collectChildren(obj)
        
        if (childrenToExtract.length === 0) {
            console.log('No meshes to unpack - this is already a simple object')
            return
        }
        
        if (childrenToExtract.length === 1 && !obj.isGroup) {
            console.log('Only one mesh, nothing to unpack')
            return
        }
        
        editorState.clearSelection()
        if (this.transformControls) {
            this.transformControls.detach()
        }
        
        const parentName = obj.userData.assetName || obj.name || 'Model'
        const newObjects = []
        let counter = 0
        
        childrenToExtract.forEach(({ mesh }) => {
            const worldMatrix = new THREE.Matrix4()
            mesh.updateWorldMatrix(true, false)
            worldMatrix.copy(mesh.matrixWorld)
            
            const clone = mesh.clone()
            
            clone.matrix.copy(worldMatrix)
            clone.matrix.decompose(clone.position, clone.quaternion, clone.scale)
            clone.matrixAutoUpdate = true
            
            const childName = mesh.name || `Part_${counter++}`
            clone.userData.assetId = 'unpacked'
            clone.userData.assetName = `${parentName}/${childName}`
            clone.userData.unpackedFrom = obj.uuid
            
            clone.castShadow = true
            clone.receiveShadow = true
            
            this.threeScene.add(clone)
            this.placedObjects.push(clone)
            newObjects.push(clone)
        })
        
        const idx = this.placedObjects.indexOf(obj)
        if (idx > -1) {
            this.placedObjects.splice(idx, 1)
        }
        this.threeScene.remove(obj)
        obj.traverse(child => {
            if (child.geometry) child.geometry.dispose?.()
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose?.())
                } else {
                    child.material.dispose?.()
                }
            }
        })
        
        this.selectedObject = null
        
        editorState.events.emit('hierarchy-changed')
        
        if (newObjects.length > 0) {
            this.selectObject(newObjects[0])
        }
        
        console.log(`Unpacked ${newObjects.length} objects from ${parentName}`)
    }

    updateMouse(event) {
        const rect = this.renderer.domElement.getBoundingClientRect()
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    async placeAsset(asset, position) {
        let obj

        if (asset.type === 'empty') {
            obj = new THREE.Group()
            obj.userData.objectType = 'empty'
        } else if (asset.type === 'trigger') {
            const geo = new THREE.BoxGeometry(2, 2, 2)
            const mat = new THREE.MeshBasicMaterial({ 
                color: 0xffa500, 
                transparent: true, 
                opacity: 0.3,
                wireframe: false 
            })
            obj = new THREE.Mesh(geo, mat)
            const wireframe = new THREE.LineSegments(
                new THREE.EdgesGeometry(geo),
                new THREE.LineBasicMaterial({ color: 0xffa500 })
            )
            obj.add(wireframe)
            obj.userData.objectType = 'trigger'
            obj.userData.triggerEvent = 'onEnter'
        } else if (asset.type === 'spawn') {
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
                new THREE.MeshStandardMaterial({ color: 0x00ff00 })
            )
            const arrow = new THREE.Mesh(
                new THREE.ConeGeometry(0.3, 0.8, 8),
                new THREE.MeshStandardMaterial({ color: 0x00ff00 })
            )
            arrow.position.y = 0.5
            obj = new THREE.Group()
            obj.add(base, arrow)
            obj.userData.objectType = 'spawn'
            obj.userData.spawnId = 'spawn_' + Date.now()
        } else if (asset.type === 'waypoint') {
            const marker = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 16, 16),
                new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
            )
            obj = new THREE.Group()
            obj.add(marker)
            obj.userData.objectType = 'waypoint'
            obj.userData.waypointIndex = this.placedObjects.filter(o => o.userData.objectType === 'waypoint').length
        } else if (asset.type === 'light') {
            obj = new THREE.Group()
            let light
            if (asset.lightType === 'point') {
                light = new THREE.PointLight(0xffffff, 1, 10)
                const helper = new THREE.Mesh(
                    new THREE.SphereGeometry(0.2, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0xffff00 })
                )
                obj.add(helper)
            } else if (asset.lightType === 'spot') {
                light = new THREE.SpotLight(0xffffff, 1, 20, Math.PI / 6)
                const helper = new THREE.Mesh(
                    new THREE.ConeGeometry(0.3, 0.5, 8),
                    new THREE.MeshBasicMaterial({ color: 0xffff00 })
                )
                helper.rotation.x = Math.PI
                obj.add(helper)
            } else if (asset.lightType === 'directional') {
                light = new THREE.DirectionalLight(0xffffff, 0.5)
                const helper = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.3, 0.3),
                    new THREE.MeshBasicMaterial({ color: 0xffff00 })
                )
                obj.add(helper)
            }
            if (light) obj.add(light)
            obj.userData.objectType = 'light'
            obj.userData.lightType = asset.lightType
        } else if (asset.type === 'camera') {
            const camHelper = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.3, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x666666 })
            )
            const lens = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.15, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x333333 })
            )
            lens.rotation.x = Math.PI / 2
            lens.position.z = 0.35
            obj = new THREE.Group()
            obj.add(camHelper, lens)
            obj.userData.objectType = 'camera'
            obj.userData.cameraType = 'perspective'
        } else if (asset.type === 'primitive') {
            let geo
            switch (asset.shape) {
                case 'box': geo = new THREE.BoxGeometry(1, 1, 1); break
                case 'sphere': geo = new THREE.SphereGeometry(0.5, 16, 16); break
                case 'plane': geo = new THREE.PlaneGeometry(2, 2); break
                case 'cylinder': geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16); break
                default: geo = new THREE.BoxGeometry(1, 1, 1)
            }
            obj = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x6ee7b7 }))
            if (asset.shape === 'plane') obj.rotation.x = -Math.PI / 2
            obj.userData.objectType = 'primitive'
            obj.userData.shape = asset.shape
        } else if (asset.type === 'procedural') {
            obj = this.generateProceduralAsset(asset.generator)
        } else if (asset.type === 'model') {
            try {
                const gltf = await this.gltfLoader.loadAsync(asset.path)
                obj = gltf.scene
                
                if (asset.id === 'gladiator' && !this.gladiatorTexture) {
                    obj.traverse((child) => {
                        if (child.isMesh && child.material && child.material.map) {
                            this.gladiatorTexture = child.material.map
                        }
                    })
                }
            } catch (e) {
                console.warn('Failed to load model:', asset.path)
                obj = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshStandardMaterial({ color: 0x6ee7b7 })
                )
            }
        } else if (asset.type === 'fbx') {
            try {
                obj = await this.fbxLoader.loadAsync(asset.path)
                obj.scale.set(0.01, 0.01, 0.01)
                
                if (asset.id === 'spartan' && this.gladiatorTexture) {
                    obj.traverse((child) => {
                        if (child.isMesh) {
                            child.material = new THREE.MeshStandardMaterial({
                                map: this.gladiatorTexture,
                                roughness: 0.6,
                                metalness: 0.3
                            })
                        }
                    })
                }
            } catch (e) {
                console.warn('Failed to load FBX model:', asset.path, e)
                obj = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshStandardMaterial({ color: 0x6ee7b7 })
                )
            }
        }

        if (obj) {
            position.x = Math.round(position.x / this.gridSize) * this.gridSize
            position.z = Math.round(position.z / this.gridSize) * this.gridSize
            obj.position.copy(position)
            obj.userData.assetId = asset.id
            obj.userData.assetName = asset.name
            this.threeScene.add(obj)
            this.placedObjects.push(obj)
        }
    }

    generateProceduralAsset(type) {
        let mesh
        
        switch (type) {
            case 'tree':
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
                    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
                )
                trunk.position.y = 1
                const leaves = new THREE.Mesh(
                    new THREE.ConeGeometry(1.5, 3, 8),
                    new THREE.MeshStandardMaterial({ color: 0x228B22 })
                )
                leaves.position.y = 3.5
                const tree = new THREE.Group()
                tree.add(trunk, leaves)
                mesh = tree
                break

            case 'rock':
                mesh = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.5, 0),
                    new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9 })
                )
                mesh.position.y = 0.3
                mesh.rotation.set(Math.random(), Math.random(), Math.random())
                break

            case 'bush':
                const bush = new THREE.Group()
                for (let i = 0; i < 3; i++) {
                    const sphere = new THREE.Mesh(
                        new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 8, 8),
                        new THREE.MeshStandardMaterial({ color: 0x2E8B57 })
                    )
                    sphere.position.set(
                        (Math.random() - 0.5) * 0.5,
                        0.3 + Math.random() * 0.2,
                        (Math.random() - 0.5) * 0.5
                    )
                    bush.add(sphere)
                }
                mesh = bush
                break

            default:
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshStandardMaterial({ color: 0x6ee7b7 })
                )
        }

        return mesh
    }

    selectObject(obj) {
        this.selectedObject = obj
        editorState.select(obj)
        
        if (this.transformControls && [TOOLS.MOVE, TOOLS.ROTATE, TOOLS.SCALE].includes(this.currentTool)) {
            this.transformControls.attach(obj)
        }
        
        this.updateOutlineSelection()
    }

    deselectObject() {
        this.selectedObject = null
        editorState.clearSelection()
        
        if (this.transformControls) {
            this.transformControls.detach()
        }
        this.updateOutlineSelection()
    }

    deleteObject(obj) {
        const index = this.placedObjects.indexOf(obj)
        if (index > -1) {
            this.saveUndoState()
            this.placedObjects.splice(index, 1)
            this.threeScene.remove(obj)
            if (this.selectedObject === obj) {
                this.deselectObject()
            }
            editorState.events.emit('hierarchy-changed')
        }
    }
    
    undo() {
        if (this.currentTool === TOOLS.SCULPT && this.terrainEditor) {
            this.terrainEditor.undo()
            this.showNotification('Terrain Undo')
            return
        }
        
        if (this.undoStack && this.undoStack.length > 0) {
            const state = this.undoStack.pop()
            this.redoStack.push(this.captureSceneState())
            this.restoreSceneState(state)
            this.showNotification(`Undo (${this.undoStack.length} left)`)
            console.log('[WorldBuilder] Undo')
        }
    }
    
    redo() {
        if (this.currentTool === TOOLS.SCULPT && this.terrainEditor) {
            this.terrainEditor.redo()
            this.showNotification('Terrain Redo')
            return
        }
        
        if (this.redoStack && this.redoStack.length > 0) {
            const state = this.redoStack.pop()
            this.undoStack.push(this.captureSceneState())
            this.restoreSceneState(state)
            this.showNotification(`Redo (${this.redoStack.length} left)`)
            console.log('[WorldBuilder] Redo')
        }
    }
    
    saveUndoState() {
        this.undoStack = this.undoStack || []
        this.redoStack = []
        this.undoStack.push(this.captureSceneState())
        if (this.undoStack.length > 20) this.undoStack.shift()
    }
    
    captureSceneState() {
        return this.placedObjects.map(obj => ({
            uuid: obj.uuid,
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone(),
            visible: obj.visible,
            userData: { ...obj.userData }
        }))
    }
    
    restoreSceneState(state) {
        state.forEach(saved => {
            const obj = this.placedObjects.find(o => o.uuid === saved.uuid)
            if (obj) {
                obj.position.copy(saved.position)
                obj.rotation.copy(saved.rotation)
                obj.scale.copy(saved.scale)
                obj.visible = saved.visible
            }
        })
        editorState.events.emit('hierarchy-changed')
    }
    
    duplicateObject(obj) {
        if (!obj) return
        
        this.saveUndoState()
        const clone = obj.clone()
        clone.position.x += 2
        clone.userData = { ...obj.userData }
        this.threeScene.add(clone)
        this.placedObjects.push(clone)
        this.selectObject(clone)
        editorState.events.emit('hierarchy-changed')
        console.log('[WorldBuilder] Duplicated object')
    }
    
    selectAll() {
        console.log('[WorldBuilder] Select all - ', this.placedObjects.length, 'objects')
    }
    
    deselectAll() {
        this.deselectObject()
        if (this.transformControls) {
            this.transformControls.detach()
        }
        console.log('[WorldBuilder] Deselected all')
    }
    
    toggleVisibility(obj) {
        if (obj) {
            obj.visible = !obj.visible
            editorState.events.emit('hierarchy-changed')
            console.log('[WorldBuilder] Toggled visibility:', obj.visible)
        }
    }
    
    copyObject(obj) {
        if (!obj) return
        this.clipboard = { object: obj, isCut: false }
        this.showNotification('Copied')
        console.log('[WorldBuilder] Copied:', obj.userData.assetName || obj.name)
    }
    
    cutObject(obj) {
        if (!obj) return
        this.clipboard = { object: obj, isCut: true }
        this.showNotification('Cut')
        console.log('[WorldBuilder] Cut:', obj.userData.assetName || obj.name)
    }
    
    pasteObject() {
        if (!this.clipboard || !this.clipboard.object) {
            this.showNotification('Nothing to paste')
            return
        }
        
        this.saveUndoState()
        const clone = this.clipboard.object.clone()
        clone.position.x += 2
        clone.userData = { ...this.clipboard.object.userData }
        this.threeScene.add(clone)
        this.placedObjects.push(clone)
        
        if (this.clipboard.isCut) {
            this.deleteObject(this.clipboard.object)
            this.clipboard = null
        }
        
        this.selectObject(clone)
        editorState.events.emit('hierarchy-changed')
        this.showNotification('Pasted')
        console.log('[WorldBuilder] Pasted object')
    }
    
    showNotification(message) {
        let notif = document.getElementById('wb-notification')
        if (!notif) {
            notif = document.createElement('div')
            notif.id = 'wb-notification'
            notif.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(110, 231, 183, 0.9);
                color: #0e1220;
                padding: 8px 20px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s;
                pointer-events: none;
            `
            document.body.appendChild(notif)
        }
        notif.textContent = message
        notif.style.opacity = '1'
        
        clearTimeout(this.notifTimeout)
        this.notifTimeout = setTimeout(() => {
            notif.style.opacity = '0'
        }, 1500)
    }
    
    groupSelected() {
        console.log('[WorldBuilder] Group selected (not implemented)')
    }
    
    saveScene() {
        const sceneData = {
            objects: this.placedObjects.map(obj => ({
                name: obj.userData.assetName || obj.name,
                assetId: obj.userData.assetId,
                position: obj.position.toArray(),
                rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
                scale: obj.scale.toArray()
            })),
            terrain: this.terrainEditor ? this.terrainEditor.exportHeightData() : null
        }
        
        const json = JSON.stringify(sceneData, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'world-scene.json'
        a.click()
        URL.revokeObjectURL(url)
        console.log('[WorldBuilder] Scene saved')
    }
    
    loadScene() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async (e) => {
            const file = e.target.files[0]
            if (file) {
                const text = await file.text()
                const data = JSON.parse(text)
                console.log('[WorldBuilder] Scene loaded:', data)
            }
        }
        input.click()
    }

    removeUI() {
        const ui = document.getElementById('world-builder-ui')
        if (ui) ui.remove()
        if (this.quickActions) this.quickActions.destroy()
        if (this.onboardingHints) this.onboardingHints.destroy()
        if (this.radialMenu) this.radialMenu.destroy()
    }

    handleQuickAction(action) {
        const actionMap = {
            'add-spawn': 'spawn',
            'add-trigger': 'trigger',
            'add-waypoint': 'waypoint',
            'add-camera': 'camera',
            'add-point-light': 'point_light',
            'add-spot-light': 'spot_light',
            'add-cube': 'cube',
            'add-sphere': 'sphere',
            'add-plane': 'plane',
            'add-cylinder': 'cylinder',
            'play-mode': null
        }
        
        if (action === 'play-mode') {
            this.menuBar?.commands?.['play-mode']?.()
            return
        }
        
        const assetId = actionMap[action]
        if (assetId) {
            const asset = ASSET_LIBRARY.find(a => a.id === assetId)
            if (asset) {
                this.currentAsset = asset
                this.placeCurrentAsset(new THREE.Vector3(0, 0, 0))
            }
        }
    }

    update(delta) {
        if (this.orbitControls) {
            this.orbitControls.update()
        }
    }

    render() {
        if (this.composer && this.data.camera) {
            this.composer.render()
        } else {
            this.renderer.render(this.threeScene, this.data.camera)
        }
    }

    onResize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height)
        }
        if (this.outlinePass) {
            this.outlinePass.resolution.set(width, height)
        }
    }

    async onExit() {
        await super.onExit()
        this.removeUI()
        this.renderer.domElement.removeEventListener('mousedown', this.onMouseDownBound)
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMoveBound)
        this.renderer.domElement.removeEventListener('mouseup', this.onMouseUpBound)
        window.removeEventListener('keydown', this.onKeyDownBound)
        if (this.orbitControls) {
            this.orbitControls.dispose()
            this.orbitControls = null
        }
        if (this.transformControls) {
            this.threeScene.remove(this.transformControls)
            this.transformControls.dispose()
            this.transformControls = null
        }
        if (this.composer) {
            this.composer.dispose()
            this.composer = null
            this.outlinePass = null
        }
    }

    dispose() {
        this.removeUI()
        if (this.orbitControls) this.orbitControls.dispose()
        if (this.transformControls) this.transformControls.dispose()
        super.dispose()
    }
}
