import * as THREE from 'three'

export class AnimationState {
    constructor(name, options = {}) {
        this.name = name
        this.animation = options.animation || null
        this.speed = options.speed || 1.0
        this.loop = options.loop !== false
        this.blendWeight = 1.0
        this.transitions = new Map()
        this.onEnter = options.onEnter || null
        this.onExit = options.onExit || null
        this.onUpdate = options.onUpdate || null
    }

    addTransition(targetState, condition, options = {}) {
        this.transitions.set(targetState, {
            condition,
            duration: options.duration || 0.2,
            interruptible: options.interruptible !== false
        })
    }
}

export class BlendTree {
    constructor(name, options = {}) {
        this.name = name
        this.type = options.type || '1D'
        this.parameter = options.parameter || 'speed'
        this.nodes = []
    }

    addNode(animation, threshold, options = {}) {
        this.nodes.push({
            animation,
            threshold,
            weight: 0,
            speed: options.speed || 1.0
        })
        this.nodes.sort((a, b) => a.threshold - b.threshold)
    }

    evaluate(parameterValue) {
        if (this.nodes.length === 0) return []

        this.nodes.forEach(node => node.weight = 0)

        if (this.nodes.length === 1) {
            this.nodes[0].weight = 1
            return this.nodes
        }

        let lowerNode = this.nodes[0]
        let upperNode = this.nodes[this.nodes.length - 1]

        for (let i = 0; i < this.nodes.length - 1; i++) {
            if (parameterValue >= this.nodes[i].threshold && 
                parameterValue <= this.nodes[i + 1].threshold) {
                lowerNode = this.nodes[i]
                upperNode = this.nodes[i + 1]
                break
            }
        }

        if (parameterValue <= lowerNode.threshold) {
            lowerNode.weight = 1
        } else if (parameterValue >= upperNode.threshold) {
            upperNode.weight = 1
        } else {
            const range = upperNode.threshold - lowerNode.threshold
            const t = (parameterValue - lowerNode.threshold) / range
            lowerNode.weight = 1 - t
            upperNode.weight = t
        }

        return this.nodes.filter(n => n.weight > 0)
    }
}

export class AnimationStateMachine {
    constructor(mixer) {
        this.mixer = mixer
        this.states = new Map()
        this.currentState = null
        this.previousState = null
        this.parameters = new Map()
        this.blendTrees = new Map()
        this.transitionProgress = 0
        this.isTransitioning = false
        this.transitionDuration = 0
        this.activeActions = new Map()
        this.defaultState = null
    }

    addState(name, options = {}) {
        const state = new AnimationState(name, options)
        this.states.set(name, state)
        
        if (!this.defaultState) {
            this.defaultState = name
        }
        
        return state
    }

    addBlendTree(name, options = {}) {
        const tree = new BlendTree(name, options)
        this.blendTrees.set(name, tree)
        return tree
    }

    setParameter(name, value) {
        this.parameters.set(name, value)
    }

    getParameter(name) {
        return this.parameters.get(name)
    }

    addTransition(fromState, toState, condition, options = {}) {
        const state = this.states.get(fromState)
        if (state) {
            state.addTransition(toState, condition, options)
        }
    }

    addAnyStateTransition(toState, condition, options = {}) {
        this.states.forEach((state, name) => {
            if (name !== toState) {
                state.addTransition(toState, condition, {
                    ...options,
                    interruptible: true
                })
            }
        })
    }

    start(stateName) {
        const state = this.states.get(stateName || this.defaultState)
        if (!state) return

        this.currentState = state
        this.playStateAnimation(state)
        
        if (state.onEnter) {
            state.onEnter(this)
        }
    }

    playStateAnimation(state) {
        if (!this.mixer) return

        if (state.animation) {
            const action = this.getOrCreateAction(state.animation)
            if (action) {
                action.reset()
                action.setLoop(state.loop ? THREE.LoopRepeat : THREE.LoopOnce)
                action.clampWhenFinished = !state.loop
                action.setEffectiveTimeScale(state.speed)
                action.setEffectiveWeight(state.blendWeight)
                action.play()
            }
        }
    }

    getOrCreateAction(clip) {
        if (!clip) return null
        
        let action = this.activeActions.get(clip.name)
        if (!action) {
            action = this.mixer.clipAction(clip)
            this.activeActions.set(clip.name, action)
        }
        return action
    }

