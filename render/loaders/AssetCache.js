export class AssetCache {
  constructor(maxSize = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.accessOrder = []
  }

  has(key) {
    return this.cache.has(key)
  }

  get(key) {
    if (this.cache.has(key)) {
      this.updateAccessOrder(key)
      return this.cache.get(key).asset
    }
    return null
  }

  set(key, asset, metadata = {}) {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      asset,
      metadata,
      loadedAt: Date.now(),
      accessCount: 0
    })
    this.accessOrder.push(key)
    return this
  }

  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
      this.accessOrder.push(key)
    }
    
    const entry = this.cache.get(key)
    if (entry) {
      entry.accessCount++
    }
  }

  evictLRU() {
    if (this.accessOrder.length === 0) return

    const lruKey = this.accessOrder.shift()
    const entry = this.cache.get(lruKey)
    
    if (entry?.asset?.dispose) {
      entry.asset.dispose()
    }
    
    this.cache.delete(lruKey)
  }

  remove(key) {
    const entry = this.cache.get(key)
    if (entry) {
      if (entry.asset?.dispose) {
        entry.asset.dispose()
      }
      this.cache.delete(key)
      
      const index = this.accessOrder.indexOf(key)
      if (index > -1) {
        this.accessOrder.splice(index, 1)
      }
    }
    return this
  }

  clear() {
    for (const [, entry] of this.cache) {
      if (entry.asset?.dispose) {
        entry.asset.dispose()
      }
    }
    this.cache.clear()
    this.accessOrder = []
    return this
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
      totalAccessCount: Array.from(this.cache.values()).reduce((sum, e) => sum + e.accessCount, 0)
    }
  }

  getMetadata(key) {
    return this.cache.get(key)?.metadata
  }

  setMaxSize(size) {
    this.maxSize = size
    while (this.cache.size > this.maxSize) {
      this.evictLRU()
    }
    return this
  }

  forEach(callback) {
    for (const [key, entry] of this.cache) {
      callback(key, entry.asset, entry.metadata)
    }
  }

  filter(predicate) {
    const result = []
    for (const [key, entry] of this.cache) {
      if (predicate(key, entry.asset, entry.metadata)) {
        result.push({ key, asset: entry.asset, metadata: entry.metadata })
      }
    }
    return result
  }
}
