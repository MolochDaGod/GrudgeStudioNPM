import { editorState } from './EditorState.js'

export class InspectorPanel {
    constructor(container, onTransformChange) {
        this.container = container
        this.onTransformChange = onTransformChange
        this.currentObject = null
        this.updateQueued = false
        
        this.init()
        editorState.events.on('selection-changed', (selection) => {
            this.currentObject = selection[0] || null
            this.render()
        })
    }

    init() {
        this.render()
    }

    render() {
        if (!this.currentObject) {
            this.container.innerHTML = `
                <div class="inspector-header">Inspector</div>
                <div class="inspector-empty">Select an object to view properties</div>
            `
            return
        }

        const obj = this.currentObject
        const pos = obj.position
        const rot = obj.rotation
        const scale = obj.scale

        this.container.innerHTML = `
            <div class="inspector-header">Inspector</div>
            <div class="inspector-content">
                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Object identification and metadata">
                        <span class="section-icon">📋</span> Identity
                    </div>
                    <div class="section-content">
                        <div class="prop-row">
                            <label data-tooltip="Display name of this object">Name</label>
                            <input type="text" id="prop-name" value="${obj.userData.assetName || obj.name || 'Object'}" data-tooltip="Click to edit object name">
                        </div>
                        <div class="prop-row">
                            <label data-tooltip="Asset type identifier">Type</label>
                            <span class="prop-value">${obj.userData.assetId || 'Custom'}</span>
                        </div>
                        <div class="prop-row">
                            <label data-tooltip="Unique identifier">UUID</label>
                            <span class="prop-value prop-uuid">${obj.uuid.substring(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Position, rotation, and scale of object">
                        <span class="section-icon">📐</span> Transform
                    </div>
                    <div class="section-content">
                        <div class="transform-group">
                            <label data-tooltip="World position (X, Y, Z)">Position</label>
                            <div class="vec3-inputs">
                                <div class="vec-input">
                                    <span class="axis x">X</span>
                                    <input type="number" step="0.1" id="pos-x" value="${pos.x.toFixed(2)}" data-tooltip="X position">
                                </div>
                                <div class="vec-input">
                                    <span class="axis y">Y</span>
                                    <input type="number" step="0.1" id="pos-y" value="${pos.y.toFixed(2)}" data-tooltip="Y position (height)">
                                </div>
                                <div class="vec-input">
                                    <span class="axis z">Z</span>
                                    <input type="number" step="0.1" id="pos-z" value="${pos.z.toFixed(2)}" data-tooltip="Z position">
                                </div>
                            </div>
                        </div>
                        <div class="transform-group">
                            <label data-tooltip="Rotation in degrees (X, Y, Z)">Rotation</label>
                            <div class="vec3-inputs">
                                <div class="vec-input">
                                    <span class="axis x">X</span>
                                    <input type="number" step="1" id="rot-x" value="${(rot.x * 180 / Math.PI).toFixed(1)}" data-tooltip="X rotation (pitch)">
                                </div>
                                <div class="vec-input">
                                    <span class="axis y">Y</span>
                                    <input type="number" step="1" id="rot-y" value="${(rot.y * 180 / Math.PI).toFixed(1)}" data-tooltip="Y rotation (yaw)">
                                </div>
                                <div class="vec-input">
                                    <span class="axis z">Z</span>
                                    <input type="number" step="1" id="rot-z" value="${(rot.z * 180 / Math.PI).toFixed(1)}" data-tooltip="Z rotation (roll)">
                                </div>
                            </div>
                        </div>
                        <div class="transform-group">
                            <label data-tooltip="Scale multiplier (X, Y, Z)">Scale</label>
                            <div class="vec3-inputs">
                                <div class="vec-input">
                                    <span class="axis x">X</span>
                                    <input type="number" step="0.1" min="0.01" id="scale-x" value="${scale.x.toFixed(2)}" data-tooltip="X scale">
                                </div>
                                <div class="vec-input">
                                    <span class="axis y">Y</span>
                                    <input type="number" step="0.1" min="0.01" id="scale-y" value="${scale.y.toFixed(2)}" data-tooltip="Y scale">
                                </div>
                                <div class="vec-input">
                                    <span class="axis z">Z</span>
                                    <input type="number" step="0.1" min="0.01" id="scale-z" value="${scale.z.toFixed(2)}" data-tooltip="Z scale">
                                </div>
                            </div>
                            <button class="uniform-scale-btn" id="uniform-scale" data-tooltip="Toggle uniform scaling">🔗</button>
                        </div>
                    </div>
                </div>

                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Visibility and rendering options">
                        <span class="section-icon">👁️</span> Visibility
                    </div>
                    <div class="section-content">
                        <div class="prop-row">
                            <label data-tooltip="Show or hide this object">Visible</label>
                            <input type="checkbox" id="prop-visible" ${obj.visible ? 'checked' : ''} data-tooltip="Toggle visibility">
                        </div>
                        <div class="prop-row">
                            <label data-tooltip="Whether this object casts shadows">Cast Shadow</label>
                            <input type="checkbox" id="prop-cast-shadow" ${obj.castShadow ? 'checked' : ''} data-tooltip="Toggle shadow casting">
                        </div>
                    </div>
                </div>

                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Attached components and scripts">
                        <span class="section-icon">🧩</span> Components
                    </div>
                    <div class="section-content">
                        <div class="component-list" id="component-list">
                            ${this.renderComponents(obj)}
                        </div>
                        <div class="component-dropzone" id="component-dropzone" data-tooltip="Drag scripts, textures, or prefabs here">
                            <span class="dropzone-icon">📥</span>
                            <span class="dropzone-text">Drop Script / Texture / Prefab</span>
                        </div>
                        <button class="add-component-btn" id="btn-add-component" data-tooltip="Add a new component">+ Add Component</button>
                    </div>
                </div>

                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Material and texture settings">
                        <span class="section-icon">🎨</span> Materials
                    </div>
                    <div class="section-content">
                        <div class="material-dropzone" id="material-dropzone" data-tooltip="Drag texture files here">
                            <span class="dropzone-icon">🖼️</span>
                            <span class="dropzone-text">Drop Texture Here</span>
                        </div>
                        <div class="material-list" id="material-list">
                            ${this.renderMaterials(obj)}
                        </div>
                    </div>
                </div>

                <div class="inspector-actions">
                    <button class="action-btn" id="btn-reset-transform" data-tooltip="Reset position, rotation, and scale to defaults">Reset Transform</button>
                    <button class="action-btn danger" id="btn-delete" data-tooltip="Remove this object from the scene">Delete</button>
                </div>
            </div>
        `

        this.bindInputs()
        this.bindDropZones()
    }

