# Product Requirements Document (PRD)

## 1. Project Overview
**Project Name:** Loopin - PM Internship Recommender Platform
**Target Audience:** Youth seeking internships under the PM Internship Scheme, and enterprises looking for verified candidates.
**Goal:** To build an intelligent, scalable, and inclusive platform that seamlessly matches candidates with the most suitable internship opportunities using AI-driven skill matching, geo-proximity mapping, and automated profile verification.

## 2. Problem Statement
Under the PM Internship Scheme, millions of candidates need to be mapped to thousands of internship roles across India. Manual mapping is highly inefficient, prone to bias, and fails to consider localized constraints (distance, remote work) and nuanced skill sets (e.g., matching "Data Science" with "Machine Learning"). There is a need for a unified platform that automatically parses resumes, verifies certificates, and provides explainable AI recommendations to both candidates and employers.

## 3. Key Features & Requirements

### 3.1. AI Matching Engine (Core)
- **Skill Matching:** Utilizes Fuzzy String Matching and Set Intersection (Jaccard Similarity) to map candidate skills against internship requirements, handling typos and alternative terminologies.
- **Geo-Proximity Scoring:** Computes the Haversine distance between the candidate's location (State/District) and the internship location, giving higher weight to closer opportunities or remote-friendly roles.
- **Education Hierarchy:** Automatically evaluates eligibility based on a strict educational hierarchy (e.g., 10th -> 12th -> Diploma -> Graduate -> PG).
- **Diversity Re-Ranking (MMR):** Uses Maximal Marginal Relevance to ensure the top 5 recommendations presented to the candidate are diverse across different sectors and organizations, preventing monotony.

### 3.2. IBM Watsonx AI Integration (Evaluator Highlight)
- **Explainable AI (XAI):** Uses IBM Watsonx generative AI to explain *why* a candidate was matched with a specific internship.
- **Skill Coaching:** The LLM generates plain-language nudges (e.g., "To boost your match to 98%, consider brushing up on Python.") based on missing skills.

### 3.3. Profile Building & Resume Parsing
- **Document Support:** Accepts PDF, DOCX, and TXT resume uploads.
- **Automated Parsing:** Extracts skills, education, and experience directly from uploaded resumes to auto-fill the candidate profile wizard.

### 3.4. Certificate Verification
- **Integration:** Integrates with mock APIs of Skill India Digital, Swayam, and NPTEL.
- **Gamification Boost:** Verified certificates grant an automatic "trust boost" to the candidate's match percentage for relevant roles.

### 3.5. Multi-Channel Notifications
- **Event-Driven:** Triggers alerts for application deadlines, new high-match internships, and employer updates.
- **Channels:** Modular architecture supporting push notifications, WhatsApp (Gupshup), SMS (MSG91), and Email (SendGrid).

## 4. System Architecture

### 4.1. Frontend (Client-Side)
- **Framework:** React.js powered by Vite.
- **UI/UX:** Responsive, modern interface with a multi-step Profile Wizard.
- **Deployment:** Vercel Global Edge Network.

### 4.2. Backend (Server-Side)
- **Framework:** FastAPI (Python 3.12).
- **Database:** SQLite (Development/Vercel tmp) via SQLAlchemy ORM.
- **Architecture:** Modular router-based architecture (`/candidates`, `/internships`, `/recommend`, `/resume`, `/certificates`).
- **Optimization:** Completely serverless-compatible, highly optimized dependencies (under 250MB limit to bypass Vercel AWS Lambda constraints).

## 5. User Flows

### Candidate Flow
1. **Onboarding:** Candidate signs up and is directed to the Match Wizard.
2. **Profile Creation:** Candidate uploads a resume, which is parsed to extract skills.
3. **Preferences:** Candidate inputs location (State/District) and sector interests.
4. **Recommendation:** The backend engine runs the hybrid matching algorithm and returns the Top 5 diverse matches.
5. **Action:** Candidate reads the IBM Watsonx generated explanation and clicks "Apply".

## 6. Non-Functional Requirements (NFRs)
- **Performance:** Recommendation engine must score and rank thousands of internships in under 2 seconds.
- **Scalability:** Stateless FastAPI backend deployed on serverless functions to handle traffic spikes during hackathon demos and national rollouts.
- **Security:** Firebase Admin SDK used for strict JWT authentication and verification. Strict CORS policies applied.
- **Fault Tolerance:** Robust fallback mechanisms built-in (e.g., if Watsonx API rate-limits, the system falls back to standard heuristic explanations).

## 7. Future Roadmap (Post-Hackathon)
- Migration from SQLite to a managed PostgreSQL cluster (e.g., Supabase or Neon).
- Integration of a vector database (Pinecone/Milvus) for semantic semantic search using dense embeddings.
- Full two-way dashboard for Enterprise Employers to auto-shortlist candidates based on the same matching engine.
