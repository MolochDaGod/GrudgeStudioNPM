import { grudgeNetwork } from './GrudgeNetworkService.js'

export class FriendSystem {
    constructor() {
        this.friends = []
        this.pendingRequests = []
        this.blockedUsers = []
        this.onlineStatus = new Map()
        this.listeners = new Map()
        this.statusPollInterval = null
    }

    async initialize() {
        if (!grudgeNetwork.currentUser) return

        await this.loadFriendsList()
        await this.loadPendingRequests()
        await this.loadBlockedUsers()
        this.startStatusPolling()
        
        console.log('[FriendSystem] Initialized')
    }

    async loadFriendsList() {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return

        this.friends = await grudgeNetwork.kvGet(`friends:${userId}:list`, [])
    }

    async loadPendingRequests() {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return

        this.pendingRequests = await grudgeNetwork.kvGet(`friends:${userId}:pending`, [])
    }

    async loadBlockedUsers() {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return

        this.blockedUsers = await grudgeNetwork.kvGet(`friends:${userId}:blocked`, [])
    }

    async sendFriendRequest(targetUserId, targetUsername) {
        const userId = grudgeNetwork.currentUser?.uuid
        const username = grudgeNetwork.currentUser?.username
        if (!userId) return false

        if (this.friends.some(f => f.userId === targetUserId)) {
            console.log('[FriendSystem] Already friends')
            return false
        }

        if (this.blockedUsers.includes(targetUserId)) {
            console.log('[FriendSystem] User is blocked')
            return false
        }

        try {
            const request = {
                fromUserId: userId,
                fromUsername: username,
                toUserId: targetUserId,
                toUsername: targetUsername,
                timestamp: Date.now(),
                status: 'pending'
            }

            let targetPending = await grudgeNetwork.kvGet(`friends:${targetUserId}:pending`, [])
            targetPending.push(request)
            await grudgeNetwork.kvSet(`friends:${targetUserId}:pending`, targetPending)

            this.emit('requestSent', { targetUserId, targetUsername })
            return true
        } catch (error) {
            console.error('[FriendSystem] Send request error:', error)
            return false
        }
    }

    async acceptFriendRequest(requestIndex) {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return false

        const request = this.pendingRequests[requestIndex]
        if (!request) return false

        try {
            this.friends.push({
                userId: request.fromUserId,
                username: request.fromUsername,
                addedAt: Date.now()
            })
            await grudgeNetwork.kvSet(`friends:${userId}:list`, this.friends)

            let theirFriends = await grudgeNetwork.kvGet(`friends:${request.fromUserId}:list`, [])
            theirFriends.push({
                userId,
                username: grudgeNetwork.currentUser.username,
                addedAt: Date.now()
            })
            await grudgeNetwork.kvSet(`friends:${request.fromUserId}:list`, theirFriends)

            this.pendingRequests.splice(requestIndex, 1)
            await grudgeNetwork.kvSet(`friends:${userId}:pending`, this.pendingRequests)

            this.emit('friendAdded', { userId: request.fromUserId, username: request.fromUsername })
            return true
        } catch (error) {
            console.error('[FriendSystem] Accept request error:', error)
            return false
        }
    }

    async declineFriendRequest(requestIndex) {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return false

        try {
            this.pendingRequests.splice(requestIndex, 1)
            await grudgeNetwork.kvSet(`friends:${userId}:pending`, this.pendingRequests)
            return true
        } catch (error) {
            console.error('[FriendSystem] Decline request error:', error)
            return false
        }
    }

    async removeFriend(friendUserId) {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return false

        try {
            this.friends = this.friends.filter(f => f.userId !== friendUserId)
            await grudgeNetwork.kvSet(`friends:${userId}:list`, this.friends)

            let theirFriends = await grudgeNetwork.kvGet(`friends:${friendUserId}:list`, [])
            theirFriends = theirFriends.filter(f => f.userId !== userId)
            await grudgeNetwork.kvSet(`friends:${friendUserId}:list`, theirFriends)

            this.emit('friendRemoved', { userId: friendUserId })
            return true
        } catch (error) {
            console.error('[FriendSystem] Remove friend error:', error)
            return false
        }
    }

    async blockUser(targetUserId) {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return false

        try {
            if (!this.blockedUsers.includes(targetUserId)) {
                this.blockedUsers.push(targetUserId)
                await grudgeNetwork.kvSet(`friends:${userId}:blocked`, this.blockedUsers)
            }

            await this.removeFriend(targetUserId)
            return true
        } catch (error) {
            console.error('[FriendSystem] Block user error:', error)
            return false
        }
    }

    async unblockUser(targetUserId) {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return false

        try {
            this.blockedUsers = this.blockedUsers.filter(id => id !== targetUserId)
            await grudgeNetwork.kvSet(`friends:${userId}:blocked`, this.blockedUsers)
            return true
        } catch (error) {
            console.error('[FriendSystem] Unblock user error:', error)
            return false
        }
    }

    async updateOnlineStatus() {
        const userId = grudgeNetwork.currentUser?.uuid
        if (!userId) return

        try {
            await grudgeNetwork.kvSet(`status:${userId}`, {
                online: true,
                lastSeen: Date.now()
            })
        } catch (error) {
            console.warn('[FriendSystem] Update status error:', error)
        }
    }

    async checkFriendStatus(friendUserId) {
        try {
            const status = await grudgeNetwork.kvGet(`status:${friendUserId}`)
            if (!status) return { online: false, lastSeen: null }

            const isOnline = Date.now() - status.lastSeen < 60000
            return { online: isOnline, lastSeen: status.lastSeen }
        } catch (error) {
            return { online: false, lastSeen: null }
        }
    }

    startStatusPolling() {
        if (this.statusPollInterval) return

        this.statusPollInterval = setInterval(async () => {
            await this.updateOnlineStatus()
            
            for (const friend of this.friends) {
                const status = await this.checkFriendStatus(friend.userId)
                const prevStatus = this.onlineStatus.get(friend.userId)
                
                if (!prevStatus || prevStatus.online !== status.online) {
                    this.onlineStatus.set(friend.userId, status)
                    this.emit('statusChanged', { userId: friend.userId, ...status })
                }
            }
        }, 30000)
    }

    stopStatusPolling() {
        if (this.statusPollInterval) {
            clearInterval(this.statusPollInterval)
            this.statusPollInterval = null
        }
    }

    getFriends() {
        return this.friends.map(friend => ({
            ...friend,
            status: this.onlineStatus.get(friend.userId) || { online: false }
        }))
    }

    getPendingRequests() {
        return this.pendingRequests
    }

    isBlocked(userId) {
        return this.blockedUsers.includes(userId)
    }

    isFriend(userId) {
        return this.friends.some(f => f.userId === userId)
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
                console.error(`[FriendSystem] Event error (${event}):`, error)
            }
        })
    }

    destroy() {
        this.stopStatusPolling()
        this.friends = []
        this.pendingRequests = []
        this.blockedUsers = []
        this.onlineStatus.clear()
        this.listeners.clear()
    }
}

export const friendSystem = new FriendSystem()
export default friendSystem
