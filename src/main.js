import * as THREE from 'three'
import { ArenaSceneManager } from './arena/ArenaSceneManager.js'
import { ArenaState } from './arena/ArenaGameState.js'
import { InputManager } from './core/InputManager.js'
import { UIManager } from './ui/UIManager.js'
import { GameState } from './core/GameState.js'
import { SceneDirector, SCENES } from './core/SceneDirector.js'
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js'
import { WorldBuilderScene } from './scenes/WorldBuilderScene.js'
import { gameActionBars } from './ui/GameActionBars.js'
import { initializeGrudgeNetwork, grudgeNetwork, leaderboardService } from './network/index.js'
import { networkUI } from './network/NetworkUI.js'

class GrudgeArena3D {
  constructor() {
    this.canvas = document.querySelector('canvas.webgl')
    this.renderer = null
    this.camera = null
    this.arena = null
    this.input = null
    this.ui = null
    this.isRunning = false
    this.isTargetLocked = false
    this.targetIndicator = null
    this.sceneDirector = null
    this.characterSelect = null
    this.worldBuilder = null
    this.currentMode = 'menu'
  }
  
  async init() {
    this.setupRenderer()
    this.setupCamera()
    
    this.input = new InputManager()
    this.ui = new UIManager()
    
    this.ui.init({
      onEnterArena: () => this.enterCharacterSelect(),
      onStartMatch: () => this.startMatch(),
      onWorldBuilder: () => this.enterWorldBuilder(),
      onResume: () => this.resume(),
      onQuit: () => this.quit(),
      onPause: () => this.togglePause()
    })
    
    this.sceneDirector = new SceneDirector(this.renderer, this.camera)
    
    this.characterSelect = new CharacterSelectScene()
    this.characterSelect.onConfirm = (selection) => this.startMatchWithSelection(selection)
    this.characterSelect.onBack = () => this.returnToMenu()
    this.sceneDirector.registerScene(SCENES.CHARACTER_SELECT, this.characterSelect)
    
    this.worldBuilder = new WorldBuilderScene(this.renderer)
    this.worldBuilder.onBack = () => this.returnToMenu()
    this.sceneDirector.registerScene(SCENES.WORLD_BUILDER, this.worldBuilder)
    
    this.arena = new ArenaSceneManager(this.renderer, this.camera)
    
    this.arena.callbacks.onLoadProgress = (percent, status) => {
      this.ui.updateLoadingProgress(percent, status)
    }
    
    this.arena.callbacks.onStateChange = (state, data) => {
      const legacyState = this.mapArenaStateToGameState(state)
      this.ui.onStateChange(legacyState)
    }
    
    this.arena.callbacks.onHealthUpdate = (p1, p2, timer) => {
      this.ui.updateHealth(p1, p2, timer)
    }
    
    this.arena.callbacks.onRoundEnd = (roundNumber, playerWon, scores) => {
      this.ui.updateRound(roundNumber, scores)
      this.ui.showRoundEnd(playerWon)
    }
    
    this.arena.callbacks.onMatchEnd = async (playerWon, scores) => {
      this.ui.showMatchEnd(playerWon, scores)
      
      if (grudgeNetwork.isConnected) {
        const winnerId = playerWon ? grudgeNetwork.currentUser?.uuid : 'ai_opponent'
        const loserId = playerWon ? 'ai_opponent' : grudgeNetwork.currentUser?.uuid
        await leaderboardService.recordMatch(winnerId, loserId, { scores })
        
        if (playerWon) {
          await leaderboardService.submitScore('arena_wins', scores.player)
        }
      }
    }
    
    this.arena.callbacks.onCameraModeChange = (mode, name) => {
      this.updateCameraModeDisplay(name)
    }
    
    this.ui.updateLoadingProgress(10, 'Initializing...')
    
    this.ui.updateLoadingProgress(15, 'Connecting to Grudge Network...')
    await initializeGrudgeNetwork()
    networkUI.create()
    
    await this.arena.init()
    
    window.addEventListener('resize', () => this.onResize())
    
    this.targetIndicator = document.getElementById('target-indicator')
    this.cameraModeIndicator = document.getElementById('camera-mode')
    
    this.isRunning = true
    this.animate()
  }
  
