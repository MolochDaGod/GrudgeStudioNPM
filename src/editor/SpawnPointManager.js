/*
    GRUDGE Engine - Spawn Point Manager
    Manage spawn locations with visual editors
*/

import * as THREE from 'three'

export class SpawnPointManager {
    constructor(scene, options = {}) {
        this.scene = scene
        this.spawnPoints = new Map()
        this.spawnMeshes = new Map()
        this.selectedSpawn = null
        
        this.options = {
            markerSize: 0.5,
            markerHeight: 0.1,
            colors: {
                red: 0xe94560,
                blue: 0x4a90d9,
                neutral: 0x888888,
                selected: 0xffff00
            },
            showDirectionArrow: true,
            ...options
        }
        
        this.group = new THREE.Group()
        this.group.name = 'SpawnPoints'
        this.scene.add(this.group)
    }
    
    addSpawnPoint(config) {
        const id = config.id || `spawn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        const spawn = {
            id,
            position: new THREE.Vector3(
                config.position?.x || 0,
                config.position?.y || 0,
                config.position?.z || 0
            ),
            rotation: config.rotation || 0,
            team: config.team || 'neutral',
            role: config.role || 'generic',
            enabled: config.enabled !== false
        }
        
        this.spawnPoints.set(id, spawn)
        this.createSpawnMarker(spawn)
        
        return spawn
    }
    
    createSpawnMarker(spawn) {
        const group = new THREE.Group()
        group.name = `SpawnMarker-${spawn.id}`
        group.userData.spawnId = spawn.id
        
        const color = this.options.colors[spawn.team] || this.options.colors.neutral
        
        const platformGeometry = new THREE.CylinderGeometry(
            this.options.markerSize,
            this.options.markerSize * 1.2,
            this.options.markerHeight,
            16
        )
        const platformMaterial = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.7,
            roughness: 0.3,
            emissive: color,
            emissiveIntensity: 0.3
        })
        const platform = new THREE.Mesh(platformGeometry, platformMaterial)
        platform.position.y = this.options.markerHeight / 2
        group.add(platform)
        
        const ringGeometry = new THREE.TorusGeometry(
            this.options.markerSize * 0.8,
            0.03,
            8,
            32
        )
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const ring = new THREE.Mesh(ringGeometry, ringMaterial)
        ring.rotation.x = -Math.PI / 2
        ring.position.y = this.options.markerHeight + 0.05
        group.add(ring)
        
        if (this.options.showDirectionArrow) {
            const arrowGeometry = new THREE.ConeGeometry(0.1, 0.3, 8)
            const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
            const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
            arrow.rotation.x = Math.PI / 2
            arrow.position.set(0, this.options.markerHeight + 0.1, this.options.markerSize * 0.6)
            group.add(arrow)
        }
        
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'rgba(0,0,0,0.7)'
        ctx.fillRect(0, 0, 128, 64)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(spawn.team.toUpperCase(), 64, 25)
        ctx.font = '14px Arial'
        ctx.fillText(spawn.role, 64, 48)
        
        const labelTexture = new THREE.CanvasTexture(canvas)
        const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture })
        const label = new THREE.Sprite(labelMaterial)
        label.scale.set(1, 0.5, 1)
        label.position.y = this.options.markerHeight + 0.8
        group.add(label)
        
        group.position.copy(spawn.position)
        group.rotation.y = spawn.rotation
        
        this.spawnMeshes.set(spawn.id, group)
        this.group.add(group)
        
        return group
    }
    
    removeSpawnPoint(id) {
        const mesh = this.spawnMeshes.get(id)
        if (mesh) {
            this.group.remove(mesh)
            mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    if (child.material.map) child.material.map.dispose()
                    child.material.dispose()
                }
            })
            this.spawnMeshes.delete(id)
        }
        this.spawnPoints.delete(id)
    }
    
    updateSpawnPoint(id, updates) {
        const spawn = this.spawnPoints.get(id)
        if (!spawn) return null
        
        if (updates.position) {
            spawn.position.set(updates.position.x, updates.position.y, updates.position.z)
        }
        if (updates.rotation !== undefined) {
            spawn.rotation = updates.rotation
        }
        if (updates.team) {
            spawn.team = updates.team
        }
        if (updates.role) {
            spawn.role = updates.role
        }
        
        const mesh = this.spawnMeshes.get(id)
        if (mesh) {
            mesh.position.copy(spawn.position)
            mesh.rotation.y = spawn.rotation
        }
        
        return spawn
    }
    
    selectSpawnPoint(id) {
        if (this.selectedSpawn) {
            const prevMesh = this.spawnMeshes.get(this.selectedSpawn)
            if (prevMesh) {
                const prev = this.spawnPoints.get(this.selectedSpawn)
                const color = this.options.colors[prev?.team] || this.options.colors.neutral
                prevMesh.children[0].material.emissive.setHex(color)
            }
        }
        
        this.selectedSpawn = id
        const mesh = this.spawnMeshes.get(id)
        if (mesh) {
            mesh.children[0].material.emissive.setHex(this.options.colors.selected)
        }
    }
    
    deselectAll() {
        if (this.selectedSpawn) {
            const mesh = this.spawnMeshes.get(this.selectedSpawn)
            if (mesh) {
                const spawn = this.spawnPoints.get(this.selectedSpawn)
                const color = this.options.colors[spawn?.team] || this.options.colors.neutral
                mesh.children[0].material.emissive.setHex(color)
            }
        }
        this.selectedSpawn = null
    }
    
    getSpawnPoint(id) {
        return this.spawnPoints.get(id)
    }
    
    getSpawnsByTeam(team) {
        return Array.from(this.spawnPoints.values()).filter(s => s.team === team)
    }
    
    getSpawnsByRole(role) {
        return Array.from(this.spawnPoints.values()).filter(s => s.role === role)
    }
    
    getAllSpawnPoints() {
        return Array.from(this.spawnPoints.values())
    }
    
    getRandomSpawn(team = null) {
        const spawns = team ? this.getSpawnsByTeam(team) : this.getAllSpawnPoints()
        if (spawns.length === 0) return null
        return spawns[Math.floor(Math.random() * spawns.length)]
    }
    
    getMeshAtPoint(point, camera) {
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(point, camera)
        
        const intersects = raycaster.intersectObjects(this.group.children, true)
        if (intersects.length > 0) {
            let obj = intersects[0].object
            while (obj.parent && !obj.userData.spawnId) {
                obj = obj.parent
            }
            return obj.userData.spawnId || null
        }
        return null
    }
    
    exportSpawns() {
        return Array.from(this.spawnPoints.values()).map(spawn => ({
            id: spawn.id,
            position: { x: spawn.position.x, y: spawn.position.y, z: spawn.position.z },
            rotation: spawn.rotation,
            team: spawn.team,
            role: spawn.role,
            enabled: spawn.enabled
        }))
    }
    
    importSpawns(data) {
        this.clear()
        data.forEach(spawn => this.addSpawnPoint(spawn))
    }
    
    clear() {
        for (const id of this.spawnPoints.keys()) {
            this.removeSpawnPoint(id)
        }
    }
    
    setVisible(visible) {
        this.group.visible = visible
    }
    
    dispose() {
        this.clear()
        this.scene.remove(this.group)
    }
}

export default SpawnPointManager
