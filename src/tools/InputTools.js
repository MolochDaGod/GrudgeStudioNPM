/**
 * Advanced Input Systems for Grudge Studio
 * Mouse, Gamepad, Leap Motion, and Multi-modal Input Support
 */

import * as THREE from 'three'

// Advanced Mouse Control System
export class AdvancedMouseSystem {
    constructor(camera, domElement) {
        this.camera = camera
        this.domElement = domElement
        this.enabled = true
        
        // Mouse state
        this.mouseState = {
            position: new THREE.Vector2(),
            delta: new THREE.Vector2(),
            buttons: new Set(),
            wheel: 0,
            sensitivity: 1.0,
            smoothing: 0.8
        }
        
        // Raycasting for object interaction
        this.raycaster = new THREE.Raycaster()
        this.intersectObjects = []
        this.hoveredObjects = new Set()
        
        // Gesture detection
        this.gestures = {
            click: { threshold: 100, active: false, startTime: 0 },
            doubleClick: { threshold: 300, clicks: 0, lastClickTime: 0 },
            drag: { threshold: 10, active: false, startPos: new THREE.Vector2() },
            pinch: { active: false, startDistance: 0, currentDistance: 0 }
        }
        
        this.setupEventListeners()
    }
    
    setupEventListeners() {
        // Mouse events
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
        this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this))
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this))
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault())
        
        // Touch events for mobile
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this))
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this))
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this))
        
        // Pointer lock events for FPS controls
        document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this))
    }
    
    onMouseMove(event) {
        if (!this.enabled) return
        
        const rect = this.domElement.getBoundingClientRect()
        const newPosition = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        )
        
        this.mouseState.delta.copy(newPosition).sub(this.mouseState.position)
        this.mouseState.position.copy(newPosition)
        
        // Update raycaster for hover detection
        this.updateRaycast()
        
        // Gesture detection
        if (this.gestures.drag.active) {
            const dragDistance = this.mouseState.position.distanceTo(this.gestures.drag.startPos)
            if (dragDistance > this.gestures.drag.threshold / 1000) {
                this.onDrag(this.mouseState.delta)
            }
        }
    }
    
    onMouseDown(event) {
        if (!this.enabled) return
        
        this.mouseState.buttons.add(event.button)
        
        // Start drag detection
        this.gestures.drag.startPos.copy(this.mouseState.position)
        this.gestures.drag.active = true
        
        // Click timing for gesture detection
        this.gestures.click.startTime = Date.now()
        
        this.onButtonDown(event.button)
    }
    
    onMouseUp(event) {
        if (!this.enabled) return
        
        this.mouseState.buttons.delete(event.button)
        this.gestures.drag.active = false
        
        // Check for click vs drag
        const clickTime = Date.now() - this.gestures.click.startTime
        const dragDistance = this.mouseState.position.distanceTo(this.gestures.drag.startPos)
        
        if (clickTime < this.gestures.click.threshold && 
            dragDistance < this.gestures.drag.threshold / 1000) {
            this.onClick(event.button)
            this.checkDoubleClick()
        }
        
        this.onButtonUp(event.button)
    }
    
    onMouseWheel(event) {
        if (!this.enabled) return
        
        this.mouseState.wheel = event.deltaY
        this.onWheel(event.deltaY)
    }
    
    // Touch handling for mobile devices
    onTouchStart(event) {
        if (event.touches.length === 1) {
            // Single touch - treat as mouse
            const touch = event.touches[0]
            this.handleTouchAsMouse(touch, 'mousedown')
        } else if (event.touches.length === 2) {
            // Two finger gesture - pinch detection
            const touch1 = event.touches[0]
            const touch2 = event.touches[1]
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            )
            
            this.gestures.pinch.active = true
            this.gestures.pinch.startDistance = distance
            this.gestures.pinch.currentDistance = distance
        }
    }
    
    onTouchMove(event) {
        event.preventDefault()
        
        if (event.touches.length === 1) {
            const touch = event.touches[0]
            this.handleTouchAsMove(touch)
        } else if (event.touches.length === 2 && this.gestures.pinch.active) {
            const touch1 = event.touches[0]
            const touch2 = event.touches[1]
            const distance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            )
            
            const pinchDelta = distance - this.gestures.pinch.currentDistance
            this.gestures.pinch.currentDistance = distance
            this.onPinch(pinchDelta)
        }
    }
    
    onTouchEnd(event) {
        if (event.touches.length === 0) {
            this.gestures.pinch.active = false
        }
    }
    
    handleTouchAsMove(touch) {
        const rect = this.domElement.getBoundingClientRect()
        const newPosition = new THREE.Vector2(
            ((touch.clientX - rect.left) / rect.width) * 2 - 1,
            -((touch.clientY - rect.top) / rect.height) * 2 + 1
        )
        
        this.mouseState.delta.copy(newPosition).sub(this.mouseState.position)
        this.mouseState.position.copy(newPosition)
        this.updateRaycast()
    }
    
    // Pointer lock for FPS-style controls
    enablePointerLock() {
        this.domElement.requestPointerLock()
    }
    
    onPointerLockChange() {
        this.pointerLocked = document.pointerLockElement === this.domElement
    }
    
    updateRaycast() {
        this.raycaster.setFromCamera(this.mouseState.position, this.camera)
        
        if (this.intersectObjects.length > 0) {
            const intersects = this.raycaster.intersectObjects(this.intersectObjects, true)
            
            // Handle hover events
            const currentHovered = new Set()
            intersects.forEach(intersect => {
                currentHovered.add(intersect.object)
                if (!this.hoveredObjects.has(intersect.object)) {
                    this.onObjectHover(intersect.object, intersect.point)
                }
            })
            
            // Handle hover end
            this.hoveredObjects.forEach(obj => {
                if (!currentHovered.has(obj)) {
                    this.onObjectHoverEnd(obj)
                }
            })
            
            this.hoveredObjects = currentHovered
        }
    }
    
    checkDoubleClick() {
        const now = Date.now()
        const timeDiff = now - this.gestures.doubleClick.lastClickTime
        
        if (timeDiff < this.gestures.doubleClick.threshold) {
            this.gestures.doubleClick.clicks++
            if (this.gestures.doubleClick.clicks >= 2) {
                this.onDoubleClick()
                this.gestures.doubleClick.clicks = 0
            }
        } else {
            this.gestures.doubleClick.clicks = 1
        }
        
        this.gestures.doubleClick.lastClickTime = now
    }
    
    // Override these methods for custom behavior
    onButtonDown(button) {}
    onButtonUp(button) {}
    onClick(button) {}
    onDoubleClick() {}
    onDrag(delta) {}
    onWheel(delta) {}
    onPinch(delta) {}
    onObjectHover(object, point) {}
    onObjectHoverEnd(object) {}
    
    // Utility methods
    setIntersectObjects(objects) {
        this.intersectObjects = objects
    }
    
    getMousePosition() {
        return this.mouseState.position.clone()
    }
    
    isButtonPressed(button) {
        return this.mouseState.buttons.has(button)
    }
}

