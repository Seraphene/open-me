# Open Me

Private "Open When" gift web app with locked envelopes, multimedia letters, and low-maintenance cloud architecture.

## Stack (locked)

- Frontend: React + Vite + TypeScript
- Hosting/compute: Vercel + serverless functions
- Data/Auth/Storage: Firebase (Auth + Firestore + Storage)
- Notifications: Gmail API/SMTP (wiring phase)

## Current status

- Phase 0 scaffolding is complete.
- Feature implementation starts in Phase 1.

## Repository layout

```text
open-me/
	app/                    # React PWA
	functions/              # Vercel serverless function stubs
	docs/                   # intent, architecture, runbook, handoff
	tests/                  # unit/integration/e2e test folders
	.github/workflows/      # CI workflow
```

## Local development

### 1) Install app dependencies

```bash
cd app
npm install
```

### 2) Configure Firebase variables

Copy `app/.env.example` to `app/.env` and fill values from Firebase project settings.

### 3) Run the frontend

```bash
npm run dev
```

### 4) Run quality checks

```bash
npm run lint
npm run test
npm run build
```

## Tracking

- Master playbook and architecture lock-in: `GIFT_WEB_APP_ARCHITECTURE_PLAYBOOK.md`
- Live task/status board: `OPEN_ME_EXECUTION_TRACKER.md`
