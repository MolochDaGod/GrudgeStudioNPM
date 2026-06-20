import * as THREE from 'three'

export class ParticleSystem {
  constructor(options = {}) {
    this.maxParticles = options.maxParticles ?? 1000
    this.texture = options.texture ?? null
    this.blending = options.blending ?? THREE.AdditiveBlending
    this.transparent = options.transparent ?? true
    this.depthWrite = options.depthWrite ?? false
    this.size = options.size ?? 1
    this.sizeAttenuation = options.sizeAttenuation ?? true
    
    this.particles = []
    this.freeIndices = []
    
    for (let i = this.maxParticles - 1; i >= 0; i--) {
      this.freeIndices.push(i)
    }
    
    this.geometry = null
    this.material = null
    this.points = null
    
    this.positions = new Float32Array(this.maxParticles * 3)
    this.colors = new Float32Array(this.maxParticles * 4)
    this.sizes = new Float32Array(this.maxParticles)
    
    this.init()
  }

  init() {
    this.geometry = new THREE.BufferGeometry()
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 4))
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1))
    
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.texture },
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec4 color;
        varying vec4 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec4 vColor;
        void main() {
          vec4 texColor = texture2D(uTexture, gl_PointCoord);
          if (texColor.a < 0.1) discard;
          gl_FragColor = vColor * texColor;
        }
      `,
      transparent: this.transparent,
      blending: this.blending,
      depthWrite: this.depthWrite
    })
    
    if (!this.texture) {
      this.material.fragmentShader = `
        varying vec4 vColor;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);
        }
      `
    }
    
    this.points = new THREE.Points(this.geometry, this.material)
    this.points.frustumCulled = false
  }

  emit(position, velocity, options = {}) {
    if (this.freeIndices.length === 0) return null
    
    const index = this.freeIndices.pop()
    
    const particle = {
      index,
      position: position.clone(),
      velocity: velocity.clone(),
      acceleration: options.acceleration ? options.acceleration.clone() : new THREE.Vector3(),
      color: options.color ? new THREE.Color(options.color) : new THREE.Color(1, 1, 1),
      alpha: options.alpha ?? 1,
      size: options.size ?? this.size,
      life: options.life ?? 1,
      maxLife: options.life ?? 1,
      drag: options.drag ?? 0,
      gravity: options.gravity ?? 0,
      fadeIn: options.fadeIn ?? 0,
      fadeOut: options.fadeOut ?? 0.5,
      shrink: options.shrink ?? true,
      colorEnd: options.colorEnd ? new THREE.Color(options.colorEnd) : null,
      sizeEnd: options.sizeEnd ?? null
    }
    
    this.particles.push(particle)
    this.updateParticle(particle)
    
    return particle
  }

  updateParticle(particle) {
    const i = particle.index
    const i3 = i * 3
    const i4 = i * 4
    
    this.positions[i3] = particle.position.x
    this.positions[i3 + 1] = particle.position.y
    this.positions[i3 + 2] = particle.position.z
    
    const lifeRatio = particle.life / particle.maxLife
    let alpha = particle.alpha
    
    if (lifeRatio > 1 - particle.fadeIn) {
      alpha *= (1 - lifeRatio) / particle.fadeIn
    } else if (lifeRatio < particle.fadeOut) {
      alpha *= lifeRatio / particle.fadeOut
    }
    
    let color = particle.color
    if (particle.colorEnd) {
      color = particle.color.clone().lerp(particle.colorEnd, 1 - lifeRatio)
    }
    
    this.colors[i4] = color.r
    this.colors[i4 + 1] = color.g
    this.colors[i4 + 2] = color.b
    this.colors[i4 + 3] = alpha
    
    let size = particle.size
    if (particle.sizeEnd !== null) {
      size = particle.size + (particle.sizeEnd - particle.size) * (1 - lifeRatio)
    } else if (particle.shrink) {
      size = particle.size * lifeRatio
    }
    this.sizes[i] = size
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      
      particle.velocity.y -= particle.gravity * deltaTime
      particle.velocity.multiplyScalar(1 - particle.drag * deltaTime)
      particle.velocity.add(particle.acceleration.clone().multiplyScalar(deltaTime))
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime))
      
      particle.life -= deltaTime
      
      if (particle.life <= 0) {
        this.sizes[particle.index] = 0
        this.freeIndices.push(particle.index)
        this.particles.splice(i, 1)
      } else {
        this.updateParticle(particle)
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    
    this.material.uniforms.uTime.value += deltaTime
  }

  clear() {
    for (const particle of this.particles) {
      this.sizes[particle.index] = 0
      this.freeIndices.push(particle.index)
    }
    this.particles = []
    this.geometry.attributes.size.needsUpdate = true
  }

  getObject3D() {
    return this.points
  }

  getParticleCount() {
    return this.particles.length
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
    if (this.texture) this.texture.dispose()
  }
}