// Enhanced Gamepad System
export class GamepadSystem {
    constructor() {
        this.gamepads = new Map()
        this.gamepadState = new Map()
        this.deadzone = 0.1
        this.sensitivity = 1.0
        
        // Button mappings for different gamepad types
        this.buttonMappings = {
            standard: {
                A: 0, B: 1, X: 2, Y: 3,
                LB: 4, RB: 5, LT: 6, RT: 7,
                SELECT: 8, START: 9,
                LS: 10, RS: 11,
                DPAD_UP: 12, DPAD_DOWN: 13, DPAD_LEFT: 14, DPAD_RIGHT: 15
            }
        }
        
        this.axesMappings = {
            standard: {
                LEFT_STICK_X: 0, LEFT_STICK_Y: 1,
                RIGHT_STICK_X: 2, RIGHT_STICK_Y: 3
            }
        }
        
        this.setupEventListeners()
    }
    
    setupEventListeners() {
        window.addEventListener('gamepadconnected', this.onGamepadConnected.bind(this))
        window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected.bind(this))
    }
    
    onGamepadConnected(event) {
        const gamepad = event.gamepad
        console.log(`Gamepad connected: ${gamepad.id}`)
        
        this.gamepads.set(gamepad.index, gamepad)
        this.gamepadState.set(gamepad.index, {
            buttons: new Array(gamepad.buttons.length).fill(false),
            buttonsPrevious: new Array(gamepad.buttons.length).fill(false),
            axes: new Array(gamepad.axes.length).fill(0),
            axesPrevious: new Array(gamepad.axes.length).fill(0),
            vibration: { weak: 0, strong: 0 }
        })
    }
    
    onGamepadDisconnected(event) {
        console.log(`Gamepad disconnected: ${event.gamepad.id}`)
        this.gamepads.delete(event.gamepad.index)
        this.gamepadState.delete(event.gamepad.index)
    }
    
    update() {
        const gamepads = navigator.getGamepads()
        
        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i]
            if (!gamepad) continue
            
            const state = this.gamepadState.get(i)
            if (!state) continue
            
            // Store previous state
            state.buttonsPrevious = [...state.buttons]
            state.axesPrevious = [...state.axes]
            
            // Update button states
            for (let j = 0; j < gamepad.buttons.length; j++) {
                state.buttons[j] = gamepad.buttons[j].pressed
            }
            
            // Update axes with deadzone
            for (let j = 0; j < gamepad.axes.length; j++) {
                let value = gamepad.axes[j]
                if (Math.abs(value) < this.deadzone) {
                    value = 0
                }
                state.axes[j] = value
            }
        }
    }
    
    // Button state queries
    isButtonPressed(gamepadIndex, buttonName) {
        const state = this.gamepadState.get(gamepadIndex)
        if (!state) return false
        
        const buttonIndex = this.buttonMappings.standard[buttonName]
        return state.buttons[buttonIndex] || false
    }
    
    isButtonJustPressed(gamepadIndex, buttonName) {
        const state = this.gamepadState.get(gamepadIndex)
        if (!state) return false
        
        const buttonIndex = this.buttonMappings.standard[buttonName]
        return state.buttons[buttonIndex] && !state.buttonsPrevious[buttonIndex]
    }
    
    isButtonJustReleased(gamepadIndex, buttonName) {
        const state = this.gamepadState.get(gamepadIndex)
        if (!state) return false
        
        const buttonIndex = this.buttonMappings.standard[buttonName]
        return !state.buttons[buttonIndex] && state.buttonsPrevious[buttonIndex]
    }
    
    // Axes queries
    getAxis(gamepadIndex, axisName) {
        const state = this.gamepadState.get(gamepadIndex)
        if (!state) return 0
        
        const axisIndex = this.axesMappings.standard[axisName]
        return (state.axes[axisIndex] || 0) * this.sensitivity
    }
    
    getLeftStick(gamepadIndex) {
        return new THREE.Vector2(
            this.getAxis(gamepadIndex, 'LEFT_STICK_X'),
            this.getAxis(gamepadIndex, 'LEFT_STICK_Y')
        )
    }
    
    getRightStick(gamepadIndex) {
        return new THREE.Vector2(
            this.getAxis(gamepadIndex, 'RIGHT_STICK_X'),
            this.getAxis(gamepadIndex, 'RIGHT_STICK_Y')
        )
    }
    
    // Vibration/Haptic feedback
    vibrate(gamepadIndex, weakMagnitude = 0, strongMagnitude = 0, duration = 100) {
        const gamepad = this.gamepads.get(gamepadIndex)
        if (!gamepad || !gamepad.vibrationActuator) return
        
        gamepad.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: duration,
            weakMagnitude: Math.min(1, Math.max(0, weakMagnitude)),
            strongMagnitude: Math.min(1, Math.max(0, strongMagnitude))
        })
    }
    
    // Get all connected gamepads
    getConnectedGamepads() {
        return Array.from(this.gamepads.keys())
    }
}

