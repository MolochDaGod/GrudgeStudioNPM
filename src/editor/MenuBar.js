import { editorState } from './EditorState.js'

export class MenuBar {
    constructor(container, commands) {
        this.container = container
        this.commands = commands
        this.activeMenu = null
        
        this.menus = [
            {
                name: 'File',
                items: [
                    { label: 'New Scene', shortcut: 'Ctrl+N', action: 'new-scene', tooltip: 'Create a new empty scene' },
                    { label: 'Save Scene', shortcut: 'Ctrl+S', action: 'save-scene', tooltip: 'Save current scene locally' },
                    { label: 'Load Scene', shortcut: 'Ctrl+O', action: 'load-scene', tooltip: 'Load scene from local storage' },
                    { separator: true },
                    { label: 'Save to Cloud', shortcut: 'Ctrl+Shift+S', action: 'save-cloud', tooltip: 'Save scene to cloud storage' },
                    { label: 'Load from Cloud', shortcut: 'Ctrl+Shift+O', action: 'load-cloud', tooltip: 'Load scene from cloud storage' },
                    { separator: true },
                    { label: 'Import Asset...', shortcut: 'Ctrl+I', action: 'import-asset', tooltip: 'Import FBX, OBJ, GLB, GLTF, or JSON files' },
                    { separator: true },
                    { label: 'Export as GLB', action: 'export-glb', tooltip: 'Export scene as GLB file' },
                    { label: 'Export as JSON', action: 'export-json', tooltip: 'Export scene data as JSON' },
                    { separator: true },
                    { label: 'Exit to Menu', action: 'exit', tooltip: 'Return to main menu' }
                ]
            },
            {
                name: 'Edit',
                items: [
                    { label: 'Undo', shortcut: 'Ctrl+Z', action: 'undo', tooltip: 'Undo last action' },
                    { label: 'Redo', shortcut: 'Ctrl+Y', action: 'redo', tooltip: 'Redo last undone action' },
                    { separator: true },
                    { label: 'Cut', shortcut: 'Ctrl+X', action: 'cut', tooltip: 'Cut selected objects' },
                    { label: 'Copy', shortcut: 'Ctrl+C', action: 'copy', tooltip: 'Copy selected objects' },
                    { label: 'Paste', shortcut: 'Ctrl+V', action: 'paste', tooltip: 'Paste copied objects' },
                    { label: 'Duplicate', shortcut: 'Ctrl+D', action: 'duplicate', tooltip: 'Duplicate selected objects' },
                    { separator: true },
                    { label: 'Delete', shortcut: 'Del', action: 'delete', tooltip: 'Delete selected objects' },
                    { label: 'Select All', shortcut: 'Ctrl+A', action: 'select-all', tooltip: 'Select all objects in scene' }
                ]
            },
            {
                name: 'View',
                items: [
                    { label: 'Toggle Hierarchy', shortcut: 'H', action: 'toggle-hierarchy', tooltip: 'Show/hide hierarchy panel' },
                    { label: 'Toggle Inspector', shortcut: 'I', action: 'toggle-inspector', tooltip: 'Show/hide inspector panel' },
                    { label: 'Toggle Assets', shortcut: 'A', action: 'toggle-assets', tooltip: 'Show/hide assets panel' },
                    { separator: true },
                    { label: 'Reset Camera', action: 'reset-camera', tooltip: 'Reset camera to default position' },
                    { label: 'Focus Selected', shortcut: 'F', action: 'focus-selected', tooltip: 'Focus camera on selected object' },
                    { separator: true },
                    { label: 'Toggle Grid', shortcut: 'G', action: 'toggle-grid', tooltip: 'Show/hide grid overlay' },
                    { label: 'Toggle Wireframe', action: 'toggle-wireframe', tooltip: 'Toggle wireframe rendering' }
                ]
            },
            {
                name: 'Add',
                items: [
                    { label: 'Empty Object', action: 'add-empty', tooltip: 'Add an empty transform node' },
                    { separator: true },
                    { label: 'Tree', action: 'add-tree', tooltip: 'Add a procedural tree' },
                    { label: 'Rock', action: 'add-rock', tooltip: 'Add a procedural rock' },
                    { label: 'Bush', action: 'add-bush', tooltip: 'Add a procedural bush' },
                    { separator: true },
                    { label: 'Gladiator', action: 'add-gladiator', tooltip: 'Add gladiator character' },
                    { label: 'Spartan', action: 'add-spartan', tooltip: 'Add spartan character' },
                    { separator: true },
                    { label: 'Point Light', action: 'add-point-light', tooltip: 'Add a point light source' },
                    { label: 'Spot Light', action: 'add-spot-light', tooltip: 'Add a spotlight' }
                ]
            },
            {
                name: 'Settings',
                items: [
                    { label: 'Grid Size...', action: 'settings-grid', tooltip: 'Adjust placement grid size' },
                    { label: 'Snap to Grid', action: 'toggle-snap', tooltip: 'Toggle grid snapping', checked: true },
                    { separator: true },
                    { label: 'Show Gizmos', action: 'toggle-gizmos', tooltip: 'Show/hide transform gizmos', checked: true },
                    { label: 'Show Helpers', action: 'toggle-helpers', tooltip: 'Show/hide light/camera helpers', checked: true },
                    { separator: true },
                    { label: 'Editor Theme', action: 'settings-theme', tooltip: 'Change editor color theme' },
                    { label: 'Performance', action: 'settings-performance', tooltip: 'Adjust rendering quality' },
                    { separator: true },
                    { label: 'Stats Admin', action: 'stats-admin', tooltip: 'Configure attribute diminishing returns and power rankings' },
                    { separator: true },
                    { label: 'Reset Preferences', action: 'reset-prefs', tooltip: 'Reset all editor settings to defaults' }
                ]
            },
            {
                name: 'Help',
                items: [
                    { label: 'Keyboard Shortcuts', shortcut: '?', action: 'show-shortcuts', tooltip: 'View all keyboard shortcuts' },
                    { label: 'Documentation', action: 'show-docs', tooltip: 'Open documentation' },
                    { separator: true },
                    { label: 'About Grudge Studio', action: 'show-about', tooltip: 'About this editor' }
                ]
            }
        ]

        this.init()
        this.bindKeyboardShortcuts()
    }

