/**
 * Comprehensive Three.js Examples Integration
 * Collection of interactive tools based on Stemkoski's Three.js examples
 */

import * as THREE from 'three'
import { ShaderAnimationSystem, TextureAnimationSystem, MaterialSystem, SkyboxSystem } from './ShaderTools.js'
import { AdvancedMouseSystem, GamepadSystem, UnifiedInputManager } from './InputTools.js'
import { OrbitCameraController, FirstPersonCameraController, CinematicCameraSystem } from './CameraTools.js'
import { PhysicsWorld, PhysicsBody, SphereShape, BoxShape } from './PhysicsTools.js'

// Interactive Particle Systems
export class InteractiveParticleSystem {
    constructor(scene, options = {}) {
        this.scene = scene
        this.particles = []
        this.particleCount = options.count || 1000
        
        // Particle properties
        this.particleGeometry = new THREE.BufferGeometry()
        this.particlePositions = new Float32Array(this.particleCount * 3)
        this.particleVelocities = new Float32Array(this.particleCount * 3)
        this.particleColors = new Float32Array(this.particleCount * 3)
        this.particleSizes = new Float32Array(this.particleCount)
        
        // Interactive forces
        this.mousePosition = new THREE.Vector3()
        this.attractors = []
        this.repulsors = []
        
        this.initializeParticles()
        this.createParticleSystem()
    }
    
    initializeParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3
            
            // Random positions
            this.particlePositions[i3] = (Math.random() - 0.5) * 200
            this.particlePositions[i3 + 1] = (Math.random() - 0.5) * 200
            this.particlePositions[i3 + 2] = (Math.random() - 0.5) * 200
            
            // Random velocities
            this.particleVelocities[i3] = (Math.random() - 0.5) * 2
            this.particleVelocities[i3 + 1] = (Math.random() - 0.5) * 2
            this.particleVelocities[i3 + 2] = (Math.random() - 0.5) * 2
            
            // Random colors
            this.particleColors[i3] = Math.random()
            this.particleColors[i3 + 1] = Math.random()
            this.particleColors[i3 + 2] = Math.random()
            
            // Random sizes
            this.particleSizes[i] = Math.random() * 5 + 1
        }
    }
    
    createParticleSystem() {
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3))
        this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3))
        this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(this.particleSizes, 1))
        
        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distance = length(gl_PointCoord - vec2(0.5));
                    if (distance > 0.5) discard;
                    
                    float alpha = 1.0 - (distance * 2.0);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })
        
        this.particleSystem = new THREE.Points(this.particleGeometry, particleMaterial)
        this.scene.add(this.particleSystem)
    }
    
    update(deltaTime, mousePosition) {
        if (mousePosition) {
            this.mousePosition.copy(mousePosition)
        }
        
        const time = Date.now() * 0.001
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3
            
            const px = this.particlePositions[i3]
            const py = this.particlePositions[i3 + 1]
            const pz = this.particlePositions[i3 + 2]
            
            let vx = this.particleVelocities[i3]
            let vy = this.particleVelocities[i3 + 1]
            let vz = this.particleVelocities[i3 + 2]
            
            // Mouse attraction/repulsion
            const dx = this.mousePosition.x - px
            const dy = this.mousePosition.y - py
            const dz = this.mousePosition.z - pz
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
            
            if (distance > 0) {
                const force = 100 / (distance * distance + 1)
                vx += (dx / distance) * force * deltaTime
                vy += (dy / distance) * force * deltaTime
                vz += (dz / distance) * force * deltaTime
            }
            
            // Apply forces from attractors
            this.attractors.forEach(attractor => {
                const adx = attractor.position.x - px
                const ady = attractor.position.y - py
                const adz = attractor.position.z - pz
                const aDistance = Math.sqrt(adx * adx + ady * ady + adz * adz)
                
                if (aDistance > 0) {
                    const aForce = attractor.strength / (aDistance * aDistance + 1)
                    vx += (adx / aDistance) * aForce * deltaTime
                    vy += (ady / aDistance) * aForce * deltaTime
                    vz += (adz / aDistance) * aForce * deltaTime
                }
            })
            
            // Damping
            vx *= 0.98
            vy *= 0.98
            vz *= 0.98
            
            // Update positions
            this.particlePositions[i3] += vx * deltaTime
            this.particlePositions[i3 + 1] += vy * deltaTime
            this.particlePositions[i3 + 2] += vz * deltaTime
            
            // Update velocities
            this.particleVelocities[i3] = vx
            this.particleVelocities[i3 + 1] = vy
            this.particleVelocities[i3 + 2] = vz
            
            // Boundary checks
            if (Math.abs(this.particlePositions[i3]) > 100) {
                this.particleVelocities[i3] *= -0.5
            }
            if (Math.abs(this.particlePositions[i3 + 1]) > 100) {
                this.particleVelocities[i3 + 1] *= -0.5
            }
            if (Math.abs(this.particlePositions[i3 + 2]) > 100) {
                this.particleVelocities[i3 + 2] *= -0.5
            }
        }
        
        this.particleGeometry.attributes.position.needsUpdate = true
        this.particleSystem.material.uniforms.time.value = time
    }
    
    addAttractor(position, strength = 50) {
        this.attractors.push({ position: position.clone(), strength })
    }
    
    removeAttractor(index) {
        this.attractors.splice(index, 1)
    }
}