// Leap Motion Integration (requires Leap Motion library)
export class LeapMotionSystem {
    constructor() {
        this.controller = null
        this.hands = new Map()
        this.gestures = new Map()
        this.enabled = false
        
        // Hand tracking data
        this.handData = {
            left: { present: false, position: new THREE.Vector3(), rotation: new THREE.Quaternion() },
            right: { present: false, position: new THREE.Vector3(), rotation: new THREE.Quaternion() }
        }
        
        // Gesture recognition
        this.gestureThresholds = {
            grab: 0.7,
            pinch: 0.8,
            swipe: { velocity: 1000, direction: new THREE.Vector3() }
        }
    }
    
    async initialize() {
        try {
            // Check if Leap Motion is available
            if (typeof Leap !== 'undefined') {
                this.controller = new Leap.Controller({
                    enableGestures: true,
                    frameEventName: 'animationFrame'
                })
                
                this.controller.on('frame', this.onFrame.bind(this))
                this.controller.connect()
                this.enabled = true
                
                console.log('Leap Motion initialized successfully')
                return true
            } else {
                console.log('Leap Motion not available')
                return false
            }
        } catch (error) {
            console.error('Failed to initialize Leap Motion:', error)
            return false
        }
    }
    
    onFrame(frame) {
        if (!frame.hands || frame.hands.length === 0) {
            this.handData.left.present = false
            this.handData.right.present = false
            return
        }
        
        frame.hands.forEach(hand => {
            const handType = hand.type // 'left' or 'right'
            const handInfo = this.handData[handType]
            
            if (handInfo) {
                handInfo.present = true
                
                // Convert Leap Motion coordinates to Three.js
                const leapPos = hand.palmPosition
                handInfo.position.set(
                    leapPos[0] / 1000, // Convert mm to meters
                    (leapPos[1] - 200) / 1000, // Adjust height
                    -leapPos[2] / 1000 // Flip Z axis
                )
                
                // Convert rotation
                const leapRot = hand.direction
                handInfo.rotation.setFromUnitVectors(
                    new THREE.Vector3(0, 0, -1),
                    new THREE.Vector3(leapRot[0], leapRot[1], -leapRot[2])
                )
                
                // Detect gestures
                this.detectGestures(hand)
            }
        })
        
        // Detect swipe gestures
        if (frame.gestures) {
            frame.gestures.forEach(gesture => {
                this.processGesture(gesture)
            })
        }
    }
    
