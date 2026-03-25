import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { AssetAI } from '../core/AssetAI.js'
import { getAssetPath } from '../core/paths.js'

class AssetManager {
    constructor() {
        this.container = document.getElementById('viewer')
        this.dropzone = document.getElementById('dropzone')
        this.assetList = document.getElementById('asset-list')
        this.fileInput = document.getElementById('file-input')
        this.aiInput = document.getElementById('ai-input')
        this.aiOutput = document.getElementById('ai-output')
        this.infoPanel = document.getElementById('info-panel')
        
        this.scene = null
        this.camera = null
        this.renderer = null
        this.controls = null
        this.currentModel = null
        this.currentAsset = null
        this.mixer = null
        this.clock = new THREE.Clock()
        this.skeletonHelper = null
        this.wireframeMode = false
        this.showSkeleton = false
        
        this.assetAI = new AssetAI()
        
        this.projectAssets = [
            { path: 'models/arena.glb', name: 'Arena Map', type: 'environment', icon: '🏟️' },
            { path: 'models/gladiator.glb', name: 'Gladiator', type: 'character', icon: '⚔️' },
            { path: 'models/gladiator-pose.glb', name: 'Gladiator Pose', type: 'character', icon: '🗡️' },
            { path: 'models/dragon.glb', name: 'Dragon', type: 'character', icon: '🐉' }
        ]
        
        this.init()
        this.setupEventListeners()
        this.populateAssetList()
        this.assetAI.initAI()
        this.animate()
    }
    
    init() {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x0a0a1a)
        
