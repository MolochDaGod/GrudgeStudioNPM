import * as THREE from 'three'

export class AudioManager {
    constructor(camera) {
        this.camera = camera
        this.listener = null
        this.sounds = new Map()
        this.music = null
        this.musicVolume = 0.5
        this.sfxVolume = 0.7
        this.masterVolume = 1.0
        this.isMuted = false
        this.initialized = false
        this.audioLoader = new THREE.AudioLoader()
        
        this.soundLibrary = {
            hit_light: { url: null, volume: 0.6 },
            hit_heavy: { url: null, volume: 0.8 },
            hit_critical: { url: null, volume: 1.0 },
            block: { url: null, volume: 0.5 },
            dodge: { url: null, volume: 0.4 },
            footstep: { url: null, volume: 0.3 },
            death: { url: null, volume: 0.7 },
            victory: { url: null, volume: 0.8 },
            round_start: { url: null, volume: 0.6 },
            ui_click: { url: null, volume: 0.4 },
            ui_hover: { url: null, volume: 0.2 },
            skill_fire: { url: null, volume: 0.7 },
            skill_ice: { url: null, volume: 0.7 },
            skill_lightning: { url: null, volume: 0.8 },
            ambient_arena: { url: null, volume: 0.3 }
        }
    }

    async init() {
        if (this.initialized) return

        try {
            this.listener = new THREE.AudioListener()
            if (this.camera) {
                this.camera.add(this.listener)
            }
            this.initialized = true
            console.log('AudioManager initialized')
        } catch (error) {
            console.warn('AudioManager init failed:', error)
        }
    }

    async loadSound(name, url) {
        if (!this.initialized) await this.init()

        return new Promise((resolve, reject) => {
            this.audioLoader.load(url, (buffer) => {
                this.soundLibrary[name] = { 
                    ...this.soundLibrary[name],
                    url, 
                    buffer 
                }
                resolve(buffer)
            }, undefined, reject)
        })
    }

    playSound(name, options = {}) {
        if (!this.initialized || this.isMuted) return null

        const {
            position = null,
            volume = 1.0,
            loop = false,
            playbackRate = 1.0
        } = options

        const soundData = this.soundLibrary[name]
        if (!soundData) {
            this.playSynthSound(name, options)
            return null
        }

        let sound
        if (position) {
            sound = new THREE.PositionalAudio(this.listener)
            sound.setRefDistance(10)
            sound.setRolloffFactor(1)
            
            const soundObj = new THREE.Object3D()
            soundObj.position.copy(position)
            soundObj.add(sound)
            if (this.camera?.parent) {
                this.camera.parent.add(soundObj)
            }
        } else {
            sound = new THREE.Audio(this.listener)
        }

        if (soundData.buffer) {
            sound.setBuffer(soundData.buffer)
        }

        const finalVolume = volume * (soundData.volume || 1) * this.sfxVolume * this.masterVolume
        sound.setVolume(finalVolume)
        sound.setLoop(loop)
        sound.setPlaybackRate(playbackRate)

        if (soundData.buffer) {
            sound.play()
        }

        return sound
    }

    playSynthSound(name, options = {}) {
        if (this.isMuted) return

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            const volume = (options.volume || 0.3) * this.sfxVolume * this.masterVolume

            switch (name) {
                case 'hit_light':
                    oscillator.type = 'square'
                    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
                    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1)
                    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
                    oscillator.start()
                    oscillator.stop(ctx.currentTime + 0.1)
                    break

                case 'hit_heavy':
                    oscillator.type = 'sawtooth'
                    oscillator.frequency.setValueAtTime(150, ctx.currentTime)
                    oscillator.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2)
                    gainNode.gain.setValueAtTime(volume * 1.2, ctx.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
                    oscillator.start()
                    oscillator.stop(ctx.currentTime + 0.2)
                    break

                case 'hit_critical':
                    oscillator.type = 'square'
                    oscillator.frequency.setValueAtTime(400, ctx.currentTime)
                    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15)
                    gainNode.gain.setValueAtTime(volume * 1.5, ctx.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
                    oscillator.start()
                    oscillator.stop(ctx.currentTime + 0.15)
                    break

                case 'block':
                    oscillator.type = 'triangle'
                    oscillator.frequency.setValueAtTime(300, ctx.currentTime)
                    oscillator.frequency.setValueAtTime(250, ctx.currentTime + 0.05)
                    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
                    oscillator.start()
                    oscillator.stop(ctx.currentTime + 0.1)
                    break

                case 'ui_click':
                    oscillator.type = 'sine'
                    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
                    gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
                    oscillator.start()
                    oscillator.stop(ctx.currentTime + 0.05)
                    break

                case 'ui_hover':
                    oscillator.type = 'sine'
                    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
                    gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03)
                    oscillator.start()
                    oscillator.stop(ctx.currentTime + 0.03)
                    break

                default:
                    oscillator.type = 'sine'
                    oscillator.frequency.setValueAtTime(440, ctx.currentTime)
                    gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime)
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
                    oscillator.start()
                    oscillator.stop(ctx.currentTime + 0.1)
            }
        } catch (e) {
            console.warn('Synth sound failed:', e)
        }
    }

    playMusic(name, options = {}) {
        if (!this.initialized) return null

        if (this.music) {
            this.music.stop()
        }

        this.music = new THREE.Audio(this.listener)
        const soundData = this.soundLibrary[name]
        
        if (soundData?.buffer) {
            this.music.setBuffer(soundData.buffer)
            this.music.setLoop(true)
            this.music.setVolume(this.musicVolume * this.masterVolume)
            if (!this.isMuted) {
                this.music.play()
            }
        }

        return this.music
    }

    stopMusic() {
        if (this.music && this.music.isPlaying) {
            this.music.stop()
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume))
        this.updateAllVolumes()
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume))
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume))
        if (this.music) {
            this.music.setVolume(this.musicVolume * this.masterVolume)
        }
    }

    mute() {
        this.isMuted = true
        if (this.music && this.music.isPlaying) {
            this.music.pause()
        }
    }

    unmute() {
        this.isMuted = false
        if (this.music && !this.music.isPlaying) {
            this.music.play()
        }
    }

    toggleMute() {
        if (this.isMuted) {
            this.unmute()
        } else {
            this.mute()
        }
        return this.isMuted
    }

    updateAllVolumes() {
        if (this.music) {
            this.music.setVolume(this.musicVolume * this.masterVolume)
        }
    }

    dispose() {
        this.stopMusic()
        this.sounds.forEach(sound => {
            if (sound.isPlaying) sound.stop()
        })
        this.sounds.clear()
        if (this.listener && this.camera) {
            this.camera.remove(this.listener)
        }
        this.initialized = false
    }
}

export const audioManager = new AudioManager(null)
