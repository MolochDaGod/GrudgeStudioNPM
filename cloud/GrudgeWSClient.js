/**
 * GrudgeWSClient — Shared WebSocket Client for All Grudge Studio Games
 *
 * Wraps Socket.IO with Grudge conventions:
 *   - Auto-resolves VITE_WS_URL or falls back to localhost:3007
 *   - Sends JWT on connect via auth handshake
 *   - Supports /game, /crew, /global namespaces
 *   - Built-in reconnection and event emitter
 *
 * Usage:
 *   import { GrudgeWSClient } from 'grudge-studio/cloud'
 *   const ws = new GrudgeWSClient({ token: sdk.token })
 *   await ws.connect()
 *   ws.on('playerJoined', (data) => { ... })
 *   ws.sendPlayerMove(position, rotation)
 */

function resolveWSUrl(override) {
  if (override) return override
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL
    }
  } catch {}
  return 'http://localhost:3007'
}

export class GrudgeWSClient {
  #url
  #token
  #socket = null
  #handlers = new Map()
  #connected = false
  #characterId = null

  /**
   * @param {object} [config]
   * @param {string} [config.url]       Override WS URL
   * @param {string} [config.token]     JWT for auth handshake
   * @param {string} [config.namespace] Socket.IO namespace (default: '/game')
   */
  constructor(config = {}) {
    this.#url = resolveWSUrl(config.url)
    this.#token = config.token || null
    this.namespace = config.namespace || '/game'
  }

  get connected() { return this.#connected }
  get socket() { return this.#socket }

  setToken(token) { this.#token = token }

  /**
   * Connect to the WS service.
   * Dynamically imports socket.io-client so it's not bundled when unused.
   */
  async connect() {
    const { io } = await import('socket.io-client')

    const url = this.namespace !== '/' ? `${this.#url}${this.namespace}` : this.#url

    return new Promise((resolve, reject) => {
      this.#socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        auth: this.#token ? { token: this.#token } : undefined,
      })

      this.#socket.on('connect', () => {
        console.log(`[GrudgeWS] Connected to ${url}`)
        this.#connected = true
        resolve()
      })

      this.#socket.on('disconnect', (reason) => {
        console.log(`[GrudgeWS] Disconnected: ${reason}`)
        this.#connected = false
        this.#emit('disconnected', { reason })
      })

      this.#socket.on('connect_error', (err) => {
        console.error('[GrudgeWS] Connection error:', err.message)
        reject(err)
      })

      // Standard Grudge events
      const autoEvents = [
        'authenticated', 'playerJoined', 'playerLeft',
        'playerMoved', 'chatMessage', 'crewUpdate',
        'missionUpdate', 'worldEvent', 'combatEvent',
      ]
      autoEvents.forEach(evt => {
        this.#socket.on(evt, (data) => this.#emit(evt, data))
      })
    })
  }

  // ── Auth handshake ──────────────────────────────────────────
  authenticate(token, characterId) {
    if (!this.#socket || !this.#connected) return
    this.#token = token || this.#token
    this.#characterId = characterId
    this.#socket.emit('authenticate', { token: this.#token, characterId })
  }

  // ── Standard game messages ─────────────────────────────────
  sendPlayerMove(position, rotation) {
    this.#send('playerMove', {
      position: { x: position.x, y: position.y, z: position.z },
      rotation,
    })
  }

  sendChatMessage(message, type = 'spatial') {
    this.#send('chatMessage', { message, type })
  }

  sendCombatAction(action, targetId) {
    this.#send('combatAction', { action, targetId })
  }

  joinIsland(islandId) {
    this.#send('joinIsland', { islandId })
  }

  // ── Generic send/emit ──────────────────────────────────────
  send(event, data) { this.#send(event, data) }

  #send(event, data) {
    if (!this.#socket || !this.#connected) return
    this.#socket.emit(event, data)
  }

  // ── Event handler system ───────────────────────────────────
  on(event, handler) {
    if (!this.#handlers.has(event)) this.#handlers.set(event, [])
    this.#handlers.get(event).push(handler)
    return this
  }

  off(event, handler) {
    const list = this.#handlers.get(event)
    if (list) {
      const idx = list.indexOf(handler)
      if (idx !== -1) list.splice(idx, 1)
    }
    return this
  }

  #emit(event, data) {
    const handlers = this.#handlers.get(event)
    if (handlers) handlers.forEach(fn => fn(data))
  }

  // ── Disconnect ─────────────────────────────────────────────
  disconnect() {
    if (this.#socket) {
      this.#socket.disconnect()
      this.#socket = null
      this.#connected = false
    }
  }
}
