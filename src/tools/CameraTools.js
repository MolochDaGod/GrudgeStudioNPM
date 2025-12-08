/**
 * Advanced Camera Systems for Grudge Studio
 * Multiple camera types and cinematic tools based on Three.js examples
 */

import * as THREE from 'three'

// Base Camera System
export class BaseCameraSystem {
    constructor(camera, options = {}) {
        this.camera = camera
        this.target = options.target || new THREE.Vector3()
        this.enabled = true
        
        // Camera constraints
        this.constraints = {
            distance: { min: 1, max: 100 },
            polar: { min: 0, max: Math.PI },
            azimuth: { min: -Infinity, max: Infinity },
            zoom: { min: 0.1, max: 10 }
        }
        
        // Animation system
        this.animations = new Map()
        this.tweens = []
        
        // Events
        this.callbacks = new Map()
    }
    
    update(deltaTime) {
        // Update tweens
        this.tweens = this.tweens.filter(tween => {
            tween.update(deltaTime)
            return !tween.isComplete()
        })
    }
    
    // Camera transition system
    transitionTo(targetCamera, duration = 1000, easing = 'easeInOutQuad') {
        const startPosition = this.camera.position.clone()
        const startRotation = this.camera.quaternion.clone()
        const startFov = this.camera.fov
        
        const endPosition = targetCamera.position.clone()
        const endRotation = targetCamera.quaternion.clone()
        const endFov = targetCamera.fov || startFov
        
        return new Promise(resolve => {
            const tween = new CameraTween({
                duration,
                easing,
                onUpdate: (progress) => {
                    this.camera.position.lerpVectors(startPosition, endPosition, progress)
                    this.camera.quaternion.slerpQuaternions(startRotation, endRotation, progress)
                    this.camera.fov = THREE.MathUtils.lerp(startFov, endFov, progress)
                    this.camera.updateProjectionMatrix()
                },
                onComplete: () => {
                    this.triggerCallback('transitionComplete')
                    resolve()
                }
            })
            
            this.tweens.push(tween)
        })
    }
    
    // Shake effect
    shake(intensity = 1, duration = 500) {
        const originalPosition = this.camera.position.clone()
        const shakeOffset = new THREE.Vector3()
        
        const tween = new CameraTween({
            duration,
            onUpdate: (progress) => {
                const shakeAmount = intensity * (1 - progress)
                shakeOffset.set(
                    (Math.random() - 0.5) * shakeAmount,
                    (Math.random() - 0.5) * shakeAmount,
                    (Math.random() - 0.5) * shakeAmount
                )
                this.camera.position.copy(originalPosition).add(shakeOffset)
            },
            onComplete: () => {
                this.camera.position.copy(originalPosition)
            }
        })
        
        this.tweens.push(tween)
    }
    
    // Event system
    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, [])
        }
        this.callbacks.get(event).push(callback)
    }
    
    triggerCallback(event, data) {
        const callbacks = this.callbacks.get(event)
        if (callbacks) {
            callbacks.forEach(cb => cb(data))
        }
    }
    
    // Utility methods
    lookAt(target, smooth = false, speed = 2) {
        if (smooth) {
            const targetQuaternion = new THREE.Quaternion()
            const lookMatrix = new THREE.Matrix4().lookAt(this.camera.position, target, this.camera.up)
            targetQuaternion.setFromRotationMatrix(lookMatrix)
            
            this.camera.quaternion.slerp(targetQuaternion, speed * 0.016) // Assuming 60fps
        } else {
            this.camera.lookAt(target)
        }
    }
}

// Orbit Camera Controller
export class OrbitCameraController extends BaseCameraSystem {
    constructor(camera, domElement, options = {}) {
        super(camera, options)
        
        this.domElement = domElement
        this.autoRotate = options.autoRotate || false
        this.autoRotateSpeed = options.autoRotateSpeed || 2.0
        
        // Spherical coordinates
        this.spherical = new THREE.Spherical()
        this.sphericalDelta = new THREE.Spherical()
        
        // State
        this.state = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2
        }
        this.currentState = this.state.NONE
        
