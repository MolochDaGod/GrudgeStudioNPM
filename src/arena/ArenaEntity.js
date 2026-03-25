/*
    GRUDGE Studio - Arena Entity System
    Component-based entity for arena fighters
*/

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getEffectiveStatValue, calculatePowerScore, getPowerRanking } from '../stats/StatsUtils.js'

export const EntityType = {
    PLAYER: 'player',
    AI: 'ai',
    NPC: 'npc',
    PROP: 'prop'
}

export class ArenaEntity {
    constructor(config = {}) {
        this.id = config.id || crypto.randomUUID()
        this.type = config.type || EntityType.PLAYER
        this.name = config.name || 'Entity'
        
        this.group = new THREE.Group()
        this.group.userData.entity = this
        
        this.mesh = null
        this.mixer = null
        this.animations = new Map()
        this.currentAnimation = null
        
        this.stats = this.createStats(config.stats || {})
        this.effectiveStats = this.calculateEffectiveStats()
        this.powerScore = 0
        this.powerRanking = null
        this.recalculatePower()
        this.state = this.createState()
        
        this.position = config.position || new THREE.Vector3(0, 0, 0)
        this.rotation = config.rotation || 0
        this.scale = config.scale || 1
        
        this.modelPath = config.modelPath || null
        this.color = config.color || 0xffffff
        
        this.components = new Map()
        this.isLoaded = false
        this.isActive = true
        
        this.group.position.copy(this.position)
        this.group.rotation.y = this.rotation
    }
    
    createStats(overrides = {}) {
        return {
            maxHealth: overrides.maxHealth || 100,
            health: overrides.health || 100,
            maxStamina: overrides.stamina || 100,
            stamina: overrides.stamina || 100,
            
            strength: overrides.strength || 10,
            dexterity: overrides.dexterity || 10,
            constitution: overrides.constitution || 10,
            intelligence: overrides.intelligence || 10,
            wisdom: overrides.wisdom || 10,
            charisma: overrides.charisma || 10,
            luck: overrides.luck || 10,
            willpower: overrides.willpower || 10,
            
            moveSpeed: overrides.moveSpeed || 5,
            runSpeed: overrides.runSpeed || 10,
            attackPower: overrides.attackPower || 10,
            defense: overrides.defense || 5,
            critChance: overrides.critChance || 0.05,
            critMultiplier: overrides.critMultiplier || 1.5,
            
            level: overrides.level || 1,
            experience: overrides.experience || 0
        }
    }
    
    calculateEffectiveStats() {
        const primaryStats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'luck', 'willpower']
        const effective = {}
        
        for (const stat of primaryStats) {
            effective[stat] = getEffectiveStatValue(this.stats[stat])
        }
        
