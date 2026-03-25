import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { GameConfig } from '../core/GameState.js'

export class Fighter3D {
  constructor(options = {}) {
    this.isPlayer = options.isPlayer || false
    this.color = options.color || 0x4ade80
    this.startPosition = options.startPosition || new THREE.Vector3(0, 0, 0)
    this.facingDirection = options.facingDirection || 1
    this.modelPath = options.modelPath || null
    
    this.health = GameConfig.fighter.maxHealth
    this.velocity = new THREE.Vector3()
    this.isGrounded = true
    this.isAttacking = false
    this.isBlocking = false
    this.attackType = null
    this.attackTimer = 0
    this.cooldowns = { light: 0, heavy: 0, special: 0 }
    this.hitstun = 0
    this.glbModel = null
    this.mixer = null
    
    this.createMesh()
    this.reset()
  }
  
  async loadModel() {
    if (!this.modelPath) return
    
    const loader = new GLTFLoader()
    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(this.modelPath, resolve, undefined, reject)
      })
      
      this.glbModel = gltf.scene
      this.glbModel.scale.set(1, 1, 1)
      
      const box = new THREE.Box3().setFromObject(this.glbModel)
      const size = box.getSize(new THREE.Vector3())
      const targetHeight = 2.2
      const scale = targetHeight / size.y
      this.glbModel.scale.set(scale, scale, scale)
      
      box.setFromObject(this.glbModel)
      this.glbModel.position.y = -box.min.y
      
      this.glbModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.glbModel)
        this.animations = {}
        gltf.animations.forEach((clip) => {
          this.animations[clip.name] = this.mixer.clipAction(clip)
        })
      }
      
      this.body.visible = false
      this.head.visible = false
      this.leftArm.visible = false
      this.rightArm.visible = false
      this.leftLeg.visible = false
      this.rightLeg.visible = false
      
      this.group.add(this.glbModel)
      console.log('Fighter GLB model loaded:', this.modelPath)
    } catch (error) {
      console.warn('Could not load fighter model:', error)
    }
  }
  
  createMesh() {
    this.group = new THREE.Group()
    
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16)
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: this.color,
      metalness: 0.3,
      roughness: 0.7
    })
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    this.body.position.y = 1
    this.body.castShadow = true
    this.group.add(this.body)
    
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffdbac,
      metalness: 0.1,
      roughness: 0.8
    })
    this.head = new THREE.Mesh(headGeometry, headMaterial)
    this.head.position.y = 2
    this.head.castShadow = true
    this.group.add(this.head)
    
    const armGeometry = new THREE.CapsuleGeometry(0.15, 0.6, 4, 8)
    const armMaterial = new THREE.MeshStandardMaterial({ 
      color: this.color,
      metalness: 0.3,
      roughness: 0.7
    })
    
    this.leftArm = new THREE.Mesh(armGeometry, armMaterial)
    this.leftArm.position.set(-0.6, 1.3, 0)
    this.leftArm.rotation.z = Math.PI / 6
    this.leftArm.castShadow = true
    this.group.add(this.leftArm)
    
    this.rightArm = new THREE.Mesh(armGeometry, armMaterial)
    this.rightArm.position.set(0.6, 1.3, 0)
    this.rightArm.rotation.z = -Math.PI / 6
    this.rightArm.castShadow = true
    this.group.add(this.rightArm)
    
    const legGeometry = new THREE.CapsuleGeometry(0.15, 0.5, 4, 8)
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e,
      metalness: 0.2,
      roughness: 0.9
    })
    
    this.leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    this.leftLeg.position.set(-0.2, 0.3, 0)
    this.leftLeg.castShadow = true
    this.group.add(this.leftLeg)
    
    this.rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    this.rightLeg.position.set(0.2, 0.3, 0)
    this.rightLeg.castShadow = true
    this.group.add(this.rightLeg)
    
    const glowGeometry = new THREE.RingGeometry(0.8, 1.2, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: this.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
    this.groundGlow = new THREE.Mesh(glowGeometry, glowMaterial)
    this.groundGlow.rotation.x = -Math.PI / 2
    this.groundGlow.position.y = 0.01
    this.group.add(this.groundGlow)
  }
  
  reset() {
    this.group.position.copy(this.startPosition)
    this.group.rotation.y = this.facingDirection > 0 ? 0 : Math.PI
    this.health = GameConfig.fighter.maxHealth
    this.velocity.set(0, 0, 0)
    this.isGrounded = true
    this.isAttacking = false
    this.attackTimer = 0
    this.hitstun = 0
    this.cooldowns = { light: 0, heavy: 0, special: 0 }
  }
  
  update(deltaTime, input, opponent) {
    if (this.mixer) {
      this.mixer.update(deltaTime)
    }
    
    if (this.hitstun > 0) {
      this.hitstun -= deltaTime
    }
    
    Object.keys(this.cooldowns).forEach(key => {
      if (this.cooldowns[key] > 0) {
        this.cooldowns[key] -= deltaTime
      }
    })
    
    if (this.isAttacking) {
      this.attackTimer -= deltaTime
      if (this.attackTimer <= 0) {
        this.isAttacking = false
        this.attackType = null
        this.resetPose()
      }
    }
    
    if (this.hitstun <= 0 && !this.isAttacking) {
      this.handleMovement(deltaTime, input)
      this.handleAttacks(input, opponent)
    }
    
    this.applyPhysics(deltaTime)
    this.updateAnimation(deltaTime)
  }
  
  handleMovement(deltaTime, input) {
    if (!input) return
    
    const moveVector = input.getMovementVector()
    const speed = input.isRunning() ? GameConfig.fighter.runSpeed : GameConfig.fighter.moveSpeed
    
    this.velocity.x = moveVector.x * speed
    this.velocity.z = moveVector.z * speed
    
    if (moveVector.x !== 0 || moveVector.z !== 0) {
      const angle = Math.atan2(moveVector.x, moveVector.z)
      this.group.rotation.y = angle
    }
    
    if (input.isJumpPressed() && this.isGrounded) {
      this.velocity.y = GameConfig.fighter.jumpForce
      this.isGrounded = false
    }
  }
  
  handleAttacks(input, opponent) {
    if (!input || !opponent) return
    
    if (input.isLightAttack() && this.cooldowns.light <= 0) {
      this.performAttack('light', opponent)
    } else if (input.isHeavyAttack() && this.cooldowns.heavy <= 0) {
      this.performAttack('heavy', opponent)
    } else if (input.isSpecialAttack() && this.cooldowns.special <= 0) {
      this.performAttack('special', opponent)
    }
  }
  
  performAttack(type, opponent) {
    const attackConfig = GameConfig.fighter.attacks[type]
    
    this.isAttacking = true
    this.attackType = type
    this.attackTimer = attackConfig.duration
    this.cooldowns[type] = attackConfig.cooldown
    
    this.animateAttack(type)
    
    const distance = this.group.position.distanceTo(opponent.group.position)
    if (distance <= attackConfig.range) {
      opponent.takeDamage(attackConfig.damage, this.group.position)
    }
  }
  
  takeDamage(amount, sourcePosition) {
    if (this.isBlocking) {
      amount *= 0.2
    }
    
    this.health = Math.max(0, this.health - amount)
    this.hitstun = 0.3
    
    const knockback = this.group.position.clone().sub(sourcePosition).normalize()
    knockback.y = 0
    this.velocity.x += knockback.x * 3
    this.velocity.z += knockback.z * 3
    
    this.flashDamage()
  }
  
  flashDamage() {
    const originalColor = this.body.material.color.getHex()
    this.body.material.color.setHex(0xff0000)
    this.head.material.color.setHex(0xff6666)
    
    setTimeout(() => {
      this.body.material.color.setHex(originalColor)
      this.head.material.color.setHex(0xffdbac)
    }, 100)
  }
  
  animateAttack(type) {
    const intensity = type === 'special' ? 1.5 : type === 'heavy' ? 1.2 : 1
    this.rightArm.rotation.x = -Math.PI / 2 * intensity
    this.rightArm.rotation.z = -Math.PI / 4
  }
  
  resetPose() {
    this.rightArm.rotation.x = 0
    this.rightArm.rotation.z = -Math.PI / 6
    this.leftArm.rotation.x = 0
    this.leftArm.rotation.z = Math.PI / 6
  }
  
  applyPhysics(deltaTime) {
    if (!this.isGrounded) {
      this.velocity.y -= GameConfig.fighter.gravity * deltaTime
    }
    
    this.group.position.x += this.velocity.x * deltaTime
    this.group.position.y += this.velocity.y * deltaTime
    this.group.position.z += this.velocity.z * deltaTime
    
    if (this.group.position.y <= 0) {
      this.group.position.y = 0
      this.velocity.y = 0
      this.isGrounded = true
    }
    
    this.velocity.y = Math.max(-50, Math.min(20, this.velocity.y))
    
    const arenaHalf = GameConfig.arena.width / 2 - 1
    this.group.position.x = Math.max(-arenaHalf, Math.min(arenaHalf, this.group.position.x))
    
    const depthHalf = GameConfig.arena.depth / 2 - 1
    this.group.position.z = Math.max(-depthHalf, Math.min(depthHalf, this.group.position.z))
    
    this.velocity.x *= 0.9
    this.velocity.z *= 0.9
  }
  
  updateAnimation(deltaTime) {
    const bobAmount = Math.sin(Date.now() * 0.003) * 0.02
    this.body.position.y = 1 + bobAmount
    this.head.position.y = 2 + bobAmount
    
    if (this.velocity.x !== 0 || this.velocity.z !== 0) {
      const walkCycle = Math.sin(Date.now() * 0.01) * 0.2
      this.leftLeg.rotation.x = walkCycle
      this.rightLeg.rotation.x = -walkCycle
      this.leftArm.rotation.x = -walkCycle * 0.5
      if (!this.isAttacking) {
        this.rightArm.rotation.x = walkCycle * 0.5
      }
    }
    
    this.groundGlow.material.opacity = 0.2 + Math.sin(Date.now() * 0.002) * 0.1
  }
  
  getPosition() {
    return this.group.position
  }
  
  getHealth() {
    return this.health
  }
  
  getHealthPercent() {
    return this.health / GameConfig.fighter.maxHealth
  }
  
  isAlive() {
    return this.health > 0
  }
  
  getMesh() {
    return this.group
  }
  
  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) child.material.dispose()
    })
  }
}
