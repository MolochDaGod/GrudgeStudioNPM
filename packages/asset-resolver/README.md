# @grudge-studio/asset-resolver

Canonical image/asset URL resolution for the Grudge Studio fleet.
**Cloudflare R2 (`assets.grudge-studio.com`) is the single source of truth for images.**

This package is the shared extraction of GrudgeBuilder's `assetConfig` / `iconResolver` /
`legacyAssetPaths` helpers, so every app resolves image URLs the same way instead of
copy-pasting the logic.

## Install

```bash
npm install @grudge-studio/asset-resolver
```

## Usage

```ts
import {
  assetUrl,
  resolveIconUrl,
  getPackIconForCategory,
  iconOnError,
  normalizeAssetPath,
  setAssetCdnBase,
} from "@grudge-studio/asset-resolver";

// Build a CDN URL for any image/sprite/audio/model path:
assetUrl("/backgrounds/general.png");
// => "https://assets.grudge-studio.com/backgrounds/general.png"

// Resolve an icon from arbitrary input (rewrites deprecated hosts, flattens
// legacy weapon paths, falls back to pack icons):
resolveIconUrl(item.icon, { category: "swords", weaponType: "Sword" });

// React <img> with automatic fallback on 404:
<img
  src={resolveIconUrl(item.icon, { category })}
  onError={(e) => iconOnError(e, { category })}
/>;
```

## Configuring the CDN origin

The origin defaults to `https://assets.grudge-studio.com`. It can be overridden:

1. **Environment variable** (Node, or a bundler that injects `process.env`):
   `VITE_ASSETS_URL`, `ASSETS_URL`, `VITE_ASSET_CDN_URL`, or `ASSET_CDN_BASE`.
2. **Runtime override** — call once at app startup. This is the recommended way for
   Vite/browser apps, since `import.meta.env` is not read inside the package:

   ```ts
   import { setAssetCdnBase } from "@grudge-studio/asset-resolver";
   setAssetCdnBase(import.meta.env.VITE_ASSETS_URL); // no-ops if undefined
   ```

## Canonical R2 image layout

`normalizeAssetPath()` maps legacy `/assets/*` paths onto this layout:

- `/icons/pack/...`, `/icons/weapons/<kebab>.png`, `/icons/sigils/...`
- `/backgrounds/...`, `/images/{events,misc,portraits,professions,ui,skill-icons}/...`
- `/sprites/...`, `/videos/...`

## Exports

- `assetUrl(path)`, `cdnAssetUrl(path)` — build a CDN URL for an asset path.
- `resolveIconUrl(urlOrPath, ctx?)` — resolve any icon reference to a working CDN URL.
- `getPackIconForCategory(ctx)` — deterministic pack-icon fallback.
- `iconOnError(event, ctx?)` — `<img onError>` handler that swaps to the fallback.
- `normalizeAssetPath(path)` — legacy `/assets/*` → canonical CDN path.
- `getAssetCdnBase()`, `setAssetCdnBase(url)`, `ASSET_CDN_BASE`, `DEFAULT_ASSET_CDN_BASE`.

## Build

```bash
npm run build      # tsup → dist/ (ESM + CJS + d.ts)
npm run typecheck  # tsc --noEmit
```
