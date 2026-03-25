import { grudgeNetwork } from './GrudgeNetworkService.js'

export class UserChatSystem {
    constructor() {
        this.channels = new Map()
        this.activeChannel = 'global'
        this.messageCache = new Map()
        this.pollInterval = null
        this.pollDelay = 3000
        this.maxMessagesPerChannel = 100
        this.listeners = new Map()
    }

    async initialize() {
        await this.joinChannel('global')
        this.startPolling()
        console.log('[ChatSystem] Initialized')
    }

    startPolling() {
        if (this.pollInterval) return

        this.pollInterval = setInterval(async () => {
            await this.pollMessages()
        }, this.pollDelay)
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval)
            this.pollInterval = null
        }
    }

    async joinChannel(channelId) {
        if (!this.channels.has(channelId)) {
            this.channels.set(channelId, {
                id: channelId,
                lastRead: Date.now(),
                unreadCount: 0
            })
        }
        this.activeChannel = channelId
        await this.loadChannelMessages(channelId)
    }

    async leaveChannel(channelId) {
        this.channels.delete(channelId)
        this.messageCache.delete(channelId)
        if (this.activeChannel === channelId) {
            this.activeChannel = 'global'
        }
    }

    async sendMessage(content, channelId = null) {
        const channel = channelId || this.activeChannel
        const user = grudgeNetwork.currentUser

        if (!content || content.trim() === '') return null

        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            channelId: channel,
            userId: user?.uuid || 'guest',
            username: user?.username || 'Guest',
            content: content.trim(),
            timestamp: Date.now(),
            type: 'message'
        }

        try {
            const messagesKey = `chat:${channel}:messages`
            let messages = await grudgeNetwork.kvGet(messagesKey, [])
            
            messages.push(message)
            
            if (messages.length > this.maxMessagesPerChannel) {
                messages = messages.slice(-this.maxMessagesPerChannel)
            }

            await grudgeNetwork.kvSet(messagesKey, messages)

            this.addToCache(channel, message)
            this.emit('messageSent', message)
            this.emit('newMessage', { channel, message })

            return message
        } catch (error) {
            console.error('[ChatSystem] Send message error:', error)
            return null
        }
    }

    async loadChannelMessages(channelId) {
        try {
            const messagesKey = `chat:${channelId}:messages`
            const messages = await grudgeNetwork.kvGet(messagesKey, [])
            
            this.messageCache.set(channelId, messages)
            this.emit('messagesLoaded', { channel: channelId, messages })
            
            return messages
        } catch (error) {
            console.error('[ChatSystem] Load messages error:', error)
            return []
        }
    }

    async pollMessages() {
        for (const [channelId] of this.channels) {
            try {
                const messagesKey = `chat:${channelId}:messages`
                const messages = await grudgeNetwork.kvGet(messagesKey, [])
                
                const cached = this.messageCache.get(channelId) || []
                const newMessages = messages.filter(m => 
                    !cached.some(c => c.id === m.id)
                )

                if (newMessages.length > 0) {
                    this.messageCache.set(channelId, messages)
                    newMessages.forEach(msg => {
                        this.emit('newMessage', { channel: channelId, message: msg })
                    })
                }
            } catch (error) {
                console.warn('[ChatSystem] Poll error for channel:', channelId)
            }
        }
    }

    addToCache(channelId, message) {
        let messages = this.messageCache.get(channelId) || []
        messages.push(message)
        if (messages.length > this.maxMessagesPerChannel) {
            messages = messages.slice(-this.maxMessagesPerChannel)
        }
        this.messageCache.set(channelId, messages)
    }

    getChannelMessages(channelId = null) {
        const channel = channelId || this.activeChannel
        return this.messageCache.get(channel) || []
    }

    async sendSystemMessage(content, channelId = 'global') {
        const message = {
            id: `sys_${Date.now()}`,
            channelId,
            userId: 'system',
            username: 'Grudge Network',
            content,
            timestamp: Date.now(),
            type: 'system'
        }

        const messagesKey = `chat:${channelId}:messages`
        let messages = await grudgeNetwork.kvGet(messagesKey, [])
        messages.push(message)
        
        if (messages.length > this.maxMessagesPerChannel) {
            messages = messages.slice(-this.maxMessagesPerChannel)
        }

        await grudgeNetwork.kvSet(messagesKey, messages)
        this.addToCache(channelId, message)
        this.emit('newMessage', { channel: channelId, message })
    }

    async createPrivateChannel(userId1, userId2) {
        const ids = [userId1, userId2].sort()
        const channelId = `dm:${ids[0]}:${ids[1]}`
        
        await this.joinChannel(channelId)
        return channelId
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
                console.error(`[ChatSystem] Event error (${event}):`, error)
            }
        })
    }

    destroy() {
        this.stopPolling()
        this.channels.clear()
        this.messageCache.clear()
        this.listeners.clear()
    }
}

export const chatSystem = new UserChatSystem()
export default chatSystem
