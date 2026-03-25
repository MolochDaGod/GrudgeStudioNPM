import * as THREE from 'three'
import { modularCharacterSystem, BONE_HIERARCHY, BODY_SLOTS, STANDARD_ANIMATIONS } from './ModularCharacterSystem.js'

export class CharacterAssembler {
    constructor() {
        this.baseSkeleton = null
        this.mixer = null
        this.animations = new Map()
        this.currentAnimation = null
        this.attachedParts = new Map()
        this.group = new THREE.Group()
    }

    async assembleFromConfig(config) {
        this.group = new THREE.Group()
        this.group.name = config.name || 'ModularCharacter'
        
        if (config.base) {
            const baseData = await modularCharacterSystem.loadWithAnimations(config.base)
            this.group.add(baseData.scene)
            
            this.baseSkeleton = this.findSkeleton(baseData.scene)
            
            if (baseData.animations && baseData.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(baseData.scene)
                baseData.animations.forEach(clip => {
                    this.animations.set(clip.name.toLowerCase(), clip)
                })
            }
        }

        if (config.parts) {
            for (const [slot, partPath] of Object.entries(config.parts)) {
                await this.attachPart(slot, partPath)
            }
        }

        if (config.accessories) {
            for (const accessory of config.accessories) {
                await this.attachAccessory(accessory.slot, accessory.path, accessory.bone)
            }
        }

        if (config.scale) {
            this.group.scale.setScalar(config.scale)
        }

        if (config.position) {
            this.group.position.set(config.position.x, config.position.y, config.position.z)
        }

        return this.group
    }

    findSkeleton(scene) {
        let skeleton = null
        scene.traverse(child => {
            if (child.isSkinnedMesh && child.skeleton) {
                skeleton = child.skeleton
            }
        })
        return skeleton
    }

    findBone(boneName) {
        if (!this.baseSkeleton) return null
        
        for (const bone of this.baseSkeleton.bones) {
            if (bone.name === boneName || bone.name.includes(boneName)) {
                return bone
            }
        }
        return null
    }

    async attachPart(slot, partPath) {
        try {
            const partScene = await modularCharacterSystem.loadAsset(partPath)
            
            if (this.attachedParts.has(slot)) {
                const oldPart = this.attachedParts.get(slot)
                oldPart.parent?.remove(oldPart)
            }

            const targetBone = this.getSlotBone(slot)
            if (targetBone) {
                partScene.traverse(child => {
                    if (child.isSkinnedMesh && this.baseSkeleton) {
                        this.retargetSkinning(child, this.baseSkeleton)
                    }
                })
                
                targetBone.add(partScene)
            } else {
                this.group.add(partScene)
            }

            this.attachedParts.set(slot, partScene)
            return partScene
        } catch (error) {
            console.warn(`Failed to attach part ${slot}:`, error)
            return null
        }
    }

    async attachAccessory(slot, accessoryPath, boneName) {
        try {
            const accessory = await modularCharacterSystem.loadAsset(accessoryPath)
            
            const bone = this.findBone(boneName) || this.getSlotBone(slot)
            
            if (bone) {
                bone.add(accessory)
            } else {
                this.group.add(accessory)
            }

            const key = `${slot}_${boneName || 'root'}`
            this.attachedParts.set(key, accessory)
            
            return accessory
        } catch (error) {
            console.warn(`Failed to attach accessory:`, error)
            return null
        }
    }

    getSlotBone(slot) {
        const slotBoneMap = {
            [BODY_SLOTS.HEAD]: BONE_HIERARCHY.head,
            [BODY_SLOTS.TORSO]: BONE_HIERARCHY.spine2,
            [BODY_SLOTS.LEFT_ARM]: BONE_HIERARCHY.leftShoulder,
            [BODY_SLOTS.RIGHT_ARM]: BONE_HIERARCHY.rightShoulder,
            [BODY_SLOTS.LEFT_LEG]: BONE_HIERARCHY.leftUpLeg,
            [BODY_SLOTS.RIGHT_LEG]: BONE_HIERARCHY.rightUpLeg,
            [BODY_SLOTS.ACCESSORY_HEAD]: BONE_HIERARCHY.head,
            [BODY_SLOTS.ACCESSORY_BACK]: BONE_HIERARCHY.spine2,
            [BODY_SLOTS.WEAPON_RIGHT]: BONE_HIERARCHY.rightHand,
            [BODY_SLOTS.WEAPON_LEFT]: BONE_HIERARCHY.leftHand
        }

        const boneName = slotBoneMap[slot]
        return boneName ? this.findBone(boneName) : null
    }

    retargetSkinning(skinnedMesh, targetSkeleton) {
        const boneMapping = new Map()
        
        for (const bone of targetSkeleton.bones) {
            boneMapping.set(bone.name, bone)
        }

        const geometry = skinnedMesh.geometry
        if (!geometry.attributes.skinIndex || !geometry.attributes.skinWeight) {
            return
        }

        const newBones = []
        const originalSkeleton = skinnedMesh.skeleton
        
        for (const originalBone of originalSkeleton.bones) {
            const mappedBone = boneMapping.get(originalBone.name)
            newBones.push(mappedBone || originalBone)
        }

        skinnedMesh.skeleton = new THREE.Skeleton(newBones)
    }

    removePart(slot) {
        if (this.attachedParts.has(slot)) {
            const part = this.attachedParts.get(slot)
            part.parent?.remove(part)
            this.attachedParts.delete(slot)
            return true
        }
        return false
    }

    playAnimation(animationName, options = {}) {
        if (!this.mixer) return null

        const clip = this.animations.get(animationName.toLowerCase())
        if (!clip) {
            console.warn(`Animation not found: ${animationName}`)
            return null
        }

        if (this.currentAnimation) {
            this.currentAnimation.fadeOut(options.fadeTime || 0.3)
        }

        const action = this.mixer.clipAction(clip)
        action.reset()
        action.fadeIn(options.fadeTime || 0.3)
        action.setLoop(options.loop !== false ? THREE.LoopRepeat : THREE.LoopOnce)
        action.clampWhenFinished = options.clampWhenFinished || false
        action.play()

        this.currentAnimation = action
        return action
    }

    crossFade(fromAnim, toAnim, duration = 0.3) {
        const fromClip = this.animations.get(fromAnim.toLowerCase())
        const toClip = this.animations.get(toAnim.toLowerCase())
        
        if (!fromClip || !toClip || !this.mixer) return

        const fromAction = this.mixer.clipAction(fromClip)
        const toAction = this.mixer.clipAction(toClip)

        fromAction.crossFadeTo(toAction, duration, true)
        toAction.play()
        
        this.currentAnimation = toAction
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime)
        }
    }

    getAvailableAnimations() {
        return Array.from(this.animations.keys())
    }

    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction()
            this.mixer = null
        }

        this.attachedParts.forEach(part => {
            part.traverse(child => {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose())
                    } else {
                        child.material.dispose()
                    }
                }
            })
        })

        this.attachedParts.clear()
        this.animations.clear()
        this.group = null
    }
}

export async function createCharacterFromConfig(config) {
    const assembler = new CharacterAssembler()
    const character = await assembler.assembleFromConfig(config)
    return { character, assembler }
}
