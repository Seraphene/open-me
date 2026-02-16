# DevSecOps AI Agent Master Playbook

> Purpose: Transform threat intelligence into reusable execution for bug hunting, secure coding, and architecture design with AI agents.
>
> Primary outcome: You can copy/paste scenario-based prompts to quickly find bugs, fix issues correctly, and build secure systems aligned with OWASP, CWE, MITRE ATT&CK, CI/CD risk models, and DSOMM maturity progression.

---

## 1) Executive Synthesis (What Was Learned)

Your source analysis shows a clear pattern:

1. **The easiest bugs are decreasing** (e.g., basic XSS in mature stacks), but
2. **Systemic and logic-driven bugs are increasing** (broken access control, SSRF pivoting, misconfiguration, pipeline poisoning, AI-generated insecure code), and
3. **The CI/CD pipeline is now a primary attack target**, not just the app itself.

### Strategic implication
Security must shift from “scan and patch” to **continuous, architecture-aware prevention**:

- Prevent unsafe states through policy-as-code.
- Validate business logic and authorization continuously.
- Treat AI-generated code as untrusted external input.
- Control pipeline identities, credentials, and runner egress.

---

## 2) Comparison Framework: Common vs Unusual vs Rare + Expected vs Unexpected

Use two dimensions for triage and prompt selection:

- **Bug Frequency Layer:** Common / Unusual / Rare
- **Operational Friction Layer:** Expected / Unexpected

### 2.1 Why this two-axis model works

- Frequency tells you **how likely** the issue is.
- Friction tells you **how likely your process is to catch it**.

A “common + expected” issue should be automated.
A “rare + unexpected” issue needs deep manual + adversarial analysis.

### 2.2 Prioritization matrix

| Frequency \ Friction | Expected (known process pain) | Unexpected (blind spot / hidden trust failure) |
|---|---|---|
| Common | Automate in CI gate immediately | Build detection + telemetry now |
| Unusual | Add targeted tests and threat scenarios | Manual expert review + architecture redesign |
| Rare | Schedule specialist assessment windows | Treat as critical research incident |

---

## 3) Reusable DevSecOps Operating Model for AI-Assisted Engineering

### 3.1 Layered architecture (security ownership)

1. **Code Layer**
   - SAST, lint, type checks, secure coding rules
2. **Dependency Layer**
   - SCA, SBOM generation, provenance checks, signature verification
3. **Build Layer**
   - Isolated runners, minimal permissions, secure secrets injection
4. **Deploy Layer**
   - Policy-as-code, admission controls, IaC scanning
5. **Runtime Layer**
   - DAST, RASP/WAF, observability, anomaly detection, incident response
6. **AI Layer**
   - AI output review, hallucinated package detection, prompt abuse controls

### 3.2 Golden pipeline blueprint

- Commit → Pre-commit checks (secret scan, lint, unit tests)
- PR → SAST + SCA + IaC scan + policy checks
- Merge → Build signed artifact + SBOM + provenance attestation
- Deploy staging → DAST + authz regression + runner egress checks
- Prod release → gated approval + monitored rollout + rollback capability

---

## 4) Bug Taxonomy for AI-Agent-Driven Hunting

## 4.1 Common Bugs (automate + enforce)

### A) Injection (SQL/NoSQL/Command)
- Typical root cause: unsanitized input + unsafe sinks
- Detection stack: SAST rules + DAST payloads + code review
- Fix baseline: parameterization + strict validation + least-privileged DB/service account

### B) XSS / Output Encoding Failures
- Root cause: context-mismatched encoding or unsafe rendering
- Detection: DOM scanner + CSP report monitoring + manual UI attack traces
- Fix: contextual escaping + safe templating + CSP hardening

### C) Broken Access Control / IDOR
- Root cause: missing server-side authorization checks
- Detection: authorization matrix tests + endpoint fuzzing by user role
- Fix: centralized authz policy + deny-by-default

