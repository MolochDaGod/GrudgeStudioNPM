import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { STLLoader } from 'three/addons/loaders/STLLoader.js'

class ModelViewer {
  constructor() {
    this.container = document.getElementById('viewer')
    this.dropzone = document.getElementById('dropzone')
    this.fileInput = document.getElementById('file-input')
    this.modelList = document.getElementById('model-list')
    this.animationList = document.getElementById('animation-list')
    this.infoPanel = document.getElementById('info-panel')
    this.animationPanel = document.getElementById('animation-panel')
    this.animationSelect = document.getElementById('animation-select')
    
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.mixer = null
    this.clock = new THREE.Clock()
    this.currentModel = null
    this.animations = []
    this.currentAction = null
    this.gridHelper = null
    this.wireframeMode = false
    this.showGrid = true
    
    this.skeletonHelper = null
    this.showSkeleton = false
    this.animationSpeed = 1.0
    this.isPlaying = true
    this.boneCount = 0
    
    this.init()
    this.setupEventListeners()
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
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.container.appendChild(this.renderer.domElement)
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.target.set(0, 1, 0)
    
    const ambientLight = new THREE.AmbientLight(0x404040, 2)
    this.scene.add(ambientLight)
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 3)
    mainLight.position.set(10, 20, 10)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    this.scene.add(mainLight)
    
    const fillLight = new THREE.DirectionalLight(0x8888ff, 1)
    fillLight.position.set(-10, 10, -10)
    this.scene.add(fillLight)
    
    this.gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    this.scene.add(this.gridHelper)
    
