import { GameConfig } from '../core/GameState.js'

export class AIController {
  constructor(fighter, difficulty = 0.5) {
    this.fighter = fighter
    this.difficulty = difficulty
    this.reactionTime = 1.5 - difficulty
    this.aggressiveness = 0.3 + difficulty * 0.4
    this.decisionTimer = 0
    this.currentAction = 'idle'
    
    this.fakeInput = {
      getMovementVector: () => this.movementVector,
      isRunning: () => this.isRunning,
      isJumpPressed: () => this.shouldJump,
      isLightAttack: () => this.attackType === 'light',
      isHeavyAttack: () => this.attackType === 'heavy',
      isSpecialAttack: () => this.attackType === 'special'
    }
    
    this.movementVector = { x: 0, z: 0 }
    this.isRunning = false
    this.shouldJump = false
    this.attackType = null
  }
  
  update(deltaTime, player) {
    this.decisionTimer -= deltaTime
    
    if (this.decisionTimer <= 0) {
      this.makeDecision(player)
      this.decisionTimer = this.reactionTime * (0.5 + Math.random() * 0.5)
    }
    
    this.executeAction(player)
    
    this.shouldJump = false
    this.attackType = null
    
    return this.fakeInput
  }
  
  makeDecision(player) {
    const distance = this.fighter.getPosition().distanceTo(player.getPosition())
    const healthRatio = this.fighter.getHealthPercent()
    const playerHealthRatio = player.getHealthPercent()
    
    if (distance > 8) {
      this.currentAction = 'approach'
    } else if (distance < 2) {
      if (Math.random() < this.aggressiveness) {
        this.currentAction = 'attack'
      } else {
        this.currentAction = 'retreat'
      }
    } else if (distance < 4) {
      if (healthRatio > playerHealthRatio && Math.random() < this.aggressiveness) {
        this.currentAction = 'approach'
      } else if (Math.random() < 0.3) {
        this.currentAction = 'strafe'
      } else {
        this.currentAction = 'idle'
      }
    } else {
      if (Math.random() < 0.4 + this.aggressiveness * 0.3) {
        this.currentAction = 'approach'
      } else {
        this.currentAction = 'strafe'
      }
    }
    
    if (Math.random() < 0.1 && this.fighter.isGrounded) {
      this.shouldJump = true
    }
  }
  
  executeAction(player) {
    const toPlayer = player.getPosition().clone().sub(this.fighter.getPosition())
    toPlayer.y = 0
    const distance = toPlayer.length()
    toPlayer.normalize()
    
    switch (this.currentAction) {
      case 'approach':
        this.movementVector = { x: toPlayer.x, z: toPlayer.z }
        this.isRunning = distance > 6
        
        if (distance < 3 && Math.random() < this.difficulty * 0.3) {
          this.chooseAttack(distance)
        }
        break
        
      case 'retreat':
        this.movementVector = { x: -toPlayer.x, z: -toPlayer.z }
        this.isRunning = true
        break
        
      case 'strafe':
        const perpendicular = Math.random() < 0.5 ? 1 : -1
        this.movementVector = { 
          x: -toPlayer.z * perpendicular, 
          z: toPlayer.x * perpendicular 
        }
        this.isRunning = false
        break
        
      case 'attack':
        this.movementVector = { x: toPlayer.x * 0.3, z: toPlayer.z * 0.3 }
        this.chooseAttack(distance)
        break
        
      default:
        this.movementVector = { x: 0, z: 0 }
        this.isRunning = false
    }
  }
  
  chooseAttack(distance) {
    if (distance > GameConfig.fighter.attacks.special.range) return
    
    const roll = Math.random()
    
    if (roll < 0.5) {
      this.attackType = 'light'
    } else if (roll < 0.8) {
      this.attackType = 'heavy'
    } else if (this.fighter.cooldowns.special <= 0) {
      this.attackType = 'special'
    } else {
      this.attackType = 'light'
    }
  }
  
  setDifficulty(difficulty) {
    this.difficulty = Math.max(0, Math.min(1, difficulty))
    this.reactionTime = 1.5 - this.difficulty
    this.aggressiveness = 0.3 + this.difficulty * 0.4
  }
}
