import * as THREE from 'three'
import { CharacterController } from './CharacterController.js'

export class FirstPersonController extends CharacterController {
  constructor(object, camera, options = {}) {
    super(object, options)
    
    this.camera = camera
    this.sensitivity = options.sensitivity ?? 0.002
    this.minPitch = options.minPitch ?? -Math.PI / 2 + 0.1
    this.maxPitch = options.maxPitch ?? Math.PI / 2 - 0.1
    this.eyeHeight = options.eyeHeight ?? 1.7
    
    this.yaw = 0
    this.pitch = 0
    
    this.headBob = options.headBob ?? true
    this.headBobFrequency = options.headBobFrequency ?? 10
    this.headBobAmplitude = options.headBobAmplitude ?? 0.03
    this.bobPhase = 0
    
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ')
  }

  look(deltaX, deltaY) {
    this.yaw -= deltaX * this.sensitivity
    this.pitch -= deltaY * this.sensitivity
    this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch)
    
    this.euler.set(this.pitch, this.yaw, 0, 'YXZ')
    this.camera.quaternion.setFromEuler(this.euler)
    
    this.forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion)
    this.forward.y = 0
    this.forward.normalize()
    
    return this
  }

  setRotation(yaw, pitch) {
    this.yaw = yaw
    this.pitch = THREE.MathUtils.clamp(pitch, this.minPitch, this.maxPitch)
    
    this.euler.set(this.pitch, this.yaw, 0, 'YXZ')
    this.camera.quaternion.setFromEuler(this.euler)
    
    return this
  }

  update(deltaTime) {
    super.update(deltaTime)
    
    this.camera.position.copy(this.object.position)
    this.camera.position.y += this.eyeHeight
    
    if (this.headBob && this.isGrounded && this.moveDirection.lengthSq() > 0) {
      const speed = this.getSpeed()
      this.bobPhase += deltaTime * this.headBobFrequency * (speed / this.moveSpeed)
      this.camera.position.y += Math.sin(this.bobPhase) * this.headBobAmplitude
      this.camera.position.x += Math.cos(this.bobPhase * 0.5) * this.headBobAmplitude * 0.5
    } else {
      this.bobPhase = 0
    }
    
    return this
  }

  getForward() {
    const forward = new THREE.Vector3(0, 0, -1)
    forward.applyQuaternion(this.camera.quaternion)
    return forward
  }

  getRight() {
    const right = new THREE.Vector3(1, 0, 0)
    right.applyQuaternion(this.camera.quaternion)
    return right
  }

  teleport(position, yaw = null, pitch = null) {
    super.teleport(position)
    
    if (yaw !== null) this.yaw = yaw
    if (pitch !== null) this.pitch = THREE.MathUtils.clamp(pitch, this.minPitch, this.maxPitch)
    
    this.euler.set(this.pitch, this.yaw, 0, 'YXZ')
    this.camera.quaternion.setFromEuler(this.euler)
    
    return this
  }
}
