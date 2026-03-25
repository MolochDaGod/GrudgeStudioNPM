import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BaseScene, SCENES } from '../core/SceneDirector.js'

export const HEROES = [
    { id: 'viking', name: 'Viking Warrior', model: '/models/characters/viking.glb', fallback: '/models/characters/viking/scene.gltf', description: 'Heavy-hitting Norse warrior with axe', collider: { type: 'capsule', radius: 0.5, height: 1.8 }, isDefault: true },
    { id: 'orc', name: 'Orc Warrior', model: '/models/characters/orc.glb', fallback: '/models/characters/orc/scene.gltf', description: 'Brutal orc fighter with massive strength', collider: { type: 'capsule', radius: 0.6, height: 2.0 } },
    { id: 'wolf', name: 'Shadow Wolf', model: '/models/characters/wolf.glb', fallback: '/models/characters/wolf/scene.gltf', description: 'Swift beast with deadly fangs', collider: { type: 'capsule', radius: 0.4, height: 1.0 } },
    { id: 'shepherd', name: 'War Hound', model: '/models/characters/shepherd.glb', fallback: '/models/characters/shepherd/scene.gltf', description: 'Loyal companion with ferocious attacks', collider: { type: 'capsule', radius: 0.35, height: 0.9 } },
    { id: 'toon', name: 'Toon Fighter', model: '/models/characters/toon_character.glb', description: 'Animated cartoon warrior', collider: { type: 'capsule', radius: 0.5, height: 1.8 } },
    { id: 'swimmer', name: 'Aqua Warrior', model: '/models/characters/swimmer.glb', description: 'Agile fighter from the depths', collider: { type: 'capsule', radius: 0.5, height: 1.8 } },
    { id: 'base', name: 'Arena Fighter', model: '/models/characters/base_character.glb', description: 'Classic arena combatant', collider: { type: 'capsule', radius: 0.5, height: 1.8 } }
]

export const WEAPONS = [
    { id: 'sword', name: 'Iron Sword', damage: 10, speed: 1.0, type: 'melee' },
    { id: 'axe', name: 'Battle Axe', damage: 15, speed: 0.7, type: 'melee' },
    { id: 'spear', name: 'War Spear', damage: 12, speed: 0.9, type: 'melee' }
]

export const CLASSES = [
    { id: 'warrior', name: 'Warrior', stats: { strength: 30, vitality: 25, endurance: 25 } },
    { id: 'mage', name: 'Battle Mage', stats: { intellect: 35, wisdom: 25, agility: 20 } },
    { id: 'rogue', name: 'Shadow Rogue', stats: { dexterity: 30, agility: 30, tactics: 20 } }
]

export class CharacterSelectScene extends BaseScene {
    constructor() {
        super('character_select')
        this.loader = new GLTFLoader()
        this.heroModels = []
        this.selectedHero = 0
        this.selectedWeapon = 0
        this.selectedClass = 0
        this.rotationSpeed = 0.5
        this.heroGroup = new THREE.Group()
        this.onConfirm = null
    }

    async onEnter(data = {}) {
        await super.onEnter(data)
        this.setupScene()
        this.setupLighting()
        await this.loadHeroes()
        this.createUI()
    }

