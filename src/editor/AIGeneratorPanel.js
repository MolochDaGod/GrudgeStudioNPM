/*
    GRUDGE Studio - AI Generator Panel
    UI for AI-assisted code and asset generation
*/

import { codeGenerator } from '../ai/CodeGenerator.js'
import { getTemplateList, createFromTemplate } from '../ai/SceneTemplates.js'

export class AIGeneratorPanel {
    constructor(containerId = 'ai-generator-panel') {
        this.containerId = containerId
        this.container = null
        this.isOpen = false
        this.currentTemplate = null
        this.generatedCode = ''
    }
    
    createPanel() {
        if (document.getElementById(this.containerId)) {
            this.container = document.getElementById(this.containerId)
            return
        }
        
        this.container = document.createElement('div')
        this.container.id = this.containerId
        this.container.innerHTML = `
            <style>
                #${this.containerId} {
                    position: fixed;
                    right: 10px;
                    top: 60px;
                    width: 450px;
                    max-height: calc(100vh - 80px);
                    background: #1e1e2e;
                    border: 1px solid #3d3d5c;
                    border-radius: 8px;
                    display: none;
                    flex-direction: column;
                    z-index: 1500;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                    font-family: 'Segoe UI', Arial, sans-serif;
                }
                #${this.containerId}.open {
                    display: flex;
                }
                .aigen-header {
                    padding: 16px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .aigen-title {
                    color: #fff;
                    font-weight: 700;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .aigen-title::before {
                    content: '✨';
                }
                .aigen-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .aigen-close:hover {
                    background: rgba(255,255,255,0.3);
                }
                .aigen-tabs {
                    display: flex;
                    background: #252538;
                    border-bottom: 1px solid #3d3d5c;
                }
                .aigen-tab {
                    flex: 1;
                    padding: 12px;
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 13px;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .aigen-tab:hover {
                    color: #e0e0e0;
                    background: #2a2a3e;
                }
                .aigen-tab.active {
                    color: #6366f1;
                    border-bottom-color: #6366f1;
                }
                .aigen-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }
                .aigen-section {
                    margin-bottom: 16px;
                }
                .aigen-section-title {
                    color: #888;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                .template-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                .template-card {
                    padding: 12px;
                    background: #252538;
                    border: 1px solid #3d3d5c;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .template-card:hover {
                    border-color: #6366f1;
                    background: #2a2a42;
                }
                .template-card.selected {
                    border-color: #6366f1;
                    background: #2a2a52;
                }
                .template-name {
                    color: #e0e0e0;
                    font-weight: 600;
                    font-size: 13px;
                    margin-bottom: 4px;
                }
                .template-desc {
                    color: #888;
                    font-size: 11px;
                    line-height: 1.4;
                }
                .aigen-form {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .form-label {
                    color: #888;
                    font-size: 12px;
                }
                .form-input {
                    padding: 8px 12px;
                    background: #1a1a28;
                    border: 1px solid #3d3d5c;
                    border-radius: 4px;
                    color: #e0e0e0;
                    font-size: 13px;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #6366f1;
                }
                .form-row {
                    display: flex;
                    gap: 12px;
                }
                .form-row .form-group {
                    flex: 1;
                }
                .form-select {
                    padding: 8px 12px;
                    background: #1a1a28;
                    border: 1px solid #3d3d5c;
                    border-radius: 4px;
                    color: #e0e0e0;
                    font-size: 13px;
                }
                .aigen-generate-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: all 0.2s;
                }
                .aigen-generate-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
                }
                .aigen-generate-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                .code-preview {
                    background: #0d0d15;
                    border: 1px solid #3d3d5c;
                    border-radius: 6px;
                    padding: 12px;
                    font-family: 'Consolas', monospace;
                    font-size: 11px;
                    color: #e0e0e0;
                    max-height: 200px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
                .code-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                .code-action-btn {
                    flex: 1;
                    padding: 8px;
                    background: #3d3d5c;
                    border: none;
                    border-radius: 4px;
                    color: #e0e0e0;
                    font-size: 12px;
                    cursor: pointer;
                }
                .code-action-btn:hover {
                    background: #4d4d7a;
                }
                .code-action-btn.primary {
                    background: #6366f1;
                }
                .scene-template-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                .scene-template-card {
                    padding: 16px;
                    background: #252538;
                    border: 1px solid #3d3d5c;
                    border-radius: 8px;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.2s;
                }
                .scene-template-card:hover {
                    border-color: #6366f1;
                    transform: translateY(-2px);
                }
                .scene-template-icon {
                    font-size: 24px;
                    margin-bottom: 8px;
                }
                .scene-template-name {
                    color: #e0e0e0;
                    font-weight: 600;
                    font-size: 12px;
                }
                .tab-content {
                    display: none;
                }
                .tab-content.active {
                    display: block;
                }
            </style>
            
            <div class="aigen-header">
                <span class="aigen-title">AI Generator</span>
                <button class="aigen-close">&times;</button>
            </div>
            
            <div class="aigen-tabs">
                <button class="aigen-tab active" data-tab="scripts">Scripts</button>
                <button class="aigen-tab" data-tab="scenes">Scenes</button>
                <button class="aigen-tab" data-tab="ui">UI</button>
            </div>
            
            <div class="aigen-content">
                <!-- Scripts Tab -->
                <div class="tab-content active" id="tab-scripts">
                    <div class="aigen-section">
                        <div class="aigen-section-title">Select Template</div>
                        <div class="template-grid" id="script-templates"></div>
                    </div>
                    
                    <div class="aigen-section">
                        <div class="aigen-section-title">Configuration</div>
                        <div class="aigen-form" id="script-form"></div>
                    </div>
                    
                    <button class="aigen-generate-btn" id="generate-script-btn" disabled>
                        Generate Script
                    </button>
                    
                    <div class="aigen-section" id="code-output" style="display: none; margin-top: 16px;">
                        <div class="aigen-section-title">Generated Code</div>
                        <div class="code-preview" id="code-preview"></div>
                        <div class="code-actions">
                            <button class="code-action-btn" id="copy-code-btn">Copy</button>
                            <button class="code-action-btn primary" id="save-code-btn">Save to File</button>
                        </div>
                    </div>
                </div>
                
                <!-- Scenes Tab -->
                <div class="tab-content" id="tab-scenes">
                    <div class="aigen-section">
                        <div class="aigen-section-title">Scene Templates</div>
                        <div class="scene-template-grid" id="scene-templates"></div>
                    </div>
                    
                    <div class="aigen-section" style="margin-top: 16px;">
                        <div class="form-group">
                            <label class="form-label">Scene Name</label>
                            <input type="text" class="form-input" id="scene-name-input" placeholder="MyNewScene">
                        </div>
                        <button class="aigen-generate-btn" id="create-scene-btn" style="margin-top: 12px;">
                            Create Scene
                        </button>
                    </div>
                </div>
                
                <!-- UI Tab -->
                <div class="tab-content" id="tab-ui">
                    <div class="aigen-section">
                        <div class="aigen-section-title">UI Component Generator</div>
                        <div class="aigen-form">
                            <div class="form-group">
                                <label class="form-label">Component Name</label>
                                <input type="text" class="form-input" id="ui-name-input" placeholder="HealthBar">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Width</label>
                                    <input type="number" class="form-input" id="ui-width-input" value="200">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Height</label>
                                    <input type="number" class="form-input" id="ui-height-input" value="50">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Background</label>
                                    <input type="color" class="form-input" id="ui-bg-input" value="#1e1e2e" style="padding: 2px; height: 36px;">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Border Color</label>
                                    <input type="color" class="form-input" id="ui-border-input" value="#3d3d5c" style="padding: 2px; height: 36px;">
                                </div>
                            </div>
                            <button class="aigen-generate-btn" id="generate-ui-btn">
                                Generate UI Component
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
        
        document.body.appendChild(this.container)
        this.bindEvents()
        this.populateTemplates()
    }
    
    bindEvents() {
        const closeBtn = this.container.querySelector('.aigen-close')
        closeBtn.addEventListener('click', () => this.close())
        
        const tabs = this.container.querySelectorAll('.aigen-tab')
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'))
                tab.classList.add('active')
                
                const tabContents = this.container.querySelectorAll('.tab-content')
                tabContents.forEach(c => c.classList.remove('active'))
                
                const tabId = `tab-${tab.dataset.tab}`
                this.container.querySelector(`#${tabId}`).classList.add('active')
            })
        })
        
        const generateScriptBtn = this.container.querySelector('#generate-script-btn')
        generateScriptBtn.addEventListener('click', () => this.generateScript())
        
        const copyBtn = this.container.querySelector('#copy-code-btn')
        copyBtn.addEventListener('click', () => this.copyCode())
        
        const saveBtn = this.container.querySelector('#save-code-btn')
        saveBtn.addEventListener('click', () => this.saveCode())
        
        const createSceneBtn = this.container.querySelector('#create-scene-btn')
        createSceneBtn.addEventListener('click', () => this.createScene())
        
        const generateUiBtn = this.container.querySelector('#generate-ui-btn')
        generateUiBtn.addEventListener('click', () => this.generateUI())
    }
    
    populateTemplates() {
        const scriptTemplates = codeGenerator.getTemplateList().filter(t => 
            ['luaWeapon', 'luaAbility', 'luaCharacter'].includes(t.id)
        )
        
        const templateGrid = this.container.querySelector('#script-templates')
        templateGrid.innerHTML = scriptTemplates.map(t => `
            <div class="template-card" data-template="${t.id}">
                <div class="template-name">${t.name}</div>
                <div class="template-desc">${t.description}</div>
            </div>
        `).join('')
        
        templateGrid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                templateGrid.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'))
                card.classList.add('selected')
                this.selectTemplate(card.dataset.template)
            })
        })
        
        const sceneTemplates = getTemplateList()
        const sceneIcons = {
            arenaFighter: '⚔️',
            openWorld: '🌍',
            dungeon: '🏰',
            platformer: '🎮',
            rtsMap: '🗺️',
            racingTrack: '🏎️',
            empty: '📦'
        }
        
        const sceneGrid = this.container.querySelector('#scene-templates')
        sceneGrid.innerHTML = sceneTemplates.map(t => `
            <div class="scene-template-card" data-template="${t.id}">
                <div class="scene-template-icon">${sceneIcons[t.id] || '📦'}</div>
                <div class="scene-template-name">${t.name}</div>
            </div>
        `).join('')
        
        sceneGrid.querySelectorAll('.scene-template-card').forEach(card => {
            card.addEventListener('click', () => {
                sceneGrid.querySelectorAll('.scene-template-card').forEach(c => 
                    c.style.borderColor = '#3d3d5c'
                )
                card.style.borderColor = '#6366f1'
                this.selectedSceneTemplate = card.dataset.template
            })
        })
    }
    
    selectTemplate(templateId) {
        this.currentTemplate = templateId
        
        const formContainer = this.container.querySelector('#script-form')
        const generateBtn = this.container.querySelector('#generate-script-btn')
        
        let formHtml = ''
        
        switch (templateId) {
            case 'luaWeapon':
                formHtml = `
                    <div class="form-group">
                        <label class="form-label">Weapon Name</label>
                        <input type="text" class="form-input" id="param-name" placeholder="Longsword">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Weapon Type</label>
                            <select class="form-select" id="param-weaponType">
                                <option value="melee">Melee</option>
                                <option value="ranged">Ranged</option>
                                <option value="magic">Magic</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Damage Type</label>
                            <select class="form-select" id="param-damageType">
                                <option value="physical">Physical</option>
                                <option value="fire">Fire</option>
                                <option value="ice">Ice</option>
                                <option value="lightning">Lightning</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Base Damage</label>
                            <input type="number" class="form-input" id="param-damage" value="25">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Range</label>
                            <input type="number" class="form-input" id="param-range" value="2.5" step="0.5">
                        </div>
                    </div>
                `
                break
                
            case 'luaAbility':
                formHtml = `
                    <div class="form-group">
                        <label class="form-label">Ability Name</label>
                        <input type="text" class="form-input" id="param-name" placeholder="Fireball">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Ability Type</label>
                            <select class="form-select" id="param-abilityType">
                                <option value="spell">Spell</option>
                                <option value="projectile">Projectile</option>
                                <option value="aoe">AoE</option>
                                <option value="buff">Buff</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Damage Type</label>
                            <select class="form-select" id="param-damageType">
                                <option value="magic">Magic</option>
                                <option value="fire">Fire</option>
                                <option value="ice">Ice</option>
                                <option value="holy">Holy</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Mana Cost</label>
                            <input type="number" class="form-input" id="param-manaCost" value="20">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Cooldown (s)</label>
                            <input type="number" class="form-input" id="param-cooldown" value="3" step="0.5">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Damage</label>
                            <input type="number" class="form-input" id="param-damage" value="50">
                        </div>
                        <div class="form-group">
                            <label class="form-label">AoE Radius</label>
                            <input type="number" class="form-input" id="param-aoeRadius" value="0" step="0.5">
                        </div>
                    </div>
                `
                break
                
            case 'luaCharacter':
                formHtml = `
                    <div class="form-group">
                        <label class="form-label">Character Name</label>
                        <input type="text" class="form-input" id="param-name" placeholder="Hero">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Class</label>
                        <select class="form-select" id="param-characterClass">
                            <option value="warrior">Warrior</option>
                            <option value="mage">Mage</option>
                            <option value="rogue">Rogue</option>
                            <option value="ranger">Ranger</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Health</label>
                            <input type="number" class="form-input" id="param-health" value="100">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mana</label>
                            <input type="number" class="form-input" id="param-mana" value="50">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Strength</label>
                            <input type="number" class="form-input" id="param-strength" value="10">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Intelligence</label>
                            <input type="number" class="form-input" id="param-intelligence" value="10">
                        </div>
                    </div>
                `
                break
        }
        
        formContainer.innerHTML = formHtml
        generateBtn.disabled = false
    }
    
    getFormParams() {
        const params = {}
        const inputs = this.container.querySelectorAll('#script-form [id^="param-"]')
        
        inputs.forEach(input => {
            const key = input.id.replace('param-', '')
            let value = input.value
            
            if (input.type === 'number') {
                value = parseFloat(value)
            }
            
            params[key] = value
        })
        
        if (params.name) {
            params.className = params.name.replace(/\s+/g, '')
        }
        
        return params
    }
    
    generateScript() {
        if (!this.currentTemplate) return
        
        const params = this.getFormParams()
        
        try {
            const result = codeGenerator.generate(this.currentTemplate, params)
            this.generatedCode = result.code
            
            const codeOutput = this.container.querySelector('#code-output')
            const codePreview = this.container.querySelector('#code-preview')
            
            codePreview.textContent = result.code
            codeOutput.style.display = 'block'
            
            console.log(`Generated ${this.currentTemplate} script:`, params.name)
        } catch (error) {
            console.error('Failed to generate script:', error)
            alert('Failed to generate script: ' + error.message)
        }
    }
    
    copyCode() {
        if (!this.generatedCode) return
        
        navigator.clipboard.writeText(this.generatedCode).then(() => {
            const btn = this.container.querySelector('#copy-code-btn')
            btn.textContent = 'Copied!'
            setTimeout(() => btn.textContent = 'Copy', 2000)
        })
    }
    
    saveCode() {
        if (!this.generatedCode) return
        
        const params = this.getFormParams()
        const extension = this.currentTemplate.startsWith('lua') ? 'lua' : 'js'
        const filename = `${params.name || 'script'}.${extension}`
        
        const blob = new Blob([this.generatedCode], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
    }
    
    createScene() {
        if (!this.selectedSceneTemplate) {
            alert('Please select a scene template')
            return
        }
        
        const sceneName = this.container.querySelector('#scene-name-input').value || 'NewScene'
        
        try {
            const config = createFromTemplate(this.selectedSceneTemplate, sceneName)
            const result = codeGenerator.generate('sceneConfig', config)
            
            this.generatedCode = result.code
            
            console.log(`Created scene from template ${this.selectedSceneTemplate}:`, sceneName)
            
            const blob = new Blob([result.code], { type: 'text/javascript' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${sceneName}Config.js`
            link.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to create scene:', error)
            alert('Failed to create scene: ' + error.message)
        }
    }
    
    generateUI() {
        const name = this.container.querySelector('#ui-name-input').value || 'CustomComponent'
        const width = parseInt(this.container.querySelector('#ui-width-input').value) || 200
        const height = parseInt(this.container.querySelector('#ui-height-input').value) || 50
        const backgroundColor = this.container.querySelector('#ui-bg-input').value
        const borderColor = this.container.querySelector('#ui-border-input').value
        
        try {
            const result = codeGenerator.generate('uiComponent', {
                name,
                className: name.replace(/\s+/g, ''),
                width,
                height,
                backgroundColor,
                borderColor
            })
            
            this.generatedCode = result.code
            
            console.log(`Generated UI component:`, name)
            
            const blob = new Blob([result.code], { type: 'text/javascript' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${name}.js`
            link.click()
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to generate UI:', error)
            alert('Failed to generate UI component: ' + error.message)
        }
    }
    
    open() {
        this.createPanel()
        this.container.classList.add('open')
        this.isOpen = true
    }
    
    close() {
        if (this.container) {
            this.container.classList.remove('open')
        }
        this.isOpen = false
    }
    
    toggle() {
        if (this.isOpen) {
            this.close()
        } else {
            this.open()
        }
    }
    
    dispose() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
    }
}

export const aiGeneratorPanel = new AIGeneratorPanel()
export default AIGeneratorPanel
