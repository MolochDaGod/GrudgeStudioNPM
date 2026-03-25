import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

export class AssetImporter {
    constructor() {
        this.gltfLoader = new GLTFLoader()
        this.fbxLoader = new FBXLoader()
        this.objLoader = new OBJLoader()
        this.mtlLoader = new MTLLoader()
        this.gltfExporter = new GLTFExporter()
    }

    getSupportedFormats() {
        return ['.glb', '.gltf', '.fbx', '.obj', '.json']
    }

    getAcceptString() {
        return '.glb,.gltf,.fbx,.obj,.json'
    }

    async importFromFile(file) {
        const ext = this.getExtension(file.name)
        const url = URL.createObjectURL(file)
        
        try {
            let result
            switch (ext) {
                case 'glb':
                case 'gltf':
                    result = await this.loadGLTF(url, file.name)
                    break
                case 'fbx':
                    result = await this.loadFBX(url, file.name)
                    break
                case 'obj':
                    result = await this.loadOBJ(url, file.name)
                    break
                case 'json':
                    result = await this.loadJSON(file)
                    break
                default:
                    throw new Error(`Unsupported format: .${ext}`)
            }
            
            URL.revokeObjectURL(url)
            return result
        } catch (error) {
            URL.revokeObjectURL(url)
            throw error
        }
    }

    getExtension(filename) {
        return filename.split('.').pop().toLowerCase()
    }

    async loadGLTF(url, filename) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    const model = gltf.scene
                    model.userData.assetName = filename.replace(/\.[^/.]+$/, '')
                    model.userData.assetId = 'imported_gltf'
                    model.userData.sourceFormat = 'gltf'
                    model.userData.animations = gltf.animations || []
                    
