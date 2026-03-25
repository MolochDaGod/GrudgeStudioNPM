/*
    GRUDGE Playground — Standalone Editor Application
    Entry point for editor.html
    
    - Dual mode: Edit (grid visible, tools active) / Play (grid hidden, game runs)
    - WebGL2 renderer with WebGPU capability detection
    - Asset library sidebar with drag-to-place
    - Full transform tools, terrain sculpting, AI biome generation
    - Grudge Studio backend integration via Puter + network service
*/

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'

import { GridOverlay } from './GridOverlay.js'
import { editorState } from './EditorState.js'
import { HierarchyPanel } from './HierarchyPanel.js'
import { InspectorPanel } from './InspectorPanel.js'
import { TerrainEditor } from './TerrainEditor.js'
import { prefabSystem } from './PrefabSystem.js'
import { MAP_TEMPLATES, ENTITY_PRESETS, getTemplate, generateTemplateEntities } from './MapTemplates.js'
import { BIOME_CONFIGS, applyHeightmapToTerrain } from '../terrain/AIMapGenerator.js'
import { ASSET_LIBRARY, ASSET_CATEGORIES } from '../scenes/WorldBuilderScene.js'
import { GrudgeNetworkService } from '../network/GrudgeNetworkService.js'

// ── GPU Capability Detection ───────────────────────────────────

function detectGPU() {
  const info = { api: 'WebGL2', webgpu: false, webgl2: false, renderer: 'Unknown' }

  // WebGPU check
  if (typeof navigator !== 'undefined' && navigator.gpu) {
    info.webgpu = true
  }

  // WebGL2 check
  try {
    const testCanvas = document.createElement('canvas')
    const gl = testCanvas.getContext('webgl2')
    if (gl) {
      info.webgl2 = true
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      if (dbg) info.renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
    }
  } catch {}

  info.api = info.webgpu ? 'WebGPU' : info.webgl2 ? 'WebGL2' : 'WebGL1'
  return info
}

// ── Editor App ─────────────────────────────────────────────────

class EditorApp {
  constructor() {
    this.mode = 'edit'           // 'edit' | 'play'
    this.currentTool = 'select'
    this.gridVisible = true
    this.snapEnabled = true
    this.mirrorEnabled = false

    this.scene = null
    this.camera = null
    this.renderer = null
    this.orbitControls = null
    this.transformControls = null
    this.composer = null
    this.outlinePass = null

    this.gridOverlay = null
    this.terrainEditor = null
    this.hierarchyPanel = null
    this.inspectorPanel = null
    this.gltfLoader = new GLTFLoader()

    this.placedObjects = []
    this.selectedObject = null
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.network = new GrudgeNetworkService()
    this.gpuInfo = detectGPU()

    this.assetFilter = 'All'
    this.assetSearch = ''
  }

  async init() {
    this.setupRenderer()
    this.setupScene()
    this.setupCamera()
    this.setupControls()
    this.setupGrid()
    this.setupTerrain()
    this.setupPostProcessing()
    this.populateAssetLibrary()
    this.setupPanels()
    this.bindToolbar()
    this.bindKeyboard()
    this.updateGPUBadge()

    await this.network.initialize()

    this.animate()
    console.log(`[EditorApp] Initialized — ${this.gpuInfo.api} (${this.gpuInfo.renderer})`)
  }

  // ── Renderer ─────────────────────────────────────────────────

