import * as THREE from 'three'

export const CameraMode = {
  THIRD_PERSON: 'thirdPerson',
  FPS: 'fps',
  ACTION: 'action',
  RTS: 'rts',
  TOP_DOWN: 'topDown',
  ISOMETRIC: 'isometric'
}

export class CameraContext {
  constructor() {
    this.playerPosition = new THREE.Vector3()
    this.playerRotation = 0
    this.opponentPosition = new THREE.Vector3()
    this.targetLocked = false
    this.deltaTime = 0
    this.input = null
    this.arenaBounds = { width: 40, depth: 30 }
  }
  
  update(player, opponent, input, deltaTime, targetLocked = false) {
    if (player) {
      this.playerPosition.copy(player.getPosition())
      this.playerRotation = player.getMesh().rotation.y
    }
    if (opponent) {
      this.opponentPosition.copy(opponent.getPosition())
    }
    this.input = input
    this.deltaTime = deltaTime
    this.targetLocked = targetLocked
  }
}

class BaseCameraController {
  constructor(name, description) {
    this.name = name
    this.description = description
    this.transitionSpeed = 5
  }
  
  activate(camera, context) {}
  deactivate(camera, context) {}
  update(camera, context) {}
  
  lerpPosition(camera, target, speed, deltaTime) {
    camera.position.lerp(target, speed * deltaTime)
  }
}

export class ThirdPersonCamera extends BaseCameraController {
  constructor() {
    super('Third Person', 'Camera behind and above player')
    this.offset = new THREE.Vector3(0, 5, 10)
    this.lookOffset = new THREE.Vector3(0, 1.5, 0)
  }
  
  update(camera, context) {
    const { playerPosition, playerRotation, opponentPosition, targetLocked, deltaTime } = context
    
    if (targetLocked) {
      const dirToOpponent = opponentPosition.clone().sub(playerPosition).normalize()
      const behindPlayer = playerPosition.clone().sub(dirToOpponent.multiplyScalar(8))
      behindPlayer.y = 6
      this.lerpPosition(camera, behindPlayer, this.transitionSpeed, deltaTime)
      camera.lookAt(opponentPosition.x, 1.5, opponentPosition.z)
    } else {
      const offsetRotated = this.offset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotation)
      const targetPos = playerPosition.clone().add(offsetRotated)
      this.lerpPosition(camera, targetPos, this.transitionSpeed, deltaTime)
      
      const lookTarget = playerPosition.clone().add(this.lookOffset)
      camera.lookAt(lookTarget)
    }
  }
}

export class FPSCamera extends BaseCameraController {
  constructor() {
    super('First Person', 'Camera at player eye level')
    this.eyeHeight = 1.8
  }
  
  update(camera, context) {
    const { playerPosition, playerRotation, deltaTime } = context
    
    const targetPos = playerPosition.clone()
    targetPos.y += this.eyeHeight
    
    this.lerpPosition(camera, targetPos, 15, deltaTime)
    
    const lookDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotation)
    const lookTarget = targetPos.clone().add(lookDir.multiplyScalar(10))
    camera.lookAt(lookTarget)
  }
}

export class ActionCamera extends BaseCameraController {
  constructor() {
    super('Action', 'Dynamic combat camera')
    this.baseDistance = 8
    this.maxDistance = 15
    this.baseFOV = 50
    this.actionFOV = 65
    this.currentFOV = 50
  }
  
  update(camera, context) {
    const { playerPosition, opponentPosition, targetLocked, deltaTime } = context
    
    const midpoint = playerPosition.clone().add(opponentPosition).multiplyScalar(0.5)
    const distance = playerPosition.distanceTo(opponentPosition)
    
    const dynamicDistance = Math.min(this.maxDistance, this.baseDistance + distance * 0.3)
    
    const targetFOV = targetLocked ? this.actionFOV : this.baseFOV
    this.currentFOV = THREE.MathUtils.lerp(this.currentFOV, targetFOV, 3 * deltaTime)
    camera.fov = this.currentFOV
    camera.updateProjectionMatrix()
    
    const cameraHeight = 5 + distance * 0.2
    const targetPos = new THREE.Vector3(
      midpoint.x,
      cameraHeight,
      midpoint.z + dynamicDistance
    )
    
    this.lerpPosition(camera, targetPos, 4, deltaTime)
    
    if (targetLocked) {
      camera.lookAt(opponentPosition.x, 1.5, opponentPosition.z)
    } else {
      camera.lookAt(midpoint.x, 1, midpoint.z)
    }
  }
}

export class RTSCamera extends BaseCameraController {
  constructor() {
    super('RTS', 'Top-down angled strategy view')
    this.height = 25
    this.angle = Math.PI / 4
    this.panSpeed = 20
    this.zoomSpeed = 5
    this.minZoom = 15
    this.maxZoom = 50
    this.targetPosition = new THREE.Vector3(0, 0, 0)
  }
  
