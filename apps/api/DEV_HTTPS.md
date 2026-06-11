# Local HTTPS for refresh cookies (Nest direct)

The API issues refresh tokens as an **HttpOnly cookie** with `SameSite=None`.

Modern Chromium enforces:

- `SameSite=None` cookies **must** include `Secure`
- `Secure` cookies are **not set over `http://`**

So for refresh to work in development, you need to run the API over **HTTPS**.

## 1) Generate a local cert (mkcert)

On macOS:

```bash
brew install mkcert
mkcert -install
```

Create a cert for localhost:

```bash
cd apps/api
mkdir -p .cert
mkcert -key-file .cert/localhost-key.pem -cert-file .cert/localhost-cert.pem localhost 127.0.0.1 ::1
```

> Note: `.cert/` should stay local-only. Don’t commit it.

## 2) Start Nest with an HTTPS listener

This repo’s `apps/api/src/main.ts` can start a second HTTPS listener when these env vars are set:

- `HTTPS_PORT` (example: `3443`)
- `HTTPS_KEY_PATH` (example: `apps/api/.cert/localhost-key.pem`)
- `HTTPS_CERT_PATH` (example: `apps/api/.cert/localhost-cert.pem`)

Example:

```bash
export HTTPS_PORT=3443
export HTTPS_KEY_PATH=apps/api/.cert/localhost-key.pem
export HTTPS_CERT_PATH=apps/api/.cert/localhost-cert.pem

# optionally, keep explicit origins once you know your extension id:
# export CORS_ORIGINS=http://localhost:5173,chrome-extension://<EXTENSION_ID>

cd apps/api
npm run start:dev
```

You should now have:

- HTTP: `http://localhost:3002` (default)
- HTTPS: `https://localhost:3443`

## 3) Point the extension at HTTPS

Set `VITE_API_URL` to the HTTPS origin, e.g.:

- `VITE_API_URL=https://localhost:3443`

Then rebuild/reload the extension.

## Troubleshooting

- **Cookie not being set**: confirm the API URL is `https://…` and that the response includes `Set-Cookie` with `Secure; SameSite=None`.
- **CORS errors**: set `CORS_ORIGINS` explicitly.
- **Self-signed warnings**: mkcert uses a locally trusted CA, so Chrome should trust it after `mkcert -install`.
