# Gift Web App Architecture Playbook (Reusable)

> Purpose: Convert the three source perspectives into one practical, reusable system for designing future projects quickly and safely.
> 
> How to use: Start at **Section 3 (Architecture Design System)**, then fill the templates in **Section 10** and run the checklist in **Section 11**.

---

## 1) What this playbook consolidates

This document merges three distinct lenses:

1. **Operational/engineering checklist lens** (security, CI/CD, testing, handoff, reliability).
2. **Human/emotional product lens** (recipient-centered UX, longevity, emotional meaning, graceful failure).
3. **Giftware low-ops lens** (serverless/BaaS, mobile-first PWA, privacy-by-design, lightweight dev stack).

### Core insight
A gift app architecture succeeds when it balances **care** and **operations**:

- Without engineering rigor, the gift breaks.
- Without emotional design, it feels generic.
- Without low-ops choices, it becomes a maintenance burden.

---

## 2) Thorough comparison and analysis

## 2.1 Source comparison matrix

| Dimension | Source A (Checklist-heavy) | Source B (Narrative/human) | Source C (Giftware tactical) | Combined recommendation |
|---|---|---|---|---|
| Priority style | Explicit must/should/nice | Philosophy-first | Opinionated implementation defaults | Use **tiered priorities** with emotional acceptance criteria |
| Scope guidance | “Keep it small and polished” | “Meaning over features” | “Deploy-and-forget” | Build one excellent core flow; ruthlessly cut extras |
| Architecture target | Production-ready baseline | Longevity + recipient fit | Zero-maintenance cloud-native | Choose architecture by **maintenance budget**, not novelty |
| Security | Strong concrete controls (CSP, CSRF, rate limits, TLS, hashing) | Privacy respect | “Just us” protocol; RLS emphasis | Keep Source A baseline; apply Source C auth/RLS shortcuts |
| UX | Accessibility + mobile + onboarding | Emotional delight + empathy | Mobile-first + installable PWA | Blend: accessible core + intentional delight moments |
| Ops/maintenance | Logging, monitoring, backups, CI | Exit strategy / future support | Managed services bias | Managed infra + documented runbook + handoff artifacts |
| Testing | Unit/integration/E2E matrix | Not deep technically | Light but practical | Critical-path tests first, then broaden incrementally |
| Data ownership | Minimal collection | Export/autonomy emphasis | Cloud storage and backups | Add explicit data export + deletion as standard |

## 2.2 Strengths and gaps by source

### Source A (engineering checklist)
**Strengths**
- Production realism (security, CI/CD, reliability, handoff).
- Excellent prioritization under time constraints.
- Good for avoiding obvious failure modes.

**Gaps**
- Can produce “correct but emotionally flat” apps.
- Less explicit about recipient psychology and meaning.

### Source B (human-centered narrative)
**Strengths**
- Captures the unique nature of gift projects (emotional ROI).
- Emphasizes sustainability, clarity, empathy, graceful failure.
- Encourages durable technology choices and exit strategy.

**Gaps**
- Less operational precision (fewer concrete controls/checks).
- Harder to execute directly without technical checklist scaffolding.

### Source C (giftware tactical defaults)
**Strengths**
- Very practical defaults for low-ops delivery.
- Strong mobile-first and PWA framing.
- Clear privacy-by-design recommendations (RLS, managed auth).

**Gaps**
- Some security simplifications (e.g., “magic link/obscure URL”) may be acceptable only for low-risk static content.
- Can overfit to a specific stack if applied dogmatically.

## 2.3 Reconciled principles (what wins when conflict appears)

When sources conflict, apply this precedence:

1. **User safety + privacy first** (never compromise).
2. **Reliability + maintainability second** (gift should keep working).
3. **Recipient emotional value third** (the reason it exists).
4. **Developer convenience fourth** (important but not above the first three).

---

## 3) Reusable architecture design system (for future projects)

Use this 7-step method for any personal/gift web app.

## 3.1 Step 1 — Define the “Gift Intent Contract”

