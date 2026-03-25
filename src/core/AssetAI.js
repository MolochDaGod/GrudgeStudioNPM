/*
    GRUDGE Engine - AI-Powered Asset Helper
    Uses Online 3D Viewer + AI to analyze and correctly import assets
*/

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

export class AssetAI {
    constructor() {
        this.gltfLoader = new GLTFLoader()
        this.fbxLoader = new FBXLoader()
        this.objLoader = new OBJLoader()
        this.textureLoader = new THREE.TextureLoader()
        
        this.loadedAssets = new Map()
        this.assetMetadata = new Map()
        this.aiEnabled = false
        this.puterAI = null
    }
    
    async initAI() {
        if (typeof puter !== 'undefined' && puter.ai) {
            this.puterAI = puter.ai
            this.aiEnabled = true
            console.log('[GRUDGE AssetAI] AI worker connected')
            return true
        }
        console.warn('[GRUDGE AssetAI] Puter AI not available')
        return false
    }
    
    detectAssetType(path) {
        const ext = path.split('.').pop().toLowerCase()
        const types = {
            'glb': 'gltf',
            'gltf': 'gltf',
            'fbx': 'fbx',
            'obj': 'obj',
            'png': 'texture',
            'jpg': 'texture',
            'jpeg': 'texture',
            'webp': 'texture',
            'hdr': 'environment',
            'exr': 'environment'
        }
        return types[ext] || 'unknown'
    }
    
    async loadAsset(path, options = {}) {
        const type = this.detectAssetType(path)
        let result = null
        
        try {
            switch (type) {
                case 'gltf':
                    result = await this.loadGLTF(path, options)
                    break
                case 'fbx':
                    result = await this.loadFBX(path, options)
                    break
                case 'obj':
                    result = await this.loadOBJ(path, options)
                    break
                case 'texture':
                    result = await this.loadTexture(path, options)
                    break
                default:
                    throw new Error(`Unsupported asset type: ${type}`)
            }
            
            this.loadedAssets.set(path, result)
            
            if (this.aiEnabled && options.analyze) {
                const metadata = await this.analyzeAsset(path, result, type)
                this.assetMetadata.set(path, metadata)
            }
            
            return result
        } catch (error) {
            console.error(`[GRUDGE AssetAI] Failed to load ${path}:`, error)
            throw error
        }
    }
    
