# @grudge-studio/assets

CDN paths, anim pack registry, weapon skill blends, source provenance, debug helpers.

## Modules

| Module | Role |
|--------|------|
| `animSources` | Source roots (Unity, Adio, Raidriar, Flare clips-only, baked) |
| `animPacks` | Pack defs: clips, directional, skills |
| **`weaponSkillAnims`** | **Blend profiles + combatSkillKit + payloads** |
| `animDebug` | System report, skill catalog, blend HUD lines |
| `animPractices` | Debug / directional / blend / weapon-skill practices |
| `anims` | `bakedAnimUrl`, `normalizeAnimPackId`, `LOCO_BAKED` |

## Docs

- **[WEAPON_SKILL_BLENDS.md](./docs/WEAPON_SKILL_BLENDS.md)** — host loop, blend kinds, kill list

## Pipelines (do not cross skeletons)

1. **Mixamo → Bip001** — Unity FBX → retarget → strip hip-Y → `/anims/baked`
2. **b_MF → Bip001** — Raidriar Infinity Blade → `B_MF_TO_BIP001` → mace_1h / axe_1h
3. **OPB clips only** — Adio (pistol/xbow); no heroes
4. **KayKit clips only** — `anim/*` only; no heroes

## Weapon skills + blends

```ts
import {
  combatSkillKit,
  toWeaponSkillPayload,
  SKILL_BLEND_PROFILES,
  formatWeaponSkillAnimCatalog,
} from "@grudge-studio/assets";
import {
  LocomotionCore,
  weaponSkillFromPayload,
} from "@grudge-studio/animator";

const kit = combatSkillKit("sword_shield"); // + reactions + block + dash
console.log(formatWeaponSkillAnimCatalog("sword_shield"));

// Load clip for entry.candidates[0], then:
const def = weaponSkillFromPayload(clip, toWeaponSkillPayload(entry));
loco.playWeaponSkill(def);
```

| Blend kind | When |
|------------|------|
| `melee_upper` | Light attacks while moving |
| `melee_full` / `finisher` | Planted heavy / ultimate |
| `ranged` / `magic` | Fire / cast |
| `mobility` | Dash / dodge |
| `block` / `parry` | Defense |
| `reaction` | Hit / knock / fly / getup |

## Policy: clips only

Flare OPB skins, KayKit heroes, Adio mesh, Raidriar mesh → **animation harvest only**.  
Fleet playables = grudge6 **Bip001**.

## Packs (summary)

| id | Notes |
|----|-------|
| sword_shield | production baked |
| mace_1h / axe_1h | Raidriar retarget + Unity |
| pistol / crossbow | Adio |
| reactions / block / dash | shared via `combatSkillKit` |
| samurai / longbow / magic | Unity / partial bake |

## Debug

```ts
import { formatAnimDebugReport, formatPackSkillDebug } from "@grudge-studio/assets";
console.log(formatAnimDebugReport());
console.log(formatPackSkillDebug("mace_1h"));
```

## Bake

```ts
import { bakeJobsFromAnimRegistry } from "@grudge-studio/bake";
const jobs = bakeJobsFromAnimRegistry(["mace_1h", "axe_1h", "reactions", "block"]);
```