// Advanced Lighting System
export class AdvancedLightingSystem {
    constructor(scene, options = {}) {
        this.scene = scene
        this.lights = new Map()
        this.shadows = options.shadows !== false
        
        // Dynamic lighting
        this.timeOfDay = 0.5 // 0 = midnight, 0.5 = noon, 1 = midnight
        this.dynamicLighting = options.dynamicLighting || false
        
        this.setupBasicLights()
        if (this.shadows) this.setupShadows()
    }
    
    setupBasicLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
        this.scene.add(ambientLight)
        this.lights.set('ambient', ambientLight)
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(50, 100, 50)
        directionalLight.target.position.set(0, 0, 0)
        this.scene.add(directionalLight)
        this.scene.add(directionalLight.target)
        this.lights.set('sun', directionalLight)
        
        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(0x8888ff, 0.2)
        fillLight1.position.set(-50, 50, -50)
        this.scene.add(fillLight1)
        this.lights.set('fill1', fillLight1)
        
        const fillLight2 = new THREE.DirectionalLight(0xff8888, 0.15)
        fillLight2.position.set(50, 20, -50)
        this.scene.add(fillLight2)
        this.lights.set('fill2', fillLight2)
    }
    
    setupShadows() {
        const sunLight = this.lights.get('sun')
        if (sunLight) {
            sunLight.castShadow = true
            sunLight.shadow.mapSize.width = 2048
            sunLight.shadow.mapSize.height = 2048
            sunLight.shadow.camera.near = 0.5
            sunLight.shadow.camera.far = 500
            sunLight.shadow.camera.left = -100
            sunLight.shadow.camera.right = 100
            sunLight.shadow.camera.top = 100
            sunLight.shadow.camera.bottom = -100
            sunLight.shadow.bias = -0.0001
        }
    }
    
    // Dynamic point lights for effects
    createPointLight(position, color = 0xffffff, intensity = 1, distance = 50) {
        const light = new THREE.PointLight(color, intensity, distance)
        light.position.copy(position)
        
        if (this.shadows) {
            light.castShadow = true
            light.shadow.mapSize.width = 1024
            light.shadow.mapSize.height = 1024
        }
        
        this.scene.add(light)
        
        const id = Math.random().toString(36).substr(2, 9)
        this.lights.set(id, light)
        
        return { id, light }
    }
    
    // Spotlight for dramatic effects
    createSpotlight(position, target, color = 0xffffff, intensity = 1, distance = 50, angle = Math.PI / 4) {
        const light = new THREE.SpotLight(color, intensity, distance, angle)
        light.position.copy(position)
        light.target.position.copy(target)
        
        if (this.shadows) {
            light.castShadow = true
            light.shadow.mapSize.width = 1024
            light.shadow.mapSize.height = 1024
        }
        
        this.scene.add(light)
        this.scene.add(light.target)
        
        const id = Math.random().toString(36).substr(2, 9)
        this.lights.set(id, light)
        
        return { id, light }
    }
    
    // Animated lighting effects
    createFireLight(position) {
        const { id, light } = this.createPointLight(position, 0xff4400, 2, 20)
        
        // Add flickering animation
        const originalIntensity = light.intensity
        const animate = () => {
            light.intensity = originalIntensity + Math.sin(Date.now() * 0.01) * 0.5 + Math.random() * 0.3
            light.color.setHSL(0.05 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.2)
        }
        
        return { id, light, animate }
    }
    
    // Update time-based lighting
    update(deltaTime) {
        if (this.dynamicLighting) {
            this.updateTimeOfDay(deltaTime)
        }
        
        // Update any animated lights
        this.lights.forEach((light, id) => {
            if (light.animate) {
                light.animate()
            }
        })
    }
    
    updateTimeOfDay(deltaTime) {
        // Slowly cycle through day/night
        this.timeOfDay += deltaTime * 0.01 // Adjust speed as needed
        if (this.timeOfDay > 1) this.timeOfDay = 0
        
        const sunLight = this.lights.get('sun')
        const ambientLight = this.lights.get('ambient')
        
        if (sunLight && ambientLight) {
            // Calculate sun position
            const sunAngle = this.timeOfDay * Math.PI * 2
            sunLight.position.set(
                Math.sin(sunAngle) * 100,
                Math.cos(sunAngle) * 100,
                50
            )
            
            // Adjust light intensity based on time
            const dayIntensity = Math.max(0, Math.cos(sunAngle))
            sunLight.intensity = dayIntensity * 0.8
            ambientLight.intensity = 0.2 + dayIntensity * 0.3
            
            // Adjust light color
            if (dayIntensity > 0.8) {
                // Bright day
                sunLight.color.setHex(0xffffff)
            } else if (dayIntensity > 0.3) {
                // Golden hour
                sunLight.color.setHex(0xffaa44)
            } else if (dayIntensity > 0) {
                // Sunset/sunrise
                sunLight.color.setHex(0xff6644)
            } else {
                // Night - moon light
                sunLight.color.setHex(0x4444ff)
                sunLight.intensity = 0.1
            }
        }
    }
    
    removeLight(id) {
        const light = this.lights.get(id)
        if (light) {
            this.scene.remove(light)
            if (light.target) this.scene.remove(light.target)
            this.lights.delete(id)
        }
    }
}

