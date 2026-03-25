import * as THREE from 'three'

export const MaterialPresets = {
  METAL: {
    metalness: 0.9,
    roughness: 0.2,
    envMapIntensity: 1.0
  },
  PLASTIC: {
    metalness: 0.0,
    roughness: 0.4,
    envMapIntensity: 0.5
  },
  LEATHER: {
    metalness: 0.0,
    roughness: 0.8,
    envMapIntensity: 0.3
  },
  SKIN: {
    metalness: 0.0,
    roughness: 0.6,
    envMapIntensity: 0.2
  },
  CLOTH: {
    metalness: 0.0,
    roughness: 0.9,
    envMapIntensity: 0.1
  },
  GOLD: {
    metalness: 1.0,
    roughness: 0.15,
    color: 0xffd700,
    envMapIntensity: 1.2
  },
  BRONZE: {
    metalness: 0.9,
    roughness: 0.3,
    color: 0xcd7f32,
    envMapIntensity: 0.9
  },
  IRON: {
    metalness: 0.85,
    roughness: 0.4,
    color: 0x434343,
    envMapIntensity: 0.7
  }
}

export class TextureLayer {
  constructor(model) {
    this.model = model
    this.textureLoader = new THREE.TextureLoader()
    this.cubeTextureLoader = new THREE.CubeTextureLoader()
    this.textures = new Map()
    this.materials = new Map()
    this.originalMaterials = new Map()
    this.envMap = null
  }
  
