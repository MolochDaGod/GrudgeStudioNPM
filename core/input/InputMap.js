export class InputAction {
  constructor(name, bindings = []) {
    this.name = name
    this.bindings = bindings
    this.value = 0
    this.pressed = false
    this.released = false
  }

  addBinding(binding) {
    this.bindings.push(binding)
    return this
  }

  removeBinding(binding) {
    this.bindings = this.bindings.filter(b => b !== binding)
    return this
  }

  clearBindings() {
    this.bindings = []
    return this
  }
}

export class InputMap {
  constructor(inputManager) {
    this.input = inputManager
    this.actions = new Map()
    this.axes = new Map()
  }

  addAction(name, bindings = []) {
    const action = new InputAction(name, bindings)
    this.actions.set(name, action)
    return action
  }

  removeAction(name) {
    this.actions.delete(name)
    return this
  }

  getAction(name) {
    return this.actions.get(name)
  }

  addAxis(name, negative, positive) {
    this.axes.set(name, { negative, positive, value: 0 })
    return this
  }

  removeAxis(name) {
    this.axes.delete(name)
    return this
  }

  getAxis(name) {
    const axis = this.axes.get(name)
    return axis?.value ?? 0
  }

  update() {
    for (const action of this.actions.values()) {
      action.pressed = false
      action.released = false
      action.value = 0

      for (const binding of action.bindings) {
        if (binding.type === 'key') {
          if (this.input.isKeyDown(binding.code)) {
            action.value = 1
          }
          if (this.input.isKeyPressed(binding.code)) {
            action.pressed = true
          }
          if (this.input.isKeyReleased(binding.code)) {
            action.released = true
          }
        } else if (binding.type === 'mouse') {
          if (this.input.isMouseDown(binding.button)) {
            action.value = 1
          }
          if (this.input.isMousePressed(binding.button)) {
            action.pressed = true
          }
          if (this.input.isMouseReleased(binding.button)) {
            action.released = true
          }
        }
      }
    }

    for (const [name, axis] of this.axes) {
      axis.value = 0
      
      for (const binding of axis.negative) {
        if (binding.type === 'key' && this.input.isKeyDown(binding.code)) {
          axis.value -= 1
        }
      }
      
      for (const binding of axis.positive) {
        if (binding.type === 'key' && this.input.isKeyDown(binding.code)) {
          axis.value += 1
        }
      }
    }
  }

  isActionDown(name) {
    return this.actions.get(name)?.value > 0
  }

  isActionPressed(name) {
    return this.actions.get(name)?.pressed ?? false
  }

  isActionReleased(name) {
    return this.actions.get(name)?.released ?? false
  }

  getActionValue(name) {
    return this.actions.get(name)?.value ?? 0
  }

  static key(code) {
    return { type: 'key', code }
  }

  static mouse(button) {
    return { type: 'mouse', button }
  }

  static gamepadButton(button) {
    return { type: 'gamepadButton', button }
  }

  static gamepadAxis(axis, direction = 1) {
    return { type: 'gamepadAxis', axis, direction }
  }
}
