/*
    GRUDGE Studio - Humanoid Rig Profile
    Standard bone mapping for humanoid characters (Mixamo/Unity compatible)
*/

export const HumanoidProfile = {
    name: 'humanoid',
    version: '1.0',
    
    bones: {
        hips: { required: true, aliases: ['Hips', 'pelvis', 'Pelvis', 'root', 'Root', 'mixamorig:Hips'] },
        spine: { required: true, aliases: ['Spine', 'spine1', 'Spine1', 'mixamorig:Spine'] },
        spine1: { required: false, aliases: ['Spine1', 'spine2', 'Spine2', 'mixamorig:Spine1'] },
        spine2: { required: false, aliases: ['Spine2', 'chest', 'Chest', 'mixamorig:Spine2'] },
        chest: { required: false, aliases: ['Chest', 'UpperChest', 'mixamorig:Chest'] },
        neck: { required: true, aliases: ['Neck', 'neck', 'mixamorig:Neck'] },
        head: { required: true, aliases: ['Head', 'head', 'mixamorig:Head'] },
        
        leftShoulder: { required: false, aliases: ['LeftShoulder', 'L_Shoulder', 'shoulder_L', 'mixamorig:LeftShoulder'] },
        leftUpperArm: { required: true, aliases: ['LeftUpperArm', 'L_UpperArm', 'upperarm_L', 'mixamorig:LeftArm'] },
        leftLowerArm: { required: true, aliases: ['LeftLowerArm', 'L_LowerArm', 'forearm_L', 'mixamorig:LeftForeArm'] },
        leftHand: { required: true, aliases: ['LeftHand', 'L_Hand', 'hand_L', 'mixamorig:LeftHand'] },
        
        rightShoulder: { required: false, aliases: ['RightShoulder', 'R_Shoulder', 'shoulder_R', 'mixamorig:RightShoulder'] },
        rightUpperArm: { required: true, aliases: ['RightUpperArm', 'R_UpperArm', 'upperarm_R', 'mixamorig:RightArm'] },
        rightLowerArm: { required: true, aliases: ['RightLowerArm', 'R_LowerArm', 'forearm_R', 'mixamorig:RightForeArm'] },
        rightHand: { required: true, aliases: ['RightHand', 'R_Hand', 'hand_R', 'mixamorig:RightHand'] },
        
        leftUpperLeg: { required: true, aliases: ['LeftUpperLeg', 'L_UpperLeg', 'thigh_L', 'mixamorig:LeftUpLeg'] },
        leftLowerLeg: { required: true, aliases: ['LeftLowerLeg', 'L_LowerLeg', 'shin_L', 'mixamorig:LeftLeg'] },
        leftFoot: { required: true, aliases: ['LeftFoot', 'L_Foot', 'foot_L', 'mixamorig:LeftFoot'] },
        leftToes: { required: false, aliases: ['LeftToes', 'L_Toes', 'toe_L', 'mixamorig:LeftToeBase'] },
        
        rightUpperLeg: { required: true, aliases: ['RightUpperLeg', 'R_UpperLeg', 'thigh_R', 'mixamorig:RightUpLeg'] },
        rightLowerLeg: { required: true, aliases: ['RightLowerLeg', 'R_LowerLeg', 'shin_R', 'mixamorig:RightLeg'] },
        rightFoot: { required: true, aliases: ['RightFoot', 'R_Foot', 'foot_R', 'mixamorig:RightFoot'] },
        rightToes: { required: false, aliases: ['RightToes', 'R_Toes', 'toe_R', 'mixamorig:RightToeBase'] }
    },
    
    restPose: {
        hipsHeight: 1.0,
        armSpread: 45,
        facing: 'z-forward',
        unitScale: 1.0
    },
    
    masks: {
        fullBody: ['hips', 'spine', 'spine1', 'spine2', 'chest', 'neck', 'head',
            'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand',
            'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand',
            'leftUpperLeg', 'leftLowerLeg', 'leftFoot', 'leftToes',
            'rightUpperLeg', 'rightLowerLeg', 'rightFoot', 'rightToes'],
        upperBody: ['spine', 'spine1', 'spine2', 'chest', 'neck', 'head',
            'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand',
            'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'],
        lowerBody: ['hips', 'leftUpperLeg', 'leftLowerLeg', 'leftFoot', 'leftToes',
            'rightUpperLeg', 'rightLowerLeg', 'rightFoot', 'rightToes'],
        leftArm: ['leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand'],
        rightArm: ['rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'],
        arms: ['leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand',
            'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'],
        legs: ['leftUpperLeg', 'leftLowerLeg', 'leftFoot', 'leftToes',
            'rightUpperLeg', 'rightLowerLeg', 'rightFoot', 'rightToes']
    }
}

export function validateSkeleton(skeleton, profile = HumanoidProfile) {
    const result = {
        valid: true,
        mappedBones: {},
        missingRequired: [],
        missingOptional: [],
        unmappedBones: []
    }
    
    const boneNames = new Set()
    skeleton.bones.forEach(bone => {
        boneNames.add(bone.name)
    })
    
    for (const [canonicalName, config] of Object.entries(profile.bones)) {
        let found = false
        for (const alias of config.aliases) {
            if (boneNames.has(alias)) {
                result.mappedBones[canonicalName] = alias
                found = true
                break
            }
        }
        
        if (!found) {
            if (config.required) {
                result.missingRequired.push(canonicalName)
                result.valid = false
            } else {
                result.missingOptional.push(canonicalName)
            }
        }
    }
    
    const mappedAliases = new Set(Object.values(result.mappedBones))
    skeleton.bones.forEach(bone => {
        if (!mappedAliases.has(bone.name)) {
            result.unmappedBones.push(bone.name)
        }
    })
    
    return result
}

export function createBoneMap(skeleton, profile = HumanoidProfile) {
    const validation = validateSkeleton(skeleton, profile)
    if (!validation.valid) {
        console.warn('[HumanoidProfile] Skeleton validation failed:', validation.missingRequired)
    }
    
    const boneMap = new Map()
    
    skeleton.bones.forEach((bone, index) => {
        for (const [canonicalName, config] of Object.entries(profile.bones)) {
            if (config.aliases.includes(bone.name)) {
                boneMap.set(canonicalName, { bone, index, originalName: bone.name })
                break
            }
        }
    })
    
    return boneMap
}
