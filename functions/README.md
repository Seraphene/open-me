# Serverless Functions

This folder holds Vercel serverless functions for:
- unlock rule evaluation
- read receipt ingestion
- emergency notification pipeline
- letter listing and CMS-backed updates

## Letter list API

`letter-list.ts` accepts `GET` requests and returns:

- `letters`: current letter records used by the app dashboard/viewer.

This endpoint is consumed by the frontend (`/api/letter-list`) so letter rendering is API-backed instead of static-only client data.

## Letter open event ingestion

`letter-open.ts` accepts `POST` payloads with:

- `letterId` (required)
- `openedAt` (required ISO datetime)
- `lockType` (required: `honor` | `time`)
- `unlocked` (required boolean)
- `userId` (optional)

Valid payloads return `202` with normalized `letter-open` event metadata.

## Read receipt ingestion

`read-receipt.ts` accepts `POST` payloads with:

- `letterId` (required)
- `openedAt` (required ISO datetime)
- `recipientId` (optional)
- `deviceType` (optional: `mobile` | `desktop` | `tablet` | `unknown`)

Valid payloads return `202` with a normalized `read-receipt` event body.

## Letter update (CMS)

`letter-update.ts` accepts `POST` payloads for validated letter metadata/content updates.

### Auth requirement

- `CMS_ADMIN_TOKEN` must be set in environment.
- Request header `x-admin-token` must match `CMS_ADMIN_TOKEN`.
- Request header `x-actor-id` is required for authorized CMS writes.

### Payload requirements

- `id`, `title`, `preview`, `content`, `lockType` are required.
- `id` may only contain letters, numbers, and hyphens.
- `title` max length: 120 characters.
- `preview` max length: 240 characters.
- `content` max length: 6000 characters.
- `lockType` is `honor` or `time`.
- For `time` lock, `unlockAt` must be a valid ISO datetime.
- For `honor` lock, `unlockAt` must be omitted.
- Optional `media` entries must include valid `kind` + `src` (HTTP/HTTPS URLs only).

### Persistence behavior

- If Firestore admin env is configured, updates are persisted to Firestore and read by `letter-list.ts`.
- If Firestore env is not configured, the system falls back to in-memory runtime storage.
- New IDs are inserted; existing IDs are updated in place.
- Updates include audit metadata: `updatedAt` is set server-side and optional `updatedBy` can be passed via `x-actor-id`.

### Firestore configuration (for durable persistence)

Set these env vars for Vercel/function runtime:

- `OPEN_ME_FIREBASE_PROJECT_ID`
- `OPEN_ME_FIREBASE_CLIENT_EMAIL`
- `OPEN_ME_FIREBASE_PRIVATE_KEY` (escaped newlines as `\\n`)
- `OPEN_ME_FIRESTORE_LETTERS_COLLECTION` (optional, default: `open_me_letters`)

Seed behavior:

- When Firestore collection is empty, default letters are written automatically on first read.

## Emergency notification transport

`emergency-notify.ts` now uses an API-first transport strategy:

1. **Preferred:** Gmail API (`GMAIL_OAUTH_ACCESS_TOKEN`, `GMAIL_SENDER_EMAIL`)
2. **Fallback path:** SMTP send attempt (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`)

When SMTP fallback is selected, the function attempts delivery; if send fails, the endpoint returns `503` with error details.

### SMTP runtime dependency

- Install `nodemailer` in the deployment/runtime package scope used by `functions/`.

### Additional env

- `EMERGENCY_RECIPIENT_EMAIL` (optional default recipient if request body omits `recipientEmail`)

### Additional validation

- `recipientEmail` must be a valid email format.
- `message` is capped at 1000 characters.
- `context` is capped at 1000 characters.

## Security hardening

Rate limiting is applied to sensitive endpoints using in-memory counters per client key:

- `emergency-notify.ts`: 3 requests per 60 seconds
- `letter-update.ts`: 10 requests per 60 seconds

Strict JSON and payload-size request guards are enforced on write endpoints:

- `content-type` must include `application/json` for `POST` requests.
- Requests with oversized payloads are rejected with `413`.

Current payload limits:

- `unlock-evaluator.ts`: 2048 bytes
- `read-receipt.ts`: 4096 bytes
- `letter-open.ts`: 4096 bytes
- `emergency-notify.ts`: 4096 bytes
- `letter-update.ts`: 8192 bytes

Guard failures return:

- `415` for invalid/missing JSON content type
- `413` for oversized request bodies

Origin allowlist policy is also enforced on write endpoints:

- `OPEN_ME_ALLOWED_ORIGINS` (or `ALLOWED_ORIGINS`) sets a comma-separated allowlist of browser origins.
- Requests with an `Origin` header outside the allowlist are rejected with `403`.
- `OPTIONS` preflight requests are accepted with `204` when origin checks pass.

Response hardening headers are set on write endpoints:

- `Cache-Control: no-store`
- `Pragma: no-cache`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`

Deployment-level response security headers are also set in `vercel.json` for app/API routes (including HSTS on `/api/*`).

Client key resolution order:

1. `x-client-key` request header
2. First IP in `x-forwarded-for`
3. `unknown`