### D) Security Misconfiguration
- Root cause: overly permissive cloud, container, or service settings
- Detection: IaC scanners + cloud posture monitoring + drift detection
- Fix: policy-as-code rules that block insecure states

### E) Secret Exposure
- Root cause: committed keys, verbose logs, build output leakage
- Detection: secret scanners in pre-commit, CI, repos, logs
- Fix: immediate rotate/revoke + history purge + runtime vault retrieval

## 4.2 Unusual Bugs (scenario-driven analysis)

### A) Business Logic Abuse
- Root cause: state transitions not guarded by intent validation
- Detection: workflow abuse tests, adversarial test case design
- Fix: state machine constraints + transaction invariants + anti-automation controls

### B) GraphQL Deep Abuse (injection/cost/authorization)
- Root cause: resolver trust + missing depth/cost controls
- Detection: introspection analysis + nested query abuse tests
- Fix: query complexity limits + resolver-level authorization + query allowlists

### C) Cloud SSRF to Metadata Pivot
- Root cause: unsafe URL fetch path + trust in internal network
- Detection: SSRF payloads targeting metadata endpoints
- Fix: egress filtering + metadata hardening + strict URL allowlists

### D) Insecure Deserialization
- Root cause: unsafe object reconstruction from untrusted data
- Detection: sink identification + crafted object payload tests
- Fix: safe data formats + schema validation + allowlisted types

## 4.3 Rare Bugs (research-grade investigations)

### A) HTTP Request Smuggling / Cache Poisoning
- Root cause: parser mismatch across proxy/CDN/backend
- Detection: CL.TE / TE.CL differential tests, HTTP/2 downgrade probes
- Fix: single parser normalization, strict header handling, protocol alignment

### B) Prototype Pollution and Framework Sandbox Escape
- Root cause: untrusted object merge or unsafe execution hooks
- Detection: sink chain tracing + runtime object integrity checks
- Fix: object freeze/clone hardening + dangerous sink isolation

### C) Memory Corruption in Native Components
- Root cause: unsafe memory handling in C/C++ dependencies
- Detection: fuzzing + sanitizers (ASAN/UBSAN) + crash triage
- Fix: bounds checks, safer wrappers, migration to memory-safe components

### D) Supply-Chain Backdoor via Build Tooling
- Root cause: unverified package/action provenance
- Detection: provenance and signature policy failures
- Fix: pinning, signed artifacts, internal mirrors, trusted registries only

---

## 5) Expected vs Unexpected CI/CD Friction Playbook

## 5.1 Expected friction (optimize)

- Tool sprawl, slow pipelines, false positives
- Developer bypass behavior when gates are noisy
- Dependency drift and frequent CVE alerts

**Action:** tune signal-to-noise, set risk-based gates, and provide fast remediation paths.

## 5.2 Unexpected friction (treat as incidents)

- Poisoned pipeline execution through CI config edits
- Ephemeral runner exfiltration (unrestricted outbound)
- Secret leakage in logs despite masking assumptions
- Over-privileged service accounts and stale tokens

**Action:** enforce runner network controls, immutable logging, strict IAM segmentation, and secret hygiene automation.

---

## 6) Necessary Practices vs Best Practices (Implementation Standard)

## 6.1 Necessary (minimum acceptable baseline)

1. SAST + DAST + SCA integrated in CI
2. Secret scanning at commit + PR + pipeline log level
3. IAM least privilege for humans and machines
4. RBAC/ABAC authorization enforcement
5. Centralized secrets vault (no hardcoded credentials)
6. IaC and container security scanning before deploy
7. TLS + secure headers + validated input/output handling

## 6.2 Best-in-class (mature secure-by-design)

1. Policy-as-Code across infra and deployments
2. Threat modeling in design phase (ATT&CK / STRIDE / CAPEC)
3. Signed artifacts + provenance + mandatory SBOM verification
4. Runner egress allowlists + zero-trust network mediation
5. AI-aware guardrails for generated code and dependencies
6. Continuous runtime detection with rapid containment workflows

