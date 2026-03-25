import { EventEmitter } from '../core/EventEmitter.js'

export class PhysicsCollision {
    constructor(entity) {
        this.entity = entity
        this.events = new EventEmitter()
        this.logEvents = false
        this.collider = null
        this.rigidBody = null
    }

    setCollider(collider) {
        this.collider = collider
    }

    setRigidBody(rigidBody) {
        this.rigidBody = rigidBody
    }

    onCollisionEnter(collision) {
        if (this.logEvents) console.log('ENTER', collision)
        this.events.emit('enter', collision)
    }

    onCollisionStay(collision) {
        if (this.logEvents) console.log('STAY', collision)
        this.events.emit('stay', collision)
    }

    onCollisionExit(collision) {
        if (this.logEvents) console.log('EXIT', collision)
        this.events.emit('exit', collision)
    }

    destroy() {
        this.events.removeAllListeners()
    }
}

export class PhysicsTrigger {
    constructor(entity, triggerObjects = []) {
        this.entity = entity
        this.triggerObjects = triggerObjects
        this.events = new EventEmitter()
    }

    onTriggerEnter(collider) {
        if (this.triggerObjects.length > 0 && !this.triggerObjects.includes(collider.gameObject)) return
        this.events.emit('enter', collider)
    }

    onTriggerStay(collider) {
        if (this.triggerObjects.length > 0 && !this.triggerObjects.includes(collider.gameObject)) return
        this.events.emit('stay', collider)
    }

    onTriggerExit(collider) {
        if (this.triggerObjects.length > 0 && !this.triggerObjects.includes(collider.gameObject)) return
        this.events.emit('exit', collider)
    }

    destroy() {
        this.events.removeAllListeners()
    }
}

export function createCapsuleCollider(world, position, radius = 0.5, halfHeight = 0.9) {
    const RAPIER = window.RAPIER
    if (!RAPIER) {
        console.warn('Rapier not loaded')
        return null
    }

    const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(position.x, position.y, position.z)
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const colliderDesc = RAPIER.ColliderDesc.capsule(halfHeight, radius)
    const collider = world.createCollider(colliderDesc, rigidBody)

    return { rigidBody, collider }
}

export function createBoxCollider(world, position, halfExtents = { x: 0.5, y: 0.5, z: 0.5 }) {
    const RAPIER = window.RAPIER
    if (!RAPIER) {
        console.warn('Rapier not loaded')
        return null
    }

    const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
        .setTranslation(position.x, position.y, position.z)
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const colliderDesc = RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z)
    const collider = world.createCollider(colliderDesc, rigidBody)

    return { rigidBody, collider }
}

export function createMeshCollider(world, mesh) {
    const RAPIER = window.RAPIER
    if (!RAPIER || !mesh.geometry) {
        console.warn('Rapier not loaded or mesh has no geometry')
        return null
    }

    const position = mesh.getWorldPosition(new THREE.Vector3())
    const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
        .setTranslation(position.x, position.y, position.z)
    const rigidBody = world.createRigidBody(rigidBodyDesc)

    const vertices = mesh.geometry.attributes.position.array
    const indices = mesh.geometry.index ? mesh.geometry.index.array : null

    if (indices) {
        const colliderDesc = RAPIER.ColliderDesc.trimesh(
            new Float32Array(vertices),
            new Uint32Array(indices)
        )
        const collider = world.createCollider(colliderDesc, rigidBody)
        return { rigidBody, collider }
    }

    return null
}
