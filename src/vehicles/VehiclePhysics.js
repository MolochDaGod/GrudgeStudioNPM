import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'

export class VehiclePhysics {
  constructor(options = {}) {
    this.chassisMass = options.chassisMass || 1500
    this.wheelRadius = options.wheelRadius || 0.4
    this.wheelWidth = options.wheelWidth || 0.3
    this.suspensionRestLength = options.suspensionRestLength || 0.3
    this.suspensionStiffness = options.suspensionStiffness || 30
    this.suspensionDamping = options.suspensionDamping || 4.4
    this.maxSuspensionTravel = options.maxSuspensionTravel || 0.2
    this.frictionSlip = options.frictionSlip || 2.0
    this.maxEngineForce = options.maxEngineForce || 3000
    this.maxBrakeForce = options.maxBrakeForce || 100
    this.maxSteeringAngle = options.maxSteeringAngle || Math.PI / 6

    this.wheelPositions = options.wheelPositions || [
      new THREE.Vector3(-0.8, 0, 1.2),
      new THREE.Vector3(0.8, 0, 1.2),
      new THREE.Vector3(-0.8, 0, -1.2),
      new THREE.Vector3(0.8, 0, -1.2)
    ]

    this.chassis = null
    this.wheels = []
    this.world = null
    this.model = null

    this.engineForce = 0
    this.brakeForce = 0
    this.steeringAngle = 0
    this.velocity = new THREE.Vector3()
    this.angularVelocity = new THREE.Vector3()

    this.telemetry = {
      speed: 0,
      rpm: 0,
      gear: 1,
      throttle: 0,
      brake: 0,
      steering: 0,
      wheelSpeeds: [0, 0, 0, 0],
      suspensionCompression: [0, 0, 0, 0],
      slipRatios: [0, 0, 0, 0],
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      lapTime: 0,
      distanceTraveled: 0
    }
  }

  async init(world, position = new THREE.Vector3(0, 2, 0)) {
    this.world = world

    const chassisDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setLinearDamping(0.1)
      .setAngularDamping(0.5)

    this.chassis = world.createRigidBody(chassisDesc)

    const chassisColliderDesc = RAPIER.ColliderDesc.cuboid(1.0, 0.5, 2.0)
      .setDensity(this.chassisMass / 4.0)
      .setFriction(0.5)

    world.createCollider(chassisColliderDesc, this.chassis)

    for (let i = 0; i < 4; i++) {
      const wheelPos = this.wheelPositions[i]
      const wheelDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(
          position.x + wheelPos.x,
          position.y + wheelPos.y - this.suspensionRestLength,
          position.z + wheelPos.z
        )
        .setLinearDamping(0.5)
        .setAngularDamping(0.5)

      const wheel = world.createRigidBody(wheelDesc)

      const wheelColliderDesc = RAPIER.ColliderDesc.cylinder(
        this.wheelWidth / 2,
        this.wheelRadius
      )
        .setDensity(50)
        .setFriction(this.frictionSlip)
        .setRotation({ x: 0, y: 0, z: Math.PI / 2, w: 1 })

      world.createCollider(wheelColliderDesc, wheel)

      this.wheels.push({
        body: wheel,
        position: wheelPos.clone(),
        isFront: i < 2,
        compression: 0,
        slipRatio: 0,
        angularVelocity: 0
      })
    }
  }

  setModel(model) {
    this.model = model
  }

  setControls(throttle, brake, steering) {
    this.engineForce = throttle * this.maxEngineForce
    this.brakeForce = brake * this.maxBrakeForce
    this.steeringAngle = steering * this.maxSteeringAngle

    this.telemetry.throttle = throttle
    this.telemetry.brake = brake
    this.telemetry.steering = steering
  }

