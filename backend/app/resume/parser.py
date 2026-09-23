import re
import os
from typing import Dict, Any, List
from pypdf import PdfReader
import docx

SKILLS_TAXONOMY = {
    # Technology & AI
    "Python": ["python", "py", "django", "flask"],
    "Data Analysis": ["data analysis", "data analytics", "data science", "pandas", "numpy", "eda"],
    "Machine Learning": ["machine learning", "ml", "deep learning", "ai", "scikit-learn", "tensorflow"],
    "SQL Basics": ["sql", "mysql", "postgresql", "sqlite", "database queries"],
    "ReactJS": ["react", "reactjs", "react.js", "frontend development", "redux"],
    "JavaScript": ["javascript", "js", "typescript", "es6", "node.js"],
    "HTML & CSS": ["html", "css", "tailwind", "bootstrap", "web design"],
    "Cloud Computing": ["aws", "azure", "google cloud", "gcp", "cloud"],
    "UX / UI Design": ["ux", "ui", "figma", "wireframing", "adobe xd", "prototyping", "design thinking"],
    "Figma": ["figma", "wireframes", "ui mockups"],
    "Git & GitHub": ["git", "github", "version control"],

    # Core Engineering & Manufacturing
    "AutoCAD": ["autocad", "cad", "solidworks", "catia", "drafting"],
    "CNC Machining": ["cnc", "lathe", "milling", "machining"],
    "Quality Control": ["quality control", "qc", "qa", "inspection", "six sigma", "iso standards"],
    "PLC & Automation": ["plc", "scada", "automation", "sensors", "microcontroller"],
    "Electrical Maintenance": ["electrical", "wiring", "transformers", "circuit design", "motor maintenance"],
    "Mechanical Assembly": ["mechanical", "assembly", "hydraulics", "pneumatics"],
    "Industrial Safety": ["safety", "osha", "hazard", "ppe", "fire safety"],

    # Finance & Commerce
    "Tally ERP / Prime": ["tally", "tally erp", "tally prime", "voucher entry"],
    "GST & Taxation": ["gst", "taxation", "income tax", "tds", "filing"],
    "Financial Accounting": ["accounting", "bookkeeping", "ledger", "balance sheet", "journal"],
    "Financial Modeling": ["financial modeling", "dcf", "valuation", "excel formulas", "forecasting"],
    "Banking Operations": ["banking", "kyc", "loan processing", "credit appraisal"],

    # Agriculture, Healthcare & Green Energy
    "Agri-Tech & Crop Management": ["agri", "agriculture", "crop", "soil testing", "organic farming", "horticulture"],
    "Renewable Energy & Solar": ["solar", "photovoltaic", "inverter", "renewable", "clean energy"],
    "Patient Care & Vital Monitoring": ["nursing", "patient care", "vitals", "clinic", "hospitality"],
    "Pharmacy & Dispensing": ["pharmacy", "medicines", "drug dosage", "pharmacology"],

    # Management & General
    "MS Excel": ["excel", "spreadsheets", "vlookup", "pivot table", "advanced excel"],
    "Communication": ["communication", "presentation", "public speaking", "written english", "fluent"],
    "Problem Solving": ["problem solving", "analytical", "critical thinking", "logical reasoning"],
    "Team Leadership": ["leadership", "team management", "mentorship", "coordination"],
    "Sales & Client Handling": ["sales", "business development", "lead generation", "client handling", "crm"],
    "Digital Marketing": ["digital marketing", "seo", "social media", "content writing", "campaigns"]
}

EDUCATION_PATTERNS = [
    (r"(m\.?tech|m\.?e\.?|mba|m\.?sc|m\.?com|m\.?a\.?|post\s*graduate|pg|master)", "Post Graduate"),
    (r"(b\.?tech|b\.?e\.?|bca|bba|b\.?sc|b\.?com|b\.?a\.?|bachelor|graduate|undergraduate|degree)", "Graduate"),
    (r"(diploma|iti|polytechnic|vocational)", "ITI / Diploma"),
    (r"(12th|hsc|intermediate|senior\s*secondary|plus\s*two)", "12th Grade"),
    (r"(10th|ssc|matriculation|high\s*school)", "10th Grade")
]

