/*
    GRUDGE Engine Integration
    Connects the GRUDGE Engine modules to the main game
*/

import * as THREE from 'three'

export class PlatformController {
    constructor(options = {}) {
        this.object = options.object || null
        this.camera = options.camera || null
        this.speed = options.speed || 5
        this.jumpForce = options.jumpForce || 10
        this.gravity = options.gravity || -25
        this.groundCheck = options.groundCheck || 0.1
        
        this.velocity = new THREE.Vector3()
        this.direction = new THREE.Vector3()
        this.isGrounded = false
        this.canJump = true
        this.moveForward = false
        this.moveBackward = false
        this.moveLeft = false
        this.moveRight = false
        this.jump = false
        this.sprint = false
        
        this.sprintMultiplier = 1.5
        this.airControl = 0.3
        this.friction = 0.9
        this.maxFallSpeed = -50
        
        this.raycaster = new THREE.Raycaster()
        this.groundNormal = new THREE.Vector3(0, 1, 0)
        
        this.boundKeyDown = (e) => this.onKeyDown(e)
        this.boundKeyUp = (e) => this.onKeyUp(e)
        
        this.setupInputListeners()
    }
    
    attach(object, camera) {
        this.object = object
        this.camera = camera
    }
    
    setupInputListeners() {
        document.addEventListener('keydown', this.boundKeyDown)
        document.addEventListener('keyup', this.boundKeyUp)
    }
    
    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = true
                break
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = true
                break
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = true
                break
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = true
                break
            case 'Space':
                this.jump = true
                break
            case 'ShiftLeft':
            case 'ShiftRight':
                this.sprint = true
                break
        }
    }
    
    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveForward = false
                break
            case 'KeyS':
            case 'ArrowDown':
                this.moveBackward = false
                break
            case 'KeyA':
            case 'ArrowLeft':
                this.moveLeft = false
                break
            case 'KeyD':
            case 'ArrowRight':
                this.moveRight = false
                break
            case 'Space':
                this.jump = false
                break
            case 'ShiftLeft':
            case 'ShiftRight':
                this.sprint = false
                break
        }
    }
    
    checkGround(colliders = []) {
        if (!this.object) return false
        
        const origin = this.object.position.clone()
        origin.y += 0.5
        
        this.raycaster.set(origin, new THREE.Vector3(0, -1, 0))
        this.raycaster.far = 0.5 + this.groundCheck
        
        const intersects = this.raycaster.intersectObjects(colliders, true)
        
        if (intersects.length > 0) {
            this.isGrounded = true
            if (intersects[0].face) {
                this.groundNormal.copy(intersects[0].face.normal)
            }
            
            const groundY = intersects[0].point.y
            if (this.object.position.y < groundY + 0.1) {
                this.object.position.y = groundY
                this.velocity.y = 0
            }
            return true
        }
        
        this.isGrounded = false
        return false
    }
    
    update(delta, colliders = []) {
        if (!this.object) return
        
        this.checkGround(colliders)
        
        const currentSpeed = this.sprint ? this.speed * this.sprintMultiplier : this.speed
        const controlFactor = this.isGrounded ? 1 : this.airControl
        
        this.direction.set(0, 0, 0)
        
        if (this.moveForward) this.direction.z -= 1
        if (this.moveBackward) this.direction.z += 1
        if (this.moveLeft) this.direction.x -= 1
        if (this.moveRight) this.direction.x += 1
        
        this.direction.normalize()
        
        if (this.camera) {
            const cameraDirection = new THREE.Vector3()
            this.camera.getWorldDirection(cameraDirection)
            cameraDirection.y = 0
            cameraDirection.normalize()
            
            const cameraRight = new THREE.Vector3()
            cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))
            
            const moveDir = new THREE.Vector3()
            moveDir.addScaledVector(cameraDirection, -this.direction.z)
            moveDir.addScaledVector(cameraRight, this.direction.x)
            
            this.direction.copy(moveDir)
        }
        
        this.velocity.x += this.direction.x * currentSpeed * controlFactor * delta
        this.velocity.z += this.direction.z * currentSpeed * controlFactor * delta
        
        if (this.jump && this.isGrounded && this.canJump) {
            this.velocity.y = this.jumpForce
            this.isGrounded = false
            this.canJump = false
        }
        
        if (!this.jump) {
            this.canJump = true
        }
        
        if (!this.isGrounded) {
            this.velocity.y += this.gravity * delta
            this.velocity.y = Math.max(this.velocity.y, this.maxFallSpeed)
        }
        
        if (this.isGrounded) {
            this.velocity.x *= this.friction
            this.velocity.z *= this.friction
        }
        
        this.object.position.x += this.velocity.x * delta
        this.object.position.y += this.velocity.y * delta
        this.object.position.z += this.velocity.z * delta
        
        if (this.direction.length() > 0.1 && this.isGrounded) {
            const targetRotation = Math.atan2(this.direction.x, this.direction.z)
            this.object.rotation.y = THREE.MathUtils.lerp(
                this.object.rotation.y,
                targetRotation,
                0.1
            )
        }
    }
    
    teleport(position) {
        if (!this.object) return
        this.object.position.copy(position)
        this.velocity.set(0, 0, 0)
    }
    
    addForce(force) {
        this.velocity.add(force)
    }
    
    setGrounded(grounded) {
        this.isGrounded = grounded
        if (grounded) {
            this.velocity.y = 0
        }
    }
    
    dispose() {
        document.removeEventListener('keydown', this.boundKeyDown)
        document.removeEventListener('keyup', this.boundKeyUp)
    }
}