    async loadGLTF(path, options = {}) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    const asset = {
                        scene: gltf.scene,
                        animations: gltf.animations,
                        cameras: gltf.cameras,
                        asset: gltf.asset,
                        userData: gltf.userData
                    }
                    
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = options.castShadow !== false
                            child.receiveShadow = options.receiveShadow !== false
                        }
                    })
                    
                    if (options.scale) {
                        gltf.scene.scale.setScalar(options.scale)
                    }
                    
                    if (options.center) {
                        this.centerModel(gltf.scene)
                    }
                    
                    resolve(asset)
                },
                undefined,
                reject
            )
        })
    }
    
    async loadFBX(path, options = {}) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                path,
                (fbx) => {
                    const asset = {
                        scene: fbx,
                        animations: fbx.animations || [],
                        userData: fbx.userData
                    }
                    
                    fbx.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = options.castShadow !== false
                            child.receiveShadow = options.receiveShadow !== false
                        }
                    })
                    
                    if (options.scale) {
                        fbx.scale.setScalar(options.scale)
                    }
                    
                    if (options.center) {
                        this.centerModel(fbx)
                    }
                    
                    resolve(asset)
                },
                undefined,
                reject
            )
        })
    }
    
    async loadOBJ(path, options = {}) {
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                path,
                (obj) => {
                    const asset = {
                        scene: obj,
                        animations: [],
                        userData: {}
                    }
                    
                    obj.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = options.castShadow !== false
                            child.receiveShadow = options.receiveShadow !== false
                            
                            if (!child.material) {
                                child.material = new THREE.MeshStandardMaterial({ color: 0x808080 })
                            }
                        }
                    })
                    
                    if (options.scale) {
                        obj.scale.setScalar(options.scale)
                    }
                    
                    if (options.center) {
                        this.centerModel(obj)
                    }
                    
                    resolve(asset)
                },
                undefined,
                reject
            )
        })
    }
    
    async loadTexture(path, options = {}) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                path,
                (texture) => {
                    texture.colorSpace = options.colorSpace || THREE.SRGBColorSpace
                    
                    if (options.repeat) {
                        texture.wrapS = THREE.RepeatWrapping
                        texture.wrapT = THREE.RepeatWrapping
                        texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1)
                    }
                    
                    resolve({ texture, type: 'texture' })
                },
                undefined,
                reject
            )
        })
    }
    
    centerModel(model) {
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        
        model.position.x -= center.x
        model.position.z -= center.z
        model.position.y -= box.min.y
    }
    
    getModelInfo(model) {
        let meshCount = 0
        let vertexCount = 0
        let triangleCount = 0
        let boneCount = 0
        let skinnedMeshCount = 0
        const materials = new Set()
        const textures = new Set()
        
        model.traverse((child) => {
            if (child.isMesh) {
                meshCount++
                if (child.isSkinnedMesh) {
                    skinnedMeshCount++
                }
                
                const geometry = child.geometry
                if (geometry.attributes.position) {
                    vertexCount += geometry.attributes.position.count
                }
                if (geometry.index) {
                    triangleCount += geometry.index.count / 3
                } else if (geometry.attributes.position) {
                    triangleCount += geometry.attributes.position.count / 3
                }
                
                if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material]
                    mats.forEach(mat => {
                        materials.add(mat.type)
                        if (mat.map) textures.add('diffuse')
                        if (mat.normalMap) textures.add('normal')
                        if (mat.roughnessMap) textures.add('roughness')
                        if (mat.metalnessMap) textures.add('metalness')
                        if (mat.emissiveMap) textures.add('emissive')
                    })
                }
            }
            if (child.isBone) {
                boneCount++
            }
        })
        
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        
        return {
            meshCount,
            vertexCount,
            triangleCount: Math.floor(triangleCount),
            boneCount,
            skinnedMeshCount,
            materials: Array.from(materials),
            textures: Array.from(textures),
            size: { x: size.x, y: size.y, z: size.z },
            isAnimated: boneCount > 0 || skinnedMeshCount > 0
        }
    }
    
    async analyzeAsset(path, asset, type) {
        if (!this.aiEnabled) {
            return this.getBasicAnalysis(asset, type)
        }
        
        try {
            const info = type !== 'texture' ? this.getModelInfo(asset.scene) : { type: 'texture' }
            
            const prompt = `Analyze this 3D asset and provide usage recommendations:
Path: ${path}
Type: ${type}
${type !== 'texture' ? `
Meshes: ${info.meshCount}
Vertices: ${info.vertexCount}
Triangles: ${info.triangleCount}
Bones: ${info.boneCount}
Skinned Meshes: ${info.skinnedMeshCount}
Materials: ${info.materials.join(', ')}
Textures: ${info.textures.join(', ')}
Size: ${info.size.x.toFixed(2)} x ${info.size.y.toFixed(2)} x ${info.size.z.toFixed(2)}
Is Animated: ${info.isAnimated}
` : ''}

Provide JSON with:
{
  "category": "character|prop|environment|weapon|effect|ui",
  "suggestedScale": number,
  "suggestedUsage": "description of how to use this asset",
  "optimizationTips": ["tip1", "tip2"],
  "compatibleWith": ["fighter", "weapon", "arena", etc],
  "importSettings": { scale: number, center: boolean, shadows: boolean }
}`
            
            const response = await this.puterAI.chat(prompt, {
                system: 'You are a 3D game asset analyst for the GRUDGE Arena game engine. Respond only with valid JSON.'
            })
            
            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0])
                return { ...info, ...analysis }
            }
            
            return this.getBasicAnalysis(asset, type)
        } catch (error) {
            console.warn('[GRUDGE AssetAI] AI analysis failed:', error)
            return this.getBasicAnalysis(asset, type)
        }
    }
    
    getBasicAnalysis(asset, type) {
        if (type === 'texture') {
            return {
                category: 'texture',
                suggestedUsage: 'Apply to materials using TextureLayer',
                importSettings: { colorSpace: 'sRGB' }
            }
        }
        
        const info = this.getModelInfo(asset.scene)
        
        let category = 'prop'
        if (info.boneCount > 20) category = 'character'
        else if (info.size.x > 10 || info.size.z > 10) category = 'environment'
        else if (info.meshCount === 1 && info.size.y < 2) category = 'weapon'
        
        return {
            ...info,
            category,
            suggestedScale: 1.0,
            suggestedUsage: `Use as ${category} in the arena`,
            optimizationTips: info.triangleCount > 50000 ? ['Consider LOD for performance'] : [],
            compatibleWith: category === 'character' ? ['fighter', 'player'] : ['arena', 'decoration'],
            importSettings: { scale: 1, center: true, shadows: true }
        }
    }
    
    async suggestAssetImport(description) {
        if (!this.aiEnabled) {
            return this.getDefaultImportSuggestion(description)
        }
        
        try {
            const prompt = `For the GRUDGE Arena game, suggest how to import a 3D asset described as: "${description}"

Provide JSON with:
{
  "recommendedFormat": "glb|fbx|obj",
  "importCode": "// JavaScript code to import and use the asset",
  "setupSteps": ["step1", "step2"],
  "materialSetup": "description of material configuration",
  "animationSetup": "description if animated",
  "physicsSetup": "description of collision setup"
}`
            
            const response = await this.puterAI.chat(prompt, {
                system: 'You are a 3D game development assistant for GRUDGE Arena using Three.js. Respond only with valid JSON.'
            })
            
            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0])
            }
            
            return this.getDefaultImportSuggestion(description)
        } catch (error) {
            return this.getDefaultImportSuggestion(description)
        }
    }
    
    getDefaultImportSuggestion(description) {
        return {
            recommendedFormat: 'glb',
            importCode: `
import { AssetAI } from './src/core/AssetAI.js'

const assetAI = new AssetAI()
const asset = await assetAI.loadAsset('/path/to/model.glb', {
    scale: 1,
    center: true,
    analyze: true
})

scene.add(asset.scene)`,
            setupSteps: [
                'Load the GLB file using AssetAI.loadAsset()',
                'Center the model if needed',
                'Add to scene',
                'Set up animations if available'
            ],
            materialSetup: 'GLB files typically include materials. Use TextureLayer for customization.',
            animationSetup: 'Use AnimationLayer to manage animation clips from the GLB.',
            physicsSetup: 'Use CollisionLayer to add hitboxes based on model bounds.'
        }
    }
    
    listLoadedAssets() {
        const assets = []
        for (const [path, asset] of this.loadedAssets) {
            const metadata = this.assetMetadata.get(path) || {}
            assets.push({ path, ...metadata })
        }
        return assets
    }
    
    getAsset(path) {
        return this.loadedAssets.get(path)
    }
    
    getMetadata(path) {
        return this.assetMetadata.get(path)
    }
    
    dispose(path) {
        const asset = this.loadedAssets.get(path)
        if (asset && asset.scene) {
            asset.scene.traverse((child) => {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose())
                    } else {
                        child.material.dispose()
                    }
                }
            })
        }
        this.loadedAssets.delete(path)
        this.assetMetadata.delete(path)
    }
    
    disposeAll() {
        for (const path of this.loadedAssets.keys()) {
            this.dispose(path)
        }
    }
}

export const assetAI = new AssetAI()
export default AssetAI
