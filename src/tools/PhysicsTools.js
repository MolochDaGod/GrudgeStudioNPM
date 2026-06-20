/**
 * Advanced Physics and Collision Systems for Grudge Studio
 * Comprehensive physics simulation and collision detection
 */

import * as THREE from 'three'

// Physics World Manager
export class PhysicsWorld {
    constructor(options = {}) {
        this.gravity = options.gravity || new THREE.Vector3(0, -9.81, 0)
        this.timeStep = options.timeStep || 1 / 60
        this.maxSubSteps = options.maxSubSteps || 10
        
        // Physics bodies
        this.bodies = new Map()
        this.staticBodies = new Map()
        this.dynamicBodies = new Map()
        this.kinematicBodies = new Map()
        
        // Collision detection
        this.broadphase = new SpatialHashBroadphase()
        this.narrowphase = new SATNarrowphase()
        this.collisionPairs = new Set()
        
        // Constraints
        this.constraints = []
        
        // Performance metrics
        this.stats = {
            bodies: 0,
            collisions: 0,
            computeTime: 0
        }
    }
    
    step(deltaTime) {
        const startTime = performance.now()
        
        let accumulator = deltaTime
        while (accumulator >= this.timeStep) {
            this.fixedUpdate(this.timeStep)
            accumulator -= this.timeStep
        }
        
        // Interpolate remaining time
        if (accumulator > 0) {
            this.interpolate(accumulator / this.timeStep)
        }
        
        this.stats.computeTime = performance.now() - startTime
    }
    
    fixedUpdate(dt) {
        // Clear collision pairs
        this.collisionPairs.clear()
        
        // Broadphase collision detection
        const potentialPairs = this.broadphase.detectPairs(this.bodies)
        
        // Narrowphase collision detection
        potentialPairs.forEach(pair => {
            const [bodyA, bodyB] = pair
            const manifold = this.narrowphase.testCollision(bodyA, bodyB)
            
            if (manifold) {
                this.collisionPairs.add({ bodyA, bodyB, manifold })
                this.handleCollision(bodyA, bodyB, manifold)
            }
        })
        
        // Integrate forces and velocities
        this.dynamicBodies.forEach(body => {
            this.integrateBody(body, dt)
        })
        
        // Solve constraints
        this.constraints.forEach(constraint => {
            constraint.solve(dt)
        })
        
        // Update stats
        this.stats.bodies = this.bodies.size
        this.stats.collisions = this.collisionPairs.size
    }
    
    integrateBody(body, dt) {
        if (!body.dynamic || body.mass === 0) return
        
        // Apply gravity
        body.force.add(this.gravity.clone().multiplyScalar(body.mass))
        
        // Integrate velocity: v = v + a * dt
        const acceleration = body.force.clone().divideScalar(body.mass)
        body.velocity.add(acceleration.clone().multiplyScalar(dt))
        
        // Apply damping
        body.velocity.multiplyScalar(Math.pow(1 - body.linearDamping, dt))
        body.angularVelocity.multiplyScalar(Math.pow(1 - body.angularDamping, dt))
        
        // Integrate position: x = x + v * dt
        body.position.add(body.velocity.clone().multiplyScalar(dt))
        
        // Integrate rotation
        const angularVelocityQuat = new THREE.Quaternion(
            body.angularVelocity.x * dt,
            body.angularVelocity.y * dt,
            body.angularVelocity.z * dt,
            0
        )
        angularVelocityQuat.multiplyQuaternions(angularVelocityQuat, body.quaternion)
        body.quaternion.x += angularVelocityQuat.x * 0.5
        body.quaternion.y += angularVelocityQuat.y * 0.5
        body.quaternion.z += angularVelocityQuat.z * 0.5
        body.quaternion.w += angularVelocityQuat.w * 0.5
        body.quaternion.normalize()
        
        // Clear forces
        body.force.set(0, 0, 0)
        body.torque.set(0, 0, 0)
        
        // Update mesh
        if (body.mesh) {
            body.mesh.position.copy(body.position)
            body.mesh.quaternion.copy(body.quaternion)
        }
    }
    
    handleCollision(bodyA, bodyB, manifold) {
        // Calculate collision response
        const restitution = Math.max(bodyA.restitution, bodyB.restitution)
        const friction = Math.sqrt(bodyA.friction * bodyB.friction)
        
        manifold.contacts.forEach(contact => {
            this.resolveCollision(bodyA, bodyB, contact, restitution, friction)
        })
        
        // Trigger collision events
        bodyA.onCollision?.(bodyB, manifold)
        bodyB.onCollision?.(bodyA, manifold)
    }
    
