import * as THREE from 'three'

export const AIBehaviorState = {
    IDLE: 'idle',
    AGGRESSIVE: 'aggressive',
    DEFENSIVE: 'defensive',
    RETREATING: 'retreating',
    CIRCLING: 'circling',
    COMBO_ATTACK: 'combo_attack'
}

class BehaviorNode {
    constructor(name) {
        this.name = name
    }
    tick(context) { return 'success' }
}

class Selector extends BehaviorNode {
    constructor(name, children = []) {
        super(name)
        this.children = children
    }
    
    tick(context) {
        for (const child of this.children) {
            const result = child.tick(context)
            if (result === 'success' || result === 'running') {
                return result
            }
        }
        return 'failure'
    }
}

class Sequence extends BehaviorNode {
    constructor(name, children = []) {
        super(name)
        this.children = children
    }
    
    tick(context) {
        for (const child of this.children) {
            const result = child.tick(context)
            if (result === 'failure' || result === 'running') {
                return result
            }
        }
        return 'success'
    }
}

class Condition extends BehaviorNode {
    constructor(name, check) {
        super(name)
        this.check = check
    }
    
    tick(context) {
        return this.check(context) ? 'success' : 'failure'
    }
}

class Action extends BehaviorNode {
    constructor(name, execute) {
        super(name)
        this.execute = execute
    }
    
    tick(context) {
        return this.execute(context)
    }
}

export class EnhancedAIController {
    constructor(fighter, difficulty = 0.5) {
        this.fighter = fighter
        this.difficulty = Math.max(0, Math.min(1, difficulty))
        this.target = null
        
        this.state = AIBehaviorState.IDLE
        this.stateTimer = 0
        this.actionCooldown = 0
        this.reactionDelay = (1 - this.difficulty) * 0.5
        
        this.optimalDistance = 2.5
        this.aggressiveDistance = 2.0
        this.retreatDistance = 1.5
        this.circleDirection = Math.random() < 0.5 ? 1 : -1
        
        this.comboSequence = []
        this.comboIndex = 0
        
        this.memory = {
            lastPlayerAttackTime: 0,
            playerAttackPattern: [],
            successfulCounters: 0,
            damageReceived: 0
        }
        
        this.behaviorTree = this.buildBehaviorTree()
    }

    buildBehaviorTree() {
        return new Selector('root', [
            new Sequence('emergency_retreat', [
                new Condition('health_critical', (ctx) => ctx.healthPercent < 0.2),
                new Action('retreat', (ctx) => this.executeRetreat(ctx))
            ]),

            new Sequence('counter_attack', [
                new Condition('player_attacking', (ctx) => ctx.playerIsAttacking),
                new Condition('can_counter', (ctx) => this.canCounter()),
                new Action('perform_counter', (ctx) => this.executeCounter(ctx))
            ]),

            new Sequence('combo_execute', [
                new Condition('in_combo', () => this.comboSequence.length > 0),
                new Action('continue_combo', (ctx) => this.executeComboContinue(ctx))
            ]),

            new Selector('distance_behavior', [
                new Sequence('too_close', [
                    new Condition('distance_close', (ctx) => ctx.distance < this.retreatDistance),
                    new Selector('close_response', [
                        new Sequence('block_or_counter', [
                            new Condition('should_block', () => Math.random() < 0.4 + this.difficulty * 0.3),
                            new Action('block', (ctx) => this.executeBlock(ctx))
                        ]),
                        new Action('dodge_back', (ctx) => this.executeDodge(ctx, 'back'))
                    ])
                ]),

                new Sequence('in_range', [
                    new Condition('in_attack_range', (ctx) => ctx.distance < this.aggressiveDistance),
                    new Selector('attack_choice', [
                        new Sequence('heavy_attack', [
                            new Condition('should_heavy', () => Math.random() < 0.2 + this.difficulty * 0.2),
                            new Action('heavy', (ctx) => this.executeAttack(ctx, 'heavy'))
                        ]),
                        new Action('light_attack', (ctx) => this.executeAttack(ctx, 'light'))
                    ])
                ]),

                new Sequence('approach', [
                    new Condition('too_far', (ctx) => ctx.distance > this.optimalDistance),
                    new Selector('approach_style', [
                        new Sequence('circle_approach', [
                            new Condition('should_circle', () => Math.random() < 0.3),
                            new Action('circle', (ctx) => this.executeCircle(ctx))
                        ]),
                        new Action('move_toward', (ctx) => this.executeMoveToward(ctx))
                    ])
                ])
            ]),

            new Action('idle_behavior', (ctx) => this.executeIdle(ctx))
        ])
    }

    update(deltaTime, player) {
        this.target = player
        this.stateTimer += deltaTime
        
        if (this.actionCooldown > 0) {
            this.actionCooldown -= deltaTime
        }
        
        const context = this.buildContext(player)
        
        this.behaviorTree.tick(context)
        
        this.updateMemory(player)
        
        return this.buildInput()
    }

