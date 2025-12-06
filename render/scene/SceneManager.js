import * as THREE from 'three'

export class SceneManager {
  constructor(options = {}) {
    this.container = options.container || document.body
    this.width = options.width || window.innerWidth
    this.height = options.height || window.innerHeight
    this.antialias = options.antialias ?? true
    this.alpha = options.alpha ?? false
    this.shadowMap = options.shadowMap ?? true
    this.toneMapping = options.toneMapping ?? THREE.ACESFilmicToneMapping
    this.toneMappingExposure = options.toneMappingExposure ?? 1
    this.backgroundColor = options.backgroundColor ?? 0x000000
    this.pixelRatio = options.pixelRatio ?? Math.min(window.devicePixelRatio, 2)
    
    this.scene = null
    this.renderer = null
    this.camera = null
    this.layers = new Map()
    this.activeCamera = null
    
    this.init()
  }

  init() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.backgroundColor)
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.antialias,
      alpha: this.alpha,
      powerPreference: 'high-performance'
    })
    
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.toneMapping = this.toneMapping
    this.renderer.toneMappingExposure = this.toneMappingExposure
    
    if (this.shadowMap) {
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    }
    
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    
    this.container.appendChild(this.renderer.domElement)
    
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000
    )
    this.camera.position.set(0, 5, 10)
    this.activeCamera = this.camera
    
    window.addEventListener('resize', this.onResize.bind(this))
  }

  onResize() {
    this.width = this.container.clientWidth || window.innerWidth
    this.height = this.container.clientHeight || window.innerHeight
    
    this.renderer.setSize(this.width, this.height)
    
    if (this.activeCamera instanceof THREE.PerspectiveCamera) {
      this.activeCamera.aspect = this.width / this.height
      this.activeCamera.updateProjectionMatrix()
    }
  }

  setCamera(camera) {
    this.activeCamera = camera
    this.onResize()
    return this
  }

  getCamera() {
    return this.activeCamera
  }

  getScene() {
    return this.scene
  }

  getRenderer() {
    return this.renderer
  }

  getCanvas() {
    return this.renderer.domElement
  }

  add(object) {
    this.scene.add(object)
    return this
  }

  remove(object) {
    this.scene.remove(object)
    return this
  }

  setBackground(color) {
    if (typeof color === 'number' || typeof color === 'string') {
      this.scene.background = new THREE.Color(color)
    } else {
      this.scene.background = color
    }
    return this
  }

  setFog(color, near, far) {
    this.scene.fog = new THREE.Fog(color, near, far)
    return this
  }

  setExponentialFog(color, density) {
    this.scene.fog = new THREE.FogExp2(color, density)
    return this
  }

  addAmbientLight(color = 0xffffff, intensity = 0.5) {
    const light = new THREE.AmbientLight(color, intensity)
    this.scene.add(light)
    return light
  }

  addDirectionalLight(color = 0xffffff, intensity = 1, position = { x: 5, y: 10, z: 5 }) {
    const light = new THREE.DirectionalLight(color, intensity)
    light.position.set(position.x, position.y, position.z)
    
    if (this.shadowMap) {
      light.castShadow = true
      light.shadow.mapSize.width = 2048
      light.shadow.mapSize.height = 2048
      light.shadow.camera.near = 0.5
      light.shadow.camera.far = 50
      light.shadow.camera.left = -20
      light.shadow.camera.right = 20
      light.shadow.camera.top = 20
      light.shadow.camera.bottom = -20
    }
    
    this.scene.add(light)
    return light
  }

  addPointLight(color = 0xffffff, intensity = 1, distance = 0, position = { x: 0, y: 5, z: 0 }) {
    const light = new THREE.PointLight(color, intensity, distance)
    light.position.set(position.x, position.y, position.z)
    
    if (this.shadowMap) {
      light.castShadow = true
      light.shadow.mapSize.width = 1024
      light.shadow.mapSize.height = 1024
    }
    
    this.scene.add(light)
    return light
  }

  addSpotLight(color = 0xffffff, intensity = 1, distance = 0, angle = Math.PI / 6, position = { x: 0, y: 10, z: 0 }) {
    const light = new THREE.SpotLight(color, intensity, distance, angle)
    light.position.set(position.x, position.y, position.z)
    
    if (this.shadowMap) {
      light.castShadow = true
      light.shadow.mapSize.width = 1024
      light.shadow.mapSize.height = 1024
    }
    
    this.scene.add(light)
    return light
  }

  addHemisphereLight(skyColor = 0xffffbb, groundColor = 0x080820, intensity = 1) {
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity)
    this.scene.add(light)
    return light
  }

  render() {
    this.renderer.render(this.scene, this.activeCamera)
  }

  dispose() {
    window.removeEventListener('resize', this.onResize.bind(this))
    
    this.scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
    
    this.renderer.dispose()
    
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}