  update(deltaTime) {
    if (!this.chassis || !this.world) return

    const chassisPos = this.chassis.translation()
    const chassisRot = this.chassis.rotation()
    const linVel = this.chassis.linvel()
    const angVel = this.chassis.angvel()

    this.velocity.set(linVel.x, linVel.y, linVel.z)
    this.angularVelocity.set(angVel.x, angVel.y, angVel.z)

    const speed = this.velocity.length()
    this.telemetry.speed = speed * 3.6
    this.telemetry.rpm = Math.min(8000, 1000 + speed * 100)
    this.telemetry.gear = Math.min(6, Math.floor(speed / 10) + 1)

    const forward = new THREE.Vector3(0, 0, 1)
    const quaternion = new THREE.Quaternion(chassisRot.x, chassisRot.y, chassisRot.z, chassisRot.w)
    forward.applyQuaternion(quaternion)

    if (this.engineForce !== 0) {
      const force = forward.clone().multiplyScalar(this.engineForce)
      this.chassis.addForce({ x: force.x, y: force.y, z: force.z }, true)
    }

    if (this.brakeForce > 0) {
      const brakeVector = this.velocity.clone().normalize().multiplyScalar(-this.brakeForce * 10)
      this.chassis.addForce({ x: brakeVector.x, y: brakeVector.y, z: brakeVector.z }, true)
    }

    if (Math.abs(this.steeringAngle) > 0.01 && speed > 0.5) {
      const steeringTorque = this.steeringAngle * 5000 * (speed / 20)
      this.chassis.addTorque({ x: 0, y: steeringTorque, z: 0 }, true)
    }

    for (let i = 0; i < this.wheels.length; i++) {
      const wheel = this.wheels[i]
      const wheelPos = wheel.position.clone()
      wheelPos.applyQuaternion(quaternion)
      wheelPos.add(new THREE.Vector3(chassisPos.x, chassisPos.y, chassisPos.z))

      wheel.body.setTranslation(
        { x: wheelPos.x, y: wheelPos.y - this.suspensionRestLength, z: wheelPos.z },
        true
      )

      const wheelAngVel = wheel.body.angvel()
      wheel.angularVelocity = Math.sqrt(wheelAngVel.x ** 2 + wheelAngVel.y ** 2 + wheelAngVel.z ** 2)

      const wheelSpeed = wheel.angularVelocity * this.wheelRadius
      const groundSpeed = speed
      wheel.slipRatio = groundSpeed > 0.1 ? (wheelSpeed - groundSpeed) / groundSpeed : 0

      this.telemetry.wheelSpeeds[i] = wheelSpeed
      this.telemetry.slipRatios[i] = wheel.slipRatio
    }

    this.telemetry.position.set(chassisPos.x, chassisPos.y, chassisPos.z)
    this.telemetry.rotation.setFromQuaternion(quaternion)
    this.telemetry.distanceTraveled += speed * deltaTime

    if (this.model) {
      this.model.position.set(chassisPos.x, chassisPos.y, chassisPos.z)
      this.model.quaternion.copy(quaternion)
    }
  }

  getTelemetry() {
    return { ...this.telemetry }
  }

  getPosition() {
    if (!this.chassis) return new THREE.Vector3()
    const pos = this.chassis.translation()
    return new THREE.Vector3(pos.x, pos.y, pos.z)
  }

  getVelocity() {
    return this.velocity.clone()
  }

  getSpeed() {
    return this.telemetry.speed
  }

  reset(position = new THREE.Vector3(0, 2, 0), rotation = new THREE.Quaternion()) {
    if (!this.chassis) return

    this.chassis.setTranslation({ x: position.x, y: position.y, z: position.z }, true)
    this.chassis.setRotation({ x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }, true)
    this.chassis.setLinvel({ x: 0, y: 0, z: 0 }, true)
    this.chassis.setAngvel({ x: 0, y: 0, z: 0 }, true)

    this.engineForce = 0
    this.brakeForce = 0
    this.steeringAngle = 0
    this.telemetry.distanceTraveled = 0
    this.telemetry.lapTime = 0
  }

  dispose() {
    if (this.world && this.chassis) {
      this.world.removeRigidBody(this.chassis)
      this.wheels.forEach(wheel => {
        if (wheel.body) {
          this.world.removeRigidBody(wheel.body)
        }
      })
    }
    this.chassis = null
    this.wheels = []
  }
}

export const VehiclePresets = {
  sedan: {
    chassisMass: 1400,
    wheelRadius: 0.35,
    maxEngineForce: 2500,
    maxBrakeForce: 80,
    suspensionStiffness: 25,
    frictionSlip: 2.0
  },
  sportsCar: {
    chassisMass: 1200,
    wheelRadius: 0.32,
    maxEngineForce: 4000,
    maxBrakeForce: 120,
    suspensionStiffness: 40,
    frictionSlip: 2.5
  },
  suv: {
    chassisMass: 2000,
    wheelRadius: 0.45,
    maxEngineForce: 3500,
    maxBrakeForce: 100,
    suspensionStiffness: 20,
    suspensionRestLength: 0.4,
    frictionSlip: 1.8
  },
  taxi: {
    chassisMass: 1500,
    wheelRadius: 0.35,
    maxEngineForce: 2200,
    maxBrakeForce: 70,
    suspensionStiffness: 22,
    frictionSlip: 2.0
  },
  policeCar: {
    chassisMass: 1600,
    wheelRadius: 0.36,
    maxEngineForce: 3500,
    maxBrakeForce: 100,
    suspensionStiffness: 35,
    frictionSlip: 2.3
  }
}
