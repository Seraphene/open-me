# Open Me — Handoff

## Access inventory
- GitHub repo access
- Vercel project access
- Firebase project access
- Gmail integration credentials

## Ownership model

- Primary maintainer owns env management, deployments, and incident response.
- Secondary maintainer can run QA, triage issues, and perform documented restore steps.

## Support boundaries
- In scope: security updates, bug fixes on locked v1 features.
- Out of scope: deferred features unless explicitly promoted.

## Operational handoff checklist

1. Confirm maintainer has required access to GitHub, Vercel, Firebase, and mail provider.
2. Transfer runtime env values using secure password manager sharing.
3. Rotate sensitive credentials immediately after transfer confirmation:
	- `CMS_ADMIN_TOKEN`
	- Firebase service account key
	- Gmail OAuth token / SMTP credentials
4. Trigger a fresh deployment after credential rotation.

## Credential transfer
- Use password manager export and rotate service credentials after transfer.

## Post-transfer verification

- Run release QA checklist from `docs/runbook.md`.
- Confirm CMS update writes include `updatedAt` and `updatedBy` in API response.
- Confirm offline queue sync controls and service worker update prompt are visible in app behavior.
