import * as THREE from 'three'
import { Water } from 'three/addons/objects/Water.js'
import { Water as Water2 } from 'three/addons/objects/Water2.js'

export class WaterSystem {
    constructor(scene, renderer) {
        this.scene = scene
        this.renderer = renderer
        
        this.water = null
        this.waterMesh = null
        this.waterType = 'ocean'
        
        this.settings = {
            size: 100,
            segments: 128,
            level: 0,
            color: 0x001e0f,
            sunColor: 0xffffff,
            distortionScale: 3.7,
            alpha: 1.0,
            flowSpeed: 0.03,
            reflectivity: 0.6,
            waveHeight: 0.5,
            waveSpeed: 1.0
        }
        
        this.time = 0
        this.normalMapLoaded = false
        this.textureLoader = new THREE.TextureLoader()
    }

    async createOceanWater(options = {}) {
        const settings = { ...this.settings, ...options }
        
        if (this.water) {
            this.dispose()
        }
        
        const waterGeometry = new THREE.PlaneGeometry(settings.size, settings.size, settings.segments, settings.segments)
        
        const waterNormals = await this.loadWaterNormals()
        
        this.water = new Water(waterGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: waterNormals,
            sunDirection: new THREE.Vector3(0.7, 0.5, 0.3).normalize(),
            sunColor: settings.sunColor,
            waterColor: settings.color,
            distortionScale: settings.distortionScale,
            fog: this.scene.fog !== undefined,
            alpha: settings.alpha
        })
        
        this.water.rotation.x = -Math.PI / 2
        this.water.position.y = settings.level
        this.water.name = 'RealisticWater'
        this.water.userData.isWater = true
        this.water.userData.noSelect = true
        
        this.scene.add(this.water)
        this.waterType = 'ocean'
        
