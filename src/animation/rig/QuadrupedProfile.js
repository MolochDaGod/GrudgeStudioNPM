/*
    GRUDGE Studio - Quadruped Rig Profile
    Standard bone mapping for four-legged creatures (wolves, dogs, horses, etc.)
*/

export const QuadrupedProfile = {
    name: 'quadruped',
    version: '1.0',
    
    bones: {
        root: { required: true, aliases: ['Root', 'root', 'Armature', 'Skeleton'] },
        hips: { required: true, aliases: ['Hips', 'pelvis', 'Pelvis', 'Hip'] },
        spine: { required: true, aliases: ['Spine', 'spine', 'Spine1'] },
        spine1: { required: false, aliases: ['Spine1', 'Spine2', 'spine2'] },
        chest: { required: false, aliases: ['Chest', 'Spine2', 'Spine3'] },
        neck: { required: true, aliases: ['Neck', 'neck', 'Neck1'] },
        head: { required: true, aliases: ['Head', 'head'] },
        jaw: { required: false, aliases: ['Jaw', 'jaw', 'LowerJaw'] },
        
        tail: { required: false, aliases: ['Tail', 'tail', 'Tail1'] },
        tail1: { required: false, aliases: ['Tail1', 'Tail2', 'tail2'] },
        tail2: { required: false, aliases: ['Tail2', 'Tail3', 'tail3'] },
        
        frontLeftUpperLeg: { required: true, aliases: ['FrontLeftUpperLeg', 'L_FrontUpperLeg', 'Front_L_UpperLeg', 'L_Shoulder'] },
        frontLeftLowerLeg: { required: true, aliases: ['FrontLeftLowerLeg', 'L_FrontLowerLeg', 'Front_L_LowerLeg', 'L_Elbow'] },
        frontLeftFoot: { required: true, aliases: ['FrontLeftFoot', 'L_FrontFoot', 'Front_L_Foot', 'L_FrontPaw'] },
        
        frontRightUpperLeg: { required: true, aliases: ['FrontRightUpperLeg', 'R_FrontUpperLeg', 'Front_R_UpperLeg', 'R_Shoulder'] },
        frontRightLowerLeg: { required: true, aliases: ['FrontRightLowerLeg', 'R_FrontLowerLeg', 'Front_R_LowerLeg', 'R_Elbow'] },
        frontRightFoot: { required: true, aliases: ['FrontRightFoot', 'R_FrontFoot', 'Front_R_Foot', 'R_FrontPaw'] },
        
        backLeftUpperLeg: { required: true, aliases: ['BackLeftUpperLeg', 'L_BackUpperLeg', 'Back_L_UpperLeg', 'L_Hip'] },
        backLeftLowerLeg: { required: true, aliases: ['BackLeftLowerLeg', 'L_BackLowerLeg', 'Back_L_LowerLeg', 'L_Knee'] },
        backLeftFoot: { required: true, aliases: ['BackLeftFoot', 'L_BackFoot', 'Back_L_Foot', 'L_BackPaw'] },
        
        backRightUpperLeg: { required: true, aliases: ['BackRightUpperLeg', 'R_BackUpperLeg', 'Back_R_UpperLeg', 'R_Hip'] },
        backRightLowerLeg: { required: true, aliases: ['BackRightLowerLeg', 'R_BackLowerLeg', 'Back_R_LowerLeg', 'R_Knee'] },
        backRightFoot: { required: true, aliases: ['BackRightFoot', 'R_BackFoot', 'Back_R_Foot', 'R_BackPaw'] },
        
        leftEar: { required: false, aliases: ['LeftEar', 'L_Ear', 'Ear_L'] },
        rightEar: { required: false, aliases: ['RightEar', 'R_Ear', 'Ear_R'] }
    },
    
    restPose: {
        hipsHeight: 0.6,
        facing: 'z-forward',
        unitScale: 1.0
    },
    
    masks: {
        fullBody: ['root', 'hips', 'spine', 'spine1', 'chest', 'neck', 'head', 'jaw',
            'tail', 'tail1', 'tail2',
            'frontLeftUpperLeg', 'frontLeftLowerLeg', 'frontLeftFoot',
            'frontRightUpperLeg', 'frontRightLowerLeg', 'frontRightFoot',
            'backLeftUpperLeg', 'backLeftLowerLeg', 'backLeftFoot',
            'backRightUpperLeg', 'backRightLowerLeg', 'backRightFoot'],
        body: ['hips', 'spine', 'spine1', 'chest', 'neck', 'head'],
        frontLegs: ['frontLeftUpperLeg', 'frontLeftLowerLeg', 'frontLeftFoot',
            'frontRightUpperLeg', 'frontRightLowerLeg', 'frontRightFoot'],
        backLegs: ['backLeftUpperLeg', 'backLeftLowerLeg', 'backLeftFoot',
            'backRightUpperLeg', 'backRightLowerLeg', 'backRightFoot'],
        tail: ['tail', 'tail1', 'tail2']
    }
}

export function validateQuadrupedSkeleton(skeleton) {
    const result = {
        valid: true,
        mappedBones: {},
        missingRequired: [],
        missingOptional: [],
        unmappedBones: []
    }
    
    const boneNames = new Set()
    skeleton.bones.forEach(bone => boneNames.add(bone.name))
    
    for (const [canonicalName, config] of Object.entries(QuadrupedProfile.bones)) {
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
    
    return result
}
