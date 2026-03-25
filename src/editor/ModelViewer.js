/*
    GRUDGE Studio - ModelViewer Component
    Displays and inspects 3D models (GLTF/GLB) with controls
    Inspired by Google's model-viewer web component
*/

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export class ModelViewer {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container
        
        this.options = {
            autoRotate: options.autoRotate ?? true,
            cameraControls: options.cameraControls ?? true,
            backgroundColor: options.backgroundColor ?? 0x1a1a2e,
            environmentMap: options.environmentMap ?? null,
            onLoad: options.onLoad ?? null,
            onProgress: options.onProgress ?? null,
            onError: options.onError ?? null,
            ...options
        }
        
        this.scene = null
        this.camera = null
        this.renderer = null
        this.controls = null
        this.model = null
        this.mixer = null
        this.animations = []
        this.clock = new THREE.Clock()
        this.isPlaying = true
        
        this.init()
    }
    
    init() {
        const width = this.container.clientWidth || 400
        const height = this.container.clientHeight || 400
        
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(this.options.backgroundColor)
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
        this.camera.position.set(0, 1, 3)
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        })
        this.renderer.setSize(width, height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1
        this.container.appendChild(this.renderer.domElement)
        
        if (this.options.cameraControls) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableDamping = true
            this.controls.dampingFactor = 0.05
            this.controls.autoRotate = this.options.autoRotate
            this.controls.autoRotateSpeed = 2
        }
        
        this.setupLighting()
        this.setupLoaders()
        this.animate()
        
        window.addEventListener('resize', () => this.onResize())
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(5, 10, 7.5)
        this.scene.add(directionalLight)
        
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
        fillLight.position.set(-5, 0, -5)
        this.scene.add(fillLight)
        
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5)
        this.scene.add(hemisphereLight)
    }
    
    setupLoaders() {
        this.gltfLoader = new GLTFLoader()
        
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
        this.gltfLoader.setDRACOLoader(dracoLoader)
    }
    
    async loadModel(src) {
        if (this.model) {
            this.scene.remove(this.model)
            this.model = null
        }
        
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                src,
                (gltf) => {
                    this.model = gltf.scene
                    this.animations = gltf.animations || []
                    
                    const box = new THREE.Box3().setFromObject(this.model)
                    const size = box.getSize(new THREE.Vector3())
                    const center = box.getCenter(new THREE.Vector3())
                    
                    const maxDim = Math.max(size.x, size.y, size.z)
                    const scale = 2 / maxDim
                    this.model.scale.setScalar(scale)
                    
                    this.model.position.sub(center.multiplyScalar(scale))
                    
                    this.scene.add(this.model)
                    
                    if (this.animations.length > 0) {
                        this.mixer = new THREE.AnimationMixer(this.model)
                    }
                    
                    if (this.options.onLoad) {
                        this.options.onLoad({
                            model: this.model,
                            animations: this.animations,
                            boundingBox: box,
                            size: size
                        })
                    }
                    
                    resolve({
                        model: this.model,
                        animations: this.animations,
                        gltf: gltf
                    })
                },
                (progress) => {
                    if (this.options.onProgress) {
                        const percent = (progress.loaded / progress.total) * 100
                        this.options.onProgress(percent)
                    }
                },
                (error) => {
                    console.error('Error loading model:', error)
                    if (this.options.onError) {
                        this.options.onError(error)
                    }
                    reject(error)
                }
            )
        })
    }
    
    playAnimation(name, options = {}) {
        if (!this.mixer || this.animations.length === 0) return null
        
        const clip = name 
            ? THREE.AnimationClip.findByName(this.animations, name)
            : this.animations[0]
            
        if (!clip) return null
        
        const action = this.mixer.clipAction(clip)
        action.reset()
        
        if (options.loop !== undefined) {
            action.setLoop(options.loop ? THREE.LoopRepeat : THREE.LoopOnce)
        }
        if (options.clampWhenFinished) {
            action.clampWhenFinished = true
        }
        if (options.timeScale !== undefined) {
            action.timeScale = options.timeScale
        }
        
        action.play()
        return action
    }
    
    stopAnimation(name) {
        if (!this.mixer) return
        
        if (name) {
            const clip = THREE.AnimationClip.findByName(this.animations, name)
            if (clip) {
                this.mixer.clipAction(clip).stop()
            }
        } else {
            this.mixer.stopAllAction()
        }
    }
    
    getAnimationList() {
        return this.animations.map(clip => ({
            name: clip.name,
            duration: clip.duration,
            tracks: clip.tracks.length
        }))
    }
    
    getMaterials() {
        const materials = []
        if (!this.model) return materials
        
        this.model.traverse((node) => {
            if (node.isMesh && node.material) {
                const mats = Array.isArray(node.material) ? node.material : [node.material]
                mats.forEach(mat => {
                    if (!materials.find(m => m.uuid === mat.uuid)) {
                        materials.push({
                            uuid: mat.uuid,
                            name: mat.name || 'Unnamed',
                            type: mat.type,
                            color: mat.color?.getHexString() || null,
                            metalness: mat.metalness,
                            roughness: mat.roughness,
                            map: mat.map?.name || null
                        })
                    }
                })
            }
        })
        
        return materials
    }
    
    getMeshes() {
        const meshes = []
        if (!this.model) return meshes
        
        this.model.traverse((node) => {
            if (node.isMesh) {
                meshes.push({
                    uuid: node.uuid,
                    name: node.name || 'Unnamed',
                    vertices: node.geometry?.attributes?.position?.count || 0,
                    faces: node.geometry?.index ? node.geometry.index.count / 3 : 0
                })
            }
        })
        
        return meshes
    }
    
    setAutoRotate(enabled) {
        if (this.controls) {
            this.controls.autoRotate = enabled
        }
    }
    
    setBackgroundColor(color) {
        this.scene.background = new THREE.Color(color)
    }
    
    resetCamera() {
        this.camera.position.set(0, 1, 3)
        if (this.controls) {
            this.controls.reset()
        }
    }
    
    focusOnModel() {
        if (!this.model) return
        
        const box = new THREE.Box3().setFromObject(this.model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        
        const distance = maxDim * 2
        this.camera.position.set(center.x, center.y + distance * 0.3, center.z + distance)
        
        if (this.controls) {
            this.controls.target.copy(center)
            this.controls.update()
        }
    }
    
    takeScreenshot(width = 1920, height = 1080) {
        const originalWidth = this.renderer.domElement.width
        const originalHeight = this.renderer.domElement.height
        
        this.renderer.setSize(width, height)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.render(this.scene, this.camera)
        
        const dataURL = this.renderer.domElement.toDataURL('image/png')
        
        this.renderer.setSize(originalWidth, originalHeight)
        this.camera.aspect = originalWidth / originalHeight
        this.camera.updateProjectionMatrix()
        
        return dataURL
    }
    
    animate() {
        if (!this.isPlaying) return
        
        requestAnimationFrame(() => this.animate())
        
        const delta = this.clock.getDelta()
        
        if (this.mixer) {
            this.mixer.update(delta)
        }
        
        if (this.controls) {
            this.controls.update()
        }
        
        this.renderer.render(this.scene, this.camera)
    }
    
    onResize() {
        const width = this.container.clientWidth
        const height = this.container.clientHeight
        
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
    }
    
    dispose() {
        this.isPlaying = false
        
        if (this.mixer) {
            this.mixer.stopAllAction()
        }
        
        if (this.model) {
            this.model.traverse((node) => {
                if (node.isMesh) {
                    node.geometry?.dispose()
                    if (node.material) {
                        const materials = Array.isArray(node.material) ? node.material : [node.material]
                        materials.forEach(mat => mat.dispose())
                    }
                }
            })
        }
        
        if (this.controls) {
            this.controls.dispose()
        }
        
        this.renderer.dispose()
        this.container.removeChild(this.renderer.domElement)
    }
}

