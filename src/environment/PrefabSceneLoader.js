/*
    GRUDGE Studio - Prefab Scene Loader
    Loads complete scenes/terrains from Object Storage
*/

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getAssetPath } from '../core/paths.js'

export class PrefabSceneLoader {
    constructor(scene) {
        this.scene = scene
        this.loader = new GLTFLoader()
        this.loadedPrefabs = new Map()
        this.currentPrefab = null
        
        this.availableScenes = [
            {
                id: 'arena-main',
                name: 'Arena',
                path: 'models/arena.glb',
                thumbnail: '🏟️',
                description: 'Main fighting arena with walls and props',
                category: 'arenas'
            },
            {
                id: 'terrain-flat',
                name: 'Flat Terrain',
                path: null,
                thumbnail: '🌍',
                description: 'Empty flat terrain for building',
                category: 'terrains',
                procedural: 'flatTerrain'
            },
            {
                id: 'terrain-hills',
                name: 'Rolling Hills',
                path: null,
                thumbnail: '⛰️',
                description: 'Terrain with gentle hills',
                category: 'terrains',
                procedural: 'hillsTerrain'
            },
            {
                id: 'terrain-mountains',
                name: 'Mountain Range',
                path: null,
                thumbnail: '🏔️',
                description: 'Dramatic mountain landscape',
                category: 'terrains',
                procedural: 'mountainTerrain'
            },
            {
                id: 'forest-clearing',
                name: 'Forest Clearing',
                path: null,
                thumbnail: '🌲',
                description: 'Open area surrounded by trees',
                category: 'environments',
                procedural: 'forestClearing'
            }
        ]
        
        this.listeners = []
    }
    
    getAvailableScenes() {
        return this.availableScenes
    }
    
    getScenesByCategory(category) {
        return this.availableScenes.filter(s => s.category === category)
    }
    
    async loadScene(sceneId, clearExisting = true) {
        const sceneInfo = this.availableScenes.find(s => s.id === sceneId)
        if (!sceneInfo) {
            console.error(`[PrefabSceneLoader] Scene not found: ${sceneId}`)
            return null
        }
        
        this.notifyListeners('loadStart', sceneInfo)
        
        if (clearExisting) {
            this.clearCurrentScene()
        }
        
        let prefabGroup = null
        
        try {
            if (sceneInfo.procedural) {
                prefabGroup = this.generateProceduralScene(sceneInfo.procedural)
            } else if (sceneInfo.path) {
                prefabGroup = await this.loadGLTFScene(sceneInfo.path)
            }
            
            if (prefabGroup) {
                prefabGroup.userData.sceneId = sceneId
                prefabGroup.userData.sceneName = sceneInfo.name
                prefabGroup.name = `Prefab_${sceneInfo.name}`
                
                this.scene.add(prefabGroup)
                this.currentPrefab = prefabGroup
                this.loadedPrefabs.set(sceneId, prefabGroup)
                
                this.notifyListeners('loadComplete', { sceneInfo, prefab: prefabGroup })
            }
        } catch (error) {
            console.error(`[PrefabSceneLoader] Failed to load scene:`, error)
            this.notifyListeners('loadError', { sceneInfo, error })
        }
        
        return prefabGroup
    }
    