// Procedural Terrain System
export class ProceduralTerrain {
    constructor(options = {}) {
        this.size = options.size || 200
        this.segments = options.segments || 64
        this.heightScale = options.heightScale || 20
        this.noiseScale = options.noiseScale || 0.1
        
        // Terrain properties
        this.heightMap = []
        this.geometry = null
        this.material = null
        this.mesh = null
        
        // Biome system
        this.biomes = new Map()
        this.setupDefaultBiomes()
        
        this.generate()
    }
    
    setupDefaultBiomes() {
        this.biomes.set('water', {
            color: new THREE.Color(0x006994),
            heightRange: { min: -1, max: 0.1 }
        })
        
        this.biomes.set('beach', {
            color: new THREE.Color(0xc2b280),
            heightRange: { min: 0.1, max: 0.2 }
        })
        
        this.biomes.set('grass', {
            color: new THREE.Color(0x228b22),
            heightRange: { min: 0.2, max: 0.6 }
        })
        
        this.biomes.set('forest', {
            color: new THREE.Color(0x006400),
            heightRange: { min: 0.6, max: 0.8 }
        })
        
        this.biomes.set('mountain', {
            color: new THREE.Color(0x8b7355),
            heightRange: { min: 0.8, max: 0.9 }
        })
        
        this.biomes.set('snow', {
            color: new THREE.Color(0xf0f8ff),
            heightRange: { min: 0.9, max: 1.0 }
        })
    }
    
