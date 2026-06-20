import * as THREE from 'three'
import { TerrainChunk } from './TerrainChunk.js'

export class LODTerrain {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize ?? 64
    this.viewDistance = options.viewDistance ?? 3
    this.resolution = options.resolution ?? 32
    this.maxHeight = options.maxHeight ?? 20
    this.seed = options.seed ?? 12345
    
    this.lodDistances = options.lodDistances ?? [50, 100, 200, 400]
    this.lodLevels = options.lodLevels ?? [32, 16, 8, 4]
    
    this.chunks = new Map()
    this.loadedChunks = new Set()
    this.pendingChunks = new Set()
    
    this.material = null
    this.group = new THREE.Group()
    
    this.lastUpdatePosition = new THREE.Vector3()
    this.updateThreshold = this.chunkSize / 2
    
    this.heightConfig = {
      frequency: options.frequency ?? 0.01,
      octaves: options.octaves ?? 6,
      persistence: options.persistence ?? 0.5,
      lacunarity: options.lacunarity ?? 2
    }
    
    this.onChunkLoad = null
    this.onChunkUnload = null
  }

  setMaterial(material) {
    this.material = material
    return this
  }

  getChunkKey(x, z) {
    return `${x},${z}`
  }

  parseChunkKey(key) {
    const [x, z] = key.split(',').map(Number)
    return { x, z }
  }

  getChunkCoords(worldX, worldZ) {
    return {
      x: Math.floor(worldX / this.chunkSize),
      z: Math.floor(worldZ / this.chunkSize)
    }
  }

  update(cameraPosition) {
    const distance = this.lastUpdatePosition.distanceTo(cameraPosition)
    
    if (distance > this.updateThreshold) {
      this.updateChunks(cameraPosition)
      this.lastUpdatePosition.copy(cameraPosition)
    }
    
    for (const chunk of this.chunks.values()) {
      if (chunk.loaded) {
        chunk.updateLOD(cameraPosition, this.lodDistances)
      }
    }
    
    return this
  }

  updateChunks(cameraPosition) {
    const centerChunk = this.getChunkCoords(cameraPosition.x, cameraPosition.z)
    
    const neededChunks = new Set()
    
    for (let x = -this.viewDistance; x <= this.viewDistance; x++) {
      for (let z = -this.viewDistance; z <= this.viewDistance; z++) {
        const chunkX = centerChunk.x + x
        const chunkZ = centerChunk.z + z
        const key = this.getChunkKey(chunkX, chunkZ)
        
        neededChunks.add(key)
        
        if (!this.chunks.has(key)) {
          this.loadChunk(chunkX, chunkZ)
        }
      }
    }
    
    for (const [key, chunk] of this.chunks) {
      if (!neededChunks.has(key)) {
        this.unloadChunk(key)
      }
    }
  }

  loadChunk(x, z) {
    const key = this.getChunkKey(x, z)
    
    if (this.chunks.has(key) || this.pendingChunks.has(key)) {
      return
    }
    
    this.pendingChunks.add(key)
    
    const chunk = new TerrainChunk(x, z, {
      size: this.chunkSize,
      resolution: this.resolution,
      maxHeight: this.maxHeight,
      seed: this.seed,
      lodLevels: this.lodLevels
    })
    
    chunk.generate(this.heightConfig)
    
    if (this.material) {
      chunk.createMesh(this.material)
      this.group.add(chunk.mesh)
    }
    
    this.chunks.set(key, chunk)
    this.loadedChunks.add(key)
    this.pendingChunks.delete(key)
    
    if (this.onChunkLoad) {
      this.onChunkLoad(chunk, key)
    }
  }

  unloadChunk(key) {
    const chunk = this.chunks.get(key)
    
    if (!chunk) return
    
    if (chunk.mesh) {
      this.group.remove(chunk.mesh)
    }
    
    chunk.dispose()
    this.chunks.delete(key)
    this.loadedChunks.delete(key)
    
    if (this.onChunkUnload) {
      this.onChunkUnload(chunk, key)
    }
  }

  getHeightAt(worldX, worldZ) {
    const coords = this.getChunkCoords(worldX, worldZ)
    const key = this.getChunkKey(coords.x, coords.z)
    const chunk = this.chunks.get(key)
    
    if (!chunk || !chunk.loaded) {
      return 0
    }
    
    return chunk.getHeightAt(worldX, worldZ)
  }

  getChunkAt(worldX, worldZ) {
    const coords = this.getChunkCoords(worldX, worldZ)
    const key = this.getChunkKey(coords.x, coords.z)
    return this.chunks.get(key)
  }

  getGroup() {
    return this.group
  }

  getLoadedChunkCount() {
    return this.loadedChunks.size
  }

  setViewDistance(distance) {
    this.viewDistance = distance
    return this
  }

  forceUpdate(cameraPosition) {
    this.lastUpdatePosition.set(Infinity, Infinity, Infinity)
    this.update(cameraPosition)
    return this
  }

  dispose() {
    for (const chunk of this.chunks.values()) {
      if (chunk.mesh) {
        this.group.remove(chunk.mesh)
      }
      chunk.dispose()
    }
    
    this.chunks.clear()
    this.loadedChunks.clear()
    this.pendingChunks.clear()
    
    if (this.material) {
      this.material.dispose()
    }
  }
}
