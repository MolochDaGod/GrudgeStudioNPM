import { Easing, ease } from '../math/easing.js'

export class Tween {
  constructor(target) {
    this.target = target
    this.properties = new Map()
    this.duration = 1
    this.elapsed = 0
    this.delay = 0
    this.delayElapsed = 0
    this.easing = 'linear'
    this.running = false
    this.completed = false
    this.paused = false
    this.repeatCount = 0
    this.repeatCurrent = 0
    this.yoyo = false
    this.reversed = false
    
    this.onStartCallback = null
    this.onUpdateCallback = null
    this.onCompleteCallback = null
    this.onRepeatCallback = null
    
    this.chain = []
    this.started = false
  }

  to(properties, duration) {
    for (const [key, value] of Object.entries(properties)) {
      this.properties.set(key, {
        start: null,
        end: value,
        current: null
      })
    }
    this.duration = duration
    return this
  }

  from(properties) {
    for (const [key, value] of Object.entries(properties)) {
      const prop = this.properties.get(key)
      if (prop) {
        prop.start = value
      }
    }
    return this
  }

  setDuration(duration) {
    this.duration = duration
    return this
  }

  setDelay(delay) {
    this.delay = delay
    return this
  }

  setEasing(easing) {
    this.easing = easing
    return this
  }

  setRepeat(count) {
    this.repeatCount = count
    return this
  }

  setYoyo(yoyo) {
    this.yoyo = yoyo
    return this
  }

  onStart(callback) {
    this.onStartCallback = callback
    return this
  }

  onUpdate(callback) {
    this.onUpdateCallback = callback
    return this
  }

  onComplete(callback) {
    this.onCompleteCallback = callback
    return this
  }

  onRepeat(callback) {
    this.onRepeatCallback = callback
    return this
  }

  then(tween) {
    this.chain.push(tween)
    return this
  }

  start() {
    this.running = true
    this.paused = false
    this.completed = false
    this.elapsed = 0
    this.delayElapsed = 0
    this.repeatCurrent = 0
    this.reversed = false
    this.started = false
    return this
  }

  stop() {
    this.running = false
    this.completed = true
    return this
  }

  pause() {
    this.paused = true
    return this
  }

  resume() {
    this.paused = false
    return this
  }

  update(deltaTime) {
    if (!this.running || this.paused || this.completed) {
      return null
    }

    if (this.delayElapsed < this.delay) {
      this.delayElapsed += deltaTime
      return null
    }

    if (!this.started) {
      this.started = true
      for (const [key, prop] of this.properties) {
        if (prop.start === null) {
          prop.start = this.target[key]
        }
        prop.current = prop.start
      }
      if (this.onStartCallback) {
        this.onStartCallback(this.target)
      }
    }

    this.elapsed += deltaTime
    let progress = Math.min(1, this.elapsed / this.duration)
    
    if (this.reversed) {
      progress = 1 - progress
    }

    const easedProgress = ease(progress, this.easing)

    for (const [key, prop] of this.properties) {
      const value = prop.start + (prop.end - prop.start) * easedProgress
      this.target[key] = value
      prop.current = value
    }

    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.target, progress)
    }

    if (this.elapsed >= this.duration) {
      if (this.repeatCount === -1 || this.repeatCurrent < this.repeatCount) {
        this.repeatCurrent++
        this.elapsed = 0
        
        if (this.yoyo) {
          this.reversed = !this.reversed
        } else {
          for (const [key, prop] of this.properties) {
            prop.current = prop.start
            this.target[key] = prop.start
          }
        }
        
        if (this.onRepeatCallback) {
          this.onRepeatCallback(this.target, this.repeatCurrent)
        }
      } else {
        this.completed = true
        this.running = false
        
        if (this.onCompleteCallback) {
          this.onCompleteCallback(this.target)
        }

        if (this.chain.length > 0) {
          return this.chain.shift()
        }
      }
    }

    return null
  }

  isComplete() {
    return this.completed
  }

  isRunning() {
    return this.running && !this.paused
  }

  getProgress() {
    return Math.min(1, this.elapsed / this.duration)
  }
}

export class TweenManager {
  constructor() {
    this.tweens = new Set()
  }

  create(target) {
    const tween = new Tween(target)
    this.tweens.add(tween)
    return tween
  }

  remove(tween) {
    this.tweens.delete(tween)
    return this
  }

  update(deltaTime) {
    for (const tween of this.tweens) {
      const chainedTween = tween.update(deltaTime)
      
      if (chainedTween) {
        this.tweens.add(chainedTween)
        chainedTween.start()
      }
      
      if (tween.completed) {
        this.tweens.delete(tween)
      }
    }
  }

  clear() {
    this.tweens.clear()
    return this
  }

  pauseAll() {
    for (const tween of this.tweens) {
      tween.pause()
    }
    return this
  }

  resumeAll() {
    for (const tween of this.tweens) {
      tween.resume()
    }
    return this
  }

  killTweensOf(target) {
    for (const tween of this.tweens) {
      if (tween.target === target) {
        this.tweens.delete(tween)
      }
    }
    return this
  }

  getActiveCount() {
    return this.tweens.size
  }
}
