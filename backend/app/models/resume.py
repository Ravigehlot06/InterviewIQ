from datetime import datetime, timezone
from app.extensions import db


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    original_filename = db.Column(db.String(255), nullable=False)
    stored_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)  # pdf | docx

    raw_text = db.Column(db.Text, nullable=True)
    parsed_name = db.Column(db.String(255), nullable=True)
    parsed_education = db.Column(db.Text, nullable=True)
    parsed_skills = db.Column(db.Text, nullable=True)
    parsed_projects = db.Column(db.Text, nullable=True)
    parsed_experience = db.Column(db.Text, nullable=True)
    parsed_certifications = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "original_filename": self.original_filename,
            "file_type": self.file_type,
            "parsed": {
                "name": self.parsed_name,
                "education": self.parsed_education,
                "skills": self.parsed_skills.split(",") if self.parsed_skills else [],
                "projects": self.parsed_projects,
                "experience": self.parsed_experience,
                "certifications": self.parsed_certifications,
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