Capture in 1 page:
- Who is the recipient?
- What single emotional outcome should this app create?
- What is the one core action they should complete in <60 seconds?
- What data is absolutely required vs optional?
- What support promise do you make (none / best-effort / paid maintenance)?

Deliverable: `intent.md`

## 3.2 Step 2 — Choose architecture by maintenance budget

Pick one lane:

### Lane A: Static + minimal dynamic (lowest maintenance)
- Best for galleries, timeline, letter collections, lightweight interactions.
- Stack: static hosting + optional BaaS for auth/data.

### Lane B: Serverless + BaaS (balanced)
- Best for light personalization, secure storage, moderate interactions.
- Stack: React/Svelte + serverless functions + managed DB/auth/storage.

### Lane C: Small full-stack service (highest flexibility)
- Best for sockets, scheduled jobs, complex workflows.
- Stack: small API service + managed DB + object store + CI/CD.

Decision rule: choose the **least complex lane** that still satisfies your core flow.

## 3.3 Step 3 — Draw the architecture in 5 boxes max

Always model:
1. Client (web/PWA)
2. Auth
3. API/functions
4. Data store
5. Storage/observability

If your diagram needs more than 5 primary boxes, scope likely too large.

## 3.4 Step 4 — Define non-negotiable quality gates

Before launch, must pass:
- Security baseline (Section 6)
- Core-flow test pass (Section 7)
- Mobile + accessibility smoke checks
- Handoff docs complete (Section 8)

## 3.5 Step 5 — Build critical path first

Sequence:
- Happy path UI → auth/data integration → error states → hardening.
- Don’t build secondary features before core flow is stable.

## 3.6 Step 6 — Add emotional polish intentionally

Plan 2–4 “delight moments” only:
- empty state copy,
- welcome message,
- subtle animation,
- personalized color/text elements.

Must not degrade performance/accessibility.

## 3.7 Step 7 — Prepare survivability package

Create:
- runbook,
- backup/restore notes,
- credentials transfer instructions,
- export/delete user data capability.

---

## 4) Reference architecture patterns

## 4.1 Pattern A — Static Gift App

- Frontend: static site (Vite/React/Svelte, or plain HTML/JS).
- Hosting: Vercel/Netlify/GitHub Pages.
- Data: local JSON or limited BaaS reads.
- Auth: optional; passwordless protected route if needed.
- Best for: mostly read-only sentimental experiences.

Pros: lowest ops, fastest delivery.  
Cons: limited dynamic/private features.

## 4.2 Pattern B — Gift App with Accounts (recommended default)

- Frontend: React + Vite or Svelte + Vite.
- Auth: Supabase Auth/Firebase Auth/Auth0.
- Backend: serverless functions for custom logic.
- DB: managed Postgres (Supabase/Neon/Render) or Firebase.
- Storage: object store for media (S3 equivalent/Cloudinary/Firebase Storage).
- Monitoring: Sentry + host uptime checks.

Pros: low ops + secure personalization.  
Cons: more moving parts than static.

## 4.3 Pattern C — Advanced Personal App

- Frontend: SSR app if SEO/perf at initial load is critical.
- Backend: small API service for jobs/sockets/complex rules.
- DB + queue + scheduler: managed services.
- Infra: Docker + CI deploy pipeline.

Pros: maximum capability.  
Cons: higher maintenance burden, only justify with real requirements.

---

## 5) Project layout blueprint (reusable)

Use this folder model for clarity and handoff:

```text
project-root/
  docs/
    intent.md
    architecture.md
    runbook.md
    handoff.md
  app/                     # frontend
    src/
    public/
  functions/               # serverless or api
  infra/                   # optional IaC / deploy configs
  tests/
    unit/
    integration/
    e2e/
  .github/workflows/
  README.md
```

Minimal rule: every repo should have `README.md`, `docs/runbook.md`, and at least one CI workflow.

---

## 6) Security and privacy baseline (minimum acceptable)

These are non-optional for any app handling user data.

