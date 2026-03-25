/*
    GRUDGE Engine - Right-Click Context Menu
    Editor context menu with AI integration
*/

export class ContextMenu {
    constructor(options = {}) {
        this.container = options.container || document.body
        this.menuElement = null
        this.isOpen = false
        this.currentTarget = null
        this.currentPosition = { x: 0, y: 0 }
        
        this.aiEnabled = false
        this.puterAI = null
        
        this.defaultItems = [
            { id: 'transform', label: 'Transform', icon: '↔️', submenu: [
                { id: 'move', label: 'Move (G)', action: 'setMode:translate' },
                { id: 'rotate', label: 'Rotate (R)', action: 'setMode:rotate' },
                { id: 'scale', label: 'Scale (S)', action: 'setMode:scale' }
            ]},
            { id: 'divider1', type: 'divider' },
            { id: 'duplicate', label: 'Duplicate', icon: '📋', action: 'duplicate' },
            { id: 'delete', label: 'Delete', icon: '🗑️', action: 'delete' },
            { id: 'divider2', type: 'divider' },
            { id: 'scripts', label: 'Add Script', icon: '📜', submenu: [
                { id: 'script-rotate', label: 'Auto Rotate', action: 'addScript:autoRotate' },
                { id: 'script-bounce', label: 'Bounce', action: 'addScript:bounce' },
                { id: 'script-patrol', label: 'Patrol', action: 'addScript:patrol' },
                { id: 'script-custom', label: 'Custom Script...', action: 'addScript:custom' }
            ]},
            { id: 'spawn', label: 'Set as Spawn Point', icon: '📍', action: 'setSpawn' },
            { id: 'divider3', type: 'divider' },
            { id: 'ai-help', label: 'Ask AI for Help', icon: '🤖', action: 'aiHelp' },
            { id: 'ai-generate', label: 'AI Generate Code', icon: '✨', action: 'aiGenerate' }
        ]
        
        this.callbacks = new Map()
        this.create()
        this.bindEvents()
    }
    
    create() {
        this.menuElement = document.createElement('div')
        this.menuElement.className = 'grudge-context-menu'
        this.menuElement.innerHTML = `
            <style>
                .grudge-context-menu {
                    position: fixed;
                    background: rgba(22, 33, 62, 0.98);
                    border: 1px solid rgba(233, 69, 96, 0.5);
                    border-radius: 8px;
                    padding: 6px 0;
                    min-width: 180px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    display: none;
                    font-family: 'Segoe UI', sans-serif;
                    font-size: 13px;
                }
                .grudge-context-menu.visible {
                    display: block;
                }
                .grudge-menu-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    cursor: pointer;
                    color: #eee;
                    transition: background 0.15s;
                }
                .grudge-menu-item:hover {
                    background: rgba(233, 69, 96, 0.3);
                }
                .grudge-menu-item.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .grudge-menu-icon {
                    width: 20px;
                    margin-right: 10px;
                    text-align: center;
                }
                .grudge-menu-label {
                    flex: 1;
                }
                .grudge-menu-arrow {
                    margin-left: 10px;
                    opacity: 0.6;
                }
                .grudge-menu-divider {
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 6px 0;
                }
                .grudge-submenu {
                    position: absolute;
                    left: 100%;
                    top: 0;
                    background: rgba(22, 33, 62, 0.98);
                    border: 1px solid rgba(233, 69, 96, 0.5);
                    border-radius: 8px;
                    padding: 6px 0;
                    min-width: 160px;
                    display: none;
                }
                .grudge-menu-item:hover > .grudge-submenu {
                    display: block;
                }
                .grudge-ai-dialog {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(22, 33, 62, 0.98);
                    border: 1px solid rgba(233, 69, 96, 0.5);
                    border-radius: 12px;
                    padding: 20px;
                    width: 400px;
                    max-width: 90vw;
                    z-index: 10001;
                    display: none;
                }
                .grudge-ai-dialog.visible {
                    display: block;
                }
                .grudge-ai-dialog h3 {
                    margin: 0 0 15px;
                    color: #e94560;
                }
                .grudge-ai-dialog textarea {
                    width: 100%;
                    height: 100px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 6px;
                    color: #fff;
                    padding: 10px;
                    resize: vertical;
                    font-family: inherit;
                }
                .grudge-ai-dialog .actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                    justify-content: flex-end;
                }
                .grudge-ai-dialog button {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .grudge-ai-dialog .btn-primary {
                    background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
                    color: #fff;
                }
                .grudge-ai-dialog .btn-secondary {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }
                .grudge-ai-response {
                    margin-top: 15px;
                    padding: 10px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 6px;
                    max-height: 200px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    font-size: 12px;
                    display: none;
                }
                .grudge-ai-response.visible {
                    display: block;
                }
            </style>
            <div class="menu-content"></div>
        `
        this.container.appendChild(this.menuElement)
        
        this.aiDialog = document.createElement('div')
        this.aiDialog.className = 'grudge-ai-dialog'
        this.aiDialog.innerHTML = `
            <h3>🤖 AI Assistant</h3>
            <textarea placeholder="Describe what you want to do with this object..."></textarea>
            <div class="grudge-ai-response"></div>
            <div class="actions">
                <button class="btn-secondary cancel-btn">Cancel</button>
                <button class="btn-primary ask-btn">Ask AI</button>
            </div>
        `
        this.container.appendChild(this.aiDialog)
    }
    
