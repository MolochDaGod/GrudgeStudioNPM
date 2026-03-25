import { TERRAIN_TOOLS, TERRAIN_BRUSHES } from './TerrainEditor.js'

export class TerrainToolsPanel {
    constructor(container, terrainEditor) {
        this.container = container
        this.terrainEditor = terrainEditor
        this.isExpanded = true
    }
    
    init() {
        this.render()
        this.bindEvents()
    }
    
    render() {
        this.container.innerHTML = `
            <div class="terrain-panel">
                <div class="terrain-header" id="terrain-header-toggle">
                    <span class="terrain-icon">🏔️</span>
                    <span>Terrain Tools</span>
                    <span class="terrain-toggle">▼</span>
                </div>
                <div class="terrain-content" id="terrain-content">
                    <div class="terrain-section">
                        <label class="section-label">Sculpt Tools</label>
                        <div class="terrain-tools-grid">
                            <button class="terrain-tool-btn active" data-tool="raise" title="Raise Terrain">
                                <span class="tool-icon">⬆️</span>
                                <span class="tool-name">Raise</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="lower" title="Lower Terrain">
                                <span class="tool-icon">⬇️</span>
                                <span class="tool-name">Lower</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="smooth" title="Smooth Terrain">
                                <span class="tool-icon">〰️</span>
                                <span class="tool-name">Smooth</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="flatten" title="Flatten Terrain">
                                <span class="tool-icon">➖</span>
                                <span class="tool-name">Flatten</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="noise" title="Add Noise">
                                <span class="tool-icon">🌊</span>
                                <span class="tool-name">Noise</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="paint" title="Paint Terrain">
                                <span class="tool-icon">🎨</span>
                                <span class="tool-name">Paint</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="water" title="Water Level">
                                <span class="tool-icon">💧</span>
                                <span class="tool-name">Water</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="terrain-section">
                        <label class="section-label">Brush Settings</label>
                        <div class="brush-setting">
                            <span>Size</span>
                            <input type="range" id="brush-size" min="1" max="30" value="5" />
                            <span id="brush-size-val">5</span>
                        </div>
                        <div class="brush-setting">
                            <span>Strength</span>
                            <input type="range" id="brush-strength" min="1" max="100" value="50" />
                            <span id="brush-strength-val">50%</span>
                        </div>
                        <div class="brush-setting" id="flatten-height-row" style="display: none;">
                            <span>Height</span>
                            <input type="range" id="flatten-height" min="-20" max="20" value="0" />
                            <span id="flatten-height-val">0</span>
                        </div>
                    </div>
                    
                    <div class="terrain-section" id="paint-layers-section" style="display: none;">
                        <label class="section-label">Paint Layers</label>
                        <div class="paint-layers">
                            <button class="paint-layer-btn active" data-layer="0" style="background: #4a7c59;">Grass</button>
                            <button class="paint-layer-btn" data-layer="1" style="background: #8B4513;">Dirt</button>
                            <button class="paint-layer-btn" data-layer="2" style="background: #696969;">Rock</button>
                            <button class="paint-layer-btn" data-layer="3" style="background: #C2B280;">Sand</button>
                            <button class="paint-layer-btn" data-layer="4" style="background: #FFFAFA; color: #333;">Snow</button>
                        </div>
                    </div>
                    
                    <div class="terrain-section" id="water-settings-section" style="display: none;">
                        <label class="section-label">Water Settings</label>
                        <div class="brush-setting">
                            <span>Level</span>
                            <input type="range" id="water-level" min="-10" max="10" value="0" step="0.5" />
                            <span id="water-level-val">0</span>
                        </div>
                        <div class="brush-setting">
                            <span>Opacity</span>
                            <input type="range" id="water-opacity" min="10" max="100" value="60" />
                            <span id="water-opacity-val">60%</span>
                        </div>
                        <div class="water-toggle-row">
                            <label class="water-toggle-label">
                                <input type="checkbox" id="water-visible" checked />
                                <span>Show Water</span>
                            </label>
                        </div>
                        <div class="water-colors">
                            <button class="water-color-btn active" data-color="0x1a8cff" style="background: #1a8cff;" title="Ocean Blue">🌊</button>
                            <button class="water-color-btn" data-color="0x00ced1" style="background: #00ced1;" title="Turquoise">💎</button>
                            <button class="water-color-btn" data-color="0x2e8b57" style="background: #2e8b57;" title="Swamp Green">🌿</button>
                            <button class="water-color-btn" data-color="0x4169e1" style="background: #4169e1;" title="Royal Blue">🔵</button>
                            <button class="water-color-btn" data-color="0x8b4513" style="background: #8b4513;" title="Muddy">🟤</button>
                        </div>
                    </div>
                    
                    <div class="terrain-section">
                        <label class="section-label">Generate</label>
                        <div class="terrain-actions">
                            <button class="terrain-action-btn" id="generate-noise">
                                <span>🏔️</span> Generate Hills
                            </button>
                            <button class="terrain-action-btn" id="flatten-all">
                                <span>📐</span> Flatten All
                            </button>
                        </div>
                        <div class="brush-setting" style="margin-top: 8px;">
                            <span>Biome</span>
                            <select id="biome-select" class="terrain-select">
                                <option value="grass">🌿 Grass</option>
                                <option value="jungle">🌴 Jungle</option>
                                <option value="desert">🏜️ Desert</option>
                                <option value="snow">❄️ Snow</option>
                                <option value="stone">🪨 Stone</option>
                                <option value="volcanic">🌋 Volcanic</option>
                                <option value="dirt">🟤 Dirt</option>
                                <option value="water">🌊 Water</option>
                            </select>
                        </div>
                        <div class="terrain-actions" style="margin-top: 6px;">
                            <button class="terrain-action-btn" id="generate-biome" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff;">
                                <span>🤖</span> AI Generate Biome
                            </button>
                        </div>
                    </div>
                    
                    <div class="terrain-section">
                        <label class="section-label">History</label>
                        <div class="terrain-actions">
                            <button class="terrain-action-btn" id="terrain-undo">
                                <span>↶</span> Undo
                            </button>
                            <button class="terrain-action-btn" id="terrain-redo">
                                <span>↷</span> Redo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .terrain-panel {
                    background: rgba(20, 26, 43, 0.98);
                    border: 1px solid #2a3150;
                    border-radius: 10px;
                    overflow: hidden;
                    font-family: 'Jost', sans-serif;
                }
                .terrain-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: rgba(14, 18, 32, 0.6);
                    border-bottom: 1px solid #2a3150;
                    cursor: pointer;
                    font-weight: 600;
                    color: #6ee7b7;
                    font-size: 13px;
                }
                .terrain-header:hover {
                    background: rgba(110, 231, 183, 0.1);
                }
                .terrain-icon {
                    font-size: 16px;
                }
                .terrain-toggle {
                    margin-left: auto;
                    font-size: 10px;
                    transition: transform 0.2s;
                }
                .terrain-panel.collapsed .terrain-toggle {
                    transform: rotate(-90deg);
                }
                .terrain-panel.collapsed .terrain-content {
                    display: none;
                }
                .terrain-content {
                    padding: 10px;
                }
                .terrain-section {
                    margin-bottom: 14px;
                }
                .terrain-section:last-child {
                    margin-bottom: 0;
                }
                .section-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: #a5b4d0;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .terrain-tools-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                }
                .terrain-tool-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    padding: 8px 4px;
                    background: rgba(42, 49, 80, 0.5);
                    border: 2px solid transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #a5b4d0;
                }
                .terrain-tool-btn:hover {
                    border-color: #6ee7b7;
                    color: #e8eaf6;
                }
                .terrain-tool-btn.active {
                    border-color: #6ee7b7;
                    background: rgba(110, 231, 183, 0.2);
                    color: #6ee7b7;
                }
                .tool-icon {
                    font-size: 18px;
                }
                .tool-name {
                    font-size: 10px;
                }
                .brush-setting {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 12px;
                    color: #a5b4d0;
                }
                .brush-setting span:first-child {
                    width: 60px;
                }
                .brush-setting input[type="range"] {
                    flex: 1;
                    height: 4px;
                    -webkit-appearance: none;
                    background: rgba(42, 49, 80, 0.8);
                    border-radius: 2px;
                }
                .brush-setting input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 14px;
                    height: 14px;
                    background: #6ee7b7;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .brush-setting span:last-child {
                    width: 40px;
                    text-align: right;
                    color: #6ee7b7;
                    font-weight: 600;
                }
                .paint-layers {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .paint-layer-btn {
                    padding: 6px 10px;
                    border: 2px solid transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                    color: #fff;
                    transition: all 0.15s;
                }
                .paint-layer-btn:hover {
                    transform: scale(1.05);
                }
                .paint-layer-btn.active {
                    border-color: #fff;
                    box-shadow: 0 0 8px rgba(255,255,255,0.3);
                }
                .terrain-actions {
                    display: flex;
                    gap: 8px;
                }
                .terrain-action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px;
                    background: rgba(42, 49, 80, 0.6);
                    border: 1px solid #2a3150;
                    border-radius: 6px;
                    color: #e8eaf6;
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.15s;
                }
                .terrain-action-btn:hover {
                    border-color: #6ee7b7;
                    background: rgba(110, 231, 183, 0.15);
                }
                .terrain-select {
                    flex: 1;
                    padding: 6px 8px;
                    background: rgba(14, 18, 32, 0.8);
                    border: 1px solid #2a3150;
                    border-radius: 6px;
                    color: #e8eaf6;
                    font-size: 12px;
                    cursor: pointer;
                }
                .terrain-select:focus {
                    outline: none;
                    border-color: #6ee7b7;
                }
                .water-toggle-row {
                    margin: 10px 0;
                }
                .water-toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #a5b4d0;
                    font-size: 12px;
                    cursor: pointer;
                }
                .water-toggle-label input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    accent-color: #6ee7b7;
                }
                .water-colors {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }
                .water-color-btn {
                    width: 32px;
                    height: 32px;
                    border: 2px solid transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .water-color-btn:hover {
                    transform: scale(1.1);
                }
                .water-color-btn.active {
                    border-color: #fff;
                    box-shadow: 0 0 8px rgba(255,255,255,0.4);
                }
            </style>
        `
    }
    
