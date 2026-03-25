/*
    GRUDGE Editor - Toolbar
    Mode switching and tool controls
*/

export class EditorToolbar {
    constructor(container) {
        this.container = container
        
        this.currentMode = 'select'
        this.tools = new Map()
        
        this.onModeChange = null
        this.onSettingChange = null
        
        this.createUI()
    }
    
    createUI() {
        if (!this.container) return
        
        this.container.innerHTML = ''
        this.container.className = 'editor-toolbar'
        
        const modeSection = document.createElement('div')
        modeSection.className = 'toolbar-section'
        modeSection.innerHTML = '<div class="section-label">Mode</div>'
        
        const modeButtons = document.createElement('div')
        modeButtons.className = 'toolbar-buttons'
        
        const modes = [
            { id: 'select', icon: '🖱️', label: 'Select', key: 'V' },
            { id: 'sculpt', icon: '🏔️', label: 'Sculpt', key: 'B' },
            { id: 'place', icon: '📍', label: 'Place', key: 'P' }
        ]
        
        modes.forEach(mode => {
            const btn = document.createElement('button')
            btn.className = 'toolbar-btn'
            btn.dataset.mode = mode.id
            btn.title = `${mode.label} (${mode.key})`
            btn.innerHTML = `<span class="btn-icon">${mode.icon}</span><span class="btn-label">${mode.label}</span>`
            btn.onclick = () => this.setMode(mode.id)
            modeButtons.appendChild(btn)
        })
        
        modeSection.appendChild(modeButtons)
        this.container.appendChild(modeSection)
        
        this.sculptSection = this.createSculptSection()
        this.container.appendChild(this.sculptSection)
        
        this.placeSection = this.createPlaceSection()
        this.container.appendChild(this.placeSection)
        
        this.gridSection = this.createGridSection()
        this.container.appendChild(this.gridSection)
        
        this.updateUI()
    }
    
    createSculptSection() {
        const section = document.createElement('div')
        section.className = 'toolbar-section sculpt-options'
        section.innerHTML = '<div class="section-label">Sculpt</div>'
        
        const brushModes = document.createElement('div')
        brushModes.className = 'toolbar-buttons'
        
        const sculpts = [
            { id: 'raise', icon: '⬆️', label: 'Raise' },
            { id: 'lower', icon: '⬇️', label: 'Lower' },
            { id: 'level', icon: '➡️', label: 'Level' },
            { id: 'smooth', icon: '〰️', label: 'Smooth' }
        ]
        
        sculpts.forEach(s => {
            const btn = document.createElement('button')
            btn.className = 'toolbar-btn small'
            btn.dataset.sculptMode = s.id
            btn.title = s.label
            btn.innerHTML = `<span class="btn-icon">${s.icon}</span>`
            btn.onclick = () => {
                section.querySelectorAll('[data-sculpt-mode]').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
                this.emitSettingChange('sculptMode', s.id)
            }
            brushModes.appendChild(btn)
        })
        
        section.appendChild(brushModes)
        
        const sliders = document.createElement('div')
        sliders.className = 'toolbar-sliders'
        
        sliders.innerHTML = `
            <div class="slider-group">
                <label>Radius: <span id="brush-radius-val">5</span></label>
                <input type="range" id="brush-radius" min="1" max="30" value="5" step="1">
            </div>
            <div class="slider-group">
                <label>Strength: <span id="brush-strength-val">0.5</span></label>
                <input type="range" id="brush-strength" min="0.1" max="2" value="0.5" step="0.1">
            </div>
            <div class="slider-group">
                <label>Falloff</label>
                <select id="brush-falloff">
                    <option value="smooth">Smooth</option>
                    <option value="linear">Linear</option>
                    <option value="hard">Hard</option>
                    <option value="gaussian">Gaussian</option>
                </select>
            </div>
        `
        
        section.appendChild(sliders)
        
        setTimeout(() => {
            const radiusSlider = section.querySelector('#brush-radius')
            const strengthSlider = section.querySelector('#brush-strength')
            const falloffSelect = section.querySelector('#brush-falloff')
            
            if (radiusSlider) {
                radiusSlider.addEventListener('input', (e) => {
                    section.querySelector('#brush-radius-val').textContent = e.target.value
                    this.emitSettingChange('brushRadius', parseFloat(e.target.value))
                })
            }
            
            if (strengthSlider) {
                strengthSlider.addEventListener('input', (e) => {
                    section.querySelector('#brush-strength-val').textContent = e.target.value
                    this.emitSettingChange('brushStrength', parseFloat(e.target.value))
                })
            }
            
            if (falloffSelect) {
                falloffSelect.addEventListener('change', (e) => {
                    this.emitSettingChange('brushFalloff', e.target.value)
                })
            }
        }, 0)
        
        return section
    }
    
