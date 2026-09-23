import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, index=True) # e.g. "cand_1"
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    education_level = Column(String, default="Graduate")  # 10th Grade, 12th Grade, ITI / Diploma, Graduate, Post Graduate
    state = Column(String, default="Maharashtra")
    district = Column(String, default="Mumbai")
    latitude = Column(Float, default=19.0760)
    longitude = Column(Float, default=72.8777)
    remote_ok = Column(Boolean, default=True)
    skills = Column(Text, default="Communication, Technical, Problem Solving") # JSON or CSV
    sector_interests = Column(Text, default="it, manufacturing, finance") # JSON or CSV
    experience_notes = Column(Text, nullable=True)
    resume_url = Column(String, nullable=True)
    profile_strength = Column(Integer, default=75)
    avatar_url = Column(String, nullable=True)
    is_seed_data = Column(Boolean, default=False)
    skill_verifications = Column(Text, default="{}") # JSON map of skill_name -> status ("verified", "unverified", "verified (fallback)")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    certificates = relationship("Certificate", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")

class SkillQuiz(Base):
    __tablename__ = "skill_quizzes"

    id = Column(String, primary_key=True, index=True)
    skill_name = Column(String, index=True, nullable=False)
    question_text = Column(String, nullable=False)
    options = Column(Text, nullable=False) # JSON array of strings
    correct_option_index = Column(Integer, nullable=False)
    difficulty = Column(String, default="medium") # easy, medium
    language_variants = Column(Text, nullable=True) # JSON dictionary: {"hi": {"question_text": "...", "options": [...]}}
    is_seed_data = Column(Boolean, default=False)

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidates.id"), nullable=False, index=True)
    skill_name = Column(String, nullable=False, index=True)
    score = Column(Float, nullable=False)
    passed = Column(Boolean, default=False)
    attempt_number = Column(Integer, default=1)
    attempted_at = Column(DateTime, default=datetime.datetime.utcnow)

class Company(Base):
    __tablename__ = "companies"

    id = Column(String, primary_key=True, index=True) # e.g. "comp_1"
    name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    verified_employer = Column(Boolean, default=True)
    sector = Column(String, default="Technology")
    location = Column(String, default="Mumbai, Maharashtra")
    description = Column(Text, nullable=True)
    is_seed_data = Column(Boolean, default=False)

    internships = relationship("Internship", back_populates="company", cascade="all, delete-orphan")

class Internship(Base):
    __tablename__ = "internships"

    id = Column(String, primary_key=True, index=True) # e.g. "int_1"
    title = Column(String, nullable=False)
    org_id = Column(String, ForeignKey("companies.id"), nullable=False)
    sector = Column(String, nullable=False) # e.g. "it", "manufacturing", "healthcare", "agriculture", "finance", "education"
    sector_label = Column(String, default="Technology")
    required_skills = Column(Text, nullable=False) # Comma separated
    state = Column(String, default="Maharashtra")
    district = Column(String, default="Mumbai")
    latitude = Column(Float, default=19.0760)
    longitude = Column(Float, default=72.8777)
    remote_ok = Column(Boolean, default=False)
    work_mode = Column(String, default="In-Office") # In-Office, Remote, Hybrid
    education_required = Column(String, default="12th Grade") # Minimum required
    stipend = Column(String, default="₹25,000 - ₹35,000 / month")
    stipend_amount = Column(Integer, default=30000)
    duration = Column(String, default="6 Months (Full-time)")
    deadline = Column(String, default="2026-10-15")
    description = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=True) # JSON array string
    eligibility = Column(Text, nullable=True) # JSON array string
    is_active = Column(Boolean, default=True)
    is_seed_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("Company", back_populates="internships")
    applications = relationship("Application", back_populates="internship", cascade="all, delete-orphan")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String, primary_key=True, index=True) # e.g. "cert_1"
    candidate_id = Column(String, ForeignKey("candidates.id"), nullable=False)
    title = Column(String, nullable=False)
    issuer = Column(String, nullable=False) # e.g. "NPTEL", "Skill India", "AWS Educate", "Coursera"
    issue_date = Column(String, nullable=False) # e.g. "Oct 2023"
    file_url = Column(String, nullable=False)
    verification_status = Column(String, default="Pending") # "Verified", "Pending", "Rejected"
    verified_by = Column(String, nullable=True) # Company name or ID
    verified_at = Column(DateTime, nullable=True)
    rejection_reason = Column(String, nullable=True)
    tags = Column(String, default="Tech, Skill")
    is_seed_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("Candidate", back_populates="certificates")

class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True) # e.g. "app_1"
    candidate_id = Column(String, ForeignKey("candidates.id"), nullable=False)
    internship_id = Column(String, ForeignKey("internships.id"), nullable=False)
    status = Column(String, default="Applied") # "Applied", "Under Review", "Selected", "Onboarding"
    match_score = Column(Integer, default=85)
    is_seed_data = Column(Boolean, default=False)
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="applications")
    internship = relationship("Internship", back_populates="applications")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    user_type = Column(String, default="candidate") # candidate, company
    category = Column(String, default="Matches") # Matches, Applications, Certificates, Reminders
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    related_id = Column(String, nullable=True)
    channel = Column(String, default="in_app") # in_app, push, sms, whatsapp, email
    status = Column(String, default="sent") # sent, pending, read
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    is_seed_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id = Column(String, primary_key=True, index=True)
    push_matches = Column(Boolean, default=True)
    sms_matches = Column(Boolean, default=False)
    wa_matches = Column(Boolean, default=True)
    push_updates = Column(Boolean, default=True)
    sms_updates = Column(Boolean, default=True)
    wa_updates = Column(Boolean, default=True)
    push_cert = Column(Boolean, default=True)
    sms_cert = Column(Boolean, default=False)
    wa_cert = Column(Boolean, default=True)
    email_digest = Column(Boolean, default=True)
    is_seed_data = Column(Boolean, default=False)
