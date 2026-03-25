/*
    GRUDGE Studio - Animation System
    Universal animation and character system exports
*/

export { HumanoidProfile, validateSkeleton, createBoneMap } from './rig/HumanoidProfile.js'
export { QuadrupedProfile, validateQuadrupedSkeleton } from './rig/QuadrupedProfile.js'

export { RetargetingService, retargetingService } from './retarget/RetargetingService.js'

export { AnimatorComponent, DefaultCombatGraph } from './components/AnimatorComponent.js'

export { AnimationManifest, getClipsByCategory, getClipsByProfile, getPresetClips, getAllClips } from './AnimationManifest.js'
export { AnimationLoader, animationLoader } from './AnimationLoader.js'

export { UniversalCharacter, CharacterPresets, createCharacter } from './UniversalCharacter.js'

export { initializeRetargeting, isRetargetingReady } from './setupRetargeting.js'
