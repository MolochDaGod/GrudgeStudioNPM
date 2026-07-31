# @grudge-studio/animator

Locomotion + weapon skill blending for Three.js mixers (duck-typed, no hard three import).

## Core APIs

| Export | Role |
|--------|------|
| `LocomotionCore` | Gait (idle/walk/run/sprint) + `playWeaponSkill` overlays |
| `AnimationDirector` | Lighter gait + one-shots (prefer LocomotionCore for combat) |
| `skillOnLocoWeights` | Layer weights while skill plays |
| `weaponSkillFromPayload` | Pack payload → `WeaponSkillDef` |
| `makeMeleeSkill` / `makeRangedSkill` / `makeMobilitySkill` / … | Factories |
| `gaitBlendFromSpeed` / directional helpers | Move blend |

## Weapon skills on locomotion

```ts
import {
  LocomotionCore,
  weaponSkillFromPayload,
  makeMeleeSkill,
} from "@grudge-studio/animator";
import {
  combatSkillKit,
  toWeaponSkillPayload,
} from "@grudge-studio/assets";

const loco = new LocomotionCore(mixer, { idle, walk, run }, {
  continuousGait: true,
  skillLocoRetain: 0.55,
});

// From pack catalog
const kit = combatSkillKit("mace_1h");
const entry = kit.find((s) => s.skillId === "mace_swing")!;
const def = weaponSkillFromPayload(loadedClip, toWeaponSkillPayload(entry));
loco.playWeaponSkill(def);

// Or factory
loco.playWeaponSkill(makeMeleeSkill("slash", clip, 2.5));

// Frame
loco.setGaitTarget(moving, speed01, sprint);
loco.update(dt);
// loco.skillState.inHitWindow → enable weapon collider
// loco.layerWeights → debug HUD
```

## Blend rules (SSOT)

Full doc: `@grudge-studio/assets` → `docs/WEAPON_SKILL_BLENDS.md`  
Profiles: `SKILL_BLEND_PROFILES` (melee_upper, finisher, mobility, block, reaction, …)

| Light melee | Heavy / finisher | Dash | Block |
|-------------|------------------|------|-------|
| upper 0.95, loco retain 0.55 | full body freeze | locomotionSkill | upper 0.85, walk ok |

Requires peer `three` when using real mixers. Load baked JSON same-origin first.
