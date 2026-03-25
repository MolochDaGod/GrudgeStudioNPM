import { editorState } from './EditorState.js'

export class HierarchyPanel {
    constructor(container, scene, onSelect, onDelete) {
        this.container = container
        this.scene = scene
        this.onSelect = onSelect
        this.onDelete = onDelete
        this.expandedNodes = new Set()
        this.contextMenu = null
        this.clipboard = null
        this.draggedNode = null
        
        this.init()
        editorState.events.on('selection-changed', () => this.render())
        editorState.events.on('hierarchy-changed', () => this.render())
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e))
    }
    
    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
        
        const selected = editorState.selectedObjects[0]
        if (!selected) return
        
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
            this.copyObject(selected)
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
            this.pasteObject()
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
            this.cutObject(selected)
        }
    }
    
    copyObject(obj) {
        if (!obj) return
        this.clipboard = { object: obj, isCut: false }
        console.log('[Hierarchy] Copied:', obj.userData.assetName || obj.name)
    }
    
    cutObject(obj) {
        if (!obj) return
        this.clipboard = { object: obj, isCut: true }
        console.log('[Hierarchy] Cut:', obj.userData.assetName || obj.name)
    }
    
    pasteObject() {
        if (!this.clipboard) return
        editorState.events.emit('paste-object', this.clipboard)
        if (this.clipboard.isCut) {
            this.clipboard = null
        }
    }

    init() {
        this.container.innerHTML = `
            <div class="hierarchy-header">
                <span>Scene Hierarchy</span>
                <button class="hierarchy-btn" data-tooltip="Expand All" data-action="expand-all">+</button>
                <button class="hierarchy-btn" data-tooltip="Collapse All" data-action="collapse-all">-</button>
            </div>
            <div class="hierarchy-search">
                <input type="text" placeholder="Search..." id="hierarchy-search-input" data-tooltip="Filter objects by name">
            </div>
            <div class="hierarchy-tree" id="hierarchy-tree"></div>
        `

        this.treeContainer = this.container.querySelector('#hierarchy-tree')
        this.searchInput = this.container.querySelector('#hierarchy-search-input')
        
        this.container.querySelector('[data-action="expand-all"]').addEventListener('click', () => this.expandAll())
        this.container.querySelector('[data-action="collapse-all"]').addEventListener('click', () => this.collapseAll())
        this.searchInput.addEventListener('input', () => this.render())
        
        this.createContextMenu()
    }

    createContextMenu() {
        this.contextMenu = document.createElement('div')
        this.contextMenu.className = 'hierarchy-context-menu'
        this.contextMenu.style.cssText = `
            position: fixed;
            background: rgba(20, 26, 43, 0.98);
            border: 1px solid #2a3150;
            border-radius: 8px;
            padding: 4px 0;
            min-width: 150px;
            z-index: 10001;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        `
        this.contextMenu.innerHTML = `
            <div class="ctx-item" data-action="rename"><span>Rename</span><span class="ctx-shortcut">F2</span></div>
            <div class="ctx-separator"></div>
            <div class="ctx-item" data-action="cut"><span>Cut</span><span class="ctx-shortcut">Ctrl+X</span></div>
            <div class="ctx-item" data-action="copy"><span>Copy</span><span class="ctx-shortcut">Ctrl+C</span></div>
            <div class="ctx-item" data-action="paste"><span>Paste</span><span class="ctx-shortcut">Ctrl+V</span></div>
            <div class="ctx-item" data-action="duplicate"><span>Duplicate</span><span class="ctx-shortcut">Ctrl+D</span></div>
            <div class="ctx-separator"></div>
            <div class="ctx-item" data-action="focus"><span>Focus Camera</span><span class="ctx-shortcut">F</span></div>
            <div class="ctx-item" data-action="hide"><span>Hide/Show</span><span class="ctx-shortcut">H</span></div>
            <div class="ctx-item" data-action="unpack"><span>Unpack Model</span><span class="ctx-shortcut">U</span></div>
            <div class="ctx-separator"></div>
            <div class="ctx-item ctx-danger" data-action="delete"><span>Delete</span><span class="ctx-shortcut">Del</span></div>
        `
        document.body.appendChild(this.contextMenu)

        document.addEventListener('click', () => this.hideContextMenu())
        
        this.contextMenu.querySelectorAll('.ctx-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation()
                this.handleContextAction(item.dataset.action)
            })
        })
    }

    showContextMenu(e, node) {
        e.preventDefault()
        this.contextMenuTarget = node
        this.contextMenu.style.display = 'block'
        this.contextMenu.style.left = `${e.clientX}px`
        this.contextMenu.style.top = `${e.clientY}px`
    }

    hideContextMenu() {
        this.contextMenu.style.display = 'none'
    }

    handleContextAction(action) {
        if (!this.contextMenuTarget) return
        
        switch (action) {
            case 'rename':
                this.startRename(this.contextMenuTarget)
                break
            case 'cut':
                this.cutObject(this.contextMenuTarget)
                break
            case 'copy':
                this.copyObject(this.contextMenuTarget)
                break
            case 'paste':
                this.pasteObject()
                break
            case 'duplicate':
                editorState.events.emit('duplicate-object', this.contextMenuTarget)
                break
            case 'focus':
                editorState.events.emit('focus-object', this.contextMenuTarget)
                break
            case 'hide':
                editorState.events.emit('toggle-visibility', this.contextMenuTarget)
                break
            case 'unpack':
                editorState.events.emit('unpack-object', this.contextMenuTarget)
                break
            case 'delete':
                if (this.onDelete) this.onDelete(this.contextMenuTarget)
                break
        }
        
        this.hideContextMenu()
    }

    startRename(obj) {
        const node = this.treeContainer.querySelector(`[data-uuid="${obj.uuid}"]`)
        if (!node) return
        
        const label = node.querySelector('.node-label')
        const currentName = obj.userData.assetName || obj.name || 'Object'
        
        label.innerHTML = `<input type="text" class="rename-input" value="${currentName}">`
        const input = label.querySelector('input')
        input.focus()
        input.select()
        
        const finish = () => {
            const newName = input.value.trim() || currentName
            obj.userData.assetName = newName
            obj.name = newName
            this.render()
        }
        
        input.addEventListener('blur', finish)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finish()
            if (e.key === 'Escape') this.render()
        })
    }

    getSceneObjects() {
        const objects = []
        this.scene.traverse((child) => {
            if (child.userData.isTerrain) {
                child.userData.assetName = child.userData.assetName || 'Terrain'
                child.userData.objectType = 'terrain'
                objects.push(child)
            }
            if (child.userData.isWater) {
                child.userData.assetName = child.userData.assetName || 'Water'
                child.userData.objectType = 'water'
                objects.push(child)
            }
            if (child.userData.assetId || child.userData.assetName) {
                if (!child.userData.isTerrain && !child.userData.isWater) {
                    objects.push(child)
                }
            }
        })
        return objects
    }

    render() {
        const searchTerm = this.searchInput?.value.toLowerCase() || ''
        const objects = this.getSceneObjects()
        
        const filtered = searchTerm 
            ? objects.filter(obj => {
                const name = (obj.userData.assetName || obj.name || 'Object').toLowerCase()
                return name.includes(searchTerm)
            })
            : objects

        this.treeContainer.innerHTML = filtered.length === 0 
            ? '<div class="hierarchy-empty">No objects in scene</div>'
            : filtered.map(obj => this.renderNode(obj)).join('')

        this.treeContainer.querySelectorAll('.hierarchy-node').forEach(node => {
            node.addEventListener('click', (e) => {
                e.stopPropagation()
                const uuid = node.dataset.uuid
                const obj = objects.find(o => o.uuid === uuid)
                if (obj && this.onSelect) {
                    this.onSelect(obj)
                }
            })
            
            node.addEventListener('contextmenu', (e) => {
                const uuid = node.dataset.uuid
                const obj = objects.find(o => o.uuid === uuid)
                if (obj) this.showContextMenu(e, obj)
            })
        })

        this.treeContainer.querySelectorAll('.node-expand').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation()
                const uuid = btn.closest('.hierarchy-node').dataset.uuid
                this.toggleExpand(uuid)
            })
        })
    }

    renderNode(obj, depth = 0) {
        const name = obj.userData.assetName || obj.name || 'Object'
        const isSelected = editorState.selectedObjects.includes(obj)
        const hasChildren = obj.children.length > 0
        const isExpanded = this.expandedNodes.has(obj.uuid)
        const icon = this.getIcon(obj)

        return `
            <div class="hierarchy-node ${isSelected ? 'selected' : ''}" 
                 data-uuid="${obj.uuid}" 
                 style="padding-left: ${depth * 16 + 8}px"
                 data-tooltip="${name} (${obj.userData.assetId || 'Object'})">
                ${hasChildren ? `<span class="node-expand">${isExpanded ? '▼' : '▶'}</span>` : '<span class="node-spacer"></span>'}
                <span class="node-icon">${icon}</span>
                <span class="node-label">${name}</span>
            </div>
        `
    }

    getIcon(obj) {
        const type = obj.userData.assetId || obj.userData.objectType || ''
        const icons = {
            empty: '⬚',
            trigger: '🔶',
            spawn: '🎯',
            waypoint: '📍',
            tree: '🌲',
            rock: '🪨',
            bush: '🌿',
            gladiator: '⚔️',
            spartan: '🛡️',
            arena: '🏛️',
            point_light: '💡',
            spot_light: '🔦',
            dir_light: '☀️',
            light: '💡',
            camera: '📷',
            cube: '⬜',
            sphere: '🔵',
            plane: '▬',
            cylinder: '🛢️',
            primitive: '⬜',
            terrain: '🏔️',
            water: '💧'
        }
        return icons[type] || '📦'
    }

    toggleExpand(uuid) {
        if (this.expandedNodes.has(uuid)) {
            this.expandedNodes.delete(uuid)
        } else {
            this.expandedNodes.add(uuid)
        }
        this.render()
    }

    expandAll() {
        this.getSceneObjects().forEach(obj => this.expandedNodes.add(obj.uuid))
        this.render()
    }

    collapseAll() {
        this.expandedNodes.clear()
        this.render()
    }

    destroy() {
        if (this.contextMenu && this.contextMenu.parentNode) {
            this.contextMenu.parentNode.removeChild(this.contextMenu)
        }
    }
}
