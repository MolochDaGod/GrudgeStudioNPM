/*
    GRUDGE Engine - Asset Manifest System
    Data-driven asset loading with no hardcoded paths
*/

import { getAssetPath } from './paths.js'

const ASSET_MANIFEST = {
    version: '2.0.0',
    environments: {
        arena: {
            id: 'arena-v3',
            name: 'FPS Arena Map',
            path: 'models/arena.glb',
            type: 'environment',
            category: 'arena',
            scale: 1,
            position: { x: 0, y: 0, z: 0 },
            collision: true
        }
    },
    characters: {
        viking: {
            id: 'viking',
            name: 'Viking Warrior',
            path: 'models/characters/viking/scene.gltf',
            type: 'character',
            category: 'fighter',
            scale: 1,
            animations: true,
            collision: true
        },
        orc: {
            id: 'orc',
            name: 'Orc Warrior',
            path: 'models/characters/orc/scene.gltf',
            type: 'character',
            category: 'fighter',
            scale: 1,
            animations: true,
            collision: true
        },
        gladiator: {
            id: 'gladiator',
            name: 'Gladiator',
            path: 'models/gladiator.glb',
            type: 'character',
            category: 'fighter',
            scale: 1,
            animations: true,
            collision: true
        },
        gladiatorPose: {
            id: 'gladiator-pose',
            name: 'Gladiator Pose',
            path: 'models/gladiator-pose.glb',
            type: 'character',
            category: 'fighter',
            scale: 1,
            animations: false
        },
        dragon: {
            id: 'dragon',
            name: 'Prowler Dragon',
            path: 'models/dragon.glb',
            type: 'character',
            category: 'creature',
            scale: 1,
            animations: true
        },
        wolf: {
            id: 'wolf',
            name: 'Wolf',
            path: 'models/characters/wolf/scene.gltf',
            type: 'character',
            category: 'creature',
            scale: 1,
            animations: true,
            collision: true
        },
        shepherd: {
            id: 'shepherd',
            name: 'German Shepherd',
            path: 'models/characters/shepherd/scene.gltf',
            type: 'character',
            category: 'creature',
            scale: 1,
            animations: true,
            collision: true
        }
    },
    defaults: {
        playerCharacter: 'viking',
        opponentCharacter: 'orc',
        arenaMap: 'arena',
        spawnPoints: [
            { id: 'spawn-1', position: { x: -10, y: 0, z: 0 }, rotation: 0, team: 'red', role: 'player' },
            { id: 'spawn-2', position: { x: 10, y: 0, z: 0 }, rotation: Math.PI, team: 'blue', role: 'opponent' }
        ]
    }
}

export class AssetManifest {
    constructor() {
        this.manifest = { ...ASSET_MANIFEST }
        this.loadedAssets = new Map()
        this.callbacks = new Map()
    }
    
    getEnvironment(id) {
        return this.manifest.environments[id] || null
    }
    
    getCharacter(id) {
        return this.manifest.characters[id] || null
    }
    
    getDefaultPlayerCharacter() {
        return this.getCharacter(this.manifest.defaults.playerCharacter)
    }
    
    getDefaultOpponentCharacter() {
        return this.getCharacter(this.manifest.defaults.opponentCharacter)
    }
    
    getDefaultArena() {
        return this.getEnvironment(this.manifest.defaults.arenaMap)
    }
    
    getSpawnPoints() {
        return [...this.manifest.defaults.spawnPoints]
    }
    
    getSpawnByTeam(team) {
        return this.manifest.defaults.spawnPoints.find(s => s.team === team)
    }
    
    getSpawnByRole(role) {
        return this.manifest.defaults.spawnPoints.find(s => s.role === role)
    }
    
    getAllEnvironments() {
        return Object.values(this.manifest.environments)
    }
    
    getAllCharacters() {
        return Object.values(this.manifest.characters)
    }
    
    getAllAssets() {
        return [
            ...this.getAllEnvironments(),
            ...this.getAllCharacters()
        ]
    }
    
    addSpawnPoint(spawn) {
        const id = spawn.id || `spawn-${Date.now()}`
        const newSpawn = {
            id,
            position: spawn.position || { x: 0, y: 0, z: 0 },
            rotation: spawn.rotation || 0,
            team: spawn.team || 'neutral',
            role: spawn.role || 'generic'
        }
        this.manifest.defaults.spawnPoints.push(newSpawn)
        return newSpawn
    }
    
    removeSpawnPoint(id) {
        const index = this.manifest.defaults.spawnPoints.findIndex(s => s.id === id)
        if (index !== -1) {
            this.manifest.defaults.spawnPoints.splice(index, 1)
            return true
        }
        return false
    }
    
    updateSpawnPoint(id, updates) {
        const spawn = this.manifest.defaults.spawnPoints.find(s => s.id === id)
        if (spawn) {
            Object.assign(spawn, updates)
            return spawn
        }
        return null
    }
    
    exportManifest() {
        return JSON.stringify(this.manifest, null, 2)
    }
    
    importManifest(json) {
        try {
            const data = typeof json === 'string' ? JSON.parse(json) : json
            this.manifest = { ...ASSET_MANIFEST, ...data }
            return true
        } catch (error) {
            console.error('[AssetManifest] Import failed:', error)
            return false
        }
    }
    
    markAsLoaded(id, asset) {
        this.loadedAssets.set(id, asset)
    }
    
    getLoadedAsset(id) {
        return this.loadedAssets.get(id)
    }
    
    isLoaded(id) {
        return this.loadedAssets.has(id)
    }
}

export const assetManifest = new AssetManifest()
export default AssetManifest