    bindEvents() {
        const headerToggle = this.container.querySelector('#terrain-header-toggle')
        headerToggle?.addEventListener('click', () => {
            const panel = this.container.querySelector('.terrain-panel')
            panel?.classList.toggle('collapsed')
        })
        
        this.container.querySelectorAll('.terrain-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.terrain-tool-btn').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
                
                const tool = btn.dataset.tool
                this.terrainEditor?.setTool(tool)
                
                const flattenRow = this.container.querySelector('#flatten-height-row')
                const paintSection = this.container.querySelector('#paint-layers-section')
                const waterSection = this.container.querySelector('#water-settings-section')
                
                if (flattenRow) flattenRow.style.display = tool === 'flatten' ? 'flex' : 'none'
                if (paintSection) paintSection.style.display = tool === 'paint' ? 'block' : 'none'
                if (waterSection) waterSection.style.display = tool === 'water' ? 'block' : 'none'
            })
        })
        
        const brushSize = this.container.querySelector('#brush-size')
        const brushSizeVal = this.container.querySelector('#brush-size-val')
        brushSize?.addEventListener('input', (e) => {
            const val = parseInt(e.target.value)
            if (brushSizeVal) brushSizeVal.textContent = val
            this.terrainEditor?.setBrushSize(val)
        })
        
        const brushStrength = this.container.querySelector('#brush-strength')
        const brushStrengthVal = this.container.querySelector('#brush-strength-val')
        brushStrength?.addEventListener('input', (e) => {
            const val = parseInt(e.target.value)
            if (brushStrengthVal) brushStrengthVal.textContent = val + '%'
            this.terrainEditor?.setBrushStrength(val / 100)
        })
        
        const flattenHeight = this.container.querySelector('#flatten-height')
        const flattenHeightVal = this.container.querySelector('#flatten-height-val')
        flattenHeight?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value)
            if (flattenHeightVal) flattenHeightVal.textContent = val
            this.terrainEditor?.setFlattenHeight(val)
        })
        
        this.container.querySelectorAll('.paint-layer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.paint-layer-btn').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
                this.terrainEditor?.setPaintLayer(parseInt(btn.dataset.layer))
            })
        })
        
        this.container.querySelector('#generate-noise')?.addEventListener('click', () => {
            this.terrainEditor?.generateFromNoise(0.03, 6, 4)
        })
        
        this.container.querySelector('#flatten-all')?.addEventListener('click', () => {
            this.terrainEditor?.flattenAll(0)
        })
        
        this.container.querySelector('#generate-biome')?.addEventListener('click', () => {
            const biomeSelect = this.container.querySelector('#biome-select')
            const biomeKey = biomeSelect?.value || 'grass'
            const seed = Math.floor(Math.random() * 99999)
            this.terrainEditor?.generateFromBiome(biomeKey, seed)
            console.log(`[TerrainToolsPanel] Generated ${biomeKey} biome (seed: ${seed})`)
        })
        
        this.container.querySelector('#terrain-undo')?.addEventListener('click', () => {
            this.terrainEditor?.undo()
        })
        
        this.container.querySelector('#terrain-redo')?.addEventListener('click', () => {
            this.terrainEditor?.redo()
        })
        
        const waterLevel = this.container.querySelector('#water-level')
        const waterLevelVal = this.container.querySelector('#water-level-val')
        waterLevel?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value)
            if (waterLevelVal) waterLevelVal.textContent = val
            this.terrainEditor?.setWaterLevel(val)
        })
        
        const waterOpacity = this.container.querySelector('#water-opacity')
        const waterOpacityVal = this.container.querySelector('#water-opacity-val')
        waterOpacity?.addEventListener('input', (e) => {
            const val = parseInt(e.target.value)
            if (waterOpacityVal) waterOpacityVal.textContent = val + '%'
            this.terrainEditor?.setWaterOpacity(val / 100)
        })
        
        const waterVisible = this.container.querySelector('#water-visible')
        waterVisible?.addEventListener('change', (e) => {
            this.terrainEditor?.setWaterVisible(e.target.checked)
        })
        
        this.container.querySelectorAll('.water-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.water-color-btn').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
                const colorStr = btn.dataset.color
                const color = parseInt(colorStr, 16)
                this.terrainEditor?.setWaterColor(color)
            })
        })
    }
    
    show() {
        this.container.style.display = 'block'
    }
    
    hide() {
        this.container.style.display = 'none'
    }
}
