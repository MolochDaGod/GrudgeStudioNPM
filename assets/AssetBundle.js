import { EventEmitter } from '../core/events/EventEmitter.js'

export class AssetBundle extends EventEmitter {
  constructor(name, options = {}) {
    super()
    
    this.name = name
    this.version = options.version ?? '1.0.0'
    this.assets = new Map()
    this.loaded = new Map()
    this.loading = new Set()
    
    this.totalSize = 0
    this.loadedSize = 0
    
    this.manifest = options.manifest ?? null
  }

  addAsset(id, url, options = {}) {
    this.assets.set(id, {
      id,
      url,
      type: options.type ?? 'unknown',
      size: options.size ?? 0,
      priority: options.priority ?? 0,
      dependencies: options.dependencies ?? []
    })
    
    this.totalSize += options.size ?? 0
    return this
  }

  addFromManifest(assetIds) {
    if (!this.manifest) {
      throw new Error('No manifest set for bundle')
    }
    
    for (const id of assetIds) {
      const asset = this.manifest.get(id)
      if (asset) {
        this.addAsset(id, this.manifest.getUrl(id), {
          type: asset.type,
          size: asset.size,
          priority: asset.priority
        })
      }
    }
    
    return this
  }

  async load(loader) {
    const sorted = Array.from(this.assets.values())
      .sort((a, b) => b.priority - a.priority)
    
    this.emit('loadStart', { total: sorted.length })
    
    for (const asset of sorted) {
      if (this.loaded.has(asset.id)) continue
      
      for (const depId of asset.dependencies) {
        if (!this.loaded.has(depId)) {
          await this.loadAsset(depId, loader)
        }
      }
      
      await this.loadAsset(asset.id, loader)
    }
    
    this.emit('loadComplete', { loaded: this.loaded.size })
  }

  async loadAsset(id, loader) {
    const asset = this.assets.get(id)
    if (!asset || this.loading.has(id)) return
    
    this.loading.add(id)
    this.emit('assetLoadStart', { id, asset })
    
    try {
      let data
      
      switch (asset.type) {
        case 'model':
          data = await loader.loadModel?.(asset.url) ?? await this.fetchData(asset.url)
          break
        case 'texture':
          data = await loader.loadTexture?.(asset.url) ?? await this.loadImage(asset.url)
          break
        case 'audio':
          data = await loader.loadAudio?.(asset.url) ?? await this.fetchArrayBuffer(asset.url)
          break
        case 'data':
          data = await this.fetchJSON(asset.url)
          break
        default:
          data = await this.fetchData(asset.url)
      }
      
      this.loaded.set(id, data)
      this.loadedSize += asset.size
      
      const progress = this.loadedSize / this.totalSize
      this.emit('progress', { id, progress, loaded: this.loadedSize, total: this.totalSize })
      this.emit('assetLoaded', { id, data })
      
    } catch (error) {
      this.emit('assetError', { id, error })
      throw error
    } finally {
      this.loading.delete(id)
    }
  }

  async fetchJSON(url) {
    const response = await fetch(url)
    return response.json()
  }

  async fetchData(url) {
    const response = await fetch(url)
    return response.blob()
  }

  async fetchArrayBuffer(url) {
    const response = await fetch(url)
    return response.arrayBuffer()
  }

  async loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  get(id) {
    return this.loaded.get(id)
  }

  has(id) {
    return this.loaded.has(id)
  }

  isLoaded() {
    return this.assets.size === this.loaded.size
  }

  getProgress() {
    if (this.totalSize === 0) {
      return this.assets.size === 0 ? 1 : this.loaded.size / this.assets.size
    }
    return this.loadedSize / this.totalSize
  }

  getLoadedAssets() {
    return Array.from(this.loaded.entries())
  }

  unload(id) {
    const data = this.loaded.get(id)
    
    if (data) {
      if (data.dispose) data.dispose()
      
      const asset = this.assets.get(id)
      if (asset) {
        this.loadedSize -= asset.size
      }
      
      this.loaded.delete(id)
      this.emit('assetUnloaded', { id })
    }
    
    return this
  }

  unloadAll() {
    for (const id of this.loaded.keys()) {
      this.unload(id)
    }
    return this
  }

  dispose() {
    this.unloadAll()
    this.assets.clear()
    this.totalSize = 0
  }
}
