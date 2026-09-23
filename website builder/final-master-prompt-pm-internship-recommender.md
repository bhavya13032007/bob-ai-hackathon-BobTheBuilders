# FINAL MASTER PROMPT: PM Internship Recommender — Complete Build Spec for AI Agent

Paste everything between "MASTER PROMPT START" and "MASTER PROMPT END" into your agent (Antigravity). It is written as a phased, self-checking build plan so the agent implements incrementally, validates each phase before moving to the next, and avoids compounding errors.

---

## MASTER PROMPT START

You are a senior full-stack engineer and product architect. Build a complete, production-quality prototype of **"PM Internship Recommender"** — an AI-based internship matching platform for India's PM Internship Scheme, serving first-generation, low-digital-literacy candidates (rural, tribal, urban-slum, remote-college) as well as recruiting companies.

**Work in the phased order below. After completing each phase, verify it builds/runs and passes basic manual/automated checks before starting the next phase. Do not skip verification steps — this project must run without errors end-to-end.**

---

### PHASE 0 — Project Setup

- Initialize a monorepo with two apps: `/frontend` (Next.js + Tailwind) and `/backend` (FastAPI).
- Set up `Docker` + `docker-compose.yml` covering: frontend, backend, PostgreSQL, Redis — so `docker-compose up` runs the entire stack locally with one command.
- Add `.env.example` files for both apps listing every required environment variable (see Phase 6 for the full list) — never hardcode secrets/API keys.
- Set up GitHub Actions CI: lint + type-check + test on every push, for both frontend and backend.
- **Verify:** `docker-compose up` succeeds, backend responds on `/health`, frontend loads a placeholder home page.

---

### PHASE 1 — Data Model & Backend Foundation

Implement PostgreSQL schema (use SQLAlchemy models + Alembic migrations) for:
- `candidates`: id, name, phone, education_level, location (state, district, lat, long), skills (array), sector_interests (array), experience_notes, resume_url, language_pref, created_at.
- `internships`: id, title, org_id, sector, required_skills (array), location (state, district, lat, long), remote_ok, education_required, stipend, duration, deadline, description.
- `companies`: id, name, verified_employer (bool), contact_email.
- `certificates`: id, candidate_id, title, issuer, issue_date, file_url, verification_status (enum: pending/verified/rejected), verified_by, verified_at.
- `applications`: id, candidate_id, internship_id, status (enum: applied/under_review/selected/onboarding), created_at, updated_at.
- `notifications`: id, user_id, user_type (enum: candidate/company), type, message, related_id, channel, status, read_at, created_at.

Build FastAPI routes with Pydantic request/response validation for every table (CRUD as needed) under `/candidates`, `/internships`, `/companies`, `/certificates`, `/applications`, `/notifications`. Add proper HTTP error handling (404, 422, 500) with clear JSON error messages — never let an unhandled exception return a raw stack trace to the client.

**Verify:** Seed script populates 20-30 mock internships, 5-10 companies, 5 mock candidates. All CRUD routes tested via automated pytest tests (happy path + at least one error case each) and pass.

---

### PHASE 2 — Hybrid Matching Engine (core logic, isolated & unit-tested)

Build `/backend/matching/` as a standalone, pure-function module — no FastAPI dependency inside it, so it's independently testable.

1. **Hard filter:** exclude internships where `education_required` isn't met (configurable strictness flag).
2. **Skill scoring:** TF-IDF (scikit-learn) cosine similarity between candidate skills text and internship required-skills text, combined with RapidFuzz fuzzy matching to catch synonyms/near-spellings (e.g., "MS Excel" vs "Excel").
3. **Location scoring — proximity, not exact match:** geocode via OpenStreetMap Nominatim (cache results in Redis to avoid repeat lookups); compute haversine distance; score in tiers (same district > within 50km > within state > other state); if `remote_ok` is set by candidate, remote internships score at maximum regardless of distance.
4. **Sector-interest scoring:** weighted match against candidate's stated sector interests.
5. **Experience relevance:** light-weight scoring bonus if candidate notes mention related past experience.
6. **Weighted combination:** combine all sub-scores into one relevance score per internship; make weights configurable constants (not magic numbers scattered in code).
7. **Diversity re-ranking:** after ranking by relevance, apply an MMR-style re-ranking so the final top 3-5 span at least 2-3 different sectors and no more than 1-2 listings per organization, without dropping below a minimum relevance threshold.
8. **Explainability output:** for every returned recommendation, return the contributing factor breakdown (education match, skill overlap %, distance km, sector match) so the frontend can render a plain-language "Why this internship?" panel.

