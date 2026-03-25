/*
    GRUDGE Engine - AI Pathfinding System
    Grid-based A* pathfinding with dynamic obstacles
*/

import * as THREE from 'three'

class PathNode {
    constructor(x, z, walkable = true) {
        this.x = x
        this.z = z
        this.walkable = walkable
        this.g = 0
        this.h = 0
        this.f = 0
        this.parent = null
        this.weight = 1
    }
}

export class PathGrid {
    constructor(width, depth, cellSize = 1) {
        this.width = width
        this.depth = depth
        this.cellSize = cellSize
        
        this.cols = Math.ceil(width / cellSize)
        this.rows = Math.ceil(depth / cellSize)
        this.offsetX = -width / 2
        this.offsetZ = -depth / 2
        
        this.nodes = []
        this.initGrid()
    }
    
    initGrid() {
        this.nodes = []
        for (let z = 0; z < this.rows; z++) {
            const row = []
            for (let x = 0; x < this.cols; x++) {
                row.push(new PathNode(x, z, true))
            }
            this.nodes.push(row)
        }
    }
    
    worldToGrid(worldX, worldZ) {
        const x = Math.floor((worldX - this.offsetX) / this.cellSize)
        const z = Math.floor((worldZ - this.offsetZ) / this.cellSize)
        return { x: Math.max(0, Math.min(this.cols - 1, x)), z: Math.max(0, Math.min(this.rows - 1, z)) }
    }
    
    gridToWorld(gridX, gridZ) {
        return {
            x: this.offsetX + gridX * this.cellSize + this.cellSize / 2,
            z: this.offsetZ + gridZ * this.cellSize + this.cellSize / 2
        }
    }
    
    getNode(x, z) {
        if (x >= 0 && x < this.cols && z >= 0 && z < this.rows) {
            return this.nodes[z][x]
        }
        return null
    }
    
    setWalkable(worldX, worldZ, walkable) {
        const { x, z } = this.worldToGrid(worldX, worldZ)
        const node = this.getNode(x, z)
        if (node) node.walkable = walkable
    }
    
    setWalkableRadius(worldX, worldZ, radius, walkable) {
        const gridRadius = Math.ceil(radius / this.cellSize)
        const center = this.worldToGrid(worldX, worldZ)
        
        for (let dz = -gridRadius; dz <= gridRadius; dz++) {
            for (let dx = -gridRadius; dx <= gridRadius; dx++) {
                if (dx * dx + dz * dz <= gridRadius * gridRadius) {
                    const node = this.getNode(center.x + dx, center.z + dz)
                    if (node) node.walkable = walkable
                }
            }
        }
    }
    
    setWalkableBox(minX, minZ, maxX, maxZ, walkable) {
        const min = this.worldToGrid(minX, minZ)
        const max = this.worldToGrid(maxX, maxZ)
        
        for (let z = min.z; z <= max.z; z++) {
            for (let x = min.x; x <= max.x; x++) {
                const node = this.getNode(x, z)
                if (node) node.walkable = walkable
            }
        }
    }
    
    addObstacleFromMesh(mesh) {
        const box = new THREE.Box3().setFromObject(mesh)
        this.setWalkableBox(box.min.x, box.min.z, box.max.x, box.max.z, false)
    }
    
    getNeighbors(node, allowDiagonal = true) {
        const neighbors = []
        const dirs = allowDiagonal
            ? [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
            : [[-1,0],[1,0],[0,-1],[0,1]]
        
        for (const [dx, dz] of dirs) {
            const neighbor = this.getNode(node.x + dx, node.z + dz)
            if (neighbor && neighbor.walkable) {
                neighbors.push(neighbor)
            }
        }
        return neighbors
    }
    
    clear() {
        for (const row of this.nodes) {
            for (const node of row) {
                node.g = 0
                node.h = 0
                node.f = 0
                node.parent = null
            }
        }
    }
}

export class Pathfinder {
    constructor(grid) {
        this.grid = grid
    }
    
    heuristic(a, b) {
        const dx = Math.abs(a.x - b.x)
        const dz = Math.abs(a.z - b.z)
        return Math.sqrt(dx * dx + dz * dz)
    }
    
