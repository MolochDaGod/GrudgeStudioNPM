import * as THREE from 'three'

const MAX_UNDO = 80

export class PrefabSystem {
    constructor() {
        this.prefabs = new Map()
        this.storageKey = 'grudge_prefabs'
        this.mirrorMode = false
        this.mirrorAxis = 'x'
        this.undoStack = []
        this.redoStack = []
        this.loadFromStorage()
    }

    // ── Mirror Mode (from SpaceRTS ship-editor) ────────────────

    setMirrorMode(enabled, axis = 'x') {
        this.mirrorMode = enabled
        this.mirrorAxis = axis
        console.log(`[PrefabSystem] Mirror mode: ${enabled ? 'ON' : 'OFF'} (axis: ${axis})`)
    }

    /**
     * If mirror mode is on, returns a mirrored copy of the position.
     */
    getMirroredPosition(position) {
        if (!this.mirrorMode) return null
        const mirrored = position.clone()
        mirrored[this.mirrorAxis] = -mirrored[this.mirrorAxis]
        return mirrored
    }

    /**
     * Instantiate a prefab with automatic mirroring.
     * Returns an array of placed groups (1 if mirror off, 2 if mirror on).
     */
    instantiateWithMirror(prefabId, position, options = {}) {
        const instances = []
        const primary = this.instantiate(prefabId, position, options)
        if (primary) instances.push(primary)

        if (this.mirrorMode) {
            const mirrorPos = this.getMirroredPosition(position)
            if (mirrorPos) {
                const mirrorOpts = { ...options }
                if (options.rotation) {
                    mirrorOpts.rotation = { ...options.rotation }
                    mirrorOpts.rotation.y = -options.rotation.y
                }
                const mirrored = this.instantiate(prefabId, mirrorPos, mirrorOpts)
                if (mirrored) {
                    mirrored.userData.isMirrored = true
                    instances.push(mirrored)
                }
            }
        }

        return instances
    }

    // ── Undo/Redo System (from SpaceRTS ship-editor) ───────────

    pushUndo(entry) {
        this.undoStack.push(entry)
        if (this.undoStack.length > MAX_UNDO) this.undoStack.shift()
        this.redoStack = []
    }

    undo() {
        if (this.undoStack.length === 0) return null
        const entry = this.undoStack.pop()
        this.redoStack.push(entry)
        return entry
    }

    redo() {
        if (this.redoStack.length === 0) return null
        const entry = this.redoStack.pop()
        this.undoStack.push(entry)
        return entry
    }

    get canUndo() { return this.undoStack.length > 0 }
    get canRedo() { return this.redoStack.length > 0 }

    createPrefab(name, objects, options = {}) {
        if (!objects || objects.length === 0) {
            console.warn('Cannot create prefab from empty selection')
            return null
        }

        const center = this.calculateCenter(objects)
        
        const prefabData = {
            id: this.generateId(),
            name: name || 'New Prefab',
            created: Date.now(),
            modified: Date.now(),
            icon: options.icon || '📦',
            category: options.category || 'Custom',
            objects: objects.map(obj => this.serializeObject(obj, center))
        }

        this.prefabs.set(prefabData.id, prefabData)
        this.saveToStorage()
        
        return prefabData
    }

    calculateCenter(objects) {
        const center = new THREE.Vector3()
        objects.forEach(obj => {
            center.add(obj.position)
        })
        center.divideScalar(objects.length)
        return center
    }

    serializeObject(object, center = new THREE.Vector3()) {
        const relativePosition = object.position.clone().sub(center)
        
        const data = {
            type: this.getObjectType(object),
            name: object.name || object.userData?.name || 'Object',
            position: relativePosition.toArray(),
            rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
            scale: object.scale.toArray(),
            userData: { ...object.userData }
        }

        if (object.userData?.assetId) {
            data.assetId = object.userData.assetId
        }

        if (object.userData?.modelPath) {
            data.modelPath = object.userData.modelPath
        }

        if (object.isMesh) {
            data.geometry = this.serializeGeometry(object.geometry)
            data.material = this.serializeMaterial(object.material)
        }

        if (object.isLight) {
            data.lightType = object.type
            data.color = object.color.getHex()
            data.intensity = object.intensity
            if (object.isSpotLight) {
                data.angle = object.angle
                data.penumbra = object.penumbra
            }
        }

        if (object.children && object.children.length > 0) {
            data.children = object.children
                .filter(child => !child.isHelper)
                .map(child => this.serializeObject(child, object.position))
        }

        return data
    }

    getObjectType(object) {
        if (object.userData?.assetId) return 'asset'
        if (object.isLight) return 'light'
        if (object.isCamera) return 'camera'
        if (object.isMesh) return 'mesh'
        if (object.isGroup) return 'group'
        return 'object'
    }

    serializeGeometry(geometry) {
        if (!geometry) return null
        
        const geoType = geometry.type
        const params = geometry.parameters || {}
        
        return {
            type: geoType,
            parameters: params
        }
    }

    serializeMaterial(material) {
        if (!material) return null
        
        return {
            type: material.type,
            color: material.color?.getHex() || 0xffffff,
            metalness: material.metalness,
            roughness: material.roughness,
            transparent: material.transparent,
            opacity: material.opacity
        }
    }

