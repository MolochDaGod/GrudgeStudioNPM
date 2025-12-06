export const Examples = {
  arenaFighter: {
    name: 'Arena Fighter',
    description: '3D fighting game with combat, health, and round system',
    code: \`
import * as THREE from 'three'
import { SceneManager } from '@grudge-studio/render'
import { ThirdPersonController } from '@grudge-studio/controllers'
import { CombatController, DamageSystem } from '@grudge-studio/controllers'
import { InputManager, Clock, EventBus } from '@grudge-studio/core'

class ArenaFighter {
  constructor() {
    this.scene = new SceneManager({ 
      container: document.body,
      backgroundColor: 0x1a1a2e 
    })
    
    this.input = new InputManager()
    this.clock = new Clock()
    this.damageSystem = new DamageSystem()
    
    this.player = null
    this.enemy = null
    this.round = 1
    this.maxRounds = 3
    
    this.init()
  }
  
  async init() {
    this.setupLighting()
    this.createArena()
    await this.createFighters()
    this.setupCombat()
    this.setupUI()
    this.gameLoop()
  }
  
  setupLighting() {
    this.scene.addAmbientLight(0xffffff, 0.4)
    this.scene.addDirectionalLight(0xffffff, 0.8, { x: 5, y: 10, z: 5 })
    this.scene.setFog(0x1a1a2e, 20, 50)
  }
  
  createArena() {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(15, 32),
      new THREE.MeshStandardMaterial({ color: 0x2d2d44 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)
  }
  
  async createFighters() {
    const playerMesh = this.createFighterMesh(0x4488ff)
    playerMesh.position.set(-5, 0, 0)
    this.scene.add(playerMesh)
    
    this.player = {
      mesh: playerMesh,
      controller: new ThirdPersonController(playerMesh, this.scene.getCamera()),
      combat: new CombatController()
    }
    
    const enemyMesh = this.createFighterMesh(0xff4444)
    enemyMesh.position.set(5, 0, 0)
    this.scene.add(enemyMesh)
    
    this.enemy = {
      mesh: enemyMesh,
      controller: new ThirdPersonController(enemyMesh, null),
      combat: new CombatController()
    }
    
    this.damageSystem.registerEntity('player', { maxHealth: 100 })
    this.damageSystem.registerEntity('enemy', { maxHealth: 100 })
  }
  
  createFighterMesh(color) {
    const group = new THREE.Group()
    
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 1, 8, 16),
      new THREE.MeshStandardMaterial({ color })
    )
    body.position.y = 1
    body.castShadow = true
    group.add(body)
    
    return group
  }
  
  setupCombat() {
    const attacks = {
      light: { damage: 10, knockback: 3, stunDuration: 0.2, startup: 0.1, active: 0.15, recovery: 0.2 },
      heavy: { damage: 25, knockback: 6, stunDuration: 0.4, startup: 0.25, active: 0.2, recovery: 0.4 }
    }
    
    this.player.combat.registerAttack('light', attacks.light)
    this.player.combat.registerAttack('heavy', attacks.heavy)
    this.enemy.combat.registerAttack('light', attacks.light)
    this.enemy.combat.registerAttack('heavy', attacks.heavy)
    
    this.damageSystem.on('death', (entityId) => {
      this.endRound(entityId === 'enemy' ? 'player' : 'enemy')
    })
  }
  
  setupUI() {
    const ui = document.createElement('div')
    ui.id = 'game-ui'
    ui.innerHTML = \\\`
      <div class="health-bar player"><div class="fill"></div></div>
      <div class="health-bar enemy"><div class="fill"></div></div>
      <div class="round-info">Round <span id="round">1</span></div>
    \\\`
    document.body.appendChild(ui)
  }
  
  update(dt) {
    const move = this.input.getMovementVector()
    this.player.controller.setMoveDirection(move.x, move.y)
    
    if (this.input.isMousePressed(0)) {
      this.player.combat.attack('light')
    }
    if (this.input.isMousePressed(2)) {
      this.player.combat.attack('heavy')
    }
    
    this.player.controller.update(dt)
    this.player.combat.update(dt)
    this.enemy.combat.update(dt)
    this.damageSystem.update(dt)
    
    this.updateUI()
  }
  
  updateUI() {
    const playerHealth = this.damageSystem.getHealthPercentage('player')
    const enemyHealth = this.damageSystem.getHealthPercentage('enemy')
    
    document.querySelector('.health-bar.player .fill').style.width = (playerHealth * 100) + '%'
    document.querySelector('.health-bar.enemy .fill').style.width = (enemyHealth * 100) + '%'
  }
  
  endRound(winner) {
    console.log(winner + ' wins the round!')
    this.round++
    
    if (this.round > this.maxRounds) {
      this.endMatch()
    } else {
      this.resetRound()
    }
  }
  
  resetRound() {
    this.damageSystem.reset()
    this.player.mesh.position.set(-5, 0, 0)
    this.enemy.mesh.position.set(5, 0, 0)
    document.getElementById('round').textContent = this.round
  }
  
  endMatch() {
    console.log('Match Over!')
  }
  
  gameLoop() {
    const dt = this.clock.getDelta()
    this.update(dt)
    this.scene.render()
    this.input.update()
    requestAnimationFrame(() => this.gameLoop())
  }
}

new ArenaFighter()
\`
  },

  multiplayerLobby: {
    name: 'Multiplayer Lobby',
    description: 'Room-based multiplayer with ready system and chat',
    code: \`
import { NetworkManager, Lobby } from '@grudge-studio/net'
import { EventBus } from '@grudge-studio/core'

class MultiplayerLobby {
  constructor() {
    this.network = new NetworkManager({ debug: true })
    this.lobby = new Lobby(this.network, { maxPlayers: 4, minPlayers: 2 })
    
    this.currentRoom = null
    this.isReady = false
    
    this.init()
  }
  
  async init() {
    this.setupUI()
    this.setupNetworkEvents()
    await this.connect()
  }
  
  setupUI() {
    document.body.innerHTML = \\\`
      <div id="lobby">
        <h1>Multiplayer Lobby</h1>
        <div id="connection-status">Connecting...</div>
        
        <div id="room-controls">
          <input type="text" id="room-id" placeholder="Room ID">
          <button id="create-room">Create Room</button>
          <button id="join-room">Join Room</button>
        </div>
        
        <div id="room-view" style="display: none;">
          <h2>Room: <span id="current-room"></span></h2>
          <div id="player-list"></div>
          <button id="ready-btn">Ready</button>
          <button id="leave-btn">Leave</button>
          <button id="start-btn" style="display: none;">Start Game</button>
          
          <div id="chat">
            <div id="messages"></div>
            <input type="text" id="chat-input" placeholder="Type message...">
            <button id="send-chat">Send</button>
          </div>
        </div>
      </div>
    \\\`
    
    document.getElementById('create-room').onclick = () => this.createRoom()
    document.getElementById('join-room').onclick = () => this.joinRoom()
    document.getElementById('ready-btn').onclick = () => this.toggleReady()
    document.getElementById('leave-btn').onclick = () => this.leaveRoom()
    document.getElementById('start-btn').onclick = () => this.startGame()
    document.getElementById('send-chat').onclick = () => this.sendChat()
  }
  
  setupNetworkEvents() {
    this.network.on('connected', () => {
      document.getElementById('connection-status').textContent = 'Connected!'
    })
    
    this.network.on('disconnected', () => {
      document.getElementById('connection-status').textContent = 'Disconnected'
    })
    
    this.lobby.on('playerJoined', (player) => {
      this.updatePlayerList()
    })
    
    this.lobby.on('playerLeft', () => {
      this.updatePlayerList()
    })
    
    this.lobby.on('playerReady', () => {
      this.updatePlayerList()
      this.checkStartCondition()
    })
    
    this.lobby.on('playerNotReady', () => {
      this.updatePlayerList()
      this.checkStartCondition()
    })
    
    this.lobby.on('hostChanged', ({ isHost }) => {
      document.getElementById('start-btn').style.display = isHost ? 'block' : 'none'
    })
    
    this.lobby.on('gameStarting', (data) => {
      console.log('Game starting!', data)
      EventBus.emit('gameStart', data)
    })
    
    this.lobby.on('chat', (data) => {
      this.addChatMessage(data.playerId, data.message)
    })
  }
  
  async connect() {
    try {
      await this.network.connect(window.location.origin)
    } catch (error) {
      document.getElementById('connection-status').textContent = 'Connection failed'
    }
  }
  
  async createRoom() {
    const roomId = document.getElementById('room-id').value || 'room-' + Date.now()
    try {
      await this.lobby.createRoom(roomId, { name: 'Player' })
      this.showRoomView(roomId)
    } catch (error) {
      alert('Failed to create room: ' + error.message)
    }
  }
  
  async joinRoom() {
    const roomId = document.getElementById('room-id').value
    if (!roomId) {
      alert('Enter a room ID')
      return
    }
    
    try {
      await this.lobby.joinRoom(roomId, { name: 'Player' })
      this.showRoomView(roomId)
    } catch (error) {
      alert('Failed to join room: ' + error.message)
    }
  }
  
  showRoomView(roomId) {
    document.getElementById('room-controls').style.display = 'none'
    document.getElementById('room-view').style.display = 'block'
    document.getElementById('current-room').textContent = roomId
    document.getElementById('start-btn').style.display = this.lobby.isHost ? 'block' : 'none'
    this.updatePlayerList()
  }
  
  updatePlayerList() {
    const players = this.lobby.getPlayers()
    const list = document.getElementById('player-list')
    
    list.innerHTML = players.map(p => \\\`
      <div class="player \\\${this.lobby.isPlayerReady(p.id) ? 'ready' : ''}">
        \\\${p.name || p.id}
        \\\${p.id === this.lobby.hostId ? ' (Host)' : ''}
        \\\${this.lobby.isPlayerReady(p.id) ? ' ✓' : ''}
      </div>
    \\\`).join('')
  }
  
  toggleReady() {
    this.isReady = !this.isReady
    this.lobby.setReady(this.isReady)
    document.getElementById('ready-btn').textContent = this.isReady ? 'Not Ready' : 'Ready'
  }
  
  checkStartCondition() {
    const canStart = this.lobby.allPlayersReady()
    document.getElementById('start-btn').disabled = !canStart
  }
  
  startGame() {
    if (this.lobby.isHost && this.lobby.allPlayersReady()) {
      this.lobby.startGame()
    }
  }
  
  leaveRoom() {
    this.lobby.leaveRoom()
    document.getElementById('room-controls').style.display = 'block'
    document.getElementById('room-view').style.display = 'none'
    this.isReady = false
  }
  
  sendChat() {
    const input = document.getElementById('chat-input')
    if (input.value.trim()) {
      this.lobby.sendChat(input.value)
      input.value = ''
    }
  }
  
  addChatMessage(playerId, message) {
    const messages = document.getElementById('messages')
    const div = document.createElement('div')
    div.textContent = playerId + ': ' + message
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
  }
}

new MultiplayerLobby()
\`
  },

  proceduralWorld: {
    name: 'Procedural World',
    description: 'Infinite terrain with biomes and LOD',
    code: \`
import * as THREE from 'three'
import { SceneManager, OrbitCamera } from '@grudge-studio/render'
import { LODTerrain, BiomeSystem } from '@grudge-studio/terrain'
import { InputManager, Clock } from '@grudge-studio/core'

class ProceduralWorld {
  constructor() {
    this.scene = new SceneManager({ 
      container: document.body,
      backgroundColor: 0x87ceeb
    })
    
    this.camera = new OrbitCamera(this.scene.getCamera(), {
      distance: 100,
      minDistance: 10,
      maxDistance: 500,
      phi: Math.PI / 4
    })
    
    this.input = new InputManager()
    this.clock = new Clock()
    
    this.init()
  }
  
  init() {
    this.setupLighting()
    this.createTerrain()
    this.gameLoop()
  }
  
  setupLighting() {
    this.scene.addHemisphereLight(0x87ceeb, 0x3d5c3d, 0.6)
    this.scene.addDirectionalLight(0xffffff, 0.8, { x: 100, y: 100, z: 50 })
  }
  
  createTerrain() {
    this.biomes = new BiomeSystem({ seed: 12345 })
    
    this.terrain = new LODTerrain({
      chunkSize: 64,
      viewDistance: 4,
      resolution: 32,
      maxHeight: 40,
      seed: 12345,
      frequency: 0.008,
      octaves: 6,
      persistence: 0.5
    })
    
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.9,
      metalness: 0.1
    })
    
    this.terrain.setMaterial(material)
    
    this.terrain.onChunkLoad = (chunk) => {
      this.applyBiomeColors(chunk)
    }
    
    this.scene.add(this.terrain.getGroup())
    
    this.terrain.forceUpdate(new THREE.Vector3(0, 100, 0))
  }
  
  applyBiomeColors(chunk) {
    if (!chunk.mesh) return
    
    const positions = chunk.mesh.geometry.attributes.position.array
    const colors = new Float32Array(positions.length)
    
    for (let i = 0; i < positions.length / 3; i++) {
      const worldX = chunk.mesh.position.x + positions[i * 3] - chunk.size / 2
      const worldZ = chunk.mesh.position.z + positions[i * 3 + 2] - chunk.size / 2
      const height = positions[i * 3 + 1] / chunk.maxHeight
      
      const color = this.biomes.getBlendedColor(worldX, worldZ, height)
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    chunk.mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }
  
  update(dt) {
    if (this.input.isMouseDown(0)) {
      this.camera.rotate(
        this.input.getMouseDelta().x * 5,
        this.input.getMouseDelta().y * 5
      )
    }
    
    this.camera.zoom(this.input.getMouseWheel() * 0.01)
    
    const move = this.input.getMovementVector()
    if (move.lengthSq() > 0) {
      const speed = 50 * dt
      this.camera.target.x += move.x * speed
      this.camera.target.z += move.y * speed
      
      const height = this.terrain.getHeightAt(
        this.camera.target.x,
        this.camera.target.z
      )
      this.camera.target.y = height + 5
    }
    
    this.camera.update(dt)
    this.terrain.update(this.scene.getCamera().position)
  }
  
  gameLoop() {
    const dt = this.clock.getDelta()
    this.update(dt)
    this.scene.render()
    this.input.update()
    requestAnimationFrame(() => this.gameLoop())
  }
}

new ProceduralWorld()
\`
  }
}
