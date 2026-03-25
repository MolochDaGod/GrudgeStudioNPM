/*
    GRUDGE Studio - Game Action Bars
    Weapon Skills (4 slots) + Trait Abilities (4 slots)
    Based on Albion Online-style weapon abilities
*/

import { hotkeyManager } from './HotkeyManager.js'

export const WEAPON_SKILLS = [
    { id: 'weapon_q', key: 'Q', name: 'Basic Strike', icon: '⚔️', cooldown: 0, description: 'Quick melee attack' },
    { id: 'weapon_w', key: 'W', name: 'Power Swing', icon: '🗡️', cooldown: 5, description: 'Heavy damage attack' },
    { id: 'weapon_e', key: 'E', name: 'Whirlwind', icon: '🌀', cooldown: 10, description: 'AoE spin attack' },
    { id: 'weapon_r', key: 'R', name: 'Execute', icon: '💀', cooldown: 20, description: 'Ultimate weapon ability' }
]

export const TRAIT_ABILITIES = [
    { id: 'trait_1', key: '1', name: 'Heal', icon: '❤️', cooldown: 15, description: 'Restore health' },
    { id: 'trait_2', key: '2', name: 'Shield', icon: '🛡️', cooldown: 20, description: 'Defensive barrier' },
    { id: 'trait_3', key: '3', name: 'Dash', icon: '💨', cooldown: 8, description: 'Quick movement' },
    { id: 'trait_4', key: '4', name: 'Rage', icon: '🔥', cooldown: 30, description: 'Damage boost' }
]

export class GameActionBars {
    constructor() {
        this.weaponBar = null
        this.traitBar = null
        this.cooldowns = new Map()
        this.onAbilityUse = null
    }
    
    init() {
        this.weaponBar = document.getElementById('weapon-action-bar')
        this.traitBar = document.getElementById('trait-action-bar')
        
        if (this.weaponBar) {
            this.renderBar(this.weaponBar, WEAPON_SKILLS, 'weapon')
        }
        
        if (this.traitBar) {
            this.renderBar(this.traitBar, TRAIT_ABILITIES, 'trait')
        }
        
        this.bindKeyEvents()
        console.log('[GameActionBars] Initialized weapon and trait bars')
    }
    
    renderBar(container, abilities, type) {
        container.innerHTML = abilities.map((ability, index) => `
            <div class="action-slot" data-id="${ability.id}" data-type="${type}" data-index="${index}">
                <span class="slot-icon">${ability.icon}</span>
                <span class="slot-key">${ability.key}</span>
                <div class="slot-cooldown"></div>
                <div class="action-slot-tooltip">
                    <strong>${ability.name}</strong><br>
                    <span style="color:#888">${ability.description}</span><br>
                    <span style="color:#6ee7b7">[${ability.key}] CD: ${ability.cooldown}s</span>
                </div>
            </div>
        `).join('')
        
        container.querySelectorAll('.action-slot').forEach(slot => {
            slot.addEventListener('click', () => this.useAbility(slot.dataset.id))
            
            slot.addEventListener('mouseenter', () => {
                const tooltip = slot.querySelector('.action-slot-tooltip')
                if (tooltip) tooltip.style.opacity = '1'
            })
            
            slot.addEventListener('mouseleave', () => {
                const tooltip = slot.querySelector('.action-slot-tooltip')
                if (tooltip) tooltip.style.opacity = '0'
            })
        })
    }
    
    bindKeyEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
            
            const key = e.key.toUpperCase()
            
            const weaponAbility = WEAPON_SKILLS.find(a => a.key.toUpperCase() === key)
            if (weaponAbility) {
                this.useAbility(weaponAbility.id)
                return
            }
            
            const traitAbility = TRAIT_ABILITIES.find(a => a.key === key)
            if (traitAbility) {
                this.useAbility(traitAbility.id)
                return
            }
        })
    }
    
    useAbility(abilityId) {
        if (this.cooldowns.has(abilityId)) {
            console.log(`[GameActionBars] ${abilityId} is on cooldown`)
            return
        }
        
        const allAbilities = [...WEAPON_SKILLS, ...TRAIT_ABILITIES]
        const ability = allAbilities.find(a => a.id === abilityId)
        
        if (!ability) return
        
        console.log(`[GameActionBars] Using ability: ${ability.name}`)
        
        const slot = document.querySelector(`.action-slot[data-id="${abilityId}"]`)
        if (slot) {
            slot.classList.add('active')
            setTimeout(() => slot.classList.remove('active'), 200)
        }
        
        if (ability.cooldown > 0) {
            this.startCooldown(abilityId, ability.cooldown)
        }
        
        if (this.onAbilityUse) {
            this.onAbilityUse(ability)
        }
    }
    
    startCooldown(abilityId, duration) {
        const slot = document.querySelector(`.action-slot[data-id="${abilityId}"]`)
        if (!slot) return
        
        slot.classList.add('on-cooldown')
        const cdDisplay = slot.querySelector('.slot-cooldown')
        
        let remaining = duration
        this.cooldowns.set(abilityId, remaining)
        
        cdDisplay.style.display = 'flex'
        cdDisplay.textContent = remaining
        
        const interval = setInterval(() => {
            remaining--
            cdDisplay.textContent = remaining
            this.cooldowns.set(abilityId, remaining)
            
            if (remaining <= 0) {
                clearInterval(interval)
                this.cooldowns.delete(abilityId)
                slot.classList.remove('on-cooldown')
                cdDisplay.style.display = 'none'
            }
        }, 1000)
    }
    
    setWeaponSkills(skills) {
        if (this.weaponBar && skills.length === 4) {
            this.renderBar(this.weaponBar, skills, 'weapon')
        }
    }
    
    setTraitAbilities(abilities) {
        if (this.traitBar && abilities.length === 4) {
            this.renderBar(this.traitBar, abilities, 'trait')
        }
    }
    
    resetCooldowns() {
        this.cooldowns.clear()
        document.querySelectorAll('.action-slot').forEach(slot => {
            slot.classList.remove('on-cooldown')
            const cdDisplay = slot.querySelector('.slot-cooldown')
            if (cdDisplay) cdDisplay.style.display = 'none'
        })
    }
}

export const gameActionBars = new GameActionBars()
