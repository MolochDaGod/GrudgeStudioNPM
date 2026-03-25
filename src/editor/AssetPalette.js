/*
    GRUDGE Editor - Asset Palette
    Browsable library of placeable assets (trees, bushes, models)
*/

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { getAssetPath } from '../core/paths.js'

export class AssetPalette {
    constructor(container) {
        this.container = container
        this.loader = new GLTFLoader()
        
        this.categories = new Map()
        this.assets = new Map()
        this.loadedModels = new Map()
        
        this.selectedAsset = null
        this.onAssetSelected = null
        
        this.initializeDefaultAssets()
        this.createUI()
    }
    
    initializeDefaultAssets() {
        this.addCategory('vegetation', 'Vegetation', '🌲')
        this.addCategory('rocks', 'Rocks', '🪨')
        this.addCategory('structures', 'Structures', '🏠')
        this.addCategory('props', 'Props', '📦')
        this.addCategory('characters', 'Characters', '🧑')
        this.addCategory('custom', 'Custom Models', '✨')
        
        this.addAsset('vegetation', {
            id: 'tree-pine',
            name: 'Pine Tree',
            type: 'procedural',
            generator: 'createPineTree',
            icon: '🌲',
            scale: 1
        })
        
        this.addAsset('vegetation', {
            id: 'tree-oak',
            name: 'Oak Tree',
            type: 'procedural',
            generator: 'createOakTree',
            icon: '🌳',
            scale: 1
        })
        
        this.addAsset('vegetation', {
            id: 'bush-small',
            name: 'Small Bush',
            type: 'procedural',
            generator: 'createBush',
            icon: '🌿',
            scale: 0.5
        })
        
        this.addAsset('vegetation', {
            id: 'bush-large',
            name: 'Large Bush',
            type: 'procedural',
            generator: 'createBush',
            icon: '🌿',
            scale: 1
        })
        
        this.addAsset('vegetation', {
            id: 'grass-patch',
            name: 'Grass Patch',
            type: 'procedural',
            generator: 'createGrass',
            icon: '🌱',
            scale: 1
        })
        
        this.addAsset('rocks', {
            id: 'rock-small',
            name: 'Small Rock',
            type: 'procedural',
            generator: 'createRock',
            icon: '🪨',
            scale: 0.5
        })
        
        this.addAsset('rocks', {
            id: 'rock-large',
            name: 'Large Rock',
            type: 'procedural',
            generator: 'createRock',
            icon: '🪨',
            scale: 2
        })
        
        this.addAsset('structures', {
            id: 'crate',
            name: 'Wooden Crate',
            type: 'procedural',
            generator: 'createCrate',
            icon: '📦',
            scale: 1
        })
        
        this.addAsset('structures', {
            id: 'barrel',
            name: 'Barrel',
            type: 'procedural',
            generator: 'createBarrel',
            icon: '🛢️',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'viking',
            name: 'Viking Warrior',
            type: 'gltf',
            path: 'models/characters/viking/scene.gltf',
            icon: '🪓',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'orc',
            name: 'Orc Warrior',
            type: 'gltf',
            path: 'models/characters/orc/scene.gltf',
            icon: '👹',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'wolf',
            name: 'Shadow Wolf',
            type: 'gltf',
            path: 'models/characters/wolf/scene.gltf',
            icon: '🐺',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'shepherd',
            name: 'Shepherd',
            type: 'gltf',
            path: 'models/characters/shepherd/scene.gltf',
            icon: '🧙',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'gladiator',
            name: 'Gladiator',
            type: 'glb',
            path: 'models/gladiator.glb',
            icon: '⚔️',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'dragon',
            name: 'Dragon',
            type: 'glb',
            path: 'models/dragon.glb',
            icon: '🐉',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'swimmer',
            name: 'Swimmer',
            type: 'glb',
            path: 'models/characters/swimmer.glb',
            icon: '🏊',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'toon',
            name: 'Toon Character',
            type: 'glb',
            path: 'models/characters/toon_character.glb',
            icon: '🎭',
            scale: 1
        })
        
        this.addAsset('characters', {
            id: 'base-character',
            name: 'Base Character',
            type: 'glb',
            path: 'models/characters/base_character.glb',
            icon: '🧑',
            scale: 1
        })
        
        this.addCategory('vehicles', 'Vehicles', '🚗')
        
        this.addAsset('vehicles', {
            id: 'sedan',
            name: 'Sedan',
            type: 'glb',
            path: 'models/vehicles/Car.glb',
            icon: '🚗',
            scale: 1
        })
        
        this.addAsset('vehicles', {
            id: 'sports-car',
            name: 'Sports Car',
            type: 'glb',
            path: 'models/vehicles/SportsCar.glb',
            icon: '🏎️',
            scale: 1
        })
        
        this.addAsset('vehicles', {
            id: 'sports-car-2',
            name: 'Sports Car 2',
            type: 'glb',
            path: 'models/vehicles/SportsCar2.glb',
            icon: '🏎️',
            scale: 1
        })
        
        this.addAsset('vehicles', {
            id: 'suv',
            name: 'SUV',
            type: 'glb',
            path: 'models/vehicles/SUV.glb',
            icon: '🚙',
            scale: 1
        })
        
        this.addAsset('vehicles', {
            id: 'taxi',
            name: 'Taxi',
            type: 'glb',
            path: 'models/vehicles/Taxi.glb',
            icon: '🚕',
            scale: 1
        })
        
        this.addAsset('vehicles', {
            id: 'police-car',
            name: 'Police Car',
            type: 'glb',
            path: 'models/vehicles/PoliceCar.glb',
            icon: '🚔',
            scale: 1
        })
    }
    
