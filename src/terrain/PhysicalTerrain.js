/*
    GRUDGE Engine - Physical Terrain System
    Terrain with Rapier physics collision layers
*/

import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'

export class PhysicalTerrain {
    constructor(options = {}) {
        this.width = options.width || 100
        this.depth = options.depth || 100
        this.segments = options.segments || 64
        this.maxHeight = options.maxHeight || 10
        this.minHeight = options.minHeight || 0
        
        this.mesh = null
        this.heightData = null
        this.collider = null
        this.rigidBody = null
        
        this.layers = {
            GROUND: 0x0001,
            WALLS: 0x0002,
            OBSTACLES: 0x0004,
            TRIGGERS: 0x0008
        }
        
        this.collisionGroup = options.collisionGroup || this.layers.GROUND
        this.collisionMask = options.collisionMask || 0xFFFF
    }
    
    generate(heightFunction) {
        const geometry = new THREE.PlaneGeometry(
            this.width,
            this.depth,
            this.segments,
            this.segments
        )
        
        geometry.rotateX(-Math.PI / 2)
        
        const positions = geometry.attributes.position
        this.heightData = new Float32Array((this.segments + 1) * (this.segments + 1))
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i)
            const z = positions.getZ(i)
            
            let height = 0
            if (heightFunction) {
                height = heightFunction(x, z)
            } else {
                height = this.defaultHeightFunction(x, z)
            }
            
            height = Math.max(this.minHeight, Math.min(this.maxHeight, height))
            positions.setY(i, height)
            this.heightData[i] = height
        }
        
        geometry.computeVertexNormals()
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x3d5c3d,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: false
        })
        
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.mesh.name = 'PhysicalTerrain'
        
        return this.mesh
    }
    
    defaultHeightFunction(x, z) {
        const nx = x / this.width
        const nz = z / this.depth
        
        const noise1 = Math.sin(nx * 10) * Math.cos(nz * 10) * 0.5
        const noise2 = Math.sin(nx * 20 + 1) * Math.cos(nz * 20 + 2) * 0.25
        
        return (noise1 + noise2 + 0.5) * this.maxHeight
    }
    
    async initPhysics(world) {
        if (!this.mesh || !this.heightData) {
            console.warn('[PhysicalTerrain] Generate terrain first')
            return null
        }
        
        const rows = this.segments + 1
        const cols = this.segments + 1
        
        const heights = new Float32Array(rows * cols)
        for (let i = 0; i < this.heightData.length; i++) {
            heights[i] = this.heightData[i]
        }
        
        const scale = new RAPIER.Vector3(
            this.width / (cols - 1),
            1.0,
            this.depth / (rows - 1)
        )
        
        try {
            const heightfieldDesc = RAPIER.ColliderDesc.heightfield(
                rows - 1,
                cols - 1,
                heights,
                scale
            )
            
            heightfieldDesc.setCollisionGroups(
                (this.collisionGroup << 16) | this.collisionMask
            )
            
            this.collider = world.createCollider(heightfieldDesc)
            
            this.collider.setTranslation({
                x: -this.width / 2,
                y: 0,
                z: -this.depth / 2
            })
            
            return this.collider
        } catch (error) {
            console.warn('[PhysicalTerrain] Heightfield not supported, using trimesh')
            return this.initPhysicsTrimesh(world)
        }
    }
    
    async initPhysicsTrimesh(world) {
        const geometry = this.mesh.geometry
        const vertices = geometry.attributes.position.array
        const indices = geometry.index ? geometry.index.array : null
        
        if (!indices) {
            console.error('[PhysicalTerrain] Geometry needs indices')
            return null
        }
        
        const trimeshDesc = RAPIER.ColliderDesc.trimesh(
            new Float32Array(vertices),
            new Uint32Array(indices)
        )
        
        trimeshDesc.setCollisionGroups(
            (this.collisionGroup << 16) | this.collisionMask
        )
        
        this.collider = world.createCollider(trimeshDesc)
        
        return this.collider
    }
    
    getHeightAt(x, z) {
        if (!this.heightData) return 0
        
        const cols = this.segments + 1
        const rows = this.segments + 1
        
        const nx = (x / this.width + 0.5) * (cols - 1)
        const nz = (z / this.depth + 0.5) * (rows - 1)
        
        const ix = Math.floor(nx)
        const iz = Math.floor(nz)
        
        if (ix < 0 || ix >= cols - 1 || iz < 0 || iz >= rows - 1) {
            return 0
        }
        
        const fx = nx - ix
        const fz = nz - iz
        
        const h00 = this.heightData[iz * cols + ix]
        const h10 = this.heightData[iz * cols + ix + 1]
        const h01 = this.heightData[(iz + 1) * cols + ix]
        const h11 = this.heightData[(iz + 1) * cols + ix + 1]
        
        const h0 = h00 * (1 - fx) + h10 * fx
        const h1 = h01 * (1 - fx) + h11 * fx
        
        return h0 * (1 - fz) + h1 * fz
    }
    
    getNormalAt(x, z) {
        const delta = 0.5
        
        const hL = this.getHeightAt(x - delta, z)
        const hR = this.getHeightAt(x + delta, z)
        const hD = this.getHeightAt(x, z - delta)
        const hU = this.getHeightAt(x, z + delta)
        
        const normal = new THREE.Vector3(
            hL - hR,
            2 * delta,
            hD - hU
        ).normalize()
        
        return normal
    }
    
    setMaterial(material) {
        if (this.mesh) {
            this.mesh.material.dispose()
            this.mesh.material = material
        }
    }
    
    setVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible
        }
    }
    
    getMesh() {
        return this.mesh
    }
    
    getCollider() {
        return this.collider
    }
    
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose()
            if (this.mesh.material) {
                this.mesh.material.dispose()
            }
        }
        this.heightData = null
    }
}

