# Open Me — Runbook

## Monitoring
- CI status from GitHub Actions (lint, unit tests, build).
- Vercel deployment status and function logs.
- Firebase usage dashboard (Auth and Firestore quotas).

## Environment essentials

Runtime env expected in Vercel project settings:

- `CMS_ADMIN_TOKEN`
- `OPEN_ME_ALLOWED_ORIGINS` (or `ALLOWED_ORIGINS`)
- `OPEN_ME_FIREBASE_PROJECT_ID`
- `OPEN_ME_FIREBASE_CLIENT_EMAIL`
- `OPEN_ME_FIREBASE_PRIVATE_KEY`
- `OPEN_ME_FIRESTORE_LETTERS_COLLECTION` (optional)
- Notification envs (`GMAIL_*` and/or `SMTP_*`, `EMERGENCY_RECIPIENT_EMAIL`)

## Backup strategy
- Firestore acts as primary durable store for letters.
- Export Firestore collection (`open_me_letters` or configured collection) on a fixed schedule.
- Keep at least one recent export before credential rotations.

## Restore strategy
- Restore from Firestore export to staging first.
- Validate `/api/letter-list`, CMS update flow, and envelope read flow in staging.
- Promote restore steps to production only after staging verification.

## Incident quick checks
1. Check Vercel deployment status.
2. Check Firebase Auth/Firestore quotas and service health.
3. Check function logs for failures in `letter-update`, `letter-list`, `emergency-notify`.
4. Verify CMS token and Firestore service-account env values are present.

## Release QA checklist

Run before release:

1. `npm --prefix app run lint`
2. `npm --prefix app run test`
3. `npm --prefix app run build`
4. Manual smoke checks:
	- Sign in/out works.
	- Letter list loads.
	- CMS update saves and appears in list.
	- Open letter events + read receipts are accepted.
	- Offline banner and queue controls appear when expected.
