---
name: CJS modules in esbuild ESM output
description: How to correctly import CJS packages (otplib, qrcode, etc.) when the API server bundles to ESM via esbuild
---

## The Rule
CJS packages that don't provide an explicit ESM `exports` map cannot be imported using static named imports in Node.js ESM context. This applies to `otplib`, `qrcode`, and similar legacy packages.

**Bad (fails at runtime):**
```typescript
import { authenticator } from "otplib"; // SyntaxError: does not provide an export named 'authenticator'
```

**Good (works reliably):**
```typescript
import { createRequire } from "node:module";
const _require = createRequire(import.meta.url);
const { authenticator } = _require("otplib");
const { toDataURL } = _require("qrcode");
```

**Why:** The API server uses esbuild with `format: "esm"`. When a CJS package is added to the `external` list (so esbuild doesn't bundle it), Node.js ESM handles the import directly and can't destructure named exports from CJS `module.exports`. The `createRequire` approach bypasses this by using the CJS require system explicitly.

**How to apply:** Any time you add a CJS package to the api-server externals list and need named imports, use `createRequire(import.meta.url)` to require it instead of static ESM import syntax. Also add the package to `build.mjs` externals so esbuild doesn't try to bundle it.
