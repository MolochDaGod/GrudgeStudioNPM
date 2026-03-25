import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'

export class TargetingSystem {
    constructor(scene, camera, renderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        
        this.currentTarget = null
        this.potentialTargets = []
        this.targetIndex = 0
        this.isLocked = false
        this.maxTargetDistance = 50
        this.targetAngle = Math.PI / 3
        
        this.composer = null
        this.outlinePass = null
        this.targetUI = null
        
        this.onTargetChange = null
        this.onTargetLock = null
        this.onTargetLost = null
        
        this.setupPostProcessing()
        this.createTargetUI()
    }

    setupPostProcessing() {
        const size = this.renderer.getSize(new THREE.Vector2())
        
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))
        
        this.outlinePass = new OutlinePass(
            new THREE.Vector2(size.x, size.y),
            this.scene,
            this.camera
        )
        
        this.outlinePass.edgeStrength = 4
        this.outlinePass.edgeGlow = 0.5
        this.outlinePass.edgeThickness = 2
        this.outlinePass.pulsePeriod = 2
        this.outlinePass.visibleEdgeColor.set(0xef4444)
        this.outlinePass.hiddenEdgeColor.set(0x8b0000)
        
        this.composer.addPass(this.outlinePass)
        
        const gammaPass = new ShaderPass(GammaCorrectionShader)
        this.composer.addPass(gammaPass)
    }

    createTargetUI() {
        this.targetUI = document.createElement('div')
        this.targetUI.id = 'targeting-ui'
        this.targetUI.innerHTML = `
            <style>
                #targeting-ui { position: fixed; pointer-events: none; z-index: 150; }
                .target-reticle { position: fixed; width: 80px; height: 80px; pointer-events: none; display: none; }
                .target-reticle.active { display: block; }
                .target-reticle-inner { position: absolute; inset: 0; border: 2px solid #ef4444; border-radius: 50%; animation: targetPulse 1.5s infinite; }
                .target-reticle-corners { position: absolute; inset: 4px; }
                .target-reticle-corners::before, .target-reticle-corners::after { content: ''; position: absolute; width: 12px; height: 12px; border-color: #ef4444; border-style: solid; }
                .target-reticle-corners::before { top: 0; left: 0; border-width: 3px 0 0 3px; }
                .target-reticle-corners::after { bottom: 0; right: 0; border-width: 0 3px 3px 0; }
                .target-reticle-corners-2 { position: absolute; inset: 4px; }
                .target-reticle-corners-2::before, .target-reticle-corners-2::after { content: ''; position: absolute; width: 12px; height: 12px; border-color: #ef4444; border-style: solid; }
                .target-reticle-corners-2::before { top: 0; right: 0; border-width: 3px 3px 0 0; }
                .target-reticle-corners-2::after { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
                .target-info { position: fixed; top: 60px; left: 50%; transform: translateX(-50%); background: rgba(20, 26, 43, 0.9); border: 2px solid #ef4444; border-radius: 8px; padding: 10px 20px; display: none; text-align: center; }
                .target-info.active { display: block; }
                .target-name { color: #ef4444; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
                .target-health-bar { width: 150px; height: 8px; background: #1a1a2e; border-radius: 4px; overflow: hidden; }
                .target-health-fill { height: 100%; background: linear-gradient(90deg, #ef4444, #dc2626); transition: width 0.2s; }
                .target-distance { color: #a5b4d0; font-size: 11px; margin-top: 4px; }
                @keyframes targetPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
                .target-locked-text { position: fixed; top: 100px; left: 50%; transform: translateX(-50%); color: #ef4444; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: none; }
                .target-locked-text.active { display: block; animation: fadeInOut 2s; }
                @keyframes fadeInOut { 0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
            </style>
            <div class="target-reticle" id="target-reticle">
                <div class="target-reticle-inner"></div>
                <div class="target-reticle-corners"></div>
                <div class="target-reticle-corners-2"></div>
            </div>
            <div class="target-info" id="target-info">
                <div class="target-name" id="target-name">Enemy</div>
                <div class="target-health-bar">
                    <div class="target-health-fill" id="target-health-fill" style="width: 100%"></div>
                </div>
                <div class="target-distance" id="target-distance">0m</div>
            </div>
            <div class="target-locked-text" id="target-locked-text">TARGET LOCKED</div>
        `
        document.body.appendChild(this.targetUI)
        
        this.reticle = document.getElementById('target-reticle')
        this.targetInfo = document.getElementById('target-info')
        this.targetName = document.getElementById('target-name')
        this.targetHealthFill = document.getElementById('target-health-fill')
        this.targetDistance = document.getElementById('target-distance')
        this.lockedText = document.getElementById('target-locked-text')
    }

    registerTarget(object, data = {}) {
        object.userData.targetable = true
        object.userData.targetData = {
            name: data.name || 'Enemy',
            health: data.health || 100,
            maxHealth: data.maxHealth || 100,
            faction: data.faction || 'enemy',
            ...data
        }
        this.potentialTargets.push(object)
    }

    unregisterTarget(object) {
        const idx = this.potentialTargets.indexOf(object)
        if (idx > -1) {
            this.potentialTargets.splice(idx, 1)
            if (this.currentTarget === object) {
                this.clearTarget()
            }
        }
    }

    findNearestTarget(playerPosition, playerForward) {
        let nearest = null
        let nearestScore = Infinity

        for (const target of this.potentialTargets) {
            if (!target.userData.targetable) continue
            
            const targetPos = new THREE.Vector3()
            target.getWorldPosition(targetPos)
            
            const distance = playerPosition.distanceTo(targetPos)
            if (distance > this.maxTargetDistance) continue
            
            const toTarget = targetPos.clone().sub(playerPosition).normalize()
            const angle = Math.acos(playerForward.dot(toTarget))
            if (angle > this.targetAngle) continue
            
            const score = distance + angle * 20
            if (score < nearestScore) {
                nearestScore = score
                nearest = target
            }
        }

        return nearest
    }

    cycleTarget(direction = 1) {
        if (this.potentialTargets.length === 0) return

        this.targetIndex = (this.targetIndex + direction + this.potentialTargets.length) % this.potentialTargets.length
        this.setTarget(this.potentialTargets[this.targetIndex])
    }

    setTarget(object) {
        if (this.currentTarget === object) return

        this.currentTarget = object
        
        if (object) {
            const meshes = []
            if (object.isMesh) {
                meshes.push(object)
            } else {
                object.traverse(child => {
                    if (child.isMesh) meshes.push(child)
                })
            }
            this.outlinePass.selectedObjects = meshes
            
            this.reticle.classList.add('active')
            this.targetInfo.classList.add('active')
            
            const data = object.userData.targetData
            if (data) {
                this.targetName.textContent = data.name
                this.updateTargetHealth(data.health, data.maxHealth)
            }
            
            if (this.onTargetChange) this.onTargetChange(object)
        } else {
            this.clearTarget()
        }
    }

    lockTarget() {
        if (this.currentTarget) {
            this.isLocked = true
            this.lockedText.classList.add('active')
            setTimeout(() => this.lockedText.classList.remove('active'), 2000)
            if (this.onTargetLock) this.onTargetLock(this.currentTarget)
        }
    }

    unlockTarget() {
        this.isLocked = false
    }

    toggleLock() {
        if (this.isLocked) {
            this.unlockTarget()
        } else {
            this.lockTarget()
        }
    }

    clearTarget() {
        this.currentTarget = null
        this.isLocked = false
        this.outlinePass.selectedObjects = []
        this.reticle.classList.remove('active')
        this.targetInfo.classList.remove('active')
        if (this.onTargetLost) this.onTargetLost()
    }

    updateTargetHealth(health, maxHealth) {
        const percent = Math.max(0, Math.min(100, (health / maxHealth) * 100))
        this.targetHealthFill.style.width = `${percent}%`
    }

    update(playerPosition) {
        if (!this.currentTarget) return

        const targetPos = new THREE.Vector3()
        this.currentTarget.getWorldPosition(targetPos)
        
        const distance = playerPosition.distanceTo(targetPos)
        this.targetDistance.textContent = `${distance.toFixed(1)}m`
        
        if (distance > this.maxTargetDistance && !this.isLocked) {
            this.clearTarget()
            return
        }
        
        const screenPos = targetPos.clone().project(this.camera)
        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth
        const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight
        
        if (screenPos.z > 0 && screenPos.z < 1) {
            this.reticle.style.left = `${x - 40}px`
            this.reticle.style.top = `${y - 40}px`
        } else {
            this.reticle.classList.remove('active')
        }
    }

    render() {
        if (this.composer) {
            this.composer.render()
            return true
        }
        return false
    }

    onResize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height)
        }
        if (this.outlinePass) {
            this.outlinePass.resolution.set(width, height)
        }
    }

    destroy() {
        this.targetUI?.remove()
        this.potentialTargets = []
        this.currentTarget = null
    }
}
