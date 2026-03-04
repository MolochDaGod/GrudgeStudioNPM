/**
 * GrudgeStudioSDK - Cloud Backend for Grudge Studio Games
 *
 * Connects any Grudge game to the unified Supabase backend.
 * Provides: error logging, gameplay events, state management,
 * custom fields, rate limiting, character XP, achievements.
 *
 * Usage:
 *   import { GrudgeStudioSDK } from 'grudge-studio/cloud'
 *   const sdk = new GrudgeStudioSDK({ projectId, supabaseUrl, supabaseKey })
 */

const AUTH_GATEWAY = 'https://auth-gateway-flax.vercel.app'
const NEXUS_HUB = 'https://grudachain-rho.vercel.app'

export class GrudgeStudioSDK {
  #supabase = null
  #projectId
  #supabaseUrl
  #supabaseKey
  #authToken = null

  /**
   * @param {object} config
   * @param {string} config.projectId  - Your game's project UUID
   * @param {string} config.supabaseUrl
   * @param {string} config.supabaseKey
   * @param {string} [config.authToken] - Optional JWT from auth-gateway
   */
  constructor({ projectId, supabaseUrl, supabaseKey, authToken }) {
    this.#projectId = projectId
    this.#supabaseUrl = supabaseUrl
    this.#supabaseKey = supabaseKey
    this.#authToken = authToken || null
  }

