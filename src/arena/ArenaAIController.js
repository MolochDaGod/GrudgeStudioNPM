/*
    GRUDGE Studio - Arena AI Controller
    Intelligent AI for arena opponents
*/

import * as THREE from 'three'

export const AIBehavior = {
    IDLE: 'idle',
    APPROACH: 'approach',
    CIRCLE: 'circle',
    ATTACK: 'attack',
    RETREAT: 'retreat',
    BLOCK: 'block',
    DODGE: 'dodge'
}

export const AIDifficulty = {
    EASY: { reactionTime: 800, accuracy: 0.4, aggression: 0.3, blockChance: 0.2 },
    MEDIUM: { reactionTime: 500, accuracy: 0.6, aggression: 0.5, blockChance: 0.4 },
    HARD: { reactionTime: 300, accuracy: 0.8, aggression: 0.7, blockChance: 0.6 },
    NIGHTMARE: { reactionTime: 150, accuracy: 0.95, aggression: 0.85, blockChance: 0.8 }
}

export class ArenaAIController {
    constructor(entity, difficulty = 'MEDIUM') {
        this.entity = entity
        this.target = null
        
        this.difficulty = AIDifficulty[difficulty] || AIDifficulty.MEDIUM
        this.behavior = AIBehavior.IDLE
        this.nextDecisionTime = 0
        this.decisionInterval = 500
        
        this.circleDirection = Math.random() > 0.5 ? 1 : -1
        this.circleTimer = 0
        this.retreatTimer = 0
        
        this.preferredRange = 2.5
        this.attackRange = 3
        this.retreatRange = 5
        
        this.comboCounter = 0
        this.maxCombo = 3
        this.lastAttackType = null
    }
    
    setTarget(target) {
        this.target = target
    }
    
    setDifficulty(level) {
        this.difficulty = AIDifficulty[level] || AIDifficulty.MEDIUM
    }
    
    update(deltaTime) {
        if (!this.entity || !this.target || !this.entity.state.isAlive) {
            return this.createIdleInput()
        }
        
        const now = Date.now()
        
        if (now >= this.nextDecisionTime) {
            this.makeDecision()
            this.nextDecisionTime = now + this.decisionInterval * (0.8 + Math.random() * 0.4)
        }
        
        return this.executeBehavior(deltaTime)
    }
    
    makeDecision() {
        if (!this.target.state.isAlive) {
            this.behavior = AIBehavior.IDLE
            return
        }
        
        const distance = this.entity.distanceTo(this.target)
        const healthPercent = this.entity.getHealthPercent()
        const targetHealthPercent = this.target.getHealthPercent()
        
        if (healthPercent < 0.2 && Math.random() < 0.6) {
            this.behavior = AIBehavior.RETREAT
            this.retreatTimer = 2000
            return
        }
        
        if (this.target.state.isAttacking && Math.random() < this.difficulty.blockChance) {
            if (distance < this.attackRange) {
                this.behavior = Math.random() < 0.5 ? AIBehavior.BLOCK : AIBehavior.DODGE
                return
            }
        }
        
        if (distance > this.preferredRange * 2) {
            this.behavior = AIBehavior.APPROACH
            return
        }
        
        if (distance <= this.attackRange) {
            if (Math.random() < this.difficulty.aggression) {
                this.behavior = AIBehavior.ATTACK
                return
            }
        }
        
        if (distance < this.preferredRange && Math.random() < 0.3) {
            this.behavior = AIBehavior.CIRCLE
            this.circleTimer = 1000 + Math.random() * 1000
            return
        }
        
        this.behavior = AIBehavior.APPROACH
    }
    
    executeBehavior(deltaTime) {
        const input = this.createIdleInput()
        
        switch (this.behavior) {
            case AIBehavior.APPROACH:
                return this.executeApproach(input)
                
            case AIBehavior.CIRCLE:
                return this.executeCircle(input, deltaTime)
                
            case AIBehavior.ATTACK:
                return this.executeAttack(input)
                
            case AIBehavior.RETREAT:
                return this.executeRetreat(input, deltaTime)
                
            case AIBehavior.BLOCK:
                return this.executeBlock(input)
                
            case AIBehavior.DODGE:
                return this.executeDodge(input)
                
            case AIBehavior.IDLE:
            default:
                return input
        }
    }
    