---

## 7) DSOMM-Aligned Roadmap (How to Mature Practically)

## Level 1 → 2
- Add repeatable CI checks and secure coding standards
- Start secret scanning and basic IaC scanning

## Level 2 → 3
- Standardize triage and remediation SLAs
- Add full SAST/DAST/SCA across all services

## Level 3 → 4
- Enforce release gates based on policy and risk
- Make threat modeling mandatory for major changes

## Level 4 → 5
- Universal policy-as-code + adaptive runtime response
- Organization-wide security telemetry correlation and autonomous controls

---

## 8) AI Agent Prompt Library (Copy/Paste Ready)

> Use these prompts with any coding/security AI agent. Replace placeholders in `{...}`.

## 8.1 Prompt Set A — Fast Triage

### A1: Repo Security Snapshot
```text
Analyze this repository as a senior DevSecOps reviewer.
Context:
- Stack: {stack}
- Deployment: {cloud/platform}
- Critical assets: {assets}
- Threat model priority: {priority}
Task:
1) Find top 15 security risks by exploitability and business impact.
2) Categorize each as Common/Unusual/Rare and Expected/Unexpected.
3) Map each to OWASP category + likely CWE.
4) Provide a prioritized remediation plan (48h, 2 weeks, 1 quarter).
Output format:
- Table: risk, location, impact, exploit path, confidence, fix summary.
- Then actionable patch checklist.
```

### A2: CI/CD Risk Audit
```text
Act as a CI/CD security auditor.
Audit pipeline definitions and configs in this repo.
Find:
- Poisoned pipeline execution opportunities
- Secret leakage paths (logs, env, artifacts)
- Over-privileged identities/tokens
- Dependency confusion and unpinned third-party actions
- Missing flow controls and approvals
Then:
- Rank by blast radius
- Provide exact hardening changes in YAML and IAM policy terms
- Provide "must fix before next deploy" list
```

## 8.2 Prompt Set B — Bug Hunting by Category

### B1: Broken Access Control / IDOR Hunter
```text
You are a bug hunter focused on authorization flaws.
Review endpoints, service methods, and object access patterns.
Task:
- Build role-permission matrix from code
- Identify server-side authz gaps and IDOR patterns
- Generate exploit scenarios (low privilege to high value data)
- Propose code-level and policy-level remediations
Return:
- Confirmed issues with proof-of-concept request flow
- Regression test cases to prevent reintroduction
```

### B2: GraphQL Abuse Hunter
```text
Focus only on GraphQL security.
Check schema, resolvers, and query execution controls for:
- Injection in resolvers
- Missing authz at field/resolver level
- Excessive query depth/complexity abuse
- Introspection abuse and sensitive data overfetching
Provide:
- Exploit queries
- Required resolver patches
- Query limit policy and observability instrumentation
```

### B3: SSRF + Cloud Metadata Pivot Hunter
```text
Assume attacker goal: gain cloud credentials via SSRF.
Find all outbound request capabilities (webhooks, URL fetchers, PDF renderers, image processors).
Test for:
- SSRF to internal hosts and metadata endpoints
- Redirect bypass and DNS rebinding opportunities
- Header smuggling into internal services
Deliver:
- Confirmed SSRF paths
- Blast radius if exploited
- Network and code hardening controls (allowlist, egress, metadata protections)
```

### B4: Request Smuggling / Cache Poisoning Hunter
```text
Investigate reverse proxy/CDN/backend request parsing inconsistencies.
Focus on CL.TE, TE.CL, TE.TE, and HTTP/2 downgrades.
Task:
- Identify desync candidates
- Simulate cache poisoning impact on shared responses
- Propose parser normalization and safe config changes
Output:
- Reproduction steps
- Affected routes
- Severity and rollback-safe mitigation sequence
```