    async loadGLTFScene(path) {
        const fullPath = getAssetPath('/' + path)
        console.log(`[PrefabSceneLoader] Loading: ${fullPath}`)
        
        return new Promise((resolve, reject) => {
            this.loader.load(
                fullPath,
                (gltf) => {
                    gltf.scene.traverse(child => {
                        if (child.isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true
                        }
                    })
                    console.log(`[PrefabSceneLoader] Loaded: ${path}`)
                    resolve(gltf.scene)
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total) * 100
                    this.notifyListeners('loadProgress', percent)
                },
                reject
            )
        })
    }
    
    generateProceduralScene(type) {
        const group = new THREE.Group()
        
        switch (type) {
            case 'flatTerrain':
                group.add(this.createFlatTerrain())
                break
            case 'hillsTerrain':
                group.add(this.createHillsTerrain())
                break
            case 'mountainTerrain':
                group.add(this.createMountainTerrain())
                break
            case 'forestClearing':
                group.add(this.createForestClearing())
                break
            default:
                group.add(this.createFlatTerrain())
        }
        
        return group
    }
    
    createFlatTerrain() {
        const size = 100
        const geometry = new THREE.PlaneGeometry(size, size, 32, 32)
        const material = new THREE.MeshStandardMaterial({
            color: 0x3d5c3d,
            roughness: 0.9,
            metalness: 0.1
        })
        
        const terrain = new THREE.Mesh(geometry, material)
        terrain.rotation.x = -Math.PI / 2
        terrain.receiveShadow = true
        terrain.name = 'Terrain_Flat'
        
        return terrain
    }
    
    createHillsTerrain() {
        const size = 100
        const segments = 64
        const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
        
        const positions = geometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i]
            const y = positions[i + 1]
            const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 3 +
                          Math.sin(x * 0.05 + 1) * Math.cos(y * 0.07) * 5
            positions[i + 2] = height
        }
        geometry.computeVertexNormals()
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x4a7a4a,
            roughness: 0.85,
            metalness: 0.05
        })
        
        const terrain = new THREE.Mesh(geometry, material)
        terrain.rotation.x = -Math.PI / 2
        terrain.receiveShadow = true
        terrain.name = 'Terrain_Hills'
        
        return terrain
    }
    
    createMountainTerrain() {
        const size = 100
        const segments = 128
        const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
        
        const positions = geometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i]
            const y = positions[i + 1]
            const dist = Math.sqrt(x * x + y * y)
            const height = Math.max(0, 15 - dist * 0.3) +
                          Math.sin(x * 0.2) * Math.cos(y * 0.2) * 2 +
                          (Math.random() - 0.5) * 0.5
            positions[i + 2] = height
        }
        geometry.computeVertexNormals()
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x6b5b4a,
            roughness: 0.9,
            metalness: 0.1
        })
        
        const terrain = new THREE.Mesh(geometry, material)
        terrain.rotation.x = -Math.PI / 2
        terrain.receiveShadow = true
        terrain.name = 'Terrain_Mountains'
        
        return terrain
    }
    
    createForestClearing() {
        const group = new THREE.Group()
        
        group.add(this.createFlatTerrain())
        
        const treeCount = 30
        const clearingRadius = 15
        const forestRadius = 40
        
        for (let i = 0; i < treeCount; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = clearingRadius + Math.random() * (forestRadius - clearingRadius)
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            const tree = this.createSimpleTree()
            tree.position.set(x, 0, z)
            tree.scale.setScalar(0.8 + Math.random() * 0.4)
            group.add(tree)
        }
        
        group.name = 'Forest_Clearing'
        return group
    }
    
    createSimpleTree() {
        const group = new THREE.Group()
        
        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.3, 2, 8)
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 })
        const trunk = new THREE.Mesh(trunkGeom, trunkMat)
        trunk.position.y = 1
        trunk.castShadow = true
        group.add(trunk)
        
        const foliageGeom = new THREE.ConeGeometry(1.5, 3, 8)
        const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d5a2d, roughness: 0.8 })
        const foliage = new THREE.Mesh(foliageGeom, foliageMat)
        foliage.position.y = 3.5
        foliage.castShadow = true
        group.add(foliage)
        
        group.name = 'Tree'
        return group
    }
    
    clearCurrentScene() {
        if (this.currentPrefab) {
            this.scene.remove(this.currentPrefab)
            this.currentPrefab.traverse(child => {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose())
                    } else {
                        child.material.dispose()
                    }
                }
            })
            this.currentPrefab = null
        }
    }
    
    addListener(callback) {
        this.listeners.push(callback)
    }
    
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback)
    }
    
    notifyListeners(event, data) {
        this.listeners.forEach(l => l(event, data))
    }
}

export default PrefabSceneLoader
