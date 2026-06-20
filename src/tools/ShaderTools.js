/**
 * Three.js Enhanced Tools Collection
 * Modular tools based on Stemkoski examples for Grudge Studio
 */

import * as THREE from 'three'

// Shader Animation System
export class ShaderAnimationSystem {
    constructor() {
        this.animatedMaterials = new Map()
        this.time = 0
        this.clock = new THREE.Clock()
    }

    // Water shader with animated waves
    createWaterShader(options = {}) {
        const uniforms = {
            time: { value: 0 },
            color: { value: options.color || new THREE.Color(0x006994) },
            opacity: { value: options.opacity || 0.8 },
            waveHeight: { value: options.waveHeight || 0.1 },
            waveSpeed: { value: options.waveSpeed || 1.0 },
            waveFrequency: { value: options.waveFrequency || 2.0 }
        }

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            transparent: true,
            vertexShader: `
                uniform float time;
                uniform float waveHeight;
                uniform float waveFrequency;
                
                void main() {
                    vec3 pos = position;
                    
                    // Create wave animation
                    float wave1 = sin(pos.x * waveFrequency + time * 2.0) * waveHeight;
                    float wave2 = cos(pos.z * waveFrequency * 0.8 + time * 1.5) * waveHeight * 0.5;
                    
                    pos.y += wave1 + wave2;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float opacity;
                uniform float time;
                
                void main() {
                    // Add some shimmer effect
                    float shimmer = sin(time * 3.0) * 0.1 + 0.9;
                    vec3 finalColor = color * shimmer;
                    
                    gl_FragColor = vec4(finalColor, opacity);
                }
            `
        })

        this.animatedMaterials.set('water', { material, uniforms })
        return material
    }

    // Lava shader with bubbling effect
    createLavaShader(options = {}) {
        const uniforms = {
            time: { value: 0 },
            color1: { value: options.color1 || new THREE.Color(0xff4400) },
            color2: { value: options.color2 || new THREE.Color(0xffaa00) },
            bubbleSpeed: { value: options.bubbleSpeed || 1.5 },
            intensity: { value: options.intensity || 1.0 }
        }

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                uniform float time;
                uniform float bubbleSpeed;
                
                void main() {
                    vec3 pos = position;
                    
                    // Bubbling effect
                    float bubble = sin(pos.x * 3.0 + time * bubbleSpeed) * 
                                  cos(pos.z * 2.5 + time * bubbleSpeed * 0.8) * 0.05;
                    pos.y += bubble;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color1;
                uniform vec3 color2;
                uniform float time;
                uniform float intensity;
                
                void main() {
                    // Animated lava flow
                    float flow = sin(gl_FragCoord.x * 0.01 + time) * 
                                cos(gl_FragCoord.y * 0.01 + time * 0.7);
                    
                    vec3 color = mix(color1, color2, (flow + 1.0) * 0.5);
                    color *= intensity;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        })

        this.animatedMaterials.set('lava', { material, uniforms })
        return material
    }

    // Portal shader with swirling effect
    createPortalShader(options = {}) {
        const uniforms = {
            time: { value: 0 },
            innerColor: { value: options.innerColor || new THREE.Color(0x8800ff) },
            outerColor: { value: options.outerColor || new THREE.Color(0x0066ff) },
            speed: { value: options.speed || 2.0 },
            distortion: { value: options.distortion || 0.5 }
        }

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            transparent: true,
            side: THREE.DoubleSide,
            vertexShader: `
                void main() {
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 innerColor;
                uniform vec3 outerColor;
                uniform float time;
                uniform float speed;
                uniform float distortion;
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    vec2 uv = gl_FragCoord.xy / resolution.xy;
                    
                    float distance = length(uv - center);
                    float angle = atan(uv.y - center.y, uv.x - center.x);
                    
                    // Swirling effect
                    angle += sin(distance * 10.0 - time * speed) * distortion;
                    
                    // Create spiral pattern
                    float spiral = sin(angle * 3.0 + distance * 20.0 - time * speed);
                    
                    vec3 color = mix(outerColor, innerColor, spiral);
                    float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `
        })

        this.animatedMaterials.set('portal', { material, uniforms })
        return material
    }

    // Fireball shader for spells
    createFireballShader(options = {}) {
        const uniforms = {
            time: { value: 0 },
            fireColor: { value: options.fireColor || new THREE.Color(0xff4400) },
            coreColor: { value: options.coreColor || new THREE.Color(0xffff88) },
            intensity: { value: options.intensity || 2.0 },
            size: { value: options.size || 1.0 }
        }

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            transparent: true,
            blending: THREE.AdditiveBlending,
            vertexShader: `
                uniform float time;
                uniform float size;
                
                void main() {
                    vec3 pos = position;
                    
                    // Flickering effect
                    float flicker = sin(time * 10.0) * 0.1 + 0.9;
                    pos *= size * flicker;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 fireColor;
                uniform vec3 coreColor;
                uniform float time;
                uniform float intensity;
                
                void main() {
                    vec2 center = vec2(0.5);
                    float distance = length(gl_FragCoord.xy / resolution.xy - center);
                    
                    // Flame effect
                    float flame = sin(distance * 15.0 + time * 5.0) * 0.5 + 0.5;
                    flame *= 1.0 - smoothstep(0.0, 0.4, distance);
                    
                    vec3 color = mix(fireColor, coreColor, flame);
                    float alpha = flame * intensity;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `
        })

        this.animatedMaterials.set('fireball', { material, uniforms })
        return material
    }

    update() {
        this.time = this.clock.getElapsedTime()
        
        this.animatedMaterials.forEach(({ material, uniforms }) => {
            if (uniforms.time) {
                uniforms.time.value = this.time
            }
        })
    }
}

