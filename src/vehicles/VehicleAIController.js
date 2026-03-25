import * as THREE from 'three'

export class VehicleAIController {
  constructor(vehicle, options = {}) {
    this.vehicle = vehicle
    this.learningRate = options.learningRate || 0.01
    this.discountFactor = options.discountFactor || 0.99
    this.explorationRate = options.explorationRate || 0.1
    this.explorationDecay = options.explorationDecay || 0.995
    this.minExploration = options.minExploration || 0.01

    this.stateSize = 12
    this.actionSize = 9

    this.weights = this.initializeWeights()
    this.memory = []
    this.maxMemory = options.maxMemory || 10000
    this.batchSize = options.batchSize || 32

    this.episode = 0
    this.totalReward = 0
    this.stepCount = 0

    this.waypoints = []
    this.currentWaypointIndex = 0
    this.lapCount = 0

    this.trainingStats = {
      episodes: 0,
      avgReward: 0,
      bestReward: -Infinity,
      lapsCompleted: 0,
      collisions: 0
    }
  }

  initializeWeights() {
    const weights = {
      layer1: [],
      layer2: [],
      output: []
    }

    const hiddenSize = 64

    for (let i = 0; i < hiddenSize; i++) {
      weights.layer1.push([])
      for (let j = 0; j < this.stateSize; j++) {
        weights.layer1[i].push((Math.random() - 0.5) * 0.5)
      }
    }

    for (let i = 0; i < hiddenSize; i++) {
      weights.layer2.push([])
      for (let j = 0; j < hiddenSize; j++) {
        weights.layer2[i].push((Math.random() - 0.5) * 0.5)
      }
    }

    for (let i = 0; i < this.actionSize; i++) {
      weights.output.push([])
      for (let j = 0; j < hiddenSize; j++) {
        weights.output[i].push((Math.random() - 0.5) * 0.5)
      }
    }

    return weights
  }

  getState() {
    const telemetry = this.vehicle.getTelemetry()
    const pos = this.vehicle.getPosition()
    const vel = this.vehicle.getVelocity()

    let waypointDir = new THREE.Vector3(0, 0, 1)
    let waypointDist = 10

    if (this.waypoints.length > 0) {
      const target = this.waypoints[this.currentWaypointIndex]
      waypointDir = target.clone().sub(pos).normalize()
      waypointDist = pos.distanceTo(target)
    }

    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyEuler(telemetry.rotation)

    const angleToWaypoint = forward.angleTo(waypointDir)
    const crossProduct = new THREE.Vector3().crossVectors(forward, waypointDir)
    const turnDirection = Math.sign(crossProduct.y)

    return [
      telemetry.speed / 200,
      vel.x / 50,
      vel.z / 50,
      telemetry.steering,
      telemetry.throttle,
      telemetry.brake,
      Math.cos(angleToWaypoint),
      Math.sin(angleToWaypoint) * turnDirection,
      Math.min(waypointDist / 100, 1),
      telemetry.slipRatios[0],
      telemetry.slipRatios[2],
      this.vehicle.angularVelocity?.y / 10 || 0
    ]
  }

  relu(x) {
    return Math.max(0, x)
  }

  forward(state) {
    const hidden1 = []
    for (let i = 0; i < this.weights.layer1.length; i++) {
      let sum = 0
      for (let j = 0; j < state.length; j++) {
        sum += this.weights.layer1[i][j] * state[j]
      }
      hidden1.push(this.relu(sum))
    }

    const hidden2 = []
    for (let i = 0; i < this.weights.layer2.length; i++) {
      let sum = 0
      for (let j = 0; j < hidden1.length; j++) {
        sum += this.weights.layer2[i][j] * hidden1[j]
      }
      hidden2.push(this.relu(sum))
    }

    const output = []
    for (let i = 0; i < this.weights.output.length; i++) {
      let sum = 0
      for (let j = 0; j < hidden2.length; j++) {
        sum += this.weights.output[i][j] * hidden2[j]
      }
      output.push(sum)
    }

    return output
  }

  selectAction(state) {
    if (Math.random() < this.explorationRate) {
      return Math.floor(Math.random() * this.actionSize)
    }

    const qValues = this.forward(state)
    return qValues.indexOf(Math.max(...qValues))
  }

  actionToControls(action) {
    const actions = [
      { throttle: 1.0, brake: 0.0, steering: 0.0 },
      { throttle: 1.0, brake: 0.0, steering: -0.5 },
      { throttle: 1.0, brake: 0.0, steering: 0.5 },
      { throttle: 0.5, brake: 0.0, steering: -1.0 },
      { throttle: 0.5, brake: 0.0, steering: 1.0 },
      { throttle: 0.0, brake: 1.0, steering: 0.0 },
      { throttle: 0.0, brake: 0.5, steering: -0.5 },
      { throttle: 0.0, brake: 0.5, steering: 0.5 },
      { throttle: 0.0, brake: 0.0, steering: 0.0 }
    ]
    return actions[action] || actions[0]
  }

  calculateReward(state, action, nextState) {
    const telemetry = this.vehicle.getTelemetry()
    let reward = 0

    reward += telemetry.speed * 0.01

    const pos = this.vehicle.getPosition()
    if (this.waypoints.length > 0) {
      const target = this.waypoints[this.currentWaypointIndex]
      const distance = pos.distanceTo(target)

      if (distance < 5) {
        reward += 50
        this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length

        if (this.currentWaypointIndex === 0) {
          this.lapCount++
          reward += 200
          this.trainingStats.lapsCompleted++
        }
      }

      reward -= distance * 0.001
    }

    const avgSlip = (Math.abs(telemetry.slipRatios[0]) + Math.abs(telemetry.slipRatios[2])) / 2
    if (avgSlip > 0.3) {
      reward -= avgSlip * 2
    }

    if (pos.y < 0) {
      reward -= 100
      this.trainingStats.collisions++
    }

    if (telemetry.speed < 5 && this.stepCount > 100) {
      reward -= 1
    }

    return reward
  }

