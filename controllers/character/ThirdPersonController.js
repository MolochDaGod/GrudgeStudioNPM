import * as THREE from 'three'
import { CharacterController } from './CharacterController.js'

export class ThirdPersonController extends CharacterController {
  constructor(object, camera, options = {}) {
    super(object, options)
    
    this.camera = camera
    this.cameraDistance = options.cameraDistance ?? 5
    this.cameraHeight = options.cameraHeight ?? 2
    this.cameraMinDistance = options.cameraMinDistance ?? 1
    this.cameraMaxDistance = options.cameraMaxDistance ?? 20
    this.cameraSmoothTime = options.cameraSmoothTime ?? 0.1
    this.cameraLookAtHeight = options.cameraLookAtHeight ?? 1.5
    this.shoulderOffset = options.shoulderOffset ?? 0.5
    
    this.sensitivity = options.sensitivity ?? 0.002
    this.minPitch = options.minPitch ?? -Math.PI / 4
    this.maxPitch = options.maxPitch ?? Math.PI / 3
    
    this.yaw = 0
    this.pitch = 0.3
    this.currentDistance = this.cameraDistance
    this.cameraVelocity = new THREE.Vector3()
    this.currentCameraPosition = camera.position.clone()
    
    this.cameraCollision = options.cameraCollision ?? true
    this.cameraCollisionRadius = options.cameraCollisionRadius ?? 0.3
    this.cameraColliders = []
    
    this.lockOnTarget = null
    this.lockOnSpeed = options.lockOnSpeed ?? 5
    
    this.raycaster = new THREE.Raycaster()
  }

  look(deltaX, deltaY) {
    this.yaw -= deltaX * this.sensitivity
    this.pitch += deltaY * this.sensitivity
    this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch)
    
    const forward = new THREE.Vector3(
      Math.sin(this.yaw),
      0,
      Math.cos(this.yaw)
    )
    this.setForward(forward)
    
    return this
  }

  zoom(delta) {
    this.cameraDistance += delta
    this.cameraDistance = THREE.MathUtils.clamp(
      this.cameraDistance,
      this.cameraMinDistance,
      this.cameraMaxDistance
    )
    return this
  }

  setCameraColliders(colliders) {
    this.cameraColliders = colliders
    return this
  }

  lockOn(target) {
    this.lockOnTarget = target
    return this
  }

  unlockTarget() {
    this.lockOnTarget = null
    return this
  }

  checkCameraCollision(origin, direction, maxDistance) {
    if (!this.cameraCollision || this.cameraColliders.length === 0) {
      return maxDistance
    }
    
    this.raycaster.set(origin, direction)
    this.raycaster.far = maxDistance + this.cameraCollisionRadius
    
    const intersects = this.raycaster.intersectObjects(this.cameraColliders, true)
    
    if (intersects.length > 0) {
      return Math.max(
        this.cameraMinDistance,
        intersects[0].distance - this.cameraCollisionRadius
      )
    }
    
    return maxDistance
  }

  updateCamera(deltaTime) {
    const targetPosition = this.object.position.clone()
    targetPosition.y += this.cameraLookAtHeight
    
    if (this.lockOnTarget) {
      const lockPosition = new THREE.Vector3()
      if (this.lockOnTarget.getWorldPosition) {
        this.lockOnTarget.getWorldPosition(lockPosition)
      } else {
        lockPosition.copy(this.lockOnTarget.position || this.lockOnTarget)
      }
      
      const dirToTarget = lockPosition.clone().sub(targetPosition)
      dirToTarget.y = 0
      const targetYaw = Math.atan2(dirToTarget.x, dirToTarget.z)
      
      const diff = ((targetYaw - this.yaw + Math.PI) % (Math.PI * 2)) - Math.PI
      this.yaw += diff * Math.min(1, this.lockOnSpeed * deltaTime)
    }
    
    const idealOffset = new THREE.Vector3(
      this.shoulderOffset,
      this.cameraHeight - this.cameraLookAtHeight,
      this.cameraDistance
    )
    
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ')
    idealOffset.applyEuler(euler)
    
    const direction = idealOffset.clone().normalize()
    const safeDistance = this.checkCameraCollision(targetPosition, direction, this.cameraDistance)
    
    this.currentDistance += (safeDistance - this.currentDistance) * (1 - Math.exp(-10 * deltaTime))
    
    const scaledOffset = direction.multiplyScalar(this.currentDistance)
    const desiredPosition = targetPosition.clone().add(scaledOffset)
    
    this.smoothDampVector(
      this.currentCameraPosition,
      desiredPosition,
      this.cameraVelocity,
      this.cameraSmoothTime,
      50,
      deltaTime
    )
    
    this.camera.position.copy(this.currentCameraPosition)
    this.camera.lookAt(targetPosition)
  }

  smoothDampVector(current, target, velocity, smoothTime, maxSpeed, deltaTime) {
    smoothTime = Math.max(0.0001, smoothTime)
    const omega = 2 / smoothTime
    const x = omega * deltaTime
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
    
    const changeX = current.x - target.x
    const changeY = current.y - target.y
    const changeZ = current.z - target.z
    
    const maxChange = maxSpeed * smoothTime
    const sqrLen = changeX * changeX + changeY * changeY + changeZ * changeZ
    
    let clampedX = changeX, clampedY = changeY, clampedZ = changeZ
    if (sqrLen > maxChange * maxChange) {
      const len = Math.sqrt(sqrLen)
      clampedX = changeX / len * maxChange
      clampedY = changeY / len * maxChange
      clampedZ = changeZ / len * maxChange
    }
    
    const tempX = (velocity.x + omega * clampedX) * deltaTime
    const tempY = (velocity.y + omega * clampedY) * deltaTime
    const tempZ = (velocity.z + omega * clampedZ) * deltaTime
    
    velocity.x = (velocity.x - omega * tempX) * exp
    velocity.y = (velocity.y - omega * tempY) * exp
    velocity.z = (velocity.z - omega * tempZ) * exp
    
    current.x = target.x + (clampedX + tempX) * exp
    current.y = target.y + (clampedY + tempY) * exp
    current.z = target.z + (clampedZ + tempZ) * exp
  }

  update(deltaTime) {
    super.update(deltaTime)
    this.updateCamera(deltaTime)
    return this
  }

  teleport(position, yaw = null) {
    super.teleport(position)
    
    if (yaw !== null) {
      this.yaw = yaw
    }
    
    const targetPosition = position.clone()
    targetPosition.y += this.cameraLookAtHeight
    
    const idealOffset = new THREE.Vector3(
      this.shoulderOffset,
      this.cameraHeight - this.cameraLookAtHeight,
      this.cameraDistance
    )
    
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ')
    idealOffset.applyEuler(euler)
    
    this.currentCameraPosition.copy(targetPosition).add(idealOffset)
    this.camera.position.copy(this.currentCameraPosition)
    this.camera.lookAt(targetPosition)
    this.cameraVelocity.set(0, 0, 0)
    this.currentDistance = this.cameraDistance
    
    return this
  }
}