    createPlaceSection() {
        const section = document.createElement('div')
        section.className = 'toolbar-section place-options'
        section.innerHTML = '<div class="section-label">Placement</div>'
        
        const options = document.createElement('div')
        options.className = 'toolbar-checkboxes'
        
        options.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" id="snap-grid" checked>
                Snap to Grid
            </label>
            <label class="checkbox-label">
                <input type="checkbox" id="snap-terrain" checked>
                Snap to Terrain
            </label>
            <label class="checkbox-label">
                <input type="checkbox" id="random-rotation">
                Random Rotation
            </label>
            <label class="checkbox-label">
                <input type="checkbox" id="random-scale">
                Random Scale
            </label>
        `
        
        section.appendChild(options)
        
        setTimeout(() => {
            section.querySelector('#snap-grid')?.addEventListener('change', (e) => {
                this.emitSettingChange('snapToGrid', e.target.checked)
            })
            section.querySelector('#snap-terrain')?.addEventListener('change', (e) => {
                this.emitSettingChange('snapToTerrain', e.target.checked)
            })
            section.querySelector('#random-rotation')?.addEventListener('change', (e) => {
                this.emitSettingChange('randomRotation', e.target.checked)
            })
            section.querySelector('#random-scale')?.addEventListener('change', (e) => {
                this.emitSettingChange('randomScale', e.target.checked)
            })
        }, 0)
        
        return section
    }
    
    createGridSection() {
        const section = document.createElement('div')
        section.className = 'toolbar-section grid-options'
        section.innerHTML = '<div class="section-label">Grid</div>'
        
        const options = document.createElement('div')
        options.className = 'toolbar-checkboxes'
        
        options.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" id="show-grid" checked>
                Show Grid
            </label>
            <div class="slider-group">
                <label>Cell Size: <span id="cell-size-val">2</span></label>
                <input type="range" id="cell-size" min="0.5" max="10" value="2" step="0.5">
            </div>
        `
        
        section.appendChild(options)
        
        setTimeout(() => {
            section.querySelector('#show-grid')?.addEventListener('change', (e) => {
                this.emitSettingChange('showGrid', e.target.checked)
            })
            section.querySelector('#cell-size')?.addEventListener('input', (e) => {
                section.querySelector('#cell-size-val').textContent = e.target.value
                this.emitSettingChange('cellSize', parseFloat(e.target.value))
            })
        }, 0)
        
        return section
    }
    
    setMode(mode) {
        this.currentMode = mode
        this.updateUI()
        
        if (this.onModeChange) {
            this.onModeChange(mode)
        }
    }
    
    getMode() {
        return this.currentMode
    }
    
    updateUI() {
        const modeButtons = this.container.querySelectorAll('[data-mode]')
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.currentMode)
        })
        
        this.sculptSection.style.display = this.currentMode === 'sculpt' ? 'block' : 'none'
        this.placeSection.style.display = this.currentMode === 'place' ? 'block' : 'none'
        
        if (this.currentMode === 'sculpt') {
            const firstSculptBtn = this.sculptSection.querySelector('[data-sculpt-mode]')
            if (firstSculptBtn && !this.sculptSection.querySelector('[data-sculpt-mode].active')) {
                firstSculptBtn.click()
            }
        }
    }
    
    emitSettingChange(setting, value) {
        if (this.onSettingChange) {
            this.onSettingChange(setting, value)
        }
    }
    
    handleKeyboard(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return
        
        switch (event.key.toLowerCase()) {
            case 'v':
                this.setMode('select')
                break
            case 'b':
                this.setMode('sculpt')
                break
            case 'p':
                this.setMode('place')
                break
            case '[':
                this.adjustBrushRadius(-1)
                break
            case ']':
                this.adjustBrushRadius(1)
                break
        }
    }
    
    adjustBrushRadius(delta) {
        const slider = this.container.querySelector('#brush-radius')
        if (slider) {
            const newValue = Math.max(1, Math.min(30, parseFloat(slider.value) + delta))
            slider.value = newValue
            this.container.querySelector('#brush-radius-val').textContent = newValue
            this.emitSettingChange('brushRadius', newValue)
        }
    }
    
    setSculptMode(mode) {
        const btn = this.sculptSection.querySelector(`[data-sculpt-mode="${mode}"]`)
        if (btn) {
            btn.click()
        }
    }
}

export default EditorToolbar