    resolveCollision(bodyA, bodyB, contact, restitution, friction) {
        const { point, normal, penetration } = contact
        
        // Separate penetrating objects
        if (penetration > 0) {
            const separation = normal.clone().multiplyScalar(penetration * 0.5)
            
            if (bodyA.dynamic) bodyA.position.sub(separation)
            if (bodyB.dynamic) bodyB.position.add(separation)
        }
        
        // Calculate relative velocity
        const relativeVelocity = bodyB.velocity.clone().sub(bodyA.velocity)
        const velocityAlongNormal = relativeVelocity.dot(normal)
        
        // Don't resolve if velocities are separating
        if (velocityAlongNormal > 0) return
        
        // Calculate impulse
        const impulseScalar = -(1 + restitution) * velocityAlongNormal
        const totalMass = (bodyA.dynamic ? 1 / bodyA.mass : 0) + (bodyB.dynamic ? 1 / bodyB.mass : 0)
        
        if (totalMass === 0) return
        
        const impulse = normal.clone().multiplyScalar(impulseScalar / totalMass)
        
        // Apply impulse
        if (bodyA.dynamic) {
            bodyA.velocity.sub(impulse.clone().divideScalar(bodyA.mass))
        }
        
        if (bodyB.dynamic) {
            bodyB.velocity.add(impulse.clone().divideScalar(bodyB.mass))
        }
        
        // Apply friction
        const tangent = relativeVelocity.clone().sub(normal.clone().multiplyScalar(velocityAlongNormal))
        
        if (tangent.length() > 0) {
            tangent.normalize()
            
            const frictionImpulse = tangent.clone().multiplyScalar(-friction * impulseScalar / totalMass)
            
            if (bodyA.dynamic) {
                bodyA.velocity.sub(frictionImpulse.clone().divideScalar(bodyA.mass))
            }
            
            if (bodyB.dynamic) {
                bodyB.velocity.add(frictionImpulse.clone().divideScalar(bodyB.mass))
            }
        }
    }
    
    interpolate(alpha) {
        // Interpolate visual positions for smooth rendering
        this.bodies.forEach(body => {
            if (body.mesh && body.dynamic) {
                body.mesh.position.lerpVectors(body.prevPosition, body.position, alpha)
                body.mesh.quaternion.slerpQuaternions(body.prevQuaternion, body.quaternion, alpha)
            }
        })
    }
    
    addBody(body) {
        this.bodies.set(body.id, body)
        
        // Store previous state for interpolation
        body.prevPosition = body.position.clone()
        body.prevQuaternion = body.quaternion.clone()
        
        // Add to appropriate collection
        if (body.type === 'dynamic') {
            this.dynamicBodies.set(body.id, body)
        } else if (body.type === 'static') {
            this.staticBodies.set(body.id, body)
        } else if (body.type === 'kinematic') {
            this.kinematicBodies.set(body.id, body)
        }
        
        // Add to broadphase
        this.broadphase.addBody(body)
    }
    
    removeBody(bodyId) {
        const body = this.bodies.get(bodyId)
        if (!body) return
        
        this.bodies.delete(bodyId)
        this.dynamicBodies.delete(bodyId)
        this.staticBodies.delete(bodyId)
        this.kinematicBodies.delete(bodyId)
        
        this.broadphase.removeBody(body)
    }
    
    addConstraint(constraint) {
        this.constraints.push(constraint)
    }
    
    removeConstraint(constraint) {
        const index = this.constraints.indexOf(constraint)
        if (index > -1) {
            this.constraints.splice(index, 1)
        }
    }
    
    raycast(origin, direction, maxDistance = 1000) {
        const hits = []
        
        this.bodies.forEach(body => {
            const hit = body.shape.raycast(origin, direction, maxDistance, body.position, body.quaternion)
            if (hit) {
                hits.push({ body, ...hit })
            }
        })
        
        return hits.sort((a, b) => a.distance - b.distance)
    }
}