export const WeaponTypes = {
    SWORD: 'sword',
    AXE: 'axe',
    MACE: 'mace',
    DAGGER: 'dagger',
    SPEAR: 'spear',
    BOW: 'bow',
    STAFF: 'staff',
    SHIELD: 'shield'
}

export const Rarities = {
    COMMON: { name: 'Common', color: 0xffffff, multiplier: 1.0 },
    UNCOMMON: { name: 'Uncommon', color: 0x1eff00, multiplier: 1.25 },
    RARE: { name: 'Rare', color: 0x0070dd, multiplier: 1.5 },
    EPIC: { name: 'Epic', color: 0xa335ee, multiplier: 2.0 },
    LEGENDARY: { name: 'Legendary', color: 0xff8000, multiplier: 3.0 }
}

export const Elements = {
    NONE: { name: 'Physical', color: 0xcccccc },
    FIRE: { name: 'Fire', color: 0xff4400 },
    ICE: { name: 'Ice', color: 0x00aaff },
    LIGHTNING: { name: 'Lightning', color: 0xffff00 },
    POISON: { name: 'Poison', color: 0x00ff44 },
    SHADOW: { name: 'Shadow', color: 0x440066 }
}

export class Weapon {
    constructor(config = {}) {
        this.id = config.id || this.generateId()
        this.name = config.name || 'Unknown Weapon'
        this.type = config.type || WeaponTypes.SWORD
        this.rarity = config.rarity || 'COMMON'
        this.element = config.element || 'NONE'
        this.level = config.level || 1
        
        this.baseDamage = config.baseDamage || 10
        this.attackSpeed = config.attackSpeed || 1.0
        this.critChance = config.critChance || 0.05
        this.critMultiplier = config.critMultiplier || 1.5
        this.range = config.range || 1.5
        this.durability = config.durability || 100
        this.maxDurability = config.maxDurability || 100
        
        this.bonuses = config.bonuses || {}
        this.abilities = config.abilities || []
        this.description = config.description || ''
        
        this.mesh = null
        this.equipped = false
        this.owner = null
    }
    
    generateId() {
        return 'wpn_' + Math.random().toString(36).substring(2, 11)
    }
    
    getDamage() {
        const rarityData = Rarities[this.rarity]
        const multiplier = rarityData ? rarityData.multiplier : 1.0
        return Math.floor(this.baseDamage * multiplier * (1 + (this.level - 1) * 0.1))
    }
    
    attack(target) {
        if (this.durability <= 0) {
            return { success: false, error: 'Weapon is broken' }
        }
        
        let damage = this.getDamage()
        let isCrit = Math.random() < this.critChance
        
        if (isCrit) {
            damage = Math.floor(damage * this.critMultiplier)
        }
        
        const elementData = Elements[this.element]
        const elementalDamage = this.element !== 'NONE' ? Math.floor(damage * 0.25) : 0
        
        this.durability = Math.max(0, this.durability - 1)
        
        return {
            success: true,
            damage,
            elementalDamage,
            element: this.element,
            isCrit,
            totalDamage: damage + elementalDamage
        }
    }
    
    repair(amount = this.maxDurability) {
        this.durability = Math.min(this.maxDurability, this.durability + amount)
    }
    
    upgrade() {
        this.level++
        this.baseDamage = Math.floor(this.baseDamage * 1.1)
        this.maxDurability = Math.floor(this.maxDurability * 1.05)
        this.durability = this.maxDurability
    }
}

