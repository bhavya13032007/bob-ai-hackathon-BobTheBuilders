import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import get_db, Base, engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import sessionmaker

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    # Seed a candidate
    db = TestingSessionLocal()
    from app.db.models import Candidate
    if not db.query(Candidate).filter_by(id="cand_test_1").first():
        cand = Candidate(id="cand_test_1", name="Test Candidate")
        db.add(cand)
        db.commit()
    db.close()
    yield

def test_certificate_upload():
    """Test candidate uploading a certificate."""
    file_content = b"%PDF-1.4\n Dummy certificate data"
    response = client.post(
        "/certificates/upload",
        data={
            "candidate_id": "cand_test_1",
            "title": "AWS Certified Developer",
            "issuer": "Amazon",
            "issue_date": "Jan 2024",
            "tags": "AWS, Cloud"
        },
        files={"file": ("cert.pdf", file_content, "application/pdf")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    
    cert_id = data["certificate"]["id"]
    assert data["certificate"]["verification_status"] == "Pending"
    
    return cert_id

def test_certificate_verification_success():
    """Test employer verifying a certificate."""
    # First, upload a certificate
    file_content = b"%PDF-1.4\n Dummy certificate data"
    upload_res = client.post(
        "/certificates/upload",
        data={
            "candidate_id": "cand_test_1",
            "title": "React Certification",
            "issuer": "Meta",
            "issue_date": "Feb 2024",
            "tags": "React"
        },
        files={"file": ("cert2.pdf", file_content, "application/pdf")}
    )
    cert_id = upload_res.json()["certificate"]["id"]

    # Now verify it
    verify_res = client.patch(
        f"/certificates/{cert_id}/verify",
        headers={"x-company-id": "comp_1"},
        json={"verification_status": "Verified"}
    )
    
    assert verify_res.status_code == 200
    assert verify_res.json()["certificate"]["verification_status"] == "Verified"
    assert verify_res.json()["certificate"]["verified_by"] == "comp_1"

def test_certificate_verification_missing_auth():
    """Test that missing x-company-id fails."""
    verify_res = client.patch(
        "/certificates/cert_fake_123/verify",
        json={"verification_status": "Verified"}
    )
    
    assert verify_res.status_code == 401
    assert "Missing company authentication header" in verify_res.json()["detail"]

def test_certificate_verification_rejection():
    """Test rejecting a certificate with a note."""
    # First, upload a certificate
    file_content = b"%PDF-1.4\n Dummy certificate data"
    upload_res = client.post(
        "/certificates/upload",
        data={
            "candidate_id": "cand_test_1",
            "title": "Fake Cert",
            "issuer": "Unknown",
            "issue_date": "Mar 2024",
            "tags": "Fake"
        },
        files={"file": ("cert3.pdf", file_content, "application/pdf")}
    )
    cert_id = upload_res.json()["certificate"]["id"]

    # Now reject it
    verify_res = client.patch(
        f"/certificates/{cert_id}/verify",
        headers={"x-company-id": "comp_1"},
        json={
            "verification_status": "Rejected",
            "rejection_reason": "Could not verify ID"
        }
    )
    
    assert verify_res.status_code == 200
    assert verify_res.json()["certificate"]["verification_status"] == "Rejected"
    assert verify_res.json()["certificate"]["rejection_reason"] == "Could not verify ID"

def test_certificate_upload_invalid_extension():
    """Test uploading an unsupported file extension (e.g. .exe) fails gracefully."""
    file_content = b"malformed data"
    response = client.post(
        "/certificates/upload",
        data={
            "candidate_id": "cand_test_1",
            "title": "Hack Attempt",
            "issuer": "Hacker",
            "issue_date": "Today",
            "tags": "Hack"
        },
        files={"file": ("virus.exe", file_content, "application/x-msdownload")}
    )
    
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]

def test_certificate_upload_corrupted_file_masquerading_as_pdf():
    """Test uploading a file with a .pdf extension but corrupted/invalid byte content."""
    # This is just a plain string disguised as a PDF
    fake_pdf_content = b"This is just some random text string masquerading as a PDF file"
    
    response = client.post(
        "/certificates/upload",
        data={
            "candidate_id": "cand_test_1",
            "title": "Fake PDF",
            "issuer": "Hacker",
            "issue_date": "Today",
            "tags": "Hack"
        },
        files={"file": ("fake.pdf", fake_pdf_content, "application/pdf")}
    )
    
    assert response.status_code == 400
    assert "Corrupted or unrecognized file format" in response.json()["detail"]

