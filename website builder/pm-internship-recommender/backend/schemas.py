from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import List, Optional, Any
from datetime import datetime
from models import VerificationStatus, ApplicationStatus, UserType

# --- Candidate Schemas ---
class CandidateBase(BaseModel):
    name: str
    phone: str
    education_level: str
    state: str
    district: str
    lat: Optional[float] = None
    long: Optional[float] = None
    skills: List[str] = []
    sector_interests: List[str] = []
    experience_notes: Optional[str] = None
    resume_url: Optional[str] = None
    language_pref: str = "en"

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Company Schemas ---
class CompanyBase(BaseModel):
    name: str
    contact_email: EmailStr

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    verified_employer: bool
    model_config = ConfigDict(from_attributes=True)

# --- Internship Schemas ---
class InternshipBase(BaseModel):
    title: str
    org_id: int
    sector: str
    required_skills: List[str] = []
    state: str
    district: str
    lat: Optional[float] = None
    long: Optional[float] = None
    remote_ok: bool = False
    education_required: str
    stipend: Optional[int] = None
    duration: str
    deadline: datetime
    description: str

class InternshipCreate(InternshipBase):
    pass

class InternshipResponse(InternshipBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# --- Certificate Schemas ---
class CertificateBase(BaseModel):
    candidate_id: int
    title: str
    issuer: str
    issue_date: Optional[datetime] = None
    file_url: str

class CertificateCreate(CertificateBase):
    pass

class CertificateResponse(CertificateBase):
    id: int
    verification_status: VerificationStatus
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class CertificateUpdateStatus(BaseModel):
    verification_status: VerificationStatus

# --- Application Schemas ---
class ApplicationBase(BaseModel):
    candidate_id: int
    internship_id: int

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    status: ApplicationStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ApplicationUpdateStatus(BaseModel):
    status: ApplicationStatus

# --- Notification Schemas ---
class NotificationBase(BaseModel):
    user_id: int
    user_type: UserType
    type: str
    message: str
    related_id: Optional[int] = None
    channel: str

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    status: str
    read_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