// Physics Body
export class PhysicsBody {
    constructor(options = {}) {
        this.id = options.id || Math.random().toString(36).substr(2, 9)
        this.type = options.type || 'dynamic' // 'static', 'dynamic', 'kinematic'
        
        // Transform
        this.position = options.position || new THREE.Vector3()
        this.quaternion = options.quaternion || new THREE.Quaternion()
        this.scale = options.scale || new THREE.Vector3(1, 1, 1)
        
        // Physics properties
        this.mass = options.mass || 1
        this.density = options.density || 1
        this.restitution = options.restitution || 0.3 // Bounciness
        this.friction = options.friction || 0.5
        this.linearDamping = options.linearDamping || 0.1
        this.angularDamping = options.angularDamping || 0.1
        
        // Dynamic properties
        this.velocity = new THREE.Vector3()
        this.angularVelocity = new THREE.Vector3()
        this.force = new THREE.Vector3()
        this.torque = new THREE.Vector3()
        
        // Shape
        this.shape = options.shape
        
        // Visual representation
        this.mesh = options.mesh
        
        // Collision filtering
        this.collisionGroup = options.collisionGroup || 1
        this.collisionMask = options.collisionMask || 0xFFFFFFFF
        
        // Callbacks
        this.onCollision = options.onCollision
        
        // Calculate mass from density and shape volume
        if (this.shape && options.density && !options.mass) {
            this.mass = this.shape.getVolume() * this.density
        }
        
        // Static bodies have infinite mass
        if (this.type === 'static') {
            this.mass = 0
        }
        
        this.dynamic = this.type === 'dynamic' && this.mass > 0
    }
    
    applyForce(force, point) {
        if (!this.dynamic) return
        
        this.force.add(force)
        
        if (point) {
            const torque = new THREE.Vector3()
            torque.crossVectors(point.clone().sub(this.position), force)
            this.torque.add(torque)
        }
    }
    
    applyImpulse(impulse, point) {
        if (!this.dynamic) return
        
        this.velocity.add(impulse.clone().divideScalar(this.mass))
        
        if (point) {
            const angularImpulse = new THREE.Vector3()
            angularImpulse.crossVectors(point.clone().sub(this.position), impulse)
            // Note: This is simplified - should use inverse inertia tensor
            this.angularVelocity.add(angularImpulse.divideScalar(this.mass))
        }
    }
    
    setPosition(position) {
        this.position.copy(position)
        if (this.mesh) {
            this.mesh.position.copy(position)
        }
    }
    
    setRotation(quaternion) {
        this.quaternion.copy(quaternion)
        if (this.mesh) {
            this.mesh.quaternion.copy(quaternion)
        }
    }
}

// Collision Shapes
export class CollisionShape {
    constructor(type) {
        this.type = type
        this.localTransform = new THREE.Matrix4()
    }
    
    getVolume() {
        return 1 // Override in subclasses
    }
    
    getBoundingBox(position, quaternion) {
        return new THREE.Box3() // Override in subclasses
    }
    
    raycast(origin, direction, maxDistance, bodyPosition, bodyQuaternion) {
        return null // Override in subclasses
    }
}

export class SphereShape extends CollisionShape {
    constructor(radius) {
        super('sphere')
        this.radius = radius
    }
    
    getVolume() {
        return (4/3) * Math.PI * Math.pow(this.radius, 3)
    }
    
    getBoundingBox(position, quaternion) {
        const box = new THREE.Box3()
        box.setFromCenterAndSize(position, new THREE.Vector3(
            this.radius * 2,
            this.radius * 2,
            this.radius * 2
        ))
        return box
    }
    
    raycast(origin, direction, maxDistance, bodyPosition, bodyQuaternion) {
        const oc = origin.clone().sub(bodyPosition)
        const a = direction.dot(direction)
        const b = 2.0 * oc.dot(direction)
        const c = oc.dot(oc) - this.radius * this.radius
        
        const discriminant = b * b - 4 * a * c
        
        if (discriminant < 0) return null
        
        const distance = (-b - Math.sqrt(discriminant)) / (2.0 * a)
        
        if (distance < 0 || distance > maxDistance) return null
        
        const point = origin.clone().add(direction.clone().multiplyScalar(distance))
        const normal = point.clone().sub(bodyPosition).normalize()
        
        return { distance, point, normal }
    }
}

export class BoxShape extends CollisionShape {
    constructor(halfExtents) {
        super('box')
        this.halfExtents = halfExtents.clone()
    }
    
    getVolume() {
        return 8 * this.halfExtents.x * this.halfExtents.y * this.halfExtents.z
    }
    
