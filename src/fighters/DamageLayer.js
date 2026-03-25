import * as THREE from 'three'

export const DamageType = {
  PHYSICAL: 'physical',
  FIRE: 'fire',
  ICE: 'ice',
  LIGHTNING: 'lightning',
  POISON: 'poison'
}

export class DamageEvent {
  constructor(config = {}) {
    this.damage = config.damage || 0
    this.type = config.type || DamageType.PHYSICAL
    this.knockback = config.knockback || 0
    this.knockbackDirection = config.knockbackDirection || new THREE.Vector3(0, 0, 1)
    this.hitstun = config.hitstun || 0.2
    this.source = config.source || null
    this.isCritical = config.isCritical || false
    this.timestamp = Date.now()
  }
}

export class DamageLayer {
  constructor(fighter) {
    this.fighter = fighter
    
    this.health = 100
    this.maxHealth = 100
    this.armor = 0
    this.damageResistance = {}
    
    this.isInvincible = false
    this.invincibilityTimer = 0
    this.invincibilityDuration = 0.5
    
    this.damageHistory = []
    this.maxHistorySize = 20
    
    this.onDamageReceived = null
    this.onDeath = null
    this.onHealthChanged = null
  }
  
  init(config = {}) {
    this.maxHealth = config.maxHealth || 100
    this.health = this.maxHealth
    this.armor = config.armor || 0
    this.damageResistance = config.damageResistance || {}
    this.invincibilityDuration = config.invincibilityDuration || 0.5
  }
  
  setHealth(amount) {
    const oldHealth = this.health
    this.health = Math.max(0, Math.min(this.maxHealth, amount))
    
    if (this.onHealthChanged && oldHealth !== this.health) {
      this.onHealthChanged(this.health, this.maxHealth, oldHealth)
    }
  }
  
  heal(amount) {
    this.setHealth(this.health + amount)
    return this.health
  }
  
  takeDamage(damageEvent) {
    if (this.isInvincible) {
      return { blocked: true, reason: 'invincible' }
    }
    
    if (this.health <= 0) {
      return { blocked: true, reason: 'already_dead' }
    }
    
    let finalDamage = damageEvent.damage
    
    if (this.armor > 0) {
      finalDamage = Math.max(1, finalDamage - this.armor)
    }
    
    const resistance = this.damageResistance[damageEvent.type] || 0
    if (resistance > 0) {
      finalDamage *= (1 - resistance)
    }
    
    if (damageEvent.isCritical) {
      finalDamage *= 1.5
    }
    
    finalDamage = Math.floor(finalDamage)
    
    const oldHealth = this.health
    this.setHealth(this.health - finalDamage)
    
    this.damageHistory.push({
      event: damageEvent,
      finalDamage: finalDamage,
      healthBefore: oldHealth,
      healthAfter: this.health,
      timestamp: Date.now()
    })
    
    if (this.damageHistory.length > this.maxHistorySize) {
      this.damageHistory.shift()
    }
    
    this.startInvincibility()
    
    if (this.onDamageReceived) {
      this.onDamageReceived({
        damage: finalDamage,
        type: damageEvent.type,
        knockback: damageEvent.knockback,
        knockbackDirection: damageEvent.knockbackDirection,
        isCritical: damageEvent.isCritical,
        source: damageEvent.source
      })
    }
    
    if (this.health <= 0 && this.onDeath) {
      this.onDeath(damageEvent)
    }
    
    return {
      blocked: false,
      finalDamage: finalDamage,
      killed: this.health <= 0
    }
  }
  
  startInvincibility(duration = null) {
    this.isInvincible = true
    this.invincibilityTimer = duration || this.invincibilityDuration
  }
  
  endInvincibility() {
    this.isInvincible = false
    this.invincibilityTimer = 0
  }
  
  update(deltaTime) {
    if (this.isInvincible) {
      this.invincibilityTimer -= deltaTime
      if (this.invincibilityTimer <= 0) {
        this.endInvincibility()
      }
    }
  }
  
  getHealthPercent() {
    return this.health / this.maxHealth
  }
  
  isAlive() {
    return this.health > 0
  }
  
  isDead() {
    return this.health <= 0
  }
  
  reset() {
    this.health = this.maxHealth
    this.isInvincible = false
    this.invincibilityTimer = 0
    this.damageHistory = []
    
    if (this.onHealthChanged) {
      this.onHealthChanged(this.health, this.maxHealth, 0)
    }
  }
  
  getRecentDamage(timeWindowMs = 5000) {
    const now = Date.now()
    return this.damageHistory
      .filter(entry => now - entry.timestamp < timeWindowMs)
      .reduce((sum, entry) => sum + entry.finalDamage, 0)
  }
  
  getDamagePerSecond(timeWindowMs = 5000) {
    const recentDamage = this.getRecentDamage(timeWindowMs)
    return (recentDamage / timeWindowMs) * 1000
  }
  
  setArmor(value) {
    this.armor = Math.max(0, value)
  }
  
  setResistance(type, value) {
    this.damageResistance[type] = Math.max(0, Math.min(1, value))
  }
  
  getStats() {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      healthPercent: this.getHealthPercent(),
      armor: this.armor,
      resistances: { ...this.damageResistance },
      isInvincible: this.isInvincible,
      isAlive: this.isAlive()
    }
  }
}
