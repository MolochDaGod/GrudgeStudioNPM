import * as THREE from 'three'

export class VehicleController {
  constructor(object, options = {}) {
    this.object = object
    this.enabled = true
    
    this.maxSpeed = options.maxSpeed ?? 30
    this.maxReverseSpeed = options.maxReverseSpeed ?? 15
    this.acceleration = options.acceleration ?? 15
    this.brakeForce = options.brakeForce ?? 30
    this.turnSpeed = options.turnSpeed ?? 2
    this.maxTurnAngle = options.maxTurnAngle ?? Math.PI / 6
    this.friction = options.friction ?? 3
    this.grip = options.grip ?? 0.95
    
    this.wheelBase = options.wheelBase ?? 2.5
    this.mass = options.mass ?? 1000
    
    this.currentSpeed = 0
    this.currentTurnAngle = 0
    this.velocity = new THREE.Vector3()
    this.angularVelocity = 0
    
    this.throttle = 0
    this.brake = 0
    this.steering = 0
    this.handbrake = false
    
    this.wheels = []
    this.wheelRotation = 0
    
    this.onCollision = null
  }

  setThrottle(value) {
    this.throttle = THREE.MathUtils.clamp(value, -1, 1)
    return this
  }

  setSteering(value) {
    this.steering = THREE.MathUtils.clamp(value, -1, 1)
    return this
  }

  setBrake(value) {
    this.brake = THREE.MathUtils.clamp(value, 0, 1)
    return this
  }

  setHandbrake(active) {
    this.handbrake = active
    return this
  }

  addWheel(mesh, options = {}) {
    this.wheels.push({
      mesh,
      isFront: options.isFront ?? false,
      offset: options.offset ? new THREE.Vector3().copy(options.offset) : new THREE.Vector3(),
      radius: options.radius ?? 0.3
    })
    return this
  }

  update(deltaTime) {
    if (!this.enabled) return this
    
    let force = 0
    
    if (this.throttle > 0) {
      if (this.currentSpeed < this.maxSpeed) {
        force = this.throttle * this.acceleration
      }
    } else if (this.throttle < 0) {
      if (this.currentSpeed > -this.maxReverseSpeed) {
        force = this.throttle * this.acceleration * 0.5
      }
    }
    
    if (this.brake > 0 || this.handbrake) {
      const brakeMultiplier = this.handbrake ? 2 : 1
      if (this.currentSpeed > 0) {
        force -= this.brake * this.brakeForce * brakeMultiplier
      } else if (this.currentSpeed < 0) {
        force += this.brake * this.brakeForce * brakeMultiplier
      }
    }
    
    force -= Math.sign(this.currentSpeed) * this.friction
    
    this.currentSpeed += force * deltaTime
    
    if (Math.abs(this.currentSpeed) < 0.1 && this.throttle === 0) {
      this.currentSpeed = 0
    }
    
    const targetTurnAngle = this.steering * this.maxTurnAngle
    this.currentTurnAngle += (targetTurnAngle - this.currentTurnAngle) * 0.2
    
    if (Math.abs(this.currentSpeed) > 0.5) {
      const turnRadius = this.wheelBase / Math.tan(Math.abs(this.currentTurnAngle) + 0.001)
      const angularVelocity = this.currentSpeed / turnRadius
      this.angularVelocity = angularVelocity * Math.sign(this.currentTurnAngle)
      
      if (this.handbrake) {
        this.angularVelocity *= 1.5
      }
    } else {
      this.angularVelocity = 0
    }
    
    this.object.rotation.y += this.angularVelocity * deltaTime
    
    const forward = new THREE.Vector3(0, 0, -1)
    forward.applyQuaternion(this.object.quaternion)
    
    const targetVelocity = forward.clone().multiplyScalar(this.currentSpeed)
    
    this.velocity.lerp(targetVelocity, this.grip)
    
    if (this.handbrake) {
      const lateral = new THREE.Vector3(1, 0, 0)
      lateral.applyQuaternion(this.object.quaternion)
      const drift = lateral.multiplyScalar(this.velocity.dot(lateral) * 0.3)
      this.velocity.add(drift)
    }
    
    this.object.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    
    this.updateWheels(deltaTime)
    
    return this
  }

  updateWheels(deltaTime) {
    this.wheelRotation += this.currentSpeed * deltaTime * 2
    
    for (const wheel of this.wheels) {
      wheel.mesh.rotation.x = this.wheelRotation
      
      if (wheel.isFront) {
        wheel.mesh.rotation.y = this.currentTurnAngle
      }
    }
  }

  getSpeed() {
    return Math.abs(this.currentSpeed)
  }

  getSpeedKPH() {
    return this.getSpeed() * 3.6
  }

  getVelocity() {
    return this.velocity.clone()
  }

  teleport(position, rotation = null) {
    this.object.position.copy(position)
    if (rotation !== null) {
      this.object.rotation.y = rotation
    }
    this.velocity.set(0, 0, 0)
    this.currentSpeed = 0
    this.angularVelocity = 0
    return this
  }

  getState() {
    return {
      speed: this.currentSpeed,
      speedKPH: this.getSpeedKPH(),
      steering: this.steering,
      throttle: this.throttle,
      brake: this.brake,
      handbrake: this.handbrake,
      isMoving: Math.abs(this.currentSpeed) > 0.1,
      isReversing: this.currentSpeed < -0.1
    }
  }
}
