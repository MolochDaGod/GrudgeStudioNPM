import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { AssetDatabaseManager } from './AssetDatabaseManager.js'

const gltfLoader = new GLTFLoader()

export class AssetService {
  constructor() {
    this.cache = new Map()
    this.maxCacheSize = 50
    this.objectStorageBase = '/public-objects'
    this.localBase = ''
    this.database = new AssetDatabaseManager()
  }
  
  getDatabase() {
    return this.database
  }
  
  getAssetInfo(id) {
    return this.database.getAssetById(id)
  }
  
  getAIUseCases(id) {
    return this.database.getAIUseCasesForAsset(id)
  }
  
  generateAIPrompt(id) {
    return this.database.generateAIPrompt(id)
  }
  
  async loadFromDatabase(assetId, options = {}) {
    const asset = this.database.getAssetById(assetId)
    if (!asset) {
      throw new Error(`Asset not found in database: ${assetId}`)
    }
    return this.loadModel(asset.path, options)
  }

  getAssetUrl(path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    
    if (path.startsWith('/public-objects/')) {
      return path
    }
    
    if (path.startsWith('/')) {
      return path
    }
    
    return `/${path}`
  }

  async loadModel(path, options = {}) {
    const url = this.getAssetUrl(path)
    
    if (this.cache.has(url) && !options.forceReload) {
      const cached = this.cache.get(url)
      return cached.scene.clone()
    }

    try {
      const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(
          url,
          resolve,
          (progress) => {
            if (options.onProgress) {
              options.onProgress(progress.loaded / progress.total)
            }
          },
          reject
        )
      })

      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value
        this.cache.delete(firstKey)
      }
      
      this.cache.set(url, gltf)
      
      return gltf.scene.clone()
    } catch (localError) {
      const objectStorageUrl = `${this.objectStorageBase}${path.startsWith('/') ? path : '/' + path}`
      
      try {
        const gltf = await new Promise((resolve, reject) => {
          gltfLoader.load(objectStorageUrl, resolve, undefined, reject)
        })
        
        this.cache.set(url, gltf)
        return gltf.scene.clone()
      } catch (storageError) {
        console.error(`Failed to load model from both sources: ${path}`)
        throw localError
      }
    }
  }

  async loadTexture(path) {
    const url = this.getAssetUrl(path)
    const textureLoader = new THREE.TextureLoader()
    
    return new Promise((resolve, reject) => {
      textureLoader.load(url, resolve, undefined, reject)
    })
  }

  async preloadAssets(paths, onProgress) {
    let loaded = 0
    const total = paths.length

    const results = await Promise.allSettled(
      paths.map(async (path) => {
        const result = await this.loadModel(path)
        loaded++
        if (onProgress) {
          onProgress(loaded / total)
        }
        return result
      })
    )

    return results.filter(r => r.status === 'fulfilled').map(r => r.value)
  }

  clearCache() {
    this.cache.clear()
  }

  getCacheSize() {
    return this.cache.size
  }
}

export const assetService = new AssetService()
export default assetService
