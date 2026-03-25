import { hotkeyManager, AVAILABLE_ANIMATIONS } from './HotkeyManager.js'

let stylesInjected = false

function injectActionBarStyles() {
    if (stylesInjected) return
    stylesInjected = true
    
    const style = document.createElement('style')
    style.id = 'action-bar-styles'
    style.textContent = `
        .action-bar { position: fixed; display: flex; gap: 4px; pointer-events: auto; z-index: 200; }
        .action-bar-bottom { bottom: 20px; left: 50%; transform: translateX(-50%); flex-direction: row; }
        .action-bar-bottom-2 { bottom: 80px; left: 50%; transform: translateX(-50%); flex-direction: row; }
        .action-bar-left { left: 20px; top: 50%; transform: translateY(-50%); flex-direction: column; }
        .action-slot { width: 50px; height: 50px; background: rgba(20, 26, 43, 0.9); border: 2px solid #2a3150; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; position: relative; }
        .action-slot:hover { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.1); }
        .action-slot.active { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.2); }
        .action-slot.cooldown { opacity: 0.5; }
        .action-slot .slot-icon { font-size: 20px; }
        .action-slot .slot-key { position: absolute; bottom: 2px; right: 4px; font-size: 10px; color: #6ee7b7; font-weight: 700; }
        .action-slot .slot-cooldown { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; border-radius: 6px; display: none; }
        .action-slot.on-cooldown .slot-cooldown { display: flex; }
        .action-slot-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(20, 26, 43, 0.98); padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s; border: 1px solid #2a3150; margin-bottom: 8px; }
        .action-slot:hover .action-slot-tooltip { opacity: 1; }
        .slot-edit-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(20, 26, 43, 0.98); border: 1px solid #2a3150; border-radius: 12px; padding: 20px; z-index: 1000; min-width: 400px; color: #e8eaf6; font-family: 'Jost', sans-serif; }
        .slot-edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .slot-edit-title { font-size: 16px; font-weight: 600; color: #6ee7b7; }
        .slot-edit-close { background: none; border: none; color: #a5b4d0; font-size: 20px; cursor: pointer; }
        .slot-edit-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; }
        .slot-edit-label { width: 100px; color: #a5b4d0; font-size: 13px; }
        .slot-edit-input { flex: 1; padding: 8px 12px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 6px; color: #e8eaf6; font-size: 13px; }
        .slot-edit-input:focus { outline: none; border-color: #6ee7b7; }
        .slot-edit-btn { padding: 8px 16px; background: rgba(110, 231, 183, 0.2); border: 1px solid #6ee7b7; border-radius: 6px; color: #6ee7b7; cursor: pointer; font-size: 13px; }
        .slot-edit-btn:hover { background: rgba(110, 231, 183, 0.3); }
        .slot-edit-btn.waiting { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #ef4444; }
        .animation-preview { width: 150px; height: 150px; background: #0a0a1a; border-radius: 8px; border: 1px solid #2a3150; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #6ee7b7; font-size: 12px; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }
    `
    document.head.appendChild(style)
}

export class ActionBar {
    constructor(options = {}) {
        this.id = options.id || 'actionbar-1'
        this.position = options.position || 'bottom'
        this.slots = options.slots || 6
        this.actions = options.actions || []
        this.container = null
        this.onAction = options.onAction || null
        this.onSlotEdit = options.onSlotEdit || null
        
        this.editingSlot = null
    }

    create() {
        injectActionBarStyles()
        
        this.container = document.createElement('div')
        this.container.className = `action-bar action-bar-${this.position}`
        this.container.id = this.id
        this.container.innerHTML = this.render()
        document.body.appendChild(this.container)
        this.bindEvents()
        return this
    }

