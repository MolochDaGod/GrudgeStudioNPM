import * as THREE from 'three'

export class ParticleEmitter {
  constructor(particleSystem, options = {}) {
    this.system = particleSystem
    this.position = options.position ? new THREE.Vector3().copy(options.position) : new THREE.Vector3()
    this.direction = options.direction ? new THREE.Vector3().copy(options.direction).normalize() : new THREE.Vector3(0, 1, 0)
    
    this.rate = options.rate ?? 10
    this.burst = options.burst ?? 0
    this.spread = options.spread ?? Math.PI / 6
    this.speedMin = options.speedMin ?? 1
    this.speedMax = options.speedMax ?? 3
    this.lifeMin = options.lifeMin ?? 1
    this.lifeMax = options.lifeMax ?? 2
    this.sizeMin = options.sizeMin ?? 0.5
    this.sizeMax = options.sizeMax ?? 1.5
    
    this.color = options.color ?? 0xffffff
    this.colorEnd = options.colorEnd ?? null
    this.alpha = options.alpha ?? 1
    this.gravity = options.gravity ?? 0
    this.drag = options.drag ?? 0
    
    this.enabled = true
    this.emitTimer = 0
    this.duration = options.duration ?? -1
    this.elapsed = 0
    
    this.shape = options.shape ?? 'point'
    this.shapeRadius = options.shapeRadius ?? 1
    this.shapeSize = options.shapeSize ?? new THREE.Vector3(1, 1, 1)
    
    this.onEmit = options.onEmit ?? null
  }

  setPosition(x, y, z) {
    if (typeof x === 'object') {
      this.position.copy(x)
    } else {
      this.position.set(x, y, z)
    }
    return this
  }

  setDirection(x, y, z) {
    if (typeof x === 'object') {
      this.direction.copy(x).normalize()
    } else {
      this.direction.set(x, y, z).normalize()
    }
    return this
  }

  getSpawnPosition() {
    const pos = this.position.clone()
    
    switch (this.shape) {
      case 'sphere':
        const phi = Math.random() * Math.PI * 2
        const theta = Math.acos(2 * Math.random() - 1)
        const r = Math.cbrt(Math.random()) * this.shapeRadius
        pos.x += r * Math.sin(theta) * Math.cos(phi)
        pos.y += r * Math.sin(theta) * Math.sin(phi)
        pos.z += r * Math.cos(theta)
        break
        
      case 'box':
        pos.x += (Math.random() - 0.5) * this.shapeSize.x
        pos.y += (Math.random() - 0.5) * this.shapeSize.y
        pos.z += (Math.random() - 0.5) * this.shapeSize.z
        break
        
      case 'circle':
        const angle = Math.random() * Math.PI * 2
        const radius = Math.sqrt(Math.random()) * this.shapeRadius
        pos.x += Math.cos(angle) * radius
        pos.z += Math.sin(angle) * radius
        break
        
      case 'cone':
        const coneAngle = Math.random() * Math.PI * 2
        const coneR = Math.random() * this.shapeRadius
        pos.x += Math.cos(coneAngle) * coneR
        pos.z += Math.sin(coneAngle) * coneR
        break
        
      case 'point':
      default:
        break
    }
    
    return pos
  }

  getVelocity() {
    const speed = this.speedMin + Math.random() * (this.speedMax - this.speedMin)
    
    const velocity = this.direction.clone()
    
    const spreadX = (Math.random() - 0.5) * 2 * this.spread
    const spreadY = (Math.random() - 0.5) * 2 * this.spread
    
    const axis1 = new THREE.Vector3(1, 0, 0)
    if (Math.abs(this.direction.x) > 0.9) {
      axis1.set(0, 1, 0)
    }
    const axis2 = new THREE.Vector3().crossVectors(this.direction, axis1).normalize()
    axis1.crossVectors(axis2, this.direction).normalize()
    
    velocity.applyAxisAngle(axis1, spreadX)
    velocity.applyAxisAngle(axis2, spreadY)
    
    velocity.multiplyScalar(speed)
    
    return velocity
  }

  emitOne() {
    const position = this.getSpawnPosition()
    const velocity = this.getVelocity()
    
    const options = {
      life: this.lifeMin + Math.random() * (this.lifeMax - this.lifeMin),
      size: this.sizeMin + Math.random() * (this.sizeMax - this.sizeMin),
      color: this.color,
      colorEnd: this.colorEnd,
      alpha: this.alpha,
      gravity: this.gravity,
      drag: this.drag
    }
    
    if (this.onEmit) {
      this.onEmit(position, velocity, options)
    }
    
    return this.system.emit(position, velocity, options)
  }

  emitBurst(count) {
    for (let i = 0; i < count; i++) {
      this.emitOne()
    }
    return this
  }

  update(deltaTime) {
    if (!this.enabled) return this
    
    if (this.duration > 0) {
      this.elapsed += deltaTime
      if (this.elapsed >= this.duration) {
        this.enabled = false
        return this
      }
    }
    
    if (this.rate > 0) {
      this.emitTimer += deltaTime
      const interval = 1 / this.rate
      
      while (this.emitTimer >= interval) {
        this.emitOne()
        this.emitTimer -= interval
      }
    }
    
    return this
  }

  reset() {
    this.elapsed = 0
    this.emitTimer = 0
    this.enabled = true
    return this
  }

  stop() {
    this.enabled = false
    return this
  }

  start() {
    this.enabled = true
    return this
  }
}
