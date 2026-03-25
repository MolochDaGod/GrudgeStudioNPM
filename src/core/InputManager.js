export class InputManager {
  constructor() {
    this.keys = {}
    this.keysJustPressed = {}
    this.mouse = { x: 0, y: 0, dx: 0, dy: 0 }
    this.mouseButtons = { left: false, right: false }
    this.isPointerLocked = false
    this.tabTargetPressed = false
    this.cameraModePressed = null
    
    this.bindEvents()
  }
  
  bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.keysJustPressed[e.code] = true
      }
      this.keys[e.code] = true
      
      if (e.code === 'Tab') {
        e.preventDefault()
        this.tabTargetPressed = true
      }
      
      if (!e.repeat) {
        if (e.code === 'F1') { e.preventDefault(); this.cameraModePressed = 0 }
        if (e.code === 'F2') { e.preventDefault(); this.cameraModePressed = 1 }
        if (e.code === 'F3') { e.preventDefault(); this.cameraModePressed = 2 }
        if (e.code === 'F4') { e.preventDefault(); this.cameraModePressed = 3 }
        if (e.code === 'F5') { e.preventDefault(); this.cameraModePressed = 4 }
        if (e.code === 'F6') { e.preventDefault(); this.cameraModePressed = 5 }
      }
    })
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
      this.keysJustPressed[e.code] = false
    })
    
    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouse.dx = e.movementX
        this.mouse.dy = e.movementY
      }
      this.mouse.x = e.clientX
      this.mouse.y = e.clientY
    })
    
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseButtons.left = true
      if (e.button === 2) this.mouseButtons.right = true
    })
    
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseButtons.left = false
      if (e.button === 2) this.mouseButtons.right = false
    })
    
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null
    })
    
    document.addEventListener('contextmenu', (e) => e.preventDefault())
  }
  
  requestPointerLock(element) {
    element.requestPointerLock()
  }
  
  exitPointerLock() {
    document.exitPointerLock()
  }
  
  isKeyDown(code) {
    return this.keys[code] === true
  }
  
  getMovementVector() {
    let x = 0, z = 0
    
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) z -= 1
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) z += 1
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1
    
    const length = Math.sqrt(x * x + z * z)
    if (length > 0) {
      x /= length
      z /= length
    }
    
    return { x, z }
  }
  
  consumeMouseDelta() {
    const delta = { x: this.mouse.dx, y: this.mouse.dy }
    this.mouse.dx = 0
    this.mouse.dy = 0
    return delta
  }
  
  isJumpPressed() {
    return this.isKeyDown('Space')
  }
  
  isLightAttack() {
    return this.mouseButtons.left
  }
  
  isHeavyAttack() {
    return this.mouseButtons.right
  }
  
  isSpecialAttack() {
    return this.isKeyDown('KeyQ')
  }
  
  isRunning() {
    return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight')
  }
  
  isForward() {
    return this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')
  }
  
  isBackward() {
    return this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')
  }
  
  isLeft() {
    return this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')
  }
  
  isRight() {
    return this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')
  }
  
  isTabTargetPressed() {
    const wasPressed = this.tabTargetPressed
    this.tabTargetPressed = false
    return wasPressed
  }
  
  getCameraModePressed() {
    const mode = this.cameraModePressed
    this.cameraModePressed = null
    return mode
  }
  
  update() {
    Object.keys(this.keysJustPressed).forEach(key => {
      this.keysJustPressed[key] = false
    })
  }
}
