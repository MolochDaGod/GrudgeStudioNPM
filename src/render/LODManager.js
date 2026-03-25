import * as THREE from 'three'

export class LODManager {
    constructor(scene, camera) {
        this.scene = scene
        this.camera = camera
        this.lodObjects = new Map()
        this.updateInterval = 0.1
        this.lastUpdate = 0
        this.lodLevels = [
            { distance: 0, detail: 'high' },
            { distance: 15, detail: 'medium' },
            { distance: 40, detail: 'low' },
            { distance: 80, detail: 'culled' }
        ]
    }

    register(object, options = {}) {
        const lodData = {
            object,
            highDetail: options.highDetail || object,
            mediumDetail: options.mediumDetail || null,
            lowDetail: options.lowDetail || null,
            currentDetail: 'high',
            bounds: new THREE.Box3().setFromObject(object),
            frustumCulled: options.frustumCulled !== false
        }
        
        this.lodObjects.set(object.uuid, lodData)
        return lodData
    }

    registerWithAutoLOD(mesh, options = {}) {
        if (!mesh.geometry) return null

        const highDetail = mesh
        const mediumDetail = this.createReducedMesh(mesh, 0.5)
        const lowDetail = this.createReducedMesh(mesh, 0.25)

        const lodData = this.register(mesh, {
            highDetail,
            mediumDetail,
            lowDetail,
            ...options
        })

        return lodData
    }

    createReducedMesh(originalMesh, factor) {
        const geometry = originalMesh.geometry.clone()
        
        if (geometry.index) {
            const indexCount = geometry.index.count
            const newCount = Math.floor(indexCount * factor)
            geometry.setDrawRange(0, newCount)
        }

        const material = originalMesh.material.clone ? originalMesh.material.clone() : originalMesh.material
        const mesh = new THREE.Mesh(geometry, material)
        mesh.visible = false
        mesh.position.copy(originalMesh.position)
        mesh.rotation.copy(originalMesh.rotation)
        mesh.scale.copy(originalMesh.scale)
        
        return mesh
    }

    unregister(object) {
        return this.lodObjects.delete(object.uuid)
    }

    update(deltaTime) {
        this.lastUpdate += deltaTime
        if (this.lastUpdate < this.updateInterval) return
        this.lastUpdate = 0

        if (!this.camera) return

        const cameraPosition = this.camera.position
        const frustum = new THREE.Frustum()
        const projScreenMatrix = new THREE.Matrix4()
        projScreenMatrix.multiplyMatrices(
            this.camera.projectionMatrix,
            this.camera.matrixWorldInverse
        )
        frustum.setFromProjectionMatrix(projScreenMatrix)

        this.lodObjects.forEach((lodData, uuid) => {
            const { object, highDetail, mediumDetail, lowDetail, bounds, frustumCulled } = lodData
            
            if (!object.parent) {
                this.lodObjects.delete(uuid)
                return
            }

            bounds.setFromObject(object)
            
            if (frustumCulled && !frustum.intersectsBox(bounds)) {
                this.setDetail(lodData, 'culled')
                return
            }

            const center = bounds.getCenter(new THREE.Vector3())
            const distance = cameraPosition.distanceTo(center)

            let targetDetail = 'high'
            for (const level of this.lodLevels) {
                if (distance >= level.distance) {
                    targetDetail = level.detail
                }
            }

            this.setDetail(lodData, targetDetail)
        })
    }

    setDetail(lodData, detail) {
        if (lodData.currentDetail === detail) return

        const { object, highDetail, mediumDetail, lowDetail } = lodData

        highDetail.visible = false
        if (mediumDetail) mediumDetail.visible = false
        if (lowDetail) lowDetail.visible = false

        switch (detail) {
            case 'high':
                highDetail.visible = true
                break
            case 'medium':
                if (mediumDetail) {
                    mediumDetail.visible = true
                } else {
                    highDetail.visible = true
                }
                break
            case 'low':
                if (lowDetail) {
                    lowDetail.visible = true
                } else if (mediumDetail) {
                    mediumDetail.visible = true
                } else {
                    highDetail.visible = true
                }
                break
            case 'culled':
                break
        }

        lodData.currentDetail = detail
    }

    setLODLevels(levels) {
        this.lodLevels = levels.sort((a, b) => a.distance - b.distance)
    }

    getStats() {
        let high = 0, medium = 0, low = 0, culled = 0
        
        this.lodObjects.forEach(lodData => {
            switch (lodData.currentDetail) {
                case 'high': high++; break
                case 'medium': medium++; break
                case 'low': low++; break
                case 'culled': culled++; break
            }
        })

        return { high, medium, low, culled, total: this.lodObjects.size }
    }

    dispose() {
        this.lodObjects.forEach(lodData => {
            if (lodData.mediumDetail && lodData.mediumDetail !== lodData.highDetail) {
                lodData.mediumDetail.geometry?.dispose()
                lodData.mediumDetail.material?.dispose?.()
            }
            if (lodData.lowDetail && lodData.lowDetail !== lodData.highDetail) {
                lodData.lowDetail.geometry?.dispose()
                lodData.lowDetail.material?.dispose?.()
            }
        })
        this.lodObjects.clear()
    }
}
