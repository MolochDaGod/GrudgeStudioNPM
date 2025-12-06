export class State {
  constructor(name) {
    this.name = name
    this.machine = null
  }

  onEnter(prevState, data) {}
  onExit(nextState) {}
  onUpdate(deltaTime) {}

  transition(stateName, data) {
    if (this.machine) {
      this.machine.transition(stateName, data)
    }
  }

  getData(key) {
    return this.machine?.getData(key)
  }

  setData(key, value) {
    this.machine?.setData(key, value)
  }
}

export class StateMachine {
  constructor(owner = null) {
    this.owner = owner
    this.states = new Map()
    this.currentState = null
    this.previousState = null
    this.data = new Map()
    this.history = []
    this.maxHistory = 10
    this.listeners = {
      enter: [],
      exit: [],
      transition: []
    }
  }

  addState(state) {
    if (typeof state === 'string') {
      state = new State(state)
    }
    state.machine = this
    this.states.set(state.name, state)
    return this
  }

  addStates(states) {
    for (const state of states) {
      this.addState(state)
    }
    return this
  }

  removeState(name) {
    const state = this.states.get(name)
    if (state) {
      state.machine = null
      this.states.delete(name)
    }
    return this
  }

  hasState(name) {
    return this.states.has(name)
  }

  getState(name) {
    return this.states.get(name)
  }

  getCurrentState() {
    return this.currentState
  }

  getCurrentStateName() {
    return this.currentState?.name || null
  }

  getPreviousState() {
    return this.previousState
  }

  start(stateName, data) {
    const state = this.states.get(stateName)
    if (!state) {
      console.warn(`State "${stateName}" not found`)
      return false
    }

    this.currentState = state
    this.emit('enter', state, null, data)
    state.onEnter(null, data)
    return true
  }

  transition(stateName, data) {
    if (this.currentState?.name === stateName) {
      return false
    }

    const nextState = this.states.get(stateName)
    if (!nextState) {
      console.warn(`State "${stateName}" not found`)
      return false
    }

    const prevState = this.currentState

    if (prevState) {
      this.emit('exit', prevState, nextState)
      prevState.onExit(nextState)
      
      this.history.push(prevState.name)
      if (this.history.length > this.maxHistory) {
        this.history.shift()
      }
    }

    this.previousState = prevState
    this.currentState = nextState

    this.emit('transition', prevState, nextState, data)
    this.emit('enter', nextState, prevState, data)
    nextState.onEnter(prevState, data)

    return true
  }

  update(deltaTime) {
    if (this.currentState) {
      this.currentState.onUpdate(deltaTime)
    }
  }

  goBack(data) {
    if (this.history.length > 0) {
      const prevStateName = this.history.pop()
      return this.transition(prevStateName, data)
    }
    return false
  }

  reset(stateName, data) {
    this.history = []
    this.previousState = null
    
    if (this.currentState) {
      this.emit('exit', this.currentState, null)
      this.currentState.onExit(null)
    }
    
    this.currentState = null
    
    if (stateName) {
      return this.start(stateName, data)
    }
    return true
  }

  getData(key) {
    return this.data.get(key)
  }

  setData(key, value) {
    this.data.set(key, value)
    return this
  }

  clearData() {
    this.data.clear()
    return this
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback)
    }
    return () => this.off(event, callback)
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
    return this
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      for (const callback of this.listeners[event]) {
        try {
          callback(...args)
        } catch (e) {
          console.error(`StateMachine event error:`, e)
        }
      }
    }
  }

  isIn(stateName) {
    return this.currentState?.name === stateName
  }

  isAny(...stateNames) {
    return stateNames.includes(this.currentState?.name)
  }

  canTransitionTo(stateName) {
    return this.states.has(stateName) && this.currentState?.name !== stateName
  }

  getHistory() {
    return [...this.history]
  }

  getStateNames() {
    return Array.from(this.states.keys())
  }
}
