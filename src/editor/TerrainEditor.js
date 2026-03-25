import * as THREE from 'three'
import { WaterSystem } from '../effects/WaterSystem.js'
import { BIOME_CONFIGS, SimplexNoise, applyHeightmapToTerrain } from '../terrain/AIMapGenerator.js'

export const TERRAIN_TOOLS = {
    RAISE: 'raise',
    LOWER: 'lower',
    SMOOTH: 'smooth',
    FLATTEN: 'flatten',
    PAINT: 'paint',
    NOISE: 'noise',
    WATER: 'water'
}

export const TERRAIN_BRUSHES = {
    CIRCLE: 'circle',
    SQUARE: 'square',
    SOFT: 'soft'
}

export class TerrainEditor {
    constructor(scene, camera, renderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        
        this.terrain = null
        this.heightData = null
        this.resolution = 128
        this.size = 100
        this.maxHeight = 20
        
        this.currentTool = TERRAIN_TOOLS.RAISE
        this.brushSize = 5
        this.brushStrength = 0.5
        this.brushType = TERRAIN_BRUSHES.SOFT
        this.flattenHeight = 0
        
        this.brushIndicator = null
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        
        this.isPainting = false
        this.lastPaintPos = null
        
        this.paintLayers = []
        this.currentPaintLayer = 0
        
        this.undoStack = []
        this.redoStack = []
        this.maxUndoLevels = 20
        
        this.enabled = false
        
        this.onTerrainUpdate = null
        
        this.waterPlane = null
        this.waterLevel = 0
        this.waterVisible = true
        this.waterColor = 0x001e0f
        this.waterOpacity = 0.85
        
        this.waterSystem = null
        this.useRealisticWater = true
    }
    
    increaseBrushSize() {
        this.brushSize = Math.min(30, this.brushSize + 1)
        this.updateBrushIndicator()
        console.log('[TerrainEditor] Brush size:', this.brushSize)
    }
    
    decreaseBrushSize() {
        this.brushSize = Math.max(1, this.brushSize - 1)
        this.updateBrushIndicator()
        console.log('[TerrainEditor] Brush size:', this.brushSize)
    }
    
    updateBrushIndicator() {
        if (this.brushIndicator) {
            const scale = this.brushSize * (this.size / this.resolution)
            this.brushIndicator.scale.set(scale, scale, scale)
        }
    }
    
    exportHeightData() {
        return {
            resolution: this.resolution,
            size: this.size,
            heightData: Array.from(this.heightData)
        }
    }

    /**
     * Generate terrain from a biome preset using the AI Map Generator.
     * @param {string} biomeKey - Key from BIOME_CONFIGS (e.g. 'grass', 'desert', 'volcanic')
     * @param {number} seed - Random seed for reproducible generation
     */
    generateFromBiome(biomeKey, seed = Math.floor(Math.random() * 99999)) {
        applyHeightmapToTerrain(this, biomeKey, seed)
        this.updateTerrainGeometry()
        if (this.onTerrainUpdate) this.onTerrainUpdate()
    }

    /**
     * Apply the current heightData to the terrain mesh geometry.
     */
    applyHeightData() {
        if (!this.terrain) return
        const positions = this.terrain.geometry.attributes.position
        for (let i = 0; i < positions.count; i++) {
            positions.setY(i, this.heightData[i] || 0)
        }
        positions.needsUpdate = true
        this.terrain.geometry.computeVertexNormals()
    }

