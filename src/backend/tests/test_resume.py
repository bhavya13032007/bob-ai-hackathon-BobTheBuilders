import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.resume.parser import resume_parser

client = TestClient(app)

def test_resume_parser_direct():
    """Test the parser's logic directly with a string."""
    sample_text = """
    Jane Doe
    jane.doe@example.com
    +91 9876543210
    
    Education:
    I have completed my B.Tech degree.
    
    Skills:
    I am proficient in Python, SQL, and ReactJS. I also have good Communication skills.
    
    Experience:
    Software Developer at TechCorp.
    
    Location:
    Currently living in Pune.
    """
    
    parsed = resume_parser.parse_text(sample_text)
    
    assert parsed["name"] == "Jane Doe"
    assert parsed["email"] == "jane.doe@example.com"
    assert "9876543210" in parsed["phone"]
    assert parsed["education_level"] == "Graduate"
    assert "Python" in parsed["skills"]
    assert "ReactJS" in parsed["skills"]
    assert parsed["district"] == "Pune"
    assert "it" in parsed["sector_interests"]

def test_upload_resume_text_fallback():
    """Test uploading a file via the endpoint. We use a txt file for simplicity."""
    file_content = b"John Doe\njohn@example.com\nGraduate in CS\nSkills: Python, SQL."
    
    response = client.post(
        "/resume/upload",
        files={"file": ("resume.txt", file_content, "text/plain")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "extracted_profile" in data
    profile = data["extracted_profile"]
    
    assert profile["name"] == "John Doe"
    assert profile["education_level"] == "Graduate"
    assert "Python" in profile["skills"]

def test_upload_malformed_file():
    """Test uploading a malformed or binary file degrades gracefully and doesn't crash 500."""
    # We pretend it's a PDF but give it garbage binary
    malformed_content = b"\x00\x01\x02\x03garbagedata"
    
    response = client.post(
        "/resume/upload",
        files={"file": ("corrupt.pdf", malformed_content, "application/pdf")}
    )
    
    assert response.status_code == 200
    data = response.json()
    # It should not crash, it should just return defaults/empty strings
    assert data["status"] == "success"
    assert "extracted_profile" in data
    assert data["extracted_profile"]["raw_text_preview"] == ""
