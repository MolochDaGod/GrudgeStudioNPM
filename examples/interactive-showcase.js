/**
 * Grudge Studio - Interactive Showcase Example
 * Demonstrate all visual effects and features
 */

import * as THREE from 'three'
import {
    QuickSetup,
    ShaderAnimationSystem,
    AdvancedLightingSystem,
    InteractiveParticleSystem,
    SkyboxSystem
} from '../tools/index.js'

class InteractiveShowcase {
    constructor() {
        this.canvas = document.querySelector('canvas')
        this.setupShowcase()
    }

    async setupShowcase() {
        // Showcase setup
        this.game = QuickSetup.createInteractiveShowcase(this.canvas, {
            autoRotate: true
        })

        // Setup showcase items
        this.createShaderDemos()
        this.createParticleEffects()
        this.createLightingDemo()
        this.setupUI()

        console.log('Interactive Showcase initialized')
    }

    createShaderDemos() {
        const { scene } = this.game
        const shaderSystem = new ShaderAnimationSystem()

        const demoX = [-30, 0, 30]
        const demos = [
            {
                name: 'Water',
                create: () => shaderSystem.createWaterShader({
                    waveHeight: 0.3,
                    waveSpeed: 1.0
                }),
                geometry: new THREE.PlaneGeometry(20, 20, 32, 32)
            },
            {
                name: 'Lava',
                create: () => shaderSystem.createLavaShader({}),
                geometry: new THREE.SphereGeometry(5, 32, 32)
            },
            {
                name: 'Portal',
                create: () => shaderSystem.createPortalShader({}),
                geometry: new THREE.RingGeometry(3, 6, 32)
            }
        ]

        demos.forEach((demo, idx) => {
            const material = demo.create()
            const mesh = new THREE.Mesh(demo.geometry, material)

            if (idx === 0) {
                mesh.rotation.x = -Math.PI / 2
                mesh.position.y = 0
            } else if (idx === 1) {
                mesh.position.y = 5
            } else {
                mesh.position.y = 5
            }

            mesh.position.x = demoX[idx]
            scene.add(mesh)

            // Add label
            this.addLabel(mesh.position, demo.name)
        })
    }

    createParticleEffects() {
        const { scene } = this.game

        // Particle system
        const particles = new InteractiveParticleSystem(scene, { count: 500 })

        // Add multiple attractors
        particles.addAttractor(new THREE.Vector3(30, 10, 0), 80)
        particles.addAttractor(new THREE.Vector3(-30, 10, 0), 80)

        this.particles = particles
    }

    createLightingDemo() {
        const { scene, examplesSystem } = this.game
        const lights = examplesSystem.getLightingSystem()

        // Create fire lights
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2
            const x = Math.cos(angle) * 40
            const z = Math.sin(angle) * 40

            lights.createFireLight(new THREE.Vector3(x, 3, z))
        }

        // Create spotlights
        lights.createSpotlight(
            new THREE.Vector3(0, 20, 0),
            new THREE.Vector3(0, 0, 0),
            0xffffff,
            2,
            100,
            Math.PI / 6
        )
    }

    addLabel(position, text) {
        // Create a simple label using CSS3D or canvas
        const label = document.createElement('div')
        label.textContent = text
        label.style.cssText = `
            position: fixed;
            color: white;
            font-family: Arial;
            font-size: 14px;
            background: rgba(0,0,0,0.7);
            padding: 5px 10px;
            border-radius: 3px;
            pointer-events: none;
        `

        // This is simplified - a full implementation would use Three.js cameras
        document.body.appendChild(label)
    }

    setupUI() {
        const ui = document.getElementById('ui')
        ui.innerHTML = `
            <div style="color: #fff; font-family: Arial; font-size: 14px;">
                <h2>Grudge Studio v1.2.0</h2>
                <h3>Interactive Showcase</h3>
                <ul>
                    <li>Advanced Shaders (Water, Lava, Portal)</li>
                    <li>Particle Effects</li>
                    <li>Dynamic Lighting</li>
                    <li>Physics Engine</li>
                    <li>Multi-modal Input</li>
                </ul>
                <p style="margin-top: 20px; font-size: 12px;">
                    Mouse: Rotate | Scroll: Zoom | Click: Interact
                </p>
            </div>
        `
    }

    update(deltaTime) {
        if (this.particles) {
            this.particles.update(deltaTime, new THREE.Vector3())
        }
    }
}

// Initialize showcase
window.addEventListener('DOMContentLoaded', () => {
    const showcase = new InteractiveShowcase()

    // Animation loop
    function animate() {
        requestAnimationFrame(animate)
        showcase.update(0.016) // Approximate 60fps
    }

    animate()
})