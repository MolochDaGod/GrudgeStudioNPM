import * as THREE from 'three'

export class CombatFeedback {
    constructor(scene, camera) {
        this.scene = scene
        this.camera = camera
        this.damageNumbers = []
        this.hitEffects = []
        this.screenShakeIntensity = 0
        this.screenShakeDecay = 5
        this.originalCameraPosition = null
        this.comboCounter = 0
        this.comboTimer = 0
        this.comboTimeout = 2000
        this.onComboUpdate = null
    }

    triggerHit(position, damage, options = {}) {
        const {
            isCritical = false,
            damageType = 'physical',
            isBlocked = false,
            showNumber = true,
            showEffect = true,
            screenShake = true
        } = options

        if (showNumber) {
            this.spawnDamageNumber(position, damage, { isCritical, damageType, isBlocked })
        }

        if (showEffect) {
            this.spawnHitEffect(position, { isCritical, damageType })
        }

        if (screenShake && !isBlocked) {
            const intensity = isCritical ? 0.3 : 0.15
            this.triggerScreenShake(intensity)
        }

        if (!isBlocked && damage > 0) {
            this.comboCounter++
            this.comboTimer = this.comboTimeout
            if (this.onComboUpdate) {
                this.onComboUpdate(this.comboCounter)
            }
        }
    }

