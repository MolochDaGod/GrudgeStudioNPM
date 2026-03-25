import { EventEmitter } from '../core/EventEmitter.js'

export class AssetLoader {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || '/models'
        this.cloudBucket = options.cloudBucket || null
        this.events = new EventEmitter()
        this.loadingAssets = new Map()
        this.cache = new Map()
        this.useWorker = options.useWorker && typeof Worker !== 'undefined' && typeof Blob !== 'undefined'
        this.worker = null
        this.pendingRequests = new Map()
        this.requestId = 0
        this.workerInitialized = false

        if (this.useWorker) {
            try {
                this.initWorker()
                this.workerInitialized = true
            } catch (error) {
                console.warn('Worker initialization failed, falling back to direct fetch:', error)
                this.useWorker = false
            }
        }
    }

    initWorker() {
        const workerCode = `
            self.onmessage = async function(e) {
                const { id, url, type } = e.data;
                
                try {
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status);
                    }
                    
                    let data;
                    if (type === 'json') {
                        data = await response.json();
                    } else if (type === 'arraybuffer') {
                        data = await response.arrayBuffer();
                    } else if (type === 'blob') {
                        data = await response.blob();
                    } else {
                        data = await response.text();
                    }
                    
                    self.postMessage({ id, success: true, data });
                } catch (error) {
                    self.postMessage({ id, success: false, error: error.message });
                }
            };
        `

        const blob = new Blob([workerCode], { type: 'application/javascript' })
        this.worker = new Worker(URL.createObjectURL(blob))
        
        this.worker.onmessage = (e) => {
            const { id, success, data, error } = e.data
            const pending = this.pendingRequests.get(id)
            
            if (pending) {
                if (success) {
                    pending.resolve(data)
                } else {
                    pending.reject(new Error(error))
                }
                this.pendingRequests.delete(id)
            }
        }
    }

    async fetchViaWorker(url, type = 'arraybuffer') {
        if (!this.worker) {
            throw new Error('Worker not initialized')
        }

        const id = ++this.requestId
        
        return new Promise((resolve, reject) => {
            this.pendingRequests.set(id, { resolve, reject })
            this.worker.postMessage({ id, url, type })
        })
    }

    getAssetUrl(assetPath) {
        if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
            return assetPath
        }
        
        if (this.cloudBucket) {
            return `${this.cloudBucket}/${assetPath}`
        }
        
        return `${this.baseUrl}/${assetPath}`
    }

    async fetchAsset(assetPath, options = {}) {
        const url = this.getAssetUrl(assetPath)
        const cacheKey = options.cacheKey || url

        if (this.cache.has(cacheKey) && !options.noCache) {
            return this.cache.get(cacheKey)
        }

        if (this.loadingAssets.has(cacheKey)) {
            return this.loadingAssets.get(cacheKey)
        }

        const loadPromise = this._performFetch(url, options)
        this.loadingAssets.set(cacheKey, loadPromise)

        try {
            const result = await loadPromise
            this.cache.set(cacheKey, result)
            return result
        } finally {
            this.loadingAssets.delete(cacheKey)
        }
    }

    async _performFetch(url, options = {}) {
        this.events.emit('fetchStart', { url })

        try {
            let data

            if (this.useWorker && options.useWorker !== false) {
                data = await this.fetchViaWorker(url, options.responseType || 'arraybuffer')
            } else {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: options.headers || {},
                    signal: options.signal
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                const responseType = options.responseType || 'arraybuffer'
                
                if (responseType === 'json') {
                    data = await response.json()
                } else if (responseType === 'arraybuffer') {
                    data = await response.arrayBuffer()
                } else if (responseType === 'blob') {
                    data = await response.blob()
                } else {
                    data = await response.text()
                }
            }

            this.events.emit('fetchComplete', { url, size: data.byteLength || data.length || 0 })
            return data
        } catch (error) {
            this.events.emit('fetchError', { url, error })
            throw error
        }
    }

    async fetchManifest(manifestPath = 'characters/manifest.json') {
        const data = await this.fetchAsset(manifestPath, { responseType: 'json' })
        return data
    }

    async fetchCharacterConfig(characterId) {
        const path = `characters/${characterId}/config.json`
        const data = await this.fetchAsset(path, { responseType: 'json' })
        return data
    }

    async fetchModel(modelPath) {
        const data = await this.fetchAsset(modelPath, { responseType: 'arraybuffer' })
        return data
    }

    async fetchTexture(texturePath) {
        const data = await this.fetchAsset(texturePath, { responseType: 'blob' })
        const url = URL.createObjectURL(data)
        return url
    }

    async batchFetch(assetPaths, onProgress) {
        const total = assetPaths.length
        let completed = 0
        const results = new Map()

        const promises = assetPaths.map(async (path) => {
            try {
                const data = await this.fetchAsset(path)
                results.set(path, { success: true, data })
            } catch (error) {
                results.set(path, { success: false, error })
            }
            
            completed++
            if (onProgress) {
                onProgress(completed / total, path, results.get(path))
            }
        })

        await Promise.all(promises)
        return results
    }

    clearCache() {
        this.cache.clear()
    }

    dispose() {
        if (this.worker) {
            this.worker.terminate()
            this.worker = null
        }
        this.cache.clear()
        this.loadingAssets.clear()
        this.pendingRequests.clear()
    }
}

export const assetLoader = new AssetLoader({
    baseUrl: '/models',
    useWorker: true
})
