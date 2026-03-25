import RAPIER from '@dimforge/rapier3d-compat'

export class PhysicsManager {
  constructor() {
    this.world = null
    this.bodies = new Map()
    this.colliders = new Map()
    this.initialized = false
    this.eventQueue = null
  }
  
  async init() {
    await RAPIER.init()
    
    const gravity = { x: 0.0, y: -9.81, z: 0.0 }
    this.world = new RAPIER.World(gravity)
    this.eventQueue = new RAPIER.EventQueue(true)
    this.initialized = true
    
    console.log('Rapier physics initialized')
  }
  
  createStaticBody(position = { x: 0, y: 0, z: 0 }) {
    if (!this.initialized) return null
    
    const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(position.x, position.y, position.z)
    
    return this.world.createRigidBody(bodyDesc)
  }
  
  createDynamicBody(position = { x: 0, y: 0, z: 0 }, mass = 1.0) {
    if (!this.initialized) return null
    
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y, position.z)
      .setAdditionalMass(mass)
    
    return this.world.createRigidBody(bodyDesc)
  }
  
  createKinematicBody(position = { x: 0, y: 0, z: 0 }) {
    if (!this.initialized) return null
    
    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(position.x, position.y, position.z)
    
    return this.world.createRigidBody(bodyDesc)
  }
  
  createBoxCollider(rigidBody, halfExtents = { x: 0.5, y: 0.5, z: 0.5 }) {
    if (!this.initialized) return null
    
    const colliderDesc = RAPIER.ColliderDesc.cuboid(
      halfExtents.x, halfExtents.y, halfExtents.z
    )
    
    return this.world.createCollider(colliderDesc, rigidBody)
  }
  
  createSphereCollider(rigidBody, radius = 0.5) {
    if (!this.initialized) return null
    
    const colliderDesc = RAPIER.ColliderDesc.ball(radius)
    return this.world.createCollider(colliderDesc, rigidBody)
  }
  
  createCapsuleCollider(rigidBody, halfHeight = 1.0, radius = 0.5) {
    if (!this.initialized) return null
    
    const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius)
    return this.world.createCollider(colliderDesc, rigidBody)
  }
  
  createGroundCollider(size = { x: 50, z: 50 }, y = 0) {
    if (!this.initialized) return null
    
    const groundBody = this.createStaticBody({ x: 0, y: y, z: 0 })
    const colliderDesc = RAPIER.ColliderDesc.cuboid(size.x, 0.1, size.z)
    return this.world.createCollider(colliderDesc, groundBody)
  }
  
  createTrimeshCollider(rigidBody, vertices, indices) {
    if (!this.initialized) return null
    
    const colliderDesc = RAPIER.ColliderDesc.trimesh(
      new Float32Array(vertices),
      new Uint32Array(indices)
    )
    
    return this.world.createCollider(colliderDesc, rigidBody)
  }
  
  registerBody(id, rigidBody) {
    this.bodies.set(id, rigidBody)
  }
  
  getBody(id) {
    return this.bodies.get(id)
  }
  
  removeBody(id) {
    const body = this.bodies.get(id)
    if (body) {
      this.world.removeRigidBody(body)
      this.bodies.delete(id)
    }
  }
  
  setBodyPosition(rigidBody, position) {
    if (!rigidBody) return
    rigidBody.setTranslation(position, true)
  }
  
  setBodyRotation(rigidBody, rotation) {
    if (!rigidBody) return
    rigidBody.setRotation(rotation, true)
  }
  
  getBodyPosition(rigidBody) {
    if (!rigidBody) return { x: 0, y: 0, z: 0 }
    return rigidBody.translation()
  }
  
  getBodyRotation(rigidBody) {
    if (!rigidBody) return { x: 0, y: 0, z: 0, w: 1 }
    return rigidBody.rotation()
  }
  
  applyImpulse(rigidBody, impulse) {
    if (!rigidBody) return
    rigidBody.applyImpulse(impulse, true)
  }
  
  applyForce(rigidBody, force) {
    if (!rigidBody) return
    rigidBody.addForce(force, true)
  }
  
  castRay(origin, direction, maxDistance = 100) {
    if (!this.initialized) return null
    
    const ray = new RAPIER.Ray(origin, direction)
    const hit = this.world.castRay(ray, maxDistance, true)
    
    if (hit) {
      const hitPoint = ray.pointAt(hit.toi)
      return {
        point: hitPoint,
        normal: hit.normal,
        distance: hit.toi,
        collider: hit.collider
      }
    }
    
    return null
  }
  
  step(deltaTime = 1/60) {
    if (!this.initialized) return
    
    this.world.step(this.eventQueue)
    
    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
    })
    
    this.eventQueue.drainContactForceEvents((event) => {
    })
  }
  
  dispose() {
    if (this.world) {
      this.world.free()
      this.world = null
    }
    this.bodies.clear()
    this.colliders.clear()
    this.initialized = false
  }
}

let physicsInstance = null

export async function getPhysicsManager() {
  if (!physicsInstance) {
    physicsInstance = new PhysicsManager()
    await physicsInstance.init()
  }
  return physicsInstance
}