1. Enforce HTTPS + HSTS.
2. Store secrets in environment variables only.
3. Use managed auth or secure password hashing (`argon2`/`bcrypt`) if custom.
4. Implement CSRF protection for state-changing authenticated web flows.
5. Validate all inputs; encode/sanitize outputs to prevent XSS.
6. Use parameterized queries/ORM to prevent SQL injection.
7. Apply secure headers: CSP, X-Frame-Options, HSTS, Referrer-Policy.
8. Add rate limiting on public auth endpoints.
9. Validate uploads (size/type), store in object storage, never trust filename.
10. Minimize data collection; define retention and deletion behavior.
11. Support user data export and account/data deletion where relevant.
12. Avoid logging secrets, tokens, raw credentials, or sensitive personal content.

---

## 7) Testing and release quality strategy

## 7.1 Minimum testing matrix

- **Unit**: auth guards, validators, core domain rules.
- **Integration**: DB reads/writes, auth-bound data access (including RLS if used).
- **E2E smoke**: signup/login → core action → logout.
- **Manual QA**: mobile viewport checks, keyboard navigation, contrast, empty/error states.

## 7.2 CI gates

On every push/PR:
- lint
- unit tests
- build
- (optional) e2e smoke on main branch or nightly

Release only if core flow and security checks pass.

---

## 8) Handoff and long-term survivability

Treat this as part of the gift itself.

Required handoff package:
- `README.md`: purpose, local run, deploy, env vars, reset instructions.
- `docs/runbook.md`: monitoring, alerts, logs, backups, restore steps.
- `docs/handoff.md`: admin access, support boundaries, credential transfer process.
- Visual walkthrough: short video or annotated screenshots.

Recommended support contract (even informal):
- response expectations,
- maintenance window,
- what is in/out of scope.

---

## 9) Prioritization model (time-constrained delivery)

## Must
- One core user flow fully polished.
- HTTPS, secure auth baseline, secret management.
- Mobile-friendly UI.
- README + runbook + backup instructions.

## Should
- CI on push.
- CSP and secure headers.
- E2E smoke test.
- Monitoring/error reporting.
- Short walkthrough artifact.

## Nice-to-have
- PWA installability.
- Staging environment.
- Advanced accessibility audit.
- Automated scheduled backups.
- Feature flags and analytics.

---

## 10) Templates you can copy for future projects

## 10.1 Architecture one-pager template

```md
# Project: <name>

## Intent
- Recipient:
- Emotional outcome:
- Core action (60-second success):

## Scope
- In scope:
- Out of scope:

## Architecture lane
- [ ] Lane A (Static)
- [ ] Lane B (Serverless + BaaS)
- [ ] Lane C (Small full-stack)
Reason:

## Components (max 5)
1.
2.
3.
4.
5.

## Data model (minimal)
- Entities:
- Sensitive fields:
- Retention/deletion rules:

## Security controls
- HTTPS/HSTS: yes/no
- Auth approach:
- CSRF strategy:
- CSP baseline:
- Rate limiting:

## Testing plan
- Unit:
- Integration:
- E2E core flow:

## Handoff
- Runbook owner:
- Backup cadence:
- Support model:
```

## 10.2 ADR (Architecture Decision Record) template

```md
# ADR-<number>: <decision title>

## Context
<What problem are we solving?>

## Decision
<Chosen option>

## Alternatives considered
- Option A:
- Option B:

## Consequences
- Positive:
- Negative:
- Risk mitigations:

## Rollback plan
<How to revert if needed>
```

## 10.3 “Gift-ready definition of done” template

```md
- Core flow demo completed on mobile and desktop.
- Security baseline checks complete.
- CI green.
- Backups and restore test verified.
- README + runbook + handoff docs complete.
- Recipient walkthrough artifact created.
- Data export/delete path validated.
```

---

## 11) Master checklist (execution order)