    findPath(startWorld, endWorld, allowDiagonal = true) {
        this.grid.clear()
        
        const start = this.grid.worldToGrid(startWorld.x, startWorld.z)
        const end = this.grid.worldToGrid(endWorld.x, endWorld.z)
        
        const startNode = this.grid.getNode(start.x, start.z)
        const endNode = this.grid.getNode(end.x, end.z)
        
        if (!startNode || !endNode) return null
        if (!startNode.walkable || !endNode.walkable) return null
        
        const openSet = [startNode]
        const closedSet = new Set()
        
        startNode.g = 0
        startNode.h = this.heuristic(startNode, endNode)
        startNode.f = startNode.h
        
        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f)
            const current = openSet.shift()
            
            if (current === endNode) {
                return this.reconstructPath(current)
            }
            
            closedSet.add(current)
            
            for (const neighbor of this.grid.getNeighbors(current, allowDiagonal)) {
                if (closedSet.has(neighbor)) continue
                
                const isDiagonal = neighbor.x !== current.x && neighbor.z !== current.z
                const moveCost = isDiagonal ? 1.414 : 1
                const tentativeG = current.g + moveCost * neighbor.weight
                
                const inOpen = openSet.includes(neighbor)
                
                if (!inOpen || tentativeG < neighbor.g) {
                    neighbor.parent = current
                    neighbor.g = tentativeG
                    neighbor.h = this.heuristic(neighbor, endNode)
                    neighbor.f = neighbor.g + neighbor.h
                    
                    if (!inOpen) {
                        openSet.push(neighbor)
                    }
                }
            }
        }
        
        return null
    }
    
    reconstructPath(endNode) {
        const path = []
        let current = endNode
        
        while (current) {
            const worldPos = this.grid.gridToWorld(current.x, current.z)
            path.unshift(new THREE.Vector3(worldPos.x, 0, worldPos.z))
            current = current.parent
        }
        
        return path
    }
    
    smoothPath(path, iterations = 2) {
        if (!path || path.length < 3) return path
        
        let smoothed = [...path]
        
        for (let i = 0; i < iterations; i++) {
            const newPath = [smoothed[0]]
            
            for (let j = 1; j < smoothed.length - 1; j++) {
                const prev = smoothed[j - 1]
                const curr = smoothed[j]
                const next = smoothed[j + 1]
                
                newPath.push(new THREE.Vector3(
                    (prev.x + curr.x * 2 + next.x) / 4,
                    curr.y,
                    (prev.z + curr.z * 2 + next.z) / 4
                ))
            }
            
            newPath.push(smoothed[smoothed.length - 1])
            smoothed = newPath
        }
        
        return smoothed
    }
}

export class AIAgent {
    constructor(mesh, pathfinder, options = {}) {
        this.mesh = mesh
        this.pathfinder = pathfinder
        
        this.speed = options.speed || 3
        this.turnSpeed = options.turnSpeed || 5
        this.arrivalThreshold = options.arrivalThreshold || 0.5
        this.repathInterval = options.repathInterval || 1
        
        this.currentPath = null
        this.currentWaypoint = 0
        this.target = null
        this.goalPosition = null
        this.isMoving = false
        
        this.lastRepathTime = 0
        this.state = 'idle'
        
        this.callbacks = {
            onArrival: options.onArrival || null,
            onPathFound: options.onPathFound || null,
            onPathFailed: options.onPathFailed || null
        }
    }
    
    setGoal(position) {
        this.goalPosition = position.clone()
        this.findPath()
    }
    
    setTarget(object) {
        this.target = object
    }
    
    clearTarget() {
        this.target = null
        this.goalPosition = null
        this.currentPath = null
        this.isMoving = false
        this.state = 'idle'
    }
    
    findPath() {
        if (!this.goalPosition) return false
        
        const startPos = this.mesh.position
        const path = this.pathfinder.findPath(startPos, this.goalPosition)
        
        if (path && path.length > 0) {
            this.currentPath = this.pathfinder.smoothPath(path)
            this.currentWaypoint = 0
            this.isMoving = true
            this.state = 'moving'
            
            if (this.callbacks.onPathFound) {
                this.callbacks.onPathFound(this.currentPath)
            }
            return true
        }
        
        if (this.callbacks.onPathFailed) {
            this.callbacks.onPathFailed()
        }
        return false
    }
    
