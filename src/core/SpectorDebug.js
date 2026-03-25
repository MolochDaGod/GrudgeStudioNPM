/*
    Spector.js Debug Integration for GRUDGE Engine
    Enables WebGL debugging and frame capture
*/

let spectorInstance = null
let isSpectorLoaded = false

export async function initSpector() {
    try {
        const { Spector } = await import('spectorjs')
        spectorInstance = new Spector()
        isSpectorLoaded = true
        console.log('[GRUDGE Debug] Spector.js initialized - Press F12 then click the Spector icon to capture frames')
        return spectorInstance
    } catch (error) {
        console.warn('[GRUDGE Debug] Spector.js failed to load:', error)
        return null
    }
}

export function displaySpectorUI() {
    if (!spectorInstance) {
        console.warn('[GRUDGE Debug] Spector not initialized. Call initSpector() first.')
        return
    }
    spectorInstance.displayUI()
}

export function captureFrame(canvas) {
    if (!spectorInstance) {
        console.warn('[GRUDGE Debug] Spector not initialized.')
        return
    }
    
    if (canvas) {
        spectorInstance.captureCanvas(canvas)
    } else {
        spectorInstance.captureNextFrame(document.querySelector('canvas'))
    }
}

export function onCaptureComplete(callback) {
    if (!spectorInstance) return
    spectorInstance.onCapture.add(callback)
}

export function getSpector() {
    return spectorInstance
}

export function isLoaded() {
    return isSpectorLoaded
}

export function addDebugPanel() {
    const panel = document.createElement('div')
    panel.id = 'spector-debug-panel'
    panel.innerHTML = `
        <style>
            #spector-debug-panel {
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 9999;
                background: rgba(22, 33, 62, 0.95);
                padding: 10px;
                border-radius: 8px;
                font-family: 'Segoe UI', sans-serif;
                color: #fff;
                font-size: 12px;
                display: none;
            }
            #spector-debug-panel.visible {
                display: block;
            }
            #spector-debug-panel button {
                background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
                border: none;
                color: #fff;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin: 4px;
                font-size: 11px;
            }
            #spector-debug-panel button:hover {
                opacity: 0.9;
            }
            #spector-debug-panel .title {
                font-weight: bold;
                margin-bottom: 8px;
                color: #e94560;
            }
        </style>
        <div class="title">GRUDGE Debug</div>
        <button id="btn-spector-ui">Open Spector UI</button>
        <button id="btn-capture-frame">Capture Frame</button>
        <button id="btn-close-debug">Close</button>
    `
    document.body.appendChild(panel)
    
    document.getElementById('btn-spector-ui').addEventListener('click', () => {
        displaySpectorUI()
    })
    
    document.getElementById('btn-capture-frame').addEventListener('click', () => {
        captureFrame()
    })
    
    document.getElementById('btn-close-debug').addEventListener('click', () => {
        panel.classList.remove('visible')
    })
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F9') {
            panel.classList.toggle('visible')
        }
    })
    
    return panel
}

export default {
    initSpector,
    displaySpectorUI,
    captureFrame,
    onCaptureComplete,
    getSpector,
    isLoaded,
    addDebugPanel
}
