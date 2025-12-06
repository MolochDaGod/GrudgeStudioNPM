export class ClientPrediction {
  constructor(options = {}) {
    this.inputBuffer = []
    this.stateBuffer = []
    this.bufferSize = options.bufferSize ?? 64
    this.sequenceNumber = 0
    
    this.reconcileThreshold = options.reconcileThreshold ?? 0.1
    this.smoothingFactor = options.smoothingFactor ?? 0.1
    
    this.lastServerState = null
    this.lastServerSequence = -1
    
    this.predictedState = null
    this.displayState = null
    
    this.onReconcile = null
  }

  recordInput(input, deltaTime) {
    const record = {
      sequence: this.sequenceNumber++,
      input: { ...input },
      deltaTime,
      timestamp: Date.now()
    }
    
    this.inputBuffer.push(record)
    
    while (this.inputBuffer.length > this.bufferSize) {
      this.inputBuffer.shift()
    }
    
    return record.sequence
  }

  recordState(state, sequence) {
    this.stateBuffer.push({
      state: this.cloneState(state),
      sequence,
      timestamp: Date.now()
    })
    
    while (this.stateBuffer.length > this.bufferSize) {
      this.stateBuffer.shift()
    }
  }

  predict(currentState, input, deltaTime, simulate) {
    const predicted = this.cloneState(currentState)
    simulate(predicted, input, deltaTime)
    this.predictedState = predicted
    return predicted
  }

  reconcile(serverState, serverSequence, simulate) {
    if (serverSequence <= this.lastServerSequence) {
      return null
    }
    
    this.lastServerState = this.cloneState(serverState)
    this.lastServerSequence = serverSequence
    
    const inputIndex = this.inputBuffer.findIndex(i => i.sequence === serverSequence)
    
    if (inputIndex === -1) {
      return serverState
    }
    
    const historicalState = this.stateBuffer.find(s => s.sequence === serverSequence)
    
    if (!historicalState) {
      this.displayState = serverState
      return serverState
    }
    
    const error = this.calculateError(historicalState.state, serverState)
    
    if (error > this.reconcileThreshold) {
      let reconciledState = this.cloneState(serverState)
      
      for (let i = inputIndex + 1; i < this.inputBuffer.length; i++) {
        const input = this.inputBuffer[i]
        reconciledState = simulate(reconciledState, input.input, input.deltaTime)
      }
      
      if (this.onReconcile) {
        this.onReconcile(historicalState.state, serverState, reconciledState, error)
      }
      
      this.displayState = this.smoothState(this.displayState || reconciledState, reconciledState)
      
      return reconciledState
    }
    
    return null
  }

  calculateError(stateA, stateB) {
    let error = 0
    let count = 0
    
    for (const key of Object.keys(stateA)) {
      const a = stateA[key]
      const b = stateB[key]
      
      if (typeof a === 'number' && typeof b === 'number') {
        error += Math.abs(a - b)
        count++
      } else if (typeof a === 'object' && typeof b === 'object') {
        if (a.x !== undefined && b.x !== undefined) {
          error += Math.abs(a.x - b.x)
          count++
        }
        if (a.y !== undefined && b.y !== undefined) {
          error += Math.abs(a.y - b.y)
          count++
        }
        if (a.z !== undefined && b.z !== undefined) {
          error += Math.abs(a.z - b.z)
          count++
        }
      }
    }
    
    return count > 0 ? error / count : 0
  }

  smoothState(current, target) {
    if (!current) return this.cloneState(target)
    
    const smoothed = {}
    
    for (const key of Object.keys(target)) {
      const c = current[key]
      const t = target[key]
      
      if (typeof t === 'number' && typeof c === 'number') {
        smoothed[key] = c + (t - c) * this.smoothingFactor
      } else if (typeof t === 'object' && t !== null) {
        smoothed[key] = {}
        if (t.x !== undefined) {
          smoothed[key].x = (c?.x ?? t.x) + (t.x - (c?.x ?? t.x)) * this.smoothingFactor
        }
        if (t.y !== undefined) {
          smoothed[key].y = (c?.y ?? t.y) + (t.y - (c?.y ?? t.y)) * this.smoothingFactor
        }
        if (t.z !== undefined) {
          smoothed[key].z = (c?.z ?? t.z) + (t.z - (c?.z ?? t.z)) * this.smoothingFactor
        }
      } else {
        smoothed[key] = t
      }
    }
    
    return smoothed
  }

  cloneState(state) {
    const clone = {}
    
    for (const [key, value] of Object.entries(state)) {
      if (typeof value === 'object' && value !== null) {
        clone[key] = { ...value }
      } else {
        clone[key] = value
      }
    }
    
    return clone
  }

  getDisplayState() {
    return this.displayState || this.predictedState
  }

  getPredictedState() {
    return this.predictedState
  }

  getInputsAfter(sequence) {
    return this.inputBuffer.filter(i => i.sequence > sequence)
  }

  clearBuffers() {
    this.inputBuffer = []
    this.stateBuffer = []
    this.sequenceNumber = 0
    this.lastServerSequence = -1
  }

  getLatestSequence() {
    return this.sequenceNumber - 1
  }

  getBufferedInputCount() {
    return this.inputBuffer.length
  }
}