    detectGestures(hand) {
        // Grab gesture detection
        const grabStrength = hand.grabStrength
        if (grabStrength > this.gestureThresholds.grab) {
            this.onGrab(hand.type, grabStrength)
        }
        
        // Pinch gesture detection
        const pinchStrength = hand.pinchStrength
        if (pinchStrength > this.gestureThresholds.pinch) {
            this.onPinch(hand.type, pinchStrength)
        }
        
        // Finger counting
        const extendedFingers = hand.fingers.filter(finger => finger.extended)
        this.onFingerCount(hand.type, extendedFingers.length)
    }
    
    processGesture(gesture) {
        switch (gesture.type) {
            case 'swipe':
                const direction = new THREE.Vector3(
                    gesture.direction[0],
                    gesture.direction[1],
                    -gesture.direction[2]
                ).normalize()
                
                this.onSwipe(direction, gesture.speed)
                break
                
            case 'circle':
                this.onCircle(gesture.center, gesture.radius, gesture.clockwise)
                break
                
            case 'keyTap':
                this.onKeyTap(gesture.position)
                break
                
            case 'screenTap':
                this.onScreenTap(gesture.position)
                break
        }
    }
    
    // Override these methods for custom behavior
    onGrab(handType, strength) {}
    onPinch(handType, strength) {}
    onFingerCount(handType, count) {}
    onSwipe(direction, speed) {}
    onCircle(center, radius, clockwise) {}
    onKeyTap(position) {}
    onScreenTap(position) {}
    
    // Utility methods
    getHandPosition(handType) {
        const hand = this.handData[handType]
        return hand.present ? hand.position.clone() : null
    }
    
    getHandRotation(handType) {
        const hand = this.handData[handType]
        return hand.present ? hand.rotation.clone() : null
    }
    
    isHandPresent(handType) {
        return this.handData[handType].present
    }
}

// Unified Input Manager
export class UnifiedInputManager {
    constructor(camera, domElement) {
        this.mouseSystem = new AdvancedMouseSystem(camera, domElement)
        this.gamepadSystem = new GamepadSystem()
        this.leapMotionSystem = new LeapMotionSystem()
        
        this.inputCallbacks = new Map()
        this.inputState = {
            movement: new THREE.Vector3(),
            look: new THREE.Vector2(),
            actions: new Set()
        }
        
        this.bindings = new Map()
        this.setupDefaultBindings()
    }
    
    async initialize() {
        // Try to initialize Leap Motion
        await this.leapMotionSystem.initialize()
        
        // Setup input event routing
        this.setupInputRouting()
    }
    