## 8.3 Prompt Set C — Secure Fix Generation

### C1: Minimal-Risk Patch Prompt
```text
Generate a minimal, production-safe patch for the confirmed vulnerability below.
Constraints:
- No unrelated refactors
- Preserve public APIs unless required
- Add/update targeted tests
- Include migration/backward compatibility notes if needed
Vulnerability:
{issue details}
Return:
1) Patch diff
2) Why this fixes root cause
3) Tests added/updated
4) Residual risks and follow-up tasks
```

### C2: Defense-in-Depth Patch Prompt
```text
Produce a defense-in-depth remediation plan for this issue.
Include:
- Immediate hotfix
- Structural fix
- Policy-as-code guardrail
- Detection/alert rule
- Runbook update item
Issue:
{issue details}
```

## 8.4 Prompt Set D — Architecture Construction

### D1: Secure System Design Prompt
```text
Design a production architecture for {project description}.
Requirements:
- Prioritize secure-by-design and least privilege
- Include CI/CD hardening and secret management
- Include threat model assumptions
- Include data classification and retention policy
- Include observability and incident response hooks
Output:
- Architecture diagram in text blocks
- Trust boundaries
- Security controls per component
- Top 10 failure modes + mitigations
```

### D2: AI-Assisted Code Governance Prompt
```text
Design an AI coding governance workflow for this engineering team.
Need controls for:
- AI-generated insecure patterns
- Hallucinated package names
- Prompt injection in internal AI tools
- Mandatory human review + automated policy checks
Output:
- End-to-end workflow
- CI gates
- Reviewer checklist
- Exception handling process
```

---

## 9) Situation-Based Prompt Selector (Decision Table)

| Situation | Prompt to use first | Follow-up prompt |
|---|---|---|
| New repo, unknown risk | A1 Repo Security Snapshot | C2 Defense-in-Depth Patch Prompt |
| CI secrets keep leaking | A2 CI/CD Risk Audit | C1 Minimal-Risk Patch Prompt |
| Suspected auth bypass | B1 Broken Access Control Hunter | C1 Minimal-Risk Patch Prompt |
| GraphQL data overexposure | B2 GraphQL Abuse Hunter | C2 Defense-in-Depth Patch Prompt |
| Cloud credential abuse concern | B3 SSRF Pivot Hunter | D1 Secure System Design Prompt |
| Proxy/CDN strange behavior | B4 Request Smuggling Hunter | C2 Defense-in-Depth Patch Prompt |
| Starting a new product | D1 Secure System Design Prompt | D2 AI Code Governance Prompt |

---

## 10) Architecture Templates (Ready for Future Projects)

## 10.1 Template A — Low-Ops Secure Web App

- Frontend: modern SPA/PWA
- Auth: managed identity provider
- API: serverless functions with strict IAM role boundaries
- Data: managed DB with row-level security
- Storage: object store with signed URL access only
- Pipeline: signed builds, SBOM, SAST/SCA/IaC gates
- Runtime: WAF + centralized logs + alerting + backups

## 10.2 Template B — High-Assurance Regulated App

- Segmented environments (dev/stage/prod) with separate identities
- Policy-as-code enforced at deploy and runtime admission
- Provenance required for all artifacts
- Key management via HSM-backed services
- Immutable audit logging and incident forensics integration

## 10.3 Template C — AI-Integrated Application

- Prompt firewall / content controls for model inputs
- Output sanitization before any execution sink
- Tool permission scoping by action risk level
- Human-in-the-loop approvals for destructive actions
- Continuous red-team prompt abuse testing

---

## 11) Bug Report Structure Standard (for AI + Humans)

Use this exact format to improve triage quality:

1. **Title**: concise exploit path
2. **Category**: Common/Unusual/Rare + Expected/Unexpected
3. **Mapped Standards**: OWASP category, CWE, ATT&CK technique
4. **Asset at Risk**: data/system/process
5. **Exploit Preconditions**
6. **Reproduction Steps**
7. **Impact and Blast Radius**
8. **Likelihood and Confidence**
9. **Root Cause**
10. **Fix Plan** (hotfix + structural)
11. **Regression Tests**
12. **Operational Guardrails Added**

---

## 12) AI Agent Rules of Engagement (for your future projects)

### Non-negotiable instructions to include in prompts

- “Fix root cause, not surface symptoms.”
- “Do not change unrelated files or behavior.”
- “Provide tests for changed logic.”
- “Preserve compatibility unless explicitly approved.”
- “Map each finding to OWASP/CWE where possible.”
- “Flag uncertainty explicitly; do not fabricate claims.”

### Quality constraints

- Prefer minimal diffs for fixes.
- Block deploy on critical vulnerabilities.
- Require human review for privilege and auth changes.
- Treat AI-generated dependency suggestions as untrusted until verified.

---

## 13) 30-60-90 Day Implementation Plan

## First 30 Days (Baseline Control)

- Integrate SAST, SCA, secret scanning, IaC scanning in CI
- Implement severity-based merge gates
- Rotate and vault all secrets
- Build initial authz regression tests

## Day 31–60 (Structural Hardening)

- Add policy-as-code for infra and deploy checks
- Enforce runner egress restrictions
- Require signed artifacts + generate SBOM for each release
- Launch threat modeling for top 3 critical services

## Day 61–90 (Maturity Acceleration)

- Establish incident playbooks + security telemetry dashboards
- Add advanced DAST scenarios for logic and access control
- Implement AI code governance workflow and hallucinated package detection
- Define DSOMM target level and quarterly milestones

---

## 14) Master Checklists

## 14.1 Build/PR Checklist

- [ ] Secret scan passes
- [ ] SAST passes with no critical/high unresolved
- [ ] SCA passes policy threshold
- [ ] IaC/container checks pass
- [ ] Auth/authz tests pass for changed endpoints
- [ ] Risky changes received security-aware review

## 14.2 Release Checklist

- [ ] Artifact signed and provenance generated
- [ ] SBOM published and reviewed
- [ ] Deployment policy checks pass
- [ ] Rollback plan tested
- [ ] Monitoring and alert rules enabled
- [ ] Incident contacts and runbook verified

## 14.3 AI-Generated Code Checklist

- [ ] All generated code reviewed by human owner
- [ ] No hallucinated dependencies
- [ ] No unsafe sink usage from untrusted input
- [ ] Tests cover security-relevant behavior
- [ ] Prompt and model usage logged for traceability

---

## 15) Compact Prompt Bank (Quick Use)

### Quick Prompt: “Find likely criticals now”
```text
Find the top 5 likely critical vulnerabilities in this codebase right now.
Prioritize broken access control, SSRF paths, CI/CD secret leakage, dependency chain abuse, and insecure AI-generated patterns.
For each: show evidence, exploit path, severity rationale, and smallest safe fix.
```

### Quick Prompt: “Fix safely with tests”
```text
Patch this vulnerability with the smallest production-safe diff.
Add focused regression tests.
Do not refactor unrelated code.
Explain root cause, why patch works, and any residual risk.
Issue details: {paste details}
```

### Quick Prompt: “Design secure architecture fast”
```text
Propose a secure-by-design architecture for {project} with minimal operational overhead.
Include CI/CD controls, secret management, IAM model, telemetry, and incident readiness.
Give one default architecture and one high-assurance alternative.
```

---

## 16) Final Guidance: How to Use This Document Day-to-Day

1. Start with **Section 9** (Situation-Based Prompt Selector).
2. Copy the matching prompt from **Section 8**.
3. Execute fixes with **Section 8.3** templates.
4. Validate delivery using **Section 14** checklists.
5. Advance maturity using **Section 7** and **Section 13**.

If used consistently, this playbook turns ad hoc security effort into a repeatable engineering system.
