/*
    GRUDGE Studio - Console Panel
    Developer console with log, warn, error display and filtering
*/

export class ConsolePanel {
    constructor(containerId = 'console-panel') {
        this.containerId = containerId
        this.container = null
        this.logs = []
        this.maxLogs = 500
        this.filters = {
            log: true,
            warn: true,
            error: true,
            info: true
        }
        this.isOpen = false
        this.searchQuery = ''
        
        this.originalConsole = {
            log: console.log.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            info: console.info.bind(console)
        }
    }
    
    init() {
        this.createPanel()
        this.interceptConsole()
        this.bindEvents()
    }
    
    createPanel() {
        if (document.getElementById(this.containerId)) {
            this.container = document.getElementById(this.containerId)
            return
        }
        
        this.container = document.createElement('div')
        this.container.id = this.containerId
        this.container.innerHTML = `
            <style>
                #${this.containerId} {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 250px;
                    background: #1a1a28;
                    border-top: 1px solid #3d3d5c;
                    display: none;
                    flex-direction: column;
                    z-index: 2000;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 12px;
                }
                #${this.containerId}.open {
                    display: flex;
                }
                .console-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: #252538;
                    border-bottom: 1px solid #3d3d5c;
                }
                .console-title {
                    color: #e0e0e0;
                    font-weight: 600;
                    margin-right: auto;
                }
                .console-filter {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    background: #3d3d5c;
                    border-radius: 4px;
                    cursor: pointer;
                    color: #888;
                    font-size: 11px;
                }
                .console-filter.active {
                    color: #e0e0e0;
                }
                .console-filter.log.active { background: #3d5c3d; }
                .console-filter.warn.active { background: #5c5c3d; }
                .console-filter.error.active { background: #5c3d3d; }
                .console-filter.info.active { background: #3d3d5c; }
                .console-search {
                    padding: 4px 8px;
                    background: #1a1a28;
                    border: 1px solid #3d3d5c;
                    border-radius: 4px;
                    color: #e0e0e0;
                    width: 150px;
                    font-size: 11px;
                }
                .console-search::placeholder {
                    color: #666;
                }
                .console-btn {
                    padding: 4px 8px;
                    background: #3d3d5c;
                    border: none;
                    color: #e0e0e0;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                }
                .console-btn:hover {
                    background: #4d4d7a;
                }
                .console-close {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px;
                }
                .console-close:hover {
                    color: #ff6b6b;
                }
                .console-logs {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }
                .log-entry {
                    display: flex;
                    padding: 4px 8px;
                    border-bottom: 1px solid #252538;
                    word-break: break-word;
                }
                .log-entry:hover {
                    background: #252538;
                }
                .log-time {
                    color: #666;
                    margin-right: 12px;
                    flex-shrink: 0;
                    font-size: 10px;
                }
                .log-type {
                    width: 50px;
                    flex-shrink: 0;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 10px;
                }
                .log-type.log { color: #8bc34a; }
                .log-type.warn { color: #ffc107; }
                .log-type.error { color: #f44336; }
                .log-type.info { color: #2196f3; }
                .log-message {
                    color: #e0e0e0;
                    flex: 1;
                }
                .log-entry.error {
                    background: rgba(244, 67, 54, 0.1);
                }
                .log-entry.warn {
                    background: rgba(255, 193, 7, 0.05);
                }
                .log-count {
                    display: flex;
                    gap: 12px;
                    font-size: 11px;
                    color: #888;
                }
                .log-count span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .log-count .count-log { color: #8bc34a; }
                .log-count .count-warn { color: #ffc107; }
                .log-count .count-error { color: #f44336; }
            </style>
            
            <div class="console-toolbar">
                <span class="console-title">Console</span>
                
                <div class="log-count">
                    <span class="count-log">0 logs</span>
                    <span class="count-warn">0 warnings</span>
                    <span class="count-error">0 errors</span>
                </div>
                
                <div class="console-filter log active" data-type="log">Log</div>
                <div class="console-filter warn active" data-type="warn">Warn</div>
                <div class="console-filter error active" data-type="error">Error</div>
                <div class="console-filter info active" data-type="info">Info</div>
                
                <input type="text" class="console-search" placeholder="Search logs...">
                
                <button class="console-btn" data-action="clear">Clear</button>
                <button class="console-close">&times;</button>
            </div>
            
            <div class="console-logs" id="console-logs"></div>
        `
        
        document.body.appendChild(this.container)
    }
    
