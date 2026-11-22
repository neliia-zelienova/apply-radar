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

Both packages are **source-only**: they export their TypeScript directly (no build step),
so Vite apps always compile the current code. Their `build` script is just a type check.

### `packages/shared` — `@apply-radar/shared`

Framework-free model and helpers, aligned with the API:

- `Application`, `Interview` — field names follow the API (`name`, `url`, `scheduledAt`, …);
  dates are ISO strings. `position`, `favorite` and interview `name` / `locationLink` /
  `notify*` are client-only optional fields for now.
- `ApplicationStatus` — `PENDING | INTERVIEW | OFFERED | REJECTED` (same values as the Prisma enum),
  `getStatusLabel()`.
- Date helpers: `toDateInputValue`, `fromDateInputValue`, `getDaysSince`, `formatDaysAgo`.

```ts
import { ApplicationStatus, type Application } from "@apply-radar/shared";
```

### `packages/ui` — `@apply-radar/ui`

Generic React + Tailwind components (dialog, alert dialog, select, dropdown menu, tooltip,
popover, switch, checkbox, input number, button) and `ApplicationStatusIcon`.
React is a peer dependency.

To use it in an app:

1. Add `"@apply-radar/ui": "workspace:*"` (and `@apply-radar/shared`) to the app's dependencies.
2. In the app's Tailwind entry CSS, after `@import "tailwindcss";`:

   ```css
   @import "@apply-radar/ui/styles.css"; /* radar icon keyframes, tokens, utilities */
   @source "<relative path>/packages/ui/src"; /* so Tailwind generates the classes the components use */
   ```

3. In Vite config: `resolve: { dedupe: ["react", "react-dom"] }`.

```tsx
import { Dialog, DialogContent, Button } from "@apply-radar/ui";
```
