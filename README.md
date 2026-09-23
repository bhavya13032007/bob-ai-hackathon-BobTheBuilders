# Loopin (formerly CareerSetu AI)

An intelligent gateway and matching engine for the PM Internship Scheme, designed to connect India's first-generation candidates with top corporate opportunities using AI-driven skill matching and zero paperwork complexity.

## 🚀 Features

- **Hybrid Matching Engine:** Uses TF-IDF and RapidFuzz to match candidate skills, education, and geospatial proximity against internship requirements.
- **Smart Resume Parsing:** Auto-extracts details from uploaded PDFs.
- **Guided Wizard & Skill Assessment:** Gamified onboarding flow with mandatory skill quizzes.
- **Premium User Interface:** Responsive, split-screen authentication, skeleton loading states, and micro-interactions.
- **Multilingual & Accessible:** Built-in English/Hindi toggle and voice input capabilities.
- **Corporate Portal:** Allows companies to manage applicants and verify certificates.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Firebase Auth
- **Backend:** FastAPI, Python, SQLAlchemy, SQLite
- **AI/Matching:** Scikit-learn (TF-IDF), RapidFuzz

## 📦 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/bhavya13032007/bob-ai-hackathon-BobTheBuilders.git
cd bob-ai-hackathon-BobTheBuilders
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📜 License
MIT License
