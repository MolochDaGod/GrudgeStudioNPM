export class Clock {
  constructor(autoStart = true) {
    this.autoStart = autoStart
    this.startTime = 0
    this.oldTime = 0
    this.elapsedTime = 0
    this.running = false
    this.timeScale = 1
    this.deltaTime = 0
    this.fixedDeltaTime = 1 / 60
    this.maxDeltaTime = 0.1
    this.frameCount = 0
    this.fps = 0
    this.fpsUpdateInterval = 1
    this.lastFpsUpdate = 0
    this.framesSinceLastFps = 0
  }

  start() {
    this.startTime = performance.now()
    this.oldTime = this.startTime
    this.elapsedTime = 0
    this.running = true
    this.frameCount = 0
  }

  stop() {
    this.getElapsedTime()
    this.running = false
  }

  getElapsedTime() {
    this.getDelta()
    return this.elapsedTime
  }

  getDelta() {
    if (this.autoStart && !this.running) {
      this.start()
      return 0
    }

    if (!this.running) {
      return 0
    }

    const now = performance.now()
    let diff = (now - this.oldTime) / 1000
    
    diff = Math.min(diff, this.maxDeltaTime)
    diff *= this.timeScale

    this.oldTime = now
    this.elapsedTime += diff
    this.deltaTime = diff
    this.frameCount++
    this.framesSinceLastFps++

    if (this.elapsedTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = this.framesSinceLastFps / (this.elapsedTime - this.lastFpsUpdate)
      this.lastFpsUpdate = this.elapsedTime
      this.framesSinceLastFps = 0
    }

    return diff
  }

  reset() {
    this.startTime = performance.now()
    this.oldTime = this.startTime
    this.elapsedTime = 0
    this.frameCount = 0
    this.fps = 0
    this.lastFpsUpdate = 0
    this.framesSinceLastFps = 0
  }

  setTimeScale(scale) {
    this.timeScale = Math.max(0, scale)
    return this
  }

  pause() {
    this.running = false
    return this
  }

  resume() {
    if (!this.running) {
      this.oldTime = performance.now()
      this.running = true
    }
    return this
  }

  isPaused() {
    return !this.running
  }

  getFPS() {
    return Math.round(this.fps)
  }

  getFrameCount() {
    return this.frameCount
  }
}
