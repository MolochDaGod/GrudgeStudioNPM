import * as THREE from 'three'

export class FirstPersonCamera {
  constructor(camera, options = {}) {
    this.camera = camera
    this.target = null
    this.eyeHeight = options.eyeHeight ?? 1.7
    this.sensitivity = options.sensitivity ?? 0.002
    this.minPitch = options.minPitch ?? -Math.PI / 2 + 0.1
    this.maxPitch = options.maxPitch ?? Math.PI / 2 - 0.1
    this.headBob = options.headBob ?? false
    this.headBobFrequency = options.headBobFrequency ?? 8
    this.headBobAmplitude = options.headBobAmplitude ?? 0.05
    this.enabled = true
    
    this.yaw = 0
    this.pitch = 0
    this.bobPhase = 0
    this.bobOffset = new THREE.Vector3()
    
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ')
    this.quaternion = new THREE.Quaternion()
  }

  setTarget(target) {
    this.target = target
    return this
  }

  rotate(deltaX, deltaY) {
    this.yaw -= deltaX * this.sensitivity
    this.pitch -= deltaY * this.sensitivity
    this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch)
    return this
  }

  setRotation(yaw, pitch) {
    this.yaw = yaw
    this.pitch = THREE.MathUtils.clamp(pitch, this.minPitch, this.maxPitch)
    return this
  }

  getForward() {
    const forward = new THREE.Vector3(0, 0, -1)
    this.euler.set(this.pitch, this.yaw, 0, 'YXZ')
    forward.applyEuler(this.euler)
    return forward
  }

  getRight() {
    const right = new THREE.Vector3(1, 0, 0)
    this.euler.set(0, this.yaw, 0, 'YXZ')
    right.applyEuler(this.euler)
    return right
  }

  update(deltaTime, isMoving = false, speed = 0) {
    if (!this.enabled || !this.target) return this
    
    const targetPosition = new THREE.Vector3()
    if (this.target.getWorldPosition) {
      this.target.getWorldPosition(targetPosition)
    } else if (this.target.position) {
      targetPosition.copy(this.target.position)
    } else {
      targetPosition.copy(this.target)
    }
    
    if (this.headBob && isMoving) {
      this.bobPhase += deltaTime * this.headBobFrequency * speed
      this.bobOffset.y = Math.sin(this.bobPhase) * this.headBobAmplitude
      this.bobOffset.x = Math.cos(this.bobPhase * 0.5) * this.headBobAmplitude * 0.5
    } else {
      this.bobOffset.lerp(new THREE.Vector3(), 0.1)
    }
    
    this.camera.position.copy(targetPosition)
    this.camera.position.y += this.eyeHeight
    this.camera.position.add(this.bobOffset)
    
    this.euler.set(this.pitch, this.yaw, 0, 'YXZ')
    this.camera.quaternion.setFromEuler(this.euler)
    
    return this
  }

  teleport() {
    if (!this.target) return this
    
    const targetPosition = new THREE.Vector3()
    if (this.target.getWorldPosition) {
      this.target.getWorldPosition(targetPosition)
    } else if (this.target.position) {
      targetPosition.copy(this.target.position)
    } else {
      targetPosition.copy(this.target)
    }
    
    this.camera.position.copy(targetPosition)
    this.camera.position.y += this.eyeHeight
    this.bobOffset.set(0, 0, 0)
    this.bobPhase = 0
    
    return this
  }

  getYaw() {
    return this.yaw
  }

  getPitch() {
    return this.pitch
  }
}