    createIdleInput() {
        return {
            forward: false,
            backward: false,
            left: false,
            right: false,
            attack: false,
            attackType: null,
            block: false,
            dodge: false,
            run: false,
            moveDirection: new THREE.Vector3()
        }
    }
    
    executeApproach(input) {
        const direction = this.getDirectionToTarget()
        const distance = this.entity.distanceTo(this.target)
        
        if (distance > this.preferredRange) {
            input.moveDirection.copy(direction)
            input.forward = true
            input.run = distance > this.preferredRange * 2
        }
        
        this.entity.lookAt(this.target)
        return input
    }
    
    executeCircle(input, deltaTime) {
        this.circleTimer -= deltaTime * 1000
        
        if (this.circleTimer <= 0) {
            this.behavior = AIBehavior.APPROACH
            return input
        }
        
        const toTarget = this.getDirectionToTarget()
        const perpendicular = new THREE.Vector3(-toTarget.z, 0, toTarget.x)
        perpendicular.multiplyScalar(this.circleDirection)
        
        const distance = this.entity.distanceTo(this.target)
        
        if (distance > this.preferredRange * 1.2) {
            perpendicular.add(toTarget.multiplyScalar(0.5))
        } else if (distance < this.preferredRange * 0.8) {
            perpendicular.sub(toTarget.multiplyScalar(0.3))
        }
        
        input.moveDirection.copy(perpendicular.normalize())
        
        this.entity.lookAt(this.target)
        return input
    }
    
    executeAttack(input) {
        const distance = this.entity.distanceTo(this.target)
        
        if (distance > this.attackRange) {
            return this.executeApproach(input)
        }
        
        if (Math.random() < this.difficulty.accuracy) {
            input.attack = true
            input.attackType = this.chooseAttackType()
        }
        
        this.entity.lookAt(this.target)
        this.behavior = AIBehavior.CIRCLE
        this.circleTimer = 500 + Math.random() * 500
        
        return input
    }
    
    chooseAttackType() {
        if (this.comboCounter >= this.maxCombo) {
            this.comboCounter = 0
            return 'heavy'
        }
        
        const roll = Math.random()
        
        if (roll < 0.6) {
            this.comboCounter++
            return 'light'
        } else if (roll < 0.85) {
            this.comboCounter = 0
            return 'heavy'
        } else {
            this.comboCounter = 0
            return 'special'
        }
    }
    
    executeRetreat(input, deltaTime) {
        this.retreatTimer -= deltaTime * 1000
        
        if (this.retreatTimer <= 0) {
            this.behavior = AIBehavior.CIRCLE
            return input
        }
        
        const direction = this.getDirectionToTarget()
        input.moveDirection.copy(direction).negate()
        input.backward = true
        input.run = true
        
        this.entity.lookAt(this.target)
        return input
    }
    
    executeBlock(input) {
        input.block = true
        
        setTimeout(() => {
            this.behavior = AIBehavior.CIRCLE
        }, this.difficulty.reactionTime)
        
        return input
    }
    
    executeDodge(input) {
        input.dodge = true
        input.moveDirection.set(
            Math.random() > 0.5 ? 1 : -1,
            0,
            Math.random() > 0.5 ? 0.5 : -0.5
        ).normalize()
        
        this.behavior = AIBehavior.CIRCLE
        return input
    }
    
    getDirectionToTarget() {
        if (!this.target) return new THREE.Vector3(0, 0, -1)
        
        const direction = this.target.getPosition().sub(this.entity.getPosition())
        direction.y = 0
        return direction.normalize()
    }
    
    reset() {
        this.behavior = AIBehavior.IDLE
        this.nextDecisionTime = 0
        this.comboCounter = 0
        this.circleTimer = 0
        this.retreatTimer = 0
    }
}

export default ArenaAIController
