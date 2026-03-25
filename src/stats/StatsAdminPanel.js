import { 
    DIMINISHING_RETURNS_THRESHOLD, 
    HARD_CAP_THRESHOLD, 
    DECAY_RATE, 
    POST_CAP_EFFECTIVENESS,
    POWER_RANKINGS,
    getEffectiveStatValue,
    getStatBreakdown
} from './StatsUtils.js'

const STORAGE_KEY = 'grudge_stats_config'

const DEFAULT_CONFIG = {
    diminishingThreshold: 25,
    hardCapThreshold: 35,
    decayRate: 0.90,
    postCapEffectiveness: 0.0001,
    statWeights: {
        strength: 1.2,
        dexterity: 1.1,
        constitution: 1.3,
        intelligence: 1.0,
        wisdom: 0.9,
        charisma: 0.6,
        luck: 0.7,
        willpower: 0.8
    },
    powerRankings: [
        { name: 'Fodder', minScore: 0, maxScore: 49, color: '#888888' },
        { name: 'Rookie', minScore: 50, maxScore: 74, color: '#AAAAAA' },
        { name: 'Novice', minScore: 75, maxScore: 99, color: '#FFFFFF' },
        { name: 'Apprentice', minScore: 100, maxScore: 124, color: '#00FF00' },
        { name: 'Journeyman', minScore: 125, maxScore: 149, color: '#00FFAA' },
        { name: 'Adept', minScore: 150, maxScore: 174, color: '#00AAFF' },
        { name: 'Expert', minScore: 175, maxScore: 199, color: '#0066FF' },
        { name: 'Master', minScore: 200, maxScore: 249, color: '#AA00FF' },
        { name: 'Grandmaster', minScore: 250, maxScore: 299, color: '#FF00FF' },
        { name: 'Champion', minScore: 300, maxScore: 349, color: '#FF6600' },
        { name: 'Legend', minScore: 350, maxScore: 399, color: '#FFD700' },
        { name: 'Mythic', minScore: 400, maxScore: 499, color: '#FF0000' },
        { name: 'Divine', minScore: 500, maxScore: 9999, color: '#FFFFFF' }
    ]
}

export class StatsAdminPanel {
    constructor() {
        this.container = null
        this.config = this.loadConfig()
        this.isVisible = false
        this.onConfigChange = null
    }
    