    update(deltaTime) {
        if (this.target) {
            const targetPos = new THREE.Vector3()
            this.target.getWorldPosition(targetPos)
            
            const now = performance.now() / 1000
            if (now - this.lastRepathTime > this.repathInterval) {
                this.goalPosition = targetPos
                this.findPath()
                this.lastRepathTime = now
            }
        }
        
        if (!this.isMoving || !this.currentPath) return
        
        if (this.currentWaypoint >= this.currentPath.length) {
            this.isMoving = false
            this.state = 'arrived'
            if (this.callbacks.onArrival) {
                this.callbacks.onArrival()
            }
            return
        }
        
        const waypoint = this.currentPath[this.currentWaypoint]
        const position = this.mesh.position
        
        const direction = new THREE.Vector3()
            .subVectors(waypoint, position)
        direction.y = 0
        
        const distance = direction.length()
        
        if (distance < this.arrivalThreshold) {
            this.currentWaypoint++
            return
        }
        
        direction.normalize()
        
        const targetAngle = Math.atan2(direction.x, direction.z)
        const currentAngle = this.mesh.rotation.y
        
        let angleDiff = targetAngle - currentAngle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        
        this.mesh.rotation.y += angleDiff * this.turnSpeed * deltaTime
        
        const moveDistance = this.speed * deltaTime
        position.add(direction.multiplyScalar(Math.min(moveDistance, distance)))
    }
    
    getState() {
        return this.state
    }
    
    getPath() {
        return this.currentPath
    }
    
    isAtGoal() {
        if (!this.goalPosition) return true
        return this.mesh.position.distanceTo(this.goalPosition) < this.arrivalThreshold
    }
}

export class PathVisualizer {
    constructor(scene) {
        this.scene = scene
        this.pathLine = null
        this.waypointMarkers = []
        this.gridHelper = null
    }
    
    showPath(path, color = 0x00ff00) {
        this.clearPath()
        
        if (!path || path.length < 2) return
        
        const points = path.map(p => new THREE.Vector3(p.x, 0.1, p.z))
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2 })
        
        this.pathLine = new THREE.Line(geometry, material)
        this.scene.add(this.pathLine)
        
        const markerGeometry = new THREE.SphereGeometry(0.2, 8, 8)
        const markerMaterial = new THREE.MeshBasicMaterial({ color })
        
        path.forEach((point, index) => {
            const marker = new THREE.Mesh(markerGeometry, markerMaterial)
            marker.position.set(point.x, 0.2, point.z)
            this.scene.add(marker)
            this.waypointMarkers.push(marker)
        })
    }
    
    clearPath() {
        if (this.pathLine) {
            this.scene.remove(this.pathLine)
            this.pathLine.geometry.dispose()
            this.pathLine.material.dispose()
            this.pathLine = null
        }
        
        this.waypointMarkers.forEach(marker => {
            this.scene.remove(marker)
            marker.geometry.dispose()
            marker.material.dispose()
        })
        this.waypointMarkers = []
    }
    
    showGrid(grid, showUnwalkable = true) {
        this.clearGrid()
        
        const group = new THREE.Group()
        
        for (let z = 0; z < grid.rows; z++) {
            for (let x = 0; x < grid.cols; x++) {
                const node = grid.getNode(x, z)
                if (!node) continue
                
                if (!node.walkable && showUnwalkable) {
                    const worldPos = grid.gridToWorld(x, z)
                    const geometry = new THREE.PlaneGeometry(grid.cellSize * 0.9, grid.cellSize * 0.9)
                    const material = new THREE.MeshBasicMaterial({ 
                        color: 0xff0000, 
                        transparent: true, 
                        opacity: 0.3,
                        side: THREE.DoubleSide
                    })
                    const plane = new THREE.Mesh(geometry, material)
                    plane.rotation.x = -Math.PI / 2
                    plane.position.set(worldPos.x, 0.05, worldPos.z)
                    group.add(plane)
                }
            }
        }
        
        this.gridHelper = group
        this.scene.add(group)
    }
    
    clearGrid() {
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper)
            this.gridHelper.traverse(child => {
                if (child.geometry) child.geometry.dispose()
                if (child.material) child.material.dispose()
            })
            this.gridHelper = null
        }
    }
    
    dispose() {
        this.clearPath()
        this.clearGrid()
    }
}

export default { PathGrid, Pathfinder, AIAgent, PathVisualizer }
