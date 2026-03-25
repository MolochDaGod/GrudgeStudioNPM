import * as THREE from 'three'

export const AnimationState = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  ATTACK_1: 'attack_1',
  ATTACK_2: 'attack_2',
  BLOCK: 'block',
  HIT: 'hit_damage',
  DEATH: 'death'
}

export class AnimationLayer {
  constructor(model) {
    this.model = model
    this.mixer = null
    this.clips = new Map()
    this.actions = new Map()
    this.currentState = null
    this.currentAction = null
    this.blendTime = 0.2
    this.speedScale = 1.0
    
    this.stateConfig = {
      [AnimationState.IDLE]: { loop: THREE.LoopRepeat, clampWhenFinished: false },
      [AnimationState.WALK]: { loop: THREE.LoopRepeat, clampWhenFinished: false },
      [AnimationState.RUN]: { loop: THREE.LoopRepeat, clampWhenFinished: false },
      [AnimationState.JUMP]: { loop: THREE.LoopOnce, clampWhenFinished: true },
      [AnimationState.ATTACK_1]: { loop: THREE.LoopOnce, clampWhenFinished: true },
      [AnimationState.ATTACK_2]: { loop: THREE.LoopOnce, clampWhenFinished: true },
      [AnimationState.BLOCK]: { loop: THREE.LoopRepeat, clampWhenFinished: false },
      [AnimationState.HIT]: { loop: THREE.LoopOnce, clampWhenFinished: true },
      [AnimationState.DEATH]: { loop: THREE.LoopOnce, clampWhenFinished: true }
    }
    
    this.onAnimationComplete = null
  }
  
  init(animations) {
    if (!this.model || !animations || animations.length === 0) return
    
    this.mixer = new THREE.AnimationMixer(this.model)
    
    this.mixer.addEventListener('finished', (e) => {
      if (this.onAnimationComplete) {
        const stateName = this.findStateForAction(e.action)
        this.onAnimationComplete(stateName)
      }
    })
    
    animations.forEach((clip) => {
      const normalizedName = this.normalizeClipName(clip.name)
      this.clips.set(normalizedName, clip)
      
      const action = this.mixer.clipAction(clip)
      this.actions.set(normalizedName, action)
    })
    
    console.log('Animation clips loaded:', Array.from(this.clips.keys()))
  }
  
  normalizeClipName(name) {
    const lowerName = name.toLowerCase()
    
    if (lowerName.includes('idle') || lowerName.includes('stand')) {
      return AnimationState.IDLE
    }
    if (lowerName.includes('walk')) {
      return AnimationState.WALK
    }
    if (lowerName.includes('run') || lowerName.includes('sprint')) {
      return AnimationState.RUN
    }
    if (lowerName.includes('jump') || lowerName.includes('leap')) {
      return AnimationState.JUMP
    }
    if (lowerName.includes('attack_1') || lowerName.includes('slash') || lowerName.includes('swing')) {
      return AnimationState.ATTACK_1
    }
    if (lowerName.includes('attack_2') || lowerName.includes('thrust') || lowerName.includes('stab')) {
      return AnimationState.ATTACK_2
    }
    if (lowerName.includes('block') || lowerName.includes('defend') || lowerName.includes('guard')) {
      return AnimationState.BLOCK
    }
    if (lowerName.includes('hit') || lowerName.includes('damage') || lowerName.includes('hurt')) {
      return AnimationState.HIT
    }
    if (lowerName.includes('death') || lowerName.includes('die') || lowerName.includes('dead')) {
      return AnimationState.DEATH
    }
    
    return name.toLowerCase()
  }
  
  findStateForAction(action) {
    for (const [state, act] of this.actions.entries()) {
      if (act === action) return state
    }
    return null
  }
  
  hasAnimation(state) {
    return this.actions.has(state)
  }
  
  play(state, options = {}) {
    if (!this.mixer) return false
    
    const action = this.actions.get(state)
    if (!action) {
      return false
    }
    
    if (this.currentState === state && this.currentAction?.isRunning()) {
      return true
    }
    
    const config = this.stateConfig[state] || { loop: THREE.LoopRepeat, clampWhenFinished: false }
    const blendTime = options.blendTime ?? this.blendTime
    const timeScale = options.timeScale ?? this.speedScale
    
    action.reset()
    action.setLoop(config.loop)
    action.clampWhenFinished = config.clampWhenFinished
    action.timeScale = timeScale
    
    if (this.currentAction) {
      this.currentAction.fadeOut(blendTime)
    }
    
    action.fadeIn(blendTime)
    action.play()
    
    this.currentAction = action
    this.currentState = state
    
    return true
  }
  
  crossfadeTo(state, duration = 0.3) {
    return this.play(state, { blendTime: duration })
  }
  
  stop() {
    if (this.currentAction) {
      this.currentAction.fadeOut(0.2)
      this.currentAction = null
      this.currentState = null
    }
  }
  
  setSpeed(scale) {
    this.speedScale = scale
    if (this.currentAction) {
      this.currentAction.timeScale = scale
    }
  }
  
  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime)
    }
  }
  
  getCurrentState() {
    return this.currentState
  }
  
  isPlaying(state) {
    return this.currentState === state && this.currentAction?.isRunning()
  }
  
  getAnimationDuration(state) {
    const clip = this.clips.get(state)
    return clip ? clip.duration : 0
  }
  
  dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer.uncacheRoot(this.model)
    }
    this.clips.clear()
    this.actions.clear()
  }
}
