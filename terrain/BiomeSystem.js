import { SimplexNoise } from '../core/math/noise.js'

export class Biome {
  constructor(name, options = {}) {
    this.name = name
    this.minHeight = options.minHeight ?? 0
    this.maxHeight = options.maxHeight ?? 1
    this.minMoisture = options.minMoisture ?? 0
    this.maxMoisture = options.maxMoisture ?? 1
    this.minTemperature = options.minTemperature ?? 0
    this.maxTemperature = options.maxTemperature ?? 1
    
    this.colors = options.colors ?? {
      low: { r: 0.3, g: 0.5, b: 0.2 },
      mid: { r: 0.4, g: 0.6, b: 0.25 },
      high: { r: 0.35, g: 0.4, b: 0.3 }
    }
    
    this.vegetation = options.vegetation ?? []
    this.features = options.features ?? []
    this.groundTexture = options.groundTexture ?? null
    
    this.weight = 1
  }

  matches(height, moisture, temperature) {
    return (
      height >= this.minHeight && height <= this.maxHeight &&
      moisture >= this.minMoisture && moisture <= this.maxMoisture &&
      temperature >= this.minTemperature && temperature <= this.maxTemperature
    )
  }

  getColor(normalizedHeight) {
    const t = normalizedHeight
    
    if (t < 0.33) {
      const lt = t / 0.33
      return {
        r: this.colors.low.r * (1 - lt) + this.colors.mid.r * lt,
        g: this.colors.low.g * (1 - lt) + this.colors.mid.g * lt,
        b: this.colors.low.b * (1 - lt) + this.colors.mid.b * lt
      }
    } else {
      const lt = (t - 0.33) / 0.67
      return {
        r: this.colors.mid.r * (1 - lt) + this.colors.high.r * lt,
        g: this.colors.mid.g * (1 - lt) + this.colors.high.g * lt,
        b: this.colors.mid.b * (1 - lt) + this.colors.high.b * lt
      }
    }
  }
}

export class BiomeSystem {
  constructor(options = {}) {
    this.biomes = new Map()
    this.seed = options.seed ?? Math.random()
    
    this.moistureNoise = new SimplexNoise(this.seed)
    this.temperatureNoise = new SimplexNoise(this.seed + 1000)
    
    this.moistureScale = options.moistureScale ?? 0.005
    this.temperatureScale = options.temperatureScale ?? 0.003
    
    this.blendDistance = options.blendDistance ?? 0.1
    
    this.initDefaultBiomes()
  }

