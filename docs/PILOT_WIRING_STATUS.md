# Pilot wiring status (2026-07-27)

## Done this pass

| Surface | Change |
|---------|--------|
| **Forge game-forge** | `file:` deps on all `@grudge-studio/*` packages |
| **Forge** | `src/lib/grudgeStudioFleet.ts` — LocomotionCore, combatSkillKit, physics gate |
| **Forge Viewport** | `<Physics debug={forgePhysicsDebugEnabled()}>` |
| **Forge animationLibrary** | Fleet skill keys + pointer to combatSkillKit |
| **Danger Room animator-app** | `file:` deps + `src/three/grudgeStudioFleet.ts` |
| **Docs** | `FLEET_INTEGRATION.md` |

## Install

```powershell
# Forge (from monorepo root or game-forge)
$env:CI = "true"
cd F:\GitHub\Grudge-Studio-Forge
pnpm install

# Verify
cd artifacts\game-forge
pnpm run grudge:sdk:check
```

```powershell
# Danger Room
$env:CI = "true"
cd F:\GitHub\threejs-rapier-react-three-controller\threejs-rapier-react-three-controller
pnpm install
```

## Still required for full runtime

1. **Call sites** — when character clips load, `createForgeLocomotion` / `createDangerLocomotion` + frame `setGaitTarget` / `update`.
2. **npm publish** — `npm login` then `cd F:\GitHub\GrudgeStudioNPM && npm run publish:all` for Vercel CI without `file:`.
3. **Character.ts (Danger Room)** — optional dual-path: keep existing blender API, add LocomotionCore when idle/walk/run present.
4. **EntityRenderer (Forge)** — agent clip map can prefer fleet pack roles.

## Smoke tests

| Test | How |
|------|-----|
| SDK import | `pnpm run grudge:sdk:check` in game-forge |
| Physics debug | Play mode + `?physicsDebug=1` → Rapier wireframes |
| Kit dump | `import { formatWeaponSkillAnimCatalog } from "@/lib/grudgeStudioFleet"` in console |
