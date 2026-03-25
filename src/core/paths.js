/*
    GRUDGE Engine - Path Resolution Utility
    Properly resolves asset paths for both dev and production (GitHub Pages)
*/

export function getAssetPath(path) {
    const base = import.meta.env.BASE_URL || '/'
    if (path.startsWith('/')) {
        return base.replace(/\/$/, '') + path
    }
    return base + path
}

export function getModelPath(modelName) {
    return getAssetPath(`/models/${modelName}`)
}

export const MODELS = {
    ARENA: 'arena.glb',
    GLADIATOR: 'gladiator.glb',
    GLADIATOR_POSE: 'gladiator-pose.glb',
    DRAGON: 'dragon.glb'
}

export default { getAssetPath, getModelPath, MODELS }
