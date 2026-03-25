/*
    GRUDGE Studio - Node Graph Editor UI
    Visual canvas-based node editor
*/

import { NodeGraph } from './NodeGraph.js'

export class NodeGraphEditor {
    constructor(containerId = 'node-graph-editor') {
        this.containerId = containerId
        this.container = null
        this.canvas = null
        this.ctx = null
        this.graph = new NodeGraph()
        
        this.isOpen = false
        this.pan = { x: 0, y: 0 }
        this.zoom = 1
        this.dragging = null
        this.connecting = null
        this.selectedNodes = new Set()
        
        this.gridSize = 20
        this.animationTime = 0
        this.animationFrame = null
        this.nodeColors = {
            Number: '#2563eb',
            Math: '#7c3aed',
            Vector3: '#059669',
            Color: '#dc2626',
            Time: '#0891b2',
            Sine: '#6366f1',
            Transform: '#f59e0b',
            Mesh: '#10b981',
            BoxGeometry: '#64748b',
            SphereGeometry: '#64748b',
            StandardMaterial: '#8b5cf6',
            Scene: '#1e3a8a',
            Renderer: '#be185d'
        }
    }
    
    createPanel() {
        if (document.getElementById(this.containerId)) {
            this.container = document.getElementById(this.containerId)
            return
        }
        
        this.container = document.createElement('div')
        this.container.id = this.containerId
        this.container.innerHTML = `
            <style>
                #${this.containerId} {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: #0f0f1a;
                    display: none;
                    flex-direction: column;
                    z-index: 3000;
                    font-family: 'Segoe UI', Arial, sans-serif;
                }
                #${this.containerId}.open {
                    display: flex;
                }
                .nge-header {
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    background: #1a1a28;
                    border-bottom: 1px solid #3d3d5c;
                    gap: 12px;
                }
                .nge-title {
                    color: #e0e0e0;
                    font-weight: 600;
                    font-size: 14px;
                }
                .nge-btn {
                    padding: 6px 12px;
                    background: #3d3d5c;
                    border: none;
                    border-radius: 4px;
                    color: #e0e0e0;
                    font-size: 12px;
                    cursor: pointer;
                }
                .nge-btn:hover {
                    background: #4d4d7a;
                }
                .nge-btn.primary {
                    background: #6366f1;
                }
                .nge-close {
                    margin-left: auto;
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 20px;
                    cursor: pointer;
                }
                .nge-close:hover {
                    color: #ff6b6b;
                }
                .nge-main {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                .nge-sidebar {
                    width: 220px;
                    background: #1a1a28;
                    border-right: 1px solid #3d3d5c;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .nge-section-title {
                    color: #888;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                    text-align: center;
                    width: 100%;
                }
                .nge-node-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    width: 100%;
                }
                .nge-node-item {
                    padding: 10px 14px;
                    background: #252538;
                    border-radius: 6px;
                    color: #e0e0e0;
                    font-size: 12px;
                    cursor: grab;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }
                .nge-node-item:hover {
                    background: #3d3d5c;
                    border-color: #6366f1;
                    transform: translateX(4px);
                }
                .nge-node-icon {
                    width: 20px;
                    text-align: center;
                }
                .nge-canvas-container {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }
                .nge-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .nge-context-menu {
                    position: fixed;
                    background: #1a1a28;
                    border: 1px solid #3d3d5c;
                    border-radius: 6px;
                    padding: 4px 0;
                    min-width: 150px;
                    z-index: 4000;
                    display: none;
                }
                .nge-context-menu.visible {
                    display: block;
                }
                .nge-menu-item {
                    padding: 8px 16px;
                    color: #e0e0e0;
                    font-size: 12px;
                    cursor: pointer;
                }
                .nge-menu-item:hover {
                    background: #3d3d5c;
                }
                .nge-menu-separator {
                    height: 1px;
                    background: #3d3d5c;
                    margin: 4px 0;
                }
                .nge-status {
                    padding: 4px 12px;
                    background: #151520;
                    border-top: 1px solid #3d3d5c;
                    color: #888;
                    font-size: 11px;
                    display: flex;
                    gap: 20px;
                }
            </style>
            
            <div class="nge-header">
                <span class="nge-title">Node Graph Editor</span>
                <button class="nge-btn" id="nge-clear-btn">Clear</button>
                <button class="nge-btn" id="nge-save-btn">Save</button>
                <button class="nge-btn" id="nge-load-btn">Load</button>
                <button class="nge-btn primary" id="nge-export-btn">Export Code</button>
                <button class="nge-close" id="nge-close-btn">&times;</button>
            </div>
            
            <div class="nge-main">
                <div class="nge-sidebar">
                    <div class="nge-section-title">Node Library</div>
                    <div class="nge-node-list" id="nge-node-list"></div>
                </div>
                
                <div class="nge-canvas-container">
                    <canvas class="nge-canvas" id="nge-canvas"></canvas>
                </div>
            </div>
            
            <div class="nge-status">
                <span id="nge-status-nodes">Nodes: 0</span>
                <span id="nge-status-connections">Connections: 0</span>
                <span id="nge-status-zoom">Zoom: 100%</span>
            </div>
            
            <div class="nge-context-menu" id="nge-context-menu"></div>
        `
        
        document.body.appendChild(this.container)
        this.canvas = this.container.querySelector('#nge-canvas')
        this.ctx = this.canvas.getContext('2d')
        
        this.bindEvents()
        this.populateLibrary()
    }
    
