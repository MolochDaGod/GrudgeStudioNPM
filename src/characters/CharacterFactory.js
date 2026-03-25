import * as THREE from 'three'
import { CharacterAssembler, createCharacterFromConfig } from './CharacterAssembler.js'
import { characterConfigManager, CHARACTER_PRESETS } from './CharacterConfig.js'
import { modularCharacterSystem } from './ModularCharacterSystem.js'
import { assetLoader } from './AssetLoader.js'
import { EventEmitter } from '../core/EventEmitter.js'

export class CharacterFactory {
    constructor() {
        this.events = new EventEmitter()
        this.activeCharacters = new Map()
        this.loadingScreen = null
        this.setupProgressListeners()
    }

    setupProgressListeners() {
        modularCharacterSystem.events.on('loadStart', ({ asset }) => {
            this.updateLoadingProgress(0.1, `Loading: ${asset}`)
        })

        modularCharacterSystem.events.on('loadComplete', ({ asset }) => {
            this.updateLoadingProgress(0.5, `Loaded: ${asset}`)
        })

        modularCharacterSystem.events.on('loadError', ({ asset, error }) => {
            console.warn(`Failed to load ${asset}:`, error)
        })

        assetLoader.events.on('fetchStart', ({ url }) => {
            this.updateLoadingProgress(0.2, `Fetching: ${url.split('/').pop()}`)
        })

        assetLoader.events.on('fetchComplete', ({ url }) => {
            this.updateLoadingProgress(0.6, `Fetched: ${url.split('/').pop()}`)
        })
    }

    createLoadingScreen() {
        const container = document.createElement('div')
        container.id = 'character-loading-screen'
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 10, 21, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            color: white;
        `

        const title = document.createElement('h2')
        title.textContent = 'Loading Character'
        title.style.cssText = 'margin-bottom: 20px; color: #6ee7b7;'
        container.appendChild(title)

        const progressContainer = document.createElement('div')
        progressContainer.style.cssText = `
            width: 300px;
            height: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            overflow: hidden;
        `

        const progressBar = document.createElement('div')
        progressBar.id = 'character-progress-bar'
        progressBar.style.cssText = `
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #6ee7b7, #34d399);
            border-radius: 4px;
            transition: width 0.2s ease;
        `
        progressContainer.appendChild(progressBar)
        container.appendChild(progressContainer)

        const statusText = document.createElement('p')
        statusText.id = 'character-status-text'
        statusText.style.cssText = 'margin-top: 15px; color: #94a3b8; font-size: 14px;'
        statusText.textContent = 'Initializing...'
        container.appendChild(statusText)

        this.loadingScreen = container
        return container
    }

    showLoadingScreen() {
        if (!this.loadingScreen) {
            this.createLoadingScreen()
        }
        document.body.appendChild(this.loadingScreen)
    }

    hideLoadingScreen() {
        if (this.loadingScreen && this.loadingScreen.parentNode) {
            this.loadingScreen.parentNode.removeChild(this.loadingScreen)
        }
    }

    updateLoadingProgress(progress, status) {
        const progressBar = document.getElementById('character-progress-bar')
        const statusText = document.getElementById('character-status-text')
        
        if (progressBar) {
            progressBar.style.width = `${Math.round(progress * 100)}%`
        }
        if (statusText) {
            statusText.textContent = status
        }
    }

    async createFromPreset(presetName, options = {}) {
        const preset = CHARACTER_PRESETS[presetName]
        if (!preset) {
            throw new Error(`Preset not found: ${presetName}`)
        }

        const config = characterConfigManager.createConfig({
            ...preset,
            ...options
        })

        return this.createFromConfig(config.id)
    }

    async createFromConfig(configId, showLoading = true) {
        const config = characterConfigManager.getConfig(configId)
        if (!config) {
            throw new Error(`Config not found: ${configId}`)
        }

        if (showLoading) {
            this.showLoadingScreen()
            this.updateLoadingProgress(0, 'Loading character base...')
        }

        try {
            this.updateLoadingProgress(0.2, 'Loading model...')
            
            const { character, assembler } = await createCharacterFromConfig(config)
            
            this.updateLoadingProgress(0.6, 'Applying parts...')
            
            await this.applyAppearance(character, config.appearance)
            
            this.updateLoadingProgress(0.8, 'Setting up animations...')
            
            const characterData = {
                id: configId,
                group: character,
                assembler,
                config,
                stats: { ...config.stats }
            }
            
            this.activeCharacters.set(configId, characterData)
            
            this.updateLoadingProgress(1.0, 'Complete!')
            
            await new Promise(resolve => setTimeout(resolve, 300))
            
            this.events.emit('characterCreated', characterData)
            
            return characterData
        } catch (error) {
            this.events.emit('characterError', { configId, error })
            throw error
        } finally {
            if (showLoading) {
                this.hideLoadingScreen()
            }
        }
    }

    async createQuick(basePath, options = {}) {
        const config = {
            name: options.name || 'Quick Character',
            base: basePath,
            scale: options.scale || 1.0,
            position: options.position || { x: 0, y: 0, z: 0 }
        }

        const { character, assembler } = await createCharacterFromConfig(config)
        
        return {
            group: character,
            assembler,
            config
        }
    }

    applyAppearance(character, appearance) {
        if (!appearance) return

        character.traverse(child => {
            if (child.isMesh && child.material) {
                if (appearance.skinColor && child.name.toLowerCase().includes('skin')) {
                    child.material.color = new THREE.Color(appearance.skinColor)
                }
                if (appearance.hairColor && child.name.toLowerCase().includes('hair')) {
                    child.material.color = new THREE.Color(appearance.hairColor)
                }
            }
        })

        if (appearance.scale) {
            character.scale.setScalar(appearance.scale)
        }
    }

    getCharacter(id) {
        return this.activeCharacters.get(id) || null
    }

    disposeCharacter(id) {
        const characterData = this.activeCharacters.get(id)
        if (characterData) {
            characterData.assembler.dispose()
            this.activeCharacters.delete(id)
            this.events.emit('characterDisposed', { id })
        }
    }

    disposeAll() {
        for (const [id] of this.activeCharacters) {
            this.disposeCharacter(id)
        }
    }

    async preloadAssets(assetList) {
        this.showLoadingScreen()
        this.updateLoadingProgress(0, 'Preloading assets...')

        try {
            await modularCharacterSystem.preloadAssets(assetList, (progress, asset) => {
                this.updateLoadingProgress(progress, `Loading: ${asset}`)
            })
        } finally {
            this.hideLoadingScreen()
        }
    }
}

export const characterFactory = new CharacterFactory()
