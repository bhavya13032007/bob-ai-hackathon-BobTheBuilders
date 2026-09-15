from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import UPLOAD_DIR
from app.db.database import engine, Base, SessionLocal
from app.db.models import Internship
from app.db.seed_data import seed_database
from app.routers import (
    candidates,
    internships,
    recommend,
    resume,
    certificates,
    companies,
    notifications
)
from app.notifications.service import notification_service

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Auto seed if empty
db = SessionLocal()
try:
    if db.query(Internship).count() == 0:
        print("Database is empty. Seeding initial data...")
        seed_database()
finally:
    db.close()

app = FastAPI(
    title="CareerSetu AI - PM Internship Recommender API",
    description="AI-based internship matching engine, resume parser, certificate verification, and notification hub for PM Internship Scheme.",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(candidates.router)
app.include_router(internships.router)
app.include_router(recommend.router)
app.include_router(resume.router)
app.include_router(certificates.router)
app.include_router(companies.router)
app.include_router(notifications.router)

scheduler = AsyncIOScheduler()

def daily_deadline_job():
    from app.db.database import SessionLocal
    db_session = SessionLocal()
    try:
        notification_service.run_deadline_checker(db_session)
    finally:
        db_session.close()

@app.on_event("startup")
async def startup_event():
    scheduler.add_job(daily_deadline_job, "cron", hour=9)
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.get("/")
def root():
    return {
        "service": "CareerSetu AI - PM Internship Recommender API",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Serve frontend build
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(os.path.join(frontend_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

@app.get("/{catchall:path}")
def serve_frontend(catchall: str):
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend not found at " + frontend_dist}