    generate() {
        this.generateHeightMap()
        this.createGeometry()
        this.createMaterial()
        this.createMesh()
    }
    
    generateHeightMap() {
        this.heightMap = []
        
        for (let y = 0; y <= this.segments; y++) {
            const row = []
            
            for (let x = 0; x <= this.segments; x++) {
                // Multi-octave Perlin-like noise
                let height = 0
                let amplitude = 1
                let frequency = this.noiseScale
                
                for (let octave = 0; octave < 4; octave++) {
                    height += this.noise(x * frequency, y * frequency) * amplitude
                    amplitude *= 0.5
                    frequency *= 2
                }
                
                // Normalize and apply height scale
                height = (height + 1) * 0.5 * this.heightScale
                row.push(height)
            }
            
            this.heightMap.push(row)
        }
    }
    
    // Simple noise function (you might want to use a proper Perlin noise library)
    noise(x, y) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
        return (n - Math.floor(n)) * 2 - 1
    }
    
    createGeometry() {
        this.geometry = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments)
        this.geometry.rotateX(-Math.PI / 2)
        
        const vertices = this.geometry.attributes.position.array
        const colors = new Float32Array(vertices.length)
        
        for (let i = 0, j = 0; i < vertices.length; i += 3, j++) {
            const x = Math.floor(j % (this.segments + 1))
            const y = Math.floor(j / (this.segments + 1))
            
            const height = this.heightMap[y][x]
            vertices[i + 1] = height // Y coordinate
            
            // Determine biome and set vertex color
            const normalizedHeight = height / this.heightScale
            const biome = this.getBiomeForHeight(normalizedHeight)
            
            colors[i] = biome.color.r
            colors[i + 1] = biome.color.g
            colors[i + 2] = biome.color.b
        }
        
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        this.geometry.computeVertexNormals()
    }
    
    getBiomeForHeight(normalizedHeight) {
        for (const [name, biome] of this.biomes) {
            if (normalizedHeight >= biome.heightRange.min && normalizedHeight < biome.heightRange.max) {
                return biome
            }
        }
        
        return this.biomes.get('grass') // Default fallback
    }
    
    createMaterial() {
        this.material = new THREE.MeshLambertMaterial({
            vertexColors: true,
            side: THREE.DoubleSide
        })
    }
    
    createMesh() {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.receiveShadow = true
    }
    
    getHeightAt(worldX, worldZ) {
        // Convert world coordinates to terrain coordinates
        const terrainX = ((worldX / this.size) + 0.5) * this.segments
        const terrainZ = ((worldZ / this.size) + 0.5) * this.segments
        
        // Clamp to terrain bounds
        const x = Math.max(0, Math.min(this.segments, terrainX))
        const z = Math.max(0, Math.min(this.segments, terrainZ))
        
        // Bilinear interpolation
        const x1 = Math.floor(x)
        const z1 = Math.floor(z)
        const x2 = Math.min(this.segments, x1 + 1)
        const z2 = Math.min(this.segments, z1 + 1)
        
        const fx = x - x1
        const fz = z - z1
        
        const h11 = this.heightMap[z1][x1]
        const h12 = this.heightMap[z1][x2]
        const h21 = this.heightMap[z2][x1]
        const h22 = this.heightMap[z2][x2]
        
        const h1 = h11 * (1 - fx) + h12 * fx
        const h2 = h21 * (1 - fx) + h22 * fx
        
        return h1 * (1 - fz) + h2 * fz
    }
}

