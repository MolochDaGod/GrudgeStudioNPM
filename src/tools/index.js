/**
 * Grudge Studio Tools - Main Export File
 * Central hub for all Three.js tools and systems
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Core Tools
export * from './ShaderTools.js'
export * from './InputTools.js'
export * from './CameraTools.js'
export * from './PhysicsTools.js'
export * from './ExampleTools.js'

// Import all tool classes for organized access
import {
    ShaderAnimationSystem,
    TextureAnimationSystem,
    MaterialSystem,
    SkyboxSystem
} from './ShaderTools.js'

import {
    AdvancedMouseSystem,
    GamepadSystem,
    LeapMotionSystem,
    UnifiedInputManager
} from './InputTools.js'

import {
    BaseCameraSystem,
    OrbitCameraController,
    FirstPersonCameraController,
    ThirdPersonCameraController,
    CinematicCameraSystem
} from './CameraTools.js'

import {
    PhysicsWorld,
    PhysicsBody,
    SphereShape,
    BoxShape,
    CapsuleShape,
    DistanceConstraint,
    SpringConstraint
} from './PhysicsTools.js'

import {
    InteractiveParticleSystem,
    AdvancedLightingSystem,
    ProceduralTerrain,
    InteractiveObjectSystem,
    SpatialAudioSystem,
    PerformanceMonitor,
    ThreeJSExamplesSystem
} from './ExampleTools.js'

// Organized exports by category
export const Shaders = {
    ShaderAnimationSystem,
    TextureAnimationSystem,
    MaterialSystem,
    SkyboxSystem
}

export const Input = {
    AdvancedMouseSystem,
    GamepadSystem,
    LeapMotionSystem,
    UnifiedInputManager
}

export const Cameras = {
    BaseCameraSystem,
    OrbitCameraController,
    FirstPersonCameraController,
    ThirdPersonCameraController,
    CinematicCameraSystem
}

export const Physics = {
    PhysicsWorld,
    PhysicsBody,
    SphereShape,
    BoxShape,
    CapsuleShape,
    DistanceConstraint,
    SpringConstraint
}

export const Examples = {
    InteractiveParticleSystem,
    AdvancedLightingSystem,
    ProceduralTerrain,
    InteractiveObjectSystem,
    SpatialAudioSystem,
    PerformanceMonitor,
    ThreeJSExamplesSystem
}

// Utility function to create a complete Grudge Studio setup
export function createGrudgeStudioSetup(canvas, options = {}) {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
        options.fov || 75,
        canvas.clientWidth / canvas.clientHeight,
        options.near || 0.1,
        options.far || 1000
    )
    
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: options.antialias !== false,
        alpha: options.alpha || false
    })
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = options.shadows !== false
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    // Initialize the main examples system
    const examplesSystem = new ThreeJSExamplesSystem(scene, camera, renderer, canvas)
    
    // Setup camera controls
    const cameraController = new OrbitCameraController(camera, canvas, {
        enableDamping: true,
        dampingFactor: 0.05,
        autoRotate: options.autoRotate || false
    })
    
    // Animation loop
    const clock = new THREE.Clock()
    
    function animate() {
        requestAnimationFrame(animate)
        
        const deltaTime = clock.getDelta()
        
        // Update all systems
        cameraController.update(deltaTime)
        examplesSystem.update(deltaTime)
        
        // Render the scene
        renderer.render(scene, camera)
    }
    
    // Handle window resize
    function onWindowResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }
    
    window.addEventListener('resize', onWindowResize)
    
    // Initialize and start
    examplesSystem.initialize().then(() => {
        animate()
    })
    
    return {
        scene,
        camera,
        renderer,
        examplesSystem,
        cameraController,
        animate,
        onWindowResize
    }
}

// Quick setup functions for common scenarios
export const QuickSetup = {
    // First Person Game Setup
    createFPSGame: (canvas, options = {}) => {
        const setup = createGrudgeStudioSetup(canvas, options)
        
        // Replace camera controller with FPS controller
        setup.cameraController = new FirstPersonCameraController(setup.camera, {
            moveSpeed: options.moveSpeed || 10,
            lookSpeed: options.lookSpeed || 2
        })
        
        // Add physics world
        setup.physicsWorld = new PhysicsWorld()
        
        return setup
    },
    
    // Third Person Adventure Setup
    createAdventureGame: (canvas, target, options = {}) => {
        const setup = createGrudgeStudioSetup(canvas, options)
        
        // Replace camera controller with third person controller
        setup.cameraController = new ThirdPersonCameraController(setup.camera, target, {
            followSpeed: options.followSpeed || 5,
            rotationSpeed: options.rotationSpeed || 3
        })
        
        return setup
    },
    
    // Cinematic Experience Setup
    createCinematicExperience: (canvas, options = {}) => {
        const setup = createGrudgeStudioSetup(canvas, options)
        
        // Add cinematic camera system
        setup.cinematicCamera = new CinematicCameraSystem(setup.camera)
        
        return setup
    },
    
    // Interactive Showcase Setup
    createInteractiveShowcase: (canvas, options = {}) => {
        const setup = createGrudgeStudioSetup(canvas, {
            ...options,
            autoRotate: true
        })
        
        // Enhanced interaction system
        setup.interactionSystem = setup.examplesSystem.getInteractionSystem()
        
        return setup
    }
}

// Helper functions for common operations
export const Helpers = {
    // Create a standard game character setup
    createCharacter: (scene, position, options = {}) => {
        const characterGroup = new THREE.Group()
        
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(options.radius || 0.5, options.height || 1.8)
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: options.color || 0x8888ff
        })
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
        body.position.y = options.height / 2 || 0.9
        body.castShadow = true
        
        characterGroup.add(body)
        characterGroup.position.copy(position)
        
        scene.add(characterGroup)
        
        // Add physics body if physics world provided
        if (options.physicsWorld) {
            const physicsBody = new PhysicsBody({
                shape: new CapsuleShape(options.radius || 0.5, options.height || 1.8),
                mass: options.mass || 70,
                position: position,
                mesh: characterGroup
            })
            
            options.physicsWorld.addBody(physicsBody)
            
            return { mesh: characterGroup, physicsBody }
        }
        
        return { mesh: characterGroup }
    },
    
    // Create interactive UI elements
    createUI: (container) => {
        const ui = {
            container,
            elements: new Map(),
            
            addButton: (text, callback, options = {}) => {
                const button = document.createElement('button')
                button.textContent = text
                button.style.cssText = `
                    position: absolute;
                    padding: 10px 20px;
                    background: ${options.background || 'rgba(0,0,0,0.7)'};
                    color: ${options.color || 'white'};
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: Arial, sans-serif;
                    ${options.style || ''}
                `
                
                if (options.position) {
                    button.style.top = options.position.top || 'auto'
                    button.style.bottom = options.position.bottom || 'auto'
                    button.style.left = options.position.left || 'auto'
                    button.style.right = options.position.right || 'auto'
                }
                
                button.addEventListener('click', callback)
                container.appendChild(button)
                
                const id = options.id || Math.random().toString(36).substr(2, 9)
                ui.elements.set(id, button)
                
                return id
            },
            
            addPanel: (content, options = {}) => {
                const panel = document.createElement('div')
                panel.innerHTML = content
                panel.style.cssText = `
                    position: absolute;
                    background: ${options.background || 'rgba(0,0,0,0.8)'};
                    color: ${options.color || 'white'};
                    padding: ${options.padding || '20px'};
                    border-radius: 10px;
                    font-family: Arial, sans-serif;
                    ${options.style || ''}
                `
                
                if (options.position) {
                    panel.style.top = options.position.top || 'auto'
                    panel.style.bottom = options.position.bottom || 'auto'
                    panel.style.left = options.position.left || 'auto'
                    panel.style.right = options.position.right || 'auto'
                }
                
                container.appendChild(panel)
                
                const id = options.id || Math.random().toString(36).substr(2, 9)
                ui.elements.set(id, panel)
                
                return id
            },
            
            remove: (id) => {
                const element = ui.elements.get(id)
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element)
                    ui.elements.delete(id)
                }
            }
        }
        
        return ui
    },
    
    // Load and setup 3D models
    loadModel: async (url, scene, options = {}) => {
        const loader = new GLTFLoader()
        
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene
                    
                    if (options.scale) {
                        model.scale.setScalar(options.scale)
                    }
                    
                    if (options.position) {
                        model.position.copy(options.position)
                    }
                    
                    if (options.rotation) {
                        model.rotation.copy(options.rotation)
                    }
                    
                    // Setup shadows
                    if (options.shadows !== false) {
                        model.traverse((child) => {
                            if (child.isMesh) {
                                child.castShadow = true
                                child.receiveShadow = true
                            }
                        })
                    }
                    
                    scene.add(model)
                    
                    resolve({
                        model,
                        animations: gltf.animations,
                        mixer: gltf.animations.length > 0 ? new THREE.AnimationMixer(model) : null
                    })
                },
                undefined,
                reject
            )
        })
    }
}

// Default export includes everything
export default {
    // Core systems
    Shaders,
    Input,
    Cameras,
    Physics,
    Examples,
    
    // Quick setup functions
    createGrudgeStudioSetup,
    QuickSetup,
    Helpers,
    
    // Individual classes for direct import
    ShaderAnimationSystem,
    TextureAnimationSystem,
    MaterialSystem,
    SkyboxSystem,
    AdvancedMouseSystem,
    GamepadSystem,
    LeapMotionSystem,
    UnifiedInputManager,
    BaseCameraSystem,
    OrbitCameraController,
    FirstPersonCameraController,
    ThirdPersonCameraController,
    CinematicCameraSystem,
    PhysicsWorld,
    PhysicsBody,
    SphereShape,
    BoxShape,
    CapsuleShape,
    InteractiveParticleSystem,
    AdvancedLightingSystem,
    ProceduralTerrain,
    InteractiveObjectSystem,
    SpatialAudioSystem,
    PerformanceMonitor,
    ThreeJSExamplesSystem
}