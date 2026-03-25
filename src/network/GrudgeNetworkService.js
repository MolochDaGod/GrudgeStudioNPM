export class GrudgeNetworkService {
    constructor() {
        this.isConnected = false
        this.connectionStatus = 'disconnected'
        this.currentUser = null
        this.listeners = new Map()
        this.retryAttempts = 0
        this.maxRetries = 3
        this.retryDelay = 2000
        
        this.config = {
            appName: 'Grudge Studio Arena',
            appVersion: '2.13.0',
            networkName: 'Grudge Network',
            branding: {
                primaryColor: '#6ee7b7',
                secondaryColor: '#3b82f6',
                darkBg: '#0f1629',
                cardBg: '#141a2b'
            }
        }
    }

    get puter() {
        if (typeof window !== 'undefined' && typeof window.puter !== 'undefined') {
            return window.puter
        }
        return null
    }

    get isAvailable() {
        return this.puter !== null
    }

    async initialize() {
        if (!this.isAvailable) {
            console.warn('[GrudgeNetwork] Puter SDK not available')
            this.connectionStatus = 'unavailable'
            this.emit('status', { status: 'unavailable' })
            return false
        }

        try {
            this.connectionStatus = 'connecting'
            this.emit('status', { status: 'connecting' })

            if (this.puter.auth.isSignedIn()) {
                this.currentUser = await this.puter.auth.getUser()
                this.isConnected = true
                this.connectionStatus = 'connected'
                console.log('[GrudgeNetwork] Connected as:', this.currentUser.username)
                this.emit('status', { status: 'connected', user: this.currentUser })
                this.emit('userChanged', this.currentUser)
            } else {
                this.connectionStatus = 'ready'
                this.emit('status', { status: 'ready' })
            }

            return true
        } catch (error) {
            console.error('[GrudgeNetwork] Initialization error:', error)
            this.connectionStatus = 'error'
            this.emit('status', { status: 'error', error })
            return false
        }
    }

    async signIn() {
        if (!this.isAvailable) return null

        try {
            this.connectionStatus = 'authenticating'
            this.emit('status', { status: 'authenticating' })

            await this.puter.auth.signIn()
            this.currentUser = await this.puter.auth.getUser()
            this.isConnected = true
            this.connectionStatus = 'connected'

            console.log('[GrudgeNetwork] Signed in as:', this.currentUser.username)
            this.emit('status', { status: 'connected', user: this.currentUser })
            this.emit('userChanged', this.currentUser)

            await this.recordUserLogin()
            return this.currentUser
        } catch (error) {
            console.error('[GrudgeNetwork] Sign in error:', error)
            this.connectionStatus = 'error'
            this.emit('status', { status: 'error', error })
            return null
        }
    }

    async signOut() {
        if (!this.isAvailable) return

        try {
            this.puter.auth.signOut()
            this.currentUser = null
            this.isConnected = false
            this.connectionStatus = 'ready'

            console.log('[GrudgeNetwork] Signed out')
            this.emit('status', { status: 'ready' })
            this.emit('userChanged', null)
        } catch (error) {
            console.error('[GrudgeNetwork] Sign out error:', error)
        }
    }

    async recordUserLogin() {
        if (!this.currentUser) return

        try {
            const loginData = {
                username: this.currentUser.username,
                uuid: this.currentUser.uuid,
                lastLogin: Date.now(),
                appVersion: this.config.appVersion
            }
            await this.kvSet(`user:${this.currentUser.uuid}:profile`, loginData)
            await this.kvIncr('stats:totalLogins')
        } catch (error) {
            console.warn('[GrudgeNetwork] Failed to record login:', error)
        }
    }

    async kvSet(key, value) {
        if (!this.isAvailable) {
            localStorage.setItem(`grudge_${key}`, JSON.stringify(value))
            return true
        }

        try {
            await this.puter.kv.set(key, JSON.stringify(value))
            return true
        } catch (error) {
            console.error('[GrudgeNetwork] KV set error:', error)
            localStorage.setItem(`grudge_${key}`, JSON.stringify(value))
            return false
        }
    }

    async kvGet(key, defaultValue = null) {
        if (!this.isAvailable) {
            const local = localStorage.getItem(`grudge_${key}`)
            return local ? JSON.parse(local) : defaultValue
        }

        try {
            const value = await this.puter.kv.get(key)
            return value ? JSON.parse(value) : defaultValue
        } catch (error) {
            console.warn('[GrudgeNetwork] KV get error:', error)
            const local = localStorage.getItem(`grudge_${key}`)
            return local ? JSON.parse(local) : defaultValue
        }
    }

    async kvDel(key) {
        if (!this.isAvailable) {
            localStorage.removeItem(`grudge_${key}`)
            return true
        }

        try {
            await this.puter.kv.del(key)
            return true
        } catch (error) {
            console.error('[GrudgeNetwork] KV delete error:', error)
            return false
        }
    }

    async kvIncr(key) {
        if (!this.isAvailable) return 0

        try {
            return await this.puter.kv.incr(key)
        } catch (error) {
            console.error('[GrudgeNetwork] KV incr error:', error)
            return 0
        }
    }

    async kvList(prefix = '') {
        if (!this.isAvailable) return []

        try {
            const keys = await this.puter.kv.list()
            if (prefix) {
                return keys.filter(k => k.startsWith(prefix))
            }
            return keys
        } catch (error) {
            console.error('[GrudgeNetwork] KV list error:', error)
            return []
        }
    }

    async aiChat(prompt, options = {}) {
        if (!this.isAvailable) return null

        try {
            const response = await this.puter.ai.chat(prompt, {
                model: options.model || 'gpt-4o-mini',
                ...options
            })
            return response.toString()
        } catch (error) {
            console.error('[GrudgeNetwork] AI chat error:', error)
            return null
        }
    }

    async textToSpeech(text, options = {}) {
        if (!this.isAvailable) return null

        try {
            return await this.puter.ai.txt2speech(text, {
                voice: options.voice || 'Matthew',
                ...options
            })
        } catch (error) {
            console.error('[GrudgeNetwork] TTS error:', error)
            return null
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }
        this.listeners.get(event).push(callback)
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return
        const callbacks = this.listeners.get(event)
        const index = callbacks.indexOf(callback)
        if (index > -1) {
            callbacks.splice(index, 1)
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return
        this.listeners.get(event).forEach(callback => {
            try {
                callback(data)
            } catch (error) {
                console.error(`[GrudgeNetwork] Event listener error (${event}):`, error)
            }
        })
    }

    getStatusBadge() {
        const statusConfig = {
            disconnected: { color: '#ef4444', text: 'Offline' },
            connecting: { color: '#f59e0b', text: 'Connecting...' },
            authenticating: { color: '#3b82f6', text: 'Signing In...' },
            connected: { color: '#22c55e', text: 'Online' },
            ready: { color: '#6b7280', text: 'Ready' },
            error: { color: '#ef4444', text: 'Error' },
            unavailable: { color: '#6b7280', text: 'Unavailable' }
        }
        return statusConfig[this.connectionStatus] || statusConfig.disconnected
    }

    getUserDisplayName() {
        if (this.currentUser) {
            return this.currentUser.username
        }
        return 'Guest'
    }
}

export const grudgeNetwork = new GrudgeNetworkService()
export default grudgeNetwork