        return effective
    }
    
    recalculatePower() {
        this.effectiveStats = this.calculateEffectiveStats()
        this.powerScore = calculatePowerScore({
            ...this.stats,
            strength: this.stats.strength,
            dexterity: this.stats.dexterity,
            constitution: this.stats.constitution,
            intelligence: this.stats.intelligence,
            wisdom: this.stats.wisdom,
            charisma: this.stats.charisma,
            luck: this.stats.luck,
            willpower: this.stats.willpower
        })
        this.powerRanking = getPowerRanking(this.powerScore)
    }
    
    getEffectiveStat(statName) {
        return this.effectiveStats[statName] ?? this.stats[statName] ?? 0
    }
    
    createState() {
        return {
            isAlive: true,
            isMoving: false,
            isRunning: false,
            isAttacking: false,
            isBlocking: false,
            isDodging: false,
            isStaggered: false,
            isCasting: false,
            
            targetEntity: null,
            lastAttackTime: 0,
            lastDamageTime: 0,
            invincibleUntil: 0,
            
            velocity: new THREE.Vector3(),
            moveDirection: new THREE.Vector3(),
            facingDirection: new THREE.Vector3(0, 0, -1)
        }
    }
    
    async loadModel() {
        if (!this.modelPath) {
            this.createPlaceholderMesh()
            this.isLoaded = true
            return
        }
        
        const loader = new GLTFLoader()
        
        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load(this.modelPath, resolve, undefined, reject)
            })
            
            this.mesh = gltf.scene
            this.mesh.scale.setScalar(this.scale)
            
            this.mesh.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
            
            this.group.add(this.mesh)
            
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.mesh)
                gltf.animations.forEach(clip => {
                    this.animations.set(clip.name.toLowerCase(), clip)
                })
            }
            
            this.isLoaded = true
            console.log(`Entity ${this.name} loaded: ${this.modelPath}`)
            
        } catch (error) {
            console.warn(`Failed to load model for ${this.name}:`, error)
            this.createPlaceholderMesh()
            this.isLoaded = true
        }
    }
    
    createPlaceholderMesh() {
        const geometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16)
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            metalness: 0.3,
            roughness: 0.7
        })
        
        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.position.y = 1
        this.mesh.castShadow = true
        
        const indicatorGeometry = new THREE.SphereGeometry(0.2)
        const indicatorMaterial = new THREE.MeshBasicMaterial({
            color: this.type === EntityType.PLAYER ? 0x00ff00 : 0xff0000
        })
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial)
        indicator.position.set(0, 2.2, 0)
        this.mesh.add(indicator)
        
        this.group.add(this.mesh)
    }
    
    playAnimation(name, options = {}) {
        const clip = this.animations.get(name.toLowerCase())
        if (!clip || !this.mixer) return null
        
        const action = this.mixer.clipAction(clip)
        
        if (options.loop === false) {
            action.setLoop(THREE.LoopOnce)
            action.clampWhenFinished = true
        }
        
        if (options.crossFade && this.currentAnimation) {
            this.currentAnimation.crossFadeTo(action, options.crossFade, true)
        } else {
            if (this.currentAnimation) {
                this.currentAnimation.fadeOut(0.2)
            }
            action.reset().fadeIn(0.2).play()
        }
        
        this.currentAnimation = action
        return action
    }
    
    stopAnimation() {
        if (this.currentAnimation) {
            this.currentAnimation.fadeOut(0.2)
            this.currentAnimation = null
        }
    }
    
    takeDamage(amount, source = null) {
        if (!this.state.isAlive) return { dealt: 0, killed: false }
        if (Date.now() < this.state.invincibleUntil) return { dealt: 0, blocked: true }
        
        let damage = amount
        
        if (this.state.isBlocking) {
            damage = Math.floor(damage * 0.3)
        }
        
        const effectiveCon = this.getEffectiveStat('constitution')
        const effectiveDefense = this.stats.defense + (effectiveCon - 10) * 0.5
        damage = Math.max(0, damage - effectiveDefense * 0.5)
        
        this.stats.health = Math.max(0, this.stats.health - damage)
        this.state.lastDamageTime = Date.now()
        
        if (this.stats.health <= 0) {
            this.die()
            return { dealt: damage, killed: true }
        }
        
        this.state.isStaggered = true
        setTimeout(() => {
            this.state.isStaggered = false
        }, 200)
        
        return { dealt: damage, killed: false }
    }
    
    heal(amount) {
        if (!this.state.isAlive) return 0
        
        const oldHealth = this.stats.health
        this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount)
        return this.stats.health - oldHealth
    }
    
    die() {
        this.state.isAlive = false
        this.stats.health = 0
        this.playAnimation('death', { loop: false })
    }
    
    respawn(position = null) {
        this.stats.health = this.stats.maxHealth
        this.stats.stamina = this.stats.maxStamina
        this.state = this.createState()
        
        if (position) {
            this.setPosition(position)
        }
        
        this.playAnimation('idle')
    }
    
    attack(type = 'light') {
        if (!this.state.isAlive || this.state.isAttacking || this.state.isStaggered) {
            return null
        }
        
        const attackConfigs = {
            light: { damage: 10, range: 2, cooldown: 300, animation: 'attack_light' },
            heavy: { damage: 25, range: 2.5, cooldown: 800, animation: 'attack_heavy' },
            special: { damage: 40, range: 3, cooldown: 2000, animation: 'attack_special' }
        }
        
        const config = attackConfigs[type] || attackConfigs.light
        const now = Date.now()
        
        if (now - this.state.lastAttackTime < config.cooldown) {
            return null
        }
        
        this.state.isAttacking = true
        this.state.lastAttackTime = now
        
        const effectiveStr = this.getEffectiveStat('strength')
        const damage = Math.floor(
            config.damage * 
            (1 + (effectiveStr - 10) * 0.05) * 
            (1 + (this.stats.attackPower / 100))
        )
        
        const effectiveLuck = this.getEffectiveStat('luck')
        const effectiveDex = this.getEffectiveStat('dexterity')
        const adjustedCritChance = this.stats.critChance + (effectiveLuck - 10) * 0.005 + (effectiveDex - 10) * 0.003
        const isCrit = Math.random() < adjustedCritChance
        const finalDamage = isCrit ? Math.floor(damage * this.stats.critMultiplier) : damage
        
        this.playAnimation(config.animation, { loop: false })
        
        setTimeout(() => {
            this.state.isAttacking = false
        }, config.cooldown * 0.5)
        
        return {
            damage: finalDamage,
            range: config.range,
            isCrit,
            type
        }
    }
    
    startBlock() {
        if (!this.state.isAlive || this.state.isAttacking) return false
        this.state.isBlocking = true
        this.playAnimation('block')
        return true
    }
    
    endBlock() {
        this.state.isBlocking = false
        this.playAnimation('idle')
    }
    
    move(direction, deltaTime, isRunning = false) {
        if (!this.state.isAlive || this.state.isAttacking || this.state.isStaggered) return
        
        const speed = isRunning ? this.stats.runSpeed : this.stats.moveSpeed
        
        this.state.moveDirection.copy(direction).normalize()
        this.state.velocity.copy(this.state.moveDirection).multiplyScalar(speed * deltaTime)
        
        this.group.position.add(this.state.velocity)
        
        if (direction.lengthSq() > 0.001) {
            const targetRotation = Math.atan2(direction.x, direction.z)
            this.group.rotation.y = THREE.MathUtils.lerp(
                this.group.rotation.y,
                targetRotation,
                0.15
            )
            
            this.state.isMoving = true
            this.state.isRunning = isRunning
            
            if (!this.state.isAttacking) {
                this.playAnimation(isRunning ? 'run' : 'walk')
            }
        } else {
            this.state.isMoving = false
            this.state.isRunning = false
            
            if (!this.state.isAttacking && !this.state.isBlocking) {
                this.playAnimation('idle')
            }
        }
    }
    
    lookAt(target) {
        if (target instanceof THREE.Vector3) {
            const direction = target.clone().sub(this.group.position)
            direction.y = 0
            if (direction.lengthSq() > 0.001) {
                this.group.rotation.y = Math.atan2(direction.x, direction.z)
                this.state.facingDirection.copy(direction.normalize())
            }
        } else if (target instanceof ArenaEntity) {
            this.lookAt(target.group.position)
        }
    }
    
    distanceTo(other) {
        if (other instanceof ArenaEntity) {
            return this.group.position.distanceTo(other.group.position)
        }
        return this.group.position.distanceTo(other)
    }
    
    canAttack(target) {
        if (!target || !this.state.isAlive || !target.state.isAlive) return false
        
        const distance = this.distanceTo(target)
        const attackRange = 3
        
        return distance <= attackRange
    }
    
    setPosition(position) {
        if (position instanceof THREE.Vector3) {
            this.position.copy(position)
        } else {
            this.position.set(position.x || 0, position.y || 0, position.z || 0)
        }
        this.group.position.copy(this.position)
    }
    
    getPosition() {
        return this.group.position.clone()
    }
    
    getHealthPercent() {
        return this.stats.health / this.stats.maxHealth
    }
    
    getStaminaPercent() {
        return this.stats.stamina / this.stats.maxStamina
    }
    
    addComponent(name, component) {
        component.entity = this
        this.components.set(name, component)
        
        if (component.onAttach) {
            component.onAttach()
        }
    }
    
    getComponent(name) {
        return this.components.get(name)
    }
    
    removeComponent(name) {
        const component = this.components.get(name)
        if (component) {
            if (component.onDetach) {
                component.onDetach()
            }
            this.components.delete(name)
        }
    }
    
    update(deltaTime, input = null) {
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
        
        this.components.forEach(component => {
            if (component.update) {
                component.update(deltaTime, input)
            }
        })
        
        if (this.state.stamina < this.stats.maxStamina && !this.state.isRunning) {
            this.stats.stamina = Math.min(
                this.stats.maxStamina,
                this.stats.stamina + 10 * deltaTime
            )
        }
    }
    
    serialize() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            rotation: this.rotation,
            stats: { ...this.stats },
            effectiveStats: { ...this.effectiveStats },
            powerScore: this.powerScore,
            powerRanking: this.powerRanking,
            state: {
                isAlive: this.state.isAlive,
                health: this.stats.health
            }
        }
    }
    
    getPowerScore() {
        return this.powerScore
    }
    
    getPowerRanking() {
        return this.powerRanking
    }
    
    dispose() {
        this.components.forEach(component => {
            if (component.dispose) {
                component.dispose()
            }
        })
        this.components.clear()
        
        if (this.mixer) {
            this.mixer.stopAllAction()
        }
        
        this.group.traverse(child => {
            if (child.geometry) child.geometry.dispose()
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose())
                } else {
                    child.material.dispose()
                }
            }
        })
        
        if (this.group.parent) {
            this.group.parent.remove(this.group)
        }
    }
}

export default ArenaEntity
