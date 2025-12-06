import * as THREE from 'three'

export class AnimationController {
  constructor(mixer) {
    this.mixer = mixer
    this.clips = new Map()
    this.actions = new Map()
    this.currentAction = null
    this.previousAction = null
    this.crossFadeDuration = 0.25
    this.timeScale = 1
  }

  static fromModel(model) {
    const mixer = new THREE.AnimationMixer(model)
    return new AnimationController(mixer)
  }

  addClip(name, clip) {
    this.clips.set(name, clip)
    const action = this.mixer.clipAction(clip)
    this.actions.set(name, action)
    return this
  }

  addClips(clips) {
    for (const clip of clips) {
      this.addClip(clip.name, clip)
    }
    return this
  }

  getClip(name) {
    return this.clips.get(name)
  }

  getAction(name) {
    return this.actions.get(name)
  }

  play(name, options = {}) {
    const action = this.actions.get(name)
    if (!action) {
      console.warn(`Animation "${name}" not found`)
      return this
    }

    const {
      loop = THREE.LoopRepeat,
      clampWhenFinished = false,
      timeScale = 1,
      weight = 1,
      crossFade = true,
      fadeOutDuration = this.crossFadeDuration,
      fadeInDuration = this.crossFadeDuration
    } = options

    action.setLoop(loop)
    action.clampWhenFinished = clampWhenFinished
    action.timeScale = timeScale * this.timeScale
    action.setEffectiveWeight(weight)

    if (this.currentAction && this.currentAction !== action) {
      this.previousAction = this.currentAction
      
      if (crossFade) {
        action.reset()
        action.play()
        this.currentAction.crossFadeTo(action, fadeInDuration, true)
      } else {
        this.currentAction.fadeOut(fadeOutDuration)
        action.reset()
        action.fadeIn(fadeInDuration)
        action.play()
      }
    } else {
      action.reset()
      action.fadeIn(fadeInDuration)
      action.play()
    }

    this.currentAction = action
    return this
  }

  playOnce(name, options = {}) {
    return this.play(name, {
      ...options,
      loop: THREE.LoopOnce,
      clampWhenFinished: true
    })
  }

  stop(name) {
    if (name) {
      const action = this.actions.get(name)
      if (action) {
        action.stop()
      }
    } else {
      this.mixer.stopAllAction()
      this.currentAction = null
    }
    return this
  }

  pause(name) {
    if (name) {
      const action = this.actions.get(name)
      if (action) {
        action.paused = true
      }
    } else if (this.currentAction) {
      this.currentAction.paused = true
    }
    return this
  }

  resume(name) {
    if (name) {
      const action = this.actions.get(name)
      if (action) {
        action.paused = false
      }
    } else if (this.currentAction) {
      this.currentAction.paused = false
    }
    return this
  }

  fadeIn(name, duration = this.crossFadeDuration) {
    const action = this.actions.get(name)
    if (action) {
      action.reset()
      action.fadeIn(duration)
      action.play()
    }
    return this
  }

  fadeOut(name, duration = this.crossFadeDuration) {
    const action = name ? this.actions.get(name) : this.currentAction
    if (action) {
      action.fadeOut(duration)
    }
    return this
  }

  crossFadeTo(name, duration = this.crossFadeDuration) {
    const action = this.actions.get(name)
    if (action && this.currentAction) {
      this.currentAction.crossFadeTo(action, duration, true)
      this.previousAction = this.currentAction
      this.currentAction = action
    }
    return this
  }

  setTimeScale(scale, name) {
    if (name) {
      const action = this.actions.get(name)
      if (action) {
        action.timeScale = scale
      }
    } else {
      this.timeScale = scale
      for (const action of this.actions.values()) {
        action.timeScale = scale
      }
    }
    return this
  }

  setWeight(name, weight) {
    const action = this.actions.get(name)
    if (action) {
      action.setEffectiveWeight(weight)
    }
    return this
  }

  getTime(name) {
    const action = name ? this.actions.get(name) : this.currentAction
    return action ? action.time : 0
  }

  setTime(time, name) {
    const action = name ? this.actions.get(name) : this.currentAction
    if (action) {
      action.time = time
    }
    return this
  }

  getDuration(name) {
    const clip = this.clips.get(name)
    return clip ? clip.duration : 0
  }

  isPlaying(name) {
    const action = name ? this.actions.get(name) : this.currentAction
    return action ? action.isRunning() : false
  }

  getCurrentName() {
    for (const [name, action] of this.actions) {
      if (action === this.currentAction) {
        return name
      }
    }
    return null
  }

  update(deltaTime) {
    this.mixer.update(deltaTime)
    return this
  }

  onFinished(callback) {
    this.mixer.addEventListener('finished', (e) => {
      for (const [name, action] of this.actions) {
        if (action === e.action) {
          callback(name, e.action)
          break
        }
      }
    })
    return this
  }

  dispose() {
    this.mixer.stopAllAction()
    this.clips.clear()
    this.actions.clear()
  }
}