  initDefaultBiomes() {
    this.addBiome(new Biome('ocean', {
      minHeight: 0, maxHeight: 0.15,
      colors: {
        low: { r: 0.1, g: 0.2, b: 0.5 },
        mid: { r: 0.15, g: 0.3, b: 0.6 },
        high: { r: 0.2, g: 0.4, b: 0.65 }
      }
    }))
    
    this.addBiome(new Biome('beach', {
      minHeight: 0.15, maxHeight: 0.2,
      colors: {
        low: { r: 0.76, g: 0.7, b: 0.5 },
        mid: { r: 0.82, g: 0.76, b: 0.55 },
        high: { r: 0.85, g: 0.8, b: 0.6 }
      }
    }))
    
    this.addBiome(new Biome('grassland', {
      minHeight: 0.2, maxHeight: 0.5,
      minMoisture: 0.3, maxMoisture: 0.7,
      colors: {
        low: { r: 0.3, g: 0.55, b: 0.2 },
        mid: { r: 0.35, g: 0.6, b: 0.25 },
        high: { r: 0.4, g: 0.55, b: 0.3 }
      }
    }))
    
    this.addBiome(new Biome('forest', {
      minHeight: 0.2, maxHeight: 0.6,
      minMoisture: 0.5, maxMoisture: 1,
      colors: {
        low: { r: 0.15, g: 0.35, b: 0.1 },
        mid: { r: 0.2, g: 0.4, b: 0.15 },
        high: { r: 0.25, g: 0.45, b: 0.2 }
      }
    }))
    
    this.addBiome(new Biome('desert', {
      minHeight: 0.2, maxHeight: 0.5,
      minMoisture: 0, maxMoisture: 0.3,
      minTemperature: 0.6, maxTemperature: 1,
      colors: {
        low: { r: 0.85, g: 0.75, b: 0.5 },
        mid: { r: 0.9, g: 0.8, b: 0.55 },
        high: { r: 0.95, g: 0.85, b: 0.6 }
      }
    }))
    
    this.addBiome(new Biome('tundra', {
      minHeight: 0.2, maxHeight: 0.5,
      minMoisture: 0, maxMoisture: 0.4,
      minTemperature: 0, maxTemperature: 0.3,
      colors: {
        low: { r: 0.6, g: 0.65, b: 0.55 },
        mid: { r: 0.7, g: 0.75, b: 0.65 },
        high: { r: 0.8, g: 0.85, b: 0.75 }
      }
    }))
    
    this.addBiome(new Biome('mountain', {
      minHeight: 0.6, maxHeight: 0.85,
      colors: {
        low: { r: 0.4, g: 0.35, b: 0.3 },
        mid: { r: 0.5, g: 0.45, b: 0.4 },
        high: { r: 0.6, g: 0.55, b: 0.5 }
      }
    }))
    
    this.addBiome(new Biome('snow', {
      minHeight: 0.85, maxHeight: 1,
      colors: {
        low: { r: 0.9, g: 0.9, b: 0.95 },
        mid: { r: 0.95, g: 0.95, b: 1 },
        high: { r: 1, g: 1, b: 1 }
      }
    }))
  }

  addBiome(biome) {
    this.biomes.set(biome.name, biome)
    return this
  }

  removeBiome(name) {
    this.biomes.delete(name)
    return this
  }

  getBiome(name) {
    return this.biomes.get(name)
  }

  getMoisture(x, z) {
    return (this.moistureNoise.fbm2D(x * this.moistureScale, z * this.moistureScale, 4) + 1) / 2
  }

  getTemperature(x, z) {
    return (this.temperatureNoise.fbm2D(x * this.temperatureScale, z * this.temperatureScale, 3) + 1) / 2
  }

  getBiomeAt(x, z, height) {
    const moisture = this.getMoisture(x, z)
    const temperature = this.getTemperature(x, z)
    
    const matches = []
    
    for (const biome of this.biomes.values()) {
      if (biome.matches(height, moisture, temperature)) {
        matches.push(biome)
      }
    }
    
    if (matches.length === 0) {
      return this.biomes.get('grassland') || this.biomes.values().next().value
    }
    
    return matches[0]
  }

  getBlendedColor(x, z, height, normalizedLocalHeight = 0.5) {
    const biome = this.getBiomeAt(x, z, height)
    return biome.getColor(normalizedLocalHeight)
  }

  sampleBiomes(x, z, height, radius = 5) {
    const samples = []
    const step = radius / 2
    
    for (let dx = -radius; dx <= radius; dx += step) {
      for (let dz = -radius; dz <= radius; dz += step) {
        const biome = this.getBiomeAt(x + dx, z + dz, height)
        const dist = Math.sqrt(dx * dx + dz * dz)
        const weight = Math.max(0, 1 - dist / radius)
        samples.push({ biome, weight })
      }
    }
    
    const totalWeight = samples.reduce((sum, s) => sum + s.weight, 0)
    
    const result = { r: 0, g: 0, b: 0 }
    
    for (const sample of samples) {
      const color = sample.biome.getColor(0.5)
      const normalizedWeight = sample.weight / totalWeight
      result.r += color.r * normalizedWeight
      result.g += color.g * normalizedWeight
      result.b += color.b * normalizedWeight
    }
    
    return result
  }
}
