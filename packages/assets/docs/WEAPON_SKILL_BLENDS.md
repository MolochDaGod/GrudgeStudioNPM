# Weapon skill animations & blends

SSOT for fleet games: pack skills + blend profiles → `LocomotionCore.playWeaponSkill`.

## Architecture

```
anim pack (getAnimPack)
  └─ skills[]  SkillClipDef (clip candidates + flags)
        └─ resolveSkillBlendProfile / SKILL_BLEND_PROFILES
              └─ WeaponSkillAnimEntry / toWeaponSkillPayload
                    └─ load clip (FBX bake / GLB harvest)
                          └─ weaponSkillFromPayload(clip, payload)
                                └─ LocomotionCore.playWeaponSkill
                                      └─ skillOnLocoWeights each frame
```

## Blend kinds

| Kind | Loco | Upper weight | Use |
|------|------|--------------|-----|
| `melee_upper` | retain ~0.55 | 0.95 | Slash / chop while moving |
| `melee_full` | freeze ~0.12 | 1.0 | Heavy swing, plant feet |
| `finisher` | freeze | 1.0 | Spin / slam / ultimate |
| `ranged` | freeze | 1.0 | Bow / pistol / xbow fire |
| `magic` | freeze | 1.0 | Cast |
| `mobility` | freeze | 1.0 | Dash / dodge / roll |
| `block` | retain ~0.65 | 0.85 | Hold block |
| `parry` | freeze | 1.0 | Timed parry window |
| `reaction` | freeze | 1.0 | Hit / knock / fly / getup |

Do **not** invent new retain numbers per game — extend `SKILL_BLEND_PROFILES`.

## Host loop (required)

```ts
import {
  combatSkillKit,
  toWeaponSkillPayload,
  getAnimPack,
} from "@grudge-studio/assets";
import {
  LocomotionCore,
  weaponSkillFromPayload,
  previewSkillLayerWeights,
} from "@grudge-studio/animator";

// 1) Loco core with idle/walk/run clips
const loco = new LocomotionCore(mixer, { idle, walk, run }, { continuousGait: true });

// 2) Kit = weapon + reactions + block + dash
const kit = combatSkillKit("sword_shield"); // or mace_1h, pistol, …

// 3) On input skill N: resolve clip then play
function fireSkill(entry, clip) {
  const payload = toWeaponSkillPayload(entry);
  const def = weaponSkillFromPayload(clip, payload);
  // optional: loco.options skillLocoRetain = payload.skillLocoRetain
  loco.playWeaponSkill(def);
}

// 4) Each frame
loco.setGaitTarget(moving, speed01, sprinting);
loco.update(dt);
// colliders: loco.skillState.weaponColliderActive && skillState.inHitWindow
// state: applyLocoSnapshot(charState, loco.skillState, { speed01, sprinting })
```

## Practices

1. **Base layer = locomotion** always; skills are overlays.
2. **Hit window** drives colliders — not the full clip.
3. **melee_upper** for light attacks so run-slash looks good.
4. **finisher / mobility / reaction** full-body; cancel gait.
5. **Shared kit**: every weapon pack should use `combatSkillKit` so knockback/block/dash exist.
6. **Clip load order**: baked JSON (Bip001) → Adio/Raidriar harvest → Unity FBX after retarget.
7. **Debug**: `formatWeaponSkillAnimCatalog()`, `describeSkillBlend(entry)`, `formatLayerWeights(loco.layerWeights)`.

## Pack → hotbar skills

| Pack | Primary skills |
|------|----------------|
| sword_shield | ss_slash, ss_slash2 |
| mace_1h | mace_swing, mace_slam (+ Raidriar) |
| axe_1h | axe_chop, axe_finisher |
| samurai | samurai_slash, samurai_spin |
| pistol | pistol_fire, skills, dodge (Adio) |
| crossbow | xbow_shot, xbow_skill |
| longbow | bow_shot |
| magic | magic_cast |
| reactions | react_hit, react_flyback, react_getup |
| block | block_hold, parry |
| dash | dash_slide, dash_roll |

## Kill list

- Playing skill as only mixer action (no loco base)
- Leaving weapon collider on for full clip
- Using Flare/Raidriar/Adio **meshes** as heroes (clips only)
- Mixing OPB tracks on Bip001 without retarget
- Per-game fork of blend retain numbers
