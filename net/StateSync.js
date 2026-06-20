export class StateSync {
  constructor(networkManager, options = {}) {
    this.network = networkManager
    this.syncRate = options.syncRate ?? 1000 / 20
    this.interpolationDelay = options.interpolationDelay ?? 100
    
    this.localState = new Map()
    this.remoteStates = new Map()
    this.stateHistory = new Map()
    this.historyLimit = options.historyLimit ?? 60
    
    this.lastSyncTime = 0
    this.syncInterval = null
    
    this.onStateUpdate = null
    this.onRemoteUpdate = null
    
    this.dirty = new Set()
    this.authoritative = new Set()
    
    this.setupNetworkHandlers()
  }

  setupNetworkHandlers() {
    this.network.on('stateUpdate', (data) => {
      this.handleRemoteStateUpdate(data)
    })
    
    this.network.on('stateSnapshot', (data) => {
      this.handleSnapshot(data)
    })
    
    this.network.on('stateDelta', (data) => {
      this.handleDelta(data)
    })
  }

  registerEntity(entityId, initialState = {}, isAuthoritative = false) {
    this.localState.set(entityId, {
      ...initialState,
      _lastUpdate: Date.now()
    })
    
    this.stateHistory.set(entityId, [])
    
    if (isAuthoritative) {
      this.authoritative.add(entityId)
    }
    
    return this
  }

  unregisterEntity(entityId) {
    this.localState.delete(entityId)
    this.remoteStates.delete(entityId)
    this.stateHistory.delete(entityId)
    this.authoritative.delete(entityId)
    this.dirty.delete(entityId)
  }

  setState(entityId, state, sync = true) {
    const current = this.localState.get(entityId) || {}
    
    this.localState.set(entityId, {
      ...current,
      ...state,
      _lastUpdate: Date.now()
    })
    
    if (sync) {
      this.dirty.add(entityId)
    }
    
    if (this.onStateUpdate) {
      this.onStateUpdate(entityId, this.localState.get(entityId))
    }
    
    return this
  }

  getState(entityId) {
    return this.localState.get(entityId)
  }

  getRemoteState(entityId) {
    return this.remoteStates.get(entityId)
  }

  getInterpolatedState(entityId, properties = []) {
    const history = this.stateHistory.get(entityId)
    if (!history || history.length < 2) {
      return this.remoteStates.get(entityId)
    }
    
    const renderTime = this.network.getServerTime() - this.interpolationDelay
    
    let before = null
    let after = null
    
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i].timestamp <= renderTime && history[i + 1].timestamp >= renderTime) {
        before = history[i]
        after = history[i + 1]
        break
      }
    }
    
    if (!before || !after) {
      return history[history.length - 1]?.state || this.remoteStates.get(entityId)
    }
    
    const t = (renderTime - before.timestamp) / (after.timestamp - before.timestamp)
    
    const interpolated = { ...after.state }
    
    for (const prop of properties) {
      if (typeof before.state[prop] === 'number' && typeof after.state[prop] === 'number') {
        interpolated[prop] = before.state[prop] + (after.state[prop] - before.state[prop]) * t
      }
    }
    
    return interpolated
  }

  handleRemoteStateUpdate(data) {
    const { entityId, state, timestamp, playerId } = data
    
    if (playerId === this.network.getPlayerId() && !this.authoritative.has(entityId)) {
      return
    }
    
    this.remoteStates.set(entityId, state)
    
    let history = this.stateHistory.get(entityId)
    if (!history) {
      history = []
      this.stateHistory.set(entityId, history)
    }
    
    history.push({ state, timestamp })
    
    while (history.length > this.historyLimit) {
      history.shift()
    }
    
    if (this.onRemoteUpdate) {
      this.onRemoteUpdate(entityId, state, playerId)
    }
  }

  handleSnapshot(data) {
    for (const [entityId, state] of Object.entries(data.states)) {
      this.remoteStates.set(entityId, state)
    }
  }

  handleDelta(data) {
    for (const { entityId, changes } of data.deltas) {
      const current = this.remoteStates.get(entityId) || {}
      this.remoteStates.set(entityId, { ...current, ...changes })
    }
  }

  startSync() {
    if (this.syncInterval) return
    
    this.syncInterval = setInterval(() => {
      this.sync()
    }, this.syncRate)
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  sync() {
    if (this.dirty.size === 0) return
    
    const updates = []
    
    for (const entityId of this.dirty) {
      const state = this.localState.get(entityId)
      if (state) {
        updates.push({
          entityId,
          state: this.serializeState(state),
          timestamp: this.network.getServerTime()
        })
      }
    }
    
    this.dirty.clear()
    
    if (updates.length > 0) {
      this.network.send('stateUpdate', { updates })
    }
  }

  serializeState(state) {
    const serialized = {}
    
    for (const [key, value] of Object.entries(state)) {
      if (key.startsWith('_')) continue
      
      if (typeof value === 'object' && value !== null) {
        if (value.x !== undefined && value.y !== undefined) {
          serialized[key] = value.z !== undefined 
            ? { x: value.x, y: value.y, z: value.z }
            : { x: value.x, y: value.y }
        } else {
          serialized[key] = value
        }
      } else {
        serialized[key] = value
      }
    }
    
    return serialized
  }

  forceSync(entityId) {
    if (entityId) {
      this.dirty.add(entityId)
    } else {
      for (const id of this.localState.keys()) {
        this.dirty.add(id)
      }
    }
    this.sync()
  }

  getEntityIds() {
    return Array.from(new Set([...this.localState.keys(), ...this.remoteStates.keys()]))
  }

  clear() {
    this.localState.clear()
    this.remoteStates.clear()
    this.stateHistory.clear()
    this.dirty.clear()
    this.authoritative.clear()
  }
}