// Texture Animation System
export class TextureAnimationSystem {
    constructor() {
        this.animatedTextures = new Map()
        this.frameIndex = 0
        this.lastFrameTime = 0
    }

    // Create animated texture from sprite sheet
    createSpriteAnimation(textureUrl, frameWidth, frameHeight, frameCount, fps = 12) {
        const loader = new THREE.TextureLoader()
        
        return new Promise((resolve) => {
            loader.load(textureUrl, (texture) => {
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                
                const framesX = Math.floor(texture.image.width / frameWidth)
                const framesY = Math.floor(texture.image.height / frameHeight)
                
                texture.repeat.set(1 / framesX, 1 / framesY)
                texture.offset.set(0, 0)
                
                const animation = {
                    texture,
                    frameCount,
                    framesX,
                    framesY,
                    currentFrame: 0,
                    fps,
                    lastTime: 0
                }
                
                this.animatedTextures.set(textureUrl, animation)
                resolve(texture)
            })
        })
    }

    // Create flowing texture (for water, blood, etc.)
    createFlowingTexture(textureUrl, direction = { x: 1, y: 0 }, speed = 0.5) {
        const loader = new THREE.TextureLoader()
        
        return new Promise((resolve) => {
            loader.load(textureUrl, (texture) => {
                texture.wrapS = THREE.RepeatWrapping
                texture.wrapT = THREE.RepeatWrapping
                
                const animation = {
                    texture,
                    direction,
                    speed,
                    offset: { x: 0, y: 0 }
                }
                
                this.animatedTextures.set(textureUrl + '_flow', animation)
                resolve(texture)
            })
        })
    }

    update(deltaTime) {
        this.animatedTextures.forEach((animation, key) => {
            if (animation.frameCount) {
                // Sprite animation
                animation.lastTime += deltaTime
                
                if (animation.lastTime >= 1 / animation.fps) {
                    animation.currentFrame = (animation.currentFrame + 1) % animation.frameCount
                    
                    const frameX = animation.currentFrame % animation.framesX
                    const frameY = Math.floor(animation.currentFrame / animation.framesX)
                    
                    animation.texture.offset.set(
                        frameX / animation.framesX,
                        frameY / animation.framesY
                    )
                    
                    animation.lastTime = 0
                }
            } else if (animation.direction) {
                // Flowing animation
                animation.offset.x += animation.direction.x * animation.speed * deltaTime
                animation.offset.y += animation.direction.y * animation.speed * deltaTime
                
                animation.texture.offset.set(animation.offset.x, animation.offset.y)
            }
        })
    }
}

// Advanced Material System
export class MaterialSystem {
    constructor() {
        this.materials = new Map()
        this.materialCache = new Map()
    }

