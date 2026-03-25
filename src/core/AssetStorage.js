/*
    GRUDGE Studio - Asset Storage Manager
    Centralized asset management with caching and organization
*/

export class AssetStorage {
    constructor() {
        this.assets = new Map()
        this.categories = new Map()
        this.loadingPromises = new Map()
        this.cache = new Map()
        this.maxCacheSize = 100 * 1024 * 1024
        this.currentCacheSize = 0
        
        this.initCategories()
    }
    
    initCategories() {
        const defaultCategories = [
            { id: 'models', name: 'Models', extensions: ['.glb', '.gltf', '.fbx', '.obj'] },
            { id: 'textures', name: 'Textures', extensions: ['.png', '.jpg', '.jpeg', '.webp', '.hdr'] },
            { id: 'audio', name: 'Audio', extensions: ['.mp3', '.wav', '.ogg', '.m4a'] },
            { id: 'scripts', name: 'Scripts', extensions: ['.lua', '.js', '.ts'] },
            { id: 'scenes', name: 'Scenes', extensions: ['.json', '.scene'] },
            { id: 'prefabs', name: 'Prefabs', extensions: ['.prefab', '.json'] },
            { id: 'animations', name: 'Animations', extensions: ['.anim', '.json'] },
            { id: 'materials', name: 'Materials', extensions: ['.mat', '.json'] },
            { id: 'shaders', name: 'Shaders', extensions: ['.glsl', '.vert', '.frag'] },
            { id: 'fonts', name: 'Fonts', extensions: ['.ttf', '.otf', '.woff', '.woff2'] },
            { id: 'data', name: 'Data', extensions: ['.json', '.xml', '.csv'] }
        ]
        
        defaultCategories.forEach(cat => {
            this.categories.set(cat.id, {
                ...cat,
                assets: new Set()
            })
        })
    }
    
    getCategoryForFile(filename) {
        const ext = '.' + filename.split('.').pop().toLowerCase()
        
        for (const [id, category] of this.categories) {
            if (category.extensions.includes(ext)) {
                return id
            }
        }
        
        return 'data'
    }
    
    register(id, metadata) {
        const asset = {
            id,
            name: metadata.name || id.split('/').pop(),
            path: metadata.path || id,
            type: metadata.type || this.getCategoryForFile(id),
            size: metadata.size || 0,
            loaded: false,
            data: null,
            metadata: metadata,
            createdAt: Date.now(),
            lastAccessed: Date.now()
        }
        
        this.assets.set(id, asset)
        
        const category = this.categories.get(asset.type)
        if (category) {
            category.assets.add(id)
        }
        
        return asset
    }
    
    async load(id) {
        if (this.loadingPromises.has(id)) {
            return this.loadingPromises.get(id)
        }
        
        const asset = this.assets.get(id)
        if (!asset) {
            throw new Error(`Asset not registered: ${id}`)
        }
        
        if (asset.loaded && asset.data) {
            asset.lastAccessed = Date.now()
            return asset.data
        }
        
        if (this.cache.has(id)) {
            asset.data = this.cache.get(id)
            asset.loaded = true
            asset.lastAccessed = Date.now()
            return asset.data
        }
        
        const loadPromise = this._loadAsset(asset)
        this.loadingPromises.set(id, loadPromise)
        
        try {
            const data = await loadPromise
            asset.data = data
            asset.loaded = true
            asset.lastAccessed = Date.now()
            
            this._addToCache(id, data, asset.size)
            
            return data
        } finally {
            this.loadingPromises.delete(id)
        }
    }
    
    async _loadAsset(asset) {
        const path = asset.path
        const type = asset.type
        
        switch (type) {
            case 'models':
                return this._loadModel(path)
            case 'textures':
                return this._loadTexture(path)
            case 'audio':
                return this._loadAudio(path)
            case 'scripts':
                return this._loadScript(path)
            case 'scenes':
            case 'prefabs':
            case 'data':
                return this._loadJSON(path)
            default:
                return this._loadRaw(path)
        }
    }
    
