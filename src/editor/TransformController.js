/*
    GRUDGE Engine - Transform Controller
    Mouse-based scale, move, rotate controls for editor
*/

import * as THREE from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

export class TransformController {
    constructor(camera, renderer, scene, options = {}) {
        this.camera = camera
        this.renderer = renderer
        this.scene = scene
        this.domElement = renderer.domElement
        
        this.selectedObject = null
        this.transformControls = null
        this.selectionHelper = null
        this.selectableObjects = []
        
        this.mode = 'translate'
        this.space = 'world'
        this.snap = options.snap || false
        this.snapTranslate = options.snapTranslate || 1
        this.snapRotate = options.snapRotate || Math.PI / 12
        this.snapScale = options.snapScale || 0.1
        
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        
        this.callbacks = {
            onSelect: options.onSelect || null,
            onDeselect: options.onDeselect || null,
            onChange: options.onChange || null,
            onModeChange: options.onModeChange || null
        }
        
        this.init()
    }
    
    init() {
        this.transformControls = new TransformControls(this.camera, this.domElement)
        this.transformControls.size = 0.8
        
        // TransformControls has a getHelper() method that returns the gizmo Object3D
        // In some Three.js versions, the controls itself isn't an Object3D
        if (this.transformControls.getHelper) {
            this.scene.add(this.transformControls.getHelper())
        } else {
            // Fallback for older Three.js versions where TransformControls extends Object3D
            this.scene.add(this.transformControls)
        }
        
        this.transformControls.addEventListener('change', () => {
            if (this.selectedObject && this.callbacks.onChange) {
                this.callbacks.onChange(this.selectedObject, {
                    position: this.selectedObject.position.clone(),
                    rotation: this.selectedObject.rotation.clone(),
                    scale: this.selectedObject.scale.clone()
                })
            }
        })
        
        this.transformControls.addEventListener('dragging-changed', (event) => {
            if (this.orbitControls) {
                this.orbitControls.enabled = !event.value
            }
        })
        
        this.createSelectionHelper()
        this.bindEvents()
    }
    
    createSelectionHelper() {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const edges = new THREE.EdgesGeometry(geometry)
        const material = new THREE.LineBasicMaterial({ 
            color: 0xff0000,
            linewidth: 3,
            depthTest: false,
            transparent: true
        })
        this.selectionHelper = new THREE.LineSegments(edges, material)
        this.selectionHelper.visible = false
        this.selectionHelper.renderOrder = 999
        this.scene.add(this.selectionHelper)
    }
    
    bindEvents() {
        this.domElement.addEventListener('click', (e) => this.onClick(e))
        
        window.addEventListener('keydown', (e) => this.onKeyDown(e))
    }
    
    onClick(event) {
        if (this.transformControls.dragging) return
        
        const rect = this.domElement.getBoundingClientRect()
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        
        this.raycaster.setFromCamera(this.mouse, this.camera)
        
        const intersects = this.raycaster.intersectObjects(this.selectableObjects, true)
        
        if (intersects.length > 0) {
            let target = intersects[0].object
            
            while (target.parent && !this.selectableObjects.includes(target)) {
                target = target.parent
            }
            
            if (this.selectableObjects.includes(target)) {
                this.select(target)
            }
        } else {
            this.deselect()
        }
    }
    
    onKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'g':
            case 'w':
                this.setMode('translate')
                break
            case 'r':
            case 'e':
                this.setMode('rotate')
                break
            case 's':
                if (!event.ctrlKey && !event.metaKey) {
                    this.setMode('scale')
                }
                break
            case 'x':
                this.toggleSpace()
                break
            case 'escape':
                this.deselect()
                break
            case 'delete':
            case 'backspace':
                if (this.selectedObject && this.callbacks.onDelete) {
                    this.callbacks.onDelete(this.selectedObject)
                }
                break
        }
    }
    
    setMode(mode) {
        if (['translate', 'rotate', 'scale'].includes(mode)) {
            this.mode = mode
            this.transformControls.setMode(mode)
            
            if (this.snap) {
                this.updateSnap()
            }
            
            if (this.callbacks.onModeChange) {
                this.callbacks.onModeChange(mode)
            }
        }
    }
    
    toggleSpace() {
        this.space = this.space === 'world' ? 'local' : 'world'
        this.transformControls.setSpace(this.space)
    }
    
    setSnap(enabled) {
        this.snap = enabled
        this.updateSnap()
    }
    
    updateSnap() {
        if (this.snap) {
            switch (this.mode) {
                case 'translate':
                    this.transformControls.setTranslationSnap(this.snapTranslate)
                    break
                case 'rotate':
                    this.transformControls.setRotationSnap(this.snapRotate)
                    break
                case 'scale':
                    this.transformControls.setScaleSnap(this.snapScale)
                    break
            }
        } else {
            this.transformControls.setTranslationSnap(null)
            this.transformControls.setRotationSnap(null)
            this.transformControls.setScaleSnap(null)
        }
    }
    
    addSelectableObject(object) {
        if (!this.selectableObjects.includes(object)) {
            this.selectableObjects.push(object)
        }
    }
    
    removeSelectableObject(object) {
        const index = this.selectableObjects.indexOf(object)
        if (index !== -1) {
            this.selectableObjects.splice(index, 1)
        }
        if (this.selectedObject === object) {
            this.deselect()
        }
    }
    
    clearSelectableObjects() {
        this.selectableObjects = []
        this.deselect()
    }
    
    select(object) {
        if (this.selectedObject === object) return
        
        if (this.selectedObject) {
            this.deselect()
        }
        
        this.selectedObject = object
        this.transformControls.attach(object)
        
        this.updateSelectionHelper()
        
        if (this.callbacks.onSelect) {
            this.callbacks.onSelect(object)
        }
    }
    
    deselect() {
        if (!this.selectedObject) return
        
        const wasSelected = this.selectedObject
        this.selectedObject = null
        this.transformControls.detach()
        this.selectionHelper.visible = false
        
        if (this.callbacks.onDeselect) {
            this.callbacks.onDeselect(wasSelected)
        }
    }
    
    updateSelectionHelper() {
        if (!this.selectedObject) {
            this.selectionHelper.visible = false
            return
        }
        
        const box = new THREE.Box3().setFromObject(this.selectedObject)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        
        this.selectionHelper.scale.copy(size)
        this.selectionHelper.position.copy(center)
        this.selectionHelper.visible = true
    }
    
    setOrbitControls(controls) {
        this.orbitControls = controls
    }
    
    getSelectedObject() {
        return this.selectedObject
    }
    
    getMode() {
        return this.mode
    }
    
    getSpace() {
        return this.space
    }
    
    isSnapEnabled() {
        return this.snap
    }
    
    enable() {
        this.transformControls.enabled = true
    }
    
    disable() {
        this.transformControls.enabled = false
        this.deselect()
    }
    
    dispose() {
        this.deselect()
        this.scene.remove(this.transformControls)
        this.scene.remove(this.selectionHelper)
        this.transformControls.dispose()
        this.selectionHelper.geometry.dispose()
        this.selectionHelper.material.dispose()
    }
}

export default TransformController
