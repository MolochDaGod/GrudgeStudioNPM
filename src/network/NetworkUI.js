import { grudgeNetwork } from './GrudgeNetworkService.js'
import { chatSystem } from './UserChatSystem.js'
import { friendSystem } from './FriendSystem.js'
import { leaderboardService } from './LeaderboardService.js'

export class NetworkUI {
    constructor() {
        this.container = null
        this.chatPanel = null
        this.isOpen = false
        this.activeTab = 'chat'
    }

    createStyles() {
        if (document.getElementById('grudge-network-styles')) return

        const styles = document.createElement('style')
        styles.id = 'grudge-network-styles'
        styles.textContent = `
            .grudge-network-container {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 10000;
                font-family: 'Orbitron', 'Segoe UI', sans-serif;
            }
            
            .grudge-status-bar {
                display: flex;
                align-items: center;
                gap: 10px;
                background: linear-gradient(135deg, #0f1629 0%, #1a2742 100%);
                border: 1px solid #6ee7b7;
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .grudge-status-bar:hover {
                border-color: #34d399;
                box-shadow: 0 0 15px rgba(110, 231, 183, 0.3);
            }
            
            .grudge-logo {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #6ee7b7, #3b82f6);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                color: #0f1629;
            }
            
            .grudge-user-info {
                display: flex;
                flex-direction: column;
            }
            
            .grudge-username {
                color: #6ee7b7;
                font-size: 12px;
                font-weight: bold;
            }
            
            .grudge-status {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 10px;
                color: #9ca3af;
            }
            
            .grudge-status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
            }
            
            .grudge-panel {
                position: absolute;
                top: 50px;
                right: 0;
                width: 350px;
                max-height: 500px;
                background: linear-gradient(135deg, #0f1629 0%, #141a2b 100%);
                border: 1px solid #3b82f6;
                border-radius: 12px;
                display: none;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            }
            
            .grudge-panel.open {
                display: flex;
            }
            
            .grudge-panel-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: rgba(59, 130, 246, 0.1);
                border-bottom: 1px solid #3b82f6;
            }
            
            .grudge-panel-title {
                color: #6ee7b7;
                font-size: 14px;
                font-weight: bold;
            }
            
            .grudge-tabs {
                display: flex;
                gap: 4px;
                padding: 8px;
                border-bottom: 1px solid #1e293b;
            }
            
            .grudge-tab {
                flex: 1;
                padding: 8px;
                background: transparent;
                border: 1px solid #374151;
                border-radius: 6px;
                color: #9ca3af;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
            }
            
            .grudge-tab:hover {
                border-color: #6ee7b7;
                color: #6ee7b7;
            }
            
            .grudge-tab.active {
                background: rgba(110, 231, 183, 0.1);
                border-color: #6ee7b7;
                color: #6ee7b7;
            }
            
            .grudge-tab-content {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            }
            
            .grudge-chat-messages {
                display: flex;
                flex-direction: column;
                gap: 8px;
                max-height: 250px;
                overflow-y: auto;
            }
            
            .grudge-message {
                padding: 8px 10px;
                background: rgba(30, 41, 59, 0.5);
                border-radius: 6px;
                border-left: 2px solid #3b82f6;
            }
            
            .grudge-message.system {
                border-left-color: #f59e0b;
                background: rgba(245, 158, 11, 0.1);
            }
            
            .grudge-message-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
            }
            
            .grudge-message-user {
                color: #6ee7b7;
                font-size: 11px;
                font-weight: bold;
            }
            
            .grudge-message-time {
                color: #6b7280;
                font-size: 10px;
            }
            
            .grudge-message-content {
                color: #e5e7eb;
                font-size: 12px;
                word-break: break-word;
            }
            
            .grudge-chat-input {
                display: flex;
                gap: 8px;
                padding: 12px;
                border-top: 1px solid #1e293b;
            }
            
            .grudge-chat-input input {
                flex: 1;
                background: #1e293b;
                border: 1px solid #374151;
                border-radius: 6px;
                padding: 8px 12px;
                color: #fff;
                font-size: 12px;
            }
            
            .grudge-chat-input input:focus {
                outline: none;
                border-color: #6ee7b7;
            }
            
            .grudge-btn {
                background: linear-gradient(135deg, #6ee7b7, #3b82f6);
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                color: #0f1629;
                font-weight: bold;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .grudge-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(110, 231, 183, 0.3);
            }
            
            .grudge-btn-secondary {
                background: transparent;
                border: 1px solid #6ee7b7;
                color: #6ee7b7;
            }
            
            .grudge-friend-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(30, 41, 59, 0.5);
                border-radius: 6px;
                margin-bottom: 8px;
            }
            
            .grudge-friend-avatar {
                width: 32px;
                height: 32px;
                background: linear-gradient(135deg, #3b82f6, #6ee7b7);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #0f1629;
                font-weight: bold;
                font-size: 14px;
            }
            
            .grudge-friend-name {
                flex: 1;
                color: #e5e7eb;
                font-size: 13px;
            }
            
            .grudge-friend-status {
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 4px;
            }
            
            .grudge-friend-status.online {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
            }
            
            .grudge-friend-status.offline {
                background: rgba(107, 114, 128, 0.2);
                color: #6b7280;
            }
            
            .grudge-leaderboard-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(30, 41, 59, 0.5);
                border-radius: 6px;
                margin-bottom: 6px;
            }
            
            .grudge-rank {
                width: 24px;
                height: 24px;
                background: #1e293b;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6ee7b7;
                font-weight: bold;
                font-size: 12px;
            }
            
            .grudge-rank.gold { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #0f1629; }
            .grudge-rank.silver { background: linear-gradient(135deg, #9ca3af, #6b7280); color: #0f1629; }
            .grudge-rank.bronze { background: linear-gradient(135deg, #d97706, #b45309); color: #0f1629; }
            
            .grudge-score {
                color: #6ee7b7;
                font-weight: bold;
                font-size: 13px;
            }
            
            .grudge-auth-prompt {
                text-align: center;
                padding: 30px 20px;
            }
            
            .grudge-auth-prompt h3 {
                color: #6ee7b7;
                margin-bottom: 10px;
            }
            
            .grudge-auth-prompt p {
                color: #9ca3af;
                font-size: 12px;
                margin-bottom: 20px;
            }
            
            .grudge-network-badge {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                background: rgba(110, 231, 183, 0.1);
                border: 1px solid #6ee7b7;
                border-radius: 4px;
                font-size: 10px;
                color: #6ee7b7;
            }
        `
        document.head.appendChild(styles)
    }

