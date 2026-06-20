import * as THREE from 'three'
import { CharacterController } from './CharacterController.js'

export class PlatformerController extends CharacterController {
  constructor(object, options = {}) {
    super(object, options)
    
    this.doubleJumpEnabled = options.doubleJumpEnabled ?? true
    this.maxJumps = options.maxJumps ?? 2
    this.jumpCount = 0
    
    this.wallJumpEnabled = options.wallJumpEnabled ?? true
    this.wallSlideSpeed = options.wallSlideSpeed ?? 2
    this.wallJumpForce = options.wallJumpForce ?? new THREE.Vector3(8, 10, 0)
    this.wallCheckDistance = options.wallCheckDistance ?? 0.6
    
    this.dashEnabled = options.dashEnabled ?? true
    this.dashSpeed = options.dashSpeed ?? 20
    this.dashDuration = options.dashDuration ?? 0.2
    this.dashCooldown = options.dashCooldown ?? 0.5
    this.dashTimer = 0
    this.dashCooldownTimer = 0
    this.isDashing = false
    this.dashDirection = new THREE.Vector3()
    
    this.isTouchingWall = false
    this.wallNormal = new THREE.Vector3()
    this.isWallSliding = false
    
    this.onDoubleJump = null
    this.onWallJump = null
    this.onDash = null
    this.onWallSlide = null
    
    this.raycasterLeft = new THREE.Raycaster()
    this.raycasterRight = new THREE.Raycaster()
  }

  checkWalls() {
    if (!this.wallJumpEnabled || this.colliders.length === 0) {
      this.isTouchingWall = false
      return
    }
    
    const origin = this.object.position.clone()
    origin.y += this.height / 2
    
    const right = new THREE.Vector3(1, 0, 0)
    const left = new THREE.Vector3(-1, 0, 0)
    
    this.raycasterLeft.set(origin, left)
    this.raycasterLeft.far = this.wallCheckDistance
    
    this.raycasterRight.set(origin, right)
    this.raycasterRight.far = this.wallCheckDistance
    
    const leftHits = this.raycasterLeft.intersectObjects(this.colliders, true)
    const rightHits = this.raycasterRight.intersectObjects(this.colliders, true)
    
    if (leftHits.length > 0) {
      this.isTouchingWall = true
      this.wallNormal.set(1, 0, 0)
    } else if (rightHits.length > 0) {
      this.isTouchingWall = true
      this.wallNormal.set(-1, 0, 0)
    } else {
      this.isTouchingWall = false
    }
  }

  jump() {
    if (this.isDashing) return this
    
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.velocity.y = this.jumpForce
      this.isJumping = true
      this.isGrounded = false
      this.jumpCount = 1
      this.coyoteTimer = 0
      
      if (this.onJump) this.onJump()
      return this
    }
    
    if (this.wallJumpEnabled && this.isTouchingWall && !this.isGrounded) {
      this.velocity.x = this.wallNormal.x * this.wallJumpForce.x
      this.velocity.y = this.wallJumpForce.y
      this.isWallSliding = false
      this.jumpCount = 1
      
      if (this.onWallJump) this.onWallJump(this.wallNormal)
      return this
    }
    
    if (this.doubleJumpEnabled && this.jumpCount < this.maxJumps && !this.isGrounded) {
      this.velocity.y = this.jumpForce * 0.9
      this.jumpCount++
      
      if (this.onDoubleJump) this.onDoubleJump(this.jumpCount)
      return this
    }
    
    this.jumpBufferTimer = this.jumpBufferTime
    return this
  }

  dash() {
    if (!this.dashEnabled || this.dashCooldownTimer > 0 || this.isDashing) {
      return this
    }
    
    this.isDashing = true
    this.dashTimer = this.dashDuration
    
    if (this.moveDirection.lengthSq() > 0) {
      this.dashDirection.copy(this.moveDirection).normalize()
    } else {
      this.dashDirection.set(0, 0, -1)
      this.dashDirection.applyQuaternion(this.object.quaternion)
    }
    
    this.dashDirection.y = 0
    this.dashDirection.normalize()
    
    if (this.onDash) this.onDash(this.dashDirection)
    
    return this
  }

  update(deltaTime) {
    if (!this.enabled) return this
    
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= deltaTime
    }
    
    if (this.isDashing) {
      this.dashTimer -= deltaTime
      
      if (this.dashTimer <= 0) {
        this.isDashing = false
        this.dashCooldownTimer = this.dashCooldown
      } else {
        this.velocity.x = this.dashDirection.x * this.dashSpeed
        this.velocity.z = this.dashDirection.z * this.dashSpeed
        this.velocity.y = 0
        
        this.object.position.add(this.velocity.clone().multiplyScalar(deltaTime))
        return this
      }
    }
    
    this.wasGrounded = this.isGrounded
    this.checkGround()
    this.checkWalls()
    
    if (this.isGrounded) {
      this.jumpCount = 0
    }
    
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
      if (this.onLand) this.onLand()
    }
    
    const wasWallSliding = this.isWallSliding
    this.isWallSliding = false
    
    if (this.wallJumpEnabled && this.isTouchingWall && !this.isGrounded && this.velocity.y < 0) {
      const moveTowardWall = (this.wallNormal.x > 0 && this.moveDirection.x < 0) ||
                             (this.wallNormal.x < 0 && this.moveDirection.x > 0)
      
      if (moveTowardWall) {
        this.isWallSliding = true
        this.velocity.y = Math.max(this.velocity.y, -this.wallSlideSpeed)
        
        if (!wasWallSliding && this.onWallSlide) {
          this.onWallSlide(this.wallNormal)
        }
      }
    }
    
    const targetSpeed = this.isRunning ? this.runSpeed : this.moveSpeed
    const drag = this.isGrounded ? this.groundDrag : this.airDrag
    
    if (this.moveDirection.lengthSq() > 0) {
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), this.forward).normalize()
      const moveDir = new THREE.Vector3()
      moveDir.addScaledVector(this.forward, -this.moveDirection.z)
      moveDir.addScaledVector(right, this.moveDirection.x)
      
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
    } else {
      this.velocity.x -= this.velocity.x * drag * deltaTime
      this.velocity.z -= this.velocity.z * drag * deltaTime
    }
    
    if (!this.isGrounded && !this.isWallSliding) {
      this.velocity.y -= this.gravity * deltaTime
    } else if (this.isGrounded && this.velocity.y < 0) {
      this.velocity.y = 0
    }
    
    this.object.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    
    if (this.object.position.y < 0) {
      this.object.position.y = 0
      this.velocity.y = 0
      this.isGrounded = true
      this.jumpCount = 0
    }
    
    return this
  }

  getState() {
    return {
      ...super.getState(),
      jumpCount: this.jumpCount,
      maxJumps: this.maxJumps,
      isTouchingWall: this.isTouchingWall,
      isWallSliding: this.isWallSliding,
      isDashing: this.isDashing,
      canDash: this.dashCooldownTimer <= 0 && !this.isDashing
    }
  }
}