export class WeaponGenerator {
    constructor() {
        this.prefixes = {
            COMMON: ['Rusty', 'Old', 'Simple', 'Basic'],
            UNCOMMON: ['Sharp', 'Sturdy', 'Fine', 'Keen'],
            RARE: ['Masterwork', 'Enchanted', 'Blessed', 'Ancient'],
            EPIC: ['Legendary', 'Mythical', 'Arcane', 'Divine'],
            LEGENDARY: ['Godslayer', 'Worldbreaker', 'Eternal', 'Primal']
        }
        
        this.suffixes = {
            FIRE: ['of Flames', 'of Burning', 'of the Inferno', 'of Cinders'],
            ICE: ['of Frost', 'of Winter', 'of the Glacier', 'of Freezing'],
            LIGHTNING: ['of Thunder', 'of Storms', 'of Lightning', 'of Shock'],
            POISON: ['of Venom', 'of Toxins', 'of Plague', 'of Decay'],
            SHADOW: ['of Shadows', 'of Darkness', 'of the Void', 'of Night']
        }
        
        this.baseNames = {
            sword: ['Blade', 'Sword', 'Longsword', 'Claymore', 'Saber'],
            axe: ['Axe', 'Hatchet', 'Battleaxe', 'Cleaver', 'Tomahawk'],
            mace: ['Mace', 'Hammer', 'Flail', 'Morning Star', 'Cudgel'],
            dagger: ['Dagger', 'Knife', 'Stiletto', 'Shiv', 'Dirk'],
            spear: ['Spear', 'Lance', 'Pike', 'Javelin', 'Halberd'],
            bow: ['Bow', 'Longbow', 'Shortbow', 'Crossbow', 'Recurve'],
            staff: ['Staff', 'Rod', 'Wand', 'Scepter', 'Cane'],
            shield: ['Shield', 'Buckler', 'Barrier', 'Guard', 'Aegis']
        }
    }
    
    generate(options = {}) {
        const type = options.type || this.randomType()
        const rarity = options.rarity || this.randomRarity()
        const element = options.element || this.randomElement()
        const level = options.level || 1
        
        const name = this.generateName(type, rarity, element)
        const baseStats = this.getBaseStats(type)
        const rarityData = Rarities[rarity]
        
        const weapon = new Weapon({
            name,
            type,
            rarity,
            element,
            level,
            baseDamage: Math.floor(baseStats.damage * rarityData.multiplier * (0.9 + Math.random() * 0.2)),
            attackSpeed: baseStats.speed * (0.95 + Math.random() * 0.1),
            critChance: baseStats.critChance + (rarityData.multiplier - 1) * 0.05,
            critMultiplier: 1.5 + (rarityData.multiplier - 1) * 0.25,
            range: baseStats.range,
            durability: Math.floor(baseStats.durability * rarityData.multiplier),
            maxDurability: Math.floor(baseStats.durability * rarityData.multiplier),
            description: `A ${rarity.toLowerCase()} ${type} forged with skill.`
        })
        
        return weapon
    }
    
    randomType() {
        const types = Object.values(WeaponTypes)
        return types[Math.floor(Math.random() * types.length)]
    }
    
    randomRarity() {
        const roll = Math.random()
        if (roll < 0.5) return 'COMMON'
        if (roll < 0.75) return 'UNCOMMON'
        if (roll < 0.9) return 'RARE'
        if (roll < 0.98) return 'EPIC'
        return 'LEGENDARY'
    }
    
    randomElement() {
        if (Math.random() < 0.6) return 'NONE'
        const elements = Object.keys(Elements).filter(e => e !== 'NONE')
        return elements[Math.floor(Math.random() * elements.length)]
    }
    
    generateName(type, rarity, element) {
        const prefixList = this.prefixes[rarity]
        const prefix = prefixList[Math.floor(Math.random() * prefixList.length)]
        
        const baseList = this.baseNames[type]
        const base = baseList[Math.floor(Math.random() * baseList.length)]
        
        let name = `${prefix} ${base}`
        
        if (element !== 'NONE') {
            const suffixList = this.suffixes[element]
            const suffix = suffixList[Math.floor(Math.random() * suffixList.length)]
            name += ` ${suffix}`
        }
        
        return name
    }
    
    getBaseStats(type) {
        const stats = {
            sword: { damage: 15, speed: 1.0, critChance: 0.1, range: 1.5, durability: 100 },
            axe: { damage: 20, speed: 0.8, critChance: 0.15, range: 1.3, durability: 120 },
            mace: { damage: 18, speed: 0.7, critChance: 0.05, range: 1.2, durability: 150 },
            dagger: { damage: 8, speed: 1.5, critChance: 0.2, range: 1.0, durability: 80 },
            spear: { damage: 14, speed: 0.9, critChance: 0.12, range: 2.5, durability: 90 },
            bow: { damage: 12, speed: 1.1, critChance: 0.15, range: 15, durability: 70 },
            staff: { damage: 10, speed: 1.0, critChance: 0.08, range: 2.0, durability: 60 },
            shield: { damage: 5, speed: 0.5, critChance: 0.02, range: 1.0, durability: 200 }
        }
        return stats[type] || stats.sword
    }
}