export function createModelViewerElement() {
    class GrudgeModelViewer extends HTMLElement {
        constructor() {
            super()
            this.viewer = null
        }
        
        connectedCallback() {
            const shadow = this.attachShadow({ mode: 'open' })
            
            const style = document.createElement('style')
            style.textContent = `
                :host {
                    display: block;
                    width: 100%;
                    height: 400px;
                }
                .viewer-container {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                .loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #fff;
                    font-family: sans-serif;
                }
            `
            shadow.appendChild(style)
            
            const container = document.createElement('div')
            container.className = 'viewer-container'
            shadow.appendChild(container)
            
            const src = this.getAttribute('src')
            const autoRotate = this.hasAttribute('auto-rotate')
            const cameraControls = this.hasAttribute('camera-controls')
            
            this.viewer = new ModelViewer(container, {
                autoRotate,
                cameraControls
            })
            
            if (src) {
                this.viewer.loadModel(src)
            }
        }
        
        disconnectedCallback() {
            if (this.viewer) {
                this.viewer.dispose()
            }
        }
        
        static get observedAttributes() {
            return ['src', 'auto-rotate', 'camera-controls']
        }
        
        attributeChangedCallback(name, oldValue, newValue) {
            if (!this.viewer) return
            
            if (name === 'src' && newValue) {
                this.viewer.loadModel(newValue)
            }
            if (name === 'auto-rotate') {
                this.viewer.setAutoRotate(this.hasAttribute('auto-rotate'))
            }
        }
    }
    
    if (!customElements.get('grudge-model-viewer')) {
        customElements.define('grudge-model-viewer', GrudgeModelViewer)
    }
    
    return GrudgeModelViewer
}

export default ModelViewer