// Interactive Object System
export class InteractiveObjectSystem {
    constructor(scene, camera, options = {}) {
        this.scene = scene
        this.camera = camera
        this.objects = new Map()
        this.hoverObjects = new Set()
        
        // Raycasting for interaction
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        
        // Interaction states
        this.hoveredObject = null
        this.selectedObject = null
        this.draggedObject = null
        
        // Interaction callbacks
        this.callbacks = {
            hover: new Map(),
            click: new Map(),
            drag: new Map()
        }
    }
    
    addInteractiveObject(mesh, options = {}) {
        const id = options.id || mesh.uuid
        
        this.objects.set(id, {
            mesh,
            hoverable: options.hoverable !== false,
            clickable: options.clickable !== false,
            draggable: options.draggable || false,
            data: options.data || {}
        })
        
        return id
    }
    
    removeInteractiveObject(id) {
        this.objects.delete(id)
        this.callbacks.hover.delete(id)
        this.callbacks.click.delete(id)
        this.callbacks.drag.delete(id)
    }
    
    onHover(id, callback) {
        this.callbacks.hover.set(id, callback)
    }
    
    onClick(id, callback) {
        this.callbacks.click.set(id, callback)
    }
    
    onDrag(id, callback) {
        this.callbacks.drag.set(id, callback)
    }
    
    handleMouseMove(event) {
        const rect = event.target.getBoundingClientRect()
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        
        this.updateRaycasting()
    }
    
    handleMouseDown(event) {
        if (this.hoveredObject) {
            this.selectedObject = this.hoveredObject
            
            const obj = this.objects.get(this.hoveredObject)
            if (obj && obj.clickable) {
                const callback = this.callbacks.click.get(this.hoveredObject)
                if (callback) {
                    callback(obj.mesh, obj.data)
                }
            }
            
            if (obj && obj.draggable) {
                this.draggedObject = this.hoveredObject
            }
        }
    }
    
    handleMouseUp(event) {
        this.selectedObject = null
        this.draggedObject = null
    }
    
    updateRaycasting() {
        this.raycaster.setFromCamera(this.mouse, this.camera)
        
        const meshes = Array.from(this.objects.values()).map(obj => obj.mesh)
        const intersects = this.raycaster.intersectObjects(meshes)
        
        // Clear previous hover
        if (this.hoveredObject) {
            const prevObj = this.objects.get(this.hoveredObject)
            if (prevObj && prevObj.mesh.material.emissive) {
                prevObj.mesh.material.emissive.setHex(0x000000)
            }
        }
        
        this.hoveredObject = null
        
        if (intersects.length > 0) {
            const intersectedMesh = intersects[0].object
            
            // Find the corresponding object
            for (const [id, obj] of this.objects) {
                if (obj.mesh === intersectedMesh && obj.hoverable) {
                    this.hoveredObject = id
                    
                    // Visual feedback
                    if (obj.mesh.material.emissive) {
                        obj.mesh.material.emissive.setHex(0x333333)
                    }
                    
                    // Trigger hover callback
                    const callback = this.callbacks.hover.get(id)
                    if (callback) {
                        callback(obj.mesh, intersects[0].point, obj.data)
                    }
                    
                    break
                }
            }
        }
        
        // Handle dragging
        if (this.draggedObject && intersects.length > 0) {
            const obj = this.objects.get(this.draggedObject)
            if (obj) {
                const callback = this.callbacks.drag.get(this.draggedObject)
                if (callback) {
                    callback(obj.mesh, intersects[0].point, obj.data)
                } else {
                    // Default drag behavior
                    obj.mesh.position.copy(intersects[0].point)
                }
            }
        }
    }
}

// Audio System Integration
export class SpatialAudioSystem {
    constructor(camera, options = {}) {
        this.camera = camera
        this.listener = new THREE.AudioListener()
        this.camera.add(this.listener)
        
        this.sounds = new Map()
        this.audioLoader = new THREE.AudioLoader()
        
        // Master volume
        this.masterVolume = options.masterVolume || 1.0
    }
    
