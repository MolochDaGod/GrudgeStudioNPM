import { EventEmitter } from '../../core/events/EventEmitter.js'

export class DamageSystem extends EventEmitter {
  constructor() {
    super()
    
    this.entities = new Map()
    this.damageModifiers = []
    this.healModifiers = []
    
    this.globalResistances = new Map()
    this.globalWeaknesses = new Map()
  }

  registerEntity(id, options = {}) {
    const entity = {
      id,
      maxHealth: options.maxHealth ?? 100,
      health: options.health ?? options.maxHealth ?? 100,
      maxArmor: options.maxArmor ?? 0,
      armor: options.armor ?? options.maxArmor ?? 0,
      resistances: new Map(Object.entries(options.resistances ?? {})),
      weaknesses: new Map(Object.entries(options.weaknesses ?? {})),
      invincible: options.invincible ?? false,
      invincibilityTimer: 0,
      isDead: false,
      team: options.team ?? 'neutral',
      data: options.data ?? {}
    }
    
    this.entities.set(id, entity)
    this.emit('entityRegistered', id, entity)
    
    return entity
  }

  unregisterEntity(id) {
    this.entities.delete(id)
    this.emit('entityUnregistered', id)
  }

  getEntity(id) {
    return this.entities.get(id)
  }

  applyDamage(targetId, damage, options = {}) {
    const target = this.entities.get(targetId)
    if (!target) {
      console.warn(`Entity "${targetId}" not found`)
      return null
    }
    
    if (target.isDead || target.invincible || target.invincibilityTimer > 0) {
      return { prevented: true, reason: target.isDead ? 'dead' : 'invincible' }
    }
    
    let finalDamage = damage
    const element = options.element ?? 'physical'
    const source = options.source ?? null
    const isCritical = options.critical ?? false
    
    if (target.resistances.has(element)) {
      finalDamage *= (1 - target.resistances.get(element))
    }
    
    if (target.weaknesses.has(element)) {
      finalDamage *= (1 + target.weaknesses.get(element))
    }
    
    if (this.globalResistances.has(element)) {
      finalDamage *= (1 - this.globalResistances.get(element))
    }
    
    if (this.globalWeaknesses.has(element)) {
      finalDamage *= (1 + this.globalWeaknesses.get(element))
    }
    
    for (const modifier of this.damageModifiers) {
      finalDamage = modifier(finalDamage, target, options)
    }
    
    if (isCritical) {
      finalDamage *= options.critMultiplier ?? 2
    }
    
    finalDamage = Math.max(0, Math.round(finalDamage))
    
    let armorDamage = 0
    let healthDamage = finalDamage
    
    if (target.armor > 0 && !options.ignoreArmor) {
      const armorAbsorb = options.armorPenetration 
        ? finalDamage * (1 - options.armorPenetration)
        : finalDamage
      
      armorDamage = Math.min(target.armor, armorAbsorb)
      target.armor -= armorDamage
      healthDamage = finalDamage - armorDamage
    }
    
    const previousHealth = target.health
    target.health = Math.max(0, target.health - healthDamage)
    
    const result = {
      target: targetId,
      source,
      rawDamage: damage,
      finalDamage,
      healthDamage,
      armorDamage,
      element,
      isCritical,
      previousHealth,
      currentHealth: target.health,
      isDead: target.health <= 0
    }
    
    this.emit('damage', result)
    
    if (result.isDead) {
      target.isDead = true
      this.emit('death', targetId, source)
    }
    
    return result
  }

  applyHeal(targetId, amount, options = {}) {
    const target = this.entities.get(targetId)
    if (!target) {
      console.warn(`Entity "${targetId}" not found`)
      return null
    }
    
    if (target.isDead && !options.revive) {
      return { prevented: true, reason: 'dead' }
    }
    
    let finalHeal = amount
    
    for (const modifier of this.healModifiers) {
      finalHeal = modifier(finalHeal, target, options)
    }
    
    const previousHealth = target.health
    
    if (options.revive && target.isDead) {
      target.isDead = false
      target.health = Math.min(target.maxHealth, finalHeal)
      this.emit('revive', targetId, target.health)
    } else {
      target.health = Math.min(target.maxHealth, target.health + finalHeal)
    }
    
    const result = {
      target: targetId,
      rawHeal: amount,
      finalHeal: target.health - previousHealth,
      previousHealth,
      currentHealth: target.health,
      overheal: finalHeal - (target.health - previousHealth)
    }
    
    this.emit('heal', result)
    
    return result
  }

  repairArmor(targetId, amount) {
    const target = this.entities.get(targetId)
    if (!target) return null
    
    const previousArmor = target.armor
    target.armor = Math.min(target.maxArmor, target.armor + amount)
    
    return {
      target: targetId,
      repaired: target.armor - previousArmor,
      currentArmor: target.armor
    }
  }

  setInvincible(targetId, duration) {
    const target = this.entities.get(targetId)
    if (!target) return
    
    target.invincibilityTimer = duration
    this.emit('invincibilityStart', targetId, duration)
  }

  update(deltaTime) {
    for (const [id, entity] of this.entities) {
      if (entity.invincibilityTimer > 0) {
        entity.invincibilityTimer -= deltaTime
        if (entity.invincibilityTimer <= 0) {
          entity.invincibilityTimer = 0
          this.emit('invincibilityEnd', id)
        }
      }
    }
  }

  addDamageModifier(modifier) {
    this.damageModifiers.push(modifier)
    return () => {
      const index = this.damageModifiers.indexOf(modifier)
      if (index > -1) this.damageModifiers.splice(index, 1)
    }
  }

  addHealModifier(modifier) {
    this.healModifiers.push(modifier)
    return () => {
      const index = this.healModifiers.indexOf(modifier)
      if (index > -1) this.healModifiers.splice(index, 1)
    }
  }

  getHealthPercentage(targetId) {
    const target = this.entities.get(targetId)
    if (!target) return 0
    return target.health / target.maxHealth
  }

  isAlive(targetId) {
    const target = this.entities.get(targetId)
    return target && !target.isDead
  }

  getEntitiesByTeam(team) {
    const result = []
    for (const [id, entity] of this.entities) {
      if (entity.team === team) {
        result.push({ id, ...entity })
      }
    }
    return result
  }

  reset() {
    for (const [, entity] of this.entities) {
      entity.health = entity.maxHealth
      entity.armor = entity.maxArmor
      entity.isDead = false
      entity.invincibilityTimer = 0
    }
    this.emit('reset')
  }
}
