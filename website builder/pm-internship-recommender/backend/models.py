from sqlalchemy import Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey, Enum, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from database import Base

class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"

class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    under_review = "under_review"
    selected = "selected"
    onboarding = "onboarding"

class UserType(str, enum.Enum):
    candidate = "candidate"
    company = "company"

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String, index=True)
    education_level = Column(String)
    state = Column(String)
    district = Column(String)
    lat = Column(Float, nullable=True)
    long = Column(Float, nullable=True)
    skills = Column(ARRAY(String), default=[])
    sector_interests = Column(ARRAY(String), default=[])
    experience_notes = Column(Text, nullable=True)
    resume_url = Column(String, nullable=True)
    language_pref = Column(String, default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    verified_employer = Column(Boolean, default=False)
    contact_email = Column(String, unique=True, index=True)

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    org_id = Column(Integer, ForeignKey("companies.id"))
    sector = Column(String, index=True)
    required_skills = Column(ARRAY(String), default=[])
    state = Column(String)
    district = Column(String)
    lat = Column(Float, nullable=True)
    long = Column(Float, nullable=True)
    remote_ok = Column(Boolean, default=False)
    education_required = Column(String)
    stipend = Column(Integer, nullable=True)
    duration = Column(String) # e.g., "3 months"
    deadline = Column(DateTime(timezone=True))
    description = Column(Text)

    company = relationship("Company")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    title = Column(String)
    issuer = Column(String)
    issue_date = Column(DateTime(timezone=True), nullable=True)
    file_url = Column(String)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.pending)
    verified_by = Column(Integer, ForeignKey("companies.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    internship_id = Column(Integer, ForeignKey("internships.id"))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.applied)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    user_type = Column(Enum(UserType))
    type = Column(String)
    message = Column(Text)
    related_id = Column(Integer, nullable=True)
    channel = Column(String) # e.g., "in_app", "email", "sms"
    status = Column(String, default="unread")
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
