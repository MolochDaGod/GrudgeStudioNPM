import * as THREE from 'three'

export class FollowCamera {
  constructor(camera, options = {}) {
    this.camera = camera
    this.target = null
    this.offset = options.offset ? new THREE.Vector3().copy(options.offset) : new THREE.Vector3(0, 5, 10)
    this.lookAtOffset = options.lookAtOffset ? new THREE.Vector3().copy(options.lookAtOffset) : new THREE.Vector3(0, 1, 0)
    this.smoothTime = options.smoothTime ?? 0.3
    this.maxSpeed = options.maxSpeed ?? 50
    this.rotateWithTarget = options.rotateWithTarget ?? false
    this.enabled = true
    
    this.velocity = new THREE.Vector3()
    this.currentPosition = camera.position.clone()
    this.currentLookAt = new THREE.Vector3()
  }

  setTarget(target) {
    this.target = target
    return this
  }

  setOffset(x, y, z) {
    if (typeof x === 'object') {
      this.offset.copy(x)
    } else {
      this.offset.set(x, y, z)
    }
    return this
  }

  setLookAtOffset(x, y, z) {
    if (typeof x === 'object') {
      this.lookAtOffset.copy(x)
    } else {
      this.lookAtOffset.set(x, y, z)
    }
    return this
  }

  smoothDamp(current, target, velocity, smoothTime, maxSpeed, deltaTime) {
    smoothTime = Math.max(0.0001, smoothTime)
    const omega = 2 / smoothTime
    const x = omega * deltaTime
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x)
    
    let changeX = current.x - target.x
    let changeY = current.y - target.y
    let changeZ = current.z - target.z
    
    const maxChange = maxSpeed * smoothTime
    const sqrLen = changeX * changeX + changeY * changeY + changeZ * changeZ
    
    if (sqrLen > maxChange * maxChange) {
      const len = Math.sqrt(sqrLen)
      changeX = changeX / len * maxChange
      changeY = changeY / len * maxChange
      changeZ = changeZ / len * maxChange
    }
    
    const targetX = target.x
    const targetY = target.y
    const targetZ = target.z
    
    const tempX = (velocity.x + omega * changeX) * deltaTime
    const tempY = (velocity.y + omega * changeY) * deltaTime
    const tempZ = (velocity.z + omega * changeZ) * deltaTime
    
    velocity.x = (velocity.x - omega * tempX) * exp
    velocity.y = (velocity.y - omega * tempY) * exp
    velocity.z = (velocity.z - omega * tempZ) * exp
    
    current.x = targetX + (changeX + tempX) * exp
    current.y = targetY + (changeY + tempY) * exp
    current.z = targetZ + (changeZ + tempZ) * exp
    
    return current
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
    
    let desiredPosition
    
    if (this.rotateWithTarget && this.target.quaternion) {
      const rotatedOffset = this.offset.clone().applyQuaternion(this.target.quaternion)
      desiredPosition = targetPosition.clone().add(rotatedOffset)
    } else {
      desiredPosition = targetPosition.clone().add(this.offset)
    }
    
    this.smoothDamp(this.currentPosition, desiredPosition, this.velocity, this.smoothTime, this.maxSpeed, deltaTime)
    
    this.camera.position.copy(this.currentPosition)
    
    const lookAtPosition = targetPosition.clone().add(this.lookAtOffset)
    this.currentLookAt.lerp(lookAtPosition, 1 - Math.exp(-10 * deltaTime))
    this.camera.lookAt(this.currentLookAt)
    
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
    
    if (this.rotateWithTarget && this.target.quaternion) {
      const rotatedOffset = this.offset.clone().applyQuaternion(this.target.quaternion)
      this.currentPosition.copy(targetPosition).add(rotatedOffset)
    } else {
      this.currentPosition.copy(targetPosition).add(this.offset)
    }
    
    this.camera.position.copy(this.currentPosition)
    this.currentLookAt.copy(targetPosition).add(this.lookAtOffset)
    this.camera.lookAt(this.currentLookAt)
    this.velocity.set(0, 0, 0)
    
    return this
  }
}