    init() {
        this.container.innerHTML = `
            <div class="menu-bar">
                ${this.menus.map(menu => `
                    <div class="menu-item" data-menu="${menu.name}">
                        <span class="menu-label">${menu.name}</span>
                        <div class="menu-dropdown">
                            ${menu.items.map(item => 
                                item.separator 
                                    ? '<div class="menu-separator"></div>'
                                    : `<div class="menu-option" data-action="${item.action}" data-tooltip="${item.tooltip || ''}">
                                        <span>${item.label}</span>
                                        ${item.shortcut ? `<span class="menu-shortcut">${item.shortcut}</span>` : ''}
                                    </div>`
                            ).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `

        this.container.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (this.activeMenu) {
                    this.closeAllMenus()
                    this.openMenu(item)
                }
            })
            
            item.querySelector('.menu-label').addEventListener('click', (e) => {
                e.stopPropagation()
                if (this.activeMenu === item) {
                    this.closeAllMenus()
                } else {
                    this.closeAllMenus()
                    this.openMenu(item)
                }
            })
        })

        this.container.querySelectorAll('.menu-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation()
                const action = option.dataset.action
                this.executeCommand(action)
                this.closeAllMenus()
            })
        })

        document.addEventListener('click', () => this.closeAllMenus())
    }

    openMenu(item) {
        item.classList.add('active')
        this.activeMenu = item
    }

    closeAllMenus() {
        this.container.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active')
        })
        this.activeMenu = null
    }

    executeCommand(action) {
        if (this.commands[action]) {
            this.commands[action]()
        } else {
            console.log('Command not implemented:', action)
        }
    }

    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

            const ctrl = e.ctrlKey || e.metaKey

            if (ctrl && e.key === 'z') {
                e.preventDefault()
                this.executeCommand('undo')
            } else if (ctrl && e.key === 'y') {
                e.preventDefault()
                this.executeCommand('redo')
            } else if (ctrl && e.key === 's') {
                e.preventDefault()
                this.executeCommand('save-scene')
            } else if (ctrl && e.key === 'c') {
                e.preventDefault()
                this.executeCommand('copy')
            } else if (ctrl && e.key === 'v') {
                e.preventDefault()
                this.executeCommand('paste')
            } else if (ctrl && e.key === 'd') {
                e.preventDefault()
                this.executeCommand('duplicate')
            } else if (ctrl && e.key === 'a') {
                e.preventDefault()
                this.executeCommand('select-all')
            } else if (e.key === 'f' && !ctrl) {
                this.executeCommand('focus-selected')
            } else if (e.key === '?') {
                this.executeCommand('show-shortcuts')
            }
        })
    }
}
