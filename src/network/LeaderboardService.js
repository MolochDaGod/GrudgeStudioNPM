import { grudgeNetwork } from './GrudgeNetworkService.js'

export class LeaderboardService {
    constructor() {
        this.leaderboards = new Map()
        this.cacheExpiry = 60000
        this.lastFetch = new Map()
    }

    async submitScore(leaderboardId, score, metadata = {}) {
        const user = grudgeNetwork.currentUser
        if (!user) {
            console.warn('[Leaderboard] Must be signed in to submit scores')
            return false
        }

        try {
            const entry = {
                odiserId: user.uuid,
                username: user.username,
                score,
                metadata,
                timestamp: Date.now()
            }

            const key = `leaderboard:${leaderboardId}:${user.uuid}`
            const existing = await grudgeNetwork.kvGet(key)

            if (!existing || score > existing.score) {
                await grudgeNetwork.kvSet(key, entry)
                console.log(`[Leaderboard] Score submitted: ${score} for ${leaderboardId}`)
                
                this.invalidateCache(leaderboardId)
                return true
            }

            return false
        } catch (error) {
            console.error('[Leaderboard] Submit score error:', error)
            return false
        }
    }

    async getLeaderboard(leaderboardId, limit = 10) {
        const cacheKey = `${leaderboardId}:${limit}`
        const cached = this.leaderboards.get(cacheKey)
        const lastFetch = this.lastFetch.get(cacheKey) || 0

        if (cached && Date.now() - lastFetch < this.cacheExpiry) {
            return cached
        }

        try {
            const keys = await grudgeNetwork.kvList(`leaderboard:${leaderboardId}:`)
            const entries = []

            for (const key of keys) {
                const entry = await grudgeNetwork.kvGet(key)
                if (entry) {
                    entries.push(entry)
                }
            }

            entries.sort((a, b) => b.score - a.score)
            const topEntries = entries.slice(0, limit)

            topEntries.forEach((entry, index) => {
                entry.rank = index + 1
            })

            this.leaderboards.set(cacheKey, topEntries)
            this.lastFetch.set(cacheKey, Date.now())

            return topEntries
        } catch (error) {
            console.error('[Leaderboard] Get leaderboard error:', error)
            return []
        }
    }

    async getUserRank(leaderboardId) {
        const user = grudgeNetwork.currentUser
        if (!user) return null

        try {
            const allEntries = await this.getLeaderboard(leaderboardId, 1000)
            const userEntry = allEntries.find(e => e.userId === user.uuid)
            return userEntry || null
        } catch (error) {
            console.error('[Leaderboard] Get user rank error:', error)
            return null
        }
    }

    async getStats() {
        try {
            const totalLogins = await grudgeNetwork.kvGet('stats:totalLogins', 0)
            const totalMatches = await grudgeNetwork.kvGet('stats:totalMatches', 0)
            const totalKills = await grudgeNetwork.kvGet('stats:totalKills', 0)

            return {
                totalLogins,
                totalMatches,
                totalKills,
                fetchedAt: Date.now()
            }
        } catch (error) {
            console.error('[Leaderboard] Get stats error:', error)
            return { totalLogins: 0, totalMatches: 0, totalKills: 0, fetchedAt: Date.now() }
        }
    }

    async recordMatch(winnerId, loserId, matchData = {}) {
        try {
            await grudgeNetwork.kvIncr('stats:totalMatches')

            if (winnerId) {
                const winKey = `stats:wins:${winnerId}`
                await grudgeNetwork.kvIncr(winKey)
            }

            if (loserId) {
                const lossKey = `stats:losses:${loserId}`
                await grudgeNetwork.kvIncr(lossKey)
            }

            const matchRecord = {
                id: `match_${Date.now()}`,
                winnerId,
                loserId,
                ...matchData,
                timestamp: Date.now()
            }

            const matchesKey = `matches:recent`
            let recentMatches = await grudgeNetwork.kvGet(matchesKey, [])
            recentMatches.unshift(matchRecord)
            recentMatches = recentMatches.slice(0, 50)
            await grudgeNetwork.kvSet(matchesKey, recentMatches)

            return matchRecord
        } catch (error) {
            console.error('[Leaderboard] Record match error:', error)
            return null
        }
    }

    async getRecentMatches(limit = 10) {
        try {
            const matches = await grudgeNetwork.kvGet('matches:recent', [])
            return matches.slice(0, limit)
        } catch (error) {
            console.error('[Leaderboard] Get recent matches error:', error)
            return []
        }
    }

    invalidateCache(leaderboardId) {
        for (const [key] of this.leaderboards) {
            if (key.startsWith(leaderboardId)) {
                this.leaderboards.delete(key)
                this.lastFetch.delete(key)
            }
        }
    }

    clearCache() {
        this.leaderboards.clear()
        this.lastFetch.clear()
    }
}

export const leaderboardService = new LeaderboardService()
export default leaderboardService
