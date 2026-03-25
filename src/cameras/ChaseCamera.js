/*
    GRUDGE Engine - Chase Camera Controller
    Smooth-following camera that keeps target in view
*/

import * as THREE from 'three'

export class ChaseCamera {
    constructor(camera, options = {}) {
        this.camera = camera
        this.target = null
        this.enabled = true
        
        this.offset = new THREE.Vector3(
            options.offsetX || 0,
            options.offsetY || 3,
            options.offsetZ || 8
        )
        
        this.lookAtOffset = new THREE.Vector3(
            options.lookAtX || 0,
            options.lookAtY || 1.5,
            options.lookAtZ || 0
        )
        
        this.smoothness = options.smoothness || 0.1
        this.rotationSmoothness = options.rotationSmoothness || 0.08
        this.minDistance = options.minDistance || 3
        this.maxDistance = options.maxDistance || 15
        this.collisionOffset = options.collisionOffset || 0.3
        
        this.currentPosition = new THREE.Vector3()
        this.currentLookAt = new THREE.Vector3()
        this.idealPosition = new THREE.Vector3()
        this.idealLookAt = new THREE.Vector3()
        
        this.raycaster = new THREE.Raycaster()
        this.collisionLayers = []
        
        this.shakeIntensity = 0
        this.shakeDecay = 0.9
        
        if (camera) {
            this.currentPosition.copy(camera.position)
        }
    }
    
    setTarget(object) {
        this.target = object
    }
    
    setOffset(x, y, z) {
        this.offset.set(x, y, z)
    }
    
    setLookAtOffset(x, y, z) {
        this.lookAtOffset.set(x, y, z)
    }
    
    setSmoothness(value) {
        this.smoothness = Math.max(0.01, Math.min(1, value))
    }
    
    addCollisionLayer(mesh) {
        this.collisionLayers.push(mesh)
    }
    
    clearCollisionLayers() {
        this.collisionLayers = []
    }
    
    shake(intensity) {
        this.shakeIntensity = intensity
    }
    
    getIdealPosition() {
        if (!this.target) return this.camera.position.clone()
        
        const targetPosition = new THREE.Vector3()
        this.target.getWorldPosition(targetPosition)
        
        const targetRotation = new THREE.Quaternion()
        this.target.getWorldQuaternion(targetRotation)
        
        const rotatedOffset = this.offset.clone().applyQuaternion(targetRotation)
        
        this.idealPosition.copy(targetPosition).add(rotatedOffset)
        
        return this.idealPosition
    }
    
    getIdealLookAt() {
        if (!this.target) return new THREE.Vector3(0, 0, 0)
        
        const targetPosition = new THREE.Vector3()
        this.target.getWorldPosition(targetPosition)
        
        this.idealLookAt.copy(targetPosition).add(this.lookAtOffset)
        
        return this.idealLookAt
    }
    
    checkCollision(start, end) {
        if (this.collisionLayers.length === 0) return end.clone()
        
        const direction = end.clone().sub(start).normalize()
        const distance = start.distanceTo(end)
        
        this.raycaster.set(start, direction)
        this.raycaster.far = distance
        
        const intersects = this.raycaster.intersectObjects(this.collisionLayers, true)
        
        if (intersects.length > 0) {
            const hit = intersects[0]
            const safePosition = hit.point.clone()
            safePosition.sub(direction.multiplyScalar(this.collisionOffset))
            return safePosition
        }
        
        return end.clone()
    }
    
    update(deltaTime) {
        if (!this.enabled || !this.target || !this.camera) return
        
        const idealPos = this.getIdealPosition()
        const idealLook = this.getIdealLookAt()
        
        const targetPos = new THREE.Vector3()
        this.target.getWorldPosition(targetPos)
        const safePos = this.checkCollision(targetPos.clone().add(this.lookAtOffset), idealPos)
        
        const lerpFactor = 1 - Math.pow(1 - this.smoothness, deltaTime * 60)
        
        this.currentPosition.lerp(safePos, lerpFactor)
        this.currentLookAt.lerp(idealLook, lerpFactor)
        
        if (this.shakeIntensity > 0.001) {
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity
            const shakeZ = (Math.random() - 0.5) * this.shakeIntensity
            
            this.currentPosition.x += shakeX
            this.currentPosition.y += shakeY
            this.currentPosition.z += shakeZ
            
            this.shakeIntensity *= this.shakeDecay
        }
        
        this.camera.position.copy(this.currentPosition)
        this.camera.lookAt(this.currentLookAt)
    }
    
    snapToTarget() {
        if (!this.target) return
        
        this.currentPosition.copy(this.getIdealPosition())
        this.currentLookAt.copy(this.getIdealLookAt())
        this.camera.position.copy(this.currentPosition)
        this.camera.lookAt(this.currentLookAt)
    }
    
    enable() {
        this.enabled = true
    }
    
    disable() {
        this.enabled = false
    }
    
    isEnabled() {
        return this.enabled
    }
    
    getDistanceToTarget() {
        if (!this.target) return 0
        const targetPos = new THREE.Vector3()
        this.target.getWorldPosition(targetPos)
        return this.camera.position.distanceTo(targetPos)
    }
    
    setDistanceFromTarget(distance) {
        const clamped = Math.max(this.minDistance, Math.min(this.maxDistance, distance))
        const currentDist = this.offset.length()
        const scale = clamped / currentDist
        this.offset.multiplyScalar(scale)
    }
    
    dispose() {
        this.target = null
        this.collisionLayers = []
    }
}

export default ChaseCamera