**Verify:** Write unit tests with a fixed mock dataset covering: correct filtering, correct proximity tiering, correct diversity spread (assert no more than 2 results share an org), and correct explainability output structure. All tests pass before moving to Phase 3.

---

### PHASE 3 — Resume Parsing & Certificate Verification

**Resume parsing (`/backend/resume/`):**
- Accept PDF/DOCX upload; extract text via `pdfplumber` (PDF) / `python-docx` (DOCX).
- Run lightweight NLP/regex + skills-taxonomy keyword matching (spaCy or a curated skills dictionary) to extract: name, education level, skills, past experience, certifications mentioned.
- Return extracted fields to the frontend as a **pre-filled but editable** draft — never auto-save without explicit candidate confirmation.
- Handle malformed/unreadable files gracefully (clear error message, fallback to manual wizard entry) — this must never crash the request.

**Certificate verification (`/certificates` routes):**
- Candidate uploads certificate file + metadata → stored in object storage (S3/R2), record created with `verification_status = pending`.
- Company-side authenticated route to list certificates for their applicants, and to update `verification_status` to `verified`/`rejected` with an optional note — log `verified_by` and `verified_at`.
- On status change, trigger a notification event (Phase 4) back to the candidate.

**Verify:** Upload a sample PDF resume and confirm correct field extraction in a test; upload a malformed file and confirm graceful error (not a 500); simulate a company verifying a certificate and confirm status + notification fire correctly.

---

### PHASE 4 — Notifications

- Implement `/backend/notifications/` as an event-driven module: a single `send_notification(user_id, type, message, related_id, channels)` function called from matching, application-status-change, and certificate-verification events — never scatter notification logic across unrelated routes.
- **Channels:**
  - In-app: write to `notifications` table, expose `GET /notifications` + `PATCH /notifications/{id}/read` for the bell-icon panel with unread badge.
  - Web Push: integrate Firebase Cloud Messaging via the frontend service worker (PWA).
  - SMS/WhatsApp: implement as a provider-abstracted interface (`notify_sms()`, `notify_whatsapp()`) — stub with a mock provider in dev, wire to MSG91/Gupshup/Twilio via env-configured API keys in production.
  - Email: SendGrid, optional weekly digest.