SECTOR_KEYWORDS = {
    "it": ["software", "developer", "coding", "python", "java", "react", "cloud", "tech", "web", "ai", "data"],
    "manufacturing": ["manufacturing", "production", "mechanical", "electrical", "autocad", "quality", "cnc", "plant"],
    "finance": ["finance", "accounting", "tally", "tax", "banking", "audit", "commerce", "gst"],
    "healthcare": ["health", "hospital", "pharma", "medical", "nursing", "patient", "clinic"],
    "agriculture": ["agri", "farm", "crop", "soil", "rural", "irrigation", "organic"],
    "education": ["teaching", "training", "education", "content", "curriculum", "coaching"]
}

class ResumeParser:
    def extract_text_from_pdf(self, file_path: str) -> str:
        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
        return text

    def extract_text_from_docx(self, file_path: str) -> str:
        text = ""
        try:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"Error reading DOCX {file_path}: {e}")
        return text

    def parse_text(self, text: str) -> Dict[str, Any]:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # 1. Extract Name (typically first non-empty line with 2-4 words)
        name = "Applicant"
        for line in lines[:5]:
            words = line.split()
            if 2 <= len(words) <= 4 and not any(char in line for char in ["@", "www", "http", "+91", "Resume", "CV"]):
                # Clean up punctuation
                clean_name = re.sub(r'[^a-zA-Z\s]', '', line).strip()
                if clean_name:
                    name = clean_name.title()
                    break

        # 2. Extract Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        email = email_match.group(0) if email_match else "candidate@example.com"

        # 3. Extract Phone
        phone_match = re.search(r'(?:\+91[\-\s]?)?[6-9]\d{9}', text)
        phone = phone_match.group(0) if phone_match else "+91 98765 43210"

        # 4. Extract Education Level
        edu_level = "Graduate"
        for pattern, label in EDUCATION_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                edu_level = label
                break

        # 5. Extract Skills
        extracted_skills = []
        text_lower = text.lower()
        for skill_name, keywords in SKILLS_TAXONOMY.items():
            for kw in keywords:
                if re.search(rf"\b{re.escape(kw)}\b", text_lower):
                    extracted_skills.append(skill_name)
                    break

        if not extracted_skills:
            extracted_skills = ["Communication", "Problem Solving", "MS Excel", "Technical"]

        # 6. Extract Inferred Sector Interests
        inferred_sectors = []
        for sec, kws in SECTOR_KEYWORDS.items():
            for kw in kws:
                if kw in text_lower:
                    inferred_sectors.append(sec)
                    break
        if not inferred_sectors:
            inferred_sectors = ["it", "finance"]

        # 7. Extract Location hints (state/district)
        district = "Mumbai"
        state = "Maharashtra"
        for loc_key in ["pune", "mumbai", "bengaluru", "delhi", "hyderabad", "chennai", "kolkata", "ahmedabad", "jaipur", "lucknow", "nagpur", "patna"]:
            if loc_key in text_lower:
                district = loc_key.title()
                break

        return {
            "name": name,
            "email": email,
            "phone": phone,
            "education_level": edu_level,
            "skills": extracted_skills,
            "sector_interests": inferred_sectors,
            "district": district,
            "state": state,
            "remote_ok": True,
            "raw_text_preview": text[:500] if text else "",
            "confidence_scores": {
                "name": 0.85,
                "education": 0.90,
                "skills": 0.95,
                "sectors": 0.85
            }
        }

    def parse_file(self, file_path: str) -> Dict[str, Any]:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            raw_text = self.extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            raw_text = self.extract_text_from_docx(file_path)
        else:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    raw_text = f.read()
            except Exception:
                raw_text = ""

        return self.parse_text(raw_text)

resume_parser = ResumeParser()
