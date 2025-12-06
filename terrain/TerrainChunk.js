import * as THREE from 'three'
import { HeightMap } from './HeightMap.js'

export class TerrainChunk {
  constructor(x, z, options = {}) {
    this.chunkX = x
    this.chunkZ = z
    this.size = options.size ?? 64
    this.resolution = options.resolution ?? 32
    this.maxHeight = options.maxHeight ?? 20
    this.seed = options.seed ?? 12345
    
    this.heightMap = null
    this.geometry = null
    this.mesh = null
    this.lod = 0
    this.lodLevels = options.lodLevels ?? [32, 16, 8, 4]
    
    this.loaded = false
    this.visible = true
  }

  generate(globalConfig = {}) {
    const offsetX = this.chunkX * this.size
    const offsetZ = this.chunkZ * this.size
    
    this.heightMap = new HeightMap(this.resolution, this.resolution, {
      seed: this.seed,
      maxHeight: this.maxHeight
    })
    
    for (let y = 0; y < this.resolution; y++) {
      for (let x = 0; x < this.resolution; x++) {
        const worldX = offsetX + (x / (this.resolution - 1)) * this.size
        const worldZ = offsetZ + (y / (this.resolution - 1)) * this.size
        
        const value = this.heightMap.noise.fbm2D(
          worldX * (globalConfig.frequency ?? 0.01),
          worldZ * (globalConfig.frequency ?? 0.01),
          globalConfig.octaves ?? 6,
          globalConfig.lacunarity ?? 2,
          globalConfig.persistence ?? 0.5
        )
        
        this.heightMap.data[y * this.resolution + x] = (value + 1) / 2
      }
    }
    
    return this
  }

  buildGeometry(lodLevel = 0) {
    const resolution = this.lodLevels[lodLevel] ?? this.resolution
    const segments = resolution - 1
    
    this.geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      segments,
      segments
    )
    
    this.geometry.rotateX(-Math.PI / 2)
    
    const positions = this.geometry.attributes.position.array
    
    for (let i = 0; i < positions.length / 3; i++) {
      const localX = (positions[i * 3] / this.size + 0.5) * (this.resolution - 1)
      const localZ = (positions[i * 3 + 2] / this.size + 0.5) * (this.resolution - 1)
      
      positions[i * 3 + 1] = this.heightMap.getHeightInterpolated(localX, localZ)
    }
    
    this.geometry.computeVertexNormals()
    this.geometry.attributes.position.needsUpdate = true
    
    this.lod = lodLevel
    return this
  }

  createMesh(material) {
    if (!this.geometry) {
      this.buildGeometry()
    }
    
    this.mesh = new THREE.Mesh(this.geometry, material)
    this.mesh.position.set(
      this.chunkX * this.size + this.size / 2,
      0,
      this.chunkZ * this.size + this.size / 2
    )
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    
    this.loaded = true
    return this.mesh
  }

  updateLOD(cameraPosition, lodDistances = [50, 100, 200, 400]) {
    if (!this.mesh) return false
    
    const center = new THREE.Vector3(
      this.chunkX * this.size + this.size / 2,
      0,
      this.chunkZ * this.size + this.size / 2
    )
    
    const distance = cameraPosition.distanceTo(center)
    
    let newLOD = this.lodLevels.length - 1
    for (let i = 0; i < lodDistances.length; i++) {
      if (distance < lodDistances[i]) {
        newLOD = i
        break
      }
    }
    
    if (newLOD !== this.lod && newLOD < this.lodLevels.length) {
      this.buildGeometry(newLOD)
      this.mesh.geometry.dispose()
      this.mesh.geometry = this.geometry
      return true
    }
    
    return false
  }

  getHeightAt(worldX, worldZ) {
    if (!this.heightMap) return 0
    
    const localX = (worldX - this.chunkX * this.size) / this.size * (this.resolution - 1)
    const localZ = (worldZ - this.chunkZ * this.size) / this.size * (this.resolution - 1)
    
    if (localX < 0 || localX >= this.resolution || localZ < 0 || localZ >= this.resolution) {
      return 0
    }
    
    return this.heightMap.getHeightInterpolated(localX, localZ)
  }

  isPointInChunk(worldX, worldZ) {
    const minX = this.chunkX * this.size
    const maxX = minX + this.size
    const minZ = this.chunkZ * this.size
    const maxZ = minZ + this.size
    
    return worldX >= minX && worldX < maxX && worldZ >= minZ && worldZ < maxZ
  }

  setVisible(visible) {
    this.visible = visible
    if (this.mesh) {
      this.mesh.visible = visible
    }
    return this
  }

  dispose() {
    if (this.geometry) {
      this.geometry.dispose()
    }
    this.loaded = false
  }
}