    create() {
        this.createStyles()

        this.container = document.createElement('div')
        this.container.className = 'grudge-network-container'
        this.container.innerHTML = `
            <div class="grudge-status-bar" id="grudge-status-bar">
                <div class="grudge-logo">G</div>
                <div class="grudge-user-info">
                    <span class="grudge-username" id="grudge-username">Guest</span>
                    <span class="grudge-status">
                        <span class="grudge-status-dot" id="grudge-status-dot" style="background: #6b7280;"></span>
                        <span id="grudge-status-text">Offline</span>
                    </span>
                </div>
            </div>
            
            <div class="grudge-panel" id="grudge-panel">
                <div class="grudge-panel-header">
                    <span class="grudge-panel-title">GRUDGE NETWORK</span>
                    <span class="grudge-network-badge">Powered by Puter</span>
                </div>
                
                <div class="grudge-tabs">
                    <button class="grudge-tab active" data-tab="chat">Chat</button>
                    <button class="grudge-tab" data-tab="friends">Friends</button>
                    <button class="grudge-tab" data-tab="leaderboard">Ranks</button>
                </div>
                
                <div class="grudge-tab-content" id="grudge-tab-content">
                    <!-- Dynamic content -->
                </div>
                
                <div class="grudge-chat-input" id="grudge-chat-input" style="display: none;">
                    <input type="text" id="grudge-chat-message" placeholder="Type a message..." />
                    <button class="grudge-btn" id="grudge-send-btn">Send</button>
                </div>
            </div>
        `

        document.body.appendChild(this.container)
        this.bindEvents()
        this.updateUI()
    }

