import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { GameConfig } from '../core/GameState.js'
import { Layers, setLayerRecursive } from '../core/Layers.js'
import { AnimationLayer, AnimationState } from './AnimationLayer.js'
import { CollisionLayer } from './CollisionLayer.js'
import { DamageLayer, DamageEvent, DamageType } from './DamageLayer.js'
import { TextureLayer } from './TextureLayer.js'

export class Fighter3DEnhanced {
  constructor(options = {}) {
    this.isPlayer = options.isPlayer || false
    this.color = options.color || 0x4ade80
    this.startPosition = options.startPosition || new THREE.Vector3(0, 0, 0)
    this.facingDirection = options.facingDirection || 1
    this.modelPath = options.modelPath || null
    this.layer = options.layer || (options.isPlayer ? Layers.PLAYER : Layers.MONSTERS)
    
    this.group = new THREE.Group()
    this.glbModel = null
    this.velocity = new THREE.Vector3()
    this.isGrounded = true
    this.isAttacking = false
    this.attackType = null
    this.attackTimer = 0
    this.cooldowns = { light: 0, heavy: 0, special: 0 }
    this.hitstun = 0
    
    this.animationLayer = null
    this.collisionLayer = null
    this.damageLayer = null
    this.textureLayer = null
    
    this.fallbackMesh = null
    this.groundGlow = null
    
    this.createFallbackMesh()
    this.initLayers()
  }
  
