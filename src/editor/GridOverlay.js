/*
    GRUDGE Editor - Grid Overlay
    Terrain-synced snap grid with visual guides
*/

import * as THREE from 'three'

export class GridOverlay {
    constructor(options = {}) {
        this.width = options.width || 100
        this.depth = options.depth || 100
        this.cellSize = options.cellSize || 2
        this.color = options.color || 0x4488ff
        this.opacity = options.opacity || 0.3
        this.visible = true
        
        this.group = new THREE.Group()
        this.group.name = 'GridOverlay'
        
        this.gridLines = null
        this.snapIndicator = null
        this.hoverCell = null
        
        this.create()
    }
    
    create() {
        this.createGridLines()
        this.createSnapIndicator()
        this.createHoverCell()
    }
    
    createGridLines() {
        if (this.gridLines) {
            this.group.remove(this.gridLines)
            this.gridLines.geometry.dispose()
            this.gridLines.material.dispose()
        }
        
        const cols = Math.floor(this.width / this.cellSize) + 1
        const rows = Math.floor(this.depth / this.cellSize) + 1
        
        const points = []
        
        for (let i = 0; i < cols; i++) {
            const x = (i * this.cellSize) - this.width / 2
            points.push(new THREE.Vector3(x, 0.05, -this.depth / 2))
            points.push(new THREE.Vector3(x, 0.05, this.depth / 2))
        }
        
        for (let j = 0; j < rows; j++) {
            const z = (j * this.cellSize) - this.depth / 2
            points.push(new THREE.Vector3(-this.width / 2, 0.05, z))
            points.push(new THREE.Vector3(this.width / 2, 0.05, z))
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: this.opacity,
            depthWrite: false
        })
        
        this.gridLines = new THREE.LineSegments(geometry, material)
        this.gridLines.renderOrder = 1
        this.group.add(this.gridLines)
    }
    
    createSnapIndicator() {
        const geometry = new THREE.BoxGeometry(this.cellSize, 0.1, this.cellSize)
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        })
        
        this.snapIndicator = new THREE.Mesh(geometry, material)
        this.snapIndicator.visible = false
        this.snapIndicator.renderOrder = 2
        this.group.add(this.snapIndicator)
    }
    
    createHoverCell() {
        const geometry = new THREE.PlaneGeometry(this.cellSize, this.cellSize)
        geometry.rotateX(-Math.PI / 2)
        
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
            depthWrite: false
        })
        
        this.hoverCell = new THREE.Mesh(geometry, material)
        this.hoverCell.position.y = 0.1
        this.hoverCell.visible = false
        this.hoverCell.renderOrder = 2
        this.group.add(this.hoverCell)
    }
    
    syncWithTerrain(terrain) {
        if (!terrain) return
        
        this.width = terrain.width || 100
        this.depth = terrain.depth || 100
        
        const segments = terrain.segments || 64
        this.cellSize = this.width / segments
        
        this.createGridLines()
        this.createSnapIndicator()
        this.createHoverCell()
        
        console.log(`[GridOverlay] Synced: ${this.width}x${this.depth}, cell: ${this.cellSize.toFixed(2)}`)
    }
    
    setDimensions(width, depth, cellSize) {
        this.width = width
        this.depth = depth
        this.cellSize = cellSize
        
        this.createGridLines()
        this.createSnapIndicator()
        this.createHoverCell()
    }
    
    snapToGrid(position) {
        const x = Math.round(position.x / this.cellSize) * this.cellSize
        const z = Math.round(position.z / this.cellSize) * this.cellSize
        
        return new THREE.Vector3(x, position.y, z)
    }
    
    getCell(position) {
        const col = Math.floor((position.x + this.width / 2) / this.cellSize)
        const row = Math.floor((position.z + this.depth / 2) / this.cellSize)
        
        return { col, row }
    }
    
    getCellCenter(col, row) {
        const x = (col * this.cellSize) - this.width / 2 + this.cellSize / 2
        const z = (row * this.cellSize) - this.depth / 2 + this.cellSize / 2
        
        return new THREE.Vector3(x, 0, z)
    }
    
    showSnapAt(position) {
        const snapped = this.snapToGrid(position)
        this.snapIndicator.position.copy(snapped)
        this.snapIndicator.visible = true
    }
    
    hideSnap() {
        this.snapIndicator.visible = false
    }
    
    showHoverAt(position) {
        const snapped = this.snapToGrid(position)
        this.hoverCell.position.set(snapped.x, 0.1, snapped.z)
        this.hoverCell.visible = true
    }
    
    hideHover() {
        this.hoverCell.visible = false
    }
    
    setVisible(visible) {
        this.visible = visible
        this.group.visible = visible
    }
    
    setOpacity(opacity) {
        this.opacity = opacity
        if (this.gridLines) {
            this.gridLines.material.opacity = opacity
        }
    }
    
    setColor(color) {
        this.color = color
        if (this.gridLines) {
            this.gridLines.material.color.setHex(color)
        }
    }
    
    setYPosition(y) {
        this.group.position.y = y
    }
    
    getGroup() {
        return this.group
    }
    
    getCellSize() {
        return this.cellSize
    }
    
    dispose() {
        if (this.gridLines) {
            this.gridLines.geometry.dispose()
            this.gridLines.material.dispose()
        }
        if (this.snapIndicator) {
            this.snapIndicator.geometry.dispose()
            this.snapIndicator.material.dispose()
        }
        if (this.hoverCell) {
            this.hoverCell.geometry.dispose()
            this.hoverCell.material.dispose()
        }
    }
}

export default GridOverlay
