"""
resume_service.py
------------------
Extracts raw text from uploaded PDF/DOCX resumes and parses it into
structured fields using heuristic section detection (no LLM call needed
for this - keeps resume parsing fast, free, and deterministic).
"""
import re
import os
import uuid
from werkzeug.utils import secure_filename
from pypdf import PdfReader
import docx

ALLOWED_EXTENSIONS = {"pdf", "docx"}

_SECTION_HEADERS = {
    "education": ["education", "academic background"],
    "skills": ["skills", "technical skills", "core competencies"],
    "projects": ["projects", "personal projects", "academic projects"],
    "experience": ["experience", "work experience", "professional experience", "internships"],
    "certifications": ["certifications", "certificates", "licenses"],
}

_SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "react", "node", "flask", "django",
    "sql", "postgresql", "mysql", "mongodb", "aws", "azure", "gcp", "docker", "kubernetes",
    "git", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "html", "css",
    "c++", "c#", "go", "rust", "machine learning", "data analysis", "excel", "tableau",
]


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def save_upload(file_storage, upload_folder: str) -> tuple[str, str, str]:
    """Saves the uploaded file safely to disk. Returns (original, stored, ext)."""
    original_filename = secure_filename(file_storage.filename)
    ext = original_filename.rsplit(".", 1)[1].lower()
    stored_filename = f"{uuid.uuid4().hex}.{ext}"
    os.makedirs(upload_folder, exist_ok=True)
    path = os.path.join(upload_folder, stored_filename)
    file_storage.save(path)
    return original_filename, stored_filename, ext


def extract_text(filepath: str, ext: str) -> str:
    if ext == "pdf":
        reader = PdfReader(filepath)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if ext == "docx":
        document = docx.Document(filepath)
        return "\n".join(p.text for p in document.paragraphs)
    return ""


def _find_section(lines: list[str], keys: list[str]) -> str:
    lower_lines = [l.strip().lower() for l in lines]
    for i, line in enumerate(lower_lines):
        if any(line.startswith(k) or line == k for k in keys):
            section_lines = []
            for j in range(i + 1, len(lines)):
                if lower_lines[j] and any(
                    lower_lines[j].startswith(h) for hs in _SECTION_HEADERS.values() for h in hs
                ):
                    break
                if lines[j].strip():
                    section_lines.append(lines[j].strip())
                if len(section_lines) >= 8:
                    break
            return " ".join(section_lines)
    return ""


def parse_resume_text(raw_text: str) -> dict:
    lines = [l for l in raw_text.splitlines()]
    non_empty = [l.strip() for l in lines if l.strip()]

    name = non_empty[0] if non_empty else None
    # Heuristic: a name line shouldn't contain @ or digits
    if name and ("@" in name or any(ch.isdigit() for ch in name)):
        name = None

    education = _find_section(lines, _SECTION_HEADERS["education"])
    projects = _find_section(lines, _SECTION_HEADERS["projects"])
    experience = _find_section(lines, _SECTION_HEADERS["experience"])
    certifications = _find_section(lines, _SECTION_HEADERS["certifications"])

    skills_section = _find_section(lines, _SECTION_HEADERS["skills"])
    text_lower = raw_text.lower()
    detected_skills = sorted({kw for kw in _SKILL_KEYWORDS if kw in text_lower})
    if skills_section:
        extra = re.split(r"[,•|/]", skills_section)
        detected_skills = sorted(set(detected_skills) | {s.strip() for s in extra if 1 < len(s.strip()) < 30})

    return {
        "name": name,
        "education": education or None,
        "skills": detected_skills,
        "projects": projects or None,
        "experience": experience or None,
        "certifications": certifications or None,
    }


def build_resume_summary(parsed: dict) -> str:
    """Short natural-language summary fed into Gemini prompts for personalization."""
    parts = []
    if parsed.get("skills"):
        parts.append(f"Skills: {', '.join(parsed['skills'][:8])}")
    if parsed.get("experience"):
        parts.append(f"Experience: {parsed['experience'][:200]}")
    if parsed.get("projects"):
        parts.append(f"Projects: {parsed['projects'][:200]}")
    return " | ".join(parts) if parts else ""
