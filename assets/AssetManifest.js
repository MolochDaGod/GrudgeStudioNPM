export class AssetManifest {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl ?? ''
    this.cdnUrl = options.cdnUrl ?? null
    this.version = options.version ?? '1.0.0'
    this.hashLength = options.hashLength ?? 8
    
    this.assets = new Map()
    this.categories = new Map()
    this.tags = new Map()
  }

  register(id, config) {
    const asset = {
      id,
      path: config.path,
      type: config.type ?? this.inferType(config.path),
      size: config.size ?? null,
      hash: config.hash ?? null,
      cdnPath: config.cdnPath ?? null,
      category: config.category ?? 'misc',
      tags: config.tags ?? [],
      metadata: config.metadata ?? {},
      preload: config.preload ?? false,
      priority: config.priority ?? 0
    }
    
    this.assets.set(id, asset)
    
    if (!this.categories.has(asset.category)) {
      this.categories.set(asset.category, [])
    }
    this.categories.get(asset.category).push(id)
    
    for (const tag of asset.tags) {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, [])
      }
      this.tags.get(tag).push(id)
    }
    
    return this
  }

  registerBatch(assets) {
    for (const [id, config] of Object.entries(assets)) {
      this.register(id, config)
    }
    return this
  }

  get(id) {
    return this.assets.get(id)
  }

  getUrl(id) {
    const asset = this.assets.get(id)
    if (!asset) return null
    
    if (this.cdnUrl && asset.cdnPath) {
      return this.cdnUrl + asset.cdnPath
    }
    
    const path = asset.hash 
      ? this.addHash(asset.path, asset.hash)
      : asset.path
    
    return this.baseUrl + path
  }

  addHash(path, hash) {
    const lastDot = path.lastIndexOf('.')
    if (lastDot === -1) return path + '.' + hash
    
    const name = path.substring(0, lastDot)
    const ext = path.substring(lastDot)
    return `${name}.${hash.substring(0, this.hashLength)}${ext}`
  }

  inferType(path) {
    const ext = path.split('.').pop().toLowerCase()
    
    const typeMap = {
      glb: 'model',
      gltf: 'model',
      fbx: 'model',
      obj: 'model',
      png: 'texture',
      jpg: 'texture',
      jpeg: 'texture',
      webp: 'texture',
      ktx2: 'texture',
      basis: 'texture',
      mp3: 'audio',
      ogg: 'audio',
      wav: 'audio',
      mp4: 'video',
      webm: 'video',
      json: 'data',
      bin: 'binary',
      wasm: 'binary'
    }
    
    return typeMap[ext] ?? 'unknown'
  }

  getByCategory(category) {
    const ids = this.categories.get(category) ?? []
    return ids.map(id => this.assets.get(id))
  }

  getByTag(tag) {
    const ids = this.tags.get(tag) ?? []
    return ids.map(id => this.assets.get(id))
  }

  getPreloadAssets() {
    return Array.from(this.assets.values())
      .filter(a => a.preload)
      .sort((a, b) => b.priority - a.priority)
  }

  getByType(type) {
    return Array.from(this.assets.values())
      .filter(a => a.type === type)
  }

  getAll() {
    return Array.from(this.assets.values())
  }

  getCategories() {
    return Array.from(this.categories.keys())
  }

  getTags() {
    return Array.from(this.tags.keys())
  }

  getTotalSize() {
    let total = 0
    for (const asset of this.assets.values()) {
      total += asset.size ?? 0
    }
    return total
  }

  has(id) {
    return this.assets.has(id)
  }

  remove(id) {
    const asset = this.assets.get(id)
    if (!asset) return false
    
    const categoryAssets = this.categories.get(asset.category)
    if (categoryAssets) {
      const index = categoryAssets.indexOf(id)
      if (index !== -1) categoryAssets.splice(index, 1)
    }
    
    for (const tag of asset.tags) {
      const tagAssets = this.tags.get(tag)
      if (tagAssets) {
        const index = tagAssets.indexOf(id)
        if (index !== -1) tagAssets.splice(index, 1)
      }
    }
    
    return this.assets.delete(id)
  }

  toJSON() {
    return {
      version: this.version,
      baseUrl: this.baseUrl,
      cdnUrl: this.cdnUrl,
      assets: Object.fromEntries(this.assets)
    }
  }

  fromJSON(data) {
    this.version = data.version ?? this.version
    this.baseUrl = data.baseUrl ?? this.baseUrl
    this.cdnUrl = data.cdnUrl ?? this.cdnUrl
    
    if (data.assets) {
      for (const [id, config] of Object.entries(data.assets)) {
        this.register(id, config)
      }
    }
    
    return this
  }
}