        // Mouse/touch state
        this.rotateStart = new THREE.Vector2()
        this.rotateEnd = new THREE.Vector2()
        this.rotateDelta = new THREE.Vector2()
        
        this.panStart = new THREE.Vector2()
        this.panEnd = new THREE.Vector2()
        this.panDelta = new THREE.Vector2()
        
        this.dollyStart = new THREE.Vector2()
        this.dollyEnd = new THREE.Vector2()
        this.dollyDelta = new THREE.Vector2()
        
        // Settings
        this.enableRotate = options.enableRotate !== false
        this.enableZoom = options.enableZoom !== false
        this.enablePan = options.enablePan !== false
        this.enableDamping = options.enableDamping || false
        this.dampingFactor = options.dampingFactor || 0.05
        
        // Speed settings
        this.rotateSpeed = options.rotateSpeed || 1.0
        this.zoomSpeed = options.zoomSpeed || 1.0
        this.panSpeed = options.panSpeed || 1.0
        
        this.setupEventListeners()
        this.updateCamera()
    }
    
    setupEventListeners() {
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this))
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault())
        
        // Touch events
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this))
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this))
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this))
    }
    
    update(deltaTime) {
        super.update(deltaTime)
        
        if (this.autoRotate && this.currentState === this.state.NONE) {
            this.rotateLeft(this.getAutoRotationAngle(deltaTime))
        }
        
        if (this.enableDamping) {
            this.sphericalDelta.theta *= (1 - this.dampingFactor)
            this.sphericalDelta.phi *= (1 - this.dampingFactor)
        }
        
        this.updateCamera()
    }
    
    updateCamera() {
        const offset = new THREE.Vector3()
        
        // Calculate spherical coordinates
        offset.copy(this.camera.position).sub(this.target)
        this.spherical.setFromVector3(offset)
        
        this.spherical.theta += this.sphericalDelta.theta
        this.spherical.phi += this.sphericalDelta.phi
        
        // Apply constraints
        this.spherical.phi = Math.max(
            this.constraints.polar.min,
            Math.min(this.constraints.polar.max, this.spherical.phi)
        )
        
        this.spherical.radius = Math.max(
            this.constraints.distance.min,
            Math.min(this.constraints.distance.max, this.spherical.radius)
        )
        
        // Update camera position
        offset.setFromSpherical(this.spherical)
        this.camera.position.copy(this.target).add(offset)
        this.camera.lookAt(this.target)
        
        if (!this.enableDamping) {
            this.sphericalDelta.set(0, 0, 0)
        }
    }
    
    onMouseDown(event) {
        if (!this.enabled) return
        
        event.preventDefault()
        
        switch (event.button) {
            case 0: // Left button
                if (this.enableRotate) {
                    this.handleMouseDownRotate(event)
                    this.currentState = this.state.ROTATE
                }
                break
                
            case 1: // Middle button
                if (this.enableZoom) {
                    this.handleMouseDownDolly(event)
                    this.currentState = this.state.DOLLY
                }
                break
                
            case 2: // Right button
                if (this.enablePan) {
                    this.handleMouseDownPan(event)
                    this.currentState = this.state.PAN
                }
                break
        }
        
        if (this.currentState !== this.state.NONE) {
            document.addEventListener('mousemove', this.onMouseMove.bind(this))
            document.addEventListener('mouseup', this.onMouseUp.bind(this))
        }
    }
    
    onMouseMove(event) {
        if (!this.enabled) return
        
        event.preventDefault()
        
        switch (this.currentState) {
            case this.state.ROTATE:
                this.handleMouseMoveRotate(event)
                break
                
            case this.state.DOLLY:
                this.handleMouseMoveDolly(event)
                break
                
            case this.state.PAN:
                this.handleMouseMovePan(event)
                break
        }
    }
    
    onMouseUp(event) {
        if (!this.enabled) return
        
        document.removeEventListener('mousemove', this.onMouseMove.bind(this))
        document.removeEventListener('mouseup', this.onMouseUp.bind(this))
        
        this.currentState = this.state.NONE
    }
    
    onMouseWheel(event) {
        if (!this.enabled || !this.enableZoom) return
        
        event.preventDefault()
        
        if (event.deltaY < 0) {
            this.dollyIn(this.getZoomScale())
        } else {
            this.dollyOut(this.getZoomScale())
        }
    }
    
    handleMouseDownRotate(event) {
        this.rotateStart.set(event.clientX, event.clientY)
    }
    
    handleMouseMoveRotate(event) {
        this.rotateEnd.set(event.clientX, event.clientY)
        this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart)
        
        const element = this.domElement
        
        this.rotateLeft(2 * Math.PI * this.rotateDelta.x / element.clientHeight * this.rotateSpeed)
        this.rotateUp(2 * Math.PI * this.rotateDelta.y / element.clientHeight * this.rotateSpeed)
        
        this.rotateStart.copy(this.rotateEnd)
    }
    
    handleMouseDownPan(event) {
        this.panStart.set(event.clientX, event.clientY)
    }
    
    handleMouseMovePan(event) {
        this.panEnd.set(event.clientX, event.clientY)
        this.panDelta.subVectors(this.panEnd, this.panStart)
        
        this.pan(this.panDelta.x, this.panDelta.y)
        
        this.panStart.copy(this.panEnd)
    }
    
    rotateLeft(angle) {
        this.sphericalDelta.theta -= angle
    }
    
    rotateUp(angle) {
        this.sphericalDelta.phi -= angle
    }
    
    dollyIn(dollyScale) {
        this.spherical.radius /= dollyScale
    }
    
    dollyOut(dollyScale) {
        this.spherical.radius *= dollyScale
    }
    
    pan(deltaX, deltaY) {
        const offset = new THREE.Vector3()
        let targetDistance = this.camera.position.distanceTo(this.target)
        
        // Half of the fov is center to top of screen
        targetDistance *= Math.tan((this.camera.fov / 2) * Math.PI / 180)
        
        // We use only clientHeight here so aspect ratio does not distort speed
        this.panLeft(2 * deltaX * targetDistance / this.domElement.clientHeight, this.camera.matrix)
        this.panUp(2 * deltaY * targetDistance / this.domElement.clientHeight, this.camera.matrix)
    }
    
    panLeft(distance, objectMatrix) {
        const v = new THREE.Vector3()
        v.setFromMatrixColumn(objectMatrix, 0) // Get X column of objectMatrix
        v.multiplyScalar(-distance)
        
        this.target.add(v)
    }
    
    panUp(distance, objectMatrix) {
        const v = new THREE.Vector3()
        v.setFromMatrixColumn(objectMatrix, 1) // Get Y column of objectMatrix
        v.multiplyScalar(distance)
        
        this.target.add(v)
    }
    
    getAutoRotationAngle(deltaTime) {
        return this.autoRotateSpeed / 60 * deltaTime // 60 fps
    }
    
    getZoomScale() {
        return Math.pow(0.95, this.zoomSpeed)
    }
    
    // Public methods
    setTarget(target) {
        this.target.copy(target)
    }
    
    setDistance(distance) {
        this.spherical.radius = distance
        this.updateCamera()
    }
    
    reset() {
        this.target.set(0, 0, 0)
        this.camera.position.set(0, 0, 5)
        this.camera.up.set(0, 1, 0)
        this.updateCamera()
    }
}

