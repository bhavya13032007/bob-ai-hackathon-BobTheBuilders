import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.config import UPLOAD_DIR
from app.resume.parser import resume_parser

router = APIRouter(prefix="/resume", tags=["resume"])

class TextParseRequest(BaseModel):
    text: str

@router.post("/upload")
async def upload_and_parse_resume(file: UploadFile = File(...)):
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOCX, or TXT.")

    file_id = f"resume_{uuid.uuid4().hex[:8]}{ext}"
    saved_path = os.path.join(UPLOAD_DIR, file_id)

    contents = await file.read()
    with open(saved_path, "wb") as buffer:
        buffer.write(contents)

    parsed_result = resume_parser.parse_file(saved_path)
    parsed_result["file_id"] = file_id
    parsed_result["file_name"] = filename

    return {
        "status": "success",
        "message": "Resume parsed successfully. Please review and correct extracted fields before continuing.",
        "extracted_profile": parsed_result
    }

@router.post("/parse-text")
def parse_resume_text(payload: TextParseRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    parsed = resume_parser.parse_text(payload.text)
    return {
        "status": "success",
        "extracted_profile": parsed
    }
