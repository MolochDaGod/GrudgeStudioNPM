import * as THREE from 'three'

export class CinematicCamera {
  constructor(camera, options = {}) {
    this.camera = camera
    this.enabled = true
    this.playing = false
    this.loop = options.loop ?? false
    this.duration = 0
    this.currentTime = 0
    this.speed = options.speed ?? 1
    
    this.keyframes = []
    this.currentKeyframe = 0
    
    this.onComplete = null
    this.onKeyframe = null
  }

  addKeyframe(position, lookAt, time, easing = 'linear') {
    this.keyframes.push({
      position: new THREE.Vector3().copy(position),
      lookAt: new THREE.Vector3().copy(lookAt),
      time,
      easing
    })
    
    this.keyframes.sort((a, b) => a.time - b.time)
    this.duration = Math.max(this.duration, time)
    
    return this
  }

  removeKeyframe(index) {
    this.keyframes.splice(index, 1)
    this.recalculateDuration()
    return this
  }

  clearKeyframes() {
    this.keyframes = []
    this.duration = 0
    this.currentTime = 0
    return this
  }

  recalculateDuration() {
    this.duration = this.keyframes.reduce((max, kf) => Math.max(max, kf.time), 0)
  }

  play() {
    this.playing = true
    return this
  }

  pause() {
    this.playing = false
    return this
  }

  stop() {
    this.playing = false
    this.currentTime = 0
    this.currentKeyframe = 0
    return this
  }

  seek(time) {
    this.currentTime = THREE.MathUtils.clamp(time, 0, this.duration)
    this.updateCamera()
    return this
  }

  ease(t, type) {
    switch (type) {
      case 'easeIn':
        return t * t
      case 'easeOut':
        return t * (2 - t)
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      case 'linear':
      default:
        return t
    }
  }

  update(deltaTime) {
    if (!this.enabled || !this.playing || this.keyframes.length < 2) {
      return this
    }
    
    this.currentTime += deltaTime * this.speed
    
    if (this.currentTime >= this.duration) {
      if (this.loop) {
        this.currentTime = this.currentTime % this.duration
        this.currentKeyframe = 0
      } else {
        this.currentTime = this.duration
        this.playing = false
        if (this.onComplete) {
          this.onComplete()
        }
        return this
      }
    }
    
    this.updateCamera()
    
    return this
  }

  updateCamera() {
    let startKF = this.keyframes[0]
    let endKF = this.keyframes[1]
    
    for (let i = 0; i < this.keyframes.length - 1; i++) {
      if (this.currentTime >= this.keyframes[i].time && this.currentTime <= this.keyframes[i + 1].time) {
        startKF = this.keyframes[i]
        endKF = this.keyframes[i + 1]
        
        if (i !== this.currentKeyframe) {
          this.currentKeyframe = i
          if (this.onKeyframe) {
            this.onKeyframe(i, startKF)
          }
        }
        break
      }
    }
    
    const segmentDuration = endKF.time - startKF.time
    const localTime = this.currentTime - startKF.time
    const t = segmentDuration > 0 ? localTime / segmentDuration : 1
    const easedT = this.ease(t, endKF.easing)
    
    this.camera.position.lerpVectors(startKF.position, endKF.position, easedT)
    
    const lookAtPosition = new THREE.Vector3().lerpVectors(startKF.lookAt, endKF.lookAt, easedT)
    this.camera.lookAt(lookAtPosition)
  }

  getProgress() {
    return this.duration > 0 ? this.currentTime / this.duration : 0
  }

  isPlaying() {
    return this.playing
  }

  getCurrentTime() {
    return this.currentTime
  }

  getDuration() {
    return this.duration
  }
}