  createFallbackMesh() {
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16)
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: this.color,
      metalness: 0.3,
      roughness: 0.7
    })
    this.fallbackMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
    this.fallbackMesh.position.y = 1
    this.fallbackMesh.castShadow = true
    this.group.add(this.fallbackMesh)
    
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
  
  initLayers() {
    this.damageLayer = new DamageLayer(this)
    this.damageLayer.init({
      maxHealth: GameConfig.fighter.maxHealth,
      invincibilityDuration: 0.3
    })
    
    this.damageLayer.onDamageReceived = (info) => {
      this.onDamageTaken(info)
    }
    
    this.damageLayer.onDeath = (event) => {
      this.onDeath(event)
    }
    
    this.collisionLayer = new CollisionLayer(this)
  }
  
  async loadModel() {
    if (!this.modelPath) return
    
    const loader = new GLTFLoader()
    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(this.modelPath, resolve, undefined, reject)
      })
      
      this.glbModel = gltf.scene
      
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
      
      setLayerRecursive(this.glbModel, this.layer)
      
      if (gltf.animations && gltf.animations.length > 0) {
        this.animationLayer = new AnimationLayer(this.glbModel)
        this.animationLayer.init(gltf.animations)
        
        this.animationLayer.onAnimationComplete = (state) => {
          this.onAnimationComplete(state)
        }
        
        if (this.animationLayer.hasAnimation(AnimationState.IDLE)) {
          this.animationLayer.play(AnimationState.IDLE)
        }
      }
      
      this.textureLayer = new TextureLayer(this.glbModel)
      
      await this.collisionLayer.init(this.startPosition)
      
      this.setupHitboxes()
      
      this.fallbackMesh.visible = false
      this.group.add(this.glbModel)
      
      console.log('Enhanced Fighter loaded:', this.modelPath)
    } catch (error) {
      console.warn('Could not load fighter model:', error)
    }
  }
  
  setupHitboxes() {
    const lightHitbox = this.collisionLayer.createHitbox('light_attack', {
      offset: { x: 0, y: 1.2, z: 1.0 },
      size: { x: 0.8, y: 0.6, z: 1.0 },
      damage: GameConfig.fighter.attacks.light.damage,
      knockback: 2,
      duration: 0.15
    })
    this.group.add(lightHitbox)
    
    const heavyHitbox = this.collisionLayer.createHitbox('heavy_attack', {
      offset: { x: 0, y: 1.0, z: 1.2 },
      size: { x: 1.2, y: 0.8, z: 1.5 },
      damage: GameConfig.fighter.attacks.heavy.damage,
      knockback: 4,
      duration: 0.25
    })
    this.group.add(heavyHitbox)
    
    const specialHitbox = this.collisionLayer.createHitbox('special_attack', {
      offset: { x: 0, y: 1.5, z: 1.5 },
      size: { x: 2.0, y: 1.5, z: 2.0 },
      damage: GameConfig.fighter.attacks.special.damage,
      knockback: 6,
      duration: 0.3
    })
    this.group.add(specialHitbox)
  }
  
  onAnimationComplete(state) {
    if (state === AnimationState.ATTACK_1 || state === AnimationState.ATTACK_2) {
      this.isAttacking = false
      this.attackType = null
      
      if (this.animationLayer) {
        this.animationLayer.play(AnimationState.IDLE)
      }
    }
    
    if (state === AnimationState.HIT) {
      if (this.animationLayer) {
        this.animationLayer.play(AnimationState.IDLE)
      }
    }
  }
  
  onDamageTaken(info) {
    this.hitstun = info.hitstun || 0.2
    
    if (info.knockback && info.knockbackDirection) {
      this.velocity.x += info.knockbackDirection.x * info.knockback
      this.velocity.z += info.knockbackDirection.z * info.knockback
    }
    
    if (this.animationLayer && this.animationLayer.hasAnimation(AnimationState.HIT)) {
      this.animationLayer.play(AnimationState.HIT, { blendTime: 0.1 })
    }
    
    if (this.textureLayer) {
      this.textureLayer.flashColor('*', 0xff0000, 0.1)
    } else {
      this.flashDamage()
    }
  }
  
  onDeath(event) {
    if (this.animationLayer && this.animationLayer.hasAnimation(AnimationState.DEATH)) {
      this.animationLayer.play(AnimationState.DEATH)
    }
  }
  
  reset() {
    this.group.position.copy(this.startPosition)
    this.group.rotation.y = this.facingDirection > 0 ? 0 : Math.PI
    this.velocity.set(0, 0, 0)
    this.isGrounded = true
    this.isAttacking = false
    this.attackTimer = 0
    this.hitstun = 0
    this.cooldowns = { light: 0, heavy: 0, special: 0 }
    
    if (this.damageLayer) {
      this.damageLayer.reset()
    }
    
    if (this.animationLayer && this.animationLayer.hasAnimation(AnimationState.IDLE)) {
      this.animationLayer.play(AnimationState.IDLE)
    }
  }
  
  update(deltaTime, input, opponent, isTargetLocked = false) {
    if (this.animationLayer) {
      this.animationLayer.update(deltaTime)
    }
    
    if (this.damageLayer) {
      this.damageLayer.update(deltaTime)
    }
    
    if (this.collisionLayer) {
      this.collisionLayer.update(deltaTime, this.group)
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
      }
    }
    
    if (this.hitstun <= 0 && !this.isAttacking) {
      this.handleMovement(deltaTime, input, isTargetLocked, opponent)
      this.handleAttacks(input, opponent)
    }
    
    this.processHitDetection(deltaTime, opponent)
    this.applyPhysics(deltaTime)
    this.updateVisuals(deltaTime)
  }
  
  handleMovement(deltaTime, input, isTargetLocked, opponent) {
    if (!input) return
    
    const moveVector = input.getMovementVector()
    const speed = input.isRunning() ? GameConfig.fighter.runSpeed : GameConfig.fighter.moveSpeed
    
    this.velocity.x = moveVector.x * speed
    this.velocity.z = moveVector.z * speed
    
    const isMoving = moveVector.x !== 0 || moveVector.z !== 0
    
    if (isMoving && !isTargetLocked) {
      const angle = Math.atan2(moveVector.x, moveVector.z)
      this.group.rotation.y = angle
    } else if (isTargetLocked && opponent) {
      const dirToOpponent = opponent.getPosition().clone().sub(this.group.position)
      dirToOpponent.y = 0
      if (dirToOpponent.length() > 0.1) {
        this.group.rotation.y = Math.atan2(dirToOpponent.x, dirToOpponent.z)
      }
    }
    
    if (this.animationLayer) {
      if (isMoving && input.isRunning() && this.animationLayer.hasAnimation(AnimationState.RUN)) {
        this.animationLayer.play(AnimationState.RUN)
      } else if (isMoving && this.animationLayer.hasAnimation(AnimationState.WALK)) {
        this.animationLayer.play(AnimationState.WALK)
      } else if (!isMoving && !this.isAttacking) {
        this.animationLayer.play(AnimationState.IDLE)
      }
    }
    
    if (input.isJumpPressed() && this.isGrounded) {
      this.velocity.y = GameConfig.fighter.jumpForce
      this.isGrounded = false
      
      if (this.animationLayer && this.animationLayer.hasAnimation(AnimationState.JUMP)) {
        this.animationLayer.play(AnimationState.JUMP)
      }
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
    
    if (this.animationLayer) {
      const animState = type === 'heavy' || type === 'special' 
        ? AnimationState.ATTACK_2 
        : AnimationState.ATTACK_1
      
      if (this.animationLayer.hasAnimation(animState)) {
        this.animationLayer.play(animState, { blendTime: 0.1 })
      }
    }
    
    const hitboxName = `${type}_attack`
    const hitDelay = type === 'heavy' ? 0.2 : type === 'special' ? 0.3 : 0.1
    this.collisionLayer.activateHitbox(hitboxName, hitDelay)
    
    this.pendingHitCheck = {
      opponent: opponent,
      type: type,
      attackConfig: attackConfig,
      delay: hitDelay,
      timer: hitDelay,
      hitboxName: hitboxName
    }
  }
  
  processHitDetection(deltaTime, opponent) {
    if (!this.pendingHitCheck) return
    
    this.pendingHitCheck.timer -= deltaTime
    
    if (this.pendingHitCheck.timer <= 0) {
      const { type, attackConfig, hitboxName } = this.pendingHitCheck
      const targetOpponent = opponent || this.pendingHitCheck.opponent
      
      if (this.collisionLayer && targetOpponent) {
        const hits = this.collisionLayer.checkHitboxAgainstFighter(targetOpponent)
        
        for (const hit of hits) {
          const knockbackDir = targetOpponent.group.position.clone()
            .sub(this.group.position)
            .normalize()
          knockbackDir.y = 0
          
          const damageEvent = new DamageEvent({
            damage: hit.damage,
            type: DamageType.PHYSICAL,
            knockback: hit.knockback,
            knockbackDirection: knockbackDir,
            hitstun: type === 'special' ? 0.5 : type === 'heavy' ? 0.3 : 0.2,
            source: this,
            isCritical: Math.random() < 0.1
          })
          
          if (targetOpponent.damageLayer) {
            targetOpponent.damageLayer.takeDamage(damageEvent)
          } else if (targetOpponent.takeDamage) {
            targetOpponent.takeDamage(hit.damage, this.group.position)
          }
        }
        
        if (hits.length === 0) {
          const distance = this.group.position.distanceTo(targetOpponent.group.position)
          if (distance <= attackConfig.range) {
            const knockbackDir = targetOpponent.group.position.clone()
              .sub(this.group.position)
              .normalize()
            knockbackDir.y = 0
            
            const damageEvent = new DamageEvent({
              damage: attackConfig.damage,
              type: DamageType.PHYSICAL,
              knockback: type === 'special' ? 5 : type === 'heavy' ? 3 : 1,
              knockbackDirection: knockbackDir,
              hitstun: type === 'special' ? 0.5 : type === 'heavy' ? 0.3 : 0.2,
              source: this,
              isCritical: Math.random() < 0.1
            })
            
            if (targetOpponent.damageLayer) {
              targetOpponent.damageLayer.takeDamage(damageEvent)
            } else if (targetOpponent.takeDamage) {
              targetOpponent.takeDamage(attackConfig.damage, this.group.position)
            }
          }
        }
      }
      
      this.pendingHitCheck = null
    }
  }
  
  takeDamage(amount, sourcePosition) {
    const knockbackDir = this.group.position.clone()
      .sub(sourcePosition)
      .normalize()
    knockbackDir.y = 0
    
    const damageEvent = new DamageEvent({
      damage: amount,
      type: DamageType.PHYSICAL,
      knockback: 3,
      knockbackDirection: knockbackDir,
      hitstun: 0.2
    })
    
    if (this.damageLayer) {
      this.damageLayer.takeDamage(damageEvent)
    }
  }
  
  flashDamage() {
    if (this.fallbackMesh && this.fallbackMesh.visible) {
      const originalColor = this.fallbackMesh.material.color.getHex()
      this.fallbackMesh.material.color.setHex(0xff0000)
      
      setTimeout(() => {
        this.fallbackMesh.material.color.setHex(originalColor)
      }, 100)
    }
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
  
  updateVisuals(deltaTime) {
    if (this.groundGlow) {
      this.groundGlow.material.opacity = 0.2 + Math.sin(Date.now() * 0.002) * 0.1
    }
    
    if (this.damageLayer && this.damageLayer.isInvincible) {
      const flashValue = Math.sin(Date.now() * 0.02) > 0 ? 1 : 0.5
      if (this.glbModel) {
        this.glbModel.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = flashValue
            child.material.transparent = true
          }
        })
      }
    }
  }
  
  getPosition() {
    return this.group.position
  }
  
  getHealth() {
    return this.damageLayer ? this.damageLayer.health : 100
  }
  
  getHealthPercent() {
    return this.damageLayer ? this.damageLayer.getHealthPercent() : 1
  }
  
  isAlive() {
    return this.damageLayer ? this.damageLayer.isAlive() : true
  }
  
  getMesh() {
    return this.group
  }
  
  dispose() {
    if (this.animationLayer) {
      this.animationLayer.dispose()
    }
    if (this.collisionLayer) {
      this.collisionLayer.dispose()
    }
    if (this.textureLayer) {
      this.textureLayer.dispose()
    }
    
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }
}
