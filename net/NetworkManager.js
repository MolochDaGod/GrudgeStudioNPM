import { EventEmitter } from '../core/events/EventEmitter.js'

export class NetworkManager extends EventEmitter {
  constructor(options = {}) {
    super()
    
    this.socket = null
    this.connected = false
    this.playerId = null
    this.roomId = null
    this.latency = 0
    this.serverTime = 0
    this.timeOffset = 0
    
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 5
    this.reconnectDelay = options.reconnectDelay ?? 1000
    this.autoReconnect = options.autoReconnect ?? true
    
    this.messageQueue = []
    this.isProcessing = false
    
    this.pingInterval = null
    this.pingRate = options.pingRate ?? 1000
    this.lastPingTime = 0
    
    this.debug = options.debug ?? false
  }

  async connect(url, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (typeof io === 'undefined') {
          throw new Error('Socket.IO client not loaded. Include <script src="/socket.io/socket.io.js"></script>')
        }
        
        this.socket = io(url, {
          reconnection: false,
          ...options
        })
        
        this.socket.on('connect', () => {
          this.connected = true
          this.reconnectAttempts = 0
          this.playerId = this.socket.id
          
          this.startPing()
          
          if (this.debug) console.log('NetworkManager: Connected', this.playerId)
          this.emit('connected', this.playerId)
          resolve(this.playerId)
        })
        
        this.socket.on('disconnect', (reason) => {
          this.connected = false
          this.stopPing()
          
          if (this.debug) console.log('NetworkManager: Disconnected', reason)
          this.emit('disconnected', reason)
          
          if (this.autoReconnect && reason !== 'io client disconnect') {
            this.attemptReconnect(url, options)
          }
        })
        
        this.socket.on('connect_error', (error) => {
          if (this.debug) console.error('NetworkManager: Connection error', error)
          this.emit('error', error)
          
          if (!this.connected) {
            reject(error)
          }
        })
        
        this.socket.on('pong', (serverTime) => {
          const now = Date.now()
          this.latency = (now - this.lastPingTime) / 2
          this.serverTime = serverTime
          this.timeOffset = serverTime - now + this.latency
          
          this.emit('latency', this.latency)
        })
        
      } catch (error) {
        reject(error)
      }
    })
  }

  attemptReconnect(url, options) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnectFailed')
      return
    }
    
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    if (this.debug) console.log(`NetworkManager: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    this.emit('reconnecting', this.reconnectAttempts)
    
    setTimeout(() => {
      this.connect(url, options).catch(() => {
        this.attemptReconnect(url, options)
      })
    }, delay)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.connected = false
    this.stopPing()
  }

  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.connected) {
        this.lastPingTime = Date.now()
        this.socket.emit('ping')
      }
    }, this.pingRate)
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  send(event, data) {
    if (!this.connected || !this.socket) {
      if (this.debug) console.warn('NetworkManager: Not connected, queuing message')
      this.messageQueue.push({ event, data })
      return false
    }
    
    this.socket.emit(event, data)
    return true
  }

  sendReliable(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.connected || !this.socket) {
        reject(new Error('Not connected'))
        return
      }
      
      this.socket.emit(event, data, (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }

  on(event, callback) {
    if (event === 'connected' || event === 'disconnected' || 
        event === 'error' || event === 'latency' || 
        event === 'reconnecting' || event === 'reconnectFailed') {
      return super.on(event, callback)
    }
    
    if (this.socket) {
      this.socket.on(event, callback)
    }
    
    return () => {
      if (this.socket) {
        this.socket.off(event, callback)
      }
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
    super.off(event, callback)
  }

  joinRoom(roomId, playerData = {}) {
    return this.sendReliable('joinRoom', { roomId, playerData })
      .then((response) => {
        this.roomId = roomId
        this.emit('roomJoined', response)
        return response
      })
  }

  leaveRoom() {
    if (this.roomId) {
      this.send('leaveRoom', { roomId: this.roomId })
      const oldRoom = this.roomId
      this.roomId = null
      this.emit('roomLeft', oldRoom)
    }
  }

  broadcast(event, data, includeSelf = false) {
    this.send('broadcast', { event, data, includeSelf })
  }

  getServerTime() {
    return Date.now() + this.timeOffset
  }

  getLatency() {
    return this.latency
  }

  isConnected() {
    return this.connected
  }

  getPlayerId() {
    return this.playerId
  }

  getRoomId() {
    return this.roomId
  }

  flushQueue() {
    while (this.messageQueue.length > 0 && this.connected) {
      const { event, data } = this.messageQueue.shift()
      this.send(event, data)
    }
  }
}