        console.log('[WaterSystem] Ocean water created at level:', settings.level)
        return this.water
    }

    async createPoolWater(options = {}) {
        const settings = { ...this.settings, ...options }
        
        if (this.water) {
            this.dispose()
        }
        
        const waterGeometry = new THREE.PlaneGeometry(settings.size, settings.size)
        
        const flowMap = this.createFlowMap()
        const normalMap0 = await this.loadWaterNormals()
        const normalMap1 = await this.loadWaterNormals()
        
        this.water = new Water2(waterGeometry, {
            color: settings.color,
            scale: 4,
            flowDirection: new THREE.Vector2(1, 1),
            textureWidth: 1024,
            textureHeight: 1024,
            normalMap0: normalMap0,
            normalMap1: normalMap1,
            flowMap: flowMap
        })
        
        this.water.rotation.x = -Math.PI / 2
        this.water.position.y = settings.level
        this.water.name = 'PoolWater'
        this.water.userData.isWater = true
        
        this.scene.add(this.water)
        this.waterType = 'pool'
        
        console.log('[WaterSystem] Pool water created')
        return this.water
    }

    async createCustomWater(options = {}) {
        const settings = { ...this.settings, ...options }
        
        if (this.water) {
            this.dispose()
        }
        
        const geometry = new THREE.PlaneGeometry(
            settings.size, 
            settings.size, 
            settings.segments, 
            settings.segments
        )
        geometry.rotateX(-Math.PI / 2)
        
        const normalMap = await this.loadWaterNormals()
        
        const uniforms = {
            time: { value: 0 },
            normalMap: { value: normalMap },
            waterColor: { value: new THREE.Color(settings.color) },
            sunDirection: { value: new THREE.Vector3(0.7, 0.5, 0.3).normalize() },
            sunColor: { value: new THREE.Color(settings.sunColor) },
            waveHeight: { value: settings.waveHeight },
            waveSpeed: { value: settings.waveSpeed },
            reflectivity: { value: settings.reflectivity },
            flowSpeed: { value: settings.flowSpeed }
        }
        
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            transparent: true,
            side: THREE.DoubleSide
        })
        
        this.water = new THREE.Mesh(geometry, material)
        this.water.position.y = settings.level
        this.water.name = 'CustomWater'
        this.water.userData.isWater = true
        this.water.userData.customShader = true
        
        this.scene.add(this.water)
        this.waterType = 'custom'
        
        console.log('[WaterSystem] Custom water created')
        return this.water
    }

    loadWaterNormals() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            canvas.width = 512
            canvas.height = 512
            const ctx = canvas.getContext('2d')
            
            for (let y = 0; y < 512; y++) {
                for (let x = 0; x < 512; x++) {
                    const nx = Math.sin(x * 0.05) * 0.5 + 0.5
                    const ny = Math.sin(y * 0.05 + x * 0.02) * 0.5 + 0.5
                    const nz = 1.0
                    
                    ctx.fillStyle = `rgb(${Math.floor(nx * 255)}, ${Math.floor(ny * 255)}, ${Math.floor(nz * 128 + 127)})`
                    ctx.fillRect(x, y, 1, 1)
                }
            }
            
            const texture = new THREE.CanvasTexture(canvas)
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(4, 4)
            this.normalMapLoaded = true
            resolve(texture)
        })
    }

    createFlowMap() {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
        gradient.addColorStop(0, 'rgb(128, 128, 255)')
        gradient.addColorStop(1, 'rgb(200, 128, 255)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 256, 256)
        
        const texture = new THREE.CanvasTexture(canvas)
        return texture
    }

    getVertexShader() {
        return `
            uniform float time;
            uniform float waveHeight;
            uniform float waveSpeed;
            
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            varying float vWaveHeight;
            
            void main() {
                vUv = uv;
                vNormal = normalMatrix * normal;
                
                vec3 pos = position;
                
                float wave1 = sin(pos.x * 0.3 + time * waveSpeed) * waveHeight;
                float wave2 = sin(pos.z * 0.2 + time * waveSpeed * 0.8) * waveHeight * 0.8;
                float wave3 = sin((pos.x + pos.z) * 0.15 + time * waveSpeed * 1.2) * waveHeight * 0.5;
                
                pos.y += wave1 + wave2 + wave3;
                vWaveHeight = (wave1 + wave2 + wave3) / waveHeight;
                
                vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
                vWorldPosition = worldPosition.xyz;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `
    }

    getFragmentShader() {
        return `
            uniform float time;
            uniform sampler2D normalMap;
            uniform vec3 waterColor;
            uniform vec3 sunDirection;
            uniform vec3 sunColor;
            uniform float reflectivity;
            uniform float flowSpeed;
            
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            varying float vWaveHeight;
            
            void main() {
                vec2 flowUV1 = vUv + vec2(time * flowSpeed, time * flowSpeed * 0.7);
                vec2 flowUV2 = vUv + vec2(-time * flowSpeed * 0.5, time * flowSpeed * 0.3);
                
                vec3 normal1 = texture2D(normalMap, flowUV1).rgb * 2.0 - 1.0;
                vec3 normal2 = texture2D(normalMap, flowUV2).rgb * 2.0 - 1.0;
                vec3 combinedNormal = normalize(normal1 + normal2);
                
                vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                float fresnel = pow(1.0 - max(dot(viewDirection, vec3(0.0, 1.0, 0.0)), 0.0), 3.0);
                fresnel = mix(0.1, 1.0, fresnel);
                
                vec3 halfVector = normalize(sunDirection + viewDirection);
                float specular = pow(max(dot(combinedNormal, halfVector), 0.0), 64.0);
                vec3 specularColor = sunColor * specular * 0.8;
                
                vec3 deepColor = waterColor * 0.3;
                vec3 shallowColor = waterColor * 1.5;
                vec3 baseColor = mix(deepColor, shallowColor, vWaveHeight * 0.5 + 0.5);
                
                vec3 reflectionColor = vec3(0.6, 0.8, 1.0);
                vec3 finalColor = mix(baseColor, reflectionColor, fresnel * reflectivity);
                finalColor += specularColor;
                
                float foamThreshold = 0.7;
                float foam = smoothstep(foamThreshold, 1.0, vWaveHeight);
                finalColor = mix(finalColor, vec3(1.0), foam * 0.5);
                
                gl_FragColor = vec4(finalColor, 0.85);
            }
        `
    }

    update(deltaTime) {
        this.time += deltaTime
        
        if (!this.water) return
        
        if (this.waterType === 'ocean' && this.water.material?.uniforms?.time) {
            this.water.material.uniforms.time.value += deltaTime
        } else if (this.waterType === 'custom' && this.water.material?.uniforms?.time) {
            this.water.material.uniforms.time.value = this.time
        }
    }

    setLevel(level) {
        this.settings.level = level
        if (this.water) {
            this.water.position.y = level
        }
    }

    setColor(color) {
        this.settings.color = color
        if (this.water) {
            if (this.water.material?.uniforms?.waterColor) {
                this.water.material.uniforms.waterColor.value.setHex(color)
            }
        }
    }

    setWaveHeight(height) {
        this.settings.waveHeight = height
        if (this.water?.material?.uniforms?.waveHeight) {
            this.water.material.uniforms.waveHeight.value = height
        }
    }

    setWaveSpeed(speed) {
        this.settings.waveSpeed = speed
        if (this.water?.material?.uniforms?.waveSpeed) {
            this.water.material.uniforms.waveSpeed.value = speed
        }
    }

    setVisible(visible) {
        if (this.water) {
            this.water.visible = visible
        }
    }

    getWater() {
        return this.water
    }

    dispose() {
        if (this.water) {
            if (this.water.geometry) this.water.geometry.dispose()
            if (this.water.material) {
                if (this.water.material.uniforms) {
                    Object.values(this.water.material.uniforms).forEach(u => {
                        if (u.value?.dispose) u.value.dispose()
                    })
                }
                this.water.material.dispose()
            }
            this.scene.remove(this.water)
            this.water = null
        }
    }
}

