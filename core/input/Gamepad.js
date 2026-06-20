import { EventEmitter } from '../events/EventEmitter.js'

export class Gamepad extends EventEmitter {
  constructor() {
    super()
    this.gamepads = new Map()
    this.deadzone = 0.1
    this.previousStates = new Map()
    
    this.bindEvents()
  }

  bindEvents() {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepads.set(e.gamepad.index, e.gamepad)
      this.previousStates.set(e.gamepad.index, this.captureState(e.gamepad))
      this.emit('connected', e.gamepad.index, e.gamepad)
    })

    window.addEventListener('gamepaddisconnected', (e) => {
      this.gamepads.delete(e.gamepad.index)
      this.previousStates.delete(e.gamepad.index)
      this.emit('disconnected', e.gamepad.index)
    })
  }

  captureState(gamepad) {
    return {
      buttons: gamepad.buttons.map(b => b.pressed),
      axes: [...gamepad.axes]
    }
  }

  update() {
    const gamepads = navigator.getGamepads()
    for (const gamepad of gamepads) {
      if (gamepad) {
        this.gamepads.set(gamepad.index, gamepad)
        
        const prevState = this.previousStates.get(gamepad.index)
        if (prevState) {
          for (let i = 0; i < gamepad.buttons.length; i++) {
            const wasPressed = prevState.buttons[i]
            const isPressed = gamepad.buttons[i].pressed
            if (!wasPressed && isPressed) {
              this.emit('buttondown', gamepad.index, i)
            } else if (wasPressed && !isPressed) {
              this.emit('buttonup', gamepad.index, i)
            }
          }
        }
        
        this.previousStates.set(gamepad.index, this.captureState(gamepad))
      }
    }
  }

  getGamepad(index = 0) {
    return this.gamepads.get(index)
  }

  isConnected(index = 0) {
    return this.gamepads.has(index)
  }

  isButtonDown(button, index = 0) {
    const gamepad = this.gamepads.get(index)
    return gamepad?.buttons[button]?.pressed ?? false
  }

  isButtonPressed(button, index = 0) {
    const gamepad = this.gamepads.get(index)
    const prevState = this.previousStates.get(index)
    if (!gamepad || !prevState) return false
    return gamepad.buttons[button]?.pressed && !prevState.buttons[button]
  }

  getButton(button, index = 0) {
    const gamepad = this.gamepads.get(index)
    return gamepad?.buttons[button]?.value ?? 0
  }

  getAxis(axis, index = 0) {
    const gamepad = this.gamepads.get(index)
    const value = gamepad?.axes[axis] ?? 0
    return Math.abs(value) < this.deadzone ? 0 : value
  }

  getLeftStick(index = 0) {
    return {
      x: this.getAxis(0, index),
      y: this.getAxis(1, index)
    }
  }

  getRightStick(index = 0) {
    return {
      x: this.getAxis(2, index),
      y: this.getAxis(3, index)
    }
  }

  getLeftTrigger(index = 0) {
    return this.getButton(6, index)
  }

  getRightTrigger(index = 0) {
    return this.getButton(7, index)
  }

  vibrate(duration = 200, weakMagnitude = 0.5, strongMagnitude = 0.5, index = 0) {
    const gamepad = this.gamepads.get(index)
    if (gamepad?.vibrationActuator) {
      gamepad.vibrationActuator.playEffect('dual-rumble', {
        duration,
        weakMagnitude,
        strongMagnitude
      })
    }
  }

  setDeadzone(value) {
    this.deadzone = value
    return this
  }
}
