# `@grudge-studio/bake`

Bake **contracts** and quality gates for production assets.

Actual conversion: **grudge-convert CLI** (`ObjectStore/tools/grudge-convert`).  
This package is the npm SSOT so editors/deployers share the same job shape + gates.

```ts
import { BAKE_QUALITY_GATES, recommendedBakeFlags, validateBakeJob } from "@grudge-studio/bake";
```