    bindEvents() {
        const closeBtn = this.container.querySelector('#nge-close-btn')
        closeBtn.addEventListener('click', () => this.close())
        
        const clearBtn = this.container.querySelector('#nge-clear-btn')
        clearBtn.addEventListener('click', () => {
            this.graph.clear()
            this.render()
        })
        
        const saveBtn = this.container.querySelector('#nge-save-btn')
        saveBtn.addEventListener('click', () => this.save())
        
        const loadBtn = this.container.querySelector('#nge-load-btn')
        loadBtn.addEventListener('click', () => this.load())
        
        const exportBtn = this.container.querySelector('#nge-export-btn')
        exportBtn.addEventListener('click', () => this.exportCode())
        
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e))
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e))
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e))
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e))
        this.canvas.addEventListener('contextmenu', (e) => this.onContextMenu(e))
        
        document.addEventListener('click', () => this.hideContextMenu())
        
        window.addEventListener('resize', () => {
            if (this.isOpen) this.resize()
        })
    }
    
    populateLibrary() {
        const list = this.container.querySelector('#nge-node-list')
        const nodeIcons = {
            Number: '#',
            Math: '±',
            Vector3: '→',
            Color: '●',
            Time: '⏱',
            Sine: '∿',
            Transform: '⊕',
            Mesh: '◇',
            BoxGeometry: '□',
            SphereGeometry: '○',
            StandardMaterial: '◉',
            Scene: '🎬',
            Renderer: '🖥'
        }
        
        list.innerHTML = this.graph.getNodeTypes().map(type => `
            <div class="nge-node-item" data-type="${type}" draggable="true">
                <span class="nge-node-icon">${nodeIcons[type] || '◆'}</span>
                <span>${type}</span>
            </div>
        `).join('')
        
        list.querySelectorAll('.nge-node-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('nodeType', item.dataset.type)
            })
            
            item.addEventListener('dblclick', () => {
                const rect = this.canvas.getBoundingClientRect()
                const x = (rect.width / 2 - this.pan.x) / this.zoom
                const y = (rect.height / 2 - this.pan.y) / this.zoom
                this.graph.createNode(item.dataset.type, x, y)
                this.render()
            })
        })
        
        this.canvas.addEventListener('dragover', (e) => e.preventDefault())
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault()
            const type = e.dataTransfer.getData('nodeType')
            if (type) {
                const rect = this.canvas.getBoundingClientRect()
                const x = (e.clientX - rect.left - this.pan.x) / this.zoom
                const y = (e.clientY - rect.top - this.pan.y) / this.zoom
                this.graph.createNode(type, x, y)
                this.render()
            }
        })
    }
    
    resize() {
        const container = this.container.querySelector('.nge-canvas-container')
        const rect = container.getBoundingClientRect()
        this.canvas.width = rect.width * window.devicePixelRatio
        this.canvas.height = rect.height * window.devicePixelRatio
        this.canvas.style.width = rect.width + 'px'
        this.canvas.style.height = rect.height + 'px'
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.render()
    }
    
    screenToWorld(x, y) {
        return {
            x: (x - this.pan.x) / this.zoom,
            y: (y - this.pan.y) / this.zoom
        }
    }
    
    worldToScreen(x, y) {
        return {
            x: x * this.zoom + this.pan.x,
            y: y * this.zoom + this.pan.y
        }
    }
    
    getNodeAt(x, y) {
        const world = this.screenToWorld(x, y)
        
        for (const node of this.graph.nodes.values()) {
            const height = 40 + (node.inputs.size + node.outputs.size) * 24
            if (world.x >= node.x && world.x <= node.x + node.width &&
                world.y >= node.y && world.y <= node.y + height) {
                return node
            }
        }
        return null
    }
    
    getPortAt(x, y) {
        const world = this.screenToWorld(x, y)
        
        for (const node of this.graph.nodes.values()) {
            let portY = node.y + 40
            
            for (const port of node.inputs.values()) {
                if (Math.abs(world.x - node.x) < 10 &&
                    Math.abs(world.y - portY - 12) < 10) {
                    return port
                }
                portY += 24
            }
            
            for (const port of node.outputs.values()) {
                if (Math.abs(world.x - (node.x + node.width)) < 10 &&
                    Math.abs(world.y - portY - 12) < 10) {
                    return port
                }
                portY += 24
            }
        }
        return null
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            this.dragging = { type: 'pan', startX: x, startY: y, startPanX: this.pan.x, startPanY: this.pan.y }
            return
        }
        
        const port = this.getPortAt(x, y)
        if (port) {
            this.connecting = {
                startPort: port,
                startX: x,
                startY: y,
                currentX: x,
                currentY: y
            }
            return
        }
        
        const node = this.getNodeAt(x, y)
        if (node) {
            if (!e.shiftKey) {
                this.selectedNodes.clear()
            }
            this.selectedNodes.add(node.id)
            node.selected = true
            
            const world = this.screenToWorld(x, y)
            this.dragging = {
                type: 'node',
                node: node,
                offsetX: world.x - node.x,
                offsetY: world.y - node.y
            }
            this.render()
        } else {
            this.selectedNodes.clear()
            this.graph.nodes.forEach(n => n.selected = false)
            this.render()
        }
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        if (this.dragging?.type === 'pan') {
            this.pan.x = this.dragging.startPanX + (x - this.dragging.startX)
            this.pan.y = this.dragging.startPanY + (y - this.dragging.startY)
            this.render()
        } else if (this.dragging?.type === 'node') {
            const world = this.screenToWorld(x, y)
            this.dragging.node.x = Math.round((world.x - this.dragging.offsetX) / this.gridSize) * this.gridSize
            this.dragging.node.y = Math.round((world.y - this.dragging.offsetY) / this.gridSize) * this.gridSize
            this.render()
        } else if (this.connecting) {
            this.connecting.currentX = x
            this.connecting.currentY = y
            this.render()
        }
    }
    
    onMouseUp(e) {
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        if (this.connecting) {
            const endPort = this.getPortAt(x, y)
            if (endPort && this.connecting.startPort.canConnectTo(endPort)) {
                const fromPort = this.connecting.startPort.isOutput ? this.connecting.startPort : endPort
                const toPort = this.connecting.startPort.isInput ? this.connecting.startPort : endPort
                
                this.graph.connect(
                    fromPort.node,
                    fromPort.name,
                    toPort.node,
                    toPort.name
                )
            }
            this.connecting = null
            this.render()
        }
        
        this.dragging = null
    }
    
    onWheel(e) {
        e.preventDefault()
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const oldZoom = this.zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        this.zoom = Math.max(0.25, Math.min(2, this.zoom * delta))
        
        this.pan.x = x - (x - this.pan.x) * (this.zoom / oldZoom)
        this.pan.y = y - (y - this.pan.y) * (this.zoom / oldZoom)
        
        this.updateStatus()
        this.render()
    }
    
    onContextMenu(e) {
        e.preventDefault()
        const menu = this.container.querySelector('#nge-context-menu')
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const node = this.getNodeAt(x, y)
        
        let menuItems = ''
        if (node) {
            menuItems = `
                <div class="nge-menu-item" data-action="delete">Delete Node</div>
                <div class="nge-menu-item" data-action="duplicate">Duplicate</div>
                <div class="nge-menu-separator"></div>
                <div class="nge-menu-item" data-action="disconnect">Disconnect All</div>
            `
        } else {
            menuItems = this.graph.getNodeTypes().slice(0, 8).map(type => 
                `<div class="nge-menu-item" data-action="add" data-type="${type}">Add ${type}</div>`
            ).join('')
        }
        
        menu.innerHTML = menuItems
        menu.style.left = e.clientX + 'px'
        menu.style.top = e.clientY + 'px'
        menu.classList.add('visible')
        
        menu.querySelectorAll('.nge-menu-item').forEach(item => {
            item.addEventListener('click', (ev) => {
                ev.stopPropagation()
                const action = item.dataset.action
                
                if (action === 'delete' && node) {
                    this.graph.removeNode(node.id)
                    this.selectedNodes.delete(node.id)
                } else if (action === 'duplicate' && node) {
                    const newNode = this.graph.createNode(node.type, node.x + 20, node.y + 20)
                    if (newNode) {
                        node.inputs.forEach((port, name) => {
                            const newPort = newNode.getInput(name)
                            if (newPort) newPort.value = port.value
                        })
                    }
                } else if (action === 'disconnect' && node) {
                    this.graph.connections = this.graph.connections.filter(c => {
                        if (c.from.node === node || c.to.node === node) {
                            c.disconnect()
                            return false
                        }
                        return true
                    })
                } else if (action === 'add') {
                    const world = this.screenToWorld(x, y)
                    this.graph.createNode(item.dataset.type, world.x, world.y)
                }
                
                this.hideContextMenu()
                this.render()
            })
        })
    }
    
    hideContextMenu() {
        const menu = this.container.querySelector('#nge-context-menu')
        menu?.classList.remove('visible')
    }
    
    render() {
        const ctx = this.ctx
        const w = this.canvas.width / window.devicePixelRatio
        const h = this.canvas.height / window.devicePixelRatio
        
        ctx.fillStyle = '#0f0f1a'
        ctx.fillRect(0, 0, w, h)
        
        this.drawGrid()
        
        ctx.save()
        ctx.translate(this.pan.x, this.pan.y)
        ctx.scale(this.zoom, this.zoom)
        
        this.graph.connections.forEach(conn => this.drawConnection(conn))
        
        if (this.connecting) {
            const startWorld = this.screenToWorld(this.connecting.startX, this.connecting.startY)
            const endWorld = this.screenToWorld(this.connecting.currentX, this.connecting.currentY)
            
            ctx.beginPath()
            ctx.strokeStyle = '#6366f1'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.moveTo(startWorld.x, startWorld.y)
            ctx.lineTo(endWorld.x, endWorld.y)
            ctx.stroke()
            ctx.setLineDash([])
        }
        
        this.graph.nodes.forEach(node => this.drawNode(node))
        
        ctx.restore()
        
        this.updateStatus()
    }
    
    drawGrid() {
        const ctx = this.ctx
        const w = this.canvas.width / window.devicePixelRatio
        const h = this.canvas.height / window.devicePixelRatio
        
        const gridSize = this.gridSize * this.zoom
        const offsetX = this.pan.x % gridSize
        const offsetY = this.pan.y % gridSize
        
        ctx.strokeStyle = '#1a1a28'
        ctx.lineWidth = 1
        
        for (let x = offsetX; x < w; x += gridSize) {
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, h)
            ctx.stroke()
        }
        
        for (let y = offsetY; y < h; y += gridSize) {
            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(w, y)
            ctx.stroke()
        }
    }
    
    drawNode(node) {
        const ctx = this.ctx
        const x = node.x
        const y = node.y
        const w = node.width
        const headerHeight = 32
        const portHeight = 24
        const totalPorts = node.inputs.size + node.outputs.size
        const h = headerHeight + 8 + totalPorts * portHeight
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetY = 4
        
        ctx.fillStyle = '#1a1a28'
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, 8)
        ctx.fill()
        
        ctx.shadowColor = 'transparent'
        
        const color = this.nodeColors[node.type] || '#4a5568'
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x, y, w, headerHeight, [8, 8, 0, 0])
        ctx.fill()
        
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px Segoe UI'
        ctx.textAlign = 'left'
        ctx.fillText(node.name, x + 12, y + 20)
        
        if (node.selected) {
            ctx.strokeStyle = '#6366f1'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(x, y, w, h, 8)
            ctx.stroke()
        }
        
        let portY = y + headerHeight + 8
        
        node.inputs.forEach((port, name) => {
            ctx.fillStyle = port.isConnected ? '#10b981' : '#4a5568'
            ctx.beginPath()
            ctx.arc(x, portY + 12, 6, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.fillStyle = '#888'
            ctx.font = '11px Segoe UI'
            ctx.textAlign = 'left'
            ctx.fillText(name, x + 14, portY + 16)
            
            portY += portHeight
        })
        
        node.outputs.forEach((port, name) => {
            ctx.fillStyle = port.isConnected ? '#10b981' : '#4a5568'
            ctx.beginPath()
            ctx.arc(x + w, portY + 12, 6, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.fillStyle = '#888'
            ctx.font = '11px Segoe UI'
            ctx.textAlign = 'right'
            ctx.fillText(name, x + w - 14, portY + 16)
            
            portY += portHeight
        })
    }
    
    drawConnection(conn) {
        const ctx = this.ctx
        const fromNode = conn.from.node
        const toNode = conn.to.node
        
        let fromY = fromNode.y + 40
        fromNode.inputs.forEach(() => fromY += 24)
        let outputIndex = 0
        for (const [name] of fromNode.outputs) {
            if (name === conn.from.name) break
            outputIndex++
        }
        fromY += outputIndex * 24 + 12
        const fromX = fromNode.x + fromNode.width
        
        let toY = toNode.y + 40
        let inputIndex = 0
        for (const [name] of toNode.inputs) {
            if (name === conn.to.name) break
            inputIndex++
        }
        toY += inputIndex * 24 + 12
        const toX = toNode.x
        
        const controlOffset = Math.min(100, Math.abs(toX - fromX) * 0.5)
        
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)'
        ctx.lineWidth = 4
        ctx.moveTo(fromX, fromY)
        ctx.bezierCurveTo(fromX + controlOffset, fromY, toX - controlOffset, toY, toX, toY)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 2
        ctx.moveTo(fromX, fromY)
        ctx.bezierCurveTo(fromX + controlOffset, fromY, toX - controlOffset, toY, toX, toY)
        ctx.stroke()
        
        this.drawFlowingParticles(ctx, fromX, fromY, toX, toY, controlOffset)
    }
    
    drawFlowingParticles(ctx, fromX, fromY, toX, toY, controlOffset) {
        const numParticles = 5
        const speed = 0.0008
        
        for (let i = 0; i < numParticles; i++) {
            const baseT = (i / numParticles)
            const t = (baseT + this.animationTime * speed) % 1
            
            const point = this.getBezierPoint(t, fromX, fromY, fromX + controlOffset, fromY, toX - controlOffset, toY, toX, toY)
            
            const alpha = Math.sin(t * Math.PI)
            const size = 3 + alpha * 2
            
            ctx.beginPath()
            ctx.fillStyle = `rgba(99, 102, 241, ${0.4 + alpha * 0.6})`
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.beginPath()
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
            ctx.arc(point.x, point.y, size * 0.5, 0, Math.PI * 2)
            ctx.fill()
        }
    }
    
    getBezierPoint(t, x0, y0, x1, y1, x2, y2, x3, y3) {
        const mt = 1 - t
        const mt2 = mt * mt
        const mt3 = mt2 * mt
        const t2 = t * t
        const t3 = t2 * t
        
        return {
            x: mt3 * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t3 * x3,
            y: mt3 * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3 * y3
        }
    }
    
    updateStatus() {
        this.container.querySelector('#nge-status-nodes').textContent = `Nodes: ${this.graph.nodes.size}`
        this.container.querySelector('#nge-status-connections').textContent = `Connections: ${this.graph.connections.length}`
        this.container.querySelector('#nge-status-zoom').textContent = `Zoom: ${Math.round(this.zoom * 100)}%`
    }
    
    save() {
        const data = this.graph.serialize()
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'nodegraph.json'
        link.click()
        URL.revokeObjectURL(url)
    }
    
    load() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async (e) => {
            const file = e.target.files[0]
            if (file) {
                const text = await file.text()
                const data = JSON.parse(text)
                this.graph.deserialize(data)
                this.render()
            }
        }
        input.click()
    }
    
    exportCode() {
        const code = this.graph.toCode()
        
        const blob = new Blob([code], { type: 'text/javascript' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'scene.js'
        link.click()
        URL.revokeObjectURL(url)
        
        console.log('Exported code:\n', code)
    }
    
    open() {
        this.createPanel()
        this.container.classList.add('open')
        this.isOpen = true
        
        requestAnimationFrame(() => {
            this.resize()
            this.startAnimation()
        })
    }
    
    close() {
        if (this.container) {
            this.container.classList.remove('open')
        }
        this.isOpen = false
        this.stopAnimation()
    }
    
    startAnimation() {
        if (this.animationFrame) return
        
        const animate = (timestamp) => {
            if (!this.isOpen) return
            
            this.animationTime = timestamp
            
            if (this.graph.connections.length > 0) {
                this.render()
            }
            
            this.animationFrame = requestAnimationFrame(animate)
        }
        
        this.animationFrame = requestAnimationFrame(animate)
    }
    
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame)
            this.animationFrame = null
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.close()
        } else {
            this.open()
        }
    }
    
    dispose() {
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
    }
}

export const nodeGraphEditor = new NodeGraphEditor()
export default NodeGraphEditor