    spawnDamageNumber(position, damage, options = {}) {
        const { isCritical, damageType, isBlocked } = options

        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 64
        const ctx = canvas.getContext('2d')

        let text = isBlocked ? 'BLOCKED' : Math.round(damage).toString()
        let color = '#ffffff'
        let fontSize = isCritical ? 48 : 36

        if (isBlocked) {
            color = '#3b82f6'
            fontSize = 28
        } else if (isCritical) {
            color = '#fbbf24'
            text = damage + '!'
        } else {
            switch (damageType) {
                case 'fire': color = '#ef4444'; break
                case 'ice': color = '#38bdf8'; break
                case 'lightning': color = '#facc15'; break
                case 'nature': color = '#22c55e'; break
                case 'arcane': color = '#a855f7'; break
                default: color = '#ffffff'
            }
        }

        ctx.font = `bold ${fontSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 4
        ctx.strokeText(text, 64, 32)
        
        ctx.fillStyle = color
        ctx.fillText(text, 64, 32)

        const texture = new THREE.CanvasTexture(canvas)
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true,
            depthTest: false
        })
        const sprite = new THREE.Sprite(material)
        
        sprite.position.copy(position)
        sprite.position.y += 2
        sprite.position.x += (Math.random() - 0.5) * 0.5
        sprite.scale.set(1.5, 0.75, 1)

        this.scene.add(sprite)
        
        this.damageNumbers.push({
            sprite,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                3 + Math.random() * 2,
                (Math.random() - 0.5) * 2
            ),
            life: 1.5,
            gravity: -8
        })
    }

    spawnHitEffect(position, options = {}) {
        const { isCritical, damageType } = options

        let color = 0xffffff
        switch (damageType) {
            case 'fire': color = 0xff4444; break
            case 'ice': color = 0x44aaff; break
            case 'lightning': color = 0xffff44; break
            case 'nature': color = 0x44ff44; break
            case 'arcane': color = 0xaa44ff; break
        }

        const particleCount = isCritical ? 20 : 10
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)
        const velocities = []

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x
            positions[i * 3 + 1] = position.y + 1
            positions[i * 3 + 2] = position.z
            
            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 3 + 2,
                (Math.random() - 0.5) * 5
            ))
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const material = new THREE.PointsMaterial({
            color: color,
            size: isCritical ? 0.3 : 0.2,
            transparent: true,
            opacity: 1,
            depthTest: false
        })

        const particles = new THREE.Points(geometry, material)
        this.scene.add(particles)

        this.hitEffects.push({
            particles,
            velocities,
            life: 0.8,
            gravity: -15
        })

        const flashGeometry = new THREE.SphereGeometry(isCritical ? 0.8 : 0.5, 8, 8)
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        })
        const flash = new THREE.Mesh(flashGeometry, flashMaterial)
        flash.position.copy(position)
        flash.position.y += 1
        this.scene.add(flash)

        this.hitEffects.push({
            flash,
            life: 0.15,
            isFlash: true
        })
    }

    triggerScreenShake(intensity) {
        this.screenShakeIntensity = Math.max(this.screenShakeIntensity, intensity)
        if (!this.originalCameraPosition && this.camera) {
            this.originalCameraPosition = this.camera.position.clone()
        }
    }

    update(deltaTime) {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dn = this.damageNumbers[i]
            dn.life -= deltaTime
            
            dn.velocity.y += dn.gravity * deltaTime
            dn.sprite.position.add(dn.velocity.clone().multiplyScalar(deltaTime))
            
            dn.sprite.material.opacity = Math.max(0, dn.life / 1.5)
            
            if (dn.life <= 0) {
                this.scene.remove(dn.sprite)
                dn.sprite.material.map.dispose()
                dn.sprite.material.dispose()
                this.damageNumbers.splice(i, 1)
            }
        }

        for (let i = this.hitEffects.length - 1; i >= 0; i--) {
            const effect = this.hitEffects[i]
            effect.life -= deltaTime

            if (effect.isFlash) {
                effect.flash.scale.multiplyScalar(1.3)
                effect.flash.material.opacity -= deltaTime * 6
                
                if (effect.life <= 0) {
                    this.scene.remove(effect.flash)
                    effect.flash.geometry.dispose()
                    effect.flash.material.dispose()
                    this.hitEffects.splice(i, 1)
                }
            } else if (effect.particles) {
                const positions = effect.particles.geometry.attributes.position.array
                for (let j = 0; j < effect.velocities.length; j++) {
                    effect.velocities[j].y += effect.gravity * deltaTime
                    positions[j * 3] += effect.velocities[j].x * deltaTime
                    positions[j * 3 + 1] += effect.velocities[j].y * deltaTime
                    positions[j * 3 + 2] += effect.velocities[j].z * deltaTime
                }
                effect.particles.geometry.attributes.position.needsUpdate = true
                effect.particles.material.opacity = effect.life / 0.8

                if (effect.life <= 0) {
                    this.scene.remove(effect.particles)
                    effect.particles.geometry.dispose()
                    effect.particles.material.dispose()
                    this.hitEffects.splice(i, 1)
                }
            }
        }

        if (this.screenShakeIntensity > 0 && this.camera) {
            const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity
            const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity
            
            if (this.originalCameraPosition) {
                this.camera.position.x = this.originalCameraPosition.x + shakeX
                this.camera.position.y = this.originalCameraPosition.y + shakeY
            }
            
            this.screenShakeIntensity -= this.screenShakeDecay * deltaTime
            
            if (this.screenShakeIntensity <= 0) {
                this.screenShakeIntensity = 0
                if (this.originalCameraPosition) {
                    this.camera.position.copy(this.originalCameraPosition)
                    this.originalCameraPosition = null
                }
            }
        }

        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime * 1000
            if (this.comboTimer <= 0) {
                this.comboCounter = 0
                if (this.onComboUpdate) {
                    this.onComboUpdate(0)
                }
            }
        }
    }

    getComboCount() {
        return this.comboCounter
    }

    dispose() {
        this.damageNumbers.forEach(dn => {
            this.scene.remove(dn.sprite)
            dn.sprite.material.map.dispose()
            dn.sprite.material.dispose()
        })
        this.hitEffects.forEach(effect => {
            if (effect.particles) {
                this.scene.remove(effect.particles)
                effect.particles.geometry.dispose()
                effect.particles.material.dispose()
            }
            if (effect.flash) {
                this.scene.remove(effect.flash)
                effect.flash.geometry.dispose()
                effect.flash.material.dispose()
            }
        })
        this.damageNumbers = []
        this.hitEffects = []
    }
}