export class TerrainLayer {
    constructor(name, options = {}) {
        this.name = name
        this.visible = options.visible !== false
        this.collidable = options.collidable !== false
        this.collisionGroup = options.collisionGroup || 0x0001
        this.collisionMask = options.collisionMask || 0xFFFF
        
        this.objects = []
        this.colliders = []
        
        this.group = new THREE.Group()
        this.group.name = `TerrainLayer-${name}`
    }
    
    add(object) {
        this.objects.push(object)
        this.group.add(object)
    }
    
    remove(object) {
        const index = this.objects.indexOf(object)
        if (index !== -1) {
            this.objects.splice(index, 1)
            this.group.remove(object)
        }
    }
    
    setVisible(visible) {
        this.visible = visible
        this.group.visible = visible
    }
    
    getGroup() {
        return this.group
    }
    
    clear() {
        while (this.objects.length > 0) {
            const obj = this.objects.pop()
            this.group.remove(obj)
        }
    }
}

export class TerrainLayerManager {
    constructor(scene) {
        this.scene = scene
        this.layers = new Map()
        
        this.createLayer('ground', { collisionGroup: 0x0001 })
        this.createLayer('walls', { collisionGroup: 0x0002 })
        this.createLayer('obstacles', { collisionGroup: 0x0004 })
        this.createLayer('triggers', { collisionGroup: 0x0008, collidable: false })
        this.createLayer('decorations', { collidable: false })
    }
    
    createLayer(name, options = {}) {
        const layer = new TerrainLayer(name, options)
        this.layers.set(name, layer)
        this.scene.add(layer.getGroup())
        return layer
    }
    
    getLayer(name) {
        return this.layers.get(name)
    }
    
    addToLayer(layerName, object) {
        const layer = this.layers.get(layerName)
        if (layer) {
            layer.add(object)
        }
    }
    
    removeFromLayer(layerName, object) {
        const layer = this.layers.get(layerName)
        if (layer) {
            layer.remove(object)
        }
    }
    
    setLayerVisible(layerName, visible) {
        const layer = this.layers.get(layerName)
        if (layer) {
            layer.setVisible(visible)
        }
    }
    
    getAllLayers() {
        return Array.from(this.layers.values())
    }
    
    dispose() {
        for (const layer of this.layers.values()) {
            this.scene.remove(layer.getGroup())
            layer.clear()
        }
        this.layers.clear()
    }
}

export default { PhysicalTerrain, TerrainLayer, TerrainLayerManager }