  setupRenderer() {
    const canvas = document.getElementById('editor-canvas')
    const container = document.getElementById('canvas-container')

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    window.addEventListener('resize', () => {
      const w = container.clientWidth, h = container.clientHeight
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h)
      if (this.composer) this.composer.setSize(w, h)
    })
  }

  // ── Scene ────────────────────────────────────────────────────

  setupScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1e2e)
    this.scene.fog = new THREE.FogExp2(0x1a1e2e, 0.008)

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.8)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffeedd, 2.0)
    sun.position.set(50, 80, 30)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 200
    const d = 60
    sun.shadow.camera.left = -d
    sun.shadow.camera.right = d
    sun.shadow.camera.top = d
    sun.shadow.camera.bottom = -d
    this.scene.add(sun)
    this.sun = sun

    const hemi = new THREE.HemisphereLight(0x87CEEB, 0x556B2F, 0.6)
    this.scene.add(hemi)

    // Ground plane for raycasting
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x2a3050, roughness: 1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    ground.userData.isGround = true
    ground.name = 'Ground'
    this.scene.add(ground)
    this.ground = ground
  }

  // ── Camera ───────────────────────────────────────────────────

  setupCamera() {
    const container = document.getElementById('canvas-container')
    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 500)
    this.camera.position.set(20, 15, 20)
  }

  // ── Controls ─────────────────────────────────────────────────

  setupControls() {
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
    this.orbitControls.enableDamping = true
    this.orbitControls.dampingFactor = 0.08
    this.orbitControls.target.set(0, 0, 0)

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement)
    if (this.transformControls.getHelper) {
      this.scene.add(this.transformControls.getHelper())
    } else {
      this.scene.add(this.transformControls)
    }

    this.transformControls.addEventListener('dragging-changed', (e) => {
      this.orbitControls.enabled = !e.value
    })

    // Click to select
    this.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e))
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onCanvasMove(e))
  }

  // ── Grid Overlay ─────────────────────────────────────────────

  setupGrid() {
    this.gridOverlay = new GridOverlay({ width: 100, depth: 100, cellSize: 1, color: 0x4488ff, opacity: 0.25 })
    this.scene.add(this.gridOverlay.getGroup())
  }

  toggleGrid() {
    this.gridVisible = !this.gridVisible
    this.gridOverlay.setVisible(this.gridVisible)
    document.getElementById('btn-grid-toggle')?.classList.toggle('active', this.gridVisible)
  }

  // ── Terrain ──────────────────────────────────────────────────

  setupTerrain() {
    this.terrainEditor = new TerrainEditor(this.scene, this.camera, this.renderer)
    this.terrainEditor.init()
  }

  // ── Post-Processing ──────────────────────────────────────────

  setupPostProcessing() {
    const container = document.getElementById('canvas-container')
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      this.scene, this.camera
    )
    this.outlinePass.edgeStrength = 3
    this.outlinePass.edgeGlow = 0.7
    this.outlinePass.edgeThickness = 1.5
    this.outlinePass.visibleEdgeColor.set(0x6ee7b7)
    this.outlinePass.hiddenEdgeColor.set(0x6ee7b7)
    this.composer.addPass(this.outlinePass)
  }

  // ── Asset Library ────────────────────────────────────────────

  populateAssetLibrary() {
    const catContainer = document.getElementById('asset-categories')
    const listContainer = document.getElementById('asset-list')
    const searchInput = document.getElementById('asset-search')

    // Categories
    const allCats = ['All', ...ASSET_CATEGORIES]
    catContainer.innerHTML = allCats.map(c =>
      `<button data-cat="${c}" class="${c === 'All' ? 'active' : ''}">${c}</button>`
    ).join('')

    catContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        catContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        this.assetFilter = btn.dataset.cat
        this.renderAssetList()
      })
    })

    searchInput.addEventListener('input', (e) => {
      this.assetSearch = e.target.value.toLowerCase()
      this.renderAssetList()
    })

    this.renderAssetList()
  }

  renderAssetList() {
    const listContainer = document.getElementById('asset-list')
    let items = ASSET_LIBRARY

    if (this.assetFilter !== 'All') {
      items = items.filter(a => a.category === this.assetFilter)
    }
    if (this.assetSearch) {
      items = items.filter(a => a.name.toLowerCase().includes(this.assetSearch))
    }

    listContainer.innerHTML = items.map(asset => `
      <div class="asset-item" data-asset-id="${asset.id}" draggable="true">
        <span class="icon">${asset.icon}</span>
        <span class="name">${asset.name}</span>
        <span class="type">${asset.type}</span>
      </div>
    `).join('')

    // Click to select for placement
    listContainer.querySelectorAll('.asset-item').forEach(el => {
      el.addEventListener('click', () => {
        const assetId = el.dataset.assetId
        this.selectedAsset = ASSET_LIBRARY.find(a => a.id === assetId)
        this.setTool('place')
        listContainer.querySelectorAll('.asset-item').forEach(e => e.style.borderColor = 'transparent')
        el.style.borderColor = '#6ee7b7'
      })
    })
  }

  // ── Panels ───────────────────────────────────────────────────

  setupPanels() {
    const hierContainer = document.getElementById('hierarchy-container')
    const inspContainer = document.getElementById('inspector-container')

    if (hierContainer) {
      this.hierarchyPanel = new HierarchyPanel(hierContainer)
      this.hierarchyPanel.init()
    }
    if (inspContainer) {
      this.inspectorPanel = new InspectorPanel(inspContainer)
      this.inspectorPanel.init()
    }
  }

  // ── Toolbar Binding ──────────────────────────────────────────

  bindToolbar() {
    // Mode buttons
    document.getElementById('btn-mode-edit')?.addEventListener('click', () => this.setMode('edit'))
    document.getElementById('btn-mode-play')?.addEventListener('click', () => this.setMode('play'))
    document.getElementById('btn-stop-play')?.addEventListener('click', () => this.setMode('edit'))

    // Tool buttons
    const tools = { select: 'btn-tool-select', move: 'btn-tool-move', rotate: 'btn-tool-rotate', scale: 'btn-tool-scale', place: 'btn-tool-place', sculpt: 'btn-tool-sculpt' }
    for (const [tool, btnId] of Object.entries(tools)) {
      document.getElementById(btnId)?.addEventListener('click', () => this.setTool(tool))
    }

    // Toggles
    document.getElementById('btn-grid-toggle')?.addEventListener('click', () => this.toggleGrid())
    document.getElementById('btn-snap-toggle')?.addEventListener('click', () => {
      this.snapEnabled = !this.snapEnabled
      document.getElementById('btn-snap-toggle')?.classList.toggle('active', this.snapEnabled)
      this.transformControls.setTranslationSnap(this.snapEnabled ? this.gridOverlay.getCellSize() : null)
    })
    document.getElementById('btn-mirror-toggle')?.addEventListener('click', () => {
      this.mirrorEnabled = !this.mirrorEnabled
      prefabSystem.setMirrorMode(this.mirrorEnabled)
      document.getElementById('btn-mirror-toggle')?.classList.toggle('active', this.mirrorEnabled)
    })

    // Biome generation
    document.getElementById('btn-biome')?.addEventListener('click', () => {
      const biomes = Object.keys(BIOME_CONFIGS)
      const biome = biomes[Math.floor(Math.random() * biomes.length)]
      const seed = Math.floor(Math.random() * 99999)
      this.terrainEditor.generateFromBiome(biome, seed)
      console.log(`[Editor] Generated ${biome} biome (seed: ${seed})`)
    })

    // Save
    document.getElementById('btn-save')?.addEventListener('click', () => this.saveScene())
    document.getElementById('btn-export')?.addEventListener('click', () => this.exportScene())

    // Network
    document.getElementById('btn-network')?.addEventListener('click', () => {
      if (this.network.isConnected) {
        console.log('[Editor] Connected as:', this.network.currentUser?.username)
      } else {
        this.network.signIn()
      }
    })
  }

  // ── Keyboard ─────────────────────────────────────────────────

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.key.toLowerCase()) {
        case 'q': this.setTool('select'); break
        case 'w': if (!e.ctrlKey) this.setTool('move'); break
        case 'e': this.setTool('rotate'); break
        case 'r': this.setTool('scale'); break
        case 'p': this.setTool('place'); break
        case 'b': this.setTool('sculpt'); break
        case 'g': this.toggleGrid(); break
        case 'delete': case 'backspace': this.deleteSelected(); break
        case 'escape':
          if (this.mode === 'play') this.setMode('edit')
          else this.deselectAll()
          break
        case 'z': if (e.ctrlKey) editorState.undo(); break
        case 'y': if (e.ctrlKey) editorState.redo(); break
        case 's': if (e.ctrlKey) { e.preventDefault(); this.saveScene() } break
      }
    })
  }

  // ── Mode Switching ───────────────────────────────────────────

  setMode(mode) {
    this.mode = mode
    const modeBadge = document.getElementById('mode-badge')
    const playOverlay = document.getElementById('play-overlay')
    const editBtn = document.getElementById('btn-mode-edit')
    const playBtn = document.getElementById('btn-mode-play')

    if (mode === 'play') {
      // Hide editor UI
      this.gridOverlay.setVisible(false)
      this.transformControls.detach()
      if (modeBadge) { modeBadge.textContent = 'PLAY'; modeBadge.className = 'badge badge-play' }
      editBtn?.classList.remove('active')
      playBtn?.classList.add('active')
      this.scene.background = new THREE.Color(0x87CEEB)
      this.scene.fog = new THREE.Fog(0x87CEEB, 80, 300)
    } else {
      // Show editor UI
      this.gridOverlay.setVisible(this.gridVisible)
      if (modeBadge) { modeBadge.textContent = 'EDIT'; modeBadge.className = 'badge badge-edit' }
      editBtn?.classList.add('active')
      playBtn?.classList.remove('active')
      playOverlay?.classList.remove('active')
      this.scene.background = new THREE.Color(0x1a1e2e)
      this.scene.fog = new THREE.FogExp2(0x1a1e2e, 0.008)
    }
  }

  // ── Tool Switching ───────────────────────────────────────────

  setTool(tool) {
    this.currentTool = tool
    const toolBtns = document.querySelectorAll('[id^="btn-tool-"]')
    toolBtns.forEach(btn => btn.classList.remove('active'))
    document.getElementById(`btn-tool-${tool}`)?.classList.add('active')

    if (['move', 'rotate', 'scale'].includes(tool) && this.selectedObject) {
      this.transformControls.setMode(tool === 'move' ? 'translate' : tool)
      this.transformControls.attach(this.selectedObject)
    } else {
      this.transformControls.detach()
    }

    const hint = document.getElementById('tool-hint')
    const hints = {
      select: 'Click to select objects · Delete to remove',
      move: 'Drag gizmo to move · Hold Shift for axis lock',
      rotate: 'Drag gizmo to rotate · Snap: 15°',
      scale: 'Drag gizmo to scale · Shift for uniform',
      place: 'Click canvas to place selected asset',
      sculpt: 'Click+drag on terrain to sculpt · [ ] brush size',
    }
    if (hint) hint.textContent = hints[tool] || ''
  }

  // ── Canvas Events ────────────────────────────────────────────

  onCanvasClick(event) {
    if (this.mode !== 'edit') return
    if (this.transformControls.dragging) return

    const container = document.getElementById('canvas-container')
    const rect = container.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)

    if (this.currentTool === 'place' && this.selectedAsset) {
      this.placeAssetAtCursor()
      return
    }

    // Select
    const selectables = this.placedObjects.filter(o => o.visible)
    const hits = this.raycaster.intersectObjects(selectables, true)
    if (hits.length > 0) {
      let target = hits[0].object
      while (target.parent && !this.placedObjects.includes(target)) target = target.parent
      if (this.placedObjects.includes(target)) this.select(target)
    } else {
      this.deselectAll()
    }
  }

  onCanvasMove(event) {
    if (this.mode !== 'edit') return

    const container = document.getElementById('canvas-container')
    const rect = container.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const hits = this.raycaster.intersectObjects([this.ground], false)

    if (hits.length > 0) {
      const p = hits[0].point
      const snapped = this.snapEnabled ? this.gridOverlay.snapToGrid(p) : p
      if (this.gridVisible) this.gridOverlay.showHoverAt(snapped)

      const coordEl = document.getElementById('cursor-pos')
      if (coordEl) coordEl.textContent = `${snapped.x.toFixed(1)}, ${snapped.y.toFixed(1)}, ${snapped.z.toFixed(1)}`
    } else {
      this.gridOverlay.hideHover()
    }
  }

  // ── Object Management ────────────────────────────────────────

  placeAssetAtCursor() {
    const hits = this.raycaster.intersectObjects([this.ground, this.terrainEditor?.terrain].filter(Boolean), false)
    if (hits.length === 0) return

    const pos = this.snapEnabled ? this.gridOverlay.snapToGrid(hits[0].point) : hits[0].point.clone()
    pos.y = hits[0].point.y

    const asset = this.selectedAsset
    let obj

    if (asset.type === 'primitive') {
      obj = this.createPrimitive(asset.shape)
    } else if (asset.type === 'light') {
      obj = this.createLight(asset.lightType)
    } else {
      obj = this.createPlaceholder(asset)
    }

    obj.position.copy(pos)
    obj.name = asset.name
    obj.userData.assetId = asset.id
    obj.userData.editorObject = true
    this.scene.add(obj)
    this.placedObjects.push(obj)
    this.select(obj)
    this.updateObjectCount()

    editorState.pushUndo({
      undo: () => { this.scene.remove(obj); this.placedObjects = this.placedObjects.filter(o => o !== obj) },
      redo: () => { this.scene.add(obj); this.placedObjects.push(obj) },
    })
  }

  createPrimitive(shape) {
    const geometries = {
      box: () => new THREE.BoxGeometry(1, 1, 1),
      sphere: () => new THREE.SphereGeometry(0.5, 32, 32),
      cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      plane: () => new THREE.PlaneGeometry(2, 2),
    }
    const geo = (geometries[shape] || geometries.box)()
    const mat = new THREE.MeshStandardMaterial({ color: 0x6688aa, roughness: 0.6, metalness: 0.2 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  createLight(type) {
    const lights = {
      point: () => new THREE.PointLight(0xffffff, 1, 20),
      spot: () => new THREE.SpotLight(0xffffff, 1),
      directional: () => new THREE.DirectionalLight(0xffffff, 1),
    }
    const light = (lights[type] || lights.point)()
    // Visual helper
    const helper = new THREE.Mesh(
      new THREE.SphereGeometry(0.3),
      new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })
    )
    helper.userData.isHelper = true
    light.add(helper)
    return light
  }

  createPlaceholder(asset) {
    const group = new THREE.Group()
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.8, 1),
      new THREE.MeshStandardMaterial({ color: 0x4488cc, transparent: true, opacity: 0.6 })
    )
    box.position.y = 0.9
    box.castShadow = true
    group.add(box)

    // Try loading the actual model async
    if (asset.path) {
      this.gltfLoader.load(asset.path, (gltf) => {
        group.remove(box)
        box.geometry.dispose()
        box.material.dispose()

        const model = gltf.scene
        const bbox = new THREE.Box3().setFromObject(model)
        const size = bbox.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim > 0) model.scale.setScalar(2 / maxDim)

        model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
        group.add(model)
      }, undefined, () => { /* keep placeholder on error */ })
    }

    return group
  }

  select(obj) {
    this.selectedObject = obj
    this.outlinePass.selectedObjects = [obj]
    editorState.select([obj])

    if (['move', 'rotate', 'scale'].includes(this.currentTool)) {
      this.transformControls.setMode(this.currentTool === 'move' ? 'translate' : this.currentTool)
      this.transformControls.attach(obj)
    }
  }

  deselectAll() {
    this.selectedObject = null
    this.outlinePass.selectedObjects = []
    this.transformControls.detach()
    editorState.clearSelection()
  }

  deleteSelected() {
    if (!this.selectedObject) return
    const obj = this.selectedObject
    this.scene.remove(obj)
    this.placedObjects = this.placedObjects.filter(o => o !== obj)
    this.deselectAll()
    this.updateObjectCount()

    editorState.pushUndo({
      undo: () => { this.scene.add(obj); this.placedObjects.push(obj) },
      redo: () => { this.scene.remove(obj); this.placedObjects = this.placedObjects.filter(o => o !== obj) },
    })
  }

  updateObjectCount() {
    const el = document.getElementById('obj-count')
    if (el) el.textContent = this.placedObjects.length
  }

  // ── Save / Export ────────────────────────────────────────────

  async saveScene() {
    const sceneData = {
      version: 1,
      objects: this.placedObjects.map(obj => ({
        name: obj.name,
        assetId: obj.userData.assetId,
        position: obj.position.toArray(),
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: obj.scale.toArray(),
      })),
      camera: { position: this.camera.position.toArray(), target: this.orbitControls.target.toArray() },
      timestamp: Date.now(),
    }

    if (this.network.isConnected) {
      await this.network.kvSet('editor:scene:latest', sceneData)
      console.log('[Editor] Scene saved to Grudge Network')
    } else {
      localStorage.setItem('grudge_editor_scene', JSON.stringify(sceneData))
      console.log('[Editor] Scene saved to localStorage')
    }
  }

  async exportScene() {
    const exporter = new GLTFExporter()
    const exportGroup = new THREE.Group()
    this.placedObjects.forEach(obj => exportGroup.add(obj.clone()))

    exporter.parse(exportGroup, (gltf) => {
      const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'grudge-scene.gltf'
      a.click()
      URL.revokeObjectURL(url)
      console.log('[Editor] Scene exported as GLTF')
    }, (err) => console.error('[Editor] Export error:', err), { binary: false })
  }

  // ── GPU Badge ────────────────────────────────────────────────

  updateGPUBadge() {
    const badge = document.getElementById('gpu-badge')
    if (badge) {
      badge.textContent = this.gpuInfo.api
      badge.title = this.gpuInfo.renderer
    }
  }

  // ── Animation Loop ───────────────────────────────────────────

  animate() {
    requestAnimationFrame(() => this.animate())

    this.orbitControls.update()

    if (this.terrainEditor?.waterSystem) {
      this.terrainEditor.updateWater(0.016)
    }

    if (this.composer) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }
}

// ── Boot ────────────────────────────────────────────────────────

const app = new EditorApp()
app.init().catch(err => console.error('[EditorApp] Init failed:', err))