    instantiate(prefabId, position = new THREE.Vector3(), options = {}) {
        const prefab = this.prefabs.get(prefabId)
        if (!prefab) {
            console.warn('Prefab not found:', prefabId)
            return null
        }

        const group = new THREE.Group()
        group.name = prefab.name
        group.userData = {
            isPrefabInstance: true,
            prefabId: prefabId,
            prefabName: prefab.name
        }

        prefab.objects.forEach(objData => {
            const obj = this.deserializeObject(objData)
            if (obj) {
                group.add(obj)
            }
        })

        group.position.copy(position)
        
        if (options.rotation) {
            group.rotation.set(options.rotation.x, options.rotation.y, options.rotation.z)
        }
        if (options.scale) {
            group.scale.copy(options.scale)
        }

        return group
    }

    deserializeObject(data) {
        let object

        switch (data.type) {
            case 'light':
                object = this.createLight(data)
                break
            case 'mesh':
                object = this.createMesh(data)
                break
            case 'group':
            case 'asset':
            default:
                object = new THREE.Group()
                break
        }

        if (!object) return null

        object.name = data.name
        object.position.fromArray(data.position)
        object.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2])
        object.scale.fromArray(data.scale)
        object.userData = { ...data.userData }

        if (data.children) {
            data.children.forEach(childData => {
                const child = this.deserializeObject(childData)
                if (child) object.add(child)
            })
        }

        return object
    }

    createLight(data) {
        let light
        switch (data.lightType) {
            case 'PointLight':
                light = new THREE.PointLight(data.color, data.intensity)
                break
            case 'SpotLight':
                light = new THREE.SpotLight(data.color, data.intensity, 0, data.angle, data.penumbra)
                break
            case 'DirectionalLight':
                light = new THREE.DirectionalLight(data.color, data.intensity)
                break
            default:
                light = new THREE.PointLight(data.color, data.intensity)
        }
        return light
    }

    createMesh(data) {
        let geometry
        if (data.geometry) {
            geometry = this.createGeometry(data.geometry)
        } else {
            geometry = new THREE.BoxGeometry(1, 1, 1)
        }

        let material
        if (data.material) {
            material = new THREE.MeshStandardMaterial({
                color: data.material.color,
                metalness: data.material.metalness || 0,
                roughness: data.material.roughness || 1,
                transparent: data.material.transparent || false,
                opacity: data.material.opacity ?? 1
            })
        } else {
            material = new THREE.MeshStandardMaterial({ color: 0x888888 })
        }

        return new THREE.Mesh(geometry, material)
    }

    createGeometry(geoData) {
        const params = geoData.parameters || {}
        
        switch (geoData.type) {
            case 'BoxGeometry':
                return new THREE.BoxGeometry(params.width || 1, params.height || 1, params.depth || 1)
            case 'SphereGeometry':
                return new THREE.SphereGeometry(params.radius || 0.5)
            case 'CylinderGeometry':
                return new THREE.CylinderGeometry(params.radiusTop || 0.5, params.radiusBottom || 0.5, params.height || 1)
            case 'PlaneGeometry':
                return new THREE.PlaneGeometry(params.width || 1, params.height || 1)
            case 'CapsuleGeometry':
                return new THREE.CapsuleGeometry(params.radius || 0.5, params.length || 1)
            default:
                return new THREE.BoxGeometry(1, 1, 1)
        }
    }

    deletePrefab(prefabId) {
        const deleted = this.prefabs.delete(prefabId)
        if (deleted) {
            this.saveToStorage()
        }
        return deleted
    }

    renamePrefab(prefabId, newName) {
        const prefab = this.prefabs.get(prefabId)
        if (prefab) {
            prefab.name = newName
            prefab.modified = Date.now()
            this.saveToStorage()
            return true
        }
        return false
    }

    getPrefab(prefabId) {
        return this.prefabs.get(prefabId)
    }

    getAllPrefabs() {
        return Array.from(this.prefabs.values())
    }

    getPrefabsByCategory(category) {
        return this.getAllPrefabs().filter(p => p.category === category)
    }

    exportPrefab(prefabId) {
        const prefab = this.prefabs.get(prefabId)
        if (!prefab) return null
        return JSON.stringify(prefab, null, 2)
    }

    importPrefab(jsonString) {
        try {
            const data = JSON.parse(jsonString)
            data.id = this.generateId()
            data.imported = Date.now()
            this.prefabs.set(data.id, data)
            this.saveToStorage()
            return data
        } catch (e) {
            console.error('Failed to import prefab:', e)
            return null
        }
    }

    saveToStorage() {
        try {
            const data = JSON.stringify(Array.from(this.prefabs.entries()))
            localStorage.setItem(this.storageKey, data)
        } catch (e) {
            console.warn('Failed to save prefabs:', e)
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey)
            if (data) {
                const entries = JSON.parse(data)
                this.prefabs = new Map(entries)
            }
        } catch (e) {
            console.warn('Failed to load prefabs:', e)
        }
    }

    generateId() {
        return 'prefab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }
}

export const prefabSystem = new PrefabSystem()
