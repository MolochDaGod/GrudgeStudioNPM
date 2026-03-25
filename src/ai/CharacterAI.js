import { puterService } from './PuterService.js'

export class CharacterAI {
    constructor() {
        this.characterPrompts = {
            viking: 'a fierce Norse warrior with battle scars and a mighty axe',
            orc: 'a massive green-skinned orc warrior with tusks and brutal strength',
            wolf: 'a mystical shadow wolf with glowing eyes and ethereal fur',
            mage: 'a powerful sorcerer crackling with arcane energy',
            ranger: 'a swift forest archer with keen eyes and silent steps'
        }
    }

    async generateCharacterDescription(characterType, characterName) {
        const basePrompt = this.characterPrompts[characterType] || 'a mysterious arena fighter'
        
        const prompt = `Create a brief, dramatic 2-sentence description for an arena fighter named "${characterName}" who is ${basePrompt}. Focus on their appearance and fighting style.`
        
        return await puterService.chat(prompt)
    }

    async generateBattleCry(characterName, characterType) {
        const prompt = `Create a short battle cry (5-10 words) for ${characterName}, a ${characterType} arena fighter. Just the quote, no attribution.`
        
        const response = await puterService.chat(prompt)
        return response?.replace(/"/g, '') || 'For glory!'
    }

    async generatePreFightDialogue(player1, player2) {
        const prompt = `Create a tense one-line exchange before an arena fight between ${player1.name} (a ${player1.type}) and ${player2.name} (a ${player2.type}). Format: "${player1.name}: [line]" only.`
        
        return await puterService.chat(prompt)
    }

    async suggestCounterStrategy(opponentType, opponentMoves) {
        const recentMoves = opponentMoves.slice(-5).join(', ')
        
        const prompt = `As a combat advisor, suggest a counter strategy in one sentence against a ${opponentType} who has been using: ${recentMoves || 'varied attacks'}.`
        
        return await puterService.chat(prompt)
    }

    async generateDeathQuote(characterName, killerName) {
        const prompt = `Create a short final words quote (5-8 words) for ${characterName} who was just defeated by ${killerName} in arena combat. Just the quote.`
        
        const response = await puterService.chat(prompt)
        return response?.replace(/"/g, '') || 'A worthy... opponent...'
    }

    async generateMatchTitle(player1Name, player2Name) {
        const prompt = `Create an epic match title (3-5 words) for a fight between ${player1Name} and ${player2Name}. Just the title, no punctuation.`
        
        const response = await puterService.chat(prompt)
        return response || `${player1Name} vs ${player2Name}`
    }

    async ratePlayerPerformance(stats) {
        const { damageDealt, damageTaken, comboMax, hitAccuracy, timeAlive } = stats
        
        const prompt = `Rate this arena fighter's performance in one sentence. Stats: Damage dealt: ${damageDealt}, Damage taken: ${damageTaken}, Max combo: ${comboMax}, Hit accuracy: ${hitAccuracy}%, Time survived: ${timeAlive}s. Be encouraging but honest.`
        
        return await puterService.chat(prompt)
    }

    async generateTrainingTip(weakArea) {
        const prompt = `Give a short training tip (one sentence) for an arena fighter who needs to improve their ${weakArea}.`
        
        return await puterService.chat(prompt)
    }

    async generateLoreEntry(topic) {
        const prompt = `Write a brief lore entry (2-3 sentences) about ${topic} in the context of a fantasy arena combat world.`
        
        return await puterService.chat(prompt)
    }

    async generateRandomEvent() {
        const events = [
            'The crowd throws weapons into the arena!',
            'A sandstorm reduces visibility!',
            'The arena floor begins to crack with lava!',
            'Healing potions appear in the center!',
            'The arena lights flicker and dim!',
            'A mysterious barrier divides the arena!'
        ]
        
        return events[Math.floor(Math.random() * events.length)]
    }

    async getAIDifficultyResponse(difficulty, playerHealth, aiHealth) {
        const context = {
            easy: 'Give a gentle, encouraging hint',
            medium: 'Give a neutral tactical observation',
            hard: 'Give an intimidating taunt'
        }
        
        const prompt = `${context[difficulty] || context.medium} to a player with ${playerHealth}% health fighting an AI with ${aiHealth}% health. One short sentence.`
        
        return await puterService.chat(prompt)
    }
}

export const characterAI = new CharacterAI()
