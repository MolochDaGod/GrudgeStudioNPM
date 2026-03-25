export class PuterService {
    constructor() {
        this.isAvailable = typeof window !== 'undefined' && typeof window.puter !== 'undefined'
        this.chatHistory = []
        this.dungeonMasterPrompt = `You are a dramatic fantasy battle announcer for an arena combat game. 
You provide short, exciting commentary on combat events. Keep responses to 1-2 sentences maximum.
Be dramatic but concise. Use fantasy vocabulary. Never break character.`
    }

    get puter() {
        if (!this.isAvailable) {
            console.warn('Puter SDK not available')
            return null
        }
        return window.puter
    }

    async chat(prompt, options = {}) {
        if (!this.puter) return null
        
        try {
            const response = await this.puter.ai.chat(prompt, {
                model: options.model || 'gpt-4o-mini',
                ...options
            })
            return response.toString()
        } catch (error) {
            console.error('Puter AI chat error:', error)
            return null
        }
    }

    async streamChat(prompt, onChunk, options = {}) {
        if (!this.puter) return null
        
        try {
            const response = await this.puter.ai.chat(prompt, {
                model: options.model || 'gpt-4o-mini',
                stream: true,
                ...options
            })
            
            let fullText = ''
            for await (const part of response) {
                if (part?.text) {
                    fullText += part.text
                    onChunk?.(part.text, fullText)
                }
            }
            return fullText
        } catch (error) {
            console.error('Puter AI stream error:', error)
            return null
        }
    }

    async generateCombatNarrative(event) {
        const prompt = `${this.dungeonMasterPrompt}\n\nDescribe this combat event: ${event}`
        return await this.chat(prompt)
    }

    async generateCharacterBackstory(characterName, characterClass) {
        const prompt = `Create a brief 2-sentence dramatic backstory for a ${characterClass} named "${characterName}" who fights in the arena.`
        return await this.chat(prompt)
    }

    async generateTaunt(attackerName, defenderName) {
        const prompt = `${this.dungeonMasterPrompt}\n\nGenerate a short battle taunt from ${attackerName} to ${defenderName}. One line only.`
        return await this.chat(prompt)
    }

    async generateVictoryAnnouncement(winnerName, loserName) {
        const prompt = `${this.dungeonMasterPrompt}\n\n${winnerName} has defeated ${loserName} in the arena! Announce this victory dramatically in one sentence.`
        return await this.chat(prompt)
    }

    async textToSpeech(text, options = {}) {
        if (!this.puter) return null
        
        try {
            const audio = await this.puter.ai.txt2speech(text, {
                voice: options.voice || 'Matthew',
                engine: options.engine || 'neural',
                language: options.language || 'en-US',
                ...options
            })
            return audio
        } catch (error) {
            console.error('Puter TTS error:', error)
            return null
        }
    }

    async announceWithVoice(text, autoPlay = true) {
        const audio = await this.textToSpeech(text)
        if (audio && autoPlay) {
            audio.play().catch(e => console.warn('Audio autoplay blocked:', e))
        }
        return audio
    }

    async generateImage(prompt, options = {}) {
        if (!this.puter) return null
        
        try {
            const image = await this.puter.ai.txt2img(prompt, {
                model: options.model || 'dall-e-3',
                ...options
            })
            return image
        } catch (error) {
            console.error('Puter image generation error:', error)
            return null
        }
    }

    async saveGameData(key, data) {
        if (!this.puter) {
            localStorage.setItem(`grudge_${key}`, JSON.stringify(data))
            return true
        }
        
        try {
            await this.puter.kv.set(key, data)
            return true
        } catch (error) {
            console.error('Puter KV save error:', error)
            localStorage.setItem(`grudge_${key}`, JSON.stringify(data))
            return true
        }
    }

    async loadGameData(key, defaultValue = null) {
        if (!this.puter) {
            const stored = localStorage.getItem(`grudge_${key}`)
            return stored ? JSON.parse(stored) : defaultValue
        }
        
        try {
            const data = await this.puter.kv.get(key)
            return data !== null ? data : defaultValue
        } catch (error) {
            console.error('Puter KV load error:', error)
            const stored = localStorage.getItem(`grudge_${key}`)
            return stored ? JSON.parse(stored) : defaultValue
        }
    }

    async deleteGameData(key) {
        if (!this.puter) {
            localStorage.removeItem(`grudge_${key}`)
            return true
        }
        
        try {
            await this.puter.kv.del(key)
            return true
        } catch (error) {
            console.error('Puter KV delete error:', error)
            localStorage.removeItem(`grudge_${key}`)
            return true
        }
    }

    async listSavedGames(pattern = 'save_*') {
        if (!this.puter) {
            const keys = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key.startsWith('grudge_save_')) {
                    keys.push(key.replace('grudge_', ''))
                }
            }
            return keys
        }
        
        try {
            return await this.puter.kv.list(pattern)
        } catch (error) {
            console.error('Puter KV list error:', error)
            return []
        }
    }

    async savePlayerProgress(playerId, progress) {
        return await this.saveGameData(`player_${playerId}`, {
            ...progress,
            savedAt: Date.now()
        })
    }

    async loadPlayerProgress(playerId) {
        return await this.loadGameData(`player_${playerId}`, {
            level: 1,
            experience: 0,
            wins: 0,
            losses: 0,
            kills: 0,
            skillPoints: 0,
            unlockedAbilities: [],
            settings: {}
        })
    }

    async incrementStat(key, amount = 1) {
        if (!this.puter) {
            const current = parseInt(localStorage.getItem(`grudge_${key}`) || '0')
            localStorage.setItem(`grudge_${key}`, String(current + amount))
            return current + amount
        }
        
        try {
            return await this.puter.kv.incr(key, amount)
        } catch (error) {
            console.error('Puter KV incr error:', error)
            return null
        }
    }

    async getLeaderboardPosition(score) {
        const prompt = `Player achieved a combat score of ${score}. Give a short, encouraging one-line reaction as the arena announcer.`
        return await this.chat(prompt)
    }

    async getAIOpponentStrategy(opponentType, playerHealth, opponentHealth) {
        const healthRatio = opponentHealth / 100
        const playerHealthRatio = playerHealth / 100
        
        let strategy = 'balanced'
        if (healthRatio < 0.3) strategy = 'desperate'
        else if (playerHealthRatio < 0.3) strategy = 'aggressive'
        else if (healthRatio > 0.7 && playerHealthRatio < 0.5) strategy = 'pressing'
        
        return strategy
    }

    async analyzePlayerBehavior(actions) {
        if (actions.length < 5) return 'learning'
        
        const attackCount = actions.filter(a => a.includes('attack')).length
        const blockCount = actions.filter(a => a.includes('block')).length
        const dodgeCount = actions.filter(a => a.includes('dodge')).length
        
        const total = actions.length
        if (attackCount / total > 0.6) return 'aggressive'
        if (blockCount / total > 0.4) return 'defensive'
        if (dodgeCount / total > 0.3) return 'evasive'
        return 'balanced'
    }
}

export const puterService = new PuterService()
