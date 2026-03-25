export const DEFAULT_KEYBINDINGS = {
    'attack_light': { key: '1', name: 'Light Attack', category: 'combat', animation: 'attack_light' },
    'attack_heavy': { key: '2', name: 'Heavy Attack', category: 'combat', animation: 'attack_heavy' },
    'attack_special': { key: '3', name: 'Special Attack', category: 'combat', animation: 'attack_special' },
    'block': { key: '4', name: 'Block', category: 'combat', animation: 'block' },
    'dodge_left': { key: 'q', name: 'Dodge Left', category: 'movement', animation: 'dodge_left' },
    'dodge_right': { key: 'e', name: 'Dodge Right', category: 'movement', animation: 'dodge_right' },
    'dodge_back': { key: 's', name: 'Dodge Back', category: 'movement', animation: 'dodge_back' },
    'jump': { key: 'Space', name: 'Jump', category: 'movement', animation: 'jump' },
    'sprint': { key: 'Shift', name: 'Sprint', category: 'movement', animation: 'run' },
    'target_lock': { key: 'Tab', name: 'Target Lock', category: 'targeting', animation: null },
    'target_next': { key: 'Tab', name: 'Next Target', category: 'targeting', animation: null },
    'skill_1': { key: '5', name: 'Skill 1', category: 'skills', animation: 'skill_1' },
    'skill_2': { key: '6', name: 'Skill 2', category: 'skills', animation: 'skill_2' },
    'skill_3': { key: '7', name: 'Skill 3', category: 'skills', animation: 'skill_3' },
    'skill_4': { key: '8', name: 'Skill 4', category: 'skills', animation: 'skill_4' },
    'ultimate': { key: 'r', name: 'Ultimate', category: 'skills', animation: 'ultimate' },
    'potion_health': { key: 'f1', name: 'Health Potion', category: 'items', animation: 'use_item' },
    'potion_mana': { key: 'f2', name: 'Mana Potion', category: 'items', animation: 'use_item' },
    'interact': { key: 'f', name: 'Interact', category: 'general', animation: 'interact' },
    'menu': { key: 'Escape', name: 'Menu', category: 'general', animation: null },
}

export const AVAILABLE_ANIMATIONS = [
    { id: 'idle', name: 'Idle', category: 'base' },
    { id: 'walk', name: 'Walk', category: 'movement' },
    { id: 'run', name: 'Run', category: 'movement' },
    { id: 'jump', name: 'Jump', category: 'movement' },
    { id: 'dodge_left', name: 'Dodge Left', category: 'movement' },
    { id: 'dodge_right', name: 'Dodge Right', category: 'movement' },
    { id: 'dodge_back', name: 'Dodge Back', category: 'movement' },
    { id: 'attack_light', name: 'Light Attack', category: 'combat' },
    { id: 'attack_heavy', name: 'Heavy Attack', category: 'combat' },
    { id: 'attack_special', name: 'Special Attack', category: 'combat' },
    { id: 'block', name: 'Block', category: 'combat' },
    { id: 'block_hit', name: 'Block Hit', category: 'combat' },
    { id: 'hit_react', name: 'Hit React', category: 'combat' },
    { id: 'stun', name: 'Stunned', category: 'combat' },
    { id: 'death', name: 'Death', category: 'combat' },
    { id: 'skill_1', name: 'Skill 1', category: 'skills' },
    { id: 'skill_2', name: 'Skill 2', category: 'skills' },
    { id: 'skill_3', name: 'Skill 3', category: 'skills' },
    { id: 'skill_4', name: 'Skill 4', category: 'skills' },
    { id: 'ultimate', name: 'Ultimate', category: 'skills' },
    { id: 'use_item', name: 'Use Item', category: 'items' },
    { id: 'interact', name: 'Interact', category: 'general' },
    { id: 'victory', name: 'Victory', category: 'emotes' },
    { id: 'taunt', name: 'Taunt', category: 'emotes' },
]

export class HotkeyManager {
    constructor() {
        this.bindings = {}
        this.listeners = new Map()
        this.isListening = false
        this.rebindingAction = null
        this.onRebindComplete = null
        
        this.load()
        this.bindGlobalListener()
    }

    load() {
        const saved = localStorage.getItem('grudge_keybindings')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                this.bindings = { ...DEFAULT_KEYBINDINGS, ...parsed }
            } catch {
                this.bindings = { ...DEFAULT_KEYBINDINGS }
            }
        } else {
            this.bindings = { ...DEFAULT_KEYBINDINGS }
        }
    }

    save() {
        localStorage.setItem('grudge_keybindings', JSON.stringify(this.bindings))
    }

    reset() {
        this.bindings = { ...DEFAULT_KEYBINDINGS }
        this.save()
    }

    getBinding(actionId) {
        return this.bindings[actionId]
    }

    setBinding(actionId, key, animation = null) {
        if (this.bindings[actionId]) {
            this.bindings[actionId].key = key
            if (animation !== null) {
                this.bindings[actionId].animation = animation
            }
            this.save()
        }
    }

    setAnimation(actionId, animationId) {
        if (this.bindings[actionId]) {
            this.bindings[actionId].animation = animationId
            this.save()
        }
    }

    getKeyForAction(actionId) {
        return this.bindings[actionId]?.key || null
    }

    getActionForKey(key) {
        const normalizedKey = key.toLowerCase()
        for (const [actionId, binding] of Object.entries(this.bindings)) {
            if (binding.key.toLowerCase() === normalizedKey) {
                return { actionId, ...binding }
            }
        }
        return null
    }

    getAllBindings() {
        return { ...this.bindings }
    }

    getBindingsByCategory(category) {
        return Object.entries(this.bindings)
            .filter(([, binding]) => binding.category === category)
            .reduce((acc, [id, binding]) => ({ ...acc, [id]: binding }), {})
    }

    startRebind(actionId, callback) {
        this.rebindingAction = actionId
        this.onRebindComplete = callback
        this.isListening = true
    }

    cancelRebind() {
        this.rebindingAction = null
        this.onRebindComplete = null
        this.isListening = false
    }

    bindGlobalListener() {
        document.addEventListener('keydown', (e) => {
            if (this.isListening && this.rebindingAction) {
                e.preventDefault()
                e.stopPropagation()
                
                let key = e.key
                if (key === ' ') key = 'Space'
                
                this.setBinding(this.rebindingAction, key)
                
                if (this.onRebindComplete) {
                    this.onRebindComplete(this.rebindingAction, key)
                }
                
                this.cancelRebind()
                return
            }

            const action = this.getActionForKey(e.key)
            if (action) {
                const handlers = this.listeners.get(action.actionId)
                if (handlers) {
                    handlers.forEach(fn => fn(action))
                }
            }
        })
    }

    on(actionId, callback) {
        if (!this.listeners.has(actionId)) {
            this.listeners.set(actionId, [])
        }
        this.listeners.get(actionId).push(callback)
        return () => this.off(actionId, callback)
    }

    off(actionId, callback) {
        const handlers = this.listeners.get(actionId)
        if (handlers) {
            const idx = handlers.indexOf(callback)
            if (idx > -1) handlers.splice(idx, 1)
        }
    }

    emit(actionId) {
        const handlers = this.listeners.get(actionId)
        const binding = this.bindings[actionId]
        if (handlers && binding) {
            handlers.forEach(fn => fn(binding))
        }
    }
}

export const hotkeyManager = new HotkeyManager()