    getBoundingBox(position, quaternion) {
        // This is simplified - should account for rotation
        const box = new THREE.Box3()
        box.setFromCenterAndSize(position, this.halfExtents.clone().multiplyScalar(2))
        return box
    }
    
    raycast(origin, direction, maxDistance, bodyPosition, bodyQuaternion) {
        // Transform ray to local space
        const localOrigin = origin.clone().sub(bodyPosition)
        const localDirection = direction.clone()
        
        // Apply inverse rotation
        const inverseQuaternion = bodyQuaternion.clone().invert()
        localOrigin.applyQuaternion(inverseQuaternion)
        localDirection.applyQuaternion(inverseQuaternion)
        
        // AABB ray intersection
        const invDir = new THREE.Vector3(1 / localDirection.x, 1 / localDirection.y, 1 / localDirection.z)
        
        const t1 = (-this.halfExtents.x - localOrigin.x) * invDir.x
        const t2 = (this.halfExtents.x - localOrigin.x) * invDir.x
        const t3 = (-this.halfExtents.y - localOrigin.y) * invDir.y
        const t4 = (this.halfExtents.y - localOrigin.y) * invDir.y
        const t5 = (-this.halfExtents.z - localOrigin.z) * invDir.z
        const t6 = (this.halfExtents.z - localOrigin.z) * invDir.z
        
        const tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)), Math.min(t5, t6))
        const tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)), Math.max(t5, t6))
        
        if (tmax < 0 || tmin > tmax || tmin > maxDistance) return null
        
        const distance = tmin < 0 ? tmax : tmin
        const localPoint = localOrigin.clone().add(localDirection.clone().multiplyScalar(distance))
        
        // Calculate normal
        let normal = new THREE.Vector3()
        const absPoint = new THREE.Vector3(Math.abs(localPoint.x), Math.abs(localPoint.y), Math.abs(localPoint.z))
        
        if (absPoint.x > absPoint.y && absPoint.x > absPoint.z) {
            normal.set(Math.sign(localPoint.x), 0, 0)
        } else if (absPoint.y > absPoint.z) {
            normal.set(0, Math.sign(localPoint.y), 0)
        } else {
            normal.set(0, 0, Math.sign(localPoint.z))
        }
        
        // Transform back to world space
        const worldPoint = localPoint.applyQuaternion(bodyQuaternion).add(bodyPosition)
        const worldNormal = normal.applyQuaternion(bodyQuaternion)
        
        return { distance, point: worldPoint, normal: worldNormal }
    }
}

export class CapsuleShape extends CollisionShape {
    constructor(radius, height) {
        super('capsule')
        this.radius = radius
        this.height = height
    }
    
    getVolume() {
        const cylinderVolume = Math.PI * this.radius * this.radius * this.height
        const sphereVolume = (4/3) * Math.PI * Math.pow(this.radius, 3)
        return cylinderVolume + sphereVolume
    }
    
    getBoundingBox(position, quaternion) {
        const box = new THREE.Box3()
        box.setFromCenterAndSize(position, new THREE.Vector3(
            this.radius * 2,
            this.height + this.radius * 2,
            this.radius * 2
        ))
        return box
    }
}

// Broadphase Collision Detection
class SpatialHashBroadphase {
    constructor(cellSize = 10) {
        this.cellSize = cellSize
        this.grid = new Map()
    }
    
    addBody(body) {
        const cells = this.getCells(body)
        cells.forEach(cell => {
            if (!this.grid.has(cell)) {
                this.grid.set(cell, new Set())
            }
            this.grid.get(cell).add(body)
        })
    }
    
    removeBody(body) {
        const cells = this.getCells(body)
        cells.forEach(cell => {
            const cellBodies = this.grid.get(cell)
            if (cellBodies) {
                cellBodies.delete(body)
                if (cellBodies.size === 0) {
                    this.grid.delete(cell)
                }
            }
        })
    }
    
    detectPairs(bodies) {
        const pairs = new Set()
        const checked = new Set()
        
        bodies.forEach(body => {
            const cells = this.getCells(body)
            const potentialColliders = new Set()
            
            cells.forEach(cell => {
                const cellBodies = this.grid.get(cell)
                if (cellBodies) {
                    cellBodies.forEach(otherBody => {
                        if (otherBody !== body && !checked.has(this.getPairKey(body, otherBody))) {
                            potentialColliders.add(otherBody)
                        }
                    })
                }
            })
            
            potentialColliders.forEach(otherBody => {
                const pairKey = this.getPairKey(body, otherBody)
                if (!checked.has(pairKey)) {
                    pairs.add([body, otherBody])
                    checked.add(pairKey)
                }
            })
        })
        
        return Array.from(pairs)
    }
    
