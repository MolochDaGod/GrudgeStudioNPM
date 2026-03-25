/*
    GRUDGE Studio - Lua Scripting Engine
    Uses Fengari to run Lua scripts in the browser
    Provides game API bindings for weapons, abilities, and characters
*/

import fengari from 'fengari-web'

const lua = fengari.lua
const lauxlib = fengari.lauxlib
const lualib = fengari.lualib

export class LuaEngine {
    constructor() {
        this.L = null
        this.scripts = new Map()
        this.gameContext = null
        this.eventHandlers = new Map()
        this.initialized = false
    }

    init(gameContext = {}) {
        this.L = lauxlib.luaL_newstate()
        lualib.luaL_openlibs(this.L)
        this.gameContext = gameContext
        
        this.registerCoreAPI()
        this.registerMathAPI()
        this.registerPlayerAPI()
        this.registerCombatAPI()
        this.registerAnimationAPI()
        this.registerGameAPI()
        
        this.initialized = true
        console.log('[LuaEngine] Initialized with Fengari')
        return this
    }

    registerCoreAPI() {
        const L = this.L

        lua.lua_newtable(L)

        this.registerFunction('log', (msg) => {
            console.log('[Lua]', msg)
        })

        this.registerFunction('warn', (msg) => {
            console.warn('[Lua]', msg)
        })

        this.registerFunction('error', (msg) => {
            console.error('[Lua]', msg)
        })

        this.registerFunction('emit', (eventName, data) => {
            this.emit(eventName, data)
        })

        this.registerFunction('on', (eventName, callback) => {
            this.on(eventName, callback)
        })

        lua.lua_setglobal(L, fengari.to_luastring('Core'))
    }

    registerMathAPI() {
        const L = this.L

        lua.lua_newtable(L)

        this.pushFunction(L, 'vec3', () => {
            const x = lauxlib.luaL_optnumber(L, 1, 0)
            const y = lauxlib.luaL_optnumber(L, 2, 0)
            const z = lauxlib.luaL_optnumber(L, 3, 0)
            
            lua.lua_newtable(L)
            lua.lua_pushnumber(L, x)
            lua.lua_setfield(L, -2, fengari.to_luastring('x'))
            lua.lua_pushnumber(L, y)
            lua.lua_setfield(L, -2, fengari.to_luastring('y'))
            lua.lua_pushnumber(L, z)
            lua.lua_setfield(L, -2, fengari.to_luastring('z'))
            return 1
        })

        this.pushFunction(L, 'distance', () => {
            const ax = lauxlib.luaL_checknumber(L, 1)
            const ay = lauxlib.luaL_checknumber(L, 2)
            const az = lauxlib.luaL_checknumber(L, 3)
            const bx = lauxlib.luaL_checknumber(L, 4)
            const by = lauxlib.luaL_checknumber(L, 5)
            const bz = lauxlib.luaL_checknumber(L, 6)
            
            const dist = Math.sqrt(
                Math.pow(bx - ax, 2) +
                Math.pow(by - ay, 2) +
                Math.pow(bz - az, 2)
            )
            lua.lua_pushnumber(L, dist)
            return 1
        })

        this.pushFunction(L, 'lerp', () => {
            const a = lauxlib.luaL_checknumber(L, 1)
            const b = lauxlib.luaL_checknumber(L, 2)
            const t = lauxlib.luaL_checknumber(L, 3)
            lua.lua_pushnumber(L, a + (b - a) * t)
            return 1
        })

        this.pushFunction(L, 'clamp', () => {
            const value = lauxlib.luaL_checknumber(L, 1)
            const min = lauxlib.luaL_checknumber(L, 2)
            const max = lauxlib.luaL_checknumber(L, 3)
            lua.lua_pushnumber(L, Math.max(min, Math.min(max, value)))
            return 1
        })

        this.pushFunction(L, 'random', () => {
            const min = lauxlib.luaL_optnumber(L, 1, 0)
            const max = lauxlib.luaL_optnumber(L, 2, 1)
            lua.lua_pushnumber(L, min + Math.random() * (max - min))
            return 1
        })

        lua.lua_setglobal(L, fengari.to_luastring('Math3D'))
    }