    loadSound(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                url,
                (buffer) => {
                    const sound = options.positional ? 
                        new THREE.PositionalAudio(this.listener) :
                        new THREE.Audio(this.listener)
                    
                    sound.setBuffer(buffer)
                    sound.setLoop(options.loop || false)
                    sound.setVolume(options.volume || 1.0)
                    
                    if (options.positional) {
                        sound.setRefDistance(options.refDistance || 20)
                        sound.setRolloffFactor(options.rolloffFactor || 1)
                        sound.setDistanceModel(options.distanceModel || 'inverse')
                        sound.setMaxDistance(options.maxDistance || 10000)
                    }
                    
                    const id = options.id || Math.random().toString(36).substr(2, 9)
                    this.sounds.set(id, sound)
                    
                    resolve({ id, sound })
                },
                undefined,
                reject
            )
        })
    }
    
    playSound(id, position) {
        const sound = this.sounds.get(id)
        if (!sound) return
        
        if (sound.isPlaying) {
            sound.stop()
        }
        
        if (position && sound.panner) {
            // Update position for positional audio
            sound.position.copy(position)
        }
        
        sound.play()
    }
    
    stopSound(id) {
        const sound = this.sounds.get(id)
        if (sound && sound.isPlaying) {
            sound.stop()
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume))
        this.listener.setMasterVolume(this.masterVolume)
    }
    
    // Environmental audio zones
    createAudioZone(position, radius, soundId, options = {}) {
        return {
            position: position.clone(),
            radius,
            soundId,
            isActive: false,
            fadeDistance: options.fadeDistance || radius * 0.5,
            volume: options.volume || 1.0
        }
    }
    
    updateAudioZones(zones, listenerPosition) {
        zones.forEach(zone => {
            const distance = zone.position.distanceTo(listenerPosition)
            const sound = this.sounds.get(zone.soundId)
            
            if (!sound) return
            
            if (distance < zone.radius) {
                if (!zone.isActive) {
                    zone.isActive = true
                    sound.play()
                }
                
                // Fade in/out based on distance
                const fadeRatio = Math.max(0, 1 - (distance / zone.fadeDistance))
                sound.setVolume(zone.volume * fadeRatio)
            } else {
                if (zone.isActive) {
                    zone.isActive = false
                    sound.stop()
                }
            }
        })
    }
}

// Performance Monitor
export class PerformanceMonitor {
    constructor(renderer, options = {}) {
        this.renderer = renderer
        this.showStats = options.showStats !== false
        
        // Performance metrics
        this.stats = {
            fps: 0,
            frameTime: 0,
            memory: 0,
            drawCalls: 0,
            triangles: 0
        }
        
        // FPS calculation
        this.frames = []
        this.lastTime = performance.now()
        
        // Memory monitoring
        this.memoryMonitoring = 'memory' in performance
        
        this.createStatsDisplay()
    }
    
    createStatsDisplay() {
        if (!this.showStats) return
        
        this.statsElement = document.createElement('div')
        this.statsElement.style.position = 'absolute'
        this.statsElement.style.top = '10px'
        this.statsElement.style.left = '10px'
        this.statsElement.style.color = 'white'
        this.statsElement.style.fontFamily = 'monospace'
        this.statsElement.style.fontSize = '12px'
        this.statsElement.style.background = 'rgba(0,0,0,0.7)'
        this.statsElement.style.padding = '10px'
        this.statsElement.style.borderRadius = '5px'
        this.statsElement.style.zIndex = '1000'
        
        document.body.appendChild(this.statsElement)
    }
    
    update() {
        const currentTime = performance.now()
        const frameTime = currentTime - this.lastTime
        
        // Update FPS
        this.frames.push(frameTime)
        if (this.frames.length > 60) {
            this.frames.shift()
        }
        
        const avgFrameTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length
        this.stats.fps = Math.round(1000 / avgFrameTime)
        this.stats.frameTime = Math.round(avgFrameTime * 100) / 100
        
        // Update renderer info
        const info = this.renderer.info
        this.stats.drawCalls = info.render.calls
        this.stats.triangles = info.render.triangles
        
        // Update memory (if available)
        if (this.memoryMonitoring) {
            const memory = performance.memory
            this.stats.memory = Math.round(memory.usedJSHeapSize / 1048576) // MB
        }
        
        this.lastTime = currentTime
        
        if (this.showStats) {
            this.updateStatsDisplay()
        }
    }
    
