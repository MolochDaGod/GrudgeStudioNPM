import * as THREE from 'three'
import { getPhysicsManager } from '../core/PhysicsManager.js'
import { Layers, LayerMasks } from '../core/Layers.js'

export class CollisionLayer {
  constructor(fighter) {
    this.fighter = fighter
    this.physics = null
    this.rigidBody = null
    this.collider = null
    this.hitboxes = new Map()
    
    this.capsuleRadius = 0.4
    this.capsuleHalfHeight = 0.8
    
    this.onCollisionStart = null
    this.onCollisionEnd = null
    this.onHitboxContact = null
  }
  
  async init(position = { x: 0, y: 0, z: 0 }) {
    try {
      this.physics = await getPhysicsManager()
      
      this.rigidBody = this.physics.createKinematicBody({
        x: position.x,
        y: position.y + this.capsuleHalfHeight + this.capsuleRadius,
        z: position.z
      })
      
      this.collider = this.physics.createCapsuleCollider(
        this.rigidBody,
        this.capsuleHalfHeight,
        this.capsuleRadius
      )
      
      if (this.collider) {
        this.collider.setActiveEvents(0x0001 | 0x0002)
      }
      
      console.log('Collision layer initialized for fighter')
    } catch (error) {
      console.warn('Failed to initialize collision layer:', error)
    }
  }
  
  syncToMesh(mesh) {
    if (!this.rigidBody) return
    
    const position = mesh.position
    this.physics.setBodyPosition(this.rigidBody, {
      x: position.x,
      y: position.y + this.capsuleHalfHeight + this.capsuleRadius,
      z: position.z
    })
    
    const quaternion = new THREE.Quaternion()
    mesh.getWorldQuaternion(quaternion)
    this.physics.setBodyRotation(this.rigidBody, {
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
      w: quaternion.w
    })
  }
  
  createHitbox(name, config = {}) {
    const {
      offset = { x: 0, y: 1, z: 0 },
      size = { x: 0.5, y: 0.5, z: 0.5 },
      damage = 10,
      knockback = 1,
      duration = 0.2
    } = config
    
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    })
    
    const hitboxMesh = new THREE.Mesh(geometry, material)
    hitboxMesh.position.set(offset.x, offset.y, offset.z)
    hitboxMesh.visible = false
    hitboxMesh.layers.set(Layers.EFFECTS)
    
    const hitbox = {
      mesh: hitboxMesh,
      offset: offset,
      size: size,
      damage: damage,
      knockback: knockback,
      duration: duration,
      active: false,
      timer: 0,
      hitTargets: new Set()
    }
    
    this.hitboxes.set(name, hitbox)
    return hitboxMesh
  }
  
  activateHitbox(name, startDelay = 0) {
    const hitbox = this.hitboxes.get(name)
    if (!hitbox) return
    
    setTimeout(() => {
      hitbox.active = true
      hitbox.timer = hitbox.duration
      hitbox.hitTargets.clear()
      hitbox.mesh.visible = true
    }, startDelay * 1000)
  }
  
  deactivateHitbox(name) {
    const hitbox = this.hitboxes.get(name)
    if (!hitbox) return
    
    hitbox.active = false
    hitbox.timer = 0
    hitbox.mesh.visible = false
    hitbox.hitTargets.clear()
  }
  
  update(deltaTime, fighterMesh) {
    this.syncToMesh(fighterMesh)
    
    for (const [name, hitbox] of this.hitboxes) {
      if (hitbox.active) {
        hitbox.timer -= deltaTime
        
        hitbox.mesh.position.set(
          fighterMesh.position.x + hitbox.offset.x,
          fighterMesh.position.y + hitbox.offset.y,
          fighterMesh.position.z + hitbox.offset.z
        )
        hitbox.mesh.rotation.copy(fighterMesh.rotation)
        
        if (hitbox.timer <= 0) {
          this.deactivateHitbox(name)
        }
      }
    }
  }
  
  checkHitboxCollision(targetCollider) {
    const results = []
    
    for (const [name, hitbox] of this.hitboxes) {
      if (!hitbox.active) continue
      if (hitbox.hitTargets.has(targetCollider.id)) continue
      
      const hitboxBox = new THREE.Box3().setFromObject(hitbox.mesh)
      const targetBox = new THREE.Box3()
      
      if (targetCollider.mesh) {
        targetBox.setFromObject(targetCollider.mesh)
      }
      
      if (hitboxBox.intersectsBox(targetBox)) {
        hitbox.hitTargets.add(targetCollider.id)
        results.push({
          hitboxName: name,
          damage: hitbox.damage,
          knockback: hitbox.knockback
        })
      }
    }
    
    return results
  }
  
  checkHitboxAgainstFighter(targetFighter) {
    if (!targetFighter || !targetFighter.group) return []
    
    const results = []
    const targetBox = new THREE.Box3().setFromObject(targetFighter.group)
    
    for (const [name, hitbox] of this.hitboxes) {
      if (!hitbox.active) continue
      
      const targetId = targetFighter.group.uuid
      if (hitbox.hitTargets.has(targetId)) continue
      
      const hitboxBox = new THREE.Box3().setFromObject(hitbox.mesh)
      
      if (hitboxBox.intersectsBox(targetBox)) {
        hitbox.hitTargets.add(targetId)
        results.push({
          hitboxName: name,
          damage: hitbox.damage,
          knockback: hitbox.knockback,
          hitbox: hitbox
        })
        
        if (this.onHitboxContact) {
          this.onHitboxContact(name, targetFighter, hitbox)
        }
      }
    }
    
    return results
  }
  
  raycast(origin, direction, maxDistance = 10) {
    if (!this.physics) return null
    return this.physics.castRay(origin, direction, maxDistance)
  }
  
  getWorldHitboxPosition(name) {
    const hitbox = this.hitboxes.get(name)
    if (!hitbox) return null
    
    const worldPos = new THREE.Vector3()
    hitbox.mesh.getWorldPosition(worldPos)
    return worldPos
  }
  
  dispose() {
    if (this.rigidBody && this.physics) {
      this.physics.removeBody(this.rigidBody)
    }
    
    for (const [name, hitbox] of this.hitboxes) {
      if (hitbox.mesh) {
        hitbox.mesh.geometry.dispose()
        hitbox.mesh.material.dispose()
      }
    }
    this.hitboxes.clear()
  }
}
