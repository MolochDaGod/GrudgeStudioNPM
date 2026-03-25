/*
    GRUDGE Studio - Environment Manager
    Controls lighting, sky, weather, and day/night cycle
*/

import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'

export class EnvironmentManager {
    constructor(scene, renderer) {
        this.scene = scene
        this.renderer = renderer
        
        this.timeOfDay = 12
        this.daySpeed = 0
        this.weather = 'clear'
        this.weatherIntensity = 0.5
        
        this.sunLight = null
        this.ambientLight = null
        this.sky = null
        this.fog = null
        
        this.weatherParticles = null
        this.rainMaterial = null
        
        this.presets = {
            clear: { fogDensity: 0.0005, fogColor: 0x87ceeb, ambientIntensity: 0.4 },
            cloudy: { fogDensity: 0.001, fogColor: 0x9ca8b0, ambientIntensity: 0.6 },
            rain: { fogDensity: 0.002, fogColor: 0x6a7a80, ambientIntensity: 0.3 },
            fog: { fogDensity: 0.008, fogColor: 0xc0c0c0, ambientIntensity: 0.5 },
            night: { fogDensity: 0.001, fogColor: 0x0a0a20, ambientIntensity: 0.1 }
        }
        
        this.listeners = []
    }
    
    init() {
        this.createSunLight()
        this.createAmbientLight()
        this.createSky()
        this.createFog()
        this.updateEnvironment()
    }
    
    createSunLight() {
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5)
        this.sunLight.position.set(50, 100, 50)
        this.sunLight.castShadow = true
        
        this.sunLight.shadow.mapSize.width = 2048
        this.sunLight.shadow.mapSize.height = 2048
        this.sunLight.shadow.camera.near = 0.5
        this.sunLight.shadow.camera.far = 500
        this.sunLight.shadow.camera.left = -100
        this.sunLight.shadow.camera.right = 100
        this.sunLight.shadow.camera.top = 100
        this.sunLight.shadow.camera.bottom = -100
        this.sunLight.shadow.bias = -0.0001
        
