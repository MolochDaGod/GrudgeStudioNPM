/*
    GRUDGE Editor - Placement Tool
    Place assets with grid snapping and terrain following
*/

import * as THREE from 'three'

export class PlacementTool {
    constructor(options = {}) {
        this.scene = options.scene
        this.terrain = options.terrain
        this.gridOverlay = options.gridOverlay
        this.assetPalette = options.assetPalette
        this.transformController = options.transformController
        
        this.isActive = false
        this.snapToGrid = true
        this.snapToTerrain = true
        this.randomRotation = false
        this.randomScale = false
        this.scaleRange = { min: 0.8, max: 1.2 }
        
        this.previewObject = null
        this.placedObjects = []
        
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        
        this.onObjectPlaced = null
    }
    
    setScene(scene) {
        this.scene = scene
    }
    
    setTerrain(terrain) {
        this.terrain = terrain
    }
    
    setGridOverlay(gridOverlay) {
        this.gridOverlay = gridOverlay
    }
    
    setAssetPalette(assetPalette) {
        this.assetPalette = assetPalette
    }
    
    setTransformController(transformController) {
        this.transformController = transformController
    }
    
    activate() {
        this.isActive = true
        this.updatePreview()
    }
    
    deactivate() {
        this.isActive = false
        this.clearPreview()
    }
    
    setSnapToGrid(enabled) {
        this.snapToGrid = enabled
    }
    
    setSnapToTerrain(enabled) {
        this.snapToTerrain = enabled
    }
    
    setRandomRotation(enabled) {
        this.randomRotation = enabled
    }
    
    setRandomScale(enabled, min = 0.8, max = 1.2) {
        this.randomScale = enabled
        this.scaleRange = { min, max }
    }
    
    async updatePreview() {
        this.clearPreview()
        
        if (!this.isActive || !this.assetPalette) return
        
        const selectedAsset = this.assetPalette.getSelectedAsset()
        if (!selectedAsset) return
        
        this.previewObject = await this.assetPalette.createAssetInstance(selectedAsset.id)
        
        if (this.previewObject) {
            this.previewObject.traverse(child => {
                if (child.isMesh) {
                    child.material = child.material.clone()
                    child.material.transparent = true
                    child.material.opacity = 0.5
                    child.material.depthWrite = false
                }
            })
            
            this.previewObject.visible = false
            this.scene.add(this.previewObject)
        }
    }
    
    clearPreview() {
        if (this.previewObject) {
            this.scene.remove(this.previewObject)
            this.previewObject.traverse(child => {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose())
                    } else {
                        child.material.dispose()
                    }
                }
            })
            this.previewObject = null
        }
    }
    
    onMouseMove(event, camera, canvas) {
        if (!this.isActive || !this.previewObject) return
        
        const rect = canvas.getBoundingClientRect()
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
        
        this.raycaster.setFromCamera(this.mouse, camera)
        
        const targets = []
        if (this.terrain && this.terrain.mesh) {
            targets.push(this.terrain.mesh)
        }
        
        if (this.gridOverlay) {
            const ground = new THREE.Mesh(
                new THREE.PlaneGeometry(200, 200),
                new THREE.MeshBasicMaterial()
            )
            ground.rotation.x = -Math.PI / 2
            ground.visible = false
            targets.push(ground)
        }
        
        const intersects = this.raycaster.intersectObjects(targets, true)
        
        if (intersects.length > 0) {
            let point = intersects[0].point.clone()
            
            if (this.snapToGrid && this.gridOverlay) {
                point = this.gridOverlay.snapToGrid(point)
            }
            
            if (this.snapToTerrain && this.terrain) {
                point.y = this.terrain.getHeightAt(point.x, point.z)
            }
            
            this.previewObject.position.copy(point)
            this.previewObject.visible = true
            
            if (this.gridOverlay) {
                this.gridOverlay.showHoverAt(point)
            }
        } else {
            this.previewObject.visible = false
            if (this.gridOverlay) {
                this.gridOverlay.hideHover()
            }
        }
    }
    
    async onMouseDown(event, camera, canvas) {
        if (!this.isActive) return false
        if (event.button !== 0) return false
        
        if (this.previewObject && this.previewObject.visible) {
            await this.placeObject()
            return true
        }
        
        return false
    }
    
    async placeObject() {
        if (!this.assetPalette) return
        
        const selectedAsset = this.assetPalette.getSelectedAsset()
        if (!selectedAsset) return
        
        const position = this.previewObject.position.clone()
        
        const newObject = await this.assetPalette.createAssetInstance(selectedAsset.id, position)
        
        if (!newObject) return
        
        if (this.randomRotation) {
            newObject.rotation.y = Math.random() * Math.PI * 2
        }
        
        if (this.randomScale) {
            const scale = this.scaleRange.min + Math.random() * (this.scaleRange.max - this.scaleRange.min)
            newObject.scale.multiplyScalar(scale)
        }
        
        this.scene.add(newObject)
        this.placedObjects.push(newObject)
        
        if (this.transformController) {
            this.transformController.addSelectableObject(newObject)
        }
        
        if (this.onObjectPlaced) {
            this.onObjectPlaced(newObject, selectedAsset)
        }
        
        console.log(`[PlacementTool] Placed ${selectedAsset.name} at`, position)
    }
    
    removePlacedObject(object) {
        const index = this.placedObjects.indexOf(object)
        if (index !== -1) {
            this.placedObjects.splice(index, 1)
            this.scene.remove(object)
            
            if (this.transformController) {
                this.transformController.removeSelectableObject(object)
            }
            
            object.traverse(child => {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose())
                    } else {
                        child.material.dispose()
                    }
                }
            })
        }
    }
    
    clearAllPlacedObjects() {
        while (this.placedObjects.length > 0) {
            this.removePlacedObject(this.placedObjects[0])
        }
    }
    
    getPlacedObjects() {
        return [...this.placedObjects]
    }
    
    exportPlacement() {
        return this.placedObjects.map(obj => ({
            assetId: obj.userData.assetId,
            position: obj.position.toArray(),
            rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
            scale: obj.scale.toArray()
        }))
    }
    
    async importPlacement(data) {
        for (const item of data) {
            if (!this.assetPalette) continue
            
            const position = new THREE.Vector3().fromArray(item.position)
            const object = await this.assetPalette.createAssetInstance(item.assetId, position)
            
            if (object) {
                object.rotation.set(...item.rotation)
                object.scale.fromArray(item.scale)
                
                this.scene.add(object)
                this.placedObjects.push(object)
                
                if (this.transformController) {
                    this.transformController.addSelectableObject(object)
                }
            }
        }
    }
    
    getSettings() {
        return {
            snapToGrid: this.snapToGrid,
            snapToTerrain: this.snapToTerrain,
            randomRotation: this.randomRotation,
            randomScale: this.randomScale,
            scaleRange: { ...this.scaleRange }
        }
    }
    
    dispose() {
        this.clearPreview()
        this.clearAllPlacedObjects()
    }
}

export default PlacementTool
