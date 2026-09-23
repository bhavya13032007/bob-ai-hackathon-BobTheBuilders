# Beginner's Step-by-Step Guide: Setting Up PM Internship Recommender

This assumes you know very little about deployment, APIs, or cloud accounts. Follow top to bottom, in order. Every step tells you exactly where to click and what to copy.

---

## PART A — Tools to Install on Your Computer (do this first, once)

1. **Git** — download from git-scm.com, install with default options. Verify by opening a terminal/command prompt and typing `git --version` — you should see a version number.
2. **Node.js (LTS version)** — download from nodejs.org, install with default options. Verify: `node --version` and `npm --version`.
3. **Python 3.11+** — download from python.org. During install, **check the box "Add Python to PATH"** — this is the most commonly missed step. Verify: `python --version`.
4. **Docker Desktop** — download from docker.com, install, and open it once so it's running in the background. Verify: `docker --version`.
5. **A code editor** — VS Code (code.visualstudio.com) is the standard choice.
6. **GitHub account** — sign up free at github.com if you don't have one.

---

## PART B — Create Your GitHub Repository

1. Go to github.com → click the **"+"** icon top-right → **"New repository"**.
2. Name it (e.g., `pm-internship-recommender`), set it to **Private** (recommended while building), check **"Add a README"**, click **Create repository**.
3. On your computer, open a terminal, navigate to a folder where you keep projects, and run:
   ```
   git clone https://github.com/YOUR-USERNAME/pm-internship-recommender.git
   cd pm-internship-recommender
   ```
4. Open this folder in VS Code (`File → Open Folder`).
5. This is the folder you'll point Antigravity to when you give it the master prompt.

---

## PART C — Signing Up for Each Service (do these one at a time; some take a few days to approve, so start the slow ones first)

### 1. Render (backend + database hosting) — start here, it's free to sign up
1. Go to render.com → **Sign Up** → sign up with your GitHub account (easiest, connects automatically).
2. You don't need to create anything yet — just having the account is enough for now. Antigravity/you will create the actual "Web Service" and "PostgreSQL" and "Redis" instances later once the code exists.

### 2. Vercel (frontend hosting)
1. Go to vercel.com → **Sign Up** → sign up with GitHub.
2. Same as above — account created now, project connected later once there's code to deploy.

### 3. AWS S3 or Cloudflare R2 (file storage for resumes/certificates) — R2 is simpler for beginners
1. Go to cloudflare.com → **Sign Up** → verify your email.
2. In the dashboard left sidebar, find **R2 Object Storage** → click **"Create bucket"** → name it e.g. `pm-internship-files` → Create.
3. Go to **R2 → Manage API Tokens** → **Create API Token** → give it read/write permissions on your bucket → **Create Token**.
4. Copy the **Access Key ID** and **Secret Access Key** shown — paste these somewhere safe (a temporary notes file) right now, because the secret is only shown once.

### 4. Bhashini (Indian language voice/translation) — start this early, government approval can take time
1. Go to bhashini.gov.in → look for **"API Access"** or **"Developer"** section (usually under a "Services" or "Ulca" portal link).
2. Register with your email and a short description of your project ("SIH prototype — internship recommendation platform for youth").
3. You'll receive API credentials by email once approved. If it's delayed past a few days, don't block your build — the master prompt already includes a fallback to the browser's built-in Speech Recognition, so you can build and test everything else in the meantime.

### 5. Firebase (Web Push notifications + optional login)
1. Go to firebase.google.com → **Get Started** → sign in with a Google account.
2. Click **"Add project"** → name it → follow the prompts (you can disable Google Analytics for this project, not needed) → **Create project**.
3. Once created, click the **gear icon → Project settings → Cloud Messaging tab**.
4. Under "Web configuration," click **"Generate key pair"** — this gives you a **VAPID key** (copy it).
5. Still in Project Settings, go to the **"Service accounts"** tab if you need server-side push (Antigravity will tell you exactly which key format it needs when it reaches Phase 4 — copy whichever it asks for).

### 6. MSG91 or Gupshup (SMS/WhatsApp) — optional for MVP, can skip initially
1. Go to msg91.com → **Sign Up** → verify your phone number and email.
2. In the dashboard, find **API Keys** (usually under Settings) → copy your **Auth Key**.
3. WhatsApp Business API approval is a separate, longer process — **skip this for your first working version**. The app is built to work fine without it (falls back gracefully).

### 7. SendGrid (email)
1. Go to sendgrid.com → **Start for Free** → sign up.
2. Go to **Settings → API Keys → Create API Key** → give it "Full Access" → copy the key immediately (shown once).
3. Under **Settings → Sender Authentication**, verify a single sender email (your own email is fine for testing) — you'll need to click a confirmation link.

### 8. Sentry (error tracking)
1. Go to sentry.io → **Sign Up** (free tier is enough).
2. Click **"Create Project"** → choose **Python** for one project (backend) and **Next.js** for another (frontend) → name them → Create.
3. Each project gives you a **DSN** (a URL-looking string) — copy both.

### 9. PostHog (analytics — optional but recommended)
1. Go to posthog.com → **Sign Up**.
2. Create a project → copy the **Project API Key** shown on the setup screen.

### 10. OpenStreetMap Nominatim (location/geocoding)
- No signup needed — it's a free public API. Just note their usage policy: don't send more than ~1 request per second (fine for a prototype).

---

## PART D — Setting Up Your Environment Variables