  /** Lazy-init Supabase client (avoids bundling when unused) */
  async #getClient() {
    if (this.#supabase) return this.#supabase
    const { createClient } = await import('@supabase/supabase-js')
    this.#supabase = createClient(this.#supabaseUrl, this.#supabaseKey, {
      auth: { persistSession: false },
    })
    return this.#supabase
  }

  /** Set/update auth token after login */
  setAuthToken(token) {
    this.#authToken = token
  }

  // ─────────────────────────────────────────────
  //  AUTH (proxied through auth-gateway)
  // ─────────────────────────────────────────────

  async login(username, password) {
    const res = await fetch(`${AUTH_GATEWAY}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (data.token) this.#authToken = data.token
    return data
  }

  async register(username, password, email) {
    const res = await fetch(`${AUTH_GATEWAY}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    })
    const data = await res.json()
    if (data.token) this.#authToken = data.token
    return data
  }

  async guestLogin() {
    const res = await fetch(`${AUTH_GATEWAY}/api/guest`, { method: 'POST' })
    const data = await res.json()
    if (data.token) this.#authToken = data.token
    return data
  }

  async verifyToken() {
    if (!this.#authToken) return { valid: false, error: 'No token' }
    const res = await fetch(`${AUTH_GATEWAY}/api/verify`, {
      headers: { Authorization: `Bearer ${this.#authToken}` },
    })
    return res.json()
  }

  // ─────────────────────────────────────────────
  //  ERROR LOGGING
  // ─────────────────────────────────────────────

  async logError(errorType, message, { severity = 'error', userId, context, stack } = {}) {
    const sb = await this.#getClient()
    return sb.from('error_logs').insert({
      project_id: this.#projectId,
      error_type: errorType,
      error_message: message,
      error_stack: stack,
      severity,
      user_id: userId,
      context: context || {},
    })
  }

  // ─────────────────────────────────────────────
  //  GAMEPLAY EVENTS
  // ─────────────────────────────────────────────

  async recordEvent(eventName, { eventData, userId, characterId, levelId } = {}) {
    const sb = await this.#getClient()
    return sb.from('gameplay_events').insert({
      project_id: this.#projectId,
      event_name: eventName,
      event_data: eventData || {},
      user_id: userId,
      character_id: characterId,
      level_id: levelId,
    })
  }

  // ─────────────────────────────────────────────
  //  GAME STATE (snapshots)
  // ─────────────────────────────────────────────

  async saveState(userId, levelId, state, reason = 'auto-save') {
    const sb = await this.#getClient()
    return sb.from('state_snapshots').insert({
      project_id: this.#projectId,
      user_id: userId,
      level_id: levelId,
      snapshot_data: state,
      reason,
    })
  }

  async loadState(userId, levelId) {
    const sb = await this.#getClient()
    const { data } = await sb
      .from('state_snapshots')
      .select('*')
      .eq('project_id', this.#projectId)
      .eq('user_id', userId)
      .eq('level_id', levelId)
      .order('created_at', { ascending: false })
      .limit(1)
    return data?.[0] || null
  }

  // ─────────────────────────────────────────────
  //  CUSTOM FIELDS
  // ─────────────────────────────────────────────

  async addCustomField(entityType, fieldName, fieldType, description) {
    const sb = await this.#getClient()
    return sb.from('custom_fields').insert({
      project_id: this.#projectId,
      entity_type: entityType,
      field_name: fieldName,
      field_type: fieldType,
      description,
    })
  }

  async setCustomFieldValue(customFieldId, entityId, value) {
    const sb = await this.#getClient()
    return sb.from('custom_field_values').upsert({
      custom_field_id: customFieldId,
      entity_id: entityId,
      value: JSON.stringify(value),
    })
  }

  // ─────────────────────────────────────────────
  //  API REQUEST LOGGING
  // ─────────────────────────────────────────────

  async logApiRequest({ endpoint, method, statusCode, responseTimeMs, userId }) {
    const sb = await this.#getClient()
    return sb.from('api_request_logs').insert({
      project_id: this.#projectId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      user_id: userId,
    })
  }

  // ─────────────────────────────────────────────
  //  SERVICE REGISTRY (read-only, from Nexus)
  // ─────────────────────────────────────────────

  async getServiceRegistry() {
    const res = await fetch(`${NEXUS_HUB}/api/services/registry`)
    return res.json()
  }

  async getServiceHealth() {
    const res = await fetch(`${NEXUS_HUB}/api/services/health`)
    return res.json()
  }

  async getGameServers() {
    const res = await fetch(`${NEXUS_HUB}/api/servers/status`)
    return res.json()
  }

  // ─────────────────────────────────────────────
  //  CHARACTER / ACHIEVEMENT helpers
  // ─────────────────────────────────────────────

  async getCharacters(userId) {
    const sb = await this.#getClient()
    return sb.from('characters').select('*').eq('user_id', userId)
  }

  async updateCharacterExp(characterId, expGain) {
    const sb = await this.#getClient()
    const { data: char } = await sb
      .from('characters')
      .select('experience, level')
      .eq('id', characterId)
      .single()
    if (!char) return { error: 'Character not found' }

    const newExp = (char.experience || 0) + expGain
    return sb.from('characters').update({ experience: newExp }).eq('id', characterId)
  }

  async awardAchievement(userId, achievementId) {
    const sb = await this.#getClient()
    return sb.from('user_achievements').upsert({
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
    })
  }

  async getAchievements(userId) {
    const sb = await this.#getClient()
    return sb.from('user_achievements').select('*, achievements(*)').eq('user_id', userId)
  }

  // ─────────────────────────────────────────────
  //  LEADERBOARDS
  // ─────────────────────────────────────────────

  async submitScore(userId, leaderboardId, score, metadata) {
    const sb = await this.#getClient()
    return sb.from('leaderboard_entries').upsert({
      user_id: userId,
      leaderboard_id: leaderboardId,
      score,
      metadata: metadata || {},
    })
  }

  async getLeaderboard(leaderboardId, { limit = 10, offset = 0 } = {}) {
    const sb = await this.#getClient()
    return sb
      .from('leaderboard_entries')
      .select('*, users(username)')
      .eq('leaderboard_id', leaderboardId)
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1)
  }

  // ─────────────────────────────────────────────
  //  OBJECTSTORE (CDN game data)
  // ─────────────────────────────────────────────

  async getWeapons() {
    const res = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/weapons.json')
    return res.json()
  }

  async getEquipment() {
    const res = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/equipment.json')
    return res.json()
  }

  async getSkills() {
    const res = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/skills.json')
    return res.json()
  }

  async getSprites() {
    const res = await fetch('https://molochdagod.github.io/ObjectStore/api/v1/sprites.json')
    return res.json()
  }
}
