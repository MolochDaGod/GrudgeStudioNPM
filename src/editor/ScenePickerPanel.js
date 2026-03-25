/*
    GRUDGE Studio - Scene Picker Panel
    UI for browsing and loading prefab scenes/terrains
*/

export class ScenePickerPanel {
    constructor(container, sceneLoader) {
        this.container = container
        this.sceneLoader = sceneLoader
        this.selectedScene = null
        this.createUI()
        
        if (this.sceneLoader) {
            this.sceneLoader.addListener((event, data) => this.onSceneLoaderEvent(event, data))
        }
    }
    
    createUI() {
        if (!this.container) return
        
        this.panel = document.createElement('div')
        this.panel.className = 'scene-picker-panel'
        this.panel.innerHTML = `
            <div class="panel-section">
                <div class="section-header">
                    <span>🗺️ Scene Picker</span>
                    <span class="toggle">▼</span>
                </div>
                <div class="section-content">
                    <div class="scene-categories">
                        <button class="category-btn active" data-category="all">All</button>
                        <button class="category-btn" data-category="arenas">Arenas</button>
                        <button class="category-btn" data-category="terrains">Terrains</button>
                        <button class="category-btn" data-category="environments">Environments</button>
                    </div>
                    <div class="scene-list" id="scene-list"></div>
                    <div class="scene-actions">
                        <button id="btn-load-scene" class="action-btn" disabled>Load Scene</button>
                        <label class="merge-option">
                            <input type="checkbox" id="chk-merge-scene">
                            <span>Merge with current</span>
                        </label>
                    </div>
                    <div class="loading-indicator" id="scene-loading" style="display: none;">
                        <div class="spinner"></div>
                        <span>Loading scene...</span>
                    </div>
                </div>
            </div>
        `
        
        this.container.appendChild(this.panel)
        this.bindEvents()
        this.renderSceneList('all')
    }
    
    bindEvents() {
        const header = this.panel.querySelector('.section-header')
        header.onclick = () => {
            const content = this.panel.querySelector('.section-content')
            content.classList.toggle('collapsed')
            header.querySelector('.toggle').textContent = content.classList.contains('collapsed') ? '▶' : '▼'
        }
        
        this.panel.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.panel.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'))
                btn.classList.add('active')
                this.renderSceneList(btn.dataset.category)
            })
        })
        
        const loadBtn = this.panel.querySelector('#btn-load-scene')
        loadBtn?.addEventListener('click', () => this.loadSelectedScene())
    }
    
    renderSceneList(category) {
        const list = this.panel.querySelector('#scene-list')
        if (!list || !this.sceneLoader) return
        
        let scenes = this.sceneLoader.getAvailableScenes()
        if (category !== 'all') {
            scenes = scenes.filter(s => s.category === category)
        }
        
        list.innerHTML = scenes.map(scene => `
            <div class="scene-item" data-id="${scene.id}">
                <div class="scene-thumb">${scene.thumbnail}</div>
                <div class="scene-info">
                    <div class="scene-name">${scene.name}</div>
                    <div class="scene-desc">${scene.description}</div>
                </div>
            </div>
        `).join('')
        
        list.querySelectorAll('.scene-item').forEach(item => {
            item.addEventListener('click', () => {
                list.querySelectorAll('.scene-item').forEach(i => i.classList.remove('selected'))
                item.classList.add('selected')
                this.selectedScene = item.dataset.id
                this.panel.querySelector('#btn-load-scene').disabled = false
            })
        })
    }
    
    async loadSelectedScene() {
        if (!this.selectedScene || !this.sceneLoader) return
        
        const mergeMode = this.panel.querySelector('#chk-merge-scene')?.checked || false
        
        try {
            await this.sceneLoader.loadScene(this.selectedScene, !mergeMode)
        } catch (error) {
            console.error('[ScenePicker] Failed to load scene:', error)
        }
    }
    
    onSceneLoaderEvent(event, data) {
        const loading = this.panel.querySelector('#scene-loading')
        
        switch (event) {
            case 'loadStart':
                if (loading) loading.style.display = 'flex'
                break
            case 'loadComplete':
                if (loading) loading.style.display = 'none'
                break
            case 'loadError':
                if (loading) loading.style.display = 'none'
                alert(`Failed to load scene: ${data.error?.message || 'Unknown error'}`)
                break
        }
    }
    
    setSceneLoader(loader) {
        this.sceneLoader = loader
        if (this.sceneLoader) {
            this.sceneLoader.addListener((event, data) => this.onSceneLoaderEvent(event, data))
            this.renderSceneList('all')
        }
    }
}

export default ScenePickerPanel
