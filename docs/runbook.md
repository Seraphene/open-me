# Open Me — Runbook

## Monitoring
- CI status from GitHub Actions.
- Runtime errors to be wired to Sentry in later phase.

## Backup strategy
- Firestore export schedule: to be configured after project provisioning.
- Storage backup policy: lifecycle and backup to be configured.

## Restore strategy
- Restore from Firebase export to staging first, validate, then production.

## Incident quick checks
1. Check Vercel deployment status.
2. Check Firebase Auth/Firestore quotas.
3. Check function logs for unlock/emergency failures.