// First Person Camera Controller
export class FirstPersonCameraController extends BaseCameraSystem {
    constructor(camera, options = {}) {
        super(camera, options)
        
        // Movement
        this.velocity = new THREE.Vector3()
        this.direction = new THREE.Vector3()
        this.moveSpeed = options.moveSpeed || 10
        this.jumpSpeed = options.jumpSpeed || 15
        this.gravity = options.gravity || -30
        
        // Look
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ')
        this.lookSpeed = options.lookSpeed || 2
        
        // State
        this.isOnGround = false
        this.canJump = true
        
        // Physics
        this.raycaster = new THREE.Raycaster()
        this.collisionObjects = []
    }
    
    update(deltaTime, inputManager) {
        if (!this.enabled) return
        
        super.update(deltaTime)
        
        // Handle input
        if (inputManager) {
            this.handleMovement(deltaTime, inputManager)
            this.handleLook(deltaTime, inputManager)
        }
        
        // Apply physics
        this.applyPhysics(deltaTime)
        
        // Collision detection
        this.checkCollisions()
    }
    
    handleMovement(deltaTime, inputManager) {
        const movement = inputManager.getMovementVector()
        
        // Calculate movement direction relative to camera
        this.direction.set(0, 0, 0)
        
        if (movement.z !== 0) {
            this.direction.add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(-movement.z))
        }
        
