/** Sample height from a row-major heightmap (game units). */
export function sampleHeightmap(
  heights: ArrayLike<number>,
  cols: number,
  rows: number,
  width: number,
  length: number,
  x: number,
  z: number,
): number {
  const halfW = width / 2;
  const halfL = length / 2;
  const u = (x + halfW) / width;
  const v = (z + halfL) / length;
  const c = Math.min(cols - 1, Math.max(0, Math.floor(u * (cols - 1))));
  const r = Math.min(rows - 1, Math.max(0, Math.floor(v * (rows - 1))));
  return heights[r * cols + c] ?? 0;
}

/** Physics layer names (Forge / genesis convention). */
export const PHYS_LAYERS = {
  Default: 0,
  Terrain: 1,
  Player: 2,
  NPC: 3,
  Item: 4,
  Projectile: 5,
  Trigger: 6,
  Water: 7,
  Ignore: 8,
} as const;