  remember(state, action, reward, nextState, done) {
    this.memory.push({ state, action, reward, nextState, done })

    if (this.memory.length > this.maxMemory) {
      this.memory.shift()
    }
  }

  train() {
    if (this.memory.length < this.batchSize) return

    const batch = []
    for (let i = 0; i < this.batchSize; i++) {
      const idx = Math.floor(Math.random() * this.memory.length)
      batch.push(this.memory[idx])
    }

    for (const experience of batch) {
      const { state, action, reward, nextState, done } = experience

      const currentQ = this.forward(state)
      const nextQ = this.forward(nextState)

      let target = reward
      if (!done) {
        target += this.discountFactor * Math.max(...nextQ)
      }

      const error = target - currentQ[action]

      for (let i = 0; i < this.weights.output[action].length; i++) {
        this.weights.output[action][i] += this.learningRate * error * 0.01
      }
    }

    this.explorationRate = Math.max(
      this.minExploration,
      this.explorationRate * this.explorationDecay
    )
  }

  update(deltaTime) {
    this.stepCount++

    const state = this.getState()
    const action = this.selectAction(state)
    const controls = this.actionToControls(action)

    this.vehicle.setControls(controls.throttle, controls.brake, controls.steering)

    return { state, action, controls }
  }

  step() {
    const prevState = this.getState()
    const action = this.selectAction(prevState)
    const controls = this.actionToControls(action)

    this.vehicle.setControls(controls.throttle, controls.brake, controls.steering)

    const nextState = this.getState()
    const reward = this.calculateReward(prevState, action, nextState)
    const done = this.checkDone()

    this.remember(prevState, action, reward, nextState, done)
    this.totalReward += reward

    if (this.stepCount % 10 === 0) {
      this.train()
    }

    return { action, reward, done }
  }

  checkDone() {
    const pos = this.vehicle.getPosition()

    if (pos.y < -5) return true
    if (this.stepCount > 10000) return true

    return false
  }

  endEpisode() {
    this.trainingStats.episodes++
    this.trainingStats.avgReward =
      (this.trainingStats.avgReward * (this.trainingStats.episodes - 1) + this.totalReward) /
      this.trainingStats.episodes

    if (this.totalReward > this.trainingStats.bestReward) {
      this.trainingStats.bestReward = this.totalReward
    }

    this.episode++
    this.totalReward = 0
    this.stepCount = 0
    this.currentWaypointIndex = 0
  }

  setWaypoints(waypoints) {
    this.waypoints = waypoints
    this.currentWaypointIndex = 0
  }

  getStats() {
    return {
      ...this.trainingStats,
      explorationRate: this.explorationRate,
      memorySize: this.memory.length,
      currentEpisode: this.episode,
      stepCount: this.stepCount,
      totalReward: this.totalReward
    }
  }

  saveModel() {
    return JSON.stringify({
      weights: this.weights,
      explorationRate: this.explorationRate,
      stats: this.trainingStats
    })
  }

  loadModel(json) {
    try {
      const data = JSON.parse(json)
      this.weights = data.weights
      this.explorationRate = data.explorationRate
      this.trainingStats = data.stats
      return true
    } catch (e) {
      console.error('Failed to load model:', e)
      return false
    }
  }

  reset() {
    this.stepCount = 0
    this.totalReward = 0
    this.currentWaypointIndex = 0
    this.lapCount = 0
  }
}

export class VehicleAITrainer {
  constructor(options = {}) {
    this.vehicles = []
    this.controllers = []
    this.isTraining = false
    this.trainingSpeed = options.trainingSpeed || 1
    this.callbacks = {
      onEpisodeEnd: options.onEpisodeEnd || null,
      onTrainingUpdate: options.onTrainingUpdate || null
    }
  }

  addVehicle(vehicle, waypoints = []) {
    const controller = new VehicleAIController(vehicle)
    controller.setWaypoints(waypoints)

    this.vehicles.push(vehicle)
    this.controllers.push(controller)

    return controller
  }

  startTraining() {
    this.isTraining = true
  }

  stopTraining() {
    this.isTraining = false
  }

  update(deltaTime) {
    if (!this.isTraining) return

    for (let i = 0; i < this.controllers.length; i++) {
      const controller = this.controllers[i]
      const result = controller.step()

      if (result.done) {
        controller.endEpisode()
        this.vehicles[i].reset()
        controller.reset()

        if (this.callbacks.onEpisodeEnd) {
          this.callbacks.onEpisodeEnd(controller.getStats(), i)
        }
      }
    }

    if (this.callbacks.onTrainingUpdate) {
      const stats = this.controllers.map(c => c.getStats())
      this.callbacks.onTrainingUpdate(stats)
    }
  }

  getStats() {
    return this.controllers.map(c => c.getStats())
  }

  saveAllModels() {
    return this.controllers.map(c => c.saveModel())
  }

  loadAllModels(models) {
    models.forEach((model, i) => {
      if (this.controllers[i]) {
        this.controllers[i].loadModel(model)
      }
    })
  }
}