    bindInputs() {
        const obj = this.currentObject
        if (!obj) return

        const nameInput = this.container.querySelector('#prop-name')
        nameInput?.addEventListener('change', (e) => {
            obj.userData.assetName = e.target.value
            obj.name = e.target.value
            editorState.events.emit('hierarchy-changed')
        })

        ['pos-x', 'pos-y', 'pos-z'].forEach((id, i) => {
            const input = this.container.querySelector(`#${id}`)
            input?.addEventListener('change', (e) => {
                const val = parseFloat(e.target.value) || 0
                if (i === 0) obj.position.x = val
                if (i === 1) obj.position.y = val
                if (i === 2) obj.position.z = val
                this.onTransformChange?.(obj)
            })
        })

        ['rot-x', 'rot-y', 'rot-z'].forEach((id, i) => {
            const input = this.container.querySelector(`#${id}`)
            input?.addEventListener('change', (e) => {
                const deg = parseFloat(e.target.value) || 0
                const rad = deg * Math.PI / 180
                if (i === 0) obj.rotation.x = rad
                if (i === 1) obj.rotation.y = rad
                if (i === 2) obj.rotation.z = rad
                this.onTransformChange?.(obj)
            })
        })

        ['scale-x', 'scale-y', 'scale-z'].forEach((id, i) => {
            const input = this.container.querySelector(`#${id}`)
            input?.addEventListener('change', (e) => {
                const val = Math.max(0.01, parseFloat(e.target.value) || 1)
                if (i === 0) obj.scale.x = val
                if (i === 1) obj.scale.y = val
                if (i === 2) obj.scale.z = val
                this.onTransformChange?.(obj)
            })
        })

        this.container.querySelector('#prop-visible')?.addEventListener('change', (e) => {
            obj.visible = e.target.checked
        })

        this.container.querySelector('#prop-cast-shadow')?.addEventListener('change', (e) => {
            obj.castShadow = e.target.checked
            obj.traverse(child => { if (child.isMesh) child.castShadow = e.target.checked })
        })

        this.container.querySelector('#btn-reset-transform')?.addEventListener('click', () => {
            obj.position.set(0, 0, 0)
            obj.rotation.set(0, 0, 0)
            obj.scale.set(1, 1, 1)
            this.render()
            this.onTransformChange?.(obj)
        })

        this.container.querySelector('#btn-delete')?.addEventListener('click', () => {
            editorState.events.emit('delete-object', obj)
        })
    }

    queueUpdate() {
        if (this.updateQueued) return
        this.updateQueued = true
        requestAnimationFrame(() => {
            this.render()
            this.updateQueued = false
        })
    }

    renderComponents(obj) {
        const components = obj.userData.components || []
        if (components.length === 0) {
            return '<div class="no-components">No components attached</div>'
        }
        return components.map((comp, i) => `
            <div class="component-item" data-index="${i}">
                <span class="component-icon">${this.getComponentIcon(comp.type)}</span>
                <span class="component-name">${comp.name || comp.type}</span>
                <button class="component-remove" data-index="${i}" title="Remove">×</button>
            </div>
        `).join('')
    }

    getComponentIcon(type) {
        const icons = {
            script: '📜',
            collider: '🧱',
            rigidbody: '⚙️',
            animator: '🎬',
            audio: '🔊',
            light: '💡',
            particle: '✨',
            prefab: '📦'
        }
        return icons[type] || '🧩'
    }

