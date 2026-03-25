/*
    GRUDGE Studio - Animator Component
    Needle Engine-inspired animation controller with state machine and blend trees
*/

import * as THREE from 'three'

export class AnimatorComponent {
    constructor(object3D) {
        this.object = object3D
        this.mixer = null
        this.clips = new Map()
        this.actions = new Map()
        this.layers = new Map()
        
        this.parameters = new Map()
        this.currentState = 'idle'
        this.graph = null
        
        this.isPlaying = false
        this.timeScale = 1.0
        
        this.onStateChange = null
        this.onAnimationComplete = null
        
        this.setupMixer()
    }
    
    setupMixer() {
        this.mixer = new THREE.AnimationMixer(this.object)
        
        this.mixer.addEventListener('finished', (e) => {
            const clipName = e.action.getClip().name
            if (this.onAnimationComplete) {
                this.onAnimationComplete(clipName, e.action)
            }
        })
        
        this.mixer.addEventListener('loop', (e) => {
            const clipName = e.action.getClip().name
        })
    }
    
    addClip(clip, name = null) {
        const clipName = name || clip.name
        this.clips.set(clipName, clip)
        
        const action = this.mixer.clipAction(clip)
        this.actions.set(clipName, action)
        
        return action
    }
    
    addClips(clips) {
        clips.forEach(clip => this.addClip(clip))
    }
    
    setGraph(graphDef) {
        this.graph = graphDef
        
        if (graphDef.parameters) {
            for (const [key, value] of Object.entries(graphDef.parameters)) {
                this.parameters.set(key, value)
            }
        }
        
        if (graphDef.layers) {
            for (const layerDef of graphDef.layers) {
                this.createLayer(layerDef)
            }
        }
        
        if (graphDef.defaultState) {
            this.setState(graphDef.defaultState)
        }
    }
    
    createLayer(layerDef) {
        const layer = {
            name: layerDef.name,
            weight: layerDef.weight ?? 1.0,
            blendMode: layerDef.blendMode ?? 'override',
            mask: layerDef.mask ?? null,
            states: new Map(),
            currentState: null,
            action: null
        }
        
        if (layerDef.states) {
            for (const stateDef of layerDef.states) {
                layer.states.set(stateDef.name, stateDef)
            }
        }
        
        this.layers.set(layerDef.name, layer)
    }
    
    setParameter(name, value) {
        this.parameters.set(name, value)
        this.evaluateTransitions()
    }
    
    getParameter(name) {
        return this.parameters.get(name)
    }
    
    trigger(triggerName) {
        this.setParameter(triggerName, true)
        
        setTimeout(() => {
            this.parameters.delete(triggerName)
        }, 50)
    }
    
    setState(stateName, transitionDuration = 0.25) {
        if (this.currentState === stateName) return
        
        const previousState = this.currentState
        this.currentState = stateName
        
        const action = this.actions.get(stateName)
        if (!action) {
            console.warn(`[Animator] No action found for state: ${stateName}`)
            return
        }
        
        this.actions.forEach((act, name) => {
            if (name !== stateName && act.isRunning()) {
                act.fadeOut(transitionDuration)
            }
        })
        
        action.reset()
        action.fadeIn(transitionDuration)
        action.play()
        
        if (this.onStateChange) {
            this.onStateChange(stateName, previousState)
        }
    }
    
    playOneShot(clipName, options = {}) {
        const {
            fadeIn = 0.1,
            fadeOut = 0.1,
            layer = 'default',
            clampWhenFinished = true
        } = options
        
        const action = this.actions.get(clipName)
        if (!action) {
            console.warn(`[Animator] No clip found: ${clipName}`)
            return null
        }
        
        action.reset()
        action.clampWhenFinished = clampWhenFinished
        action.setLoop(THREE.LoopOnce, 1)
        action.fadeIn(fadeIn)
        action.play()
        
        const clip = this.clips.get(clipName)
        if (clip) {
            setTimeout(() => {
                action.fadeOut(fadeOut)
            }, (clip.duration - fadeOut) * 1000)
        }
        
        return action
    }
    
    crossFade(fromClip, toClip, duration = 0.3) {
        const fromAction = this.actions.get(fromClip)
        const toAction = this.actions.get(toClip)
        
        if (!fromAction || !toAction) return
        
        toAction.reset()
        toAction.play()
        fromAction.crossFadeTo(toAction, duration, true)
    }
    
