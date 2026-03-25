/*
    GRUDGE Studio - Keystroke Watcher
    Global keyboard input system with rebindable hotkeys
*/

export class KeystrokeWatcher {
    constructor() {
        this.bindings = new Map()
        this.pressed = new Set()
        this.listeners = []
        this.enabled = true
        this.recordMode = false
        this.recordCallback = null
        
        this.modifiers = {
            ctrl: false,
            alt: false,
            shift: false,
            meta: false
        }
        
        this.init()
    }
    
    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e))
        document.addEventListener('keyup', (e) => this.handleKeyUp(e))
        window.addEventListener('blur', () => this.clearPressed())
        
        this.loadBindings()
    }
    
    handleKeyDown(event) {
        if (!this.enabled) return
        
        const key = event.key.toLowerCase()
        
        this.modifiers.ctrl = event.ctrlKey
        this.modifiers.alt = event.altKey
        this.modifiers.shift = event.shiftKey
        this.modifiers.meta = event.metaKey
        
        if (this.recordMode && this.recordCallback) {
            event.preventDefault()
            const combo = this.buildCombo(key)
            this.recordCallback(combo)
            this.recordMode = false
            this.recordCallback = null
            return
        }
        
        if (this.pressed.has(key)) return
        this.pressed.add(key)
        
        const combo = this.buildCombo(key)
        
        const binding = this.bindings.get(combo)
        if (binding && binding.enabled) {
            if (binding.preventDefault) {
                event.preventDefault()
            }
            
            binding.callback({
                key,
                combo,
                modifiers: { ...this.modifiers },
                originalEvent: event,
                binding
            })
        }
        
        this.notifyListeners('keydown', {
            key,
            combo,
            modifiers: { ...this.modifiers },
            originalEvent: event
        })
    }
    
    handleKeyUp(event) {
        const key = event.key.toLowerCase()
        this.pressed.delete(key)
        
        this.modifiers.ctrl = event.ctrlKey
        this.modifiers.alt = event.altKey
        this.modifiers.shift = event.shiftKey
        this.modifiers.meta = event.metaKey
        
        this.notifyListeners('keyup', {
            key,
            modifiers: { ...this.modifiers },
            originalEvent: event
        })
    }
    
    buildCombo(key) {
        const parts = []
        if (this.modifiers.ctrl) parts.push('ctrl')
        if (this.modifiers.alt) parts.push('alt')
        if (this.modifiers.shift) parts.push('shift')
        if (this.modifiers.meta) parts.push('meta')
        
        if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
            parts.push(key)
        }
        
        return parts.join('+')
    }
    
    parseCombo(combo) {
        const parts = combo.toLowerCase().split('+')
        return {
            ctrl: parts.includes('ctrl'),
            alt: parts.includes('alt'),
            shift: parts.includes('shift'),
            meta: parts.includes('meta'),
            key: parts.filter(p => !['ctrl', 'alt', 'shift', 'meta'].includes(p))[0] || ''
        }
    }
    
    bind(combo, callback, options = {}) {
        const normalizedCombo = combo.toLowerCase()
        
        this.bindings.set(normalizedCombo, {
            combo: normalizedCombo,
            callback,
            name: options.name || normalizedCombo,
            category: options.category || 'General',
            description: options.description || '',
            enabled: options.enabled !== false,
            preventDefault: options.preventDefault !== false,
            ...options
        })
        
        return this
    }
    
    unbind(combo) {
        this.bindings.delete(combo.toLowerCase())
        return this
    }
    
    rebind(oldCombo, newCombo) {
        const binding = this.bindings.get(oldCombo.toLowerCase())
        if (binding) {
            this.bindings.delete(oldCombo.toLowerCase())
            binding.combo = newCombo.toLowerCase()
            this.bindings.set(newCombo.toLowerCase(), binding)
        }
        return this
    }
    
    setEnabled(combo, enabled) {
        const binding = this.bindings.get(combo.toLowerCase())
        if (binding) {
            binding.enabled = enabled
        }
        return this
    }
    
    isPressed(key) {
        return this.pressed.has(key.toLowerCase())
    }
    
    isComboPressed(combo) {
        const parsed = this.parseCombo(combo)
        
        if (parsed.ctrl !== this.modifiers.ctrl) return false
        if (parsed.alt !== this.modifiers.alt) return false
        if (parsed.shift !== this.modifiers.shift) return false
        if (parsed.meta !== this.modifiers.meta) return false
        
        if (parsed.key && !this.pressed.has(parsed.key)) return false
        
        return true
    }
    
    clearPressed() {
        this.pressed.clear()
        this.modifiers = {
            ctrl: false,
            alt: false,
            shift: false,
            meta: false
        }
    }
    
    startRecording(callback) {
        this.recordMode = true
        this.recordCallback = callback
    }
    
    stopRecording() {
        this.recordMode = false
        this.recordCallback = null
    }
    
    addListener(callback) {
        this.listeners.push(callback)
        return () => {
            const index = this.listeners.indexOf(callback)
            if (index > -1) {
                this.listeners.splice(index, 1)
            }
        }
    }
    
    notifyListeners(type, data) {
        this.listeners.forEach(listener => {
            try {
                listener(type, data)
            } catch (e) {
                console.error('Keystroke listener error:', e)
            }
        })
    }
    
    getBindings() {
        return Array.from(this.bindings.values())
    }
    
    getBindingsByCategory() {
        const categories = new Map()
        
        for (const binding of this.bindings.values()) {
            if (!categories.has(binding.category)) {
                categories.set(binding.category, [])
            }
            categories.get(binding.category).push(binding)
        }
        
        return categories
    }
    
    saveBindings() {
        const data = {}
        for (const [combo, binding] of this.bindings) {
            data[binding.name] = {
                combo,
                enabled: binding.enabled
            }
        }
        localStorage.setItem('grudge_keybindings', JSON.stringify(data))
    }
    
    loadBindings() {
        try {
            const saved = localStorage.getItem('grudge_keybindings')
            if (saved) {
                const data = JSON.parse(saved)
                for (const [name, config] of Object.entries(data)) {
                    for (const binding of this.bindings.values()) {
                        if (binding.name === name) {
                            if (config.combo !== binding.combo) {
                                this.rebind(binding.combo, config.combo)
                            }
                            binding.enabled = config.enabled
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load keybindings:', e)
        }
    }
    
    resetToDefaults() {
        localStorage.removeItem('grudge_keybindings')
    }
    
    setupDefaultBindings() {
        this.bind('`', () => window.grudgeConsole?.toggle(), {
            name: 'Toggle Console',
            category: 'Editor',
            description: 'Show/hide the developer console'
        })
        
        this.bind('f12', () => window.grudgeConsole?.toggle(), {
            name: 'Toggle Console (F12)',
            category: 'Editor',
            description: 'Show/hide the developer console'
        })
        
        this.bind('ctrl+s', () => window.dispatchEvent(new CustomEvent('editor:save')), {
            name: 'Save',
            category: 'File',
            description: 'Save current scene'
        })
        
        this.bind('ctrl+z', () => window.dispatchEvent(new CustomEvent('editor:undo')), {
            name: 'Undo',
            category: 'Edit',
            description: 'Undo last action'
        })
        
        this.bind('ctrl+y', () => window.dispatchEvent(new CustomEvent('editor:redo')), {
            name: 'Redo',
            category: 'Edit',
            description: 'Redo last undone action'
        })
        
        this.bind('ctrl+shift+y', () => window.dispatchEvent(new CustomEvent('editor:redo')), {
            name: 'Redo (Alt)',
            category: 'Edit',
            description: 'Redo last undone action'
        })
        
        this.bind('delete', () => window.dispatchEvent(new CustomEvent('editor:delete')), {
            name: 'Delete',
            category: 'Edit',
            description: 'Delete selected object'
        })
        
        this.bind('ctrl+d', () => window.dispatchEvent(new CustomEvent('editor:duplicate')), {
            name: 'Duplicate',
            category: 'Edit',
            description: 'Duplicate selected object'
        })
        
        this.bind('g', () => window.dispatchEvent(new CustomEvent('editor:tool', { detail: 'translate' })), {
            name: 'Move Tool',
            category: 'Tools',
            description: 'Switch to move/translate tool'
        })
        
        this.bind('r', () => window.dispatchEvent(new CustomEvent('editor:tool', { detail: 'rotate' })), {
            name: 'Rotate Tool',
            category: 'Tools',
            description: 'Switch to rotate tool'
        })
        
        this.bind('s', () => window.dispatchEvent(new CustomEvent('editor:tool', { detail: 'scale' })), {
            name: 'Scale Tool',
            category: 'Tools',
            description: 'Switch to scale tool',
            preventDefault: false
        })
        
        this.bind('f', () => window.dispatchEvent(new CustomEvent('editor:focus')), {
            name: 'Focus',
            category: 'View',
            description: 'Focus camera on selected object'
        })
        
        this.bind('escape', () => window.dispatchEvent(new CustomEvent('editor:deselect')), {
            name: 'Deselect',
            category: 'Edit',
            description: 'Deselect all objects'
        })
        
        this.bind('space', () => window.dispatchEvent(new CustomEvent('game:pause')), {
            name: 'Pause',
            category: 'Game',
            description: 'Pause/unpause game',
            preventDefault: false
        })
        
        return this
    }
    
    dispose() {
        this.bindings.clear()
        this.listeners = []
        this.clearPressed()
    }
}

export const keystrokeWatcher = new KeystrokeWatcher()
export default KeystrokeWatcher