    /** Available biome presets for the UI */
    static get BIOME_LIST() {
        return Object.keys(BIOME_CONFIGS).map(key => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            color: BIOME_CONFIGS[key].color,
        }))
    }
    
    init() {
        this.createTerrain()
        this.createBrushIndicator()
        this.setupPaintLayers()
        this.createWaterPlane()
        console.log('[TerrainEditor] Initialized with', this.resolution, 'x', this.resolution, 'terrain')
    }
    
    createTerrain() {
        this.heightData = new Float32Array(this.resolution * this.resolution)
        
        const geometry = new THREE.PlaneGeometry(
            this.size, 
            this.size, 
            this.resolution - 1, 
            this.resolution - 1
        )
        geometry.rotateX(-Math.PI / 2)
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x4a7c59,
            roughness: 0.85,
            metalness: 0.0,
            flatShading: false,
            side: THREE.DoubleSide,
            vertexColors: true
        })
        
        this.initVertexColors(geometry)
        
        this.terrain = new THREE.Mesh(geometry, material)
        this.terrain.receiveShadow = true
        this.terrain.castShadow = true
        this.terrain.userData.isTerrain = true
        this.terrain.userData.isEditable = true
        this.terrain.name = 'Terrain'
        
        this.scene.add(this.terrain)
        
        return this.terrain
    }
    
    initVertexColors(geometry) {
        const count = geometry.attributes.position.count
        const colors = new Float32Array(count * 3)
        
        const baseColor = new THREE.Color(0x4a7c59)
        
        for (let i = 0; i < count; i++) {
            colors[i * 3] = baseColor.r
            colors[i * 3 + 1] = baseColor.g
            colors[i * 3 + 2] = baseColor.b
        }
        
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }
    
    setupPaintLayers() {
        this.paintLayers = [
            { name: 'Grass', color: new THREE.Color(0x4a7c59) },
            { name: 'Dirt', color: new THREE.Color(0x8B4513) },
            { name: 'Rock', color: new THREE.Color(0x696969) },
            { name: 'Sand', color: new THREE.Color(0xC2B280) },
            { name: 'Snow', color: new THREE.Color(0xFFFAFA) }
        ]
    }
    
    async createWaterPlane() {
        if (this.useRealisticWater && this.renderer) {
            this.waterSystem = new WaterSystem(this.scene, this.renderer)
            await this.waterSystem.createCustomWater({
                size: this.size * 1.2,
                level: this.waterLevel,
                color: this.waterColor,
                waveHeight: 0.3,
                waveSpeed: 1.0
            })
            this.waterPlane = this.waterSystem.getWater()
            this.waterPlane.visible = this.waterVisible
            console.log('[TerrainEditor] Realistic water created at level:', this.waterLevel)
        } else {
            const geometry = new THREE.PlaneGeometry(this.size * 1.2, this.size * 1.2, 32, 32)
            geometry.rotateX(-Math.PI / 2)
            
            const material = new THREE.MeshStandardMaterial({
                color: this.waterColor,
                transparent: true,
                opacity: this.waterOpacity,
                side: THREE.DoubleSide,
                roughness: 0.1,
                metalness: 0.3,
                depthWrite: false
            })
            
            this.waterPlane = new THREE.Mesh(geometry, material)
            this.waterPlane.position.y = this.waterLevel
            this.waterPlane.visible = this.waterVisible
            this.waterPlane.renderOrder = 1
            this.waterPlane.userData.isWater = true
            this.waterPlane.userData.noSelect = true
            this.waterPlane.name = 'Water'
            
            this.scene.add(this.waterPlane)
            console.log('[TerrainEditor] Basic water plane created at level:', this.waterLevel)
        }
    }
    
    updateWater(deltaTime) {
        if (this.waterSystem) {
            this.waterSystem.update(deltaTime)
        }
    }
    
    setWaterLevel(level) {
        this.waterLevel = level
        if (this.waterSystem) {
            this.waterSystem.setLevel(level)
        } else if (this.waterPlane) {
            this.waterPlane.position.y = level
        }
        console.log('[TerrainEditor] Water level set to:', level)
    }
    
    setWaterVisible(visible) {
        this.waterVisible = visible
        if (this.waterPlane) {
            this.waterPlane.visible = visible
        }
    }
    
    setWaterColor(color) {
        this.waterColor = color
        if (this.waterPlane) {
            this.waterPlane.material.color.setHex(color)
        }
    }
    
    setWaterOpacity(opacity) {
        this.waterOpacity = Math.max(0.1, Math.min(1, opacity))
        if (this.waterPlane) {
            this.waterPlane.material.opacity = this.waterOpacity
        }
    }
    
    getWaterSettings() {
        return {
            level: this.waterLevel,
            visible: this.waterVisible,
            color: this.waterColor,
            opacity: this.waterOpacity
        }
    }
    
    createBrushIndicator() {
        const geometry = new THREE.RingGeometry(this.brushSize - 0.1, this.brushSize, 32)
        geometry.rotateX(-Math.PI / 2)
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide,
            depthTest: false
        })
        
        this.brushIndicator = new THREE.Mesh(geometry, material)
        this.brushIndicator.visible = false
        this.brushIndicator.renderOrder = 999
        this.scene.add(this.brushIndicator)
    }
    
    updateBrushIndicator() {
        if (this.brushIndicator) {
            this.brushIndicator.geometry.dispose()
            this.brushIndicator.geometry = new THREE.RingGeometry(
                this.brushSize * 0.9, 
                this.brushSize, 
                32
            )
            this.brushIndicator.geometry.rotateX(-Math.PI / 2)
            
            switch (this.currentTool) {
                case TERRAIN_TOOLS.RAISE:
                    this.brushIndicator.material.color.setHex(0x00ff00)
                    break
                case TERRAIN_TOOLS.LOWER:
                    this.brushIndicator.material.color.setHex(0xff4444)
                    break
                case TERRAIN_TOOLS.SMOOTH:
                    this.brushIndicator.material.color.setHex(0x44aaff)
                    break
                case TERRAIN_TOOLS.FLATTEN:
                    this.brushIndicator.material.color.setHex(0xffaa00)
                    break
                case TERRAIN_TOOLS.PAINT:
                    this.brushIndicator.material.color.copy(this.paintLayers[this.currentPaintLayer].color)
                    break
                case TERRAIN_TOOLS.NOISE:
                    this.brushIndicator.material.color.setHex(0xff00ff)
                    break
                case TERRAIN_TOOLS.WATER:
                    this.brushIndicator.material.color.setHex(0x1a8cff)
                    break
            }
        }
    }
    
    enable() {
        this.enabled = true
        if (this.brushIndicator) this.brushIndicator.visible = true
    }
    
    disable() {
        this.enabled = false
        if (this.brushIndicator) this.brushIndicator.visible = false
        this.isPainting = false
    }
    
    setTool(tool) {
        this.currentTool = tool
        this.updateBrushIndicator()
        console.log('[TerrainEditor] Tool changed to:', tool)
    }
    
    setBrushSize(size) {
        this.brushSize = Math.max(1, Math.min(30, size))
        this.updateBrushIndicator()
    }
    
    setBrushStrength(strength) {
        this.brushStrength = Math.max(0.01, Math.min(1, strength))
    }
    
    setPaintLayer(index) {
        this.currentPaintLayer = Math.max(0, Math.min(this.paintLayers.length - 1, index))
        this.updateBrushIndicator()
    }
    
    onMouseMove(event) {
        if (!this.enabled || !this.terrain) return
        
        const rect = this.renderer.domElement.getBoundingClientRect()
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const intersects = this.raycaster.intersectObject(this.terrain)
        
        if (intersects.length > 0) {
            const point = intersects[0].point
            this.brushIndicator.position.copy(point)
            this.brushIndicator.position.y += 0.1
            this.brushIndicator.visible = true
            
            if (this.isPainting) {
                this.applyBrush(point)
            }
        } else {
            this.brushIndicator.visible = false
        }
    }
    
    onMouseDown(event) {
        if (!this.enabled) return
        if (event.button !== 0) return
        
        this.raycaster.setFromCamera(this.mouse, this.camera)
        const intersects = this.raycaster.intersectObject(this.terrain)
        
        if (intersects.length > 0) {
            this.saveUndoState()
            this.isPainting = true
            this.lastPaintPos = intersects[0].point.clone()
            this.applyBrush(intersects[0].point)
        }
    }
    
    onMouseUp(event) {
        if (event.button === 0) {
            this.isPainting = false
            this.lastPaintPos = null
        }
    }
    
    applyBrush(worldPos) {
        const geometry = this.terrain.geometry
        const positions = geometry.attributes.position.array
        const colors = geometry.attributes.color?.array
        
        const halfSize = this.size / 2
        const localX = worldPos.x + halfSize
        const localZ = worldPos.z + halfSize
        
        let modified = false
        
        for (let i = 0; i < positions.length / 3; i++) {
            const vx = positions[i * 3] + halfSize
            const vz = positions[i * 3 + 2] + halfSize
            
            const dx = vx - localX
            const dz = vz - localZ
            const distance = Math.sqrt(dx * dx + dz * dz)
            
            if (distance <= this.brushSize) {
                let falloff = this.calculateFalloff(distance)
                
                switch (this.currentTool) {
                    case TERRAIN_TOOLS.RAISE:
                        positions[i * 3 + 1] += this.brushStrength * falloff * 0.1
                        modified = true
                        break
                        
                    case TERRAIN_TOOLS.LOWER:
                        positions[i * 3 + 1] -= this.brushStrength * falloff * 0.1
                        modified = true
                        break
                        
                    case TERRAIN_TOOLS.SMOOTH:
                        const avgHeight = this.getAverageHeight(i, positions)
                        positions[i * 3 + 1] = THREE.MathUtils.lerp(
                            positions[i * 3 + 1],
                            avgHeight,
                            this.brushStrength * falloff * 0.2
                        )
                        modified = true
                        break
                        
                    case TERRAIN_TOOLS.FLATTEN:
                        positions[i * 3 + 1] = THREE.MathUtils.lerp(
                            positions[i * 3 + 1],
                            this.flattenHeight,
                            this.brushStrength * falloff * 0.3
                        )
                        modified = true
                        break
                        
                    case TERRAIN_TOOLS.NOISE:
                        positions[i * 3 + 1] += (Math.random() - 0.5) * this.brushStrength * falloff * 0.2
                        modified = true
                        break
                        
                    case TERRAIN_TOOLS.PAINT:
                        if (colors) {
                            const layer = this.paintLayers[this.currentPaintLayer]
                            const blend = this.brushStrength * falloff * 0.3
                            colors[i * 3] = THREE.MathUtils.lerp(colors[i * 3], layer.color.r, blend)
                            colors[i * 3 + 1] = THREE.MathUtils.lerp(colors[i * 3 + 1], layer.color.g, blend)
                            colors[i * 3 + 2] = THREE.MathUtils.lerp(colors[i * 3 + 2], layer.color.b, blend)
                            modified = true
                        }
                        break
                }
                
                positions[i * 3 + 1] = Math.max(-this.maxHeight, Math.min(this.maxHeight, positions[i * 3 + 1]))
            }
        }
        
        if (modified) {
            geometry.attributes.position.needsUpdate = true
            if (colors) geometry.attributes.color.needsUpdate = true
            geometry.computeVertexNormals()
            
            if (this.onTerrainUpdate) {
                this.onTerrainUpdate()
            }
        }
    }
    
    calculateFalloff(distance) {
        const normalizedDist = distance / this.brushSize
        
        switch (this.brushType) {
            case TERRAIN_BRUSHES.CIRCLE:
                return normalizedDist <= 1 ? 1 : 0
            case TERRAIN_BRUSHES.SQUARE:
                return 1
            case TERRAIN_BRUSHES.SOFT:
            default:
                return Math.cos(normalizedDist * Math.PI * 0.5)
        }
    }
    
    getAverageHeight(centerIndex, positions) {
        const centerX = positions[centerIndex * 3]
        const centerZ = positions[centerIndex * 3 + 2]
        const sampleRadius = this.brushSize * 0.5
        
        let sum = 0
        let count = 0
        
        for (let i = 0; i < positions.length / 3; i++) {
            const dx = positions[i * 3] - centerX
            const dz = positions[i * 3 + 2] - centerZ
            const dist = Math.sqrt(dx * dx + dz * dz)
            
            if (dist <= sampleRadius) {
                sum += positions[i * 3 + 1]
                count++
            }
        }
        
        return count > 0 ? sum / count : positions[centerIndex * 3 + 1]
    }
    
    saveUndoState() {
        const positions = this.terrain.geometry.attributes.position.array
        const colors = this.terrain.geometry.attributes.color?.array
        
        this.undoStack.push({
            positions: new Float32Array(positions),
            colors: colors ? new Float32Array(colors) : null
        })
        
        if (this.undoStack.length > this.maxUndoLevels) {
            this.undoStack.shift()
        }
        
        this.redoStack = []
    }
    
    undo() {
        if (this.undoStack.length === 0) return
        
        const geometry = this.terrain.geometry
        const currentPositions = new Float32Array(geometry.attributes.position.array)
        const currentColors = geometry.attributes.color ? new Float32Array(geometry.attributes.color.array) : null
        
        this.redoStack.push({
            positions: currentPositions,
            colors: currentColors
        })
        
        const state = this.undoStack.pop()
        geometry.attributes.position.array.set(state.positions)
        geometry.attributes.position.needsUpdate = true
        
        if (state.colors && geometry.attributes.color) {
            geometry.attributes.color.array.set(state.colors)
            geometry.attributes.color.needsUpdate = true
        }
        
        geometry.computeVertexNormals()
        console.log('[TerrainEditor] Undo applied')
    }
    
    redo() {
        if (this.redoStack.length === 0) return
        
        const geometry = this.terrain.geometry
        const currentPositions = new Float32Array(geometry.attributes.position.array)
        const currentColors = geometry.attributes.color ? new Float32Array(geometry.attributes.color.array) : null
        
        this.undoStack.push({
            positions: currentPositions,
            colors: currentColors
        })
        
        const state = this.redoStack.pop()
        geometry.attributes.position.array.set(state.positions)
        geometry.attributes.position.needsUpdate = true
        
        if (state.colors && geometry.attributes.color) {
            geometry.attributes.color.array.set(state.colors)
            geometry.attributes.color.needsUpdate = true
        }
        
        geometry.computeVertexNormals()
        console.log('[TerrainEditor] Redo applied')
    }
    
    generateFromNoise(scale = 0.05, amplitude = 5, octaves = 4) {
        this.saveUndoState()
        
        const positions = this.terrain.geometry.attributes.position.array
        const halfSize = this.size / 2
        
        for (let i = 0; i < positions.length / 3; i++) {
            const x = positions[i * 3] + halfSize
            const z = positions[i * 3 + 2] + halfSize
            
            let height = 0
            let amp = amplitude
            let freq = scale
            
            for (let o = 0; o < octaves; o++) {
                height += this.noise2D(x * freq, z * freq) * amp
                amp *= 0.5
                freq *= 2
            }
            
            positions[i * 3 + 1] = height
        }
        
        this.terrain.geometry.attributes.position.needsUpdate = true
        this.terrain.geometry.computeVertexNormals()
        console.log('[TerrainEditor] Generated noise terrain')
    }
    
    noise2D(x, y) {
        const X = Math.floor(x) & 255
        const Y = Math.floor(y) & 255
        x -= Math.floor(x)
        y -= Math.floor(y)
        const u = this.fade(x)
        const v = this.fade(y)
        const a = (this.p[X] + Y) & 255
        const b = (this.p[X + 1] + Y) & 255
        return this.lerp(v,
            this.lerp(u, this.grad(this.p[a], x, y), this.grad(this.p[b], x - 1, y)),
            this.lerp(u, this.grad(this.p[a + 1], x, y - 1), this.grad(this.p[b + 1], x - 1, y - 1))
        )
    }
    
    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
    lerp(t, a, b) { return a + t * (b - a) }
    grad(hash, x, y) {
        const h = hash & 3
        const u = h < 2 ? x : y
        const v = h < 2 ? y : x
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v)
    }
    
    p = (() => {
        const perm = []
        for (let i = 0; i < 256; i++) perm[i] = i
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[perm[i], perm[j]] = [perm[j], perm[i]]
        }
        return [...perm, ...perm]
    })()
    
    flattenAll(height = 0) {
        this.saveUndoState()
        
        const positions = this.terrain.geometry.attributes.position.array
        for (let i = 0; i < positions.length / 3; i++) {
            positions[i * 3 + 1] = height
        }
        
        this.terrain.geometry.attributes.position.needsUpdate = true
        this.terrain.geometry.computeVertexNormals()
        console.log('[TerrainEditor] Terrain flattened to height:', height)
    }
    
    setFlattenHeight(height) {
        this.flattenHeight = height
    }
    
    exportHeightmap() {
        const positions = this.terrain.geometry.attributes.position.array
        const data = []
        
        for (let i = 0; i < positions.length / 3; i++) {
            data.push(positions[i * 3 + 1])
        }
        
        return {
            width: this.resolution,
            height: this.resolution,
            data: data,
            size: this.size,
            maxHeight: this.maxHeight
        }
    }
    
    importHeightmap(heightmapData) {
        if (!heightmapData || !heightmapData.data) return
        
        this.saveUndoState()
        
        const positions = this.terrain.geometry.attributes.position.array
        const data = heightmapData.data
        
        for (let i = 0; i < Math.min(positions.length / 3, data.length); i++) {
            positions[i * 3 + 1] = data[i]
        }
        
        this.terrain.geometry.attributes.position.needsUpdate = true
        this.terrain.geometry.computeVertexNormals()
        console.log('[TerrainEditor] Heightmap imported')
    }
    
    dispose() {
        if (this.terrain) {
            this.terrain.geometry.dispose()
            this.terrain.material.dispose()
            this.scene.remove(this.terrain)
        }
        
        if (this.brushIndicator) {
            this.brushIndicator.geometry.dispose()
            this.brushIndicator.material.dispose()
            this.scene.remove(this.brushIndicator)
        }
        
        if (this.waterPlane) {
            this.waterPlane.geometry.dispose()
            this.waterPlane.material.dispose()
            this.scene.remove(this.waterPlane)
        }
        
        this.undoStack = []
        this.redoStack = []
    }
}
