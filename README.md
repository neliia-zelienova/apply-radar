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

# start the web dashboard (http://localhost:5173)
pnpm dev:web
```

## Apps

| App | What it is |
| --- | --- |
| `apps/api` | NestJS + Prisma (PostgreSQL/Neon). Google sign-in, JWT access token + HttpOnly refresh cookie. All `/application`, `/interview`, `/users` routes require `Authorization: Bearer <token>`. |
| `apps/apply-radar-extension` | Chrome extension. **Signed in with Google**: reads/writes the account via the API (applications saved "device only" are copied to the account once, on first sign-in). **Device only**: data stays in `chrome.storage`. |
| `apps/web` | Web dashboard for signed-in users — the same applications as the extension, in a wider layout with stats. |

### Web dashboard setup

1. `cp apps/web/.env.example apps/web/.env` and fill in `VITE_API_URL` (the API, e.g. `http://localhost:3010`)
   and `VITE_GOOGLE_OAUTH_CLIENT_ID` (the same **Web application** OAuth client as the extension).
2. In Google Cloud Console → that OAuth client → **Authorized redirect URIs**, add
   `http://localhost:5173/oauth2` (the web sign-in popup returns there).
3. The API must allow the web origin (CORS). Without `CORS_ORIGINS` set, local dev already allows
   `http://localhost:5173`; if you set `CORS_ORIGINS`, include it there.
4. `pnpm dev:api` and `pnpm dev:web`, then open http://localhost:5173.
   When signed in with Google, the extension header has a dashboard button that opens (or focuses) it;
   set `VITE_WEB_APP_URL` in the extension env if the web app runs elsewhere (default `http://localhost:5173`).

The web app keeps the access token in memory and restores the session from the refresh cookie on reload.
That cookie is shared with the extension in the same browser, so signing in, signing out or switching
accounts in one app is picked up by the other (on open/focus and every 30s). "Device only" mode in the
extension is never switched automatically.

### Add an application from a job page (extension)

"From this page" in the extension header, or right-click → **Add this job to Apply Radar** on any page,
opens the "Add application" form pre-filled from the job posting in the current tab. Nothing is saved
until you review it and press Save.

- The page is read in your own browser tab (no request is sent to the job site), so pages behind a login
  or bot protection work too. The toolbar icon and the context menu grant access to that tab only; from the
  side panel the extension asks once per site.
- Company, position, employment type and location come from the page's schema.org `JobPosting` data when
  it has one, otherwise from the title and text.
- If the API has `ANTHROPIC_API_KEY` set (model `claude-haiku-4-5` by default, `ANTHROPIC_MODEL` to change),
  signed-in users also get a one-line summary and better guesses for missing fields. Without a key this step
  is skipped.
- Notes end with the work mode / employment type / location line and "Added from link".

End-to-end check (built extension in Chromium, mocked API, local test pages):
`pnpm --filter apply-radar-extension build && pnpm --filter apply-radar-extension test:e2e`
(first time: `npx playwright install chromium`).

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
  dates are ISO strings. `position`, `favorite` and interview `name` / `locationLink` are
  optional fields.
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
