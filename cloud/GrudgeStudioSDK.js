/**
 * GrudgeStudioSDK — Shared Backend Client for All Grudge Studio Games
 *
 * Connects any Grudge game to the unified grudge-studio-backend.
 * Services: grudge-id (auth), game-api, account-api, asset-service, launcher-api
 *
 * Usage:
 *   import { GrudgeStudioSDK } from 'grudge-studio/cloud'
 *   const sdk = new GrudgeStudioSDK()           // auto-detects env vars
 *   const sdk = new GrudgeStudioSDK({ authUrl, apiUrl })  // explicit
 *
 * Environment variables (set in Vercel / .env):
 *   VITE_AUTH_URL     https://id.grudge-studio.com
 *   VITE_API_URL      https://api.grudge-studio.com
 *   VITE_ACCOUNT_URL  https://account.grudge-studio.com
 *   VITE_ASSETS_URL   https://assets-api.grudge-studio.com
 *   VITE_WS_URL       wss://ws.grudge-studio.com
 *
 * Leave all empty for local dev — Vite proxy (see vite-proxy.js) routes correctly.
 */

// ── Resolve base URLs from env or config ──────────────────────
function resolveEnv(key, fallback) {
  // Works in Vite (import.meta.env) and plain Node (process.env)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || fallback
    }
  } catch { /* ignore */ }
  try {
    return process?.env?.[key] || fallback
  } catch { /* ignore */ }
  return fallback
}

const OBJECT_STORE_BASE = 'https://molochdagod.github.io/ObjectStore/api/v1'

export class GrudgeStudioSDK {
  #token = null
  #user = null
  #authUrl
  #apiUrl
  #accountUrl
  #assetsUrl

  /**
   * @param {object} [config]
   * @param {string} [config.authUrl]    Override VITE_AUTH_URL
   * @param {string} [config.apiUrl]     Override VITE_API_URL
   * @param {string} [config.accountUrl] Override VITE_ACCOUNT_URL
   * @param {string} [config.assetsUrl]  Override VITE_ASSETS_URL
   * @param {string} [config.token]      Pre-set JWT (e.g. from localStorage)
   */
  constructor(config = {}) {
    this.#authUrl    = config.authUrl    || resolveEnv('VITE_AUTH_URL', '')
    this.#apiUrl     = config.apiUrl     || resolveEnv('VITE_API_URL', '')
    this.#accountUrl = config.accountUrl || resolveEnv('VITE_ACCOUNT_URL', '')
    this.#assetsUrl  = config.assetsUrl  || resolveEnv('VITE_ASSETS_URL', '')
    if (config.token) this.#token = config.token
  }

