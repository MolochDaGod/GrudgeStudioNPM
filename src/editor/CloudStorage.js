import * as THREE from 'three'

export class CloudStorage {
    constructor() {
        this.prefix = 'grudge_scenes_'
        this.storageKey = 'grudge_cloud_scenes'
    }

    async saveScene(sceneName, sceneData) {
        try {
            const key = this.prefix + sceneName
            const jsonData = JSON.stringify(sceneData)
            
            const scenes = this.getStoredScenes()
            scenes[sceneName] = {
                data: sceneData,
                savedAt: Date.now()
            }
            localStorage.setItem(this.storageKey, JSON.stringify(scenes))
            
            console.log('Scene saved:', sceneName)
            return { success: true, key }
        } catch (error) {
            console.error('Failed to save scene:', error)
            return { success: false, error: error.message }
        }
    }

    async loadScene(sceneName) {
        try {
            const scenes = this.getStoredScenes()
            const scene = scenes[sceneName]
            
            if (!scene) {
                throw new Error('Scene not found: ' + sceneName)
            }
            
            console.log('Scene loaded:', sceneName)
            return { success: true, data: scene.data }
        } catch (error) {
            console.error('Failed to load scene:', error)
            return { success: false, error: error.message }
        }
    }

    async listScenes() {
        try {
            const scenes = this.getStoredScenes()
            
            const sceneList = Object.entries(scenes).map(([name, info]) => ({
                name,
                savedAt: info.savedAt,
                size: JSON.stringify(info.data).length
            }))
            
            return { success: true, scenes: sceneList }
        } catch (error) {
            console.error('Failed to list scenes:', error)
            return { success: false, error: error.message, scenes: [] }
        }
    }

    async deleteScene(sceneName) {
        try {
            const scenes = this.getStoredScenes()
            delete scenes[sceneName]
            localStorage.setItem(this.storageKey, JSON.stringify(scenes))
            
            console.log('Scene deleted:', sceneName)
            return { success: true }
        } catch (error) {
            console.error('Failed to delete scene:', error)
            return { success: false, error: error.message }
        }
    }
    
    getStoredScenes() {
        try {
            const stored = localStorage.getItem(this.storageKey)
            return stored ? JSON.parse(stored) : {}
        } catch {
            return {}
        }
    }

    serializeScene(threeScene, options = {}) {
        const sceneData = {
            version: '1.0',
            name: options.name || 'Untitled Scene',
            created: Date.now(),
            metadata: {
                author: options.author || 'Unknown',
                description: options.description || ''
            },
            settings: options.settings || {},
            objects: []
        }

        threeScene.traverse(child => {
            if (child === threeScene) return
            if (child.isHelper || child.type === 'GridHelper') return
            if (child.userData?.isGizmo) return
            if (!child.parent || child.parent !== threeScene) return

            const objData = this.serializeObject(child)
            if (objData) {
                sceneData.objects.push(objData)
            }
        })

        return sceneData
    }

    serializeObject(object) {
        const data = {
            uuid: object.uuid,
            name: object.name || 'Object',
            type: object.type,
            position: object.position.toArray(),
            rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
            scale: object.scale.toArray(),
            visible: object.visible,
            userData: { ...object.userData }
        }

        if (object.isMesh && object.geometry) {
            data.geometry = {
                type: object.geometry.type,
                parameters: object.geometry.parameters || {}
            }
            
            if (object.material) {
                data.material = {
                    type: object.material.type,
                    color: object.material.color?.getHex(),
                    metalness: object.material.metalness,
                    roughness: object.material.roughness,
                    transparent: object.material.transparent,
                    opacity: object.material.opacity
                }
            }
        }

        if (object.isLight) {
            data.lightData = {
                color: object.color.getHex(),
                intensity: object.intensity
            }
            if (object.isSpotLight) {
                data.lightData.angle = object.angle
                data.lightData.penumbra = object.penumbra
                data.lightData.distance = object.distance
            }
            if (object.isPointLight) {
                data.lightData.distance = object.distance
                data.lightData.decay = object.decay
            }
        }

        if (object.children && object.children.length > 0) {
            data.children = []
            object.children.forEach(child => {
                if (!child.isHelper) {
                    const childData = this.serializeObject(child)
                    if (childData) {
                        data.children.push(childData)
                    }
                }
            })
        }

        return data
    }

    deserializeScene(sceneData, targetScene) {
        if (!sceneData || !sceneData.objects) {
            console.warn('Invalid scene data')
            return []
        }

        const createdObjects = []

        sceneData.objects.forEach(objData => {
            const obj = this.deserializeObject(objData)
            if (obj) {
                targetScene.add(obj)
                createdObjects.push(obj)
            }
        })

        return createdObjects
    }

    deserializeObject(data) {
        let object

        switch (data.type) {
            case 'Mesh':
                object = this.createMesh(data)
                break
            case 'PointLight':
                object = new THREE.PointLight(
                    data.lightData?.color || 0xffffff,
                    data.lightData?.intensity || 1,
                    data.lightData?.distance || 0,
                    data.lightData?.decay || 2
                )
                break
            case 'SpotLight':
                object = new THREE.SpotLight(
                    data.lightData?.color || 0xffffff,
                    data.lightData?.intensity || 1,
                    data.lightData?.distance || 0,
                    data.lightData?.angle || Math.PI / 3,
                    data.lightData?.penumbra || 0
                )
                break
            case 'DirectionalLight':
                object = new THREE.DirectionalLight(
                    data.lightData?.color || 0xffffff,
                    data.lightData?.intensity || 1
                )
                break
            case 'Group':
            default:
                object = new THREE.Group()
                break
        }

        object.name = data.name
        object.position.fromArray(data.position)
        object.rotation.set(data.rotation[0], data.rotation[1], data.rotation[2])
        object.scale.fromArray(data.scale)
        object.visible = data.visible !== false
        object.userData = data.userData || {}

        if (data.children) {
            data.children.forEach(childData => {
                const child = this.deserializeObject(childData)
                if (child) {
                    object.add(child)
                }
            })
        }

        return object
    }

    createMesh(data) {
        let geometry
        const geoData = data.geometry || {}
        const params = geoData.parameters || {}

        switch (geoData.type) {
            case 'BoxGeometry':
                geometry = new THREE.BoxGeometry(params.width || 1, params.height || 1, params.depth || 1)
                break
            case 'SphereGeometry':
                geometry = new THREE.SphereGeometry(params.radius || 0.5, params.widthSegments || 32, params.heightSegments || 16)
                break
            case 'CylinderGeometry':
                geometry = new THREE.CylinderGeometry(params.radiusTop || 0.5, params.radiusBottom || 0.5, params.height || 1)
                break
            case 'PlaneGeometry':
                geometry = new THREE.PlaneGeometry(params.width || 1, params.height || 1)
                break
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1)
        }

        let material
        const matData = data.material || {}
        
        material = new THREE.MeshStandardMaterial({
            color: matData.color ?? 0x888888,
            metalness: matData.metalness ?? 0,
            roughness: matData.roughness ?? 1,
            transparent: matData.transparent ?? false,
            opacity: matData.opacity ?? 1
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        
        return mesh
    }
}

export const cloudStorage = new CloudStorage()