    addCategory(id, name, icon) {
        this.categories.set(id, { id, name, icon, assets: [] })
    }
    
    addAsset(categoryId, asset) {
        const category = this.categories.get(categoryId)
        if (!category) return
        
        this.assets.set(asset.id, { ...asset, category: categoryId })
        category.assets.push(asset.id)
    }
    
    createUI() {
        if (!this.container) return
        
        this.container.innerHTML = ''
        
        const header = document.createElement('div')
        header.className = 'palette-header'
        header.innerHTML = '<h3>Asset Palette</h3>'
        this.container.appendChild(header)
        
        const search = document.createElement('input')
        search.type = 'text'
        search.placeholder = 'Search assets...'
        search.className = 'palette-search'
        search.addEventListener('input', (e) => this.filterAssets(e.target.value))
        this.container.appendChild(search)
        
        this.categoryList = document.createElement('div')
        this.categoryList.className = 'palette-categories'
        this.container.appendChild(this.categoryList)
        
        this.renderCategories()
    }
    
    renderCategories() {
        this.categoryList.innerHTML = ''
        
        for (const [id, category] of this.categories) {
            const section = document.createElement('div')
            section.className = 'palette-section'
            
            const header = document.createElement('div')
            header.className = 'palette-section-header'
            header.innerHTML = `<span>${category.icon} ${category.name}</span><span class="toggle">▼</span>`
            header.onclick = () => {
                section.classList.toggle('collapsed')
                header.querySelector('.toggle').textContent = section.classList.contains('collapsed') ? '▶' : '▼'
            }
            section.appendChild(header)
            
            const grid = document.createElement('div')
            grid.className = 'palette-grid'
            grid.dataset.category = id
            
            for (const assetId of category.assets) {
                const asset = this.assets.get(assetId)
                if (!asset) continue
                
                const item = document.createElement('div')
                item.className = 'palette-item'
                item.dataset.assetId = assetId
                item.innerHTML = `
                    <div class="palette-icon">${asset.icon}</div>
                    <div class="palette-name">${asset.name}</div>
                `
                item.onclick = () => this.selectAsset(assetId)
                grid.appendChild(item)
            }
            
            section.appendChild(grid)
            this.categoryList.appendChild(section)
        }
    }
    
    filterAssets(query) {
        query = query.toLowerCase()
        
        const items = this.categoryList.querySelectorAll('.palette-item')
        items.forEach(item => {
            const assetId = item.dataset.assetId
            const asset = this.assets.get(assetId)
            const matches = !query || asset.name.toLowerCase().includes(query)
            item.style.display = matches ? 'flex' : 'none'
        })
    }
    