    getCells(body) {
        const bbox = body.shape.getBoundingBox(body.position, body.quaternion)
        const cells = []
        
        const minX = Math.floor(bbox.min.x / this.cellSize)
        const maxX = Math.floor(bbox.max.x / this.cellSize)
        const minY = Math.floor(bbox.min.y / this.cellSize)
        const maxY = Math.floor(bbox.max.y / this.cellSize)
        const minZ = Math.floor(bbox.min.z / this.cellSize)
        const maxZ = Math.floor(bbox.max.z / this.cellSize)
        
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    cells.push(`${x},${y},${z}`)
                }
            }
        }
        
        return cells
    }
    
    getPairKey(bodyA, bodyB) {
        return bodyA.id < bodyB.id ? `${bodyA.id}-${bodyB.id}` : `${bodyB.id}-${bodyA.id}`
    }
}

// Narrowphase Collision Detection using SAT
class SATNarrowphase {
    testCollision(bodyA, bodyB) {
        const shapeA = bodyA.shape
        const shapeB = bodyB.shape
        
        // Sphere-Sphere collision
        if (shapeA.type === 'sphere' && shapeB.type === 'sphere') {
            return this.sphereVsSphere(bodyA, bodyB)
        }
        
        // Box-Box collision
        if (shapeA.type === 'box' && shapeB.type === 'box') {
            return this.boxVsBox(bodyA, bodyB)
        }
        
        // Sphere-Box collision
        if ((shapeA.type === 'sphere' && shapeB.type === 'box') ||
            (shapeA.type === 'box' && shapeB.type === 'sphere')) {
            return this.sphereVsBox(
                shapeA.type === 'sphere' ? bodyA : bodyB,
                shapeA.type === 'box' ? bodyA : bodyB
            )
        }
        
        return null
    }
    
    sphereVsSphere(bodyA, bodyB) {
        const distance = bodyA.position.distanceTo(bodyB.position)
        const radiusSum = bodyA.shape.radius + bodyB.shape.radius
        
        if (distance < radiusSum) {
            const normal = bodyB.position.clone().sub(bodyA.position).normalize()
            const penetration = radiusSum - distance
            const contactPoint = bodyA.position.clone().add(
                normal.clone().multiplyScalar(bodyA.shape.radius - penetration * 0.5)
            )
            
            return {
                contacts: [{
                    point: contactPoint,
                    normal: normal,
                    penetration: penetration
                }]
            }
        }
        
        return null
    }
    
    sphereVsBox(sphereBody, boxBody) {
        // Transform sphere center to box local space
        const localSpherePos = sphereBody.position.clone().sub(boxBody.position)
        const inverseQuat = boxBody.quaternion.clone().invert()
        localSpherePos.applyQuaternion(inverseQuat)
        
        // Find closest point on box to sphere center
        const closestPoint = new THREE.Vector3(
            Math.max(-boxBody.shape.halfExtents.x, Math.min(boxBody.shape.halfExtents.x, localSpherePos.x)),
            Math.max(-boxBody.shape.halfExtents.y, Math.min(boxBody.shape.halfExtents.y, localSpherePos.y)),
            Math.max(-boxBody.shape.halfExtents.z, Math.min(boxBody.shape.halfExtents.z, localSpherePos.z))
        )
        
        const distance = localSpherePos.distanceTo(closestPoint)
        
        if (distance < sphereBody.shape.radius) {
            let normal
            
            if (distance === 0) {
                // Sphere center is inside box
                const d = new THREE.Vector3(
                    boxBody.shape.halfExtents.x - Math.abs(localSpherePos.x),
                    boxBody.shape.halfExtents.y - Math.abs(localSpherePos.y),
                    boxBody.shape.halfExtents.z - Math.abs(localSpherePos.z)
                )
                
                if (d.x < d.y && d.x < d.z) {
                    normal = new THREE.Vector3(Math.sign(localSpherePos.x), 0, 0)
                } else if (d.y < d.z) {
                    normal = new THREE.Vector3(0, Math.sign(localSpherePos.y), 0)
                } else {
                    normal = new THREE.Vector3(0, 0, Math.sign(localSpherePos.z))
                }
            } else {
                normal = localSpherePos.clone().sub(closestPoint).normalize()
            }
            
            // Transform normal back to world space
            normal.applyQuaternion(boxBody.quaternion)
            
            const penetration = sphereBody.shape.radius - distance
            const contactPoint = closestPoint.applyQuaternion(boxBody.quaternion).add(boxBody.position)
            
            return {
                contacts: [{
                    point: contactPoint,
                    normal: normal,
                    penetration: penetration
                }]
            }
        }
        
        return null
    }
    