        if (movement.x !== 0) {
            const right = new THREE.Vector3()
            right.crossVectors(this.camera.getWorldDirection(new THREE.Vector3()), this.camera.up)
            this.direction.add(right.multiplyScalar(movement.x))
        }
        
        this.direction.normalize()
        
        // Apply movement
        if (movement.length() > 0) {
            this.velocity.x = this.direction.x * this.moveSpeed
            this.velocity.z = this.direction.z * this.moveSpeed
        } else {
            this.velocity.x *= 0.9 // Friction
            this.velocity.z *= 0.9
        }
        
        // Jumping
        if (inputManager.isActionActive('jump') && this.isOnGround && this.canJump) {
            this.velocity.y = this.jumpSpeed
            this.isOnGround = false
            this.canJump = false
            
            setTimeout(() => {
                this.canJump = true
            }, 200) // Jump cooldown
        }
    }
    
    handleLook(deltaTime, inputManager) {
        const lookDelta = inputManager.getLookDelta()
        
        if (lookDelta.length() > 0) {
            this.euler.setFromQuaternion(this.camera.quaternion)
            
            this.euler.y -= lookDelta.x * this.lookSpeed * deltaTime
            this.euler.x -= lookDelta.y * this.lookSpeed * deltaTime
            
            // Clamp vertical look
            this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x))
            
            this.camera.quaternion.setFromEuler(this.euler)
        }
    }
    
    applyPhysics(deltaTime) {
        // Apply gravity
        if (!this.isOnGround) {
            this.velocity.y += this.gravity * deltaTime
        }
        
        // Apply velocity to position
        this.camera.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    }
    
    checkCollisions() {
        // Ground check
        this.raycaster.set(this.camera.position, new THREE.Vector3(0, -1, 0))
        const groundIntersects = this.raycaster.intersectObjects(this.collisionObjects, true)
        
        if (groundIntersects.length > 0) {
            const distance = groundIntersects[0].distance
            if (distance < 1.8) { // Player height
                this.camera.position.y = groundIntersects[0].point.y + 1.8
                this.velocity.y = 0
                this.isOnGround = true
            } else {
                this.isOnGround = false
            }
        } else {
            this.isOnGround = false
        }
        
        // Wall collision (simplified)
        const directions = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, 0, -1)
        ]
        
        directions.forEach(direction => {
            this.raycaster.set(this.camera.position, direction)
            const intersects = this.raycaster.intersectObjects(this.collisionObjects, true)
            
            if (intersects.length > 0 && intersects[0].distance < 0.5) {
                // Push away from wall
                const pushVector = direction.clone().multiplyScalar(-(0.5 - intersects[0].distance))
                this.camera.position.add(pushVector)
            }
        })
    }
    
    setCollisionObjects(objects) {
        this.collisionObjects = objects
    }
}

