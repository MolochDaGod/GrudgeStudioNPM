export class OnboardingHints {
    constructor() {
        this.hints = [
            { id: 'welcome', message: 'Welcome to World Builder! Middle-click to rotate camera, right-click to pan.', duration: 5000 },
            { id: 'tools', message: 'Tip: Use Q/W/E/R for quick tool switching (Select/Move/Rotate/Scale)', duration: 4000 },
            { id: 'terrain', message: 'Tip: Press T to enter terrain sculpting mode', duration: 4000 },
            { id: 'place', message: 'Tip: Drag assets from the library or use + button for quick placement', duration: 4000 },
            { id: 'play', message: 'Tip: Click ▶️ Play Mode to test your scene with a character!', duration: 4000 }
        ]
        this.currentIndex = 0
        this.container = null
        this.storageKey = 'grudge_editor_hints_seen'
        this.hasSeenHints = this.loadSeenStatus()
        this.hintTimeout = null
        this.isActive = false
    }
    
    loadSeenStatus() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || false
        } catch {
            return false
        }
    }
    
    markAsSeen() {
        this.hasSeenHints = true
        localStorage.setItem(this.storageKey, 'true')
    }
    
    init() {
        this.container = document.createElement('div')
        this.container.id = 'onboarding-hints'
        this.container.innerHTML = `
            <style>
                #onboarding-hints {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 200;
                    pointer-events: auto;
                    font-family: 'Jost', sans-serif;
                }
                .hint-bubble {
                    background: linear-gradient(135deg, rgba(110, 231, 183, 0.95), rgba(16, 185, 129, 0.95));
                    color: #0e1220;
                    padding: 12px 20px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 24px rgba(110, 231, 183, 0.4);
                    animation: hintSlideUp 0.4s ease-out;
                    max-width: 500px;
                }
                @keyframes hintSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hint-bubble.hiding {
                    animation: hintSlideDown 0.3s ease-in forwards;
                }
                @keyframes hintSlideDown {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(20px); }
                }
                .hint-icon {
                    font-size: 18px;
                }
                .hint-message {
                    flex: 1;
                }
                .hint-dismiss {
                    background: rgba(0,0,0,0.2);
                    border: none;
                    color: #0e1220;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .hint-dismiss:hover {
                    background: rgba(0,0,0,0.3);
                }
                .hint-skip-all {
                    background: none;
                    border: none;
                    color: rgba(14, 18, 32, 0.7);
                    font-size: 11px;
                    cursor: pointer;
                    text-decoration: underline;
                    margin-left: 8px;
                }
                .hint-skip-all:hover {
                    color: #0e1220;
                }
            </style>
            <div class="hint-bubble" id="hint-bubble" style="display: none;">
                <span class="hint-icon">💡</span>
                <span class="hint-message" id="hint-message"></span>
                <button class="hint-dismiss" id="hint-dismiss">×</button>
                <button class="hint-skip-all" id="hint-skip-all">Don't show again</button>
            </div>
        `
        document.body.appendChild(this.container)
        this.bindEvents()
    }
    
    bindEvents() {
        this.container.querySelector('#hint-dismiss').addEventListener('click', () => {
            this.hideCurrentHint()
            this.showNextHint()
        })
        
        this.container.querySelector('#hint-skip-all').addEventListener('click', () => {
            this.markAsSeen()
            this.hideCurrentHint()
            this.isActive = false
        })
    }
    
    start() {
        if (this.hasSeenHints) return
        
        this.isActive = true
        this.currentIndex = 0
        setTimeout(() => this.showHint(0), 1500)
    }
    
    showHint(index) {
        if (!this.isActive || index >= this.hints.length) {
            this.markAsSeen()
            return
        }
        
        const hint = this.hints[index]
        const bubble = this.container.querySelector('#hint-bubble')
        const message = this.container.querySelector('#hint-message')
        
        message.textContent = hint.message
        bubble.style.display = 'flex'
        bubble.classList.remove('hiding')
        
        this.hintTimeout = setTimeout(() => {
            this.hideCurrentHint()
            this.currentIndex++
            setTimeout(() => this.showHint(this.currentIndex), 500)
        }, hint.duration)
    }
    
    showNextHint() {
        this.currentIndex++
        if (this.currentIndex < this.hints.length) {
            setTimeout(() => this.showHint(this.currentIndex), 300)
        } else {
            this.markAsSeen()
        }
    }
    
    hideCurrentHint() {
        clearTimeout(this.hintTimeout)
        const bubble = this.container.querySelector('#hint-bubble')
        bubble.classList.add('hiding')
        setTimeout(() => {
            bubble.style.display = 'none'
            bubble.classList.remove('hiding')
        }, 300)
    }
    
    showCustomHint(message, duration = 3000) {
        const bubble = this.container.querySelector('#hint-bubble')
        const messageEl = this.container.querySelector('#hint-message')
        
        messageEl.textContent = message
        bubble.style.display = 'flex'
        bubble.classList.remove('hiding')
        
        clearTimeout(this.hintTimeout)
        this.hintTimeout = setTimeout(() => this.hideCurrentHint(), duration)
    }
    
    destroy() {
        clearTimeout(this.hintTimeout)
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
    }
}
