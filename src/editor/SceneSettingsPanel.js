export class SceneSettingsPanel {
    constructor(container, scene, options = {}) {
        this.container = container
        this.scene = scene
        this.options = options
        this.settings = {
            ambientIntensity: 1.2,
            ambientColor: '#ffffff',
            sunIntensity: 2.0,
            sunColor: '#ffffff',
            sunAngle: 45,
            skyColor: '#87CEEB',
            fogEnabled: true,
            fogNear: 80,
            fogFar: 300,
            gridVisible: true,
            gridSize: 100,
            terrainSize: 100
        }
        this.isExpanded = true
        this.onUpdate = options.onUpdate || (() => {})
    }

    init() {
        this.render()
        this.bindEvents()
    }

    render() {
        this.container.innerHTML = `
            <div class="scene-settings-panel">
                <div class="settings-header" id="settings-header-toggle">
                    <span class="settings-icon">⚙️</span>
                    <span>Scene Settings</span>
                    <span class="settings-toggle">▼</span>
                </div>
                <div class="settings-content" id="settings-content">
                    <div class="settings-section">
                        <label class="section-label">Lighting</label>
                        <div class="setting-row">
                            <span>Ambient</span>
                            <input type="range" id="ambient-intensity" min="0" max="3" step="0.1" value="${this.settings.ambientIntensity}" />
                            <span id="ambient-val">${this.settings.ambientIntensity.toFixed(1)}</span>
                        </div>
                        <div class="setting-row">
                            <span>Sun</span>
                            <input type="range" id="sun-intensity" min="0" max="5" step="0.1" value="${this.settings.sunIntensity}" />
                            <span id="sun-val">${this.settings.sunIntensity.toFixed(1)}</span>
                        </div>
                        <div class="setting-row">
                            <span>Sun Angle</span>
                            <input type="range" id="sun-angle" min="0" max="90" step="1" value="${this.settings.sunAngle}" />
                            <span id="sun-angle-val">${this.settings.sunAngle}°</span>
                        </div>
                        <div class="setting-row color-row">
                            <span>Sun Color</span>
                            <input type="color" id="sun-color" value="${this.settings.sunColor}" />
                        </div>
                    </div>

                    <div class="settings-section">
                        <label class="section-label">Sky & Fog</label>
                        <div class="setting-row color-row">
                            <span>Sky Color</span>
                            <input type="color" id="sky-color" value="${this.settings.skyColor}" />
                        </div>
                        <div class="setting-row checkbox-row">
                            <label><input type="checkbox" id="fog-enabled" ${this.settings.fogEnabled ? 'checked' : ''} /> Enable Fog</label>
                        </div>
                        <div class="setting-row" id="fog-settings" style="${this.settings.fogEnabled ? '' : 'opacity: 0.5; pointer-events: none;'}">
                            <span>Distance</span>
                            <input type="range" id="fog-far" min="100" max="1000" step="10" value="${this.settings.fogFar}" />
                            <span id="fog-val">${this.settings.fogFar}</span>
                        </div>
                    </div>

                    <div class="settings-section">
                        <label class="section-label">Grid & Terrain</label>
                        <div class="setting-row checkbox-row">
                            <label><input type="checkbox" id="grid-visible" ${this.settings.gridVisible ? 'checked' : ''} /> Show Grid</label>
                        </div>
                        <div class="setting-row">
                            <span>Grid Size</span>
                            <input type="range" id="grid-size" min="20" max="200" step="10" value="${this.settings.gridSize}" />
                            <span id="grid-size-val">${this.settings.gridSize}</span>
                        </div>
                        <div class="setting-row">
                            <span>Terrain</span>
                            <input type="range" id="terrain-size" min="50" max="500" step="10" value="${this.settings.terrainSize}" />
                            <span id="terrain-size-val">${this.settings.terrainSize}</span>
                        </div>
                    </div>

                    <div class="settings-section">
                        <label class="section-label">Presets</label>
                        <div class="preset-buttons">
                            <button class="preset-btn" data-preset="day" title="Bright daylight">☀️ Day</button>
                            <button class="preset-btn" data-preset="sunset" title="Golden hour">🌅 Sunset</button>
                            <button class="preset-btn" data-preset="night" title="Moonlit night">🌙 Night</button>
                            <button class="preset-btn" data-preset="overcast" title="Cloudy weather">☁️ Overcast</button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .scene-settings-panel {
                    background: rgba(20, 26, 43, 0.98);
                    border: 1px solid #2a3150;
                    border-radius: 10px;
                    overflow: hidden;
                    font-family: 'Jost', sans-serif;
                }
                .settings-header {
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
                .settings-header:hover {
                    background: rgba(110, 231, 183, 0.1);
                }
                .settings-icon {
                    font-size: 16px;
                }
                .settings-toggle {
                    margin-left: auto;
                    font-size: 10px;
                    transition: transform 0.2s;
                }
                .scene-settings-panel.collapsed .settings-toggle {
                    transform: rotate(-90deg);
                }
                .scene-settings-panel.collapsed .settings-content {
                    display: none;
                }
                .settings-content {
                    padding: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .settings-content::-webkit-scrollbar {
                    width: 4px;
                }
                .settings-content::-webkit-scrollbar-thumb {
                    background: #2a3150;
                    border-radius: 2px;
                }
                .settings-section {
                    margin-bottom: 14px;
                }
                .settings-section:last-child {
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
                .setting-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 12px;
                    color: #e8eaf6;
                }
                .setting-row span:first-child {
                    min-width: 60px;
                    color: #a5b4d0;
                }
                .setting-row input[type="range"] {
                    flex: 1;
                    height: 4px;
                    accent-color: #6ee7b7;
                }
                .setting-row span:last-child {
                    min-width: 35px;
                    text-align: right;
                    font-size: 11px;
                    color: #6ee7b7;
                }
                .color-row input[type="color"] {
                    width: 32px;
                    height: 24px;
                    border: 1px solid #2a3150;
                    border-radius: 4px;
                    padding: 0;
                    cursor: pointer;
                    background: transparent;
                }
                .checkbox-row label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    color: #e8eaf6;
                }
                .checkbox-row input[type="checkbox"] {
                    accent-color: #6ee7b7;
                }
                .preset-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                }
                .preset-btn {
                    padding: 8px 12px;
                    background: rgba(42, 49, 80, 0.5);
                    border: 1px solid #2a3150;
                    border-radius: 6px;
                    color: #e8eaf6;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .preset-btn:hover {
                    border-color: #6ee7b7;
                    background: rgba(110, 231, 183, 0.1);
                }
            </style>
        `
    }

    bindEvents() {
        const header = this.container.querySelector('#settings-header-toggle')
        const panel = this.container.querySelector('.scene-settings-panel')

        if (header && panel) {
            header.addEventListener('click', () => {
                panel.classList.toggle('collapsed')
                this.isExpanded = !panel.classList.contains('collapsed')
            })
        }

        this.bindSlider('ambient-intensity', 'ambient-val', (v) => {
            this.settings.ambientIntensity = v
            this.onUpdate('ambientIntensity', v)
        }, (v) => v.toFixed(1))

        this.bindSlider('sun-intensity', 'sun-val', (v) => {
            this.settings.sunIntensity = v
            this.onUpdate('sunIntensity', v)
        }, (v) => v.toFixed(1))

        this.bindSlider('sun-angle', 'sun-angle-val', (v) => {
            this.settings.sunAngle = v
            this.onUpdate('sunAngle', v)
        }, (v) => `${v}°`)

        this.bindSlider('fog-far', 'fog-val', (v) => {
            this.settings.fogFar = v
            this.onUpdate('fogFar', v)
        })

        this.bindSlider('grid-size', 'grid-size-val', (v) => {
            this.settings.gridSize = v
            this.onUpdate('gridSize', v)
        })

        this.bindSlider('terrain-size', 'terrain-size-val', (v) => {
            this.settings.terrainSize = v
            this.onUpdate('terrainSize', v)
        })

        this.bindColorPicker('sun-color', (v) => {
            this.settings.sunColor = v
            this.onUpdate('sunColor', v)
        })

        this.bindColorPicker('sky-color', (v) => {
            this.settings.skyColor = v
            this.onUpdate('skyColor', v)
        })

        this.bindCheckbox('fog-enabled', (v) => {
            this.settings.fogEnabled = v
            this.onUpdate('fogEnabled', v)
            const fogSettings = document.getElementById('fog-settings')
            if (fogSettings) {
                fogSettings.style.opacity = v ? '1' : '0.5'
                fogSettings.style.pointerEvents = v ? 'auto' : 'none'
            }
        })

        this.bindCheckbox('grid-visible', (v) => {
            this.settings.gridVisible = v
            this.onUpdate('gridVisible', v)
        })

        this.container.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset))
        })
    }

    bindSlider(inputId, valId, onChange, format = (v) => v) {
        const input = document.getElementById(inputId)
        const val = document.getElementById(valId)
        if (input && val) {
            input.addEventListener('input', () => {
                const v = parseFloat(input.value)
                val.textContent = format(v)
                onChange(v)
            })
        }
    }

    bindColorPicker(inputId, onChange) {
        const input = document.getElementById(inputId)
        if (input) {
            input.addEventListener('input', () => onChange(input.value))
        }
    }

    bindCheckbox(inputId, onChange) {
        const input = document.getElementById(inputId)
        if (input) {
            input.addEventListener('change', () => onChange(input.checked))
        }
    }

    applyPreset(preset) {
        const presets = {
            day: {
                ambientIntensity: 1.2,
                sunIntensity: 2.0,
                sunAngle: 60,
                sunColor: '#ffffff',
                skyColor: '#87CEEB',
                fogEnabled: true,
                fogFar: 300
            },
            sunset: {
                ambientIntensity: 0.8,
                sunIntensity: 1.5,
                sunAngle: 15,
                sunColor: '#ff8c42',
                skyColor: '#ff6b6b',
                fogEnabled: true,
                fogFar: 200
            },
            night: {
                ambientIntensity: 0.3,
                sunIntensity: 0.5,
                sunAngle: 30,
                sunColor: '#8ba4c7',
                skyColor: '#1a1a2e',
                fogEnabled: true,
                fogFar: 150
            },
            overcast: {
                ambientIntensity: 1.0,
                sunIntensity: 0.8,
                sunAngle: 45,
                sunColor: '#c9c9c9',
                skyColor: '#9ca3af',
                fogEnabled: true,
                fogFar: 250
            }
        }

        const p = presets[preset]
        if (!p) return

        Object.assign(this.settings, p)
        this.updateUIFromSettings()

        Object.entries(p).forEach(([key, value]) => {
            this.onUpdate(key, value)
        })
    }

    updateUIFromSettings() {
        const s = this.settings

        this.updateSlider('ambient-intensity', 'ambient-val', s.ambientIntensity, (v) => v.toFixed(1))
        this.updateSlider('sun-intensity', 'sun-val', s.sunIntensity, (v) => v.toFixed(1))
        this.updateSlider('sun-angle', 'sun-angle-val', s.sunAngle, (v) => `${v}°`)
        this.updateSlider('fog-far', 'fog-val', s.fogFar)
        this.updateSlider('grid-size', 'grid-size-val', s.gridSize)
        this.updateSlider('terrain-size', 'terrain-size-val', s.terrainSize)

        const sunColor = document.getElementById('sun-color')
        if (sunColor) sunColor.value = s.sunColor

        const skyColor = document.getElementById('sky-color')
        if (skyColor) skyColor.value = s.skyColor

        const fogEnabled = document.getElementById('fog-enabled')
        if (fogEnabled) fogEnabled.checked = s.fogEnabled

        const gridVisible = document.getElementById('grid-visible')
        if (gridVisible) gridVisible.checked = s.gridVisible

        const fogSettings = document.getElementById('fog-settings')
        if (fogSettings) {
            fogSettings.style.opacity = s.fogEnabled ? '1' : '0.5'
            fogSettings.style.pointerEvents = s.fogEnabled ? 'auto' : 'none'
        }
    }

    updateSlider(inputId, valId, value, format = (v) => v) {
        const input = document.getElementById(inputId)
        const val = document.getElementById(valId)
        if (input) input.value = value
        if (val) val.textContent = format(value)
    }
}