// Third Person Camera Controller  
export class ThirdPersonCameraController extends BaseCameraSystem {
    constructor(camera, target, options = {}) {
        super(camera, options)
        
        this.targetObject = target
        this.cameraOffset = options.offset || new THREE.Vector3(0, 5, -10)
        this.lookAtOffset = options.lookAtOffset || new THREE.Vector3(0, 2, 0)
        
        // Camera behavior
        this.followSpeed = options.followSpeed || 5
        this.rotationSpeed = options.rotationSpeed || 3
        this.smoothness = options.smoothness || 0.1
        
        // Collision detection for camera
        this.raycaster = new THREE.Raycaster()
        this.collisionObjects = []
        this.minDistance = options.minDistance || 2
        
        // Dynamic offset based on target movement
        this.dynamicOffset = this.cameraOffset.clone()
        this.targetVelocity = new THREE.Vector3()
        this.lastTargetPosition = this.targetObject.position.clone()
    }
    
    update(deltaTime, inputManager) {
        if (!this.enabled) return
        
        super.update(deltaTime)
        
        // Calculate target velocity for predictive following
        this.targetVelocity.copy(this.targetObject.position).sub(this.lastTargetPosition).divideScalar(deltaTime)
        this.lastTargetPosition.copy(this.targetObject.position)
        
        // Handle camera rotation input
        if (inputManager) {
            this.handleCameraInput(deltaTime, inputManager)
        }
        
        // Update camera position
        this.updateCameraPosition(deltaTime)
        
        // Check for collisions and adjust
        this.checkCameraCollisions()
        
        // Look at target
        const lookAtPoint = this.targetObject.position.clone().add(this.lookAtOffset)
        this.lookAt(lookAtPoint, true, this.rotationSpeed)
    }
    
    handleCameraInput(deltaTime, inputManager) {
        const lookDelta = inputManager.getLookDelta()
        
        if (lookDelta.length() > 0) {
            // Rotate camera around target
            const spherical = new THREE.Spherical()
            const offset = this.camera.position.clone().sub(this.targetObject.position)
            
            spherical.setFromVector3(offset)
            spherical.theta -= lookDelta.x * this.rotationSpeed * deltaTime
            spherical.phi += lookDelta.y * this.rotationSpeed * deltaTime
            
            // Clamp vertical rotation
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
            
            this.dynamicOffset.setFromSpherical(spherical)
        }
    }
    
    updateCameraPosition(deltaTime) {
        // Predict where target will be for smoother following
        const predictedPosition = this.targetObject.position.clone()
        if (this.targetVelocity.length() > 0.1) {
            predictedPosition.add(this.targetVelocity.clone().multiplyScalar(0.1)) // Small prediction
        }
        
        // Calculate desired camera position
        const desiredPosition = predictedPosition.clone().add(this.dynamicOffset)
        
        // Smoothly move camera to desired position
        this.camera.position.lerp(desiredPosition, this.followSpeed * deltaTime)
    }
    
    checkCameraCollisions() {
        // Cast ray from target to camera to check for obstacles
        const direction = this.camera.position.clone().sub(this.targetObject.position).normalize()
        const distance = this.camera.position.distanceTo(this.targetObject.position)
        
        this.raycaster.set(this.targetObject.position, direction)
        const intersects = this.raycaster.intersectObjects(this.collisionObjects, true)
        
        if (intersects.length > 0) {
            const obstacleDistance = intersects[0].distance
            
            if (obstacleDistance < distance) {
                // Move camera closer to avoid obstacles
                const newDistance = Math.max(this.minDistance, obstacleDistance - 0.5)
                const newPosition = this.targetObject.position.clone().add(
                    direction.multiplyScalar(newDistance)
                )
                this.camera.position.copy(newPosition)
            }
        }
    }
    
    setCollisionObjects(objects) {
        this.collisionObjects = objects
    }
    
    setOffset(offset) {
        this.cameraOffset.copy(offset)
        this.dynamicOffset.copy(offset)
    }
}