export class CraftingSystem {
    constructor() {
        this.recipes = new Map()
        this.ingredients = new Map()
        this.craftedItems = []
        
        this.initDefaultRecipes()
    }
    
    initDefaultRecipes() {
        this.addRecipe('iron_sword', {
            name: 'Iron Sword',
            category: 'weapons',
            ingredients: [
                { id: 'iron_ingot', amount: 3 },
                { id: 'wood_plank', amount: 1 },
                { id: 'leather_strip', amount: 1 }
            ],
            output: { id: 'iron_sword', amount: 1 },
            stats: { damage: 15, durability: 100, speed: 1.0 },
            craftTime: 5
        })
        
        this.addRecipe('health_potion', {
            name: 'Health Potion',
            category: 'potions',
            ingredients: [
                { id: 'red_herb', amount: 2 },
                { id: 'water_flask', amount: 1 }
            ],
            output: { id: 'health_potion', amount: 1 },
            stats: { healing: 50, duration: 0 },
            craftTime: 3
        })
        
        this.addRecipe('steel_armor', {
            name: 'Steel Chestplate',
            category: 'armor',
            ingredients: [
                { id: 'steel_ingot', amount: 5 },
                { id: 'leather', amount: 2 },
                { id: 'iron_buckle', amount: 2 }
            ],
            output: { id: 'steel_chestplate', amount: 1 },
            stats: { defense: 25, weight: 15, durability: 150 },
            craftTime: 10
        })
        
        this.addIngredient('iron_ingot', { name: 'Iron Ingot', rarity: 'common', type: 'metal' })
        this.addIngredient('steel_ingot', { name: 'Steel Ingot', rarity: 'uncommon', type: 'metal' })
        this.addIngredient('gold_ingot', { name: 'Gold Ingot', rarity: 'rare', type: 'metal' })
        this.addIngredient('wood_plank', { name: 'Wood Plank', rarity: 'common', type: 'wood' })
        this.addIngredient('leather', { name: 'Leather', rarity: 'common', type: 'hide' })
        this.addIngredient('leather_strip', { name: 'Leather Strip', rarity: 'common', type: 'hide' })
        this.addIngredient('red_herb', { name: 'Red Herb', rarity: 'common', type: 'plant' })
        this.addIngredient('water_flask', { name: 'Water Flask', rarity: 'common', type: 'container' })
        this.addIngredient('iron_buckle', { name: 'Iron Buckle', rarity: 'common', type: 'component' })
    }
    
    addRecipe(id, recipe) {
        this.recipes.set(id, { id, ...recipe })
    }
    
    addIngredient(id, ingredient) {
        this.ingredients.set(id, { id, ...ingredient })
    }
    
    getRecipe(id) {
        return this.recipes.get(id)
    }
    
    getRecipesByCategory(category) {
        const results = []
        for (const recipe of this.recipes.values()) {
            if (recipe.category === category) {
                results.push(recipe)
            }
        }
        return results
    }
    
    canCraft(recipeId, inventory) {
        const recipe = this.recipes.get(recipeId)
        if (!recipe) return false
        
        for (const ingredient of recipe.ingredients) {
            const playerAmount = inventory[ingredient.id] || 0
            if (playerAmount < ingredient.amount) {
                return false
            }
        }
        return true
    }
    
    craft(recipeId, inventory) {
        const recipe = this.recipes.get(recipeId)
        if (!recipe) {
            return { success: false, error: 'Recipe not found' }
        }
        
        if (!this.canCraft(recipeId, inventory)) {
            return { success: false, error: 'Missing ingredients' }
        }
        
        for (const ingredient of recipe.ingredients) {
            inventory[ingredient.id] -= ingredient.amount
        }
        
        const outputId = recipe.output.id
        inventory[outputId] = (inventory[outputId] || 0) + recipe.output.amount
        
        const craftedItem = {
            ...recipe.output,
            stats: { ...recipe.stats },
            craftedAt: Date.now()
        }
        this.craftedItems.push(craftedItem)
        
        return { 
            success: true, 
            item: craftedItem,
            inventory 
        }
    }
    
    getAllRecipes() {
        return Array.from(this.recipes.values())
    }
}

export const GRUDGE = {
    version: '1.0.0',
    name: 'GRUDGE Engine',
    PlatformController,
    Weapon,
    WeaponGenerator,
    WeaponTypes,
    Rarities,
    Elements,
    CraftingSystem
}

export default GRUDGE