    buildMenuHTML(items) {
        return items.map(item => {
            if (item.type === 'divider') {
                return '<div class="grudge-menu-divider"></div>'
            }
            
            const hasSubmenu = item.submenu && item.submenu.length > 0
            const submenuHTML = hasSubmenu ? `
                <span class="grudge-menu-arrow">▶</span>
                <div class="grudge-submenu">
                    ${this.buildMenuHTML(item.submenu)}
                </div>
            ` : ''
            
            return `
                <div class="grudge-menu-item" data-action="${item.action || ''}" data-id="${item.id}">
                    <span class="grudge-menu-icon">${item.icon || ''}</span>
                    <span class="grudge-menu-label">${item.label}</span>
                    ${submenuHTML}
                </div>
            `
        }).join('')
    }
    
    bindEvents() {
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.grudge-context-menu')) return
        })
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.grudge-context-menu') && !e.target.closest('.grudge-ai-dialog')) {
                this.close()
            }
        })
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close()
                this.closeAIDialog()
            }
        })
        
        this.menuElement.addEventListener('click', (e) => {
            const item = e.target.closest('.grudge-menu-item')
            if (item && !item.querySelector('.grudge-submenu')) {
                const action = item.dataset.action
                if (action) {
                    this.executeAction(action)
                    this.close()
                }
            }
        })
        
        this.aiDialog.querySelector('.cancel-btn').addEventListener('click', () => {
            this.closeAIDialog()
        })
        
        this.aiDialog.querySelector('.ask-btn').addEventListener('click', () => {
            this.askAI()
        })
    }
    
    async initAI() {
        if (typeof puter !== 'undefined' && puter.ai) {
            this.puterAI = puter.ai
            this.aiEnabled = true
            return true
        }
        return false
    }
    
    open(x, y, target = null, customItems = null) {
        this.currentPosition = { x, y }
        this.currentTarget = target
        this.isOpen = true
        
        const items = customItems || this.defaultItems
        this.menuElement.querySelector('.menu-content').innerHTML = this.buildMenuHTML(items)
        
        const menuRect = this.menuElement.getBoundingClientRect()
        const viewWidth = window.innerWidth
        const viewHeight = window.innerHeight
        
        let posX = x
        let posY = y
        
        if (x + 200 > viewWidth) posX = viewWidth - 210
        if (y + 300 > viewHeight) posY = viewHeight - 310
        
        this.menuElement.style.left = `${posX}px`
        this.menuElement.style.top = `${posY}px`
        this.menuElement.classList.add('visible')
    }
    
    close() {
        this.isOpen = false
        this.menuElement.classList.remove('visible')
    }
    
    executeAction(action) {
        if (action.startsWith('setMode:')) {
            const mode = action.split(':')[1]
            this.emit('modeChange', mode)
        } else if (action.startsWith('addScript:')) {
            const script = action.split(':')[1]
            this.emit('addScript', { script, target: this.currentTarget })
        } else if (action === 'aiHelp' || action === 'aiGenerate') {
            this.openAIDialog(action)
        } else {
            this.emit(action, this.currentTarget)
        }
    }
    
    openAIDialog(type) {
        this.aiDialogType = type
        const textarea = this.aiDialog.querySelector('textarea')
        textarea.value = ''
        textarea.placeholder = type === 'aiHelp' 
            ? 'Ask a question about this object or how to use it...'
            : 'Describe what code you want to generate for this object...'
        
        this.aiDialog.querySelector('h3').textContent = type === 'aiHelp'
            ? '🤖 AI Assistant'
            : '✨ AI Code Generator'
        
        this.aiDialog.querySelector('.grudge-ai-response').classList.remove('visible')
        this.aiDialog.classList.add('visible')
        textarea.focus()
    }
    
    closeAIDialog() {
        this.aiDialog.classList.remove('visible')
    }
    
    async askAI() {
        const textarea = this.aiDialog.querySelector('textarea')
        const responseDiv = this.aiDialog.querySelector('.grudge-ai-response')
        const query = textarea.value.trim()
        
        if (!query) return
        
        responseDiv.textContent = 'Thinking...'
        responseDiv.classList.add('visible')
        
        if (!this.aiEnabled) {
            await this.initAI()
        }
        
        if (this.puterAI) {
            try {
                const context = this.currentTarget 
                    ? `Object: ${this.currentTarget.name || 'Unknown'}, Type: ${this.currentTarget.type || 'Object3D'}`
                    : 'No object selected'
                
                const systemPrompt = this.aiDialogType === 'aiGenerate'
                    ? 'You are a Three.js code generator for GRUDGE Engine. Generate clean, working JavaScript code snippets. Include comments.'
                    : 'You are a helpful 3D game development assistant for GRUDGE Engine using Three.js. Be concise and practical.'
                
                const response = await this.puterAI.chat(
                    `Context: ${context}\n\nUser: ${query}`,
                    { system: systemPrompt }
                )
                
                responseDiv.textContent = response
            } catch (error) {
                responseDiv.textContent = `Error: ${error.message}`
            }
        } else {
            responseDiv.textContent = 'AI not available. Make sure Puter is loaded.'
        }
    }
    
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, [])
        }
        this.callbacks.get(event).push(callback)
    }
    
    off(event, callback) {
        if (this.callbacks.has(event)) {
            const callbacks = this.callbacks.get(event)
            const index = callbacks.indexOf(callback)
            if (index !== -1) {
                callbacks.splice(index, 1)
            }
        }
    }
    
    emit(event, data) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach(cb => cb(data))
        }
    }
    
    dispose() {
        this.menuElement.remove()
        this.aiDialog.remove()
    }
}

export default ContextMenu