    updateStatsDisplay() {
        if (!this.statsElement) return
        
        this.statsElement.innerHTML = `
            FPS: ${this.stats.fps}
            Frame Time: ${this.stats.frameTime}ms
            Draw Calls: ${this.stats.drawCalls}
            Triangles: ${this.stats.triangles}
            ${this.memoryMonitoring ? `Memory: ${this.stats.memory}MB` : ''}
        `.trim()
    }
    
    getStats() {
        return { ...this.stats }
    }
}

// Main Examples Integration System
export class ThreeJSExamplesSystem {
    constructor(scene, camera, renderer, domElement) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.domElement = domElement
        
        // Initialize all subsystems
        this.shaderSystem = new ShaderAnimationSystem()
        this.textureSystem = new TextureAnimationSystem()
        this.materialSystem = new MaterialSystem()
        this.skyboxSystem = new SkyboxSystem()
        this.inputManager = new UnifiedInputManager(camera, domElement)
        this.lightingSystem = new AdvancedLightingSystem(scene)
        this.interactionSystem = new InteractiveObjectSystem(scene, camera)
        this.audioSystem = new SpatialAudioSystem(camera)
        this.performanceMonitor = new PerformanceMonitor(renderer)
        
        // Demo objects
        this.demoObjects = []
        this.particleSystems = []
        this.terrain = null
        
