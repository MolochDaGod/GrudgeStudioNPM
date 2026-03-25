/*
    GRUDGE Studio - Script Manager
    Handles loading, caching, and lifecycle of Lua scripts
*/

import { luaEngine } from './LuaEngine.js'

export class ScriptManager {
    constructor() {
        this.loadedScripts = new Map()
        this.scriptPaths = {
            weapons: '/scripts/weapons/',
            abilities: '/scripts/abilities/',
            characters: '/scripts/characters/',
            core: '/scripts/core/'
        }
        this.initialized = false
    }

    async init(gameContext = {}) {
        luaEngine.init(gameContext)
        await this.loadCoreScripts()
        this.initialized = true
        console.log('[ScriptManager] Initialized')
        return this
    }

    async loadCoreScripts() {
        const coreScripts = [
            'utils.lua',
            'events.lua'
        ]

        for (const script of coreScripts) {
            try {
                await this.loadScript('core', script)
            } catch (e) {
                console.warn(`[ScriptManager] Core script not found: ${script}`)
            }
        }
    }

    async loadScript(category, filename) {
        const path = this.scriptPaths[category] + filename
        const key = `${category}/${filename}`

        if (this.loadedScripts.has(key)) {
            return this.loadedScripts.get(key)
        }

        try {
            const response = await fetch(path)
            if (!response.ok) {
                throw new Error(`Failed to fetch ${path}: ${response.status}`)
            }
            
            const code = await response.text()
            const success = luaEngine.loadScript(key, code)
            
            if (success) {
                const scriptInfo = {
                    key,
                    category,
                    filename,
                    code,
                    loaded: true
                }
                this.loadedScripts.set(key, scriptInfo)
                return scriptInfo
            }
            
            throw new Error('Script load failed')
        } catch (e) {
            console.error(`[ScriptManager] Failed to load ${path}:`, e)
            return null
        }
    }

    async loadWeaponScript(filename) {
        return this.loadScript('weapons', filename)
    }

    async loadAbilityScript(filename) {
        return this.loadScript('abilities', filename)
    }

    async loadCharacterScript(filename) {
        return this.loadScript('characters', filename)
    }

    runScript(key) {
        if (!this.loadedScripts.has(key)) {
            console.error(`[ScriptManager] Script not loaded: ${key}`)
            return false
        }
        return luaEngine.runScript(key)
    }

    executeCode(code) {
        return luaEngine.execute(code)
    }

    callScriptFunction(funcName, ...args) {
        return luaEngine.callFunction(funcName, ...args)
    }

    updateContext(context) {
        luaEngine.updateContext(context)
    }

    on(eventName, callback) {
        luaEngine.on(eventName, callback)
    }

    getLoadedScripts() {
        return Array.from(this.loadedScripts.keys())
    }

    unloadScript(key) {
        this.loadedScripts.delete(key)
    }

    reloadScript(key) {
        const script = this.loadedScripts.get(key)
        if (script) {
            this.loadedScripts.delete(key)
            return this.loadScript(script.category, script.filename)
        }
        return null
    }

    dispose() {
        this.loadedScripts.clear()
        luaEngine.dispose()
        this.initialized = false
    }
}

export const scriptManager = new ScriptManager()
