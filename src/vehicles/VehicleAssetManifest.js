export const VehicleAssetManifest = {
  storageType: 'local',
  localBasePath: '/models/vehicles',
  objectStorageBasePath: '/public-objects/models/vehicles',
  
  vehicles: [
    {
      id: 'car',
      name: 'Sedan',
      filename: 'Car.glb',
      thumbnail: null,
      preset: 'sedan',
      description: 'Standard family sedan with balanced handling'
    },
    {
      id: 'car2',
      name: 'Compact Car',
      filename: 'Car-unqqkULtRU.glb',
      thumbnail: null,
      preset: 'sedan',
      description: 'Compact car with nimble handling'
    },
    {
      id: 'sportsCar',
      name: 'Sports Car',
      filename: 'SportsCar.glb',
      thumbnail: null,
      preset: 'sportsCar',
      description: 'High-performance sports car with excellent acceleration'
    },
    {
      id: 'sportsCar2',
      name: 'Sports Car GT',
      filename: 'SportsCar2.glb',
      thumbnail: null,
      preset: 'sportsCar',
      description: 'Grand touring sports car with top speed focus'
    },
    {
      id: 'suv',
      name: 'SUV',
      filename: 'SUV.glb',
      thumbnail: null,
      preset: 'suv',
      description: 'Sport utility vehicle with high ground clearance'
    },
    {
      id: 'taxi',
      name: 'Taxi',
      filename: 'Taxi.glb',
      thumbnail: null,
      preset: 'taxi',
      description: 'Classic yellow taxi cab'
    },
    {
      id: 'policeCar',
      name: 'Police Car',
      filename: 'PoliceCar.glb',
      thumbnail: null,
      preset: 'policeCar',
      description: 'Police interceptor with pursuit tuning'
    }
  ],

  getVehicle(id) {
    return this.vehicles.find(v => v.id === id)
  },

  getVehiclesByPreset(preset) {
    return this.vehicles.filter(v => v.preset === preset)
  },

  getAllVehicles() {
    return [...this.vehicles]
  },

  getPath(vehicle) {
    const basePath = this.storageType === 'objectStorage' 
      ? this.objectStorageBasePath 
      : this.localBasePath
    return `${basePath}/${vehicle.filename}`
  },

  getVehiclePath(id) {
    const vehicle = this.getVehicle(id)
    return vehicle ? this.getPath(vehicle) : null
  },

  setStorageType(type) {
    if (type === 'local' || type === 'objectStorage') {
      this.storageType = type
    }
  }
}

export default VehicleAssetManifest