    bindEvents() {
        const filters = this.container.querySelectorAll('.console-filter')
        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const type = filter.dataset.type
                this.filters[type] = !this.filters[type]
                filter.classList.toggle('active', this.filters[type])
                this.render()
            })
        })
        
        const search = this.container.querySelector('.console-search')
        search.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase()
            this.render()
        })
        
        const clearBtn = this.container.querySelector('[data-action="clear"]')
        clearBtn.addEventListener('click', () => this.clear())
        
        const closeBtn = this.container.querySelector('.console-close')
        closeBtn.addEventListener('click', () => this.close())
    }
    
    interceptConsole() {
        const self = this
        
        console.log = function(...args) {
            self.addLog('log', args)
            self.originalConsole.log(...args)
        }
        
        console.warn = function(...args) {
            self.addLog('warn', args)
            self.originalConsole.warn(...args)
        }
        
        console.error = function(...args) {
            self.addLog('error', args)
            self.originalConsole.error(...args)
        }
        
        console.info = function(...args) {
            self.addLog('info', args)
            self.originalConsole.info(...args)
        }
        
        window.addEventListener('error', (event) => {
            self.addLog('error', [event.message, `at ${event.filename}:${event.lineno}`])
        })
        
        window.addEventListener('unhandledrejection', (event) => {
            self.addLog('error', ['Unhandled Promise Rejection:', event.reason])
        })
    }
    
    addLog(type, args) {
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg, null, 2)
                } catch {
                    return String(arg)
                }
            }
            return String(arg)
        }).join(' ')
        
        const entry = {
            type,
            message,
            timestamp: Date.now(),
            time: new Date().toLocaleTimeString()
        }
        
        this.logs.push(entry)
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift()
        }
        
        if (this.isOpen) {
            this.appendLog(entry)
            this.updateCounts()
        }
    }
    
    appendLog(entry) {
        if (!this.filters[entry.type]) return
        if (this.searchQuery && !entry.message.toLowerCase().includes(this.searchQuery)) return
        
        const logsContainer = this.container.querySelector('#console-logs')
        const div = document.createElement('div')
        div.className = `log-entry ${entry.type}`
        div.innerHTML = `
            <span class="log-time">${entry.time}</span>
            <span class="log-type ${entry.type}">${entry.type}</span>
            <span class="log-message">${this.escapeHtml(entry.message)}</span>
        `
        logsContainer.appendChild(div)
        
        logsContainer.scrollTop = logsContainer.scrollHeight
    }
    
    escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }
    
    render() {
        const logsContainer = this.container.querySelector('#console-logs')
        logsContainer.innerHTML = ''
        
        const filtered = this.logs.filter(entry => {
            if (!this.filters[entry.type]) return false
            if (this.searchQuery && !entry.message.toLowerCase().includes(this.searchQuery)) return false
            return true
        })
        
        filtered.forEach(entry => this.appendLog(entry))
        this.updateCounts()
    }
    
    updateCounts() {
        const counts = { log: 0, warn: 0, error: 0, info: 0 }
        this.logs.forEach(entry => counts[entry.type]++)
        
        const countContainer = this.container.querySelector('.log-count')
        countContainer.innerHTML = `
            <span class="count-log">${counts.log} logs</span>
            <span class="count-warn">${counts.warn} warnings</span>
            <span class="count-error">${counts.error} errors</span>
        `
    }
    
    open() {
        this.createPanel()
        this.container.classList.add('open')
        this.isOpen = true
        this.render()
    }
    
    close() {
        if (this.container) {
            this.container.classList.remove('open')
        }
        this.isOpen = false
    }
    
    toggle() {
        if (this.isOpen) {
            this.close()
        } else {
            this.open()
        }
    }
    
    clear() {
        this.logs = []
        const logsContainer = this.container.querySelector('#console-logs')
        if (logsContainer) {
            logsContainer.innerHTML = ''
        }
        this.updateCounts()
    }
    
    getLogs(type = null) {
        if (type) {
            return this.logs.filter(l => l.type === type)
        }
        return [...this.logs]
    }
    
    exportLogs() {
        const text = this.logs.map(l => 
            `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`
        ).join('\n')
        
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `console_logs_${Date.now()}.txt`
        link.click()
        URL.revokeObjectURL(url)
    }
    
    dispose() {
        console.log = this.originalConsole.log
        console.warn = this.originalConsole.warn
        console.error = this.originalConsole.error
        console.info = this.originalConsole.info
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
    }
}

export const consolePanel = new ConsolePanel()
export default ConsolePanel
