# Grudge Studio NPM (`@grudge-studio/*`) — quality system

**One quality system** for baking, characters, NPCs, units, animation, engine, **Forge editor**, and **deployers**.

**Monorepo:** `F:\GitHub\GrudgeStudioNPM`  
**Editor / integration app:** [https://forge.grudge-studio.com](https://forge.grudge-studio.com)

---

## Architecture (0.3.0)

```
@grudge-studio/sdk                    ← install this (or slices)
├── core              fleet URLs, auth, game origins
├── asset-resolver    assetUrl / icons
├── assets            grudge6 paths, nature, baked anims, best practices
├── character         deploy steps, strip hip-Y motion, quality report
├── units             NPC + unit catalogs + spawn specs
├── bake              bake job contracts + quality gates
├── animator          AnimationDirector + battle clip maps
├── engine            boot, terrain, physics, runtime requirements
├── stack             Vercel rewrites, env keys
└── deploy            QUALITY_SYSTEM manifest + checklist (editor/deployer)
```

---

## Install

```bash
npm install @grudge-studio/sdk three @dimforge/rapier3d-compat
# or slices:
npm install @grudge-studio/character @grudge-studio/units @grudge-studio/bake @grudge-studio/deploy
```

---

## Quality system (one import)

```ts
import {
  QUALITY_SYSTEM,
  qualityChecklist,
  CHARACTER_DEPLOY_STEPS,
  stripPositionTracks,
  stripHipRootPositionTracks,
  DEFAULT_UNIT_CATALOG,
  DEFAULT_NPC_CATALOG,
  BAKE_QUALITY_GATES,
  recommendedBakeFlags,
  AnimationDirector,
  weaponToAnimPack,
  ASSET_BEST_PRACTICES,
  buildFleetSatelliteRewrites,
} from "@grudge-studio/sdk";

// Editor / CI
console.log(QUALITY_SYSTEM.version, QUALITY_SYSTEM.editorUrl);
qualityChecklist().forEach(console.log);

// Character motion (uniform grounded kits)
const clip = stripPositionTracks(rawClip); // no hip float

// Units / NPCs
const footman = DEFAULT_UNIT_CATALOG.find((u) => u.id === "unit.footman");

// Bake job defaults
const flags = recommendedBakeFlags("character_kit");
```

---

## Domain SSOT

| Domain | Package | Rule |
|--------|---------|------|
| **Bake** | `@grudge-studio/bake` | Jobs + gates; CLI still `grudge-convert` |
| **Character** | `@grudge-studio/character` | Deploy order, Box3 feet, strip position tracks |
| **NPC / unit** | `@grudge-studio/units` | Catalogs + spawn specs; same motion as heroes |
| **Anim blending** | `@grudge-studio/animator` | One AnimationDirector; gait + one-shots |
| **Editor** | Forge + `@grudge-studio/deploy` | No parallel editor SSOT |
| **Deployer** | `@grudge-studio/deploy` + `stack` | QUALITY_SYSTEM + rewrites |
| **Runtime 3D** | Host `three` + Rapier + `HUMAN_CCT` | SDK does not ship WASM; host `createCharacterController` |

---

## Hard rules (fleet)

1. **CDN** `assets.grudge-studio.com` + ObjectStore JSON  
2. **grudge6** Bip001 + mesh_ids equip — no Meshy/capsules  
3. **Motion** rotation-only on grounded kits; **never** pelvis.y as feet  
4. **Bake** character kits SI 1.8 m; anim packs strip hip/root position  
5. **Editor** = forge.grudge-studio.com  
6. **Games** import `@grudge-studio/*` — do not invent parallel character deploy helpers  

---

## Monorepo scripts

```bash
cd F:/GitHub/GrudgeStudioNPM
npm install
npm run build
npm run typecheck
# npm run publish:all
```

Build order: core → asset-resolver → assets → character → units → bake → engine → stack → animator → deploy → sdk

---

## Agent skill

`grudge-studio-npm` — load with `grudge-3d-game-packages`, `grudge6-full-stack`, `grudge-game-onboarding`.
