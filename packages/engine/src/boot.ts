import type { EngineManifest } from "./manifest";

export interface EngineBootState<M extends EngineManifest = EngineManifest> {
  ready: boolean;
  manifest: M;
  cdnReachable: boolean;
  bootedAt: number;
}

export function createEngineBoot<M extends EngineManifest>(
  manifest: M,
  options: { cacheKey?: string; cacheTtlMs?: number; probeUrl?: string } = {},
) {
  const cacheKey = options.cacheKey ?? `engine_boot_${manifest.controllers.id}`;
  const cacheTtlMs = options.cacheTtlMs ?? 3_600_000;
  const probeUrl =
    options.probeUrl ??
    manifest.pipeline.r2.unitPalette ??
    `${manifest.pipeline.cdn}/`;

  let state: EngineBootState<M> = {
    ready: false,
    manifest,
    cdnReachable: false,
    bootedAt: 0,
  };

  async function bootEngine(): Promise<EngineBootState<M>> {
    let cdnReachable = false;
    try {
      const res = await fetch(probeUrl, { method: "HEAD", mode: "cors" });
      cdnReachable = res.ok;
    } catch {
      cdnReachable = false;
    }
    state = {
      ready: true,
      manifest,
      cdnReachable,
      bootedAt: Date.now(),
    };
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(cacheKey, JSON.stringify(state));
      }
    } catch {
      /* ignore */
    }
    void cacheTtlMs;
    return state;
  }

  function getEngine(): EngineBootState<M> {
    return state;
  }

  return { bootEngine, getEngine };
}