  activate(camera, context) {
    this.targetPosition.copy(context.playerPosition)
    this.targetPosition.y = 0
  }
  
  update(camera, context) {
    const { input, deltaTime } = context
    
    if (input) {
      const moveVector = input.getMovementVector()
      this.targetPosition.x += moveVector.x * this.panSpeed * deltaTime
      this.targetPosition.z += moveVector.z * this.panSpeed * deltaTime
    }
    
    const targetPos = new THREE.Vector3(
      this.targetPosition.x,
      this.height,
      this.targetPosition.z + Math.tan(this.angle) * this.height
    )
    
    this.lerpPosition(camera, targetPos, 8, deltaTime)
    camera.lookAt(this.targetPosition.x, 0, this.targetPosition.z)
  }
}

export class TopDownCamera extends BaseCameraController {
  constructor() {
    super('Top Down', 'Directly overhead view')
    this.height = 30
  }
  
  update(camera, context) {
    const { playerPosition, deltaTime } = context
    
    const targetPos = new THREE.Vector3(
      playerPosition.x,
      this.height,
      playerPosition.z
    )
    
    this.lerpPosition(camera, targetPos, 6, deltaTime)
    camera.lookAt(playerPosition.x, 0, playerPosition.z)
  }
}

export class IsometricCamera extends BaseCameraController {
  constructor() {
    super('Isometric', 'Fixed 45-degree angle view')
    this.distance = 20
    this.angle = Math.PI / 4
    this.elevation = Math.PI / 6
  }
  
  update(camera, context) {
    const { playerPosition, deltaTime } = context
    
    const offsetX = Math.sin(this.angle) * Math.cos(this.elevation) * this.distance
    const offsetY = Math.sin(this.elevation) * this.distance
    const offsetZ = Math.cos(this.angle) * Math.cos(this.elevation) * this.distance
    
    const targetPos = new THREE.Vector3(
      playerPosition.x + offsetX,
      playerPosition.y + offsetY,
      playerPosition.z + offsetZ
    )
    
    this.lerpPosition(camera, targetPos, 6, deltaTime)
    camera.lookAt(playerPosition.x, playerPosition.y + 1, playerPosition.z)
  }
}

export class CameraManager {
  constructor(camera) {
    this.camera = camera
    this.context = new CameraContext()
    this.currentMode = CameraMode.THIRD_PERSON
    
    this.controllers = {
      [CameraMode.THIRD_PERSON]: new ThirdPersonCamera(),
      [CameraMode.FPS]: new FPSCamera(),
      [CameraMode.ACTION]: new ActionCamera(),
      [CameraMode.RTS]: new RTSCamera(),
      [CameraMode.TOP_DOWN]: new TopDownCamera(),
      [CameraMode.ISOMETRIC]: new IsometricCamera()
    }
    
    this.onModeChange = null
    this.initialized = false
  }
  
  activate() {
    if (!this.initialized) {
      this.getCurrentController().activate(this.camera, this.context)
      this.initialized = true
    }
  }
  
  getCurrentController() {
    return this.controllers[this.currentMode]
  }
  
  getModeName() {
    return this.getCurrentController().name
  }
  
  getModeDescription() {
    return this.getCurrentController().description
  }
  
  setMode(mode, player = null, opponent = null) {
    if (this.controllers[mode] && mode !== this.currentMode) {
      const oldController = this.getCurrentController()
      oldController.deactivate(this.camera, this.context)
      
      this.currentMode = mode
      
      if (player) {
        this.context.update(player, opponent, null, 0, false)
      }
      
      const newController = this.getCurrentController()
      newController.activate(this.camera, this.context)
      
      if (this.onModeChange) {
        this.onModeChange(mode, newController.name)
      }
      
      console.log(`Camera mode: ${newController.name}`)
    }
  }
  
  nextMode() {
    const modes = Object.values(CameraMode)
    const currentIndex = modes.indexOf(this.currentMode)
    const nextIndex = (currentIndex + 1) % modes.length
    this.setMode(modes[nextIndex])
  }
  
  previousMode() {
    const modes = Object.values(CameraMode)
    const currentIndex = modes.indexOf(this.currentMode)
    const prevIndex = (currentIndex - 1 + modes.length) % modes.length
    this.setMode(modes[prevIndex])
  }
  
  update(player, opponent, input, deltaTime, targetLocked = false) {
    if (!this.initialized) {
      this.activate()
    }
    this.context.update(player, opponent, input, deltaTime, targetLocked)
    this.getCurrentController().update(this.camera, this.context)
  }
}