// Cinematic Camera System
export class CinematicCameraSystem extends BaseCameraSystem {
    constructor(camera, options = {}) {
        super(camera, options)
        
        this.shots = new Map()
        this.currentShot = null
        this.timeline = []
        this.timelineIndex = 0
        this.isPlaying = false
        this.currentTime = 0
        
        // Camera paths
        this.paths = new Map()
    }
    
    // Define camera shots
    defineShot(name, keyframes) {
        this.shots.set(name, {
            keyframes: keyframes.sort((a, b) => a.time - b.time),
            duration: Math.max(...keyframes.map(kf => kf.time))
        })
    }
    
    // Create camera path using Catmull-Rom splines
    createPath(name, points, options = {}) {
        const positionCurve = new THREE.CatmullRomCurve3(points.map(p => p.position))
        
        let lookAtCurve = null
        if (points[0].lookAt) {
            lookAtCurve = new THREE.CatmullRomCurve3(points.map(p => p.lookAt))
        }
        
        this.paths.set(name, {
            position: positionCurve,
            lookAt: lookAtCurve,
            duration: options.duration || 5000,
            loop: options.loop || false
        })
    }
    
    // Play a defined shot
    playShot(shotName, onComplete) {
        const shot = this.shots.get(shotName)
        if (!shot) return
        
        this.currentShot = {
            ...shot,
            startTime: 0,
            onComplete
        }
        
        this.isPlaying = true
        this.currentTime = 0
    }
    
    // Follow path
    followPath(pathName, onComplete) {
        const path = this.paths.get(pathName)
        if (!path) return
        
        this.currentShot = {
            path,
            startTime: 0,
            onComplete
        }
        
        this.isPlaying = true
        this.currentTime = 0
    }
    
    // Create camera timeline
    createTimeline(shots) {
        this.timeline = shots
        this.timelineIndex = 0
    }
    
    // Play timeline
    playTimeline(onComplete) {
        if (this.timeline.length === 0) return
        
        this.isPlaying = true
        this.timelineIndex = 0
        this.currentTime = 0
        this.timelineComplete = onComplete
        
        this.playCurrentTimelineShot()
    }
    
    playCurrentTimelineShot() {
        if (this.timelineIndex >= this.timeline.length) {
            this.isPlaying = false
            if (this.timelineComplete) this.timelineComplete()
            return
        }
        
        const shot = this.timeline[this.timelineIndex]
        
        if (shot.type === 'shot') {
            this.playShot(shot.name, () => {
                this.timelineIndex++
                setTimeout(() => this.playCurrentTimelineShot(), shot.delay || 0)
            })
        } else if (shot.type === 'path') {
            this.followPath(shot.name, () => {
                this.timelineIndex++
                setTimeout(() => this.playCurrentTimelineShot(), shot.delay || 0)
            })
        }
    }
    
    update(deltaTime) {
        super.update(deltaTime)
        
        if (!this.isPlaying || !this.currentShot) return
        
        this.currentTime += deltaTime * 1000 // Convert to milliseconds
        
        if (this.currentShot.keyframes) {
            // Shot-based animation
            this.updateShotAnimation()
        } else if (this.currentShot.path) {
            // Path-based animation
            this.updatePathAnimation()
        }
    }
    
    updateShotAnimation() {
        const shot = this.currentShot
        const progress = this.currentTime / shot.duration
        
        if (progress >= 1) {
            this.isPlaying = false
            if (shot.onComplete) shot.onComplete()
            return
        }
        
        // Find surrounding keyframes
        let prevKeyframe = null
        let nextKeyframe = null
        
        for (let i = 0; i < shot.keyframes.length; i++) {
            const kf = shot.keyframes[i]
            if (kf.time <= this.currentTime) {
                prevKeyframe = kf
            } else {
                nextKeyframe = kf
                break
            }
        }
        
        if (!prevKeyframe) prevKeyframe = shot.keyframes[0]
        if (!nextKeyframe) nextKeyframe = shot.keyframes[shot.keyframes.length - 1]
        
        // Interpolate between keyframes
        if (prevKeyframe === nextKeyframe) {
            this.applyKeyframe(prevKeyframe)
        } else {
            const t = (this.currentTime - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time)
            this.interpolateKeyframes(prevKeyframe, nextKeyframe, t)
        }
    }
    
