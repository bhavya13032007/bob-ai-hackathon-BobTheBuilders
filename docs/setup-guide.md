# Setup Guide

> **This file is read by the automated evaluation pipeline. Be precise and complete.**

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.11+
- Node.js 18+
- An IBM Cloud account with watsonx.ai access (optional, but required for AI explanations)

## Environment Variables

Copy `.env.example` to `.env` in both `backend` and `frontend` directories and fill in the values:

```bash
cd src/backend
cp .env.example .env

cd ../frontend
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `WATSONX_API_KEY` | Your IBM watsonx.ai API key | No (falls back to templates) |
| `WATSONX_PROJECT_ID` | Your watsonx.ai project ID | No |
| `DATABASE_URL` | PostgreSQL connection string | No (defaults to local SQLite) |

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/BobTheBuilders/CareerSetu-AI.git
cd CareerSetu-AI/src

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Set up the database (Local SQLite is automatic on first run)
cd ../backend
alembic upgrade head
```

## Running the Application

```bash
# Start the backend
cd src/backend
uvicorn app.main:app --reload
# Runs on http://localhost:8000

# Start the frontend (in a separate terminal)
cd src/frontend
npm run dev
# Runs on http://localhost:5173
```

The application will be available at: `http://localhost:5173`

## Running Tests

```bash
cd src/backend
pytest tests/ -v
```

## Quick Demo

You can run the backend seed script to populate the local database with mock internships and candidates:

```bash
cd src/backend
python run.py
```

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` again |
| Database connection refused | If using Postgres, ensure it is running. Otherwise, remove `DATABASE_URL` from `.env` to use local SQLite. |
| watsonx.ai 401 error | Check `WATSONX_API_KEY` in your `.env` file |