    boxVsBox(bodyA, bodyB) {
        // Simplified OBB vs OBB using SAT
        // This is a complex algorithm - here's a basic implementation
        const aabb1 = bodyA.shape.getBoundingBox(bodyA.position, bodyA.quaternion)
        const aabb2 = bodyB.shape.getBoundingBox(bodyB.position, bodyB.quaternion)
        
        if (aabb1.intersectsBox(aabb2)) {
            // Calculate overlap
            const overlap = new THREE.Vector3(
                Math.min(aabb1.max.x, aabb2.max.x) - Math.max(aabb1.min.x, aabb2.min.x),
                Math.min(aabb1.max.y, aabb2.max.y) - Math.max(aabb1.min.y, aabb2.min.y),
                Math.min(aabb1.max.z, aabb2.max.z) - Math.max(aabb1.min.z, aabb2.min.z)
            )
            
            // Find minimum overlap axis
            let normal = new THREE.Vector3()
            let minOverlap = Infinity
            
            if (overlap.x < minOverlap) {
                minOverlap = overlap.x
                normal.set(bodyA.position.x < bodyB.position.x ? -1 : 1, 0, 0)
            }
            
            if (overlap.y < minOverlap) {
                minOverlap = overlap.y
                normal.set(0, bodyA.position.y < bodyB.position.y ? -1 : 1, 0)
            }
            
            if (overlap.z < minOverlap) {
                minOverlap = overlap.z
                normal.set(0, 0, bodyA.position.z < bodyB.position.z ? -1 : 1)
            }
            
            const contactPoint = bodyA.position.clone().lerp(bodyB.position, 0.5)
            
            return {
                contacts: [{
                    point: contactPoint,
                    normal: normal,
                    penetration: minOverlap
                }]
            }
        }
        
        return null
    }
}

// Constraints
export class DistanceConstraint {
    constructor(bodyA, bodyB, distance, stiffness = 1.0) {
        this.bodyA = bodyA
        this.bodyB = bodyB
        this.distance = distance
        this.stiffness = stiffness
    }
    
    solve(dt) {
        const currentDistance = this.bodyA.position.distanceTo(this.bodyB.position)
        const difference = currentDistance - this.distance
        
        if (Math.abs(difference) < 0.001) return
        
        const direction = this.bodyB.position.clone().sub(this.bodyA.position).normalize()
        const correction = direction.multiplyScalar(difference * 0.5 * this.stiffness)
        
        if (this.bodyA.dynamic) {
            this.bodyA.position.add(correction)
        }
        
        if (this.bodyB.dynamic) {
            this.bodyB.position.sub(correction)
        }
    }
}

export class SpringConstraint {
    constructor(bodyA, bodyB, restLength, stiffness, damping) {
        this.bodyA = bodyA
        this.bodyB = bodyB
        this.restLength = restLength
        this.stiffness = stiffness
        this.damping = damping
    }
    
    solve(dt) {
        const direction = this.bodyB.position.clone().sub(this.bodyA.position)
        const currentLength = direction.length()
        
        if (currentLength === 0) return
        
        direction.normalize()
        
        // Spring force
        const springForce = (currentLength - this.restLength) * this.stiffness
        
        // Damping force
        const relativeVelocity = this.bodyB.velocity.clone().sub(this.bodyA.velocity)
        const dampingForce = relativeVelocity.dot(direction) * this.damping
        
        const totalForce = direction.multiplyScalar(springForce + dampingForce)
        
        if (this.bodyA.dynamic) {
            this.bodyA.applyForce(totalForce.clone())
        }
        
        if (this.bodyB.dynamic) {
            this.bodyB.applyForce(totalForce.clone().negate())
        }
    }
}

export default {
    PhysicsWorld,
    PhysicsBody,
    SphereShape,
    BoxShape,
    CapsuleShape,
    DistanceConstraint,
    SpringConstraint
}