1. Define intent + core flow.
2. Freeze scope (in/out list).
3. Pick architecture lane (A/B/C).
4. Create 5-box diagram and folder structure.
5. Implement critical path.
6. Add auth/data/storage and secure defaults.
7. Add test baseline + CI.
8. Add monitoring/backups.
9. Validate accessibility/mobile/error states.
10. Prepare handoff package and walkthrough.
11. Conduct final “recipient simulation” test.

---

## 12) Anti-patterns to avoid

- Overengineering for hypothetical scale.
- Self-hosted infra for tiny personal apps.
- Collecting personal data without clear need.
- Shipping without backup/export strategy.
- Building many features before polishing core flow.
- Relying on memory instead of documentation for handoff.

---

## 13) Suggested default stack (safe baseline)

If no special constraints exist, start here:
- Frontend: React + Vite (or Svelte + Vite)
- Auth/DB/Storage: Supabase (or Firebase)
- Hosting: Vercel/Netlify (frontend), serverless functions as needed
- Monitoring: Sentry
- CI: GitHub Actions (`lint`, `test`, `build`)

Why: strong reliability-to-complexity ratio and low ongoing maintenance.

---

## 14) Architecture review scorecard (quick evaluation)

Score each area from 0 to 2.

- Core flow clarity
- Security baseline
- Privacy/data minimization
- Reliability/monitoring
- Test coverage of critical path
- Mobile/accessibility
- Emotional polish
- Handoff completeness

Interpretation:
- **14–16**: gift-ready
- **10–13**: launchable with known gaps
- **<10**: do not launch yet

---

## 15) Final synthesis: the reusable rule-set

For future projects, apply this sequence every time:

1. **Meaning first**: define who it is for and why it matters.
2. **Small scope**: one polished core flow beats many features.
3. **Low ops architecture**: managed services unless proven otherwise.
4. **Secure defaults**: privacy and security as requirements, not extras.
5. **Survivability**: docs, backups, export/delete, and clear support path.

If you follow these five rules, your architecture will stay practical, safe, and emotionally meaningful across future gift projects.

---

## 16) Copy-paste master prompt (for future projects)

Use this prompt with any AI assistant by pasting this full playbook + the prompt below.

```md
You are an architecture assistant. Use the attached playbook as mandatory guidance.

Project context:
- Project name: <name>
- Target users: <who>
- Core user outcome: <what success means>
- Constraints: <budget/time/skills/platform/legal/privacy>
- Desired timeline: <days/weeks>

Tasks:
1) Recommend the best architecture lane (A/B/C) and justify tradeoffs.
2) Produce a 5-box architecture with components, interfaces, and data flows.
3) Propose minimal stack choices (frontend/backend/db/auth/storage/hosting/CI/monitoring).
4) Create a phased implementation plan (Phase 0, 1, 2...) with acceptance criteria.
5) Define security/privacy controls mapped to this project.
6) Define testing strategy (unit/integration/e2e/manual) for the core flow.
7) Generate handoff package checklist and runbook skeleton.
8) Provide a risk register with mitigations and rollback paths.
9) Provide Must/Should/Nice-to-have prioritization for this exact scope.

Output format:
- Section A: Architecture decision summary
- Section B: System design (diagram description + component contracts)
- Section C: Delivery plan with milestones and DoD
- Section D: Security/privacy/test checklists
- Section E: Handoff and long-term maintenance
- Section F: Risks, assumptions, and open questions

Rules:
- Prefer least-complex architecture that satisfies requirements.
- Optimize for low maintenance and recipient usability.
- Do not introduce features outside scope.
- Flag any missing information as explicit assumptions.
```

---

## 17) Project instance lock-in (Open Me gift app)

This section applies the playbook to your exact project decisions and freezes v1 scope.

### 17.1 Confirmed platform choices

- **Frontend**: React + Vite + TypeScript
- **Hosting/compute**: Vercel + serverless functions
- **Backend platform**: Firebase (Auth + Firestore + Storage)
- **Auth strategy**: Mixed email-link + Google sign-in
- **AI strategy**: Hybrid (cloud AI + optional on-device fallback later)
- **Notification strategy (v1)**: Email via Gmail API/SMTP
- **Cost target**: Free-tier first, no required paid subscription
- **Target devices**: Mobile, tablet, desktop
- **Region context**: Philippines (privacy good practice aligned; strict compliance mode can be added later)