- Add a Celery + Redis background worker for: async notification dispatch (don't block the main request thread), and a daily scheduled job checking upcoming internship deadlines to enqueue reminder notifications.
- Let candidates set per-type channel preferences (settings endpoint + UI toggle).

**Verify:** Trigger each event type (new match, status change, certificate verified, deadline reminder) in a test environment and confirm a `notifications` row is created and the correct mock channel function is called without error.

---

### PHASE 5 — Frontend (React/Next.js + Tailwind, PWA)

Build using the design system and screens below. Reuse a shared component library: `Card`, `Chip`, `ProgressRing`, `StepIndicator`, `AudioPlayer`, `StatusTracker`, `Checklist`, `Banner`, `MicButton`, `NotificationBell`.

**Design system:**
- Palette: warm off-white base, one bold primary accent (deep indigo/saffron-leaning), one energetic CTA accent (coral/teal); WCAG AA contrast everywhere.
- Type: geometric sans for headings, humanist sans for body, 16px minimum, 1.5-1.6 line-height.
- Rounded cards (16-20px radius), soft shadows, pill-shaped chips.
- Icon-paired labels everywhere (never icon-only for critical actions) — essential for low-literacy users.
- Mobile: bottom tab nav, sticky CTAs, single column. Tablet: 2-column grids. Desktop: multi-column, hover states, max-width ~1280px containers.
- Motion: transform/opacity-only micro-interactions, skeleton loaders (not spinners), 200-250ms transitions.

**Screens to build:**
1. **Landing page** — hero, trust badges, 3-step explainer, success-story carousel.
2. **Guided wizard** — one question per step (education, skills, sector, location + remote toggle, optional free-text), mic button per step (Bhashini/Web Speech API), progress indicator, autosave, back navigation. Include a **"Upload resume instead"** alternate path that pre-fills the same wizard steps from Phase 3's parser output for review.
3. **Matching/loading state** — skeleton cards + reassuring copy while backend scores.
4. **Recommendation results** — 3-5 diversified cards, each with match indicator, ✅💰📍 icon-chip row, "Why this internship?" expandable explainability panel, skill-gap coaching strip with course links, verified-employer badge, internship-radio play button, bookmark, "View Details" CTA; collapsed "See more options" list; "Refine my answers" link back to wizard.
5. **Internship detail page** — full description, radio trailer, application readiness checklist, family/guardian share button, mentor mini-profile with "Connect," sticky "Apply Now" CTA.
6. **Candidate dashboard** — profile completion ring, saved internships, certificates section with verification badges, application status tracker (Applied → Under Review → Selected → Onboarding), notification bell, guidance-on-demand banner.
7. **Mentor request flow** — simple chip-based request form + confirmation state.
8. **Company dashboard** (separate auth-gated route, desktop-optimized) — applicant list per listing, certificate review/verification actions, match-rationale view, notification settings.
9. **Settings** — language switcher (i18n dictionary-driven, EN/HI minimum), notification channel preferences.

**PWA requirements:** service worker for offline caching of last-fetched recommendations ("Lite Mode" banner when offline), Web Push subscription wiring, installable manifest.

**Verify:** Every screen renders correctly at mobile/tablet/desktop breakpoints with no layout breakage; run Lighthouse and fix any accessibility/performance score below 85; confirm the full user journey (landing → wizard or resume upload → results → detail → apply → dashboard) is clickable end-to-end with real API calls, not mocked data, before calling this phase done.

---

### PHASE 6 — Environment Variables & External API Integration

Document and wire these into `.env.example` (never commit real keys):
```
DATABASE_URL=
REDIS_URL=
S3_BUCKET / S3_ACCESS_KEY / S3_SECRET_KEY   (or R2 equivalents)
BHASHINI_API_KEY
GOOGLE_TRANSLATE_API_KEY        (optional fallback)
FIREBASE_SERVER_KEY             (Web Push)
MSG91_API_KEY / GUPSHUP_API_KEY (SMS/WhatsApp — stub in dev)
SENDGRID_API_KEY
NOMINATIM_BASE_URL              (default public OSM endpoint; self-host if scaling)
JWT_SECRET
SENTRY_DSN
AFFINDA_API_KEY                 (optional resume-parsing upgrade)
```
Every external API call must be wrapped in try/except with a graceful fallback (e.g., if Bhashini is unreachable, fall back to Web Speech API; if geocoding fails, fall back to state-level centroid coordinates) — the app must never hard-crash due to a third-party API outage.

**Verify:** Temporarily disable each external API in dev and confirm the app degrades gracefully (feature disables/falls back) rather than throwing unhandled errors.

---

### PHASE 7 — Testing, Monitoring & Deployment

- **Testing:** backend unit tests (pytest) for matching engine, resume parser, notification triggers; frontend component tests (React Testing Library) for wizard flow and recommendation card rendering; at least one end-to-end test (Playwright/Cypress) covering the full candidate journey.
- **Monitoring:** integrate Sentry (both frontend and backend) for error tracking; integrate PostHog or equivalent for wizard drop-off analytics.
- **Deployment:** frontend → Vercel; backend + Celery worker + Redis → Render/Railway (or a single docker-compose-based VM for demo); PostgreSQL managed instance (Render/Supabase/RDS).
- Add a `README.md` with: setup instructions, architecture diagram description, environment variable list, and how to run tests.

**Verify:** Deploy to a staging environment and run the full candidate + company journey live before considering the build complete. Fix any console errors, failed network requests, or broken links found during this pass — the project should run with zero unhandled errors end-to-end.

---

### Non-Negotiable Quality Bar (apply throughout every phase)
- No unhandled exceptions reach the user — always catch, log (Sentry), and show a friendly fallback UI.
- No hardcoded secrets/API keys anywhere in source.
- Every form/input validated both client-side and server-side.
- Every async operation (API calls, uploads) has a loading state and an error state designed in the UI — never a blank screen or infinite spinner.
- Code is componentized and commented where logic isn't self-evident, so a new engineer (or judge reviewing the repo) can follow it.

## MASTER PROMPT END

---

### How to use this
Paste the full block above into Antigravity as a single prompt. If the agent has a "plan mode," ask it to first output its phase-by-phase execution plan against this spec, confirm it matches the order above, then proceed phase by phase with verification before continuing — this is what prevents compounding errors in a large agentic build.
