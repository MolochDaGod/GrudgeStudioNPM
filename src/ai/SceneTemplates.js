/*
    GRUDGE Studio - Scene Templates
    Preset scene configurations for quick project setup
*/

export const SceneTemplates = {
    arenaFighter: {
        name: 'Arena Fighter',
        description: 'Combat arena with spawn points and AI opponents',
        preview: '/textures/templates/arena.png',
        config: {
            name: 'Arena',
            sceneType: 'combat',
            worldSize: { x: 50, y: 20, z: 50 },
            gravity: -9.81,
            terrainEnabled: false,
            cameraType: 'thirdPerson',
            fov: 60,
            ambientLight: '#404080',
            sunColor: '#ff8800',
            sunIntensity: 1.2,
            fogEnabled: true,
            fogColor: '#1a1a2e',
            fogNear: 20,
            fogFar: 80,
            assets: [
                { type: 'model', path: '/models/arena.glb', x: 0, y: 0, z: 0 }
            ],
            scripts: [
                '/scripts/core/events.lua',
                '/scripts/weapons/sword.lua'
            ],
            spawnPoints: [
                { name: 'player', position: { x: 0, y: 1, z: -10 } },
                { name: 'enemy', position: { x: 0, y: 1, z: 10 } }
            ]
        }
    },
    
    openWorld: {
        name: 'Open World',
        description: 'Large terrain with procedural generation',
        preview: '/textures/templates/openworld.png',
        config: {
            name: 'OpenWorld',
            sceneType: 'exploration',
            worldSize: { x: 500, y: 100, z: 500 },
            gravity: -9.81,
            terrainEnabled: true,
            heightScale: 30,
            segments: 256,
            terrainMaterial: 'grass',
            cameraType: 'thirdPerson',
            fov: 70,
            ambientLight: '#6688aa',
            sunColor: '#fffaf0',
            sunIntensity: 1.5,
            fogEnabled: true,
            fogColor: '#8899bb',
            fogNear: 50,
            fogFar: 300,
            assets: [],
            scripts: [],
            spawnPoints: [
                { name: 'player', position: { x: 0, y: 10, z: 0 } }
            ]
        }
    },
    
    dungeon: {
        name: 'Dungeon Crawler',
        description: 'Dark dungeon with torches and enemies',
        preview: '/textures/templates/dungeon.png',
        config: {
            name: 'Dungeon',
            sceneType: 'dungeon',
            worldSize: { x: 100, y: 10, z: 100 },
            gravity: -9.81,
            terrainEnabled: false,
            cameraType: 'topDown',
            fov: 50,
            ambientLight: '#202030',
            sunColor: '#ff6600',
            sunIntensity: 0.3,
            fogEnabled: true,
            fogColor: '#101018',
            fogNear: 5,
            fogFar: 30,
            assets: [],
            scripts: [
                '/scripts/core/events.lua'
            ],
            spawnPoints: [
                { name: 'player', position: { x: 0, y: 1, z: 0 } },
                { name: 'entrance', position: { x: 0, y: 1, z: -20 } },
                { name: 'boss', position: { x: 0, y: 1, z: 40 } }
            ]
        }
    },
    
    platformer: {
        name: '3D Platformer',
        description: 'Side-scrolling 3D platformer level',
        preview: '/textures/templates/platformer.png',
        config: {
            name: 'Platformer',
            sceneType: 'platformer',
            worldSize: { x: 200, y: 50, z: 20 },
            gravity: -15,
            terrainEnabled: false,
            cameraType: 'sideScroll',
            fov: 60,
            ambientLight: '#8090ff',
            sunColor: '#ffffff',
            sunIntensity: 1.0,
            fogEnabled: false,
            assets: [],
            scripts: [],
            spawnPoints: [
                { name: 'start', position: { x: -80, y: 5, z: 0 } },
                { name: 'checkpoint1', position: { x: 0, y: 10, z: 0 } },
                { name: 'goal', position: { x: 80, y: 15, z: 0 } }
            ]
        }
    },
    
    rtsMap: {
        name: 'RTS Battlefield',
        description: 'Top-down strategy map with base locations',
        preview: '/textures/templates/rts.png',
        config: {
            name: 'Battlefield',
            sceneType: 'rts',
            worldSize: { x: 200, y: 30, z: 200 },
            gravity: -9.81,
            terrainEnabled: true,
            heightScale: 15,
            segments: 128,
            terrainMaterial: 'dirt',
            cameraType: 'rts',
            fov: 45,
            ambientLight: '#88aacc',
            sunColor: '#fffaf0',
            sunIntensity: 1.2,
            fogEnabled: true,
            fogColor: '#aabbcc',
            fogNear: 100,
            fogFar: 250,
            assets: [],
            scripts: [],
            spawnPoints: [
                { name: 'base_blue', position: { x: -80, y: 5, z: -80 } },
                { name: 'base_red', position: { x: 80, y: 5, z: 80 } },
                { name: 'resource1', position: { x: 0, y: 5, z: 0 } },
                { name: 'resource2', position: { x: -40, y: 5, z: 40 } },
                { name: 'resource3', position: { x: 40, y: 5, z: -40 } }
            ]
        }
    },
    
    racingTrack: {
        name: 'Racing Track',
        description: 'Circular racing track with checkpoints',
        preview: '/textures/templates/racing.png',
        config: {
            name: 'RaceTrack',
            sceneType: 'racing',
            worldSize: { x: 300, y: 20, z: 300 },
            gravity: -9.81,
            terrainEnabled: false,
            cameraType: 'follow',
            fov: 75,
            ambientLight: '#aaddff',
            sunColor: '#fffaf0',
            sunIntensity: 1.8,
            fogEnabled: true,
            fogColor: '#aaddff',
            fogNear: 100,
            fogFar: 400,
            assets: [],
            scripts: [],
            spawnPoints: [
                { name: 'start', position: { x: 0, y: 1, z: 0 } },
                { name: 'checkpoint1', position: { x: 100, y: 1, z: 0 } },
                { name: 'checkpoint2', position: { x: 100, y: 1, z: 100 } },
                { name: 'checkpoint3', position: { x: 0, y: 1, z: 100 } }
            ]
        }
    },
    
    empty: {
        name: 'Empty Scene',
        description: 'Blank canvas to build from scratch',
        preview: '/textures/templates/empty.png',
        config: {
            name: 'NewScene',
            sceneType: 'custom',
            worldSize: { x: 100, y: 50, z: 100 },
            gravity: -9.81,
            terrainEnabled: false,
            cameraType: 'orbit',
            fov: 60,
            ambientLight: '#404040',
            sunColor: '#ffffff',
            sunIntensity: 1.0,
            fogEnabled: false,
            assets: [],
            scripts: [],
            spawnPoints: [
                { name: 'origin', position: { x: 0, y: 0, z: 0 } }
            ]
        }
    }
}

export function getTemplateList() {
    return Object.entries(SceneTemplates).map(([id, template]) => ({
        id,
        name: template.name,
        description: template.description,
        preview: template.preview
    }))
}

export function getTemplate(id) {
    return SceneTemplates[id] || null
}

export function createFromTemplate(templateId, customName = null) {
    const template = SceneTemplates[templateId]
    if (!template) {
        throw new Error(`Template not found: ${templateId}`)
    }
    
    const config = JSON.parse(JSON.stringify(template.config))
    
    if (customName) {
        config.name = customName
        config.className = customName.replace(/\s+/g, '')
    } else {
        config.className = config.name.replace(/\s+/g, '')
    }
    
    return config
}

export default SceneTemplates