    transitionTo(stateName, duration = 0.2) {
        const targetState = this.states.get(stateName)
        if (!targetState || targetState === this.currentState) return

        this.previousState = this.currentState
        this.isTransitioning = true
        this.transitionDuration = duration
        this.transitionProgress = 0

        if (this.previousState?.onExit) {
            this.previousState.onExit(this)
        }

        this.currentState = targetState

        if (targetState.animation) {
            const action = this.getOrCreateAction(targetState.animation)
            if (action) {
                action.reset()
                action.setLoop(targetState.loop ? THREE.LoopRepeat : THREE.LoopOnce)
                action.clampWhenFinished = !targetState.loop
                action.play()

                if (this.previousState?.animation) {
                    const prevAction = this.activeActions.get(this.previousState.animation.name)
                    if (prevAction) {
                        action.crossFadeFrom(prevAction, duration, true)
                    }
                }
            }
        }

        if (targetState.onEnter) {
            targetState.onEnter(this)
        }
    }

    update(deltaTime) {
        if (!this.currentState) return

        if (this.isTransitioning) {
            this.transitionProgress += deltaTime / this.transitionDuration
            if (this.transitionProgress >= 1) {
                this.isTransitioning = false
                this.transitionProgress = 0
            }
        }

        this.currentState.transitions.forEach((transition, targetStateName) => {
            if (transition.condition(this)) {
                if (!this.isTransitioning || transition.interruptible) {
                    this.transitionTo(targetStateName, transition.duration)
                }
            }
        })

        this.blendTrees.forEach((tree, name) => {
            const paramValue = this.parameters.get(tree.parameter) || 0
            const activeNodes = tree.evaluate(paramValue)
            
            activeNodes.forEach(node => {
                const action = this.activeActions.get(node.animation?.name)
                if (action) {
                    action.setEffectiveWeight(node.weight)
                }
            })
        })

        if (this.currentState.onUpdate) {
            this.currentState.onUpdate(this, deltaTime)
        }

        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
    }

    getCurrentStateName() {
        return this.currentState?.name || null
    }

    isInState(stateName) {
        return this.currentState?.name === stateName
    }

    trigger(triggerName) {
        this.setParameter(triggerName, true)
        
        setTimeout(() => {
            this.setParameter(triggerName, false)
        }, 16)
    }

    stop() {
        this.activeActions.forEach(action => {
            action.stop()
        })
        this.currentState = null
        this.previousState = null
    }

    dispose() {
        this.stop()
        this.activeActions.clear()
        this.states.clear()
        this.blendTrees.clear()
        this.parameters.clear()
    }
}

export function createLocomotionStateMachine(mixer, animations) {
    const sm = new AnimationStateMachine(mixer)
    
    sm.setParameter('speed', 0)
    sm.setParameter('isGrounded', true)
    sm.setParameter('isAttacking', false)

    sm.addState('idle', { 
        animation: animations.idle, 
        loop: true,
        speed: 1.0
    })

    sm.addState('walk', { 
        animation: animations.walk, 
        loop: true,
        speed: 1.0
    })

    sm.addState('run', { 
        animation: animations.run, 
        loop: true,
        speed: 1.0
    })

    sm.addState('jump', { 
        animation: animations.jump, 
        loop: false,
        speed: 1.2
    })

    sm.addState('attack', { 
        animation: animations.attack, 
        loop: false,
        speed: 1.5
    })

    sm.addTransition('idle', 'walk', (fsm) => fsm.getParameter('speed') > 0.1)
    sm.addTransition('walk', 'idle', (fsm) => fsm.getParameter('speed') < 0.1)
    sm.addTransition('walk', 'run', (fsm) => fsm.getParameter('speed') > 0.6)
    sm.addTransition('run', 'walk', (fsm) => fsm.getParameter('speed') < 0.5)

    sm.addAnyStateTransition('jump', (fsm) => !fsm.getParameter('isGrounded'), { duration: 0.1 })
    sm.addAnyStateTransition('attack', (fsm) => fsm.getParameter('isAttacking'), { duration: 0.1 })

    const locomotionTree = sm.addBlendTree('locomotion', {
        type: '1D',
        parameter: 'speed'
    })
    
    if (animations.idle) locomotionTree.addNode(animations.idle, 0)
    if (animations.walk) locomotionTree.addNode(animations.walk, 0.5)
    if (animations.run) locomotionTree.addNode(animations.run, 1.0)

    sm.start('idle')

    return sm
}
