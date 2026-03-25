/*
    GRUDGE Studio - Animation Manifest
    Central registry of all available animation clips with metadata
*/

export const AnimationManifest = {
    version: '1.0',
    
    clips: {
        idle: {
            id: 'idle',
            name: 'Idle',
            path: 'models/characters/spartan/Animations/Spartan@idle.fbx',
            category: 'locomotion',
            loop: true,
            duration: 2.0,
            supportsRootMotion: false,
            profile: 'humanoid'
        },
        walk: {
            id: 'walk',
            name: 'Walk',
            path: 'models/characters/spartan/Animations/Spartan@walk.fbx',
            category: 'locomotion',
            loop: true,
            duration: 1.0,
            supportsRootMotion: true,
            profile: 'humanoid'
        },
        run: {
            id: 'run',
            name: 'Run',
            path: 'models/characters/spartan/Animations/Spartan@run.fbx',
            category: 'locomotion',
            loop: true,
            duration: 0.8,
            supportsRootMotion: true,
            profile: 'humanoid'
        },
        jump: {
            id: 'jump',
            name: 'Jump',
            path: 'models/characters/spartan/Animations/Spartan@jump.fbx',
            category: 'locomotion',
            loop: false,
            duration: 1.2,
            supportsRootMotion: true,
            profile: 'humanoid'
        },
        attack_1: {
            id: 'attack_1',
            name: 'Attack 1',
            path: 'models/characters/spartan/Animations/Spartan@attack_1.fbx',
            category: 'combat',
            loop: false,
            duration: 1.0,
            supportsRootMotion: false,
            profile: 'humanoid',
            events: [
                { time: 0.3, name: 'hitStart' },
                { time: 0.5, name: 'hitEnd' }
            ]
        },
        attack_2: {
            id: 'attack_2',
            name: 'Attack 2',
            path: 'models/characters/spartan/Animations/Spartan@attack_2.fbx',
            category: 'combat',
            loop: false,
            duration: 1.2,
            supportsRootMotion: false,
            profile: 'humanoid',
            events: [
                { time: 0.4, name: 'hitStart' },
                { time: 0.6, name: 'hitEnd' }
            ]
        },
        block: {
            id: 'block',
            name: 'Block',
            path: 'models/characters/spartan/Animations/Spartan@block.fbx',
            category: 'combat',
            loop: true,
            duration: 0.5,
            supportsRootMotion: false,
            profile: 'humanoid'
        },
        hit_damage: {
            id: 'hit_damage',
            name: 'Hit Damage',
            path: 'models/characters/spartan/Animations/Spartan@hit_damage.fbx',
            category: 'reaction',
            loop: false,
            duration: 0.6,
            supportsRootMotion: false,
            profile: 'humanoid',
            additive: true
        },
        death: {
            id: 'death',
            name: 'Death',
            path: 'models/characters/spartan/Animations/Spartan@death.fbx',
            category: 'reaction',
            loop: false,
            duration: 2.0,
            supportsRootMotion: false,
            profile: 'humanoid'
        },
        base_pose_rotate: {
            id: 'base_pose_rotate',
            name: 'Base Pose Rotate',
            path: 'models/characters/spartan/Animations/Spartan@base_pose_rotate.fbx',
            category: 'utility',
            loop: true,
            duration: 4.0,
            supportsRootMotion: true,
            profile: 'humanoid'
        }
    },
    
    categories: {
        locomotion: {
            name: 'Locomotion',
            clips: ['idle', 'walk', 'run', 'jump']
        },
        combat: {
            name: 'Combat',
            clips: ['attack_1', 'attack_2', 'block']
        },
        reaction: {
            name: 'Reactions',
            clips: ['hit_damage', 'death']
        },
        utility: {
            name: 'Utility',
            clips: ['base_pose_rotate']
        }
    },
    
    presets: {
        combatCharacter: {
            name: 'Combat Character',
            clips: ['idle', 'walk', 'run', 'attack_1', 'attack_2', 'block', 'hit_damage', 'death']
        },
        locomotionOnly: {
            name: 'Locomotion Only',
            clips: ['idle', 'walk', 'run', 'jump']
        }
    }
}

export function getClipsByCategory(category) {
    const cat = AnimationManifest.categories[category]
    if (!cat) return []
    return cat.clips.map(id => AnimationManifest.clips[id])
}

export function getClipsByProfile(profile) {
    return Object.values(AnimationManifest.clips).filter(clip => clip.profile === profile)
}

export function getPresetClips(presetName) {
    const preset = AnimationManifest.presets[presetName]
    if (!preset) return []
    return preset.clips.map(id => AnimationManifest.clips[id])
}

export function getAllClips() {
    return Object.values(AnimationManifest.clips)
}