  async loadTexture(name, path, options = {}) {
    try {
      const texture = await new Promise((resolve, reject) => {
        this.textureLoader.load(path, resolve, undefined, reject)
      })
      
      if (options.flipY !== undefined) {
        texture.flipY = options.flipY
      }
      
      if (options.wrapS) {
        texture.wrapS = THREE[options.wrapS] || THREE.RepeatWrapping
      }
      if (options.wrapT) {
        texture.wrapT = THREE[options.wrapT] || THREE.RepeatWrapping
      }
      
      if (options.repeat) {
        texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1)
      }
      
      texture.colorSpace = options.colorSpace || THREE.SRGBColorSpace
      
      this.textures.set(name, texture)
      return texture
    } catch (error) {
      console.warn(`Failed to load texture ${name}:`, error)
      return null
    }
  }
  
  async loadPBRTextures(basePath, materialName) {
    const textures = {}
    
    const textureTypes = [
      { key: 'map', suffix: ['diffuse', 'color', 'albedo', 'base_color'] },
      { key: 'normalMap', suffix: ['normal', 'norm'] },
      { key: 'roughnessMap', suffix: ['roughness', 'rough'] },
      { key: 'metalnessMap', suffix: ['metalness', 'metal', 'metallic'] },
      { key: 'aoMap', suffix: ['ao', 'ambient_occlusion', 'occlusion'] },
      { key: 'emissiveMap', suffix: ['emissive', 'emission'] }
    ]
    
    for (const type of textureTypes) {
      for (const suffix of type.suffix) {
        const extensions = ['png', 'jpg', 'jpeg']
        for (const ext of extensions) {
          const path = `${basePath}/${materialName}_${suffix}.${ext}`
          try {
            const texture = await this.loadTexture(`${materialName}_${type.key}`, path, {
              colorSpace: type.key === 'map' || type.key === 'emissiveMap' 
                ? THREE.SRGBColorSpace 
                : THREE.LinearSRGBColorSpace
            })
            if (texture) {
              textures[type.key] = texture
              break
            }
          } catch (e) {
          }
        }
        if (textures[type.key]) break
      }
    }
    
    return textures
  }
  
  createMaterial(name, config = {}) {
    const materialConfig = {
      color: config.color || 0xffffff,
      metalness: config.metalness ?? 0.0,
      roughness: config.roughness ?? 1.0,
      ...config
    }
    
    if (this.envMap) {
      materialConfig.envMap = this.envMap
    }
    
    const material = new THREE.MeshStandardMaterial(materialConfig)
    this.materials.set(name, material)
    return material
  }
  
  createMaterialFromPreset(name, presetName, overrides = {}) {
    const preset = MaterialPresets[presetName]
    if (!preset) {
      console.warn(`Material preset ${presetName} not found`)
      return null
    }
    
    return this.createMaterial(name, { ...preset, ...overrides })
  }
  
  async loadEnvMap(path) {
    try {
      const texture = await new Promise((resolve, reject) => {
        this.textureLoader.load(path, resolve, undefined, reject)
      })
      
      texture.mapping = THREE.EquirectangularReflectionMapping
      this.envMap = texture
      
      this.materials.forEach((material) => {
        material.envMap = texture
        material.needsUpdate = true
      })
      
      return texture
    } catch (error) {
      console.warn('Failed to load environment map:', error)
      return null
    }
  }
  
  generateProceduralEnvMap(renderer) {
    const size = 256
    const data = new Uint8Array(size * size * 4)
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4
        const gradient = 1 - (y / size)
        
        data[i] = Math.floor(40 + gradient * 80)
        data[i + 1] = Math.floor(60 + gradient * 100)
        data[i + 2] = Math.floor(100 + gradient * 155)
        data[i + 3] = 255
      }
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.needsUpdate = true
    
    this.envMap = texture
    return texture
  }
  
  setTint(meshName, color, blend = 0.5) {
    if (!this.model) return
    
    const tintColor = new THREE.Color(color)
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (child.material) {
          const originalColor = child.material.color.clone()
          child.material.color.lerpColors(originalColor, tintColor, blend)
        }
      }
    })
  }
  
  setSaturation(meshName, saturation) {
    if (!this.model) return
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (child.material && child.material.color) {
          const hsl = { h: 0, s: 0, l: 0 }
          child.material.color.getHSL(hsl)
          child.material.color.setHSL(hsl.h, saturation, hsl.l)
        }
      }
    })
  }
  
  setRoughnessMetalness(meshName, roughness, metalness) {
    if (!this.model) return
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (child.material) {
          if (roughness !== undefined) child.material.roughness = roughness
          if (metalness !== undefined) child.material.metalness = metalness
          child.material.needsUpdate = true
        }
      }
    })
  }
  
  enableOutline(meshName, color = 0x000000, thickness = 0.02) {
    if (!this.model) return []
    
    const outlines = []
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        const outlineMaterial = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.BackSide
        })
        
        const outlineMesh = new THREE.Mesh(child.geometry.clone(), outlineMaterial)
        outlineMesh.scale.multiplyScalar(1 + thickness)
        outlineMesh.position.copy(child.position)
        outlineMesh.rotation.copy(child.rotation)
        
        child.parent.add(outlineMesh)
        outlines.push(outlineMesh)
      }
    })
    
    return outlines
  }
  
  applyTexture(meshName, textureName, slot = 'map') {
    if (!this.model) return false
    
    const texture = this.textures.get(textureName)
    if (!texture) {
      console.warn(`Texture ${textureName} not found`)
      return false
    }
    
    let applied = false
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (!this.originalMaterials.has(child.uuid)) {
          this.originalMaterials.set(child.uuid, child.material.clone())
        }
        
        if (child.material) {
          child.material[slot] = texture
          child.material.needsUpdate = true
          applied = true
        }
      }
    })
    
    return applied
  }
  
  applyMaterial(meshName, materialName) {
    if (!this.model) return false
    
    const material = this.materials.get(materialName)
    if (!material) {
      console.warn(`Material ${materialName} not found`)
      return false
    }
    
    let applied = false
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (!this.originalMaterials.has(child.uuid)) {
          this.originalMaterials.set(child.uuid, child.material)
        }
        
        child.material = material
        applied = true
      }
    })
    
    return applied
  }
  
  setColor(meshName, color) {
    if (!this.model) return
    
    const colorValue = new THREE.Color(color)
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (child.material) {
          child.material.color.copy(colorValue)
        }
      }
    })
  }
  
  setEmissive(meshName, color, intensity = 1) {
    if (!this.model) return
    
    const colorValue = new THREE.Color(color)
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (child.material) {
          child.material.emissive = colorValue
          child.material.emissiveIntensity = intensity
        }
      }
    })
  }
  
  setOpacity(meshName, opacity) {
    if (!this.model) return
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (child.material) {
          child.material.transparent = opacity < 1
          child.material.opacity = opacity
        }
      }
    })
  }
  
  flashColor(meshName, color, duration = 0.1) {
    if (!this.model) return
    
    const flashColor = new THREE.Color(color)
    const originalColors = new Map()
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        if (child.material) {
          originalColors.set(child.uuid, child.material.color.clone())
          child.material.color.copy(flashColor)
        }
      }
    })
    
    setTimeout(() => {
      this.model.traverse((child) => {
        if (child.isMesh && originalColors.has(child.uuid)) {
          child.material.color.copy(originalColors.get(child.uuid))
        }
      })
    }, duration * 1000)
  }
  
  resetMaterials(meshName = '*') {
    if (!this.model) return
    
    this.model.traverse((child) => {
      if (child.isMesh && (meshName === '*' || child.name === meshName)) {
        const original = this.originalMaterials.get(child.uuid)
        if (original) {
          child.material = original
        }
      }
    })
  }
  
  listMeshes() {
    const meshes = []
    if (this.model) {
      this.model.traverse((child) => {
        if (child.isMesh) {
          meshes.push({
            name: child.name,
            uuid: child.uuid,
            materialType: child.material?.type
          })
        }
      })
    }
    return meshes
  }
  
  dispose() {
    for (const [name, texture] of this.textures) {
      texture.dispose()
    }
    this.textures.clear()
    
    for (const [name, material] of this.materials) {
      material.dispose()
    }
    this.materials.clear()
    
    this.originalMaterials.clear()
  }
}