    renderMaterials(obj) {
        const materials = []
        obj.traverse(child => {
            if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material]
                mats.forEach(m => {
                    if (!materials.find(x => x.uuid === m.uuid)) {
                        materials.push(m)
                    }
                })
            }
        })
        
        if (materials.length === 0) {
            return '<div class="no-materials">No materials</div>'
        }
        
        return materials.slice(0, 5).map((mat, i) => `
            <div class="material-item" data-index="${i}">
                <span class="material-color" style="background: ${mat.color ? '#' + mat.color.getHexString() : '#888'}"></span>
                <span class="material-name">${mat.name || 'Material ' + (i + 1)}</span>
            </div>
        `).join('')
    }

    bindDropZones() {
        const componentDropzone = this.container.querySelector('#component-dropzone')
        const materialDropzone = this.container.querySelector('#material-dropzone')

        if (componentDropzone) {
            componentDropzone.addEventListener('dragover', (e) => {
                e.preventDefault()
                componentDropzone.classList.add('dragover')
            })
            componentDropzone.addEventListener('dragleave', () => {
                componentDropzone.classList.remove('dragover')
            })
            componentDropzone.addEventListener('drop', (e) => {
                e.preventDefault()
                componentDropzone.classList.remove('dragover')
                this.handleComponentDrop(e)
            })
        }

        if (materialDropzone) {
            materialDropzone.addEventListener('dragover', (e) => {
                e.preventDefault()
                materialDropzone.classList.add('dragover')
            })
            materialDropzone.addEventListener('dragleave', () => {
                materialDropzone.classList.remove('dragover')
            })
            materialDropzone.addEventListener('drop', (e) => {
                e.preventDefault()
                materialDropzone.classList.remove('dragover')
                this.handleMaterialDrop(e)
            })
        }

        const addComponentBtn = this.container.querySelector('#btn-add-component')
        if (addComponentBtn) {
            addComponentBtn.addEventListener('click', () => this.showComponentMenu())
        }

        this.container.querySelectorAll('.component-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation()
                const index = parseInt(btn.dataset.index)
                this.removeComponent(index)
            })
        })
    }

    handleComponentDrop(e) {
        const files = e.dataTransfer?.files
        const data = e.dataTransfer?.getData('text/plain')
        
        if (files && files.length > 0) {
            const file = files[0]
            const ext = file.name.split('.').pop().toLowerCase()
            
            if (['js', 'lua', 'ts'].includes(ext)) {
                this.addComponent({ type: 'script', name: file.name, file: file.name })
            } else if (['glb', 'gltf', 'fbx'].includes(ext)) {
                this.addComponent({ type: 'prefab', name: file.name, file: file.name })
            }
        } else if (data) {
            try {
                const parsed = JSON.parse(data)
                this.addComponent(parsed)
            } catch {
                this.addComponent({ type: 'script', name: data })
            }
        }
    }

    handleMaterialDrop(e) {
        const files = e.dataTransfer?.files
        
        if (files && files.length > 0) {
            const file = files[0]
            const ext = file.name.split('.').pop().toLowerCase()
            
            if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
                console.log('[Inspector] Texture dropped:', file.name)
                editorState.events.emit('texture-dropped', { object: this.currentObject, file })
            }
        }
    }

    addComponent(component) {
        if (!this.currentObject) return
        
        if (!this.currentObject.userData.components) {
            this.currentObject.userData.components = []
        }
        
        this.currentObject.userData.components.push({
            type: component.type || 'script',
            name: component.name || 'New Component',
            file: component.file || null,
            enabled: true
        })
        
        this.render()
        console.log('[Inspector] Component added:', component.name)
    }

    removeComponent(index) {
        if (!this.currentObject?.userData.components) return
        
        this.currentObject.userData.components.splice(index, 1)
        this.render()
    }

    showComponentMenu() {
        const components = [
            { type: 'script', name: 'Lua Script', icon: '📜' },
            { type: 'collider', name: 'Box Collider', icon: '🧱' },
            { type: 'rigidbody', name: 'Rigidbody', icon: '⚙️' },
            { type: 'animator', name: 'Animator', icon: '🎬' },
            { type: 'audio', name: 'Audio Source', icon: '🔊' },
            { type: 'particle', name: 'Particle System', icon: '✨' }
        ]
        
        const menu = document.createElement('div')
        menu.className = 'component-menu'
        menu.innerHTML = components.map(c => `
            <div class="component-menu-item" data-type="${c.type}" data-name="${c.name}">
                <span>${c.icon}</span> ${c.name}
            </div>
        `).join('')
        
        const btn = this.container.querySelector('#btn-add-component')
        if (btn) {
            btn.parentNode.insertBefore(menu, btn.nextSibling)
            
            menu.querySelectorAll('.component-menu-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.addComponent({ type: item.dataset.type, name: item.dataset.name })
                    menu.remove()
                })
            })
            
            setTimeout(() => {
                document.addEventListener('click', function closeMenu(e) {
                    if (!menu.contains(e.target)) {
                        menu.remove()
                        document.removeEventListener('click', closeMenu)
                    }
                })
            }, 10)
        }
    }
}
