import { editorState } from './EditorState.js'

export class RadialMenu {
    constructor(onAction) {
        this.onAction = onAction
        this.element = null
        this.isVisible = false
        this.centerX = 0
        this.centerY = 0
        this.items = [
            { action: 'add-cube', icon: '⬜', label: 'Cube', angle: 0 },
            { action: 'add-sphere', icon: '🔵', label: 'Sphere', angle: 40 },
            { action: 'add-cylinder', icon: '🛢️', label: 'Cylinder', angle: 80 },
            { action: 'add-spawn', icon: '🎯', label: 'Spawn', angle: 120 },
            { action: 'add-point-light', icon: '💡', label: 'Light', angle: 160 },
            { action: 'add-camera', icon: '📷', label: 'Camera', angle: 200 },
            { action: 'add-trigger', icon: '🔶', label: 'Trigger', angle: 240 },
            { action: 'add-waypoint', icon: '📍', label: 'Waypoint', angle: 280 },
            { action: 'add-plane', icon: '▬', label: 'Plane', angle: 320 }
        ]
        this.init()
    }
    
    init() {
        this.element = document.createElement('div')
        this.element.id = 'radial-menu'
        this.element.innerHTML = this.getHTML()
        this.injectStyles()
        document.body.appendChild(this.element)
        this.bindEvents()
    }
    
    injectStyles() {
        if (document.getElementById('radial-menu-styles')) return
        
        const style = document.createElement('style')
        style.id = 'radial-menu-styles'
        style.textContent = `
            #radial-menu {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
                display: none;
                font-family: 'Jost', sans-serif;
            }
            #radial-menu.visible {
                display: block;
            }
            .radial-container {
                position: relative;
                width: 200px;
                height: 200px;
                transform: translate(-50%, -50%);
            }
            .radial-center {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, rgba(20,26,43,0.95), rgba(30,36,53,0.95));
                border: 2px solid #6ee7b7;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6ee7b7;
                font-size: 20px;
                box-shadow: 0 0 20px rgba(110, 231, 183, 0.4);
                pointer-events: auto;
                animation: radialPulse 2s ease-in-out infinite;
            }
            @keyframes radialPulse {
                0%, 100% { box-shadow: 0 0 20px rgba(110, 231, 183, 0.4); }
                50% { box-shadow: 0 0 30px rgba(110, 231, 183, 0.7); }
            }
            .radial-item {
                position: absolute;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(30,36,53,0.95));
                border: 2px solid #2a3150;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease-out;
                pointer-events: auto;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                opacity: 0;
                transform: scale(0.6);
            }
            #radial-menu.visible .radial-item {
                opacity: 1;
                transform: scale(1);
            }
            .radial-item:hover {
                border-color: #6ee7b7;
                background: rgba(110, 231, 183, 0.25);
                box-shadow: 0 0 20px rgba(110, 231, 183, 0.6);
                transform: scale(1.15);
                z-index: 10;
            }
            .radial-item-icon {
                font-size: 18px;
                line-height: 1;
            }
            .radial-item-label {
                font-size: 8px;
                color: #a5b4d0;
                margin-top: 2px;
                white-space: nowrap;
                transition: color 0.15s;
            }
            .radial-item:hover .radial-item-label {
                color: #6ee7b7;
            }
            .radial-tooltip {
                position: absolute;
                bottom: -28px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(14, 18, 32, 0.95);
                border: 1px solid #6ee7b7;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 11px;
                color: #e8eaf6;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.15s;
            }
            .radial-item:hover .radial-tooltip {
                opacity: 1;
            }
            .radial-backdrop {
                position: fixed;
                inset: 0;
                pointer-events: auto;
            }
        `
        document.head.appendChild(style)
    }
    
    getHTML() {
        const radius = 75
        const itemsHTML = this.items.map((item, index) => {
            const angleRad = (item.angle - 90) * Math.PI / 180
            const x = Math.cos(angleRad) * radius
            const y = Math.sin(angleRad) * radius
            const delay = index * 0.03
            const left = 100 + x - 24
            const top = 100 + y - 24
            return `
                <div class="radial-item" 
                     data-action="${item.action}" 
                     title="${item.label}"
                     style="left: ${left}px; top: ${top}px; transition-delay: ${delay}s;">
                    <span class="radial-item-icon">${item.icon}</span>
                    <span class="radial-item-label">${item.label}</span>
                </div>
            `
        }).join('')
        
        return `
            <div class="radial-backdrop" id="radial-backdrop"></div>
            <div class="radial-container">
                <div class="radial-center">+</div>
                ${itemsHTML}
            </div>
        `
    }
    
    bindEvents() {
        const backdrop = this.element.querySelector('#radial-backdrop')
        backdrop.addEventListener('click', () => this.hide())
        backdrop.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            this.hide()
        })
        
        this.element.querySelectorAll('.radial-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action
                if (this.onAction) {
                    this.onAction(action)
                }
                this.hide()
            })
        })
    }
    
    show(x, y) {
        const menuSize = 200
        const padding = 20
        const halfSize = menuSize / 2
        
        const clampedX = Math.max(halfSize + padding, Math.min(window.innerWidth - halfSize - padding, x))
        const clampedY = Math.max(halfSize + padding, Math.min(window.innerHeight - halfSize - padding, y))
        
        this.centerX = clampedX
        this.centerY = clampedY
        this.element.style.left = clampedX + 'px'
        this.element.style.top = clampedY + 'px'
        this.isVisible = true
        this.element.classList.add('visible')
        
        this.onKeyDownBound = this.onKeyDown.bind(this)
        window.addEventListener('keydown', this.onKeyDownBound)
    }
    
    onKeyDown(event) {
        if (event.key === 'Escape' && this.isVisible) {
            this.hide()
        }
    }
    
    hide() {
        this.isVisible = false
        this.element.classList.remove('visible')
        if (this.onKeyDownBound) {
            window.removeEventListener('keydown', this.onKeyDownBound)
        }
    }
    
    toggle(x, y) {
        if (this.isVisible) {
            this.hide()
        } else {
            this.show(x, y)
        }
    }
    
    destroy() {
        this.hide()
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element)
        }
        const styles = document.getElementById('radial-menu-styles')
        if (styles) styles.remove()
    }
}