### 17.2 Chosen architecture lane

- **Lane B: Serverless + BaaS**

Why this lane:
- Supports personalized private content with low operational burden.
- Fits free-tier goals better than always-on full-stack servers.
- Keeps migration path open if future scaling is needed.

### 17.3 v1 Must / Deferred contract

**Must for v1 (locked)**
1. Core envelopes with honor/time lock rules.
2. Multimedia letters (photos/audio/video).
3. PWA installability + offline support for core experience.
4. Admin CMS flow to add/update letters without code redeploy.
5. Read receipts + emergency support button.

**Deferred to phase 2+ (explicitly out of v1)**
- Weather-based unlocks.
- Geofence unlocks.
- AI-assisted authoring features.
- Collaboration and multi-author roles.
- Advanced gamification and relationship analytics.

---

## 18) 5-box system design (project-specific)

### 18.1 Components

1. **Client app (React PWA)**
  - Envelope dashboard, letter reader, lock-state UI, offline shell/cache.
2. **Auth (Firebase Authentication)**
  - Email link + Google sign-in, session management.
3. **App backend (Vercel Serverless Functions)**
  - Unlock evaluation, receipt recording, emergency email trigger, admin-safe write endpoints.
4. **Primary data store (Firestore)**
  - Letters, unlock conditions, users, open events, emergency events, admin metadata.
5. **Media/ops layer (Firebase Storage + logging/monitoring)**
  - Secure media files, signed access paths, error telemetry hooks.

### 18.2 Data flow summary

1. User signs in via Firebase Auth.
2. Client requests envelope list from Firestore (filtered by access/role).
3. On open attempt, client calls serverless unlock evaluator.
4. If unlocked, serverless function returns approved content reference.
5. Client loads letter text + media (Firestore + Storage), then writes read receipt event.
6. Emergency button calls serverless function that sends Gmail notification and records event.

### 18.3 Minimal Firestore collections (v1)

- `users`: profile, role, preferences
- `envelopes`: title, description, lockType, lockConfig, status
- `letters`: envelopeId, content blocks, media refs, version
- `events_open`: envelopeId, userId, openedAt, source
- `events_emergency`: userId, triggeredAt, channelStatus
- `admin_audit`: actor, action, targetId, timestamp

---

## 19) Phased delivery plan with acceptance criteria

### Phase 0 — Foundation and guardrails

Deliverables:
- Repo structure aligned with Section 5 blueprint.
- Firebase project bootstrap (Auth/Firestore/Storage enabled).
- Vercel project linked and environment variables documented.

Acceptance criteria:
- App runs locally and deploy preview succeeds.
- Secrets are only in environment configs.
- CI placeholder workflow exists (lint/test/build skeleton).

### Phase 1 — Core envelope experience

Deliverables:
- Envelope dashboard + lock-state visuals.
- Honor lock + time-lock logic.
- Letter reader with text and basic media rendering.

Acceptance criteria:
- Recipient opens at least one unlocked letter end-to-end.
- Time-locked letter remains unavailable before target timestamp.
- Mobile layout passes manual smoke checks.

### Phase 2 — Auth, CMS, read receipts, emergency

Deliverables:
- Email-link + Google auth.
- Admin create/edit letter flow (no redeploy required).
- Read receipt events and emergency button to email pipeline.

Acceptance criteria:
- Admin can publish a new letter from UI and recipient sees it.
- Receipt event appears for every opened letter.
- Emergency trigger sends and logs one verifiable event.

### Phase 3 — PWA + offline hardening

Deliverables:
- Installable PWA manifest + service worker.
- Offline access for shell + previously viewed core letters.
- Resilient loading/error states for media-heavy letters.

