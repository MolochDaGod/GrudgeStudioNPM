/*
    GRUDGE Studio - Timeline Panel
    Keyframe animation editor inspired by ThreeNodes.js
*/

export class Timeline {
    constructor(containerId = 'timeline-panel') {
        this.containerId = containerId
        this.container = null
        this.canvas = null
        this.ctx = null
        
        this.isOpen = false
        this.isPlaying = false
        this.currentTime = 0
        this.duration = 10
        this.fps = 60
        this.zoom = 1
        this.scrollX = 0
        
        this.tracks = []
        this.selectedKeyframes = new Set()
        this.dragging = null
        
        this.lastFrameTime = 0
        this.animationFrameId = null
        
        this.onTimeChange = null
        this.onKeyframeChange = null
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
                    height: 200px;
                    background: #1a1a28;
                    border-top: 1px solid #3d3d5c;
                    display: none;
                    flex-direction: column;
                    z-index: 1800;
                    font-family: 'Segoe UI', Arial, sans-serif;
                }
                #${this.containerId}.open {
                    display: flex;
                }
                .timeline-header {
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    background: #252538;
                    border-bottom: 1px solid #3d3d5c;
                    gap: 12px;
                }
                .timeline-title {
                    color: #e0e0e0;
                    font-weight: 600;
                    font-size: 13px;
                }
                .timeline-controls {
                    display: flex;
                    gap: 4px;
                }
                .timeline-btn {
                    padding: 4px 8px;
                    background: #3d3d5c;
                    border: none;
                    border-radius: 4px;
                    color: #e0e0e0;
                    cursor: pointer;
                    font-size: 14px;
                }
                .timeline-btn:hover {
                    background: #4d4d7a;
                }
                .timeline-btn.active {
                    background: #6366f1;
                }
                .timeline-time {
                    color: #e0e0e0;
                    font-family: monospace;
                    font-size: 12px;
                    background: #1a1a28;
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid #3d3d5c;
                    min-width: 80px;
                    text-align: center;
                }
                .timeline-duration {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-left: auto;
                }
                .timeline-duration label {
                    color: #888;
                    font-size: 11px;
                }
                .timeline-duration input {
                    width: 50px;
                    padding: 4px;
                    background: #1a1a28;
                    border: 1px solid #3d3d5c;
                    border-radius: 4px;
                    color: #e0e0e0;
                    font-size: 11px;
                }
                .timeline-close {
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 18px;
                    margin-left: 8px;
                }
                .timeline-close:hover {
                    color: #ff6b6b;
                }
                .timeline-main {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                .timeline-tracks-panel {
                    width: 180px;
                    background: #1a1a28;
                    border-right: 1px solid #3d3d5c;
                    overflow-y: auto;
                }
                .timeline-track-header {
                    height: 30px;
                    padding: 0 12px;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid #252538;
                    color: #e0e0e0;
                    font-size: 12px;
                    cursor: pointer;
                }
                .timeline-track-header:hover {
                    background: #252538;
                }
                .timeline-track-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                    margin-right: 8px;
                }
                .timeline-canvas-wrapper {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                }
                .timeline-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .timeline-ruler {
                    height: 24px;
                    background: #252538;
                    border-bottom: 1px solid #3d3d5c;
                }
            </style>
            
            <div class="timeline-header">
                <span class="timeline-title">Timeline</span>
                
                <div class="timeline-controls">
                    <button class="timeline-btn" id="tl-first-btn" title="Go to start">⏮</button>
                    <button class="timeline-btn" id="tl-prev-btn" title="Previous frame">◀</button>
                    <button class="timeline-btn" id="tl-play-btn" title="Play/Pause">▶</button>
                    <button class="timeline-btn" id="tl-next-btn" title="Next frame">▶</button>
                    <button class="timeline-btn" id="tl-last-btn" title="Go to end">⏭</button>
                </div>
                
                <span class="timeline-time" id="tl-time-display">0:00.000</span>
                
                <button class="timeline-btn" id="tl-add-keyframe" title="Add keyframe">◆+</button>
                
                <div class="timeline-duration">
                    <label>Duration:</label>
                    <input type="number" id="tl-duration" value="10" min="1" max="300" step="1">
                    <span style="color: #888; font-size: 11px;">s</span>
                </div>
                
                <button class="timeline-close" id="tl-close-btn">&times;</button>
            </div>
            
            <div class="timeline-main">
                <div class="timeline-tracks-panel" id="tl-tracks-panel"></div>
                
                <div class="timeline-canvas-wrapper">
                    <canvas class="timeline-canvas" id="tl-canvas"></canvas>
                </div>
            </div>
        `
        
        document.body.appendChild(this.container)
        this.canvas = this.container.querySelector('#tl-canvas')
        this.ctx = this.canvas.getContext('2d')
        
        this.bindEvents()
    }
    
    bindEvents() {
        const closeBtn = this.container.querySelector('#tl-close-btn')
        closeBtn.addEventListener('click', () => this.close())
        
        const playBtn = this.container.querySelector('#tl-play-btn')
        playBtn.addEventListener('click', () => this.togglePlay())
        
        const firstBtn = this.container.querySelector('#tl-first-btn')
        firstBtn.addEventListener('click', () => this.goToStart())
        
        const lastBtn = this.container.querySelector('#tl-last-btn')
        lastBtn.addEventListener('click', () => this.goToEnd())
        
        const prevBtn = this.container.querySelector('#tl-prev-btn')
        prevBtn.addEventListener('click', () => this.prevFrame())
        
        const nextBtn = this.container.querySelector('#tl-next-btn')
        nextBtn.addEventListener('click', () => this.nextFrame())
        
        const addKeyframeBtn = this.container.querySelector('#tl-add-keyframe')
        addKeyframeBtn.addEventListener('click', () => this.addKeyframeAtCurrentTime())
        
        const durationInput = this.container.querySelector('#tl-duration')
        durationInput.addEventListener('change', (e) => {
            this.duration = parseFloat(e.target.value) || 10
            this.render()
        })
        
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e))
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e))
        this.canvas.addEventListener('mouseup', () => this.onMouseUp())
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e))
        
        window.addEventListener('resize', () => {
            if (this.isOpen) this.resize()
        })
    }
    
    addTrack(config) {
        const track = {
            id: config.id || crypto.randomUUID(),
            name: config.name || 'Track',
            target: config.target || null,
            property: config.property || 'position.x',
            color: config.color || '#6366f1',
            keyframes: config.keyframes || [],
            visible: true,
            locked: false
        }
        
        this.tracks.push(track)
        this.updateTracksPanel()
        this.render()
        
        return track
    }
    
    removeTrack(trackId) {
        const index = this.tracks.findIndex(t => t.id === trackId)
        if (index > -1) {
            this.tracks.splice(index, 1)
            this.updateTracksPanel()
            this.render()
        }
    }
    
    addKeyframe(trackId, time, value, easing = 'linear') {
        const track = this.tracks.find(t => t.id === trackId)
        if (!track) return null
        
        const existingIndex = track.keyframes.findIndex(k => Math.abs(k.time - time) < 0.001)
        if (existingIndex > -1) {
            track.keyframes[existingIndex].value = value
            track.keyframes[existingIndex].easing = easing
            return track.keyframes[existingIndex]
        }
        
        const keyframe = {
            id: crypto.randomUUID(),
            time,
            value,
            easing
        }
        
        track.keyframes.push(keyframe)
        track.keyframes.sort((a, b) => a.time - b.time)
        
        this.render()
        this.onKeyframeChange?.(track, keyframe, 'add')
        
        return keyframe
    }
    
    removeKeyframe(trackId, keyframeId) {
        const track = this.tracks.find(t => t.id === trackId)
        if (!track) return
        
        const index = track.keyframes.findIndex(k => k.id === keyframeId)
        if (index > -1) {
            const keyframe = track.keyframes[index]
            track.keyframes.splice(index, 1)
            this.render()
            this.onKeyframeChange?.(track, keyframe, 'remove')
        }
    }
    
    addKeyframeAtCurrentTime() {
        if (this.tracks.length === 0) {
            this.addTrack({ name: 'Track 1' })
        }
        
        this.addKeyframe(this.tracks[0].id, this.currentTime, 0)
    }
    
    getValueAtTime(trackId, time) {
        const track = this.tracks.find(t => t.id === trackId)
        if (!track || track.keyframes.length === 0) return null
        
        if (track.keyframes.length === 1) {
            return track.keyframes[0].value
        }
        
        if (time <= track.keyframes[0].time) {
            return track.keyframes[0].value
        }
        
        if (time >= track.keyframes[track.keyframes.length - 1].time) {
            return track.keyframes[track.keyframes.length - 1].value
        }
        
        for (let i = 0; i < track.keyframes.length - 1; i++) {
            const k1 = track.keyframes[i]
            const k2 = track.keyframes[i + 1]
            
            if (time >= k1.time && time <= k2.time) {
                const t = (time - k1.time) / (k2.time - k1.time)
                const easedT = this.applyEasing(t, k1.easing)
                return k1.value + (k2.value - k1.value) * easedT
            }
        }
        
        return null
    }
    
    applyEasing(t, easing) {
        switch (easing) {
            case 'easeIn':
                return t * t
            case 'easeOut':
                return 1 - (1 - t) * (1 - t)
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
            case 'linear':
            default:
                return t
        }
    }
    
    updateTracksPanel() {
        const panel = this.container.querySelector('#tl-tracks-panel')
        panel.innerHTML = this.tracks.map(track => `
            <div class="timeline-track-header" data-track="${track.id}">
                <div class="timeline-track-color" style="background: ${track.color}"></div>
                <span>${track.name}</span>
            </div>
        `).join('')
    }
    
    setTime(time) {
        this.currentTime = Math.max(0, Math.min(this.duration, time))
        this.updateTimeDisplay()
        this.render()
        this.onTimeChange?.(this.currentTime)
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause()
        } else {
            this.play()
        }
    }
    
    play() {
        this.isPlaying = true
        this.lastFrameTime = performance.now()
        this.container.querySelector('#tl-play-btn').textContent = '⏸'
        this.container.querySelector('#tl-play-btn').classList.add('active')
        this.tick()
    }
    
    pause() {
        this.isPlaying = false
        this.container.querySelector('#tl-play-btn').textContent = '▶'
        this.container.querySelector('#tl-play-btn').classList.remove('active')
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId)
        }
    }
    
    tick() {
        if (!this.isPlaying) return
        
        const now = performance.now()
        const delta = (now - this.lastFrameTime) / 1000
        this.lastFrameTime = now
        
        this.currentTime += delta
        
        if (this.currentTime >= this.duration) {
            this.currentTime = 0
        }
        
        this.updateTimeDisplay()
        this.render()
        this.onTimeChange?.(this.currentTime)
        
        this.animationFrameId = requestAnimationFrame(() => this.tick())
    }
    
    goToStart() {
        this.setTime(0)
    }
    
    goToEnd() {
        this.setTime(this.duration)
    }
    
    prevFrame() {
        this.setTime(this.currentTime - 1 / this.fps)
    }
    
    nextFrame() {
        this.setTime(this.currentTime + 1 / this.fps)
    }
    
    updateTimeDisplay() {
        const display = this.container.querySelector('#tl-time-display')
        const mins = Math.floor(this.currentTime / 60)
        const secs = Math.floor(this.currentTime % 60)
        const ms = Math.floor((this.currentTime % 1) * 1000)
        display.textContent = `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        if (y < 24) {
            const time = this.screenToTime(x)
            this.setTime(time)
            this.dragging = { type: 'scrub' }
            return
        }
        
        const keyframe = this.getKeyframeAt(x, y)
        if (keyframe) {
            this.selectedKeyframes.clear()
            this.selectedKeyframes.add(keyframe.keyframe.id)
            this.dragging = {
                type: 'keyframe',
                track: keyframe.track,
                keyframe: keyframe.keyframe,
                startTime: keyframe.keyframe.time,
                startX: x
            }
            this.render()
        }
    }
    
    onMouseMove(e) {
        if (!this.dragging) return
        
        const rect = this.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        
        if (this.dragging.type === 'scrub') {
            const time = this.screenToTime(x)
            this.setTime(time)
        } else if (this.dragging.type === 'keyframe') {
            const deltaX = x - this.dragging.startX
            const deltaTime = deltaX / (this.zoom * 50)
            this.dragging.keyframe.time = Math.max(0, this.dragging.startTime + deltaTime)
            this.dragging.track.keyframes.sort((a, b) => a.time - b.time)
            this.render()
        }
    }
    
    onMouseUp() {
        if (this.dragging?.type === 'keyframe') {
            this.onKeyframeChange?.(this.dragging.track, this.dragging.keyframe, 'move')
        }
        this.dragging = null
    }
    
    onWheel(e) {
        e.preventDefault()
        if (e.ctrlKey) {
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            this.zoom = Math.max(0.5, Math.min(4, this.zoom * delta))
        } else {
            this.scrollX -= e.deltaX || e.deltaY
        }
        this.render()
    }
    
    screenToTime(x) {
        const pixelsPerSecond = this.zoom * 50
        return (x - this.scrollX) / pixelsPerSecond
    }
    
    timeToScreen(time) {
        const pixelsPerSecond = this.zoom * 50
        return time * pixelsPerSecond + this.scrollX
    }
    
    getKeyframeAt(x, y) {
        const trackHeight = 30
        const rulerHeight = 24
        
        for (let i = 0; i < this.tracks.length; i++) {
            const track = this.tracks[i]
            const trackY = rulerHeight + i * trackHeight
            
            if (y >= trackY && y < trackY + trackHeight) {
                for (const keyframe of track.keyframes) {
                    const kx = this.timeToScreen(keyframe.time)
                    if (Math.abs(x - kx) < 8) {
                        return { track, keyframe }
                    }
                }
            }
        }
        
        return null
    }
    
    resize() {
        const wrapper = this.container.querySelector('.timeline-canvas-wrapper')
        const rect = wrapper.getBoundingClientRect()
        this.canvas.width = rect.width * window.devicePixelRatio
        this.canvas.height = rect.height * window.devicePixelRatio
        this.canvas.style.width = rect.width + 'px'
        this.canvas.style.height = rect.height + 'px'
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        this.render()
    }
    
    render() {
        const ctx = this.ctx
        const w = this.canvas.width / window.devicePixelRatio
        const h = this.canvas.height / window.devicePixelRatio
        
        ctx.fillStyle = '#1a1a28'
        ctx.fillRect(0, 0, w, h)
        
        this.drawRuler(w)
        
        this.drawTracks(w, h)
        
        this.drawPlayhead(h)
    }
    
    drawRuler(width) {
        const ctx = this.ctx
        const pixelsPerSecond = this.zoom * 50
        
        ctx.fillStyle = '#252538'
        ctx.fillRect(0, 0, width, 24)
        
        ctx.strokeStyle = '#3d3d5c'
        ctx.lineWidth = 1
        
        const startTime = Math.floor(-this.scrollX / pixelsPerSecond)
        const endTime = Math.ceil((width - this.scrollX) / pixelsPerSecond)
        
        for (let t = Math.max(0, startTime); t <= Math.min(this.duration, endTime); t++) {
            const x = this.timeToScreen(t)
            
            ctx.beginPath()
            ctx.moveTo(x, 16)
            ctx.lineTo(x, 24)
            ctx.stroke()
            
            ctx.fillStyle = '#888'
            ctx.font = '10px Segoe UI'
            ctx.textAlign = 'center'
            ctx.fillText(`${t}s`, x, 12)
            
            for (let i = 1; i < 4; i++) {
                const subX = this.timeToScreen(t + i * 0.25)
                ctx.beginPath()
                ctx.moveTo(subX, 20)
                ctx.lineTo(subX, 24)
                ctx.stroke()
            }
        }
    }
    
    drawTracks(width, height) {
        const ctx = this.ctx
        const trackHeight = 30
        const rulerHeight = 24
        
        this.tracks.forEach((track, i) => {
            const y = rulerHeight + i * trackHeight
            
            if (i % 2 === 1) {
                ctx.fillStyle = '#1f1f30'
                ctx.fillRect(0, y, width, trackHeight)
            }
            
            ctx.strokeStyle = '#252538'
            ctx.beginPath()
            ctx.moveTo(0, y + trackHeight)
            ctx.lineTo(width, y + trackHeight)
            ctx.stroke()
            
            track.keyframes.forEach(keyframe => {
                const x = this.timeToScreen(keyframe.time)
                
                const isSelected = this.selectedKeyframes.has(keyframe.id)
                
                ctx.fillStyle = isSelected ? '#fff' : track.color
                ctx.beginPath()
                ctx.moveTo(x, y + 8)
                ctx.lineTo(x + 6, y + trackHeight / 2)
                ctx.lineTo(x, y + trackHeight - 8)
                ctx.lineTo(x - 6, y + trackHeight / 2)
                ctx.closePath()
                ctx.fill()
                
                if (isSelected) {
                    ctx.strokeStyle = track.color
                    ctx.lineWidth = 2
                    ctx.stroke()
                }
            })
        })
    }
    
    drawPlayhead(height) {
        const ctx = this.ctx
        const x = this.timeToScreen(this.currentTime)
        
        ctx.fillStyle = '#f43f5e'
        ctx.beginPath()
        ctx.moveTo(x - 6, 0)
        ctx.lineTo(x + 6, 0)
        ctx.lineTo(x + 6, 4)
        ctx.lineTo(x + 2, 12)
        ctx.lineTo(x + 2, height)
        ctx.lineTo(x - 2, height)
        ctx.lineTo(x - 2, 12)
        ctx.lineTo(x - 6, 4)
        ctx.closePath()
        ctx.fill()
    }
    
    open() {
        this.createPanel()
        this.container.classList.add('open')
        this.isOpen = true
        
        requestAnimationFrame(() => {
            this.resize()
        })
    }
    
    close() {
        this.pause()
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
    
    serialize() {
        return {
            duration: this.duration,
            fps: this.fps,
            tracks: this.tracks.map(track => ({
                id: track.id,
                name: track.name,
                property: track.property,
                color: track.color,
                keyframes: track.keyframes.map(k => ({
                    time: k.time,
                    value: k.value,
                    easing: k.easing
                }))
            }))
        }
    }
    
    deserialize(data) {
        this.duration = data.duration || 10
        this.fps = data.fps || 60
        this.tracks = []
        
        data.tracks?.forEach(trackData => {
            this.addTrack(trackData)
        })
        
        this.container.querySelector('#tl-duration').value = this.duration
        this.updateTracksPanel()
        this.render()
    }
    
    dispose() {
        this.pause()
        if (this.container?.parentNode) {
            this.container.parentNode.removeChild(this.container)
        }
    }
}

export const timeline = new Timeline()
export default Timeline
