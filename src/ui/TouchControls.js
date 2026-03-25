export class TouchControls {
    constructor(options = {}) {
        this.container = options.container || document.body
        this.joystickSize = options.joystickSize || 120
        this.buttonSize = options.buttonSize || 60
        this.enabled = false
        this.elements = {}
        this.touches = new Map()
        
        this.joystickState = { x: 0, y: 0, active: false }
        this.buttonStates = new Map()
        
        this.onMove = options.onMove || null
        this.onJump = options.onJump || null
        this.onAttack = options.onAttack || null
        this.onBlock = options.onBlock || null
        this.onSpecial = options.onSpecial || null

        this.joystickTouchId = null
        
        this.createUI()
        this.bindEvents()
    }

    createUI() {
        this.overlay = document.createElement('div')
        this.overlay.id = 'touch-controls-overlay'
        this.overlay.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 1000;
            display: none;
            font-family: Arial, sans-serif;
        `
        
        this.createJoystick()
        this.createActionButtons()
        
        this.container.appendChild(this.overlay)
    }

    createJoystick() {
        const joystickContainer = document.createElement('div')
        joystickContainer.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 30px;
            width: ${this.joystickSize}px;
            height: ${this.joystickSize}px;
            pointer-events: auto;
        `
        
        const joystickBase = document.createElement('div')
        joystickBase.style.cssText = `
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            border: 3px solid rgba(255, 255, 255, 0.4);
        `
        
        const joystickKnob = document.createElement('div')
        joystickKnob.style.cssText = `
            position: absolute;
            width: 50%;
            height: 50%;
            left: 25%;
            top: 25%;
            border-radius: 50%;
            background: rgba(110, 231, 183, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.6);
            transition: transform 0.05s ease-out;
        `
        
        joystickContainer.appendChild(joystickBase)
        joystickContainer.appendChild(joystickKnob)
        this.overlay.appendChild(joystickContainer)
        
        this.elements.joystickContainer = joystickContainer
        this.elements.joystickBase = joystickBase
        this.elements.joystickKnob = joystickKnob
    }

    createActionButtons() {
        const buttonContainer = document.createElement('div')
        buttonContainer.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 30px;
            display: grid;
            grid-template-columns: repeat(2, ${this.buttonSize}px);
            gap: 12px;
            pointer-events: auto;
        `
        
        const buttons = [
            { id: 'attack', label: '⚔️', color: 'rgba(239, 68, 68, 0.7)', action: 'onAttack' },
            { id: 'block', label: '🛡️', color: 'rgba(59, 130, 246, 0.7)', action: 'onBlock' },
            { id: 'jump', label: '⬆️', color: 'rgba(34, 197, 94, 0.7)', action: 'onJump' },
            { id: 'special', label: '✨', color: 'rgba(168, 85, 247, 0.7)', action: 'onSpecial' }
        ]
        
        buttons.forEach(btn => {
            const button = document.createElement('div')
            button.style.cssText = `
                width: ${this.buttonSize}px;
                height: ${this.buttonSize}px;
                border-radius: 50%;
                background: ${btn.color};
                border: 3px solid rgba(255, 255, 255, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
                transition: transform 0.1s, background 0.1s;
            `
            button.textContent = btn.label
            button.dataset.buttonId = btn.id
            button.dataset.action = btn.action
            
            buttonContainer.appendChild(button)
            this.elements[btn.id + 'Button'] = button
            this.buttonStates.set(btn.id, false)
        })
        
        this.overlay.appendChild(buttonContainer)
        this.elements.buttonContainer = buttonContainer
    }

    bindEvents() {
        const joystick = this.elements.joystickContainer
        
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault()
            const touch = e.changedTouches[0]
            this.joystickTouchId = touch.identifier
            this.joystickState.active = true
            this.updateJoystick(touch)
        })
        
        joystick.addEventListener('touchmove', (e) => {
            e.preventDefault()
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i]
                if (touch.identifier === this.joystickTouchId) {
                    this.updateJoystick(touch)
                    break
                }
            }
        })
        
        joystick.addEventListener('touchend', (e) => {
            e.preventDefault()
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystickTouchId) {
                    this.resetJoystick()
                    break
                }
            }
        })
        
        joystick.addEventListener('touchcancel', (e) => {
            this.resetJoystick()
        })

        const buttonContainer = this.elements.buttonContainer
        
        buttonContainer.addEventListener('touchstart', (e) => {
            e.preventDefault()
            const button = e.target.closest('[data-button-id]')
            if (button) {
                const id = button.dataset.buttonId
                const action = button.dataset.action
                this.buttonStates.set(id, true)
                button.style.transform = 'scale(0.9)'
                button.style.filter = 'brightness(1.3)'
                
                if (this[action]) {
                    this[action]()
                }
            }
        })
        
        buttonContainer.addEventListener('touchend', (e) => {
            e.preventDefault()
            const button = e.target.closest('[data-button-id]')
            if (button) {
                const id = button.dataset.buttonId
                this.buttonStates.set(id, false)
                button.style.transform = 'scale(1)'
                button.style.filter = 'none'
            }
        })
    }

    updateJoystick(touch) {
        const rect = this.elements.joystickContainer.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        let dx = touch.clientX - centerX
        let dy = touch.clientY - centerY
        
        const maxDistance = this.joystickSize / 2 - 15
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > maxDistance) {
            dx = (dx / distance) * maxDistance
            dy = (dy / distance) * maxDistance
        }
        
        this.joystickState.x = dx / maxDistance
        this.joystickState.y = -dy / maxDistance
        
        this.elements.joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`
        
        if (this.onMove) {
            this.onMove(this.joystickState.x, this.joystickState.y)
        }
    }

    resetJoystick() {
        this.joystickTouchId = null
        this.joystickState = { x: 0, y: 0, active: false }
        this.elements.joystickKnob.style.transform = 'translate(0, 0)'
        
        if (this.onMove) {
            this.onMove(0, 0)
        }
    }

    enable() {
        this.enabled = true
        this.overlay.style.display = 'block'
    }

    disable() {
        this.enabled = false
        this.overlay.style.display = 'none'
        this.resetJoystick()
    }

    toggle() {
        if (this.enabled) {
            this.disable()
        } else {
            this.enable()
        }
    }

    isEnabled() {
        return this.enabled
    }

    getJoystickState() {
        return { ...this.joystickState }
    }

    isButtonPressed(buttonId) {
        return this.buttonStates.get(buttonId) || false
    }

    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }

    dispose() {
        this.overlay.remove()
        this.touches.clear()
        this.buttonStates.clear()
    }
}