    loadConfig() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
            }
        } catch (e) {
            console.warn('Failed to load stats config:', e)
        }
        return { ...DEFAULT_CONFIG }
    }
    
    saveConfig() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
            if (this.onConfigChange) {
                this.onConfigChange(this.config)
            }
        } catch (e) {
            console.warn('Failed to save stats config:', e)
        }
    }
    
    getConfig() {
        return this.config
    }
    
    create() {
        this.container = document.createElement('div')
        this.container.id = 'stats-admin-panel'
        this.container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 700px;
            max-height: 80vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #4a4a6a;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            z-index: 10000;
            display: none;
            flex-direction: column;
            font-family: 'Segoe UI', system-ui, sans-serif;
            color: #e0e0e0;
            overflow: hidden;
        `
        
        this.container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(0,0,0,0.3); border-bottom: 1px solid #4a4a6a;">
                <h2 style="margin: 0; font-size: 18px; color: #fff;">Stats Administration</h2>
                <button id="stats-admin-close" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            </div>
            
            <div style="padding: 20px; overflow-y: auto; max-height: calc(80vh - 120px);">
                <div style="display: grid; gap: 20px;">
                    
                    <section style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #8ab4f8;">Diminishing Returns Settings</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Threshold Start</label>
                                <input type="number" id="cfg-threshold" value="${this.config.diminishingThreshold}" min="1" max="100" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Hard Cap Point</label>
                                <input type="number" id="cfg-hardcap" value="${this.config.hardCapThreshold}" min="1" max="100" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Decay Rate (0-1)</label>
                                <input type="number" id="cfg-decay" value="${this.config.decayRate}" min="0.01" max="0.99" step="0.01" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Post-Cap Effectiveness</label>
                                <input type="number" id="cfg-postcap" value="${this.config.postCapEffectiveness}" min="0" max="0.1" step="0.0001" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                        </div>
                    </section>
                    
                    <section style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #8ab4f8;">Stat Weights (Power Score Calculation)</h3>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                            ${Object.entries(this.config.statWeights).map(([stat, weight]) => `
                                <div>
                                    <label style="display: block; font-size: 11px; color: #888; margin-bottom: 4px; text-transform: capitalize;">${stat}</label>
                                    <input type="number" id="weight-${stat}" value="${weight}" min="0" max="5" step="0.1" style="width: 100%; padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
                                </div>
                            `).join('')}
                        </div>
                    </section>
                    
                    <section style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #8ab4f8;">Power Rankings</h3>
                        <div id="rankings-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
                            ${this.config.powerRankings.map((rank, i) => `
                                <div class="rank-row" data-index="${i}" style="display: grid; grid-template-columns: 120px 80px 80px 80px 30px; gap: 8px; align-items: center;">
                                    <input type="text" value="${rank.name}" data-field="name" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
                                    <input type="number" value="${rank.minScore}" data-field="minScore" placeholder="Min" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
                                    <input type="number" value="${rank.maxScore}" data-field="maxScore" placeholder="Max" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
                                    <input type="color" value="${rank.color}" data-field="color" style="padding: 2px; height: 30px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px;">
                                    <button class="remove-rank" style="background: #ff4444; border: none; color: white; border-radius: 4px; cursor: pointer; padding: 4px 8px;">&times;</button>
                                </div>
                            `).join('')}
                        </div>
                        <button id="add-ranking" style="margin-top: 10px; padding: 8px 16px; background: #4a6fa5; border: none; border-radius: 4px; color: white; cursor: pointer;">+ Add Ranking</button>
                    </section>
                    
                    <section style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #8ab4f8;">Preview Calculator</h3>
                        <div style="display: flex; gap: 12px; align-items: end;">
                            <div style="flex: 1;">
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Raw Stat Value</label>
                                <input type="number" id="preview-stat" value="25" min="1" max="100" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                            <button id="calc-preview" style="padding: 8px 20px; background: #4a6fa5; border: none; border-radius: 4px; color: white; cursor: pointer;">Calculate</button>
                        </div>
                        <div id="preview-result" style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 4px; font-family: monospace; font-size: 12px;">
                            Enter a stat value and click Calculate
                        </div>
                    </section>
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; background: rgba(0,0,0,0.3); border-top: 1px solid #4a4a6a;">
                <button id="stats-admin-reset" style="padding: 10px 20px; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer;">Reset to Defaults</button>
                <button id="stats-admin-save" style="padding: 10px 20px; background: #4CAF50; border: none; border-radius: 4px; color: white; cursor: pointer;">Save Changes</button>
            </div>
        `
        
        document.body.appendChild(this.container)
        this.bindEvents()
        
        return this.container
    }
    
    bindEvents() {
        this.container.querySelector('#stats-admin-close').addEventListener('click', () => this.hide())
        this.container.querySelector('#stats-admin-save').addEventListener('click', () => this.save())
        this.container.querySelector('#stats-admin-reset').addEventListener('click', () => this.reset())
        this.container.querySelector('#add-ranking').addEventListener('click', () => this.addRanking())
        this.container.querySelector('#calc-preview').addEventListener('click', () => this.calculatePreview())
        
        this.container.querySelectorAll('.remove-rank').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('.rank-row')
                if (row) row.remove()
            })
        })
    }
    
    show() {
        if (!this.container) this.create()
        this.container.style.display = 'flex'
        this.isVisible = true
    }
    
    hide() {
        if (this.container) {
            this.container.style.display = 'none'
        }
        this.isVisible = false
    }
    
    toggle() {
        if (this.isVisible) {
            this.hide()
        } else {
            this.show()
        }
    }
    
    save() {
        this.config.diminishingThreshold = parseInt(this.container.querySelector('#cfg-threshold').value)
        this.config.hardCapThreshold = parseInt(this.container.querySelector('#cfg-hardcap').value)
        this.config.decayRate = parseFloat(this.container.querySelector('#cfg-decay').value)
        this.config.postCapEffectiveness = parseFloat(this.container.querySelector('#cfg-postcap').value)
        
        Object.keys(this.config.statWeights).forEach(stat => {
            const input = this.container.querySelector(`#weight-${stat}`)
            if (input) {
                this.config.statWeights[stat] = parseFloat(input.value)
            }
        })
        
        const rankRows = this.container.querySelectorAll('.rank-row')
        this.config.powerRankings = Array.from(rankRows).map(row => ({
            name: row.querySelector('[data-field="name"]').value,
            minScore: parseInt(row.querySelector('[data-field="minScore"]').value),
            maxScore: parseInt(row.querySelector('[data-field="maxScore"]').value),
            color: row.querySelector('[data-field="color"]').value
        }))
        
        this.saveConfig()
        this.hide()
        
        alert('Stats configuration saved!')
    }
    
    reset() {
        if (confirm('Reset all stats settings to defaults?')) {
            this.config = { ...DEFAULT_CONFIG }
            this.saveConfig()
            this.hide()
            this.show()
        }
    }
    
    addRanking() {
        const list = this.container.querySelector('#rankings-list')
        const index = list.children.length
        
        const row = document.createElement('div')
        row.className = 'rank-row'
        row.dataset.index = index
        row.style.cssText = 'display: grid; grid-template-columns: 120px 80px 80px 80px 30px; gap: 8px; align-items: center;'
        row.innerHTML = `
            <input type="text" value="New Rank" data-field="name" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
            <input type="number" value="0" data-field="minScore" placeholder="Min" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
            <input type="number" value="100" data-field="maxScore" placeholder="Max" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
            <input type="color" value="#FFFFFF" data-field="color" style="padding: 2px; height: 30px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px;">
            <button class="remove-rank" style="background: #ff4444; border: none; color: white; border-radius: 4px; cursor: pointer; padding: 4px 8px;">&times;</button>
        `
        
        row.querySelector('.remove-rank').addEventListener('click', () => row.remove())
        list.appendChild(row)
    }
    
    calculatePreview() {
        const rawValue = parseInt(this.container.querySelector('#preview-stat').value)
        const breakdown = getStatBreakdown(rawValue)
        
        const resultDiv = this.container.querySelector('#preview-result')
        resultDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div><strong>Raw Value:</strong> ${breakdown.raw}</div>
                <div><strong>Effective Value:</strong> ${breakdown.effective}</div>
                <div><strong>Category:</strong> <span style="color: ${breakdown.category === 'Normal' ? '#4CAF50' : breakdown.category === 'Diminishing' ? '#FFC107' : '#FF5722'}">${breakdown.category}</span></div>
                <div><strong>Next Point Eff:</strong> ${breakdown.nextPointEffectiveness}%</div>
                ${breakdown.wastedPoints > 0 ? `<div style="grid-column: span 2; color: #FF5722;"><strong>Wasted Points:</strong> ${breakdown.wastedPoints}</div>` : ''}
            </div>
        `
    }
    
    dispose() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
        this.container = null
    }
}

export const statsAdminPanel = new StatsAdminPanel()
