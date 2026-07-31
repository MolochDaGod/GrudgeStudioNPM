import { getFleetUrls } from "@grudge-studio/core";

const CDN = () => getFleetUrls().assets;

/** Stylized nature packs — NEVER place whole multi-mesh GLB; isolate meshName. */
export const STYLIZED_NATURE = {
  vegetation: "models/nature/stylized/biome/nature_vegetation.glb",
  trees: "models/nature/stylized/biome/realistic_trees.glb",
  tropical: "models/nature/stylized/biome/tropical_plants.glb",
  volcanic: "models/nature/stylized/biome/volcanicnature.glb",
  snow: "models/nature/stylized/biome/snowbiomes.glb",
  rocks: "models/nature/stylized/rocks/stylised_rocks.glb",
  volcanicRocks: "models/nature/stylized/rocks/volcanic_rocks.glb",
  cliff: "models/nature/stylized/cliffs/stylized_cliff_face.glb",
  flowers: "models/nature/stylized/harvest/flowers_pack.glb",
  foliage: "models/nature/stylized/harvest/foliage_pack.glb",
  minerals: "models/nature/stylized/harvest/minerals_pack.glb",
  oreNodes: "models/nature/stylized/harvest/ore_nodes.glb",
} as const;

export function natureUrl(key: keyof typeof STYLIZED_NATURE): string {
  return `${CDN()}/${STYLIZED_NATURE[key]}`;
}

export const STYLIZED_VARIANTS = {
  rocks: ["Plain_Rock1", "Plain_Rock2", "Plain_Rock3", "Plain_Rock5", "Plain_Rock8"],
  oreNodes: ["Iron_Node", "Copper_Node", "Coal_Node", "Tin_Node"],
} as const;