    updatePathAnimation() {
        const path = this.currentShot.path
        const progress = this.currentTime / path.duration
        
        if (progress >= 1) {
            if (path.loop) {
                this.currentTime = 0
            } else {
                this.isPlaying = false
                if (this.currentShot.onComplete) this.currentShot.onComplete()
                return
            }
        }
        
        const t = Math.min(1, Math.max(0, progress))
        
        // Update position
        if (path.position) {
            this.camera.position.copy(path.position.getPoint(t))
        }
        
        // Update look at
        if (path.lookAt) {
            this.camera.lookAt(path.lookAt.getPoint(t))
        }
    }
    
    applyKeyframe(keyframe) {
        if (keyframe.position) {
            this.camera.position.copy(keyframe.position)
        }
        
        if (keyframe.rotation) {
            this.camera.rotation.copy(keyframe.rotation)
        }
        
        if (keyframe.lookAt) {
            this.camera.lookAt(keyframe.lookAt)
        }
        
        if (keyframe.fov !== undefined) {
            this.camera.fov = keyframe.fov
            this.camera.updateProjectionMatrix()
        }
    }
    
    interpolateKeyframes(prev, next, t) {
        // Smooth interpolation using easing
        const easedT = this.easeInOutQuad(t)
        
        if (prev.position && next.position) {
            this.camera.position.lerpVectors(prev.position, next.position, easedT)
        }
        
        if (prev.rotation && next.rotation) {
            this.camera.rotation.x = THREE.MathUtils.lerp(prev.rotation.x, next.rotation.x, easedT)
            this.camera.rotation.y = THREE.MathUtils.lerp(prev.rotation.y, next.rotation.y, easedT)
            this.camera.rotation.z = THREE.MathUtils.lerp(prev.rotation.z, next.rotation.z, easedT)
        }
        
        if (prev.fov !== undefined && next.fov !== undefined) {
            this.camera.fov = THREE.MathUtils.lerp(prev.fov, next.fov, easedT)
            this.camera.updateProjectionMatrix()
        }
        
        if (prev.lookAt && next.lookAt) {
            const lookAt = new THREE.Vector3().lerpVectors(prev.lookAt, next.lookAt, easedT)
            this.camera.lookAt(lookAt)
        }
    }
    
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }
    
    // Stop current playback
    stop() {
        this.isPlaying = false
        this.currentShot = null
    }
    
    // Pause/Resume
    pause() {
        this.isPlaying = false
    }
    
    resume() {
        this.isPlaying = true
    }
}

// Camera Tween Helper
class CameraTween {
    constructor(options) {
        this.duration = options.duration || 1000
        this.easing = options.easing || 'linear'
        this.onUpdate = options.onUpdate || (() => {})
        this.onComplete = options.onComplete || (() => {})
        
        this.startTime = 0
        this.elapsed = 0
        this.complete = false
    }
    
    update(deltaTime) {
        if (this.complete) return
        
        this.elapsed += deltaTime * 1000
        const progress = Math.min(1, this.elapsed / this.duration)
        const easedProgress = this.applyEasing(progress)
        
        this.onUpdate(easedProgress)
        
        if (progress >= 1) {
            this.complete = true
            this.onComplete()
        }
    }
    
    applyEasing(t) {
        switch (this.easing) {
            case 'easeInQuad':
                return t * t
            case 'easeOutQuad':
                return t * (2 - t)
            case 'easeInOutQuad':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
            case 'easeInCubic':
                return t * t * t
            case 'easeOutCubic':
                return (--t) * t * t + 1
            default:
                return t // linear
        }
    }
    
    isComplete() {
        return this.complete
    }
}

export default {
    BaseCameraSystem,
    OrbitCameraController,
    FirstPersonCameraController,
    ThirdPersonCameraController,
    CinematicCameraSystem
}