    setupScene() {
        this.threeScene.background = new THREE.Color(0x0a0a15)
        
        const platform = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 3.5, 0.3, 32),
            new THREE.MeshStandardMaterial({ 
                color: 0x1a1a2e, 
                metalness: 0.8, 
                roughness: 0.3 
            })
        )
        platform.position.y = -1.5
        this.threeScene.add(platform)

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(3.2, 0.05, 16, 64),
            new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
        )
        ring.rotation.x = -Math.PI / 2
        ring.position.y = -1.35
        this.threeScene.add(ring)

        this.threeScene.add(this.heroGroup)
    }

    setupLighting() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5)
        this.threeScene.add(ambient)

        const key = new THREE.DirectionalLight(0xffffff, 1)
        key.position.set(5, 5, 5)
        this.threeScene.add(key)

        const rim = new THREE.DirectionalLight(0x6ee7b7, 0.5)
        rim.position.set(-5, 3, -5)
        this.threeScene.add(rim)

        const spot = new THREE.SpotLight(0xffffff, 1.5)
        spot.position.set(0, 8, 0)
        spot.angle = Math.PI / 6
        spot.penumbra = 0.5
        this.threeScene.add(spot)
    }

    async loadHeroes() {
        for (let i = 0; i < HEROES.length; i++) {
            const hero = HEROES[i]
            let model = null
            
            try {
                const gltf = await this.loader.loadAsync(hero.model)
                model = gltf.scene
            } catch (e) {
                if (hero.fallback) {
                    try {
                        console.log(`Trying fallback for ${hero.name}: ${hero.fallback}`)
                        const gltf = await this.loader.loadAsync(hero.fallback)
                        model = gltf.scene
                    } catch (e2) {
                        console.warn(`Failed to load fallback for ${hero.name}`)
                    }
                }
            }
            
            if (model) {
                model.scale.setScalar(1.5)
                model.position.set(i * 4 - 4, -1.2, 0)
                model.visible = i === 0
                model.userData.heroId = hero.id
                model.userData.collider = hero.collider
                this.heroGroup.add(model)
                this.heroModels.push(model)
            } else {
                console.warn(`Failed to load hero model: ${hero.model}`)
                const placeholder = new THREE.Mesh(
                    new THREE.CapsuleGeometry(hero.collider?.radius || 0.5, hero.collider?.height || 1.8, 8, 16),
                    new THREE.MeshStandardMaterial({ color: 0x6ee7b7 })
                )
                placeholder.position.set(i * 4 - 4, 0, 0)
                placeholder.visible = i === 0
                placeholder.userData.heroId = hero.id
                placeholder.userData.collider = hero.collider
                this.heroGroup.add(placeholder)
                this.heroModels.push(placeholder)
            }
        }
    }

    selectHero(index) {
        this.heroModels.forEach((model, i) => {
            model.visible = i === index
        })
        this.selectedHero = index
        this.updateUI()
    }

    selectWeapon(index) {
        this.selectedWeapon = index
        this.updateUI()
    }

    selectClass(index) {
        this.selectedClass = index
        this.updateUI()
    }

    createUI() {
        const existing = document.getElementById('character-select-ui')
        if (existing) existing.remove()

        const ui = document.createElement('div')
        ui.id = 'character-select-ui'
        ui.innerHTML = `
            <style>
                #character-select-ui {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 100;
                    font-family: 'Jost', sans-serif;
                }
                .cs-panel {
                    position: absolute;
                    background: linear-gradient(135deg, rgba(20,26,43,0.95), rgba(20,26,43,0.8));
                    border: 1px solid #2a3150;
                    border-radius: 12px;
                    padding: 20px;
                    pointer-events: auto;
                    color: #e8eaf6;
                }
                .cs-title {
                    font-size: 1.5rem;
                    color: #6ee7b7;
                    margin-bottom: 15px;
                    font-weight: 700;
                }
                .cs-options { display: flex; flex-direction: column; gap: 8px; }
                .cs-option {
                    padding: 12px 16px;
                    background: rgba(42, 49, 80, 0.5);
                    border: 2px solid transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cs-option:hover { border-color: #6ee7b7; }
                .cs-option.selected { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.15); }
                .cs-option-name { font-weight: 600; }
                .cs-option-desc { font-size: 0.85rem; color: #a5b4d0; margin-top: 4px; }
                .cs-hero-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    padding: 0 20px;
                    box-sizing: border-box;
                    pointer-events: none;
                }
                .cs-nav-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(20, 26, 43, 0.9);
                    border: 2px solid #6ee7b7;
                    color: #6ee7b7;
                    font-size: 24px;
                    cursor: pointer;
                    pointer-events: auto;
                    transition: all 0.2s;
                }
                .cs-nav-btn:hover { background: #6ee7b7; color: #0a0a15; }
                .cs-confirm-panel {
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    text-align: center;
                }
                .cs-confirm-btn {
                    padding: 15px 60px;
                    font-size: 1.2rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #6ee7b7, #10b981);
                    border: none;
                    border-radius: 8px;
                    color: #0a0a15;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cs-confirm-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(110, 231, 183, 0.4); }
                .cs-summary { margin-top: 10px; color: #a5b4d0; font-size: 0.9rem; }
                .cs-back-btn {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    padding: 10px 20px;
                    background: rgba(42, 49, 80, 0.8);
                    border: 1px solid #2a3150;
                    border-radius: 6px;
                    color: #e8eaf6;
                    cursor: pointer;
                    pointer-events: auto;
                }
                .cs-back-btn:hover { background: rgba(42, 49, 80, 1); }
            </style>
            
            <button class="cs-back-btn" id="cs-back">← Back to Menu</button>
            
            <div class="cs-panel" style="left: 30px; top: 50%; transform: translateY(-50%); width: 280px;">
                <div class="cs-title">Select Class</div>
                <div class="cs-options" id="class-options"></div>
            </div>

            <div class="cs-hero-nav">
                <button class="cs-nav-btn" id="hero-prev">‹</button>
                <button class="cs-nav-btn" id="hero-next">›</button>
            </div>

            <div class="cs-panel" style="right: 30px; top: 50%; transform: translateY(-50%); width: 280px;">
                <div class="cs-title">Select Weapon</div>
                <div class="cs-options" id="weapon-options"></div>
            </div>

            <div class="cs-panel cs-confirm-panel">
                <button class="cs-confirm-btn" id="cs-confirm">Enter Arena</button>
                <div class="cs-summary" id="cs-summary"></div>
            </div>
        `
        document.body.appendChild(ui)
        this.bindUIEvents()
        this.updateUI()
    }

    bindUIEvents() {
        document.getElementById('hero-prev').onclick = () => {
            this.selectHero((this.selectedHero - 1 + HEROES.length) % HEROES.length)
        }
        document.getElementById('hero-next').onclick = () => {
            this.selectHero((this.selectedHero + 1) % HEROES.length)
        }
        document.getElementById('cs-back').onclick = () => {
            this.removeUI()
            if (this.onBack) this.onBack()
        }
        document.getElementById('cs-confirm').onclick = () => {
            this.removeUI()
            if (this.onConfirm) {
                this.onConfirm({
                    hero: HEROES[this.selectedHero],
                    weapon: WEAPONS[this.selectedWeapon],
                    class: CLASSES[this.selectedClass]
                })
            }
        }
    }

    updateUI() {
        const classContainer = document.getElementById('class-options')
        if (classContainer) {
            classContainer.innerHTML = CLASSES.map((c, i) => `
                <div class="cs-option ${i === this.selectedClass ? 'selected' : ''}" data-class="${i}">
                    <div class="cs-option-name">${c.name}</div>
                    <div class="cs-option-desc">STR: ${c.stats.strength || 0} | INT: ${c.stats.intellect || 0} | DEX: ${c.stats.dexterity || 0}</div>
                </div>
            `).join('')
            classContainer.querySelectorAll('.cs-option').forEach(el => {
                el.onclick = () => this.selectClass(parseInt(el.dataset.class))
            })
        }

        const weaponContainer = document.getElementById('weapon-options')
        if (weaponContainer) {
            weaponContainer.innerHTML = WEAPONS.map((w, i) => `
                <div class="cs-option ${i === this.selectedWeapon ? 'selected' : ''}" data-weapon="${i}">
                    <div class="cs-option-name">${w.name}</div>
                    <div class="cs-option-desc">DMG: ${w.damage} | SPD: ${w.speed}x</div>
                </div>
            `).join('')
            weaponContainer.querySelectorAll('.cs-option').forEach(el => {
                el.onclick = () => this.selectWeapon(parseInt(el.dataset.weapon))
            })
        }

        const summary = document.getElementById('cs-summary')
        if (summary) {
            summary.textContent = `${HEROES[this.selectedHero].name} • ${CLASSES[this.selectedClass].name} • ${WEAPONS[this.selectedWeapon].name}`
        }
    }

    removeUI() {
        const ui = document.getElementById('character-select-ui')
        if (ui) ui.remove()
    }

    update(delta) {
        const model = this.heroModels[this.selectedHero]
        if (model) {
            model.rotation.y += delta * this.rotationSpeed
        }
    }

    async onExit() {
        await super.onExit()
        this.removeUI()
        this.heroModels = []
        while (this.heroGroup.children.length > 0) {
            this.heroGroup.remove(this.heroGroup.children[0])
        }
    }

    dispose() {
        this.removeUI()
        super.dispose()
    }
}