  // ── Internal fetch helper ───────────────────────────────────
  async #request(base, path, { method = 'GET', body, timeout = 8000 } = {}) {
    const url = `${base}${path}`
    const headers = { 'Content-Type': 'application/json' }
    if (this.#token) headers.Authorization = `Bearer ${this.#token}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
      const data = await res.json()
      if (!res.ok && !data.success) {
        data._httpStatus = res.status
      }
      return data
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, error: 'Request timed out', offline: true }
      }
      return { success: false, error: err.message, offline: true }
    } finally {
      clearTimeout(timer)
    }
  }

  // ── Token / user state ──────────────────────────────────────
  get token() { return this.#token }
  get user() { return this.#user }
  get isAuthenticated() { return !!this.#token }

  setToken(token) { this.#token = token }

  /**
   * Persist token to localStorage (browser) and restore on next construct.
   * Call sdk.restoreSession() on app start to auto-login.
   */
  persistToken() {
    try { localStorage.setItem('grudge_token', this.#token || '') } catch {}
  }
  restoreSession() {
    try {
      const saved = localStorage.getItem('grudge_token')
      if (saved) this.#token = saved
    } catch {}
    return this.#token
  }
  clearSession() {
    this.#token = null
    this.#user = null
    try { localStorage.removeItem('grudge_token') } catch {}
  }

  // ═══════════════════════════════════════════════════════════
  //  AUTH — grudge-id (id.grudge-studio.com)
  // ═══════════════════════════════════════════════════════════

  async login(username, password) {
    const data = await this.#request(this.#authUrl, '/auth/login', {
      method: 'POST', body: { username, password },
    })
    if (data.success) {
      this.#token = data.token
      this.#user = data.user
    }
    return data
  }

  async register(username, password, email) {
    const data = await this.#request(this.#authUrl, '/auth/register', {
      method: 'POST', body: { username, password, email: email || undefined },
    })
    if (data.success) {
      this.#token = data.token
      this.#user = data.user
    }
    return data
  }

  async guestLogin(deviceId) {
    const id = deviceId || (typeof crypto !== 'undefined' ? crypto.randomUUID() : `dev-${Date.now()}`)
    try { localStorage.setItem('grudge_device_id', id) } catch {}
    const data = await this.#request(this.#authUrl, '/auth/guest', {
      method: 'POST', body: { deviceId: id },
    })
    if (data.success) {
      this.#token = data.token
      this.#user = data.user
    }
    return data
  }

  async walletLogin(walletAddress, signature, message) {
    const data = await this.#request(this.#authUrl, '/auth/wallet', {
      method: 'POST', body: { walletAddress, signature, message },
    })
    if (data.success) {
      this.#token = data.token
      this.#user = data.user
    }
    return data
  }

  async discordExchange(code, redirectUri) {
    const data = await this.#request(this.#authUrl, '/auth/discord/exchange', {
      method: 'POST', body: { code, redirect_uri: redirectUri },
    })
    if (data.success) {
      this.#token = data.token
      this.#user = data.user
    }
    return data
  }

  async puterLogin(puterUuid, puterUsername, username) {
    const data = await this.#request(this.#authUrl, '/auth/puter', {
      method: 'POST', body: { puterUuid, puterUsername, username },
    })
    if (data.success) {
      this.#token = data.token
      this.#user = data.user
    }
    return data
  }

  async verify() {
    return this.#request(this.#authUrl, '/auth/verify', { method: 'POST' })
  }

  async logout() {
    this.clearSession()
    return { success: true }
  }

  // ═══════════════════════════════════════════════════════════
  //  GAME API — game-api (api.grudge-studio.com)
  // ═══════════════════════════════════════════════════════════

  async health() {
    return this.#request(this.#apiUrl, '/health')
  }

  // Characters
  async getCharacters() {
    return this.#request(this.#apiUrl, '/characters')
  }
  async createCharacter(data) {
    return this.#request(this.#apiUrl, '/characters', { method: 'POST', body: data })
  }
  async deleteCharacter(characterId) {
    return this.#request(this.#apiUrl, `/characters/${characterId}`, { method: 'DELETE' })
  }

  // Missions
  async getMissions() {
    return this.#request(this.#apiUrl, '/missions')
  }
  async acceptMission(missionId) {
    return this.#request(this.#apiUrl, `/missions/${missionId}/accept`, { method: 'POST' })
  }
  async completeMission(missionId) {
    return this.#request(this.#apiUrl, `/missions/${missionId}/complete`, { method: 'POST' })
  }

  // Inventory
  async getInventory() {
    return this.#request(this.#apiUrl, '/inventory')
  }

  // Crews
  async getCrews() {
    return this.#request(this.#apiUrl, '/crews')
  }
  async createCrew(name) {
    return this.#request(this.#apiUrl, '/crews', { method: 'POST', body: { name } })
  }

  // Gouldstones
  async getGouldstones() {
    return this.#request(this.#apiUrl, '/gouldstones')
  }
  async deployGouldstone(gouldstoneId) {
    return this.#request(this.#apiUrl, `/gouldstones/${gouldstoneId}/deploy`, { method: 'POST' })
  }

  // Professions
  async getProfessions() {
    return this.#request(this.#apiUrl, '/professions')
  }

  // Spawns
  async getSpawns() {
    return this.#request(this.#apiUrl, '/spawns')
  }

  // ═══════════════════════════════════════════════════════════
  //  ACCOUNT API — account-api (account.grudge-studio.com)
  // ═══════════════════════════════════════════════════════════

  async getProfile() {
    return this.#request(this.#accountUrl, '/profile')
  }
  async updateProfile(data) {
    return this.#request(this.#accountUrl, '/profile', { method: 'PATCH', body: data })
  }
  async getFriends() {
    return this.#request(this.#accountUrl, '/friends')
  }
  async getAchievements() {
    return this.#request(this.#accountUrl, '/achievements')
  }

  // ═══════════════════════════════════════════════════════════
  //  ASSET SERVICE — asset-service (assets-api.grudge-studio.com)
  // ═══════════════════════════════════════════════════════════

  async uploadAsset(file, metadata) {
    // Uses FormData — special case outside #request
    const form = new FormData()
    form.append('file', file)
    if (metadata) form.append('metadata', JSON.stringify(metadata))

    const headers = {}
    if (this.#token) headers.Authorization = `Bearer ${this.#token}`

    const res = await fetch(`${this.#assetsUrl}/assets/upload`, {
      method: 'POST', headers, body: form,
    })
    return res.json()
  }

  async getAssetMetadata(assetId) {
    return this.#request(this.#assetsUrl, `/assets/${assetId}`)
  }

  // ═══════════════════════════════════════════════════════════
  //  OBJECTSTORE — Static CDN game data (GitHub Pages)
  // ═══════════════════════════════════════════════════════════

  static async getWeapons() {
    return (await fetch(`${OBJECT_STORE_BASE}/weapons.json`)).json()
  }
  static async getEquipment() {
    return (await fetch(`${OBJECT_STORE_BASE}/equipment.json`)).json()
  }
  static async getSkills() {
    return (await fetch(`${OBJECT_STORE_BASE}/skills.json`)).json()
  }
  static async getSprites() {
    return (await fetch(`${OBJECT_STORE_BASE}/sprites.json`)).json()
  }
  static async getMaterials() {
    return (await fetch(`${OBJECT_STORE_BASE}/materials.json`)).json()
  }
}

// ── Offline fallback helper ─────────────────────────────────
// Games can wrap SDK calls: const chars = await sdk.getCharacters().catch(() => offlineFallback)
export const OFFLINE_DEFAULTS = {
  characters: [{ id: 'dev-char-1', name: 'Player', race: 'human', class: 'warrior', faction: 'Crusade', planet: 'tutorial', level: 1 }],
  spawns: [{ planet: 'Tatooine', x: 0, y: 0, z: 0, name: 'Desert Outpost' }],
  missions: [],
  inventory: { items: [] },
}