    // Combat materials with damage effects
    createCombatMaterial(type, options = {}) {
        switch (type) {
            case 'metal':
                return this.createMetalMaterial(options)
            case 'stone':
                return this.createStoneMaterial(options)
            case 'flesh':
                return this.createFleshMaterial(options)
            case 'energy':
                return this.createEnergyMaterial(options)
            default:
                return new THREE.MeshStandardMaterial(options)
        }
    }

    createMetalMaterial(options = {}) {
        return new THREE.MeshStandardMaterial({
            color: options.color || 0x888888,
            metalness: options.metalness || 0.8,
            roughness: options.roughness || 0.2,
            envMapIntensity: options.envMapIntensity || 1.0,
            ...options
        })
    }

    createStoneMaterial(options = {}) {
        return new THREE.MeshStandardMaterial({
            color: options.color || 0x666666,
            metalness: 0.0,
            roughness: options.roughness || 0.9,
            bumpScale: options.bumpScale || 0.1,
            ...options
        })
    }

    createFleshMaterial(options = {}) {
        return new THREE.MeshStandardMaterial({
            color: options.color || 0xffaa88,
            metalness: 0.0,
            roughness: options.roughness || 0.8,
            subsurface: options.subsurface || 0.1,
            ...options
        })
    }

    createEnergyMaterial(options = {}) {
        return new THREE.MeshBasicMaterial({
            color: options.color || 0x00ffff,
            transparent: true,
            opacity: options.opacity || 0.7,
            emissive: options.emissive || new THREE.Color(0x001133),
            emissiveIntensity: options.emissiveIntensity || 0.5,
            blending: THREE.AdditiveBlending,
            ...options
        })
    }

    // Environment materials
    createEnvironmentMaterial(biome, options = {}) {
        switch (biome) {
            case 'forest':
                return this.createForestMaterials(options)
            case 'desert':
                return this.createDesertMaterials(options)
            case 'arctic':
                return this.createArcticMaterials(options)
            case 'volcanic':
                return this.createVolcanicMaterials(options)
            case 'underwater':
                return this.createUnderwaterMaterials(options)
            default:
                return this.createGenericMaterials(options)
        }
    }

    createForestMaterials(options = {}) {
        return {
            ground: new THREE.MeshStandardMaterial({
                color: 0x3a4a2a,
                roughness: 0.9,
                metalness: 0.0
            }),
            foliage: new THREE.MeshLambertMaterial({
                color: 0x228b22,
                transparent: true,
                alphaTest: 0.5
            }),
            bark: new THREE.MeshStandardMaterial({
                color: 0x8b4513,
                roughness: 0.8,
                metalness: 0.0
            })
        }
    }

    createDesertMaterials(options = {}) {
        return {
            sand: new THREE.MeshStandardMaterial({
                color: 0xf4d03f,
                roughness: 0.9,
                metalness: 0.0
            }),
            rock: new THREE.MeshStandardMaterial({
                color: 0xa0522d,
                roughness: 0.8,
                metalness: 0.0
            }),
            oasis: new THREE.MeshStandardMaterial({
                color: 0x006994,
                transparent: true,
                opacity: 0.8
            })
        }
    }

    // Material optimization
    optimizeMaterials(scene) {
        const materialMap = new Map()
        
        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                const materialKey = this.getMaterialKey(child.material)
                
                if (materialMap.has(materialKey)) {
                    child.material = materialMap.get(materialKey)
                } else {
                    materialMap.set(materialKey, child.material)
                }
            }
        })
        
        return materialMap.size
    }

    getMaterialKey(material) {
        return JSON.stringify({
            type: material.type,
            color: material.color?.getHex(),
            metalness: material.metalness,
            roughness: material.roughness,
            transparent: material.transparent,
            opacity: material.opacity
        })
    }
}

// Skybox System
export class SkyboxSystem {
    constructor() {
        this.currentSkybox = null
        this.loader = new THREE.CubeTextureLoader()
    }

    // Load skybox from 6 images
    loadSkybox(urls, scene) {
        return new Promise((resolve, reject) => {
            this.loader.load(
                urls,
                (texture) => {
                    scene.background = texture
                    this.currentSkybox = texture
                    resolve(texture)
                },
                undefined,
                reject
            )
        })
    }

    // Create procedural skybox
    createProceduralSkybox(options = {}) {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32)
        