    setLayerWeight(layerName, weight) {
        const layer = this.layers.get(layerName)
        if (layer) {
            layer.weight = Math.max(0, Math.min(1, weight))
        }
    }
    
    evaluateTransitions() {
        if (!this.graph || !this.graph.transitions) return
        
        for (const transition of this.graph.transitions) {
            if (transition.from !== this.currentState && transition.from !== '*') {
                continue
            }
            
            if (this.evaluateConditions(transition.conditions)) {
                this.setState(transition.to, transition.duration ?? 0.25)
                break
            }
        }
    }
    
    evaluateConditions(conditions) {
        if (!conditions || conditions.length === 0) return true
        
        for (const condition of conditions) {
            const value = this.parameters.get(condition.parameter)
            
            switch (condition.type) {
                case 'equals':
                    if (value !== condition.value) return false
                    break
                case 'greater':
                    if (value <= condition.value) return false
                    break
                case 'less':
                    if (value >= condition.value) return false
                    break
                case 'trigger':
                    if (!value) return false
                    break
                case 'bool':
                    if (!!value !== condition.value) return false
                    break
            }
        }
        
        return true
    }
    
    play(clipName = null) {
        this.isPlaying = true
        
        if (clipName) {
            const action = this.actions.get(clipName)
            if (action) {
                action.play()
            }
        }
    }
    
    pause() {
        this.isPlaying = false
        this.actions.forEach(action => {
            if (action.isRunning()) {
                action.paused = true
            }
        })
    }
    
    resume() {
        this.isPlaying = true
        this.actions.forEach(action => {
            action.paused = false
        })
    }
    
    stop() {
        this.isPlaying = false
        this.actions.forEach(action => {
            action.stop()
        })
    }
    
    setTimeScale(scale) {
        this.timeScale = scale
        this.mixer.timeScale = scale
    }
    
    update(deltaTime) {
        if (!this.isPlaying) return
        
        this.mixer.update(deltaTime)
        
        this.evaluateTransitions()
    }
    
    getClipNames() {
        return Array.from(this.clips.keys())
    }
    
    getCurrentState() {
        return this.currentState
    }
    
    isInState(stateName) {
        return this.currentState === stateName
    }
    
    dispose() {
        this.mixer.stopAllAction()
        this.clips.clear()
        this.actions.clear()
        this.layers.clear()
    }
}

export const DefaultCombatGraph = {
    name: 'CombatLocomotion',
    parameters: {
        speed: 0,
        isGrounded: true,
        isAttacking: false,
        isBlocking: false,
        isDead: false
    },
    defaultState: 'idle',
    layers: [
        {
            name: 'locomotion',
            weight: 1.0,
            blendMode: 'override',
            states: [
                { name: 'idle', clip: 'idle', loop: true },
                { name: 'walk', clip: 'walk', loop: true },
                { name: 'run', clip: 'run', loop: true }
            ]
        },
        {
            name: 'combat',
            weight: 1.0,
            blendMode: 'override',
            mask: 'upperBody',
            states: [
                { name: 'attack1', clip: 'attack_1', loop: false },
                { name: 'attack2', clip: 'attack_2', loop: false },
                { name: 'block', clip: 'block', loop: true }
            ]
        }
    ],
    transitions: [
        { from: 'idle', to: 'walk', duration: 0.2, conditions: [{ parameter: 'speed', type: 'greater', value: 0.1 }] },
        { from: 'idle', to: 'run', duration: 0.2, conditions: [{ parameter: 'speed', type: 'greater', value: 0.5 }] },
        { from: 'walk', to: 'idle', duration: 0.2, conditions: [{ parameter: 'speed', type: 'less', value: 0.1 }] },
        { from: 'walk', to: 'run', duration: 0.2, conditions: [{ parameter: 'speed', type: 'greater', value: 0.5 }] },
        { from: 'run', to: 'walk', duration: 0.2, conditions: [{ parameter: 'speed', type: 'less', value: 0.5 }] },
        { from: 'run', to: 'idle', duration: 0.3, conditions: [{ parameter: 'speed', type: 'less', value: 0.1 }] },
        { from: '*', to: 'death', duration: 0.3, conditions: [{ parameter: 'isDead', type: 'bool', value: true }] }
    ]
}
