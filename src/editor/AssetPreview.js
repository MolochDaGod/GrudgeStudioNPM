/*
    GRUDGE Studio - Asset Preview Panel
    Shows 3D model preview with inspection tools
*/

import { ModelViewer } from './ModelViewer.js'

export class AssetPreview {
    constructor(containerId = 'asset-preview-panel') {
        this.containerId = containerId
        this.container = null
        this.viewer = null
        this.currentAsset = null
        this.isOpen = false
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
                    right: 320px;
                    top: 60px;
                    width: 400px;
                    height: 500px;
                    background: #1e1e2e;
                    border: 1px solid #3d3d5c;
                    border-radius: 8px;
                    display: none;
                    flex-direction: column;
                    z-index: 1000;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }
                #${this.containerId}.open {
                    display: flex;
                }
                .preview-header {
                    padding: 12px 16px;
                    background: #252538;
                    border-bottom: 1px solid #3d3d5c;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: 8px 8px 0 0;
                }
                .preview-title {
                    color: #e0e0e0;
                    font-weight: 600;
                    font-size: 14px;
                }
                .preview-close {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 4px 8px;
                }
                .preview-close:hover {
                    color: #ff6b6b;
                }
                .preview-viewport {
                    flex: 1;
                    position: relative;
                    background: #0d0d15;
                }
                .preview-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #888;
                }
                .preview-controls {
                    padding: 12px;
                    background: #252538;
                    border-top: 1px solid #3d3d5c;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .preview-btn {
                    padding: 6px 12px;
                    background: #3d3d5c;
                    border: none;
                    color: #e0e0e0;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .preview-btn:hover {
                    background: #4d4d7a;
                }
                .preview-btn.active {
                    background: #6366f1;
                }
                .preview-info {
                    padding: 12px;
                    background: #1a1a28;
                    border-top: 1px solid #3d3d5c;
                    font-size: 12px;
                    color: #888;
                    max-height: 120px;
                    overflow-y: auto;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    border-bottom: 1px solid #252538;
                }
                .info-label {
                    color: #6b6b8a;
                }
                .info-value {
                    color: #e0e0e0;
                }
                .animation-list {
                    margin-top: 8px;
                }
                .animation-item {
                    padding: 4px 8px;
                    background: #252538;
                    margin: 2px 0;
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                }
                .animation-item:hover {
                    background: #3d3d5c;
                }
                .animation-item.playing {
                    background: #6366f1;
                }
            </style>
            
            <div class="preview-header">
                <span class="preview-title">Asset Preview</span>
                <button class="preview-close">&times;</button>
            </div>
            
            <div class="preview-viewport" id="preview-viewport">
                <div class="preview-loading">Loading...</div>
            </div>
            
            <div class="preview-controls">
                <button class="preview-btn" data-action="rotate">Auto Rotate</button>
                <button class="preview-btn" data-action="reset">Reset View</button>
                <button class="preview-btn" data-action="screenshot">Screenshot</button>
                <button class="preview-btn" data-action="wireframe">Wireframe</button>
            </div>
            
            <div class="preview-info" id="preview-info">
                <div class="info-row">
                    <span class="info-label">Select an asset to preview</span>
                </div>
            </div>
        `
        
        document.body.appendChild(this.container)
        this.bindEvents()
    }
    
    bindEvents() {
        const closeBtn = this.container.querySelector('.preview-close')
        closeBtn.addEventListener('click', () => this.close())
        
        const buttons = this.container.querySelectorAll('.preview-btn')
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action
                this.handleAction(action, e.target)
            })
        })
    }
    
    handleAction(action, button) {
        if (!this.viewer) return
        
        switch (action) {
            case 'rotate':
                const isRotating = button.classList.toggle('active')
                this.viewer.setAutoRotate(isRotating)
                break
                
            case 'reset':
                this.viewer.resetCamera()
                break
                
            case 'screenshot':
                const dataURL = this.viewer.takeScreenshot()
                const link = document.createElement('a')
                link.download = `${this.currentAsset?.name || 'model'}_preview.png`
                link.href = dataURL
                link.click()
                break
                
            case 'wireframe':
                const isWireframe = button.classList.toggle('active')
                if (this.viewer.model) {
                    this.viewer.model.traverse(node => {
                        if (node.isMesh && node.material) {
                            const mats = Array.isArray(node.material) ? node.material : [node.material]
                            mats.forEach(mat => mat.wireframe = isWireframe)
                        }
                    })
                }
                break
        }
    }
    
    open() {
        this.createPanel()
        this.container.classList.add('open')
        this.isOpen = true
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
    
    async loadAsset(src, name = 'Model') {
        this.open()
        this.currentAsset = { src, name }
        
        const viewport = this.container.querySelector('#preview-viewport')
        const loading = viewport.querySelector('.preview-loading')
        loading.style.display = 'block'
        loading.textContent = 'Loading...'
        
        if (this.viewer) {
            this.viewer.dispose()
        }
        
        this.viewer = new ModelViewer(viewport, {
            autoRotate: true,
            cameraControls: true,
            onProgress: (percent) => {
                loading.textContent = `Loading... ${Math.round(percent)}%`
            }
        })
        
        try {
            await this.viewer.loadModel(src)
            loading.style.display = 'none'
            this.updateInfo()
            
            const rotateBtn = this.container.querySelector('[data-action="rotate"]')
            rotateBtn.classList.add('active')
        } catch (error) {
            loading.textContent = 'Failed to load model'
            loading.style.color = '#ff6b6b'
        }
    }
    
    updateInfo() {
        const infoPanel = this.container.querySelector('#preview-info')
        
        const meshes = this.viewer.getMeshes()
        const materials = this.viewer.getMaterials()
        const animations = this.viewer.getAnimationList()
        
        const totalVertices = meshes.reduce((sum, m) => sum + m.vertices, 0)
        const totalFaces = meshes.reduce((sum, m) => sum + m.faces, 0)
        
        let html = `
            <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">${this.currentAsset?.name || 'Unknown'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Meshes</span>
                <span class="info-value">${meshes.length}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Vertices</span>
                <span class="info-value">${totalVertices.toLocaleString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Faces</span>
                <span class="info-value">${totalFaces.toLocaleString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Materials</span>
                <span class="info-value">${materials.length}</span>
            </div>
        `
        
        if (animations.length > 0) {
            html += `
                <div class="info-row">
                    <span class="info-label">Animations</span>
                    <span class="info-value">${animations.length}</span>
                </div>
                <div class="animation-list">
            `
            animations.forEach((anim, i) => {
                html += `
                    <div class="animation-item" data-animation="${anim.name}">
                        <span>${anim.name || `Animation ${i + 1}`}</span>
                        <span>${anim.duration.toFixed(2)}s</span>
                    </div>
                `
            })
            html += `</div>`
        }
        
        infoPanel.innerHTML = html
        
        const animItems = infoPanel.querySelectorAll('.animation-item')
        animItems.forEach(item => {
            item.addEventListener('click', () => {
                animItems.forEach(i => i.classList.remove('playing'))
                item.classList.add('playing')
                this.viewer.stopAnimation()
                this.viewer.playAnimation(item.dataset.animation)
            })
        })
    }
    
    dispose() {
        if (this.viewer) {
            this.viewer.dispose()
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
    }
}

export const assetPreview = new AssetPreview()
export default AssetPreview