        this.setupEventListeners()
    }
    
    async initialize() {
        await this.inputManager.initialize()
        this.createDemoScene()
    }
    
    setupEventListeners() {
        this.domElement.addEventListener('mousemove', (e) => {
            this.interactionSystem.handleMouseMove(e)
        })
        
        this.domElement.addEventListener('mousedown', (e) => {
            this.interactionSystem.handleMouseDown(e)
        })
        
        this.domElement.addEventListener('mouseup', (e) => {
            this.interactionSystem.handleMouseUp(e)
        })
    }
    
    createDemoScene() {
        // Create procedural terrain
        this.terrain = new ProceduralTerrain({
            size: 200,
            segments: 64,
            heightScale: 15
        })
        this.scene.add(this.terrain.mesh)
        
        // Create interactive particle system
        const particleSystem = new InteractiveParticleSystem(this.scene, {
            count: 500
        })
        this.particleSystems.push(particleSystem)
        
        // Create some demo objects with different materials
        this.createDemoObjects()
        
        // Setup dynamic skybox
        const skybox = this.skyboxSystem.createDynamicSkybox(0.3) // Dawn
        this.scene.add(skybox)
        
        // Add some interactive lights
        const fireLight = this.lightingSystem.createFireLight(new THREE.Vector3(10, 5, 10))
        this.demoObjects.push(fireLight)
    }
    
    createDemoObjects() {
        // Water shader demo
        const waterGeometry = new THREE.PlaneGeometry(20, 20, 32, 32)
        const waterMaterial = this.shaderSystem.createWaterShader({
            color: new THREE.Color(0x006994),
            waveHeight: 0.5,
            waveSpeed: 1.5
        })
        const water = new THREE.Mesh(waterGeometry, waterMaterial)
        water.rotation.x = -Math.PI / 2
        water.position.y = -2
        this.scene.add(water)
        this.demoObjects.push(water)
        
        // Lava shader demo
        const lavaGeometry = new THREE.SphereGeometry(3, 32, 32)
        const lavaMaterial = this.shaderSystem.createLavaShader({
            color1: new THREE.Color(0xff4400),
            color2: new THREE.Color(0xffaa00)
        })
        const lava = new THREE.Mesh(lavaGeometry, lavaMaterial)
        lava.position.set(-15, 3, -15)
        this.scene.add(lava)
        this.demoObjects.push(lava)
        
        // Portal shader demo
        const portalGeometry = new THREE.RingGeometry(2, 5, 32)
        const portalMaterial = this.shaderSystem.createPortalShader({
            innerColor: new THREE.Color(0x8800ff),
            outerColor: new THREE.Color(0x0066ff)
        })
        const portal = new THREE.Mesh(portalGeometry, portalMaterial)
        portal.position.set(15, 8, -15)
        this.scene.add(portal)
        this.demoObjects.push(portal)
        
        // Interactive cubes with different materials
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(2, 2, 2)
            const material = this.materialSystem.createCombatMaterial(
                ['metal', 'stone', 'flesh', 'energy'][i % 4]
            )
            
            const cube = new THREE.Mesh(geometry, material)
            cube.position.set(i * 4 - 8, 2, 5)
            cube.castShadow = true
            cube.receiveShadow = true
            
            this.scene.add(cube)
            this.demoObjects.push(cube)
            
            // Make it interactive
            const id = this.interactionSystem.addInteractiveObject(cube, {
                hoverable: true,
                clickable: true,
                draggable: true,
                data: { type: 'demo_cube', index: i }
            })
            
            this.interactionSystem.onClick(id, (mesh, data) => {
                // Animate cube on click
                const tween = {
                    startY: mesh.position.y,
                    targetY: mesh.position.y + 5,
                    duration: 1000,
                    startTime: Date.now(),
                    update: function() {
                        const elapsed = Date.now() - this.startTime
                        const progress = Math.min(1, elapsed / this.duration)
                        const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
                        
                        mesh.position.y = this.startY + (this.targetY - this.startY) * eased
                        
                        if (progress >= 1) {
                            // Bounce back
                            mesh.position.y = this.startY
                            return true // Complete
                        }
                        
                        return false
                    }
                }
                
                this.demoObjects.push(tween)
            })
        }
    }
    
    update(deltaTime) {
        // Update all systems
        this.shaderSystem.update()
        this.textureSystem.update(deltaTime)
        this.lightingSystem.update(deltaTime)
        this.inputManager.update(deltaTime)
        this.performanceMonitor.update()
        
        // Update particle systems
        this.particleSystems.forEach(system => {
            system.update(deltaTime, this.camera.position)
        })
        
        // Update demo object animations
        this.demoObjects = this.demoObjects.filter(obj => {
            if (obj.update) {
                return !obj.update() // Remove if animation complete
            }
            if (obj.animate) {
                obj.animate()
            }
            return true
        })
    }
    
    // Utility methods for external use
    getShaderSystem() { return this.shaderSystem }
    getInputManager() { return this.inputManager }
    getLightingSystem() { return this.lightingSystem }
    getInteractionSystem() { return this.interactionSystem }
    getAudioSystem() { return this.audioSystem }
    getPerformanceStats() { return this.performanceMonitor.getStats() }
    
    // Add custom demo objects
    addDemoObject(object) {
        this.demoObjects.push(object)
        if (object.mesh) {
            this.scene.add(object.mesh)
        }
    }
    
    // Environment presets
    setEnvironment(type) {
        switch (type) {
            case 'forest':
                this.lightingSystem.timeOfDay = 0.4
                break
            case 'desert':
                this.lightingSystem.timeOfDay = 0.5
                break
            case 'night':
                this.lightingSystem.timeOfDay = 0.9
                break
            case 'underwater':
                this.lightingSystem.timeOfDay = 0.3
                // Add underwater effects
                break
        }
    }
}

export default {
    InteractiveParticleSystem,
    AdvancedLightingSystem,
    ProceduralTerrain,
    InteractiveObjectSystem,
    SpatialAudioSystem,
    PerformanceMonitor,
    ThreeJSExamplesSystem
}