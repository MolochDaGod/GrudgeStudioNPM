import grudgeNetwork from '../network/GrudgeNetworkService.js'

export class CharacterStorageService {
    constructor() {
        this.cachePrefix = 'grudge_char_'
        this.syncInProgress = false
        this.lastSyncTime = 0
        this.syncInterval = 30000
    }

    get isCloudAvailable() {
        return grudgeNetwork.isConnected && grudgeNetwork.isAvailable
    }

    getUserId() {
        return grudgeNetwork.currentUser?.uuid || 'local'
    }

    getStorageKey(type, characterId = 'default') {
        return `character:${this.getUserId()}:${characterId}:${type}`
    }

    async saveCharacterStats(stats, characterId = 'default') {
        const key = this.getStorageKey('stats', characterId)
        const data = {
            ...stats,
            lastModified: Date.now(),
            version: 1
        }

        localStorage.setItem(`${this.cachePrefix}${characterId}_stats`, JSON.stringify(data))

        if (this.isCloudAvailable) {
            try {
                await grudgeNetwork.kvSet(key, data)
                console.log('[CharacterStorage] Stats synced to cloud:', characterId)
                return { synced: true, local: true }
            } catch (error) {
                console.warn('[CharacterStorage] Cloud sync failed, saved locally:', error)
                return { synced: false, local: true }
            }
        }

        return { synced: false, local: true }
    }

    async loadCharacterStats(characterId = 'default') {
        const localKey = `${this.cachePrefix}${characterId}_stats`
        const localData = localStorage.getItem(localKey)
        let local = localData ? JSON.parse(localData) : null

        if (this.isCloudAvailable) {
            try {
                const key = this.getStorageKey('stats', characterId)
                const cloudData = await grudgeNetwork.kvGet(key)

                if (cloudData) {
                    if (!local || cloudData.lastModified > local.lastModified) {
                        localStorage.setItem(localKey, JSON.stringify(cloudData))
                        console.log('[CharacterStorage] Loaded stats from cloud:', characterId)
                        return { data: cloudData, source: 'cloud' }
                    }
                }
            } catch (error) {
                console.warn('[CharacterStorage] Cloud load failed:', error)
            }
        }

        return { data: local, source: 'local' }
    }

    async saveSkillTree(skillTreeData, characterId = 'default') {
        const key = this.getStorageKey('skills', characterId)
        const data = {
            baseStats: skillTreeData.baseStats,
            skills: skillTreeData.skills,
            skillPoints: skillTreeData.skillPoints,
            level: skillTreeData.level,
            lastModified: Date.now(),
            version: 1
        }

        localStorage.setItem(`${this.cachePrefix}${characterId}_skills`, JSON.stringify(data))

        if (this.isCloudAvailable) {
            try {
                await grudgeNetwork.kvSet(key, data)
                console.log('[CharacterStorage] Skill tree synced to cloud:', characterId)
                return { synced: true, local: true }
            } catch (error) {
                console.warn('[CharacterStorage] Skill tree cloud sync failed:', error)
                return { synced: false, local: true }
            }
        }

        return { synced: false, local: true }
    }

    async loadSkillTree(characterId = 'default') {
        const localKey = `${this.cachePrefix}${characterId}_skills`
        const localData = localStorage.getItem(localKey)
        let local = localData ? JSON.parse(localData) : null

        if (this.isCloudAvailable) {
            try {
                const key = this.getStorageKey('skills', characterId)
                const cloudData = await grudgeNetwork.kvGet(key)

                if (cloudData) {
                    if (!local || cloudData.lastModified > local.lastModified) {
                        localStorage.setItem(localKey, JSON.stringify(cloudData))
                        console.log('[CharacterStorage] Loaded skill tree from cloud:', characterId)
                        return { data: cloudData, source: 'cloud' }
                    }
                }
            } catch (error) {
                console.warn('[CharacterStorage] Skill tree cloud load failed:', error)
            }
        }

        return { data: local, source: 'local' }
    }

    async saveCharacterProfile(profile, characterId = 'default') {
        const key = this.getStorageKey('profile', characterId)
        const data = {
            name: profile.name,
            class: profile.class,
            race: profile.race,
            appearance: profile.appearance,
            createdAt: profile.createdAt || Date.now(),
            lastModified: Date.now(),
            version: 1
        }

        localStorage.setItem(`${this.cachePrefix}${characterId}_profile`, JSON.stringify(data))

        if (this.isCloudAvailable) {
            try {
                await grudgeNetwork.kvSet(key, data)
                return { synced: true, local: true }
            } catch (error) {
                console.warn('[CharacterStorage] Profile cloud sync failed:', error)
                return { synced: false, local: true }
            }
        }

        return { synced: false, local: true }
    }