        this.scene.add(this.sunLight)
        this.scene.add(this.sunLight.target)
    }
    
    createAmbientLight() {
        this.ambientLight = new THREE.AmbientLight(0x404080, 0.4)
        this.scene.add(this.ambientLight)
        
        this.hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x362a1f, 0.5)
        this.scene.add(this.hemisphereLight)
    }
    
    createSky() {
        this.sky = new Sky()
        this.sky.scale.setScalar(10000)
        this.scene.add(this.sky)
        
        const skyUniforms = this.sky.material.uniforms
        skyUniforms['turbidity'].value = 10
        skyUniforms['rayleigh'].value = 2
        skyUniforms['mieCoefficient'].value = 0.005
        skyUniforms['mieDirectionalG'].value = 0.8
        
        this.sunPosition = new THREE.Vector3()
    }
    
    createFog() {
        this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0005)
    }
    
    setTimeOfDay(time) {
        this.timeOfDay = Math.max(0, Math.min(24, time))
        this.updateEnvironment()
        this.notifyListeners('timeChanged', this.timeOfDay)
    }
    
    setDaySpeed(speed) {
        this.daySpeed = speed
    }
    
    setWeather(weather) {
        if (this.presets[weather]) {
            this.weather = weather
            this.updateEnvironment()
            this.updateWeatherEffects()
            this.notifyListeners('weatherChanged', this.weather)
        }
    }
    
    setWeatherIntensity(intensity) {
        this.weatherIntensity = Math.max(0, Math.min(1, intensity))
        this.updateWeatherEffects()
    }
    
    updateEnvironment() {
        this.updateSunPosition()
        this.updateLighting()
        this.updateSky()
        this.updateFog()
    }
    
    updateSunPosition() {
        const phi = THREE.MathUtils.degToRad(90 - this.getSunElevation())
        const theta = THREE.MathUtils.degToRad(this.getSunAzimuth())
        
        this.sunPosition.setFromSphericalCoords(1, phi, theta)
        
        const sunDistance = 100
        this.sunLight.position.copy(this.sunPosition).multiplyScalar(sunDistance)
        this.sunLight.target.position.set(0, 0, 0)
        
        if (this.sky) {
            this.sky.material.uniforms['sunPosition'].value.copy(this.sunPosition)
        }
    }
    
    getSunElevation() {
        const hour = this.timeOfDay
        if (hour < 6 || hour > 18) {
            return -10
        }
        const noon = 12
        const maxElevation = 70
        const diff = Math.abs(hour - noon)
        return maxElevation * (1 - diff / 6)
    }
    
    getSunAzimuth() {
        return (this.timeOfDay / 24) * 360 - 90
    }
    
    updateLighting() {
        const elevation = this.getSunElevation()
        const isNight = elevation < 0
        const preset = this.presets[this.weather] || this.presets.clear
        
        if (isNight) {
            this.sunLight.intensity = 0.1
            this.sunLight.color.setHex(0x4466aa)
            this.ambientLight.intensity = 0.1
            this.ambientLight.color.setHex(0x1a1a3a)
            this.hemisphereLight.intensity = 0.1
        } else {
            const dayProgress = elevation / 70
            
            if (this.timeOfDay < 8) {
                this.sunLight.color.setHex(0xffaa66)
                this.sunLight.intensity = 0.8 + dayProgress * 0.7
            } else if (this.timeOfDay > 16) {
                this.sunLight.color.setHex(0xff8844)
                this.sunLight.intensity = 0.8 + dayProgress * 0.5
            } else {
                this.sunLight.color.setHex(0xffffff)
                this.sunLight.intensity = 1.2 + dayProgress * 0.3
            }
            
            this.ambientLight.intensity = preset.ambientIntensity
            this.hemisphereLight.intensity = 0.3 + dayProgress * 0.2
        }
        
        if (this.weather === 'rain' || this.weather === 'cloudy') {
            this.sunLight.intensity *= 0.5
        }
    }
    
    updateSky() {
        if (!this.sky) return
        
        const uniforms = this.sky.material.uniforms
        const elevation = this.getSunElevation()
        
        if (elevation < 0) {
            uniforms['turbidity'].value = 2
            uniforms['rayleigh'].value = 0.5
        } else if (this.weather === 'cloudy' || this.weather === 'rain') {
            uniforms['turbidity'].value = 20
            uniforms['rayleigh'].value = 1
        } else {
            uniforms['turbidity'].value = 10
            uniforms['rayleigh'].value = 2
        }
    }
    
    updateFog() {
        const preset = this.presets[this.weather] || this.presets.clear
        const elevation = this.getSunElevation()
        const isNight = elevation < 0
        
        if (this.scene.fog) {
            this.scene.fog.density = preset.fogDensity * (1 + this.weatherIntensity)
            
            if (isNight) {
                this.scene.fog.color.setHex(0x0a0a20)
            } else {
                this.scene.fog.color.setHex(preset.fogColor)
            }
        }
    }
    
    updateWeatherEffects() {
        this.removeWeatherParticles()
        
        if (this.weather === 'rain' && this.weatherIntensity > 0) {
            this.createRainEffect()
        }
    }
    
    createRainEffect() {
        const particleCount = Math.floor(5000 * this.weatherIntensity)
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)
        const velocities = new Float32Array(particleCount)
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100
            positions[i * 3 + 1] = Math.random() * 50
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100
            velocities[i] = 0.5 + Math.random() * 0.5
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometry.userData.velocities = velocities
        
        this.rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaacc,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        })
        
        this.weatherParticles = new THREE.Points(geometry, this.rainMaterial)
        this.scene.add(this.weatherParticles)
    }
    
    removeWeatherParticles() {
        if (this.weatherParticles) {
            this.scene.remove(this.weatherParticles)
            this.weatherParticles.geometry.dispose()
            if (this.rainMaterial) this.rainMaterial.dispose()
            this.weatherParticles = null
        }
    }
    
    update(deltaTime) {
        if (this.daySpeed > 0) {
            this.timeOfDay += deltaTime * this.daySpeed / 60
            if (this.timeOfDay >= 24) this.timeOfDay -= 24
            if (this.timeOfDay < 0) this.timeOfDay += 24
            this.updateEnvironment()
        }
        
        if (this.weatherParticles && this.weather === 'rain') {
            const positions = this.weatherParticles.geometry.attributes.position.array
            const velocities = this.weatherParticles.geometry.userData.velocities
            
            for (let i = 0; i < velocities.length; i++) {
                positions[i * 3 + 1] -= velocities[i]
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = 50
                }
            }
            this.weatherParticles.geometry.attributes.position.needsUpdate = true
        }
    }
    
    addListener(callback) {
        this.listeners.push(callback)
    }
    
    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback)
    }
    
    notifyListeners(event, value) {
        this.listeners.forEach(l => l(event, value))
    }
    
    getState() {
        return {
            timeOfDay: this.timeOfDay,
            daySpeed: this.daySpeed,
            weather: this.weather,
            weatherIntensity: this.weatherIntensity
        }
    }
    
    setState(state) {
        if (state.timeOfDay !== undefined) this.timeOfDay = state.timeOfDay
        if (state.daySpeed !== undefined) this.daySpeed = state.daySpeed
        if (state.weather !== undefined) this.weather = state.weather
        if (state.weatherIntensity !== undefined) this.weatherIntensity = state.weatherIntensity
        this.updateEnvironment()
        this.updateWeatherEffects()
    }
    
    dispose() {
        this.removeWeatherParticles()
        if (this.sunLight) this.scene.remove(this.sunLight)
        if (this.ambientLight) this.scene.remove(this.ambientLight)
        if (this.hemisphereLight) this.scene.remove(this.hemisphereLight)
        if (this.sky) this.scene.remove(this.sky)
    }
}

export default EnvironmentManager
