import * as THREE from 'three'

export class ThirdPersonCamera {
  constructor(camera, options = {}) {
    this.camera = camera
    this.target = null
    this.distance = options.distance ?? 5
    this.minDistance = options.minDistance ?? 1
    this.maxDistance = options.maxDistance ?? 20
    this.height = options.height ?? 2
    this.shoulderOffset = options.shoulderOffset ?? 0.5
    this.sensitivity = options.sensitivity ?? 0.002
    this.minPitch = options.minPitch ?? -Math.PI / 4
    this.maxPitch = options.maxPitch ?? Math.PI / 3
    this.smoothTime = options.smoothTime ?? 0.1
    this.collisionLayers = options.collisionLayers ?? []
    this.collisionRadius = options.collisionRadius ?? 0.3
    this.enabled = true
    
    this.yaw = 0
    this.pitch = 0
    this.currentDistance = this.distance
    this.velocity = new THREE.Vector3()
    this.currentPosition = camera.position.clone()
    
    this.raycaster = new THREE.Raycaster()
  }

  setTarget(target) {
    this.target = target
    return this
  }

  rotate(deltaX, deltaY) {
    this.yaw -= deltaX * this.sensitivity
    this.pitch += deltaY * this.sensitivity
    this.pitch = THREE.MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch)
    return this
  }

  zoom(delta) {
    this.distance += delta
    this.distance = THREE.MathUtils.clamp(this.distance, this.minDistance, this.maxDistance)
    return this
  }

  checkCollision(origin, direction, maxDistance) {
    if (this.collisionLayers.length === 0) {
      return maxDistance
    }
    
    this.raycaster.set(origin, direction)
    this.raycaster.far = maxDistance + this.collisionRadius
    
    const intersects = this.raycaster.intersectObjects(this.collisionLayers, true)
    
    if (intersects.length > 0) {
      return Math.max(this.minDistance, intersects[0].distance - this.collisionRadius)
    }
    
    return maxDistance
  }

  update(deltaTime) {
    if (!this.enabled || !this.target) return this
    
    const targetPosition = new THREE.Vector3()
    if (this.target.getWorldPosition) {
      this.target.getWorldPosition(targetPosition)
    } else if (this.target.position) {
      targetPosition.copy(this.target.position)
    } else {
      targetPosition.copy(this.target)
    }
    
    targetPosition.y += this.height
    
    const idealOffset = new THREE.Vector3(
      this.shoulderOffset,
      0,
      this.distance
    )
    
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ')
    idealOffset.applyEuler(euler)
    
    const direction = idealOffset.clone().normalize()
    const safeDistance = this.checkCollision(targetPosition, direction, this.distance)
    
    this.currentDistance += (safeDistance - this.currentDistance) * (1 - Math.exp(-10 * deltaTime))
    
    const scaledOffset = direction.multiplyScalar(this.currentDistance)
    scaledOffset.x += this.shoulderOffset
    
    const desiredPosition = targetPosition.clone().add(scaledOffset)
    
    this.currentPosition.lerp(desiredPosition, 1 - Math.exp(-1 / this.smoothTime * deltaTime))
    this.camera.position.copy(this.currentPosition)
    
    const lookAtPosition = targetPosition.clone()
    lookAtPosition.y += this.height * 0.5
    this.camera.lookAt(lookAtPosition)
    
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
    
    targetPosition.y += this.height
    
    const idealOffset = new THREE.Vector3(
      this.shoulderOffset,
      0,
      this.distance
    )
    
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ')
    idealOffset.applyEuler(euler)
    
    this.currentPosition.copy(targetPosition).add(idealOffset)
    this.camera.position.copy(this.currentPosition)
    
    const lookAtPosition = targetPosition.clone()
    lookAtPosition.y += this.height * 0.5
    this.camera.lookAt(lookAtPosition)
    
    this.currentDistance = this.distance
    this.velocity.set(0, 0, 0)
    
    return this
  }

  setCollisionLayers(layers) {
    this.collisionLayers = layers
    return this
  }

  getYaw() {
    return this.yaw
  }

  getPitch() {
    return this.pitch
  }
}
