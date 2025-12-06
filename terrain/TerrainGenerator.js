import * as THREE from 'three'
import { HeightMap } from './HeightMap.js'

export class TerrainGenerator {
  constructor(options = {}) {
    this.width = options.width ?? 100
    this.depth = options.depth ?? 100
    this.resolution = options.resolution ?? 128
    this.maxHeight = options.maxHeight ?? 20
    this.seed = options.seed ?? Math.random()
    
    this.heightMap = null
    this.geometry = null
    this.material = null
    this.mesh = null
  }

  generateHeightMap(config = {}) {
    this.heightMap = new HeightMap(this.resolution, this.resolution, {
      seed: this.seed,
      maxHeight: this.maxHeight,
      ...config
    })
    
    this.heightMap.generate({
      octaves: config.octaves ?? 6,
      persistence: config.persistence ?? 0.5,
      lacunarity: config.lacunarity ?? 2,
      frequency: config.frequency ?? 0.02,
      redistribution: config.redistribution ?? 1.2
    })
    
    if (config.island) {
      this.heightMap.island(config.islandFalloff ?? 0.4)
    }
    
    if (config.terraces) {
      this.heightMap.terrace(config.terraceCount ?? 8)
    }
    
    if (config.smooth) {
      this.heightMap.blur(config.smoothRadius ?? 1)
    }
    
    return this
  }

  generateGeometry() {
    if (!this.heightMap) {
      this.generateHeightMap()
    }
    
    const segmentsX = this.resolution - 1
    const segmentsZ = this.resolution - 1
    
    this.geometry = new THREE.PlaneGeometry(
      this.width,
      this.depth,
      segmentsX,
      segmentsZ
    )
    
    this.geometry.rotateX(-Math.PI / 2)
    
    const positions = this.geometry.attributes.position.array
    const uvs = this.geometry.attributes.uv.array
    
    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3]
      const z = positions[i * 3 + 2]
      
      const mapX = ((x / this.width) + 0.5) * (this.resolution - 1)
      const mapZ = ((z / this.depth) + 0.5) * (this.resolution - 1)
      
      positions[i * 3 + 1] = this.heightMap.getHeightInterpolated(mapX, mapZ)
    }
    
    this.geometry.computeVertexNormals()
    this.geometry.attributes.position.needsUpdate = true
    
    this.generateVertexColors()
    
    return this
  }

  generateVertexColors() {
    const positions = this.geometry.attributes.position.array
    const colors = new Float32Array(positions.length)
    
    for (let i = 0; i < positions.length / 3; i++) {
      const y = positions[i * 3 + 1]
      const normalizedHeight = y / this.maxHeight
      
      const mapX = ((positions[i * 3] / this.width) + 0.5) * (this.resolution - 1)
      const mapZ = ((positions[i * 3 + 2] / this.depth) + 0.5) * (this.resolution - 1)
      const steepness = this.heightMap.getSteepness(mapX, mapZ)
      
      let color
      if (normalizedHeight < 0.1) {
        color = { r: 0.8, g: 0.75, b: 0.55 }
      } else if (normalizedHeight < 0.3) {
        color = { r: 0.35, g: 0.55, b: 0.25 }
      } else if (normalizedHeight < 0.6) {
        color = { r: 0.25, g: 0.4, b: 0.2 }
      } else if (normalizedHeight < 0.8) {
        color = { r: 0.45, g: 0.4, b: 0.35 }
      } else {
        color = { r: 0.95, g: 0.95, b: 0.95 }
      }
      
      if (steepness > 0.8) {
        const rockBlend = (steepness - 0.8) / 0.2
        color.r = color.r * (1 - rockBlend) + 0.4 * rockBlend
        color.g = color.g * (1 - rockBlend) + 0.35 * rockBlend
        color.b = color.b * (1 - rockBlend) + 0.3 * rockBlend
      }
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }

  createMaterial(options = {}) {
    if (options.shader) {
      this.material = this.createShaderMaterial(options)
    } else {
      this.material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: options.flatShading ?? false,
        roughness: options.roughness ?? 0.8,
        metalness: options.metalness ?? 0.1,
        side: THREE.DoubleSide
      })
      
      if (options.wireframe) {
        this.material.wireframe = true
      }
    }
    
    return this
  }

  createShaderMaterial(options = {}) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMaxHeight: { value: this.maxHeight },
        uGrassColor: { value: new THREE.Color(options.grassColor ?? 0x4a7c2b) },
        uRockColor: { value: new THREE.Color(options.rockColor ?? 0x6b5d4d) },
        uSnowColor: { value: new THREE.Color(options.snowColor ?? 0xffffff) },
        uSandColor: { value: new THREE.Color(options.sandColor ?? 0xc2b280) },
        uSnowHeight: { value: options.snowHeight ?? 0.75 },
        uRockSteepness: { value: options.rockSteepness ?? 0.6 }
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uMaxHeight;
        uniform vec3 uGrassColor;
        uniform vec3 uRockColor;
        uniform vec3 uSnowColor;
        uniform vec3 uSandColor;
        uniform float uSnowHeight;
        uniform float uRockSteepness;
        
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          float height = vPosition.y / uMaxHeight;
          float steepness = 1.0 - vNormal.y;
          
          vec3 color;
          
          if (height < 0.1) {
            color = uSandColor;
          } else if (height < uSnowHeight) {
            color = mix(uGrassColor, uRockColor, smoothstep(0.3, 0.6, height));
          } else {
            color = uSnowColor;
          }
          
          color = mix(color, uRockColor, smoothstep(uRockSteepness, 1.0, steepness));
          
          float light = max(0.3, dot(vNormal, normalize(vec3(1.0, 1.0, 0.5))));
          color *= light;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide
    })
  }

  build() {
    if (!this.geometry) {
      this.generateGeometry()
    }
    
    if (!this.material) {
      this.createMaterial()
    }
    
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    
    return this.mesh
  }

  getHeightAt(x, z) {
    if (!this.heightMap) return 0
    
    const mapX = ((x / this.width) + 0.5) * (this.resolution - 1)
    const mapZ = ((z / this.depth) + 0.5) * (this.resolution - 1)
    
    return this.heightMap.getHeightInterpolated(mapX, mapZ)
  }

  getNormalAt(x, z) {
    if (!this.heightMap) return { x: 0, y: 1, z: 0 }
    
    const mapX = ((x / this.width) + 0.5) * (this.resolution - 1)
    const mapZ = ((z / this.depth) + 0.5) * (this.resolution - 1)
    
    return this.heightMap.getNormal(mapX, mapZ, this.width / this.resolution)
  }

  update(time) {
    if (this.material && this.material.uniforms?.uTime) {
      this.material.uniforms.uTime.value = time
    }
  }

  dispose() {
    if (this.geometry) this.geometry.dispose()
    if (this.material) this.material.dispose()
  }
}
