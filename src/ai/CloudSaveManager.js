import { puterService } from './PuterService.js'

export class CloudSaveManager {
    constructor() {
        this.autoSaveInterval = null
        this.autoSaveDelay = 60000
        this.lastSave = null
        this.pendingChanges = false
    }

    async initialize() {
        window.addEventListener('beforeunload', () => {
            if (this.pendingChanges) {
                this.saveAll()
            }
        })
        
        console.log('CloudSaveManager initialized')
    }

    startAutoSave(intervalMs = 60000) {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval)
        }
        
        this.autoSaveDelay = intervalMs
        this.autoSaveInterval = setInterval(() => {
            if (this.pendingChanges) {
                this.saveAll()
            }
        }, intervalMs)
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval)
            this.autoSaveInterval = null
        }
    }

    markPendingChanges() {
        this.pendingChanges = true
    }

    async savePlayerStats(stats) {
        const success = await puterService.saveGameData('player_stats', stats)
        if (success) {
            this.lastSave = Date.now()
            console.log('Player stats saved to cloud')
        }
        return success
    }

    async loadPlayerStats() {
        return await puterService.loadGameData('player_stats', {
            level: 1,
            experience: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            killCount: 0,
            deathCount: 0,
            longestWinStreak: 0,
            currentWinStreak: 0,
            favoriteCharacter: null,
            playTime: 0
        })
    }

    async saveSkillTree(skillTreeData) {
        const success = await puterService.saveGameData('skill_tree', skillTreeData)
        if (success) {
            console.log('Skill tree saved to cloud')
        }
        return success
    }

    async loadSkillTree() {
        return await puterService.loadGameData('skill_tree', {
            unlockedSkills: [],
            skillPoints: 0,
            activeLoadout: []
        })
    }

    async saveCharacterBuild(characterId, build) {
        const key = `character_build_${characterId}`
        return await puterService.saveGameData(key, build)
    }

    async loadCharacterBuild(characterId) {
        const key = `character_build_${characterId}`
        return await puterService.loadGameData(key, null)
    }

    async saveSettings(settings) {
        return await puterService.saveGameData('game_settings', settings)
    }

    async loadSettings() {
        return await puterService.loadGameData('game_settings', {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            voiceEnabled: false,
            aiAnnouncerEnabled: true,
            graphicsQuality: 'high',
            cameraMode: 'thirdPerson',
            invertY: false,
            mouseSensitivity: 1.0,
            keybinds: {}
        })
    }

    async saveMatchResult(result) {
        const history = await this.loadMatchHistory()
        history.unshift({
            ...result,
            timestamp: Date.now()
        })
        
        if (history.length > 100) {
            history.pop()
        }
        
        return await puterService.saveGameData('match_history', history)
    }

    async loadMatchHistory() {
        return await puterService.loadGameData('match_history', [])
    }

    async saveAll() {
        this.pendingChanges = false
        this.lastSave = Date.now()
        console.log('All game data saved')
    }

    async exportSaveData() {
        const data = {
            playerStats: await this.loadPlayerStats(),
            skillTree: await this.loadSkillTree(),
            settings: await this.loadSettings(),
            matchHistory: await this.loadMatchHistory(),
            exportedAt: Date.now()
        }
        
        return JSON.stringify(data, null, 2)
    }

    async importSaveData(jsonString) {
        try {
            const data = JSON.parse(jsonString)
            
            if (data.playerStats) {
                await this.savePlayerStats(data.playerStats)
            }
            if (data.skillTree) {
                await this.saveSkillTree(data.skillTree)
            }
            if (data.settings) {
                await this.saveSettings(data.settings)
            }
            if (data.matchHistory) {
                await puterService.saveGameData('match_history', data.matchHistory)
            }
            
            return true
        } catch (error) {
            console.error('Failed to import save data:', error)
            return false
        }
    }

    async clearAllData() {
        await puterService.deleteGameData('player_stats')
        await puterService.deleteGameData('skill_tree')
        await puterService.deleteGameData('game_settings')
        await puterService.deleteGameData('match_history')
        console.log('All save data cleared')
    }

    async recordKill() {
        return await puterService.incrementStat('total_kills')
    }

    async recordDeath() {
        return await puterService.incrementStat('total_deaths')
    }

    async recordWin() {
        return await puterService.incrementStat('total_wins')
    }

    async recordLoss() {
        return await puterService.incrementStat('total_losses')
    }
}

export const cloudSaveManager = new CloudSaveManager()
