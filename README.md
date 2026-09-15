# 🚀 CareerSetu AI - PM Internship Recommender

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | BobTheBuilders |
| **Track** | AI |
| **Team Lead** | brijesh patel — 25dce076@charusat.edu.in |
| **Members** | bhavya patel, divya paradiya, femi dungrani |

---

## 🎯 Problem Statement

> In 2–3 sentences: What problem does your project solve? Who experiences this problem?

Youth applying to the PM Internship Scheme — particularly first-generation learners from rural, tribal, and remote-college backgrounds with limited digital exposure — struggle to identify which of the hundreds of listed internships actually match their skills, interests, and location, leading to misaligned applications and missed opportunities. This is compounded by low digital literacy, language barriers, and a lack of any way to verify informally-acquired skills, leaving many capable candidates effectively locked out of a scheme meant to serve them. The result is a system where opportunity exists in abundance, but access to the *right* opportunity does not.

---

## 💡 Solution

> In 2–3 sentences: What did you build? How does it solve the problem above?

We built an AI-powered internship recommendation platform for the PM Internship Scheme that matches candidates to 3–5 explainable internships using a hybrid engine — rule-based filtering, TF-IDF/RapidFuzz skill matching, and proximity-based location scoring — instead of forcing users to sift through hundreds of listings themselves. It solves the core problem of misaligned applications among first-generation, low-digital-literacy candidates by pairing this matching engine with an accessible, icon-driven, voice-enabled, mobile-first interface (resume auto-fill, multilingual support, offline-capable PWA) so users never need to type or read more than necessary. The core mechanism is a transparent scoring pipeline that explains why each internship was recommended and re-ranks results for diversity across sectors — building trust while surfacing genuinely relevant opportunities a candidate might otherwise miss.

---

## ✨ Key Features

- **Feature 1:** Hybrid AI Matching Engine: Combines rule-based filtering, TF-IDF + RapidFuzz skill scoring, and haversine-based location proximity to recommend 3–5 explainable internships instead of a raw list.
- **Feature 2:** Explainable "Why This Internship?" Panel: Every recommendation shows the exact factors behind its score (skills matched, distance, sector fit) so candidates can trust and understand the match.
- **Feature 3:** Resume Auto-Fill & Certificate Verification: Candidates upload a resume to auto-populate their profile, and companies can verify uploaded certificates in-app — building a portable, trusted credential record.
- **Feature 4:** Accessibility-First, Multilingual UI: Icon-driven, voice-enabled (mic input), mobile-first PWA with English/Hindi language toggle — built for first-generation, low-digital-literacy users.
- **Feature 5:** Diversity Re-Ranking & Gamified Profile: MMR-style re-ranking ensures varied sector/organization recommendations, while a profile-completion tracker with certificate-based Match Boosts encourages candidates to strengthen their applications.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python, JavaScript (JSX) |
| **Frameworks** | FastAPI (backend), React + Vite + Tailwind CSS (frontend), APScheduler (scheduled jobs) |
| **IBM Technologies** | watsonx.ai (Granite model — natural-language "why this match" explanations) |
| **Databases** | PostgreSQL (via Supabase), SQLite (local dev) |
| **Other** | pdfplumber / python-docx (resume parsing), RapidFuzz + scikit-learn TF-IDF (matching engine), geopy/Nominatim (geocoding), Web Speech API + Bhashini (voice/language), Cloudflare R2 (file storage), Firebase Cloud Messaging (push notifications), canvas-confetti (UI), Vercel + Render (deployment), GitHub Actions (CI), pytest (testing) |

---

## 📁 Repository Structure

```
├── src/
│   ├── backend/          # FastAPI app — matching engine, resume parsing, certificates, notifications
│   └── frontend/         # React + Vite + Tailwind — candidate & company-facing UI
├── docs/
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/
│   ├── screenshots/
│   └── demo-video-link.txt
├── presentation/
└── submission.yaml
```

---

## ⚡ How to Run

> **Copy these exact steps from your [`docs/setup-guide.md`](docs/setup-guide.md)**

```bash
# 1. Clone the repo
git clone https://github.com/BobTheBuilders/CareerSetu-AI.git
cd CareerSetu-AI

# 2. Install dependencies
cd backend
pip install -r requirements.txt
cd ../frontend
npm install

# 3. Configure environment
cd ../backend
cp .env.example .env
cd ../frontend
cp .env.example .env
# Edit both .env files with your Supabase, Cloudflare R2, Firebase, and (optional) watsonx.ai/Bhashini keys

# 4. Run the project
# Terminal 1 — backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 — frontend
cd frontend
npm run dev
```

---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations

> Be honest — judges appreciate transparency over overclaiming.

1. Company authentication is a lightweight header-based stub (x-company-id), not full JWT/OAuth. It correctly rejects missing headers but does not yet verify company identity — flagged with a TODO in certificates.py for a production auth system.
2. SMS/WhatsApp notification channels are provider-stubbed. The dispatch logic is fully built and abstracted (MSG91/Gupshup-ready), but live credentials aren't wired in since WhatsApp Business API approval has a longer external approval timeline than this build cycle.
3. The deadline-reminder job runs via APScheduler inside the app process (no external Celery/Redis) to stay within free-tier hosting — on a free-tier host that sleeps when idle, the daily job only fires while the app is awake. A manual trigger endpoint exists for demo purposes.
4. watsonx.ai-generated explanations are optional and toggleable, defaulting to a template-based explanation if disabled — this was a deliberate design choice for reliability, not an oversight.
5. Tested primarily on Chrome/Edge (desktop) and mobile-viewport emulation; broader cross-browser (Safari/Firefox) testing has not been exhaustive.

---

## 🏅 What We're Most Proud Of

The explainable, hybrid matching engine is the core of this submission — rather than relying on an opaque black-box model, it combines transparent rule-based filtering, TF-IDF + RapidFuzz skill matching, and haversine-based location proximity, then re-ranks results for sector/organization diversity. Every recommendation ships with a genuine factor-by-factor breakdown (skills matched, distance, sector fit), which we layer watsonx.ai on top of purely to phrase in natural language — the underlying decision-making stays fully interpretable and auditable, never delegated to a model no one can inspect. Paired with an accessibility-first UI (voice input, icon-driven design, offline-capable PWA, resume auto-fill), this is built to genuinely work for the first-generation, low-digital-literacy candidates the PM Internship Scheme is meant to reach — not just for users who are already digitally confident.

---
