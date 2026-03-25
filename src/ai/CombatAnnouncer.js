import { puterService } from './PuterService.js'

export class CombatAnnouncer {
    constructor() {
        this.enabled = true
        this.voiceEnabled = false
        this.lastAnnouncement = 0
        this.announcementCooldown = 3000
        this.pendingAnnouncements = []
        this.isProcessing = false
    }

    setEnabled(enabled) {
        this.enabled = enabled
    }

    setVoiceEnabled(enabled) {
        this.voiceEnabled = enabled
    }

    async announce(message, priority = 'normal') {
        if (!this.enabled) return
        
        const now = Date.now()
        if (priority !== 'high' && now - this.lastAnnouncement < this.announcementCooldown) {
            return
        }
        
        this.lastAnnouncement = now
        this.showAnnouncementUI(message)
        
        if (this.voiceEnabled) {
            await puterService.announceWithVoice(message)
        }
    }

    showAnnouncementUI(message) {
        let container = document.getElementById('combat-announcements')
        if (!container) {
            container = document.createElement('div')
            container.id = 'combat-announcements'
            container.style.cssText = `
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000;
                pointer-events: none;
                text-align: center;
            `
            document.body.appendChild(container)
        }
        
        const announcement = document.createElement('div')
        announcement.className = 'combat-announcement'
        announcement.textContent = message
        announcement.style.cssText = `
            font-family: 'Cinzel', serif, sans-serif;
            font-size: 24px;
            font-weight: bold;
            color: #ffd700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8);
            padding: 10px 20px;
            background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.3));
            border-radius: 8px;
            margin-bottom: 10px;
            animation: announceFade 3s forwards;
        `
        
        container.appendChild(announcement)
        
        setTimeout(() => {
            announcement.remove()
        }, 3000)
    }

    async announceRoundStart(roundNumber) {
        await this.announce(`ROUND ${roundNumber} - FIGHT!`, 'high')
    }

    async announceHit(attackerName, defenderName, damage) {
        if (damage > 20) {
            const narrative = await puterService.generateCombatNarrative(
                `${attackerName} lands a devastating ${damage} damage hit on ${defenderName}`
            )
            if (narrative) {
                await this.announce(narrative)
            } else {
                await this.announce(`${attackerName} strikes for ${damage} damage!`)
            }
        }
    }

    async announceCombo(attackerName, comboCount) {
        if (comboCount >= 3) {
            await this.announce(`${attackerName} chains a ${comboCount}x COMBO!`, 'high')
        }
    }

    async announceKnockdown(victimName) {
        await this.announce(`${victimName} is DOWN!`, 'high')
    }

    async announceVictory(winnerName, loserName) {
        const narrative = await puterService.generateVictoryAnnouncement(winnerName, loserName)
        if (narrative) {
            await this.announce(narrative, 'high')
        } else {
            await this.announce(`${winnerName} WINS!`, 'high')
        }
    }

    async announceCriticalHit(attackerName) {
        await this.announce(`CRITICAL HIT by ${attackerName}!`, 'high')
    }

    async announceSpecialAbility(characterName, abilityName) {
        await this.announce(`${characterName} unleashes ${abilityName}!`)
    }

    async announceMatchStart(player1Name, player2Name) {
        const intro = await puterService.chat(
            `As the arena announcer, introduce a fight between ${player1Name} and ${player2Name}. One dramatic sentence.`
        )
        if (intro) {
            await this.announce(intro, 'high')
        } else {
            await this.announce(`${player1Name} VS ${player2Name}!`, 'high')
        }
    }

    addAnnouncementStyles() {
        if (document.getElementById('announcer-styles')) return
        
        const style = document.createElement('style')
        style.id = 'announcer-styles'
        style.textContent = `
            @keyframes announceFade {
                0% {
                    opacity: 0;
                    transform: scale(0.8) translateY(-20px);
                }
                15% {
                    opacity: 1;
                    transform: scale(1.1) translateY(0);
                }
                25% {
                    transform: scale(1) translateY(0);
                }
                75% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateY(-30px);
                }
            }
            
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');
        `
        document.head.appendChild(style)
    }
}

export const combatAnnouncer = new CombatAnnouncer()
