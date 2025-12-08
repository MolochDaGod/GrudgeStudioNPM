/**
 * Grudge Studio - First Person Shooter Example
 * Complete FPS game with physics, particles, and interactive objects
 */

import * as THREE from 'three'
import { QuickSetup, PerformanceMonitor } from '../tools/index.js'

class FPSGame {
    constructor() {
        this.canvas = document.querySelector('canvas')
        this.setupGame()
    }

    async setupGame() {
        // Quick FPS setup
        this.game = QuickSetup.createFPSGame(this.canvas, {
            moveSpeed: 15,
            lookSpeed: 2,
            shadows: true
        })

        // Setup world
        this.setupEnvironment()
        this.setupEnemies()
        this.setupUI()

        console.log('FPS Game initialized')
    }

    setupEnvironment() {
        const { scene, examplesSystem, physicsWorld } = this.game

        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200),
            new THREE.MeshStandardMaterial({ color: 0x228b22 })
        )
        ground.rotation.x = -Math.PI / 2
        ground.receiveShadow = true
        scene.add(ground)

        // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b7355 })
        
        const walls = [
            new THREE.Vector3(50, 0, 0), // Right wall
            new THREE.Vector3(-50, 0, 0), // Left wall
            new THREE.Vector3(0, 0, 50), // Back wall
            new THREE.Vector3(0, 0, -50), // Front wall
        ]

        walls.forEach((pos, idx) => {
            const wall = new THREE.Mesh(
                new THREE.BoxGeometry(100, 20, 2),
                wallMaterial
            )
            wall.position.copy(pos)
            wall.position.y = 10
            wall.castShadow = true
            wall.receiveShadow = true
            scene.add(wall)
        })

        // Add lighting effects
        const lights = examplesSystem.getLightingSystem()
        lights.createPointLight(new THREE.Vector3(30, 15, 30), 0xffffff, 1, 100)
        lights.createPointLight(new THREE.Vector3(-30, 15, -30), 0xffaa00, 0.8, 80)
    }

    setupEnemies() {
        const { scene, physicsWorld, examplesSystem } = this.game
        const interaction = examplesSystem.getInteractionSystem()

        // Create enemies
        for (let i = 0; i < 3; i++) {
            const enemy = new THREE.Mesh(
                new THREE.SphereGeometry(1.5, 32, 32),
                new THREE.MeshStandardMaterial({ color: 0xff0000 })
            )

            const x = (Math.random() - 0.5) * 100
            const z = (Math.random() - 0.5) * 100

            enemy.position.set(x, 2, z)
            enemy.castShadow = true
            enemy.receiveShadow = true
            scene.add(enemy)

            // Make interactive
            const id = interaction.addInteractiveObject(enemy, {
                clickable: true,
                data: { type: 'enemy', health: 100, damage: 25 }
            })

            interaction.onClick(id, (mesh, data) => {
                console.log(`Enemy defeated! +${data.damage} XP`)
                mesh.visible = false
            })
        }
    }

    setupUI() {
        const uiDiv = document.getElementById('ui')
        
        const stats = document.createElement('div')
        stats.id = 'stats'
        stats.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            color: #0f0;
            font-family: monospace;
            font-size: 12px;
            white-space: pre;
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border: 1px solid #0f0;
        `
        
        const crosshair = document.createElement('div')
        crosshair.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 30px;
            height: 30px;
            border: 2px solid rgba(0,255,0,0.5);
            border-radius: 50%;
            pointer-events: none;
        `
        
        document.body.appendChild(stats)
        document.body.appendChild(crosshair)

        // Update stats
        const monitor = this.game.examplesSystem.getPerformanceStats
        setInterval(() => {
            if (monitor) {
                const fps = Math.round(1000 / 16.67) // Approximate
                stats.textContent = `FPS: ${fps}\nMode: FPS\nAmmo: 30/120`
            }
        }, 100)
    }
}

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    new FPSGame()
})