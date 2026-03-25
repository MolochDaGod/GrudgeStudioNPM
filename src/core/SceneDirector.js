import * as THREE from 'three'

export const SCENES = {
    MENU: 'menu',
    CHARACTER_SELECT: 'character_select',
    ARENA: 'arena',
    WORLD_BUILDER: 'world_builder',
    SKILL_TREE: 'skill_tree'
}

export class SceneDirector {
    constructor(renderer, camera) {
        this.renderer = renderer
        this.camera = camera
        this.currentScene = null
        this.scenes = new Map()
        this.transitions = new Map()
        this.isTransitioning = false
        this.onSceneChange = null
    }

    registerScene(name, sceneInstance) {
        this.scenes.set(name, sceneInstance)
    }

    async switchTo(sceneName, data = {}) {
        if (this.isTransitioning) return

        this.isTransitioning = true

        if (this.currentScene) {
            const current = this.scenes.get(this.currentScene)
            if (current && current.onExit) await current.onExit()
        }

        if (sceneName === null || !this.scenes.has(sceneName)) {
            this.currentScene = null
            this.isTransitioning = false
            if (this.onSceneChange) {
                this.onSceneChange(null, data)
            }
            return null
        }

        const nextScene = this.scenes.get(sceneName)
        if (nextScene.onEnter) await nextScene.onEnter(data)

        this.currentScene = sceneName
        this.isTransitioning = false

        if (this.onSceneChange) {
            this.onSceneChange(sceneName, data)
        }

        return nextScene
    }

    async exitCurrentScene() {
        if (this.currentScene) {
            const current = this.scenes.get(this.currentScene)
            if (current && current.onExit) await current.onExit()
            this.currentScene = null
        }
    }

    getCurrentScene() {
        return this.currentScene ? this.scenes.get(this.currentScene) : null
    }

    update(delta) {
        const scene = this.getCurrentScene()
        if (scene && scene.update) {
            scene.update(delta)
        }
    }

    render() {
        const scene = this.getCurrentScene()
        if (scene) {
            if (scene.render) {
                scene.render()
            } else if (scene.threeScene) {
                this.renderer.render(scene.threeScene, this.camera)
            }
        }
    }
}

export class BaseScene {
    constructor(name) {
        this.name = name
        this.threeScene = new THREE.Scene()
        this.isActive = false
        this.data = {}
    }

    async onEnter(data = {}) {
        this.data = data
        this.isActive = true
        console.log(`Entering scene: ${this.name}`)
    }

    async onExit() {
        this.isActive = false
        console.log(`Exiting scene: ${this.name}`)
    }

    update(delta) {}

    dispose() {
        this.threeScene.traverse((object) => {
            if (object.geometry) object.geometry.dispose()
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(m => m.dispose())
                } else {
                    object.material.dispose()
                }
            }
        })
    }
}
