/*
    GRUDGE Studio - Environment Panel
    UI controls for lighting, weather, and day/night cycle
*/

export class EnvironmentPanel {
    constructor(container, environmentManager) {
        this.container = container
        this.envManager = environmentManager
        this.createUI()
        
        if (this.envManager) {
            this.envManager.addListener((event, value) => this.onEnvironmentChange(event, value))
        }
    }
    
    createUI() {
        if (!this.container) return
        
        this.panel = document.createElement('div')
        this.panel.className = 'environment-panel'
        this.panel.innerHTML = `
            <div class="panel-section">
                <div class="section-header">
                    <span>☀️ Environment</span>
                    <span class="toggle">▼</span>
                </div>
                <div class="section-content">
                    <div class="control-group">
                        <label>Time of Day</label>
                        <div class="time-control">
                            <input type="range" id="env-time" min="0" max="24" step="0.5" value="12">
                            <span id="env-time-label">12:00</span>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label>Day Cycle Speed</label>
                        <select id="env-day-speed">
                            <option value="0">Static</option>
                            <option value="1">Slow (1 min = 1 hour)</option>
                            <option value="5">Normal (12 sec = 1 hour)</option>
                            <option value="30">Fast (2 sec = 1 hour)</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>Weather</label>
                        <select id="env-weather">
                            <option value="clear">☀️ Clear</option>
                            <option value="cloudy">☁️ Cloudy</option>
                            <option value="rain">🌧️ Rain</option>
                            <option value="fog">🌫️ Fog</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>Weather Intensity</label>
                        <input type="range" id="env-intensity" min="0" max="1" step="0.1" value="0.5">
                    </div>
                    
                    <div class="control-group presets">
                        <label>Quick Presets</label>
                        <div class="preset-buttons">
                            <button class="preset-btn" data-preset="dawn" title="Dawn">🌅</button>
                            <button class="preset-btn" data-preset="noon" title="Noon">☀️</button>
                            <button class="preset-btn" data-preset="dusk" title="Dusk">🌆</button>
                            <button class="preset-btn" data-preset="night" title="Night">🌙</button>
                            <button class="preset-btn" data-preset="storm" title="Storm">⛈️</button>
                        </div>
                    </div>
                </div>
            </div>
        `
        
        this.container.appendChild(this.panel)
        this.bindEvents()
    }
    
    bindEvents() {
        const timeSlider = this.panel.querySelector('#env-time')
        const timeLabel = this.panel.querySelector('#env-time-label')
        const daySpeed = this.panel.querySelector('#env-day-speed')
        const weather = this.panel.querySelector('#env-weather')
        const intensity = this.panel.querySelector('#env-intensity')
        
        const header = this.panel.querySelector('.section-header')
        header.onclick = () => {
            const content = this.panel.querySelector('.section-content')
            content.classList.toggle('collapsed')
            header.querySelector('.toggle').textContent = content.classList.contains('collapsed') ? '▶' : '▼'
        }
        
        timeSlider?.addEventListener('input', (e) => {
            const time = parseFloat(e.target.value)
            timeLabel.textContent = this.formatTime(time)
            if (this.envManager) {
                this.envManager.setTimeOfDay(time)
            }
        })
        
        daySpeed?.addEventListener('change', (e) => {
            if (this.envManager) {
                this.envManager.setDaySpeed(parseFloat(e.target.value))
            }
        })
        
        weather?.addEventListener('change', (e) => {
            if (this.envManager) {
                this.envManager.setWeather(e.target.value)
            }
        })
        
        intensity?.addEventListener('input', (e) => {
            if (this.envManager) {
                this.envManager.setWeatherIntensity(parseFloat(e.target.value))
            }
        })
        
        this.panel.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyPreset(btn.dataset.preset)
            })
        })
    }
    
    formatTime(time) {
        const hours = Math.floor(time)
        const minutes = Math.round((time - hours) * 60)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }
    
    applyPreset(preset) {
        if (!this.envManager) return
        
        const presets = {
            dawn: { time: 6, weather: 'clear', intensity: 0.3 },
            noon: { time: 12, weather: 'clear', intensity: 0.2 },
            dusk: { time: 18, weather: 'clear', intensity: 0.4 },
            night: { time: 22, weather: 'clear', intensity: 0.5 },
            storm: { time: 14, weather: 'rain', intensity: 0.9 }
        }
        
        const p = presets[preset]
        if (p) {
            this.envManager.setTimeOfDay(p.time)
            this.envManager.setWeather(p.weather)
            this.envManager.setWeatherIntensity(p.intensity)
            this.updateUI()
        }
    }
    
    updateUI() {
        if (!this.envManager) return
        
        const state = this.envManager.getState()
        
        const timeSlider = this.panel.querySelector('#env-time')
        const timeLabel = this.panel.querySelector('#env-time-label')
        const weather = this.panel.querySelector('#env-weather')
        const intensity = this.panel.querySelector('#env-intensity')
        
        if (timeSlider) timeSlider.value = state.timeOfDay
        if (timeLabel) timeLabel.textContent = this.formatTime(state.timeOfDay)
        if (weather) weather.value = state.weather
        if (intensity) intensity.value = state.weatherIntensity
    }
    
    onEnvironmentChange(event, value) {
        if (event === 'timeChanged') {
            const timeSlider = this.panel.querySelector('#env-time')
            const timeLabel = this.panel.querySelector('#env-time-label')
            if (timeSlider) timeSlider.value = value
            if (timeLabel) timeLabel.textContent = this.formatTime(value)
        }
    }
    
    setEnvironmentManager(envManager) {
        this.envManager = envManager
        if (this.envManager) {
            this.envManager.addListener((event, value) => this.onEnvironmentChange(event, value))
            this.updateUI()
        }
    }
}

export default EnvironmentPanel
