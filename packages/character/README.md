# `@grudge-studio/character`

**SSOT for character quality** across Grudge Studio games, Forge editor, and deployers.

- Deploy step order (`CHARACTER_DEPLOY_STEPS`)
- SI human 1.8 m, Box3 feet (not pelvis)
- **Uniformed motion:** `stripPositionTracks` / `stripHipRootPositionTracks` (no hip-Y float)
- Quality report builder for editor/CI gates

```ts
import {
  CHARACTER_DEPLOY_STEPS,
  stripPositionTracks,
  defaultDeployOptions,
  buildQualityReport,
  weaponToAnimPack,
} from "@grudge-studio/character";
```

Host still supplies THREE loaders + mesh (see gameopen `characterDeploy.ts`).