    registerPlayerAPI() {
        const L = this.L
        const engine = this

        lua.lua_newtable(L)

        this.pushFunction(L, 'getPosition', () => {
            const player = engine.gameContext.player
            if (player) {
                lua.lua_newtable(L)
                lua.lua_pushnumber(L, player.position?.x || 0)
                lua.lua_setfield(L, -2, fengari.to_luastring('x'))
                lua.lua_pushnumber(L, player.position?.y || 0)
                lua.lua_setfield(L, -2, fengari.to_luastring('y'))
                lua.lua_pushnumber(L, player.position?.z || 0)
                lua.lua_setfield(L, -2, fengari.to_luastring('z'))
                return 1
            }
            lua.lua_pushnil(L)
            return 1
        })

        this.pushFunction(L, 'getHealth', () => {
            const player = engine.gameContext.player
            lua.lua_pushnumber(L, player?.health || 100)
            return 1
        })

        this.pushFunction(L, 'getMana', () => {
            const player = engine.gameContext.player
            lua.lua_pushnumber(L, player?.mana || 100)
            return 1
        })

        this.pushFunction(L, 'getStamina', () => {
            const player = engine.gameContext.player
            lua.lua_pushnumber(L, player?.stamina || 100)
            return 1
        })

        this.pushFunction(L, 'getStat', () => {
            const statName = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const player = engine.gameContext.player
            lua.lua_pushnumber(L, player?.stats?.[statName] || 0)
            return 1
        })

        this.pushFunction(L, 'modifyHealth', () => {
            const amount = lauxlib.luaL_checknumber(L, 1)
            if (engine.gameContext.player) {
                engine.emit('player:modifyHealth', { amount })
            }
            return 0
        })

        this.pushFunction(L, 'modifyMana', () => {
            const amount = lauxlib.luaL_checknumber(L, 1)
            if (engine.gameContext.player) {
                engine.emit('player:modifyMana', { amount })
            }
            return 0
        })

        lua.lua_setglobal(L, fengari.to_luastring('Player'))
    }