        const uniforms = {
            topColor: { value: options.topColor || new THREE.Color(0x0077ff) },
            bottomColor: { value: options.bottomColor || new THREE.Color(0xffffff) },
            offset: { value: options.offset || 400 },
            exponent: { value: options.exponent || 0.6 }
        }

        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            side: THREE.BackSide,
            vertexShader: `
                varying vec3 vWorldPosition;
                
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                
                varying vec3 vWorldPosition;
                
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    vec3 color = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        })

        return new THREE.Mesh(skyGeometry, skyMaterial)
    }

    // Environment-specific skyboxes
    createEnvironmentSkybox(environment, options = {}) {
        const skyboxConfigs = {
            forest: {
                topColor: new THREE.Color(0x87ceeb),
                bottomColor: new THREE.Color(0x98fb98),
                urls: [
                    '/assets/skybox/forest/px.jpg',
                    '/assets/skybox/forest/nx.jpg',
                    '/assets/skybox/forest/py.jpg',
                    '/assets/skybox/forest/ny.jpg',
                    '/assets/skybox/forest/pz.jpg',
                    '/assets/skybox/forest/nz.jpg'
                ]
            },
            desert: {
                topColor: new THREE.Color(0xffd700),
                bottomColor: new THREE.Color(0xff6347),
                urls: [
                    '/assets/skybox/desert/px.jpg',
                    '/assets/skybox/desert/nx.jpg',
                    '/assets/skybox/desert/py.jpg',
                    '/assets/skybox/desert/ny.jpg',
                    '/assets/skybox/desert/pz.jpg',
                    '/assets/skybox/desert/nz.jpg'
                ]
            },
            space: {
                topColor: new THREE.Color(0x000011),
                bottomColor: new THREE.Color(0x000033),
                urls: [
                    '/assets/skybox/space/px.jpg',
                    '/assets/skybox/space/nx.jpg',
                    '/assets/skybox/space/py.jpg',
                    '/assets/skybox/space/ny.jpg',
                    '/assets/skybox/space/pz.jpg',
                    '/assets/skybox/space/nz.jpg'
                ]
            }
        }

        const config = skyboxConfigs[environment] || skyboxConfigs.forest
        return { ...config, ...options }
    }

    // Dynamic time-of-day skybox
    createDynamicSkybox(timeOfDay = 0.5) {
        // timeOfDay: 0 = midnight, 0.5 = noon, 1 = midnight
        const skyColors = {
            night: { top: new THREE.Color(0x000033), bottom: new THREE.Color(0x000011) },
            dawn: { top: new THREE.Color(0xff6b47), bottom: new THREE.Color(0xffd700) },
            day: { top: new THREE.Color(0x87ceeb), bottom: new THREE.Color(0xffffff) },
            dusk: { top: new THREE.Color(0x8b0000), bottom: new THREE.Color(0xff4500) }
        }

        let topColor, bottomColor
        
        if (timeOfDay < 0.2) { // Night to dawn
            const t = timeOfDay / 0.2
            topColor = new THREE.Color().lerpColors(skyColors.night.top, skyColors.dawn.top, t)
            bottomColor = new THREE.Color().lerpColors(skyColors.night.bottom, skyColors.dawn.bottom, t)
        } else if (timeOfDay < 0.5) { // Dawn to day
            const t = (timeOfDay - 0.2) / 0.3
            topColor = new THREE.Color().lerpColors(skyColors.dawn.top, skyColors.day.top, t)
            bottomColor = new THREE.Color().lerpColors(skyColors.dawn.bottom, skyColors.day.bottom, t)
        } else if (timeOfDay < 0.8) { // Day to dusk
            const t = (timeOfDay - 0.5) / 0.3
            topColor = new THREE.Color().lerpColors(skyColors.day.top, skyColors.dusk.top, t)
            bottomColor = new THREE.Color().lerpColors(skyColors.day.bottom, skyColors.dusk.bottom, t)
        } else { // Dusk to night
            const t = (timeOfDay - 0.8) / 0.2
            topColor = new THREE.Color().lerpColors(skyColors.dusk.top, skyColors.night.top, t)
            bottomColor = new THREE.Color().lerpColors(skyColors.dusk.bottom, skyColors.night.bottom, t)
        }

        return this.createProceduralSkybox({ topColor, bottomColor })
    }
}

export default {
    ShaderAnimationSystem,
    TextureAnimationSystem,
    MaterialSystem,
    SkyboxSystem
}