# Why games don’t have the systems yet — and how to fix it

## Short answer

We **built** the quality system in `F:\GitHub\GrudgeStudioNPM` (`@grudge-studio/*` v0.3).  
Games **cannot install it from npm** yet, and most still run **local** animators / controllers / physics.

| Blocker | Status (2026-07-27) |
|---------|---------------------|
| **Published to registry** | **No** — `@grudge-studio/sdk` → **npm 404** |
| **npm login** | **No** — `whoami` → **401** |
| **Installed in games** | Almost none (Forge had optional check only) |
| **Full character controller in SDK** | **No** — host still owns Rapier capsule + camera |
| **Physics engine in SDK** | **Defaults + debug gate only** — WASM lives in the game |
| **Local forks** | Flare `PlayerAnimator`, animator lab, Island3D still parallel |

So the gap is not “we can’t design it” — it’s **publish → install → wire runtime** that never finished.

---

## What the SDK **is** vs **is not**

### Is (import these)

| Package | What you get in games |
|---------|------------------------|
| `@grudge-studio/assets` | Anim packs, Adio/Raidriar sources, `combatSkillKit`, blend profiles |
| `@grudge-studio/animator` | **`LocomotionCore`**, skill factories, directional/blend helpers |
| `@grudge-studio/character` | Deploy steps, strip hip-Y, **Mixamo/Raidriar → Bip001** rematch, state |
| `@grudge-studio/engine` | Boot hints, **PHYSICS_DEFAULTS**, `readPhysicsDebugGate`, runtime assert |
| `@grudge-studio/deploy` | QUALITY_SYSTEM, UUID deploy graph, checklist |
| `@grudge-studio/core` / `stack` | Login URLs, Vercel rewrites |

### Is not (still host-owned)

| Concern | Owner |
|---------|--------|
| `three` renderer + scene | Game |
| Rapier world / capsule controller | Game (`@dimforge/rapier3d-compat` or `@react-three/rapier`) |
| Camera (TPC sole writer) | Game |
| Loading GLB/JSON into mixer | Game (then feed clips into LocomotionCore) |
| Network / combat damage | Game + epicfight / fleet combat |

**Rule:** SDK = quality + animation SSOT + blend math.  
**Host** = Three + Rapier + input + deploy pipeline.

---

## Fix path (ordered)

### 1. Make packages installable (pick one)

**A. Publish (production)**

```powershell
# Interactive terminal — you complete browser login
npm login --auth-type=web
npm whoami
cd F:\GitHub\GrudgeStudioNPM
npm run build
npm run publish:all
```

Then in each game:

```bash
npm i @grudge-studio/sdk@^0.3.0 three@^0.185
# + rapier as already required
```

**B. Local file: deps (dev / now, no registry)**

```json
{
  "dependencies": {
    "@grudge-studio/sdk": "file:../../GrudgeStudioNPM/packages/sdk",
    "@grudge-studio/animator": "file:../../GrudgeStudioNPM/packages/animator",
    "@grudge-studio/assets": "file:../../GrudgeStudioNPM/packages/assets",
    "@grudge-studio/character": "file:../../GrudgeStudioNPM/packages/character",
    "@grudge-studio/engine": "file:../../GrudgeStudioNPM/packages/engine"
  }
}
```

Adjust relative path from each repo. Prefer **A** for Vercel/CI.

### 2. Wire animator (replace local gait directors)

```ts
import { LocomotionCore, weaponSkillFromPayload } from "@grudge-studio/animator";
import { combatSkillKit, toWeaponSkillPayload, getAnimPack } from "@grudge-studio/assets";

const loco = new LocomotionCore(mixer, { idle, walk, run }, { continuousGait: true });
const kit = combatSkillKit("sword_shield"); // + reactions + block + dash

// on skill key:
loco.playWeaponSkill(weaponSkillFromPayload(clip, toWeaponSkillPayload(entry)));

// frame:
loco.setGaitTarget(moving, speed01, sprint);
loco.update(dt);
// colliders: loco.skillState.weaponColliderActive
```

Delete or thin: Flare `PlayerAnimator`, lab-only directors that reimplement gait.

### 3. Wire physics (don’t reimplement engine)

```ts
import { PHYSICS_DEFAULTS, readPhysicsDebugGate } from "@grudge-studio/engine";

// gravity / step from PHYSICS_DEFAULTS
// debug = readPhysicsDebugGate()
// STILL: create Rapier world + character controller in host
```

Assert on deploy:

```ts
import { assertRuntimeHints } from "@grudge-studio/engine";
assertRuntimeHints(require("./package.json"));
```

### 4. Wire controller (SI + grounding)

Host keeps capsule controller. Use character package for:

- feet from **Box3**, not pelvis Y  
- `stripHipRootPositionTracks` on clips  
- `CHARACTER_SI` heights  

### 5. Deploy gate (every Vercel game)

```
[ ] npm has @grudge-studio/sdk (or file: in private monorepo)
[ ] three ~0.185 + Rapier present
[ ] LocomotionCore (or documented exception)
[ ] combatSkillKit for weapon loadout
[ ] PHYSICS_DEFAULTS + physicsDebug gate
[ ] stack rewrites for /api auth
[ ] No Flare/Adio/Raidriar mesh as hero
[ ] QUALITY_SYSTEM checklist green
```

### 6. Pilot order (recommended)

| Priority | Surface | Why |
|----------|---------|-----|
| P0 | **Forge** `game-forge` | Editor SSOT, already Rapier R3F |
| P1 | **Danger Room** / threejs-rapier | Canonical play controller |
| P2 | **grudge-character-animator** `/world` | Anim lab → LocomotionCore |
| P3 | warlord-genesis / Open | Fleet products |

---

## Mental model

```
┌─────────────────────────────────────────────────────────┐
│  GAME HOST (must stay)                                   │
│  three + Rapier + camera + input + loaders + Vercel     │
└────────────┬────────────────────────────────────────────┘
             │ imports
┌────────────▼────────────────────────────────────────────┐
│  @grudge-studio/* (must publish + install)               │
│  packs · LocomotionCore · blends · SI · deploy gates    │
└─────────────────────────────────────────────────────────┘
```

Until **publish + install + replace local gait**, games will keep “almost the same systems” twice.

---

## Immediate next commands

```powershell
# 1) You: npm login
npm login --auth-type=web

# 2) Publish monorepo
cd F:\GitHub\GrudgeStudioNPM
npm run build
npm run publish:all

# 3) Pilot install (Forge example)
cd F:\GitHub\Grudge-Studio-Forge\artifacts\game-forge
pnpm add @grudge-studio/sdk@^0.3.0
```

Or use **file:** deps from this doc until publish lands.
