# apply-radar

Monorepo for Apply Radar.

## Package manager

This repo uses **pnpm workspaces**.

### Install

From the repo root:

```bash
pnpm install
```

### Common scripts

Run from the repo root:

```bash
# build everything
pnpm -r build

# lint everything
pnpm -r lint

# API tests
pnpm --filter api-prisma test

# start API in watch mode
pnpm dev:api

# start extension dev server
pnpm dev:ext
```

### Filtering (run a single package)

```bash
pnpm --filter api-prisma build
pnpm --filter apply-radar-extension build
```

## Shared code

Shared (frontend-friendly) utilities and types live in `packages/shared` as `@apply-radar/shared`.

Example import:

```ts
import { brand, type Brand } from "@apply-radar/shared";
```
