/*
    GRUDGE Editor - Terrain Sculpt Tool
    Brush-based terrain height modification
*/

import * as THREE from 'three'

export class TerrainSculptTool {
    constructor(options = {}) {
        this.terrain = null
        this.physicsWorld = null
        
        this.mode = 'raise'
        this.brushRadius = options.brushRadius || 5
        this.brushStrength = options.brushStrength || 0.5
        this.brushFalloff = options.brushFalloff || 'smooth'
        
        this.isActive = false
        this.isPainting = false
        
        this.cursorMesh = null
        this.cursorRing = null
        
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        
        this.lastPaintTime = 0
        this.paintInterval = 16
        
        this.onTerrainModified = null
        
        this.createCursor()
    }
    
    createCursor() {
        const cursorGroup = new THREE.Group()
        cursorGroup.name = 'SculptCursor'
        
        const ringGeom = new THREE.RingGeometry(
            this.brushRadius - 0.1,
            this.brushRadius,
            32
        )
        ringGeom.rotateX(-Math.PI / 2)
        
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
            depthWrite: false
        })
        
        this.cursorRing = new THREE.Mesh(ringGeom, ringMat)
        cursorGroup.add(this.cursorRing)
        
        const discGeom = new THREE.CircleGeometry(this.brushRadius, 32)
        discGeom.rotateX(-Math.PI / 2)
        
        const discMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            depthWrite: false
        })
        
        this.cursorMesh = new THREE.Mesh(discGeom, discMat)
        cursorGroup.add(this.cursorMesh)
        
        this.cursor = cursorGroup
        this.cursor.visible = false
    }
    
    setTerrain(terrain, physicsWorld) {
        this.terrain = terrain
        this.physicsWorld = physicsWorld
    }
    
    setMode(mode) {
        this.mode = mode
        
        const colors = {
            raise: 0x00ff88,
            lower: 0xff4444,
            level: 0x4488ff,
            smooth: 0xffaa00
        }
        
        const color = colors[mode] || 0x00ff88
        this.cursorRing.material.color.setHex(color)
        this.cursorMesh.material.color.setHex(color)
    }
    
    setBrushRadius(radius) {
        this.brushRadius = Math.max(1, Math.min(50, radius))
        this.updateCursorSize()
    }
    
    setBrushStrength(strength) {
        this.brushStrength = Math.max(0.01, Math.min(2, strength))
    }
    
    setBrushFalloff(falloff) {
        this.brushFalloff = falloff
    }
    
    updateCursorSize() {
        if (this.cursorRing) {
            this.cursorRing.geometry.dispose()
            this.cursorRing.geometry = new THREE.RingGeometry(
                this.brushRadius - 0.1,
                this.brushRadius,
                32
            )
            this.cursorRing.geometry.rotateX(-Math.PI / 2)
        }
        
        if (this.cursorMesh) {
            this.cursorMesh.geometry.dispose()
            this.cursorMesh.geometry = new THREE.CircleGeometry(this.brushRadius, 32)
            this.cursorMesh.geometry.rotateX(-Math.PI / 2)
        }
    }
    
    activate() {
        this.isActive = true
        this.cursor.visible = true
    }
    
    deactivate() {
        this.isActive = false
        this.isPainting = false
        this.cursor.visible = false
    }
    
    onMouseMove(event, camera, canvas) {
        if (!this.isActive) return
        
        const rect = canvas.getBoundingClientRect()
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        
        this.raycaster.setFromCamera(this.mouse, camera)
        
        const intersects = this.raycaster.intersectObject(this.terrain.mesh, true)
        
        if (intersects.length > 0) {
            const point = intersects[0].point
            this.cursor.position.copy(point)
            this.cursor.position.y += 0.1
            this.cursor.visible = true
            
            if (this.isPainting) {
                this.paint(point)
            }
        } else {
            this.cursor.visible = false
        }
    }
    
    onMouseDown(event) {
        if (!this.isActive) return
        if (event.button !== 0) return
        
        this.isPainting = true
        
        if (this.cursor.visible) {
            this.paint(this.cursor.position)
        }
    }
    
    onMouseUp(event) {
        if (event.button !== 0) return
        
        this.isPainting = false
        
        if (this.physicsWorld && this.terrain) {
            this.rebuildPhysics()
        }
    }
    
    paint(position) {
        const now = performance.now()
        if (now - this.lastPaintTime < this.paintInterval) return
        this.lastPaintTime = now
        
        if (!this.terrain || !this.terrain.mesh) return
        
        const geometry = this.terrain.mesh.geometry
        const positions = geometry.attributes.position
        const segments = this.terrain.segments
        const cols = segments + 1
        
        const worldPos = position.clone()
        
        let modified = false
        
        for (let i = 0; i < positions.count; i++) {
            const vx = positions.getX(i)
            const vz = positions.getZ(i)
            
            const dx = vx - worldPos.x
            const dz = vz - worldPos.z
            const dist = Math.sqrt(dx * dx + dz * dz)
            
            if (dist < this.brushRadius) {
                const falloff = this.calculateFalloff(dist)
                const delta = this.brushStrength * falloff * 0.1
                
                let currentY = positions.getY(i)
                
                switch (this.mode) {
                    case 'raise':
                        currentY += delta
                        break
                    case 'lower':
                        currentY -= delta
                        break
                    case 'level':
                        const targetY = worldPos.y
                        currentY += (targetY - currentY) * falloff * 0.1
                        break
                    case 'smooth':
                        const avgHeight = this.getAverageHeight(i, positions, cols)
                        currentY += (avgHeight - currentY) * falloff * 0.2
                        break
                }
                
                currentY = Math.max(
                    this.terrain.minHeight,
                    Math.min(this.terrain.maxHeight, currentY)
                )
                
                positions.setY(i, currentY)
                this.terrain.heightData[i] = currentY
                modified = true
            }
        }
        
        if (modified) {
            positions.needsUpdate = true
            geometry.computeVertexNormals()
            
            if (this.onTerrainModified) {
                this.onTerrainModified()
            }
        }
    }
    
    calculateFalloff(distance) {
        const t = 1 - (distance / this.brushRadius)
        
        switch (this.brushFalloff) {
            case 'hard':
                return 1
            case 'linear':
                return t
            case 'smooth':
                return t * t * (3 - 2 * t)
            case 'gaussian':
                return Math.exp(-((distance / (this.brushRadius * 0.5)) ** 2))
            default:
                return t * t * (3 - 2 * t)
        }
    }
    
    getAverageHeight(index, positions, cols) {
        let sum = 0
        let count = 0
        
        const row = Math.floor(index / cols)
        const col = index % cols
        
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr
                const nc = col + dc
                
                if (nr >= 0 && nr < cols && nc >= 0 && nc < cols) {
                    const ni = nr * cols + nc
                    sum += positions.getY(ni)
                    count++
                }
            }
        }
        
        return sum / count
    }
    
    async rebuildPhysics() {
        if (!this.physicsWorld || !this.terrain) return
        
        if (this.terrain.collider) {
            this.physicsWorld.removeCollider(this.terrain.collider, true)
        }
        
        await this.terrain.initPhysics(this.physicsWorld)
        console.log('[TerrainSculptTool] Physics collider rebuilt')
    }
    
    getCursor() {
        return this.cursor
    }
    
    getSettings() {
        return {
            mode: this.mode,
            brushRadius: this.brushRadius,
            brushStrength: this.brushStrength,
            brushFalloff: this.brushFalloff
        }
    }
    
    dispose() {
        if (this.cursorRing) {
            this.cursorRing.geometry.dispose()
            this.cursorRing.material.dispose()
        }
        if (this.cursorMesh) {
            this.cursorMesh.geometry.dispose()
            this.cursorMesh.material.dispose()
        }
    }
}

export default TerrainSculptTool