    selectAsset(assetId) {
        this.selectedAsset = this.assets.get(assetId)
        
        const items = this.categoryList.querySelectorAll('.palette-item')
        items.forEach(item => {
            item.classList.toggle('selected', item.dataset.assetId === assetId)
        })
        
        if (this.onAssetSelected) {
            this.onAssetSelected(this.selectedAsset)
        }
    }
    
    getSelectedAsset() {
        return this.selectedAsset
    }
    
    async createAssetInstance(assetId, position = new THREE.Vector3()) {
        const asset = this.assets.get(assetId)
        if (!asset) return null
        
        let object = null
        
        if (asset.type === 'procedural') {
            object = this.generateProcedural(asset)
        } else if (asset.type === 'glb' || asset.type === 'gltf') {
            object = await this.loadGLTF(asset)
        }
        
        if (object) {
            object.position.copy(position)
            object.scale.setScalar(asset.scale || 1)
            object.userData.assetId = assetId
            object.userData.assetType = asset.type
            object.name = `${asset.name}_${Date.now()}`
        }
        
        return object
    }
    
    generateProcedural(asset) {
        switch (asset.generator) {
            case 'createPineTree':
                return this.createPineTree(asset.scale)
            case 'createOakTree':
                return this.createOakTree(asset.scale)
            case 'createBush':
                return this.createBush(asset.scale)
            case 'createGrass':
                return this.createGrass(asset.scale)
            case 'createRock':
                return this.createRock(asset.scale)
            case 'createCrate':
                return this.createCrate(asset.scale)
            case 'createBarrel':
                return this.createBarrel(asset.scale)
            default:
                return this.createPlaceholder()
        }
    }
    
