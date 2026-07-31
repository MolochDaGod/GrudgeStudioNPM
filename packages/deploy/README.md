# `@grudge-studio/deploy`

**Deployer + editor quality system** — single manifest for CI, Forge, and game onboarding.

```ts
import { QUALITY_SYSTEM, qualityChecklist } from "@grudge-studio/deploy";

console.log(QUALITY_SYSTEM.editorUrl); // forge.grudge-studio.com
qualityChecklist().forEach((line) => console.log(line));
```
