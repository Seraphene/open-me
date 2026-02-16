# Open Me Project Execution Tracker

Last updated: 2026-02-16

## 1) Tracking policy

- Update this file whenever a task status changes.
- Keep counts consistent with the playbook tracker.
- Use only three states: Expected, Done, Remaining.

## 2) Macro progress board

| Stream | Expected | Done | Remaining | Owner | Notes |
|---|---:|---:|---:|---|---|
| Requirements lock-in | 10 | 10 | 0 | You + Copilot | Complete |
| Architecture and decisions | 8 | 8 | 0 | You + Copilot | Complete |
| Project setup and scaffolding | 12 | 11 | 1 | Copilot | In progress |
| Core envelope UX | 14 | 6 | 8 | Copilot | In progress |
| Auth/CMS/events | 18 | 7 | 11 | Copilot | In progress |
| PWA/offline | 10 | 3 | 7 | Copilot | In progress |
| Testing/CI | 12 | 7 | 5 | Copilot | In progress |
| Security/privacy hardening | 12 | 0 | 12 | Copilot | Pending |
| Handoff docs and final QA | 9 | 6 | 3 | You + Copilot | In progress |

## 3) Current sprint checklist

### Ready
- [x] Initialize React + Vite + TypeScript app
- [x] Add Firebase SDK configuration and env templates
- [x] Set up auth providers (email link + Google)
- [x] Build envelope dashboard and lock badges
- [x] Implement honor/time lock evaluator API

### Blocked/Needs decision
- [x] Validate Gmail integration implementation path (API preferred, SMTP fallback)
- [x] Run local verification (`npm --prefix app install`, `npm --prefix app build`) in environment with task runner access

### Done this cycle
- [x] Platform and stack decisions finalized
- [x] v1 scope frozen and deferred list documented
- [x] Architecture lane and 5-box system finalized
- [x] Phase plan with acceptance criteria created
- [x] App scaffold, CI workflow, and serverless function stubs created
- [x] Runbook, architecture, intent, and handoff docs initialized
- [x] Core envelope dashboard and letter viewer flow implemented
- [x] Firebase auth providers wired (Google popup + email sign-in link)
- [x] Local verification completed for dependency install and production build
- [x] Gmail integration path validated (API preferred, SMTP fallback strategy documented)
- [x] SMTP fallback transport wired for emergency notifications
- [x] Emergency notification endpoint tests added (provider modes covered)
- [x] Read receipt ingestion endpoint implemented with payload validation
- [x] Read receipt endpoint tests added (method, validation, acceptance)
- [x] CMS letter update endpoint implemented with admin-token validation
- [x] CMS letter update endpoint tests added (auth, payload, acceptance)
- [x] Letter open event endpoint implemented and wired from app open flow
- [x] Letter open endpoint tests added (method, validation, acceptance)
- [x] Read receipt endpoint wired from app envelope open flow
- [x] Emergency support button wired in letter viewer with API feedback
- [x] Service worker registered and app-shell caching enabled
- [x] Offline connectivity banner added in app UI

## 4) Definition of execution complete

- All v1 Must features shipped and verified
- Security baseline items fully checked
- Core flow tested on mobile + desktop
- CI passing on lint + test + build
- README + runbook + handoff docs completed
- Final recipient simulation pass completed