                    this.normalizeModel(model)
                    resolve({ type: 'model', object: model, animations: gltf.animations })
                },
                undefined,
                reject
            )
        })
    }

    async loadFBX(url, filename) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                url,
                (fbx) => {
                    fbx.userData.assetName = filename.replace(/\.[^/.]+$/, '')
                    fbx.userData.assetId = 'imported_fbx'
                    fbx.userData.sourceFormat = 'fbx'
                    fbx.userData.animations = fbx.animations || []
                    
                    this.normalizeModel(fbx)
                    resolve({ type: 'model', object: fbx, animations: fbx.animations })
                },
                undefined,
                reject
            )
        })
    }

    async loadOBJ(url, filename) {
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                url,
                (obj) => {
                    obj.userData.assetName = filename.replace(/\.[^/.]+$/, '')
                    obj.userData.assetId = 'imported_obj'
                    obj.userData.sourceFormat = 'obj'
                    
                    this.normalizeModel(obj)
                    resolve({ type: 'model', object: obj, animations: [] })
                },
                undefined,
                reject
            )
        })
    }

    async loadJSON(file) {
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (data.metadata && data.metadata.type === 'Object') {
            const loader = new THREE.ObjectLoader()
            const obj = loader.parse(data)
            obj.userData.assetName = file.name.replace(/\.[^/.]+$/, '')
            obj.userData.assetId = 'imported_json'
            obj.userData.sourceFormat = 'three_json'
            return { type: 'model', object: obj, animations: [] }
        }
        
        if (Array.isArray(data) || data.objects) {
            return { type: 'scene', data: data, filename: file.name }
        }
        
        throw new Error('Unknown JSON format')
    }

    normalizeModel(model) {
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        
        if (maxDim > 10) {
            const scale = 5 / maxDim
            model.scale.multiplyScalar(scale)
        } else if (maxDim < 0.1) {
            const scale = 1 / maxDim
            model.scale.multiplyScalar(scale)
        }
        
        box.setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(new THREE.Vector3(center.x, box.min.y, center.z))
        
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    async exportToGLB(object, filename = 'model.glb') {
        return new Promise((resolve, reject) => {
            this.gltfExporter.parse(
                object,
                (result) => {
                    const blob = new Blob([result], { type: 'application/octet-stream' })
                    this.downloadBlob(blob, filename)
                    resolve(blob)
                },
                reject,
                { binary: true }
            )
        })
    }

    async exportToGLTF(object, filename = 'model.gltf') {
        return new Promise((resolve, reject) => {
            this.gltfExporter.parse(
                object,
                (result) => {
                    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
                    this.downloadBlob(blob, filename)
                    resolve(blob)
                },
                reject,
                { binary: false }
            )
        })
    }

    async convertToGLB(object) {
        return new Promise((resolve, reject) => {
            this.gltfExporter.parse(
                object,
                (result) => {
                    const blob = new Blob([result], { type: 'application/octet-stream' })
                    resolve(blob)
                },
                reject,
                { binary: true }
            )
        })
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    showImportDialog(onImport) {
        const dialog = document.createElement('div')
        dialog.className = 'import-dialog-overlay'
        dialog.innerHTML = `
            <div class="import-dialog">
                <div class="import-header">
                    <h2>Import Asset</h2>
                    <button class="import-close">&times;</button>
                </div>
                <div class="import-body">
                    <div class="import-dropzone" id="import-dropzone">
                        <div class="dropzone-icon">📁</div>
                        <div class="dropzone-text">Drag & drop files here</div>
                        <div class="dropzone-hint">or click to browse</div>
                        <div class="dropzone-formats">Supported: GLB, GLTF, FBX, OBJ, JSON</div>
                        <input type="file" id="import-file-input" accept="${this.getAcceptString()}" multiple hidden>
                    </div>
                    <div class="import-preview" id="import-preview" style="display: none;">
                        <div class="preview-list" id="preview-list"></div>
                    </div>
                </div>
                <div class="import-footer">
                    <label class="import-option">
                        <input type="checkbox" id="import-convert-glb" checked>
                        <span>Convert to GLB format</span>
                    </label>
                    <div class="import-actions">
                        <button class="import-btn cancel" id="import-cancel">Cancel</button>
                        <button class="import-btn primary" id="import-confirm" disabled>Import</button>
                    </div>
                </div>
            </div>
        `
        
        document.body.appendChild(dialog)
        
        const dropzone = dialog.querySelector('#import-dropzone')
        const fileInput = dialog.querySelector('#import-file-input')
        const previewContainer = dialog.querySelector('#import-preview')
        const previewList = dialog.querySelector('#preview-list')
        const confirmBtn = dialog.querySelector('#import-confirm')
        const cancelBtn = dialog.querySelector('#import-cancel')
        const closeBtn = dialog.querySelector('.import-close')
        const convertCheckbox = dialog.querySelector('#import-convert-glb')
        
        let selectedFiles = []
        
        const updatePreview = () => {
            if (selectedFiles.length === 0) {
                previewContainer.style.display = 'none'
                dropzone.style.display = 'flex'
                confirmBtn.disabled = true
                return
            }
            
            previewContainer.style.display = 'block'
            dropzone.style.display = 'none'
            confirmBtn.disabled = false
            
            previewList.innerHTML = selectedFiles.map((file, i) => `
                <div class="preview-item">
                    <span class="preview-icon">${this.getFileIcon(file.name)}</span>
                    <span class="preview-name">${file.name}</span>
                    <span class="preview-size">${this.formatSize(file.size)}</span>
                    <button class="preview-remove" data-index="${i}">&times;</button>
                </div>
            `).join('')
            
            previewList.querySelectorAll('.preview-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    selectedFiles.splice(parseInt(e.target.dataset.index), 1)
                    updatePreview()
                })
            })
        }
        
        dropzone.addEventListener('click', () => fileInput.click())
        
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault()
            dropzone.classList.add('dragover')
        })
        
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover')
        })
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault()
            dropzone.classList.remove('dragover')
            selectedFiles = [...e.dataTransfer.files]
            updatePreview()
        })
        
        fileInput.addEventListener('change', () => {
            selectedFiles = [...fileInput.files]
            updatePreview()
        })
        
        const close = () => dialog.remove()
        
        closeBtn.addEventListener('click', close)
        cancelBtn.addEventListener('click', close)
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) close()
        })
        
        confirmBtn.addEventListener('click', async () => {
            const convertToGLB = convertCheckbox.checked
            confirmBtn.disabled = true
            confirmBtn.textContent = 'Importing...'
            
            try {
                for (const file of selectedFiles) {
                    const result = await this.importFromFile(file)
                    if (result.type === 'model' && convertToGLB && result.object.userData.sourceFormat !== 'gltf') {
                        result.glbBlob = await this.convertToGLB(result.object)
                    }
                    if (onImport) onImport(result)
                }
                close()
            } catch (error) {
                console.error('Import failed:', error)
                alert('Import failed: ' + error.message)
                confirmBtn.disabled = false
                confirmBtn.textContent = 'Import'
            }
        })
    }

    getFileIcon(filename) {
        const ext = this.getExtension(filename)
        const icons = {
            glb: '📦',
            gltf: '📦',
            fbx: '🎭',
            obj: '🔷',
            json: '📄'
        }
        return icons[ext] || '📁'
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }
}

export const assetImporter = new AssetImporter()
