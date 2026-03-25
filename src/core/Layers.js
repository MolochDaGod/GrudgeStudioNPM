export const Layers = {
  DEFAULT: 0,
  ARENA: 1,
  PLAYER: 2,
  MONSTERS: 3,
  UI: 4,
  EFFECTS: 5,
  MESH: 6,
  TEXTURE: 7
}

export const LayerMasks = {
  DEFAULT: 1 << Layers.DEFAULT,
  ARENA: 1 << Layers.ARENA,
  PLAYER: 1 << Layers.PLAYER,
  MONSTERS: 1 << Layers.MONSTERS,
  UI: 1 << Layers.UI,
  EFFECTS: 1 << Layers.EFFECTS,
  MESH: 1 << Layers.MESH,
  TEXTURE: 1 << Layers.TEXTURE,
  
  ALL: 0xFFFFFFFF,
  NONE: 0,
  
  COLLIDABLE: (1 << Layers.ARENA) | (1 << Layers.PLAYER) | (1 << Layers.MONSTERS),
  CHARACTERS: (1 << Layers.PLAYER) | (1 << Layers.MONSTERS)
}

export function setLayer(object3D, layer) {
  object3D.layers.set(layer)
}

export function enableLayer(object3D, layer) {
  object3D.layers.enable(layer)
}

export function disableLayer(object3D, layer) {
  object3D.layers.disable(layer)
}

export function setLayerRecursive(object3D, layer) {
  object3D.layers.set(layer)
  object3D.traverse((child) => {
    child.layers.set(layer)
  })
}
