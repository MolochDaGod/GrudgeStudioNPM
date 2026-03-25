import * as THREE from 'three'
import terrainVertexShader from '../shaders/terrain.vert.glsl'
import terrainFragmentShader from '../shaders/terrain.frag.glsl'

export class ProceduralTerrain {
  constructor(options = {}) {
    this.width = options.width || 100
    this.depth = options.depth || 100
    this.segments = options.segments || 128
    
    this.uniforms = {
      uTime: { value: 0 },
      uScale: { value: options.scale || 1.0 },
      uHeight: { value: options.height || 2.0 },
      uFrequency: { value: options.frequency || 0.5 }
    }
    
    this.createTerrain()
  }
  
  createTerrain() {
    const geometry = new THREE.PlaneGeometry(
      this.width,
      this.depth,
      this.segments,
      this.segments
    )
    geometry.rotateX(-Math.PI / 2)
    
    const material = new THREE.ShaderMaterial({
      vertexShader: terrainVertexShader,
      fragmentShader: terrainFragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide
    })
    
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.receiveShadow = true
  }
  
  update(deltaTime, timeSpeed = 1) {
    this.uniforms.uTime.value += deltaTime * timeSpeed
  }
  
  setScale(scale) {
    this.uniforms.uScale.value = scale
  }
  
  setHeight(height) {
    this.uniforms.uHeight.value = height
  }
  
  setFrequency(frequency) {
    this.uniforms.uFrequency.value = frequency
  }
  
  getMesh() {
    return this.mesh
  }
  
  dispose() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
  }
}
