import * as THREE from 'three'
import { Fighter3D } from '../fighters/Fighter3D.js'

export class PlayModeController {
    constructor(scene, camera, renderer) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.isPlaying = false
        this.savedCameraState = null
        this.player = null
        this.clock = new THREE.Clock()
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            run: false,
            attack: null
        }
        
        this.onPlayStart = null
        this.onPlayStop = null
        this.boundKeyDown = null
        this.boundKeyUp = null
        
        this.overlay = null
        this.createOverlay()
    }

    createOverlay() {
        this.overlay = document.createElement('div')
        this.overlay.id = 'play-mode-overlay'
        this.overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: none;
            pointer-events: none;
            font-family: 'Jost', sans-serif;
        `
        this.overlay.innerHTML = `
            <style>
                .play-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 12px 20px;
                    background: linear-gradient(180deg, rgba(110, 231, 183, 0.95) 0%, rgba(110, 231, 183, 0) 100%);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .play-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0e1220;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .play-title-icon {
                    width: 24px;
                    height: 24px;
                    background: #0e1220;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6ee7b7;
                    font-size: 12px;
                }
                .play-esc-hint {
                    font-size: 13px;
                    color: rgba(14, 18, 32, 0.7);
                }
                .play-esc-hint kbd {
                    background: rgba(14, 18, 32, 0.2);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                    margin-right: 4px;
                }
                .play-controls-panel {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    background: rgba(20, 26, 43, 0.9);
                    border: 1px solid rgba(110, 231, 183, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    color: #e8eaf6;
                    backdrop-filter: blur(10px);
                }
                .controls-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6ee7b7;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .controls-grid {
                    display: grid;
                    grid-template-columns: auto auto;
                    gap: 8px 20px;
                }
                .control-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }
                .control-key {
                    min-width: 32px;
                    height: 24px;
                    background: rgba(42, 49, 80, 0.8);
                    border: 1px solid #2a3150;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: monospace;
                    font-size: 11px;
                    color: #6ee7b7;
                }
                .control-key.active {
                    background: rgba(110, 231, 183, 0.3);
                    border-color: #6ee7b7;
                }
                .control-label {
                    color: #a5b4d0;
                }
                .play-hud {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 20px;
                }
                .hud-bar {
                    width: 180px;
                }
                .hud-bar-label {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 4px;
                }
                .health-label { color: #ef4444; }
                .stamina-label { color: #3b82f6; }
                .hud-bar-track {
                    height: 8px;
                    background: rgba(42, 49, 80, 0.8);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .hud-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s;
                }
                .health-fill { background: linear-gradient(90deg, #ef4444, #f87171); width: 100%; }
                .stamina-fill { background: linear-gradient(90deg, #3b82f6, #60a5fa); width: 100%; }
            </style>
            <div class="play-header">
                <div class="play-title">
                    <div class="play-title-icon">▶</div>
                    PLAY MODE
                </div>
                <div class="play-esc-hint"><kbd>ESC</kbd> Exit to Editor</div>
            </div>
            <div class="play-controls-panel">
                <div class="controls-title">Controls</div>
                <div class="controls-grid">
                    <div class="control-row"><span class="control-key" id="key-w">W</span><span class="control-label">Forward</span></div>
                    <div class="control-row"><span class="control-key" id="key-q">Q</span><span class="control-label">Light Attack</span></div>
                    <div class="control-row"><span class="control-key" id="key-s">S</span><span class="control-label">Backward</span></div>
                    <div class="control-row"><span class="control-key" id="key-e">E</span><span class="control-label">Heavy Attack</span></div>
                    <div class="control-row"><span class="control-key" id="key-a">A</span><span class="control-label">Strafe Left</span></div>
                    <div class="control-row"><span class="control-key" id="key-r">R</span><span class="control-label">Special</span></div>
                    <div class="control-row"><span class="control-key" id="key-d">D</span><span class="control-label">Strafe Right</span></div>
                    <div class="control-row"><span class="control-key" id="key-space">SPACE</span><span class="control-label">Jump</span></div>
                    <div class="control-row"><span class="control-key" id="key-shift">SHIFT</span><span class="control-label">Run</span></div>
                </div>
            </div>
            <div class="play-hud">
                <div class="hud-bar">
                    <div class="hud-bar-label health-label">Health</div>
                    <div class="hud-bar-track"><div class="hud-bar-fill health-fill" id="health-bar"></div></div>
                </div>
                <div class="hud-bar">
                    <div class="hud-bar-label stamina-label">Stamina</div>
                    <div class="hud-bar-track"><div class="hud-bar-fill stamina-fill" id="stamina-bar"></div></div>
                </div>
            </div>
        `
        document.body.appendChild(this.overlay)

        this.exitButton = document.createElement('button')
        this.exitButton.textContent = 'Stop'
        this.exitButton.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            font-family: 'Jost', sans-serif;
            font-weight: 600;
            font-size: 13px;
            z-index: 10001;
            display: none;
            pointer-events: auto;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            transition: transform 0.15s, box-shadow 0.15s;
        `
        this.exitButton.onmouseenter = () => {
            this.exitButton.style.transform = 'scale(1.05)'
            this.exitButton.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)'
        }
        this.exitButton.onmouseleave = () => {
            this.exitButton.style.transform = 'scale(1)'
            this.exitButton.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)'
        }
        this.exitButton.onclick = () => this.stopPlayMode()
        document.body.appendChild(this.exitButton)
    }

    updateKeyVisual(key, active) {
        const el = this.overlay?.querySelector(`#key-${key}`)
        if (el) {
            el.classList.toggle('active', active)
        }
    }

    updateHUD() {
        if (!this.player) return
        const healthBar = this.overlay?.querySelector('#health-bar')
        const staminaBar = this.overlay?.querySelector('#stamina-bar')
        if (healthBar) {
            const healthPercent = this.player.stats?.health / this.player.stats?.maxHealth * 100 || 100
            healthBar.style.width = `${healthPercent}%`
        }
        if (staminaBar) {
            const staminaPercent = this.player.stats?.stamina / this.player.stats?.maxStamina * 100 || 100
            staminaBar.style.width = `${staminaPercent}%`
        }
    }

    startPlayMode(spawnPoint = null) {
        if (this.isPlaying) return

        this.isPlaying = true
        
        this.savedCameraState = {
            position: this.camera.position.clone(),
            rotation: this.camera.rotation.clone(),
            target: this.camera.userData.target?.clone() || new THREE.Vector3()
        }

        const startPos = spawnPoint || this.findSpawnPoint() || new THREE.Vector3(0, 0, 0)

        this.player = new Fighter3D({
            isPlayer: true,
            color: 0x4ade80,
            startPosition: startPos,
            facingDirection: 1
        })
        
        this.scene.add(this.player.getMesh())

        this.camera.position.set(
            startPos.x,
            startPos.y + 5,
            startPos.z + 10
        )
        this.camera.lookAt(startPos)

        this.bindInput()

        this.overlay.style.display = 'block'
        this.exitButton.style.display = 'block'

        if (this.onPlayStart) {
            this.onPlayStart()
        }

        console.log('Play mode started')
    }

    stopPlayMode() {
        if (!this.isPlaying) return

        this.isPlaying = false

        if (this.player) {
            this.scene.remove(this.player.getMesh())
            this.player.dispose()
            this.player = null
        }

        if (this.savedCameraState) {
            this.camera.position.copy(this.savedCameraState.position)
            this.camera.rotation.copy(this.savedCameraState.rotation)
        }

        this.unbindInput()

        this.overlay.style.display = 'none'
        this.exitButton.style.display = 'none'

        if (this.onPlayStop) {
            this.onPlayStop()
        }

        console.log('Play mode stopped')
    }

    findSpawnPoint() {
        let spawnPoint = null
        
        this.scene.traverse(obj => {
            if (obj.userData?.type === 'spawn' || obj.name?.toLowerCase().includes('spawn')) {
                spawnPoint = obj.position.clone()
            }
        })

        return spawnPoint
    }

    bindInput() {
        this.boundKeyDown = (e) => this.handleKeyDown(e)
        this.boundKeyUp = (e) => this.handleKeyUp(e)

        document.addEventListener('keydown', this.boundKeyDown)
        document.addEventListener('keyup', this.boundKeyUp)
    }

    unbindInput() {
        if (this.boundKeyDown) {
            document.removeEventListener('keydown', this.boundKeyDown)
        }
        if (this.boundKeyUp) {
            document.removeEventListener('keyup', this.boundKeyUp)
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.stopPlayMode()
            return
        }

        switch (e.key.toLowerCase()) {
            case 'w': case 'arrowup': 
                this.input.forward = true
                this.updateKeyVisual('w', true)
                break
            case 's': case 'arrowdown': 
                this.input.backward = true
                this.updateKeyVisual('s', true)
                break
            case 'a': case 'arrowleft': 
                this.input.left = true
                this.updateKeyVisual('a', true)
                break
            case 'd': case 'arrowright': 
                this.input.right = true
                this.updateKeyVisual('d', true)
                break
            case ' ': 
                this.input.jump = true
                this.updateKeyVisual('space', true)
                break
            case 'shift': 
                this.input.run = true
                this.updateKeyVisual('shift', true)
                break
            case 'q': 
                this.input.attack = 'light'
                this.updateKeyVisual('q', true)
                break
            case 'e': 
                this.input.attack = 'heavy'
                this.updateKeyVisual('e', true)
                break
            case 'r': 
                this.input.attack = 'special'
                this.updateKeyVisual('r', true)
                break
        }
    }

    handleKeyUp(e) {
        switch (e.key.toLowerCase()) {
            case 'w': case 'arrowup': 
                this.input.forward = false
                this.updateKeyVisual('w', false)
                break
            case 's': case 'arrowdown': 
                this.input.backward = false
                this.updateKeyVisual('s', false)
                break
            case 'a': case 'arrowleft': 
                this.input.left = false
                this.updateKeyVisual('a', false)
                break
            case 'd': case 'arrowright': 
                this.input.right = false
                this.updateKeyVisual('d', false)
                break
            case ' ': 
                this.input.jump = false
                this.updateKeyVisual('space', false)
                break
            case 'shift': 
                this.input.run = false
                this.updateKeyVisual('shift', false)
                break
            case 'q':
                this.updateKeyVisual('q', false)
                break
            case 'e':
                this.updateKeyVisual('e', false)
                break
            case 'r':
                this.updateKeyVisual('r', false)
                break
        }
    }

    update() {
        if (!this.isPlaying || !this.player) return

        const deltaTime = this.clock.getDelta()

        const inputManager = {
            getMovementVector: () => {
                const vec = new THREE.Vector3()
                if (this.input.forward) vec.z -= 1
                if (this.input.backward) vec.z += 1
                if (this.input.left) vec.x -= 1
                if (this.input.right) vec.x += 1
                return vec.normalize()
            },
            isRunning: () => this.input.run,
            isJumpPressed: () => this.input.jump,
            isLightAttack: () => this.input.attack === 'light',
            isHeavyAttack: () => this.input.attack === 'heavy',
            isSpecialAttack: () => this.input.attack === 'special',
            isBlocking: () => false
        }

        this.player.update(deltaTime, inputManager, null)

        this.input.attack = null

        const playerPos = this.player.getPosition()
        const cameraOffset = new THREE.Vector3(0, 5, 10)
        const targetCameraPos = playerPos.clone().add(cameraOffset)
        
        this.camera.position.lerp(targetCameraPos, 0.1)
        this.camera.lookAt(playerPos.x, playerPos.y + 1, playerPos.z)

        this.updateHUD()
    }

    toggle() {
        if (this.isPlaying) {
            this.stopPlayMode()
        } else {
            this.startPlayMode()
        }
    }

    isInPlayMode() {
        return this.isPlaying
    }

    dispose() {
        this.stopPlayMode()
        this.overlay?.remove()
        this.exitButton?.remove()
    }
}
