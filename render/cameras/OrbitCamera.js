import * as THREE from 'three'

export class OrbitCamera {
  constructor(camera, options = {}) {
    this.camera = camera
    this.target = new THREE.Vector3()
    this.distance = options.distance ?? 10
    this.minDistance = options.minDistance ?? 1
    this.maxDistance = options.maxDistance ?? 100
    this.theta = options.theta ?? 0
    this.phi = options.phi ?? Math.PI / 4
    this.minPhi = options.minPhi ?? 0.1
    this.maxPhi = options.maxPhi ?? Math.PI - 0.1
    this.rotateSpeed = options.rotateSpeed ?? 0.01
    this.zoomSpeed = options.zoomSpeed ?? 0.1
    this.panSpeed = options.panSpeed ?? 0.01
    this.damping = options.damping ?? 0.1
    this.enabled = true
    this.enableRotate = true
    this.enableZoom = true
    this.enablePan = true
    
    this.currentDistance = this.distance
    this.currentTheta = this.theta
    this.currentPhi = this.phi
    this.currentTarget = this.target.clone()
    
    this.updateCamera()
  }

  setTarget(x, y, z) {
    if (typeof x === 'object') {
      this.target.copy(x)
    } else {
      this.target.set(x, y, z)
    }
    return this
  }

  setDistance(distance) {
    this.distance = THREE.MathUtils.clamp(distance, this.minDistance, this.maxDistance)
    return this
  }

  rotate(deltaTheta, deltaPhi) {
    if (!this.enableRotate) return this
    this.theta += deltaTheta * this.rotateSpeed
    this.phi += deltaPhi * this.rotateSpeed
    this.phi = THREE.MathUtils.clamp(this.phi, this.minPhi, this.maxPhi)
    return this
  }

  zoom(delta) {
    if (!this.enableZoom) return this
    this.distance *= 1 + delta * this.zoomSpeed
    this.distance = THREE.MathUtils.clamp(this.distance, this.minDistance, this.maxDistance)
    return this
  }

  pan(deltaX, deltaY) {
    if (!this.enablePan) return this
    const offset = new THREE.Vector3()
    
    offset.setFromSpherical(new THREE.Spherical(
      this.currentDistance,
      this.currentPhi,
      this.currentTheta
    ))
    
    const right = new THREE.Vector3()
    right.crossVectors(this.camera.up, offset).normalize()
    
    const up = new THREE.Vector3()
    up.crossVectors(offset, right).normalize()
    
    this.target.addScaledVector(right, -deltaX * this.panSpeed * this.currentDistance)
    this.target.addScaledVector(up, deltaY * this.panSpeed * this.currentDistance)
    
    return this
  }

  update(deltaTime = 1/60) {
    if (!this.enabled) return this
    
    this.currentTheta += (this.theta - this.currentTheta) * this.damping
    this.currentPhi += (this.phi - this.currentPhi) * this.damping
    this.currentDistance += (this.distance - this.currentDistance) * this.damping
    this.currentTarget.lerp(this.target, this.damping)
    
    this.updateCamera()
    
    return this
  }

  updateCamera() {
    const x = this.currentTarget.x + this.currentDistance * Math.sin(this.currentPhi) * Math.sin(this.currentTheta)
    const y = this.currentTarget.y + this.currentDistance * Math.cos(this.currentPhi)
    const z = this.currentTarget.z + this.currentDistance * Math.sin(this.currentPhi) * Math.cos(this.currentTheta)
    
    this.camera.position.set(x, y, z)
    this.camera.lookAt(this.currentTarget)
  }

  reset() {
    this.currentTheta = this.theta
    this.currentPhi = this.phi
    this.currentDistance = this.distance
    this.currentTarget.copy(this.target)
    this.updateCamera()
    return this
  }
}
