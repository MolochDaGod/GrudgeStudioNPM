import * as THREE from 'three'

export class AnimationState {
  constructor(name, animation, options = {}) {
    this.name = name
    this.animation = animation
    this.loop = options.loop ?? true
    this.speed = options.speed ?? 1
    this.blendTime = options.blendTime ?? 0.25
    this.transitions = new Map()
    this.conditions = []
    this.onEnter = options.onEnter ?? null
    this.onExit = options.onExit ?? null
    this.onUpdate = options.onUpdate ?? null
  }

  addTransition(toState, condition, options = {}) {
    this.transitions.set(toState, {
      condition,
      blendTime: options.blendTime ?? this.blendTime,
      priority: options.priority ?? 0
    })
    return this
  }

  addCondition(condition) {
    this.conditions.push(condition)
    return this
  }

  canEnter(context) {
    return this.conditions.every(condition => condition(context))
  }
}

export class AnimationStateMachine {
  constructor(animationController, context = {}) {
    this.controller = animationController
    this.context = context
    this.states = new Map()
    this.currentState = null
    this.previousState = null
    this.anyStateTransitions = []
    this.locked = false
    this.lockTimer = 0
    
    this.onStateChange = null
  }

  addState(state) {
    if (typeof state === 'string') {
      state = new AnimationState(state, state)
    }
    this.states.set(state.name, state)
    return this
  }

  addStates(states) {
    for (const state of states) {
      this.addState(state)
    }
    return this
  }

  addAnyStateTransition(toState, condition, options = {}) {
    this.anyStateTransitions.push({
      toState,
      condition,
      blendTime: options.blendTime ?? 0.25,
      priority: options.priority ?? 0
    })
    this.anyStateTransitions.sort((a, b) => b.priority - a.priority)
    return this
  }

  start(stateName) {
    const state = this.states.get(stateName)
    if (!state) {
      console.warn(`Animation state "${stateName}" not found`)
      return this
    }

    this.currentState = state
    this.playCurrentState()
    
    if (state.onEnter) {
      state.onEnter(this.context)
    }

    return this
  }

  playCurrentState() {
    if (!this.currentState) return

    this.controller.play(this.currentState.animation, {
      loop: this.currentState.loop ? THREE.LoopRepeat : THREE.LoopOnce,
      clampWhenFinished: !this.currentState.loop,
      timeScale: this.currentState.speed,
      fadeInDuration: this.currentState.blendTime
    })
  }

  transition(stateName, immediate = false) {
    if (this.locked) return false

    const state = this.states.get(stateName)
    if (!state || state === this.currentState) return false

    if (!state.canEnter(this.context)) return false

    this.previousState = this.currentState

    if (this.currentState?.onExit) {
      this.currentState.onExit(this.context)
    }

    this.currentState = state

    const blendTime = immediate ? 0 : state.blendTime
    this.controller.play(state.animation, {
      loop: state.loop ? THREE.LoopRepeat : THREE.LoopOnce,
      clampWhenFinished: !state.loop,
      timeScale: state.speed,
      fadeInDuration: blendTime
    })

    if (state.onEnter) {
      state.onEnter(this.context)
    }

    if (this.onStateChange) {
      this.onStateChange(this.previousState?.name, state.name)
    }

    return true
  }

  lock(duration) {
    this.locked = true
    this.lockTimer = duration
    return this
  }

  unlock() {
    this.locked = false
    this.lockTimer = 0
    return this
  }

  update(deltaTime) {
    this.controller.update(deltaTime)

    if (this.locked) {
      this.lockTimer -= deltaTime
      if (this.lockTimer <= 0) {
        this.unlock()
      }
    }

    if (this.currentState?.onUpdate) {
      this.currentState.onUpdate(this.context, deltaTime)
    }

    if (this.locked) return this

    for (const anyTransition of this.anyStateTransitions) {
      if (anyTransition.condition(this.context)) {
        if (this.transition(anyTransition.toState)) {
          return this
        }
      }
    }

    if (this.currentState) {
      const transitions = Array.from(this.currentState.transitions.entries())
        .map(([toState, data]) => ({ toState, ...data }))
        .sort((a, b) => b.priority - a.priority)

      for (const trans of transitions) {
        if (trans.condition(this.context)) {
          this.transition(trans.toState)
          break
        }
      }
    }

    return this
  }

  getCurrentStateName() {
    return this.currentState?.name
  }

  isInState(name) {
    return this.currentState?.name === name
  }

  isAnyState(...names) {
    return names.includes(this.currentState?.name)
  }

  setContext(key, value) {
    this.context[key] = value
    return this
  }

  getContext(key) {
    return this.context[key]
  }
}
