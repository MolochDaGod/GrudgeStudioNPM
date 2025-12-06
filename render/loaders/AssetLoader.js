import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export class AssetLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader()
    this.gltfLoader = new GLTFLoader()
    this.dracoLoader = null
    this.audioLoader = new THREE.AudioLoader()
    this.cubeTextureLoader = new THREE.CubeTextureLoader()
    this.fileLoader = new THREE.FileLoader()
    
    this.loadingManager = new THREE.LoadingManager()
    this.cache = new Map()
    this.pendingLoads = new Map()
    
    this.onProgress = null
    this.onError = null
    
    this.setupLoadingManager()
  }

  setupLoadingManager() {
    this.loadingManager.onProgress = (url, loaded, total) => {
      if (this.onProgress) {
        this.onProgress(url, loaded, total, loaded / total)
      }
    }
    
    this.loadingManager.onError = (url) => {
      if (this.onError) {
        this.onError(url, new Error(`Failed to load: ${url}`))
      }
    }
    
    this.textureLoader.manager = this.loadingManager
    this.gltfLoader.manager = this.loadingManager
    this.audioLoader.manager = this.loadingManager
  }

  enableDraco(decoderPath = 'https://www.gstatic.com/draco/v1/decoders/') {
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath(decoderPath)
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
    return this
  }

  async loadTexture(url, options = {}) {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }
    
    if (this.pendingLoads.has(url)) {
      return this.pendingLoads.get(url)
    }
    
    const promise = new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          if (options.encoding) texture.encoding = options.encoding
          if (options.wrapS) texture.wrapS = options.wrapS
          if (options.wrapT) texture.wrapT = options.wrapT
          if (options.repeat) texture.repeat.set(options.repeat.x, options.repeat.y)
          if (options.flipY !== undefined) texture.flipY = options.flipY
          texture.needsUpdate = true
          
          this.cache.set(url, texture)
          this.pendingLoads.delete(url)
          resolve(texture)
        },
        undefined,
        (error) => {
          this.pendingLoads.delete(url)
          reject(error)
        }
      )
    })
    
    this.pendingLoads.set(url, promise)
    return promise
  }

  async loadModel(url, options = {}) {
    if (this.cache.has(url)) {
      const cached = this.cache.get(url)
      return options.clone ? this.cloneGLTF(cached) : cached
    }
    
    if (this.pendingLoads.has(url)) {
      const cached = await this.pendingLoads.get(url)
      return options.clone ? this.cloneGLTF(cached) : cached
    }
    
    const promise = new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          if (options.castShadow || options.receiveShadow) {
            gltf.scene.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = options.castShadow ?? false
                child.receiveShadow = options.receiveShadow ?? false
              }
            })
          }
          
          this.cache.set(url, gltf)
          this.pendingLoads.delete(url)
          resolve(options.clone ? this.cloneGLTF(gltf) : gltf)
        },
        undefined,
        (error) => {
          this.pendingLoads.delete(url)
          reject(error)
        }
      )
    })
    
    this.pendingLoads.set(url, promise)
    return promise
  }

  cloneGLTF(gltf) {
    const clone = {
      scene: gltf.scene.clone(),
      animations: gltf.animations,
      cameras: gltf.cameras,
      asset: gltf.asset
    }
    
    const skinnedMeshes = {}
    gltf.scene.traverse((node) => {
      if (node.isSkinnedMesh) {
        skinnedMeshes[node.name] = node
      }
    })
    
    clone.scene.traverse((node) => {
      if (node.isSkinnedMesh) {
        const originalMesh = skinnedMeshes[node.name]
        if (originalMesh) {
          node.skeleton = originalMesh.skeleton.clone()
          node.bindMatrix.copy(originalMesh.bindMatrix)
          node.bindMatrixInverse.copy(originalMesh.bindMatrixInverse)
        }
      }
    })
    
    return clone
  }

  async loadAudio(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }
    
    const promise = new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => {
          this.cache.set(url, buffer)
          resolve(buffer)
        },
        undefined,
        reject
      )
    })
    
    return promise
  }

  async loadCubeTexture(urls) {
    const key = urls.join(',')
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    
    const promise = new Promise((resolve, reject) => {
      this.cubeTextureLoader.load(
        urls,
        (texture) => {
          this.cache.set(key, texture)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
    
    return promise
  }

  async loadJSON(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }
    
    const response = await fetch(url)
    const json = await response.json()
    this.cache.set(url, json)
    return json
  }

  async loadAll(assets) {
    const promises = assets.map(async (asset) => {
      switch (asset.type) {
        case 'texture':
          return { name: asset.name, asset: await this.loadTexture(asset.url, asset.options) }
        case 'model':
          return { name: asset.name, asset: await this.loadModel(asset.url, asset.options) }
        case 'audio':
          return { name: asset.name, asset: await this.loadAudio(asset.url) }
        case 'cubemap':
          return { name: asset.name, asset: await this.loadCubeTexture(asset.urls) }
        case 'json':
          return { name: asset.name, asset: await this.loadJSON(asset.url) }
        default:
          throw new Error(`Unknown asset type: ${asset.type}`)
      }
    })
    
    const results = await Promise.all(promises)
    const loaded = {}
    for (const { name, asset } of results) {
      loaded[name] = asset
    }
    return loaded
  }

  clearCache(url) {
    if (url) {
      const cached = this.cache.get(url)
      if (cached) {
        if (cached.dispose) cached.dispose()
        this.cache.delete(url)
      }
    } else {
      for (const [, asset] of this.cache) {
        if (asset.dispose) asset.dispose()
      }
      this.cache.clear()
    }
  }

  dispose() {
    this.clearCache()
    if (this.dracoLoader) {
      this.dracoLoader.dispose()
    }
  }
}