1. Once Antigravity generates the project structure, you'll see two files: `frontend/.env.example` and `backend/.env.example`.
2. **Duplicate** each file and rename the copy to `.env` (remove `.example`), in the same folder.
3. Open each `.env` file in VS Code. For every line like `KEY_NAME=`, paste the matching value you collected in Part C. For example:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/internship_db
   REDIS_URL=redis://localhost:6379
   S3_ACCESS_KEY=your-cloudflare-r2-access-key
   S3_SECRET_KEY=your-cloudflare-r2-secret-key
   BHASHINI_API_KEY=your-key-or-leave-blank-for-now
   FIREBASE_SERVER_KEY=your-vapid-key
   SENDGRID_API_KEY=your-sendgrid-key
   SENTRY_DSN=your-sentry-dsn
   JWT_SECRET=make-up-any-long-random-string-here
   ```
4. For any key you don't have yet (Bhashini pending, MSG91 skipped), just **leave it blank** — do not delete the line, just leave the value empty. The app is built to fall back gracefully.
5. **Very important:** open the `.gitignore` file in your project and confirm `.env` is listed there. This stops your secret keys from accidentally being uploaded to GitHub. If it's not listed, add a new line that just says `.env`.

---

## PART E — How to Verify Each Build Phase (as a beginner)

After Antigravity finishes each phase from the master prompt, do this before letting it continue:

**Phase 0 (setup):**
- In your terminal, inside the project folder, run: `docker-compose up`
- Wait for it to finish starting (you'll see logs stop scrolling).
- Open a browser and go to `http://localhost:3000` — you should see a basic webpage (even if empty/placeholder, that's fine).
- Go to `http://localhost:8000/health` — you should see something like `{"status": "ok"}`.
- If either doesn't load, copy the error text from the terminal and ask Antigravity to fix it before moving on.

**Phase 1 (data/backend):**
- Go to `http://localhost:8000/docs` — this is an auto-generated page listing every API route. Click on a route like `GET /internships`, click **"Try it out"** → **"Execute"** — you should see sample internship data returned as JSON.
- If you see an empty list or an error, tell Antigravity: "the seed data isn't showing in /internships, please check."

**Phase 2 (matching engine):**
- In `/docs`, find the `/recommend` route, try it with a sample candidate ID → you should get back 3-5 internships with score explanations, not an error or empty list.
- Read the "why this matches" text yourself — does it make sense in plain English? If it's confusing or wrong, describe the issue to Antigravity.

**Phase 3 (resume/certificates):**
- In `/docs`, find the resume upload route, use "Try it out" to upload a real PDF resume from your own computer.
- Check that the returned fields (name, skills, education) roughly match what's actually on your resume. It won't be perfect — that's expected — but it shouldn't be completely wrong or blank.

**Phase 4 (notifications):**
- Trigger an action that should send a notification (e.g., apply to an internship via `/docs`).
- Check your database (or ask Antigravity to show you the `notifications` table contents) to confirm a row was created.
- If you configured a real SendGrid key, check your actual email inbox for a test message.

**Phase 5 (frontend):**
- Open `http://localhost:3000` in your browser.
- Resize your browser window small (or open Chrome DevTools → toggle device toolbar, the phone icon) to check it looks right on mobile.
- Click through the whole flow yourself: landing page → start wizard → answer each question → see results → click into a detail page.
- If anything looks broken or a button doesn't respond, note exactly what page and what you clicked, and tell Antigravity.

**Phase 6 (API integration/error handling):**
- Temporarily remove one value from your `.env` file (e.g., blank out `BHASHINI_API_KEY`), restart the app, and try the voice input button — it should quietly fall back to browser speech, not crash the whole page.
- Put the real key back afterward.

**Phase 7 (deployment):**
- Once Antigravity has helped connect your GitHub repo to Vercel and Render, you'll get a live URL (something like `your-project.vercel.app`).
- Open that link on your actual phone, not just your computer — this is the real test of the "mobile-first, low-literacy-friendly" goal.
- Walk through the entire candidate journey one more time on the live link before considering it done.

---

## PART F — Content You Need to Prepare Yourself

Antigravity can't invent real content — gather these while it's building:

1. **Internship listings** — even 15-20 realistic entries (title, sector, required skills, location, stipend, duration) make the demo far more convincing than placeholder "Lorem ipsum" data. You can base these loosely on real PM Internship Scheme listings (publicly viewable on the scheme's portal) for realism.
2. **A skills list** — a plain text or spreadsheet list of ~50-100 common skills (e.g., "MS Excel," "Communication," "Tally," "Basic Coding," "Customer Service") so the matching engine and resume parser have something concrete to match against.
3. **2-3 sample resumes** — your own, a friend's, or a template found online (in PDF format) to test the resume upload feature.
4. **Hindi translations** — even a basic set of translated UI phrases ("Get Started" → "शुरू करें", etc.) for the language switcher to actually show something real instead of English placeholders.
5. **Optional:** a couple of short (30-second) sample audio clips (recorded on your phone is fine) describing a mock internship, to test the "Internship Radio" feature.

---

## PART G — Final Checklist Before Your SIH Demo

- [ ] Live URL loads correctly on a phone with mobile data (not just wifi).
- [ ] Full candidate journey works start to finish without errors.
- [ ] Full company journey (viewing an applicant, verifying a certificate) works.
- [ ] At least one notification type actually arrives (push or email) during a live test.
- [ ] No visible console errors (in Chrome, right-click → Inspect → Console tab — should be clean or near-clean).
- [ ] You have a 2-3 minute screen-recorded backup video of the working app, in case venue wifi fails during your presentation.
- [ ] Your `.env` file with real secrets is NOT visible anywhere in your GitHub repo (double-check by browsing your repo on github.com — you should not see a `.env` file listed, only `.env.example`).

---

### If you get stuck
When Antigravity produces an error, copy the **exact error message** (not a paraphrase) and paste it back to it, or to me, along with which Phase/step you were on — exact error text is what makes debugging fast, vague descriptions like "it doesn't work" slow everything down.