    getStyles() {
        return `<style>
            .action-bar { position: fixed; display: flex; gap: 4px; pointer-events: auto; z-index: 200; }
            .action-bar-bottom { bottom: 20px; left: 50%; transform: translateX(-50%); flex-direction: row; }
            .action-bar-bottom-2 { bottom: 80px; left: 50%; transform: translateX(-50%); flex-direction: row; }
            .action-bar-left { left: 20px; top: 50%; transform: translateY(-50%); flex-direction: column; }
            .action-slot { width: 50px; height: 50px; background: rgba(20, 26, 43, 0.9); border: 2px solid #2a3150; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; position: relative; }
            .action-slot:hover { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.1); }
            .action-slot.active { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.2); }
            .action-slot.cooldown { opacity: 0.5; }
            .action-slot .slot-icon { font-size: 20px; }
            .action-slot .slot-key { position: absolute; bottom: 2px; right: 4px; font-size: 10px; color: #6ee7b7; font-weight: 700; }
            .action-slot .slot-cooldown { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; border-radius: 6px; display: none; }
            .action-slot.on-cooldown .slot-cooldown { display: flex; }
            .action-slot-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(20, 26, 43, 0.98); padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s; border: 1px solid #2a3150; margin-bottom: 8px; }
            .action-slot:hover .action-slot-tooltip { opacity: 1; }
            .slot-edit-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(20, 26, 43, 0.98); border: 1px solid #2a3150; border-radius: 12px; padding: 20px; z-index: 1000; min-width: 400px; }
            .slot-edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .slot-edit-title { font-size: 16px; font-weight: 600; color: #6ee7b7; }
            .slot-edit-close { background: none; border: none; color: #a5b4d0; font-size: 20px; cursor: pointer; }
            .slot-edit-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; }
            .slot-edit-label { width: 100px; color: #a5b4d0; font-size: 13px; }
            .slot-edit-input { flex: 1; padding: 8px 12px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 6px; color: #e8eaf6; font-size: 13px; }
            .slot-edit-input:focus { outline: none; border-color: #6ee7b7; }
            .slot-edit-btn { padding: 8px 16px; background: rgba(110, 231, 183, 0.2); border: 1px solid #6ee7b7; border-radius: 6px; color: #6ee7b7; cursor: pointer; font-size: 13px; }
            .slot-edit-btn:hover { background: rgba(110, 231, 183, 0.3); }
            .slot-edit-btn.waiting { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #ef4444; }
            .animation-dropdown { max-height: 200px; overflow-y: auto; }
            .animation-option { padding: 8px 12px; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; }
            .animation-option:hover { background: rgba(110, 231, 183, 0.15); }
            .animation-option.selected { background: rgba(110, 231, 183, 0.2); }
            .animation-preview { width: 150px; height: 150px; background: #0a0a1a; border-radius: 8px; border: 1px solid #2a3150; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #6ee7b7; }
            .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }
        </style>`
    }

    syncBindings() {
        this.actions.forEach((action, i) => {
            if (action?.actionId) {
                const savedBinding = hotkeyManager.getBinding(action.actionId)
                if (savedBinding) {
                    action.key = savedBinding.key
                    action.animation = savedBinding.animation
                }
            }
        })
    }

    render() {
        this.syncBindings()
        
        let html = '<div class="action-bar-slots" style="display:flex;gap:4px;">'
        
        for (let i = 0; i < this.slots; i++) {
            const action = this.actions[i]
            const binding = action ? hotkeyManager.getBinding(action.actionId) : null
            
            html += `
                <div class="action-slot" data-slot="${i}" data-action="${action?.actionId || ''}">
                    <span class="slot-icon">${action?.icon || '+'}</span>
                    <span class="slot-key">${binding?.key || (i + 1)}</span>
                    <div class="slot-cooldown"></div>
                    <div class="action-slot-tooltip">${binding?.name || 'Empty Slot'}<br><span style="color:#6ee7b7">[${binding?.key || 'Unbound'}]</span></div>
                </div>
            `
        }
        
        html += '</div>'
        return html
    }

