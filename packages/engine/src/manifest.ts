export interface EngineManifest {
  version: string;
  pipeline: {
    cdn: string;
    r2: Record<string, string>;
    d1?: Record<string, string>;
  };
  controllers: {
    id: string;
    worldScale: number;
    playerHeight: number;
    camFollow: number;
    fov: number;
  };
  terrain: {
    cellSize: number;
    ridgeHeight: number;
    corridorHalf: number;
    sampleRadius: number;
  };
}

export function createDefaultManifest(
  id = "grudge-game",
  cdn = "https://assets.grudge-studio.com",
): EngineManifest {
  return {
    version: "0.2.0",
    pipeline: {
      cdn,
      r2: {
        unitPalette: `${cdn}/models/units/Color_Palette.png`,
        grudge6: `${cdn}/models/grudge6/`,
      },
    },
    controllers: {
      id,
      worldScale: 1,
      playerHeight: 1.85,
      camFollow: 0.12,
      fov: 72,
    },
    terrain: {
      cellSize: 1.7,
      ridgeHeight: 5.2,
      corridorHalf: 5,
      sampleRadius: 2,
    },
  };
}