    async loadCharacterProfile(characterId = 'default') {
        const localKey = `${this.cachePrefix}${characterId}_profile`
        const localData = localStorage.getItem(localKey)
        let local = localData ? JSON.parse(localData) : null

        if (this.isCloudAvailable) {
            try {
                const key = this.getStorageKey('profile', characterId)
                const cloudData = await grudgeNetwork.kvGet(key)

                if (cloudData) {
                    if (!local || cloudData.lastModified > local.lastModified) {
                        localStorage.setItem(localKey, JSON.stringify(cloudData))
                        return { data: cloudData, source: 'cloud' }
                    }
                }
            } catch (error) {
                console.warn('[CharacterStorage] Profile cloud load failed:', error)
            }
        }

        return { data: local, source: 'local' }
    }

    async listCharacters() {
        const characters = []
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key.startsWith(`${this.cachePrefix}`) && key.endsWith('_profile')) {
                const charId = key.replace(this.cachePrefix, '').replace('_profile', '')
                const data = JSON.parse(localStorage.getItem(key))
                characters.push({
                    id: charId,
                    ...data
                })
            }
        }

        if (this.isCloudAvailable) {
            try {
                const keys = await grudgeNetwork.kvList(`character:${this.getUserId()}:`)
                const profileKeys = keys.filter(k => k.endsWith(':profile'))
                
                for (const key of profileKeys) {
                    const charId = key.split(':')[2]
                    if (!characters.find(c => c.id === charId)) {
                        const data = await grudgeNetwork.kvGet(key)
                        if (data) {
                            characters.push({ id: charId, ...data })
                        }
                    }
                }
            } catch (error) {
                console.warn('[CharacterStorage] Failed to list cloud characters:', error)
            }
        }

        return characters.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
    }

    async deleteCharacter(characterId) {
        localStorage.removeItem(`${this.cachePrefix}${characterId}_stats`)
        localStorage.removeItem(`${this.cachePrefix}${characterId}_skills`)
        localStorage.removeItem(`${this.cachePrefix}${characterId}_profile`)

        if (this.isCloudAvailable) {
            try {
                await grudgeNetwork.kvDel(this.getStorageKey('stats', characterId))
                await grudgeNetwork.kvDel(this.getStorageKey('skills', characterId))
                await grudgeNetwork.kvDel(this.getStorageKey('profile', characterId))
                console.log('[CharacterStorage] Character deleted from cloud:', characterId)
            } catch (error) {
                console.warn('[CharacterStorage] Cloud delete failed:', error)
            }
        }
    }

    async syncAll(characterId = 'default') {
        if (this.syncInProgress) return { status: 'in_progress' }
        if (!this.isCloudAvailable) return { status: 'offline' }

        this.syncInProgress = true
        
        try {
            const statsResult = await this.loadCharacterStats(characterId)
            const skillsResult = await this.loadSkillTree(characterId)
            const profileResult = await this.loadCharacterProfile(characterId)

            this.lastSyncTime = Date.now()
            
            return {
                status: 'success',
                stats: statsResult,
                skills: skillsResult,
                profile: profileResult
            }
        } catch (error) {
            console.error('[CharacterStorage] Sync failed:', error)
            return { status: 'error', error }
        } finally {
            this.syncInProgress = false
        }
    }

    async exportCharacter(characterId = 'default') {
        const stats = await this.loadCharacterStats(characterId)
        const skills = await this.loadSkillTree(characterId)
        const profile = await this.loadCharacterProfile(characterId)

        return {
            characterId,
            exportedAt: Date.now(),
            stats: stats.data,
            skills: skills.data,
            profile: profile.data
        }
    }

    async importCharacter(exportData, newCharacterId = null) {
        const characterId = newCharacterId || exportData.characterId || 'imported_' + Date.now()

        if (exportData.stats) {
            await this.saveCharacterStats(exportData.stats, characterId)
        }
        if (exportData.skills) {
            await this.saveSkillTree(exportData.skills, characterId)
        }
        if (exportData.profile) {
            await this.saveCharacterProfile(exportData.profile, characterId)
        }

        return characterId
    }
}

export const characterStorage = new CharacterStorageService()
export default characterStorage