        const aspect = this.container.clientWidth / this.container.clientHeight
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000)
        this.camera.position.set(5, 3, 5)
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.shadowMap.enabled = true
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.container.appendChild(this.renderer.domElement)
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.target.set(0, 1, 0)
        
        const ambientLight = new THREE.AmbientLight(0x404040, 2)
        this.scene.add(ambientLight)
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 3)
        mainLight.position.set(10, 20, 10)
        mainLight.castShadow = true
        this.scene.add(mainLight)
        
        const fillLight = new THREE.DirectionalLight(0x8888ff, 1)
        fillLight.position.set(-10, 10, -10)
        this.scene.add(fillLight)
        
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
        this.scene.add(gridHelper)
        
        window.addEventListener('resize', () => this.onResize())
    }
    
    setupEventListeners() {
        document.getElementById('upload-btn').addEventListener('click', () => {
            this.fileInput.click()
        })
        
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.loadUploadedFile(e.target.files[0])
            }
        })
        
        this.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault()
            this.dropzone.style.background = 'rgba(233, 69, 96, 0.1)'
        })
        
        this.dropzone.addEventListener('dragleave', () => {
            this.dropzone.style.background = 'rgba(10, 10, 26, 0.95)'
        })
        
        this.dropzone.addEventListener('drop', (e) => {
            e.preventDefault()
            this.dropzone.style.background = 'rgba(10, 10, 26, 0.95)'
            if (e.dataTransfer.files.length > 0) {
                this.loadUploadedFile(e.dataTransfer.files[0])
            }
        })
        
        document.getElementById('btn-reset').addEventListener('click', () => this.resetView())
        document.getElementById('btn-wireframe').addEventListener('click', () => this.toggleWireframe())
        document.getElementById('btn-skeleton').addEventListener('click', () => this.toggleSkeleton())
        document.getElementById('btn-analyze').addEventListener('click', () => this.analyzeWithAI())
        
        document.getElementById('ai-ask').addEventListener('click', () => this.askAI())
        this.aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.askAI()
        })
        
        document.getElementById('asset-search').addEventListener('input', (e) => {
            this.filterAssets(e.target.value)
        })
    }
    
    populateAssetList() {
        this.assetList.innerHTML = ''
        
        this.projectAssets.forEach((asset, index) => {
            const item = document.createElement('div')
            item.className = 'asset-item'
            item.innerHTML = `
                <div class="asset-icon">${asset.icon}</div>
                <div class="asset-info">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-meta">${asset.type.toUpperCase()}</div>
                </div>
            `
            item.addEventListener('click', () => this.loadAssetFromPath(asset.path, asset))
            this.assetList.appendChild(item)
        })
    }
    
    filterAssets(query) {
        const items = this.assetList.querySelectorAll('.asset-item')
        query = query.toLowerCase()
        
        items.forEach((item, index) => {
            const asset = this.projectAssets[index]
            const matches = asset.name.toLowerCase().includes(query) || 
                           asset.type.toLowerCase().includes(query)
            item.style.display = matches ? 'flex' : 'none'
        })
    }
    
    async loadAssetFromPath(path, assetInfo) {
        this.clearCurrentModel()
        this.dropzone.classList.add('hidden')
        
        try {
            const fullPath = getAssetPath('/' + path)
            const asset = await this.assetAI.loadAsset(fullPath, {
                center: true,
                analyze: true
            })
            
            this.currentAsset = { ...assetInfo, ...asset }
            this.currentModel = asset.scene
            this.scene.add(asset.scene)
            
            if (asset.animations && asset.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(asset.scene)
                const action = this.mixer.clipAction(asset.animations[0])
                action.play()
            }
            
            this.createSkeletonHelper(asset.scene)
            this.resetView()
            this.updateInfoPanel(asset)
            
            this.assetList.querySelectorAll('.asset-item').forEach((item, i) => {
                item.classList.toggle('selected', this.projectAssets[i].path === path)
            })
            
        } catch (error) {
            console.error('Failed to load asset:', error)
            this.aiOutput.innerHTML = `<p style="color: #e94560;">Error loading asset: ${error.message}</p>`
        }
    }
    
    async loadUploadedFile(file) {
        const reader = new FileReader()
        const ext = file.name.split('.').pop().toLowerCase()
        
        reader.onload = async (e) => {
            this.clearCurrentModel()
            this.dropzone.classList.add('hidden')
            
            try {
                const loader = new GLTFLoader()
                loader.parse(e.target.result, '', (gltf) => {
                    this.currentModel = gltf.scene
                    this.currentAsset = {
                        name: file.name,
                        scene: gltf.scene,
                        animations: gltf.animations
                    }
                    
                    this.centerModel(gltf.scene)
                    this.scene.add(gltf.scene)
                    
                    if (gltf.animations && gltf.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(gltf.scene)
                        const action = this.mixer.clipAction(gltf.animations[0])
                        action.play()
                    }
                    
                    this.createSkeletonHelper(gltf.scene)
                    this.resetView()
                    this.updateInfoPanel({ scene: gltf.scene, animations: gltf.animations })
                    
                }, (error) => {
                    console.error('Parse error:', error)
                })
            } catch (error) {
                console.error('Load error:', error)
            }
        }
        
        reader.readAsArrayBuffer(file)
    }
    
    centerModel(model) {
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        
        model.position.x -= center.x
        model.position.z -= center.z
        model.position.y -= box.min.y
    }
    
    createSkeletonHelper(model) {
        if (this.skeletonHelper) {
            this.scene.remove(this.skeletonHelper)
            this.skeletonHelper = null
        }
        
        let hasSkeleton = false
        model.traverse((child) => {
            if (child.isSkinnedMesh) {
                hasSkeleton = true
            }
        })
        
        if (hasSkeleton) {
            this.skeletonHelper = new THREE.SkeletonHelper(model)
            this.skeletonHelper.visible = this.showSkeleton
            this.scene.add(this.skeletonHelper)
        }
    }
    
    updateInfoPanel(asset) {
        const info = this.assetAI.getModelInfo(asset.scene)
        const metadata = this.assetAI.getMetadata(this.currentAsset?.path) || {}
        
        this.infoPanel.style.display = 'block'
        document.getElementById('info-category').textContent = metadata.category || 'unknown'
        document.getElementById('info-meshes').textContent = info.meshCount
        document.getElementById('info-vertices').textContent = info.vertexCount.toLocaleString()
        document.getElementById('info-triangles').textContent = info.triangleCount.toLocaleString()
        document.getElementById('info-bones').textContent = info.boneCount
        document.getElementById('info-animations').textContent = asset.animations?.length || 0
    }
    
    clearCurrentModel() {
        if (this.skeletonHelper) {
            this.scene.remove(this.skeletonHelper)
            this.skeletonHelper = null
        }
        
        if (this.currentModel) {
            this.scene.remove(this.currentModel)
            this.currentModel = null
        }
        
        if (this.mixer) {
            this.mixer.stopAllAction()
            this.mixer = null
        }
        
        this.currentAsset = null
    }
    
    resetView() {
        if (this.currentModel) {
            const box = new THREE.Box3().setFromObject(this.currentModel)
            const size = box.getSize(new THREE.Vector3())
            const maxDim = Math.max(size.x, size.y, size.z)
            const distance = maxDim * 2
            
            this.camera.position.set(distance, distance * 0.6, distance)
            this.controls.target.set(0, size.y / 2, 0)
        }
        this.controls.update()
    }
    
    toggleWireframe() {
        this.wireframeMode = !this.wireframeMode
        if (this.currentModel) {
            this.currentModel.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.wireframe = this.wireframeMode)
                    } else {
                        child.material.wireframe = this.wireframeMode
                    }
                }
            })
        }
    }
    
    toggleSkeleton() {
        this.showSkeleton = !this.showSkeleton
        if (this.skeletonHelper) {
            this.skeletonHelper.visible = this.showSkeleton
        }
    }
    
    async analyzeWithAI() {
        if (!this.currentAsset) {
            this.aiOutput.innerHTML = '<p style="color: #888;">Please load an asset first.</p>'
            return
        }
        
        this.aiOutput.innerHTML = '<p style="color: #e94560;">Analyzing asset with AI...</p>'
        
        const info = this.assetAI.getModelInfo(this.currentAsset.scene)
        const suggestion = await this.assetAI.suggestAssetImport(this.currentAsset.name || 'model')
        
        this.aiOutput.innerHTML = `
            <p><strong>Asset Analysis:</strong></p>
            <p>Category: ${suggestion.recommendedFormat ? 'Detected' : 'Unknown'}</p>
            <p><strong>Suggested Usage:</strong></p>
            <p>${suggestion.suggestedUsage || 'General purpose 3D model'}</p>
            <p><strong>Import Code:</strong></p>
            <pre>${suggestion.importCode || 'No code generated'}</pre>
            <p><strong>Setup Steps:</strong></p>
            <ul style="margin-left: 1.5rem;">
                ${(suggestion.setupSteps || []).map(s => `<li>${s}</li>`).join('')}
            </ul>
        `
    }
    
    async askAI() {
        const query = this.aiInput.value.trim()
        if (!query) return
        
        this.aiOutput.innerHTML = '<p style="color: #e94560;">Thinking...</p>'
        
        if (!this.assetAI.aiEnabled) {
            await this.assetAI.initAI()
        }
        
        if (this.assetAI.puterAI) {
            try {
                const context = this.currentAsset ? 
                    `Current asset: ${this.currentAsset.name}, Type: ${this.currentAsset.type || 'unknown'}` : 
                    'No asset loaded'
                
                const response = await this.assetAI.puterAI.chat(
                    `${context}\n\nUser question: ${query}`,
                    { system: 'You are a helpful 3D game asset assistant for GRUDGE Arena. Provide practical code examples and setup instructions when relevant.' }
                )
                
                this.aiOutput.innerHTML = `<p>${response.replace(/\n/g, '<br>')}</p>`
            } catch (error) {
                this.aiOutput.innerHTML = `<p style="color: #e94560;">AI error: ${error.message}</p>`
            }
        } else {
            this.aiOutput.innerHTML = '<p style="color: #888;">AI not available. Showing basic suggestions...</p>'
            const suggestion = await this.assetAI.suggestAssetImport(query)
            this.aiOutput.innerHTML = `<pre>${suggestion.importCode}</pre>`
        }
        
        this.aiInput.value = ''
    }
    
    onResize() {
        const width = this.container.clientWidth
        const height = this.container.clientHeight
        
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
    }
    
    animate() {
        requestAnimationFrame(() => this.animate())
        
        const delta = this.clock.getDelta()
        
        if (this.mixer) {
            this.mixer.update(delta)
        }
        
        this.controls.update()
        this.renderer.render(this.scene, this.camera)
    }
}

new AssetManager()