    bindEvents() {
        const statusBar = document.getElementById('grudge-status-bar')
        const panel = document.getElementById('grudge-panel')

        statusBar.addEventListener('click', () => {
            this.isOpen = !this.isOpen
            panel.classList.toggle('open', this.isOpen)
            if (this.isOpen) {
                this.loadTabContent(this.activeTab)
            }
        })

        const tabs = this.container.querySelectorAll('.grudge-tab')
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'))
                tab.classList.add('active')
                this.activeTab = tab.dataset.tab
                this.loadTabContent(this.activeTab)
            })
        })

        const sendBtn = document.getElementById('grudge-send-btn')
        const messageInput = document.getElementById('grudge-chat-message')

        sendBtn.addEventListener('click', () => this.sendMessage())
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage()
        })

        grudgeNetwork.on('status', () => this.updateUI())
        grudgeNetwork.on('userChanged', () => this.updateUI())
        chatSystem.on('newMessage', () => {
            if (this.activeTab === 'chat') this.loadTabContent('chat')
        })
    }

    updateUI() {
        const username = document.getElementById('grudge-username')
        const statusDot = document.getElementById('grudge-status-dot')
        const statusText = document.getElementById('grudge-status-text')

        const badge = grudgeNetwork.getStatusBadge()
        username.textContent = grudgeNetwork.getUserDisplayName()
        statusDot.style.background = badge.color
        statusText.textContent = badge.text
    }

    async loadTabContent(tab) {
        const content = document.getElementById('grudge-tab-content')
        const chatInput = document.getElementById('grudge-chat-input')

        chatInput.style.display = tab === 'chat' ? 'flex' : 'none'

        if (!grudgeNetwork.isConnected && tab !== 'chat') {
            content.innerHTML = `
                <div class="grudge-auth-prompt">
                    <h3>Join Grudge Network</h3>
                    <p>Sign in with your Puter account to access friends, leaderboards, and cloud saves.</p>
                    <button class="grudge-btn" id="grudge-signin-btn">Sign In</button>
                </div>
            `
            document.getElementById('grudge-signin-btn')?.addEventListener('click', () => {
                grudgeNetwork.signIn()
            })
            return
        }

        switch (tab) {
            case 'chat':
                await this.renderChat(content)
                break
            case 'friends':
                await this.renderFriends(content)
                break
            case 'leaderboard':
                await this.renderLeaderboard(content)
                break
        }
    }

    async renderChat(container) {
        const messages = chatSystem.getChannelMessages('global')
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="grudge-auth-prompt">
                    <p>Welcome to Grudge Network Chat!</p>
                    <p style="color: #6b7280;">Send a message to start the conversation.</p>
                </div>
            `
        } else {
            container.innerHTML = `<div class="grudge-chat-messages" id="grudge-messages"></div>`
            const messagesContainer = document.getElementById('grudge-messages')
            
            messages.slice(-20).forEach(msg => {
                const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                messagesContainer.innerHTML += `
                    <div class="grudge-message ${msg.type === 'system' ? 'system' : ''}">
                        <div class="grudge-message-header">
                            <span class="grudge-message-user">${msg.username}</span>
                            <span class="grudge-message-time">${time}</span>
                        </div>
                        <div class="grudge-message-content">${this.escapeHtml(msg.content)}</div>
                    </div>
                `
            })
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight
        }
    }

    async renderFriends(container) {
        const friends = friendSystem.getFriends()
        const pending = friendSystem.getPendingRequests()

        if (friends.length === 0 && pending.length === 0) {
            container.innerHTML = `
                <div class="grudge-auth-prompt">
                    <h3>No Friends Yet</h3>
                    <p>Add friends to see them here and challenge them to battles!</p>
                </div>
            `
            return
        }

        let html = ''
        
        if (pending.length > 0) {
            html += `<div style="color: #f59e0b; font-size: 11px; margin-bottom: 8px;">PENDING REQUESTS (${pending.length})</div>`
            pending.forEach((req, i) => {
                html += `
                    <div class="grudge-friend-item">
                        <div class="grudge-friend-avatar">${req.fromUsername[0].toUpperCase()}</div>
                        <span class="grudge-friend-name">${req.fromUsername}</span>
                        <button class="grudge-btn" style="padding: 4px 8px; font-size: 10px;" data-accept="${i}">Accept</button>
                    </div>
                `
            })
        }

        if (friends.length > 0) {
            html += `<div style="color: #6ee7b7; font-size: 11px; margin-bottom: 8px; margin-top: 12px;">FRIENDS (${friends.length})</div>`
            friends.forEach(friend => {
                const statusClass = friend.status?.online ? 'online' : 'offline'
                html += `
                    <div class="grudge-friend-item">
                        <div class="grudge-friend-avatar">${friend.username[0].toUpperCase()}</div>
                        <span class="grudge-friend-name">${friend.username}</span>
                        <span class="grudge-friend-status ${statusClass}">${friend.status?.online ? 'Online' : 'Offline'}</span>
                    </div>
                `
            })
        }

        container.innerHTML = html

        container.querySelectorAll('[data-accept]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const index = parseInt(btn.dataset.accept)
                await friendSystem.acceptFriendRequest(index)
                this.loadTabContent('friends')
            })
        })
    }

    async renderLeaderboard(container) {
        const entries = await leaderboardService.getLeaderboard('arena_wins', 10)
        const stats = await leaderboardService.getStats()

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="grudge-auth-prompt">
                    <h3>No Rankings Yet</h3>
                    <p>Win arena battles to climb the leaderboard!</p>
                    <div style="margin-top: 20px; color: #6b7280; font-size: 11px;">
                        Total Matches: ${stats.totalMatches}<br>
                        Total Logins: ${stats.totalLogins}
                    </div>
                </div>
            `
            return
        }

        let html = `<div style="color: #6ee7b7; font-size: 11px; margin-bottom: 10px;">TOP ARENA FIGHTERS</div>`
        
        entries.forEach((entry, i) => {
            let rankClass = ''
            if (i === 0) rankClass = 'gold'
            else if (i === 1) rankClass = 'silver'
            else if (i === 2) rankClass = 'bronze'

            html += `
                <div class="grudge-leaderboard-item">
                    <div class="grudge-rank ${rankClass}">${entry.rank}</div>
                    <span class="grudge-friend-name" style="flex: 1;">${entry.username}</span>
                    <span class="grudge-score">${entry.score} wins</span>
                </div>
            `
        })

        html += `
            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #1e293b; color: #6b7280; font-size: 11px; text-align: center;">
                Network Stats: ${stats.totalMatches} matches played
            </div>
        `

        container.innerHTML = html
    }

    async sendMessage() {
        const input = document.getElementById('grudge-chat-message')
        const message = input.value.trim()
        
        if (!message) return
        
        await chatSystem.sendMessage(message, 'global')
        input.value = ''
        this.loadTabContent('chat')
    }

    escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block'
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none'
        }
    }

    destroy() {
        if (this.container) {
            this.container.remove()
            this.container = null
        }
    }
}

export const networkUI = new NetworkUI()
export default networkUI