export class SplatEffect {
    constructor(scene) {
        this.scene = scene
        this.splats = []
        this.maxSplats = 50
    }

    createBloodSplat(position, normal, options = {}) {
        const {
            color = 0x8B0000,
            size = 1,
            duration = 10
        } = options

        const geometry = new THREE.CircleGeometry(size, 16)
        
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false
        })

        const splat = new THREE.Mesh(geometry, material)
        splat.position.copy(position)
        splat.position.y += 0.01
        
        if (normal) {
            splat.lookAt(position.clone().add(normal))
        } else {
            splat.rotation.x = -Math.PI / 2
        }
        
        splat.userData.createdAt = Date.now()
        splat.userData.duration = duration * 1000
        
        this.scene.add(splat)
        this.splats.push(splat)
        
        if (this.splats.length > this.maxSplats) {
            const oldest = this.splats.shift()
            this.removeSplat(oldest)
        }
        
        return splat
    }

    createWaterSplash(position, options = {}) {
        const {
            color = 0x4488ff,
            size = 0.5,
            particleCount = 10,
            duration = 1
        } = options

        const particles = []
        const geometry = new THREE.SphereGeometry(0.05, 8, 8)
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        })

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material.clone())
            particle.position.copy(position)
            
            const angle = Math.random() * Math.PI * 2
            const speed = 2 + Math.random() * 3
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed * 0.3,
                speed,
                Math.sin(angle) * speed * 0.3
            )
            particle.userData.createdAt = Date.now()
            particle.userData.duration = duration * 1000
            
            this.scene.add(particle)
            particles.push(particle)
        }
        
        return particles
    }

    update(deltaTime) {
        const now = Date.now()
        
        for (let i = this.splats.length - 1; i >= 0; i--) {
            const splat = this.splats[i]
            const age = now - splat.userData.createdAt
            const progress = age / splat.userData.duration
            
            if (progress >= 1) {
                this.removeSplat(splat)
                this.splats.splice(i, 1)
            } else if (progress > 0.7) {
                splat.material.opacity = (1 - progress) / 0.3 * 0.9
            }
        }
    }

    removeSplat(splat) {
        splat.geometry.dispose()
        splat.material.dispose()
        this.scene.remove(splat)
    }

    clear() {
        this.splats.forEach(splat => this.removeSplat(splat))
        this.splats = []
    }
}

export default WaterSystem