Acceptance criteria:
- App installs on Android/desktop browsers.
- Core offline path works after first online load.
- Failed media fetch shows graceful fallback state.

### Phase 4 — Security, quality, handoff

Deliverables:
- Security baseline checks from Section 6 mapped to implementation.
- Unit/integration/e2e smoke coverage for core flow.
- Handoff package docs (`README`, runbook, handoff) completed.

Acceptance criteria:
- CI green on lint + tests + build.
- Security checklist fully reviewed and signed off.
- Recipient simulation test completed.

---

## 20) Execution tracker (expected / done / remaining)

Update this table continuously during implementation.

### 20.1 Status snapshot (as of 2026-02-16)

| Workstream | Expected | Done | Remaining | Status |
|---|---:|---:|---:|---|
| Requirements lock-in | 10 | 10 | 0 | Complete |
| Architecture design | 8 | 8 | 0 | Complete |
| Project scaffolding | 12 | 10 | 2 | In progress |
| Core envelope UX | 14 | 5 | 9 | In progress |
| Auth + CMS + events | 18 | 0 | 18 | Not started |
| PWA offline | 10 | 1 | 9 | Not started |
| Testing + CI | 12 | 3 | 9 | In progress |
| Security hardening | 12 | 0 | 12 | Not started |
| Handoff package | 9 | 6 | 3 | In progress |

### 20.2 Detailed checklist

#### Completed
- [x] Platform decisions collected and finalized.
- [x] v1 feature scope frozen (must vs deferred).
- [x] Architecture lane selected (Lane B).
- [x] 5-box project design drafted.
- [x] Phase plan and acceptance criteria drafted.
- [x] Initialize React + Vite + TypeScript app structure.
- [x] Add Firebase client initialization and env configuration.
- [x] Implement honor lock + time lock evaluator function.
- [x] Configure CI workflow (lint, test, build).
- [x] Prepare README, runbook, and handoff docs.
- [x] Implement envelope dashboard and lock-state rendering.
- [x] Implement letter reader (text/photo/audio/video blocks).

#### In progress
- [ ] Finalize Firestore security rule model for role-based access.
- [ ] Finalize Gmail integration approach (API vs SMTP fallback).

#### Remaining
- [ ] Implement Auth (email link + Google).
- [ ] Implement admin CMS letter create/edit/publish flow.
- [ ] Implement read receipt event pipeline.
- [ ] Implement emergency button and email notification path.
- [ ] Add PWA manifest and service worker caching strategy.
- [ ] Add loading, empty, error, and offline states.
- [ ] Add unit/integration/e2e smoke tests.
- [ ] Apply security headers, input validation, and rate limiting.
- [ ] Validate local run (`npm install`, `npm run build`) and deploy preview.
- [ ] Execute final recipient-simulation QA.

---

## 21) Risk register and controls (project-specific)

| Risk | Impact | Mitigation | Rollback/Fallback |
|---|---|---|---|
| Free-tier quota exhaustion (Firebase/Vercel) | Service disruption | Set usage alerts, optimize media size, cache aggressively | Temporary media cap + manual throttling |
| Gmail API/SMTP limits | Emergency/read notifications delayed | Queue and retry; suppress duplicate sends | In-app emergency confirmation when email fails |
| Unlock logic bugs (time/honor states) | Incorrect access to letters | Server-side validation and test coverage | Disable affected lock type via feature flag |
| Offline cache staleness | User sees old content | Versioned cache invalidation strategy | Force refresh on next online session |
| Sensitive data leakage in logs | Privacy harm | Redaction policy and structured logging | Purge logs + rotate keys immediately |

---

## 22) Change-control rule for this project

To maintain strict tracking and avoid scope creep:

1. Any new feature request must be tagged as **v1**, **phase 2**, or **backlog** before development.
2. Every completed item must update Section 20.1 counts and Section 20.2 checklist in the same change.
3. Security and privacy controls cannot be downgraded to meet schedule.
4. No deferred feature is pulled into v1 unless one v1 item is explicitly swapped out.