    buildContext(player) {
        const fighterPos = this.fighter.getPosition()
        const playerPos = player.getPosition()
        const distance = fighterPos.distanceTo(playerPos)
        
        return {
            deltaTime: 0.016,
            distance,
            fighterPos,
            playerPos,
            healthPercent: this.fighter.getHealthPercent(),
            playerHealthPercent: player.getHealthPercent(),
            playerIsAttacking: player.isAttacking,
            playerIsBlocking: player.isBlocking,
            canAttack: this.actionCooldown <= 0 && !this.fighter.isAttacking,
            directionToPlayer: playerPos.clone().sub(fighterPos).normalize()
        }
    }

    executeRetreat(context) {
        this.state = AIBehaviorState.RETREATING
        this.moveInput = context.directionToPlayer.clone().negate()
        return 'success'
    }

    executeCounter(context) {
        if (this.actionCooldown > 0) return 'failure'
        
        this.attackType = 'light'
        this.actionCooldown = 0.3
        this.memory.successfulCounters++
        return 'success'
    }

    executeBlock(context) {
        this.isBlocking = true
        return 'success'
    }

    executeDodge(context, direction) {
        this.state = AIBehaviorState.DEFENSIVE
        
        if (direction === 'back') {
            this.moveInput = context.directionToPlayer.clone().negate()
        } else {
            const perpendicular = new THREE.Vector3(-context.directionToPlayer.z, 0, context.directionToPlayer.x)
            this.moveInput = direction === 'left' ? perpendicular : perpendicular.negate()
        }
        
        return 'success'
    }

    executeAttack(context, type) {
        if (this.actionCooldown > 0) return 'failure'
        
        this.state = AIBehaviorState.AGGRESSIVE
        this.attackType = type
        this.actionCooldown = type === 'heavy' ? 0.8 : 0.4
        
        if (type === 'light' && Math.random() < this.difficulty * 0.5) {
            this.startCombo()
        }
        
        return 'success'
    }

    executeCircle(context) {
        this.state = AIBehaviorState.CIRCLING
        
        const perpendicular = new THREE.Vector3(
            -context.directionToPlayer.z,
            0,
            context.directionToPlayer.x
        )
        
        this.moveInput = perpendicular.multiplyScalar(this.circleDirection)
        
        if (Math.random() < 0.02) {
            this.circleDirection *= -1
        }
        
        return 'success'
    }

    executeMoveToward(context) {
        this.state = AIBehaviorState.AGGRESSIVE
        this.moveInput = context.directionToPlayer.clone()
        return 'success'
    }

    executeIdle(context) {
        this.state = AIBehaviorState.IDLE
        this.moveInput = new THREE.Vector3()
        return 'success'
    }

    executeComboContinue(context) {
        if (this.comboIndex >= this.comboSequence.length) {
            this.comboSequence = []
            this.comboIndex = 0
            return 'success'
        }
        
        if (this.actionCooldown > 0) return 'running'
        
        const nextAttack = this.comboSequence[this.comboIndex]
        this.attackType = nextAttack
        this.actionCooldown = nextAttack === 'heavy' ? 0.6 : 0.3
        this.comboIndex++
        
        return 'running'
    }

    startCombo() {
        const combos = [
            ['light', 'light', 'heavy'],
            ['light', 'heavy'],
            ['light', 'light', 'light']
        ]
        
        this.comboSequence = combos[Math.floor(Math.random() * combos.length)]
        this.comboIndex = 1
    }

    canCounter() {
        return this.actionCooldown <= 0 && 
               Math.random() < 0.3 + this.difficulty * 0.4 &&
               this.stateTimer > this.reactionDelay
    }

    updateMemory(player) {
        if (player.isAttacking) {
            this.memory.lastPlayerAttackTime = Date.now()
        }
    }

    buildInput() {
        const input = {
            moveX: 0,
            moveZ: 0,
            attack: null,
            block: false,
            jump: false
        }
        
        if (this.moveInput) {
            input.moveX = this.moveInput.x
            input.moveZ = this.moveInput.z
        }
        
        if (this.attackType && this.actionCooldown <= 0) {
            input.attack = this.attackType
            this.attackType = null
        }
        
        input.block = this.isBlocking
        this.isBlocking = false
        
        this.moveInput = null
        
        return {
            getMovementVector: () => new THREE.Vector3(input.moveX, 0, input.moveZ),
            isRunning: () => false,
            isJumpPressed: () => input.jump,
            isLightAttack: () => input.attack === 'light',
            isHeavyAttack: () => input.attack === 'heavy',
            isSpecialAttack: () => input.attack === 'special',
            isBlocking: () => input.block
        }
    }

    setDifficulty(difficulty) {
        this.difficulty = Math.max(0, Math.min(1, difficulty))
        this.reactionDelay = (1 - this.difficulty) * 0.5
    }

    getState() {
        return this.state
    }

    reset() {
        this.state = AIBehaviorState.IDLE
        this.stateTimer = 0
        this.actionCooldown = 0
        this.comboSequence = []
        this.comboIndex = 0
        this.memory = {
            lastPlayerAttackTime: 0,
            playerAttackPattern: [],
            successfulCounters: 0,
            damageReceived: 0
        }
    }
}