    async _loadModel(path) {
        const response = await fetch(path)
        return await response.arrayBuffer()
    }
    
    async _loadTexture(path) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = path
        })
    }
    
    async _loadAudio(path) {
        const response = await fetch(path)
        return await response.arrayBuffer()
    }
    
    async _loadScript(path) {
        const response = await fetch(path)
        return await response.text()
    }
    
    async _loadJSON(path) {
        const response = await fetch(path)
        return await response.json()
    }
    
    async _loadRaw(path) {
        const response = await fetch(path)
        return await response.blob()
    }
    
    _addToCache(id, data, size) {
        while (this.currentCacheSize + size > this.maxCacheSize && this.cache.size > 0) {
            const oldestId = this._findLRUAsset()
            if (oldestId) {
                this._removeFromCache(oldestId)
            }
        }
        
        this.cache.set(id, data)
        this.currentCacheSize += size
    }
    
    _removeFromCache(id) {
        if (this.cache.has(id)) {
            const asset = this.assets.get(id)
            this.currentCacheSize -= asset?.size || 0
            this.cache.delete(id)
        }
    }
    
    _findLRUAsset() {
        let oldest = null
        let oldestTime = Infinity
        
        for (const id of this.cache.keys()) {
            const asset = this.assets.get(id)
            if (asset && asset.lastAccessed < oldestTime) {
                oldest = id
                oldestTime = asset.lastAccessed
            }
        }
        
        return oldest
    }
    
    unload(id) {
        const asset = this.assets.get(id)
        if (asset) {
            asset.data = null
            asset.loaded = false
            this._removeFromCache(id)
        }
    }
    
    remove(id) {
        const asset = this.assets.get(id)
        if (asset) {
            const category = this.categories.get(asset.type)
            if (category) {
                category.assets.delete(id)
            }
            this._removeFromCache(id)
            this.assets.delete(id)
        }
    }
    
    get(id) {
        return this.assets.get(id)
    }
    
    getByCategory(categoryId) {
        const category = this.categories.get(categoryId)
        if (!category) return []
        
        return Array.from(category.assets).map(id => this.assets.get(id))
    }
    
    getAll() {
        return Array.from(this.assets.values())
    }
    
    getCategories() {
        return Array.from(this.categories.entries()).map(([id, cat]) => ({
            id,
            name: cat.name,
            count: cat.assets.size
        }))
    }
    
    search(query, options = {}) {
        const results = []
        const lowerQuery = query.toLowerCase()
        
        for (const asset of this.assets.values()) {
            if (options.category && asset.type !== options.category) continue
            
            if (asset.name.toLowerCase().includes(lowerQuery) ||
                asset.path.toLowerCase().includes(lowerQuery)) {
                results.push(asset)
            }
        }
        
        return results
    }
    
    async scanDirectory(basePath = '/public') {
        console.log(`Scanning directory: ${basePath}`)
    }
    
    getStats() {
        return {
            totalAssets: this.assets.size,
            loadedAssets: Array.from(this.assets.values()).filter(a => a.loaded).length,
            cacheSize: this.currentCacheSize,
            maxCacheSize: this.maxCacheSize,
            categoryCounts: this.getCategories()
        }
    }
    
    serialize() {
        const data = {
            assets: [],
            version: '1.0'
        }
        
        for (const asset of this.assets.values()) {
            data.assets.push({
                id: asset.id,
                name: asset.name,
                path: asset.path,
                type: asset.type,
                size: asset.size,
                metadata: asset.metadata
            })
        }
        
        return data
    }
    
    deserialize(data) {
        if (!data || !data.assets) return
        
        for (const assetData of data.assets) {
            this.register(assetData.id, {
                name: assetData.name,
                path: assetData.path,
                type: assetData.type,
                size: assetData.size,
                ...assetData.metadata
            })
        }
    }
    
    clear() {
        this.assets.clear()
        this.cache.clear()
        this.loadingPromises.clear()
        this.currentCacheSize = 0
        
        for (const category of this.categories.values()) {
            category.assets.clear()
        }
    }
}

export const assetStorage = new AssetStorage()
export default AssetStorage
