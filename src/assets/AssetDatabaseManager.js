import assetData from './AssetDatabase.json'

export class AssetDatabaseManager {
  constructor() {
    this.database = assetData
    this.assets = new Map()
    this.animations = new Map()
    this.categories = this.database.categories
    
    this._indexAssets()
  }
  
  _indexAssets() {
    for (const asset of this.database.assets) {
      this.assets.set(asset.id, asset)
    }
    for (const anim of this.database.animations) {
      this.animations.set(anim.id, anim)
    }
  }
  
  getAssetById(id) {
    return this.assets.get(id) || this.animations.get(id)
  }
  
  getAssetsByCategory(category) {
    return this.database.assets.filter(a => a.category === category)
  }
  
  getAssetsByTag(tag) {
    const results = []
    for (const asset of this.database.assets) {
      if (asset.tags && asset.tags.includes(tag)) {
        results.push(asset)
      }
    }
    return results
  }
  
  searchAssets(query) {
    const q = query.toLowerCase()
    return this.database.assets.filter(asset => {
      return asset.name.toLowerCase().includes(q) ||
             asset.description.toLowerCase().includes(q) ||
             (asset.tags && asset.tags.some(t => t.includes(q)))
    })
  }
  
  getAIUseCasesForAsset(id) {
    const asset = this.getAssetById(id)
    return asset?.aiUseCases || null
  }
  
  getAssetsForAICapability(capability) {
    const cap = this.database.aiCapabilities[capability]
    if (!cap) return []
    
    return cap.supportedAssets.map(id => this.assets.get(id)).filter(Boolean)
  }
  
  getTrainingSuitableAssets() {
    return this.database.assets.filter(asset => 
      asset.aiUseCases?.trainingData?.suitable === true
    )
  }
  
  getAssetPath(id) {
    const asset = this.getAssetById(id)
    return asset?.path || null
  }
  
  getAllCharacters() {
    return this.getAssetsByCategory('characters')
  }
  
  getAllVehicles() {
    return this.getAssetsByCategory('vehicles')
  }
  
  getAllAnimations() {
    return Array.from(this.animations.values())
  }
  
  getAnimationsForCharacter(characterType) {
    return this.database.animations.filter(anim => 
      anim.tags.includes(characterType.toLowerCase())
    )
  }
  
  getCombatAssets() {
    return this.database.assets.filter(asset =>
      asset.tags?.includes('combat') || 
      asset.tags?.includes('fighter') ||
      asset.tags?.includes('warrior')
    )
  }
  
  getAssetStats(id) {
    const asset = this.getAssetById(id)
    return asset?.stats || null
  }
  
  getAssetPhysics(id) {
    const asset = this.getAssetById(id)
    return asset?.physics || null
  }
  
  generateAIPrompt(assetId) {
    const asset = this.getAssetById(assetId)
    if (!asset) return null
    
    const aiInfo = asset.aiUseCases
    if (!aiInfo) return null
    
    return {
      context: `Asset: ${asset.name} (${asset.category})`,
      description: asset.description,
      primaryUseCase: aiInfo.primary,
      applications: aiInfo.applications,
      suggestedPrompt: `Create an AI behavior for a ${asset.name} that ${aiInfo.primary.toLowerCase()}. Consider: ${aiInfo.applications.slice(0, 2).join(', ')}.`
    }
  }
  
  getSummary() {
    return {
      version: this.database.version,
      lastUpdated: this.database.lastUpdated,
      totalAssets: this.database.assets.length,
      totalAnimations: this.database.animations.length,
      categories: Object.keys(this.database.categories),
      aiCapabilities: Object.keys(this.database.aiCapabilities)
    }
  }
  
  toJSON() {
    return this.database
  }
  
  exportForAI() {
    return {
      summary: this.getSummary(),
      assets: this.database.assets.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        description: a.description,
        aiUseCases: a.aiUseCases,
        tags: a.tags
      })),
      animations: this.database.animations.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        aiUseCases: a.aiUseCases
      })),
      aiCapabilities: this.database.aiCapabilities
    }
  }
}

export const assetDatabase = new AssetDatabaseManager()

export default assetDatabase