    const groundGeometry = new THREE.PlaneGeometry(50, 50)
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)
    
    window.addEventListener('resize', () => this.onResize())
  }
  
  setupEventListeners() {
    document.getElementById('open-btn').addEventListener('click', () => {
      this.fileInput.click()
    })
    
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.loadFiles(e.target.files)
      }
    })
    
    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault()
      this.dropzone.classList.add('dragover')
    })
    
    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('dragover')
    })
    
    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault()
      this.dropzone.classList.remove('dragover')
      if (e.dataTransfer.files.length > 0) {
        this.loadFiles(e.dataTransfer.files)
      }
    })
    
    this.modelList.querySelectorAll('.model-item').forEach(item => {
      item.addEventListener('click', () => {
        const modelPath = item.dataset.model
        if (modelPath) {
          this.loadModelFromUrl(modelPath)
        }
      })
    })
    
    document.getElementById('btn-reset').addEventListener('click', () => {
      this.resetView()
    })
    
    document.getElementById('btn-wireframe').addEventListener('click', () => {
      this.toggleWireframe()
    })
    
    document.getElementById('btn-grid').addEventListener('click', () => {
      this.toggleGrid()
    })
    
    document.getElementById('btn-skeleton').addEventListener('click', () => {
      this.toggleSkeleton()
    })
    
    document.getElementById('btn-info').addEventListener('click', () => {
      this.infoPanel.classList.toggle('visible')
    })
    
    this.animationSelect.addEventListener('change', (e) => {
      const clipName = e.target.value
      if (clipName) {
        this.playAnimation(clipName)
      }
    })
    
    document.getElementById('btn-play-pause').addEventListener('click', () => {
      this.togglePlayPause()
    })
    
    document.getElementById('btn-speed-down').addEventListener('click', () => {
      this.adjustSpeed(-0.25)
    })
    
    document.getElementById('btn-speed-up').addEventListener('click', () => {
      this.adjustSpeed(0.25)
    })
    
    document.getElementById('animation-timeline').addEventListener('input', (e) => {
      this.seekAnimation(parseFloat(e.target.value))
    })
  }
  
  loadFiles(files) {
    const file = files[0]
    const reader = new FileReader()
    const extension = file.name.split('.').pop().toLowerCase()
    
    reader.onload = (e) => {
      const arrayBuffer = e.target.result
      this.loadModelFromBuffer(arrayBuffer, extension, file.name)
    }
    
    reader.readAsArrayBuffer(file)
  }
  
  loadModelFromBuffer(buffer, extension, filename) {
    this.clearCurrentModel()
    
    switch (extension) {
      case 'glb':
      case 'gltf':
        this.loadGLTF(buffer, filename)
        break
      case 'obj':
        this.loadOBJ(buffer, filename)
        break
      case 'fbx':
        this.loadFBX(buffer, filename)
        break
      case 'stl':
        this.loadSTL(buffer, filename)
        break
      default:
        console.warn('Unsupported format:', extension)
    }
  }
  
  loadModelFromUrl(url) {
    this.clearCurrentModel()
    const extension = url.split('.').pop().toLowerCase()
    
    switch (extension) {
      case 'glb':
      case 'gltf':
        const loader = new GLTFLoader()
        loader.load(url, (gltf) => {
          this.onModelLoaded(gltf.scene, gltf.animations, url)
        }, undefined, (error) => {
          console.error('Error loading model:', error)
        })
        break
      case 'obj':
        const objLoader = new OBJLoader()
        objLoader.load(url, (obj) => {
          this.onModelLoaded(obj, [], url)
        })
        break
      default:
        console.warn('Unsupported URL format:', extension)
    }
  }
  
  loadGLTF(buffer, filename) {
    const loader = new GLTFLoader()
    loader.parse(buffer, '', (gltf) => {
      this.onModelLoaded(gltf.scene, gltf.animations, filename)
    }, (error) => {
      console.error('Error parsing GLTF:', error)
    })
  }
  
  loadOBJ(buffer, filename) {
    const loader = new OBJLoader()
    const text = new TextDecoder().decode(buffer)
    const obj = loader.parse(text)
    this.onModelLoaded(obj, [], filename)
  }
  
  loadFBX(buffer, filename) {
    const loader = new FBXLoader()
    try {
      const fbx = loader.parse(buffer)
      this.onModelLoaded(fbx, fbx.animations || [], filename)
    } catch (error) {
      console.error('Error parsing FBX:', error)
    }
  }
  
  loadSTL(buffer, filename) {
    const loader = new STLLoader()
    const geometry = loader.parse(buffer)
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      metalness: 0.3,
      roughness: 0.7
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    this.onModelLoaded(mesh, [], filename)
  }
  
  onModelLoaded(model, animations, name) {
    this.currentModel = model
    this.animations = animations
    this.boneCount = 0
    
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
      if (child.isBone) {
        this.boneCount++
      }
    })
    
    this.scene.add(model)
    
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    model.position.x -= center.x
    model.position.z -= center.z
    model.position.y -= box.min.y
    
    const maxDim = Math.max(size.x, size.y, size.z)
    const cameraDistance = maxDim * 2
    this.camera.position.set(cameraDistance, cameraDistance * 0.6, cameraDistance)
    this.controls.target.set(0, size.y / 2, 0)
    this.controls.update()
    
    this.createSkeletonHelper(model)
    
    if (animations && animations.length > 0) {
      this.mixer = new THREE.AnimationMixer(model)
      this.setupAnimations(animations)
    }
    
    this.updateModelInfo(model, animations)
    
    this.dropzone.classList.add('hidden')
    this.infoPanel.classList.add('visible')
  }
  
  createSkeletonHelper(model) {
    if (this.skeletonHelper) {
      this.scene.remove(this.skeletonHelper)
      this.skeletonHelper = null
    }
    
    let skeleton = null
    model.traverse((child) => {
      if (child.isSkinnedMesh && child.skeleton) {
        skeleton = child
      }
    })
    
    if (skeleton) {
      this.skeletonHelper = new THREE.SkeletonHelper(model)
      this.skeletonHelper.visible = this.showSkeleton
      this.scene.add(this.skeletonHelper)
      console.log('Skeleton helper created with', this.boneCount, 'bones')
    }
  }
  
  toggleSkeleton() {
    this.showSkeleton = !this.showSkeleton
    if (this.skeletonHelper) {
      this.skeletonHelper.visible = this.showSkeleton
    }
    
    const btn = document.getElementById('btn-skeleton')
    btn.classList.toggle('active', this.showSkeleton)
    btn.title = this.showSkeleton ? 'Hide Skeleton' : 'Show Skeleton'
  }
  
  togglePlayPause() {
    this.isPlaying = !this.isPlaying
    if (this.currentAction) {
      this.currentAction.paused = !this.isPlaying
    }
    
    const btn = document.getElementById('btn-play-pause')
    btn.textContent = this.isPlaying ? '⏸️' : '▶️'
  }
  
  adjustSpeed(delta) {
    this.animationSpeed = Math.max(0.25, Math.min(2.0, this.animationSpeed + delta))
    if (this.currentAction) {
      this.currentAction.timeScale = this.animationSpeed
    }
    
    document.getElementById('speed-display').textContent = `${this.animationSpeed.toFixed(2)}x`
  }
  
  seekAnimation(value) {
    if (!this.currentAction || !this.mixer) return
    
    const clip = this.currentAction.getClip()
    const time = (value / 100) * clip.duration
    this.currentAction.time = time
    this.mixer.setTime(time)
  }
  
  setupAnimations(animations) {
    this.animationSelect.innerHTML = '<option value="">Select Animation</option>'
    this.animationList.innerHTML = ''
    
    animations.forEach((clip, index) => {
      const option = document.createElement('option')
      option.value = clip.name
      option.textContent = clip.name || `Animation ${index + 1}`
      this.animationSelect.appendChild(option)
      
      const item = document.createElement('div')
      item.className = 'model-item'
      item.innerHTML = `
        <div class="model-icon">🎬</div>
        <div class="model-info">
          <div class="model-name">${clip.name || `Animation ${index + 1}`}</div>
          <div class="model-meta">${clip.duration.toFixed(2)}s • ${clip.tracks.length} tracks</div>
        </div>
      `
      item.addEventListener('click', () => this.playAnimation(clip.name))
      this.animationList.appendChild(item)
    })
    
    this.animationPanel.classList.add('visible')
    
    if (animations.length > 0) {
      this.playAnimation(animations[0].name)
    }
  }
  
  playAnimation(clipName) {
    if (!this.mixer) return
    
    const clip = this.animations.find(c => c.name === clipName)
    if (!clip) return
    
    if (this.currentAction) {
      this.currentAction.fadeOut(0.3)
    }
    
    this.currentAction = this.mixer.clipAction(clip)
    this.currentAction.reset()
    this.currentAction.fadeIn(0.3)
    this.currentAction.timeScale = this.animationSpeed
    this.currentAction.paused = !this.isPlaying
    this.currentAction.play()
    
    this.animationSelect.value = clipName
    
    document.getElementById('current-animation').textContent = clipName || 'Animation'
    document.getElementById('animation-duration').textContent = `${clip.duration.toFixed(2)}s`
  }
  
  updateModelInfo(model, animations) {
    let meshCount = 0
    let vertexCount = 0
    let triangleCount = 0
    let skinnedMeshCount = 0
    
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
      }
    })
    
    document.getElementById('mesh-count').textContent = meshCount
    document.getElementById('vertex-count').textContent = vertexCount.toLocaleString()
    document.getElementById('triangle-count').textContent = Math.floor(triangleCount).toLocaleString()
    document.getElementById('animation-count').textContent = animations ? animations.length : 0
    document.getElementById('bone-count').textContent = this.boneCount
    document.getElementById('skinned-mesh-count').textContent = skinnedMeshCount
  }
  
  clearCurrentModel() {
    if (this.skeletonHelper) {
      this.scene.remove(this.skeletonHelper)
      this.skeletonHelper = null
    }
    
    if (this.currentModel) {
      this.scene.remove(this.currentModel)
      this.currentModel.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      this.currentModel = null
    }
    
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer = null
    }
    
    this.animations = []
    this.currentAction = null
    this.boneCount = 0
    this.animationPanel.classList.remove('visible')
    this.animationList.innerHTML = ''
  }
  
  resetView() {
    if (this.currentModel) {
      const box = new THREE.Box3().setFromObject(this.currentModel)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const cameraDistance = maxDim * 2
      
      this.camera.position.set(cameraDistance, cameraDistance * 0.6, cameraDistance)
      this.controls.target.set(0, size.y / 2, 0)
    } else {
      this.camera.position.set(5, 3, 5)
      this.controls.target.set(0, 1, 0)
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
    
    const btn = document.getElementById('btn-wireframe')
    btn.classList.toggle('active', this.wireframeMode)
  }
  
  toggleGrid() {
    this.showGrid = !this.showGrid
    this.gridHelper.visible = this.showGrid
    
    const btn = document.getElementById('btn-grid')
    btn.classList.toggle('active', !this.showGrid)
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
    
    if (this.mixer && this.isPlaying) {
      this.mixer.update(delta)
      
      if (this.currentAction) {
        const clip = this.currentAction.getClip()
        const progress = (this.currentAction.time / clip.duration) * 100
        document.getElementById('animation-timeline').value = progress
        document.getElementById('animation-time').textContent = 
          `${this.currentAction.time.toFixed(2)}s / ${clip.duration.toFixed(2)}s`
      }
    }
    
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}

new ModelViewer()
