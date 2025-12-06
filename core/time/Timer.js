export class Timer {
  constructor(duration, callback, repeat = false) {
    this.duration = duration
    this.callback = callback
    this.repeat = repeat
    this.elapsed = 0
    this.running = true
    this.completed = false
    this.paused = false
    this.onComplete = null
    this.onUpdate = null
  }

  update(deltaTime) {
    if (!this.running || this.paused || this.completed) {
      return false
    }

    this.elapsed += deltaTime

    if (this.onUpdate) {
      this.onUpdate(this.getProgress(), this.elapsed)
    }

    if (this.elapsed >= this.duration) {
      if (this.callback) {
        this.callback()
      }

      if (this.repeat) {
        this.elapsed = this.elapsed % this.duration
      } else {
        this.completed = true
        this.running = false
        if (this.onComplete) {
          this.onComplete()
        }
      }
      return true
    }

    return false
  }

  start() {
    this.running = true
    this.paused = false
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

  reset() {
    this.elapsed = 0
    this.completed = false
    this.running = true
    this.paused = false
    return this
  }

  getProgress() {
    return Math.min(1, this.elapsed / this.duration)
  }

  getRemaining() {
    return Math.max(0, this.duration - this.elapsed)
  }

  isComplete() {
    return this.completed
  }

  isRunning() {
    return this.running && !this.paused
  }
}

export class TimerManager {
  constructor() {
    this.timers = new Set()
  }

  create(duration, callback, repeat = false) {
    const timer = new Timer(duration, callback, repeat)
    this.timers.add(timer)
    return timer
  }

  delay(duration, callback) {
    return this.create(duration, callback, false)
  }

  interval(duration, callback) {
    return this.create(duration, callback, true)
  }

  remove(timer) {
    this.timers.delete(timer)
    return this
  }

  update(deltaTime) {
    for (const timer of this.timers) {
      timer.update(deltaTime)
      if (timer.completed && !timer.repeat) {
        this.timers.delete(timer)
      }
    }
  }

  clear() {
    this.timers.clear()
    return this
  }

  pauseAll() {
    for (const timer of this.timers) {
      timer.pause()
    }
    return this
  }

  resumeAll() {
    for (const timer of this.timers) {
      timer.resume()
    }
    return this
  }

  getActiveCount() {
    let count = 0
    for (const timer of this.timers) {
      if (timer.isRunning()) count++
    }
    return count
  }
}
