import { EventEmitter } from '../../core/events/EventEmitter.js'

export class CombatController extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.attacks = new Map()
    this.combos = new Map()
    
    this.isAttacking = false
    this.isBlocking = false
    this.isStunned = false
    this.currentAttack = null
    this.comboCounter = 0
    this.comboTimer = 0
    this.comboWindow = options.comboWindow ?? 0.5
    this.comboBuffer = []
    
    this.stunDuration = 0
    this.attackCooldown = 0
    this.blockCooldown = 0
    
    this.hitboxes = []
    this.hurtboxes = []
    
    this.onHit = null
    this.onBlock = null
    this.onStun = null
    this.onCombo = null
  }

  registerAttack(name, config) {
    this.attacks.set(name, {
      name,
      damage: config.damage ?? 10,
      knockback: config.knockback ?? 5,
      stunDuration: config.stunDuration ?? 0.3,
      startup: config.startup ?? 0.1,
      active: config.active ?? 0.2,
      recovery: config.recovery ?? 0.3,
      cooldown: config.cooldown ?? 0.5,
      cancelable: config.cancelable ?? false,
      comboNextWindow: config.comboNextWindow ?? 0.3,
      comboChain: config.comboChain ?? [],
      hitbox: config.hitbox ?? null,
      canBlock: config.canBlock ?? true,
      type: config.type ?? 'melee',
      element: config.element ?? 'physical'
    })
    return this
  }

  registerCombo(name, sequence, finisher) {
    this.combos.set(name, {
      name,
      sequence,
      finisher
    })
    return this
  }

  attack(name) {
    if (this.isStunned || this.attackCooldown > 0) {
      return false
    }
    
    if (this.isAttacking && this.currentAttack) {
      const current = this.attacks.get(this.currentAttack.name)
      if (current && current.cancelable && current.comboChain.includes(name)) {
        this.comboBuffer.push(name)
        return true
      }
      return false
    }
    
    const attackData = this.attacks.get(name)
    if (!attackData) {
      console.warn(`Attack "${name}" not registered`)
      return false
    }
    
    this.isAttacking = true
    this.isBlocking = false
    this.currentAttack = {
      name,
      phase: 'startup',
      timer: attackData.startup,
      data: attackData
    }
    
    this.comboBuffer = []
    
    this.emit('attackStart', name, attackData)
    
    return true
  }

  block(active) {
    if (this.isStunned || this.isAttacking) {
      return false
    }
    
    const wasBlocking = this.isBlocking
    this.isBlocking = active && this.blockCooldown <= 0
    
    if (this.isBlocking && !wasBlocking) {
      this.emit('blockStart')
    } else if (!this.isBlocking && wasBlocking) {
      this.emit('blockEnd')
    }
    
    return this.isBlocking
  }

  receiveHit(attackData, attacker = null) {
    if (this.isBlocking && attackData.canBlock) {
      const blocked = {
        damage: attackData.damage * 0.1,
        knockback: attackData.knockback * 0.3,
        stunDuration: attackData.stunDuration * 0.2
      }
      
      this.blockCooldown = 0.2
      
      if (this.onBlock) {
        this.onBlock(blocked, attacker)
      }
      this.emit('blocked', blocked, attacker)
      
      return blocked
    }
    
    const hit = {
      damage: attackData.damage,
      knockback: attackData.knockback,
      stunDuration: attackData.stunDuration,
      type: attackData.type,
      element: attackData.element
    }
    
    this.applyStun(hit.stunDuration)
    
    if (this.onHit) {
      this.onHit(hit, attacker)
    }
    this.emit('hit', hit, attacker)
    
    return hit
  }

  applyStun(duration) {
    this.isStunned = true
    this.stunDuration = duration
    this.isAttacking = false
    this.isBlocking = false
    this.currentAttack = null
    this.comboBuffer = []
    
    if (this.onStun) {
      this.onStun(duration)
    }
    this.emit('stunned', duration)
  }

  update(deltaTime) {
    if (this.stunDuration > 0) {
      this.stunDuration -= deltaTime
      if (this.stunDuration <= 0) {
        this.isStunned = false
        this.emit('stunEnd')
      }
    }
    
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime
    }
    
    if (this.blockCooldown > 0) {
      this.blockCooldown -= deltaTime
    }
    
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime
      if (this.comboTimer <= 0) {
        this.comboCounter = 0
        this.emit('comboDropped')
      }
    }
    
    if (this.isAttacking && this.currentAttack) {
      this.currentAttack.timer -= deltaTime
      
      if (this.currentAttack.timer <= 0) {
        switch (this.currentAttack.phase) {
          case 'startup':
            this.currentAttack.phase = 'active'
            this.currentAttack.timer = this.currentAttack.data.active
            this.emit('attackActive', this.currentAttack.name, this.currentAttack.data)
            break
            
          case 'active':
            this.currentAttack.phase = 'recovery'
            this.currentAttack.timer = this.currentAttack.data.recovery
            this.emit('attackRecovery', this.currentAttack.name)
            
            if (this.comboBuffer.length > 0) {
              const nextAttack = this.comboBuffer.shift()
              if (this.currentAttack.data.comboChain.includes(nextAttack)) {
                this.currentAttack.timer = this.currentAttack.data.comboNextWindow
                this.currentAttack.phase = 'combo'
                this.currentAttack.nextAttack = nextAttack
              }
            }
            break
            
          case 'combo':
            const nextName = this.currentAttack.nextAttack
            this.endAttack()
            this.attack(nextName)
            break
            
          case 'recovery':
            this.endAttack()
            break
        }
      }
    }
    
    return this
  }

  endAttack() {
    if (this.currentAttack) {
      this.attackCooldown = this.currentAttack.data.cooldown
      this.emit('attackEnd', this.currentAttack.name)
    }
    
    this.isAttacking = false
    this.currentAttack = null
    this.comboBuffer = []
  }

  incrementCombo() {
    this.comboCounter++
    this.comboTimer = this.comboWindow
    
    if (this.onCombo) {
      this.onCombo(this.comboCounter)
    }
    this.emit('combo', this.comboCounter)
  }

  getState() {
    return {
      isAttacking: this.isAttacking,
      isBlocking: this.isBlocking,
      isStunned: this.isStunned,
      currentAttack: this.currentAttack?.name ?? null,
      attackPhase: this.currentAttack?.phase ?? null,
      comboCounter: this.comboCounter,
      canAttack: !this.isStunned && !this.isAttacking && this.attackCooldown <= 0,
      canBlock: !this.isStunned && !this.isAttacking && this.blockCooldown <= 0
    }
  }

  reset() {
    this.isAttacking = false
    this.isBlocking = false
    this.isStunned = false
    this.currentAttack = null
    this.comboCounter = 0
    this.comboTimer = 0
    this.comboBuffer = []
    this.stunDuration = 0
    this.attackCooldown = 0
    this.blockCooldown = 0
  }
}