    registerCombatAPI() {
        const L = this.L
        const engine = this

        lua.lua_newtable(L)

        this.pushFunction(L, 'dealDamage', () => {
            const targetId = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const amount = lauxlib.luaL_checknumber(L, 2)
            const damageType = fengari.to_jsstring(lauxlib.luaL_optstring(L, 3, fengari.to_luastring('physical')))
            
            engine.emit('combat:dealDamage', { targetId, amount, damageType })
            lua.lua_pushboolean(L, true)
            return 1
        })

        this.pushFunction(L, 'applyEffect', () => {
            const targetId = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const effectType = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 2))
            const duration = lauxlib.luaL_checknumber(L, 3)
            const power = lauxlib.luaL_optnumber(L, 4, 1)
            
            engine.emit('combat:applyEffect', { targetId, effectType, duration, power })
            return 0
        })

        this.pushFunction(L, 'getTarget', () => {
            const target = engine.gameContext.target
            if (target) {
                lua.lua_newtable(L)
                lua.lua_pushstring(L, fengari.to_luastring(target.id || 'unknown'))
                lua.lua_setfield(L, -2, fengari.to_luastring('id'))
                lua.lua_pushnumber(L, target.health || 0)
                lua.lua_setfield(L, -2, fengari.to_luastring('health'))
                lua.lua_pushnumber(L, target.distance || 0)
                lua.lua_setfield(L, -2, fengari.to_luastring('distance'))
                return 1
            }
            lua.lua_pushnil(L)
            return 1
        })

        this.pushFunction(L, 'spawnProjectile', () => {
            const projectileType = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const speed = lauxlib.luaL_optnumber(L, 2, 20)
            const damage = lauxlib.luaL_optnumber(L, 3, 10)
            
            engine.emit('combat:spawnProjectile', { projectileType, speed, damage })
            return 0
        })

        this.pushFunction(L, 'aoeAttack', () => {
            const radius = lauxlib.luaL_checknumber(L, 1)
            const damage = lauxlib.luaL_checknumber(L, 2)
            const damageType = fengari.to_jsstring(lauxlib.luaL_optstring(L, 3, fengari.to_luastring('physical')))
            
            engine.emit('combat:aoeAttack', { radius, damage, damageType })
            return 0
        })

        lua.lua_setglobal(L, fengari.to_luastring('Combat'))
    }

    registerAnimationAPI() {
        const L = this.L
        const engine = this

        lua.lua_newtable(L)

        this.pushFunction(L, 'play', () => {
            const animName = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const fadeTime = lauxlib.luaL_optnumber(L, 2, 0.2)
            const loop = lua.lua_toboolean(L, 3)
            
            engine.emit('animation:play', { animName, fadeTime, loop })
            return 0
        })

        this.pushFunction(L, 'stop', () => {
            const animName = fengari.to_jsstring(lauxlib.luaL_optstring(L, 1, fengari.to_luastring('')))
            engine.emit('animation:stop', { animName })
            return 0
        })

        this.pushFunction(L, 'blend', () => {
            const from = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const to = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 2))
            const duration = lauxlib.luaL_optnumber(L, 3, 0.3)
            
            engine.emit('animation:blend', { from, to, duration })
            return 0
        })

        this.pushFunction(L, 'getList', () => {
            const animations = engine.gameContext.animations || []
            lua.lua_newtable(L)
            animations.forEach((anim, i) => {
                lua.lua_pushstring(L, fengari.to_luastring(anim))
                lua.lua_rawseti(L, -2, i + 1)
            })
            return 1
        })

        lua.lua_setglobal(L, fengari.to_luastring('Animation'))
    }

    registerGameAPI() {
        const L = this.L
        const engine = this

        lua.lua_newtable(L)

        this.pushFunction(L, 'getTime', () => {
            lua.lua_pushnumber(L, performance.now() / 1000)
            return 1
        })

        this.pushFunction(L, 'getDeltaTime', () => {
            lua.lua_pushnumber(L, engine.gameContext.deltaTime || 0.016)
            return 1
        })

        this.pushFunction(L, 'isKeyDown', () => {
            const key = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const isDown = engine.gameContext.keysDown?.has(key) || false
            lua.lua_pushboolean(L, isDown)
            return 1
        })

        this.pushFunction(L, 'playSound', () => {
            const soundId = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const volume = lauxlib.luaL_optnumber(L, 2, 1)
            engine.emit('game:playSound', { soundId, volume })
            return 0
        })

        this.pushFunction(L, 'spawnEffect', () => {
            const effectType = fengari.to_jsstring(lauxlib.luaL_checkstring(L, 1))
            const x = lauxlib.luaL_optnumber(L, 2, 0)
            const y = lauxlib.luaL_optnumber(L, 3, 0)
            const z = lauxlib.luaL_optnumber(L, 4, 0)
            engine.emit('game:spawnEffect', { effectType, position: { x, y, z } })
            return 0
        })

        lua.lua_setglobal(L, fengari.to_luastring('Game'))
    }

    pushFunction(L, name, fn) {
        lua.lua_pushcclosure(L, () => {
            try {
                return fn()
            } catch (e) {
                console.error(`[Lua] Error in ${name}:`, e)
                return 0
            }
        }, 0)
        lua.lua_setfield(L, -2, fengari.to_luastring(name))
    }

    registerFunction(name, fn) {
        const L = this.L
        lua.lua_pushcclosure(L, () => {
            const nargs = lua.lua_gettop(L)
            const args = []
            for (let i = 1; i <= nargs; i++) {
                if (lua.lua_isstring(L, i)) {
                    args.push(fengari.to_jsstring(lua.lua_tostring(L, i)))
                } else if (lua.lua_isnumber(L, i)) {
                    args.push(lua.lua_tonumber(L, i))
                } else if (lua.lua_isboolean(L, i)) {
                    args.push(lua.lua_toboolean(L, i))
                }
            }
            try {
                fn(...args)
            } catch (e) {
                console.error(`[Lua] Error in ${name}:`, e)
            }
            return 0
        }, 0)
        lua.lua_setfield(L, -2, fengari.to_luastring(name))
    }

    loadScript(name, code) {
        if (!this.initialized) {
            console.error('[LuaEngine] Not initialized')
            return false
        }

        const status = lauxlib.luaL_loadstring(this.L, fengari.to_luastring(code))
        if (status !== lua.LUA_OK) {
            const error = fengari.to_jsstring(lua.lua_tostring(this.L, -1))
            console.error(`[Lua] Load error in ${name}:`, error)
            lua.lua_pop(this.L, 1)
            return false
        }

        this.scripts.set(name, { code, loaded: true })
        console.log(`[LuaEngine] Loaded script: ${name}`)
        return true
    }

    runScript(name) {
        const script = this.scripts.get(name)
        if (!script?.loaded) {
            console.error(`[LuaEngine] Script not loaded: ${name}`)
            return false
        }

        const status = lauxlib.luaL_loadstring(this.L, fengari.to_luastring(script.code))
        if (status !== lua.LUA_OK) {
            const error = fengari.to_jsstring(lua.lua_tostring(this.L, -1))
            console.error(`[Lua] Parse error:`, error)
            lua.lua_pop(this.L, 1)
            return false
        }

        const result = lua.lua_pcall(this.L, 0, lua.LUA_MULTRET, 0)
        if (result !== lua.LUA_OK) {
            const error = fengari.to_jsstring(lua.lua_tostring(this.L, -1))
            console.error(`[Lua] Runtime error in ${name}:`, error)
            lua.lua_pop(this.L, 1)
            return false
        }

        return true
    }

    execute(code) {
        if (!this.initialized) {
            console.error('[LuaEngine] Not initialized')
            return null
        }

        const status = lauxlib.luaL_loadstring(this.L, fengari.to_luastring(code))
        if (status !== lua.LUA_OK) {
            const error = fengari.to_jsstring(lua.lua_tostring(this.L, -1))
            lua.lua_pop(this.L, 1)
            return { success: false, error }
        }

        const result = lua.lua_pcall(this.L, 0, lua.LUA_MULTRET, 0)
        if (result !== lua.LUA_OK) {
            const error = fengari.to_jsstring(lua.lua_tostring(this.L, -1))
            lua.lua_pop(this.L, 1)
            return { success: false, error }
        }

        return { success: true }
    }

    callFunction(funcName, ...args) {
        lua.lua_getglobal(this.L, fengari.to_luastring(funcName))
        
        if (!lua.lua_isfunction(this.L, -1)) {
            lua.lua_pop(this.L, 1)
            return null
        }

        args.forEach(arg => {
            if (typeof arg === 'number') {
                lua.lua_pushnumber(this.L, arg)
            } else if (typeof arg === 'string') {
                lua.lua_pushstring(this.L, fengari.to_luastring(arg))
            } else if (typeof arg === 'boolean') {
                lua.lua_pushboolean(this.L, arg)
            }
        })

        const result = lua.lua_pcall(this.L, args.length, 1, 0)
        if (result !== lua.LUA_OK) {
            const error = fengari.to_jsstring(lua.lua_tostring(this.L, -1))
            lua.lua_pop(this.L, 1)
            console.error(`[Lua] Error calling ${funcName}:`, error)
            return null
        }

        let returnValue = null
        if (lua.lua_isnumber(this.L, -1)) {
            returnValue = lua.lua_tonumber(this.L, -1)
        } else if (lua.lua_isstring(this.L, -1)) {
            returnValue = fengari.to_jsstring(lua.lua_tostring(this.L, -1))
        } else if (lua.lua_isboolean(this.L, -1)) {
            returnValue = lua.lua_toboolean(this.L, -1)
        }

        lua.lua_pop(this.L, 1)
        return returnValue
    }

    on(eventName, callback) {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, [])
        }
        this.eventHandlers.get(eventName).push(callback)
    }

    emit(eventName, data) {
        const handlers = this.eventHandlers.get(eventName) || []
        handlers.forEach(handler => {
            try {
                handler(data)
            } catch (e) {
                console.error(`[LuaEngine] Event handler error:`, e)
            }
        })
    }

    updateContext(context) {
        Object.assign(this.gameContext, context)
    }

    dispose() {
        if (this.L) {
            lua.lua_close(this.L)
            this.L = null
        }
        this.scripts.clear()
        this.eventHandlers.clear()
        this.initialized = false
    }
}

export const luaEngine = new LuaEngine()
