import { EventEmitter } from '../events/EventEmitter.js'
import { Vec2 } from '../math/Vec2.js'

export class InputManager extends EventEmitter {
  constructor(element = document) {
    super()
    this.element = element
    this.enabled = true
    
    this.keys = new Map()
    this.keysPressed = new Set()
    this.keysReleased = new Set()
    
    this.mouse = {
      position: new Vec2(),
      delta: new Vec2(),
      wheel: 0,
      buttons: new Map(),
      buttonsPressed: new Set(),
      buttonsReleased: new Set()
    }
    
    this.pointerLocked = false
    this.touches = new Map()
    
    this.bindings = new Map()
    this.axes = new Map()
    
    this.bindEvents()
  }

  bindEvents() {
    this.onKeyDown = this.handleKeyDown.bind(this)
    this.onKeyUp = this.handleKeyUp.bind(this)
    this.onMouseMove = this.handleMouseMove.bind(this)
    this.onMouseDown = this.handleMouseDown.bind(this)
    this.onMouseUp = this.handleMouseUp.bind(this)
    this.onWheel = this.handleWheel.bind(this)
    this.onContextMenu = (e) => e.preventDefault()
    this.onPointerLockChange = this.handlePointerLockChange.bind(this)
    this.onTouchStart = this.handleTouchStart.bind(this)
    this.onTouchMove = this.handleTouchMove.bind(this)
    this.onTouchEnd = this.handleTouchEnd.bind(this)

    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
    this.element.addEventListener('mousemove', this.onMouseMove)
    this.element.addEventListener('mousedown', this.onMouseDown)
    this.element.addEventListener('mouseup', this.onMouseUp)
    this.element.addEventListener('wheel', this.onWheel)
    this.element.addEventListener('contextmenu', this.onContextMenu)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
    this.element.addEventListener('touchstart', this.onTouchStart, { passive: false })
    this.element.addEventListener('touchmove', this.onTouchMove, { passive: false })
    this.element.addEventListener('touchend', this.onTouchEnd)
    this.element.addEventListener('touchcancel', this.onTouchEnd)
  }

  unbindEvents() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
    this.element.removeEventListener('mousemove', this.onMouseMove)
    this.element.removeEventListener('mousedown', this.onMouseDown)
    this.element.removeEventListener('mouseup', this.onMouseUp)
    this.element.removeEventListener('wheel', this.onWheel)
    this.element.removeEventListener('contextmenu', this.onContextMenu)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
    this.element.removeEventListener('touchstart', this.onTouchStart)
    this.element.removeEventListener('touchmove', this.onTouchMove)
    this.element.removeEventListener('touchend', this.onTouchEnd)
    this.element.removeEventListener('touchcancel', this.onTouchEnd)
  }

  handleKeyDown(e) {
    if (!this.enabled) return
    const code = e.code
    if (!this.keys.get(code)) {
      this.keysPressed.add(code)
      this.emit('keydown', code, e)
    }
    this.keys.set(code, true)
  }

  handleKeyUp(e) {
    if (!this.enabled) return
    const code = e.code
    this.keys.set(code, false)
    this.keysReleased.add(code)
    this.emit('keyup', code, e)
  }

  handleMouseMove(e) {
    if (!this.enabled) return
    if (this.pointerLocked) {
      this.mouse.delta.x = e.movementX
      this.mouse.delta.y = e.movementY
    } else {
      this.mouse.delta.x = e.clientX - this.mouse.position.x
      this.mouse.delta.y = e.clientY - this.mouse.position.y
    }
    this.mouse.position.set(e.clientX, e.clientY)
    this.emit('mousemove', this.mouse.position, this.mouse.delta, e)
  }

  handleMouseDown(e) {
    if (!this.enabled) return
    this.mouse.buttons.set(e.button, true)
    this.mouse.buttonsPressed.add(e.button)
    this.emit('mousedown', e.button, this.mouse.position, e)
  }

  handleMouseUp(e) {
    if (!this.enabled) return
    this.mouse.buttons.set(e.button, false)
    this.mouse.buttonsReleased.add(e.button)
    this.emit('mouseup', e.button, this.mouse.position, e)
  }

  handleWheel(e) {
    if (!this.enabled) return
    this.mouse.wheel = e.deltaY
    this.emit('wheel', e.deltaY, e)
  }

  handlePointerLockChange() {
    this.pointerLocked = document.pointerLockElement === this.element
    this.emit('pointerlockchange', this.pointerLocked)
  }

  handleTouchStart(e) {
    if (!this.enabled) return
    e.preventDefault()
    for (const touch of e.changedTouches) {
      this.touches.set(touch.identifier, new Vec2(touch.clientX, touch.clientY))
    }
    this.emit('touchstart', this.touches, e)
  }

  handleTouchMove(e) {
    if (!this.enabled) return
    e.preventDefault()
    for (const touch of e.changedTouches) {
      if (this.touches.has(touch.identifier)) {
        this.touches.get(touch.identifier).set(touch.clientX, touch.clientY)
      }
    }
    this.emit('touchmove', this.touches, e)
  }

  handleTouchEnd(e) {
    if (!this.enabled) return
    for (const touch of e.changedTouches) {
      this.touches.delete(touch.identifier)
    }
    this.emit('touchend', this.touches, e)
  }

  update() {
    this.keysPressed.clear()
    this.keysReleased.clear()
    this.mouse.buttonsPressed.clear()
    this.mouse.buttonsReleased.clear()
    this.mouse.delta.set(0, 0)
    this.mouse.wheel = 0
  }

  isKeyDown(code) {
    return this.keys.get(code) === true
  }

  isKeyPressed(code) {
    return this.keysPressed.has(code)
  }

  isKeyReleased(code) {
    return this.keysReleased.has(code)
  }

  isMouseDown(button = 0) {
    return this.mouse.buttons.get(button) === true
  }

  isMousePressed(button = 0) {
    return this.mouse.buttonsPressed.has(button)
  }

  isMouseReleased(button = 0) {
    return this.mouse.buttonsReleased.has(button)
  }

  getMousePosition() {
    return this.mouse.position.clone()
  }

  getMouseDelta() {
    return this.mouse.delta.clone()
  }

  getMouseWheel() {
    return this.mouse.wheel
  }

  requestPointerLock() {
    this.element.requestPointerLock()
  }

  exitPointerLock() {
    document.exitPointerLock()
  }

  isPointerLocked() {
    return this.pointerLocked
  }

  getAxis(negative, positive) {
    let value = 0
    if (this.isKeyDown(negative)) value -= 1
    if (this.isKeyDown(positive)) value += 1
    return value
  }

  getMovementVector() {
    return new Vec2(
      this.getAxis('KeyA', 'KeyD') || this.getAxis('ArrowLeft', 'ArrowRight'),
      this.getAxis('KeyW', 'KeyS') || this.getAxis('ArrowUp', 'ArrowDown')
    )
  }

  dispose() {
    this.unbindEvents()
    this.removeAllListeners()
    this.keys.clear()
    this.mouse.buttons.clear()
    this.touches.clear()
  }
}