    setupDefaultBindings() {
        // Movement bindings
        this.bindings.set('forward', ['keyboard:KeyW', 'gamepad:LEFT_STICK_Y+'])
        this.bindings.set('backward', ['keyboard:KeyS', 'gamepad:LEFT_STICK_Y-'])
        this.bindings.set('left', ['keyboard:KeyA', 'gamepad:LEFT_STICK_X-'])
        this.bindings.set('right', ['keyboard:KeyD', 'gamepad:LEFT_STICK_X+'])
        this.bindings.set('jump', ['keyboard:Space', 'gamepad:A'])
        
        // Action bindings
        this.bindings.set('interact', ['mouse:0', 'gamepad:X', 'leap:pinch'])
        this.bindings.set('attack', ['mouse:0', 'gamepad:RT', 'leap:grab'])
        this.bindings.set('defend', ['mouse:2', 'gamepad:LT'])
        
        // Camera bindings
        this.bindings.set('camera_x', ['mouse:move_x', 'gamepad:RIGHT_STICK_X'])
        this.bindings.set('camera_y', ['mouse:move_y', 'gamepad:RIGHT_STICK_Y'])
    }
    
    setupInputRouting() {
        // Route mouse events
        this.mouseSystem.onDrag = (delta) => {
            this.inputState.look.add(delta)
            this.triggerCallback('camera_move', delta)
        }
        
        this.mouseSystem.onClick = (button) => {
            this.triggerCallback('click', { button, position: this.mouseSystem.getMousePosition() })
        }
        
        // Route gamepad events
        // This would be called in update loop
        
        // Route leap motion events
        this.leapMotionSystem.onGrab = (hand, strength) => {
            this.triggerCallback('grab', { hand, strength })
        }
        
        this.leapMotionSystem.onSwipe = (direction, speed) => {
            this.triggerCallback('swipe', { direction, speed })
        }
    }
    
    update(deltaTime) {
        // Update all input systems
        this.gamepadSystem.update()
        
        // Process bindings and update input state
        this.processBindings()
        
        // Trigger continuous callbacks
        if (this.inputState.movement.length() > 0) {
            this.triggerCallback('movement', this.inputState.movement.clone())
        }
        
        if (this.inputState.look.length() > 0) {
            this.triggerCallback('look', this.inputState.look.clone())
            this.inputState.look.multiplyScalar(0.8) // Damping
        }
    }
    
    processBindings() {
        // Reset input state
        this.inputState.movement.set(0, 0, 0)
        this.inputState.actions.clear()
        
        // Process each binding
        this.bindings.forEach((inputs, action) => {
            let value = 0
            
            inputs.forEach(input => {
                const [type, key] = input.split(':')
                
                switch (type) {
                    case 'gamepad':
                        if (key.endsWith('+') || key.endsWith('-')) {
                            const axis = key.slice(0, -1)
                            const direction = key.endsWith('+') ? 1 : -1
                            const axisValue = this.gamepadSystem.getAxis(0, axis)
                            if ((direction > 0 && axisValue > 0) || (direction < 0 && axisValue < 0)) {
                                value = Math.abs(axisValue)
                            }
                        } else {
                            if (this.gamepadSystem.isButtonPressed(0, key)) {
                                value = 1
                            }
                        }
                        break
                }
            })
            
            // Apply to input state
            if (value > 0) {
                switch (action) {
                    case 'forward':
                        this.inputState.movement.z -= value
                        break
                    case 'backward':
                        this.inputState.movement.z += value
                        break
                    case 'left':
                        this.inputState.movement.x -= value
                        break
                    case 'right':
                        this.inputState.movement.x += value
                        break
                    default:
                        this.inputState.actions.add(action)
                }
            }
        })
    }
    
    // Callback system
    on(event, callback) {
        if (!this.inputCallbacks.has(event)) {
            this.inputCallbacks.set(event, [])
        }
        this.inputCallbacks.get(event).push(callback)
    }
    
    off(event, callback) {
        const callbacks = this.inputCallbacks.get(event)
        if (callbacks) {
            const index = callbacks.indexOf(callback)
            if (index > -1) {
                callbacks.splice(index, 1)
            }
        }
    }
    
    triggerCallback(event, data) {
        const callbacks = this.inputCallbacks.get(event)
        if (callbacks) {
            callbacks.forEach(callback => callback(data))
        }
    }
    
    // Utility methods
    bindAction(action, inputs) {
        this.bindings.set(action, inputs)
    }
    
    isActionActive(action) {
        return this.inputState.actions.has(action)
    }
    
    getMovementVector() {
        return this.inputState.movement.clone()
    }
    
    getLookDelta() {
        return this.inputState.look.clone()
    }
}

export default {
    AdvancedMouseSystem,
    GamepadSystem,
    LeapMotionSystem,
    UnifiedInputManager
}