    createPineTree(scale = 1) {
        const group = new THREE.Group()
        
        const trunkGeom = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2 * scale, 8)
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 })
        const trunk = new THREE.Mesh(trunkGeom, trunkMat)
        trunk.position.y = scale
        trunk.castShadow = true
        group.add(trunk)
        
        const levels = 4
        for (let i = 0; i < levels; i++) {
            const radius = (1.5 - i * 0.3) * scale
            const height = (1.2 - i * 0.1) * scale
            const y = (1.8 + i * 0.8) * scale
            
            const coneGeom = new THREE.ConeGeometry(radius, height, 8)
            const coneMat = new THREE.MeshStandardMaterial({
                color: 0x1a4d1a,
                roughness: 0.8
            })
            const cone = new THREE.Mesh(coneGeom, coneMat)
            cone.position.y = y
            cone.castShadow = true
            group.add(cone)
        }
        
        return group
    }
    
    createOakTree(scale = 1) {
        const group = new THREE.Group()
        
        const trunkGeom = new THREE.CylinderGeometry(0.3 * scale, 0.5 * scale, 3 * scale, 8)
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 })
        const trunk = new THREE.Mesh(trunkGeom, trunkMat)
        trunk.position.y = 1.5 * scale
        trunk.castShadow = true
        group.add(trunk)
        
        const foliageGeom = new THREE.SphereGeometry(2 * scale, 8, 6)
        const foliageMat = new THREE.MeshStandardMaterial({
            color: 0x2d5a1e,
            roughness: 0.9
        })
        const foliage = new THREE.Mesh(foliageGeom, foliageMat)
        foliage.position.y = 4 * scale
        foliage.scale.y = 0.7
        foliage.castShadow = true
        group.add(foliage)
        
        return group
    }
    
    createBush(scale = 1) {
        const group = new THREE.Group()
        
        const numClusters = 3 + Math.floor(Math.random() * 3)
        for (let i = 0; i < numClusters; i++) {
            const radius = (0.3 + Math.random() * 0.4) * scale
            const geom = new THREE.SphereGeometry(radius, 6, 4)
            const mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.3, 0.5, 0.2 + Math.random() * 0.1),
                roughness: 0.9
            })
            const cluster = new THREE.Mesh(geom, mat)
            cluster.position.set(
                (Math.random() - 0.5) * scale,
                radius,
                (Math.random() - 0.5) * scale
            )
            cluster.castShadow = true
            group.add(cluster)
        }
        
        return group
    }
    
    createGrass(scale = 1) {
        const group = new THREE.Group()
        
        const numBlades = 20
        for (let i = 0; i < numBlades; i++) {
            const height = (0.3 + Math.random() * 0.5) * scale
            const geom = new THREE.ConeGeometry(0.02 * scale, height, 4)
            const mat = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.6, 0.3),
                roughness: 0.8
            })
            const blade = new THREE.Mesh(geom, mat)
            blade.position.set(
                (Math.random() - 0.5) * scale,
                height / 2,
                (Math.random() - 0.5) * scale
            )
            blade.rotation.x = (Math.random() - 0.5) * 0.3
            blade.rotation.z = (Math.random() - 0.5) * 0.3
            group.add(blade)
        }
        
        return group
    }
    
    createRock(scale = 1) {
        const geom = new THREE.IcosahedronGeometry(scale, 0)
        
        const positions = geom.attributes.position
        for (let i = 0; i < positions.count; i++) {
            positions.setXYZ(
                i,
                positions.getX(i) * (0.8 + Math.random() * 0.4),
                positions.getY(i) * (0.6 + Math.random() * 0.3),
                positions.getZ(i) * (0.8 + Math.random() * 0.4)
            )
        }
        geom.computeVertexNormals()
        
        const mat = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.95,
            metalness: 0.1
        })
        
        const rock = new THREE.Mesh(geom, mat)
        rock.castShadow = true
        rock.receiveShadow = true
        
        return rock
    }
    
    createCrate(scale = 1) {
        const geom = new THREE.BoxGeometry(scale, scale, scale)
        const mat = new THREE.MeshStandardMaterial({
            color: 0x8b6914,
            roughness: 0.8
        })
        
        const crate = new THREE.Mesh(geom, mat)
        crate.position.y = scale / 2
        crate.castShadow = true
        crate.receiveShadow = true
        
        return crate
    }
    
    createBarrel(scale = 1) {
        const geom = new THREE.CylinderGeometry(0.4 * scale, 0.4 * scale, scale, 12)
        const mat = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.7
        })
        
        const barrel = new THREE.Mesh(geom, mat)
        barrel.position.y = scale / 2
        barrel.castShadow = true
        barrel.receiveShadow = true
        
        return barrel
    }
    
    createPlaceholder() {
        const geom = new THREE.BoxGeometry(1, 1, 1)
        const mat = new THREE.MeshStandardMaterial({
            color: 0xff00ff,
            wireframe: true
        })
        return new THREE.Mesh(geom, mat)
    }
    
    async loadGLTF(asset) {
        const cached = this.loadedModels.get(asset.id)
        if (cached) {
            return cached.clone()
        }
        
        try {
            const fullPath = getAssetPath('/' + asset.path)
            console.log(`[AssetPalette] Loading model: ${fullPath}`)
            const gltf = await new Promise((resolve, reject) => {
                this.loader.load(fullPath, resolve, undefined, reject)
            })
            
            gltf.scene.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true
                    child.receiveShadow = true
                }
            })
            
            this.loadedModels.set(asset.id, gltf.scene.clone())
            console.log(`[AssetPalette] Model loaded successfully: ${asset.name}`)
            
            return gltf.scene
        } catch (error) {
            console.error(`[AssetPalette] Failed to load ${asset.path}:`, error)
            return this.createPlaceholder()
        }
    }
    
    addCustomAsset(name, path, category = 'custom') {
        const id = `custom-${Date.now()}`
        this.addAsset(category, {
            id,
            name,
            type: 'glb',
            path,
            icon: '📁',
            scale: 1
        })
        this.renderCategories()
        return id
    }
    
    getAssetsByCategory(categoryId) {
        const category = this.categories.get(categoryId)
        if (!category) return []
        
        return category.assets.map(id => this.assets.get(id))
    }
    
    getAllAssets() {
        return Array.from(this.assets.values())
    }
}

export default AssetPalette
