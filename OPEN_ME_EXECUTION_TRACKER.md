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
| Project setup and scaffolding | 12 | 12 | 0 | Copilot | Complete |
| Core envelope UX | 14 | 14 | 0 | Copilot | Complete |
| Auth/CMS/events | 18 | 18 | 0 | Copilot | Complete |
| PWA/offline | 10 | 10 | 0 | Copilot | Complete |
| Testing/CI | 12 | 12 | 0 | Copilot | Complete |
| Security/privacy hardening | 12 | 12 | 0 | Copilot | Complete |
| Handoff docs and final QA | 9 | 9 | 0 | You + Copilot | Complete |

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
- [x] Offline event queue added for read-receipt and letter-open posts
- [x] Automatic queue flush on app load and reconnect implemented
- [x] Endpoint rate limiting added for emergency and CMS update paths
- [x] Security rate-limit tests added for emergency and CMS endpoints
- [x] Strict JSON content-type guards added for write endpoints
- [x] Payload-size limits added for write endpoints with guard tests
- [x] Write-endpoint origin allowlist policy enforced with preflight handling
- [x] CORS/origin enforcement tests added for emergency, CMS, and read-receipt paths
- [x] Security response headers + no-store cache policy applied to write endpoints
- [x] Header hardening assertions added to endpoint unit tests
- [x] Letter list endpoint implemented and wired for frontend API-backed loading
- [x] CMS letter update endpoint now persists updates into shared backend letter store
- [x] Letter list unit tests added (method, payload, update reflection)
- [x] Firestore-capable durable letter persistence added with safe in-memory fallback
- [x] Runtime dependency for server-side Firestore Admin SDK installed and validated
- [x] In-app CMS editor panel added for selecting/updating letters via API
- [x] CMS save flow wired with admin token header and local state refresh
- [x] Time-lock countdown status added and refreshed live in dashboard cards
- [x] Viewer close UX improved with backdrop click and Esc key support
- [x] Dashboard refresh action added for reloading latest letters without full reload
- [x] Empty-state UX added for zero-letter dashboards with CMS guidance
- [x] Honor-lock confirmations persisted across reloads for smoother repeat use
- [x] Last successful letters sync time shown in dashboard toolbar
- [x] CMS editor now supports explicit new-letter draft flow from dashboard
- [x] CMS client-side letter ID validation added before save requests
- [x] CMS updates now capture audit metadata (`updatedAt`, `updatedBy`)
- [x] CMS editor access gated to signed-in users with clear inline guidance
- [x] CMS update API now requires authenticated actor header (`x-actor-id`) on authorized writes
- [x] CMS actor identity enforced end-to-end (UI request + API validation + test coverage)
- [x] Letters cached locally for offline fallback when API fetch is unavailable
- [x] Offline event queue status surfaced in UI with manual sync and clear actions
- [x] Service worker update-ready prompt added with one-click reload
- [x] Offline queue utility emits change events for live dashboard updates
- [x] Offline queue unit test coverage added for size/event behavior
- [x] Emergency-notify endpoint input hardening added (email format + message length limits)
- [x] CMS letter-update server-side ID format validation enforced
- [x] Deployment security headers configured at Vercel routing layer
- [x] Runbook expanded with operational env/backup/restore and release QA checklist
- [x] Handoff doc expanded with ownership, rotation, and post-transfer verification
- [x] Final local QA gates passed (`lint`, `test`, `build`)
- [x] CMS server-side field length validation added for title/preview/content bounds
- [x] Emergency-notify context length validation added with test coverage
- [x] Security validation suite expanded and verified green after hardening updates
- [x] Frontend UI preferences system added (runtime theme switch + motion toggle + reduced-motion awareness)
- [x] Reusable animation primitives introduced and integrated (micro-interactions, section entrances, modal transitions)
- [x] Dashboard shell visual redesign shipped with tokenized cute theme styling and responsive accessibility polish
- [x] Post-redesign quality gates verified (`lint`, `test`, `build`)
- [x] Animation bundle loading optimized via lazy Lottie import; build warning for oversized chunks resolved
- [x] Framer Motion moved to `LazyMotion` + `m.*` primitives for leaner runtime loading and validated build output

## 4) Definition of execution complete

- All v1 Must features shipped and verified
- Security baseline items fully checked
- Core flow tested on mobile + desktop
- CI passing on lint + test + build
- README + runbook + handoff docs completed
- Final recipient simulation pass completed