    bindEvents() {
        this.container.querySelectorAll('.action-slot').forEach(slot => {
            slot.addEventListener('click', (e) => {
                const actionId = slot.dataset.action
                if (actionId && this.onAction) {
                    this.onAction(actionId)
                }
            })

            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault()
                const slotIndex = parseInt(slot.dataset.slot)
                this.openSlotEditor(slotIndex)
            })
        })
    }

    openSlotEditor(slotIndex) {
        this.editingSlot = slotIndex
        const action = this.actions[slotIndex]
        const binding = action ? hotkeyManager.getBinding(action.actionId) : null

        const backdrop = document.createElement('div')
        backdrop.className = 'modal-backdrop'
        backdrop.id = 'slot-edit-backdrop'
        backdrop.onclick = () => this.closeSlotEditor()
        document.body.appendChild(backdrop)

        const modal = document.createElement('div')
        modal.className = 'slot-edit-modal'
        modal.id = 'slot-edit-modal'
        modal.innerHTML = `
            <div class="slot-edit-header">
                <span class="slot-edit-title">Edit Slot ${slotIndex + 1}</span>
                <button class="slot-edit-close" onclick="document.getElementById('slot-edit-backdrop').click()">×</button>
            </div>
            <div class="slot-edit-row">
                <span class="slot-edit-label">Keybind</span>
                <input type="text" class="slot-edit-input" id="slot-keybind" value="${binding?.key || ''}" readonly>
                <button class="slot-edit-btn" id="rebind-btn">Rebind</button>
            </div>
            <div class="slot-edit-row">
                <span class="slot-edit-label">Animation</span>
                <select class="slot-edit-input" id="slot-animation">
                    <option value="">-- Select Animation --</option>
                    ${AVAILABLE_ANIMATIONS.map(anim => `
                        <option value="${anim.id}" ${binding?.animation === anim.id ? 'selected' : ''}>${anim.name} (${anim.category})</option>
                    `).join('')}
                </select>
            </div>
            <div class="slot-edit-row">
                <span class="slot-edit-label">Preview</span>
                <div class="animation-preview" id="animation-preview">
                    Animation preview available in-game
                </div>
            </div>
            <div class="slot-edit-row" style="justify-content: flex-end;">
                <button class="slot-edit-btn" id="save-slot-btn">Save Changes</button>
            </div>
        `
        document.body.appendChild(modal)

        document.getElementById('rebind-btn').addEventListener('click', () => {
            const btn = document.getElementById('rebind-btn')
            btn.textContent = 'Press any key...'
            btn.classList.add('waiting')
            
            if (action?.actionId) {
                hotkeyManager.startRebind(action.actionId, (actionId, newKey) => {
                    document.getElementById('slot-keybind').value = newKey
                    btn.textContent = 'Rebind'
                    btn.classList.remove('waiting')
                    this.refresh()
                })
            }
        })

        document.getElementById('slot-animation').addEventListener('change', (e) => {
            if (action?.actionId) {
                hotkeyManager.setAnimation(action.actionId, e.target.value)
            }
        })

        document.getElementById('save-slot-btn').addEventListener('click', () => {
            this.closeSlotEditor()
            this.refresh()
        })
    }

    closeSlotEditor() {
        hotkeyManager.cancelRebind()
        document.getElementById('slot-edit-backdrop')?.remove()
        document.getElementById('slot-edit-modal')?.remove()
        this.editingSlot = null
    }

    setAction(slotIndex, actionConfig) {
        this.actions[slotIndex] = actionConfig
        this.refresh()
    }

    setCooldown(slotIndex, duration) {
        const slot = this.container.querySelector(`[data-slot="${slotIndex}"]`)
        if (!slot) return

        slot.classList.add('on-cooldown')
        const cooldownEl = slot.querySelector('.slot-cooldown')
        
        let remaining = duration
        const interval = setInterval(() => {
            remaining -= 0.1
            if (remaining <= 0) {
                clearInterval(interval)
                slot.classList.remove('on-cooldown')
                cooldownEl.textContent = ''
            } else {
                cooldownEl.textContent = remaining.toFixed(1)
            }
        }, 100)
    }

    refresh() {
        const slotsContainer = this.container.querySelector('.action-bar-slots')
        if (slotsContainer) {
            slotsContainer.outerHTML = this.render()
            this.bindEvents()
        }
    }

    destroy() {
        this.container?.remove()
    }
}

export class ActionBarManager {
    constructor() {
        this.bars = new Map()
    }

    create(id, options) {
        const bar = new ActionBar({ id, ...options })
        bar.create()
        this.bars.set(id, bar)
        return bar
    }

    get(id) {
        return this.bars.get(id)
    }

    remove(id) {
        const bar = this.bars.get(id)
        if (bar) {
            bar.destroy()
            this.bars.delete(id)
        }
    }

    createDefaultLayout() {
        this.create('actionbar-1', {
            position: 'bottom',
            slots: 8,
            actions: [
                { actionId: 'attack_light', icon: '⚔️' },
                { actionId: 'attack_heavy', icon: '🗡️' },
                { actionId: 'attack_special', icon: '💫' },
                { actionId: 'block', icon: '🛡️' },
                { actionId: 'skill_1', icon: '🔥' },
                { actionId: 'skill_2', icon: '❄️' },
                { actionId: 'skill_3', icon: '⚡' },
                { actionId: 'skill_4', icon: '🌀' },
            ]
        })

        this.create('actionbar-2', {
            position: 'bottom-2',
            slots: 6,
            actions: [
                { actionId: 'potion_health', icon: '❤️' },
                { actionId: 'potion_mana', icon: '💙' },
                { actionId: 'dodge_left', icon: '◀️' },
                { actionId: 'dodge_right', icon: '▶️' },
                { actionId: 'ultimate', icon: '🌟' },
                { actionId: 'interact', icon: '🤝' },
            ]
        })

        this.create('actionbar-3', {
            position: 'left',
            slots: 4,
            actions: [
                { actionId: 'target_lock', icon: '🎯' },
                { actionId: 'sprint', icon: '🏃' },
                { actionId: 'jump', icon: '⬆️' },
                { actionId: 'menu', icon: '⚙️' },
            ]
        })

        return this
    }

    hideAll() {
        this.bars.forEach(bar => bar.container.style.display = 'none')
    }

    showAll() {
        this.bars.forEach(bar => bar.container.style.display = 'flex')
    }

    destroyAll() {
        this.bars.forEach(bar => bar.destroy())
        this.bars.clear()
    }
}

export const actionBarManager = new ActionBarManager()
