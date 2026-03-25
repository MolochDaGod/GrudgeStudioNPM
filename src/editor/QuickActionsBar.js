import { editorState } from './EditorState.js'

export class QuickActionsBar {
    constructor(container, onAction) {
        this.container = container
        this.onAction = onAction
        this.isExpanded = false
        this.element = null
        this.init()
    }
    
    init() {
        this.element = document.createElement('div')
        this.element.id = 'quick-actions-bar'
        this.element.innerHTML = this.getHTML()
        this.element.style.cssText = this.getStyles()
        document.body.appendChild(this.element)
        this.bindEvents()
    }
    
    getStyles() {
        return `
            position: fixed;
            right: 340px;
            top: 52px;
            z-index: 150;
            pointer-events: auto;
        `
    }
    
    getHTML() {
        return `
            <style>
                #quick-actions-bar {
                    font-family: 'Jost', sans-serif;
                }
                .qa-toggle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6ee7b7, #10b981);
                    border: 2px solid rgba(255,255,255,0.2);
                    color: #0e1220;
                    font-size: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 16px rgba(110, 231, 183, 0.4);
                    transition: all 0.3s;
                }
                .qa-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 24px rgba(110, 231, 183, 0.6);
                }
                .qa-toggle.active {
                    transform: rotate(45deg);
                }
                .qa-menu {
                    position: absolute;
                    top: 54px;
                    right: 0;
                    background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(30,36,53,0.98));
                    border: 1px solid #2a3150;
                    border-radius: 12px;
                    padding: 12px;
                    min-width: 180px;
                    display: none;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                }
                .qa-menu.visible {
                    display: block;
                    animation: qaSlideIn 0.2s ease-out;
                }
                @keyframes qaSlideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .qa-section-label {
                    color: #6ee7b7;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 8px 0 6px 0;
                    padding-bottom: 4px;
                    border-bottom: 1px solid rgba(110, 231, 183, 0.2);
                }
                .qa-section-label:first-child {
                    margin-top: 0;
                }
                .qa-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #e8eaf6;
                    font-size: 13px;
                }
                .qa-item:hover {
                    background: rgba(110, 231, 183, 0.15);
                }
                .qa-item-icon {
                    font-size: 18px;
                    width: 24px;
                    text-align: center;
                }
                .qa-item-label {
                    flex: 1;
                }
                .qa-item-hint {
                    font-size: 10px;
                    color: #6ee7b7;
                    opacity: 0.7;
                }
                .qa-divider {
                    height: 1px;
                    background: #2a3150;
                    margin: 8px 0;
                }
            </style>
            <button class="qa-toggle" id="qa-toggle" title="Quick Add Menu">+</button>
            <div class="qa-menu" id="qa-menu">
                <div class="qa-section-label">Game Objects</div>
                <div class="qa-item" data-action="add-spawn">
                    <span class="qa-item-icon">🎯</span>
                    <span class="qa-item-label">Spawn Point</span>
                </div>
                <div class="qa-item" data-action="add-trigger">
                    <span class="qa-item-icon">🔶</span>
                    <span class="qa-item-label">Trigger Zone</span>
                </div>
                <div class="qa-item" data-action="add-waypoint">
                    <span class="qa-item-icon">📍</span>
                    <span class="qa-item-label">AI Waypoint</span>
                </div>
                <div class="qa-item" data-action="add-camera">
                    <span class="qa-item-icon">📷</span>
                    <span class="qa-item-label">Camera</span>
                </div>
                
                <div class="qa-section-label">Lights</div>
                <div class="qa-item" data-action="add-point-light">
                    <span class="qa-item-icon">💡</span>
                    <span class="qa-item-label">Point Light</span>
                </div>
                <div class="qa-item" data-action="add-spot-light">
                    <span class="qa-item-icon">🔦</span>
                    <span class="qa-item-label">Spot Light</span>
                </div>
                
                <div class="qa-section-label">Primitives</div>
                <div class="qa-item" data-action="add-cube">
                    <span class="qa-item-icon">⬜</span>
                    <span class="qa-item-label">Cube</span>
                </div>
                <div class="qa-item" data-action="add-sphere">
                    <span class="qa-item-icon">🔵</span>
                    <span class="qa-item-label">Sphere</span>
                </div>
                <div class="qa-item" data-action="add-plane">
                    <span class="qa-item-icon">▬</span>
                    <span class="qa-item-label">Plane</span>
                </div>
                
                <div class="qa-divider"></div>
                <div class="qa-item" data-action="play-mode" style="background: rgba(110, 231, 183, 0.1);">
                    <span class="qa-item-icon">▶️</span>
                    <span class="qa-item-label">Play Mode</span>
                    <span class="qa-item-hint">Test</span>
                </div>
            </div>
        `
    }
    
    bindEvents() {
        const toggle = this.element.querySelector('#qa-toggle')
        const menu = this.element.querySelector('#qa-menu')
        
        toggle.addEventListener('click', () => {
            this.isExpanded = !this.isExpanded
            toggle.classList.toggle('active', this.isExpanded)
            menu.classList.toggle('visible', this.isExpanded)
        })
        
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target) && this.isExpanded) {
                this.isExpanded = false
                toggle.classList.remove('active')
                menu.classList.remove('visible')
            }
        })
        
        this.element.querySelectorAll('.qa-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action
                if (this.onAction) {
                    this.onAction(action)
                }
                this.isExpanded = false
                toggle.classList.remove('active')
                menu.classList.remove('visible')
            })
        })
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element)
        }
    }
}
