export class AssetPipeline {
  constructor(options = {}) {
    this.processors = new Map()
    this.transforms = new Map()
    this.validators = new Map()
    
    this.setupDefaultProcessors()
  }

  setupDefaultProcessors() {
    this.registerProcessor('model', {
      extensions: ['glb', 'gltf'],
      process: async (asset, options) => {
        return {
          ...asset,
          optimized: options.optimize ?? false,
          compressed: options.compress ?? false
        }
      }
    })
    
    this.registerProcessor('texture', {
      extensions: ['png', 'jpg', 'jpeg', 'webp'],
      process: async (asset, options) => {
        const transforms = []
        
        if (options.resize) {
          transforms.push(`resize:${options.resize.width}x${options.resize.height}`)
        }
        
        if (options.format) {
          transforms.push(`format:${options.format}`)
        }
        
        if (options.quality) {
          transforms.push(`quality:${options.quality}`)
        }
        
        return {
          ...asset,
          transforms,
          mipMaps: options.generateMipMaps ?? true
        }
      }
    })
    
    this.registerProcessor('audio', {
      extensions: ['mp3', 'ogg', 'wav'],
      process: async (asset, options) => {
        return {
          ...asset,
          format: options.format ?? 'mp3',
          bitrate: options.bitrate ?? 128,
          channels: options.channels ?? 2
        }
      }
    })
  }

  registerProcessor(type, config) {
    this.processors.set(type, {
      extensions: config.extensions ?? [],
      process: config.process,
      validate: config.validate ?? (() => true)
    })
    return this
  }

  registerTransform(name, transform) {
    this.transforms.set(name, transform)
    return this
  }

  registerValidator(type, validator) {
    this.validators.set(type, validator)
    return this
  }

  async process(asset, options = {}) {
    const processor = this.processors.get(asset.type)
    
    if (!processor) {
      return asset
    }
    
    if (processor.validate && !processor.validate(asset)) {
      throw new Error(`Asset validation failed: ${asset.id}`)
    }
    
    const processed = await processor.process(asset, options)
    
    if (options.transforms) {
      for (const transformName of options.transforms) {
        const transform = this.transforms.get(transformName)
        if (transform) {
          await transform(processed)
        }
      }
    }
    
    return processed
  }

  async processAll(assets, options = {}) {
    const results = []
    
    for (const asset of assets) {
      const assetOptions = {
        ...options,
        ...options.overrides?.[asset.id]
      }
      
      results.push(await this.process(asset, assetOptions))
    }
    
    return results
  }

  getProcessorForExtension(extension) {
    for (const [type, processor] of this.processors) {
      if (processor.extensions.includes(extension.toLowerCase())) {
        return { type, processor }
      }
    }
    return null
  }

  getSupportedExtensions() {
    const extensions = []
    for (const processor of this.processors.values()) {
      extensions.push(...processor.extensions)
    }
    return [...new Set(extensions)]
  }

  buildManifest(assets, options = {}) {
    const manifest = {
      version: options.version ?? '1.0.0',
      generated: new Date().toISOString(),
      assets: {}
    }
    
    for (const asset of assets) {
      const hash = options.generateHash?.(asset) ?? null
      
      manifest.assets[asset.id] = {
        path: asset.path,
        type: asset.type,
        size: asset.size,
        hash,
        category: asset.category,
        tags: asset.tags,
        metadata: asset.metadata
      }
    }
    
    return manifest
  }

  static generateHash(content, length = 8) {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(length, '0').substring(0, length)
  }
}
