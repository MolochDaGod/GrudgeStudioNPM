/**
 * Grudge Studio - RPG Adventure Game Example
 * Third-person adventure with terrain, NPCs, and interactive objects
 */

import * as THREE from 'three'
import { 
    QuickSetup, 
    ProceduralTerrain, 
    InteractiveObjectSystem,
    AdvancedLightingSystem
} from '../tools/index.js'

class RPGGame {
    constructor() {
        this.canvas = document.querySelector('canvas')
        this.inventory = []
        this.gold = 0
        this.setupGame()
    }

    async setupGame() {
        // Third-person adventure setup
        this.player = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.5, 1.8),
            new THREE.MeshStandardMaterial({ color: 0x8888ff })
        )
        this.player.position.set(0, 5, 0)
        this.player.castShadow = true

        this.game = QuickSetup.createAdventureGame(this.canvas, this.player, {
            followSpeed: 5,
            rotationSpeed: 3
        })

        this.game.scene.add(this.player)

        // Setup world
        this.setupTerrain()
        this.setupNPCs()
        this.setupItems()
        this.setupUI()

        console.log('RPG Game initialized')
    }

    setupTerrain() {
        const { scene, examplesSystem } = this.game

        // Generate procedural terrain
        const terrain = new ProceduralTerrain({
            size: 200,
            segments: 64,
            heightScale: 20
        })

        scene.add(terrain.mesh)

        // Store for height sampling
        this.terrain = terrain

        // Add trees
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 150
            const z = (Math.random() - 0.5) * 150
            const height = terrain.getHeightAt(x, z)

            const tree = new THREE.Mesh(
                new THREE.ConeGeometry(2, 8, 8),
                new THREE.MeshStandardMaterial({ color: 0x228b22 })
            )
            tree.position.set(x, height + 4, z)
            tree.castShadow = true
            tree.receiveShadow = true
            scene.add(tree)
        }

        // Add dynamic lighting
        const lights = examplesSystem.getLightingSystem()
        lights.createPointLight(
            new THREE.Vector3(40, 30, 40),
            0xffffff,
            2,
            200
        )
    }

    setupNPCs() {
        const { scene, examplesSystem } = this.game
        const interaction = examplesSystem.getInteractionSystem()

        const npcs = [
            { name: 'Guard', pos: [20, 5, 20], color: 0xff4444, dialog: 'Hail, traveler!' },
            { name: 'Merchant', pos: [-30, 5, -30], color: 0xffaa00, dialog: 'Buy something?' },
            { name: 'Sage', pos: [0, 5, 40], color: 0x8800ff, dialog: 'Seek wisdom.' }
        ]

        npcs.forEach(npc => {
            const npcMesh = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.4, 1.5),
                new THREE.MeshStandardMaterial({ color: npc.color })
            )

            const height = this.terrain.getHeightAt(npc.pos[0], npc.pos[2])
            npcMesh.position.set(npc.pos[0], height + 0.75, npc.pos[2])
            npcMesh.castShadow = true
            scene.add(npcMesh)

            // Make interactive
            const id = interaction.addInteractiveObject(npcMesh, {
                hoverable: true,
                clickable: true,
                data: { name: npc.name, dialog: npc.dialog }
            })

            interaction.onClick(id, (mesh, data) => {
                this.showDialog(data.name, data.dialog)
            })
        })
    }

    setupItems() {
        const { scene, examplesSystem } = this.game
        const interaction = examplesSystem.getInteractionSystem()

        // Create treasure chests
        for (let i = 0; i < 3; i++) {
            const x = (Math.random() - 0.5) * 150
            const z = (Math.random() - 0.5) * 150
            const height = this.terrain.getHeightAt(x, z)

            const chest = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshStandardMaterial({ color: 0xffaa00 })
            )

            chest.position.set(x, height + 0.5, z)
            chest.castShadow = true
            chest.receiveShadow = true
            scene.add(chest)

            const id = interaction.addInteractiveObject(chest, {
                clickable: true,
                data: { treasure: Math.floor(Math.random() * 100) + 50, item: 'Potion' }
            })

            interaction.onClick(id, (mesh, data) => {
                this.gold += data.treasure
                this.inventory.push(data.item)
                mesh.visible = false
                this.showNotification(`Collected ${data.treasure} gold!`)
            })
        }
    }

    showDialog(npcName, dialog) {
        const dialogBox = document.getElementById('dialog') || document.createElement('div')
        dialogBox.id = 'dialog'
        dialogBox.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(0,0,0,0.9);
            color: #0f0;
            padding: 20px;
            border: 2px solid #0f0;
            font-family: Arial;
            max-width: 400px;
        `
        dialogBox.innerHTML = `<strong>${npcName}:</strong> ${dialog}`
        
        if (!dialogBox.parentElement) {
            document.body.appendChild(dialogBox)
        }

        setTimeout(() => dialogBox.remove(), 3000)
    }

    showNotification(message) {
        const notif = document.createElement('div')
        notif.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0,255,0,0.2);
            color: #0f0;
            padding: 10px 20px;
            border: 1px solid #0f0;
            font-family: Arial;
            animation: fadeOut 2s forwards;
        `
        notif.textContent = message
        document.body.appendChild(notif)

        const style = document.createElement('style')
        style.textContent = `
            @keyframes fadeOut {
                to { opacity: 0; transform: translateY(-20px); }
            }
        `
        document.head.appendChild(style)

        setTimeout(() => notif.remove(), 2000)
    }

    setupUI() {
        const ui = document.getElementById('ui')
        ui.innerHTML = `
            <div style="color: #0f0; font-family: monospace; font-size: 14px;">
                <div>Gold: <span id="gold">0</span></div>
                <div>Items: <span id="items">0</span></div>
                <div style="margin-top: 10px; font-size: 12px;">WASD - Move | Mouse - Look | Click - Interact</div>
            </div>
        `

        // Update UI
        setInterval(() => {
            document.getElementById('gold').textContent = this.gold
            document.getElementById('items').textContent = this.inventory.length
        }, 100)
    }
}

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
    new RPGGame()
})