export class EditorEvents {
    constructor() {
        this.listeners = new Map()
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event).push(callback)
        return () => this.off(event, callback)
    }

    off(event, callback) {
        const handlers = this.listeners.get(event)
        if (handlers) {
            const idx = handlers.indexOf(callback)
            if (idx > -1) handlers.splice(idx, 1)
        }
    }

    emit(event, data) {
        const handlers = this.listeners.get(event)
        if (handlers) {
            handlers.forEach(fn => fn(data))
        }
    }
}

export class EditorState {
    constructor() {
        this.events = new EditorEvents()
        this.selectedObjects = []
        this.hierarchyNodes = new Map()
        this.undoStack = []
        this.redoStack = []
        this.clipboardData = null
        this.panels = {
            hierarchy: true,
            inspector: true,
            assets: true
        }
    }

    select(objects) {
        this.selectedObjects = Array.isArray(objects) ? objects : [objects]
        this.events.emit('selection-changed', this.selectedObjects)
    }

    clearSelection() {
        this.selectedObjects = []
        this.events.emit('selection-changed', [])
    }

    addToSelection(obj) {
        if (!this.selectedObjects.includes(obj)) {
            this.selectedObjects.push(obj)
            this.events.emit('selection-changed', this.selectedObjects)
        }
    }

    registerNode(uuid, nodeData) {
        this.hierarchyNodes.set(uuid, nodeData)
        this.events.emit('hierarchy-changed')
    }

    unregisterNode(uuid) {
        this.hierarchyNodes.delete(uuid)
        this.events.emit('hierarchy-changed')
    }

    updateNode(uuid, changes) {
        const node = this.hierarchyNodes.get(uuid)
        if (node) {
            Object.assign(node, changes)
            this.events.emit('hierarchy-changed')
        }
    }

    pushUndo(action) {
        this.undoStack.push(action)
        this.redoStack = []
        this.events.emit('history-changed')
    }

    undo() {
        if (this.undoStack.length === 0) return
        const action = this.undoStack.pop()
        if (action.undo) action.undo()
        this.redoStack.push(action)
        this.events.emit('history-changed')
    }

    redo() {
        if (this.redoStack.length === 0) return
        const action = this.redoStack.pop()
        if (action.redo) action.redo()
        this.undoStack.push(action)
        this.events.emit('history-changed')
    }

    togglePanel(panelName) {
        this.panels[panelName] = !this.panels[panelName]
        this.events.emit('panels-changed', this.panels)
    }

    copy() {
        if (this.selectedObjects.length > 0) {
            this.clipboardData = this.selectedObjects.map(obj => ({
                type: obj.userData.assetId || 'unknown',
                position: obj.position.clone(),
                rotation: obj.rotation.clone(),
                scale: obj.scale.clone()
            }))
            this.events.emit('clipboard-changed')
        }
    }

    canPaste() {
        return this.clipboardData !== null && this.clipboardData.length > 0
    }
}

export const editorState = new EditorState()
