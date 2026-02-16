# Serverless Functions

This folder holds Vercel serverless functions for:
- unlock rule evaluation
- read receipt ingestion
- emergency notification pipeline

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

### Payload requirements

- `id`, `title`, `preview`, `content`, `lockType` are required.
- `lockType` is `honor` or `time`.
- For `time` lock, `unlockAt` must be a valid ISO datetime.
- For `honor` lock, `unlockAt` must be omitted.
- Optional `media` entries must include valid `kind` + `src`.

## Emergency notification transport

`emergency-notify.ts` now uses an API-first transport strategy:

1. **Preferred:** Gmail API (`GMAIL_OAUTH_ACCESS_TOKEN`, `GMAIL_SENDER_EMAIL`)
2. **Fallback path:** SMTP send attempt (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`)

When SMTP fallback is selected, the function attempts delivery; if send fails, the endpoint returns `503` with error details.

### SMTP runtime dependency

- Install `nodemailer` in the deployment/runtime package scope used by `functions/`.

### Additional env

- `EMERGENCY_RECIPIENT_EMAIL` (optional default recipient if request body omits `recipientEmail`)
