import { EventEmitter } from '../core/events/EventEmitter.js'

export class Lobby extends EventEmitter {
  constructor(networkManager, options = {}) {
    super()
    
    this.network = networkManager
    this.maxPlayers = options.maxPlayers ?? 8
    this.minPlayers = options.minPlayers ?? 2
    
    this.roomId = null
    this.players = new Map()
    this.hostId = null
    this.isHost = false
    this.gameState = 'lobby'
    
    this.readyPlayers = new Set()
    this.settings = {}
    
    this.setupNetworkHandlers()
  }

  setupNetworkHandlers() {
    this.network.on('playerJoined', (data) => {
      this.handlePlayerJoined(data)
    })
    
    this.network.on('playerLeft', (data) => {
      this.handlePlayerLeft(data)
    })
    
    this.network.on('playerReady', (data) => {
      this.handlePlayerReady(data)
    })
    
    this.network.on('playerNotReady', (data) => {
      this.handlePlayerNotReady(data)
    })
    
    this.network.on('hostChanged', (data) => {
      this.handleHostChanged(data)
    })
    
    this.network.on('gameStarting', (data) => {
      this.handleGameStarting(data)
    })
    
    this.network.on('lobbySettings', (data) => {
      this.handleSettingsUpdate(data)
    })
    
    this.network.on('chatMessage', (data) => {
      this.emit('chat', data)
    })
  }

  async createRoom(roomId, playerData = {}) {
    try {
      const response = await this.network.sendReliable('createRoom', {
        roomId,
        playerData,
        maxPlayers: this.maxPlayers
      })
      
      this.roomId = roomId
      this.hostId = this.network.getPlayerId()
      this.isHost = true
      this.gameState = 'lobby'
      
      this.players.set(this.network.getPlayerId(), {
        id: this.network.getPlayerId(),
        ...playerData
      })
      
      this.emit('roomCreated', { roomId, isHost: true })
      
      return response
    } catch (error) {
      this.emit('error', { type: 'createRoom', error })
      throw error
    }
  }

  async joinRoom(roomId, playerData = {}) {
    try {
      const response = await this.network.sendReliable('joinRoom', {
        roomId,
        playerData
      })
      
      this.roomId = roomId
      this.hostId = response.hostId
      this.isHost = this.hostId === this.network.getPlayerId()
      this.gameState = response.gameState || 'lobby'
      this.settings = response.settings || {}
      
      for (const player of response.players || []) {
        this.players.set(player.id, player)
        if (player.ready) {
          this.readyPlayers.add(player.id)
        }
      }
      
      this.emit('roomJoined', {
        roomId,
        isHost: this.isHost,
        players: Array.from(this.players.values())
      })
      
      return response
    } catch (error) {
      this.emit('error', { type: 'joinRoom', error })
      throw error
    }
  }

  leaveRoom() {
    if (this.roomId) {
      this.network.send('leaveRoom', { roomId: this.roomId })
      
      const oldRoomId = this.roomId
      this.roomId = null
      this.players.clear()
      this.readyPlayers.clear()
      this.hostId = null
      this.isHost = false
      this.gameState = 'lobby'
      
      this.emit('roomLeft', { roomId: oldRoomId })
    }
  }

  setReady(ready = true) {
    if (ready) {
      this.network.send('setReady', { roomId: this.roomId })
      this.readyPlayers.add(this.network.getPlayerId())
    } else {
      this.network.send('setNotReady', { roomId: this.roomId })
      this.readyPlayers.delete(this.network.getPlayerId())
    }
    
    this.emit('readyChanged', {
      playerId: this.network.getPlayerId(),
      ready
    })
  }

  updateSettings(settings) {
    if (!this.isHost) {
      console.warn('Only host can update settings')
      return false
    }
    
    this.settings = { ...this.settings, ...settings }
    this.network.send('updateSettings', {
      roomId: this.roomId,
      settings: this.settings
    })
    
    this.emit('settingsChanged', this.settings)
    return true
  }

  startGame() {
    if (!this.isHost) {
      console.warn('Only host can start the game')
      return false
    }
    
    if (this.players.size < this.minPlayers) {
      console.warn(`Need at least ${this.minPlayers} players to start`)
      return false
    }
    
    this.network.send('startGame', {
      roomId: this.roomId,
      settings: this.settings
    })
    
    return true
  }

  sendChat(message) {
    this.network.send('chatMessage', {
      roomId: this.roomId,
      message,
      playerId: this.network.getPlayerId(),
      timestamp: Date.now()
    })
  }

  kickPlayer(playerId) {
    if (!this.isHost) {
      console.warn('Only host can kick players')
      return false
    }
    
    if (playerId === this.network.getPlayerId()) {
      console.warn('Cannot kick yourself')
      return false
    }
    
    this.network.send('kickPlayer', {
      roomId: this.roomId,
      playerId
    })
    
    return true
  }

  handlePlayerJoined(data) {
    const { player } = data
    this.players.set(player.id, player)
    this.emit('playerJoined', player)
  }

  handlePlayerLeft(data) {
    const { playerId } = data
    const player = this.players.get(playerId)
    this.players.delete(playerId)
    this.readyPlayers.delete(playerId)
    this.emit('playerLeft', { playerId, player })
  }

  handlePlayerReady(data) {
    const { playerId } = data
    this.readyPlayers.add(playerId)
    this.emit('playerReady', { playerId })
  }

  handlePlayerNotReady(data) {
    const { playerId } = data
    this.readyPlayers.delete(playerId)
    this.emit('playerNotReady', { playerId })
  }

  handleHostChanged(data) {
    const { newHostId } = data
    this.hostId = newHostId
    this.isHost = newHostId === this.network.getPlayerId()
    this.emit('hostChanged', { hostId: newHostId, isHost: this.isHost })
  }

  handleGameStarting(data) {
    this.gameState = 'starting'
    this.emit('gameStarting', data)
  }

  handleSettingsUpdate(data) {
    this.settings = data.settings
    this.emit('settingsChanged', this.settings)
  }

  getPlayers() {
    return Array.from(this.players.values())
  }

  getPlayer(playerId) {
    return this.players.get(playerId)
  }

  getPlayerCount() {
    return this.players.size
  }

  getReadyCount() {
    return this.readyPlayers.size
  }

  allPlayersReady() {
    return this.readyPlayers.size === this.players.size && this.players.size >= this.minPlayers
  }

  isPlayerReady(playerId) {
    return this.readyPlayers.has(playerId)
  }

  getSettings() {
    return { ...this.settings }
  }

  getRoomId() {
    return this.roomId
  }

  isInRoom() {
    return this.roomId !== null
  }
}
