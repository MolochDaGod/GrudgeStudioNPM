export class TooltipService {
    constructor() {
        this.tooltip = null
        this.showDelay = 500
        this.hideDelay = 100
        this.showTimeout = null
        this.hideTimeout = null
        this.init()
    }

    init() {
        this.tooltip = document.createElement('div')
        this.tooltip.id = 'editor-tooltip'
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(20, 26, 43, 0.98);
            color: #e8eaf6;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 250px;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            border: 1px solid rgba(110, 231, 183, 0.3);
        `
        document.body.appendChild(this.tooltip)

        document.addEventListener('mouseover', (e) => this.handleMouseOver(e))
        document.addEventListener('mouseout', (e) => this.handleMouseOut(e))
        document.addEventListener('mousemove', (e) => this.updatePosition(e))
    }

    handleMouseOver(e) {
        const target = e.target.closest('[data-tooltip]')
        if (!target) return

        clearTimeout(this.hideTimeout)
        this.showTimeout = setTimeout(() => {
            const text = target.getAttribute('data-tooltip')
            const shortcut = target.getAttribute('data-shortcut')
            
            let content = text
            if (shortcut) {
                content += ` <span style="color: #6ee7b7; margin-left: 8px;">[${shortcut}]</span>`
            }
            
            this.tooltip.innerHTML = content
            this.tooltip.style.opacity = '1'
        }, this.showDelay)
    }

    handleMouseOut(e) {
        clearTimeout(this.showTimeout)
        this.hideTimeout = setTimeout(() => {
            this.tooltip.style.opacity = '0'
        }, this.hideDelay)
    }

    updatePosition(e) {
        if (this.tooltip.style.opacity === '0') return
        
        const x = e.clientX + 15
        const y = e.clientY + 15
        
        const rect = this.tooltip.getBoundingClientRect()
        const maxX = window.innerWidth - rect.width - 10
        const maxY = window.innerHeight - rect.height - 10
        
        this.tooltip.style.left = `${Math.min(x, maxX)}px`
        this.tooltip.style.top = `${Math.min(y, maxY)}px`
    }

    destroy() {
        if (this.tooltip && this.tooltip.parentNode) {
            this.tooltip.parentNode.removeChild(this.tooltip)
        }
    }
}

export const tooltipService = new TooltipService()
