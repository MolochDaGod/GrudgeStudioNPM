import * as THREE from 'three'

export class CharacterController {
  constructor(object, options = {}) {
    this.object = object
    this.enabled = true
    
    this.moveSpeed = options.moveSpeed ?? 5
    this.runSpeed = options.runSpeed ?? 10
    this.jumpForce = options.jumpForce ?? 8
    this.gravity = options.gravity ?? 20
    this.groundDrag = options.groundDrag ?? 10
    this.airDrag = options.airDrag ?? 2
    this.acceleration = options.acceleration ?? 30
    this.turnSpeed = options.turnSpeed ?? 10
    this.maxSlope = options.maxSlope ?? 45
    this.stepHeight = options.stepHeight ?? 0.3
    
    this.height = options.height ?? 2
    this.radius = options.radius ?? 0.5
    
    this.velocity = new THREE.Vector3()
    this.moveDirection = new THREE.Vector3()
    this.forward = new THREE.Vector3(0, 0, -1)
    
    this.isGrounded = false
    this.isJumping = false
    this.isRunning = false
    this.isCrouching = false
    this.groundNormal = new THREE.Vector3(0, 1, 0)
    
    this.jumpBufferTime = options.jumpBufferTime ?? 0.1
    this.coyoteTime = options.coyoteTime ?? 0.15
    this.jumpBufferTimer = 0
    this.coyoteTimer = 0
    this.wasGrounded = false
    
    this.colliders = options.colliders ?? []
    this.groundCheckDistance = 0.1
    
    this.onLand = null
    this.onJump = null
    this.onMove = null
    
    this.raycaster = new THREE.Raycaster()
  }

  setColliders(colliders) {
    this.colliders = colliders
    return this
  }

  checkGround() {
    if (this.colliders.length === 0) {
      this.isGrounded = this.object.position.y <= 0.1
      this.groundNormal.set(0, 1, 0)
      return this.isGrounded
    }
    
    const origin = this.object.position.clone()
    origin.y += this.stepHeight
    
    this.raycaster.set(origin, new THREE.Vector3(0, -1, 0))
    this.raycaster.far = this.stepHeight + this.groundCheckDistance
    
    const intersects = this.raycaster.intersectObjects(this.colliders, true)
    
    if (intersects.length > 0) {
      const hit = intersects[0]
      this.groundNormal.copy(hit.face.normal)
      
      const slopeAngle = this.groundNormal.angleTo(new THREE.Vector3(0, 1, 0)) * (180 / Math.PI)
      
      if (slopeAngle <= this.maxSlope) {
        this.isGrounded = true
        this.object.position.y = hit.point.y
        return true
      }
    }
    
    this.isGrounded = false
    return false
  }

  setMoveDirection(x, z) {
    this.moveDirection.set(x, 0, z)
    if (this.moveDirection.length() > 1) {
      this.moveDirection.normalize()
    }
    return this
  }

  setForward(forward) {
    this.forward.copy(forward)
    this.forward.y = 0
    this.forward.normalize()
    return this
  }

  jump() {
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.velocity.y = this.jumpForce
      this.isJumping = true
      this.isGrounded = false
      this.coyoteTimer = 0
      
      if (this.onJump) {
        this.onJump()
      }
    } else {
      this.jumpBufferTimer = this.jumpBufferTime
    }
    return this
  }

  setRunning(running) {
    this.isRunning = running
    return this
  }

  setCrouching(crouching) {
    this.isCrouching = crouching
    return this
  }

  update(deltaTime) {
    if (!this.enabled) return this
    
    this.wasGrounded = this.isGrounded
    this.checkGround()
    
    if (this.wasGrounded && !this.isGrounded) {
      this.coyoteTimer = this.coyoteTime
    }
    if (this.coyoteTimer > 0) {
      this.coyoteTimer -= deltaTime
    }
    
    if (this.isGrounded && this.jumpBufferTimer > 0) {
      this.jump()
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= deltaTime
    }
    
    if (!this.wasGrounded && this.isGrounded && this.isJumping) {
      this.isJumping = false
      if (this.onLand) {
        this.onLand()
      }
    }
    
    const targetSpeed = this.isRunning ? this.runSpeed : this.moveSpeed
    const drag = this.isGrounded ? this.groundDrag : this.airDrag
    
    if (this.moveDirection.lengthSq() > 0) {
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), this.forward).normalize()
      const moveDir = new THREE.Vector3()
      moveDir.addScaledVector(this.forward, -this.moveDirection.z)
      moveDir.addScaledVector(right, this.moveDirection.x)
      
      if (this.isGrounded) {
        const slopeDir = moveDir.clone()
        slopeDir.y = 0
        const tangent = new THREE.Vector3().crossVectors(this.groundNormal, slopeDir).normalize()
        moveDir.crossVectors(tangent, this.groundNormal).normalize()
      }
      
      this.velocity.x += moveDir.x * this.acceleration * deltaTime
      this.velocity.z += moveDir.z * this.acceleration * deltaTime
      
      const horizontalVel = new THREE.Vector3(this.velocity.x, 0, this.velocity.z)
      if (horizontalVel.length() > targetSpeed) {
        horizontalVel.normalize().multiplyScalar(targetSpeed)
        this.velocity.x = horizontalVel.x
        this.velocity.z = horizontalVel.z
      }
      
      if (this.turnSpeed > 0 && moveDir.lengthSq() > 0) {
        const targetRotation = Math.atan2(moveDir.x, moveDir.z)
        const currentRotation = this.object.rotation.y
        const diff = ((targetRotation - currentRotation + Math.PI) % (Math.PI * 2)) - Math.PI
        this.object.rotation.y += diff * Math.min(1, this.turnSpeed * deltaTime)
      }
      
      if (this.onMove) {
        this.onMove(this.velocity)
      }
    } else {
      this.velocity.x -= this.velocity.x * drag * deltaTime
      this.velocity.z -= this.velocity.z * drag * deltaTime
    }
    
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * deltaTime
    } else {
      if (this.velocity.y < 0) {
        this.velocity.y = 0
      }
    }
    
    this.object.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    
    if (this.object.position.y < 0) {
      this.object.position.y = 0
      this.velocity.y = 0
      this.isGrounded = true
    }
    
    return this
  }

  teleport(position) {
    this.object.position.copy(position)
    this.velocity.set(0, 0, 0)
    return this
  }

  getVelocity() {
    return this.velocity.clone()
  }

  getSpeed() {
    return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z)
  }

  getState() {
    return {
      isGrounded: this.isGrounded,
      isJumping: this.isJumping,
      isRunning: this.isRunning,
      isCrouching: this.isCrouching,
      isMoving: this.moveDirection.lengthSq() > 0,
      speed: this.getSpeed()
    }
  }
}
