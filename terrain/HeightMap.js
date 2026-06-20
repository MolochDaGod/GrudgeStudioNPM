import { SimplexNoise } from '../core/math/noise.js'

export class HeightMap {
  constructor(width, height, options = {}) {
    this.width = width
    this.height = height
    this.data = new Float32Array(width * height)
    
    this.scale = options.scale ?? 1
    this.minHeight = options.minHeight ?? 0
    this.maxHeight = options.maxHeight ?? 10
    
    this.noise = new SimplexNoise(options.seed ?? Math.random())
  }

  generate(config = {}) {
    const octaves = config.octaves ?? 4
    const persistence = config.persistence ?? 0.5
    const lacunarity = config.lacunarity ?? 2
    const frequency = config.frequency ?? 0.01
    const redistribution = config.redistribution ?? 1
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let value = this.noise.fbm2D(
          x * frequency * this.scale,
          y * frequency * this.scale,
          octaves,
          lacunarity,
          persistence
        )
        
        value = (value + 1) / 2
        
        if (redistribution !== 1) {
          value = Math.pow(value, redistribution)
        }
        
        this.data[y * this.width + x] = value
      }
    }
    
    return this
  }

  applyModifier(modifier) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const index = y * this.width + x
        this.data[index] = modifier(this.data[index], x, y, this)
      }
    }
    return this
  }

  island(falloff = 0.5) {
    return this.applyModifier((value, x, y) => {
      const nx = (x / this.width) * 2 - 1
      const ny = (y / this.height) * 2 - 1
      const d = 1 - (1 - nx * nx) * (1 - ny * ny)
      return Math.max(0, value - d * falloff)
    })
  }

  terrace(levels = 5) {
    return this.applyModifier((value) => {
      return Math.round(value * levels) / levels
    })
  }

  smoothStep() {
    return this.applyModifier((value) => {
      return value * value * (3 - 2 * value)
    })
  }

  invert() {
    return this.applyModifier((value) => 1 - value)
  }

  clamp(min = 0, max = 1) {
    return this.applyModifier((value) => Math.max(min, Math.min(max, value)))
  }

  normalize() {
    let min = Infinity
    let max = -Infinity
    
    for (let i = 0; i < this.data.length; i++) {
      min = Math.min(min, this.data[i])
      max = Math.max(max, this.data[i])
    }
    
    const range = max - min
    if (range > 0) {
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] = (this.data[i] - min) / range
      }
    }
    
    return this
  }

  blur(radius = 1) {
    const newData = new Float32Array(this.data.length)
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let sum = 0
        let count = 0
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx
            const ny = y + dy
            
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
              sum += this.data[ny * this.width + nx]
              count++
            }
          }
        }
        
        newData[y * this.width + x] = sum / count
      }
    }
    
    this.data = newData
    return this
  }

  getHeight(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0
    }
    
    const value = this.data[Math.floor(y) * this.width + Math.floor(x)]
    return this.minHeight + value * (this.maxHeight - this.minHeight)
  }

  getHeightInterpolated(x, y) {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const x1 = Math.min(x0 + 1, this.width - 1)
    const y1 = Math.min(y0 + 1, this.height - 1)
    
    const fx = x - x0
    const fy = y - y0
    
    const h00 = this.getHeight(x0, y0)
    const h10 = this.getHeight(x1, y0)
    const h01 = this.getHeight(x0, y1)
    const h11 = this.getHeight(x1, y1)
    
    const h0 = h00 * (1 - fx) + h10 * fx
    const h1 = h01 * (1 - fx) + h11 * fx
    
    return h0 * (1 - fy) + h1 * fy
  }

  getNormal(x, y, scale = 1) {
    const h = this.getHeightInterpolated(x, y)
    const hL = this.getHeightInterpolated(x - 1, y)
    const hR = this.getHeightInterpolated(x + 1, y)
    const hD = this.getHeightInterpolated(x, y - 1)
    const hU = this.getHeightInterpolated(x, y + 1)
    
    const dx = (hR - hL) / (2 * scale)
    const dy = (hU - hD) / (2 * scale)
    
    const len = Math.sqrt(dx * dx + 1 + dy * dy)
    
    return {
      x: -dx / len,
      y: 1 / len,
      z: -dy / len
    }
  }

  getSteepness(x, y) {
    const normal = this.getNormal(x, y)
    return Math.acos(normal.y)
  }

  combine(other, operation = 'add', weight = 0.5) {
    if (other.width !== this.width || other.height !== this.height) {
      throw new Error('HeightMaps must have same dimensions')
    }
    
    return this.applyModifier((value, x, y) => {
      const otherValue = other.data[y * other.width + x]
      
      switch (operation) {
        case 'add':
          return value + otherValue * weight
        case 'subtract':
          return value - otherValue * weight
        case 'multiply':
          return value * otherValue
        case 'max':
          return Math.max(value, otherValue)
        case 'min':
          return Math.min(value, otherValue)
        case 'blend':
          return value * (1 - weight) + otherValue * weight
        default:
          return value
      }
    })
  }

  toImageData() {
    const imageData = new ImageData(this.width, this.height)
    
    for (let i = 0; i < this.data.length; i++) {
      const value = Math.floor(this.data[i] * 255)
      const idx = i * 4
      imageData.data[idx] = value
      imageData.data[idx + 1] = value
      imageData.data[idx + 2] = value
      imageData.data[idx + 3] = 255
    }
    
    return imageData
  }
}