  updateCameraModeDisplay(modeName) {
    if (this.cameraModeIndicator) {
      this.cameraModeIndicator.textContent = modeName
      this.cameraModeIndicator.classList.remove('hidden')
      this.cameraModeIndicator.classList.add('show')
      
      clearTimeout(this.cameraModeTimeout)
      this.cameraModeTimeout = setTimeout(() => {
        this.cameraModeIndicator.classList.remove('show')
      }, 2000)
    }
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    )
  }
  
  async enterCharacterSelect() {
    this.currentMode = 'character_select'
    this.ui.hideAllScreens()
    await this.sceneDirector.switchTo(SCENES.CHARACTER_SELECT, { camera: this.camera })
  }
  
  async enterWorldBuilder() {
    this.currentMode = 'world_builder'
    this.ui.hideAllScreens()
    this.camera.position.set(20, 20, 20)
    this.camera.lookAt(0, 0, 0)
    await this.sceneDirector.switchTo(SCENES.WORLD_BUILDER, { camera: this.camera })
  }
  
  async startMatchWithSelection(selection) {
    console.log('[ARENA] Starting match with selection:', selection)
    localStorage.setItem('grudge_match_selection', JSON.stringify(selection))
    
    try {
      this.currentMode = 'arena'
      console.log('[ARENA] Mode set to arena, exiting character select scene...')
      await this.sceneDirector.switchTo(null)
      console.log('[ARENA] Scene director cleared, starting match...')
      
      this.ui.hideAllScreens()
      
      this.startMatch()
      console.log('[ARENA] Match started successfully')
    } catch (error) {
      console.error('[ARENA] Error starting match:', error)
    }
  }
  
  async returnToMenu() {
    this.currentMode = 'menu'
    await this.sceneDirector.switchTo(null)
    this.cleanupSceneUI()
    this.ui.showScreen('menu')
  }
  
  cleanupSceneUI() {
    const sceneUIs = ['character-select-ui', 'world-builder-ui']
    sceneUIs.forEach(id => {
      const el = document.getElementById(id)
      if (el) {
        console.log(`[Main] Cleaning up stray UI: ${id}`)
        el.remove()
      }
    })
  }
  
  startMatch() {
    console.log('[ARENA] startMatch() called')
    this.currentMode = 'arena'
    this.cleanupSceneUI()
    
    this.camera.position.set(0, 15, 25)
    this.camera.lookAt(0, 0, 0)
    
    try {
      this.canvas.requestPointerLock()
    } catch (e) {
      console.warn('[ARENA] Pointer lock failed:', e.message)
    }
    
    console.log('[ARENA] Calling arena.startMatch()...')
    this.arena.startMatch()
    
    this.ui.showScreen('hud')
    this.ui.showRoundStart(1)
    
    gameActionBars.init()
    gameActionBars.onAbilityUse = (ability) => {
      console.log('[Main] Ability used:', ability.name)
      if (this.arena && this.arena.player) {
        this.arena.player.useAbility(ability.id)
      }
    }
    
    console.log('[ARENA] Match initialization complete')
  }
  
  mapArenaStateToGameState(arenaState) {
    const stateMap = {
      [ArenaState.INITIALIZING]: GameState.LOADING,
      [ArenaState.LOADING]: GameState.LOADING,
      [ArenaState.MENU]: GameState.MENU,
      [ArenaState.COUNTDOWN]: GameState.PLAYING,
      [ArenaState.FIGHTING]: GameState.PLAYING,
      [ArenaState.ROUND_END]: GameState.ROUND_END,
      [ArenaState.MATCH_END]: GameState.MATCH_END,
      [ArenaState.PAUSED]: GameState.PAUSED
    }
    return stateMap[arenaState] || GameState.MENU
  }
  
  togglePause() {
    const state = this.arena.getState()
    
    if (state === ArenaState.FIGHTING) {
      this.arena.pause()
      document.exitPointerLock()
    } else if (state === ArenaState.PAUSED) {
      this.resume()
    }
  }
  
  resume() {
    this.canvas.requestPointerLock()
    this.arena.resume()
  }
  
  quit() {
    document.exitPointerLock()
    this.arena.quit()
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  
  animate() {
    if (!this.isRunning) return
    
    requestAnimationFrame(() => this.animate())
    
    if (this.currentMode === 'menu') {
      return
    }
    
    if (this.currentMode === 'character_select' || this.currentMode === 'world_builder') {
      const delta = 1/60
      this.sceneDirector.update(delta)
      this.sceneDirector.render()
      this.input.update()
      return
    }
    
    if (this.currentMode === 'arena') {
      if (!this._arenaLogged) {
        console.log('[ANIMATE] Arena mode active, calling arena.update()')
        console.log('[ANIMATE] Arena state:', this.arena.getState())
        console.log('[ANIMATE] Arena scene children:', this.arena.scene?.children?.length)
        this._arenaLogged = true
      }
      
      if (this.input.isTabTargetPressed()) {
        this.isTargetLocked = !this.isTargetLocked
        if (this.targetIndicator) {
          this.targetIndicator.classList.toggle('hidden', !this.isTargetLocked)
        }
      }
      
      const cameraModePressed = this.input.getCameraModePressed()
      if (cameraModePressed !== null) {
        this.arena.setCameraMode(cameraModePressed)
      }
      
      this.arena.update(this.input, this.isTargetLocked)
    }
    
    this.input.update()
  }
  
  dispose() {
    this.isRunning = false
    this.arena.dispose()
    this.renderer.dispose()
  }
}

const game = new GrudgeArena3D()
game.init().catch(console.error)
